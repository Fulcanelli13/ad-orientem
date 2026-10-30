// Native Mass-form preflight, mounted alongside the source-resolving host preflight.
// Ceremony FORM and the liturgical CELEBRATION are different axes. The latter
// remains owned by the 1962 calendar/Proper resolver; NEVER substitute a Proper.
import {normalizeMassForm,MASS_FORMS} from "./session-engine.js";
import {openMassTextsSheet} from "./mass-texts-sheet.js";
import {m1AccessPreviewRequested,paintM1AccessRows,m1AccessRows,m1SelectedIntroit} from "./m1-access-overview.js";
import {availableOptionalMassRites,composeOptionalMassRites} from "./full-mass-optional-rites.js";
import {specialMassPresentation,renderSpecialMassContext} from "./full-mass-special-presentation.js";
import {massCalendarPreflightContext,fillMassCalendarPreflight} from "./calendar-preflight-context.js";
import {normalizeFolioExperience,experiencePrayerRoute,experiencePrayerDepth,mayOpenFolioPrayer} from "./full-mass-folio-options.js";
import {is1962AllSoulsCalendarMass,ALL_SOULS_1962_FORMULARIES} from "./1962-all-souls-source.js";

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
  getAllSoulsMassChoice=()=>1,
  onAllSoulsMassChange=()=>{},
  getLocalOrationSummary=()=>null,
  getCalendarState=()=>null,
  subscribeCalendarState=null,
  onOpenCalendar=null,
  onOpenPrayerRoute=null,
  onPrepareMassTexts=null,
}={}){
  if(!doc?.createElement||typeof getResolvedMass!=="function")
    throw new TypeError("Full Mass preflight requires DOM and source-owning host");
  let root=null,selected=null,explicit=false,selectedMode=null,explicitMode=false,lastDate=null,lastCelebrationKey=null,riteOverrides={},disposed=false,observer=null;
  const m1Preview=m1AccessPreviewRequested(doc.defaultView);
  let m1Focus=null;
  let folioStep="overview",experience={before:"none",after:"none",language:null},prayerOpening=false;
  let allSoulsSuccession=null;
  const successionFor=legacy=>{
    const massNumber=getAllSoulsMassChoice(legacy);
    const canonical=getCalendarState?.()?.resolution;
    if(![1,2,3].includes(massNumber)||
       canonical?.date!==legacy?.date||canonical?.status!=="ready"||
       !is1962AllSoulsCalendarMass({
         ...legacy,calendarDay:canonical.day?.main
       },canonical.proper))return null;
    const current=allSoulsSuccession?.date===legacy.date&&
      allSoulsSuccession.massNumber===massNumber?allSoulsSuccession:null;
    return Object.freeze({
      date:legacy.date,massNumber,
      previous:massNumber===1?"NONE":current?.previous??"UNKNOWN",
      next:massNumber===3?"NONE":current?.next??"UNKNOWN",
    });
  };
  const donorSuppressed=new Map();
  const suppressDonorDuplicates=()=>{
    const panel=root?.parentElement;
    if(!panel?.classList?.contains("aoMassFlowBody"))return;
    const suppress=node=>{
      if(!node||root.contains(node))return;
      if(!donorSuppressed.has(node))donorSuppressed.set(node,{
        hidden:node.hidden,display:node.style.display,
        priority:node.style.getPropertyPriority("display"),
      });
      node.hidden=true;
      node.style.setProperty("display","none","important");
    };
    // These are the old presentational owners, NOT the source resolver.
    for(const node of panel.children){
      if(node===root)continue;
      if(node.matches?.(".aoPreflightHero,.aoReadiness,.aoPrototypeNote,.aoRubricStatus.ok,.aoBridgeNote.ok"))
        suppress(node);
      if(node.matches?.(".aoChoiceGrid")&&node.querySelector?.("[data-ao-follow]")){
        suppress(node);
        if(node.previousElementSibling?.matches?.(".aoFlowSection"))
          suppress(node.previousElementSibling);
      }
    }
    // The donor sometimes provides Back and Close as identical × icons.
    const header=panel.parentElement;
    if(header?.querySelector?.("[data-ao-close]")){
      const back=[...header.querySelectorAll("[data-ao-back]")].find(node=>!root.contains(node));
      if(back)suppress(back);
    }
  };
  const restoreDonor=()=>{
    for(const [node,old] of donorSuppressed){
      node.hidden=old.hidden;
      if(old.display)node.style.setProperty("display",old.display,old.priority);
      else node.style.removeProperty("display");
    }
    donorSuppressed.clear();
  };
  const flow=()=>doc.getElementById("ao-mass-flow-v1");
  const anchor=()=>flow()?.querySelector(".aoFlowActions")??flow()?.querySelector("[data-ao-start-live]")?.parentElement;
  const french=()=>String(experience.language??language()).startsWith("fr");
  const selectedExperience=()=>normalizeFolioExperience(experience,language());
  function activeForm(){
    try{return normalizeMassForm(explicit?selected:getDefaultForm());}
    catch{return "MISSA_CANTATA_INCENSE";}
  }
  function activeReaderMode(){
    const mode=String(explicitMode?selectedMode:getDefaultReaderMode()??"LIVE").toUpperCase();
    if(mode==="MISSAL")return mode;
    return "LIVE";
  }
  function selectionFor(legacy){
    const value=resolvedMassSummary(legacy,{form:activeForm(),language:language()});
    return Object.freeze({...value,explicitlyChosenForm:explicit,
      readerMode:activeReaderMode(),explicitlyChosenReaderMode:explicitMode,
      readerLanguage:selectedExperience().language,
      allSoulsSuccession:successionFor(legacy),
      beforeMass:selectedExperience().before,afterMass:selectedExperience().after});
  }
  // H4 is a presentation of these selections, not a new preferences owner.
  // Validate against the existing preflight before changing its in-memory state.
  function setTodayChoice(key,value){
    if(disposed)return false;
    // First reconcile date changes so refresh cannot erase a new choice.
    refresh();
    let legacy=null;try{legacy=getResolvedMass()}catch{}
    if(!legacy)return false;
    const current=selectionFor(legacy);
    if(key==="form"){
      if(!current.formChangeAllowed||!MASS_FORMS.includes(value))return false;
      selected=value;explicit=true;
    }else if(key==="readerMode"){
      if(!["LIVE","MISSAL"].includes(value))return false;
      selectedMode=value;explicitMode=true;
    }else if(key==="readerLanguage"){
      if(!["en","fr"].includes(value))return false;
      experience.language=value;
    }else if(key==="beforeMass"){
      if(!["none","prepare","full"].includes(value))return false;
      experience.before=value;
    }else if(key==="afterMass"){
      if(!["none","thanksgiving","full"].includes(value))return false;
      experience.after=value;
    }else return false;
    refresh();return true;
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
    if(lastDate!==null&&date!==lastDate){selected=null;explicit=false;selectedMode=null;explicitMode=false;folioStep="overview";m1Focus=null;}
    lastDate=date;
    const celebrationKey=[date,legacy?.celebrationId??"",legacy?.requestedCelebrationId??"",
      legacy?.celebrationType??"",legacy?.exceptionalProfile??""].join("|");
    if(lastCelebrationKey!==null&&lastCelebrationKey!==celebrationKey)riteOverrides={};
    lastCelebrationKey=celebrationKey;
    if(root&&!root.isConnected)root=null;
    if(!root){
      root=doc.createElement("section");
      root.dataset.aoFullMassPreflight="";
      if(m1Preview)root.dataset.aoMassAccessM1="true";
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
        '</div><div data-full-mass-source-slot></div>'+ 
        '<fieldset data-ao-all-souls-choices hidden class="aoFullMassOptional">'+
        '<legend data-ao-all-souls-heading></legend><div class="aoFullMassForms">'+
        [1,2,3].map(n=>'<label class="aoFullMassChoice"><input type="radio"'+
          ' name="ao-all-souls-formulary" value="'+n+'" data-ao-all-souls-mass>'+ 
          '<span data-ao-all-souls-mass-label="'+n+'"></span></label>').join('')+
        '</div><p data-ao-all-souls-note></p>'+ 
        '<details data-ao-all-souls-succession-details>'+ 
        '<summary data-ao-all-souls-succession-summary></summary>'+ 
        '<div data-ao-all-souls-succession-controls>'+ 
        '<label data-ao-all-souls-previous-label></label>'+ 
        '<select data-ao-all-souls-succession="previous"></select>'+ 
        '<label data-ao-all-souls-next-label></label>'+ 
        '<select data-ao-all-souls-succession="next"></select>'+ 
        '</div><p data-ao-all-souls-succession-note></p></details></fieldset>'+ 
        '<p data-full-mass-category-error role="alert" hidden></p>'+
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
        [["MISSAL","Missal","Missel"],["LIVE","LIVE","LIVE"]].map(([id,en,fr])=>
          '<label class="aoFullMassChoice"><input type="radio" name="ao-native-reader-mode" value="'+id+'" data-full-mass-reader-mode>'+
          '<span data-full-mass-reader-label="'+id+'" data-label-en="'+en+'" data-label-fr="'+fr+'">'+en+'</span></label>').join("")+
        '</div></fieldset>'+

        '<details data-full-mass-rites class="aoFullMassOptional"><summary data-full-mass-rite-summary></summary>'+
        '<p data-full-mass-rite-intro></p><div data-full-mass-rite-list></div></details>'+
        '<p data-full-mass-note></p>';  

      // One source-owned Folio; preserve existing selectable controls by
      // moving their actual DOM nodes into the guided stages. No shadow form.
      const folio=doc.createElement("div");
      folio.className="aoGuidedMassFolio";
      folio.innerHTML=
        '<aside class="aoMassFolioIdentity"><small data-folio-date></small>'+
        '<p class="aoMassFolioKicker" data-folio-kind></p><h2 data-folio-celebration></h2>'+
        '<p class="aoMassFolioSeason" data-folio-season></p>'+ 
         '<button type="button" data-mass-texts-open class="aoMassTextsOpen"></button>'+ 
         '<p data-m1-introit class="aoM1ActualIntroit" hidden></p>'+
        '<dl class="aoMassFolioSelections"><div><dt data-folio-label-ceremony></dt><dd data-folio-value-ceremony></dd></div>'+
        '<div><dt data-folio-label-reader></dt><dd data-folio-value-reader></dd></div></dl>'+
        '<details data-folio-calendar-details><summary data-folio-context-summary></summary>'+
        '<div data-folio-technical></div></details></aside>'+
        '<div class="aoMassFolioGuide">'+
        '<div class="aoMassFolioGuideTop"><strong data-folio-guide-heading></strong>'+
        '<button type="button" data-folio-overview-button data-folio-label-overview></button></div>'+
        '<nav class="aoMassFolioStepNav" aria-label="Mass preparation">'+
        '<button type="button" data-folio-goto="celebration">1 · <span data-folio-step-celebration></span></button>'+
        '<button type="button" data-folio-goto="ceremony">2 · <span data-folio-step-ceremony></span></button>'+
        '<button type="button" data-folio-goto="reader">3 · <span data-folio-step-reader></span></button></nav>'+
        '<section data-folio-panel="overview" class="aoMassFolioPanel">'+
        '<h3 data-folio-overview-heading></h3><p data-folio-overview-hint></p>'+
        '<div class="aoMassFolioReadyLine" data-folio-overview-selections></div>'+ 
         '<div data-m1-rows class="aoM1Choices" role="group" aria-label="Your Mass" hidden></div>'+
        '<button type="button" data-folio-goto="celebration" class="aoMassFolioChange" data-folio-guide-start></button></section>'+
        '<section data-folio-panel="celebration" class="aoMassFolioPanel" hidden>'+
        '<h3 data-folio-celebration-heading></h3><p data-folio-celebration-intro></p>'+
        '<div data-folio-celebration-controls></div></section>'+
        '<section data-folio-panel="ceremony" class="aoMassFolioPanel" hidden>'+
        '<h3 data-folio-ceremony-heading></h3><div data-folio-ceremony-controls></div></section>'+
        '<section data-folio-panel="reader" class="aoMassFolioPanel" hidden>'+
        '<h3 data-folio-reader-heading></h3><div data-folio-reader-controls></div></section>'+
        '<section class="aoMassFolioExperience"><h3 data-folio-experience-heading></h3>'+
        '<div class="aoMassFolioOption"><label data-folio-language-heading for="ao-folio-language"></label>'+
        '<select id="ao-folio-language" data-folio-language><option value="en">English</option><option value="fr">Français</option></select></div>'+
        '<fieldset class="aoMassFolioOption"><legend data-folio-before-heading></legend>'+
        '<label><input type="radio" name="ao-folio-before" value="none" data-folio-before> <span data-folio-before-none></span></label>'+
        '<label><input type="radio" name="ao-folio-before" value="prepare" data-folio-before> <span data-folio-before-prepare></span></label>'+ 
        '<label><input type="radio" name="ao-folio-before" value="full" data-folio-before> <span data-folio-before-full></span></label>'+
        '<button type="button" data-folio-open-prayer="before" hidden></button></fieldset>'+
        '<div data-folio-rites-slot></div>'+
        '<fieldset class="aoMassFolioOption"><legend data-folio-after-heading></legend>'+
        '<label><input type="radio" name="ao-folio-after" value="none" data-folio-after> <span data-folio-after-none></span></label>'+
        '<label><input type="radio" name="ao-folio-after" value="thanksgiving" data-folio-after> <span data-folio-after-thanksgiving></span></label>'+ 
        '<label><input type="radio" name="ao-folio-after" value="full" data-folio-after> <span data-folio-after-full></span></label></fieldset>'+
        '</section><div data-folio-essential-notice class="aoMassFolioEssentialNotice"></div>'+
        '<div class="aoMassFolioGuideActions" data-folio-actions>'+
        '<button type="button" data-folio-back hidden></button><button type="button" data-folio-next hidden></button></div>'+
        '<div data-folio-host-actions></div></div>';
      root.prepend(folio);
      if(m1Preview){
        // M1 adopts the shared Today / Calendar / Mass visual primitives,
        // but the host keeps its sole original Start button and resolver.
        folio.querySelector(".aoMassFolioIdentity")?.classList.add("aoTcmCard");
        folio.querySelector("[data-mass-texts-open]")?.classList.add("aoTcmSecondary");
        folio.querySelector("[data-folio-overview-button]")?.classList.add("aoTcmSecondary");
      }
      const move=(selector,slot)=>{
        const source=root.querySelector(selector),destination=folio.querySelector(slot);
        if(source&&destination)destination.append(source);
      };
      move("[data-mass-calendar-context]","[data-folio-technical]");
      move("[data-mass-calendar-details]","[data-folio-technical]");
      move("[data-full-mass-title]","[data-folio-celebration-controls]");
      move("[data-full-mass-celebration]","[data-folio-celebration-controls]");
      move("[data-full-mass-special]","[data-folio-celebration-controls]");
      move("[data-full-mass-categories]","[data-folio-celebration-controls]");
      move("[data-full-mass-source-slot]","[data-folio-celebration-controls]");
      move("[data-ao-all-souls-choices]","[data-folio-celebration-controls]");
      move("[data-full-mass-category-error]","[data-folio-celebration-controls]");
      move("[data-full-mass-review]","[data-folio-celebration-controls]");
      move("[data-full-mass-resolver]","[data-folio-celebration-controls]");
      move("[data-full-mass-form-fieldset]","[data-folio-ceremony-controls]");
      move("[data-full-mass-reader-fieldset]","[data-folio-reader-controls]");
      move("[data-full-mass-rites]","[data-folio-rites-slot]");
      move("[data-full-mass-note]","[data-folio-essential-notice]");
      // Preview reuses original selectors; no second Mass-preferences form.
      if(m1Preview){
        // Two distinct host-owned paths, one public Other entry: changing
        // the celebration is not equivalent to selecting another dated Proper.
        const categories=folio.querySelector("[data-full-mass-categories]");
        const other=doc.createElement("details");
        other.className="aoM1OtherMass";
        other.dataset.m1OtherGroup="";
        const caption=doc.createElement("summary");caption.dataset.m1OtherSummary="";
        other.append(caption);
        for(const kind of ["OTHER","SOURCE_DATE"]){
          const button=categories.querySelector('[data-full-mass-category="'+kind+'"]');
          if(button)other.append(button);
        }
        categories.append(other);
        const exp=folio.querySelector(".aoMassFolioExperience");
        exp.querySelector("[data-folio-language]")?.closest(".aoMassFolioOption")?.setAttribute("data-m1-option","language");
        exp.querySelector("[data-folio-before]")?.closest("fieldset")?.setAttribute("data-m1-option","before");
        exp.querySelector("[data-folio-after]")?.closest("fieldset")?.setAttribute("data-m1-option","after");
        exp.querySelector("[data-folio-rites-slot]")?.setAttribute("data-m1-option","rites");
      }

      root.addEventListener("click",e=>{
        const massTexts=e.target?.closest?.("[data-mass-texts-open]");
        if(massTexts){
          e.preventDefault();e.stopPropagation();
          if(massTexts.disabled)return;
          massTexts.disabled=true;
          const legacy=getResolvedMass();
          const chosen=selectionFor(legacy);
          // Preview the exact prepared Proper used on Begin Mass. This
          // includes All Souls II/III and source-owned commemorations.
          Promise.resolve().then(()=>onPrepareMassTexts?.())
            .then(prepared=>{
              const proper=prepared?.session?.resolvedMass?.proper?.data??null;
              openMassTextsSheet(doc,{
                proper,date:legacy?.date??"",title:chosen.actualTitle||chosen.kindLabel,
                language:chosen.readerLanguage,
                sourceReady:root.dataset.aoProperReady==="true"&&Boolean(proper),
                opener:massTexts,
              });
            })
            .catch(()=>{
              openMassTextsSheet(doc,{date:legacy?.date??"",
                title:chosen.actualTitle||chosen.kindLabel,
                language:chosen.readerLanguage,sourceReady:false,opener:massTexts});
            })
            .finally(()=>{if(massTexts.isConnected)massTexts.disabled=false;});
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
        const m1Button=m1Preview?e.target?.closest?.("[data-m1-choice]"):null;
        if(m1Button){
          e.preventDefault();e.stopPropagation();
          const key=m1Button.dataset.m1Choice;
          if(!["mass","ceremony","reader","language","before","after","rites"].includes(key))return;
          m1Focus=key;
          folioStep=({mass:"celebration",ceremony:"ceremony",reader:"reader"})[key]??"overview";
          refresh();return;
        }
        const stageButton=e.target?.closest?.("[data-folio-goto], [data-folio-overview-button], [data-folio-next], [data-folio-back]");
        if(stageButton){
          e.preventDefault();
          if(stageButton.matches("[data-folio-overview-button]")){folioStep="overview";m1Focus=null;}
          else if(stageButton.matches("[data-folio-goto]"))folioStep=stageButton.dataset.folioGoto;
          else if(stageButton.matches("[data-folio-back]")){
            folioStep={celebration:"overview",ceremony:"celebration",reader:"ceremony"}[folioStep]??"overview";
          }else{
            folioStep={celebration:"ceremony",ceremony:"reader",reader:"overview"}[folioStep]??"overview";
          }
          refresh();return;
        }
        const prayerButton=e.target?.closest?.("[data-folio-open-prayer]");
        if(prayerButton){
          e.preventDefault();
          const moment=prayerButton.dataset.folioOpenPrayer;
          if(prayerOpening||!mayOpenFolioPrayer(moment,selectedExperience()))return;
          const route=experiencePrayerRoute(moment);
          prayerOpening=true;
          const error=root.querySelector("[data-full-mass-category-error]");
          Promise.resolve().then(()=>onOpenPrayerRoute?.(route,{
            depth:experiencePrayerDepth(moment,selectedExperience()),
            language:selectedExperience().language
          }))
            .then(ok=>{if(ok===false||ok==null)throw Error("PRAYER_MODULE_UNAVAILABLE")})
            .catch(reason=>{if(error){error.hidden=false;error.textContent=String(reason?.message??reason)}})
            .finally(()=>{prayerOpening=false});
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
      root.addEventListener("change",e=>{
        const el=e.target;
        if(el?.matches?.("[data-ao-all-souls-mass]")){
          onAllSoulsMassChange(Number(el.value));refresh();return;
        }
        if(el?.matches?.("[data-ao-all-souls-succession]")){
          const direction=el.dataset.aoAllSoulsSuccession;
          const base=getResolvedMass();
          const current=successionFor(base);
          if(!current||!["previous","next"].includes(direction))return;
          const allowed=direction==="previous"
            ? ["UNKNOWN","IMMEDIATE","INTERRUPTED","NONE"]
            : ["UNKNOWN","IMMEDIATE","INTERRUPTED_LT3","INTERRUPTED_GTE3","NONE"];
          if(!allowed.includes(el.value))return;
          allSoulsSuccession=Object.freeze({...current,[direction]:el.value});
          refresh();return;
        }
        if(el?.matches?.("[data-folio-language]")){
          if(["en","fr"].includes(el.value))experience.language=el.value;
          refresh();return;
        }
        if(el?.matches?.("[data-folio-before]")){
          if(["none","prepare","full"].includes(el.value))experience.before=el.value;
          refresh();return;
        }
        if(el?.matches?.("[data-folio-after]")){
          if(["none","thanksgiving","full"].includes(el.value))experience.after=el.value;
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
        if(el?.matches?.("[data-full-mass-reader-mode]")&&["MISSAL","LIVE"].includes(el.value)){
          selectedMode=el.value;explicitMode=true;if(m1Preview){folioStep="overview";m1Focus=null;}refresh();return;
        }
        if(el?.matches?.("[data-full-mass-form]")&&MASS_FORMS.includes(el.value)){
          selected=el.value;explicit=true;if(m1Preview){folioStep="overview";m1Focus=null;}refresh();
        }
      });
      target.insertAdjacentElement("beforebegin",root);
      // The original Start Mass button remains the sole authoritative entry.
      // Move its entire host action group into the Folio, never clone it.
      folio.querySelector("[data-folio-host-actions]").append(target);
    }
    const fr=french(),summary=selectionFor(legacy),l=(en,frText)=>fr?frText:en;
    const properPath=String(legacy?.proper?.data?.sourcePath??
       legacy?.proper?.sourcePath??"");
    const authoritativeDay=getCalendarState?.()?.resolution;
    const chosenOriginal=String(authoritativeDay?.proper?.data?.sourcePath??"");
    const allSoulsDay=authoritativeDay?.date===date&&
       authoritativeDay?.status==="ready"&&
       is1962AllSoulsCalendarMass({
         ...legacy,calendarDay:authoritativeDay.day?.main
       },authoritativeDay.proper)&&
       (!legacy?.properSource||legacy.properSource===chosenOriginal||
         ALL_SOULS_1962_FORMULARIES.includes(legacy.properSource))&&
       (!properPath||properPath===chosenOriginal||
         ALL_SOULS_1962_FORMULARIES.includes(properPath));
    const chosenAllSoulsMass=allSoulsDay?getAllSoulsMassChoice(legacy):1;
    if(allSoulsSuccession && (
      !allSoulsDay||allSoulsSuccession.date!==date||
      allSoulsSuccession.massNumber!==chosenAllSoulsMass))
      allSoulsSuccession=null;
    const selector=root.querySelector("[data-ao-all-souls-choices]");
    selector.hidden=!allSoulsDay;
    if(allSoulsDay){
      const massNumber=chosenAllSoulsMass;
      selector.querySelector("[data-ao-all-souls-heading]").textContent=l(
        "All Souls — Mass formulary","Commémoration des fidèles défunts — formulaire");
      selector.querySelector("[data-ao-all-souls-note]").textContent=l(
        "Choose the Mass actually celebrated. The Second and Third have distinct readings and prayers.",
        "Choisissez la messe réellement célébrée. Les deuxième et troisième ont des lectures et prières distinctes.");
      selector.querySelector("[data-ao-all-souls-succession-summary]").textContent=l(
        "Celebrant's other Masses · optional",
        "Autres messes du célébrant · facultatif");
      const context=successionFor(legacy);
      const labels={
        previous:[["UNKNOWN","Not known","Non précisé"],
          ["IMMEDIATE","Immediately before, same priest","Juste avant, même prêtre"],
          ["INTERRUPTED","Earlier, with an interruption","Auparavant, avec interruption"],
          ["NONE","No previous Mass by this priest","Aucune messe précédente par ce prêtre"]],
        next:[["UNKNOWN","Not known","Non précisé"],
          ["IMMEDIATE","Immediately afterwards, same priest","Juste après, même prêtre"],
          ["INTERRUPTED_LT3","After a break, within three hours","Après interruption, dans les trois heures"],
          ["INTERRUPTED_GTE3","After a break, after three hours","Après interruption, après trois heures"],
          ["NONE","No following Mass by this priest","Aucune messe suivante par ce prêtre"]],
      };
      for(const direction of ["previous","next"]){
        const select=selector.querySelector('[data-ao-all-souls-succession="'+direction+'"]');
        const label=selector.querySelector('[data-ao-all-souls-'+direction+'-label]');
        select.hidden=label.hidden=direction==="previous"?massNumber===1:massNumber===3;
        label.textContent=direction==="previous"
          ?l("Previous Mass by this priest","Messe précédente par ce prêtre")
          :l("Next Mass by this priest","Messe suivante par ce prêtre");
        select.replaceChildren();
        for(const [value,en,frText] of labels[direction]){
          const option=doc.createElement("option");
          option.value=value;option.textContent=l(en,frText);
          select.append(option);
        }
        select.value=context[direction];
        select.setAttribute("aria-label",label.textContent);
      }
      selector.querySelector("[data-ao-all-souls-succession-note]").textContent=l(
        "Only select a succession circumstance if known. The first, second and third texts do not, by themselves, determine the priest's ablutions.",
        "Ne précisez une succession que si elle est connue. Le premier, deuxième ou troisième formulaire ne détermine pas à lui seul les ablutions du prêtre.");
      for(const [index,en,frText] of [
        [1,"First Mass","Première messe"],
        [2,"Second Mass","Deuxième messe"],
        [3,"Third Mass","Troisième messe"]]){
        selector.querySelector('[data-ao-all-souls-mass-label="'+index+'"]').textContent=l(en,frText);
        selector.querySelector('[data-ao-all-souls-mass][value="'+index+'"]').checked=massNumber===index;
      }
    }
    const context=massCalendarPreflightContext(legacy,getCalendarState?.()??{},summary.readerLanguage,{form:summary.form});
    const folio=root.querySelector(".aoGuidedMassFolio");
    const word=(selector,en,frText)=>{
      const node=folio?.querySelector(selector);if(node)node.textContent=l(en,frText);
    };
    const displayTitle=(summary.actualTitle||summary.kindLabel)+(
      allSoulsDay&&chosenAllSoulsMass>1
        ?(chosenAllSoulsMass===2?l(" · Second Mass"," · Deuxième messe"):
           l(" · Third Mass"," · Troisième messe")):"");
    word("[data-folio-date]",date,""+date);
    word("[data-folio-kind]",summary.kindLabel,summary.kindLabel);
    word("[data-folio-celebration]",displayTitle,displayTitle);
    word("[data-folio-season]",[context.actual?.colour||context.calendar?.colour,context.season].filter(Boolean).join(" · "),
      [context.actual?.colour||context.calendar?.colour,context.season].filter(Boolean).join(" · "));
    word("[data-mass-texts-open]","Mass texts","Textes de la messe");
    word("[data-folio-label-ceremony]",l("Ceremony","Cérémonie"),l("Ceremony","Cérémonie"));
    word("[data-folio-label-reader]",l("Follow","Lecture"),l("Follow","Lecture"));
    word("[data-folio-value-ceremony]",summary.formLabel,summary.formLabel);
    word("[data-folio-value-reader]",summary.readerMode,summary.readerMode);
    word("[data-folio-context-summary]","Calendar details","Détails du calendrier");
    word("[data-folio-guide-heading]",m1Preview?
       (m1Focus?m1AccessRows(summary,{fr}).find(r=>r.id===m1Focus)?.title??l("Your Mass","Votre messe"):l("Your Mass","Votre messe")):
       l("Before Mass","Avant la messe"),"");
    word("[data-folio-label-overview]","Overview","Vue d’ensemble");
    word("[data-folio-step-celebration]","Mass","Messe");
    if(m1Preview)word("[data-m1-other-summary]","Other Mass or Proper","Autre messe ou autre propre");
    word("[data-folio-step-ceremony]","Ceremony","Cérémonie");
    word("[data-folio-step-reader]","Reader","Lecture");
    word("[data-folio-overview-heading]","Ready to begin","Prêt à commencer");
    word("[data-folio-overview-hint]","Your usual selections are ready. Change only what is different today.",
      "Vos choix habituels sont prêts. Ne modifiez que ce qui change aujourd’hui.");
    word("[data-folio-overview-selections]",summary.kindLabel+" · "+summary.formLabel+" · "+summary.readerMode,
      summary.kindLabel+" · "+summary.formLabel+" · "+summary.readerMode);
    word("[data-folio-guide-start]","Review choices","Revoir les choix");
    word("[data-folio-celebration-heading]","Which Mass are you attending ?","Quelle messe allez-vous suivre ?");
    word("[data-folio-celebration-intro]","Today's Mass is already selected. Change it only when a different Mass is actually celebrated.",
      "La messe du jour est déjà sélectionnée. Changez-la seulement si une autre messe est célébrée.");
    word("[data-folio-ceremony-heading]","How is the Mass celebrated?","Comment la messe est-elle célébrée ?");
    word("[data-folio-reader-heading]","How would you like to follow?","Comment souhaitez-vous suivre ?");
    word("[data-folio-experience-heading]","Your Mass experience","Votre expérience de la messe");
    word("[data-folio-language-heading]","Language","Langue");
    word("[data-folio-before-heading]","Before Mass","Avant la messe");
    word("[data-folio-before-none]","Go directly to Mass","Aller directement à la messe");
    word("[data-folio-before-prepare]","Brief preparation prayers","Courtes prières de préparation");
    word("[data-folio-before-full]","Full preparation before Mass","Préparation complète avant la messe");
    word("[data-folio-after-heading]","After Mass","Après la messe");
    word("[data-folio-after-none]","Finish after Mass","Terminer après la messe");
    word("[data-folio-after-thanksgiving]","Thanksgiving after Mass","Action de grâces après la messe");
    word("[data-folio-after-full]","Full prayers after Mass","Prières complètes après la messe");
    word("[data-folio-open-prayer]","Open preparation prayers ↗","Ouvrir les prières de préparation ↗");
    if(m1Preview){
      // The host still owns its action buttons and click listeners.
      // Only their visible labels follow the Mass-language selection.
      const startAction=folio.querySelector("[data-folio-host-actions] [data-ao-start-live]");
      if(startAction){
        startAction.textContent=l("Start Mass →","Commencer la messe →");
        startAction.classList.add("aoTcmPrimary");
      }
      // Do not imply a Save as defaults control exists. Existing secondary
      // host actions remain under their original ownership.
    }
    word("[data-folio-back]","Back","Retour");
    word("[data-folio-next]",folioStep==="reader"?"Review Mass":"Continue",folioStep==="reader"?"Voir le résumé":"Continuer");
    folio.querySelector("[data-folio-language]").value=summary.readerLanguage;
    for(const item of folio.querySelectorAll("[data-folio-before]"))item.checked=item.value===summary.beforeMass;
    for(const item of folio.querySelectorAll("[data-folio-after]"))item.checked=item.value===summary.afterMass;
    folio.querySelector("[data-folio-open-prayer]").hidden=!mayOpenFolioPrayer("before",selectedExperience());
     if(m1Preview){
       root.dataset.m1Focus=m1Focus??"";
       root.dataset.m1Focused=String(Boolean(m1Focus));
       const rows=folio.querySelector("[data-m1-rows]");
       rows.hidden=Boolean(m1Focus);
       const exp=folio.querySelector(".aoMassFolioExperience");
       const optionalRites=availableOptionalMassRites(legacy,{form:summary.form,kind:summary.kind})
         .some(rite=>rite.allowed||rite.fromSource);
       if(!m1Focus)paintM1AccessRows(root,{
         ...summary,
         formLabel:txt(LABELS[summary.form],fr),
         kindLabel:txt(KIND_LABELS[summary.kind],fr),
       },{fr,optionalRites});
       const showExperience=["language","before","after","rites"].includes(m1Focus);
       exp.hidden=!showExperience;
       for(const option of exp.querySelectorAll("[data-m1-option]")){
         option.hidden=option.dataset.m1Option!==m1Focus;
       }
       word("[data-folio-label-overview]","Your Mass","Votre messe");
     }
    for(const section of folio.querySelectorAll("[data-folio-panel]"))section.hidden=section.dataset.folioPanel!==folioStep;
    for(const nav of folio.querySelectorAll("[data-folio-goto]")){
      const active=nav.dataset.folioGoto===folioStep;
      nav.setAttribute("aria-current",active?"step":"false");
    }
    folio.querySelector("[data-folio-back]").hidden=folioStep==="overview";
    folio.querySelector("[data-folio-next]").hidden=folioStep==="overview";


    fillMassCalendarPreflight(root.querySelector("[data-mass-calendar-context]"),context);
    const comparison=root.querySelector("[data-mass-calendar-actual-block]");
    if(comparison)comparison.hidden=!context.differs;
    // A real 1962 commemoration is an essential preparation datum, not
    // optional technical metadata. Reveal the context whenever one is
    // resolved, so the reader sees it before entering Mass.
    const commemoration=root.querySelector("[data-mass-calendar-commemoration]");
    const calendarDisclosure=root.querySelector("[data-folio-calendar-details]");
    if(commemoration?.hidden===false&&calendarDisclosure)calendarDisclosure.open=true;
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
    const localPreflight=getLocalOrationSummary?.()??null;
    const localReady=localPreflight?.ready!==false;
    if(m1Preview){
      const intro=folio.querySelector("[data-m1-introit]");
      const incipit=m1SelectedIntroit(legacy,{ready:summary.canStart&&sourceGate.ready&&localReady});
      intro.hidden=!incipit;
      intro.textContent=incipit?l("Introit · ","Introït · ")+incipit:"";
    }
    root.querySelector("[data-full-mass-resolver]").textContent=!localReady?
      l("Confirm the exact additional prayers before starting Mass.",
        "Confirmez les prières supplémentaires exactes avant de commencer la messe.") :
      !sourceGate.ready?
      l("Finish choosing the other Proper, or return to the Mass of the day, before starting.",
        "Terminez le choix de l’autre propre, ou revenez à la messe du jour, avant de commencer.") :
      summary.canStart?
      l("The Mass of the day, Requiem, votive or Nuptial Proper is chosen in the celebration selector above. Its actual texts, rank and permitted changes must be resolved before starting.",
        "Le propre du jour, du Requiem, de la messe votive ou nuptiale se choisit dans le sélecteur de célébration ci-dessus. Les textes, le rang et les adaptations autorisées doivent être résolus avant de commencer.") :
      l("Choose a permitted celebration with a complete Proper before starting. No text is substituted.",
        "Choisissez une célébration permise dont le propre est complet avant de commencer. Aucun texte n’est substitué.");
    root.querySelector("[data-full-mass-resolver]").hidden=Boolean(sourceGate.ready&&localReady&&summary.canStart);
    const essentialNote=root.querySelector("[data-full-mass-note]");
    essentialNote.hidden=summary.kind!=="GOOD_FRIDAY";
    essentialNote.textContent=
      summary.kind==="GOOD_FRIDAY"?
        l("Good Friday is a distinct liturgy, not Low or Sung Mass.","Le Vendredi saint possède un office distinct : ce n’est pas une messe basse ou chantée.") :
      l("This choice applies to this Mass only. Reader views (Missal and LIVE) are separate.",
        "Ce choix concerne uniquement cette messe. Les modes de lecture (Missel et LIVE) sont distincts.");
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
    const effectiveOwnerPath=allSoulsDay&&chosenAllSoulsMass>1
      ?"Sancti/11-02m"+chosenAllSoulsMass:ownerPath;
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
      [l("Source of Proper","Source du propre"),effectiveOwnerPath||l("Resolved by calendar","Résolu par le calendrier")],
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
    const localSummary=getLocalOrationSummary?.()??null;
    if(Array.isArray(proper?.collects)){
      const counts=context.commemorationOrations?.status==="NOT_APPLIED_TO_FORM"?
        context.commemorationOrations.counts:
        [proper.collects.length,proper.secrets?.length??0,proper.postcommunions?.length??0];
      if(counts?.[0]>0){
        const effective=counts.slice();
        if(localSummary?.confirmed){
          for(const id of localSummary.groups??[]){
            const index={collects:0,secrets:1,postcommunions:2}[id];
            if(Number.isInteger(index))effective[index]++;
          }
        }
        entries.push([l("Collects / Secrets / Postcommunions","Collectes / Secrètes / Postcommunions"),
          effective.join(" / ")]);
      }
    }
    if(localSummary?.groups?.length){
      const names={collects:l("Collect","Collecte"),secrets:l("Secret","Secrète"),
        postcommunions:l("Postcommunion","Postcommunion")};
      entries.push([l("Local additional prayers","Prières locales supplémentaires"),
        localSummary.groups.map(id=>names[id]??id).join(", ")+
        (localSummary.confirmed?l(" · confirmed for this Mass"," · confirmées pour cette messe"):
        l(" · confirmation required"," · confirmation nécessaire"))]);
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
    root.dataset.aoProperReady=String(summary.canStart&&sourceGate.ready&&localReady);
    suppressDonorDuplicates();
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
    setTodayChoice,
    composeRitesFor,
    openCategory,
    refresh,
    // Returning to the Mass tab resets presentation only. The source-owned
    // celebration, Proper, ceremony and reader preferences remain untouched.
    resetView(){
      folioStep="overview";
      m1Focus=null;
      root?.querySelector("[data-mass-calendar-details]")?.removeAttribute("open");
      refresh();
      return true;
    },
    status:()=>Object.freeze({visible:Boolean(root?.isConnected),explicitlyChosenForm:explicit,
      readerMode:activeReaderMode(),explicitlyChosenReaderMode:explicitMode,
      chosenForm:activeForm(),formChangeAllowed:(()=>{try{return selectionFor(getResolvedMass()).formChangeAllowed}catch{return false}})(),date:lastDate,kind:root?.dataset?.aoCelebrationKind??null,
      optionalRiteOverrides:Object.freeze({...riteOverrides}),experience:selectedExperience(),step:folioStep,
      m1Preview,m1Focus}),
    dispose(){disposed=true;try{unsubscribeCalendar?.()}catch{};doc.removeEventListener("change",onchange);doc.removeEventListener("click",onClick);observer?.disconnect();restoreDonor();{const actions=root?.querySelector?.(".aoFlowActions");if(actions)root.insertAdjacentElement("afterend",actions)}root?.remove();root=null;}
  });
}
