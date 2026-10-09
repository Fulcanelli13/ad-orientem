import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { formatDisplayDate, parseDisplayDate } from "../app/date-format.js";
import { addDaysIso, buildLiturgicalYear, buildMajorCelebrations } from "./liturgical-year.js";
import { calendarIntelligenceForDate, calendarPracticeMonthEntries } from "./intelligence.js";
import { pilgrimagePlacesForCalendarKeys } from "./pilgrimage-places.js";
import { renderYearJourney, yearJourneyCss } from "./year-journey.js";
import { calendarMassColour } from "./colour-projection.js";
import { serialize1962CalendarMonth, calendarMonthIcsFilename } from "./export-ics.js";
import { assessPrintableProper, renderPrintableProperHtml } from "./print-proper.js";
import { observedCycle } from "./observed-cycle.js";

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
const CALENDAR_VIEWS=new Set(["day","year","picker"]);
const MONTH_INDEX_VIEWS=new Set(["calendar","major","temporale","sanctorale","practices"]);
let calendarView="day",calendarMonthView="calendar",pickerMonthId="",requestedView=null,requestedMonthView=null,focusedYearPeriodId=null;
let pilgrimageCorpus=null,pilgrimageLoad=null;
const pilgrimageDataUrl=new URL("../../data/shrines/shrines-pilgrimages-seed.v1.json",import.meta.url).href;
function loadCalendarPilgrimagePlaces(){
  if(pilgrimageCorpus||pilgrimageLoad||typeof globalThis.fetch!=="function")return;
  pilgrimageLoad=globalThis.fetch(pilgrimageDataUrl,{headers:{accept:"application/json"}})
    .then(response=>response.ok?response.json():null)
    .then(json=>{if(json?.schema==="SHRINES_PILGRIMAGES_SEED_V1")pilgrimageCorpus=json;if(root())paint();})
    .catch(error=>{console.warn("Calendar pilgrimage associations unavailable",error)})
    .finally(()=>{pilgrimageLoad=null});
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
  const nextYear=addDaysIso(buildLiturgicalYear(selected).end,1);
  return [...new Set([...buildMajorCelebrations(selected),...buildMajorCelebrations(nextYear)]
    .filter(x=>x.date>selected).map(x=>x.date))].sort().slice(0,8);
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
      if(r?.status!=="failed"&&r?.day&&tier>0&&tier<=2){found={date,r};break}
    }
    nextMajorResults.set(selected,found||{unavailable:true});
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
  // A major-date index is an indicative list, not an ordo deciding rank or precedence.
  // Never manufacture a Roman class for an unresolved day.
  if(!r||r.status==="failed"||!r.day)return 0;
  const rank=rankOf(r).trim().toLowerCase();
  if(/\b(?:i|1st|first|1)\s*(?:class|classe)\b/.test(rank))return 1;
  if(/\b(?:ii|2nd|second|2)\s*(?:class|classe)\b/.test(rank))return 2;
  if(/\b(?:iii|3rd|third|3)\s*(?:class|classe)\b/.test(rank))return 3;
  if(/\b(?:iv|4th|fourth|4)\s*(?:class|classe)\b/.test(rank))return 4;
  return 0;
}
function monthCellData(id){
  const raw=weekCache.get(id),r=raw?.status!=="failed"&&raw?.day?raw:null,sunday=dateOf(id).getDay()===0,tier=rankTier(r,id);
  const name=r&&(tier>0&&tier<=2||sunday)?titleOf(r):"";
  const accent=r?liturgicalAccent(r):"#59626c";
  const rank=r?rankOf(r):"",colour=r?colourOf(r):"";
  const aria=[displayDate(id),name,r?null:L("Awaiting daily resolution","En attente de résolution du jour"),rank,colour].filter(Boolean).join(" · ");
  return {r,sunday,tier,name,projected:false,accent,rank,colour,aria,ready:!!r};
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
function monthIndexTabs(){
  const tabs=[
    ["calendar",L("Calendar","Calendrier")],
    ["major",L("Major","Jours majeurs")],
    ["temporale",L("Temporale","Temporal")],
    ["sanctorale",L("Sanctorale","Sanctoral")],
    ["practices",L("Practices","Pratiques")],
  ];
  return `<nav class="aoCalMonthTabs" aria-label="${esc(L("Month views","Vues du mois"))}">${tabs.map(([id,label])=>`<button type="button" data-cal-month-view="${id}" class="${calendarMonthView===id?"active":""}" ${calendarMonthView===id?'aria-current="page"':""}>${esc(label)}</button>`).join("")}</nav>`;
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
        :L("Date-bound traditional practices, programmes and sourced novena starts from the shared Calendar Intelligence registry.","Pratiques traditionnelles datées, programmes et débuts de neuvaines sourcées provenant du registre commun de Calendar Intelligence.");
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
  el.textContent=monthVerified(monthId)?L("1962 calendar · 42 day entries loaded","Calendrier 1962 · 42 jours chargés")
    :monthReady(monthId)?L(`1962 calendar · ${errors} day(s) unavailable`,`Calendrier 1962 · ${errors} jour(s) indisponible(s)`)
    :L(`Resolving liturgical month · ${s?.done??done}/42`,`Résolution du mois liturgique · ${s?.done??done}/42`);
}
function hydrateMonthCell(id){
  if(calendarView!=="picker"||!pickerMonthId)return;
  const cell=root()?.querySelector?.(`[data-cal-pick-date="${id}"]`);if(!cell)return;
  const data=monthCellData(id);
  cell.style.setProperty("--month-accent",data.accent);
  cell.dataset.ready=data.ready?"1":"0";
  cell.dataset.rankTier=String(data.tier);
  cell.classList.toggle("sunday",data.sunday);
  cell.classList.toggle("major",Boolean(data.name)&&data.ready);
  cell.classList.toggle("projected",data.projected);
  cell.setAttribute("aria-label",data.aria);
  const name=cell.querySelector?.(".aoCalMonthName");if(name)name.textContent=data.name;
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
function commemorations(r){
  const d=r?.day,raw=d?.main?.commemorations||d?.commemorations||r?.commemorations||[];
  return (Array.isArray(raw)?raw:[raw]).map(x=>typeof x==="string"?x:(fr()?(x?.nameFr||x?.titleFr||x?.name||x?.title):(x?.name||x?.title))).map(x=>String(x||"").trim()).filter(x=>x&&/[A-Za-zÀ-ÿ]/.test(x)&&!/^\d{1,2}[-_/]\d{2,4}$/.test(x));
}
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
function liturgicalAccent(r){
  const key=rawColour(r).trim().toLowerCase();
  return ({
    green:"#657a68",red:"#8f5650",white:"#d5ccb9",gold:"#b79a62",violet:"#725f7d",purple:"#725f7d",
    black:"#66666a",rose:"#9a6a76"
  })[key]||"#8f7d5e";
}
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
 return `<details class="aoCalDaySources"><summary>${esc(L("Sources & scope","Sources et portée"))}</summary>
  <p>${esc(L("General Roman Calendar (1962); local diocesan, religious and church propers may differ. Retrieved texts have not thereby been independently certified.","Calendrier romain général (1962) ; les propres diocésains, religieux et des églises peuvent différer. La récupération des textes ne constitue pas une certification indépendante."))}</p>
  <a href="https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597" target="_blank" rel="noopener noreferrer">${esc(L("Normative: 1960 Code of Rubrics · AAS 52 (1960), pp. 597 onward","Normatif : Code des rubriques de 1960 · AAS 52 (1960), p. 597 et suiv."))} ↗</a>
  <a href="https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html" target="_blank" rel="noopener noreferrer">${esc(L("Reference: English rubric translation","Référence : traduction anglaise des rubriques"))} ↗</a>
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

const periodUiColour=key=>({
  violet:"#6d5a7f",white:"#d8cfb9",green:"#587761",red:"#984b42",black:"#55565a",rose:"#9a6a76"
})[String(key||"").toLowerCase()]||"#81735c";
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
function practiceContext(selected,r){
  let intel=null;
  try{intel=calendarIntelligenceForDate(selected,{fr:fr(),properTitle:titleOf(r)})}catch(error){console.error("Calendar intelligence failed",error)}
  if(!intel)return "";
  const events=(intel.events||[]).filter(event=>event?.key!=="sunday-mass");
  const tags=new Set(events.flatMap(event=>event?.tags||[]));
  const linkedPlaces=pilgrimagePlacesForCalendarKeys(intel.semantic?.map(event=>event.key),pilgrimageCorpus??{});
  const disciplineRelevant=intel.discipline?.today?.key!=="none"||[...tags].some(tag=>/DISCIPLINE|PENITENTIAL/.test(tag));
  if(!events.length&&!disciplineRelevant)return "";
  return `<section class="aoCalPracticeContext" data-cal-intelligence-date="${esc(selected)}">
    <div class="aoCalV2SectionTitle"><div><small>${esc(L("PRACTICES & DISCIPLINE","PRATIQUES & DISCIPLINE"))}</small><h3>${esc(L("For this date","Pour cette date"))}</h3></div></div>
    <p class="aoCalPracticeIntro">${esc(L("Date-bound devotional context. Current obligations remain separate from historical discipline and voluntary custom.","Contexte dévotionnel lié à la date. Les obligations actuelles restent distinctes de la discipline historique et des coutumes volontaires."))}</p>
    ${events.length?`<div class="aoCalPracticeList">${events.map(event=>`<article class="aoCalPracticeCard" data-cal-intelligence-id="${esc(event.id)}">
      <small>${esc(intelligenceKind(event))}</small>
      <h4>${esc(event.title)}</h4>
      <p>${esc(event.summary||"")}</p>
      ${event.current||event.historical?`<details><summary>${esc(L("Current / traditional status","Statut actuel / traditionnel"))}</summary>${event.current?`<p><b>${esc(L("Current:","Actuel :"))}</b> ${esc(event.current)}</p>`:""}${event.historical?`<p><b>${esc(L("Traditional:","Traditionnel :"))}</b> ${esc(event.historical)}</p>`:""}</details>`:""}
      ${intelligenceActions(event).length?`<div class="aoCalPracticeActions">${intelligenceActions(event).map(([route,label])=>`<button type="button" data-cal-intelligence-route="${esc(route)}">${esc(label)} →</button>`).join("")}</div>`:""}
    </article>`).join("")}</div>`:""}
    ${linkedPlaces.length?`<section class="aoCalPilgrimagePlaces"><small>${esc(L("PILGRIMAGES & SACRED PLACES","PÈLERINAGES ET SANCTUAIRES"))}</small><p>${esc(L("Places associated with this feast or anniversary. Local celebrations and travel arrangements must be checked with the shrine.","Lieux associés à cette fête ou à cet anniversaire. Les célébrations locales et les renseignements pratiques restent à vérifier auprès du sanctuaire."))}</p>${linkedPlaces.map(place=>`<article><div><strong>${esc(place.shrine_name)}</strong>${place.saints.length?`<small>${esc(place.saints.join(" · "))}</small>`:""}</div><button type="button" data-cal-intelligence-route="${esc("find:pilgrimages:"+place.semantic_key)}">${esc(L("View pilgrimage","Voir le pèlerinage"))} →</button></article>`).join("")}</section>`:""}
    ${disciplineRelevant?disciplineReference(intel.discipline):""}
  </section>`;
}
function daySurface(selected,r){
  const y=buildLiturgicalYear(selected),p=y.currentPeriod,next=nextResolvedMajorCelebration(selected),cm=commemorations(r),saint=principalSaintContext(r,selected);
  const season=periodName(p),properReady=!!properOf(r),periodPercent=pct(y.periodProgress),printReady=assessPrintableProper(r,{language:fr()?"fr":"en"}).ok;
  return `
    ${dayNavigator(selected)}
    <section class="aoCalV2Hero" style="--ao-cal-liturgical:${esc(liturgicalAccent(r))}">
      <small class="aoCalV2Eyebrow">${esc(L("CALENDARIUM ROMANUM · 1962","CALENDARIUM ROMANUM · 1962"))}</small>
      <h2>${esc(titleOf(r))}</h2>
      <div class="aoCalIdentityMeta">${rankOf(r)?`<span>${esc(rankOf(r))}</span>`:""}${colourOf(r)?`<span>${esc(colourOf(r))}</span>`:""}${profileOf(r)?`<span>${esc(profileOf(r))}</span>`:""}</div>
      ${sourceStatus(r)}
      ${daySourceDetails(r)}
      ${properReady?`<button class="aoCalV2Primary" type="button" data-cal-mass>${esc(isGoodFridayLiturgy(r)?L("Open the Good Friday liturgy","Ouvrir la liturgie du Vendredi saint"):L("Open this Mass","Ouvrir cette messe"))} <span aria-hidden="true">→</span></button>`:""}
      ${printReady?`<button type="button" class="aoCalV2TextLink" data-cal-print-proper>${esc(L("Print bilingual Mass Propers","Imprimer les propres bilingues"))}</button><p data-cal-print-feedback role="status" aria-live="polite"></p>`:""}
    </section>
    ${saint?`<section class="aoCalV2Saint" style="--saint-accent:${esc(liturgicalAccent(r))}"><div><small>${esc(saint.label.toUpperCase())}</small><p>${esc(L("Biography, artwork and sources for the principal observance.","Biographie, œuvre et sources de la célébration principale."))}</p></div><button type="button" data-cal-saint-date="${selected}">${esc(L("Life & sources","Vie & sources"))} <span aria-hidden="true">→</span></button></section>`:""}
    <section class="aoCalV2Context">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("LITURGICAL TIME","TEMPS LITURGIQUE"))}</small><h3>${esc(season)}</h3></div><strong>${periodPercent}%</strong></div>
      <div class="aoCalV2SeasonMeta"><span>${esc(L(`Day ${y.periodDayIndex} of ${p.days}`,`Jour ${y.periodDayIndex} sur ${p.days}`))}</span><span>${esc(L(`Liturgical year ${y.label}`,`Année liturgique ${y.label}`))}</span></div>
      <div class="aoCalV2Progress"><i style="width:${periodPercent}%"></i></div>
      ${next?`<button class="aoCalV2NextMajor" type="button" data-cal-date="${next.date}"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><strong>${esc(celebrationName(next))}</strong><span>${esc(longDate(next.date))} · ${dayCount(selected,next.date)} ${esc(L("days","jours"))}</span></button>`:nextMajorStatusMarkup(selected,"day")}
      <button class="aoCalV2TextLink" type="button" data-cal-view="year">${esc(L("View the liturgical year","Voir l’année liturgique"))} →</button>
    </section>
    ${practiceContext(selected,r)}
    <section class="aoCalV2WeekSection">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("IN CONTEXT","EN CONTEXTE"))}</small><h3>${esc(L("This week","Cette semaine"))}</h3></div><button class="aoCalV2Today" type="button" data-cal-today>${esc(L("Today","Aujourd’hui"))}</button></div>
      ${compactWeek(selected)}
      <div class="aoCalV2WeekShift"><button data-cal-shift="-7">${assetIcon("ao-ui-previous")} ${esc(L("Previous week","Semaine précédente"))}</button><button data-cal-shift="7">${esc(L("Next week","Semaine suivante"))} ${assetIcon("ao-ui-next")}</button></div>
    </section>
    ${cm.length?`<section class="aoCalV2Commemorations"><small>${esc(L("ALSO OBSERVED","ÉGALEMENT"))}</small><h3>${esc(L("Commemorations","Commémorations"))}</h3>${cm.map(x=>`<p><i></i><span>${esc(x)}</span></p>`).join("")}</section>`:""}
  `;
}
function ringGradient(year){
  let cursor=0;
  return year.periods.map(p=>{
    const from=cursor/year.totalDays*360;cursor+=p.days;const to=cursor/year.totalDays*360;
    return `${periodUiColour(p.color)} ${from.toFixed(2)}deg ${to.toFixed(2)}deg`;
  }).join(",");
}
function yearSurface(selected,r){
  const y=buildLiturgicalYear(selected),p=y.currentPeriod,next=nextResolvedMajorCelebration(selected),yearPct=pct(y.progress),gradient=ringGradient(y);
  const nextSeason=y.nextPeriod||{en:"Advent",fr:"Avent",start:addDaysIso(y.end,1)};
  return `
    <section class="aoCalV2YearHero">
      <div class="aoCalV2YearHeading"><small>${esc(L("LITURGICAL YEAR","ANNÉE LITURGIQUE"))}</small><h2>${esc(y.label)}</h2></div>
      <div class="aoCalV2YearHeroGrid">
        <div class="aoCalV2Ring" style="--year-angle:${(y.progress*360).toFixed(2)}deg;--year-gradient:conic-gradient(from -90deg,${gradient})">
          <div class="aoCalV2RingMarker"></div>
          <div class="aoCalV2RingCore"><strong>${yearPct}%</strong><small>${esc(L("THROUGH SELECTED DAY","JUSQU’AU JOUR CONSULTÉ"))}</small><span>${esc(L(`day ${y.dayIndex} of ${y.totalDays}`,`jour ${y.dayIndex} sur ${y.totalDays}`))}</span></div>
        </div>
        <div class="aoCalV2YearIdentity">
          <small>${esc(L("SELECTED DAY","JOUR CONSULTÉ"))}</small>
          <h3>${esc(periodName(p))}</h3>
          <p class="aoCalV2SelectedFeast">${esc(r?.day?titleOf(r):L("Mass of the day awaiting resolution","Messe du jour en attente de résolution"))}</p>
          <dl><div><dt>${esc(L("Year","Année"))}</dt><dd>${esc(y.label)}</dd></div><div><dt>${esc(L("Current period","Période actuelle"))}</dt><dd>${esc(L(`Day ${y.periodDayIndex} of ${p.days}`,`Jour ${y.periodDayIndex} sur ${p.days}`))}</dd></div></dl>
          ${next?`<div class="aoCalV2MajorLine"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><button type="button" data-cal-year-open-day="${next.date}">${esc(celebrationName(next))} · ${esc(shortDate(next.date))}</button></div>`:nextMajorStatusMarkup(selected,"year")}
        </div>
      </div>
    </section>
    ${renderYearJourney({year:y,selectedDate:selected,focusedPeriodId:focusedYearPeriodId,fr:fr(),formatDate:displayDate})}
    <section class="aoCalV2Coming">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("WHAT NOW?","ET MAINTENANT ?"))}</small><h3>${esc(L("Coming next","Les prochains repères"))}</h3></div></div>
      <div class="aoCalV2ComingGrid">
        <button type="button" data-cal-year-open-day="${nextSeason.start}"><small>${esc(L("NEXT CHANGE OF SEASON","PROCHAIN CHANGEMENT DE TEMPS"))}</small><strong>${esc(periodName(nextSeason))}</strong><span>${esc(longDate(nextSeason.start))} · ${dayCount(selected,nextSeason.start)} ${esc(L("days","jours"))}</span></button>
        ${next?`<button type="button" data-cal-year-open-day="${next.date}"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><strong>${esc(celebrationName(next))}</strong><span>${esc(longDate(next.date))} · ${dayCount(selected,next.date)} ${esc(L("days","jours"))}</span></button>`:""}
      </div>
      <button class="aoCalV2TextLink" type="button" data-cal-open-month="major">${esc(L("Major days this month","Jours majeurs de ce mois"))} →</button>
    </section>
  `;
}
function pickerSurface(selected){
  if(!pickerMonthId)pickerMonthId=selected.slice(0,7);
  const [yy,mm]=pickerMonthId.split("-").map(Number),first=new Date(yy,mm-1,1,12),days=monthGridIds(pickerMonthId),today=iso(new Date()),loc=fr()?"fr-FR":"en-GB";
  const status=monthStatus.get(pickerMonthId),ready=monthVerified(pickerMonthId),attempted=monthReady(pickerMonthId),done=status?.done??days.filter(x=>weekCache.has(x)).length,errors=days.filter(x=>weekCache.has(x)&&(!weekCache.get(x)?.day||weekCache.get(x)?.status==="failed")).length,exportReady=Boolean(exportableMonthRows(pickerMonthId));
  const retryable=days.filter(id=>weekCache.has(id)&&(!weekCache.get(id)?.day||weekCache.get(id)?.status==="failed")).length;
  const calendarGrid=`<div class="aoCalV2Weekdays">${Array.from({length:7},(_,i)=>{const d=new Date(2026,7,2+i,12);return `<span>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</span>`}).join("")}</div>
    <div class="aoCalV2MonthGrid" data-month-ready="${ready?"true":"false"}">${days.map(id=>{
      const d=dateOf(id),outside=d.getMonth()!==mm-1,data=monthCellData(id);
      return `<button type="button" data-cal-pick-date="${id}" data-ready="${data.ready?"1":"0"}" data-rank-tier="${data.tier}" class="${outside?"outside":""} ${id===selected?"selected":""} ${id===today?"today":""} ${data.sunday?"sunday":""} ${data.projected?"projected":""} ${data.name&&data.ready?"major":""}" style="--month-accent:${esc(data.accent)}" aria-label="${esc(data.aria)}"><span class="aoCalMonthTop"><b>${d.getDate()}</b><i data-cal-liturgical-marker aria-hidden="true"></i></span><span class="aoCalMonthName">${esc(data.name)}</span></button>`;
    }).join("")}</div>`;
  const projection=calendarMonthView==="calendar"?calendarGrid:monthIndexList(pickerMonthId,selected,calendarMonthView);
  return `<section class="aoCalV2Picker">
    <div class="aoCalV2YearHeading"><small>${esc(L("LITURGICAL MONTH","MOIS LITURGIQUE"))}</small><h2>${esc(first.toLocaleDateString(loc,{month:"long",year:"numeric"}))}</h2><p>${esc(L("The month by calendar, major days, temporal cycle, sanctoral cycle or devotional practices.","Le mois par calendrier, jours majeurs, cycle temporal, cycle sanctoral ou pratiques dévotionnelles."))}</p></div>
    <div class="aoCalV2MonthNav"><button type="button" data-cal-month-shift="-1">${assetIcon("ao-ui-previous")} ${esc(L("Previous month","Mois précédent"))}</button><button type="button" data-cal-today>${esc(L("Today","Aujourd’hui"))}</button><button type="button" data-cal-month-shift="1">${esc(L("Next month","Mois suivant"))} ${assetIcon("ao-ui-next")}</button></div>
    ${monthIndexTabs()}
    <div class="aoCalV2MonthMeta"><span data-cal-month-status aria-live="polite">${esc(ready?L("1962 calendar · 42 day entries loaded","Calendrier 1962 · 42 jours chargés"):attempted?L(`1962 calendar · ${errors} day(s) unavailable`,`Calendrier 1962 · ${errors} jour(s) indisponible(s)`):L(`Resolving liturgical month · ${done}/42`,`Résolution du mois liturgique · ${done}/42`))}</span><span>${esc(calendarMonthView==="calendar"?L("Colour = liturgical colour · stronger mark = higher rank","Couleur = couleur liturgique · marque plus forte = classe plus élevée"):L("Only observances actually resolved for this month are shown.","Seules les célébrations effectivement résolues pour ce mois sont affichées."))}</span></div>
    ${retryable?`<button type="button" class="aoCalV2Retry" data-cal-month-retry>${esc(L(`Retry ${retryable} unavailable day(s)`,`Réessayer pour ${retryable} jour(s) indisponible(s)`))}</button>`:""}
    ${projection}
    <div class="aoCalV2MonthExport"><button type="button" class="aoCalV2TextLink" data-cal-export-ics="${esc(pickerMonthId)}" ${exportReady?"":'disabled aria-disabled="true"'} title="${esc(L("Download resolved general Roman calendar as an all-day .ics file; no Mass schedules or local feasts.","Télécharger le calendrier romain général résolu au format .ics, sans horaires de messe ni propres locaux."))}">${esc(L("Export this month · .ics","Exporter ce mois · .ics"))}</button><small>${esc(exportReady?L("Liturgical observances only · no Mass times","Célébrations uniquement · sans horaires de messe"):L("Available when every day is resolved","Disponible lorsque tous les jours sont résolus"))}</small><p data-cal-export-error role="status" aria-live="polite"></p></div>
    <div class="aoCalV2DirectJump"><label for="ao-cal-exact-date">${esc(L("Exact date","Date exacte"))}</label><div><input id="ao-cal-exact-date" data-cal-input inputmode="numeric" value="${esc(displayDate(selected))}" aria-label="${esc(L("Date in DD/MM/YYYY format","Date au format JJ/MM/AAAA"))}"><button type="button" data-cal-go>${esc(L("Go","Aller"))}</button></div><p data-cal-error aria-live="polite"></p></div>
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
 return `.aoCalDaySources{margin:12px 0 6px;color:#b4b2ae;font:400 14px/1.55 var(--ao-font-ui,system-ui,sans-serif)}.aoCalDaySources summary{display:flex;align-items:center;min-height:44px;cursor:pointer;color:#dfd5c6;text-decoration:underline;text-decoration-color:rgba(225,210,180,.35);text-underline-offset:3px}.aoCalDaySources[open]{padding:4px 0 12px}.aoCalDaySources p{margin:9px 0}.aoCalDaySources a{display:block;color:#d9d0bb;text-decoration:underline;min-height:44px;padding:8px 0;overflow-wrap:anywhere}.aoCalSourceWitness code{white-space:normal;overflow-wrap:anywhere}.aoCalV2Retry{margin:8px 0 14px}.aoCalDaySources summary:focus-visible,.aoCalDaySources a:focus-visible,[data-cal-month-retry]:focus-visible,[data-cal-day-retry]:focus-visible,[data-cal-next-major-retry]:focus-visible{outline:2px solid #decaa0;outline-offset:3px}`;
}
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
.aoCalV2Hero{text-align:center;padding:46px 12px 38px;position:relative}.aoCalV2Hero:after{content:"";position:absolute;left:20%;right:20%;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ao-cal-liturgical) 62%,transparent),transparent)}
.aoCalV2Eyebrow,.aoCalV2SectionTitle small,.aoCalV2Commemorations>small,.aoCalV2YearHeading small,.aoCalV2YearIdentity>small,.aoCalV2MajorLine small,.aoCalV2PeriodProgress small,.aoCalV2ComingGrid small{font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.14em;text-transform:uppercase;color:#8f948f}
.aoCalV2Hero h2{font-size:clamp(34px,5.5vw,58px);line-height:1.02;font-weight:400;letter-spacing:-.035em;margin:12px auto 14px;max-width:780px}.aoCalV2Hero .aoCalIdentityMeta{justify-content:center}.aoCalV2Hero .aoCalSourceLine{justify-content:center}
.aoCalV2Saint{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:17px 18px;margin:0 0 2px;border-top:1px solid rgba(235,225,208,.07);border-bottom:1px solid rgba(235,225,208,.09);background:linear-gradient(90deg,color-mix(in srgb,var(--saint-accent,#59626c) 5%,transparent),transparent)}.aoCalV2Saint small{color:#9d9487;font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em}.aoCalV2Saint p{margin:5px 0 0;color:#858c91;font:500 11px/1.35 var(--ao-font-ui,system-ui,sans-serif)}.aoCalV2Saint button{flex:0 0 auto;min-height:var(--ao-control-h,44px)!important;border:0!important;background:transparent!important;color:#d1c4ad!important;padding:0!important;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.08em;text-transform:uppercase}.aoCalV2Saint button span{margin-left:6px}
.aoCalV2Primary{margin-top:24px!important;min-height:48px!important;border-radius:var(--ao-control-radius,11px)!important;padding:0 22px!important;border:1px solid rgba(214,195,156,.4)!important;background:rgba(171,145,94,.1)!important;color:#eee5d5!important;font:600 11px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}.aoCalV2Primary span{margin-left:10px}
.aoCalV2Context,.aoCalV2WeekSection,.aoCalV2Commemorations,.aoCalV2Coming{padding:28px 0;border-bottom:1px solid rgba(235,225,208,.08)}
.aoCalV2SectionTitle{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.aoCalV2SectionTitle h3{margin:4px 0 0;font-size:25px;font-weight:400}.aoCalV2SectionTitle>strong{font:400 27px/1 Georgia,serif;color:#cabca4}
.aoCalV2SeasonMeta{display:flex;justify-content:space-between;gap:12px;color:#8d949a;font:500 11px/1.3 system-ui,sans-serif}.aoCalV2Progress,.aoCalV2PeriodProgress>span{display:block;height:4px;background:rgba(235,225,208,.08);margin:10px 0 18px;overflow:hidden}.aoCalV2Progress i,.aoCalV2PeriodProgress i{display:block;height:100%;background:#a79575}
.aoCalV2NextMajor{width:100%;display:grid!important;grid-template-columns:1fr auto!important;gap:4px 16px!important;text-align:left!important;border:1px solid rgba(235,225,208,.1)!important;border-radius:3px!important;background:#0c1219!important;padding:16px 18px!important}.aoCalV2NextMajor small{grid-column:1/-1;color:#8d949a;font:700 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}.aoCalV2NextMajor strong{font-size:18px;font-weight:400}.aoCalV2NextMajor span{align-self:center;color:#8d949a;font:500 var(--ao-type-ui-sm,12px)/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalV2TextLink{display:inline-flex!important;margin-top:16px!important;border:0!important;background:transparent!important;padding:6px 0!important;color:#c8bda9!important;font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase}
.aoCalV2Week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid rgba(235,225,208,.08);border-bottom:1px solid rgba(235,225,208,.08)}.aoCalV2Week button{min-width:0!important;min-height:112px!important;border:0!important;border-right:1px solid rgba(235,225,208,.06)!important;border-radius:0!important;background:transparent!important;padding:14px 7px!important;text-align:center!important;position:relative}.aoCalV2Week button:last-child{border-right:0!important}.aoCalV2Week button:after{content:"";position:absolute;left:25%;right:25%;bottom:-1px;height:2px;background:var(--day-accent);opacity:.42}.aoCalV2Week button.active{background:rgba(235,225,208,.035)!important}.aoCalV2Week button.active:after{left:12%;right:12%;height:3px;opacity:1}.aoCalV2Week small{display:block;color:#747d85;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase}.aoCalV2Week b{display:block;margin:8px 0 7px;font-size:23px;font-weight:400}.aoCalV2Week span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:1.15;color:#aaa49a}
.aoCalV2WeekShift,.aoCalV2MonthNav{display:flex;justify-content:space-between;gap:10px;margin-top:9px}.aoCalV2MonthNav{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center}.aoCalV2MonthNav button{min-width:0!important;padding-inline:0!important}.aoCalV2MonthNav button:first-child{justify-self:start;text-align:left}.aoCalV2MonthNav button:last-child{justify-self:end;text-align:right}.aoCalV2WeekShift button,.aoCalV2MonthNav button{font-size:11px!important}
.aoCalV2Today{font:650 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;text-transform:uppercase!important;letter-spacing:.08em!important}
.aoCalV2Commemorations h3{font-size:24px;font-weight:400;margin:4px 0 10px}.aoCalV2Commemorations p{display:grid;grid-template-columns:8px 1fr;gap:10px;align-items:center;margin:0;padding:10px 0;border-top:1px solid rgba(235,225,208,.06)}.aoCalV2Commemorations i{width:5px;height:5px;border-radius:50%;background:#a79575}.aoCalV2Commemorations span{font-size:13px}
.aoCalPilgrimagePlaces{margin-top:18px;padding:14px;border-top:1px solid rgba(218,195,146,.18);background:rgba(19,29,39,.35)}.aoCalPilgrimagePlaces>small{font:650 11px var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;color:#c7b386}.aoCalPilgrimagePlaces>p{font-size:12px;color:#b1a794;line-height:1.5}.aoCalPilgrimagePlaces article{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(218,195,146,.1);padding:12px 0}.aoCalPilgrimagePlaces article strong{font-size:13px;font-weight:500}.aoCalPilgrimagePlaces article small{display:block;color:#92989c;font-size:11px;margin-top:4px}.aoCalPilgrimagePlaces article button{font-size:11px;flex:none}.aoCalPracticeContext{padding:24px 0;border-bottom:1px solid rgba(235,225,208,.085)}.aoCalPracticeIntro{margin:-4px 0 14px;color:#8e969b;font-size:12px;line-height:1.45;max-width:650px}.aoCalPracticeList{display:grid;gap:8px}.aoCalPracticeCard{padding:15px 16px;border:1px solid rgba(235,225,208,.09);border-radius:var(--ao-card-radius,15px);background:#0b1118}.aoCalPracticeCard>small{display:block;color:#a79575;font:700 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;text-transform:uppercase}.aoCalPracticeCard h4{margin:7px 0 6px;font-size:19px;font-weight:400}.aoCalPracticeCard>p{margin:0;color:#9aa1a5;font-size:12px;line-height:1.45}.aoCalPracticeCard details,.aoCalPracticeDiscipline{margin-top:11px;border-top:1px solid rgba(235,225,208,.07);padding-top:10px}.aoCalPracticeCard summary,.aoCalPracticeDiscipline>summary{cursor:pointer;color:#b8ab94;font:700 var(--ao-type-ui-xs,11px)/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase}.aoCalPracticeCard details p{margin:7px 0 0;color:#8e969b;font-size:11px;line-height:1.45}.aoCalPracticeActions{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}.aoCalPracticeActions button{min-height:var(--ao-control-h,44px)!important;padding:6px 9px!important;border-radius:9px!important;background:transparent!important;color:#cbbda4!important;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.05em;text-transform:uppercase}.aoCalPracticeDisciplineIntro{margin:9px 0 12px;color:#8e969b;font-size:11px;line-height:1.45}.aoCalPracticeDiscipline>section{padding:11px 0;border-top:1px solid rgba(235,225,208,.06)}.aoCalPracticeDiscipline>section>small{color:#9e9588;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em}.aoCalPracticeDiscipline article{padding:9px 0}.aoCalPracticeDiscipline article+article{border-top:1px solid rgba(235,225,208,.05)}.aoCalPracticeDiscipline article>div{display:flex;justify-content:space-between;gap:12px}.aoCalPracticeDiscipline article strong{font-size:13px;font-weight:500}.aoCalPracticeDiscipline article span{color:#a79575;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.05em}.aoCalPracticeDiscipline article p{margin:5px 0 0;color:#8e969b;font-size:11px;line-height:1.45}.aoCalPracticeDiscipline article b{display:block;margin-top:6px;color:#c6b99f;font-size:11px;font-weight:600}.aoCalPracticeSources{display:flex;flex-wrap:wrap;gap:8px;margin-top:5px}.aoCalPracticeSources a{color:#9f927b;font:600 var(--ao-type-ui-xs,11px)/1.3 var(--ao-font-ui,system-ui,sans-serif);text-decoration:none}
.aoCalV2YearHero{padding:28px 0 34px;border-bottom:1px solid rgba(235,225,208,.09)}.aoCalV2YearHeading h2{font-size:38px;font-weight:400;margin:7px 0 0}.aoCalV2YearHeading p{color:#8c949a;margin:8px 0 0}
.aoCalV2YearHeroGrid{display:grid;grid-template-columns:300px 1fr;gap:44px;align-items:center;margin-top:24px;padding:28px;border:1px solid rgba(235,225,208,.1);border-radius:var(--ao-card-radius,15px);background:radial-gradient(circle at 18% 38%,rgba(184,158,108,.08),transparent 34%),#0a1016}
.aoCalV2Ring{width:260px;aspect-ratio:1;border-radius:50%;position:relative;display:grid;place-items:center;background:radial-gradient(circle at center,#0a1016 0 59%,transparent 60%),var(--year-gradient);box-shadow:inset 0 0 0 1px rgba(235,225,208,.08),0 22px 60px rgba(0,0,0,.26)}.aoCalV2Ring:after{content:"";position:absolute;inset:18px;border:1px solid rgba(235,225,208,.12);border-radius:50%}.aoCalV2RingCore{position:relative;z-index:2;width:145px;text-align:center}.aoCalV2RingCore strong{display:block;font-size:43px;font-weight:400;color:#e8decc}.aoCalV2RingCore small{display:block;margin-top:4px;color:#9c9488;font:700 var(--ao-type-ui-xs,11px)/1.15 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}.aoCalV2RingCore span{display:block;margin-top:8px;color:#9ba0a3;font-size:12px}.aoCalV2RingMarker{position:absolute;inset:0;transform:rotate(var(--year-angle));z-index:3}.aoCalV2RingMarker:before{content:"";position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:13px;height:13px;border-radius:50%;background:#efe2cb;border:3px solid #8f342b;box-shadow:0 0 0 2px #0a1016}
.aoCalV2YearIdentity h3{font-size:35px;font-weight:400;margin:7px 0 2px}.aoCalV2SelectedFeast{font-size:19px;color:#b7afa3;margin:0 0 20px}.aoCalV2YearIdentity dl{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin:0}.aoCalV2YearIdentity dl div{border-top:1px solid rgba(235,225,208,.1);padding:10px 0}.aoCalV2YearIdentity dt{color:#7f878d;font:700 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase}.aoCalV2YearIdentity dd{margin:5px 0 0;font-size:15px}.aoCalV2MajorLine{border-top:1px solid rgba(235,225,208,.1);padding:11px 0}.aoCalV2MajorLine button{display:block!important;border:0!important;background:transparent!important;padding:5px 0!important;color:#e7dfd2!important;font-size:15px!important;text-align:left!important}.aoCalV2PeriodProgress{margin-top:7px}.aoCalV2PeriodProgress>div{display:flex;justify-content:space-between;align-items:end}.aoCalV2PeriodProgress strong{font-size:18px;font-weight:400;color:#c5b79d}.aoCalV2PeriodProgress>span{margin:8px 0 0}


.aoCalV2ComingGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aoCalV2ComingGrid button{min-height:116px!important;border-radius:2px!important;background:#0b1118!important;text-align:left!important;padding:17px!important;border-radius:var(--ao-card-radius,15px)!important}.aoCalV2ComingGrid strong{display:block;font-size:20px;font-weight:400;margin:9px 0 6px}.aoCalV2ComingGrid span{color:#8f969a;font:500 var(--ao-type-ui-sm,12px)/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalV2Picker{padding:28px 0}.aoCalV2MonthNav{align-items:center;margin:18px 0 10px}.aoCalV2MonthMeta{display:flex;justify-content:space-between;gap:12px;margin:0 0 13px;color:#747d84;font:600 var(--ao-type-ui-xs,11px)/1.35 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.035em}.aoCalV2MonthMeta span:last-child{text-align:right}.aoCalV2Weekdays,.aoCalV2MonthGrid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));width:100%;min-width:0}.aoCalV2Weekdays{border-bottom:1px solid rgba(235,225,208,.09)}.aoCalV2Weekdays span{text-align:center;padding:9px 4px;color:#747d84;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase}.aoCalV2MonthGrid{border-left:1px solid rgba(235,225,208,.06);border-top:1px solid rgba(235,225,208,.06)}.aoCalV2MonthGrid button{aspect-ratio:auto;min-width:0!important;padding:7px 5px 5px!important;height:78px!important;min-height:0!important;border-radius:0!important;border-width:0 1px 1px 0!important;border-color:rgba(235,225,208,.06)!important;background:color-mix(in srgb,var(--month-accent,#59626c) 3%,#0b1118)!important;position:relative;text-align:left!important;overflow:hidden}.aoCalV2MonthGrid button[data-ready="0"]{--month-accent:#59626c}.aoCalV2MonthGrid button.outside{opacity:.26}.aoCalV2MonthGrid button.sunday:not(.outside){background:color-mix(in srgb,var(--month-accent,#59626c) 7%,#0b1118)!important}.aoCalV2MonthGrid button.selected{z-index:1;box-shadow:inset 0 0 0 2px #d3c5a7}.aoCalV2MonthGrid button.today .aoCalMonthTop b{outline:1px solid rgba(181,93,80,.9);outline-offset:2px;border-radius:50%}.aoCalMonthTop{display:flex;align-items:center;justify-content:space-between;gap:4px}.aoCalV2MonthGrid b{font-size:16px;font-weight:400;line-height:1}.aoCalMonthTop i{display:block;width:6px;height:2px;border-radius:999px;background:var(--month-accent,#59626c);opacity:.62}.aoCalV2MonthGrid button[data-rank-tier="1"] .aoCalMonthTop i{width:16px;height:3px;opacity:1}.aoCalV2MonthGrid button[data-rank-tier="2"] .aoCalMonthTop i{width:12px;height:3px;opacity:.9}.aoCalV2MonthGrid button[data-rank-tier="3"] .aoCalMonthTop i{width:9px;height:2px;opacity:.76}.aoCalMonthName{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:8px;color:#a9a397;font:500 var(--ao-type-ui-xs,11px)/1.08 var(--ao-font-ui,system-ui,sans-serif);overflow-wrap:anywhere}.aoCalV2MonthGrid button.major .aoCalMonthName,.aoCalV2MonthGrid button.sunday .aoCalMonthName{color:#d3cab9}.aoCalMonthName:empty{display:none}.aoCalV2DirectJump{margin-top:22px;padding-top:18px;border-top:1px solid rgba(235,225,208,.08)}.aoCalV2DirectJump label{color:#8c949a;font:700 var(--ao-type-ui-xs,11px)/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase}.aoCalV2DirectJump>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:8px}.aoCalV2DirectJump input{min-width:0;min-height:var(--ao-control-h,44px);border:1px solid rgba(235,225,208,.13);border-radius:var(--ao-control-radius,11px);background:#0b1118;color:#e7dfd2;padding:8px 11px}.aoCalV2DirectJump p{min-height:18px;color:#d2aa7b;font-size:11px}
@media(max-width:700px){.aoCalModBody{padding:0 var(--ao-page-gutter-phone,12px) 46px}.aoCalV2Tabs{top:calc(61px + var(--safe-top,0px));margin:0 calc(-1 * var(--ao-page-gutter-phone,12px));padding:0 6px}.aoCalV2Tabs button{font-size:var(--ao-type-ui-xs,11px);letter-spacing:.025em}.aoCalMonthTabs{margin-left:0;margin-right:0}.aoCalMonthTabs button{font-size:var(--ao-type-ui-xs,11px)!important;padding-inline:8px!important}.aoCalV2Hero{padding:34px 4px 30px}.aoCalV2Hero h2{font-size:35px}.aoCalV2Saint{align-items:flex-start;padding:14px 12px}.aoCalV2Saint p{font-size:var(--ao-type-ui-xs,11px)}.aoCalV2Saint button{min-height:var(--ao-control-h,44px)!important}.aoCalV2NextMajor{grid-template-columns:1fr!important}.aoCalV2Week{overflow-x:auto;grid-template-columns:repeat(7,92px);margin-right:-12px}.aoCalV2Week button{min-height:104px!important}.aoCalV2YearHeroGrid{grid-template-columns:1fr;gap:26px;padding:22px 16px}.aoCalV2Ring{width:min(250px,76vw);margin:auto}.aoCalV2YearIdentity{text-align:left}.aoCalV2YearIdentity h3{font-size:31px}.aoCalV2YearIdentity dl{grid-template-columns:1fr 1fr}.aoCalV2ComingGrid{grid-template-columns:1fr}.aoCalMonthIndexHead{display:grid;gap:5px}.aoCalMonthIndexHead p{text-align:left}.aoCalMonthIndexList .aoCalMonthIndexDay{grid-template-columns:74px minmax(0,1fr) 12px!important;padding:10px 11px!important}.aoCalV2MonthGrid button{height:66px!important;min-height:0!important;padding:6px 4px 4px!important}.aoCalMonthName{font-size:var(--ao-type-ui-xs,11px);margin-top:6px}.aoCalV2MonthMeta{display:grid;gap:3px}.aoCalV2MonthMeta span:last-child{text-align:left;font-weight:500}.aoCalV2SeasonMeta{display:grid;gap:3px}.aoCalV2SectionTitle h3{font-size:22px}}
/* Body-copy readability floor; do not enlarge dates, hierarchy captions or rubrical labels. */
.aoCalV2Saint p,.aoCalMonthIndexHead p,.aoCalV2ComingGrid span,.aoCalV2Commemorations span,.aoCalPilgrimagePlaces>p,.aoCalPracticeIntro,.aoCalV2RingCore span{font-size:max(14px,.875rem);line-height:1.5}
${yearJourneyCss}
`;
}
let unsub=null;
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
function paint(){const r=root();if(!r)return false;const body=r.querySelector("[data-cal-body]");if(!body)return false;const active=globalThis.document?.activeElement,existing=body.querySelector("[data-cal-input]"),editing=active===existing,value=editing?existing.value:null,start=editing?existing.selectionStart:null,end=editing?existing.selectionEnd:null;body.innerHTML=bodyMarkup();if(editing){const input=body.querySelector("[data-cal-input]");if(input){input.value=value;input.focus({preventScroll:true});if(start!==null&&end!==null)input.setSelectionRange(start,end)}}r.dataset.aoCalendarOwner=VERSION;r.dataset.aoCalendarView=calendarView;requestAnimationFrame(()=>centerSelectedDay(r));return true}
function syncShell(surface){globalThis.AO_APP_SHELL_V1?.syncSurface?.(surface)}
function close({surface="home"}={}){cancelPendingNavigation();root()?.remove?.();try{unsub?.()}catch{}unsub=null;syncShell(surface);try{globalThis.AO_GLOBAL_RIBBON_V4323?.setActive?.(surface)}catch{}return true}
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
  const next=String(view||"").toLowerCase();
  if(!MONTH_INDEX_VIEWS.has(next))return false;
  calendarMonthView=next;
  if(openMonth&&calendarView!=="picker")pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  if(openMonth)calendarView="picker";
  if(!root()){requestedView=openMonth?"picker":requestedView;requestedMonthView=next;return true}
  if(calendarView==="picker"&&!pickerMonthId)pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  root()?.scrollTo?.({top:0,left:0,behavior:"auto"});
  paint();
  if(calendarView==="picker")requestPickerMonth();
  return true;
}
function setView(view){
  let next=String(view||"").toLowerCase();
  if(next==="index"){calendarMonthView="major";requestedMonthView="major";next="picker"}
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
  r.addEventListener("click",event=>{
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
    const glossaryButton=event.target.closest?.("[data-cal-glossary]");if(glossaryButton){event.preventDefault();void openCalendarGlossary();return}
    const viewButton=event.target.closest?.("[data-cal-view]");if(viewButton){event.preventDefault();setView(viewButton.dataset.calView||"day");return}
    const exportButton=event.target.closest?.("[data-cal-export-ics]");
    if(exportButton){event.preventDefault();downloadMonthIcs(exportButton.dataset.calExportIcs||"");return}
    const monthViewButton=event.target.closest?.("[data-cal-month-view]");if(monthViewButton){event.preventDefault();setMonthView(monthViewButton.dataset.calMonthView||"calendar",{openMonth:true});return}
    const monthOpen=event.target.closest?.("[data-cal-open-month]");if(monthOpen){event.preventDefault();setMonthView(monthOpen.dataset.calOpenMonth||"calendar",{openMonth:true});return}
    const dayShift=event.target.closest?.("[data-cal-day-shift]");if(dayShift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(dayShift.dataset.calDayShift||0)));return}
    const monthShift=event.target.closest?.("[data-cal-month-shift]");if(monthShift){event.preventDefault();const base=pickerMonthId||String(state()?.selectedDate||iso(new Date())).slice(0,7),parts=base.split("-").map(Number),d=new Date(parts[0],parts[1]-1+Number(monthShift.dataset.calMonthShift||0),1,12);pickerMonthId=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");paint();requestPickerMonth();return}
    const pick=event.target.closest?.("[data-cal-pick-date]");if(pick){event.preventDefault();calendarView="day";void select(pick.dataset.calPickDate);return}
    const saintDetail=event.target.closest?.("[data-cal-saint-date]");if(saintDetail){event.preventDefault();event.stopPropagation?.();void openSaintDetail(saintDetail.dataset.calSaintDate);return}
    const intelligenceRoute=event.target.closest?.("[data-cal-intelligence-route]");if(intelligenceRoute){event.preventDefault();const route=intelligenceRoute.dataset.calIntelligenceRoute||"";if(route==="mass.current"){void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("mass")).catch(error=>console.error("Calendar practice Mass route failed",error));return}if(route==="today.calendar"){calendarView="day";paint();return}if(route.startsWith("find:")){const [lens,calendarKey]=route.slice(5).split(":");void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("find")).then(result=>result?.ok===true?globalThis.AO_FIND_APP_V1?.open?.({lens:lens||"pilgrimages",view:"map",calendarKey:calendarKey||null,query:""}):false).catch(error=>console.error("Calendar Explore route failed",error));return}void Promise.resolve(globalThis.AO_MODULES?.open?.(route,{returnContext:{surface:"calendar",view:"day",date:state()?.selectedDate||null}})).catch(error=>console.error("Calendar practice route failed",error));return}
    const monthIndexDate=event.target.closest?.("[data-cal-month-index-date]");if(monthIndexDate){event.preventDefault();calendarView="day";void select(monthIndexDate.dataset.calMonthIndexDate);return}
    const printButton=event.target.closest?.("[data-cal-print-proper]");if(printButton){event.preventDefault();openPrintableProper();return}
    const mass=event.target.closest?.("[data-cal-mass]");if(mass){event.preventDefault();void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("mass")).catch(error=>console.error("Calendar Mass entry failed",error));return}
    const closeButton=event.target.closest?.("[data-cal-close]");if(closeButton){event.preventDefault();close();return}
    const day=event.target.closest?.("[data-cal-date]");if(day){event.preventDefault();void select(day.dataset.calDate);return}
    const shift=event.target.closest?.("[data-cal-shift]");if(shift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(shift.dataset.calShift||0)));return}
    const today=event.target.closest?.("[data-cal-today]");if(today){event.preventDefault();calendarView="day";pickerMonthId=iso(new Date()).slice(0,7);void select(iso(new Date()));return}
    const go=event.target.closest?.("[data-cal-go]");if(go){event.preventDefault();const input=r.querySelector("[data-cal-input]"),err=r.querySelector("[data-cal-error]"),id=parseDisplayDate(input?.value);if(!id){if(err)err.textContent=L("Enter a valid date as DD/MM/YYYY.","Saisissez une date valide au format JJ/MM/AAAA.");return}calendarView="day";void select(id,{closeAfter:false}).then(ok=>{if(!ok&&err)err.textContent=L("This date could not be opened. Please try again.","Cette date n’a pas pu être ouverte. Veuillez réessayer.")});return}
  });
  r.addEventListener("keydown",event=>{const input=event.target.closest?.("[data-cal-input]");if(input&&event.key==="Enter"){event.preventDefault();const id=parseDisplayDate(input.value);if(id){calendarView="day";void select(id,{closeAfter:false})}}});
}
function open(){
  const doc=globalThis.document;if(!doc?.body||!runtime()?.store||!runtime()?.resolver)return false;
  calendarView=CALENDAR_VIEWS.has(requestedView)?requestedView:"day";focusedYearPeriodId=null;if(MONTH_INDEX_VIEWS.has(requestedMonthView))calendarMonthView=requestedMonthView;else if(calendarView!=="picker")calendarMonthView="calendar";requestedView=null;requestedMonthView=null;
  if(calendarView==="picker")pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  installWeekCacheApi();seedCurrent();root()?.remove?.();
  const r=doc.createElement("section");r.id=ROOT_ID;r.dataset.aoAssetId=canonicalAssetIdForSurface("calendar")||"";r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");r.setAttribute("aria-label",L("Calendar","Calendrier"));r.innerHTML=`<style>${css()}${calendarAuditCss()}</style><div class="aoCalModTop"><button type="button" data-cal-close aria-label="${L("Back to Home","Retour à l’accueil")}">${assetIcon("ao-ui-back")}</button><h1>${L("Calendar","Calendrier")}</h1><button type="button" data-cal-glossary aria-label="${L("Terms and definitions","Termes et définitions")}">?</button><p data-cal-glossary-error hidden role="status" class="aoCalGlossaryError"></p></div><main class="aoCalModBody" data-cal-body></main>`;doc.body.append(r);bind(r);paint();try{unsub?.()}catch{}unsub=runtime().store.subscribe(()=>queueMicrotask(paint));r.querySelector("[data-cal-close]")?.focus?.();loadCalendarPilgrimagePlaces();
  const selected=state()?.selectedDate||iso(new Date());if(calendarView==="picker")requestPickerMonth();void revealDate(selected,{forceLoader:!weekReady(selected),prefetch:true});return true;
}
function status(){const selected=state()?.selectedDate||iso(new Date());return Object.freeze({version:VERSION,installed:true,open:Boolean(root()),owner:root()?.dataset?.aoCalendarOwner??null,view:calendarView,monthView:calendarMonthView,dataServiceReady:typeof runtime()?.resolver?.resolveDay==="function",selectedDate:state()?.selectedDate??null,resolutionDate:state()?.resolution?.date??null,weekReady:weekReady(selected),weekCacheSize:weekCache.size,pickerMonthId,monthReady:pickerMonthId?monthReady(pickerMonthId):false,monthLoading:pickerMonthId?monthLoads.has(pickerMonthId):false,monthCachedDays:pickerMonthId?monthGridIds(pickerMonthId).filter(x=>weekCache.has(x)).length:0,donorPanelActive:globalThis.AO_NAV_V25?.getState?.()?.panel==="calendar"})}
export function installCalendarBrowserOwner(win=globalThis){if(win.AO_CALENDAR_APP_V1&&!win.AO_CALENDAR_APP_V1.__aoCalendarLazyPlaceholder)return win.AO_CALENDAR_APP_V1;const api=Object.freeze({version:VERSION,open,close,paint,status,select,setView,setMonthView,prepareMonth,monthGridIds,monthReady,monthIndexEntries});win.AO_CALENDAR_APP_V1=api;return api}
if(typeof window!=="undefined"&&typeof document!=="undefined"){installWeekCacheApi();installCalendarBrowserOwner(window);}
