import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { formatDisplayDate, parseDisplayDate } from "../app/date-format.js";
import { addDaysIso, buildLiturgicalYear, buildMajorCelebrations, nextMajorCelebration } from "./liturgical-year.js";
import { V384_CSS, v384YearHTML, v384DisciplineHTML } from "./traditional-year-v384.js";

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

const weekCache=new Map(),dayLoads=new Map(),weekLoads=new Map(),weekStatus=new Map(),monthLoads=new Map(),monthStatus=new Map(),majorCelebrationCache=new Map();
let foregroundWeek="",navEpoch=0,monthEpoch=0;
const CALENDAR_VIEWS=new Set(["day","year","picker"]);
const MONTH_INDEX_VIEWS=new Set(["calendar","major","temporale","sanctorale"]);
let calendarView="day",calendarMonthView="calendar",pickerMonthId="",requestedView=null,requestedMonthView=null;
let calendarV384Panel="year",calendarV384Era="current";
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
function majorIndexFor(id){
  const key=buildLiturgicalYear(id).label;
  if(!majorCelebrationCache.has(key))majorCelebrationCache.set(key,new Map(buildMajorCelebrations(id).map(x=>[x.date,x])));
  return majorCelebrationCache.get(key);
}
function majorForDate(id){return majorIndexFor(id)?.get(id)||null}
function rankTier(r,id){
  const rank=rankOf(r).trim().toLowerCase();
  if(/\b(?:i|1st|first|1)\s*(?:class|classe)\b/.test(rank))return 1;
  if(/\b(?:ii|2nd|second|2)\s*(?:class|classe)\b/.test(rank))return 2;
  if(majorForDate(id))return 2;
  if(dateOf(id).getDay()===0)return 3;
  if(/\b(?:iii|3rd|third|3)\s*(?:class|classe)\b/.test(rank))return 3;
  return 4;
}
function monthCellData(id){
  const raw=weekCache.get(id),r=raw?.status!=="failed"&&raw?.day?raw:null,major=majorForDate(id),sunday=dateOf(id).getDay()===0,tier=rankTier(r,id);
  const name=major?celebrationName(major):(r&&(tier<=2||sunday)?titleOf(r):(sunday?L("Sunday","Dimanche"):""));
  const accent=r?liturgicalAccent(r):periodUiColour(buildLiturgicalYear(id).currentPeriod.color);
  const rank=r?rankOf(r):"",colour=r?colourOf(r):"";
  const aria=[displayDate(id),name,rank,colour].filter(Boolean).join(" · ");
  return {r,major,sunday,tier,name,accent,rank,colour,aria,ready:weekCache.has(id)};
}

