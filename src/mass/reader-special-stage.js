// R17 ceremonial stage chrome. Presentational only: no rubrics, gestures,
// bells, liturgical timing or navigation are inferred from this component.
// It reflects the native reader's exact active controller/card and resolved plan.
const RITES=Object.freeze({
  ASPERGES:["Aspersion","Aspersion"],
  PALM:["Palm rite","Rite des Rameaux"],
  ASH:["Ashes","Cendres"],
  CANDLEMAS:["Candlemas","Chandeleur"],
  ROGATIONS:["Rogations","Rogations"],
  REQUIEM_ABSOLUTION:["Absolution","Absoute"],
  CORPUS_CHRISTI_PROCESSION:["Eucharistic procession","Procession eucharistique"],
  HOLY_THURSDAY_POST:["Holy Thursday","Jeudi saint"],
  GENERIC_PROCESSION:["Procession","Procession"],
  GOOD_FRIDAY:["Good Friday","Vendredi saint"],
  EASTER_VIGIL:["Easter Vigil","Vigile pascale"],
  EASTER_VIGIL_MASS:["Vigil Mass","Messe de la Vigile"],
  MANDATUM:["Mandatum","Mandatum"],
  NUPTIAL:["Nuptial Mass","Messe nuptiale"],
  NUPTIAL_BLESSING:["Nuptial blessing","Bénédiction nuptiale"],
  REQUIEM:["Requiem","Requiem"],
  VOTIVE:["Votive Mass","Messe votive"],
});
const normalize=x=>String(x??"").toUpperCase().replace(/[\s-]+/g,"_");
function deriveActiveRite(owner,recordId,state={}){
  const o=normalize(owner),record=normalize(recordId),explicit=normalize(state.specialRite);
  if(o.includes("GOOD_FRIDAY")||record.startsWith("GF-"))return "GOOD_FRIDAY";
  if(o.includes("EASTER_VIGIL_MASS")||record.startsWith("MASS:AO."))return "EASTER_VIGIL_MASS";
  if(o.includes("EASTER_VIGIL")||record.startsWith("EV-"))return "EASTER_VIGIL";
  if(o.includes("ASPERGES")||explicit==="ASPERGES")return "ASPERGES";
  if(o.includes("CANDLEMAS")||explicit==="CANDLEMAS")return "CANDLEMAS";
  if(o.includes("ROGATIONS")||explicit==="ROGATIONS")return "ROGATIONS";
  if(o.includes("REQUIEM_ABSOLUTION")||explicit==="REQUIEM_ABSOLUTION")return "REQUIEM_ABSOLUTION";
  if(o.includes("CORPUS_CHRISTI")||explicit==="CORPUS_CHRISTI_PROCESSION")return "CORPUS_CHRISTI_PROCESSION";
  if(o.includes("HOLY_THURSDAY")||explicit==="HOLY_THURSDAY_POST")return "HOLY_THURSDAY_POST";
  if(o.includes("GENERIC_PROCESSION")||explicit==="GENERIC_PROCESSION")return "GENERIC_PROCESSION";
  if(o.includes("MANDATUM")||explicit==="MANDATUM")return "MANDATUM";
  if(o.includes("PALM")||explicit==="PALM")return "PALM";
  if(o.includes("_ASH")||explicit==="ASH")return "ASH";
  return null;
}
export function sourceOwnedSpecialStage({prepared,owner,recordId,card,state,language="en"}={}){
  const fr=String(language).toLowerCase().startsWith("fr");
  const resolved=prepared?.session?.resolvedMass??{};
  const plan=prepared?.session?.plan??{};
  let rite=deriveActiveRite(owner,recordId,state);
  const sectionId=String(card?.sectionId??card?.id??"");
  // A Nuptial blessing is a source-owned insertion. Never transfer its
  // posture/gesture to the congregation.
  if(!rite && /^AO\.NUPTIAL\.0[123]$/.test(sectionId) &&
     resolved.overlays?.includes("NUPTIAL"))rite="NUPTIAL_BLESSING";
  if(!rite){
    if(plan?.kind==="DISTINCT_RITE"&&resolved.distinctRite==="GOOD_FRIDAY")rite="GOOD_FRIDAY";
    else if(plan?.kind==="COMPOSITE_DISTINCT_RITE"&&resolved.distinctRite==="EASTER_VIGIL")rite="EASTER_VIGIL";
    else if(resolved.overlays?.includes("REQUIEM"))rite="REQUIEM";
    else if(resolved.overlays?.includes("NUPTIAL"))rite="NUPTIAL";
    else if(resolved.overlays?.includes("VOTIVE_PROPER"))rite="VOTIVE";
  }
  if(!rite || !RITES[rite])return null;
  const own=Boolean(deriveActiveRite(owner,recordId,state));
  // The exact card title is authored by the existing reader controller.
  // During the ordinary Mass avoid repeating its section title as an invented
  // "stage"; use a quiet, stable celebration identity instead.
  const cardTitle=(own||rite==="NUPTIAL_BLESSING")
    ?String(card?.title??card?.cardTitle??"").trim():null;
  const title=RITES[rite][fr?1:0];
  const key=rite+"|"+(own||rite==="NUPTIAL_BLESSING"?String(recordId??sectionId):"MASS");
  return Object.freeze({
    rite,key,title,
    detail:cardTitle&&cardTitle.toLowerCase()!==title.toLowerCase()?cardTitle:null,
    sourceOwner:own?"NATIVE_RITE_CONTROLLER":rite==="NUPTIAL_BLESSING"?"NUPTIAL_INSERTION":"RESOLVED_MASS_OVERLAY",
  });
}

