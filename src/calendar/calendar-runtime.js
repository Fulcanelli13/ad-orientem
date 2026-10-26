import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { formatDisplayDate, parseDisplayDate } from "../app/date-format.js";
import { addDaysIso, buildLiturgicalYear } from "./liturgical-year.js";
import { renderLiturgicalClock, liturgicalClockCss, orderedClockCandidateDates } from "./liturgical-clock.js";
import { romanClassTier } from "./roman-class-tier.js";
import { calendarIntelligenceForDate, calendarPracticeMonthEntries } from "./intelligence.js";
import { pilgrimagePlacesForCalendarKeys } from "./pilgrimage-places.js";
import { renderYearJourney, yearJourneyCss } from "./year-journey.js";
import { calendarCustomRecommendations, calendarCustomSeasonalMonthEntries, calendarCustomArticleIds, calendarCustomArticle } from "./customs-read-model.js";
import { CALENDAR_R18_REVIEW_CANDIDATES } from "./customs-r18-review-pack.js";
import { normaliseCustomSearch, calendarCustomSearchIndex, calendarCustomSearchMatches } from "./customs-search.js";
import { groupCalendarCustomsByYear } from "../customs/year-led-library.js";
import { personalCustomsForDate } from "../customs/personal-store.js";
import { calendarMassColour } from "./colour-projection.js";
import { calendarPaletteColour, yearDailyProjection, yearSeasonGradient } from "./year-colour-wheel.js";
import { serialize1962CalendarMonth, calendarMonthIcsFilename } from "./export-ics.js";
import { assessPrintableProper, renderPrintableProperHtml } from "./print-proper.js";
import { observedCycle } from "./observed-cycle.js";
import { readMonthPreview, writeMonthPreview } from "./month-preview-cache.js";
import {calendarScriptureContexts} from "./scripture-handoff.js";
import {matchingSelectedCalendarScriptureObject} from "./selected-scripture-objects.js";
import { calendarObservanceAlias } from "./observance-title.js";
import { buildReviewedSanctoralCards } from "./reviewed-sanctoral-cards.js";
import { loadSharedSanctoralReadModel } from "./living-sanctoral-read-model.js";
import { canonical1962Commemorations } from "./traditional-day-adjudication.js";
import { calendarRubricalClaimsForDay, calendarColourRubricalClaimsForDay, calendarTransferRubricalClaimsForDay, calendarObservedCommemorationClaimsForDay, calendarInseparableApostlesClaimForDay, calendarOmittedFeastClaimForDay } from "./rubrical-claim-citations.js";
import { observedCommemorationLabels } from "./observed-commemoration-labels.js";
import { renderSecondarySaintSection, SANCTORAL_DAY_CSS } from "./sanctoral-day-ui.js";
import { approvedClassIHeroMarkup, approvedClassIHeroCss } from "./approved-class-i-heroes-2026.js";

const VERSION="modular-calendar-v2-liturgical-year";
const ROOT_ID="ao-calendar-modular-root";

const runtime=()=>globalThis.AO_RUNTIME_V8??null;
const state=()=>runtime()?.store?.getState?.()??null;
const cache=()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345??null;
const dateController=()=>runtime()?.controller?.home??null;
const fr=()=>state()?.language==="fr";
const L=(en,frText)=>fr()?frText:en;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const assetIcon=(assetId,className="aoCalAssetIcon")=>{
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return "";
  return `<span class="${className}" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="display:inline-block;width:1em;height:1em;background:currentColor;-webkit-mask:url(\'${esc(url)}\') center/contain no-repeat;mask:url(\'${esc(url)}\') center/contain no-repeat"></span>`;
};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const dateOf=id=>new Date(`${id}T12:00:00`);
const displayDate=id=>formatDisplayDate(id);
const addDays=(id,n)=>{const d=dateOf(id);d.setDate(d.getDate()+Number(n||0));return iso(d)};

const weekCache=new Map(),dayLoads=new Map(),weekLoads=new Map(),weekStatus=new Map(),monthLoads=new Map(),monthStatus=new Map(),nextMajorResults=new Map(),nextMajorRequests=new Map();
let foregroundWeek="",navEpoch=0,monthEpoch=0;
let selectedScriptureReturn=null; // Ephemeral reciprocal-source journey only.
let yearColourLoad=null,clockSelection=null;
const MONTH_PREVIEW_REVISION="2026-10-20-canonical-resolver-r1";
const monthPreviewMemory=new Map();
const previewStorage=()=>{try{return globalThis.localStorage??null}catch{return null}};

const R18_REVIEW_REGION_STORAGE_KEY="ao.calendar.customs-r18-review-region.v1";
const R18_REVIEW_REGION_OPTIONS=Object.freeze([
  ["IE","Ireland","Irlande"],["PL","Poland","Pologne"],
  ["AT","Austria","Autriche"],["FR-PROVENCE","Provence","Provence"],
  ["ES","Spain","Espagne"]
]);
let r18ReviewRegionCached=null; // null means not yet read; empty string means opt-out
function r18ReviewRegion(){
  if(r18ReviewRegionCached!==null)return r18ReviewRegionCached;
  let saved="";try{saved=previewStorage()?.getItem(R18_REVIEW_REGION_STORAGE_KEY)||""}catch{}
  r18ReviewRegionCached=R18_REVIEW_REGION_OPTIONS.some(item=>item[0]===saved)?saved:"";
  return r18ReviewRegionCached;
}
function setR18ReviewRegion(next){
  const valid=R18_REVIEW_REGION_OPTIONS.some(item=>item[0]===next)?next:"";
  r18ReviewRegionCached=valid;
  try{const storage=previewStorage();if(valid)storage?.setItem(R18_REVIEW_REGION_STORAGE_KEY,valid);
      else storage?.removeItem(R18_REVIEW_REGION_STORAGE_KEY)}catch{}
}
function r18ReviewSelectorMarkup(){
  const selected=r18ReviewRegion();
  const options=[["",L("None — published customs only","Aucune — coutumes publiées uniquement"),L("None — published customs only","Aucune — coutumes publiées uniquement")],...R18_REVIEW_REGION_OPTIONS];
  return '<div class="aoCalR18ReviewChoice">'
    +'<label for="aoCalR18ReviewRegion">'+esc(L("Regional customs — editorial preview","Coutumes régionales — aperçu éditorial"))+'</label>'
    +'<select id="aoCalR18ReviewRegion" data-cal-r18-review-region aria-label="'+esc(L("Choose a regional customs preview","Choisir une région à prévisualiser"))+'">'
    +options.map(([value,en,frText])=>'<option value="'+esc(value)+'"'+(selected===value?' selected':'')+'>'+esc(fr()?frText:en)+'</option>').join("")
    +'</select>'
    +'<small>'+esc(L("Optional unpublished drafts, not new feast days or local event schedules.","Projets non publiés, facultatifs, sans nouvelles fêtes ni horaires locaux."))+'</small>'
    +'</div>';
}

function monthPreviewFor(monthId){
  const lang=fr()?"fr":"en",key=monthId+"|"+lang;
  if(!monthPreviewMemory.has(key))monthPreviewMemory.set(key,readMonthPreview(previewStorage(),monthId,lang,MONTH_PREVIEW_REVISION)||new Map());
  return monthPreviewMemory.get(key);
}
function saveResolvedMonthPreview(monthId){
  if(!monthVerified(monthId))return false;
  const rows=monthGridIds(monthId).map(date=>{
    const raw=weekCache.get(date),tier=rankTier(raw,date);
    return {date,title:titleOf(raw),rank:rankOf(raw),colour:colourOf(raw),tier,
      cycle:observedCycle(raw),accent:liturgicalAccent(raw),commemorationCount:commemorations(raw).length};
  });
  if(!rows.every(x=>x.title))return false;
  const lang=fr()?"fr":"en",ok=writeMonthPreview(previewStorage(),monthId,lang,MONTH_PREVIEW_REVISION,rows);
  if(ok)monthPreviewMemory.set(monthId+"|"+lang,new Map(rows.map(x=>[x.date,x])));
  return ok;
}
const CALENDAR_VIEWS=new Set(["day","year","picker"]);
const MONTH_INDEX_VIEWS=new Set(["calendar","temporale","sanctorale"]);
const legacyMonthView=view=>view==="major"||view==="practices"?"calendar":view;
let calendarView="day",calendarMonthView="calendar",pickerMonthId="",requestedView=null,requestedMonthView=null,focusedYearPeriodId=null;
let pilgrimageCorpus=null,pilgrimageLoad=null;
let secondarySaintModel=null,secondarySaintLoad=null;
let rubricClaimLedger=null,rubricClaimLoad=null,rubricClaimAttempted=false;
const rubricClaimUrl=new URL("../../data/calendar/1962-privileged-commemorations.v1.json",import.meta.url).href;
let colourClaimLedger=null,colourClaimAttempted=false;
const colourClaimUrl=new URL("../../data/calendar/1962-ordo-corrections.v1.json",import.meta.url).href;
let transferLedger=null,transferAttempted=false;
const transferUrl=new URL("../../data/calendar/1962-transfer-oracle.v1.json",import.meta.url).href;
function loadCalendarTransferClaims(){
 if(transferAttempted||typeof globalThis.fetch!=="function")return;
 transferAttempted=true;
 void globalThis.fetch(transferUrl,{headers:{accept:"application/json"}})
  .then(response=>response.ok?response.json():null)
  .then(json=>{
   if(json?.schema==="ao-1962-observance-transfer-oracle-v1")transferLedger=json;
   if(transferLedger&&root()&&calendarView==="day")paint();
  })
  .catch(error=>console.warn("Calendar transfer witnesses unavailable",error));
}
function loadCalendarColourClaims(){
 if(colourClaimAttempted||typeof globalThis.fetch!=="function")return;
 colourClaimAttempted=true;
 void globalThis.fetch(colourClaimUrl,{headers:{accept:"application/json"}})
  .then(response=>response.ok?response.json():null)
  .then(json=>{if(json?.schema==="AO_1962_CALENDAR_CORRECTIONS_V1")colourClaimLedger=json;
    if(colourClaimLedger&&root()&&calendarView==="day")paint();})
  .catch(error=>console.warn("Calendar colour clause witnesses unavailable",error));
}
function loadCalendarRubricalClaims(){
  if(rubricClaimAttempted||typeof globalThis.fetch!=="function")return;
  rubricClaimAttempted=true;
  rubricClaimLoad=globalThis.fetch(rubricClaimUrl,{headers:{accept:"application/json"}})
    .then(response=>response.ok?response.json():null)
    .then(json=>{
      if(json?.schema==="AO_1962_PRIVILEGED_COMMEMORATIONS_V1")rubricClaimLedger=json;
      if(rubricClaimLedger&&root()&&calendarView==="day")paint();
    })
    .catch(error=>console.warn("Calendar rubrical witnesses unavailable",error))
    .finally(()=>{rubricClaimLoad=null});
}
const pilgrimageDataUrl=new URL("../../data/shrines/shrines-pilgrimages-seed.v1.json",import.meta.url).href;
function loadCalendarPilgrimagePlaces(){
  if(pilgrimageCorpus||pilgrimageLoad||typeof globalThis.fetch!=="function")return;
  pilgrimageLoad=globalThis.fetch(pilgrimageDataUrl,{headers:{accept:"application/json"}})
    .then(response=>response.ok?response.json():null)
    .then(json=>{if(json?.schema==="SHRINES_PILGRIMAGES_SEED_V1")pilgrimageCorpus=json;if(root())paint();})
    .catch(error=>{console.warn("Calendar pilgrimage associations unavailable",error)})
    .finally(()=>{pilgrimageLoad=null});
}

// Same verified read-model as Home: a single lazy network request.
function loadCalendarSecondarySaints(){
  if(secondarySaintModel||secondarySaintLoad)return;
  secondarySaintLoad=loadSharedSanctoralReadModel()
    .then(json=>{
      if(json)secondarySaintModel=json;
      if(json&&root()&&calendarView==="day")paint();
    })
    .catch(error=>console.warn("Supplementary saint cards unavailable",error))
    .finally(()=>{secondarySaintLoad=null});
}
function weekStart(id){const d=dateOf(id);d.setDate(d.getDate()-d.getDay());return iso(d)}
function weekIds(id){const s=weekStart(id);return Array.from({length:7},(_,i)=>addDays(s,i))}
function weekReady(id){return weekIds(id).every(x=>weekCache.has(x))}
function monthGridIds(monthId){
  const [y,m]=String(monthId||"").split("-").map(Number);
  if(!y||!m||m<1||m>12)return [];
  const first=new Date(y,m-1,1,12),start=new Date(first);start.setDate(first.getDate()-first.getDay());
  return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return iso(d)});
}
function monthReady(monthId){const ids=monthGridIds(monthId);return ids.length===42&&ids.every(x=>weekCache.has(x))}
// A month may be fully attempted but contain failures. It must not be called verified.
function monthVerified(monthId){const ids=monthGridIds(monthId);return ids.length===42&&ids.every(x=>{const r=weekCache.get(x);return r&&r.status!=="failed"&&r.day})}
// Major-day candidates only tell us what future dates to resolve.
// Never display a candidate's feast title, rank, or colour as observed Mass data.
function nextMajorCandidateDates(selected){
  return Array.from({length:21},(_,i)=>addDays(selected,i+1));
}
function nextResolvedMajorCelebration(selected){
  const found=nextMajorResults.get(selected);
  if(found?.r){
    const name=titleOf(found.r); // Recompute for the current language.
    return {date:found.date,en:name,fr:name,verified:true};
  }
  if(!nextMajorResults.has(selected)&&!nextMajorRequests.has(selected))
    queueMicrotask(()=>{if(!nextMajorResults.has(selected)&&!nextMajorRequests.has(selected))void loadNextResolvedMajor(selected)});
  return null;
}
async function loadNextResolvedMajor(selected){
  const promise=(async()=>{
    let found=null;
    for(const date of nextMajorCandidateDates(selected)){
      const r=await resolveOne(date),tier=rankTier(r,date);
      if(r?.status==="failed"||!r?.day){found={unavailable:true};break} // Cannot claim "next" across an unresolved earlier day.
      if(tier>0&&tier<=2){found={date,r};break}
    }
    nextMajorResults.set(selected,found?.r?found:{unavailable:true});
    if(root()&&state()?.selectedDate===selected&&calendarView!=="picker")paint();
    return found;
  })().catch(error=>{
    console.error("Calendar upcoming observance check failed",error);
    nextMajorResults.set(selected,{unavailable:true});return null;
  }).finally(()=>nextMajorRequests.delete(selected));
  nextMajorRequests.set(selected,promise);
  return promise;
}
function rankTier(r,id){
  // The source-resolved day remains authoritative. This is presentation only.
  if(!r||r.status==="failed"||!r.day||r.date!==id)return 0;
  return romanClassTier(rankOf(r));
}
function monthCellData(id){
  const raw=weekCache.get(id),r=raw?.status!=="failed"&&raw?.day?raw:null;
  const preview=r?null:monthPreviewFor(pickerMonthId).get(id);
  const sunday=dateOf(id).getDay()===0,tier=r?rankTier(r,id):(preview?.tier??0);
  const cycle=r?observedCycle(r):(preview?.cycle??"unknown");
  const name=r?titleOf(r):(preview?.title??""),accent=r?liturgicalAccent(r):(preview?.accent??"#59626c");
  const rank=r?rankOf(r):(preview?.rank??""),colour=r?colourOf(r):(preview?.colour??"");
  const commemorationCount=r?commemorations(r).length:(preview?.commemorationCount??0);
  const aria=[displayDate(id),name,r?null:preview?L("From saved month overview; checking day","D'après le mois enregistré ; vérification en cours"):L("Loading day","Chargement du jour"),rank,colour,
    commemorationCount?L("Commemorations: ","Commémorations : ")+commemorationCount:null].filter(Boolean).join(" · ");
  return {r,sunday,tier,cycle,name,projected:false,accent,rank,colour,commemorationCount,aria,ready:!!r,preview:!!preview};
}

