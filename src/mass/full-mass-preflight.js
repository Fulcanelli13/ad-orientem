// Native Mass-form preflight, mounted alongside the source-resolving host preflight.
// Ceremony FORM and the liturgical CELEBRATION are different axes. The latter
// remains owned by the 1962 calendar/Proper resolver; NEVER substitute a Proper.
import {normalizeMassForm,MASS_FORMS} from "./session-engine.js";
import {availableOptionalMassRites,composeOptionalMassRites} from "./full-mass-optional-rites.js";
import {specialMassPresentation,renderSpecialMassContext} from "./full-mass-special-presentation.js";

const LABELS=Object.freeze({
  LOW:["Low Mass","Messe basse"],
  MISSA_CANTATA_SIMPLE:["Missa Cantata · no incense","Messe chantée · sans encens"],
  MISSA_CANTATA_INCENSE:["Missa Cantata · incense","Messe chantée · avec encens"],
  SOLEMN:["Solemn Mass","Messe solennelle"]
});
const KIND_LABELS=Object.freeze({
  CALENDAR:["Mass of the day","Messe du jour"],
  VOTIVE:["Votive Mass","Messe votive"],
  REQUIEM:["Requiem","Messe de Requiem"],
  NUPTIAL:["Nuptial Mass","Messe nuptiale"],
  SPECIAL_FORMULARY:["Special formulary","Formulaire particulier"],
  GOOD_FRIDAY:["Good Friday liturgy · not a Mass","Office du Vendredi saint · ce n’est pas une messe"],
  EASTER_VIGIL:["Easter Vigil","Vigile pascale"]
});
const txt=(pair,fr)=>pair?.[fr?1:0]??"";
export const FULL_MASS_FORM_OPTIONS=Object.freeze(MASS_FORMS.map(id=>Object.freeze({id,en:LABELS[id][0],fr:LABELS[id][1]})));
export function massCelebrationKind(legacy={}){
  const exceptional=String(legacy?.exceptionalProfile??"").toLowerCase();
  if(/good[-_]friday/.test(exceptional))return "GOOD_FRIDAY";
  if(/easter[-_]vigil/.test(exceptional))return "EASTER_VIGIL";
  const id=String(legacy?.celebrationId??legacy?.requestedCelebrationId??"").toLowerCase();
  const type=String(legacy?.celebrationType??"CALENDAR").toUpperCase().replace(/[\s-]+/g,"_");
  if(id==="nuptial"||type==="NUPTIAL")return "NUPTIAL";
  if(type==="REQUIEM"||type==="VOTIVE"||type==="SPECIAL_FORMULARY")return type;
  return "CALENDAR";
}
export function resolvedMassSummary(legacy,{form="MISSA_CANTATA_INCENSE",language="en"}={}){
  const fr=String(language).startsWith("fr");
  const normalized=normalizeMassForm(form);
  const kind=massCelebrationKind(legacy);
  const actual=legacy?.actualCelebration?.title??legacy?.celebrationTitle??
    (legacy?.celebrationId!=="mass_of_day"?legacy?.celebrationId:null) ??
    legacy?.calendarDay?.title??legacy?.calendarDay?.name??null;
  return Object.freeze({
    form:normalized,kind,
    formLabel:txt(LABELS[normalized],fr),
    kindLabel:txt(KIND_LABELS[kind],fr),
    actualTitle:actual?String(actual):null,
    date:String(legacy?.date??""),
    canStart:legacy?.canStart===true,
    formChangeAllowed:kind!=="GOOD_FRIDAY",
    sourceOwnedByHost:true,
  });
}

