// Native Mass-form preflight, mounted alongside the source-resolving host preflight.
// Ceremony FORM and the liturgical CELEBRATION are different axes. The latter
// remains owned by the 1962 calendar/Proper resolver; NEVER substitute a Proper.
import {normalizeMassForm,MASS_FORMS} from "./session-engine.js";

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
  language=()=> "en",
}={}){
  if(!doc?.createElement||typeof getResolvedMass!=="function")
    throw new TypeError("Full Mass preflight requires DOM and source-owning host");
  let root=null,selected=null,explicit=false,lastDate=null,disposed=false,observer=null;
  const flow=()=>doc.getElementById("ao-mass-flow-v1");
  const anchor=()=>flow()?.querySelector(".aoFlowActions")??flow()?.querySelector("[data-ao-start-live]")?.parentElement;
  const french=()=>String(language()).startsWith("fr");
  function activeForm(){
    try{return normalizeMassForm(explicit?selected:getDefaultForm());}
    catch{return "MISSA_CANTATA_INCENSE";}
  }
  function selectionFor(legacy){
    const value=resolvedMassSummary(legacy,{form:activeForm(),language:language()});
    return Object.freeze({...value,explicitlyChosenForm:explicit});
  }
  function refresh(){
    if(disposed)return;
    const host=flow(),target=anchor();
    if(!host||!target)return;
    let legacy=null;try{legacy=getResolvedMass()}catch{}
    const date=String(legacy?.date??"");
    // A fresh selected date represents a new preflight: do not silently carry
    // an override into another Mass. In-session changes remain live.
    if(lastDate!==null&&date!==lastDate){selected=null;explicit=false;}
    lastDate=date;
    if(root&&!root.isConnected)root=null;
    if(!root){
      root=doc.createElement("section");
      root.dataset.aoFullMassPreflight="";
      root.className="aoFullMassPreflight";
      root.setAttribute("aria-label","Mass preparation");
      root.innerHTML='<h3 data-full-mass-title></h3><p data-full-mass-celebration role="status"></p>'+
        '<p data-full-mass-resolver></p><fieldset data-full-mass-form-fieldset>'+
        '<legend data-full-mass-form-title></legend><div class="aoFullMassForms">'+
        FULL_MASS_FORM_OPTIONS.map(({id})=>
          '<label class="aoFullMassChoice"><input type="radio" name="ao-native-mass-form" value="'+id+'" data-full-mass-form>'+
          '<span data-full-mass-label="'+id+'"></span></label>').join("")+
        '</div></fieldset><p data-full-mass-note></p>';
      root.addEventListener("change",e=>{
        const el=e.target;
        if(el?.matches?.("[data-full-mass-form]")&&MASS_FORMS.includes(el.value)){
          selected=el.value;explicit=true;refresh();
        }
      });
      target.insertAdjacentElement("beforebegin",root);
    }
    const fr=french(),summary=selectionFor(legacy),l=(en,frText)=>fr?frText:en;
    root.querySelector("[data-full-mass-title]").textContent=l("Prepare your Mass","Préparer votre messe");
    root.querySelector("[data-full-mass-form-title]").textContent=l("How is it celebrated?","Comment est-elle célébrée ?");
    root.querySelector("[data-full-mass-celebration]").textContent=
      summary.kindLabel+(summary.actualTitle?" · "+summary.actualTitle:"");
    root.querySelector("[data-full-mass-resolver]").textContent=summary.canStart?
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
    root.dataset.aoCelebrationKind=summary.kind;
    root.dataset.aoChosenMassForm=summary.form;
    root.dataset.aoProperReady=String(summary.canStart);
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
        node.nodeType===1&&(node.id==="ao-mass-flow-v1"||node.querySelector?.("#ao-mass-flow-v1")))))refresh();
    }):null;
  observer?.observe(doc.body,{subtree:true,childList:true});
  refresh();
  return Object.freeze({
    selectionFor,
    refresh,
    status:()=>Object.freeze({visible:Boolean(root?.isConnected),explicitlyChosenForm:explicit,
      chosenForm:activeForm(),date:lastDate,kind:root?.dataset?.aoCelebrationKind??null}),
    dispose(){disposed=true;doc.removeEventListener("change",onchange);doc.removeEventListener("click",onClick);observer?.disconnect();root?.remove();root=null;}
  });
}