function monthDateIds(monthId){
  return monthGridIds(monthId).filter(id=>id.slice(0,7)===String(monthId||""));
}
// Never export projected feast candidates, unverified liturgical identities
// or a month missing even one resolved principal observance. Proper-text
// transport failures must not block exporting an otherwise resolved Ordo.
function exportableMonthRows(monthId){
  const ids=monthDateIds(monthId);
  if(!ids.length)return null;
  const rows=ids.map(id=>weekCache.get(id));
  return rows.every((r,i)=>r?.date===ids[i]&&r?.status!=="failed"&&r?.day?.main&&String(r.day.main.title||r.proper?.data?.name||"").trim()&&String(r.day.main.rank||r.proper?.data?.rank||"").trim()&&calendarMassColour(r).trim())
    ?rows:null;
}
function downloadMonthIcs(monthId){
  const feedback=root()?.querySelector("[data-cal-export-error]");
  const rows=exportableMonthRows(monthId);
  if(!rows){if(feedback)feedback.textContent=L("The complete resolved month is required before export.","Le mois intégralement résolu est nécessaire avant l’export.");return false}
  try{
    const content=serialize1962CalendarMonth(monthId,rows,{language:fr()?"fr":"en"});
    const url=URL.createObjectURL(new Blob([content],{type:"text/calendar;charset=utf-8"}));
    const anchor=globalThis.document.createElement("a");
    anchor.href=url;anchor.download=calendarMonthIcsFilename(monthId);anchor.hidden=true;
    globalThis.document.body.append(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    if(feedback)feedback.textContent="";
    return true;
  }catch(error){
    if(feedback)feedback.textContent=L("Calendar export unavailable; no incomplete file was created.","Export impossible ; aucun fichier incomplet n’a été créé.");
    console.error("1962 Calendar export rejected unverified data",error);
    return false;
  }
}
function principalSaintContext(r,id){
  if(observedCycle(r,id)!=="sanctorale")return null;
  const title=titleOf(r);
  const marian=/\b(?:our lady|blessed virgin|virgin mary|immaculate|assumption|purification|annunciation|rosary|notre[- ]dame|sainte vierge|bienheureuse vierge|immacul[eé]e|assomption|purification|annonciation|rosaire)\b/i.test(title);
  return {date:id,title,marian,label:marian?L("Marian feast","Fête mariale"):L("Saint / feast","Saint / fête")};
}
async function openSaintDetail(id){
  const target=String(id||state()?.selectedDate||"");if(!target)return false;
  const ok=await select(target,{closeAfter:false});if(!ok)return false;
  try{
    const result=await Promise.resolve(globalThis.AO_MODULES?.open?.("today.saint",{returnContext:{surface:"calendar",view:"day",date:target}}));
    return result?.ok===true||result===true||Boolean(globalThis.AO_NAV_V25?.getState?.()?.panel==="saint");
  }catch(error){console.error("Calendar saint detail failed",error);return false}
}
function monthEntry(id){
  const raw=weekCache.get(id),r=raw?.status!=="failed"&&raw?.day?raw:null;
  if(!r)return null;
  const title=titleOf(r),rank=rankOf(r),colour=colourOf(r),cycle=observedCycle(r,id),tier=rankTier(r,id),sunday=dateOf(id).getDay()===0;
  return {date:id,r,title,rank,colour,cycle,tier,sunday,commemorations:commemorations(r),accent:liturgicalAccent(r)};
}
function monthIndexEntries(monthId,view){
  if(view==="practices")return calendarPracticeMonthEntries(monthId,{fr:fr()}).map(x=>({
    ...x,rank:x.summary||L("Traditional practice","Pratique traditionnelle"),colour:"",
    accent:periodUiColour(buildLiturgicalYear(x.date).currentPeriod.color)
  }));
  const entries=monthDateIds(monthId).map(monthEntry).filter(Boolean);
  if(view==="major")return entries.filter(x=>x.sunday||(x.tier>0&&x.tier<=2));
  if(view==="temporale")return entries.filter(x=>x.cycle==="temporale");
  if(view==="sanctorale")return entries.filter(x=>x.cycle==="sanctorale");
  return entries;
}

/* Month hybrid: observed major feasts and independent traditional practices
   share the Calendar overview without being represented as the same authority. */
function monthHybridOverview(monthId,selected){
  const principal=monthIndexEntries(monthId,"major"),practices=monthIndexEntries(monthId,"practices");
  const majorStatus=monthIndexResolutionState(monthId,"major");
  const seasonalCustoms=calendarCustomSeasonalMonthEntries(monthId,{fr:fr()});
  const majorCards=principal.map((item,i)=>
    `<button type="button" class="aoCalHybridMajor${i<2?" featured":""}" data-cal-month-index-date="${esc(item.date)}" style="--month-accent:${esc(item.accent)}">
      <span class="aoCalHybridDate">${esc(displayDate(item.date))}</span>
      <span class="aoCalHybridTitle">${esc(item.title)}</span>
      <small>${esc([item.rank,item.colour].filter(Boolean).join(" · "))}</small>
    </button>`).join("");
  const practiceCards=practices.map(item=>
    `<button type="button" class="aoCalHybridPractice" data-cal-month-index-date="${esc(item.date)}">
      <time>${esc(displayDate(item.date))}</time><span><strong>${esc(item.title)}</strong>${item.summary?`<small>${esc(item.summary)}</small>`:""}</span>
      <span aria-hidden="true">›</span>
    </button>`).join("");
  return `<div class="aoCalHybridOverview" aria-label="${esc(L("Month overview","Aperçu du mois"))}">
    <section class="aoCalHybridSection aoCalHybridMajorSection">
      <div class="aoCalHybridHeading"><h3>${esc(L("Major celebrations","Grandes célébrations"))}</h3></div>
      ${majorStatus==="partial"?`<p class="aoCalMonthCoverage" role="status">${esc(L("Some observed days could not be resolved.","Certains jours observés n'ont pas pu être résolus."))}</p>`:""}
      <div class="aoCalHybridMajors">${majorCards||`<p class="aoCalHybridEmpty">${esc(majorStatus==="loading"?L("Resolving this month’s celebrations…","Résolution des célébrations du mois…"):L("No resolved principal celebrations.","Aucune célébration principale résolue."))}</p>`}</div>
    </section>
    <section class="aoCalHybridSection aoCalHybridPracticesSection">
      <div class="aoCalHybridHeading"><h3>${esc(L("Practices & customs","Pratiques et coutumes"))}</h3><button type="button" class="aoCalV2TextLink" data-cal-customs-open>${esc(L("All traditions","Toutes les coutumes"))} →</button></div>
      ${seasonalCustoms.length?`<div class="aoCalCustomMonthContext"><small>${esc(L("CUSTOMS OF THE SEASON","COUTUMES DE LA SAISON"))}</small>${seasonalCustoms.map(item=>calendarCustomArticle(item.id)).filter(Boolean).map(calendarCustomArticleMarkup).join("")}</div>`:""}
      <div class="aoCalHybridPractices">${practiceCards||(seasonalCustoms.length?"":`<p class="aoCalHybridEmpty">${esc(L("No featured practices for this month.","Aucune pratique signalée pour ce mois."))}</p>`)}</div>
      <button type="button" class="aoCalMyCustomsButton" data-cal-my-customs-open>${esc(L("My Customs & Prayers","Mes coutumes et prières"))} →</button>
    </section>
  </div>`;
}

function monthIndexTabs(){
  const tabs=[
    ["calendar",L("All","Tout")],
    ["temporale",L("Temporale","Temporal")],
    ["sanctorale",L("Sanctorale","Sanctoral")],
  ];
  return `<nav class="aoCalMonthTabs" aria-label="${esc(L("Show in calendar","Afficher dans le calendrier"))}">${tabs.map(([id,label])=>`<button type="button" data-cal-month-view="${id}" class="${calendarMonthView===id?"active":""}" ${calendarMonthView===id?'aria-current="page"':""}>${esc(label)}</button>`).join("")}</nav>`;
}

// Month-index categories depend on actual resolved days; practices come from
// their own registry and must not be blocked by an unrelated day-resolution job.
function monthIndexResolutionState(monthId,view){
 if(view==="practices")return "independent";
 const ids=monthDateIds(monthId),missing=ids.filter(id=>!weekCache.has(id));
 if(missing.length)return "loading";
 const failed=ids.some(id=>{const r=weekCache.get(id);return !r?.day||r.status==="failed"});
 return failed?"partial":"complete";
}
function monthIndexList(monthId,selected,view){
  const rows=monthIndexEntries(monthId,view);
  const unknownRows=(view==="temporale"||view==="sanctorale")?monthDateIds(monthId).map(monthEntry).filter(x=>x?.cycle==="unknown"):[];
  const status=monthIndexResolutionState(monthId,view);
  const label=view==="major"?L("Major days","Jours majeurs"):view==="temporale"?L("Temporale","Temporal"):view==="sanctorale"?L("Sanctorale","Sanctoral"):L("Practices","Pratiques");
  const explanation=view==="major"
    ?L("Sundays, I–II class observances and other principal days in this month.","Dimanches, célébrations de I–II classe et autres jours principaux de ce mois.")
    :view==="temporale"
      ?L("Observed days belonging to the temporal cycle and movable season.","Jours observés appartenant au cycle temporal et aux temps mobiles.")
      :view==="sanctorale"
        ?L("Observed saints and fixed-cycle celebrations for this month.","Saints et célébrations du cycle fixe effectivement observés ce mois.")
        :L("Traditional devotions and novena starts for dates in this month.","Dévotions traditionnelles et débuts de neuvaines aux dates de ce mois.");

  if(view==="temporale"){
    const entries=rows.map(x=>`<li class="aoCalMonthTimeEntry${x.sunday?" sunday":""}" style="--month-accent:${esc(x.accent)}">
      <button type="button" data-cal-month-index-date="${esc(x.date)}" class="aoCalMonthTimeButton">
        <time datetime="${esc(x.date)}">${esc(displayDate(x.date))}</time>
        <span><strong>${esc(x.title)}</strong><small>${esc([x.rank,x.colour].filter(Boolean).join(" · "))}</small></span>
        <span aria-hidden="true">›</span>
      </button>
    </li>`).join("");
    const unclassified=unknownRows.length?`<details class="aoCalMonthUnclassified"><summary>${esc(L("Unclassified days · "+unknownRows.length,"Jours non classés · "+unknownRows.length))}</summary>
      <p>${esc(L("These resolved days have not been classified as Temporale or Sanctorale by their source identity.","L'identité des sources ne permet pas de classer ces jours résolus comme temporal ou sanctoral."))}</p>
      ${unknownRows.map(x=>`<button type="button" data-cal-month-index-date="${esc(x.date)}">${esc(displayDate(x.date))} · ${esc(x.title)}</button>`).join("")}
    </details>`:"";
    return `<section class="aoCalMonthIndex aoCalMonthTimelineSurface" data-cal-month-index="temporale">
      <div class="aoCalMonthIndexHead"><small>${esc(label.toUpperCase())}</small><p>${esc(explanation)}</p></div>
      ${status==="partial"?`<p class="aoCalMonthCoverage" role="status">${esc(L("Some liturgical days are unavailable; this list is incomplete.","Certains jours liturgiques sont indisponibles ; cette liste est incomplète."))}</p>`:""}
      ${entries?`<ol class="aoCalMonthTimeline">${entries}</ol>`:`<div class="aoCalMonthEmpty">${esc(status==="loading"?L("Resolving the month…","Résolution du mois…"):L("No confirmed Temporale days in this month.","Aucun jour confirmé du temporal ce mois."))}</div>`}
      ${unclassified}
    </section>`;
  }
  if(view==="major"){
    const cards=rows.map((x,i)=>`<button type="button" data-cal-month-index-date="${esc(x.date)}" class="aoCalHybridMajor${i<2?" featured":""}" style="--month-accent:${esc(x.accent)}">
      <span class="aoCalHybridDate">${esc(displayDate(x.date))}</span><span class="aoCalHybridTitle">${esc(x.title)}</span>
      <small>${esc([x.rank,x.colour].filter(Boolean).join(" · "))}</small>
    </button>`).join("");
    return `<section class="aoCalMonthIndex aoCalMonthMajorEditorial" data-cal-month-index="major">
      <div class="aoCalMonthIndexHead"><small>${esc(label.toUpperCase())}</small><p>${esc(explanation)}</p></div>
      ${status==="partial"?`<p class="aoCalMonthCoverage" role="status">${esc(L("Some liturgical days are unavailable; this list is incomplete.","Certains jours liturgiques sont indisponibles ; cette liste est incomplète."))}</p>`:""}
      <div class="aoCalHybridMajors">${cards||`<div class="aoCalMonthEmpty">${esc(status==="loading"?L("Resolving this month…","Résolution du mois…"):L("No resolved principal celebrations.","Aucune célébration principale résolue."))}</div>`}</div>
    </section>`;
  }
  return `<section class="aoCalMonthIndex" data-cal-month-index="${view}">
    <div class="aoCalMonthIndexHead"><small>${esc(label.toUpperCase())}</small><p>${esc(explanation)}</p></div>
    ${rows.length&&status==="partial"?`<p class="aoCalMonthCoverage" role="status">${esc(L("Some liturgical days are unavailable; this list is incomplete.","Certains jours liturgiques sont indisponibles ; cette liste est incomplète."))}</p>`:""}
    ${unknownRows.length?`<div class="aoCalMonthCoverage" data-cal-unclassified role="status"><p>${esc(L("Some resolved days cannot yet be assigned to Temporale or Sanctorale from their source identity; they are excluded from both indexes.","Certains jours résolus ne peuvent pas encore être classés dans le temporal ou le sanctoral selon leur source ; ils sont exclus des deux index."))}</p><div>${unknownRows.map(x=>`<button type="button" data-cal-month-index-date="${esc(x.date)}">${esc(displayDate(x.date))} · ${esc(x.title)}</button>`).join("")}</div></div>`:""}
    ${rows.length?`<div class="aoCalMonthIndexList">${rows.map(x=>`<div class="aoCalMonthIndexRow" style="--month-accent:${esc(x.accent)}">
      <button type="button" data-cal-month-index-date="${x.date}" class="aoCalMonthIndexDay ${x.date===selected?"selected":""}">
        <time>${esc(displayDate(x.date))}</time>
        <span class="aoCalMonthIndexText"><strong>${esc(x.title)}</strong><small>${esc([x.rank,x.colour].filter(Boolean).join(" · "))}</small></span>
        <i aria-hidden="true"></i>
      </button>
      ${view==="sanctorale"?`<button type="button" class="aoCalMonthSaintDetail" data-cal-saint-date="${x.date}" aria-label="${esc(L("Life & sources","Vie & sources"))}">${esc(L("Life & sources","Vie & sources"))} →</button>`:""}
    </div>`).join("")}</div>`:`<div class="aoCalMonthEmpty">${esc(status==="loading"?L("Resolving this month’s liturgical days. Results will appear as they become available.","Résolution des jours liturgiques de ce mois. Les résultats apparaîtront progressivement."):status==="partial"?L("Some days could not be resolved; this list may be incomplete.","Certains jours n’ont pas pu être résolus ; cette liste peut être incomplète."):L("No resolved observances in this category for the month.","Aucune célébration résolue dans cette catégorie pour ce mois."))}</div>`}
  </section>`;
}
function updateMonthStatusDom(monthId){
  if(calendarView!=="picker"||pickerMonthId!==monthId)return;
  const el=root()?.querySelector?.("[data-cal-month-status]");if(!el)return;
  const ids=monthGridIds(monthId),s=monthStatus.get(monthId),done=ids.filter(x=>weekCache.has(x)).length;
  const errors=ids.filter(x=>weekCache.has(x)&&(!weekCache.get(x)?.day||weekCache.get(x)?.status==="failed")).length;
  el.textContent=monthVerified(monthId)?"":monthReady(monthId)?L("Some dates unavailable","Certaines dates indisponibles"):L("Loading dates…","Chargement des dates…");
}
function hydrateMonthCell(id){
  if(calendarView!=="picker"||!pickerMonthId)return;
  const cell=root()?.querySelector?.(`[data-cal-pick-date="${id}"]`);if(!cell)return;
  const data=monthCellData(id);
  cell.style.setProperty("--month-accent",data.accent);
  cell.dataset.ready=data.ready?"1":"0";
  cell.dataset.preview=data.preview?"1":"0";
  cell.dataset.rankTier=String(data.tier);
  cell.dataset.cycle=data.cycle;
  cell.classList.toggle("sunday",data.sunday);
  cell.classList.toggle("major",data.tier>0&&data.tier<=2);
  cell.classList.toggle("projected",data.projected);
  cell.setAttribute("aria-label",data.aria+(cell.classList.contains("hasPractice")?" · "+L("Traditional practice","Pratique traditionnelle"):""));
  const name=cell.querySelector?.(".aoCalMonthName");if(name)name.textContent=data.name;
  let mark=cell.querySelector?.(".aoCalMonthCommemorations");
  if(data.commemorationCount){
    if(!mark){mark=globalThis.document?.createElement?.("span");if(mark){mark.className="aoCalMonthCommemorations";mark.setAttribute("aria-hidden","true");cell.append(mark)}}
    if(mark)mark.textContent="+"+data.commemorationCount;
  }else mark?.remove?.();
}
function weekLabel(id){const ids=weekIds(id);return `${displayDate(ids[0])} – ${displayDate(ids[6])}`}
function seedCurrent(){const s=state(),r=s?.resolution;if(s&&!s.resolving&&r?.date===s.selectedDate&&!weekCache.has(s.selectedDate))weekCache.set(s.selectedDate,r)}
function cinemaLoader(){return globalThis.document?.getElementById?.("ao-cinema-loader")??null}
function loaderText(done,total,id,errors=0){
  const el=cinemaLoader();if(!el)return;
  const title=el.querySelector("[data-ao-cinema-loader-title]"),sub=el.querySelector("[data-ao-cinema-loader-sub]");
  if(title)title.textContent=L("Preparing the liturgical week","Préparation de la semaine liturgique");
  const progress=L(`${done} of ${total} days prepared`,`${done} jours sur ${total} préparés`);
  const err=errors?` · ${L(`${errors} unavailable`,`${errors} indisponible${errors>1?'s':''}`)}`:"";
  if(sub)sub.textContent=`${weekLabel(id)} · ${progress}${err}`;
  el.dataset.weekProgress=L("1962 calendar · complete week","Calendrier 1962 · semaine complète");
}
function showWeekLoader(id,done=0,total=7,errors=0){
  const el=cinemaLoader();if(!el)return;
  foregroundWeek=weekStart(id);clearTimeout(el.__aoWeekHideTimer);el.dataset.kind="calendar-week";
  loaderText(done,total,id,errors);el.classList.add("aoCinemaLoaderOn");el.setAttribute("aria-hidden","false");
}
function hideWeekLoader(){
  const el=cinemaLoader();foregroundWeek="";if(!el)return;
  if(el.dataset.kind==="calendar-week"){el.classList.remove("aoCinemaLoaderOn");el.removeAttribute("data-kind");el.removeAttribute("data-week-progress");el.setAttribute("aria-hidden","true")}
}
function failedResolution(id,msg){return {status:"failed",date:id,day:{main:{title:L("Calendar unavailable","Calendrier indisponible"),rank:"",color:""},commemorations:[]},proper:{status:"failed",data:null,error:msg||"Calendar resolution failed"},colourPlan:null,error:msg||"Calendar resolution failed",diagnostic:{warnings:[],errors:[msg||"Calendar resolution failed"]}}}
async function resolveOne(id){
  if(weekCache.has(id))return weekCache.get(id);
  if(dayLoads.has(id))return dayLoads.get(id);
  const p=(async()=>{
    const resolver=runtime()?.resolver;if(!resolver?.resolveDay){const r=failedResolution(id,"Resolver unavailable");weekCache.set(id,r);return r}
    try{const r=await resolver.resolveDay(id),safe=r?.date===id?r:failedResolution(id,"Resolver returned mismatched date");weekCache.set(id,safe);return safe}
    catch(error){const r=failedResolution(id,String(error?.message||error));weekCache.set(id,r);return r}
  })().finally(()=>dayLoads.delete(id));
  dayLoads.set(id,p);return p;
}
async function prepareWeek(id,{foreground=false,concurrency=3,skipSeed=false}={}){
  if(!skipSeed)seedCurrent();const key=weekStart(id),ids=weekIds(id);if(weekReady(id))return ids.map(x=>weekCache.get(x));
  const existing=weekLoads.get(key);if(existing){if(foreground){const z=weekStatus.get(key)||{done:ids.filter(x=>weekCache.has(x)).length,errors:0};showWeekLoader(id,z.done,7,z.errors)}return existing}
  const s={done:ids.filter(x=>weekCache.has(x)).length,errors:ids.filter(x=>weekCache.get(x)?.status==="failed").length,total:7};weekStatus.set(key,s);if(foreground)showWeekLoader(id,s.done,7,s.errors);
  const missing=ids.filter(x=>!weekCache.has(x));let cursor=0;
  const worker=async()=>{while(cursor<missing.length){const index=cursor++,day=missing[index],r=await resolveOne(day);s.done++;if(r?.status==="failed"||!r?.day)s.errors++;weekStatus.set(key,{...s});if(foregroundWeek===key)loaderText(s.done,7,id,s.errors)}};
  const p=Promise.all(Array.from({length:Math.min(Math.max(1,concurrency),Math.max(1,missing.length))},worker)).then(()=>ids.map(x=>weekCache.get(x))).finally(()=>weekLoads.delete(key));
  weekLoads.set(key,p);return p;
}
async function prepareMonth(monthId,{concurrency=3,token=monthEpoch}={}){
  const key=String(monthId||""),ids=monthGridIds(key);if(ids.length!==42)return [];
  if(monthReady(key)){monthStatus.set(key,{done:42,total:42,errors:ids.filter(x=>weekCache.get(x)?.status==="failed").length});updateMonthStatusDom(key);return ids.map(x=>weekCache.get(x))}
  const existing=monthLoads.get(key);if(existing){if(monthStatus.get(key)?.token===token)return existing;await existing;if(token!==monthEpoch)return ids.map(x=>weekCache.get(x))}
  const status={done:ids.filter(x=>weekCache.has(x)).length,total:42,errors:ids.filter(x=>weekCache.get(x)?.status==="failed").length,token};monthStatus.set(key,status);updateMonthStatusDom(key);
  const missing=ids.filter(x=>!weekCache.has(x));let cursor=0;
  const worker=async()=>{while(cursor<missing.length&&token===monthEpoch){const day=missing[cursor++],r=await resolveOne(day);status.done++;if(r?.status==="failed"||!r?.day)status.errors++;monthStatus.set(key,{...status});hydrateMonthCell(day);updateMonthStatusDom(key)}};
  const p=Promise.all(Array.from({length:Math.min(Math.max(1,concurrency),Math.max(1,missing.length))},worker))
    .then(()=>ids.map(x=>weekCache.get(x)))
    .finally(()=>monthLoads.delete(key));
  monthLoads.set(key,p);
  const result=await p;
  if(monthVerified(key))saveResolvedMonthPreview(key);
  if(token===monthEpoch&&calendarView==="picker"&&pickerMonthId===key)paint();
  return result;
}
async function retryFailedMonth(){
 const key=pickerMonthId,ids=monthGridIds(key);if(!ids.length)return false;
 if(monthLoads.has(key))await monthLoads.get(key);
 if(calendarView!=="picker"||pickerMonthId!==key)return false;
 const failed=ids.filter(id=>weekCache.has(id)&&(!weekCache.get(id)?.day||weekCache.get(id)?.status==="failed"));
 if(!failed.length)return false;
 for(const id of failed){weekCache.delete(id);weekStatus.delete(weekStart(id))}
 const token=++monthEpoch;await prepareMonth(key,{concurrency:3,token});return monthVerified(key);
}
function requestPickerMonth(){
  if(calendarView!=="picker"||!pickerMonthId)return false;
  if(monthLoads.has(pickerMonthId)&&monthStatus.get(pickerMonthId)?.token===monthEpoch)return true;
  const token=++monthEpoch;void prepareMonth(pickerMonthId,{concurrency:3,token});return true;
}
function applyCached(id){
  const r=weekCache.get(id),rt=runtime(),store=rt?.store;if(!r||!store)return false;
  const home=rt?.controller?.home;if(home&&typeof home.resolutionToken==="number")home.resolutionToken++;
  const s=store.getState();if(s?.selectedDate!==id)store.dispatch({type:"set-date",date:id});
  store.dispatch({type:"resolve-complete",resolution:r});return store.getState()?.resolution?.date===id;
}
function cancelPendingNavigation(){navEpoch++;monthEpoch++;foregroundWeek="";hideWeekLoader();return true}
function hideWeekLoaderAfterPaint(token){
  const done=()=>{if(token===navEpoch)hideWeekLoader()};
  if(typeof globalThis.requestAnimationFrame==="function")globalThis.requestAnimationFrame(()=>globalThis.requestAnimationFrame(done));
  else queueMicrotask(done);
}
async function revealDate(id,{forceLoader=false,prefetch=true,skipSeed=false}={}){
  const token=++navEpoch,needs=!weekReady(id);
  if(needs||forceLoader)showWeekLoader(id,weekStatus.get(weekStart(id))?.done||0,7,weekStatus.get(weekStart(id))?.errors||0);
  await prepareWeek(id,{foreground:needs||forceLoader,concurrency:3,skipSeed});
  if(token!==navEpoch)return false;
  const applied=applyCached(id);if(token!==navEpoch)return false;
  paint();
  if(needs||forceLoader)hideWeekLoaderAfterPaint(token);
  if(prefetch&&token===navEpoch)setTimeout(()=>prefetchNeighbours(id),240);
  return applied;
}
function prefetchNeighbours(id){
  const prev=addDays(weekStart(id),-7),next=addDays(weekStart(id),7);
  void Promise.all([prepareWeek(prev,{foreground:false,concurrency:2}),prepareWeek(next,{foreground:false,concurrency:2})])
    .then(()=>{if(root()&&state()?.selectedDate===id&&calendarView!=="picker")paint()})
    .catch(error=>console.error("Calendar neighbour prefetch failed",error));
}
function installWeekCacheApi(){
  const api=Object.freeze({
    version:"43.45-modular-exact",open:()=>revealDate(state()?.selectedDate||iso(new Date()),{forceLoader:!weekReady(state()?.selectedDate||iso(new Date())),prefetch:true}),
    revealDate,prepareWeek,weekIds,weekReady,cancel:cancelPendingNavigation,
    inspect:()=>{const id=state()?.selectedDate||iso(new Date()),ids=weekIds(id);return {version:"43.45-modular-exact",selectedDate:id,weekStart:weekStart(id),weekReady:weekReady(id),cachedDates:[...weekCache.keys()].sort(),visibleWeek:ids.map(x=>({date:x,cached:weekCache.has(x),status:weekCache.get(x)?.status||null,title:weekCache.get(x)?.day?.main?.title||null})),activeLoads:[...weekLoads.keys()],activeDayLoads:[...dayLoads.keys()],foregroundWeek}},
    cacheSize:()=>weekCache.size,get:id=>weekCache.get(String(id||""))||null,
    invalidate:id=>{const key=String(id||"");if(!key)return false;weekCache.delete(key);weekStatus.delete(weekStart(key));return true},
    retryDate:async id=>{const key=String(id||"");if(!key)return null;const active=weekLoads.get(weekStart(key));if(active)await active;weekCache.delete(key);weekStatus.delete(weekStart(key));showWeekLoader(key,0,1,0);const r=await resolveOne(key);if(state()?.selectedDate===key){applyCached(key);paint()}hideWeekLoaderAfterPaint(navEpoch);return r},
    retryWeek:async id=>{const key=weekStart(String(id||state()?.selectedDate||iso(new Date()))),active=weekLoads.get(key);if(active)await active;weekIds(key).forEach(x=>weekCache.delete(x));weekStatus.delete(key);return revealDate(String(id||key),{forceLoader:true,prefetch:true,skipSeed:true})}
  });
  globalThis.AO_CALENDAR_WEEK_CACHE_V4345=api;return api;
}

function resolution(){
  const s=state(),id=s?.selectedDate,r=s?.resolution;
  return id&&r?.date===id&&!s?.resolving?r:null;
}
function properOf(r){return r?.proper?.status==="ready"?r.proper.data:null}
function titleOf(r){
  const alias=calendarObservanceAlias(r,fr()?"fr":"en");
  if(alias)return alias;
  const p=properOf(r),d=r?.day?.main;
  return String((fr()?(p?.nameFr||p?.title?.fr||p?.name||d?.titleFr||d?.nameFr||d?.title):(p?.name||p?.title?.en||d?.title||d?.name))||L("Liturgical day","Jour liturgique"));
}
function rankOf(r){const p=properOf(r),d=r?.day?.main;return String(p?.rank||d?.rank||"")}
function rawColour(r){return calendarMassColour(r)}
function colourOf(r){
  const raw=rawColour(r),k=raw.trim().toLowerCase();
  const map={red:["Red","Rouge"],green:["Green","Vert"],white:["White","Blanc"],violet:["Violet","Violet"],purple:["Violet","Violet"],black:["Black","Noir"],rose:["Rose","Rose"],gold:["Gold","Or"]};
  const pair=map[k];return pair?(fr()?pair[1]:pair[0]):raw;
}
function profileOf(r){
  const p=properOf(r),d=r?.day?.main,k=String(p?.riteProfile||p?.profile||d?.profile||"").replace(/-/g,"_").toLowerCase();
  const map={extended_readings_mass:["Extended readings","Lectures étendues"],requiem_mass_1962:["Requiem","Requiem"],requiem:["Requiem","Requiem"],palm_sunday_mass:["Palm Sunday","Dimanche des Rameaux"],holy_thursday_mass:["Holy Thursday","Jeudi saint"],easter_vigil_mass:["Easter Vigil","Vigile pascale"]};
  return map[k]?(fr()?map[k][1]:map[k][0]):"";
}
// The source resolver has canonical named day.commemorations as well as
// day.main.commemorations, which can contain only opaque date codes. Choose
// the first collection with human titles, not the first truthy array.
export function calendarCommemorationNames(r,{language="en"}={}){
  return observedCommemorationLabels(r,{language}).map(x=>x.name);
}
function commemorations(r){return calendarCommemorationNames(r,{language:fr()?"fr":"en"});}

function coverage(r,lang){const c=properOf(r)?.languageCoverage?.[lang];return c?{complete:!!c.complete}:null}
function badge(lang,c){return `<span class="aoCalModBadge ${c?.complete?"ok":"warn"}">${lang.toUpperCase()} · ${esc(c?.complete?L("available","disponible"):L("unavailable","indisponible"))}</span>`}
function fallbackWeekIds(selected){
  const start=dateOf(selected);start.setDate(start.getDate()-start.getDay());
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return iso(d)});
}
function seasonOf(r){
  const p=properOf(r),d=r?.day?.main??{};
  const raw=[p?.season,p?.seasonName,p?.tempus,d?.season,d?.seasonName,d?.tempus,r?.season,r?.seasonName,r?.liturgicalSeason]
    .map(x=>String(x??"").trim()).find(Boolean)||"";
  if(!raw)return "";
  const key=raw.toLowerCase().replace(/\s+/g," ");
  const map={
    advent:["Advent","Avent"],christmas:["Christmas","Noël"],christmastide:["Christmastide","Temps de Noël"],
    epiphany:["Epiphany","Épiphanie"],septuagesima:["Septuagesima","Septuagésime"],lent:["Lent","Carême"],
    passiontide:["Passiontide","Temps de la Passion"],easter:["Easter","Pâques"],eastertide:["Eastertide","Temps pascal"],
    pentecost:["Pentecost","Pentecôte"],"after pentecost":["After Pentecost","Après la Pentecôte"]
  };
  const pair=map[key];
  return pair?(fr()?pair[1]:pair[0]):raw;
}
function liturgicalAccent(r){return calendarPaletteColour(rawColour(r));}
function yearWheel(selected,r){
  // The compact fallback wheel must agree with the canonical Advent-to-Advent dashboard.
  const d=dateOf(selected),loc=fr()?"fr-FR":"en-GB",angle=(buildLiturgicalYear(selected).progress*360).toFixed(2),season=seasonOf(r);
  return `<div class="aoCalYearWheel" style="--ao-cal-year-angle:${angle}deg;--ao-cal-liturgical:${esc(liturgicalAccent(r))}" role="img" aria-label="${esc(L("Position in the year","Position dans l’année"))}">
    <div class="aoCalYearTicks" aria-hidden="true"></div><div class="aoCalYearMarker" aria-hidden="true"></div>
    <div class="aoCalYearCore"><small>${esc(season||L("Sacred time","Temps sacré"))}</small><strong>${esc(String(d.getDate()))}</strong><span>${esc(d.toLocaleDateString(loc,{month:"long",year:"numeric"}))}</span></div>
  </div>`;
}
function isGoodFridayLiturgy(r){return /^tempora:Quad6-5r:/.test(String(r?.day?.main?.id||""))}
// The 1960 rubrics govern the calendar; successful provider retrieval is not independent certification.
function daySourceDetails(r){
 const p=properOf(r),path=String(p?.sourcePath||p?.source?.path||p?.sourceFile||"").trim();
 const claims=rubricClaimLedger?calendarRubricalClaimsForDay(r,rubricClaimLedger):[];
 const colourClaims=colourClaimLedger?calendarColourRubricalClaimsForDay(r,colourClaimLedger):[];
 const observedClaims=colourClaimLedger?calendarObservedCommemorationClaimsForDay(r,colourClaimLedger):[];
 const apostolicClaims=colourClaimLedger?calendarInseparableApostlesClaimForDay(r,colourClaimLedger):[];
 const omissionClaims=colourClaimLedger?calendarOmittedFeastClaimForDay(r,colourClaimLedger):[];
 const transferClaims=transferLedger?calendarTransferRubricalClaimsForDay(r,transferLedger):[];
 const claimMarkup=claims.map(c=>`<li data-cal-rubric-claim="${esc(c.claimId)}">
    <p><strong>${esc(c.clauses.join(" · "))}</strong> · ${esc(c.explanation[fr()?"fr":"en"])}</p>
    <a href="${esc(c.witnessUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("Dated historical ordo witness","Témoin historique de l’ordo daté"))} ↗</a>
   </li>`).join("");
 const colourMarkup=colourClaims.map(c=>`<li data-cal-colour-claim="${esc(c.claimId)}">
   <p><strong>${esc(c.clauses.join(" · "))}</strong> · ${esc(c.explanation[fr()?"fr":"en"])}</p>
   <a href="${esc(c.historicalExplanationUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("1960 rubric translation · exact page","Traduction des rubriques de 1960 · page précise"))} ↗</a>
  </li>`).join("");
 const transferMarkup=transferClaims.map(c=>`<li data-cal-transfer-claim="${esc(c.claimId)}">
  <p><strong>${esc(c.clauses.join(" · "))}</strong> · ${esc(c.title[fr()?"fr":"en"])}</p>
  <p>${esc(L("Original date","Date initiale"))}: <time datetime="${esc(c.originalDate)}">${esc(displayDate(c.originalDate))}</time> → ${esc(L("Observed","Célébrée"))}: <time datetime="${esc(c.observedDate)}">${esc(displayDate(c.observedDate))}</time></p>
  <p>${esc(c.explanation[fr()?"fr":"en"])}</p>
  <a href="${esc(c.witnessUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("Independent 1962 calendar witness","Témoin indépendant du calendrier de 1962"))} ↗</a>
 </li>`).join("");
 const observedMarkup=observedClaims.map(c=>`<li data-cal-observed-commemoration="${esc(c.claimId)}">
  <p><strong>${esc(c.clauses.join(" · "))}</strong> · ${esc(c.explanation[fr()?"fr":"en"])}</p>
  <a href="${esc(c.witnessUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("Dated 1962 ordo reference","Référence d’ordo 1962 daté"))} ↗</a>
 </li>`).join("");
 const apostlesMarkup=apostolicClaims.map(c=>`<li data-cal-apostles-inseparable="${esc(c.claimId)}">
  <p><strong>${esc(c.clauses.join(" · "))}</strong> · ${esc(c.explanation[fr()?"fr":"en"])}</p>
  <a href="${esc(c.witnessUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("Historical 1962 Calendar witness","Témoin historique du calendrier de 1962"))} ↗</a>
 </li>`).join("");
 const omissionMarkup=omissionClaims.map(c=>`<li data-cal-omitted-feast="${esc(c.claimId)}">
  <p><strong>${esc(c.clauses.join(" · "))}</strong> · ${esc(c.explanation[fr()?"fr":"en"])}</p>
  <a href="${esc(c.witnessUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("1962 Sunday ordo","Ordo du dimanche selon 1962"))} ↗</a>
  <a href="${esc(c.feastClassWitnessUrl)}" target="_blank" rel="noopener noreferrer">${esc(L("St Francis · III-class feast source","Saint François · source de la fête de troisième classe"))} ↗</a>
 </li>`).join("");
 return `<details class="aoCalDaySources"><summary>${esc(L("Sources & scope","Sources et portée"))}</summary>
  <p>${esc(L("General Roman Calendar (1962); local diocesan, religious and church propers may differ. Retrieved texts have not thereby been independently certified.","Calendrier romain général (1962) ; les propres diocésains, religieux et des églises peuvent différer. La récupération des textes ne constitue pas une certification indépendante."))}</p>
  <a href="https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597" target="_blank" rel="noopener noreferrer">${esc(L("Normative: 1960 Code of Rubrics · AAS 52 (1960), pp. 597 onward","Normatif : Code des rubriques de 1960 · AAS 52 (1960), p. 597 et suiv."))} ↗</a>
  <a href="https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html" target="_blank" rel="noopener noreferrer">${esc(L("Reference: English rubric translation","Référence : traduction anglaise des rubriques"))} ↗</a>
  ${claimMarkup?`<section class="aoCalExactRubrics" aria-label="${esc(L("Source-matched rubric clauses","Articles des rubriques liés aux sources"))}"><h3>${esc(L("Why this commemoration is shown","Pourquoi cette commémoraison figure ici"))}</h3><ul>${claimMarkup}</ul><p>${esc(L("These clauses explain the observed 1962 case; they do not authorize a different Mass, extra prayers or a local observance.","Ces articles éclairent le cas observé dans le calendrier de 1962 ; ils n’autorisent pas une autre messe, des oraisons supplémentaires ou une célébration locale."))}</p></section>`:""}
  ${colourMarkup?`<section class="aoCalExactRubrics" aria-label="${esc(L("Exact 1960 colour clauses","Articles précis de 1960 sur les couleurs"))}"><h3>${esc(L("Why this Mass colour is shown","Pourquoi cette couleur liturgique figure ici"))}</h3><ul>${colourMarkup}</ul><p>${esc(L("A recorded source adjudication, not a new colour calculation or local Mass permission.","Arbitrage de sources enregistré, et non nouveau calcul des couleurs ni autorisation d’une messe locale."))}</p></section>`:""}
  ${transferMarkup?`<section class="aoCalExactRubrics" aria-label="${esc(L("Source-verified transfer clauses","Articles de transfert attestés par les sources"))}"><h3>${esc(L("Why this observance was transferred","Pourquoi cette célébration a été reportée"))}</h3><ul>${transferMarkup}</ul><p>${esc(L("This explains an observed 1962 transfer; it does not alter the Mass of the day or establish a local exception.","Cette mention explique le report constaté dans le calendrier de 1962 ; elle ne modifie pas la messe du jour ni n’établit une exception locale."))}</p></section>`:""}
  ${observedMarkup?`<section class="aoCalExactRubrics" aria-label="${esc(L("Verified commemorated observance clauses","Articles des commémoraisons constatées"))}"><h3>${esc(L("Why this observance is commemorated","Pourquoi cette célébration est commémorée"))}</h3><ul>${observedMarkup}</ul><p>${esc(L("Source evidence for the observed day, not permission to add orations to a different Mass form.","Témoignage du jour observé, et non autorisation d’ajouter des oraisons à une autre forme de messe."))}</p></section>`:""}
  ${apostlesMarkup?`<section class="aoCalExactRubrics" aria-label="${esc(L("Inseparable commemoration under rubric 110","Commémoraison inséparable selon la rubrique 110"))}"><h3>${esc(L("Why St Peter is remembered with St Paul","Pourquoi saint Pierre est uni à saint Paul"))}</h3><ul>${apostlesMarkup}</ul><p>${esc(L("This identifies the 1962 rubrical relationship. The Mass reader independently verifies the actual orations and their shared conclusion.","Cela identifie le lien rubrical de 1962. Le lecteur de messe vérifie séparément les oraisons et leur conclusion commune."))}</p></section>`:""}
  ${omissionMarkup?`<section class="aoCalExactRubrics" aria-label="${esc(L("Source-verified omitted feast","Fête omise attestée par les sources"))}"><h3>${esc(L("Why St Francis is not commemorated","Pourquoi saint François n’est pas commémoré"))}</h3><ul>${omissionMarkup}</ul><p>${esc(L("This describes the general 1962 calendar only. It does not determine any Franciscan or local calendar, transfer the feast, or alter Mass prayers.","Cette explication concerne uniquement le calendrier général de 1962. Elle ne détermine pas le calendrier franciscain ou local, ne reporte pas la fête et ne modifie pas les oraisons de la messe."))}</p></section>`:""}
  ${path?`<p class="aoCalSourceWitness">${esc(L("Digital text witness","Témoin textuel numérique"))}: <code>${esc(path)}</code></p>`:""}
 </details>`;
}
function nextMajorStatusMarkup(selected,kind){
 const unavailable=nextMajorResults.get(selected)?.unavailable===true;
 const title=unavailable?L("Upcoming observance unavailable","Prochaine célébration indisponible"):L("Checking daily observances","Vérification des célébrations quotidiennes");
 return `<div class="${kind==="year"?"aoCalV2MajorLine":"aoCalV2NextMajor"}" role="status"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><strong>${esc(title)}</strong>${unavailable?`<button type="button" data-cal-next-major-retry>${esc(L("Retry","Réessayer"))}</button>`:""}</div>`;
}
function sourceStatus(r){
  const p=properOf(r),en=coverage(r,"en"),fc=coverage(r,"fr");
  return `<div class="aoCalSourceLine" aria-label="${esc(L("Text availability","Disponibilité des textes"))}">
    <span class="${p?"ok":"warn"}">${p?L("Proper ready","Propre disponible"):L("Proper unavailable","Propre indisponible")}</span>
    <span>${en?.complete?"EN ✓":"EN"}</span><span>${fc?.complete?"FR ✓":"FR"}</span>
  </div>`;
}
function weekRail(selected){
  const A=cache(),cached=A?.weekIds?.(selected)??[],ids=cached.length?cached:fallbackWeekIds(selected),loc=fr()?"fr-FR":"en-GB";
  return ids.map(id=>{
    const d=dateOf(id),rr=id===selected?resolution():A?.get?.(id),ready=!!(rr&&rr.date===id&&rr.status!=="failed"),name=rr?titleOf(rr):d.toLocaleDateString(loc,{month:"long"}),rank=rr?rankOf(rr):"";
    return `<button type="button" class="aoCalObservance ${id===selected?"active":""}" data-cal-date="${id}" data-ready="${ready?1:0}" style="--ao-cal-liturgical:${esc(rr?liturgicalAccent(rr):"#59626c")}" title="${esc(name)}" ${id===selected?'aria-current="date"':""}>
      <span class="aoCalObsDate"><small>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</small><b>${d.getDate()}</b></span>
      <span class="aoCalObsText"><strong>${esc(name)}</strong>${rank?`<small>${esc(rank)}</small>`:""}</span>
    </button>`;
  }).join("");
}

