import "./traditional-pray-styles.js";
import {captureObservedModuleOrigin,returnToObservedModuleOrigin} from "../app/observed-module-return.js";
import {DYING_COMPANION_STAGES,nextDyingCompanionStage} from "./dying-companion-flow.js";
import {guidedDailyCards,NIGHTLY_EXAMEN_CARDS,clampPrayerCardStep,guidedStepLabel} from "./guided-daily-cards.js";
import {installSequentialDevotionalReader} from "./devotional-sequence-adapter.js";
import {dailyHorizonState} from "./quiet-devotional-progression.js";
import {createDailySessionTimer,sessionClockLabel} from "./daily-session-timer.js";
import {availableFormulations} from "./daily-formulation-engine.js";
import {createDailyFormulationPreferenceStore} from "./daily-formulation-preferences.js";
import {APPROVED_DAILY_FORMULATION_MANIFEST_V1,DAILY_APPROVED_SEQUENCE_RELEASE_V1} from "./daily-approved-formulations.js";
import {resolveDailyReaderSequence,approvedDailySlotOptions} from "./daily-source-sequence-adapter.js";
import "./quiet-devotional-progression-styles.js";
import {
  SACRED_HYMNS_V381,
  MORNING_PRAYER_SEQUENCE_V381,
  EVENING_PRAYER_SEQUENCE_V381,
  HOLY_NAME_LITANY_V381,
  SACRED_HEART_DEVOTIONS_V382,
  COMMUNION_TREASURY_V383,
  TRADITIONAL_PRAY_SOURCES_V381,
} from "./traditional-pray-data.js";
import {
  GOOD_DEATH_DYING_V384,
  GOOD_DEATH_DYING_SOURCES_V384,
} from "./good-death-data.js";
import {
  canonicalAssetIdForPrayRoute,
  getCanonicalAsset,
  resolveCanonicalAssetUrl,
} from "../assets/asset-registry.js";