export function mountFullMassPreflight({
  doc=globalThis.document,
  getResolvedMass,
  getDefaultForm=()=> "sung",
  getDefaultReaderMode=()=> "LIVE",
  language=()=> "en",
  getCelebrationApi=()=>globalThis.AO_CELEBRATION_API,
  onBeforeCategoryChange=()=>{},
  onOpenSourceProper=()=>{},
  getSourceGate=()=>({ready:true,reason:null}),
}={}){
  if(!doc?.createElement||typeof getResolvedMass!=="function")
    throw new TypeError("Full Mass preflight requires DOM and source-owning host");
  let root=null,selected=null,explicit=false,selectedMode=null,explicitMode=false,lastDate=null,lastCelebrationKey=null,riteOverrides={},disposed=false,observer=null;
  const flow=()=>doc.getElementById("ao-mass-flow-v1");
  const anchor=()=>flow()?.querySelector(".aoFlowActions")??flow()?.querySelector("[data-ao-start-live]")?.parentElement;
  const french=()=>String(language()).startsWith("fr");
  function activeForm(){
    try{return normalizeMassForm(explicit?selected:getDefaultForm());}
    catch{return "MISSA_CANTATA_INCENSE";}
  }
  function activeReaderMode(){
    const mode=String(explicitMode?selectedMode:getDefaultReaderMode()??"LIVE").toUpperCase();
    if(mode==="MISSAL"||mode==="SIMPLE")return mode;
    return "LIVE";
  }
  function selectionFor(legacy){
    const value=resolvedMassSummary(legacy,{form:activeForm(),language:language()});
    return Object.freeze({...value,explicitlyChosenForm:explicit,
      readerMode:activeReaderMode(),explicitlyChosenReaderMode:explicitMode});
  }
  function openCategory(kind){
    if(kind==="SOURCE_DATE"){onOpenSourceProper();return true;}
    const choices={CALENDAR:"[data-ao-select-day]",VOTIVE:'[data-ao-open="votive"]',
      NUPTIAL:'[data-ao-open="nuptial"]',REQUIEM:'[data-ao-open="requiem"]',
      OTHER:'[data-ao-open="other"]'};
    if(!Object.hasOwn(choices,kind))throw new Error("Unknown Mass category");
    const api=getCelebrationApi?.();
    if(typeof api?.openChangeMass!=="function")throw new Error("CHANGE_MASS_OWNER_NOT_READY");
    onBeforeCategoryChange(kind);
    // Invoke the established resolver's public navigation: never infer a
    // votive or Requiem file from the clicked category alone.
    api.openChangeMass();
    const control=flow()?.querySelector(choices[kind]);
    if(!control)throw new Error("MASS_CELEBRATION_CHOICE_MISSING_"+kind);
    control.click();
    return true;
  }
  function composeRitesFor(legacy,hostOptions={}){
    const current=selectionFor(legacy);
    return composeOptionalMassRites(legacy,{
      form:current.form,kind:current.kind,overrides:riteOverrides,
    },hostOptions);
  }
  function refresh(){
    if(disposed)return;
    const host=flow(),target=anchor();
    if(!host||!target)return;
    let legacy=null;try{legacy=getResolvedMass()}catch{}
    const date=String(legacy?.date??"");
    // A fresh selected date represents a new preflight: do not silently carry
    // an override into another Mass. In-session changes remain live.
    if(lastDate!==null&&date!==lastDate){selected=null;explicit=false;selectedMode=null;explicitMode=false;}
    lastDate=date;
    const celebrationKey=[date,legacy?.celebrationId??"",legacy?.requestedCelebrationId??"",
      legacy?.celebrationType??"",legacy?.exceptionalProfile??""].join("|");
    if(lastCelebrationKey!==null&&lastCelebrationKey!==celebrationKey)riteOverrides={};
    lastCelebrationKey=celebrationKey;
    if(root&&!root.isConnected)root=null;
    if(!root){
      root=doc.createElement("section");
      root.dataset.aoFullMassPreflight="";
      root.className="aoFullMassPreflight";
      root.setAttribute("aria-label","Mass preparation");
      root.innerHTML='<h3 data-full-mass-title></h3><p data-full-mass-celebration role="status"></p>'+
        '<section class="aoSpecialMassContext" data-full-mass-special hidden></section>'+
        '<div class="aoFullMassCategories" role="group" data-full-mass-categories aria-label="Select actual Mass">'+
        [["CALENDAR","Mass of the day","Messe du jour"],["VOTIVE","Votive","Votive"],
         ["REQUIEM","Requiem","Requiem"],["NUPTIAL","Nuptial","Nuptiale"],
         ["OTHER","Other","Autre"],["SOURCE_DATE","Other Proper","Autre propre"]].map(([id,en,fr])=>
         '<button type="button" data-full-mass-category="'+id+'" data-label-en="'+en+'" data-label-fr="'+fr+'">'+en+'</button>').join("")+
        '</div><div data-full-mass-source-slot></div><p data-full-mass-category-error role="alert" hidden></p>'+
        '<p data-full-mass-resolver></p><fieldset data-full-mass-form-fieldset>'+
        '<legend data-full-mass-form-title></legend><div class="aoFullMassForms">'+
        FULL_MASS_FORM_OPTIONS.map(({id})=>
          '<label class="aoFullMassChoice"><input type="radio" name="ao-native-mass-form" value="'+id+'" data-full-mass-form>'+
          '<span data-full-mass-label="'+id+'"></span></label>').join("")+
        '</div></fieldset>'+
        '<fieldset data-full-mass-reader-fieldset><legend data-full-mass-reader-heading></legend>'+
        '<div class="aoFullMassReaderModes">'+
        [["MISSAL","Missal","Missel"],["SIMPLE","Simple","Simple"],["LIVE","LIVE","LIVE"]].map(([id,en,fr])=>
          '<label class="aoFullMassChoice"><input type="radio" name="ao-native-reader-mode" value="'+id+'" data-full-mass-reader-mode>'+
          '<span data-full-mass-reader-label="'+id+'" data-label-en="'+en+'" data-label-fr="'+fr+'">'+en+'</span></label>').join("")+
        '</div></fieldset>'+

        '<details data-full-mass-rites class="aoFullMassOptional"><summary data-full-mass-rite-summary></summary>'+
        '<p data-full-mass-rite-intro></p><div data-full-mass-rite-list></div></details>'+
        '<p data-full-mass-note></p>'+
        '<details data-full-mass-review><summary data-full-mass-review-summary></summary>'+
        '<div data-full-mass-review-body></div></details>'; 
      root.addEventListener("click",e=>{
        const button=e.target?.closest?.("[data-full-mass-category]");
        if(!button)return;
        e.preventDefault();
        const notice=root?.querySelector("[data-full-mass-category-error]");
        try{openCategory(button.dataset.fullMassCategory);}
        catch(error){
          if(notice){
            notice.hidden=false;
            notice.textContent=(french()?"Impossible d’ouvrir cette célébration : ":"Unable to open celebration: ")+String(error?.message??error);
          }
        }
      });
      root.addEventListener("change",e=>{
        const el=e.target;
        if(el?.matches?.("[data-full-mass-rite]")){
          const id=el.dataset.fullMassRite;
          const summary=selectionFor(getResolvedMass());
          const allowed=availableOptionalMassRites(getResolvedMass(),{
            form:summary.form,kind:summary.kind,
          }).find(row=>row.id===id)?.allowed;
          if(!allowed){el.checked=false;return;}
          riteOverrides={...riteOverrides,[id]:el.checked};
          refresh();return;
        }
        if(el?.matches?.("[data-full-mass-reader-mode]")&&["MISSAL","SIMPLE","LIVE"].includes(el.value)){
          selectedMode=el.value;explicitMode=true;refresh();return;
        }
        if(el?.matches?.("[data-full-mass-form]")&&MASS_FORMS.includes(el.value)){
          selected=el.value;explicit=true;refresh();
        }
      });
      target.insertAdjacentElement("beforebegin",root);
    }
    const fr=french(),summary=selectionFor(legacy),l=(en,frText)=>fr?frText:en;
    const oldFormGrid=host.querySelector(".aoChoiceGrid:has([data-ao-form])");
    if(oldFormGrid){
      oldFormGrid.hidden=true;
      oldFormGrid.style.display="none";
      const header=oldFormGrid.previousElementSibling;
      if(header?.classList.contains("aoFlowSection")){
        header.hidden=true;header.style.display="none";
      }
    }
    root.querySelectorAll("[data-full-mass-category]").forEach(button=>{
      button.textContent=button.dataset[fr?"labelFr":"labelEn"];
      const match=button.dataset.fullMassCategory===
        (legacy?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY"?"SOURCE_DATE":summary.kind);
      button.setAttribute("aria-current",match?"true":"false");
    });
    root.querySelector("[data-full-mass-title]").textContent=l("Prepare your Mass","Préparer votre messe");
    root.querySelector("[data-full-mass-form-title]").textContent=l("How is it celebrated?","Comment est-elle célébrée ?");
    root.querySelector("[data-full-mass-celebration]").textContent=
      summary.kindLabel+(summary.actualTitle?" · "+summary.actualTitle:"");
    const sourceGate=getSourceGate();
    root.querySelector("[data-full-mass-resolver]").textContent=!sourceGate.ready?
      l("Finish choosing the other Proper, or return to the Mass of the day, before starting.",
        "Terminez le choix de l’autre propre, ou revenez à la messe du jour, avant de commencer.") :
      summary.canStart?
      l("The Mass of the day, Requiem, votive or Nuptial Proper is chosen in the celebration selector above. Its actual texts, rank and permitted changes must be resolved before starting.",
        "Le propre du jour, du Requiem, de la messe votive ou nuptiale se choisit dans le sélecteur de célébration ci-dessus. Les textes, le rang et les adaptations autorisées doivent être résolus avant de commencer.") :
      l("Choose a permitted celebration with a complete Proper before starting. No text is substituted.",
        "Choisissez une célébration permise dont le propre est complet avant de commencer. Aucun texte n’est substitué.");
    root.querySelector("[data-full-mass-note]").textContent=
      summary.kind==="GOOD_FRIDAY"?
        l("Good Friday is a distinct liturgy, not Low or Sung Mass.","Le Vendredi saint possède un office distinct : ce n’est pas une messe basse ou chantée.") :
      l("This choice applies to this Mass only. Reader views (Missal, Simple, Live) are separate.",
        "Ce choix concerne uniquement cette messe. Les modes de lecture (Missel, Simple, LIVE) sont distincts.");
    root.querySelectorAll("[data-full-mass-form]").forEach(input=>{
      input.checked=input.value===summary.form;
      input.disabled=!summary.formChangeAllowed;
    });
    root.querySelectorAll("[data-full-mass-label]").forEach(span=>{
      span.textContent=txt(LABELS[span.dataset.fullMassLabel],fr);
    });
    root.querySelector("[data-full-mass-form-fieldset]").disabled=!summary.formChangeAllowed;
    root.querySelector("[data-full-mass-reader-heading]").textContent=l("How to follow the Mass","Comment suivre la messe");
    root.querySelectorAll("[data-full-mass-reader-mode]").forEach(input=>{input.checked=input.value===summary.readerMode;});
    root.querySelectorAll("[data-full-mass-reader-label]").forEach(span=>{
      span.textContent=span.dataset[fr?"labelFr":"labelEn"];
    });
    const rites=availableOptionalMassRites(legacy,{form:summary.form,kind:summary.kind});
    const options=rites.filter(rite=>rite.allowed||rite.fromSource);
    const effectiveRites={
      precedingRites:rites.filter(rite=>rite.position==="precedingRites" &&
        (riteOverrides[rite.id]??(rite.fromSource&&rite.allowed))).map(rite=>rite.id),
      followingActions:rites.filter(rite=>rite.position==="followingActions" &&
        (riteOverrides[rite.id]??(rite.fromSource&&rite.allowed))).map(rite=>rite.id),
    };
    const presentation=specialMassPresentation(legacy,{
      kind:summary.kind,language:language(),selectedRites:effectiveRites,
    });
    renderSpecialMassContext(root.querySelector("[data-full-mass-special]"),presentation);
    const detail=root.querySelector("[data-full-mass-rites]");
    detail.hidden=options.length===0;
    root.querySelector("[data-full-mass-rite-summary]").textContent=l("Rites actually taking place",
      "Rites effectivement célébrés");
    root.querySelector("[data-full-mass-rite-intro]").textContent=l(
      "Choose only ceremonies truly taking place at this celebration. A feast or date never activates a procession.",
      "Indiquez uniquement les cérémonies effectivement célébrées. Une fête ou une date ne déclenche jamais une procession.");
    const list=root.querySelector("[data-full-mass-rite-list]");
    const shown=[...list.querySelectorAll("[data-full-mass-rite]")].map(x=>x.dataset.fullMassRite);
    const desired=options.map(x=>x.id);
    if(shown.join("|")!==desired.join("|")){
      list.replaceChildren(...options.map(rite=>{
        const label=doc.createElement("label");label.className="aoFullMassRite";
        const checkbox=doc.createElement("input");checkbox.type="checkbox";
        checkbox.dataset.fullMassRite=rite.id;
        const text=doc.createElement("span");text.textContent=fr?rite.fr:rite.en;
        label.append(checkbox,text);return label;
      }));
    }
    for(const rite of options){
      const input=[...list.querySelectorAll("[data-full-mass-rite]")]
        .find(x=>x.dataset.fullMassRite===rite.id);
      if(!input)continue;
      input.checked=riteOverrides[rite.id]??rite.fromSource;
      input.disabled=!rite.allowed;
      input.closest("label").querySelector("span").textContent=fr?rite.fr:rite.en;
    }
    // The compact review always reflects the *effective* Proper selected for
    // this Mass, not a stale host Calendar Proper from before a source change.
    const observed=legacy?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY";
    const proper=legacy?.proper?.data??legacy?.proper??null;
    const ownerPath=String(legacy?.properSource??proper?.sourcePath??"").trim();
    const review=root.querySelector("[data-full-mass-review]");
    root.querySelector("[data-full-mass-review-summary]").textContent=l(
      "Review Mass and Proper","Vérifier la messe et le propre");
    const body=root.querySelector("[data-full-mass-review-body]");
    body.replaceChildren();
    const entries=[
      [l("Date","Date"),date||"—"],
      [l("Celebration","Célébration"),summary.kindLabel+(summary.actualTitle?" · "+summary.actualTitle:"")],
      [l("Form","Forme"),summary.formLabel],
      [l("Reader","Lecture"),summary.readerMode],
      [l("Source of Proper","Source du propre"),ownerPath||l("Resolved by calendar","Résolu par le calendrier")],
    ];
    if(observed){
      entries.push([l("Source feast date","Date de la fête source"),
        String(legacy.sourceDiagnostics.actualMassSourceDate??"—")]);
      entries.push([l("Sunday commemoration","Mémoire du dimanche"),
        legacy.sourceDiagnostics.sundayCommemoration==="COMMEMORATE_SUNDAY"?
          l("Included from this Sunday","Incluse depuis ce dimanche"):
          l("Not included by selection","Non incluse par choix")]);
      entries.push([l("Rubrical authorization","Autorisation rubricale"),
        l("Not independently verified","Non vérifiée indépendamment")]);
    }
    if(Array.isArray(proper?.collects)){
      const count=proper.collects.length;
      if(count>0)entries.push([l("Collects / Secrets / Postcommunions","Collectes / Secrètes / Postcommunions"),
        [proper.collects.length,proper.secrets?.length??0,proper.postcommunions?.length??0].join(" / ")]);
    }
    for(const [label,value] of entries){
      const line=doc.createElement("p");line.className="aoFullMassReviewRow";
      const tag=doc.createElement("strong");tag.textContent=label;
      const contents=doc.createElement("span");contents.textContent=value;
      line.append(tag,contents);body.append(line);
    }
    if(observed){
      const caution=doc.createElement("p");caution.className="aoFullMassReviewCaution";
      caution.textContent=l(
        "This follows a celebration reported by the user; it does not certify a permitted external solemnity, votive Mass or local indult.",
        "Ce choix suit une célébration indiquée par l’utilisateur ; il ne certifie ni solennité extérieure autorisée, ni messe votive, ni indult local.");
      body.append(caution);
    }
    root.dataset.aoProperSource=ownerPath;
    root.dataset.aoObservedSource=String(observed);
    root.dataset.aoCelebrationKind=summary.kind;
    root.dataset.aoSpecialMassVariant=presentation.variant;
    root.dataset.aoChosenMassForm=summary.form;
    root.dataset.aoChosenReaderMode=summary.readerMode;
    root.dataset.aoProperReady=String(summary.canStart&&sourceGate.ready);
    return summary;
  }
  const onchange=()=>queueMicrotask(refresh);
  const onClick=event=>{
    // Let the historical picker finish its click/callback before sampling it.
    if(event.target?.closest?.("#ao-mass-flow-v1")&&!event.target?.closest?.("[data-ao-full-mass-preflight]"))
      queueMicrotask(refresh);
  };
  doc.addEventListener("change",onchange);
  doc.addEventListener("click",onClick);
  observer=typeof doc.defaultView?.MutationObserver==="function"?
    new doc.defaultView.MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(node=>
        node.nodeType===1&&(
          node.id==="ao-mass-flow-v1"||
          node.matches?.(".aoFlowActions,.aoMassFlowBody")||
          node.querySelector?.("#ao-mass-flow-v1,.aoFlowActions,.aoMassFlowBody")
        ))))queueMicrotask(refresh);
    }):null;
  observer?.observe(doc.body,{subtree:true,childList:true});
  refresh();
  return Object.freeze({
    selectionFor,
    composeRitesFor,
    openCategory,
    refresh,
    status:()=>Object.freeze({visible:Boolean(root?.isConnected),explicitlyChosenForm:explicit,
      readerMode:activeReaderMode(),explicitlyChosenReaderMode:explicitMode,
      chosenForm:activeForm(),date:lastDate,kind:root?.dataset?.aoCelebrationKind??null,
      optionalRiteOverrides:Object.freeze({...riteOverrides})}),
    dispose(){disposed=true;doc.removeEventListener("change",onchange);doc.removeEventListener("click",onClick);observer?.disconnect();root?.remove();root=null;}
  });
}