function monthDateIds(monthId){
  return monthGridIds(monthId).filter(id=>id.slice(0,7)===String(monthId||""));
}
function sourceHints(r){
  const p=properOf(r),d=r?.day?.main??{};
  return [
    p?.calendarKind,p?.calendarType,p?.category,p?.kind,p?.type,p?.source,p?.sourceType,p?.file,p?.path,
    d?.calendarKind,d?.calendarType,d?.category,d?.kind,d?.type,d?.source,d?.sourceType,d?.file,d?.path,
  ].map(x=>String(x??"").toLowerCase()).filter(Boolean).join(" ");
}
function observedCycle(r,id){
  if(!r||r.status==="failed"||!r.day)return "unknown";
  const major=majorForDate(id);
  if(major?.kind==="sanctorale")return "sanctorale";
  if(major?.kind==="temporale"||major?.kind==="sunday")return "temporale";
  const hints=sourceHints(r);
  if(/\b(?:sanct|sanctor|fixed[-_ ]?feast|saint)\b/.test(hints))return "sanctorale";
  if(/\b(?:temp|tempor|season|feria|sunday)\b/.test(hints))return "temporale";
  if(dateOf(id).getDay()===0)return "temporale";
  const title=String(titleOf(r)||"").toLowerCase();
  const temporal=/\b(?:feria|sunday|dimanche|f[eé]rie|ember|quatre[- ]temps|rogation|ash wednesday|mercredi des cendres|septuagesima|septuag[eé]sime|sexagesima|sexag[eé]sime|quinquagesima|quinquag[eé]sime|lent|car[eê]me|passion sunday|dimanche de la passion|palm sunday|rameaux|holy monday|lundi saint|holy tuesday|mardi saint|holy wednesday|mercredi saint|holy thursday|jeudi saint|good friday|vendredi saint|holy saturday|samedi saint|easter|p[aâ]ques|ascension|pentecost|pentec[oô]te|trinity|trinit[eé]|corpus christi|f[eê]te[- ]dieu|sacred heart|sacr[eé][ -]c[oœ]ur|christ the king|christ[- ]roi|advent|avent|nativity of our lord|nativit[eé] de notre[- ]seigneur|epiphany of our lord|[eé]piphanie de notre[- ]seigneur|circumcision of our lord|circoncision de notre[- ]seigneur)\b/;
  if(temporal.test(title))return "temporale";
  const generic=/^(?:liturgical day|jour liturgique|calendar unavailable|calendrier indisponible)$/;
  return generic.test(title.trim())?"unknown":"sanctorale";
}
function monthEntry(id){
  const raw=weekCache.get(id),r=raw?.status!=="failed"&&raw?.day?raw:null;
  if(!r)return null;
  const title=titleOf(r),rank=rankOf(r),colour=colourOf(r),cycle=observedCycle(r,id),tier=rankTier(r,id),major=majorForDate(id),sunday=dateOf(id).getDay()===0;
  return {date:id,r,title,rank,colour,cycle,tier,major,sunday,commemorations:commemorations(r),accent:liturgicalAccent(r)};
}
function monthIndexEntries(monthId,view){
  const entries=monthDateIds(monthId).map(monthEntry).filter(Boolean);
  if(view==="major")return entries.filter(x=>x.sunday||x.tier<=2||Boolean(x.major));
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
  ];
  return `<nav class="aoCalMonthTabs" aria-label="${esc(L("Month views","Vues du mois"))}">${tabs.map(([id,label])=>`<button type="button" data-cal-month-view="${id}" class="${calendarMonthView===id?"active":""}" ${calendarMonthView===id?'aria-current="page"':""}>${esc(label)}</button>`).join("")}</nav>`;
}
function monthIndexList(monthId,selected,view){
  const rows=monthIndexEntries(monthId,view);
  const label=view==="major"?L("Major days","Jours majeurs"):view==="temporale"?L("Temporale","Temporal"):L("Sanctorale","Sanctoral");
  const explanation=view==="major"
    ?L("Sundays, I–II class observances and other principal days in this month.","Dimanches, célébrations de I–II classe et autres jours principaux de ce mois.")
    :view==="temporale"
      ?L("Observed days belonging to the temporal cycle and movable season.","Jours observés appartenant au cycle temporal et aux temps mobiles.")
      :L("Observed saints and fixed-cycle celebrations for this month.","Saints et célébrations du cycle fixe effectivement observés ce mois.");
  return `<section class="aoCalMonthIndex" data-cal-month-index="${view}">
    <div class="aoCalMonthIndexHead"><small>${esc(label.toUpperCase())}</small><p>${esc(explanation)}</p></div>
    ${rows.length?`<div class="aoCalMonthIndexList">${rows.map(x=>`<button type="button" data-cal-month-index-date="${x.date}" class="${x.date===selected?"selected":""}" style="--month-accent:${esc(x.accent)}">
      <time>${esc(displayDate(x.date))}</time>
      <span class="aoCalMonthIndexText"><strong>${esc(x.title)}</strong><small>${esc([x.rank,x.colour].filter(Boolean).join(" · "))}</small></span>
      <i aria-hidden="true"></i>
    </button>`).join("")}</div>`:`<div class="aoCalMonthEmpty">${esc(L("No resolved observances in this category for the month.","Aucune célébration résolue dans cette catégorie pour ce mois."))}</div>`}
  </section>`;
}
function updateMonthStatusDom(monthId){
  if(calendarView!=="picker"||pickerMonthId!==monthId)return;
  const el=root()?.querySelector?.("[data-cal-month-status]");if(!el)return;
  const ids=monthGridIds(monthId),s=monthStatus.get(monthId),done=ids.filter(x=>weekCache.has(x)).length;
  el.textContent=monthReady(monthId)?L("1962 calendar · liturgical month ready","Calendrier 1962 · mois liturgique prêt"):L(`Resolving liturgical month · ${s?.done??done}/42`,`Résolution du mois liturgique · ${s?.done??done}/42`);
}
function hydrateMonthCell(id){
  if(calendarView!=="picker"||!pickerMonthId)return;
  const cell=root()?.querySelector?.(`[data-cal-pick-date="${id}"]`);if(!cell)return;
  const data=monthCellData(id);
  cell.style.setProperty("--month-accent",data.accent);
  cell.dataset.ready=data.ready?"1":"0";
  cell.dataset.rankTier=String(data.tier);
  cell.classList.toggle("sunday",data.sunday);
  cell.classList.toggle("major",Boolean(data.name));
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
  void Promise.all([prepareWeek(prev,{foreground:false,concurrency:2}),prepareWeek(next,{foreground:false,concurrency:2})]);
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
function rawColour(r){const p=properOf(r),d=r?.day?.main;return String(p?.color||p?.colour||d?.color||d?.colour||r?.colourPlan?.name||r?.colourPlan?.label||"")}
function colourOf(r){
  const raw=rawColour(r),k=raw.trim().toLowerCase();
  const map={red:["Red","Rouge"],green:["Green","Vert"],white:["White","Blanc"],violet:["Violet","Violet"],purple:["Violet","Violet"],black:["Black","Noir"],rose:["Rose","Rose"],gold:["Gold","Or"]};
  const pair=map[k];return pair?(fr()?pair[1]:pair[0]):raw;
}
function profileOf(r){
  const p=properOf(r),d=r?.day?.main,k=String(p?.riteProfile||p?.profile||d?.profile||"").replace(/-/g,"_").toLowerCase();
  const map={extended_readings_mass:["Extended readings","Lectures étendues"],requiem_mass_1962:["Requiem","Requiem"],requiem:["Requiem","Requiem"],palm_sunday_mass:["Palm Sunday","Dimanche des Rameaux"],holy_thursday_mass:["Holy Thursday","Jeudi saint"],easter_vigil_mass:["Easter Vigil","Vigile pascale"],ordinary_mass_1962:["1962 Mass","Messe de 1962"],ordinary_mass:["1962 Mass","Messe de 1962"]};
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
function yearProgress(id){
  const d=dateOf(id),start=new Date(d.getFullYear(),0,1,12),end=new Date(d.getFullYear()+1,0,1,12);
  return Math.max(0,Math.min(1,(d-start)/(end-start)));
}
function yearWheel(selected,r){
  const d=dateOf(selected),loc=fr()?"fr-FR":"en-GB",angle=(yearProgress(selected)*360).toFixed(2),season=seasonOf(r);
  return `<div class="aoCalYearWheel" style="--ao-cal-year-angle:${angle}deg;--ao-cal-liturgical:${esc(liturgicalAccent(r))}" role="img" aria-label="${esc(L("Position in the year","Position dans l’année"))}">
    <div class="aoCalYearTicks" aria-hidden="true"></div><div class="aoCalYearMarker" aria-hidden="true"></div>
    <div class="aoCalYearCore"><small>${esc(season||L("Sacred time","Temps sacré"))}</small><strong>${esc(String(d.getDate()))}</strong><span>${esc(d.toLocaleDateString(loc,{month:"long",year:"numeric"}))}</span></div>
  </div>`;
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
function daySurface(selected,r){
  const y=buildLiturgicalYear(selected),p=y.currentPeriod,next=nextMajorCelebration(selected),cm=commemorations(r);
  const season=periodName(p),properReady=!!properOf(r),periodPercent=pct(y.periodProgress);
  return `
    ${dayNavigator(selected)}
    <section class="aoCalV2Hero" style="--ao-cal-liturgical:${esc(liturgicalAccent(r))}">
      <small class="aoCalV2Eyebrow">${esc(L("CALENDARIUM ROMANUM · 1962","CALENDARIUM ROMANUM · 1962"))}</small>
      <h2>${esc(titleOf(r))}</h2>
      <div class="aoCalIdentityMeta">${rankOf(r)?`<span>${esc(rankOf(r))}</span>`:""}${colourOf(r)?`<span>${esc(colourOf(r))}</span>`:""}${profileOf(r)?`<span>${esc(profileOf(r))}</span>`:""}</div>
      ${sourceStatus(r)}
      ${properReady?`<button class="aoCalV2Primary" type="button" data-cal-mass>${esc(L("Open this Mass","Ouvrir cette messe"))} <span aria-hidden="true">→</span></button>`:""}
    </section>
    <section class="aoCalV2Context">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("LITURGICAL TIME","TEMPS LITURGIQUE"))}</small><h3>${esc(season)}</h3></div><strong>${periodPercent}%</strong></div>
      <div class="aoCalV2SeasonMeta"><span>${esc(L(`Day ${y.periodDayIndex} of ${p.days}`,`Jour ${y.periodDayIndex} sur ${p.days}`))}</span><span>${esc(L(`Liturgical year ${y.label}`,`Année liturgique ${y.label}`))}</span></div>
      <div class="aoCalV2Progress"><i style="width:${periodPercent}%"></i></div>
      ${next?`<button class="aoCalV2NextMajor" type="button" data-cal-date="${next.date}"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><strong>${esc(celebrationName(next))}</strong><span>${esc(longDate(next.date))} · ${dayCount(selected,next.date)} ${esc(L("days","jours"))}</span></button>`:""}
      <button class="aoCalV2TextLink" type="button" data-cal-view="year">${esc(L("View the liturgical year","Voir l’année liturgique"))} →</button>
    </section>
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
function v384Companion(selected,r){
  const year=calendarV384Panel==="discipline"?v384DisciplineHTML(selected,{fr:fr(),era:calendarV384Era}):v384YearHTML(selected,{fr:fr(),properTitle:titleOf(r)});
  return `<section class="aoCalV384Companion"><div class="aoCalV2SectionTitle"><div><small>V38.4 · ${esc(L("TRADITIONAL COMPANION","COMPAGNON TRADITIONNEL"))}</small><h3>${esc(L("Traditional Liturgical Year","Année liturgique traditionnelle"))}</h3></div></div><div class="aoCalV384Tabs"><button type="button" data-ao-cal-v384-panel="year" class="${calendarV384Panel==="year"?"active":""}">${esc(L("Traditional year","Année traditionnelle"))}</button><button type="button" data-ao-cal-v384-panel="discipline" class="${calendarV384Panel==="discipline"?"active":""}">${esc(L("Discipline","Discipline"))}</button></div>${year}</section>`;
}
function yearSurface(selected,r){
  const y=buildLiturgicalYear(selected),p=y.currentPeriod,next=nextMajorCelebration(selected),yearPct=pct(y.progress),periodPct=pct(y.periodProgress),gradient=ringGradient(y);
  const nextSeason=y.nextPeriod||{en:"Advent",fr:"Avent",start:addDaysIso(y.end,1)};
  return `
    <section class="aoCalV2YearHero">
      <div class="aoCalV2YearHeading"><small>${esc(L("LITURGICAL YEAR","ANNÉE LITURGIQUE"))}</small><h2>${esc(y.label)}</h2></div>
      <div class="aoCalV2YearHeroGrid">
        <div class="aoCalV2Ring" style="--year-angle:${(y.progress*360).toFixed(2)}deg;--year-gradient:conic-gradient(from -90deg,${gradient})">
          <div class="aoCalV2RingMarker"></div>
          <div class="aoCalV2RingCore"><strong>${yearPct}%</strong><small>${esc(L("YEAR ELAPSED","ANNÉE PARCOURUE"))}</small><span>${esc(L(`day ${y.dayIndex} of ${y.totalDays}`,`jour ${y.dayIndex} sur ${y.totalDays}`))}</span></div>
        </div>
        <div class="aoCalV2YearIdentity">
          <small>${esc(L("SELECTED DAY","JOUR CONSULTÉ"))}</small>
          <h3>${esc(periodName(p))}</h3>
          <p class="aoCalV2SelectedFeast">${esc(titleOf(r))}</p>
          <dl><div><dt>${esc(L("Year","Année"))}</dt><dd>${esc(y.label)}</dd></div><div><dt>${esc(L("Current period","Période actuelle"))}</dt><dd>${esc(L(`Day ${y.periodDayIndex} of ${p.days}`,`Jour ${y.periodDayIndex} sur ${p.days}`))}</dd></div></dl>
          ${next?`<div class="aoCalV2MajorLine"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><button type="button" data-cal-date="${next.date}">${esc(celebrationName(next))} · ${esc(shortDate(next.date))}</button></div>`:""}
          <div class="aoCalV2PeriodProgress"><div><small>${esc(L("PROGRESS IN ","PROGRESSION DANS "))}${esc(periodName(p).toUpperCase())}</small><strong>${periodPct}%</strong></div><span><i style="width:${periodPct}%"></i></span></div>
        </div>
      </div>
    </section>
    <section class="aoCalV2AtGlance">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("PROPORTIONAL TO REAL DURATION","PROPORTIONNEL À LA DURÉE RÉELLE"))}</small><h3>${esc(L("The year at a glance","L’année d’un seul regard"))}</h3></div></div>
      <div class="aoCalV2TimelineScroll"><div class="aoCalV2Timeline" style="--today:${(y.progress*100).toFixed(3)}%">
        ${y.periods.map(x=>`<button type="button" data-cal-date="${x.start}" class="${x.id===p.id?"current":""}" style="flex:${x.days} 0 0;--seg:${periodUiColour(x.color)}"><span>${esc(periodName(x))}</span></button>`).join("")}
        <i class="aoCalV2TodayMarker"><b></b></i>
      </div></div>
    </section>
    <section class="aoCalV2Journey">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("PAST · PRESENT · FUTURE","PASSÉ · PRÉSENT · À VENIR"))}</small><h3>${esc(L("The path of the year","Le chemin de l’année"))}</h3></div></div>
      <div class="aoCalV2JourneyRail">${y.periods.map(x=>{
        const current=x.id===p.id,past=x.end<selected,status=current?L("CURRENT","EN COURS"):past?L("PAST","PASSÉ"):L("UPCOMING","À VENIR");
        return `<button type="button" data-cal-date="${x.start}" class="${current?"current":past?"past":"future"}" style="--seg:${periodUiColour(x.color)}"><small>${esc(status)}</small><h4>${esc(periodName(x))}</h4><p>${esc(fr()?x.summaryFr:x.summaryEn)}</p><span>${esc(shortDate(x.start))} → ${esc(shortDate(x.end))} · ${x.days} ${esc(L("days","jours"))}</span>${current?`<b>${esc(L("YOU ARE HERE","VOUS ÊTES ICI"))}</b>`:""}</button>`;
      }).join("")}</div>
    </section>
    <section class="aoCalV2Coming">
      <div class="aoCalV2SectionTitle"><div><small>${esc(L("WHAT NOW?","ET MAINTENANT ?"))}</small><h3>${esc(L("Coming next","Les prochains repères"))}</h3></div></div>
      <div class="aoCalV2ComingGrid">
        <button type="button" data-cal-date="${nextSeason.start}"><small>${esc(L("NEXT CHANGE OF SEASON","PROCHAIN CHANGEMENT DE TEMPS"))}</small><strong>${esc(periodName(nextSeason))}</strong><span>${esc(longDate(nextSeason.start))} · ${dayCount(selected,nextSeason.start)} ${esc(L("days","jours"))}</span></button>
        ${next?`<button type="button" data-cal-date="${next.date}"><small>${esc(L("NEXT MAJOR CELEBRATION","PROCHAINE GRANDE CÉLÉBRATION"))}</small><strong>${esc(celebrationName(next))}</strong><span>${esc(longDate(next.date))} · ${dayCount(selected,next.date)} ${esc(L("days","jours"))}</span></button>`:""}
      </div>
      <button class="aoCalV2TextLink" type="button" data-cal-open-month="major">${esc(L("Major days this month","Jours majeurs de ce mois"))} →</button>
    </section>
    ${v384Companion(selected,r)}
  `;
}
function pickerSurface(selected){
  if(!pickerMonthId)pickerMonthId=selected.slice(0,7);
  const [yy,mm]=pickerMonthId.split("-").map(Number),first=new Date(yy,mm-1,1,12),days=monthGridIds(pickerMonthId),today=iso(new Date()),loc=fr()?"fr-FR":"en-GB";
  const status=monthStatus.get(pickerMonthId),ready=monthReady(pickerMonthId),done=status?.done??days.filter(x=>weekCache.has(x)).length;
  const calendarGrid=`<div class="aoCalV2Weekdays">${Array.from({length:7},(_,i)=>{const d=new Date(2026,7,2+i,12);return `<span>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</span>`}).join("")}</div>
    <div class="aoCalV2MonthGrid" data-month-ready="${ready?"true":"false"}">${days.map(id=>{
      const d=dateOf(id),outside=d.getMonth()!==mm-1,data=monthCellData(id);
      return `<button type="button" data-cal-pick-date="${id}" data-ready="${data.ready?"1":"0"}" data-rank-tier="${data.tier}" class="${outside?"outside":""} ${id===selected?"selected":""} ${id===today?"today":""} ${data.sunday?"sunday":""} ${data.name?"major":""}" style="--month-accent:${esc(data.accent)}" aria-label="${esc(data.aria)}"><span class="aoCalMonthTop"><b>${d.getDate()}</b><i data-cal-liturgical-marker aria-hidden="true"></i></span><span class="aoCalMonthName">${esc(data.name)}</span></button>`;
    }).join("")}</div>`;
  const projection=calendarMonthView==="calendar"?calendarGrid:monthIndexList(pickerMonthId,selected,calendarMonthView);
  return `<section class="aoCalV2Picker">
    <div class="aoCalV2YearHeading"><small>${esc(L("LITURGICAL MONTH","MOIS LITURGIQUE"))}</small><h2>${esc(first.toLocaleDateString(loc,{month:"long",year:"numeric"}))}</h2><p>${esc(L("The month by calendar, major days, temporal cycle or sanctoral cycle.","Le mois par calendrier, jours majeurs, cycle temporal ou cycle sanctoral."))}</p></div>
    <div class="aoCalV2MonthNav"><button type="button" data-cal-month-shift="-1">${assetIcon("ao-ui-previous")} ${esc(L("Previous month","Mois précédent"))}</button><button type="button" data-cal-today>${esc(L("Today","Aujourd’hui"))}</button><button type="button" data-cal-month-shift="1">${esc(L("Next month","Mois suivant"))} ${assetIcon("ao-ui-next")}</button></div>
    ${monthIndexTabs()}
    <div class="aoCalV2MonthMeta"><span data-cal-month-status aria-live="polite">${esc(ready?L("1962 calendar · liturgical month ready","Calendrier 1962 · mois liturgique prêt"):L(`Resolving liturgical month · ${done}/42`,`Résolution du mois liturgique · ${done}/42`))}</span><span>${esc(calendarMonthView==="calendar"?L("Colour = liturgical colour · stronger mark = higher rank","Couleur = couleur liturgique · marque plus forte = classe plus élevée"):L("Only observances actually resolved for this month are shown.","Seules les célébrations effectivement résolues pour ce mois sont affichées."))}</span></div>
    ${projection}
    <div class="aoCalV2DirectJump"><label>${esc(L("Exact date","Date exacte"))}</label><div><input data-cal-input inputmode="numeric" value="${esc(displayDate(selected))}" aria-label="${esc(L("Date in DD/MM/YYYY format","Date au format JJ/MM/AAAA"))}"><button type="button" data-cal-go>${esc(L("Go","Aller"))}</button></div><p data-cal-error aria-live="polite"></p></div>
  </section>`;
}

function bodyMarkup(){
  const s=state(),selected=s?.selectedDate||iso(new Date()),r=resolution();
  if(!r||r.status==="failed"||!r.day){
    return `${tabsMarkup()}<div class="aoCalModEmpty"><small>${L("CALENDAR","CALENDRIER")}</small><h2>${esc(displayDate(selected))}</h2><p>${L("This date could not be opened. Please try again or choose another date.","Cette date n’a pas pu être ouverte. Veuillez réessayer ou choisir une autre date.")}</p><button data-cal-today>${L("Return to today","Revenir à aujourd’hui")}</button></div>`;
  }
  const surface=calendarView==="year"?yearSurface(selected,r):calendarView==="picker"?pickerSurface(selected):daySurface(selected,r);
  return `${tabsMarkup()}${surface}`;
}
function css(){
  return `#${ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14950;background:radial-gradient(circle at 50% -10%,rgba(126,103,69,.11),transparent 34%),var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;font-family:var(--ao-font-body,Georgia,"Times New Roman",serif)}#${ROOT_ID} *{box-sizing:border-box}.aoCalModTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(8px + var(--safe-top,0px)) var(--ao-page-gutter,14px) 8px;background:linear-gradient(180deg,rgba(8,12,18,.985),rgba(8,12,18,.91));backdrop-filter:blur(var(--ao-topbar-blur,16px));border-bottom:1px solid var(--ao-rule,rgba(226,214,190,.1))}.aoCalModTop h1{margin:0;font-size:17px;font-weight:500;letter-spacing:.025em;text-align:center}.aoCalModTop>span{width:44px;height:44px}.aoCalModTop button,#${ROOT_ID} section button,#${ROOT_ID} details button{min-height:44px;border:1px solid rgba(232,221,201,.13);border-radius:999px;background:rgba(16,24,33,.76);color:#e9e4d9;padding:8px 12px}.aoCalModTop button{width:44px;height:44px;padding:0}.aoCalModBody{width:min(760px,100%);margin:0 auto;padding:8px 14px 48px}.aoCalSacredTime{display:grid;grid-template-columns:180px minmax(0,1fr);gap:22px;align-items:center;padding:24px 4px 28px;position:relative}.aoCalSacredTime:after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ao-cal-liturgical) 62%,transparent),transparent)}.aoCalYearWheel{width:168px;aspect-ratio:1;position:relative;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at center,#0b1118 0 47%,transparent 48%),conic-gradient(from -90deg,color-mix(in srgb,var(--ao-cal-liturgical) 54%,#202934) 0 var(--ao-cal-year-angle),rgba(255,255,255,.065) var(--ao-cal-year-angle) 360deg);box-shadow:inset 0 0 0 1px rgba(235,225,208,.1),0 18px 50px rgba(0,0,0,.2)}.aoCalYearWheel:before{content:"";position:absolute;inset:12px;border-radius:50%;border:1px solid rgba(235,225,208,.1)}.aoCalYearTicks{position:absolute;inset:2px;border-radius:50%;background:repeating-conic-gradient(from -90deg,rgba(238,227,207,.44) 0 1deg,transparent 1deg 30deg);mask:radial-gradient(transparent 0 88%,#000 89% 100%)}.aoCalYearMarker{position:absolute;inset:0;transform:rotate(var(--ao-cal-year-angle));pointer-events:none}.aoCalYearMarker:before{content:"";position:absolute;left:50%;top:-3px;width:8px;height:8px;border-radius:50%;transform:translateX(-50%);background:#e8decc;box-shadow:0 0 0 4px color-mix(in srgb,var(--ao-cal-liturgical) 40%,transparent),0 0 18px color-mix(in srgb,var(--ao-cal-liturgical) 70%,transparent)}.aoCalYearCore{position:relative;z-index:1;width:96px;text-align:center;display:grid;gap:1px}.aoCalYearCore small{font:600 9px/1.12 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#aaa18f;white-space:normal;overflow-wrap:anywhere}.aoCalYearCore strong{font-size:40px;font-weight:400;line-height:1;color:#f0e8da;margin-top:4px}.aoCalYearCore span{font-size:11px;color:#a9afb5;text-transform:capitalize}.aoCalIdentity{min-width:0}.aoCalKicker,.aoCalSectionHead small{display:block;font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--ao-cal-liturgical) 75%,#b9b1a2)}.aoCalIdentity h2{font-size:31px;line-height:1.08;font-weight:400;margin:8px 0 12px;letter-spacing:-.02em}.aoCalIdentityMeta{display:flex;flex-wrap:wrap;gap:0;color:#b9b2a7}.aoCalIdentityMeta span{font-size:12px}.aoCalIdentityMeta span+span:before{content:"·";padding:0 7px;color:#68717a}.aoCalSourceLine{display:flex;gap:7px;align-items:center;margin-top:13px;color:#777f87;font:600 9px/1 system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase}.aoCalSourceLine span.ok{color:#91a994}.aoCalSourceLine span.warn{color:#b19074}.aoCalWeekSection,.aoCalCommemorations{padding:18px 0;border-bottom:1px solid rgba(235,225,208,.085)}.aoCalSectionHead{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:12px}.aoCalSectionHead h3{font-size:19px;font-weight:400;margin:3px 0 0}.aoCalTodayQuiet{border:0!important;background:transparent!important;color:#b9b1a2!important;padding:4px 0!important;min-height:36px!important}.aoCalModRail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(126px,1fr);gap:7px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 1px 7px}.aoCalModRail::-webkit-scrollbar{display:none}.aoCalObservance{scroll-snap-align:center!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;gap:9px!important;align-items:center!important;min-height:70px!important;border-radius:12px!important;text-align:left!important;padding:9px!important;background:linear-gradient(160deg,color-mix(in srgb,var(--ao-cal-liturgical) 7%,#0e161f),#0c131b)!important;position:relative;overflow:hidden}.aoCalObservance:before{content:"";position:absolute;inset:0 auto 0 0;width:2px;background:color-mix(in srgb,var(--ao-cal-liturgical) 72%,#8f7d5e);opacity:.55}.aoCalObservance.active{border-color:color-mix(in srgb,var(--ao-cal-liturgical) 68%,#d8cbaa)!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--ao-cal-liturgical) 24%,transparent) inset}.aoCalObsDate{text-align:center;border-right:1px solid rgba(235,225,208,.08);padding-right:7px}.aoCalObsDate small,.aoCalObsDate b{display:block}.aoCalObsDate small{font:600 9px/1 system-ui,sans-serif;text-transform:uppercase;color:#858d95}.aoCalObsDate b{font-size:19px;font-weight:400;margin-top:4px}.aoCalObsText{min-width:0}.aoCalObsText strong{display:block;font-size:12px;font-weight:500;line-height:1.16;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoCalObsText small{display:block;margin-top:5px;color:#838b92;font:500 9px/1.1 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aoCalModWeekNav{display:flex;justify-content:space-between;gap:8px;margin-top:4px}.aoCalModWeekNav button{min-height:38px!important;border:0!important;background:transparent!important;color:#999f9f!important;padding:5px 1px!important}.aoCalModWeekNav .aoCalAssetIcon{font-size:.8em}.aoCalModList{display:grid;gap:0}.aoCalModList article{display:grid;grid-template-columns:8px 1fr;gap:10px;align-items:center;padding:11px 2px;border-top:1px solid rgba(235,225,208,.07)}.aoCalModList article:first-child{border-top:0}.aoCalModList article span{width:5px;height:5px;border-radius:50%;background:var(--ao-cal-liturgical,#8f7d5e);opacity:.72}.aoCalModList article strong{font-size:13px;font-weight:400}.aoCalNavigate{margin:18px 0 8px;border-top:1px solid rgba(235,225,208,.08);padding-top:14px}.aoCalNavigate summary{cursor:pointer;list-style:none;color:#858d95;font:600 10px/1.3 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}.aoCalNavigate summary::-webkit-details-marker{display:none}.aoCalModJump{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:10px}.aoCalModJump input{min-height:44px;border:1px solid rgba(235,225,208,.13);border-radius:10px;background:#0d141c;color:#e9e4d9;padding:8px 10px}.aoCalModJump .primary{border-color:rgba(205,179,119,.36)!important}.aoCalModError{min-height:20px;margin-top:7px;font-size:12px;color:#d2aa7b}.aoCalModEmpty{padding:50px 8px;text-align:center}.aoCalModEmpty small{font:600 10px/1 system-ui,sans-serif;letter-spacing:.14em;color:#858d95}.aoCalModEmpty h2{font-size:34px;font-weight:400}.aoCalModEmpty p{color:#9da5aa;line-height:1.5}@media(max-width:560px){.aoCalModBody{padding:2px 12px 36px}.aoCalSacredTime{grid-template-columns:138px minmax(0,1fr);gap:14px;padding:18px 0 22px}.aoCalYearWheel{width:132px}.aoCalYearWheel:before{inset:10px}.aoCalYearCore{width:76px}.aoCalYearCore strong{font-size:34px}.aoCalYearCore span{font-size:9px}.aoCalIdentity h2{font-size:24px}.aoCalIdentityMeta span{font-size:11px}.aoCalSourceLine{gap:5px;font-size:8px}.aoCalModRail{grid-auto-columns:132px;margin-right:-12px;padding-right:12px}.aoCalSectionHead{margin-bottom:9px}.aoCalWeekSection,.aoCalCommemorations{padding:15px 0}.aoCalModTop{grid-template-columns:44px 1fr 44px}.aoCalModTop button,.aoCalModTop>span{width:44px;height:44px}}
