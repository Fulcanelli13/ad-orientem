/*
 * Calendar first-use route owner.
 * Home keeps a small, stable API. The complete 1962 week cache, liturgical
 * calendar intelligence, pilgrimage associations and picker presentation are
 * imported only on first actual Calendar interaction.
 */
export const VERSION="modular-calendar-v2-liturgical-year";
let pending=null,loaded=false,lastError=null;
let requestedView=null,requestedMonthView=null;
const facadeKey="__aoCalendarLazyPlaceholder";
const runtime=win=>win?.AO_CALENDAR_APP_V1?.[facadeKey]?null:win?.AO_CALENDAR_APP_V1;
const activeCache=win=>win?.AO_CALENDAR_WEEK_CACHE_V4345?.[facadeKey]?null:win?.AO_CALENDAR_WEEK_CACHE_V4345;
export async function ensureCalendarRuntime(win=globalThis){
  const ready=runtime(win);
  if(ready){loaded=true;return ready;}
  if(!pending){
    const loading=win?.AO_LOADING_DIRECTOR_V1?.begin?.("calendar");
    pending=import("./calendar-runtime.js").then(mod=>{
      const api=mod.installCalendarBrowserOwner(win);
      if(!api||api[facadeKey])throw Error("Canonical Calendar owner failed to install");
      loaded=true;lastError=null;return api;
    }).catch(err=>{lastError=String(err?.message??err);pending=null;throw err}).finally(()=>loading?.end?.());
  }
  return pending;
}
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
function startOfWeek(id){const d=new Date(String(id).slice(0,10)+"T12:00:00");d.setDate(d.getDate()-d.getDay());return d}
function weekIds(id){const d=startOfWeek(id);return Array.from({length:7},(_,i)=>{const n=new Date(d);n.setDate(d.getDate()+i);return iso(n)})}
function monthGridIds(monthId){const [y,m]=String(monthId||"").split("-").map(Number);if(!y||m<1||m>12)return [];const d=new Date(y,m-1,1,12);d.setDate(1-d.getDay());return Array.from({length:42},(_,i)=>{const n=new Date(d);n.setDate(d.getDate()+i);return iso(n)})}
const invoke=async(win,name,...args)=>{
 try{const real=await ensureCalendarRuntime(win);return real[name]?.(...args)??false}
 catch(error){try{win.console?.error?.("Calendar module unavailable",error)}catch{};return false}
};
function installCacheProxy(win){
 const c=win?.AO_CALENDAR_WEEK_CACHE_V4345;
 if(c&&!c[facadeKey])return c;
 if(c?.[facadeKey])return c;
 const real=()=>activeCache(win);
 const call=(name,...args)=>{const v=real();return v?.[name]?.(...args)};
 const lazy=(name,...args)=>ensureCalendarRuntime(win).then(()=>call(name,...args));
 const cache=Object.freeze({
  [facadeKey]:true,
  version:"43.45-modular-exact",
  open:()=>lazy("open"),
  revealDate:(...args)=>lazy("revealDate",...args),
  prepareWeek:(...args)=>lazy("prepareWeek",...args),
  weekIds:id=>call("weekIds",id)??weekIds(id),
  weekReady:id=>call("weekReady",id)??false,
  cancel:()=>call("cancel")??true,
  inspect:()=>call("inspect")??Object.freeze({version:"43.45-modular-exact",weekReady:false,cachedDates:[],activeLoads:[],activeDayLoads:[]}),
  cacheSize:()=>call("cacheSize")??0,
  get:id=>call("get",id)??null,
  invalidate:id=>call("invalidate",id)??false,
  retryDate:id=>lazy("retryDate",id),
  retryWeek:id=>lazy("retryWeek",id),
 });
 win.AO_CALENDAR_WEEK_CACHE_V4345=cache;
 return cache;
}
export function installCalendarBrowserOwner(win=globalThis){
 if(win.AO_CALENDAR_APP_V1)return win.AO_CALENDAR_APP_V1;
 installCacheProxy(win);
 const real=()=>runtime(win);
 const status=()=>real()?.status?.()??Object.freeze({
  version:VERSION,installed:true,open:false,owner:null,
  loaded,loading:!!pending&&!loaded,loadError:lastError,
  dataServiceReady:typeof win?.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  weekReady:false,weekCacheSize:0,selectedDate:win?.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate??null
 });
 const api=Object.freeze({
  [facadeKey]:true,
  version:VERSION,
  open:async()=>{
   try{
     const owner=await ensureCalendarRuntime(win);
     if(requestedView)owner.setView?.(requestedView);
     if(requestedMonthView)owner.setMonthView?.(requestedMonthView);
     requestedView=requestedMonthView=null;
     const opened=await owner.open();
     return opened===true||opened?.ok===true;
   }catch(error){try{win.console?.error?.("Calendar first-use import failed",error)}catch{};return false}
  },
  close:opts=>real()?.close?.(opts)??true,
  status,
  paint:(...a)=>real()?.paint?.(...a)??false,
  select:(...a)=>invoke(win,"select",...a),
  setView:(view,...a)=>{requestedView=view;return real()?.setView?.(view,...a)??true},
  setMonthView:(view,...a)=>{requestedMonthView=view;return real()?.setMonthView?.(view,...a)??true},
  prepareMonth:(...a)=>invoke(win,"prepareMonth",...a),
  monthGridIds:id=>real()?.monthGridIds?.(id)??monthGridIds(id),
  monthReady:id=>real()?.monthReady?.(id)??false,
  monthIndexEntries:(...a)=>real()?.monthIndexEntries?.(...a)??[],
 });
 win.AO_CALENDAR_APP_V1=api;
 return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined"){
 installCacheProxy(window);
 installCalendarBrowserOwner(window);
}