const VERSION="38.4-good-death-dying-companion";
const ROUTES=Object.freeze({
  "pray.morning_evening":Object.freeze({id:"pray.morning_evening",type:"module",domain:"pray",category:"daily-prayer",title:"Morning & Evening Prayer"}),
  "pray.sacred_hymns":Object.freeze({id:"pray.sacred_hymns",type:"module",domain:"pray",category:"traditional-devotion",title:"Sacred Hymns & Canticles"}),
  "pray.holy_name_litany":Object.freeze({id:"pray.holy_name_litany",type:"module",domain:"pray",category:"traditional-devotion",title:"Litany of the Holy Name"}),
  "pray.nightly_examen":Object.freeze({id:"pray.nightly_examen",type:"module",domain:"pray",category:"daily-prayer",title:"Nightly Examination"}),
  "pray.meal_prayers":Object.freeze({id:"pray.meal_prayers",type:"module",domain:"pray",category:"daily-prayer",title:"Grace at Meals"}),
  "pray.sacred_heart":Object.freeze({id:"pray.sacred_heart",type:"module",domain:"pray",category:"sacred-heart",title:"Sacred Heart of Jesus"}),
  "pray.communion_treasury":Object.freeze({id:"pray.communion_treasury",type:"module",domain:"pray",category:"eucharistic",title:"Traditional Communion Prayers"}),
  "pray.good_death":Object.freeze({id:"pray.good_death",type:"module",domain:"pray",category:"traditional-devotion",title:"Preparation for a Good Death"}),
  "pray.dying_companion":Object.freeze({id:"pray.dying_companion",type:"module",domain:"pray",category:"pastoral-care",title:"Dying Companion"}),
  "mass.prepare":Object.freeze({id:"mass.prepare",type:"module",domain:"pray",category:"eucharistic",title:"Before Mass Prayers"}),
  "mass.thanksgiving":Object.freeze({id:"mass.thanksgiving",type:"module",domain:"pray",category:"eucharistic",title:"Thanksgiving After Mass"}),
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
// Subdivide source text without changing words, line breaks or language ownership.
const prayerParagraphs=v=>String(v??"").split(/\n\s*\n/).filter(x=>x.trim())
  .map(x=>'<p class="aoTP381TextParagraph">'+nl(x)+'</p>').join("");
const data=()=>globalThis.AO_PRAY_CANONICAL_DATA_V435930||{prayers:{}};
const isFr=()=>String(S?.route??"").startsWith("mass.")&&["en","fr"].includes(OPEN_OPTS?.language)
  ? OPEN_OPTS.language==="fr"
  : globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||String(document.documentElement.lang||"").toLowerCase().startsWith("fr");
const L=(en,fr)=>isFr()?(fr||en):en;
const mount=()=>document.querySelector("#aoPray435930 .aoP435930Mount");
const uiIcon=id=>{const url=resolveCanonicalAssetUrl(id);return url?`<span class="aoP435930UiIcon" data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`:"";};
const root=()=>document.getElementById("aoPray435930");

function assetMarkup(route){
  const assetId=canonicalAssetIdForPrayRoute(route);
  if(!assetId)return "";
  const asset=getCanonicalAsset(assetId);
  const symbol=document.getElementById(assetId);
  if(symbol){
    const vb=symbol.getAttribute("viewBox")||symbol.getAttribute("viewbox")||"0 0 128 128";
    return `<svg class="aoTP381ModuleGlyph" data-ao-asset-id="${esc(assetId)}" viewBox="${esc(vb)}" aria-hidden="true"><use href="#${esc(assetId)}"></use></svg>`;
  }
  const url=resolveCanonicalAssetUrl(assetId);
  if(url&&asset?.path)return `<span class="aoTP381ModuleGlyph mask" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
  return "";
}

function head(title,sub=""){
  return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-tp381-back aria-label="${esc(L("Back","Retour"))}">${uiIcon("ao-ui-back")}</button><div><small>${esc(L("PRAY","PRIER"))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:""}</div><button type="button" class="aoP435930Home" data-tp381-home aria-label="${esc(L("Home","Accueil"))}">${uiIcon("ao-nav-home")}</button></header>`;
}
function source(label,url){
  let href="";
  try{
    const parsed=new URL(String(url||""));
    if(parsed.protocol==="https:")href=parsed.href;
  }catch{}
  return `<details class="aoTP381Source"><summary>${esc(L("Source","Source"))} · ${esc(label)}</summary><p>${href
    ?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(L("Open source","Ouvrir la source"))} ↗</a>`
    :`<small class="aoTP381SourceHold">${esc(L("A direct source link has not yet been verified.","Aucun lien direct vers la source n’est encore vérifié."))}</small>`}</p></details>`;
}
function status(text){
  return `<span class="aoTP381Status">${esc(text)}</span>`;
}
function prayerTitle(p,id){
  if(!p)return id;
  return isFr()?(p.titleFr||p.title||id):(p.title||id);
}
function prayerCard(id,{focusParagraphs=false}={}){
  const p=data().prayers?.[id];
  if(!p)return `<div class="aoTP381Fail">${esc(L("This canonical prayer is unavailable in the current corpus.","Cette prière canonique n’est pas disponible dans le corpus actuel."))}</div>`;
  const vern=isFr()?(p.fr||p.en||p.la):(p.en||p.fr||p.la),latin=p.la||"",both=!!(vern&&latin);
  const prov=p.provenance||{};
  return `<article class="aoTP381PrayerCard"><h3>${esc(prayerTitle(p,id))}</h3>${both?`<button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${focusParagraphs?prayerParagraphs(vern):nl(vern)}</span><span data-face-la hidden>${focusParagraphs?prayerParagraphs(latin):nl(latin)}</span></button>`:`<div class="aoTP381Reader">${nl(vern||latin)}</div>`}${source(prov.work||p.title||id,prov.url||p.sourceUrl)}</article>`;
}
function prayerRows(rows){
  return `<div class="aoTP381PrayerList">${rows.map(([id,title,note])=>`<button type="button" ${id.includes(".")?`data-tp381-route="${esc(id)}"`:`data-tp381-prayer="${esc(id)}"`}><span><b>${esc(title)}</b><small>${esc(note)}</small></span><i aria-hidden="true">→</i></button>`).join("")}</div>`;
}

let BASE_OPEN=null,BASE_CLOSE=null,OPEN_OPTS={},OPEN_RECEIPT=null,MASS_HANDOFF_BUSY=false;
let S={dailyTimerOpen:false,dailyLength:"standard",litanyMode:"full",litanyStep:0,mealStep:0,route:"pray.morning_evening",screen:"module",daypart:"morning",hymn:"te_deum",hymnLang:null,prayerId:null,sacredHeart:"litany",communion:"before",communionStep:0,goodDeathStep:0,dying:"now",dailyMode:"guided",dailyStep:0,examenStep:0,returnToDaily:false,massStep:0,massDepth:"brief"};



const DAILY_APPROVED_FORMS=APPROVED_DAILY_FORMULATION_MANIFEST_V1;
let DAILY_FORM_PREFERENCES=null;
function dailyFormPreferenceStore(){
 if(DAILY_FORM_PREFERENCES)return DAILY_FORM_PREFERENCES;
 let storage=null;
 try{storage=globalThis.localStorage||null}catch{}
 DAILY_FORM_PREFERENCES=createDailyFormulationPreferenceStore({storage});
 return DAILY_FORM_PREFERENCES;
}
function dailyReleasedFormOptions(prayerId,daypart,language){
 if(DAILY_SEQUENCE_RELEASE.enabled!==true)return [];
 if(!DAILY_APPROVED_FORMS.profiles?.[[language,daypart,"complete"].join(":")])
   return [];
 try{
   return availableFormulations(DAILY_APPROVED_FORMS,{
     language,daypart,length:"complete",stepId:prayerId
   });
 }catch{return []}
}
function dailyFormulationPrayerCard(prayerId){
 const lang=isFr()?"fr":"en";
 const options=dailyReleasedFormOptions(prayerId,S.daypart,lang);
 if(!options.length)return prayerCard(prayerId,{focusParagraphs:true});
 const profile={language:lang,daypart:S.daypart,length:"complete"};
 const saved=dailyFormPreferenceStore().load(DAILY_APPROVED_FORMS,profile);
 const active=options.find(x=>x.id===saved[prayerId]);
 const choiceButtons=[
   `<button type="button" data-tp381-daily-form="${esc(prayerId)}::" aria-pressed="${!active}">${esc(L("Standard","Habituel"))}</button>`,
   ...options.map(x=>`<button type="button" data-tp381-daily-form="${esc(prayerId)}::${esc(x.id)}" aria-pressed="${active?.id===x.id}">${esc(x.title)}</button>`)
 ].join("");
 const chooser=`<nav class="aoDailyFormulationChoices" role="group" aria-label="${esc(L("Prayer formulation","Formulation de la prière"))}">${choiceButtons}</nav>`;
 if(!active)return chooser+prayerCard(prayerId,{focusParagraphs:true});
 const w=DAILY_APPROVED_FORMS.witnesses[active.id];
 // availableFormulations above already rejects every unapproved, missing
 // source, cross-language or partial body. This is the single rendering gate.
 return chooser+`<article class="aoTP381PrayerCard" data-ao-daily-formulation="${esc(active.id)}">
 <h3>${esc(w.displayTitle||w.sourceLabel)}</h3>
 <div class="aoTP381Reader">${prayerParagraphs(w.text)}</div>
 ${source(w.sourceLabel,w.sourceUrl)}</article>`;
}


const DAILY_SEQUENCE_RELEASE=DAILY_APPROVED_SEQUENCE_RELEASE_V1;

function releasedDailySequenceFor(length){
 const baseline=guidedDailyCards(S.daypart),language=isFr()?"fr":"en";
 if(length==="standard")return {mode:"canonical",rows:baseline,length};
 const profile={language,daypart:S.daypart,length};
 // Even when a profile is explicitly enabled, the active user selections
 // are revalidated against the full cleared source manifest on every read.
 const selection=DAILY_SEQUENCE_RELEASE.enabled===true
   ?dailyFormPreferenceStore().load(DAILY_APPROVED_FORMS,profile):{};
 return resolveDailyReaderSequence({
   manifest:DAILY_APPROVED_FORMS,release:DAILY_SEQUENCE_RELEASE,
   canonicalRows:baseline,...profile,selection
 });
}
function dailyReadingPlan(){return releasedDailySequenceFor(S.dailyLength)}
function dailyLengthOptions(){
 if(DAILY_SEQUENCE_RELEASE.enabled!==true)return [];
 return ["short","complete"].filter(x=>releasedDailySequenceFor(x).mode==="approved");
}
function dailyLengthControls(){
 const available=dailyLengthOptions();
 if(!available.length)return "";
 const entries=["standard",...available].map(length=>{
   const label=length==="standard"?L("Standard","Habituel"):length==="short"?L("Short","Court"):L("Complete","Complet");
   return `<button type="button" data-tp381-daily-length="${length}" aria-pressed="${S.dailyLength===length}">${esc(label)}</button>`;
 }).join("");
 return `<nav class="aoDailyLengthChoices" role="group" aria-label="${esc(L("Daily prayer routine","Règle de prière quotidienne"))}">${entries}</nav>`;
}
function dailyApprovedPrayerCard(row){
 const language=isFr()?"fr":"en",length=S.dailyLength,daypart=S.daypart;
 const options=approvedDailySlotOptions(DAILY_APPROVED_FORMS,DAILY_SEQUENCE_RELEASE,{
   language,daypart,length,slotId:row.slotId
 });
 const choices=options.length>1
  ?`<nav class="aoDailyFormulationChoices" role="group" aria-label="${esc(L("Prayer formulation","Formulation de la prière"))}">${options.map(item=>`<button type="button" data-tp381-approved-daily-form="${esc(row.slotId)}::${esc(item.id)}" aria-pressed="${item.id===row.witnessId}">${esc(item.title)}</button>`).join("")}</nav>`
  :"";
 return `${choices}<article class="aoTP381PrayerCard" data-ao-daily-formulation="${esc(row.witnessId)}">
 <h3>${esc(row.title)}</h3><div class="aoTP381Reader">${prayerParagraphs(row.text)}</div>
 ${source(row.sourceLabel,row.sourceUrl)}</article>`;
}
function dailyApprovedSequenceList(rows){
 return `<div class="aoTP381PrayerList">${rows.map((item,index)=>
  `<button type="button" data-tp381-daily-card-index="${index}"><span><b>${esc(item.title||item.id)}</b><small>${esc(item.kind==="approved-source-prayer"?item.sourceLabel||"":L("Reflection","Méditation"))}</small></span><i aria-hidden="true">→</i></button>`
 ).join("")}</div>`;
}

const DAILY_SESSION_CLOCK=createDailySessionTimer();
let DAILY_TIMER_TICK=null;
function stopDailyTimerTick(){
 if(DAILY_TIMER_TICK!==null){clearInterval(DAILY_TIMER_TICK);DAILY_TIMER_TICK=null;}
}
function syncDailyTimerView(){
 const m=mount();if(!m||S.route!=="pray.morning_evening")return;
 const tick=DAILY_SESSION_CLOCK.snapshot();
 const value=sessionClockLabel(tick.elapsedMs);
 const readout=m.querySelector("[data-ao-daily-clock-readout]");
 if(readout)readout.textContent=value;
 const summary=m.querySelector("[data-ao-daily-clock-summary]");
 if(summary)summary.textContent=L("Timer","Minuteur")+(tick.running?" · "+value:"");
 const action=m.querySelector("[data-tp381-timer-control='toggle']");
 if(action){
   action.textContent=tick.running?L("Pause","Pause"):tick.elapsedMs>0?L("Resume","Reprendre"):L("Start","Démarrer");
   action.setAttribute("aria-pressed",String(tick.running));
 }
 const reached=m.querySelector("[data-ao-daily-clock-target-reached]");
 if(reached){reached.hidden=!tick.atTarget;reached.textContent=L("Gentle target reached · continue praying at your pace.","Durée indicative atteinte · poursuivez à votre rythme.");}
 for(const b of m.querySelectorAll("[data-tp381-timer-target]")){
  const value=b.dataset.tp381TimerTarget;
  b.setAttribute("aria-pressed",String(value===(tick.targetMs===null?"none":String(tick.targetMs/60000))));
 }
}
function startDailyTimerTick(){
 stopDailyTimerTick();
 if(!DAILY_SESSION_CLOCK.snapshot().running)return;
 DAILY_TIMER_TICK=setInterval(()=>{
   if(!root()?.classList.contains("open")||!["pray.morning_evening","pray.nightly_examen"].includes(S.route)){
     DAILY_SESSION_CLOCK.pause();stopDailyTimerTick();return;
   }
   syncDailyTimerView();
 },1000);
}
function resetDailySessionTimer(){
 stopDailyTimerTick();DAILY_SESSION_CLOCK.reset();S.dailyTimerOpen=false;
}
function dailyTimerControls(){
 const tick=DAILY_SESSION_CLOCK.snapshot();
 const trigger=`<button type="button" class="aoDailyClockDisclosure" data-tp381-timer-toggle aria-expanded="${S.dailyTimerOpen}" data-ao-daily-clock-summary>${esc(L("Timer","Minuteur")+(tick.running?" · "+sessionClockLabel(tick.elapsedMs):""))}</button>`;
 if(!S.dailyTimerOpen)return `<div class="aoDailyClockShell">${trigger}</div>`;
 const targets=[null,5,10,15,20].map(target=>{
   const value=target===null?"none":String(target),label=target===null?L("No target","Sans limite"):target+" min";
   return `<button type="button" data-tp381-timer-target="${value}" aria-pressed="${target===tick.targetMs/60000||(target===null&&tick.targetMs===null)}">${esc(label)}</button>`;
 }).join("");
 return `<div class="aoDailyClockShell">${trigger}<section class="aoDailyClockPanel" aria-label="${esc(L("Optional prayer session timer","Minuteur facultatif de prière"))}">
 <output data-ao-daily-clock-readout aria-live="off">${sessionClockLabel(tick.elapsedMs)}</output>
 <div class="aoDailyClockActions"><button type="button" data-tp381-timer-control="toggle" aria-pressed="${tick.running}">${esc(tick.running?L("Pause","Pause"):tick.elapsedMs>0?L("Resume","Reprendre"):L("Start","Démarrer"))}</button><button type="button" data-tp381-timer-control="reset">${esc(L("Reset","Remettre à zéro"))}</button></div>
 <div class="aoDailyClockTargets" aria-label="${esc(L("Gentle time target","Durée indicative"))}">${targets}</div>
 <p data-ao-daily-clock-target-reached ${tick.atTarget?"":"hidden"}>${esc(L("Gentle target reached · continue praying at your pace.","Durée indicative atteinte · poursuivez à votre rythme."))}</p>
 <small>${esc(L("Time is only a guide. You move between prayers yourself; nothing is recorded.","Le temps n’est qu’un repère. Vous avancez vous-même ; rien n’est enregistré."))}</small>
 </section></div>`;
}

function guidedCardFrame({id,title,step,total,body,onStep="daily",complete=false,returnButton=""}){
 const label=guidedStepLabel(step,total,isFr()?"fr":"en");
 const finished=step===total;
 const controls=finished
   ? `<div class="aoTP381GuideNav"><button type="button" data-tp381-${onStep}-step="0">${esc(L("Start again","Recommencer"))}</button>${returnButton||`<button type="button" data-tp381-${onStep}-overview>${esc(L("See all prayers","Voir toutes les prières"))}</button>`}</div>`
   : `<nav class="aoTP381GuideNav" aria-label="${esc(L("Prayer steps","Étapes de prière"))}"><button type="button" data-tp381-${onStep}-step="${step-1}" ${step===0?'disabled':''}>${esc(L("Previous","Précédent"))}</button><button type="button" data-tp381-${onStep}-step="${step+1}">${esc(step===total-1?L("Finish","Terminer"):L("Next","Suivant"))}</button></nav>`;
 const titleMarkup=finished?L("Prayer completed","Prière terminée"):title;
 const copy=finished?L("You have reached the end of this prayer sequence. You may begin again or return to the overview.","Vous avez terminé cette suite de prières. Vous pouvez recommencer ou revenir à la liste."):body;
 return `<section class="aoTP381GuideCard" data-ao-pray-guide-card="${esc(id)}" data-guide-step="${step}" aria-label="${esc(label)}"><small class="aoTP381GuideCount">${esc(label)}</small><h2 tabindex="-1" data-ao-guided-focus>${esc(titleMarkup)}</h2>${copy}${controls}</section>`;
}
function renderDailyGuided(rows){
 const total=rows.length,step=clampPrayerCardStep(S.dailyStep,total);
 const row=rows[step];
 const body=step===total?"":row.kind==="examination"
   ?`<p>${esc(L("Review the day before God: your duties towards Him, your neighbour, and yourself. This is a brief daily examen, not sacramental Confession.","Revoyez la journée devant Dieu : vos devoirs envers Lui, le prochain et vous-même. Il s’agit d’un bref examen quotidien, non d’une Confession sacramentelle."))}</p><button type="button" class="aoTP381GuideSubroute" data-tp381-daily-examen>${esc(L("Open guided nightly examination","Ouvrir l’examen du soir guidé"))}</button>`
   :row.kind==="approved-source-prayer"?dailyApprovedPrayerCard(row)
   :row.kind==="silence"?`<p class="aoTP381TextParagraph">${esc(row.cue||L("Pause in silence.","Recueillez-vous en silence."))}</p>`
   :dailyFormulationPrayerCard(row.id);
 const id=step===total?"daily-finished":row.id;
 const content=guidedCardFrame({id,title:step===total?"":(row.kind==="examination"?row.title||L("Nightly Examination","Examen du soir"):row.kind==="silence"?row.title:row.kind==="approved-source-prayer"?row.title:prayerTitle(data().prayers?.[row.id],row.id)),
   step,total,body,onStep:"daily"});
 return `<section class="aoDevoCard" data-ao-devo-card="${esc(id)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(L("Daily prayer card","Carte de prière quotidienne"))}">${content}</div></section>`;
}
let lastDailyHorizonScene=null;
function dailyHorizonMarkup(total){
 const mood=dailyHorizonState(S.daypart,S.dailyStep,total);
 const signature=mood.daypart+":"+mood.phase;
 const changed=signature!==lastDailyHorizonScene;
 lastDailyHorizonScene=signature;
 const description=L(mood.en,mood.fr);
 const variables=`--ao-sky-top:${mood.top};--ao-sky-mid:${mood.mid};--ao-sky-low:${mood.low};--ao-sky-light:${mood.light}`;
 return `<figure class="aoQuietHorizon" data-ao-quiet-daily-horizon="${mood.daypart}"
  data-ao-horizon-phase="${mood.phase}" data-ao-horizon-position="${mood.step}"
  data-ao-horizon-total="${mood.total}" style="${variables}">
  <div class="aoQuietHorizonCanvas ${changed?'is-changing':''}" role="img"
    aria-label="${esc(L('Atmosphere: ','Atmosphère : ')+description)}"></div>
  <figcaption class="aoQuietHorizonMeta"><span>${esc(description)}</span>
   <div class="aoQuietHorizonTrace" aria-hidden="true">
    <span style="width:${(mood.fraction*100).toFixed(2)}%"></span>
   </div>
  </figcaption></figure>`;
}
function renderMorningEvening(){
 const plan=dailyReadingPlan(),rows=plan.rows;
 const intro=L("A traditional daily rule of prayer built from sourced Catholic forms. Foundational prayers may recur later in the Rosary or another devotion; that repetition belongs to the devotion and is not an error to be optimized away.","Une règle quotidienne traditionnelle bâtie à partir de formes catholiques sourcées. Les prières fondamentales peuvent revenir ensuite dans le Rosaire ou une autre dévotion ; cette répétition appartient à la dévotion et n’est pas une erreur à supprimer.");
 const guided=S.dailyMode==="guided";
 const choice=`<nav class="aoTP381DaypartStrip" aria-label="${esc(L("Time of prayer","Moment de prière"))}"><button type="button" data-tp381-daypart="morning" aria-pressed="${S.daypart==="morning"}" class="${S.daypart==="morning"?"active":""}">${esc(L("Morning","Matin"))}</button><button type="button" data-tp381-daypart="evening" aria-pressed="${S.daypart==="evening"}" class="${S.daypart==="evening"?"active":""}">${esc(L("Evening","Soir"))}</button></nav>`;
 const options=`<details class="aoTP381SecondaryOptions" data-ao-daily-options><summary>${esc(L("Reading options and guidance","Options de lecture et guide"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(intro)}</p><div class="aoTP381GuideMode" role="group" aria-label="${esc(L("Prayer view","Présentation des prières"))}"><button type="button" data-tp381-daily-mode="guided" aria-pressed="${guided}">${esc(L("Guided","Guidé"))}</button><button type="button" data-tp381-daily-mode="list" aria-pressed="${!guided}">${esc(L("All prayers","Toutes les prières"))}</button></div></div></details>`;
 return `${head(L("Morning & Evening Prayer","Prières du matin & du soir"))}<main class="aoP435930Body aoTP381DonorBody">${choice}${guided?dailyHorizonMarkup(rows.length):""}${guided?renderDailyGuided(rows):plan.mode==="approved"?dailyApprovedSequenceList(rows):prayerRows(rows.map(x=>[x.id,x.title,x.note]))}${dailyLengthControls()}${dailyTimerControls()}${options}${source("Baltimore Manual · Morning Prayers",TRADITIONAL_PRAY_SOURCES_V381.morning)}${source("Baltimore Manual · Evening Prayers",TRADITIONAL_PRAY_SOURCES_V381.evening)}</main>`;
}
const HYMN_KEYS=Object.freeze(["te_deum","veni_creator","ave_maris_stella"]);
function hymnLineMarkup(value){
  // Preserve original stanza breaks and verse lines. Do not infer a matching
  // Latin/French line where source-edition lineation differs.
  return String(value??"").split(/\n\s*\n/).filter(Boolean)
    .map(stanza=>`<div class="aoTP381HymnStanza">${stanza.split("\n").filter(x=>x.trim()).map(line=>`<p class="aoTP381TextParagraph">${esc(line)}</p>`).join("")}</div>`).join("");
}
function renderHymns(){
  const key=HYMN_KEYS.includes(S.hymn)?S.hymn:"te_deum",h=SACRED_HYMNS_V381[key];
  const lang=["en","fr","la"].includes(S.hymnLang)?S.hymnLang:(isFr()?"fr":"en");
  if(!h[lang]||!h.la)throw new Error("Sacred hymn language missing: "+key+" · "+lang);
  const frenchSources={
    te_deum:["Divinum Officium · French Ordo witness",TRADITIONAL_PRAY_SOURCES_V381.teDeumFrench],
    veni_creator:["Comtesse de Ségur · Livre de messe des petits enfants · 1858",TRADITIONAL_PRAY_SOURCES_V381.veniCreatorFrench],
    ave_maris_stella:["Pierre Corneille · Office de la sainte Vierge · historical French witness",TRADITIONAL_PRAY_SOURCES_V381.aveMarisFrench],
  };
  const frSource=frenchSources[key];
  // Hymns remain their original source witnesses. Latin replaces the selected
  // vernacular face on tap, except when Latin was explicitly selected.
  const text=lang==="la"?`<div class="aoTP381Reader">${hymnLineMarkup(h.la)}</div>`:
    `<button type="button" data-tp381-flip aria-label="${esc(L("Switch hymn language","Changer la langue de l’hymne"))}"><span data-face-v>${hymnLineMarkup(h[lang])}</span><span data-face-la hidden>${hymnLineMarkup(h.la)}</span></button>`;
  const card=`<section class="aoDevoCard" data-ao-devo-card="hymn-${esc(key)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(h.title)}"><article class="aoTP381PrayerCard"><h3>${esc(h.title)}</h3><p class="aoTP381HymnSubtitle">${esc(L(h.subtitle,h.subtitleFr))}</p>${text}</article></div></section>`;
  const options=`<details class="aoTP381SecondaryOptions" data-ao-hymn-options><summary>${esc(L("Language and historical sources","Langue et sources historiques"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("A deliberately small traditional collection with identified sources. Latin, English and French witnesses are identified rather than silently substituted.","Une collection traditionnelle volontairement réduite, avec ses sources clairement identifiées. Les témoins latin, anglais et français sont identifiés plutôt que remplacés silencieusement."))}</p><div class="aoTP381Lang" role="group" aria-label="${esc(L("Text language","Langue du texte"))}"><button type="button" data-tp381-hymn-lang="en" aria-pressed="${lang==="en"}" class="${lang==="en"?"active":""}">${esc(L("English","Anglais"))}</button><button type="button" data-tp381-hymn-lang="fr" aria-pressed="${lang==="fr"}" class="${lang==="fr"?"active":""}">Français</button><button type="button" data-tp381-hymn-lang="la" aria-pressed="${lang==="la"}" class="${lang==="la"?"active":""}">Latin</button></div>${source("The Daily Prayer-Book · Burns & Oates · 1882",TRADITIONAL_PRAY_SOURCES_V381.dailybook)}${source(frSource[0],frSource[1])}</div></details>`;
  return `${head(L("Sacred Hymns & Canticles","Hymnes & cantiques sacrés"))}<main class="aoP435930Body aoTP381DonorBody">${card}${options}</main>`;
}
function traditionalContextGuide(kind){
 const info={
  holyName:[
   L("The Litany of the Holy Name is a sequence of invocations and responses. The historical Roman Latin form and the French text are separately sourced below.","Les Litanies du Saint Nom sont une succession d’invocations et de répons. La forme latine romaine historique et le texte français disposent de sources distinctes ci-dessous."),
   L("For common recitation one voice may lead the invocations and the others respond. In a public service, follow the local liturgical leader and posture; do not impose a private sequence.","Pour une récitation commune, une voix peut conduire les invocations et les autres répondre. Pendant un office public, suivez le ministre et la posture locale ; n’imposez pas de séquence privée.")
  ],
  heart:[
   L("The Litany, Act of Reparation and Consecration are different forms of devotion. Their historical editions and any later wording are identified in the source notes for each text.","Les Litanies, l’Acte de réparation et la consécration sont des formes de dévotion distinctes. Leurs éditions historiques et les éventuelles formulations ultérieures sont précisées par les sources de chaque texte."),
   L("Select one text according to the devotion being made. There is no requirement to complete all three as successive stages.","Choisissez le texte correspondant à la dévotion pratiquée. Il n’est pas nécessaire de parcourir les trois comme des étapes successives.")
  ],
  communion:[
   L("The treasury separates traditional preparation before Communion from thanksgiving afterwards, preserving the distinct sourced prayers rather than combining them into a new rite.","Ce trésor distingue les prières traditionnelles de préparation avant la Communion et d’action de grâces après, sans les assembler en un rite nouveau."),
   L("Choose one or more appropriate private prayers. At Mass, follow the actual celebration; none of these texts constitutes a compulsory Communion checklist.","Choisissez une ou plusieurs prières privées appropriées. À la Messe, suivez la célébration réelle ; ces textes ne constituent pas une liste obligatoire pour communier.")
  ],
  goodDeath:[
   L("These devotional prayers belong to habitual Christian preparation for death. The traditional invocations and their witnesses are linked below.","Ces prières de dévotion relèvent de la préparation habituelle du chrétien à la mort. Les invocations traditionnelles et leurs témoins sont indiqués ci-dessous."),
   L("Use them in ordinary prayer rather than as an urgent bedside sequence. If a person may be dying now, use the Dying Companion and seek a priest promptly.","Utilisez-les dans la prière ordinaire plutôt que comme parcours urgent au chevet. Si une personne est peut-être mourante, ouvrez l’accompagnement du mourant et contactez rapidement un prêtre.")
  ]
 }[kind];
 if(!info)return "";
 return `<details class="aoP435930GuideInfo" data-ao-traditional-pray-guide="${esc(kind)}"><summary>${esc(L("Guide · context and practice","Guide · contexte et pratique"))}</summary><div><p>${esc(info[0])}</p><p>${esc(info[1])}</p></div></details>`;
}
const HOLY_NAME_SECTION_LABELS=Object.freeze([["Opening invocations","Invocations initiales"],["The Holy Trinity","La Sainte Trinité"],["Names and attributes of Jesus","Noms et titres de Jésus"],["Deliver us, O Jesus","Délivrez-nous, ô Jésus"],["Lamb of God","Agneau de Dieu"],["Versicles and responses","Versets et réponses"],["Concluding prayer","Oraison finale"]]);
function holyNameSections(value){return String(value||"").trim().split(/\n\s*\n/).map(part=>part.trim()).filter(Boolean)}
function litanyVerseMarkup(raw){
  return String(raw||"").split(/\n/).map(line=>
    `<p class="aoTP381LitanyLine">${line.trim()?esc(line):"&#160;"}</p>`).join("");
}
function renderHolyName(){
  const vern=isFr()?HOLY_NAME_LITANY_V381.fr:HOLY_NAME_LITANY_V381.en,latin=HOLY_NAME_LITANY_V381.la;
  const enParts=holyNameSections(HOLY_NAME_LITANY_V381.en),frParts=holyNameSections(HOLY_NAME_LITANY_V381.fr),laParts=holyNameSections(latin);
  const aligned=enParts.length===7&&frParts.length===7&&laParts.length===7;
  const guided=aligned&&S.litanyMode==="guided",step=Math.max(0,Math.min(6,Number(S.litanyStep)||0));
  const current=guided?(isFr()?frParts[step]:enParts[step]):vern,currentLatin=guided?laParts[step]:latin;
  const title=guided?L(...HOLY_NAME_SECTION_LABELS[step]):L(HOLY_NAME_LITANY_V381.title,HOLY_NAME_LITANY_V381.titleFr);
  const text=`<article class="aoTP381PrayerCard"><h3>${esc(title)}</h3><button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${guided?litanyVerseMarkup(current):nl(current)}</span><span data-face-la hidden>${guided?litanyVerseMarkup(currentLatin):nl(currentLatin)}</span></button></article>`;
  const card=guided?`<section class="aoDevoCard" data-ao-devo-card="holy-name-${step+1}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(title)}">${text}</div></section>`:text;
  const mode=aligned?`<div class="aoTP381GuideMode" role="group" aria-label="${esc(L("Litany view","Présentation des litanies"))}"><button type="button" data-tp381-litany-mode="full" aria-pressed="${!guided}">${esc(L("Full text","Texte intégral"))}</button><button type="button" data-tp381-litany-mode="guided" aria-pressed="${guided}">${esc(L("Guided","Guidé"))}</button></div>`:"";
  const guidance=`<details class="aoTP381SecondaryOptions" data-ao-holy-name-options><summary>${esc(L("Reading options and guide","Options de lecture et guide"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("Historical approved Roman form, stored locally for complete offline prayer. Tap the text to replace the vernacular with Latin.","Forme romaine historique, avec témoins latin et français. Touchez la prière pour remplacer le français par le latin."))}</p>${mode}${traditionalContextGuide("holyName")}</div></details>`;
  return `${head(L("Litany of the Holy Name of Jesus","Litanies du Saint Nom de Jésus"))}<main class="aoP435930Body aoTP381DonorBody">${card}${guidance}${source("Rituale Romanum · 1925",HOLY_NAME_LITANY_V381.sources.latin)}${source("French traditional witness · Litanies du Saint Nom de Jésus",HOLY_NAME_LITANY_V381.sources.french)}</main>`;
}
function renderNightlyExamen(){
 const steps=NIGHTLY_EXAMEN_CARDS,step=clampPrayerCardStep(S.examenStep,steps.length),item=steps[step];
 const focus=step===steps.length?"":`<p>${esc(isFr()?item.bodyFr:item.bodyEn)}</p>`;
 const prayer=(item?.id==="resolve"&&!S.returnToDaily)?prayerCard("sacrament_act_of_contrition",{focusParagraphs:true}):"";
 const after=step===steps.length
  ?S.returnToDaily
    ?`<button type="button" data-tp381-examen-return>${esc(L("Continue Evening Prayer","Poursuivre les prières du soir"))}</button>`
    :`<button type="button" data-tp381-examen-step="0">${esc(L("Review again","Recommencer l’examen"))}</button>`
  :"";
 const card=guidedCardFrame({id:item?.id||"examen-finished",title:item?isFr()?item.titleFr:item.titleEn:"",
  step,total:steps.length,body:focus+prayer,onStep:"examen",returnButton:after});
 return `${head(L("Nightly Examination","Examen du soir"))}<main class="aoP435930Body aoTP381DonorBody"><section class="aoDevoCard" data-ao-devo-card="${esc(item?.id||"examen-finished")}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(L("Examination of conscience","Examen de conscience"))}">${card}</div></section><details class="aoTP381SecondaryOptions" data-ao-examen-options><summary>${esc(L("About this examination","À propos de cet examen"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("Review the day before God in silence. This brief examen does not replace preparation for sacramental Confession; no answers are collected.","Examinez votre journée devant Dieu, dans le silence. Cet examen bref ne remplace pas la préparation à la Confession sacramentelle ; aucune réponse n’est recueillie."))}</p></div></details><div class="aoTP381PrayerList"><button type="button" data-tp381-route="pray.confession"><span><b>${esc(L("Preparing for sacramental Confession?","Vous préparez-vous à la Confession sacramentelle ?"))}</b><small>${esc(L("Open the full Confession examination","Ouvrir l’examen complet de Confession"))}</small></span><i aria-hidden="true">→</i></button></div></main>`;
}
function renderMealPrayers(){
  const before=S.mealStep!==1;
  const id=before?"foundations_grace_before_meals":"foundations_grace_after_meals";
  const title=before?L("Before meals","Avant le repas"):L("After meals","Après le repas");
  const card=`<section class="aoDevoCard" data-ao-devo-card="${before?"meal-before":"meal-after"}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(title)}">${prayerCard(id,{focusParagraphs:true})}</div></section>`;
  const context=`<details class="aoTP381SecondaryOptions" data-ao-meal-options><summary>${esc(L("About these prayers","À propos de ces prières"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("These are the ordinary table prayers from the canonical Catholic prayer corpus.","Il s’agit des prières ordinaires des repas issues du corpus canonique de prières catholiques."))}</p></div></details>`;
  return `${head(L("Grace at Meals","Prières des repas"))}<main class="aoP435930Body aoTP381DonorBody">${card}${context}</main>`;
}
function sourcedPrayerCard(item,label,{focusParagraphs=false,verseFocus=false}={}){
  const vern=isFr()?(item?.fr||item?.en||item?.la):(item?.en||item?.fr||item?.la),latin=item?.la||"",both=!!(vern&&latin);
  const show=v=>verseFocus?String(v??"").split(/\n/).filter(t=>t.trim()).map(t=>'<p class="aoTP381TextParagraph">'+esc(t)+'</p>').join(""):focusParagraphs?prayerParagraphs(v):nl(v);
  return `<article class="aoTP381PrayerCard"><h3>${esc(label)}</h3>${both?`<button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${show(vern)}</span><span data-face-la hidden>${show(latin)}</span></button>`:`<div class="aoTP381Reader">${show(vern||latin)}</div>`}</article>`;
}
const HEART_STAGES=Object.freeze(["litany","reparation","consecration"]);
function heartTitle(id){return id==="litany"?L("Litany","Litanies"):id==="reparation"?L("Reparation","Réparation"):L("Consecration","Consécration")}
function renderSacredHeart(){
  const d=SACRED_HEART_DEVOTIONS_V382,tab=HEART_STAGES.includes(S.sacredHeart)?S.sacredHeart:"litany";
  let prayer="",notes="";
  if(tab==="reparation"){
    prayer=prayerCard("sacred_heart_short_prayer",{focusParagraphs:true});
    notes=source("Pius XI · Miserentissimus Redemptor · 1928","https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19280508_miserentissimus-redemptor.html");
  }else if(tab==="consecration"){
    const c=d.humanRaceConsecration;
    prayer=sourcedPrayerCard(c,L(c.title,c.titleFr),{focusParagraphs:true});
    notes=`<p class="aoTP381Intro">${esc(L("This is the traditional form associated with Christ the King in the pontificate of Pius XI. The current Enchiridion prints an abbreviated form; the historical form is given here.","Il s’agit de la forme traditionnelle associée au Christ-Roi sous Pie XI. L’Enchiridion actuel donne une forme abrégée ; le texte historique figure ici."))}</p>${source("Acta Apostolicae Sedis · 1927 · Latin",c.sources.latin)}${source("La Porte Latine · traditional French form",c.sources.french)}`;
  }else{
    const l=d.litany;
    prayer=sourcedPrayerCard(l,L(l.title,l.titleFr),{verseFocus:true});
    notes=source("La Porte Latine · French & Latin traditional form",l.sources.frenchLatin);
  }
  const card=`<section class="aoDevoCard" data-ao-devo-card="heart-${esc(tab)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(heartTitle(tab))}">${prayer}</div></section>`;
  const options=`<details class="aoTP381SecondaryOptions" data-ao-heart-options><summary>${esc(L("Sources and reading options","Sources et options de lecture"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("Pray the Litany, the Act of Reparation, or the consecration according to the time available. Their historical forms are identified in the source notes.","Récitez les Litanies, l’Acte de réparation ou la consécration selon le temps disponible. Leurs formes historiques sont identifiées dans les sources."))}</p>${traditionalContextGuide("heart")}<div class="aoTP381Tabs">${`<button type="button" data-tp381-heart="litany" class="${tab==="litany"?"active":""}">${esc(heartTitle("litany"))}</button><button type="button" data-tp381-heart="reparation" class="${tab==="reparation"?"active":""}">${esc(heartTitle("reparation"))}</button><button type="button" data-tp381-heart="consecration" class="${tab==="consecration"?"active":""}">${esc(heartTitle("consecration"))}</button>`}</div>${notes}</div></details>`;
  return `${head(L("Sacred Heart of Jesus","Sacré-Cœur de Jésus"))}<main class="aoP435930Body aoTP381DonorBody">${card}${options}</main>`;
}
const COMMUNION_BEFORE=Object.freeze([
  ["sacrament_come_holy_spirit","Come, Holy Ghost","Venez, Esprit Saint"],
  ["foundations_act_of_faith","Act of Faith","Acte de foi"],
  ["foundations_act_of_hope","Act of Hope","Acte d'espérance"],
  ["foundations_act_of_love","Act of Charity","Acte de charité"],
  ["sacrament_act_of_contrition","Act of Contrition","Acte de contrition"],
  ["beforeThomas","St Thomas Aquinas","Saint Thomas d'Aquin"],
  ["beforeAmbrose","St Ambrose","Saint Ambroise"]
]);
const COMMUNION_AFTER=Object.freeze([
  ["adoration_anima_christi","Anima Christi","Anima Christi"],
  ["afterThomas","St Thomas Aquinas","Saint Thomas d'Aquin"],
  ["afterBonaventure","St Bonaventure","Saint Bonaventure"],
  ["enEgo","En ego","En ego"]
]);

/*
 * The Mass Folio is a selection and routing surface, not another prayer book.
 * Both lengths read existing canonical Prayer corpus and communion-treasury
 * witnesses. The full sequence is simply a longer set of the same texts.
 */
function massFolioPrayerStages(){
  const before=S.route==="mass.prepare";
  const all=before?COMMUNION_BEFORE:COMMUNION_AFTER;
  if(S.massDepth==="full")return all;
  return before?[all[0],all[1],all[4]]:[all[0]];
}
function renderMassFolioPrayers(){
  const before=S.route==="mass.prepare";
  const stages=massFolioPrayerStages();
  const step=Math.max(0,Math.min(stages.length-1,Number(S.massStep)||0));
  const [id,titleEn,titleFr]=stages[step];
  const corpus=COMMUNION_TREASURY_V383;
  const prayer=data().prayers?.[id]
    ?prayerCard(id,{focusParagraphs:true})
    :sourcedPrayerCard(corpus[id],L(corpus[id]?.title||titleEn,corpus[id]?.titleFr||titleFr),{focusParagraphs:true});
  const title=before?L("Preparation before Mass","Préparation avant la messe"):
    L("Thanksgiving after Mass","Action de grâces après la messe");
  const note=before
    ?L("Pray at your own pace. You may proceed to the selected Mass at any moment.",
      "Priez à votre rythme. Vous pouvez rejoindre à tout moment la messe sélectionnée.")
    :L("These are private prayers of thanksgiving, not part of the Mass rite.",
      "Ces prières personnelles d’action de grâces ne font pas partie du rite de la messe.");
  const finish=before?'<button type="button" data-tp381-mass-continue>'+
    esc(L("Proceed to Mass","Passer à la messe"))+'</button>':
    '<button type="button" data-tp381-mass-finish>'+esc(L("Finish","Terminer"))+'</button>';
  const secondary=before?'<button type="button" data-tp381-mass-cancel>'+
    esc(L("Back to Mass choices","Retour aux choix de la messe"))+'</button>':"";
  const prev=step>0?'<button type="button" data-tp381-mass-step="'+(step-1)+'">'+
    esc(L("Previous prayer","Prière précédente"))+'</button>':"";
  const next=step<stages.length-1?'<button type="button" data-tp381-mass-step="'+(step+1)+'">'+
    esc(L("Next prayer","Prière suivante"))+'</button>':"";
  return head(title)+'<main class="aoP435930Body aoTP381DonorBody aoMassFolioPrayerBody">'+
    '<p class="aoTP381Intro">'+esc(note)+'</p>'+
    '<section class="aoDevoCard" data-ao-devo-card="mass-'+(before?"before":"after")+'-'+esc(id)+'">'+
    '<div class="aoDevoCardScroll" role="region" aria-label="'+esc(L(titleEn,titleFr))+'">'+prayer+'</div></section>'+
    '<nav class="aoTP381GuideNav aoMassFolioPrayerNav" aria-label="'+esc(L("Prayer sequence","Suite de prières"))+'">'+
    '<small class="aoTP381GuideCount">'+(step+1)+' / '+stages.length+'</small>'+prev+next+finish+secondary+'</nav>'+
    '<p data-tp381-mass-error role="alert" hidden></p>'+
    '</main>';
}

function communionStages(){return S.communion==="after"?COMMUNION_AFTER:COMMUNION_BEFORE}
function renderCommunionTreasury(){
  const d=COMMUNION_TREASURY_V383,tab=S.communion==="after"?"after":"before";
  const stages=communionStages(),index=Math.max(0,Math.min(stages.length-1,Number(S.communionStep)||0));
  const [id,titleEn,titleFr]=stages[index];
  // Reuse exactly one canonical prayer. Do not reproduce all prayer rows on
  // every stage or substitute a fabricated text for missing source content.
  const prayer=data().prayers?.[id]?prayerCard(id,{focusParagraphs:true}):
    sourcedPrayerCard(d[id],L(d[id]?.title||titleEn,d[id]?.titleFr||titleFr),{focusParagraphs:true});
  const card=`<section class="aoDevoCard" data-ao-devo-card="communion-${tab}-${esc(id)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(L(titleEn,titleFr))}">${prayer}</div></section>`;
  const context=tab==="before"?
    L("Choose what helps you prepare. These are traditional preparations, not a checklist to be completed before every Communion.","Choisissez ce qui vous aide à vous préparer. Ce sont des préparations traditionnelles, non une liste à accomplir avant chaque Communion."):
    L("Dwell in thanksgiving after Communion. Choose a prayer and leave time for silence.","Demeurez en action de grâces après la Communion. Choisissez une prière et gardez du temps pour le silence.");
  const commonSource=tab==="before"?d.sources.beforeFrenchLatin:d.sources.afterFrenchLatin;
  const formation=tab==="before"?`<div class="aoTP381PrayerList"><button type="button" data-tp381-route="learn.rites.first_communion"><span><b>${esc(L("Preparing a child for First Communion?","Préparez-vous un enfant à la première Communion ?"))}</b><small>${esc(L("Open the sacramental formation guide; these private prayers are not a substitute.","Ouvrir le guide de formation sacramentelle ; ces prières privées ne le remplacent pas."))}</small></span><i aria-hidden="true">→</i></button></div>`:"";
  const indulgence=tab==="after"?`<details class="aoTP381Source"><summary>${esc(L("Indulgences · current discipline","Indulgences · discipline actuelle"))}</summary><p>${esc(L("The current Enchiridion grants a partial indulgence for an approved act of thanksgiving after Communion and expressly gives Anima Christi and En ego as examples. It grants a plenary indulgence for devoutly reciting En ego before an image of Christ crucified after Communion on any Friday of Lent, under the usual conditions. Historical days-or-years grants printed in old missals are not the current way indulgences are measured.","L’Enchiridion actuel accorde une indulgence partielle pour une formule pieuse approuvée d’action de grâces après la Communion et donne expressément comme exemples l’Anima Christi et l’En ego. Il accorde une indulgence plénière à qui récite pieusement l’En ego devant une image du Christ crucifié après la Communion, un vendredi du Carême, aux conditions habituelles. Les anciennes concessions exprimées en jours ou en années dans les vieux missels ne constituent plus la manière actuelle de mesurer les indulgences."))}</p><p><a href="${esc(d.sources.currentIndulgences)}" target="_blank" rel="noopener">${esc(L("Apostolic Penitentiary · Enchiridion","Pénitencerie apostolique · Enchiridion"))} ↗</a></p></details>`:"";
  const tabs=`<nav class="aoTP381DaypartStrip" aria-label="${esc(L("Communion prayer phase","Temps de prière de Communion"))}"><button type="button" data-tp381-communion="before" aria-pressed="${tab==="before"}" class="${tab==="before"?"active":""}">${esc(L("Before Communion","Avant la Communion"))}</button><button type="button" data-tp381-communion="after" aria-pressed="${tab==="after"}" class="${tab==="after"?"active":""}">${esc(L("After Communion","Après la Communion"))}</button></nav>`;
  const options=`<details class="aoTP381SecondaryOptions" data-ao-communion-options><summary>${esc(L("Sources and guidance","Sources et conseils"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("A sourced treasury of prayers long printed before and after Mass in the Roman-Missal tradition, retained only where the French Catholic tradition is also attested.","Un trésor de prières sourcées, longtemps imprimées avant et après la Messe dans la tradition du Missel romain, retenues seulement lorsqu’elles sont également attestées dans la tradition catholique française."))}</p><p>${esc(context)}</p>${traditionalContextGuide("communion")}${formation}${indulgence}${source(L("French & Latin traditional prayer witness","Témoin traditionnel français & latin"),commonSource)}</div></details>`;
  return `${head(L("Traditional Communion Prayers","Prières traditionnelles de Communion"))}<main class="aoP435930Body aoTP381DonorBody">${tabs}${card}${options}</main>`;
}
const GOOD_DEATH_STAGES=Object.freeze([
  ["devotion_litany_st_joseph","Litany of Saint Joseph","Litanies de saint Joseph"],
  ["devotion_ad_te_beate_ioseph","To Thee, O Blessed Joseph","À vous, bienheureux Joseph"],
  ["devotion_memorare_st_joseph","Memorare to St Joseph","Souvenez-vous à saint Joseph"],
  ["foundations_act_of_faith","Act of Faith","Acte de foi"],
  ["foundations_act_of_hope","Act of Hope","Acte d’espérance"],
  ["foundations_act_of_love","Act of Charity","Acte de charité"],
  ["sacrament_act_of_contrition","Act of Contrition","Acte de contrition"],
  ["foundations_hail_mary","Hail Mary","Je vous salue Marie"],
  ["aspirations","Traditional aspirations","Invocations traditionnelles"]
]);
function renderGoodDeath(){
  const d=GOOD_DEATH_DYING_V384;
  const step=Math.max(0,Math.min(GOOD_DEATH_STAGES.length-1,Number(S.goodDeathStep)||0));
  const [id,en,fr]=GOOD_DEATH_STAGES[step];
  const prayer=id==="aspirations"?
    sourcedPrayerCard(d.aspirations,L(d.aspirations.title,d.aspirations.titleFr),{focusParagraphs:true}):
    prayerCard(id,{focusParagraphs:true});
  const card=`<section class="aoDevoCard" data-ao-devo-card="good-death-${esc(id)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(L(en,fr))}">${prayer}</div></section>`;
  const urgent=`<div class="aoTP381PrayerList aoTP381PastoralShortcut"><button type="button" data-tp381-route="pray.dying_companion"><span><b>${esc(L("Someone may be dying now","Une personne est peut-être mourante maintenant"))}</b><small>${esc(L("Open the bedside guide and seek a priest immediately.","Ouvrez le guide au chevet et contactez un prêtre sans tarder."))}</small></span><i aria-hidden="true">→</i></button></div>`;
  const options=`<details class="aoTP381SecondaryOptions" data-ao-good-death-options><summary>${esc(L("Practice, pastoral guidance and historical sources","Pratique, accompagnement et sources historiques"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("This is an ordinary devotional treasury for preparing throughout life for a holy death. It is not an emergency checklist and it does not replace the sacraments or the ministry of a priest.","Il s’agit d’un trésor dévotionnel ordinaire pour se préparer, durant la vie, à une sainte mort. Ce n’est pas une liste d’urgence et il ne remplace ni les sacrements ni le ministère d’un prêtre."))}</p>${traditionalContextGuide("goodDeath")}<p>${esc(L("Traditional Roman prayers for the dying invoke St Joseph as patron of the dying. His litany and familiar prayers may be recited in preparation for a holy death.","Les prières romaines pour les mourants invoquent saint Joseph comme patron des mourants. Ses litanies et les prières qui lui sont consacrées aident à se préparer à une sainte mort."))}</p><p>${esc(L("Final perseverance and readiness deepen the ordinary acts of faith, hope, charity, contrition and confidence in Our Lady at the hour of death.","La persévérance finale et la préparation approfondissent les actes ordinaires de foi, d’espérance, de charité, de contrition et la confiance en Notre-Dame à l’heure de la mort."))}</p>${source("Acta Apostolicae Sedis · 1922 · Ordo Commendationis Animae",GOOD_DEATH_DYING_SOURCES_V384.romanJoseph1922)}${source(L("Current customary invocations · Apostolic Penitentiary","Invocations usuelles actuelles · Pénitencerie apostolique"),GOOD_DEATH_DYING_SOURCES_V384.currentIndulgences)}<div class="aoTP381PrayerList"><button type="button" data-tp381-route="learn.rites.sick"><span><b>${esc(L("Serious illness · understand the sacraments","Maladie grave · comprendre les sacrements"))}</b><small>${esc(L("The priest and sacramental care belong to the Church, not to this devotion.","Le prêtre et les soins sacramentels relèvent de l’Église, non de cette dévotion."))}</small></span><i aria-hidden="true">→</i></button></div></div></details>`;
  return `${head(L("Preparation for a Good Death","Préparation à une bonne mort"))}<main class="aoP435930Body aoTP381DonorBody">${urgent}${card}${options}</main>`;
}
function dyingCompanionStepNav(tab){
  const index=DYING_COMPANION_STAGES.indexOf(tab);
  const previous=nextDyingCompanionStage(tab,"previous");
  const next=nextDyingCompanionStage(tab,"next");
  const count=L("Step "+(index+1)+" of 3","Étape "+(index+1)+" sur 3");
  return `<section data-ao-dying-step="${esc(tab)}" aria-label="${esc(L("Bedside guide","Guide au chevet"))}">
    <p class="aoTP381GuideCount">${esc(count)}</p>
    <nav class="aoTP381GuideNav" aria-label="${esc(L("Bedside steps","Étapes au chevet"))}">
      <button type="button" data-tp381-dying-step="previous" ${previous?"":"disabled"}>${esc(L("Previous","Précédent"))}</button>
      <button type="button" data-tp381-dying-step="next" ${next?"":"disabled"}>${esc(L("Next","Suivant"))}</button>
    </nav>
  </section>`;
}
function renderDyingCompanion(){
  const d=GOOD_DEATH_DYING_V384,tab=["now","pray","commend"].includes(S.dying)?S.dying:"now";
  let body="";
  if(tab==="pray"){
    body=`<p class="aoTP381Intro">${esc(L("Keep the prayers short and peaceful. If the dying person can answer, let them join as they are able; if not, pray quietly beside them.","Gardez les prières brèves et paisibles. Si le mourant peut répondre, laissez-le s’unir comme il le peut; sinon, priez doucement auprès de lui."))}</p>
      ${prayerRows([
        ["sacrament_act_of_contrition",L("Act of Contrition","Acte de contrition"),L("If the person can pray it","Si la personne peut la réciter")],
        ["foundations_act_of_faith",L("Act of Faith","Acte de foi"),L("Short act of faith","Bref acte de foi")],
        ["foundations_act_of_hope",L("Act of Hope","Acte d’espérance"),L("Short act of hope","Bref acte d’espérance")],
        ["foundations_act_of_love",L("Act of Charity","Acte de charité"),L("Short act of charity","Bref acte de charité")],
        ["foundations_hail_mary",L("Hail Mary","Je vous salue Marie"),L("At the hour of our death","À l’heure de notre mort")],
        ["adoration_anima_christi","Anima Christi",L("Passion of Christ, strengthen me","Passion du Christ, fortifiez-moi")]
      ])}
      ${sourcedPrayerCard(d.aspirations,L(d.aspirations.title,d.aspirations.titleFr),{focusParagraphs:true})}
      <div class="aoTP381PrayerList"><button type="button" data-tp381-route="pray.st_joseph"><span><b>${esc(L("St Joseph","Saint Joseph"))}</b><small>${esc(L("Patron of the dying · open the existing St Joseph module","Patron des mourants · ouvrir le module existant de saint Joseph"))}</small></span><i aria-hidden="true">→</i></button></div>
      ${source(L("French customary invocations","Invocations usuelles françaises"),GOOD_DEATH_DYING_SOURCES_V384.frenchInvocations)}`;
  }else if(tab==="commend"){
    body=`${sourcedPrayerCard(d.proficiscere,L(d.proficiscere.title,d.proficiscere.titleFr),{focusParagraphs:true})}
      <p class="aoTP381Intro">${esc(L("The Commendation of the Soul is a traditional prayer of the Church as death approaches. These prayers may be prayed at the bedside; they do not imitate absolution, Anointing, Viaticum or the Apostolic Blessing, which belong to the priestly sacramental ministry.","La recommandation de l’âme est une prière traditionnelle de l’Église à l’approche de la mort. Ces prières peuvent être récitées au chevet du mourant; elles n’imitent ni l’absolution, ni l’Onction, ni le Viatique, ni la Bénédiction apostolique, qui relèvent du ministère sacramentel du prêtre."))}</p>
      ${source("Traditional Roman Commendation · Latin",GOOD_DEATH_DYING_SOURCES_V384.latinProficiscere)}
      ${source(L("Historical French Catholic witness","Témoin catholique français historique"),GOOD_DEATH_DYING_SOURCES_V384.frenchProficiscere)}
      <section class="aoTP381Section"><h2>${esc(L("If the person has died","Si la personne est décédée"))}</h2><p>${esc(L("Move from prayers for the dying to suffrage for the departed; do not continue presenting the person as still in the agony of death.","Passez des prières pour le mourant aux suffrages pour le défunt; ne continuez pas à présenter la personne comme encore dans l’agonie."))}</p></section>
      ${prayerRows([
        ["dead_eternal_rest_singular",L("Eternal Rest · for one deceased person","Repos éternel · pour un défunt"),L("Immediate suffrage for the departed","Suffrage immédiat pour le défunt")],
        ["dead_de_profundis","De profundis · Psalm 129",L("Traditional prayer for the departed","Prière traditionnelle pour les défunts")]
      ])}`;
  }else{
    body=`<section class="aoTP381Section"><h2>${esc(L("Call a priest now","Appelez un prêtre maintenant"))}</h2><p>${esc(L("If death may be approaching, contact a priest without waiting for the person to become unconscious. Ask specifically about Confession or Penance, Anointing of the Sick, Holy Communion as Viaticum, and the Apostolic Blessing at the point of death.","Si la mort peut être proche, contactez un prêtre sans attendre que la personne perde connaissance. Demandez explicitement la Confession ou Pénitence, l’Onction des malades, la sainte Communion en Viatique et la Bénédiction apostolique à l’article de la mort."))}</p></section>
      <section class="aoTP381Section"><h2>${esc(L("What this companion does","Ce que fait cet accompagnement"))}</h2><p>${esc(L("It helps the faithful pray and act at the bedside. For fuller formation about Penance, Anointing and Viaticum, use the Serious Illness guide; this companion does not duplicate that material and never simulates priestly absolution, sacramental anointing, administration of Viaticum or the Apostolic Blessing.","Il aide les fidèles à prier et à agir au chevet. Pour une formation plus complète sur la Pénitence, l’Onction et le Viatique, utilisez le guide Maladie grave; cet accompagnement ne duplique pas ce contenu et ne simule jamais l’absolution sacerdotale, l’onction sacramentelle, l’administration du Viatique ou la Bénédiction apostolique."))}</p></section>
      <div class="aoTP381PrayerList"><button type="button" data-tp381-route="learn.rites.sick"><span><b>${esc(L("Understand the sacraments for serious illness","Comprendre les sacrements en cas de maladie grave"))}</b><small>${esc(L("Open the Serious Illness & Dying formation guide","Ouvrir le guide de formation Maladie grave & fin de vie"))}</small></span><i aria-hidden="true">→</i></button></div>
      <details class="aoTP381Source"><summary>${esc(L("At the point of death · current indulgence","À l’article de la mort · indulgence actuelle"))}</summary><p>${esc(isFr()?d.currentIndulgence.fr:d.currentIndulgence.en)}</p><p><a href="${esc(GOOD_DEATH_DYING_SOURCES_V384.currentIndulgences)}" target="_blank" rel="noopener">${esc(L("Apostolic Penitentiary · Enchiridion","Pénitencerie apostolique · Enchiridion"))} ↗</a></p></details>
      <details class="aoTP381Source"><summary>${esc(L("Why Viaticum matters","Pourquoi le Viatique est important"))}</summary><p>${esc(L("The Church gives the Eucharist as Viaticum to those about to leave this life. Together with Penance and Anointing of the Sick, it belongs to the sacraments that complete the Christian’s earthly pilgrimage.","L’Église donne l’Eucharistie en Viatique à ceux qui sont sur le point de quitter cette vie. Avec la Pénitence et l’Onction des malades, il appartient aux sacrements qui achèvent le pèlerinage terrestre du chrétien."))}</p><p><a href="${esc(GOOD_DEATH_DYING_SOURCES_V384.viaticum)}" target="_blank" rel="noopener">${esc(L("Catechism · Viaticum","Catéchisme · Viatique"))} ↗</a></p></details>`;
  }
  // The initial card is a real-world pastoral action. The guide is not a
  // simulated sacramental rite and its later cards are optional bedside help.
  const titles={
    now:L("Call a priest now","Appelez un prêtre maintenant"),
    pray:L("Pray quietly","Priez paisiblement"),
    commend:L("Commend the soul","Recommandez l’âme")
  };
  const card=`<section class="aoDevoCard" data-ao-devo-card="dying-${tab}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(titles[tab])}">${body}</div></section>`;
  const steps=`<div class="aoTP381Tabs" role="group" aria-label="${esc(L("Bedside stages","Étapes au chevet"))}"><button type="button" data-tp381-dying="now" class="${tab==="now"?"active":""}">${esc(L("Now","Maintenant"))}</button><button type="button" data-tp381-dying="pray" class="${tab==="pray"?"active":""}">${esc(L("Pray","Prier"))}</button><button type="button" data-tp381-dying="commend" class="${tab==="commend"?"active":""}">${esc(L("Commend","Recommander"))}</button></div>`;
  const options=`<details class="aoTP381SecondaryOptions" data-ao-dying-companion-options><summary>${esc(L("About this bedside companion","À propos de cet accompagnement"))}</summary><div class="aoTP381SecondaryOptionsBody"><p>${esc(L("A bedside companion for the faithful when death may be near. The first action is pastoral, not digital: obtain a priest when possible.","Un accompagnement au chevet pour les fidèles lorsque la mort peut être proche. La première action est pastorale, non numérique : obtenir un prêtre lorsque cela est possible."))}</p>${steps}${dyingCompanionStepNav(tab)}</div></details>`;
  return `${head(L("Dying Companion","Accompagnement du mourant"))}<main class="aoP435930Body aoTP381DonorBody">${card}${options}</main>`;
}
function renderPrayer(){
  const p=data().prayers?.[S.prayerId];
  const parent=S.route==="pray.communion_treasury"?L("Traditional Communion Prayers","Prières traditionnelles de Communion"):S.route==="pray.good_death"?L("Preparation for a Good Death","Préparation à une bonne mort"):S.route==="pray.dying_companion"?L("Dying Companion","Accompagnement du mourant"):L("Morning & Evening Prayer","Prières du matin & du soir");
  return `${head(prayerTitle(p,S.prayerId),parent)}<main class="aoP435930Body">${prayerCard(S.prayerId)}</main>`;
}
function glossaryTermsForState(){
  if(S.screen==="prayer")return ["G326"];
  if(S.route==="pray.sacred_hymns")return ["G326","G321"];
  if(S.route==="pray.holy_name_litany")return ["G096","G154","G326"];
  if(S.route==="pray.nightly_examen")return ["G328","G019","G011","G012"];
  if(S.route==="pray.meal_prayers")return ["G326","G237"];
  if(S.route==="pray.sacred_heart")return ["G321","G331","G330"];
  if(S.route==="pray.communion_treasury")return ["G031","G030","G326"];
  if(S.route==="pray.good_death")return ["G156","G037","G326"];
  if(S.route==="pray.dying_companion")return ["G037","G038","G156"];
  return ["G326","G324"];
}
function injectGlossaryAction(){
  const m=mount();const body=m?.querySelector?.(".aoP435930Body");if(!body||body.querySelector("[data-tp381-glossary]"))return false;
  const button=document.createElement("button");
  button.type="button";button.className="aoTP381Glossary";button.dataset.tp381Glossary="true";
  button.textContent=L("Terms & explanations","Termes & explications");
  if(S.screen==="module"&&["pray.morning_evening","pray.nightly_examen","pray.meal_prayers","pray.holy_name_litany","pray.sacred_heart","pray.communion_treasury","pray.sacred_hymns","pray.good_death","pray.dying_companion"].includes(S.route))body.append(button);
  else body.insertAdjacentElement("afterbegin",button);
  return true;
}
function render(){
  const m=mount();if(!m)return false;
  m.dataset.aoPrayView="traditional-pray";
  // A route change or Full Text mode must not inherit another reader’s stage owner.
  delete m.dataset.aoTraditionalDualAxis;
  m.dataset.aoTraditionalPrayRoute=S.route;
  m.innerHTML=S.screen==="prayer"?renderPrayer():S.route==="mass.prepare"||S.route==="mass.thanksgiving"?renderMassFolioPrayers():S.route==="pray.sacred_hymns"?renderHymns():S.route==="pray.holy_name_litany"?renderHolyName():S.route==="pray.nightly_examen"?renderNightlyExamen():S.route==="pray.meal_prayers"?renderMealPrayers():S.route==="pray.sacred_heart"?renderSacredHeart():S.route==="pray.communion_treasury"?renderCommunionTreasury():S.route==="pray.good_death"?renderGoodDeath():S.route==="pray.dying_companion"?renderDyingCompanion():renderMorningEvening();
  if(S.screen==="module"&&S.route==="pray.morning_evening")syncDailyTimerView();
  if(S.screen==="module"&&["pray.morning_evening","pray.nightly_examen"].includes(S.route)){
    const daily=S.route==="pray.morning_evening";
    const rows=daily?dailyReadingPlan().rows:NIGHTLY_EXAMEN_CARDS;
    if(!daily||S.dailyMode==="guided"){
      const chapters=rows.map((row,i)=>({
        id:row.id||"examen-"+(i+1),
        title:daily?(row.kind==="examination"?row.title||L("Nightly Examination","Examen du soir"):row.kind==="approved-source-prayer"||row.kind==="silence"?row.title:prayerTitle(data().prayers?.[row.id],row.id))
          :(isFr()?row.titleFr:row.titleEn)
      }));
      chapters.push({id:daily?"daily-finished":"examen-finished",title:L("Prayer completed","Prière terminée")});
      const index=daily?S.dailyStep:S.examenStep;
      const reader=installSequentialDevotionalReader({
        mount:m,kind:daily?"daily":"examen",chapters,activeIndex:index,
        paragraphSelector:".aoTP381GuideCard>p,.aoTP381TextParagraph",
        onNavigate:i=>{if(daily)S.dailyStep=i;else S.examenStep=i;render()},
        timelineLabel:L("Prayer timeline","Chronologie des prières")
      });
      if(reader){
        m.dataset.aoTraditionalDualAxis=reader.kind;
        if(index<rows.length){
          const legacy=m.querySelector(".aoTP381GuideCard .aoTP381GuideNav");
          if(legacy)legacy.style.display="none";
        }
      }
    }
  }
  if(S.screen==="module"&&(S.route==="pray.meal_prayers"||(S.route==="pray.holy_name_litany"&&S.litanyMode==="guided"))){
    const meals=S.route==="pray.meal_prayers";
    const chapters=meals?[
      {id:"meal-before",title:L("Before meals","Avant le repas")},
      {id:"meal-after",title:L("After meals","Après le repas")}
    ]:HOLY_NAME_SECTION_LABELS.map(([en,fr],i)=>({id:"holy-name-"+(i+1),title:L(en,fr)}));
    const reader=installSequentialDevotionalReader({
      mount:m,kind:meals?"meals":"holyName",chapters,
      activeIndex:meals?S.mealStep:S.litanyStep,
      paragraphSelector:meals?".aoTP381TextParagraph":".aoTP381LitanyLine",
      onNavigate:i=>{if(meals)S.mealStep=i;else S.litanyStep=i;render()},
      timelineLabel:L("Prayer timeline","Chronologie des prières")
    });
    if(reader)m.dataset.aoTraditionalDualAxis=reader.kind;
  }
  if(S.screen==="module"&&["pray.sacred_heart","pray.communion_treasury"].includes(S.route)){
    const heart=S.route==="pray.sacred_heart";
    const chapters=heart?HEART_STAGES.map(id=>({id:"heart-"+id,title:heartTitle(id)})):
      communionStages().map(([id,en,fr])=>({id:"communion-"+S.communion+"-"+id,title:L(en,fr)}));
    const index=heart?HEART_STAGES.indexOf(S.sacredHeart):S.communionStep;
    const reader=installSequentialDevotionalReader({
      mount:m,kind:heart?"sacredHeart":"communion",chapters,activeIndex:index,
      paragraphSelector:".aoTP381TextParagraph",
      onNavigate:i=>{if(heart)S.sacredHeart=HEART_STAGES[i];else S.communionStep=i;render()},
      timelineLabel:L("Prayer timeline","Chronologie des prières")
    });
    if(reader)m.dataset.aoTraditionalDualAxis=reader.kind;
  }
  if(S.screen==="module"&&S.route==="pray.sacred_hymns"){
    const chapters=HYMN_KEYS.map(id=>({id:"hymn-"+id,title:SACRED_HYMNS_V381[id].title}));
    const reader=installSequentialDevotionalReader({
      mount:m,kind:"hymns",chapters,activeIndex:HYMN_KEYS.indexOf(S.hymn),
      paragraphSelector:".aoTP381TextParagraph",
      onNavigate:i=>{S.hymn=HYMN_KEYS[i];render()},
      timelineLabel:L("Hymn timeline","Parcours des hymnes")
    });
    if(reader)m.dataset.aoTraditionalDualAxis=reader.kind;
  }
  if(S.screen==="module"&&S.route==="pray.good_death"){
    const chapters=GOOD_DEATH_STAGES.map(([id,en,fr])=>({id:"good-death-"+id,title:L(en,fr)}));
    const reader=installSequentialDevotionalReader({
      mount:m,kind:"goodDeath",chapters,activeIndex:S.goodDeathStep,
      paragraphSelector:".aoTP381TextParagraph",
      onNavigate:i=>{S.goodDeathStep=i;render()},
      timelineLabel:L("Prayer timeline","Chronologie des prières")
    });
    if(reader)m.dataset.aoTraditionalDualAxis=reader.kind;
  }
  if(S.screen==="module"&&S.route==="pray.dying_companion"){
    const chapters=[
      {id:"dying-now",title:L("Call priest","Appeler le prêtre")},
      {id:"dying-pray",title:L("Pray","Prier")},
      {id:"dying-commend",title:L("Commend","Recommander")}
    ];
    const reader=installSequentialDevotionalReader({
      mount:m,kind:"dyingCompanion",chapters,
      activeIndex:DYING_COMPANION_STAGES.indexOf(S.dying),
      paragraphSelector:".aoTP381Section>p,.aoTP381Intro,.aoTP381TextParagraph",
      onNavigate:i=>{S.dying=DYING_COMPANION_STAGES[i];render()},
      timelineLabel:L("Bedside companion stages","Étapes de l’accompagnement au chevet")
    });
    if(reader)m.dataset.aoTraditionalDualAxis=reader.kind;
  }
  injectGlossaryAction();
  m.scrollTop=0;
  queueMicrotask(()=>{const focus=m.querySelector("[data-ao-guided-focus]")||m.querySelector("button,[href],summary,[tabindex]:not([tabindex='-1'])");focus?.focus?.({preventScroll:true})});
  return true;
}
function open(route,opts={}){
  if(!ROUTES[route])return false;
  resetDailySessionTimer();
  OPEN_RECEIPT=captureObservedModuleOrigin(window,"pray");
  OPEN_OPTS={...opts};MASS_HANDOFF_BUSY=false;
  S={...S,route,screen:"module",prayerId:null,guidedFromList:false,
    ...(route==="mass.prepare"||route==="mass.thanksgiving"
      ?{massStep:0,massDepth:opts.depth==="full"?"full":"brief"}:{}),
    ...(route==="pray.morning_evening"?{dailyMode:"guided",dailyStep:0,dailyLength:"standard",returnToDaily:false}:{})
   ,...(route==="pray.nightly_examen"?{examenStep:0,returnToDaily:false}:{}),
    ...(route==="pray.dying_companion"?{dying:"now"}:{}),
    ...(route==="pray.sacred_hymns"?{hymn:"te_deum",hymnLang:null}:{}),
    ...(route==="pray.good_death"?{goodDeathStep:0}:{}),
    ...(route==="pray.meal_prayers"?{mealStep:0}:{}),
    ...(route==="pray.sacred_heart"?{sacredHeart:"litany"}:{}),
    ...(route==="pray.communion_treasury"?{communion:"before",communionStep:0}:{}),
    ...(route==="pray.holy_name_litany"?{litanyMode:"guided",litanyStep:0}:{})};
  BASE_OPEN("pray.hub",opts);
  render();return true;
}
function back(){
  if(S.route==="mass.prepare"){
    BASE_CLOSE({silent:true});
    const receipt=OPEN_OPTS.returnPrayerSnapshot;
    return receipt?Boolean(window.AO_PRAY_V435930?.restoreHandoff?.(receipt)):true;
  }
  if(S.screen==="prayer"){S.screen="module";S.prayerId=null;return render()}
  if(S.route==="pray.nightly_examen"&&S.returnToDaily){S.route="pray.morning_evening";S.returnToDaily=false;return render()}
  // The list is a Back target only after the visitor actually switched from
  // the list to guided cards. Direct guided deep links return to their caller.
  if(S.route==="pray.morning_evening"&&S.dailyMode==="guided"&&S.guidedFromList){
    S.dailyMode="list";S.guidedFromList=false;return render()
  }
  if(S.route==="pray.morning_evening")resetDailySessionTimer();
  return returnToObservedModuleOrigin(window,OPEN_RECEIPT,{
    close:()=>BASE_CLOSE(),
    restoreParent:()=>{
      BASE_OPEN("pray.hub",OPEN_OPTS);
      if(OPEN_OPTS.returnFamily)window.AO_PRAY_V435930?.openFamily?.(OPEN_OPTS.returnFamily);
      return true;
    }
  });
}
function goHome(){
  resetDailySessionTimer();
  // Explicit Home overrides any deep-link return owner. A normal close may
  // asynchronously restore the previous Prayer context and reopen this sheet.
  BASE_CLOSE({silent:true});
  const p=window.AO_APP_SHELL_V1?.navigate?.("home");
  if(p&&typeof p.catch==="function")p.catch(()=>window.AO_NAV_V362?.openHome?.());
  else if(!p)window.AO_NAV_V362?.openHome?.();
  return true;
}
function handleClick(e){
  const b=e.target.closest?.("button,[data-tp381-flip]");if(!b||!root()?.classList.contains("open"))return;
  if(!b.matches("[data-tp381-back],[data-tp381-home],[data-tp381-open],[data-tp381-daypart],[data-tp381-hymn],[data-tp381-hymn-lang],[data-tp381-prayer],[data-tp381-route],[data-tp381-heart],[data-tp381-communion],[data-tp381-dying],[data-tp381-dying-step],[data-tp381-flip],[data-tp381-glossary],[data-tp381-daily-mode],[data-tp381-timer-toggle],[data-tp381-timer-control],[data-tp381-timer-target],[data-tp381-daily-form],[data-tp381-approved-daily-form],[data-tp381-daily-length],[data-tp381-daily-card-index],[data-tp381-daily-step],[data-tp381-daily-overview],[data-tp381-daily-examen],[data-tp381-examen-step],[data-tp381-examen-return],[data-tp381-examen-overview],[data-tp381-litany-mode],[data-tp381-litany-step],[data-tp381-mass-step],[data-tp381-mass-continue],[data-tp381-mass-cancel],[data-tp381-mass-finish]"))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.matches("[data-tp381-back]"))return back();
  if(b.matches("[data-tp381-home]"))return goHome();
  if(b.matches("[data-tp381-glossary]")){const g=window?.AO_GLOSSARY_V1;if(typeof g?.openTerms==="function")void g.openTerms(glossaryTermsForState(),{origin:"pray"});return;}
  if(b.hasAttribute("data-tp381-mass-step")){
    const number=Number(b.dataset.tp381MassStep);
    if(Number.isInteger(number)&&number>=0&&number<massFolioPrayerStages().length){
      S.massStep=number;return render();
    }
    return;
  }
  if(b.hasAttribute("data-tp381-mass-cancel")){BASE_CLOSE({silent:true});return;}
  if(b.hasAttribute("data-tp381-mass-finish"))return goHome();
  if(b.hasAttribute("data-tp381-mass-continue")){
    if(MASS_HANDOFF_BUSY)return;
    MASS_HANDOFF_BUSY=true;
    const action=OPEN_OPTS?.onContinue;
    Promise.resolve().then(()=>{
      if(typeof action!=="function")throw Error("MASS_START_NOT_AVAILABLE");
      return action();
    }).then(result=>{
      if(result===false||result?.ok===false)throw Error("MASS_START_NOT_AVAILABLE");
      BASE_CLOSE({silent:true});
    }).catch(error=>{
      const notice=mount()?.querySelector("[data-tp381-mass-error]");
      if(notice){notice.hidden=false;notice.textContent=L(
        "Could not start Mass. Return to Mass choices and check the selected Proper.",
        "Impossible d’ouvrir la messe. Vérifiez le propre sélectionné dans la préparation.");}
      try{window?.console?.error?.(error)}catch{}
    }).finally(()=>{MASS_HANDOFF_BUSY=false});
    return;
  }
  if(b.dataset.tp381Open)return open(b.dataset.tp381Open,{trigger:b});

  if(b.hasAttribute("data-tp381-daily-length")){
    if(S.route!=="pray.morning_evening"||S.screen!=="module")return;
    const length=b.dataset.tp381DailyLength;
    if(length!=="standard"&&!dailyLengthOptions().includes(length))return;
    S.dailyLength=length;S.dailyStep=0;S.dailyMode="guided";return render();
  }
  if(b.hasAttribute("data-tp381-daily-card-index")){
    if(S.route!=="pray.morning_evening"||S.screen!=="module"||dailyReadingPlan().mode!=="approved")return;
    const index=Number(b.dataset.tp381DailyCardIndex),rows=dailyReadingPlan().rows;
    if(!Number.isInteger(index)||index<0||index>=rows.length)return;
    S.dailyMode="guided";S.dailyStep=index;return render();
  }
  if(b.hasAttribute("data-tp381-approved-daily-form")){
    if(S.route!=="pray.morning_evening"||S.screen!=="module"||S.dailyMode!=="guided")return;
    const [slotId,formId,...extra]=String(b.dataset.tp381ApprovedDailyForm||"").split("::");
    if(!slotId||!formId||extra.length||!["short","complete"].includes(S.dailyLength))return;
    const language=isFr()?"fr":"en",daypart=S.daypart,length=S.dailyLength;
    const plan=dailyReadingPlan();
    if(plan.mode!=="approved"||!plan.rows.some(x=>x.slotId===slotId))return;
    const approved=approvedDailySlotOptions(DAILY_APPROVED_FORMS,DAILY_SEQUENCE_RELEASE,{language,daypart,length,slotId});
    if(!approved.some(x=>x.id===formId))return;
    const store=dailyFormPreferenceStore(),profile={language,daypart,length};
    const next={...store.load(DAILY_APPROVED_FORMS,profile)};
    const step=DAILY_APPROVED_FORMS.profiles[[language,daypart,length].join(":")].steps.find(x=>x.id===slotId);
    if(step?.multiple===true){
      const old=Array.isArray(next[slotId])?next[slotId]:[step.variants[0]];
      const selected=old.includes(formId)?old.filter(x=>x!==formId):[...old,formId];
      if(!selected.length&&step.required!==false)return;
      next[slotId]=selected;
    }else next[slotId]=formId;
    if(store.save(DAILY_APPROVED_FORMS,{...profile,selection:next}).saved)return render();
    return;
  }
  if(b.hasAttribute("data-tp381-daily-form")){
    if(S.route!=="pray.morning_evening"||S.dailyMode!=="guided")return;
    const parts=String(b.dataset.tp381DailyForm||"").split("::");
    if(parts.length!==2)return;
    const [id,variant]=parts,lang=isFr()?"fr":"en";
    if(!guidedDailyCards(S.daypart).some(x=>x.id===id))return;
    const allowed=dailyReleasedFormOptions(id,S.daypart,lang);
    if(!allowed.length || (variant&&!allowed.some(x=>x.id===variant)))return;
    const profile={language:lang,daypart:S.daypart,length:"complete"};
    const store=dailyFormPreferenceStore();
    const next={...store.load(DAILY_APPROVED_FORMS,profile)};
    if(variant)next[id]=variant;else delete next[id];
    const result=store.save(DAILY_APPROVED_FORMS,{...profile,selection:next});
    if(result.saved)render();
    return;
  }
  if(b.hasAttribute("data-tp381-timer-toggle")){
    if(S.route!=="pray.morning_evening")return;
    S.dailyTimerOpen=!S.dailyTimerOpen;
    // Timer disclosure lives after the prayer: replace only this little
    // panel. A full render() would reset card scroll/focus to the heading.
    const shell=mount()?.querySelector(".aoDailyClockShell");
    if(!shell)return render();
    shell.outerHTML=dailyTimerControls();
    syncDailyTimerView();
    mount()?.querySelector("[data-tp381-timer-toggle]")?.focus?.({preventScroll:true});
    return;
  }
  if(b.hasAttribute("data-tp381-timer-control")){
    if(S.route!=="pray.morning_evening")return;
    const action=b.dataset.tp381TimerControl;
    if(action==="toggle"){
      if(DAILY_SESSION_CLOCK.snapshot().running)DAILY_SESSION_CLOCK.pause();
      else DAILY_SESSION_CLOCK.start();
    }else if(action==="reset")DAILY_SESSION_CLOCK.reset();
    startDailyTimerTick();syncDailyTimerView();return;
  }
  if(b.hasAttribute("data-tp381-timer-target")){
    if(S.route!=="pray.morning_evening")return;
    const raw=b.dataset.tp381TimerTarget;
    const value=raw==="none"?null:Number(raw);
    DAILY_SESSION_CLOCK.setTarget(value);
    syncDailyTimerView();return;
  }
  if(b.dataset.tp381Daypart){const next=b.dataset.tp381Daypart==="evening"?"evening":"morning";if(next!==S.daypart)resetDailySessionTimer();S.daypart=next;S.dailyStep=0;return render()}
   if(b.dataset.tp381DailyMode){
     const next=b.dataset.tp381DailyMode==="list"?"list":"guided";
     if(next==="guided"&&S.dailyMode==="list")S.guidedFromList=true;
     if(next==="list")S.guidedFromList=false;
     S.dailyMode=next;return render()
   }
   if(b.hasAttribute("data-tp381-daily-step")){
     S.dailyStep=clampPrayerCardStep(Number(b.dataset.tp381DailyStep),dailyReadingPlan().rows.length);return render();
   }
   if(b.hasAttribute("data-tp381-daily-overview")){S.dailyMode="list";S.guidedFromList=false;return render()}
   if(b.hasAttribute("data-tp381-daily-examen")){
     S.route="pray.nightly_examen";S.screen="module";S.examenStep=0;S.returnToDaily=true;return render();
   }
   if(b.hasAttribute("data-tp381-examen-step")){
     S.examenStep=clampPrayerCardStep(Number(b.dataset.tp381ExamenStep),NIGHTLY_EXAMEN_CARDS.length);return render();
   }
   if(b.hasAttribute("data-tp381-examen-return")){
     S.route="pray.morning_evening";S.returnToDaily=false;S.dailyMode="guided";
     S.dailyStep=Math.min(S.dailyStep+1,guidedDailyCards("evening").length);return render();
   }
   if(b.hasAttribute("data-tp381-examen-overview")){S.examenStep=0;return render()}

  if(b.dataset.tp381LitanyMode){S.litanyMode=b.dataset.tp381LitanyMode==="guided"?"guided":"full";S.litanyStep=0;return render()}
  if(b.hasAttribute("data-tp381-litany-step")){S.litanyStep=Math.max(0,Math.min(6,Number(b.dataset.tp381LitanyStep)||0));return render()}
  if(b.dataset.tp381Hymn){S.hymn=SACRED_HYMNS_V381[b.dataset.tp381Hymn]?b.dataset.tp381Hymn:"te_deum";return render()}
  if(b.dataset.tp381HymnLang){S.hymnLang=["en","fr","la"].includes(b.dataset.tp381HymnLang)?b.dataset.tp381HymnLang:(isFr()?"fr":"en");return render()}
  if(b.dataset.tp381Heart){S.sacredHeart=["litany","reparation","consecration"].includes(b.dataset.tp381Heart)?b.dataset.tp381Heart:"litany";return render()}
  if(b.dataset.tp381Communion){S.communion=b.dataset.tp381Communion==="after"?"after":"before";S.communionStep=0;return render()}
  if(b.dataset.tp381Dying){S.dying=DYING_COMPANION_STAGES.includes(b.dataset.tp381Dying)?b.dataset.tp381Dying:"now";return render()}
  if(b.dataset.tp381DyingStep){const stage=nextDyingCompanionStage(S.dying,b.dataset.tp381DyingStep);if(stage){S.dying=stage;return render()}return;}
  if(b.dataset.tp381Prayer){S.prayerId=b.dataset.tp381Prayer;S.screen="prayer";return render()}
  if(b.dataset.tp381Route){
    const route=b.dataset.tp381Route;
    if(ROUTES[route])return open(route,{trigger:b});
    if(String(route).startsWith("learn.")){
      const prayerRoute=S.route;
      // This is a deliberate cross-domain handoff. Do not schedule the
      // historical donor's return-context navigation while Learn is opening.
      BASE_CLOSE({silent:true});
      void (async()=>{
        try{
          const navigation=await window?.AO_APP_SHELL_V1?.navigate?.("learn");
          if(navigation?.ok!==true)throw new Error("Formation surface refused navigation");
          // The Formation owner must own the child and its return context.
          // A raw registry launch leaves Learn.child unset and can strand
          // users in Formation instead of returning to their bedside prayer.
          const launched=await window?.AO_LEARN_APP_V1?.openModule?.(route,{
            returnContext:{surface:"pray",route:prayerRoute}
          });
          if(launched!==true)throw new Error("Formation child did not open");
          // The app-shell can leave the Prayer donor sheet open during a
          // cross-domain child launch. Explicitly release that interactive
          // overlay after Formation owns the child, or its Back button is
          // visually present but blocked by Prayer's higher z-index.
          if(window?.AO_PRAY_APP_V1?.status?.()?.open===true)
            window?.AO_PRAY_V435930?.close?.({silent:true});
        }catch(error){
          try{window?.console?.error?.("Prayer to Formation handoff failed",error)}catch{}
          const recovered=await window?.AO_APP_SHELL_V1?.navigate?.("pray");
          if(recovered?.ok===true)await window?.AO_MODULES?.open?.(prayerRoute);
        }
      })();
      return;
    }
    return BASE_OPEN(route,{trigger:b,returnContext:{surface:"domain",domain:"pray"}});
  }
  if(b.matches("[data-tp381-flip]")){
    const v=b.querySelector("[data-face-v]"),la=b.querySelector("[data-face-la]");if(v&&la){const showLatin=la.hidden;la.hidden=!showLatin;v.hidden=showLatin}return;
  }
}
function extendRegistry(){
  const MOD=window.AO_MODULES;if(!MOD||MOD.__aoTraditionalPrayV381)return;
  const prior=MOD;
  const wrapper={...prior,__aoTraditionalPrayV381:true,
    get(id){return ROUTES[id]||prior.get?.(id)||null},
    resolve(id){if(ROUTES[id])return {ok:true,input:String(id),id,defaults:{},chain:[id],definition:ROUTES[id]};return prior.resolve?.(id)},
    async open(id,opts={}){if(ROUTES[id])return {ok:open(id,opts),input:String(id),canonicalId:id,type:"module",domain:"pray",options:opts,aliasChain:[id],error:null};return prior.open?.(id,opts)},
    list(filter={}){const xs=[...(prior.list?.(filter)||[])].filter(x=>!ROUTES[x?.id]);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="pray"))xs.push(...Object.values(ROUTES).filter(x=>!x.id.startsWith("mass.")));return xs}
  };
  window.AO_MODULES=wrapper;window.AO_MODULE_REGISTRY_V36=wrapper;
}
function mountRuntime(){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  const PR=window.AO_PRAY_V435930;if(!PR?.open||!PR?.close)return false;
  BASE_OPEN=PR.open.bind(PR);BASE_CLOSE=PR.close.bind(PR);
  const oldOpen=PR.open.bind(PR);
  PR.open=function(id,opts={}){if(ROUTES[id])return open(id,opts);return oldOpen(id,opts)};
  document.addEventListener("click",handleClick,true);
  extendRegistry();
  window.AO_TRADITIONAL_PRAY_V381=Object.freeze({
    version:VERSION,
    routes:ROUTES,
    hymns:SACRED_HYMNS_V381,
    open,
    close:BASE_CLOSE,
    state:()=>({...S}),
    qa:()=>({pass:true,routeCount:Object.keys(ROUTES).length,hymnCount:Object.keys(SACRED_HYMNS_V381).length,morningCount:MORNING_PRAYER_SEQUENCE_V381.length,eveningCount:EVENING_PRAYER_SEQUENCE_V381.length,holyNamePolicy:"OFFLINE_SOURCE_LOCKED",sacredHeartPolicy:"SOURCE_LOCKED_TRADITIONAL",communionTreasuryPolicy:"FRENCH_WORLD_SOURCE_LOCKED",goodDeathPolicy:"ROMAN_ST_JOSEPH_SOURCE_LOCKED",dyingCompanionPolicy:"PASTORAL_NOT_SACRAMENT_SIMULATION",seriousIllnessBridge:"learn.rites.sick",legacyTraditionOwner:false})
  });
  return window.AO_TRADITIONAL_PRAY_V381;
}
export function installTraditionalPrayRuntime({pollMs=40,maxPolls=150}={}){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  let i=0;const tryInstall=()=>{const r=mountRuntime();if(r)return r;if(i++<maxPolls)setTimeout(tryInstall,pollMs);return false};return tryInstall();
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installTraditionalPrayRuntime();
export { ROUTES as TRADITIONAL_PRAY_ROUTES_V381 };
