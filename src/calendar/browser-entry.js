const VERSION="modular-calendar-v1";
const ROOT_ID="ao-calendar-modular-root";

const runtime=()=>globalThis.AO_RUNTIME_V8??null;
const state=()=>runtime()?.store?.getState?.()??null;
const cache=()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345??null;
const fr=()=>state()?.language==="fr";
const L=(en,frText)=>fr()?frText:en;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const dateOf=id=>new Date(`${id}T12:00:00`);
const displayDate=id=>{const m=String(id??"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:String(id??"")};
const parseDisplayDate=raw=>{const m=String(raw??"").trim().match(/^(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{4})$/);if(!m)return null;const d=+m[1],mo=+m[2],y=+m[3],x=new Date(y,mo-1,d,12);return x.getFullYear()===y&&x.getMonth()===mo-1&&x.getDate()===d?iso(x):null};
const addDays=(id,n)=>{const d=dateOf(id);d.setDate(d.getDate()+Number(n||0));return iso(d)};

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
function weekRail(selected){
  const A=cache(),ids=A?.weekIds?.(selected)??[],loc=fr()?"fr-FR":"en-GB";
  return ids.map(id=>{const r=A?.get?.(id),d=dateOf(id),ready=!!(r&&r.date===id&&r.status!=="failed");return `<button type="button" class="${id===selected?"active":""}" data-cal-date="${id}" data-ready="${ready?1:0}" title="${esc(r?titleOf(r):L("Not prepared","Non préparé"))}"><small>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</small><b>${d.getDate()}</b></button>`}).join("");
}
function bodyMarkup(){
  const s=state(),selected=s?.selectedDate||iso(new Date()),r=resolution();
  if(!r||r.status==="failed"||!r.day){
    return `<div class="aoCalModEmpty"><small>${L("CALENDAR","CALENDRIER")}</small><h2>${esc(displayDate(selected))}</h2><p>${L("This date could not be opened. Please try again or choose another date.","Cette date n’a pas pu être ouverte. Veuillez réessayer ou choisir une autre date.")}</p><button data-cal-today>${L("Return to today","Revenir à aujourd’hui")}</button></div>`;
  }
  const p=properOf(r),cm=commemorations(r),loc=fr()?"fr-FR":"en-GB";
  return `
    <header class="aoCalModHero"><small>${esc(dateOf(selected).toLocaleDateString(loc,{weekday:"long"}))} · ${esc(displayDate(selected))}</small><h2>${esc(titleOf(r))}</h2><div class="aoCalModMeta">${rankOf(r)?`<span>${esc(rankOf(r))}</span>`:""}${colourOf(r)?`<span>${esc(colourOf(r))}</span>`:""}${profileOf(r)?`<span>${esc(profileOf(r))}</span>`:""}</div><div class="aoCalModBadges">${badge("en",coverage(r,"en"))}${badge("fr",coverage(r,"fr"))}<span class="aoCalModBadge ${p?"ok":"warn"}">${p?L("Texts available","Textes disponibles"):L("Texts unavailable","Textes indisponibles")}</span></div></header>
    <section><h3>${L("Jump to date","Aller à une date")}</h3><div class="aoCalModJump"><input data-cal-input inputmode="numeric" value="${esc(displayDate(selected))}" aria-label="${L("Date in DD/MM/YYYY format","Date au format JJ/MM/AAAA")}"><input type="date" data-cal-native value="${esc(selected)}" aria-label="${L("Native date picker","Sélecteur de date")}"><button data-cal-today>${L("Today","Aujourd’hui")}</button><button class="primary" data-cal-go>${L("Go","Aller")}</button></div><div class="aoCalModError" data-cal-error aria-live="polite"></div></section>
    <section><h3>${L("Liturgical week","Semaine liturgique")}</h3><div class="aoCalModRail">${weekRail(selected)}</div><div class="aoCalModWeekNav"><button data-cal-shift="-7">← ${L("Previous week","Semaine précédente")}</button><button data-cal-shift="7">${L("Next week","Semaine suivante")} →</button></div></section>
    ${cm.length?`<section><h3>${L("Commemorations","Commémoraisons")}</h3><div class="aoCalModList">${cm.map(x=>`<article>${esc(x)}</article>`).join("")}</div></section>`:""}`;
}
function css(){
  return `#${ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14950;background:#080c12;color:#e9e4d9;overflow:auto;font-family:Georgia,serif}#${ROOT_ID} *{box-sizing:border-box}.aoCalModTop{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:rgba(8,12,18,.96);border-bottom:1px solid rgba(255,255,255,.12)}.aoCalModTop h1{margin:0;font-size:18px;font-weight:500}.aoCalModTop button,#${ROOT_ID} section button{min-height:44px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:#101821;color:#e9e4d9;padding:8px 12px}.aoCalModBody{max-width:720px;margin:0 auto;padding:18px 16px 44px}.aoCalModHero{padding:18px 0 20px}.aoCalModHero h2{font-size:28px;margin:8px 0}.aoCalModMeta,.aoCalModBadges{display:flex;flex-wrap:wrap;gap:7px}.aoCalModMeta span,.aoCalModBadge{font-size:12px;border:1px solid rgba(255,255,255,.13);border-radius:99px;padding:5px 8px}.aoCalModBadge.ok{border-color:rgba(180,220,180,.35)}.aoCalModBadge.warn{border-color:rgba(230,190,120,.35)}#${ROOT_ID} section{padding:16px 0;border-top:1px solid rgba(255,255,255,.1)}#${ROOT_ID} h3{font-size:16px;font-weight:500}.aoCalModJump{display:grid;grid-template-columns:1fr auto;gap:8px}.aoCalModJump input{min-height:44px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:#0d141c;color:#e9e4d9;padding:8px 10px}.aoCalModJump [data-cal-native]{max-width:155px}.aoCalModJump button{grid-column:auto}.aoCalModJump .primary{border-color:rgba(220,190,120,.45)}.aoCalModRail{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.aoCalModRail button{padding:7px 3px;min-width:0}.aoCalModRail button.active{outline:2px solid currentColor}.aoCalModRail small,.aoCalModRail b{display:block}.aoCalModWeekNav{display:flex;justify-content:space-between;gap:8px;margin-top:10px}.aoCalModList{display:grid;gap:8px}.aoCalModList article{padding:10px;border:1px solid rgba(255,255,255,.1);border-radius:10px}.aoCalModError{min-height:20px;margin-top:8px;font-size:13px;color:#e5c48e}@media(max-width:480px){.aoCalModBody{padding-top:8px}.aoCalModHero h2{font-size:24px}.aoCalModJump{grid-template-columns:1fr}.aoCalModJump [data-cal-native]{max-width:none}.aoCalModRail{gap:3px}.aoCalModRail button{padding:6px 1px;font-size:12px}}`;
}
let unsub=null;
function root(){return globalThis.document?.getElementById?.(ROOT_ID)??null}
function paint(){const r=root();if(!r)return false;const body=r.querySelector("[data-cal-body]");if(!body)return false;body.innerHTML=bodyMarkup();r.dataset.aoCalendarOwner=VERSION;return true}
function syncShell(surface){globalThis.AO_APP_SHELL_V1?.syncSurface?.(surface)}
function close({surface="home"}={}){root()?.remove?.();try{unsub?.()}catch{}unsub=null;syncShell(surface);try{globalThis.AO_GLOBAL_RIBBON_V4323?.setActive?.(surface)}catch{}return true}
async function waitForCache({attempts=80,delay=50}={}){
  for(let i=0;i<attempts;i+=1){
    const A=cache();
    if(typeof A?.revealDate==="function")return A;
    await new Promise(resolve=>setTimeout(resolve,delay));
  }
  return null;
}
async function select(id,{closeAfter=false}={}){
  const target=String(id||"");if(!target)return false;
  const A=await waitForCache();if(!A)return false;
  try{const ok=await A.revealDate(target,{forceLoader:true,prefetch:true});if(ok&&state()?.selectedDate===target){paint();if(closeAfter)close({surface:"home"});return true}return false}catch(error){console.error("Modular Calendar date navigation failed",error);return false}
}
function bind(r){
  r.addEventListener("click",event=>{
    const closeButton=event.target.closest?.("[data-cal-close]");if(closeButton){event.preventDefault();close();return}
    const day=event.target.closest?.("[data-cal-date]");if(day){event.preventDefault();void select(day.dataset.calDate);return}
    const shift=event.target.closest?.("[data-cal-shift]");if(shift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(shift.dataset.calShift||0)));return}
    const today=event.target.closest?.("[data-cal-today]");if(today){event.preventDefault();void select(iso(new Date()));return}
    const go=event.target.closest?.("[data-cal-go]");if(go){event.preventDefault();const input=r.querySelector("[data-cal-input]"),err=r.querySelector("[data-cal-error]"),id=parseDisplayDate(input?.value);if(!id){if(err)err.textContent=L("Enter a valid date as DD/MM/YYYY.","Saisissez une date valide au format JJ/MM/AAAA.");return}void select(id,{closeAfter:true}).then(ok=>{if(!ok&&err)err.textContent=L("This date could not be opened. Please try again.","Cette date n’a pas pu être ouverte. Veuillez réessayer.")});return}
  });
  r.addEventListener("change",event=>{const native=event.target.closest?.("[data-cal-native]");if(native?.value)void select(native.value)});
  r.addEventListener("keydown",event=>{const input=event.target.closest?.("[data-cal-input]");if(input&&event.key==="Enter"){event.preventDefault();const id=parseDisplayDate(input.value);if(id)void select(id,{closeAfter:true})}});
}
function open(){
  const doc=globalThis.document;if(!doc?.body||!runtime()?.store)return false;
  root()?.remove?.();
  const r=doc.createElement("section");r.id=ROOT_ID;r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");r.setAttribute("aria-label",L("Calendar","Calendrier"));r.innerHTML=`<style>${css()}</style><div class="aoCalModTop"><button type="button" data-cal-close aria-label="${L("Back to Home","Retour à l’accueil")}">←</button><h1>${L("Calendar","Calendrier")}</h1><span aria-hidden="true"></span></div><main class="aoCalModBody" data-cal-body></main>`;doc.body.append(r);bind(r);paint();try{unsub?.()}catch{}unsub=runtime().store.subscribe(()=>queueMicrotask(paint));void waitForCache().then(A=>{if(A&&root()===r)paint()});r.querySelector("[data-cal-close]")?.focus?.();return true;
}
function status(){return Object.freeze({version:VERSION,installed:true,open:Boolean(root()),owner:root()?.dataset?.aoCalendarOwner??null,dataServiceReady:typeof cache()?.revealDate==="function",selectedDate:state()?.selectedDate??null,resolutionDate:state()?.resolution?.date??null,donorPanelActive:globalThis.AO_NAV_V25?.getState?.()?.panel==="calendar"})}
export function installCalendarBrowserOwner(win=globalThis){if(win.AO_CALENDAR_APP_V1)return win.AO_CALENDAR_APP_V1;const api=Object.freeze({version:VERSION,open,close,paint,status,select});win.AO_CALENDAR_APP_V1=api;return api}
if(typeof window!=="undefined"&&typeof document!=="undefined")installCalendarBrowserOwner(window);