export function mountSpecialMassStage({preview,prepared,doc=globalThis.document}={}){
 const root=preview?.root;
 const stage=root?.querySelector?.(".ao-reader-stage");
 if(!stage||!doc?.createElement)return null;
 const label=doc.createElement("div");
 label.className="ao-reader-ceremony-stage";
 label.dataset.aoSpecialReaderStage="";
 label.hidden=true;
 label.setAttribute("aria-live","off");
 label.setAttribute("aria-label","Current liturgical ceremony");
 stage.append(label);
 let key=null,disposed=false,queued=false;
 const language=prepared?.readerPreferences?.language??"en";
 const refresh=()=>{
  queued=false;if(disposed)return;
  const state=globalThis.AO_R17_NATIVE_READER_STATE??{};
  const next=sourceOwnedSpecialStage({
    prepared,language,
    owner:root.dataset.r17StateOwner,
    recordId:root.dataset.r17NativeRiteRecord,
    state,
    card:preview.getCurrentCard?.(),
  });
  label.hidden=!next;
  if(!next){label.replaceChildren();key=null;delete root.dataset.aoSpecialReaderRite;return;}
  root.dataset.aoSpecialReaderRite=next.rite;
  if(next.key===key)return;
  key=next.key;
  label.dataset.rite=next.rite;
  label.dataset.sourceOwner=next.sourceOwner;
  // Replacing nodes on source stage changes restarts only a CSS entrance,
  // not a timer, scrolling gesture, cinematic or liturgical event.
  const title=doc.createElement("span");title.className="ao-reader-ceremony-name";title.textContent=next.title;
  const detail=doc.createElement("span");detail.className="ao-reader-ceremony-detail";
  detail.textContent=next.detail??"";
  detail.hidden=!next.detail;
  label.replaceChildren(title,detail);
 };
 const queue=()=>{if(queued||disposed)return;queued=true;queueMicrotask(refresh)};
 const Observer=doc.defaultView?.MutationObserver;
 const observer=typeof Observer==="function"?new Observer(queue):null;
 observer?.observe(root,{attributes:true,attributeFilter:["data-r17-state-owner","data-r17-native-rite-record","data-r17-native-event","data-r17-native-cue"]});
 const section=root.querySelector('[data-role="section-title"]');
 if(section)observer?.observe(section,{subtree:true,childList:true,characterData:true});
 refresh();
 return Object.freeze({refresh,project:()=>({key,rite:root.dataset.aoSpecialReaderRite??null,visible:!label.hidden}),
  dispose(){disposed=true;observer?.disconnect();label.remove();delete root.dataset.aoSpecialReaderRite}});
}