const periodUiColour=calendarPaletteColour;
const periodName=p=>fr()?p?.fr:p?.en;
const celebrationName=x=>fr()?x?.fr:x?.en;
const longDate=id=>displayDate(id);
const shortDate=id=>displayDate(id);
const dayCount=(from,to)=>Math.max(0,Math.round((dateOf(to)-dateOf(from))/86400000));
const pct=x=>Math.round(Math.max(0,Math.min(1,Number(x||0)))*1000)/10;

function tabsMarkup(){
  const tabs=[
    ["day",L("Day","Jour")],
    ["picker",L("Month","Mois")],
    ["year",L("Liturgical year","Année liturgique")]
  ];
  return `<nav class="aoCalV2Tabs" aria-label="${esc(L("Calendar views","Vues du calendrier"))}">${tabs.map(([id,label])=>`<button type="button" data-cal-view="${id}" class="${calendarView===id?"active":""}" ${calendarView===id?'aria-current="page"':""}>${esc(label)}</button>`).join("")}</nav>`;
}
function dayNavigator(selected){
  const d=dateOf(selected),loc=fr()?"fr-FR":"en-GB";
  return `<div class="aoCalV2DayNav">
    <button type="button" data-cal-day-shift="-1" aria-label="${esc(L("Previous day","Jour précédent"))}">${assetIcon("ao-ui-previous")}</button>
    <div><small>${esc(d.toLocaleDateString(loc,{weekday:"long"}))}</small><strong>${esc(displayDate(selected))}</strong></div>
    <button type="button" data-cal-day-shift="1" aria-label="${esc(L("Next day","Jour suivant"))}">${assetIcon("ao-ui-next")}</button>
  </div>`;
}
function compactWeek(selected){
  const A=cache(),ids=(A?.weekIds?.(selected)||fallbackWeekIds(selected)),loc=fr()?"fr-FR":"en-GB";
  return `<div class="aoCalV2Week">${ids.map(id=>{
    const d=dateOf(id),rr=id===selected?resolution():A?.get?.(id),name=rr?titleOf(rr):"",accent=rr?liturgicalAccent(rr):"#59626c";
    return `<button type="button" data-cal-date="${id}" class="${id===selected?"active":""}" style="--day-accent:${esc(accent)}" ${id===selected?'aria-current="date"':""}>
      <small>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</small><b>${d.getDate()}</b><span>${esc(name||"—")}</span>
    </button>`;
  }).join("")}</div>`;
}
function intelligenceKind(event){
  const tags=new Set(event?.tags||[]);
  if(tags.has("CURRENT_UNIVERSAL_OBLIGATION"))return L("Obligation","Obligation");
  if(tags.has("CURRENT_UNIVERSAL_DISCIPLINE")||tags.has("CURRENT_PENITENTIAL_DAY"))return L("Current discipline","Discipline actuelle");
  if(tags.has("1962_ERA_HISTORICAL_DISCIPLINE"))return L("Historical discipline","Discipline historique");
  if(tags.has("CURRENT_INDULGED_WORK_CONDITIONAL"))return L("Indulgenced work","Œuvre indulgenciée");
  if(tags.has("NOVENA"))return L("Novena","Neuvaine");
  if(tags.has("DEVOTIONAL_PROGRAMME"))return L("Programme","Programme");
  return L("Devotion","Dévotion");
}
function intelligenceActions(event){
  const defaultRoute=event?.route==="find"&&event?.exploreLens?`find:${event.exploreLens}${event.kind==="semantic"&&event.key?":"+event.key:""}`:event?.route;
  const raw=Array.isArray(event?.actions)&&event.actions.length?event.actions:[[defaultRoute,event.kind==="semantic"&&event.exploreLens==="pilgrimages"?L("Related pilgrimages & shrines","Pèlerinages et sanctuaires associés"):L("Open","Ouvrir")]];
  const seen=new Set(),rows=[];
  for(const entry of raw){
    const route=Array.isArray(entry)?entry[0]:"",label=Array.isArray(entry)?entry[1]:"";
    if(!route||["today.calendar","learn.discipline"].includes(route)||seen.has(route))continue;
    seen.add(route);rows.push([route,label||L("Open","Ouvrir")]);
  }
  return rows;
}
function disciplineReference(discipline){
  if(!discipline)return "";
  const eras=[discipline.eras?.current,discipline.eras?.["1962"],discipline.eras?.older].filter(Boolean);
  return `<details class="aoCalPracticeDiscipline">
    <summary>${esc(L("Discipline reference · current / 1962 / earlier","Référence de discipline · actuelle / 1962 / antérieure"))}</summary>
    <p class="aoCalPracticeDisciplineIntro">${esc(discipline.intro||"")}</p>
    ${eras.map(era=>`<section><small>${esc(String(era.label||"").toUpperCase())}</small>${(era.items||[]).map(item=>`<article><div><strong>${esc(item.title)}</strong><span>${esc(item.status)}</span></div><p>${esc(item.summary)}</p>${item.today?`<b>${esc(item.today)}</b>`:""}</article>`).join("")}${era.sources?.length?`<div class="aoCalPracticeSources">${era.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)} ↗</a>`).join("")}</div>`:""}</section>`).join("")}
  </details>`;
}

function calendarCustomArticleMarkup(article){
  const isFr=fr(),lang=isFr?"fr":"en",Lcopy=(en,frText)=>isFr?frText:en;
  const sources=article.sources||[],historySources=article.history_sources||[],supportingSources=article.supporting_sources||[];
  return `<details class="aoCalCustomArticle" data-cal-custom-id="${esc(article.id)}">
    <summary><span><strong>${esc(article.title[lang])}</strong><small>${esc(article.occasion[lang]||"")}</small>${article.previewOnly?`<small class="aoCalCustomDraftScope">${esc(Lcopy("Editorial preview — not published","Aperçu éditorial — non publié"))} · ${esc(article.scope[lang]||"")}</small>`:""}</span><span aria-hidden="true">›</span></summary>
    <div class="aoCalCustomArticleContent">
      <p>${esc(article.description[lang])}</p>
      ${article.history[lang]!==article.description[lang]?`<h5>${esc(Lcopy("Historical context","Contexte historique"))}</h5><p>${esc(article.history[lang])}</p>`:""}
      <h5>${esc(Lcopy("Spiritual meaning","Sens spirituel"))}</h5><p>${esc(article.meaning[lang])}</p>
      <h5>${esc(Lcopy("Traditional household practice","Pratique traditionnelle"))}</h5><p>${esc(article.practice[lang])}</p>
      <h5>${esc(Lcopy("Scope and cautions","Portée et précautions"))}</h5><p>${esc(article.scope[lang])}</p><p>${esc(article.caution[lang])}</p>
      ${sources.length?`<h5>${esc(Lcopy("Sources","Sources"))}</h5><ul>${sources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a></li>`).join("")}</ul>`:""}
      ${historySources.length?`<h5>${esc(Lcopy("Historical sources","Sources historiques"))}</h5><ul>${historySources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a></li>`).join("")}</ul>`:""}
      ${supportingSources.length?`<h5>${esc(Lcopy("Supporting documentation","Documentation complémentaire"))}</h5><ul>${supportingSources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a></li>`).join("")}</ul>`:""}
    </div>
  </details>`;
}


function calendarCustomCatalogueMarkup(){
  const articles=calendarCustomArticleIds().map(calendarCustomArticle).filter(Boolean);
  const isFr=fr();
  const groups=groupCalendarCustomsByYear(articles);
  const item=article=>{
    const searchable=calendarCustomSearchIndex(article);
    return '<div data-cal-custom-item data-cal-custom-terms="'+esc(searchable)+'">'+calendarCustomArticleMarkup(article)+'</div>';
  };
  return '<section class="aoCalCustomCatalogueSection">'+r18ReviewSelectorMarkup()+'<details class="aoCalCustomCatalogue">'
    +'<summary>'+esc(L("Browse all customs","Parcourir toutes les coutumes"))+' <small>('+articles.length+')</small></summary>'
    +'<label class="aoCalCustomCatalogueLabel" for="ao-cal-custom-search">'+esc(L("Search customs","Rechercher une coutume"))+'</label>'
    +'<input id="ao-cal-custom-search" type="search" data-cal-custom-search autocomplete="off" placeholder="'+esc(L("Name or subject","Nom ou sujet"))+'">'
    +'<p data-cal-custom-empty hidden>'+esc(L("No matching customs.","Aucune coutume correspondante."))+'</p>'
    +'<div class="aoCalCustomCatalogueItems">'+groups.map(group=>'<section class="aoCalCustomYearGroup" data-cal-custom-year-group="'+esc(group.key)+'"><h4>'+esc(isFr?group.fr:group.en)+'</h4>'+group.articles.map(item).join("")+'</section>').join("")+'</div>'
    +'</details><button type="button" class="aoCalMyCustomsButton" data-cal-my-customs-open>'+esc(L("My Customs & Prayers","Mes coutumes et prières"))+' →</button></section>';
}


function calendarPersonalContext(selected){
  let storage=null;try{storage=globalThis.localStorage}catch{}
  const mine=personalCustomsForDate(selected,{storage,canonicalIds:calendarCustomArticleIds()});
  if(!mine.length)return "";
  const copy=record=>{
    const canonical=record.origin==="canonical"?calendarCustomArticle(record.customId):null;
    const title=canonical?.title[fr()?"fr":"en"]||record.title;
    const kind=canonical?L("Adopted sourced custom","Coutume sourcée adoptée"):record.kind==="prayer"?L("Personal prayer","Prière personnelle"):L("Personal custom","Coutume personnelle");
    const reading=record.body?'<details data-cal-personal-reading><summary>'+esc(L("Read my text","Lire mon texte"))+'</summary><p>'+esc(record.body)+'</p></details>':"";
    return '<article class="aoCalPersonalPractice"><small>'+esc(kind)+'</small><strong>'+esc(title)+'</strong>'+reading+(record.note?'<p>'+esc(record.note)+'</p>':"")+'</article>';
  };
  return '<section class="aoCalPersonalContext" data-cal-personal-date="'+esc(selected)+'"><div class="aoCalV2SectionTitle"><div><small>'+esc(L("PERSONAL · NOT LITURGICAL","PERSONNEL · NON LITURGIQUE"))+'</small><h3>'+esc(L("My household practices","Mes pratiques familiales"))+'</h3></div></div>'
   +mine.map(copy).join("")+'<button type="button" class="aoCalMyCustomsButton" data-cal-my-customs-open>'+esc(L("Manage my customs & prayers","Gérer mes coutumes et prières"))+' →</button></section>';
}