.aoCalModBody{width:min(var(--ao-content-max,760px),100%);padding:0 var(--ao-page-gutter,14px) 60px}#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalModBody{width:min(var(--ao-content-wide,980px),100%)}
.aoCalV2Tabs{position:sticky;top:calc(61px + var(--safe-top,0px));z-index:3;display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:0 calc(-1 * var(--ao-page-gutter,14px));padding:0 var(--ao-page-gutter,14px);background:rgba(8,12,18,.96);border-bottom:1px solid rgba(235,225,208,.09);backdrop-filter:blur(14px)}
.aoCalV2Tabs button{min-height:44px;border:0;background:transparent;color:#7f878e;font:600 10px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid transparent}
.aoCalV2Tabs button.active{color:#e8decc;border-bottom-color:#cfc2a8}
.aoCalMonthTabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:16px 0 12px;padding:2px 0 5px;border-bottom:1px solid rgba(235,225,208,.08)}.aoCalMonthTabs::-webkit-scrollbar{display:none}.aoCalMonthTabs button{flex:0 0 auto;min-height:36px!important;border:0!important;border-radius:0!important;background:transparent!important;padding:7px 10px!important;color:#7f878e!important;font:700 9px/1 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.075em;text-transform:uppercase;position:relative}.aoCalMonthTabs button.active{color:#e8decc!important}.aoCalMonthTabs button.active:after{content:"";position:absolute;left:9px;right:9px;bottom:-6px;height:2px;background:#cfc2a8}
.aoCalMonthIndex{padding:4px 0 2px}.aoCalMonthIndexHead{display:flex;align-items:end;justify-content:space-between;gap:18px;padding:4px 0 12px}.aoCalMonthIndexHead small{color:#9a9184;font:700 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}.aoCalMonthIndexHead p{max-width:470px;margin:0;color:#777f87;font:500 10px/1.35 var(--ao-font-ui,system-ui,sans-serif);text-align:right}.aoCalMonthIndexList{display:grid;gap:7px}.aoCalMonthIndexList>button{display:grid!important;grid-template-columns:86px minmax(0,1fr) 14px!important;align-items:center!important;gap:12px!important;min-height:68px!important;border-radius:var(--ao-card-radius,15px)!important;background:linear-gradient(150deg,color-mix(in srgb,var(--month-accent,#59626c) 5%,#0b1118),#0b1118)!important;text-align:left!important;padding:11px 13px!important;position:relative;overflow:hidden}.aoCalMonthIndexList>button:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--month-accent,#59626c);opacity:.72}.aoCalMonthIndexList>button.selected{border-color:#d4c6a8!important;box-shadow:inset 0 0 0 1px rgba(212,198,168,.18)}.aoCalMonthIndexList time{color:#aa9a80;font:700 10px/1 var(--ao-font-ui,system-ui,sans-serif);font-variant-numeric:tabular-nums}.aoCalMonthIndexText{min-width:0}.aoCalMonthIndexText strong{display:block;font-size:15px;font-weight:400;line-height:1.18}.aoCalMonthIndexText small{display:block;margin-top:5px;color:#858d94;font:600 9px/1.15 var(--ao-font-ui,system-ui,sans-serif)}.aoCalMonthIndexList i{width:8px;height:8px;border-radius:50%;background:var(--month-accent,#59626c);justify-self:end;opacity:.85}.aoCalMonthEmpty{padding:28px 14px;border:1px solid rgba(235,225,208,.08);border-radius:var(--ao-card-radius,15px);color:#81898f;text-align:center;font-size:12px;line-height:1.45}
.aoCalV2DayNav{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:12px;padding:24px 0 18px;border-bottom:1px solid rgba(235,225,208,.08)}
.aoCalV2DayNav button,.aoCalV2MonthNav button,.aoCalV2WeekShift button,.aoCalV2Today{border:0!important;background:transparent!important;color:#aaa39a!important}
.aoCalV2DayNav>div{text-align:center}.aoCalV2DayNav small{display:block;color:#8d949a;font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase}.aoCalV2DayNav strong{display:block;margin-top:5px;font-size:18px;font-weight:400;text-transform:capitalize}
.aoCalV2Hero{text-align:center;padding:46px 12px 38px;position:relative}.aoCalV2Hero:after{content:"";position:absolute;left:20%;right:20%;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ao-cal-liturgical) 62%,transparent),transparent)}
.aoCalV2Eyebrow,.aoCalV2SectionTitle small,.aoCalV2Commemorations>small,.aoCalV2YearHeading small,.aoCalV2YearIdentity>small,.aoCalV2MajorLine small,.aoCalV2PeriodProgress small,.aoCalV2ComingGrid small{font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8f948f}
.aoCalV2Hero h2{font-size:clamp(34px,5.5vw,58px);line-height:1.02;font-weight:400;letter-spacing:-.035em;margin:12px auto 14px;max-width:780px}.aoCalV2Hero .aoCalIdentityMeta{justify-content:center}.aoCalV2Hero .aoCalSourceLine{justify-content:center}
.aoCalV2Primary{margin-top:24px!important;min-height:48px!important;border-radius:var(--ao-control-radius,11px)!important;padding:0 22px!important;border:1px solid rgba(214,195,156,.4)!important;background:rgba(171,145,94,.1)!important;color:#eee5d5!important;font:600 11px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}.aoCalV2Primary span{margin-left:10px}
.aoCalV2Context,.aoCalV2WeekSection,.aoCalV2Commemorations,.aoCalV2AtGlance,.aoCalV2Journey,.aoCalV2Coming{padding:28px 0;border-bottom:1px solid rgba(235,225,208,.08)}
.aoCalV2SectionTitle{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.aoCalV2SectionTitle h3{margin:4px 0 0;font-size:25px;font-weight:400}.aoCalV2SectionTitle>strong{font:400 27px/1 Georgia,serif;color:#cabca4}
.aoCalV2SeasonMeta{display:flex;justify-content:space-between;gap:12px;color:#8d949a;font:500 11px/1.3 system-ui,sans-serif}.aoCalV2Progress,.aoCalV2PeriodProgress>span{display:block;height:4px;background:rgba(235,225,208,.08);margin:10px 0 18px;overflow:hidden}.aoCalV2Progress i,.aoCalV2PeriodProgress i{display:block;height:100%;background:#a79575}
.aoCalV2NextMajor{width:100%;display:grid!important;grid-template-columns:1fr auto!important;gap:4px 16px!important;text-align:left!important;border:1px solid rgba(235,225,208,.1)!important;border-radius:3px!important;background:#0c1219!important;padding:16px 18px!important}.aoCalV2NextMajor small{grid-column:1/-1;color:#8d949a;font:700 9px/1.2 system-ui,sans-serif;letter-spacing:.12em}.aoCalV2NextMajor strong{font-size:18px;font-weight:400}.aoCalV2NextMajor span{align-self:center;color:#8d949a;font:500 10px/1.3 system-ui,sans-serif}
.aoCalV2TextLink{display:inline-flex!important;margin-top:16px!important;border:0!important;background:transparent!important;padding:6px 0!important;color:#c8bda9!important;font:600 10px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.aoCalV2Week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid rgba(235,225,208,.08);border-bottom:1px solid rgba(235,225,208,.08)}.aoCalV2Week button{min-width:0!important;min-height:112px!important;border:0!important;border-right:1px solid rgba(235,225,208,.06)!important;border-radius:0!important;background:transparent!important;padding:14px 7px!important;text-align:center!important;position:relative}.aoCalV2Week button:last-child{border-right:0!important}.aoCalV2Week button:after{content:"";position:absolute;left:25%;right:25%;bottom:-1px;height:2px;background:var(--day-accent);opacity:.42}.aoCalV2Week button.active{background:rgba(235,225,208,.035)!important}.aoCalV2Week button.active:after{left:12%;right:12%;height:3px;opacity:1}.aoCalV2Week small{display:block;color:#747d85;font:700 9px/1 system-ui,sans-serif;text-transform:uppercase}.aoCalV2Week b{display:block;margin:8px 0 7px;font-size:23px;font-weight:400}.aoCalV2Week span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:1.15;color:#aaa49a}
.aoCalV2WeekShift,.aoCalV2MonthNav{display:flex;justify-content:space-between;gap:10px;margin-top:9px}.aoCalV2MonthNav{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center}.aoCalV2MonthNav button{min-width:0!important;padding-inline:0!important}.aoCalV2MonthNav button:first-child{justify-self:start;text-align:left}.aoCalV2MonthNav button:last-child{justify-self:end;text-align:right}.aoCalV2WeekShift button,.aoCalV2MonthNav button{font-size:11px!important}
.aoCalV2Today{font:600 10px/1 system-ui,sans-serif!important;text-transform:uppercase!important;letter-spacing:.08em!important}
.aoCalV2Commemorations h3{font-size:24px;font-weight:400;margin:4px 0 10px}.aoCalV2Commemorations p{display:grid;grid-template-columns:8px 1fr;gap:10px;align-items:center;margin:0;padding:10px 0;border-top:1px solid rgba(235,225,208,.06)}.aoCalV2Commemorations i{width:5px;height:5px;border-radius:50%;background:#a79575}.aoCalV2Commemorations span{font-size:13px}
.aoCalV2YearHero{padding:28px 0 34px;border-bottom:1px solid rgba(235,225,208,.09)}.aoCalV2YearHeading h2{font-size:38px;font-weight:400;margin:7px 0 0}.aoCalV2YearHeading p{color:#8c949a;margin:8px 0 0}
.aoCalV2YearHeroGrid{display:grid;grid-template-columns:300px 1fr;gap:44px;align-items:center;margin-top:24px;padding:28px;border:1px solid rgba(235,225,208,.1);border-radius:var(--ao-card-radius,15px);background:radial-gradient(circle at 18% 38%,rgba(184,158,108,.08),transparent 34%),#0a1016}
.aoCalV2Ring{width:260px;aspect-ratio:1;border-radius:50%;position:relative;display:grid;place-items:center;background:radial-gradient(circle at center,#0a1016 0 59%,transparent 60%),var(--year-gradient);box-shadow:inset 0 0 0 1px rgba(235,225,208,.08),0 22px 60px rgba(0,0,0,.26)}.aoCalV2Ring:after{content:"";position:absolute;inset:18px;border:1px solid rgba(235,225,208,.12);border-radius:50%}.aoCalV2RingCore{position:relative;z-index:2;width:145px;text-align:center}.aoCalV2RingCore strong{display:block;font-size:43px;font-weight:400;color:#e8decc}.aoCalV2RingCore small{display:block;margin-top:4px;color:#9c9488;font:700 9px/1.15 system-ui,sans-serif;letter-spacing:.12em}.aoCalV2RingCore span{display:block;margin-top:8px;color:#9ba0a3;font-size:12px}.aoCalV2RingMarker{position:absolute;inset:0;transform:rotate(var(--year-angle));z-index:3}.aoCalV2RingMarker:before{content:"";position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:13px;height:13px;border-radius:50%;background:#efe2cb;border:3px solid #8f342b;box-shadow:0 0 0 2px #0a1016}
.aoCalV2YearIdentity h3{font-size:35px;font-weight:400;margin:7px 0 2px}.aoCalV2SelectedFeast{font-size:19px;color:#b7afa3;margin:0 0 20px}.aoCalV2YearIdentity dl{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin:0}.aoCalV2YearIdentity dl div{border-top:1px solid rgba(235,225,208,.1);padding:10px 0}.aoCalV2YearIdentity dt{color:#7f878d;font:700 9px/1.1 system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}.aoCalV2YearIdentity dd{margin:5px 0 0;font-size:15px}.aoCalV2MajorLine{border-top:1px solid rgba(235,225,208,.1);padding:11px 0}.aoCalV2MajorLine button{display:block!important;border:0!important;background:transparent!important;padding:5px 0!important;color:#e7dfd2!important;font-size:15px!important;text-align:left!important}.aoCalV2PeriodProgress{margin-top:7px}.aoCalV2PeriodProgress>div{display:flex;justify-content:space-between;align-items:end}.aoCalV2PeriodProgress strong{font-size:18px;font-weight:400;color:#c5b79d}.aoCalV2PeriodProgress>span{margin:8px 0 0}
.aoCalV2TimelineScroll{overflow-x:auto;padding-bottom:7px}.aoCalV2Timeline{position:relative;display:flex;min-width:880px;height:112px;border:1px solid rgba(235,225,208,.12)}.aoCalV2Timeline button{border:0!important;border-right:1px solid rgba(8,12,18,.3)!important;border-radius:0!important;background:var(--seg)!important;color:#f1eadf!important;min-width:0!important;padding:0 7px!important;position:relative}.aoCalV2Timeline button span{position:absolute;left:7px;right:7px;bottom:10px;font:700 10px/1.1 system-ui,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.45)}.aoCalV2Timeline button.current{box-shadow:inset 0 0 0 2px #9e3e34}.aoCalV2TodayMarker{position:absolute;top:-18px;bottom:-8px;left:var(--today);width:2px;background:#9e3e34;z-index:3;pointer-events:none}.aoCalV2TodayMarker b{position:absolute;top:-7px;left:50%;transform:translateX(-50%);width:13px;height:13px;border-radius:50%;background:#9e3e34}
.aoCalV2JourneyRail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(240px,280px);gap:10px;overflow-x:auto;padding:1px 1px 8px}.aoCalV2JourneyRail>button{min-height:202px!important;border-radius:var(--ao-card-radius,15px)!important;background:#0b1118!important;text-align:left!important;padding:18px!important;position:relative;overflow:hidden}.aoCalV2JourneyRail>button:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--seg)}.aoCalV2JourneyRail>button.past{opacity:.54}.aoCalV2JourneyRail>button.current{border-color:#9e3e34!important;box-shadow:inset 0 0 0 1px #9e3e34}.aoCalV2JourneyRail small{color:#8f9497;font:700 9px/1 system-ui,sans-serif;letter-spacing:.1em}.aoCalV2JourneyRail h4{font-size:23px;font-weight:400;margin:11px 0 8px}.aoCalV2JourneyRail p{color:#9ba0a3;font-size:13px;line-height:1.35;margin:0 0 12px}.aoCalV2JourneyRail span{color:#7f878d;font:500 10px/1.3 system-ui,sans-serif}.aoCalV2JourneyRail b{position:absolute;right:13px;top:13px;color:#b65b50;font:700 8px/1 system-ui,sans-serif;letter-spacing:.09em}
.aoCalV2ComingGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aoCalV2ComingGrid button{min-height:116px!important;border-radius:2px!important;background:#0b1118!important;text-align:left!important;padding:17px!important;border-radius:var(--ao-card-radius,15px)!important}.aoCalV2ComingGrid strong{display:block;font-size:20px;font-weight:400;margin:9px 0 6px}.aoCalV2ComingGrid span{color:#8f969a;font:500 10px/1.3 system-ui,sans-serif}
.aoCalV384Companion{margin-top:34px;padding:22px 0 6px;border-top:1px solid rgba(235,225,208,.12);--border:rgba(235,225,208,.12);--muted:#9da4aa;--text:#e9e4d9;--surface-1:#0e151d;--liturgical:#d8bd7d;--liturgical-border:rgba(216,189,125,.3);--liturgical-soft:rgba(216,189,125,.08);--font-display:system-ui,sans-serif}.aoCalV384Tabs{display:flex;gap:6px;margin:0 0 15px;overflow-x:auto}.aoCalV384Tabs button{min-height:36px!important;padding:7px 11px!important;border-radius:999px!important;background:transparent!important;color:#959da4!important;font:700 10px/1 system-ui,sans-serif!important;letter-spacing:.04em}.aoCalV384Tabs button.active{border-color:rgba(216,189,125,.45)!important;background:rgba(216,189,125,.08)!important;color:#e9e4d9!important}.aoCalV384Companion .v38Intro{margin:0 0 12px;color:#9da4aa;font-size:13px;line-height:1.5}${V384_CSS}.aoCalV2Picker{padding:28px 0}.aoCalV2MonthNav{align-items:center;margin:18px 0 10px}.aoCalV2MonthMeta{display:flex;justify-content:space-between;gap:12px;margin:0 0 13px;color:#747d84;font:600 9px/1.35 system-ui,sans-serif;letter-spacing:.035em}.aoCalV2MonthMeta span:last-child{text-align:right}.aoCalV2Weekdays,.aoCalV2MonthGrid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));width:100%;min-width:0}.aoCalV2Weekdays{border-bottom:1px solid rgba(235,225,208,.09)}.aoCalV2Weekdays span{text-align:center;padding:9px 4px;color:#747d84;font:700 9px/1 system-ui,sans-serif;text-transform:uppercase}.aoCalV2MonthGrid{border-left:1px solid rgba(235,225,208,.06);border-top:1px solid rgba(235,225,208,.06)}.aoCalV2MonthGrid button{aspect-ratio:auto;min-width:0!important;padding:7px 5px 5px!important;height:78px!important;min-height:0!important;border-radius:0!important;border-width:0 1px 1px 0!important;border-color:rgba(235,225,208,.06)!important;background:color-mix(in srgb,var(--month-accent,#59626c) 3%,#0b1118)!important;position:relative;text-align:left!important;overflow:hidden}.aoCalV2MonthGrid button[data-ready="0"]{--month-accent:#59626c}.aoCalV2MonthGrid button.outside{opacity:.26}.aoCalV2MonthGrid button.sunday:not(.outside){background:color-mix(in srgb,var(--month-accent,#59626c) 7%,#0b1118)!important}.aoCalV2MonthGrid button.selected{z-index:1;box-shadow:inset 0 0 0 2px #d3c5a7}.aoCalV2MonthGrid button.today .aoCalMonthTop b{outline:1px solid rgba(181,93,80,.9);outline-offset:2px;border-radius:50%}.aoCalMonthTop{display:flex;align-items:center;justify-content:space-between;gap:4px}.aoCalV2MonthGrid b{font-size:16px;font-weight:400;line-height:1}.aoCalMonthTop i{display:block;width:6px;height:2px;border-radius:999px;background:var(--month-accent,#59626c);opacity:.62}.aoCalV2MonthGrid button[data-rank-tier="1"] .aoCalMonthTop i{width:16px;height:3px;opacity:1}.aoCalV2MonthGrid button[data-rank-tier="2"] .aoCalMonthTop i{width:12px;height:3px;opacity:.9}.aoCalV2MonthGrid button[data-rank-tier="3"] .aoCalMonthTop i{width:9px;height:2px;opacity:.76}.aoCalMonthName{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:8px;color:#a9a397;font:500 9px/1.08 var(--ao-font-ui,system-ui,sans-serif);overflow-wrap:anywhere}.aoCalV2MonthGrid button.major .aoCalMonthName,.aoCalV2MonthGrid button.sunday .aoCalMonthName{color:#d3cab9}.aoCalMonthName:empty{display:none}.aoCalV2DirectJump{margin-top:22px;padding-top:18px;border-top:1px solid rgba(235,225,208,.08)}.aoCalV2DirectJump label{color:#8c949a;font:700 9px/1 system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}.aoCalV2DirectJump>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:8px}.aoCalV2DirectJump input{min-width:0;min-height:var(--ao-control-h,44px);border:1px solid rgba(235,225,208,.13);border-radius:var(--ao-control-radius,11px);background:#0b1118;color:#e7dfd2;padding:8px 11px}.aoCalV2DirectJump p{min-height:18px;color:#d2aa7b;font-size:11px}
@media(max-width:700px){.aoCalModBody{padding:0 var(--ao-page-gutter-phone,12px) 46px}.aoCalV2Tabs{top:calc(61px + var(--safe-top,0px));margin:0 calc(-1 * var(--ao-page-gutter-phone,12px));padding:0 6px}.aoCalV2Tabs button{font-size:8px;letter-spacing:.055em}.aoCalMonthTabs{margin-left:0;margin-right:0}.aoCalMonthTabs button{font-size:8px!important;padding-inline:8px!important}.aoCalV2Hero{padding:34px 4px 30px}.aoCalV2Hero h2{font-size:35px}.aoCalV2NextMajor{grid-template-columns:1fr!important}.aoCalV2Week{overflow-x:auto;grid-template-columns:repeat(7,92px);margin-right:-12px}.aoCalV2Week button{min-height:104px!important}.aoCalV2YearHeroGrid{grid-template-columns:1fr;gap:26px;padding:22px 16px}.aoCalV2Ring{width:min(250px,76vw);margin:auto}.aoCalV2YearIdentity{text-align:left}.aoCalV2YearIdentity h3{font-size:31px}.aoCalV2YearIdentity dl{grid-template-columns:1fr 1fr}.aoCalV2Timeline{min-width:760px;height:96px}.aoCalV2ComingGrid{grid-template-columns:1fr}.aoCalMonthIndexHead{display:grid;gap:5px}.aoCalMonthIndexHead p{text-align:left}.aoCalMonthIndexList>button{grid-template-columns:74px minmax(0,1fr) 12px!important;padding:10px 11px!important}.aoCalV2MonthGrid button{height:66px!important;min-height:0!important;padding:6px 4px 4px!important}.aoCalMonthName{font-size:7.5px;margin-top:6px}.aoCalV2MonthMeta{display:grid;gap:3px}.aoCalV2MonthMeta span:last-child{text-align:left;font-weight:500}.aoCalV2SeasonMeta{display:grid;gap:3px}.aoCalV2SectionTitle h3{font-size:22px}}
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
function paint(){const r=root();if(!r)return false;const body=r.querySelector("[data-cal-body]");if(!body)return false;body.innerHTML=bodyMarkup();r.dataset.aoCalendarOwner=VERSION;r.dataset.aoCalendarView=calendarView;requestAnimationFrame(()=>centerSelectedDay(r));return true}
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
  if(calendarView==="picker"){
    pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
    if(!MONTH_INDEX_VIEWS.has(calendarMonthView))calendarMonthView="calendar";
  }else monthEpoch++;
  root()?.scrollTo?.({top:0,left:0,behavior:"auto"});
  paint();
  if(calendarView==="picker")requestPickerMonth();
  return true;
}
function bind(r){
  r.addEventListener("click",event=>{
    const viewButton=event.target.closest?.("[data-cal-view]");if(viewButton){event.preventDefault();setView(viewButton.dataset.calView||"day");return}
    const monthViewButton=event.target.closest?.("[data-cal-month-view]");if(monthViewButton){event.preventDefault();setMonthView(monthViewButton.dataset.calMonthView||"calendar",{openMonth:true});return}
    const monthOpen=event.target.closest?.("[data-cal-open-month]");if(monthOpen){event.preventDefault();setMonthView(monthOpen.dataset.calOpenMonth||"calendar",{openMonth:true});return}
    const v384Panel=event.target.closest?.("[data-ao-cal-v384-panel]");if(v384Panel){event.preventDefault();calendarV384Panel=v384Panel.dataset.aoCalV384Panel==="discipline"?"discipline":"year";paint();return}
    const v384Era=event.target.closest?.("[data-ao-cal-v384-era]");if(v384Era){event.preventDefault();calendarV384Era=["current","1962","older"].includes(v384Era.dataset.aoCalV384Era)?v384Era.dataset.aoCalV384Era:"current";calendarV384Panel="discipline";paint();return}
    const v384Route=event.target.closest?.("[data-ao-cal-v384-route]");if(v384Route){event.preventDefault();const route=v384Route.dataset.aoCalV384Route||"";if(route==="today.calendar"){calendarView="day";paint();return}if(route==="learn.discipline"){calendarV384Panel="discipline";paint();return}void Promise.resolve(globalThis.AO_MODULES?.open?.(route,{returnContext:{surface:"calendar",view:"year"}})).catch(error=>console.error("Calendar v38.4 route failed",error));return}
    const dayShift=event.target.closest?.("[data-cal-day-shift]");if(dayShift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(dayShift.dataset.calDayShift||0)));return}
    const monthShift=event.target.closest?.("[data-cal-month-shift]");if(monthShift){event.preventDefault();const base=pickerMonthId||String(state()?.selectedDate||iso(new Date())).slice(0,7),parts=base.split("-").map(Number),d=new Date(parts[0],parts[1]-1+Number(monthShift.dataset.calMonthShift||0),1,12);pickerMonthId=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");paint();requestPickerMonth();return}
    const pick=event.target.closest?.("[data-cal-pick-date]");if(pick){event.preventDefault();calendarView="day";void select(pick.dataset.calPickDate);return}
    const monthIndexDate=event.target.closest?.("[data-cal-month-index-date]");if(monthIndexDate){event.preventDefault();calendarView="day";void select(monthIndexDate.dataset.calMonthIndexDate);return}
    const mass=event.target.closest?.("[data-cal-mass]");if(mass){event.preventDefault();void Promise.resolve(globalThis.AO_APP_SHELL_V1?.navigate?.("mass")).catch(error=>console.error("Calendar Mass entry failed",error));return}
    const closeButton=event.target.closest?.("[data-cal-close]");if(closeButton){event.preventDefault();close();return}
    const day=event.target.closest?.("[data-cal-date]");if(day){event.preventDefault();void select(day.dataset.calDate);return}
    const shift=event.target.closest?.("[data-cal-shift]");if(shift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(shift.dataset.calShift||0)));return}
    const today=event.target.closest?.("[data-cal-today]");if(today){event.preventDefault();if(calendarView==="picker"){pickerMonthId=iso(new Date()).slice(0,7);paint();requestPickerMonth()}void select(iso(new Date()));return}
    const go=event.target.closest?.("[data-cal-go]");if(go){event.preventDefault();const input=r.querySelector("[data-cal-input]"),err=r.querySelector("[data-cal-error]"),id=parseDisplayDate(input?.value);if(!id){if(err)err.textContent=L("Enter a valid date as DD/MM/YYYY.","Saisissez une date valide au format JJ/MM/AAAA.");return}calendarView="day";void select(id,{closeAfter:false}).then(ok=>{if(!ok&&err)err.textContent=L("This date could not be opened. Please try again.","Cette date n’a pas pu être ouverte. Veuillez réessayer.")});return}
  });
  r.addEventListener("keydown",event=>{const input=event.target.closest?.("[data-cal-input]");if(input&&event.key==="Enter"){event.preventDefault();const id=parseDisplayDate(input.value);if(id){calendarView="day";void select(id,{closeAfter:false})}}});
}
function open(){
  const doc=globalThis.document;if(!doc?.body||!runtime()?.store||!runtime()?.resolver)return false;
  calendarView=CALENDAR_VIEWS.has(requestedView)?requestedView:"day";if(MONTH_INDEX_VIEWS.has(requestedMonthView))calendarMonthView=requestedMonthView;else if(calendarView!=="picker")calendarMonthView="calendar";requestedView=null;requestedMonthView=null;calendarV384Panel="year";calendarV384Era="current";
  if(calendarView==="picker")pickerMonthId=(state()?.selectedDate||iso(new Date())).slice(0,7);
  installWeekCacheApi();seedCurrent();root()?.remove?.();
  const r=doc.createElement("section");r.id=ROOT_ID;r.dataset.aoAssetId=canonicalAssetIdForSurface("calendar")||"";r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");r.setAttribute("aria-label",L("Calendar","Calendrier"));r.innerHTML=`<style>${css()}</style><div class="aoCalModTop"><button type="button" data-cal-close aria-label="${L("Back to Home","Retour à l’accueil")}">${assetIcon("ao-ui-back")}</button><h1>${L("Calendar","Calendrier")}</h1><span aria-hidden="true"></span></div><main class="aoCalModBody" data-cal-body></main>`;doc.body.append(r);bind(r);paint();try{unsub?.()}catch{}unsub=runtime().store.subscribe(()=>queueMicrotask(paint));r.querySelector("[data-cal-close]")?.focus?.();
  const selected=state()?.selectedDate||iso(new Date());if(calendarView==="picker")requestPickerMonth();void revealDate(selected,{forceLoader:!weekReady(selected),prefetch:true});return true;
}
function status(){const selected=state()?.selectedDate||iso(new Date());return Object.freeze({version:VERSION,installed:true,open:Boolean(root()),owner:root()?.dataset?.aoCalendarOwner??null,view:calendarView,monthView:calendarMonthView,dataServiceReady:typeof runtime()?.resolver?.resolveDay==="function",selectedDate:state()?.selectedDate??null,resolutionDate:state()?.resolution?.date??null,weekReady:weekReady(selected),weekCacheSize:weekCache.size,pickerMonthId,monthReady:pickerMonthId?monthReady(pickerMonthId):false,monthLoading:pickerMonthId?monthLoads.has(pickerMonthId):false,monthCachedDays:pickerMonthId?monthGridIds(pickerMonthId).filter(x=>weekCache.has(x)).length:0,traditionalPanel:calendarV384Panel,disciplineEra:calendarV384Era,donorPanelActive:globalThis.AO_NAV_V25?.getState?.()?.panel==="calendar"})}
export function installCalendarBrowserOwner(win=globalThis){if(win.AO_CALENDAR_APP_V1)return win.AO_CALENDAR_APP_V1;const api=Object.freeze({version:VERSION,open,close,paint,status,select,setView,setMonthView,prepareMonth,monthGridIds,monthReady,monthIndexEntries});win.AO_CALENDAR_APP_V1=api;return api}
if(typeof window!=="undefined"&&typeof document!=="undefined"){installWeekCacheApi();installCalendarBrowserOwner(window);}
