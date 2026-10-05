import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

const VERSION="modular-calendar-v1";
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
    const rr=A?.get?.(id),d=dateOf(id),ready=!!(rr&&rr.date===id&&rr.status!=="failed"),name=rr?titleOf(rr):L("Not prepared","Non préparé"),rank=rr?rankOf(rr):"";
    return `<button type="button" class="aoCalObservance ${id===selected?"active":""}" data-cal-date="${id}" data-ready="${ready?1:0}" style="--ao-cal-liturgical:${esc(rr?liturgicalAccent(rr):"#59626c")}" title="${esc(name)}" ${id===selected?'aria-current="date"':""}>
      <span class="aoCalObsDate"><small>${esc(d.toLocaleDateString(loc,{weekday:"short"}))}</small><b>${d.getDate()}</b></span>
      <span class="aoCalObsText"><strong>${esc(name)}</strong>${rank?`<small>${esc(rank)}</small>`:""}</span>
    </button>`;
  }).join("");
}
function bodyMarkup(){
  const s=state(),selected=s?.selectedDate||iso(new Date()),r=resolution();
  if(!r||r.status==="failed"||!r.day){
    return `<div class="aoCalModEmpty"><small>${L("CALENDAR","CALENDRIER")}</small><h2>${esc(displayDate(selected))}</h2><p>${L("This date could not be opened. Please try again or choose another date.","Cette date n’a pas pu être ouverte. Veuillez réessayer ou choisir une autre date.")}</p><button data-cal-today>${L("Return to today","Revenir à aujourd’hui")}</button></div>`;
  }
  const cm=commemorations(r),loc=fr()?"fr-FR":"en-GB",accent=liturgicalAccent(r),season=seasonOf(r);
  return `
    <section class="aoCalSacredTime" style="--ao-cal-liturgical:${esc(accent)}">
      ${yearWheel(selected,r)}
      <div class="aoCalIdentity">
        <small class="aoCalKicker">${esc(dateOf(selected).toLocaleDateString(loc,{weekday:"long"}))} · ${esc(displayDate(selected))}</small>
        <h2>${esc(titleOf(r))}</h2>
        <div class="aoCalIdentityMeta">${rankOf(r)?`<span>${esc(rankOf(r))}</span>`:""}${colourOf(r)?`<span>${esc(colourOf(r))}</span>`:""}${season?`<span>${esc(season)}</span>`:""}${profileOf(r)?`<span>${esc(profileOf(r))}</span>`:""}</div>
        ${sourceStatus(r)}
      </div>
    </section>
    <section class="aoCalWeekSection">
      <div class="aoCalSectionHead"><div><small>${L("IN CONTEXT","EN CONTEXTE")}</small><h3>${L("Liturgical week","Semaine liturgique")}</h3></div><button type="button" class="aoCalTodayQuiet" data-cal-today>${L("Today","Aujourd’hui")}</button></div>
      <div class="aoCalModRail">${weekRail(selected)}</div>
      <div class="aoCalModWeekNav"><button data-cal-shift="-7">${assetIcon("ao-ui-previous")} <span>${L("Previous","Précédente")}</span></button><button data-cal-shift="7"><span>${L("Next","Suivante")}</span> ${assetIcon("ao-ui-next")}</button></div>
    </section>
    ${cm.length?`<section class="aoCalCommemorations"><div class="aoCalSectionHead"><div><small>${L("ALSO OBSERVED","ÉGALEMENT")}</small><h3>${L("Commemorations","Commémorations")}</h3></div></div><div class="aoCalModList">${cm.map(x=>`<article><span aria-hidden="true"></span><strong>${esc(x)}</strong></article>`).join("")}</div></section>`:""}
    <details class="aoCalNavigate"><summary>${L("Go to another date","Aller à une autre date")}</summary><div class="aoCalModJump"><input data-cal-input inputmode="numeric" value="${esc(displayDate(selected))}" aria-label="${L("Date in DD/MM/YYYY format","Date au format JJ/MM/AAAA")}"><button class="primary" data-cal-go>${L("Go","Aller")}</button></div><div class="aoCalModError" data-cal-error aria-live="polite"></div></details>`;
}
function css(){
  return `#${ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14950;background:radial-gradient(circle at 50% -10%,rgba(126,103,69,.11),transparent 34%),#080c12;color:#e9e4d9;overflow:auto;overscroll-behavior:contain;font-family:Georgia,"Times New Roman",serif}#${ROOT_ID} *{box-sizing:border-box}.aoCalModTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:center;gap:8px;padding:calc(8px + var(--safe-top,0px)) 12px 8px;background:linear-gradient(180deg,rgba(8,12,18,.985),rgba(8,12,18,.91));backdrop-filter:blur(18px);border-bottom:1px solid rgba(226,214,190,.1)}.aoCalModTop h1{margin:0;font-size:17px;font-weight:500;letter-spacing:.025em;text-align:center}.aoCalModTop>span{width:48px;height:48px}.aoCalModTop button,#${ROOT_ID} section button,#${ROOT_ID} details button{min-height:44px;border:1px solid rgba(232,221,201,.13);border-radius:999px;background:rgba(16,24,33,.76);color:#e9e4d9;padding:8px 12px}.aoCalModTop button{width:48px;height:48px;padding:0}.aoCalModBody{width:min(760px,100%);margin:0 auto;padding:8px 14px 48px}.aoCalSacredTime{display:grid;grid-template-columns:180px minmax(0,1fr);gap:22px;align-items:center;padding:24px 4px 28px;position:relative}.aoCalSacredTime:after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ao-cal-liturgical) 62%,transparent),transparent)}.aoCalYearWheel{width:168px;aspect-ratio:1;position:relative;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at center,#0b1118 0 47%,transparent 48%),conic-gradient(from -90deg,color-mix(in srgb,var(--ao-cal-liturgical) 54%,#202934) 0 var(--ao-cal-year-angle),rgba(255,255,255,.065) var(--ao-cal-year-angle) 360deg);box-shadow:inset 0 0 0 1px rgba(235,225,208,.1),0 18px 50px rgba(0,0,0,.2)}.aoCalYearWheel:before{content:"";position:absolute;inset:12px;border-radius:50%;border:1px solid rgba(235,225,208,.1)}.aoCalYearTicks{position:absolute;inset:2px;border-radius:50%;background:repeating-conic-gradient(from -90deg,rgba(238,227,207,.44) 0 1deg,transparent 1deg 30deg);mask:radial-gradient(transparent 0 88%,#000 89% 100%)}.aoCalYearMarker{position:absolute;inset:0;transform:rotate(var(--ao-cal-year-angle));pointer-events:none}.aoCalYearMarker:before{content:"";position:absolute;left:50%;top:-3px;width:8px;height:8px;border-radius:50%;transform:translateX(-50%);background:#e8decc;box-shadow:0 0 0 4px color-mix(in srgb,var(--ao-cal-liturgical) 40%,transparent),0 0 18px color-mix(in srgb,var(--ao-cal-liturgical) 70%,transparent)}.aoCalYearCore{position:relative;z-index:1;width:96px;text-align:center;display:grid;gap:1px}.aoCalYearCore small{font:600 9px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#aaa18f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aoCalYearCore strong{font-size:40px;font-weight:400;line-height:1;color:#f0e8da;margin-top:4px}.aoCalYearCore span{font-size:11px;color:#a9afb5;text-transform:capitalize}.aoCalIdentity{min-width:0}.aoCalKicker,.aoCalSectionHead small{display:block;font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--ao-cal-liturgical) 75%,#b9b1a2)}.aoCalIdentity h2{font-size:31px;line-height:1.08;font-weight:400;margin:8px 0 12px;letter-spacing:-.02em}.aoCalIdentityMeta{display:flex;flex-wrap:wrap;gap:0;color:#b9b2a7}.aoCalIdentityMeta span{font-size:12px}.aoCalIdentityMeta span+span:before{content:"·";padding:0 7px;color:#68717a}.aoCalSourceLine{display:flex;gap:7px;align-items:center;margin-top:13px;color:#777f87;font:600 9px/1 system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase}.aoCalSourceLine span.ok{color:#91a994}.aoCalSourceLine span.warn{color:#b19074}.aoCalWeekSection,.aoCalCommemorations{padding:18px 0;border-bottom:1px solid rgba(235,225,208,.085)}.aoCalSectionHead{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:12px}.aoCalSectionHead h3{font-size:19px;font-weight:400;margin:3px 0 0}.aoCalTodayQuiet{border:0!important;background:transparent!important;color:#b9b1a2!important;padding:4px 0!important;min-height:36px!important}.aoCalModRail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(126px,1fr);gap:7px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 1px 7px}.aoCalModRail::-webkit-scrollbar{display:none}.aoCalObservance{scroll-snap-align:center!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;gap:9px!important;align-items:center!important;min-height:70px!important;border-radius:12px!important;text-align:left!important;padding:9px!important;background:linear-gradient(160deg,color-mix(in srgb,var(--ao-cal-liturgical) 7%,#0e161f),#0c131b)!important;position:relative;overflow:hidden}.aoCalObservance:before{content:"";position:absolute;inset:0 auto 0 0;width:2px;background:color-mix(in srgb,var(--ao-cal-liturgical) 72%,#8f7d5e);opacity:.55}.aoCalObservance.active{border-color:color-mix(in srgb,var(--ao-cal-liturgical) 68%,#d8cbaa)!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--ao-cal-liturgical) 24%,transparent) inset}.aoCalObsDate{text-align:center;border-right:1px solid rgba(235,225,208,.08);padding-right:7px}.aoCalObsDate small,.aoCalObsDate b{display:block}.aoCalObsDate small{font:600 9px/1 system-ui,sans-serif;text-transform:uppercase;color:#858d95}.aoCalObsDate b{font-size:19px;font-weight:400;margin-top:4px}.aoCalObsText{min-width:0}.aoCalObsText strong{display:block;font-size:12px;font-weight:500;line-height:1.16;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoCalObsText small{display:block;margin-top:5px;color:#838b92;font:500 9px/1.1 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aoCalModWeekNav{display:flex;justify-content:space-between;gap:8px;margin-top:4px}.aoCalModWeekNav button{min-height:38px!important;border:0!important;background:transparent!important;color:#999f9f!important;padding:5px 1px!important}.aoCalModWeekNav .aoCalAssetIcon{font-size:.8em}.aoCalModList{display:grid;gap:0}.aoCalModList article{display:grid;grid-template-columns:8px 1fr;gap:10px;align-items:center;padding:11px 2px;border-top:1px solid rgba(235,225,208,.07)}.aoCalModList article:first-child{border-top:0}.aoCalModList article span{width:5px;height:5px;border-radius:50%;background:var(--ao-cal-liturgical,#8f7d5e);opacity:.72}.aoCalModList article strong{font-size:13px;font-weight:400}.aoCalNavigate{margin:18px 0 8px;border-top:1px solid rgba(235,225,208,.08);padding-top:14px}.aoCalNavigate summary{cursor:pointer;list-style:none;color:#858d95;font:600 10px/1.3 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}.aoCalNavigate summary::-webkit-details-marker{display:none}.aoCalModJump{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:10px}.aoCalModJump input{min-height:44px;border:1px solid rgba(235,225,208,.13);border-radius:10px;background:#0d141c;color:#e9e4d9;padding:8px 10px}.aoCalModJump .primary{border-color:rgba(205,179,119,.36)!important}.aoCalModError{min-height:20px;margin-top:7px;font-size:12px;color:#d2aa7b}.aoCalModEmpty{padding:50px 8px;text-align:center}.aoCalModEmpty small{font:600 10px/1 system-ui,sans-serif;letter-spacing:.14em;color:#858d95}.aoCalModEmpty h2{font-size:34px;font-weight:400}.aoCalModEmpty p{color:#9da5aa;line-height:1.5}@media(max-width:560px){.aoCalModBody{padding:2px 12px 36px}.aoCalSacredTime{grid-template-columns:138px minmax(0,1fr);gap:14px;padding:18px 0 22px}.aoCalYearWheel{width:132px}.aoCalYearWheel:before{inset:10px}.aoCalYearCore{width:76px}.aoCalYearCore strong{font-size:34px}.aoCalYearCore span{font-size:9px}.aoCalIdentity h2{font-size:24px}.aoCalIdentityMeta span{font-size:11px}.aoCalSourceLine{gap:5px;font-size:8px}.aoCalModRail{grid-auto-columns:132px;margin-right:-12px;padding-right:12px}.aoCalSectionHead{margin-bottom:9px}.aoCalWeekSection,.aoCalCommemorations{padding:15px 0}.aoCalModTop{grid-template-columns:44px 1fr 44px}.aoCalModTop button,.aoCalModTop>span{width:44px;height:44px}}`;
}
let unsub=null;
function root(){return globalThis.document?.getElementById?.(ROOT_ID)??null}
function paint(){const r=root();if(!r)return false;const body=r.querySelector("[data-cal-body]");if(!body)return false;body.innerHTML=bodyMarkup();r.dataset.aoCalendarOwner=VERSION;requestAnimationFrame(()=>r.querySelector("[data-cal-date][aria-current=\"date\"]")?.scrollIntoView?.({block:"nearest",inline:"center",behavior:"auto"}));return true}
function syncShell(surface){globalThis.AO_APP_SHELL_V1?.syncSurface?.(surface)}
function close({surface="home"}={}){root()?.remove?.();try{unsub?.()}catch{}unsub=null;syncShell(surface);try{globalThis.AO_GLOBAL_RIBBON_V4323?.setActive?.(surface)}catch{}return true}
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
  const controller=dateController();if(typeof controller?.changeDate!=="function")return false;
  try{
    controller.changeDate(target);
    const resolved=await waitForResolution(target),ok=!!resolved&&resolved.status!=="failed";
    paint();
    if(ok&&closeAfter)close({surface:"home"});
    return ok;
  }catch(error){console.error("Modular Calendar date navigation failed",error);return false}
}
function bind(r){
  r.addEventListener("click",event=>{
    const closeButton=event.target.closest?.("[data-cal-close]");if(closeButton){event.preventDefault();close();return}
    const day=event.target.closest?.("[data-cal-date]");if(day){event.preventDefault();void select(day.dataset.calDate);return}
    const shift=event.target.closest?.("[data-cal-shift]");if(shift){event.preventDefault();void select(addDays(state()?.selectedDate||iso(new Date()),Number(shift.dataset.calShift||0)));return}
    const today=event.target.closest?.("[data-cal-today]");if(today){event.preventDefault();void select(iso(new Date()));return}
    const go=event.target.closest?.("[data-cal-go]");if(go){event.preventDefault();const input=r.querySelector("[data-cal-input]"),err=r.querySelector("[data-cal-error]"),id=parseDisplayDate(input?.value);if(!id){if(err)err.textContent=L("Enter a valid date as DD/MM/YYYY.","Saisissez une date valide au format JJ/MM/AAAA.");return}void select(id,{closeAfter:true}).then(ok=>{if(!ok&&err)err.textContent=L("This date could not be opened. Please try again.","Cette date n’a pas pu être ouverte. Veuillez réessayer.")});return}
  });
  r.addEventListener("keydown",event=>{const input=event.target.closest?.("[data-cal-input]");if(input&&event.key==="Enter"){event.preventDefault();const id=parseDisplayDate(input.value);if(id)void select(id,{closeAfter:true})}});
}
function open(){
  const doc=globalThis.document;if(!doc?.body||!runtime()?.store)return false;
  root()?.remove?.();
  const r=doc.createElement("section");r.id=ROOT_ID;r.dataset.aoAssetId=canonicalAssetIdForSurface("calendar")||"";r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");r.setAttribute("aria-label",L("Calendar","Calendrier"));r.innerHTML=`<style>${css()}</style><div class="aoCalModTop"><button type="button" data-cal-close aria-label="${L("Back to Home","Retour à l’accueil")}">${assetIcon("ao-ui-back")}</button><h1>${L("Calendar","Calendrier")}</h1><span aria-hidden="true"></span></div><main class="aoCalModBody" data-cal-body></main>`;doc.body.append(r);bind(r);paint();try{unsub?.()}catch{}unsub=runtime().store.subscribe(()=>queueMicrotask(paint));r.querySelector("[data-cal-close]")?.focus?.();return true;
}
function status(){return Object.freeze({version:VERSION,installed:true,open:Boolean(root()),owner:root()?.dataset?.aoCalendarOwner??null,dataServiceReady:typeof dateController()?.changeDate==="function",selectedDate:state()?.selectedDate??null,resolutionDate:state()?.resolution?.date??null,donorPanelActive:globalThis.AO_NAV_V25?.getState?.()?.panel==="calendar"})}
export function installCalendarBrowserOwner(win=globalThis){if(win.AO_CALENDAR_APP_V1)return win.AO_CALENDAR_APP_V1;const api=Object.freeze({version:VERSION,open,close,paint,status,select});win.AO_CALENDAR_APP_V1=api;return api}
if(typeof window!=="undefined"&&typeof document!=="undefined")installCalendarBrowserOwner(window);
