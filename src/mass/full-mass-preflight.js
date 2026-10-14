// Native Mass-form preflight, mounted alongside the source-resolving host preflight.
// Ceremony FORM and the liturgical CELEBRATION are different axes. The latter
// remains owned by the 1962 calendar/Proper resolver; NEVER substitute a Proper.
import {normalizeMassForm,MASS_FORMS} from "./session-engine.js";
import {resolveMassLiturgicalTheme} from "./reader-liturgical-theme.js";
import {availableOptionalMassRites,composeOptionalMassRites} from "./full-mass-optional-rites.js";
import {specialMassPresentation,renderSpecialMassContext} from "./full-mass-special-presentation.js";
import {massCalendarPreflightContext,fillMassCalendarPreflight} from "./calendar-preflight-context.js";
import {retireLegacyMassChoiceGrids} from "./legacy-mass-choice-visibility.js";
import {renderPrayerJourneyModes,PRAYER_JOURNEY_MODES} from "./prayer-journey-modes.js";
import {renderAdjacentServices,toggleAdjacentService} from "./adjacent-service-context.js";
import {arrangeMassEntryJourney,updateMassJourneyNotice,translateMassEntryJourney,updateMassJourneyReadiness,updateMassJourneyPhases,updateMassJourneyObserved,projectMassEntryLaunch,projectMassEntryEssentials,projectMassEntryReader,projectMassEntryDetails} from "./mass-entry-journey.js";

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
  getCalendarState=()=>null,
  subscribeCalendarState=null,
  onOpenCalendar=null,
  onOpenPreparation=()=>false,
  getPrayerState=()=>null,
  onPrayerModeChange=()=>false,
  onOpenAdjacentService=()=>false,
}={}){
  if(!doc?.createElement||typeof getResolvedMass!=="function")
    throw new TypeError("Full Mass preflight requires DOM and source-owning host");
  let root=null,selected=null,explicit=false,selectedMode=null,explicitMode=false,lastDate=null,lastCelebrationKey=null,riteOverrides={},adjacentChoices={},disposed=false,observer=null,startObserver=null,observedStart=null;
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
    if(lastDate!==null&&date!==lastDate){selected=null;explicit=false;selectedMode=null;explicitMode=false;adjacentChoices={};}
    lastDate=date;
    const celebrationKey=[date,legacy?.celebrationId??"",legacy?.requestedCelebrationId??"",
      legacy?.celebrationType??"",legacy?.exceptionalProfile??""].join("|");
    if(lastCelebrationKey!==null&&lastCelebrationKey!==celebrationKey){
      riteOverrides={};
      adjacentChoices={};
    }
    lastCelebrationKey=celebrationKey;
    if(root&&!root.isConnected)root=null;
    if(!root){
      root=doc.createElement("section");
      root.dataset.aoFullMassPreflight="";
      root.className="aoFullMassPreflight";
      root.setAttribute("aria-label","Mass preparation");
      root.innerHTML='<h3 data-full-mass-title></h3>'+ 
        '<section class="aoMassLiturgicalContext" data-mass-calendar-context aria-label="Liturgical context">'+
        '<div class="aoMassLiturgicalContextHeader"><span data-mass-calendar-heading></span>'+
        '<button type="button" data-mass-calendar-open hidden></button></div>'+
        '<p class="aoMassLiturgicalDate"><span data-mass-calendar-date></span><span data-mass-calendar-season></span></p>'+
        '<div class="aoMassLiturgicalComparison">'+
        '<div data-mass-calendar-day-block><small data-mass-calendar-day-label></small><strong data-mass-calendar-day></strong>'+
        '<p><span data-mass-calendar-rank></span><span data-mass-calendar-colour></span></p></div>'+
        '<div data-mass-calendar-actual-block><small data-mass-calendar-actual-label></small><strong data-mass-calendar-actual></strong>'+
        '<p><span data-mass-calendar-actual-colour></span><span data-mass-calendar-gospel></span></p></div>'+
        '</div><div data-mass-calendar-commemoration class="aoMassCommemoration" hidden>'+ 
        '<small data-mass-calendar-commemoration-label></small>'+ 
        '<strong data-mass-calendar-commemoration-name></strong>'+ 
        '<p data-mass-calendar-commemoration-prayers></p></div>'+ 
        '<p data-mass-calendar-mission class="aoMassMissionSundaySource" hidden></p>'+ 
        '<p data-mass-calendar-source class="aoMassLiturgicalSource"></p>'+
        '<p data-mass-calendar-error role="alert" hidden></p></section>'+
        '<details data-mass-calendar-details class="aoMassCalendarEmbeddedDetails"><summary data-mass-calendar-details-label>Explore the liturgical calendar</summary>'+
        '<nav data-mass-calendar-tabs aria-label="Liturgical calendar views">'+
        '<button type="button" data-mass-calendar-view="day">Day</button>'+
        '<button type="button" data-mass-calendar-view="picker">Month</button>'+
        '<button type="button" data-mass-calendar-view="year">Liturgical Year</button></nav>'+
        '<div data-mass-calendar-host aria-label="Full liturgical calendar"></div></details>'+
        '<p data-full-mass-celebration role="status"></p>'+
        '<section class="aoSpecialMassContext" data-full-mass-special hidden></section>'+
        '<div class="aoFullMassCategories" role="group" data-full-mass-categories aria-label="Select actual Mass">'+
        [["CALENDAR","Mass of the day","Messe du jour"],["VOTIVE","Votive","Votive"],
         ["REQUIEM","Requiem","Requiem"],["NUPTIAL","Nuptial","Nuptiale"],
         ["OTHER","Other","Autre"],["SOURCE_DATE","Other Proper","Autre propre"]].map(([id,en,fr])=>
         '<button type="button" data-full-mass-category="'+id+'" data-label-en="'+en+'" data-label-fr="'+fr+'">'+en+'</button>').join("")+
        '</div><div data-full-mass-source-slot></div><p data-full-mass-category-error role="alert" hidden></p>'+
        '<details data-full-mass-review><summary data-full-mass-review-summary></summary>'+
        '<div data-full-mass-review-body></div></details>'+
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
        '<p data-full-mass-note></p>';
      arrangeMassEntryJourney(root,{language:language()});
      root.addEventListener("click",e=>{
        // A real-time Mass sequence is not a hidden accordion. Retain the
        // historical summary node for compatibility, but never let it close
        // the container holding the form and following-rite choices.
        if(e.target?.closest?.("[data-full-mass-rite-summary]")){
          e.preventDefault();return;
        }
        const beginButton=e.target?.closest?.("[data-mass-journey-start]");
        if(beginButton){
          e.preventDefault();
          const actual=getResolvedMass();
          const current=selectionFor(actual);
          const gate=getSourceGate();
          const originalStart=host.querySelector("[data-ao-start-live]");
          if(!current.canStart||gate?.ready!==true||
             !originalStart||originalStart.disabled||
             originalStart.getAttribute("aria-disabled")==="true"){
            refresh();return;
          }
          // Activation remains owned by the historical Mass host, whose
          // canonical gate, plans, and event handlers remain untouched.
          originalStart.click();
          return;
        }
        const serviceButton=e.target?.closest?.("[data-mass-journey-open-adjacent]");
        if(serviceButton){
          e.preventDefault();
          if(serviceButton.disabled)return;
          const id=serviceButton.dataset.massJourneyOpenAdjacent;
          if(adjacentChoices[id]!==true)return;
          serviceButton.disabled=true;
          const card=serviceButton.closest("[data-mass-journey-adjacent-active]");
          let message=card?.querySelector("[data-mass-journey-adjacent-error]");
          if(!message&&card){
            message=doc.createElement("p");
            message.dataset.massJourneyAdjacentError="";
            message.setAttribute("role","alert");
            message.hidden=true;card.append(message);
          }
          if(message)message.hidden=true;
          void Promise.resolve().then(()=>onOpenAdjacentService(id,serviceButton))
           .then(result=>{
             if(result===true||result?.ok===true)return;
             if(message){
               message.textContent=french()?"Impossible d’ouvrir cet office.":
                 "Unable to open this service.";
               message.hidden=false;
             }
           })
           .catch(error=>{
             if(message){
               message.textContent=(french()?"Ouverture impossible : ":"Unable to open service: ")+
                String(error?.message??error);
               message.hidden=false;
             }
           })
           .finally(()=>{if(serviceButton.isConnected)serviceButton.disabled=false;});
          return;
        }
        const prayerButton=e.target?.closest?.("[data-mass-journey-open-preparation]");
        if(prayerButton){
          e.preventDefault();
          try{
            const accepted=onOpenPreparation();
            if(accepted!==false)return;
          }catch(error){console.error("Before-Mass prayer entry failed",error)}
          prayerButton.title=french()?"Préparation indisponible.":"Preparation unavailable.";
          return;
        }
        const calendarButton=e.target?.closest?.("[data-mass-calendar-open]");
        if(calendarButton){
          e.preventDefault();e.stopPropagation();
          const notice=root.querySelector("[data-mass-calendar-error]");
          if(notice)notice.hidden=true;
          if(typeof onOpenCalendar!=="function")return;
          const details=root.querySelector("[data-mass-calendar-details]");
          if(details)details.open=true;
          Promise.resolve().then(()=>onOpenCalendar(String(getResolvedMass()?.date??""),"day",root.querySelector("[data-mass-calendar-host]")))
            .then(opened=>{if(opened===true||opened?.ok===true)return;
              if(notice){notice.textContent=french()?
                "Impossible d’ouvrir le calendrier.":"Unable to open Calendar.";notice.hidden=false;}})
            .catch(error=>{if(notice){notice.textContent=String(error?.message??error);notice.hidden=false;}});
          return;
        }
        const viewButton=e.target?.closest?.("[data-mass-calendar-view]");
        if(viewButton){
          e.preventDefault();e.stopPropagation();
          const details=root.querySelector("[data-mass-calendar-details]");
          if(details)details.open=true;
          const holder=root.querySelector("[data-mass-calendar-host]");
          const view=viewButton.dataset.massCalendarView;
          void Promise.resolve(onOpenCalendar?.(String(getResolvedMass()?.date??""),view,holder))
            .then(ok=>{if(ok!==true&&ok?.ok!==true){
              const notice=root.querySelector("[data-mass-calendar-error]");
              if(notice){notice.hidden=false;notice.textContent=french()?"Calendrier indisponible.":"Calendar unavailable."}
            }});
          return;
        }
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
      root.addEventListener("keydown",e=>{
        if(e.target?.closest?.("[data-full-mass-rite-summary]")&&
          (e.key==="Enter"||e.key===" ")){e.preventDefault();}
      });
      root.addEventListener("change",e=>{
        const el=e.target;
        if(el?.matches?.("[data-mass-journey-prayer-mode]")){
          const phase=el.dataset.massJourneyPrayerPhase,mode=el.value;
          if(!["prepare","thanksgiving"].includes(phase)||!PRAYER_JOURNEY_MODES.includes(mode)){
            refresh();return;
          }
          try{onPrayerModeChange(phase,mode)}catch(error){
            console.error("Mass prayer depth change failed",error);
          }
          // Authoritative state, never the hopeful radio click, owns selection.
          refresh();
          return;
        }
        if(el?.matches?.("[data-mass-journey-adjacent-choice]")){
          adjacentChoices=toggleAdjacentService(adjacentChoices,el.dataset.massJourneyAdjacentChoice,el.checked);
          refresh();return;
        }
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
    const context=massCalendarPreflightContext(legacy,getCalendarState?.()??{},language(),{form:summary.form});
    fillMassCalendarPreflight(root.querySelector("[data-mass-calendar-context]"),context);
    const commemorationDisclosure=root.querySelector("[data-mass-journey-commemoration-details]");
    // Source uncertainty affects prayer selection and must not be hidden.
    if(commemorationDisclosure&&["INCOMPLETE","FORM_RULES_UNVERIFIED"].includes(
      context.commemorationOrations?.status))commemorationDisclosure.open=true;
    root.dataset.massJourneyCalendarDiffers=String(context.differs);
    root.dataset.massJourneySameCelebration=String(Boolean(!context.differs&&
      context.calendar.title&&summary.actualTitle));
    translateMassEntryJourney(root,{language:language()});
    updateMassJourneyNotice(root,legacy,{language:language(),kind:summary.kind,form:summary.form});
    updateMassJourneyObserved(root,legacy,{language:language()});
    const detailsLabel=root.querySelector("[data-mass-calendar-details-label]");
    if(detailsLabel)detailsLabel.textContent=fr?"Explorer le calendrier liturgique":"Explore the liturgical calendar";
    for(const button of root.querySelectorAll("[data-mass-calendar-view]")){
      const v=button.dataset.massCalendarView;
      button.textContent=v==="day"?l("Day","Jour"):v==="picker"?l("Month","Mois"):l("Liturgical Year","Année liturgique");
    }
    if(typeof onOpenCalendar!=="function"){
      const calendarOpen=root.querySelector("[data-mass-calendar-open]");
      if(calendarOpen)calendarOpen.hidden=true;
    }
    // The historic VOX/Missal and form widgets still belong to the host,
    // but duplicating them alongside the native controls is misleading.
    // Suppress presentation only; never erase host selection or listeners.
    retireLegacyMassChoiceGrids(host,root);
    root.querySelectorAll("[data-full-mass-category]").forEach(button=>{
      button.textContent=button.dataset[fr?"labelFr":"labelEn"];
      const match=button.dataset.fullMassCategory===
        (legacy?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY"?"SOURCE_DATE":summary.kind);
      button.setAttribute("aria-current",match?"true":"false");
    });
    root.querySelector("[data-full-mass-title]").textContent=summary.kind==="GOOD_FRIDAY"?
      l("Prepare for the Good Friday liturgy","Préparer l'office du Vendredi saint"):
      l("Prepare your Mass","Préparer votre messe");
    root.querySelector("[data-full-mass-form-title]").textContent=l("How is it celebrated?","Comment est-elle célébrée ?");
    const kindKicker=root.querySelector("[data-mass-journey-kind]");
    if(kindKicker)kindKicker.textContent=summary.kindLabel;
    // A technical source ID (e.g. "nuptial" or "requiem") is not a
    // user-facing feast title. Keep the bilingual category label instead.
    const rawCelebrationId=String(legacy?.celebrationId??legacy?.requestedCelebrationId??"");
    const actualIsBareId=Boolean(summary.actualTitle&&rawCelebrationId&&
      summary.actualTitle===rawCelebrationId&&!/\s/.test(rawCelebrationId));
    root.querySelector("[data-full-mass-celebration]").textContent=
      actualIsBareId?summary.kindLabel:(summary.actualTitle||summary.kindLabel);
    const entryTheme=resolveMassLiturgicalTheme({legacyResolvedMass:legacy});
    const accent=entryTheme.key==="BLACK"?
      entryTheme.tokens.accentText:entryTheme.tokens.accent;
    root.style.setProperty("--ao-entry-accent",accent);
    root.style.setProperty("--ao-entry-accent-soft",
      "color-mix(in srgb, "+accent+" 11%, transparent)");
    root.style.setProperty("--ao-entry-panel",entryTheme.tokens.panel);
    root.dataset.massEntryColour=entryTheme.key;
    root.dataset.massEntryColourSource=entryTheme.source;
    const sourceGate=getSourceGate();
    updateMassJourneyReadiness(root,{ready:summary.canStart,sourceReady:sourceGate.ready,language:language()});
    const originalStart=host.querySelector("[data-ao-start-live]");
    if(originalStart!==observedStart){
      startObserver?.disconnect();observedStart=originalStart;
      const Observer=doc.defaultView?.MutationObserver;
      startObserver=originalStart&&typeof Observer==="function"?
        new Observer(()=>queueMicrotask(refresh)):null;
      startObserver?.observe(originalStart,{attributes:true,attributeFilter:["disabled","aria-disabled"]});
    }
    projectMassEntryLaunch(root,{
      ready:summary.canStart,sourceReady:sourceGate.ready,
      hostStartAvailable:Boolean(originalStart&&!originalStart.disabled&&originalStart.getAttribute("aria-disabled")!=="true"),
      formLabel:summary.formLabel,language:language(),
      distinctLiturgy:summary.kind==="GOOD_FRIDAY"
    });
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
    root.querySelector("[data-full-mass-reader-heading]").textContent=summary.kind==="GOOD_FRIDAY"?
      l("How to follow the liturgy","Comment suivre l'office"):
      l("How to follow the Mass","Comment suivre la messe");
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
    // Always display the actual celebration order; optional ceremonies are
    // contextual steps within it, not an expandable grab-bag of toggles.
    detail.hidden=false;
    detail.open=true;
    root.querySelector("[data-full-mass-rite-summary]").textContent=l("Celebration sequence",
      "Déroulement de la célébration");
    root.querySelector("[data-full-mass-rite-intro]").textContent=options.length?
      l("Confirm only ceremonies actually taking place. The date alone never activates a procession.",
        "Confirmez seulement les cérémonies réellement célébrées. La date seule ne déclenche jamais une procession."):"";
    const list=root.querySelector("[data-full-mass-rite-list]");
    const shown=[...list.querySelectorAll("[data-full-mass-rite]")].map(x=>x.dataset.fullMassRite);
    const desired=options.map(x=>x.id);
    const massStep=root.querySelector("[data-mass-journey-mass]");
    const thanksgiving=root.querySelector("[data-mass-journey-after]");
    const afterPhases=root.querySelector("[data-mass-journey-special-after]");
    const adjacentAfter=root.querySelector("[data-mass-journey-adjacent-after]");
    if(shown.join("|")!==desired.join("|")||list.querySelector("[data-mass-journey-mass]")!==massStep){
      const existing=new Map([...list.querySelectorAll("[data-full-mass-rite]")].map(x=>[x.dataset.fullMassRite,x.closest("label")]));
      const rows=options.map(rite=>{
        if(existing.has(rite.id))return {rite,label:existing.get(rite.id)};
        const label=doc.createElement("label");label.className="aoFullMassRite";
        const checkbox=doc.createElement("input");checkbox.type="checkbox";
        checkbox.dataset.fullMassRite=rite.id;
        const text=doc.createElement("span");text.textContent=fr?rite.fr:rite.en;
        label.append(checkbox,text);return {rite,label};
      });
      const preceding=rows.filter(x=>x.rite.position==="precedingRites").map(x=>x.label);
      const following=rows.filter(x=>x.rite.position==="followingActions").map(x=>x.label);
      // The Mass and thanksgiving elements are genuine ordered steps in the
      // *same* visual sequence as real preceding and following ceremonies.
      list.replaceChildren(...preceding,...(massStep?[massStep]:[]),
        ...following,...(afterPhases?[afterPhases]:[]),...(adjacentAfter?[adjacentAfter]:[]),...(thanksgiving?[thanksgiving]:[]));
    }
    for(const rite of options){
      const input=[...list.querySelectorAll("[data-full-mass-rite]")]
        .find(x=>x.dataset.fullMassRite===rite.id);
      if(!input)continue;
      input.checked=riteOverrides[rite.id]??rite.fromSource;
      input.disabled=!rite.allowed;
      input.closest("label").querySelector("span").textContent=fr?rite.fr:rite.en;
    }
    updateMassJourneyPhases(root,presentation,{language:language(),availableRiteIds:options.map(x=>x.id)});
    projectMassEntryDetails(root,{
      kind:summary.kind,optionCount:options.filter(rite=>rite.allowed&&
        !(riteOverrides[rite.id]??rite.fromSource)).length,
      language:language()
    });
    projectMassEntryEssentials(root,presentation,{
      language:language(),kind:summary.kind,
      availableRiteIds:options.map(x=>x.id),
      confirmedRites:options.filter(rite=>rite.allowed&&
        (riteOverrides[rite.id]??rite.fromSource))
        .map(rite=>({label:fr?rite.fr:rite.en}))
    });
    projectMassEntryReader(root,{
      mode:summary.readerMode,language:language(),
      distinct:summary.kind==="GOOD_FRIDAY"
    });
    renderAdjacentServices(root,adjacentChoices,language());
    const prayerState=getPrayerState?.()??{};
    renderPrayerJourneyModes(root,{
      prepare:prayerState?.prepare?.mode,
      thanksgiving:prayerState?.thanksgiving?.mode,
      language:language()
    });
    // The compact review always reflects the *effective* Proper selected for
    // this Mass, not a stale host Calendar Proper from before a source change.
    const observed=legacy?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY";
    const proper=legacy?.proper?.data??legacy?.proper??null;
    const ownerPath=String(legacy?.properSource??proper?.sourcePath??"").trim();
    const review=root.querySelector("[data-full-mass-review]");
    root.querySelector("[data-full-mass-review-summary]").textContent=l(
      "Review Mass and Proper","Vérifier la messe et le propre");
    const body=root.querySelector("[data-full-mass-review-body]");
    if(observed)review.open=true;
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
    const multi=root.querySelector("[data-mass-journey-multiple]");
    if(multi)multi.dataset.massSourceReady=String(summary.canStart&&sourceGate.ready);
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
  // Resolver updates can complete while Mass preflight remains open. Reflect
  // them without requiring a click, and without changing the Mass choice.
  const unsubscribeCalendar=typeof subscribeCalendarState==="function"
    ?subscribeCalendarState(()=>queueMicrotask(refresh)):null;
  refresh();
  return Object.freeze({
    selectionFor,
    composeRitesFor,
    openCategory,
    refresh,
    status:()=>Object.freeze({visible:Boolean(root?.isConnected),explicitlyChosenForm:explicit,
      readerMode:activeReaderMode(),explicitlyChosenReaderMode:explicitMode,
      chosenForm:activeForm(),date:lastDate,kind:root?.dataset?.aoCelebrationKind??null,
      optionalRiteOverrides:Object.freeze({...riteOverrides}),
      adjacentServices:Object.freeze({...adjacentChoices})}),
    dispose(){disposed=true;try{unsubscribeCalendar?.()}catch{};doc.removeEventListener("change",onchange);doc.removeEventListener("click",onClick);observer?.disconnect();startObserver?.disconnect();root?.remove();root=null;}
  });
}
