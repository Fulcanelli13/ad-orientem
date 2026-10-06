import "./traditional-pray-styles.js";
import {
  SACRED_HYMNS_V381,
  MORNING_PRAYER_SEQUENCE_V381,
  EVENING_PRAYER_SEQUENCE_V381,
  TRADITIONAL_PRAY_SOURCES_V381,
} from "./traditional-pray-data.js";
import {
  canonicalAssetIdForPrayRoute,
  getCanonicalAsset,
  resolveCanonicalAssetUrl,
} from "../assets/asset-registry.js";

const VERSION="38.1-modular-pray-extraction";
const ROUTES=Object.freeze({
  "pray.morning_evening":Object.freeze({id:"pray.morning_evening",type:"module",domain:"pray",category:"daily-prayer",title:"Morning & Evening Prayer"}),
  "pray.sacred_hymns":Object.freeze({id:"pray.sacred_hymns",type:"module",domain:"pray",category:"traditional-devotion",title:"Sacred Hymns & Canticles"}),
  "pray.holy_name_litany":Object.freeze({id:"pray.holy_name_litany",type:"module",domain:"pray",category:"traditional-devotion",title:"Litany of the Holy Name"}),
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
const data=()=>globalThis.AO_PRAY_CANONICAL_DATA_V435930||{prayers:{}};
const isFr=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||String(document.documentElement.lang||"").toLowerCase().startsWith("fr");
const L=(en,fr)=>isFr()?(fr||en):en;
const mount=()=>document.querySelector("#aoPray435930 .aoP435930Mount");
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
  return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-tp381-back aria-label="${esc(L("Back","Retour"))}">←</button><div><small>${esc(L("PRAY","PRIER"))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:""}</div><button type="button" class="aoP435930Close" data-tp381-close aria-label="${esc(L("Close","Fermer"))}">×</button></header>`;
}
function source(label,url){
  return `<details class="aoTP381Source"><summary>${esc(L("Source / provenance","Source / provenance"))} · ${esc(label)}</summary><p><a href="${esc(url)}" target="_blank" rel="noopener">${esc(L("Open source","Ouvrir la source"))} ↗</a></p></details>`;
}
function prayerTitle(p,id){
  if(!p)return id;
  return isFr()?(p.titleFr||p.title||id):(p.title||id);
}
function prayerCard(id){
  const p=data().prayers?.[id];
  if(!p)return `<div class="aoTP381Fail">${esc(L("This canonical prayer is unavailable in the current corpus.","Cette prière canonique n’est pas disponible dans le corpus actuel."))}</div>`;
  const vern=isFr()?(p.fr||p.en||p.la):(p.en||p.fr||p.la),latin=p.la||"",both=!!(vern&&latin);
  const prov=p.provenance||{};
  return `<article class="aoTP381PrayerCard"><h3>${esc(prayerTitle(p,id))}</h3>${both?`<button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(latin)}</span></button>`:`<div class="aoTP381Reader">${nl(vern||latin)}</div>`}${source(prov.work||p.title||id,prov.url||p.sourceUrl||TRADITIONAL_PRAY_SOURCES_V381.baltimore)}</article>`;
}
function prayerRows(rows){
  return `<div class="aoTP381PrayerList">${rows.map(([id,title,note])=>`<button type="button" ${id.includes(".")?`data-tp381-route="${esc(id)}"`:`data-tp381-prayer="${esc(id)}"`}><span><b>${esc(title)}</b><small>${esc(note)}</small></span><i aria-hidden="true">→</i></button>`).join("")}</div>`;
}

let BASE_OPEN=null,BASE_CLOSE=null,OPEN_OPTS={};
let S={route:"pray.morning_evening",screen:"module",daypart:"morning",hymn:"te_deum",hymnLang:"en",prayerId:null,holyNameText:"",holyNameLoading:false,holyNameError:""};

function renderMorningEvening(){
  const rows=S.daypart==="evening"?EVENING_PRAYER_SEQUENCE_V381:MORNING_PRAYER_SEQUENCE_V381;
  return `${head(L("Morning & Evening Prayer","Prières du matin & du soir"),L("Historical lay prayer-book sequence","Séquence historique de livre de prières laïc"))}<main class="aoP435930Body"><section class="aoTP381Hero"><small>${esc(L("DAILY PRAYER","PRIÈRE QUOTIDIENNE"))}</small><h2>${esc(L("Source-led morning and evening prayer","Prière du matin et du soir guidée par la source"))}</h2><p>${esc(L("Derived from the Baltimore Manual’s lay morning and evening sequences. Ad Orientem reuses already sourced prayers rather than composing a replacement devotion.","Dérivée des séquences laïques du Baltimore Manual. Ad Orientem réutilise les prières déjà sourcées au lieu de composer une dévotion de remplacement."))}</p></section><div class="aoTP381Tabs"><button type="button" data-tp381-daypart="morning" class="${S.daypart==="morning"?"active":""}">${esc(L("Morning","Matin"))}</button><button type="button" data-tp381-daypart="evening" class="${S.daypart==="evening"?"active":""}">${esc(L("Evening","Soir"))}</button></div>${prayerRows(rows)}${source("Baltimore Manual · Morning Prayers",TRADITIONAL_PRAY_SOURCES_V381.morning)}${source("Baltimore Manual · Evening Prayers",TRADITIONAL_PRAY_SOURCES_V381.evening)}</main>`;
}
function renderHymns(){
  const h=SACRED_HYMNS_V381[S.hymn]||SACRED_HYMNS_V381.te_deum;
  return `${head(L("Sacred Hymns & Canticles","Hymnes & cantiques sacrés"),"Te Deum · Veni Creator · Ave Maris Stella")}<main class="aoP435930Body"><section class="aoTP381Hero"><small>${esc(L("SOURCE-LOCKED","VERROUILLÉ SUR LA SOURCE"))}</small><h2>${esc(h.title)}</h2><p>${esc(h.subtitle)}</p></section><div class="aoTP381Tabs"><button type="button" data-tp381-hymn="te_deum" class="${S.hymn==="te_deum"?"active":""}">Te Deum</button><button type="button" data-tp381-hymn="veni_creator" class="${S.hymn==="veni_creator"?"active":""}">Veni Creator</button><button type="button" data-tp381-hymn="ave_maris_stella" class="${S.hymn==="ave_maris_stella"?"active":""}">Ave Maris Stella</button></div><div class="aoTP381Tabs"><button type="button" data-tp381-hymn-lang="en" class="${S.hymnLang==="en"?"active":""}">English</button><button type="button" data-tp381-hymn-lang="la" class="${S.hymnLang==="la"?"active":""}">Latin</button></div><div class="aoTP381Reader">${nl(h[S.hymnLang]||h.en||h.la)}</div>${source("The Daily Prayer-Book · Burns & Oates · 1882",TRADITIONAL_PRAY_SOURCES_V381.dailybook)}</main>`;
}
async function ensureHolyName(){
  if(S.holyNameText||S.holyNameLoading)return;
  S.holyNameLoading=true;S.holyNameError="";render();
  try{
    const key="ao2:v381:holy-name-en";
    try{const cached=localStorage.getItem(key);if(cached){S.holyNameText=cached;S.holyNameLoading=false;render();return}}catch{}
    const page="The_Catholic's_pocket_prayer-book/The_Litany_of_the_Holy_Name_of_Jesus";
    const api="https://en.wikisource.org/w/api.php?action=parse&format=json&origin=*&prop=text&page="+encodeURIComponent(page);
    const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);let res;
    try{res=await fetch(api,{signal:ac.signal})}finally{clearTimeout(tm)}
    if(!res.ok)throw new Error("HTTP "+res.status);
    const j=await res.json(),html=j?.parse?.text?.["*"]||j?.parse?.text;
    if(!html)throw new Error("No text");
    const doc=new DOMParser().parseFromString(html,"text/html");
    doc.querySelectorAll("style,script,table,.mw-editsection,.navbox,.metadata,.sistersitebox").forEach(n=>n.remove());
    let txt=((doc.querySelector(".mw-parser-output")||doc.body).innerText||"").replace(/\n{3,}/g,"\n\n").trim();
    const ix=txt.search(/Lord, have mercy|Kyrie/i);if(ix>0)txt=txt.slice(ix);
    if(!txt)throw new Error("No litany text");
    S.holyNameText=txt;S.holyNameLoading=false;try{localStorage.setItem(key,txt)}catch{}render();
  }catch(e){S.holyNameLoading=false;S.holyNameError=String(e?.message||e);render()}
}
function renderHolyName(){
  if(!S.holyNameText&&!S.holyNameLoading&&!S.holyNameError)queueMicrotask(ensureHolyName);
  const body=S.holyNameText?`<div class="aoTP381Reader">${nl(S.holyNameText)}</div>`:S.holyNameLoading?`<p class="aoP435930Loading">${esc(L("Loading the historical source text…","Chargement du texte historique…"))}</p>`:`<div class="aoTP381Fail">${esc(L("The source text could not be loaded. Ad Orientem will not substitute an invented litany; use the source link below.","Le texte source n’a pas pu être chargé. Ad Orientem ne le remplacera pas par des litanies inventées ; utilisez le lien source ci-dessous."))}</div>`;
  return `${head(L("Litany of the Holy Name of Jesus","Litanies du Saint Nom de Jésus"),L("Traditional · approved historical form","Traditionnelle · forme historique approuvée"))}<main class="aoP435930Body"><section class="aoTP381Hero"><small>${esc(L("HISTORICAL WITNESS","TÉMOIN HISTORIQUE"))}</small><h2>${esc(L("Litany of the Holy Name","Litanies du Saint Nom"))}</h2><p>${esc(L("The full wording is loaded directly from the public-domain witness so the app does not maintain a second unsourced transcription.","Le texte intégral est chargé directement depuis le témoin du domaine public afin que l’application ne maintienne pas une seconde transcription non sourcée."))}</p></section>${body}${source("The Catholic’s Pocket Prayer-Book · Litany of the Holy Name",TRADITIONAL_PRAY_SOURCES_V381.holyname)}</main>`;
}
function renderPrayer(){
  const p=data().prayers?.[S.prayerId];
  return `${head(prayerTitle(p,S.prayerId),L("Morning & Evening Prayer","Prières du matin & du soir"))}<main class="aoP435930Body">${prayerCard(S.prayerId)}</main>`;
}
function render(){
  const m=mount();if(!m)return false;
  m.dataset.aoPrayView="traditional-pray";
  m.dataset.aoTraditionalPrayRoute=S.route;
  m.innerHTML=S.screen==="prayer"?renderPrayer():S.route==="pray.sacred_hymns"?renderHymns():S.route==="pray.holy_name_litany"?renderHolyName():renderMorningEvening();
  m.scrollTop=0;
  queueMicrotask(()=>m.querySelector("button,[href],summary,[tabindex]:not([tabindex='-1'])")?.focus?.());
  return true;
}
function open(route,opts={}){
  if(!ROUTES[route])return false;
  OPEN_OPTS={...opts};S={...S,route,screen:"module",prayerId:null};
  BASE_OPEN("pray.hub",opts);
  render();return true;
}
function back(){
  if(S.screen==="prayer"){S.screen="module";S.prayerId=null;return render()}
  BASE_OPEN("pray.hub",OPEN_OPTS);queueMicrotask(injectHome);return true;
}
function handleClick(e){
  const b=e.target.closest?.("button,[data-tp381-flip]");if(!b||!root()?.classList.contains("open"))return;
  if(!b.matches("[data-tp381-back],[data-tp381-close],[data-tp381-open],[data-tp381-daypart],[data-tp381-hymn],[data-tp381-hymn-lang],[data-tp381-prayer],[data-tp381-route],[data-tp381-flip]"))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.matches("[data-tp381-back]"))return back();
  if(b.matches("[data-tp381-close]"))return BASE_CLOSE();
  if(b.dataset.tp381Open)return open(b.dataset.tp381Open,{trigger:b});
  if(b.dataset.tp381Daypart){S.daypart=b.dataset.tp381Daypart==="evening"?"evening":"morning";return render()}
  if(b.dataset.tp381Hymn){S.hymn=SACRED_HYMNS_V381[b.dataset.tp381Hymn]?b.dataset.tp381Hymn:"te_deum";return render()}
  if(b.dataset.tp381HymnLang){S.hymnLang=b.dataset.tp381HymnLang==="la"?"la":"en";return render()}
  if(b.dataset.tp381Prayer){S.prayerId=b.dataset.tp381Prayer;S.screen="prayer";return render()}
  if(b.dataset.tp381Route){
    if(ROUTES[b.dataset.tp381Route])return open(b.dataset.tp381Route,{trigger:b});
    return BASE_OPEN(b.dataset.tp381Route,{trigger:b,returnContext:{surface:"domain",domain:"pray"}});
  }
  if(b.matches("[data-tp381-flip]")){
    const v=b.querySelector("[data-face-v]"),la=b.querySelector("[data-face-la]");if(v&&la){const showLatin=la.hidden;la.hidden=!showLatin;v.hidden=showLatin}return;
  }
}
function injectHome(){
  const m=mount();if(!m||m.dataset.aoPrayView!=="home"||m.querySelector(".aoTP381InsertedSection"))return false;
  const sections=[...m.querySelectorAll(".aoP435930ModuleSection")],before=sections.find(s=>/Devotional programmes|Programmes dévotionnels/i.test(s.querySelector("h3")?.textContent||""));
  const sec=document.createElement("section");sec.className="aoP435930ModuleSection aoTP381InsertedSection";
  const cards=[
    ["pray.morning_evening",L("Morning & Evening Prayer","Prières du matin & du soir"),L("Historical lay prayer-book sequence","Séquence historique de livre de prières laïc")],
    ["pray.sacred_hymns",L("Sacred Hymns & Canticles","Hymnes & cantiques sacrés"),"Te Deum · Veni Creator · Ave Maris Stella"],
    ["pray.holy_name_litany",L("Litany of the Holy Name","Litanies du Saint Nom"),L("Traditional approved historical form","Forme historique traditionnelle approuvée")],
  ];
  sec.innerHTML=`<div class="aoP435930ModuleSectionHead"><h3>${esc(L("Daily & traditional prayer","Prière quotidienne & traditionnelle"))}</h3><p>${esc(L("Source-led lay sequences and traditional texts recovered from the approved donor.","Séquences laïques guidées par les sources et textes traditionnels récupérés du donneur approuvé."))}</p></div><div class="aoP435930ModuleGrid">${cards.map(([route,title,desc])=>`<button type="button" class="aoP435930ModuleCard" data-tp381-open="${esc(route)}">${assetMarkup(route)}<small class="aoP435930ModuleKind">${esc(L("TRADITIONAL","TRADITIONNEL"))}</small><b>${esc(title)}</b><span class="aoP435930ModuleDescription">${esc(desc)}</span><i aria-hidden="true">→</i></button>`).join("")}</div>`;
  (before||sections.at(-1))?.insertAdjacentElement(before?"beforebegin":"afterend",sec);return true;
}
function extendRegistry(){
  const MOD=window.AO_MODULES;if(!MOD||MOD.__aoTraditionalPrayV381)return;
  const prior=MOD;
  const wrapper={...prior,__aoTraditionalPrayV381:true,
    get(id){return ROUTES[id]||prior.get?.(id)||null},
    resolve(id){if(ROUTES[id])return {ok:true,input:String(id),id,defaults:{},chain:[id],definition:ROUTES[id]};return prior.resolve?.(id)},
    async open(id,opts={}){if(ROUTES[id])return {ok:open(id,opts),input:String(id),canonicalId:id,type:"module",domain:"pray",options:opts,aliasChain:[id],error:null};return prior.open?.(id,opts)},
    list(filter={}){const xs=[...(prior.list?.(filter)||[])].filter(x=>!ROUTES[x?.id]);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="pray"))xs.push(...Object.values(ROUTES));return xs}
  };
  window.AO_MODULES=wrapper;window.AO_MODULE_REGISTRY_V36=wrapper;
}
function mountRuntime(){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  const PR=window.AO_PRAY_V435930;if(!PR?.open||!PR?.close)return false;
  BASE_OPEN=PR.open.bind(PR);BASE_CLOSE=PR.close.bind(PR);
  const oldOpen=PR.open.bind(PR);
  PR.open=function(id,opts={}){if(ROUTES[id])return open(id,opts);const out=oldOpen(id,opts);if(id==="pray.hub"||id==="pray"||id==="home")queueMicrotask(injectHome);return out};
  document.addEventListener("click",handleClick,true);
  const mo=new MutationObserver(()=>queueMicrotask(injectHome));if(document.body)mo.observe(document.body,{subtree:true,childList:true});
  extendRegistry();
  window.AO_TRADITIONAL_PRAY_V381=Object.freeze({
    version:VERSION,
    routes:ROUTES,
    hymns:SACRED_HYMNS_V381,
    open,
    close:BASE_CLOSE,
    state:()=>({...S}),
    qa:()=>({pass:true,routeCount:Object.keys(ROUTES).length,hymnCount:Object.keys(SACRED_HYMNS_V381).length,morningCount:MORNING_PRAYER_SEQUENCE_V381.length,eveningCount:EVENING_PRAYER_SEQUENCE_V381.length,holyNamePolicy:"SOURCE_LOAD_FAIL_CLOSED",legacyTraditionOwner:false})
  });
  queueMicrotask(injectHome);
  return window.AO_TRADITIONAL_PRAY_V381;
}
export function installTraditionalPrayRuntime({pollMs=40,maxPolls=150}={}){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  let i=0;const tryInstall=()=>{const r=mountRuntime();if(r)return r;if(i++<maxPolls)setTimeout(tryInstall,pollMs);return false};return tryInstall();
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installTraditionalPrayRuntime();
export { ROUTES as TRADITIONAL_PRAY_ROUTES_V381 };