function practiceContext(selected,r){
  let intel=null;
  try{intel=calendarIntelligenceForDate(selected,{fr:fr(),properTitle:titleOf(r)})}catch(error){console.error("Calendar intelligence failed",error)}
  const events=(intel?.events||[]).filter(event=>event?.key!=="sunday-mass");
  const tags=new Set(events.flatMap(event=>event?.tags||[]));
  const linkedPlaces=intel?pilgrimagePlacesForCalendarKeys(intel.semantic?.map(event=>event.key),pilgrimageCorpus??{}):[];
  const disciplineRelevant=Boolean(intel?.discipline?.today?.key&&intel.discipline.today.key!=="none")||[...tags].some(tag=>/DISCIPLINE|PENITENTIAL/.test(tag));
  const regionCode=r18ReviewRegion();
  const seasonalCustoms=calendarCustomRecommendations(selected,{events,fr:fr(),
    r18Review:{enabled:Boolean(regionCode),regionCode,candidates:CALENDAR_R18_REVIEW_CANDIDATES}});
  if(!events.length&&!disciplineRelevant&&!seasonalCustoms.length)return "";
  return `<section class="aoCalPracticeContext" data-cal-intelligence-date="${esc(selected)}">
    <div class="aoCalV2SectionTitle"><div><small>${esc(L("PRACTICES & DISCIPLINE","PRATIQUES & DISCIPLINE"))}</small><h3>${esc(L("For this date","Pour cette date"))}</h3></div></div>
    <p class="aoCalPracticeIntro">${esc(L("Date-bound devotional context. Current obligations remain separate from historical discipline and voluntary custom.","Contexte dévotionnel lié à la date. Les obligations actuelles restent distinctes de la discipline historique et des coutumes volontaires."))}</p>
    ${seasonalCustoms.length?`<div class="aoCalCustomsBlock"><h4>${esc(L("Customs of this day & season","Coutumes du jour et de la saison"))}</h4><div class="aoCalCustomsEntries">${seasonalCustoms.map(calendarCustomArticleMarkup).join("")}</div></div>`:""}
    ${events.length?`<div class="aoCalPracticeList">${events.map(event=>`<article class="aoCalPracticeCard" data-cal-intelligence-id="${esc(event.id)}">
      <small>${esc(intelligenceKind(event))}</small>
      <h4>${esc(event.title)}</h4>
      <p>${esc(event.summary||"")}</p>
      ${event.current||event.historical?`<details><summary>${esc(L("Current / traditional status","Statut actuel / traditionnel"))}</summary>${event.current?`<p><b>${esc(L("Current:","Actuel :"))}</b> ${esc(event.current)}</p>`:""}${event.historical?`<p><b>${esc(L("Traditional:","Traditionnel :"))}</b> ${esc(event.historical)}</p>`:""}</details>`:""}
      ${intelligenceActions(event).some(([route])=>!route.startsWith("find:traditions:"))?`<div class="aoCalPracticeActions">${intelligenceActions(event).filter(([route])=>!route.startsWith("find:traditions:")).map(([route,label])=>`<button type="button" data-cal-intelligence-route="${esc(route)}">${esc(label)} →</button>`).join("")}</div>`:""}
    </article>`).join("")}</div>`:""}
    ${linkedPlaces.length?`<section class="aoCalPilgrimagePlaces"><small>${esc(L("PILGRIMAGES & SACRED PLACES","PÈLERINAGES ET SANCTUAIRES"))}</small><p>${esc(L("Places associated with this feast or anniversary. Local celebrations and travel arrangements must be checked with the shrine.","Lieux associés à cette fête ou à cet anniversaire. Les célébrations locales et les renseignements pratiques restent à vérifier auprès du sanctuaire."))}</p>${linkedPlaces.map(place=>`<article><div><strong>${esc(place.shrine_name)}</strong>${place.saints.length?`<small>${esc(place.saints.join(" · "))}</small>`:""}</div><button type="button" data-cal-intelligence-route="${esc("find:pilgrimages:"+place.semantic_key)}">${esc(L("View pilgrimage","Voir le pèlerinage"))} →</button></article>`).join("")}</section>`:""}
    ${disciplineRelevant?disciplineReference(intel.discipline):""}
  </section>`;
}
function calendarScriptureControls(selected,r){
  const rows=calendarScriptureContexts(r);
  if(!rows.length)return "";
  const slotLabel=row=>row.label?(fr()?row.label.fr:row.label.en):row.slot==="GOSPEL"?L("Gospel","Évangile"):L("Epistle / Lesson","Épître / Lecture");
  // Keep the distinct Vigil prophecies apart from the Mass readings that
  // follow. These are independent source owners, not duplicate Gospel slots.
  const rites=rows.filter(row=>row.kind==="NATIVE_RITE_READING");
  const proper=rows.filter(row=>row.kind!=="NATIVE_RITE_READING");
  const mixed=rites.length>0&&proper.length>0;
  const controls=items=>`<div class="aoCalDayScriptureActions">${items.map(row=>
    `<button type="button" data-cal-scripture-date="${esc(selected)}" data-cal-scripture-slot="${esc(row.slot)}" aria-label="${esc(slotLabel(row)+" · "+row.reference)}"><strong>${esc(slotLabel(row))}</strong><span>${esc(row.reference)}</span></button>`
  ).join("")}</div>`;
  const riteLabel=rites[0]?.groupLabel;
  return `<section class="aoCalDayScripture" aria-label="${esc(fr()?(rites.length?"Lectures liturgiques":"Lectures de la messe"):"Appointed readings")}"><small>${esc(fr()?(rites.length?"LECTURES LITURGIQUES":"LECTURES DE LA MESSE"):"APPOINTED READINGS")}</small>${rites.length?
    (mixed?`<p class="aoCalDayScriptureGroupLabel">${esc(fr()?riteLabel.fr:riteLabel.en)}</p>`:"")+controls(rites):""}${proper.length?
    (mixed?`<p class="aoCalDayScriptureGroupLabel">${esc(L("Mass · Epistle and Gospel","Messe · Épître et Évangile"))}</p>`:"")+controls(proper):""}<p class="aoCalDayScriptureError" role="alert" hidden></p></section>`;
}
async function openCalendarScripture(button){
  const origin=root(),selected=String(button.dataset.calScriptureDate||""),slot=button.dataset.calScriptureSlot;
  if(!origin||calendarView!=="day"||selected!==state()?.selectedDate)return false;
  const reading=calendarScriptureContexts(resolution()).find(item=>item.slot===slot);
  if(!reading)return false;
  const atScroll=origin.scrollTop,language=fr()?"fr":"en";
  const errorNode=origin.querySelector(".aoCalDayScriptureError");
  const fail=()=>{
    const err=origin.querySelector(".aoCalDayScriptureError")||errorNode;
    if(err){err.textContent=L("This Scripture passage cannot be opened. Please try again.","Ce passage biblique ne peut pas être ouvert. Veuillez réessayer.");err.hidden=false}
    button.disabled=false;return false;
  };
  button.disabled=true;
  try{
    const owner=globalThis.AO_SCRIPTURE_APP_V1||
      (await import("../scripture/browser-entry.js")).installScriptureBrowserOwner(globalThis);
    if(root()!==origin||state()?.selectedDate!==selected)return fail();
    const returnToCalendar=()=>{
      const restore=()=>{
        if(root()!==origin||state()?.selectedDate!==selected||calendarView!=="day")return;
        origin.scrollTop=atScroll;
        origin.querySelector('[data-cal-scripture-date="'+selected+'"][data-cal-scripture-slot="'+slot+'"]')?.focus?.({preventScroll:true});
      };
      restore();
      // Calendar repaint/centering can be queued while the Bible overlay is
      // open. Restore after that paint as well so the exact prior reading
      // remains visible rather than jumping to the top of the special rite.
      requestAnimationFrame(()=>requestAnimationFrame(restore));
    };
    const options={language,onCloseReturn:returnToCalendar};
    const opened=reading.segments
      ?owner?.openSegments?.(reading.segments,{...options,reference:reading.reference,provenance:reading.provenance})
      :owner?.openContext?.(reading.reference,options);
    if(!opened)return fail();
    if(errorNode){errorNode.textContent="";errorNode.hidden=true}
    button.disabled=false;return true;
  }catch(error){
    console.error("Calendar Scripture handoff failed",error);return fail();
  }
}
function calendarScriptureStyles(){
 return `.aoCalDayScripture{margin:12px auto 0;max-width:580px;text-align:left}.aoCalDayScripture>small{display:block;color:var(--ao-text-muted,#a6a198);font:650 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.10em}.aoCalDayScriptureGroupLabel{margin:12px 0 2px;color:var(--ao-text-muted,#a6a198);font:650 11px/1.35 var(--ao-font-ui,system-ui,sans-serif)}.aoCalDayScriptureActions{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.aoCalDayScriptureActions button{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:8px 12px!important;border:1px solid var(--ao-rule,rgba(226,214,190,.22))!important;background:var(--ao-surface-1,rgba(16,24,33,.94))!important;border-radius:999px!important;color:var(--ao-text-primary,#e9e4d9)!important;font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)!important}.aoCalDayScriptureActions button strong{font-weight:650}.aoCalDayScriptureActions button span{color:var(--ao-text-muted,#a6a198)}.aoCalDayScriptureActions button:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}.aoCalDayScriptureActions button:disabled{opacity:.55}.aoCalDayScriptureError:not([hidden]){color:#d9b99a;margin:8px 0 0;font:500 12px/1.5 var(--ao-font-ui,system-ui,sans-serif)}`;
}
function supplementaryDayCards(selected,r){
  if(!secondarySaintModel||!r?.day?.main?.id)return [];
  try{
    return buildReviewedSanctoralCards({
      date:selected,language:fr()?"fr":"en",jurisdiction:"UNSPECIFIED",
      observedPrincipalId:r.day.main.id,
      observedCommemorationIds:canonical1962Commemorations(r).map(x=>x.sourceId),
      ...secondarySaintModel
    });
  }catch(error){console.warn("Supplementary saints projection unavailable",error);return []}
}
function supplementaryDayMarkup(selected,r){
  const cards=supplementaryDayCards(selected,r);
  return renderSecondarySaintSection(cards,{language:fr()?"fr":"en"});
}
// Revalidate date, observed 1962 day and the exact reviewed saint→Place edge.
// Neither the browser's data attributes nor name similarity confer authority.
async function openSecondarySaintPlace(button){
  const current=state(),selected=String(current?.selectedDate||""),r=current?.resolution;
  const placeId=button?.dataset?.calSecondaryPlace||"",saintId=button?.dataset?.calSecondarySaint||"";
  if(!selected||r?.date!==selected||!r?.day?.main?.id||
     !/^place:[A-Z]{2}:[a-z0-9-]+$/.test(placeId)||!/^saint\.[a-z0-9-]+$/.test(saintId)||
     !supplementaryDayCards(selected,r).some(card=>card.id===saintId&&card.site?.placeId===placeId))
    return false;
  button.disabled=true;button.setAttribute("aria-busy","true");
  try{
    const routed=await globalThis.AO_APP_SHELL_V1?.navigate?.("find");
    if(routed?.ok!==true)throw new Error("Canonical Explore route unavailable");
    const owner=globalThis.AO_FIND_APP_V1;
    if(typeof owner?.open!=="function")throw new Error("Explore Place owner unavailable");
    const opened=await owner.open({lens:"shrines",view:"map",placeId,query:""});
    if(opened!==true||owner.status?.().selectedPlaceId!==placeId)
      throw new Error("Reviewed Place selection could not be confirmed");
    return true;
  }catch(error){console.error("Calendar reviewed saint Place handoff failed",error);return false}
  finally{if(button.isConnected){button.disabled=false;button.removeAttribute("aria-busy")}}
}
function daySurface(selected,r){
  const y=buildLiturgicalYear(selected),p=y.currentPeriod,next=nextResolvedMajorCelebration(selected),cm=commemorations(r),saint=principalSaintContext(r,selected);
  const season=periodName(p),properReady=!!properOf(r),printReady=assessPrintableProper(r,{language:fr()?"fr":"en"}).ok;
  return `
    ${dayNavigator(selected)}
    <section class="aoCalV2Hero" style="--ao-cal-liturgical:${esc(liturgicalAccent(r))}">
      <small class="aoCalV2Eyebrow">${esc(L("CALENDARIUM ROMANUM · 1962","CALENDARIUM ROMANUM · 1962"))}</small>
      <h2>${esc(titleOf(r))}</h2>
      ${approvedClassIHeroMarkup(selected, r?.day?.main?.id, fr())}
      <div class="aoCalIdentityMeta">${rankOf(r)?`<span>${esc(rankOf(r))}</span>`:""}${colourOf(r)?`<span>${esc(colourOf(r))}</span>`:""}${profileOf(r)?`<span>${esc(profileOf(r))}</span>`:""}</div>
      ${cm.length?`<section class="aoCalV2Commemorations" aria-label="${esc(L("Observed 1962 Mass commemorations","Commémorations à la messe de 1962"))}"><small>${esc(L("1962 MASS · ALSO COMMEMORATED","MESSE DE 1962 · COMMÉMORATIONS"))}</small><h3>${esc(L("Commemorations","Commémorations"))}</h3>${cm.map(x=>`<p><i aria-hidden="true"></i><span>${esc(x)}</span></p>`).join("")}</section>`:""}
      ${calendarScriptureControls(selected,r)}
      ${properReady?`<button class="aoCalV2Primary" type="button" data-cal-mass>${esc(isGoodFridayLiturgy(r)?L("Open the Good Friday liturgy","Ouvrir la liturgie du Vendredi saint"):L("Open this Mass","Ouvrir cette messe"))} <span aria-hidden="true">→</span></button>`:""}
      <div class="aoCalV2Documentation">
        ${sourceStatus(r)}
        ${daySourceDetails(r)}
        ${printReady?`<details class="aoCalV2PrintOptions"><summary>${esc(L("Print the Mass Propers","Imprimer les propres de la messe"))}</summary><button type="button" class="aoCalV2TextLink" data-cal-print-proper>${esc(L("Print bilingual Mass Propers","Imprimer les propres bilingues"))}</button><p data-cal-print-feedback role="status" aria-live="polite"></p></details>`:""}
      </div>
    </section>
    ${saint?`<section class="aoCalV2Saint" style="--saint-accent:${esc(liturgicalAccent(r))}"><div><small>${esc(saint.label.toUpperCase())}</small></div><button type="button" data-cal-saint-date="${selected}">${esc(L("Life & sources","Vie & sources"))} <span aria-hidden="true">→</span></button></section>`:""}
    ${supplementaryDayMarkup(selected,r)}
    <section class="aoCalV2Context">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("LITURGICAL TIME","TEMPS LITURGIQUE"))}</small><h3>${esc(season)}</h3></div></div>
      ${next?`<button class="aoCalV2NextMajor" type="button" data-cal-date="${next.date}"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><strong>${esc(celebrationName(next))}</strong><span>${esc(longDate(next.date))} · ${dayCount(selected,next.date)} ${esc(L("days","jours"))}</span></button>`:nextMajorStatusMarkup(selected,"day")}
      <button class="aoCalV2TextLink" type="button" data-cal-view="year">${esc(L("View the liturgical year","Voir l’année liturgique"))} →</button>
    </section>
    ${practiceContext(selected,r)}
    ${calendarPersonalContext(selected)}
    ${calendarCustomCatalogueMarkup()}
    <section class="aoCalV2WeekSection">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("IN CONTEXT","EN CONTEXTE"))}</small><h3>${esc(L("This week","Cette semaine"))}</h3></div><button class="aoCalV2Today" type="button" data-cal-today>${esc(L("Today","Aujourd’hui"))}</button></div>
      ${compactWeek(selected)}
      <div class="aoCalV2WeekShift"><button data-cal-shift="-7">${assetIcon("ao-ui-previous")} ${esc(L("Previous week","Semaine précédente"))}</button><button data-cal-shift="7">${esc(L("Next week","Semaine suivante"))} ${assetIcon("ao-ui-next")}</button></div>
    </section>
  `;
}
function requestYearDailyColours(year){
  if(calendarView!=="year"||!root()||yearColourLoad?.start===year.start)return;
  // The Clock's 1962 year geometry is deterministic. We only request its
  // major feast anchors and nearby selected days, never 364 remote missal
  // documents upon opening one phone screen. Unresolved daily colour stays
  // neutral instead of issuing hundreds of 404s or inventing green Masses.
  const selected=state()?.selectedDate||year.start;
  const nearby=Array.from({length:15},(_,i)=>addDaysIso(selected,i-7))
    .filter(id=>id>=year.start&&id<=year.end);
  const ids=[...new Set([...nearby,...orderedClockCandidateDates(year,selected)])];
  const missing=ids.filter(id=>!weekCache.has(id));
  if(!missing.length)return;
  const job={start:year.start};
  yearColourLoad=job;
  // Deliberate incremental resolution. Never fabricate liturgical colours for
  // missing dates; stop background work when Calendar Year is no longer open.
  queueMicrotask(async()=>{
    try{
      for(let offset=0;offset<missing.length;offset+=16){
        if(calendarView!=="year"||!root()||yearColourLoad!==job)break;
        const dates=missing.slice(offset,offset+16);
        let n=0;
        const worker=async()=>{while(n<dates.length){
          if(calendarView!=="year"||yearColourLoad!==job)return;
          await resolveOne(dates[n++]);
        }};
        await Promise.all(Array.from({length:3},worker));
        if(yearColourLoad===job)hydrateYearColourWheel(year);
        await new Promise(done=>setTimeout(done,0));
      }
    }catch(error){console.warn("1962 year colour projection incomplete",error)}
    finally{if(yearColourLoad===job)yearColourLoad=null}
  });
}
function hydrateYearColourWheel(year){
  const el=root()?.querySelector(".aoCalV2Ring");
  const projection=yearDailyProjection(year,id=>weekCache.get(id));
  if(el?.dataset.yearStart===year.start){
    el.style.setProperty("--year-daily-gradient",projection.gradient);
    el.dataset.verifiedDays=String(projection.verified);
  }
  const timeline=root()?.querySelector(".aoCalYearDailyTrack");
  if(timeline)timeline.style.background=projection.timeline;
  const label=root()?.querySelector("[data-cal-year-colour-status]");
  if(label)label.textContent=L("Daily colours from the verified 1962 calendar", "Couleurs quotidiennes du calendrier 1962 vérifié")+
    " · "+projection.verified+"/"+projection.total;
  // Refresh verified feast markers without displacing clock details or focus.
  const clock=root()?.querySelector(".aoClock");
  // Keep the verified daily ring current even while a feast detail is open
  // or a keyboard user has focus. Avoid replacing an interactive clock then.
  const dial=clock?.querySelector(".aoClockDial");
  if(dial&&clock?.dataset.yearStart===year.start){
    dial.style.setProperty("--ao-clock-daily-gradient",projection.gradient);
    dial.dataset.verifiedDays=String(projection.verified);
  }
  if(clock&&!clockSelection&&!clock.contains(globalThis.document?.activeElement)){
    const selected=state()?.selectedDate||year.start;
    if(buildLiturgicalYear(selected).start===year.start)clock.outerHTML=clockForYear(year,selected);
  }
}
// Clock is a visual projection. The canonical day resolver and the existing
// eleven-period journey / full-year day-colour projection remain untouched.
function clockForYear(year,selected){
  const getDay=id=>{const current=resolution();return current?.date===id?current:weekCache.get(id)??null;};
  const next=nextResolvedMajorCelebration(selected);
  return renderLiturgicalClock({year,selectedDate:selected,todayDate:iso(new Date()),
    fr:fr(),getDay,titleFor:titleOf,rankFor:rankOf,massColourFor:colourOf,selection:clockSelection,
    nextMajor:next?{date:next.date,title:celebrationName(next),verified:true}:null});
}
function yearSurface(selected,r){
  const y=buildLiturgicalYear(selected),p=y.currentPeriod,next=nextResolvedMajorCelebration(selected);
  const embedded=root()?.dataset.aoCalendarEmbedded==="true";
  const seasonGradient=yearSeasonGradient(y),daily=yearDailyProjection(y,id=>weekCache.get(id));
  queueMicrotask(()=>{if(calendarView==="year"&&root())requestYearDailyColours(y)});
  // Home's Liturgical Year tab is an embedded Calendar too. Show the same
  // interactive Clock there, not the obsolete mini-wheel. Only Mass preflight
  // keeps its compact contextual ring, avoiding duplicate 600px instruments.
  const embeddedHomeYear=embedded&&Boolean(root()?.closest(".aoTodayV2CalendarInline"));
  return `
    ${!embedded||embeddedHomeYear?clockForYear(y,selected):""}
    ${embedded&&!embeddedHomeYear?`
    <section class="aoCalV2YearHero">
      <div class="aoCalV2YearHeading"><small>${esc(L("LITURGICAL YEAR","ANNÉE LITURGIQUE"))}</small><h2>${esc(y.label)}</h2></div>
      <div class="aoCalV2YearHeroGrid">
        <div class="aoCalV2Ring" data-year-start="${y.start}" data-verified-days="${daily.verified}" style="--year-angle:${((y.dayIndex-.5)/y.totalDays*360).toFixed(2)}deg;--year-season-gradient:${seasonGradient};--year-daily-gradient:${daily.gradient}">
          <div class="aoCalV2RingMarker"></div>
          <div class="aoCalV2RingCore"><strong>${dateOf(selected).getDate()}</strong><small>${esc(dateOf(selected).toLocaleDateString(fr()?"fr-FR":"en-GB",{month:"long"}))}</small><span>${esc(L("SELECTED DAY","JOUR CONSULTÉ"))}</span></div>
        </div>
        <div class="aoCalV2YearIdentity">
          <small>${esc(L("LITURGICAL SEASON","TEMPS LITURGIQUE"))}</small>
          <h3>${esc(periodName(p))}</h3>
          <p class="aoCalV2SelectedFeast">${esc(r?.day?titleOf(r):L("Mass of the day awaiting resolution","Messe du jour en attente de résolution"))}</p>
          ${next?`<div class="aoCalV2MajorLine"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><button type="button" data-cal-year-open-day="${next.date}">${esc(celebrationName(next))} · ${esc(shortDate(next.date))}</button></div>`:nextMajorStatusMarkup(selected,"year")}
        </div>
      </div>
    </section>
    `:""}
    <div class="aoCalHybridHeading" style="margin:18px 0"><button type="button" class="aoCalV2TextLink" data-cal-customs-open>${esc(L("Explore customs throughout the year","Découvrir les coutumes au fil de l’année"))} →</button></div>
    ${embedded&&!embeddedHomeYear?renderYearJourney({year:y,selectedDate:selected,focusedPeriodId:focusedYearPeriodId,fr:fr(),formatDate:displayDate,dailyColours:daily}):""}
  `;
}
function pickerSurface(selected){
  if(!pickerMonthId)pickerMonthId=selected.slice(0,7);
  const [yy,mm]=pickerMonthId.split("-").map(Number),first=new Date(yy,mm-1,1,12),days=monthGridIds(pickerMonthId),today=iso(new Date()),loc=fr()?"fr-FR":"en-GB";
  const status=monthStatus.get(pickerMonthId),ready=monthVerified(pickerMonthId),attempted=monthReady(pickerMonthId),done=status?.done??days.filter(x=>weekCache.has(x)).length,errors=days.filter(x=>weekCache.has(x)&&(!weekCache.get(x)?.day||weekCache.get(x)?.status==="failed")).length,exportReady=Boolean(exportableMonthRows(pickerMonthId));
  const retryable=days.filter(id=>weekCache.has(id)&&(!weekCache.get(id)?.day||weekCache.get(id)?.status==="failed")).length;
  const practiceDates=new Set(calendarPracticeMonthEntries(pickerMonthId,{fr:fr()}).map(x=>x.date));
  const calendarGrid=`<div class="aoCalV2Weekdays">${Array.from({length:7},(_,i)=>{const d=new Date(2026,7,2+i,12);return `<span>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</span>`}).join("")}</div>
    <div class="aoCalV2MonthGrid" data-cal-month-filter="${calendarMonthView}" data-month-ready="${ready?"true":"false"}">${days.map(id=>{
      const d=dateOf(id),outside=d.getMonth()!==mm-1,data=monthCellData(id),hasPractice=practiceDates.has(id);
      return `<button type="button" data-cal-pick-date="${id}" data-ready="${data.ready?"1":"0"}" data-rank-tier="${data.tier}" data-cycle="${esc(data.cycle)}" data-preview="${data.preview?"1":"0"}" class="${outside?"outside":""} ${id===selected?"selected":""} ${id===today?"today":""} ${data.sunday?"sunday":""} ${data.projected?"projected":""} ${data.tier>0&&data.tier<=2?"major":""} ${hasPractice?"hasPractice":""}" style="--month-accent:${esc(data.accent)}" aria-label="${esc(data.aria+(hasPractice?" · "+L("Traditional practice","Pratique traditionnelle"):""))}"><span class="aoCalMonthTop"><b>${d.getDate()}</b><span class="aoCalMonthIndicators"><i data-cal-liturgical-marker aria-hidden="true"></i>${hasPractice?'<span class="aoCalMonthPracticeMark" aria-hidden="true"></span>':""}</span></span><span class="aoCalMonthName">${esc(data.name)}</span>${data.commemorationCount?`<span class="aoCalMonthCommemorations" aria-hidden="true">+${data.commemorationCount}</span>`:""}</button>`;
    }).join("")}</div>`;
  const projection=calendarGrid+monthHybridOverview(pickerMonthId,selected);
  return `<section class="aoCalV2Picker">
    <div class="aoCalV2YearHeading"><h2>${esc(first.toLocaleDateString(loc,{month:"long",year:"numeric"}))}</h2></div>
    <div class="aoCalV2MonthNav"><button type="button" data-cal-month-shift="-1" aria-label="${esc(L("Previous month","Mois précédent"))}">${assetIcon("ao-ui-previous")}<span class="aoCalMonthNavLong">${esc(L("Previous month","Mois précédent"))}</span><span class="aoCalMonthNavShort">${esc(L("Previous","Précédent"))}</span></button><button type="button" data-cal-today>${esc(L("Today","Aujourd’hui"))}</button><button type="button" data-cal-month-shift="1" aria-label="${esc(L("Next month","Mois suivant"))}"><span class="aoCalMonthNavLong">${esc(L("Next month","Mois suivant"))}</span><span class="aoCalMonthNavShort">${esc(L("Next","Suivant"))}</span>${assetIcon("ao-ui-next")}</button></div>
    ${monthIndexTabs()}
    <div class="aoCalV2MonthMeta"><span data-cal-month-status aria-live="polite">${esc(ready?"":attempted?L("Some dates unavailable","Certaines dates indisponibles"):L("Loading dates…","Chargement des dates…"))}</span></div>
    ${retryable?`<button type="button" class="aoCalV2Retry" data-cal-month-retry>${esc(L(`Retry ${retryable} unavailable day(s)`,`Réessayer pour ${retryable} jour(s) indisponible(s)`))}</button>`:""}
    ${projection}
    <details class="aoCalV2MonthTools"><summary>${esc(L("More options","Autres options"))}</summary><div class="aoCalV2MonthExport"><button type="button" class="aoCalV2TextLink" data-cal-export-ics="${esc(pickerMonthId)}" ${exportReady?"":'disabled aria-disabled="true"'} title="${esc(L("Download resolved general Roman calendar as an all-day .ics file; no Mass schedules or local feasts.","Télécharger le calendrier romain général résolu au format .ics, sans horaires de messe ni propres locaux."))}">${esc(L("Export this month · .ics","Exporter ce mois · .ics"))}</button><small>${esc(exportReady?L("Liturgical observances only · no Mass times","Célébrations uniquement · sans horaires de messe"):L("Available when every day is resolved","Disponible lorsque tous les jours sont résolus"))}</small><p data-cal-export-error role="status" aria-live="polite"></p></div>
    <div class="aoCalV2DirectJump"><label for="ao-cal-exact-date">${esc(L("Exact date","Date exacte"))}</label><div><input id="ao-cal-exact-date" data-cal-input inputmode="numeric" value="${esc(displayDate(selected))}" aria-label="${esc(L("Date in DD/MM/YYYY format","Date au format JJ/MM/AAAA"))}"><button type="button" data-cal-go>${esc(L("Go","Aller"))}</button></div><p data-cal-error aria-live="polite"></p></div>
    </details>
  </section>`;
}

function bodyMarkup(){
  const s=state(),selected=s?.selectedDate||iso(new Date()),r=resolution();
  // The year model and month navigator are meaningful before an individual Mass
  // resolves (and after a failed day fetch); only the detailed Day needs that data.
  if(calendarView==="year")return `${tabsMarkup()}${yearSurface(selected,r)}`;
  if(calendarView==="picker")return `${tabsMarkup()}${pickerSurface(selected)}`;
  if(!r||r.status==="failed"||!r.day){
    return `${tabsMarkup()}<div class="aoCalModEmpty"><small>${L("CALENDAR","CALENDRIER")}</small><h2>${esc(displayDate(selected))}</h2><p>${L("The Mass for this date is not available yet. You can still browse the liturgical year and month.","La messe de ce jour n’est pas encore disponible. Vous pouvez toujours consulter l’année et le mois liturgiques.")}</p><button type="button" data-cal-day-retry>${esc(L("Retry this day","Réessayer ce jour"))}</button><button type="button" data-cal-view="picker">${L("Browse the month","Consulter le mois")}</button><button type="button" data-cal-today>${L("Return to today","Revenir à aujourd’hui")}</button></div>`;
  }
  return `${tabsMarkup()}${daySurface(selected,r)}`;
}
function calendarAuditCss(){
 return `.aoCalDaySources{margin:12px 0 6px;color:#b4b2ae;font:400 14px/1.55 var(--ao-font-ui,system-ui,sans-serif)}.aoCalDaySources summary{display:flex;align-items:center;min-height:44px;cursor:pointer;color:#dfd5c6;text-decoration:underline;text-decoration-color:rgba(225,210,180,.35);text-underline-offset:3px}.aoCalDaySources[open]{padding:4px 0 12px}.aoCalDaySources p{margin:9px 0}.aoCalDaySources a{display:block;color:#d9d0bb;text-decoration:underline;min-height:44px;padding:8px 0;overflow-wrap:anywhere}.aoCalSourceWitness code{white-space:normal;overflow-wrap:anywhere}.aoCalExactRubrics{margin:12px 0 8px;padding:12px 14px;border:1px solid var(--ao-rule,rgba(226,214,190,.18));border-radius:10px;background:var(--ao-surface-1,rgba(16,24,33,.75))}.aoCalExactRubrics h3{margin:0 0 8px;font:600 14px/1.35 var(--ao-font-ui,system-ui,sans-serif)}.aoCalExactRubrics ul{margin:0;padding-left:18px}.aoCalExactRubrics li{margin-bottom:8px}.aoCalExactRubrics li p{margin:0 0 5px}.aoCalExactRubrics>p{font-size:12px;line-height:1.5}.aoCalV2Retry{margin:8px 0 14px}.aoCalDaySources summary:focus-visible,.aoCalDaySources a:focus-visible,[data-cal-month-retry]:focus-visible,[data-cal-day-retry]:focus-visible,[data-cal-next-major-retry]:focus-visible{outline:2px solid #decaa0;outline-offset:3px}`;
}
function hybridMonthCss(){return `
/* Approved hybrid month composition: no changes to Year wheel. */
.aoCalHybridOverview{display:grid;gap:24px;margin:22px 0}
.aoCalHybridSection{padding-top:15px;border-top:1px solid rgba(227,212,187,.15)}
.aoCalHybridHeading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 13px}
.aoCalHybridHeading h3{font-size:22px;font-weight:400;margin:0}
.aoCalHybridHeading span{font:400 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#92979a;text-align:right}
.aoCalHybridMajors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#ao-calendar-modular-root .aoCalHybridMajor{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;min-width:0;min-height:76px;padding:11px 13px!important;border-radius:9px!important;text-align:left!important;border:1px solid rgba(226,211,184,.12)!important;border-left:2px solid color-mix(in srgb,var(--month-accent,#647d6c) 75%,#b7a580)!important;background:linear-gradient(145deg,color-mix(in srgb,var(--month-accent,#647d6c) 8%,#0b1119),#0c131b)!important}
#ao-calendar-modular-root .aoCalHybridMajor.featured{min-height:116px!important}
.aoCalHybridDate{font:500 13px/1.25 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#baa883}
.aoCalHybridTitle{font:500 17px/1.24 var(--ao-font-display,"EB Garamond",Georgia,serif);overflow-wrap:break-word}
.aoCalHybridMajor.featured .aoCalHybridTitle{font-size:22px;line-height:1.17}
.aoCalHybridMajor small{font:400 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#91989b}
.aoCalHybridPractices{display:grid}
#ao-calendar-modular-root .aoCalHybridPractice{display:grid;grid-template-columns:79px minmax(0,1fr) 15px;gap:10px;align-items:center;min-width:0;min-height:54px;padding:9px 3px!important;text-align:left!important;border:0!important;border-top:1px solid rgba(227,212,187,.1)!important;border-radius:0!important;background:transparent!important}
.aoCalHybridPractice time{font:500 13px/1.25 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#baa883;white-space:nowrap}
.aoCalHybridPractice strong{display:block;font:500 17px/1.23 var(--ao-font-display,"EB Garamond",Georgia,serif);overflow-wrap:break-word}
.aoCalHybridPractice small{display:block;margin-top:3px;font:400 13px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#91989b}
.aoCalHybridPractice>span:last-child{color:#baa883}
.aoCalHybridEmpty{grid-column:1/-1;margin:5px 0;padding:9px 0;color:#9a9da0;font:400 14px/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
.aoCalMonthIndicators{display:flex;align-items:center;gap:3px}
.aoCalV2MonthGrid button.hasPractice .aoCalMonthPracticeMark{display:block;flex:0 0 auto;width:6px;height:6px;border:1px solid #cbb689;border-radius:50%}
.aoCalMonthTimeline{list-style:none;margin:12px 0 0 9px;padding:0 0 0 20px;border-left:1px solid rgba(202,182,145,.3)}
.aoCalMonthTimeEntry{position:relative;margin:0;padding:0 0 5px}
.aoCalMonthTimeEntry:before{content:"";position:absolute;top:24px;left:-25px;width:8px;height:8px;border-radius:50%;background:var(--month-accent,#819384);box-shadow:0 0 0 4px #080c12}
.aoCalMonthTimeEntry.sunday:before{width:11px;height:11px;left:-26.5px;background:#c6b38b}
#ao-calendar-modular-root .aoCalMonthTimeButton{display:grid;grid-template-columns:86px minmax(0,1fr) 14px;gap:10px;align-items:center;width:100%;min-height:64px;padding:10px 4px!important;border:0!important;border-radius:0!important;border-bottom:1px solid rgba(227,212,187,.08)!important;background:transparent!important;text-align:left!important}
.aoCalMonthTimeButton time{font:500 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#baa883;white-space:nowrap}
.aoCalMonthTimeButton strong{display:block;font:500 17px/1.2 var(--ao-font-display,"EB Garamond",Georgia,serif);overflow-wrap:break-word}
.aoCalMonthTimeButton small{display:block;margin-top:4px;font:400 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#92989a}
.aoCalMonthTimeButton>span:last-child{color:#baa883}
.aoCalMonthUnclassified{margin:17px 0;padding:9px 0;border-top:1px solid rgba(227,212,187,.14);color:#a3a2a0}
.aoCalMonthUnclassified summary{cursor:pointer;min-height:44px;padding:12px 2px;font:400 14px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
.aoCalMonthUnclassified p{font:400 14px/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#90989b}
#ao-calendar-modular-root .aoCalMonthUnclassified button{display:block;width:100%;min-height:44px;padding:10px 0!important;border:0!important;border-bottom:1px solid rgba(227,212,187,.1)!important;border-radius:0!important;background:transparent!important;text-align:left!important}

.aoCalCustomMonthContext{padding:9px 11px 12px;margin:0 0 12px;background:rgba(203,182,137,.055);border-left:2px solid rgba(203,182,137,.37)}
.aoCalCustomMonthContext>small{display:block;margin-bottom:5px;color:#baa883;font-size:10px;letter-spacing:.09em}
#ao-calendar-modular-root .aoCalCustomMonthContext button{width:100%;min-height:38px;padding:7px 2px!important;text-align:left!important;display:flex;justify-content:space-between;gap:9px;border:0!important;background:transparent!important;color:inherit!important}
.aoCalCustomMonthContext button strong{font-weight:500;font-size:15px}
.aoCalCustomsBlock{margin:18px 0 14px;border-top:1px solid rgba(227,212,187,.18);padding-top:16px}
.aoCalCustomsBlock>h4{font-size:18px;font-weight:500;margin:0 0 8px}
.aoCalCustomArticle{border-bottom:1px solid rgba(227,212,187,.12)}
.aoCalCustomArticle summary{display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer;min-height:56px;padding:9px 1px}
.aoCalCustomArticle summary::-webkit-details-marker{display:none}
.aoCalCustomArticle summary{list-style:none}
.aoCalCustomArticle summary strong{display:block;font-size:16px;font-weight:500}
.aoCalCustomArticle summary small{display:block;color:#a6a09a;font-size:12px;line-height:1.4;margin-top:4px}
.aoCalCustomArticle[open] summary>span:last-child{transform:rotate(90deg)}
.aoCalCustomArticleContent{padding:0 6px 13px;color:#cbc5bb;font-size:14px;line-height:1.55}
.aoCalCustomArticleContent h5{color:#ddc59f;font-size:13px;margin:15px 0 4px;font-weight:600}
.aoCalCustomArticleContent p{margin:5px 0 10px}
.aoCalCustomArticleContent ul{padding-left:18px}
.aoCalCustomArticleContent a{color:#d8c5a4;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
.aoCalCustomCatalogueSection{margin:18px 0 14px}
.aoCalCustomCatalogue{border-top:1px solid rgba(227,212,187,.15);border-bottom:1px solid rgba(227,212,187,.12);padding:3px 0}
.aoCalR18ReviewChoice{margin:12px 0;padding:10px 12px;border-left:2px solid rgba(195,170,131,.48);background:rgba(207,183,139,.045);display:grid;gap:6px}
.aoCalR18ReviewChoice label{font-size:13px;color:#dcc49c}
.aoCalR18ReviewChoice select{width:100%;max-width:340px;min-height:42px;padding:7px 10px;background:#121b26;border:1px solid rgba(207,183,139,.32);border-radius:5px;color:#e7dbca;font:inherit}
.aoCalR18ReviewChoice small{color:#a9a399;font-size:11px}
.aoCalCustomDraftScope{display:block;font-size:11px;max-width:42rem;color:#d2ae79}
.aoCalCustomCatalogue>summary{list-style:none;cursor:pointer;padding:13px 2px;font-size:15px;color:#d2c6b2}
.aoCalCustomCatalogue>summary::-webkit-details-marker{display:none}
.aoCalCustomCatalogue>summary small{opacity:.7;font-size:12px;margin-left:5px}
.aoCalCustomCatalogueLabel{display:block;margin-top:9px;margin-bottom:5px;color:#aaa49c;font-size:12px}
.aoCalCustomCatalogue [data-cal-custom-search]{box-sizing:border-box;width:100%;max-width:100%;border:1px solid rgba(227,212,187,.23);border-radius:5px;background:#111923;color:#ebe1d0;font:inherit;min-height:42px;padding:10px}
.aoCalCustomCatalogue [data-cal-custom-item][hidden]{display:none!important}
.aoCalCustomCatalogueItems{margin-top:10px}
.aoCalCustomYearGroup{padding:2px 0 11px;border-top:1px solid rgba(227,212,187,.12)}
.aoCalCustomYearGroup[hidden]{display:none!important}
.aoCalCustomYearGroup>h4{margin:11px 0 3px;color:#cbb896;font-size:13px;font-weight:500;letter-spacing:.035em}
.aoCalCustomCatalogue [data-cal-custom-empty]{font-size:13px;color:#aba49b}
.aoCalMyCustomsButton{margin-top:13px;background:transparent;border:1px solid rgba(202,180,144,.4);border-radius:5px;color:#d9c49d;padding:10px 14px;min-height:44px;font-size:14px;cursor:pointer}
.aoCalPersonalContext{margin:14px 0 20px;padding:13px;border-left:2px solid rgba(203,176,131,.55);background:rgba(203,176,131,.045)}
.aoCalPersonalPractice{border-top:1px solid rgba(222,208,178,.13);padding:10px 0;display:flex;flex-direction:column;gap:5px}
.aoCalPersonalPractice small{color:#b7a98e;font-size:12px}
.aoCalPersonalPractice strong{color:#eee2ce;font-size:16px;font-weight:500}
.aoCalPersonalPractice p{color:#bbb3a7;font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere;margin:2px 0}
.aoCalPersonalPractice details{border-top:1px solid rgba(222,208,178,.13);padding-top:7px}
.aoCalPersonalPractice details summary{color:#d6be91;cursor:pointer;font-size:14px;min-height:36px;padding:7px 0}
/* Sanctorale defaults to the restrained register while the user-chosen
   hybrid leaves its exact aesthetic open; no source identities are modified. */
#ao-calendar-modular-root [data-cal-month-index="sanctorale"] .aoCalMonthIndexList{gap:0}
#ao-calendar-modular-root [data-cal-month-index="sanctorale"] .aoCalMonthIndexRow{border-bottom:1px solid rgba(227,212,187,.09)}
#ao-calendar-modular-root [data-cal-month-index="sanctorale"] .aoCalMonthIndexDay{min-height:55px!important;padding:8px 3px!important;border:0!important;border-radius:0!important;background:transparent!important;grid-template-columns:75px minmax(0,1fr) 7px!important}
#ao-calendar-modular-root [data-cal-month-index="sanctorale"] .aoCalMonthIndexDay:before{width:2px;opacity:.6}
#ao-calendar-modular-root [data-cal-month-index="sanctorale"] .aoCalMonthSaintDetail{align-self:center;min-height:44px;min-width:92px;border:0;border-radius:0;background:transparent;color:#bba987}
@media(max-width:560px){
 .aoCalHybridHeading{display:block}
 .aoCalHybridHeading span{display:block;text-align:left;margin-top:5px}
 .aoCalHybridMajors{grid-template-columns:1fr}
 #ao-calendar-modular-root .aoCalHybridMajor.featured{min-height:93px!important}
 .aoCalHybridMajor.featured .aoCalHybridTitle{font-size:20px}
 #ao-calendar-modular-root .aoCalHybridPractice{grid-template-columns:67px minmax(0,1fr) 12px;gap:7px}
 #ao-calendar-modular-root .aoCalMonthTimeButton{grid-template-columns:73px minmax(0,1fr) 12px;gap:8px}
}
/* One month, three live source-cycle filters. All 42 dates always remain. */
#ao-calendar-modular-root .aoCalV2Picker .aoCalV2YearHeading{margin:8px 0 0!important;padding:0!important}
#ao-calendar-modular-root .aoCalV2Picker .aoCalV2YearHeading h2{font-size:clamp(30px,5vw,42px)!important;margin:0!important;line-height:1.15}
#ao-calendar-modular-root .aoCalV2Picker .aoCalV2MonthNav{margin:4px 0 8px!important;min-height:44px}
#ao-calendar-modular-root .aoCalV2Picker .aoCalMonthTabs{display:flex;gap:12px;max-width:100%;margin:2px 0 9px!important;padding:0 0 4px!important}
#ao-calendar-modular-root .aoCalV2Picker .aoCalMonthTabs button{font-size:14px!important;letter-spacing:.025em!important;text-transform:none!important}
#ao-calendar-modular-root .aoCalV2MonthMeta{min-height:0!important;margin:0!important;padding:0!important}
#ao-calendar-modular-root [data-cal-month-status]:empty{display:none!important}
#ao-calendar-modular-root [data-cal-month-status]:not(:empty){font:400 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#92999c}
#ao-calendar-modular-root .aoCalV2MonthGrid button{height:clamp(76px,9vw,104px)!important;min-height:76px!important;padding:6px 4px!important}
#ao-calendar-modular-root .aoCalV2MonthGrid .aoCalMonthName{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;max-width:100%;margin-top:5px!important;font:400 clamp(10px,1.28vw,14px)/1.16 var(--ao-font-ui,"EB Garamond",Georgia,serif)!important;overflow-wrap:anywhere;hyphens:auto;color:#ded9ce}
#ao-calendar-modular-root .aoCalV2MonthGrid button[data-cycle="unknown"] .aoCalMonthName{color:#9fa6aa}
#ao-calendar-modular-root .aoCalV2MonthGrid[data-cal-month-filter="temporale"] button:not([data-cycle="temporale"]) .aoCalMonthName,
#ao-calendar-modular-root .aoCalV2MonthGrid[data-cal-month-filter="sanctorale"] button:not([data-cycle="sanctorale"]) .aoCalMonthName{visibility:hidden!important}
#ao-calendar-modular-root .aoCalV2MonthGrid[data-cal-month-filter="temporale"] button:not([data-cycle="temporale"]) .aoCalMonthTop i,
#ao-calendar-modular-root .aoCalV2MonthGrid[data-cal-month-filter="sanctorale"] button:not([data-cycle="sanctorale"]) .aoCalMonthTop i{opacity:.16!important}
#ao-calendar-modular-root .aoCalV2MonthGrid .aoCalMonthCommemorations{position:absolute;bottom:3px;right:4px;font:600 11px/1 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#bbab8c}
#ao-calendar-modular-root .aoCalV2MonthGrid[data-cal-month-filter="temporale"] button:not([data-cycle="temporale"]) .aoCalMonthCommemorations,
#ao-calendar-modular-root .aoCalV2MonthGrid[data-cal-month-filter="sanctorale"] button:not([data-cycle="sanctorale"]) .aoCalMonthCommemorations{visibility:hidden}
#ao-calendar-modular-root .aoCalV2MonthTools{margin:15px 0 0;border-top:1px solid rgba(227,212,187,.11);color:#9fa6aa}
#ao-calendar-modular-root .aoCalV2MonthTools>summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font:400 14px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
#ao-calendar-modular-root .aoCalV2MonthTools .aoCalV2DirectJump{padding:10px 0}
#ao-calendar-modular-root .aoCalV2MonthTools .aoCalV2MonthExport{margin:4px 0}
@media(max-width:560px){
#ao-calendar-modular-root .aoCalV2MonthGrid button{height:78px!important;min-height:78px!important;padding:5px 2px!important}
#ao-calendar-modular-root .aoCalV2MonthGrid .aoCalMonthName{font-size:11px!important;line-height:1.12!important}
#ao-calendar-modular-root .aoCalV2Picker .aoCalMonthTabs button{font-size:13px!important}
}

`;}
function css(){
  return `#${ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:var(--ao-z-surface,2147481800);background:radial-gradient(circle at 50% -10%,rgba(126,103,69,.11),transparent 34%),var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}#${ROOT_ID} *{box-sizing:border-box}#${ROOT_ID} h1,#${ROOT_ID} h2,#${ROOT_ID} h3{font-family:var(--ao-font-display,var(--font-display,Georgia,serif))}.aoCalV2MonthExport{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;margin:10px 0;padding:2px 0}.aoCalV2MonthExport .aoCalV2TextLink{margin:0}.aoCalV2MonthExport button:disabled{opacity:.45;cursor:default}.aoCalV2MonthExport small{font-size:.75rem;color:var(--ao-text-muted,#a6a198)}.aoCalV2MonthExport [data-cal-export-error]{width:100%;margin:0;color:var(--ao-text-muted,#a6a198);font-size:.75rem}.aoCalV2MonthExport [data-cal-export-error]:empty{display:none}.aoCalModTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(8px + var(--safe-top,0px)) var(--ao-page-gutter,14px) 8px;background:linear-gradient(180deg,rgba(8,12,18,.985),rgba(8,12,18,.91));backdrop-filter:blur(var(--ao-topbar-blur,16px));border-bottom:1px solid var(--ao-rule,rgba(226,214,190,.1))}.aoCalModTop h1{margin:0;font-size:17px;font-weight:500;letter-spacing:.025em;text-align:center}.aoCalModTop>span{width:44px;height:44px}.aoCalModTop button,#${ROOT_ID} section button,#${ROOT_ID} details button{min-height:44px;border:1px solid rgba(232,221,201,.13);border-radius:999px;background:rgba(16,24,33,.76);color:#e9e4d9;padding:8px 12px}.aoCalModTop button{width:44px;height:44px;padding:0}.aoCalModBody{width:min(760px,100%);margin:0 auto;padding:8px 14px 48px}.aoCalSacredTime{display:grid;grid-template-columns:180px minmax(0,1fr);gap:22px;align-items:center;padding:24px 4px 28px;position:relative}.aoCalSacredTime:after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ao-cal-liturgical) 62%,transparent),transparent)}.aoCalYearWheel{width:168px;aspect-ratio:1;position:relative;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at center,#0b1118 0 47%,transparent 48%),conic-gradient(from -90deg,color-mix(in srgb,var(--ao-cal-liturgical) 54%,#202934) 0 var(--ao-cal-year-angle),rgba(255,255,255,.065) var(--ao-cal-year-angle) 360deg);box-shadow:inset 0 0 0 1px rgba(235,225,208,.1),0 18px 50px rgba(0,0,0,.2)}.aoCalYearWheel:before{content:"";position:absolute;inset:12px;border-radius:50%;border:1px solid rgba(235,225,208,.1)}.aoCalYearTicks{position:absolute;inset:2px;border-radius:50%;background:repeating-conic-gradient(from -90deg,rgba(238,227,207,.44) 0 1deg,transparent 1deg 30deg);mask:radial-gradient(transparent 0 88%,#000 89% 100%)}.aoCalYearMarker{position:absolute;inset:0;transform:rotate(var(--ao-cal-year-angle));pointer-events:none}.aoCalYearMarker:before{content:"";position:absolute;left:50%;top:-3px;width:8px;height:8px;border-radius:50%;transform:translateX(-50%);background:#e8decc;box-shadow:0 0 0 4px color-mix(in srgb,var(--ao-cal-liturgical) 40%,transparent),0 0 18px color-mix(in srgb,var(--ao-cal-liturgical) 70%,transparent)}.aoCalYearCore{position:relative;z-index:1;width:96px;text-align:center;display:grid;gap:1px}.aoCalYearCore small{font:600 var(--ao-type-ui-xs,11px)/1.12 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;text-transform:uppercase;color:#aaa18f;white-space:normal;overflow-wrap:anywhere}.aoCalYearCore strong{font-size:40px;font-weight:400;line-height:1;color:#f0e8da;margin-top:4px}.aoCalYearCore span{font-size:11px;color:#a9afb5;text-transform:capitalize}.aoCalIdentity{min-width:0}.aoCalKicker,.aoCalSectionHead small{display:block;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--ao-cal-liturgical) 75%,#b9b1a2)}.aoCalIdentity h2{font-size:31px;line-height:1.08;font-weight:400;margin:8px 0 12px;letter-spacing:-.02em}.aoCalIdentityMeta{display:flex;flex-wrap:wrap;gap:0;color:#b9b2a7}.aoCalIdentityMeta span{font-size:12px}.aoCalIdentityMeta span+span:before{content:"·";padding:0 7px;color:#68717a}.aoCalSourceLine{display:flex;gap:7px;align-items:center;margin-top:13px;color:#777f87;font:600 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em;text-transform:uppercase}.aoCalSourceLine span.ok{color:#91a994}.aoCalSourceLine span.warn{color:#b19074}.aoCalWeekSection,.aoCalCommemorations{padding:18px 0;border-bottom:1px solid rgba(235,225,208,.085)}.aoCalSectionHead{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:12px}.aoCalSectionHead h3{font-size:19px;font-weight:400;margin:3px 0 0}.aoCalTodayQuiet{border:0!important;background:transparent!important;color:#b9b1a2!important;padding:4px 0!important;min-height:var(--ao-control-h,44px)!important}.aoCalModRail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(126px,1fr);gap:7px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 1px 7px}.aoCalModRail::-webkit-scrollbar{display:none}.aoCalObservance{scroll-snap-align:center!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;gap:9px!important;align-items:center!important;min-height:70px!important;border-radius:12px!important;text-align:left!important;padding:9px!important;background:linear-gradient(160deg,color-mix(in srgb,var(--ao-cal-liturgical) 7%,#0e161f),#0c131b)!important;position:relative;overflow:hidden}.aoCalObservance:before{content:"";position:absolute;inset:0 auto 0 0;width:2px;background:color-mix(in srgb,var(--ao-cal-liturgical) 72%,#8f7d5e);opacity:.55}.aoCalObservance.active{border-color:color-mix(in srgb,var(--ao-cal-liturgical) 68%,#d8cbaa)!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--ao-cal-liturgical) 24%,transparent) inset}.aoCalObsDate{text-align:center;border-right:1px solid rgba(235,225,208,.08);padding-right:7px}.aoCalObsDate small,.aoCalObsDate b{display:block}.aoCalObsDate small{font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;color:#858d95}.aoCalObsDate b{font-size:19px;font-weight:400;margin-top:4px}.aoCalObsText{min-width:0}.aoCalObsText strong{display:block;font-size:12px;font-weight:500;line-height:1.16;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoCalObsText small{display:block;margin-top:5px;color:#838b92;font:500 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aoCalModWeekNav{display:flex;justify-content:space-between;gap:8px;margin-top:4px}.aoCalModWeekNav button{min-height:var(--ao-control-h,44px)!important;border:0!important;background:transparent!important;color:#999f9f!important;padding:5px 1px!important}.aoCalModWeekNav .aoCalAssetIcon{font-size:.8em}.aoCalModList{display:grid;gap:0}.aoCalModList article{display:grid;grid-template-columns:8px 1fr;gap:10px;align-items:center;padding:11px 2px;border-top:1px solid rgba(235,225,208,.07)}.aoCalModList article:first-child{border-top:0}.aoCalModList article span{width:5px;height:5px;border-radius:50%;background:var(--ao-cal-liturgical,#8f7d5e);opacity:.72}.aoCalModList article strong{font-size:13px;font-weight:400}.aoCalNavigate{margin:18px 0 8px;border-top:1px solid rgba(235,225,208,.08);padding-top:14px}.aoCalNavigate summary{cursor:pointer;list-style:none;color:#858d95;font:650 var(--ao-type-ui-xs,11px)/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase}.aoCalNavigate summary::-webkit-details-marker{display:none}.aoCalModJump{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:10px}.aoCalModJump input{min-height:44px;border:1px solid rgba(235,225,208,.13);border-radius:10px;background:#0d141c;color:#e9e4d9;padding:8px 10px}.aoCalModJump .primary{border-color:rgba(205,179,119,.36)!important}.aoCalModError{min-height:20px;margin-top:7px;font-size:12px;color:#d2aa7b}.aoCalModEmpty{padding:50px 8px;text-align:center}.aoCalModEmpty small{font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.14em;color:#858d95}.aoCalModEmpty h2{font-size:34px;font-weight:400}.aoCalModEmpty p{color:#9da5aa;line-height:1.5}@media(max-width:560px){.aoCalModBody{padding:2px 12px 36px}.aoCalSacredTime{grid-template-columns:138px minmax(0,1fr);gap:14px;padding:18px 0 22px}.aoCalYearWheel{width:132px}.aoCalYearWheel:before{inset:10px}.aoCalYearCore{width:76px}.aoCalYearCore strong{font-size:34px}.aoCalYearCore span{font-size:var(--ao-type-ui-xs,11px)}.aoCalIdentity h2{font-size:24px}.aoCalIdentityMeta span{font-size:11px}.aoCalSourceLine{gap:5px;font-size:var(--ao-type-ui-xs,11px)}.aoCalModRail{grid-auto-columns:132px;margin-right:-12px;padding-right:12px}.aoCalSectionHead{margin-bottom:9px}.aoCalWeekSection,.aoCalCommemorations{padding:15px 0}.aoCalModTop{grid-template-columns:44px 1fr 44px}.aoCalModTop button,.aoCalModTop>span{width:44px;height:44px}}
.aoCalModBody{width:min(var(--ao-content-max,760px),100%);padding:0 var(--ao-page-gutter,14px) 60px}#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalModBody{width:min(var(--ao-content-wide,980px),100%)}
.aoCalGlossaryError:not([hidden]){grid-column:1/-1;margin:0;padding:6px 12px;color:#d9b99a;font:500 14px/1.4 var(--ao-font-ui,system-ui,sans-serif)}.aoCalV2Tabs{position:sticky;top:calc(61px + var(--safe-top,0px));z-index:3;display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:0 calc(-1 * var(--ao-page-gutter,14px));padding:0 var(--ao-page-gutter,14px);background:rgba(8,12,18,.96);border-bottom:1px solid rgba(235,225,208,.09);backdrop-filter:blur(14px)}
.aoCalV2Tabs button{min-height:var(--ao-control-h,44px);border:0;background:transparent;color:#7f878e;font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.045em;text-transform:uppercase;border-bottom:2px solid transparent}
.aoCalV2Tabs button.active{color:#e8decc;border-bottom-color:#cfc2a8}
.aoCalMonthTabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:16px 0 12px;padding:2px 0 5px;border-bottom:1px solid rgba(235,225,208,.08)}.aoCalMonthTabs::-webkit-scrollbar{display:none}.aoCalMonthTabs button{flex:0 0 auto;min-height:var(--ao-control-h,44px)!important;border:0!important;border-radius:0!important;background:transparent!important;padding:7px 10px!important;color:#7f878e!important;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.055em;text-transform:uppercase;position:relative}.aoCalMonthTabs button.active{color:#e8decc!important}.aoCalMonthTabs button.active:after{content:"";position:absolute;left:9px;right:9px;bottom:-6px;height:2px;background:#cfc2a8}
.aoCalMonthIndex{padding:4px 0 2px}.aoCalMonthIndexHead{display:flex;align-items:end;justify-content:space-between;gap:18px;padding:4px 0 12px}.aoCalMonthIndexHead small{color:#9a9184;font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}.aoCalMonthIndexHead p{max-width:470px;margin:0;color:#777f87;font:500 var(--ao-type-ui-sm,12px)/1.4 var(--ao-font-ui,system-ui,sans-serif);text-align:right}.aoCalMonthIndexList{display:grid;gap:7px}.aoCalMonthIndexList .aoCalMonthIndexRow{display:flex;min-width:0;align-items:stretch;gap:7px}.aoCalMonthIndexList .aoCalMonthIndexDay{flex:1 1 auto;min-width:0}.aoCalMonthIndexList .aoCalMonthSaintDetail{flex:0 0 auto;max-width:125px;min-width:94px;min-height:68px;border-radius:var(--ao-card-radius,15px);padding:9px 11px;font:650 .78rem/1.4 var(--ao-font-body,Georgia,serif);color:var(--ao-liturgical-accent,#c7ae6d);border:1px solid var(--ao-rule,rgba(226,214,190,.15));background:var(--ao-surface-1,#101821);text-align:center}.aoCalMonthIndexList .aoCalMonthIndexDay{display:grid!important;grid-template-columns:86px minmax(0,1fr) 14px!important;align-items:center!important;gap:12px!important;min-height:68px!important;border-radius:var(--ao-card-radius,15px)!important;background:linear-gradient(150deg,color-mix(in srgb,var(--month-accent,#59626c) 5%,#0b1118),#0b1118)!important;text-align:left!important;padding:11px 13px!important;position:relative;overflow:hidden}.aoCalMonthIndexList .aoCalMonthIndexDay:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--month-accent,#59626c);opacity:.72}.aoCalMonthIndexList .aoCalMonthIndexDay.selected{border-color:#d4c6a8!important;box-shadow:inset 0 0 0 1px rgba(212,198,168,.18)}.aoCalMonthIndexList time{color:#aa9a80;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);font-variant-numeric:tabular-nums}.aoCalMonthIndexText{min-width:0}.aoCalMonthIndexText strong{display:block;font-size:15px;font-weight:400;line-height:1.18}.aoCalMonthIndexText small{display:block;margin-top:5px;color:#858d94;font:600 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}.aoCalMonthIndexText em{display:block;margin-top:7px;color:#b9aa91;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em;text-transform:uppercase;font-style:normal}.aoCalMonthIndexList i{width:8px;height:8px;border-radius:50%;background:var(--month-accent,#59626c);justify-self:end;opacity:.85}.aoCalMonthEmpty{padding:28px 14px;border:1px solid rgba(235,225,208,.08);border-radius:var(--ao-card-radius,15px);color:#81898f;text-align:center;font-size:12px;line-height:1.45}
.aoCalV2DayNav{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:12px;padding:24px 0 18px;border-bottom:1px solid rgba(235,225,208,.08)}
.aoCalV2DayNav button,.aoCalV2MonthNav button,.aoCalV2WeekShift button,.aoCalV2Today{border:0!important;background:transparent!important;color:#aaa39a!important}
.aoCalV2DayNav>div{text-align:center}.aoCalV2DayNav small{display:block;color:#8d949a;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;text-transform:uppercase}.aoCalV2DayNav strong{display:block;margin-top:5px;font-size:18px;font-weight:400;text-transform:capitalize}
.aoCalV2Hero{text-align:center;padding:26px 10px 22px;position:relative}.aoCalV2Hero:after{content:"";position:absolute;left:20%;right:20%;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ao-cal-liturgical) 62%,transparent),transparent)}
.aoCalV2Eyebrow,.aoCalV2SectionTitle small,.aoCalV2Commemorations>small,.aoCalV2YearHeading small,.aoCalV2YearIdentity>small,.aoCalV2MajorLine small,.aoCalV2PeriodProgress small,.aoCalV2ComingGrid small{font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.14em;text-transform:uppercase;color:#8f948f}
.aoCalV2Hero h2{font-size:clamp(29px,5.5vw,48px);line-height:1.02;font-weight:400;letter-spacing:-.035em;margin:8px auto 10px;max-width:780px}.aoCalV2Hero .aoCalIdentityMeta{justify-content:center}.aoCalV2Hero .aoCalSourceLine{justify-content:center}
.aoCalV2Saint{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;margin:0;border-top:1px solid rgba(235,225,208,.07);border-bottom:1px solid rgba(235,225,208,.09);background:linear-gradient(90deg,color-mix(in srgb,var(--saint-accent,#59626c) 5%,transparent),transparent)}.aoCalV2Saint small{color:#9d9487;font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em}.aoCalV2Saint p{margin:5px 0 0;color:#858c91;font:500 11px/1.35 var(--ao-font-ui,system-ui,sans-serif)}.aoCalV2Saint button{flex:0 0 auto;min-height:var(--ao-control-h,44px)!important;border:0!important;background:transparent!important;color:#d1c4ad!important;padding:0!important;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.08em;text-transform:uppercase}.aoCalV2Saint button span{margin-left:6px}
.aoCalV2Primary{margin-top:12px!important;min-height:48px!important;border-radius:var(--ao-control-radius,11px)!important;padding:0 22px!important;border:1px solid rgba(214,195,156,.4)!important;background:rgba(171,145,94,.1)!important;color:#eee5d5!important;font:600 11px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}.aoCalV2Primary span{margin-left:10px}.aoCalV2Hero [data-cal-print-feedback]:empty{display:none}
.aoCalV2Context{padding:18px 0;border-bottom:1px solid rgba(235,225,208,.08)}.aoCalV2WeekSection,.aoCalV2Commemorations,.aoCalV2Coming{padding:28px 0;border-bottom:1px solid rgba(235,225,208,.08)}
.aoCalV2SectionTitle{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.aoCalV2SectionTitle h3{margin:4px 0 0;font-size:25px;font-weight:400}.aoCalV2SectionTitle>strong{font:400 27px/1 Georgia,serif;color:#cabca4}

.aoCalV2NextMajor{width:100%;display:grid!important;grid-template-columns:1fr auto!important;gap:4px 16px!important;text-align:left!important;border:1px solid rgba(235,225,208,.1)!important;border-radius:3px!important;background:#0c1219!important;padding:16px 18px!important}.aoCalV2NextMajor small{grid-column:1/-1;color:#8d949a;font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}.aoCalV2NextMajor strong{font-size:18px;font-weight:400}.aoCalV2NextMajor span{align-self:center;color:#8d949a;font:500 var(--ao-type-ui-sm,12px)/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalV2TextLink{display:inline-flex!important;margin-top:16px!important;border:0!important;background:transparent!important;padding:6px 0!important;color:#c8bda9!important;font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase}
.aoCalV2Week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid rgba(235,225,208,.08);border-bottom:1px solid rgba(235,225,208,.08)}.aoCalV2Week button{min-width:0!important;min-height:112px!important;border:0!important;border-right:1px solid rgba(235,225,208,.06)!important;border-radius:0!important;background:transparent!important;padding:14px 7px!important;text-align:center!important;position:relative}.aoCalV2Week button:last-child{border-right:0!important}.aoCalV2Week button:after{content:"";position:absolute;left:25%;right:25%;bottom:-1px;height:2px;background:var(--day-accent);opacity:.42}.aoCalV2Week button.active{background:rgba(235,225,208,.035)!important}.aoCalV2Week button.active:after{left:12%;right:12%;height:3px;opacity:1}.aoCalV2Week small{display:block;color:#747d85;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase}.aoCalV2Week b{display:block;margin:8px 0 7px;font-size:23px;font-weight:400}.aoCalV2Week span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:1.15;color:#aaa49a}
.aoCalV2WeekShift,.aoCalV2MonthNav{display:flex;justify-content:space-between;gap:10px;margin-top:9px}.aoCalV2MonthNav{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center}.aoCalV2MonthNav button{min-width:0!important;padding-inline:0!important}.aoCalV2MonthNav button:first-child{justify-self:start;text-align:left}.aoCalV2MonthNav button:last-child{justify-self:end;text-align:right}.aoCalV2WeekShift button,.aoCalV2MonthNav button{font-size:11px!important}
.aoCalV2Today{font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;text-transform:uppercase!important;letter-spacing:.08em!important}
.aoCalV2Commemorations h3{font-size:24px;font-weight:400;margin:4px 0 10px}.aoCalV2Commemorations p{display:grid;grid-template-columns:8px 1fr;gap:10px;align-items:center;margin:0;padding:10px 0;border-top:1px solid rgba(235,225,208,.06)}.aoCalV2Commemorations i{width:5px;height:5px;border-radius:50%;background:#a79575}.aoCalV2Commemorations span{font-size:13px}
.aoCalPilgrimagePlaces{margin-top:18px;padding:14px;border-top:1px solid rgba(218,195,146,.18);background:rgba(19,29,39,.35)}.aoCalPilgrimagePlaces>small{font:650 11px var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;color:#c7b386}.aoCalPilgrimagePlaces>p{font-size:12px;color:#b1a794;line-height:1.5}.aoCalPilgrimagePlaces article{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(218,195,146,.1);padding:12px 0}.aoCalPilgrimagePlaces article strong{font-size:13px;font-weight:500}.aoCalPilgrimagePlaces article small{display:block;color:#92989c;font-size:11px;margin-top:4px}.aoCalPilgrimagePlaces article button{font-size:11px;flex:none}.aoCalPracticeContext{padding:24px 0;border-bottom:1px solid rgba(235,225,208,.085)}.aoCalPracticeIntro{margin:-4px 0 14px;color:#8e969b;font-size:12px;line-height:1.45;max-width:650px}.aoCalPracticeList{display:grid;gap:8px}.aoCalPracticeCard{padding:15px 16px;border:1px solid rgba(235,225,208,.09);border-radius:var(--ao-card-radius,15px);background:#0b1118}.aoCalPracticeCard>small{display:block;color:#a79575;font:700 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;text-transform:uppercase}.aoCalPracticeCard h4{margin:7px 0 6px;font-size:19px;font-weight:400}.aoCalPracticeCard>p{margin:0;color:#9aa1a5;font-size:12px;line-height:1.45}.aoCalPracticeCard details,.aoCalPracticeDiscipline{margin-top:11px;border-top:1px solid rgba(235,225,208,.07);padding-top:10px}.aoCalPracticeCard summary,.aoCalPracticeDiscipline>summary{cursor:pointer;color:#b8ab94;font:700 var(--ao-type-ui-xs,11px)/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase}.aoCalPracticeCard details p{margin:7px 0 0;color:#8e969b;font-size:11px;line-height:1.45}.aoCalPracticeActions{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}.aoCalPracticeActions button{min-height:var(--ao-control-h,44px)!important;padding:6px 9px!important;border-radius:9px!important;background:transparent!important;color:#cbbda4!important;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.05em;text-transform:uppercase}.aoCalPracticeDisciplineIntro{margin:9px 0 12px;color:#8e969b;font-size:11px;line-height:1.45}.aoCalPracticeDiscipline>section{padding:11px 0;border-top:1px solid rgba(235,225,208,.06)}.aoCalPracticeDiscipline>section>small{color:#9e9588;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em}.aoCalPracticeDiscipline article{padding:9px 0}.aoCalPracticeDiscipline article+article{border-top:1px solid rgba(235,225,208,.05)}.aoCalPracticeDiscipline article>div{display:flex;justify-content:space-between;gap:12px}.aoCalPracticeDiscipline article strong{font-size:13px;font-weight:500}.aoCalPracticeDiscipline article span{color:#a79575;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.05em}.aoCalPracticeDiscipline article p{margin:5px 0 0;color:#8e969b;font-size:11px;line-height:1.45}.aoCalPracticeDiscipline article b{display:block;margin-top:6px;color:#c6b99f;font-size:11px;font-weight:600}.aoCalPracticeSources{display:flex;flex-wrap:wrap;gap:8px;margin-top:5px}.aoCalPracticeSources a{color:#9f927b;font:600 var(--ao-type-ui-xs,11px)/1.3 var(--ao-font-ui,system-ui,sans-serif);text-decoration:none}
.aoCalV2YearHero{padding:28px 0 34px;border-bottom:1px solid rgba(235,225,208,.09)}.aoCalV2YearHeading h2{font-size:38px;font-weight:400;margin:7px 0 0}.aoCalV2YearHeading p{color:#8c949a;margin:8px 0 0}
.aoCalV2YearHeroGrid{display:grid;grid-template-columns:300px 1fr;gap:44px;align-items:center;margin-top:24px;padding:28px;border:1px solid rgba(235,225,208,.1);border-radius:var(--ao-card-radius,15px);background:radial-gradient(circle at 18% 38%,var(--liturgical-soft,rgba(140,150,160,.08)),transparent 34%),var(--surface-1,#0a1016)}
.aoCalV2Ring{width:260px;aspect-ratio:1;border-radius:50%;position:relative;display:grid;place-items:center;background:radial-gradient(circle at center,var(--bg,#080c12) 0 54%,transparent 55%),var(--year-season-gradient);box-shadow:inset 0 0 0 1px rgba(235,225,208,.08),0 22px 60px rgba(0,0,0,.26)}.aoCalV2Ring:before{content:"";position:absolute;inset:0;border-radius:50%;background:var(--year-daily-gradient);-webkit-mask:radial-gradient(circle,transparent 0 69%,#000 70%);mask:radial-gradient(circle,transparent 0 69%,#000 70%)}
.aoCalV2Ring:after{content:"";position:absolute;inset:18px;border:1px solid rgba(235,225,208,.12);border-radius:50%}.aoCalV2RingCore{position:relative;z-index:2;width:145px;text-align:center}.aoCalV2RingCore strong{display:block;font-size:43px;font-weight:400;color:var(--text,#eef0ef)}.aoCalV2RingCore small{display:block;margin-top:4px;color:var(--muted,#a6abb5);font:700 var(--ao-type-ui-xs,11px)/1.15 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}.aoCalV2RingCore span{display:block;margin-top:8px;color:#9ba0a3;font-size:12px}.aoCalV2RingMarker{position:absolute;inset:0;transform:rotate(var(--year-angle));z-index:3}.aoCalV2RingMarker:before{content:"";position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:13px;height:13px;border-radius:50%;background:var(--text,#eef0ef);border:3px solid var(--liturgical,#929ba8);box-shadow:0 0 0 2px var(--bg,#080c12)}
.aoCalV2YearIdentity h3{font-size:35px;font-weight:400;margin:7px 0 2px}.aoCalV2SelectedFeast{font-size:19px;color:#b7afa3;margin:0 0 20px}.aoCalV2YearIdentity dl{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin:0}.aoCalV2YearIdentity dl div{border-top:1px solid rgba(235,225,208,.1);padding:10px 0}.aoCalV2YearIdentity dt{color:#7f878d;font:700 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase}.aoCalV2YearIdentity dd{margin:5px 0 0;font-size:15px}.aoCalV2MajorLine{border-top:1px solid rgba(235,225,208,.1);padding:11px 0}.aoCalV2MajorLine button{display:block!important;border:0!important;background:transparent!important;padding:5px 0!important;color:#e7dfd2!important;font-size:15px!important;text-align:left!important}.aoCalV2PeriodProgress{margin-top:7px}.aoCalV2PeriodProgress>div{display:flex;justify-content:space-between;align-items:end}.aoCalV2PeriodProgress strong{font-size:18px;font-weight:400;color:#c5b79d}.aoCalV2PeriodProgress>span{margin:8px 0 0}


.aoCalV2ComingGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aoCalV2ComingGrid button{min-height:116px!important;border-radius:2px!important;background:#0b1118!important;text-align:left!important;padding:17px!important;border-radius:var(--ao-card-radius,15px)!important}.aoCalV2ComingGrid strong{display:block;font-size:20px;font-weight:400;margin:9px 0 6px}.aoCalV2ComingGrid span{color:#8f969a;font:500 var(--ao-type-ui-sm,12px)/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalMonthNavShort{display:none}.aoCalV2MonthNav button{display:flex;align-items:center;gap:5px;min-height:var(--ao-control-h,44px)!important;max-width:100%;overflow:visible;white-space:normal}.aoCalV2MonthNav button:last-child{justify-content:flex-end}.aoCalV2MonthNav button:first-child{justify-content:flex-start}
.aoCalV2Picker{padding:28px 0}.aoCalV2MonthNav{align-items:center;margin:18px 0 10px}.aoCalV2MonthMeta{display:flex;justify-content:space-between;gap:12px;margin:0 0 13px;color:#747d84;font:600 var(--ao-type-ui-xs,11px)/1.35 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.035em}.aoCalV2MonthMeta span:last-child{text-align:right}.aoCalV2Weekdays,.aoCalV2MonthGrid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));width:100%;min-width:0}.aoCalV2Weekdays{border-bottom:1px solid rgba(235,225,208,.09)}.aoCalV2Weekdays span{text-align:center;padding:9px 4px;color:#747d84;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase}.aoCalV2MonthGrid{border-left:1px solid rgba(235,225,208,.06);border-top:1px solid rgba(235,225,208,.06)}.aoCalV2MonthGrid button{aspect-ratio:auto;min-width:0!important;padding:7px 5px 5px!important;height:78px!important;min-height:0!important;border-radius:0!important;border-width:0 1px 1px 0!important;border-color:rgba(235,225,208,.06)!important;background:color-mix(in srgb,var(--month-accent,#59626c) 3%,#0b1118)!important;position:relative;text-align:left!important;overflow:hidden}.aoCalV2MonthGrid button[data-ready="0"]{--month-accent:#59626c}.aoCalV2MonthGrid button.outside{opacity:.26}.aoCalV2MonthGrid button.sunday:not(.outside){background:color-mix(in srgb,var(--month-accent,#59626c) 7%,#0b1118)!important}.aoCalV2MonthGrid button.selected{z-index:1;box-shadow:inset 0 0 0 2px #d3c5a7}.aoCalV2MonthGrid button.today .aoCalMonthTop b{outline:1px solid rgba(181,93,80,.9);outline-offset:2px;border-radius:50%}.aoCalMonthTop{display:flex;align-items:center;justify-content:space-between;gap:4px}.aoCalV2MonthGrid b{font-size:16px;font-weight:400;line-height:1}.aoCalMonthTop i{display:block;width:6px;height:2px;border-radius:999px;background:var(--month-accent,#59626c);opacity:.62}.aoCalV2MonthGrid button[data-rank-tier="1"] .aoCalMonthTop i{width:16px;height:3px;opacity:1}.aoCalV2MonthGrid button[data-rank-tier="2"] .aoCalMonthTop i{width:12px;height:3px;opacity:.9}.aoCalV2MonthGrid button[data-rank-tier="3"] .aoCalMonthTop i{width:9px;height:2px;opacity:.76}.aoCalMonthName{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:8px;color:#a9a397;font:500 var(--ao-type-ui-xs,11px)/1.08 var(--ao-font-ui,system-ui,sans-serif);overflow-wrap:anywhere}.aoCalV2MonthGrid button.major .aoCalMonthName,.aoCalV2MonthGrid button.sunday .aoCalMonthName{color:#d3cab9}.aoCalMonthName:empty{display:none}.aoCalV2DirectJump{margin-top:22px;padding-top:18px;border-top:1px solid rgba(235,225,208,.08)}.aoCalV2DirectJump label{color:#8c949a;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase}.aoCalV2DirectJump>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:8px}.aoCalV2DirectJump input{min-width:0;min-height:var(--ao-control-h,44px);border:1px solid rgba(235,225,208,.13);border-radius:var(--ao-control-radius,11px);background:#0b1118;color:#e7dfd2;padding:8px 11px}.aoCalV2DirectJump p{min-height:18px;color:#d2aa7b;font-size:11px}
@media(max-width:700px){.aoCalMonthTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible;column-gap:4px;row-gap:2px;margin:10px 0 12px;padding:0 0 5px}.aoCalMonthTabs button{width:100%;min-width:0!important;min-height:44px!important;white-space:normal;line-height:1.2!important;overflow-wrap:break-word;text-align:center}.aoCalV2Picker{padding-top:12px}.aoCalV2YearHeading h2{font-size:clamp(25px,7vw,31px);line-height:1.1}.aoCalV2MonthNav{margin:8px 0 8px;gap:4px}.aoCalV2MonthNav button{min-height:44px!important;min-width:0!important;width:100%!important;box-sizing:border-box;justify-self:stretch!important;font-size:11px!important;padding:4px 0!important}.aoCalV2MonthNav button:first-child,.aoCalV2MonthNav button:last-child{justify-self:stretch!important}.aoCalMonthNavLong{display:none}.aoCalMonthNavShort{display:inline}.aoCalV2MonthNav svg{width:16px;max-width:16px;flex:none}.aoCalModBody{padding:0 var(--ao-page-gutter-phone,12px) 46px}.aoCalV2Tabs{top:calc(61px + var(--safe-top,0px));margin:0 calc(-1 * var(--ao-page-gutter-phone,12px));padding:0 6px}.aoCalV2Tabs button{font-size:var(--ao-type-ui-xs,11px);letter-spacing:.025em}.aoCalMonthTabs{margin-left:0;margin-right:0}.aoCalMonthTabs button{font-size:var(--ao-type-ui-xs,11px)!important;padding-inline:8px!important}.aoCalV2Hero{padding:18px 4px 16px}.aoCalV2Hero h2{font-size:31px}.aoCalV2Saint{align-items:center;padding:8px 4px}.aoCalV2Saint p{font-size:var(--ao-type-ui-xs,11px)}.aoCalV2Saint button{min-height:var(--ao-control-h,44px)!important}.aoCalV2NextMajor{grid-template-columns:1fr!important}.aoCalV2Week{overflow-x:auto;grid-template-columns:repeat(7,92px);margin-right:-12px}.aoCalV2Week button{min-height:104px!important}.aoCalV2YearHeroGrid{grid-template-columns:1fr;gap:26px;padding:22px 16px}.aoCalV2Ring{width:min(250px,76vw);margin:auto}.aoCalV2YearIdentity{text-align:left}.aoCalV2YearIdentity h3{font-size:31px}.aoCalV2YearIdentity dl{grid-template-columns:1fr 1fr}.aoCalV2ComingGrid{grid-template-columns:1fr}.aoCalMonthIndexHead{display:grid;gap:5px}.aoCalMonthIndexHead p{text-align:left}.aoCalMonthIndexList .aoCalMonthIndexDay{grid-template-columns:74px minmax(0,1fr) 12px!important;padding:10px 11px!important}.aoCalV2MonthGrid button{height:66px!important;min-height:0!important;padding:6px 4px 4px!important}.aoCalMonthName{font-size:var(--ao-type-ui-xs,11px);margin-top:6px}.aoCalV2MonthMeta{display:grid;gap:3px}.aoCalV2MonthMeta span:last-child{text-align:left;font-weight:500}.aoCalV2SectionTitle h3{font-size:22px}}
/* Phone month index: keep all five source-owned month views on ONE legible
   horizontal rail rather than wrapping / splitting Temporale and Sanctorale.
   Scoped to the standalone Calendar and Today’s inline Month; embedded Mass Calendar untouched. */
@media(max-width:700px){
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalMonthTabs{
   display:flex;flex-wrap:nowrap;align-items:stretch;gap:5px;
   overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;
   -webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;
   scrollbar-width:thin;scrollbar-color:rgba(201,173,120,.5) transparent;
   margin:8px 0 9px;padding:0 0 5px;scroll-padding-inline:8px;
 }
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalMonthTabs button{
   flex:0 0 auto;width:auto;min-width:80px!important;
   min-height:44px!important;white-space:nowrap;overflow-wrap:normal;
   padding:9px 12px!important;font-size:12px!important;
   line-height:1.3!important;scroll-snap-align:start;
 }
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalV2MonthNav{
   display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr) minmax(0,1fr);
   gap:8px;margin:6px 0 6px
 }
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalV2MonthNav button{
   display:flex;align-items:center;justify-content:center;gap:5px;
   min-height:44px!important;padding:8px 6px!important;
   font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)!important;
   color:var(--ao-text-primary,#e9e4d9)!important;
 }
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalV2MonthNav button:first-child{justify-content:flex-start!important}
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalV2MonthNav button:last-child{justify-content:flex-end!important}
 :is(#${ROOT_ID}:not([data-ao-calendar-embedded="true"]),.aoTodayV2CalendarInline #${ROOT_ID}) .aoCalV2Picker .aoCalV2MonthMeta{
   margin:0 0 8px;gap:2px;font-size:12px;line-height:1.4
 }
}
/* Body-copy readability floor; do not enlarge dates, hierarchy captions or rubrical labels. */
.aoCalV2Saint p,.aoCalMonthIndexHead p,.aoCalV2ComingGrid span,.aoCalV2Commemorations span,.aoCalPilgrimagePlaces>p,.aoCalPracticeIntro,.aoCalV2RingCore span{font-size:max(14px,.875rem);line-height:1.5}
${liturgicalClockCss}
${approvedClassIHeroCss}
#${ROOT_ID} .aoClock{--bg:var(--ao-bg-canvas,#080c12);--text:var(--ao-text-primary,#e9e4d9);--muted:var(--ao-text-muted,#a6a198);--liturgical:var(--ao-liturgical-accent,#c7ae6d);--liturgical-border:var(--ao-rule,rgba(226,214,190,.15))}
#${ROOT_ID} .aoClock+.aoCalV2YearHero{margin-top:24px;padding-top:18px;border-top:1px solid var(--ao-rule,rgba(226,214,190,.15))}
${hybridMonthCss()}
${yearJourneyCss}
#${ROOT_ID}[data-ao-calendar-embedded="true"]{position:relative!important;inset:auto!important;z-index:auto!important;width:100%;height:auto;max-height:none;min-height:0;overflow:visible!important;background:transparent;box-shadow:none}
#${ROOT_ID}[data-ao-calendar-embedded="true"] .aoCalModTop{position:relative;top:auto;padding:8px}
#${ROOT_ID}[data-ao-calendar-embedded="true"] .aoCalModBody{width:100%;max-width:760px;padding:6px 4px 26px}
#${ROOT_ID}[data-ao-calendar-embedded="true"] .aoCalV2Week{margin-right:0}
#${ROOT_ID}[data-ao-calendar-embedded="true"] .aoCalV2Tabs{display:none!important}
`;
}
let unsub=null,embeddedReturn=null;
function root(){return globalThis.document?.getElementById?.(ROOT_ID)??null}
function centerSelectedDay(r){
  const el=r?.querySelector?.("[data-cal-date][aria-current=\"date\"]");
  const scroller=el?.closest?.(".aoCalV2Week,.aoCalModRail");
  if(!el||!scroller||scroller.scrollWidth<=scroller.clientWidth)return;
  const left=el.offsetLeft-(scroller.clientWidth-el.offsetWidth)/2;
  scroller.scrollTo?.({left:Math.max(0,left),behavior:"auto"});
}
function calendarGlossaryTerms(){
  if(calendarView==="year")return ["G086","G087","G273","G274"];
  if(calendarView==="picker"){
    if(calendarMonthView==="temporale")return ["G086","G082","G277"];
    if(calendarMonthView==="sanctorale")return ["G087","G276","G275"];
    if(calendarMonthView==="practices")return ["G322","G334","G095","G094"];
    if(calendarMonthView==="major")return ["G261","G262","G276","G277"];
    return ["G273","G274","G269","G271"];
  }
  const r=state()?.resolution;
  const text=[titleOf(r),rankOf(r),profileOf(r)].filter(Boolean).join(" ").toLowerCase();
  const ids=[];
  const add=(...xs)=>ids.push(...xs);
  if(/feria|férie/.test(text))add("G082");
  if(/vigil/.test(text))add("G083");
  if(/octav/.test(text))add("G084");
  if(/commemor/.test(text))add("G085");
  if(/ember|quatre[- ]temps/.test(text))add("G088");
  if(/rogation/.test(text))add("G094");
  if(/advent|avent/.test(text))add("G090");
  if(/lent|carême|careme/.test(text))add("G091");
  if(/easter|pasch|pâques|paques/.test(text))add("G092");
  if(/pentecost|pentecôte|pentecote/.test(text))add("G093");
  if(/1st|first|i class|i classe/.test(text))add("G261");
  if(/2nd|second|ii class|ii classe/.test(text))add("G262");
  if(/3rd|third|iii class|iii classe/.test(text))add("G263");
  if(/4th|fourth|iv class|iv classe/.test(text))add("G264");
  if(!ids.length)add("G086","G087","G276");
  return [...new Set(ids)];
}
async function openCalendarGlossary(){
  const button=root()?.querySelector("[data-cal-glossary]");
  const feedback=root()?.querySelector("[data-cal-glossary-error]");
  if(button?.getAttribute("aria-busy")==="true")return false;
  button?.setAttribute("aria-busy","true");
  if(feedback){feedback.hidden=true;feedback.textContent=""}
  try{
    const {ensureLearnModule}=await import("../learn/lazy-module-registry.js");
    await ensureLearnModule("learn.glossary",globalThis);
    const glossary=globalThis.AO_GLOSSARY_V1;
    if(typeof glossary?.openTerms!=="function")throw new Error("Glossary owner not installed");
    await glossary.openTerms(calendarGlossaryTerms(),{origin:"calendar"});
    return glossary?.status?.().open===true;
  }catch(error){
    console.error("Calendar glossary launch failed",error);
    if(feedback){feedback.hidden=false;feedback.textContent=L("Definitions unavailable. Please try again.","Définitions indisponibles. Veuillez réessayer.")}
    return false;
  }finally{button?.removeAttribute("aria-busy")}
}
function paint(){
  const r=root();if(!r)return false;
  const body=r.querySelector("[data-cal-body]");if(!body)return false;
  const selected=state()?.selectedDate||"",isSameDay=calendarView==="day"&&r.dataset.aoCalendarPaintDate===selected&&r.dataset.aoCalendarPaintView==="day";
  // Date/week-cache subscriptions may repaint after a person expands this
  // disclosure. Preserve it only on a same-date Day repaint.
  const oldDiscipline=isSameDay?body.querySelector(".aoCalPracticeDiscipline"):null;
  const wasDisciplineOpen=oldDiscipline?.open===true;
  const previousSources=isSameDay?[...body.querySelectorAll(".aoCalSecondarySaintCard details")].map(x=>x.open):[];
   const previousRubricSourcesOpen=isSameDay?body.querySelector(".aoCalDaySources")?.open===true:false;
  // Preserve an intentionally expanded printing control through the same-day
  // background cache/source re-paints, without leaking it to another date.
  const previousMonthToolsOpen=calendarView==="picker"&&body.querySelector(".aoCalV2MonthTools")?.open===true;
  const previousPrintOptions=isSameDay?body.querySelector(".aoCalV2PrintOptions"):null;
  const previousPrintOpen=previousPrintOptions?.open===true;
  const hadPrintSummaryFocus=Boolean(previousPrintOptions?.querySelector("summary")?.contains(globalThis.document?.activeElement));
  const hadDisciplineFocus=Boolean(oldDiscipline?.querySelector("summary")?.contains(globalThis.document?.activeElement));
  const active=globalThis.document?.activeElement,existing=body.querySelector("[data-cal-input]"),editing=active===existing,value=editing?existing.value:null,start=editing?existing.selectionStart:null,end=editing?existing.selectionEnd:null;
  body.innerHTML=bodyMarkup();
  // Remote Commons previews are not bundled offline: fail closed to the cited
  // artwork identity and source rather than leaving a broken-image icon.
  body.querySelectorAll(".aoClassIApprovedHero img").forEach(img=>{
    img.addEventListener("error",()=>{
      const figure=img.closest(".aoClassIApprovedHero");
      if(!figure||!img.isConnected)return;
      const fallback=globalThis.document.createElement("div");
      fallback.className="aoClassIHeld";fallback.setAttribute("role","note");
      fallback.textContent=L("Image unavailable offline — artwork selection preserved",
        "Image indisponible hors ligne — choix de l’œuvre conservé");
      img.replaceWith(fallback);
      figure.dataset.aoImageStatus="REMOTE_PREVIEW_FAILED";
    },{once:true});
  });
  if(wasDisciplineOpen){
    const next=body.querySelector(".aoCalPracticeDiscipline");
    if(next){next.open=true;if(hadDisciplineFocus)next.querySelector("summary")?.focus?.({preventScroll:true})}
  }
  if(isSameDay&&previousSources.length)body.querySelectorAll(".aoCalSecondarySaintCard details").forEach((node,index)=>{node.open=previousSources[index]===true});
   if(previousRubricSourcesOpen){const sources=body.querySelector(".aoCalDaySources");if(sources)sources.open=true}
  if(previousPrintOpen){
    const print=body.querySelector(".aoCalV2PrintOptions");
    if(print){print.open=true;if(hadPrintSummaryFocus)print.querySelector("summary")?.focus?.({preventScroll:true})}
  }
  if(previousMonthToolsOpen){const tools=body.querySelector(".aoCalV2MonthTools");if(tools)tools.open=true}
  if(editing){const input=body.querySelector("[data-cal-input]");if(input){input.value=value;input.focus({preventScroll:true});if(start!==null&&end!==null)input.setSelectionRange(start,end)}}
  r.dataset.aoCalendarOwner=VERSION;r.dataset.aoCalendarView=calendarView;r.dataset.aoCalendarPaintView=calendarView;r.dataset.aoCalendarPaintDate=selected;
  requestAnimationFrame(()=>centerSelectedDay(r));return true;
}
// Exact selection is revalidated *after* Calendar is reopened, not inferred
// from today's date, feast title or a Scripture verse shared by other Masses.
function openSelectedScriptureReading(target,{onCloseReturn=null}={}){
 const origin=root();
 if(!origin||origin.dataset.aoCalendarEmbedded==="true"||
    selectedScriptureReturn||typeof onCloseReturn!=="function")return false;
 const verified=matchingSelectedCalendarScriptureObject(state(),target);
 if(!verified)return false;
 setView("day");
 const button=root()?.querySelector(
   '[data-cal-scripture-date="'+target.date+'"][data-cal-scripture-slot="'+target.slot+'"]');
 if(!button)return false;
 selectedScriptureReturn={onCloseReturn};
 button.focus?.({preventScroll:true});
 return true;
}
function returnToSelectedScripture(){
 const receipt=selectedScriptureReturn;
 if(!receipt)return false;
 selectedScriptureReturn=null;
 close({silent:true});
 queueMicrotask(()=>{
   try{void receipt.onCloseReturn()}catch(error){
     console.error("Selected Calendar Scripture return failed",error);
   }
 });
 return true;
}
function syncShell(surface){globalThis.AO_APP_SHELL_V1?.syncSurface?.(surface)}
function close({surface="home",silent=false}={}){selectedScriptureReturn=null;cancelPendingNavigation();yearColourLoad=null;const previous=embeddedReturn;embeddedReturn=null;root()?.remove?.();try{unsub?.()}catch{}unsub=null;if(silent)return true;if(previous){try{previous.onClose?.()}catch{}return true}syncShell(surface);try{globalThis.AO_GLOBAL_RIBBON_V4323?.setActive?.(surface)}catch{}return true}
async function waitForResolution(target,{attempts=120,delay=50}={}){
  for(let i=0;i<attempts;i+=1){
    const s=state(),r=s?.resolution;
    if(s?.selectedDate===target&&!s?.resolving&&r?.date===target)return r;
    await new Promise(resolve=>setTimeout(resolve,delay));
  }
  return null;
}
async function select(id,{closeAfter=false}={}){
  const target=String(id||"");if(!target)return false;
  try{
    const ok=await revealDate(target,{forceLoader:false,prefetch:true});
    if(ok&&closeAfter)close({surface:"home"});
    return ok;
  }catch(error){console.error("Modular Calendar date navigation failed",error);return false}
}
function setMonthView(view,{openMonth=true}={}){
  const next=legacyMonthView(String(view||"").toLowerCase());
  if(!MONTH_INDEX_VIEWS.has(next))return false;
  calendarMonthView=next;
  if(openMonth&&calendarView!=="picker")pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  if(openMonth)calendarView="picker";
  if(!root()){requestedView=openMonth?"picker":requestedView;requestedMonthView=next;return true}
  if(calendarView==="picker"&&!pickerMonthId)pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  // Filtering never destroys the grid, its 42 dates, or the user's scroll.
  const grid=root()?.querySelector?.(".aoCalV2MonthGrid");
  if(calendarView==="picker"&&grid){
    grid.dataset.calMonthFilter=calendarMonthView;
    root()?.querySelectorAll?.("[data-cal-month-view]")?.forEach(button=>{
      const active=button.dataset.calMonthView===calendarMonthView;
      button.classList.toggle("active",active);
      if(active)button.setAttribute("aria-current","page");else button.removeAttribute("aria-current");
    });
    return true;
  }
  root()?.scrollTo?.({top:0,left:0,behavior:"auto"});
  paint();
  if(calendarView==="picker")requestPickerMonth();
  return true;
}
function setView(view){
  let next=String(view||"").toLowerCase();
  if(next==="index"){calendarMonthView="calendar";requestedMonthView="calendar";next="picker"}
  if(next==="month")next="picker";
  if(!CALENDAR_VIEWS.has(next))return false;
  if(!root()){requestedView=next;return true}
  calendarView=next;
  if(calendarView==="year")focusedYearPeriodId=null;
  if(calendarView==="picker"){
    pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
    if(!MONTH_INDEX_VIEWS.has(calendarMonthView))calendarMonthView="calendar";
  }else monthEpoch++;
  root()?.scrollTo?.({top:0,left:0,behavior:"auto"});
  paint();
  if(calendarView==="picker")requestPickerMonth();
  return true;
}
function openPrintableProper(){
  const feedback=root()?.querySelector("[data-cal-print-feedback]");
  try{
    const doc=renderPrintableProperHtml(resolution(),{language:fr()?"fr":"en"});
    const win=globalThis.open?.("","_blank");
    if(!win){if(feedback)feedback.textContent=L("Allow a new window to print the Propers.","Autorisez une nouvelle fenêtre pour imprimer les propres.");return false}
    win.opener=null;win.document.open();win.document.write(doc);win.document.close();
    if(feedback)feedback.textContent="";
    return true;
  }catch(error){
    if(feedback)feedback.textContent=L("Complete bilingual Propers are unavailable for this Mass.","Les propres bilingues complets ne sont pas disponibles pour cette messe.");
    console.error("Calendar print Proper source gate",error);return false;
  }
}
function bind(r){
  r.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&selectedScriptureReturn){
      event.preventDefault();event.stopPropagation();returnToSelectedScripture();return;
    }
    if(event.key==="Escape"&&clockSelection&&calendarView==="year"){
      const previous=clockSelection;clockSelection=null;event.preventDefault();paint();
      const attr=previous.type==="season"?"calClockSeason":previous.type==="cluster"?"calClockCluster":"calClockFeast";
      for(const el of root()?.querySelectorAll("[data-cal-clock-season],[data-cal-clock-cluster],[data-cal-clock-feast]")||[]){
        if(el.dataset[attr]===(previous.id||previous.date)){el.focus?.({preventScroll:true});break;}
      }
      return;
    }
    if((event.key==="Enter"||event.key===" ")&&event.target.closest?.("g[data-cal-clock-season],g[data-cal-clock-feast],g[data-cal-clock-cluster]")){
      event.preventDefault();event.target.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    }
  });
  r.addEventListener("change",event=>{
    const picker=event.target.closest?.("[data-cal-r18-review-region]");
    if(!picker)return;
    setR18ReviewRegion(picker.value);
    paint();
  });
  r.addEventListener("input",event=>{
    const input=event.target.closest?.("[data-cal-custom-search]");
    if(!input)return;
    const container=input.closest(".aoCalCustomCatalogue");
    const term=normaliseCustomSearch(input.value);
    let visible=0;
    for(const row of container?.querySelectorAll("[data-cal-custom-item]")||[]){
      const matches=calendarCustomSearchMatches(row.dataset.calCustomTerms||"",term);
      row.hidden=!matches;
      if(matches)visible++;
    }
    for(const group of container?.querySelectorAll("[data-cal-custom-year-group]")||[]){
      group.hidden=![...group.querySelectorAll("[data-cal-custom-item]")].some(row=>!row.hidden);
    }
    const empty=container?.querySelector("[data-cal-custom-empty]");
    if(empty)empty.hidden=visible!==0;
  });
  r.addEventListener("click",event=>{
    const myCustoms=event.target.closest?.("[data-cal-my-customs-open]");
    if(myCustoms){
      event.preventDefault();
      void import("../customs/personal-ui.js").then(module=>
        module.openMyCustoms({language:fr()?"fr":"en",onChange:()=>{if(root())paint()}})
      ).catch(error=>console.error("Personal Customs module unavailable",error));
      return;
    }
    const clockControl=event.target.closest?.("[data-cal-clock-close],[data-cal-clock-season],[data-cal-clock-cluster],[data-cal-clock-feast],[data-cal-clock-open-day],[data-cal-clock-browse],[data-cal-clock-year],[data-cal-clock-today]");
    if(clockControl){
      event.preventDefault();
      const d=clockControl.dataset;
      if(d.calClockClose!==undefined){clockSelection=null;paint();return;}
      if(d.calClockSeason!==undefined){clockSelection={type:"season",id:d.calClockSeason};paint();return;}
      if(d.calClockCluster!==undefined){clockSelection={type:"cluster",date:d.calClockCluster};paint();return;}
      if(d.calClockFeast!==undefined){clockSelection={type:"feast",date:d.calClockFeast};paint();return;}
      if(d.calClockOpenDay!==undefined){
        if(!/^\d{4}-\d{2}-\d{2}$/.test(d.calClockOpenDay))return;
        clockSelection=null;calendarView="day";void select(d.calClockOpenDay);return;
      }
      if(d.calClockBrowse!==undefined){
        if(!/^\d{4}-\d{2}$/.test(d.calClockBrowse))return;
        clockSelection=null;calendarView="picker";pickerMonthId=d.calClockBrowse;calendarMonthView="calendar";paint();requestPickerMonth();return;
      }
      if(d.calClockYear!==undefined){
        const step=Number(d.calClockYear);if(step!==1&&step!==-1)return;
        const year=buildLiturgicalYear(state()?.selectedDate||iso(new Date()));
        clockSelection=null;void select(step===1?addDaysIso(year.end,1):buildLiturgicalYear(addDaysIso(year.start,-1)).start);return;
      }
      if(d.calClockToday!==undefined){clockSelection=null;void select(iso(new Date()));return;}
    }
    const reading=event.target.closest?.("[data-cal-scripture-slot]");
    if(reading){event.preventDefault();void openCalendarScripture(reading);return;}
    const yearPeriod=event.target.closest?.("[data-cal-year-period]");
    if(yearPeriod){
      event.preventDefault();
      focusedYearPeriodId=yearPeriod.dataset.calYearPeriod||null;
      paint();
      try{root()?.querySelector('[data-cal-year-period="'+focusedYearPeriodId+'"]')?.focus?.({preventScroll:true})}catch{}
      return;
    }
    const yearDay=event.target.closest?.("[data-cal-year-open-day]");
    if(yearDay){
      event.preventDefault();calendarView="day";focusedYearPeriodId=null;
      root()?.scrollTo?.({top:0,left:0,behavior:"auto"});
      void select(yearDay.dataset.calYearOpenDay);return;
    }
    const yearMonth=event.target.closest?.("[data-cal-year-month]");
    if(yearMonth){
      event.preventDefault();
      const month=yearMonth.dataset.calYearMonth||"";
      if(!/^\d{4}-\d{2}$/.test(month))return;
      pickerMonthId=month;calendarMonthView="calendar";calendarView="picker";
      root()?.scrollTo?.({top:0,left:0,behavior:"auto"});paint();requestPickerMonth();return;
    }
    const nextRetry=event.target.closest?.("[data-cal-next-major-retry]");if(nextRetry){event.preventDefault();const id=state()?.selectedDate||iso(new Date());nextMajorResults.delete(id);for(const date of nextMajorCandidateDates(id)){if(weekCache.get(date)?.status==="failed")weekCache.delete(date)}paint();void loadNextResolvedMajor(id);return}
    const monthRetry=event.target.closest?.("[data-cal-month-retry]");if(monthRetry){event.preventDefault();monthRetry.disabled=true;void retryFailedMonth().catch(error=>console.error("Calendar month retry failed",error)).finally(()=>{if(root())paint()});return}
    const dayRetry=event.target.closest?.("[data-cal-day-retry]");if(dayRetry){event.preventDefault();dayRetry.disabled=true;const id=state()?.selectedDate||iso(new Date());void Promise.resolve(cache()?.retryDate?.(id)).catch(error=>console.error("Calendar day retry failed",error)).finally(()=>{if(root())paint()});return}
    const customsLibraryButton=event.target.closest?.("[data-cal-customs-open]");
    if(customsLibraryButton){
      event.preventDefault();
      if(customsLibraryButton.disabled)return;
      customsLibraryButton.disabled=true;
      void import("../customs/customs-browser.js")
        .then(({installCustomsBrowserOwner})=>installCustomsBrowserOwner(globalThis).open({view:"year"}))
        .catch(error=>console.error("Customs library unavailable",error))
        .finally(()=>{customsLibraryButton.disabled=false;});
      return;
    }
    const glossaryButton=event.target.closest?.("[data-cal-glossary]");if(glossaryButton){event.preventDefault();void openCalendarGlossary();return}
    const viewButton=event.target.closest?.("[data-cal-view]");if(viewButton){event.preventDefault();setView(viewButton.dataset.calView||"day");return}
    const exportButton=event.target.closest?.("[data-cal-export-ics]");
    if(exportButton){event.preventDefault();downloadMonthIcs(exportButton.dataset.calExportIcs||"");return}
    const monthViewButton=event.target.closest?.("[data-cal-month-view]");if(monthViewButton){event.preventDefault();setMonthView(monthViewButton.dataset.calMonthView||"calendar",{openMonth:true});return}
    const monthOpen=event.target.closest?.("[data-cal-open-month]");if(monthOpen){event.preventDefault();setMonthView(monthOpen.dataset.calOpenMonth||"calendar",{openMonth:true});return}
    const dayShift=event.target.closest?.("[data-cal-day-shift]");if(dayShift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(dayShift.dataset.calDayShift||0)));return}
    const monthShift=event.target.closest?.("[data-cal-month-shift]");if(monthShift){event.preventDefault();const base=pickerMonthId||String(state()?.selectedDate||iso(new Date())).slice(0,7),parts=base.split("-").map(Number),d=new Date(parts[0],parts[1]-1+Number(monthShift.dataset.calMonthShift||0),1,12);pickerMonthId=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");paint();requestPickerMonth();return}
    const pick=event.target.closest?.("[data-cal-pick-date]");if(pick){event.preventDefault();calendarView="day";void select(pick.dataset.calPickDate);return}
    const secondaryPlace=event.target.closest?.("[data-cal-secondary-place]");if(secondaryPlace){event.preventDefault();event.stopPropagation?.();void openSecondarySaintPlace(secondaryPlace);return}
    const saintDetail=event.target.closest?.("[data-cal-saint-date]");if(saintDetail){event.preventDefault();event.stopPropagation?.();void openSaintDetail(saintDetail.dataset.calSaintDate);return}
    const intelligenceRoute=event.target.closest?.("[data-cal-intelligence-route]");if(intelligenceRoute){event.preventDefault();const route=intelligenceRoute.dataset.calIntelligenceRoute||"";if(route==="mass.current"){void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("mass")).catch(error=>console.error("Calendar practice Mass route failed",error));return}if(route==="today.calendar"){calendarView="day";paint();return}if(route.startsWith("find:")){
      const [lens,key]=route.slice(5).split(":");
      const customId=lens==="traditions"&&/^[A-Z]{4}-[0-9]{3}$/.test(key||"")?key:null;
      if(lens==="traditions"&&!customId)return;
      void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("find")).then(result=>
        result?.ok===true?globalThis.AO_FIND_APP_V1?.open?.({
          lens:lens||"pilgrimages",view:customId?"list":"map",
          calendarKey:customId?null:key||null,customId,expandDetail:Boolean(customId),query:""
        }):false
      ).catch(error=>console.error("Calendar Explore route failed",error));return;
    }void Promise.resolve(globalThis.AO_MODULES?.open?.(route,{returnContext:{surface:"calendar",view:"day",date:state()?.selectedDate||null}})).catch(error=>console.error("Calendar practice route failed",error));return}
    const monthIndexDate=event.target.closest?.("[data-cal-month-index-date]");if(monthIndexDate){event.preventDefault();calendarView="day";void select(monthIndexDate.dataset.calMonthIndexDate);return}
    const printButton=event.target.closest?.("[data-cal-print-proper]");if(printButton){event.preventDefault();openPrintableProper();return}
    const mass=event.target.closest?.("[data-cal-mass]");if(mass){event.preventDefault();void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("mass")).catch(error=>console.error("Calendar Mass entry failed",error));return}
    const closeButton=event.target.closest?.("[data-cal-close]");if(closeButton){event.preventDefault();if(selectedScriptureReturn){returnToSelectedScripture();return;}close();return}
    const day=event.target.closest?.("[data-cal-date]");if(day){event.preventDefault();void select(day.dataset.calDate);return}
    const shift=event.target.closest?.("[data-cal-shift]");if(shift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(shift.dataset.calShift||0)));return}
    const today=event.target.closest?.("[data-cal-today]");if(today){event.preventDefault();calendarView="day";pickerMonthId=iso(new Date()).slice(0,7);void select(iso(new Date()));return}
    const go=event.target.closest?.("[data-cal-go]");if(go){event.preventDefault();const input=r.querySelector("[data-cal-input]"),err=r.querySelector("[data-cal-error]"),id=parseDisplayDate(input?.value);if(!id){if(err)err.textContent=L("Enter a valid date as DD/MM/YYYY.","Saisissez une date valide au format JJ/MM/AAAA.");return}calendarView="day";void select(id,{closeAfter:false}).then(ok=>{if(!ok&&err)err.textContent=L("This date could not be opened. Please try again.","Cette date n’a pas pu être ouverte. Veuillez réessayer.")});return}
  });
  r.addEventListener("keydown",event=>{const input=event.target.closest?.("[data-cal-input]");if(input&&event.key==="Enter"){event.preventDefault();const id=parseDisplayDate(input.value);if(id){calendarView="day";void select(id,{closeAfter:false})}}});
}
function open({embeddedIn=null,onClose=null}={}){
  selectedScriptureReturn=null;
  const doc=globalThis.document;if(!doc?.body||!runtime()?.store||!runtime()?.resolver)return false;
  calendarView=CALENDAR_VIEWS.has(requestedView)?requestedView:"day";focusedYearPeriodId=null;if(MONTH_INDEX_VIEWS.has(legacyMonthView(requestedMonthView)))calendarMonthView=legacyMonthView(requestedMonthView);else if(calendarView!=="picker")calendarMonthView="calendar";requestedView=null;requestedMonthView=null;
  if(calendarView==="picker")pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  installWeekCacheApi();seedCurrent();root()?.remove?.();
  const r=doc.createElement("section");r.id=ROOT_ID;r.dataset.aoAssetId=canonicalAssetIdForSurface("calendar")||"";r.setAttribute("role",embeddedIn?"region":"dialog");if(!embeddedIn)r.setAttribute("aria-modal","true");r.setAttribute("aria-label",L("Calendar","Calendrier"));if(embeddedIn)r.dataset.aoCalendarEmbedded="true";r.innerHTML=`<style>${css()}${calendarAuditCss()}.aoCalV2Hero .aoCalV2Commemorations{width:min(620px,100%);margin:18px auto 0;padding:13px 15px 11px;text-align:left;background:var(--ao-surface-1,rgba(16,24,33,.55));border:1px solid var(--ao-rule,rgba(226,214,190,.16));border-left:2px solid var(--ao-cal-liturgical,#b9a684);border-radius:8px}
.aoCalV2Hero .aoCalV2Commemorations h3{margin:3px 0 7px;font:400 19px/1.3 var(--ao-font-display,Georgia,serif)}
.aoCalV2Hero .aoCalV2Commemorations p{padding:8px 0;text-align:left;overflow-wrap:anywhere}
.aoCalV2Hero .aoCalV2Commemorations p:first-of-type{border-top:0}
.aoCalV2Hero .aoCalV2Commemorations span{font:400 14px/1.42 var(--ao-font-body,Georgia,serif)}
.aoCalV2Hero .aoCalDayScripture{margin:20px auto 0;padding:16px;width:min(650px,100%);max-width:none;text-align:left;border:1px solid var(--ao-rule,rgba(226,214,190,.18));border-radius:9px;background:var(--ao-surface-1,rgba(16,24,33,.65))}
.aoCalV2Hero .aoCalDayScriptureActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.aoCalV2Hero .aoCalDayScriptureActions button{min-width:0;min-height:62px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;text-align:left;border-radius:8px!important;white-space:normal;overflow-wrap:anywhere}
.aoCalV2Hero .aoCalDayScriptureActions button strong{font-size:13px}
.aoCalV2Hero .aoCalDayScriptureActions button span{font-size:12px;line-height:1.4}
.aoCalV2Documentation{max-width:650px;margin:19px auto 0;padding:12px 1px 0;border-top:1px solid var(--ao-rule,rgba(226,214,190,.12));text-align:left}
.aoCalV2Hero .aoCalV2Documentation .aoCalSourceLine{justify-content:flex-start;margin:0;font-size:10px;flex-wrap:wrap}
.aoCalV2Documentation .aoCalDaySources{margin:4px 0}
.aoCalV2PrintOptions{margin:4px 0}
.aoCalV2PrintOptions summary{min-height:44px;display:flex;align-items:center;cursor:pointer;color:var(--ao-text-muted,#a6a198);font:600 12px/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalV2PrintOptions[open]{padding-bottom:8px}
.aoCalV2PrintOptions:not([open]) [data-cal-print-proper],.aoCalV2PrintOptions:not([open]) [data-cal-print-feedback]{display:none!important}
.aoCalV2PrintOptions .aoCalV2TextLink{margin-top:0!important;text-align:left}
.aoCalV2PrintOptions summary:focus-visible{outline:2px solid var(--liturgical,#c7ae6d);outline-offset:2px}
@media(max-width:430px){.aoCalV2Hero .aoCalDayScriptureActions{grid-template-columns:1fr}.aoCalV2Hero .aoCalV2Commemorations{padding:12px}.aoCalV2Hero .aoCalDayScripture{padding:12px}}
${calendarScriptureStyles()}${SANCTORAL_DAY_CSS}</style><div class="aoCalModTop"><button type="button" data-cal-close aria-label="${L("Back to Home","Retour à l’accueil")}">${assetIcon("ao-ui-back")}</button><h1>${L("Calendar","Calendrier")}</h1><button type="button" data-cal-glossary aria-label="${L("Terms and definitions","Termes et définitions")}">?</button><p data-cal-glossary-error hidden role="status" class="aoCalGlossaryError"></p></div><main class="aoCalModBody" data-cal-body></main>`;if(embeddedIn){const holder=typeof embeddedIn==="string"?doc.querySelector(embeddedIn):embeddedIn;if(!holder?.isConnected)return false;embeddedReturn={onClose};holder.append(r)}else{embeddedReturn=null;doc.body.append(r)}bind(r);paint();try{unsub?.()}catch{}unsub=runtime().store.subscribe(()=>queueMicrotask(paint));if(!embeddedIn)r.querySelector("[data-cal-close]")?.focus?.();loadCalendarPilgrimagePlaces();loadCalendarSecondarySaints();loadCalendarRubricalClaims();loadCalendarColourClaims();loadCalendarTransferClaims();
  const selected=state()?.selectedDate||iso(new Date());if(calendarView==="picker")requestPickerMonth();
  // Embedding the Calendar in Today or Mass must be observational when the
  // selected 1962 day is already resolved. revealDate() dispatches
  // resolve-complete, causing the legacy Home owner to replace the host DOM,
  // which otherwise creates a Home -> Calendar -> Home render loop.
  const current=state();
  const alreadyResolved=Boolean(current?.selectedDate===selected&&!current.resolving
    &&current?.resolution?.date===selected&&current?.resolution?.day?.main);
  if(embeddedIn&&alreadyResolved){
    void prepareWeek(selected,{foreground:false}).then(()=>{
      if(root()&&state()?.selectedDate===selected)paint();
    }).catch(error=>console.warn("Embedded Calendar background week",error));
  }else void revealDate(selected,{forceLoader:!weekReady(selected),prefetch:true});
  return true;
}
function status(){const selected=state()?.selectedDate||iso(new Date());return Object.freeze({version:VERSION,installed:true,open:Boolean(root()),owner:root()?.dataset?.aoCalendarOwner??null,view:calendarView,monthView:calendarMonthView,dataServiceReady:typeof runtime()?.resolver?.resolveDay==="function",selectedDate:state()?.selectedDate??null,resolutionDate:state()?.resolution?.date??null,weekReady:weekReady(selected),weekCacheSize:weekCache.size,pickerMonthId,monthReady:pickerMonthId?monthReady(pickerMonthId):false,monthLoading:pickerMonthId?monthLoads.has(pickerMonthId):false,monthCachedDays:pickerMonthId?monthGridIds(pickerMonthId).filter(x=>weekCache.has(x)).length:0,donorPanelActive:globalThis.AO_NAV_V25?.getState?.()?.panel==="calendar"})}
export function installCalendarBrowserOwner(win=globalThis){if(win.AO_CALENDAR_APP_V1&&!win.AO_CALENDAR_APP_V1.__aoCalendarLazyPlaceholder)return win.AO_CALENDAR_APP_V1;const api=Object.freeze({version:VERSION,open,openSelectedScriptureReading,openEmbedded:(embeddedIn,{view="day",onClose=null}={})=>{if(!embeddedIn?.isConnected)return false;if(root()?.parentElement===embeddedIn){setView(view);return true}if(root())close({silent:true});requestedView=view;return open({embeddedIn,onClose})},close,paint,status,select,setView,setMonthView,prepareMonth,monthGridIds,monthReady,monthIndexEntries});win.AO_CALENDAR_APP_V1=api;return api}
if(typeof window!=="undefined"&&typeof document!=="undefined"){installWeekCacheApi();installCalendarBrowserOwner(window);}
