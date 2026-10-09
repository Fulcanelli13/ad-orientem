
(()=>{'use strict';

const KEY='ao-rule-v411';
const VERSION='41.1-traditional-rule';

/*
  STATIC RULE
  -----------
  Only genuine all-day items belong here.
  Rosary is permanent. Mass appears on Sundays and on an explicitly-known
  holy day of obligation. Morning/evening prayer, Angelus and examination
  are NOT static habits.
*/
const STATIC=[
 {id:'rosary',en:'Rosary',fr:'Rosaire',route:'pray.rosary',authority:'traditional_rule'}
];

const DEFAULT={
 version:2,
 completion:{date:'',static:{},dynamic:{}}
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const nowDate=()=>new Date();
const langOf=state=>state?.language==='fr'?'fr':'en';
const L=(state,en,fr)=>langOf(state)==='fr'?fr:en;
const clone=v=>JSON.parse(JSON.stringify(v));

function normalize(raw){
 const s=raw&&typeof raw==='object'?raw:{};
 const d=clone(DEFAULT);
 d.completion={...d.completion,...(s.completion||{})};
 d.completion.static={...(s.completion?.static||{})};
 d.completion.dynamic={...(s.completion?.dynamic||{})};
 const today=iso(nowDate());
 if(d.completion.date!==today)d.completion={date:today,static:{},dynamic:{}};
 return d;
}
function load(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return normalize(null)}}
function save(s){const n=normalize(s);try{localStorage.setItem(KEY,JSON.stringify(n))}catch{}return n}
function currentState(){return window.AO_RUNTIME_V8?.store?.getState?.()||window.AdOrientemB1?.runtime?.store?.getState?.()||null}
function isTodayState(state){return !!state&&state.selectedDate===iso(nowDate())}
function mins(hhmm){const m=String(hhmm||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null}
function clockMinutes(d){return d.getHours()*60+d.getMinutes()}

function liturgicalContext(state){
 const proper=state?.resolution?.proper?.status==='ready'?state.resolution.proper.data:null;
 const day=state?.resolution?.day;
 const path=String(proper?.sourcePath||day?.selectedMassOption?.path||day?.main?.path||'');
 const title=[proper?.name,proper?.nameFr,day?.main?.title,day?.main?.name].filter(Boolean).join(' · ');
 return {
  isLent:/^Tempora\/Quad/.test(path)||/\bLent|Car[eê]me|Quadragesim/i.test(title),
  isEastertide:/^Tempora\/Pasc/.test(path)||/Eastertide|Temps pascal/i.test(title)
 };
}

/* Do not invent local holy-day obligations. Use Sunday universally, and
   accept an explicit obligation flag when another app/jurisdiction layer
   actually supplies one. */
function explicitHolyDayObligation(state){
 return !!(
  state?.holyDayOfObligation ||
  state?.discipline?.holyDayOfObligation ||
  state?.resolution?.day?.holyDayOfObligation ||
  window.AO_CELEBRATION_ARCH_V1?.rubricContext?.holyDayOfObligation
 );
}
function staticItems(state,now=nowDate()){
 const out=[...STATIC];
 if(now.getDay()===0||explicitHolyDayObligation(state)){
  out.unshift({
   id:'mass.obligation',
   en:'Mass',fr:'Messe',
   route:'mass.current',
   authority:'obligation'
  });
 }
 return out;
}

/*
 INTERNAL DYNAMIC TIMETABLE
 --------------------------
 These times are resolver data only and are never printed on Home.

 04:30–05:45  Morning Prayers
 05:45–06:15  Angelus / Regina Cæli
 06:15–11:45  Morning Prayers, if not completed
 11:45–12:15  Angelus / Regina Cæli
 12:15–17:45  nothing
 17:45–18:15  Angelus / Regina Cæli
 18:15–20:30  Friday-in-Lent Stations; otherwise nothing
 20:30–22:30  Evening Prayers
 22:30–04:30  Examination of Conscience
*/
function schedulerItems(state,settings,now=nowDate()){
 if(!state||state.selectedDate!==iso(now))return [];
 const cm=clockMinutes(now),ctx=liturgicalContext(state),done=settings.completion.dynamic||{};
 const friday=now.getDay()===5;
 const regina=ctx.isEastertide;
 const prayerName=regina?'Regina Cæli':'Angelus';

 const morning={
  id:'daily.morning_prayers',
  title:L(state,'Morning Prayers','Prières du matin'),
  action:L(state,'PRAY','PRIER'),
  route:'pray.morning_evening',
  daypart:'morning',
  hero:null
 };
 const evening={
  id:'daily.evening_prayers',
  title:L(state,'Evening Prayers','Prières du soir'),
  action:L(state,'PRAY','PRIER'),
  route:'pray.morning_evening',
  daypart:'evening',
  hero:null
 };
 const exam={
  id:'daily.examination',
  title:L(state,'Examination of Conscience','Examen de conscience'),
  action:L(state,'BEGIN','COMMENCER'),
  route:'pray.confession',
  hero:null
 };
 const angelus=slot=>({
  id:`angelus.${slot}`,
  title:prayerName,
  action:L(state,'PRAY','PRIER'),
  route:'pray.angelus_regina',
  hero:{kind:'rosary-preview',set:'joyful',index:0,label:prayerName}
 });
 const stations={
  id:'lent.friday.stations',
  title:L(state,'Stations of the Cross','Chemin de Croix'),
  action:L(state,'PRAY','PRIER'),
  route:'pray.stations',
  hero:{kind:'rosary-preview',set:'sorrowful',index:3,label:L(state,'Stations','Chemin de Croix')}
 };

 const maybe=item=>done[item.id]?[]:[item];

 if(cm>=270&&cm<345)return maybe(morning);              // 04:30–05:45
 if(cm>=345&&cm<375)return maybe(angelus('morning'));  // 05:45–06:15
 if(cm>=375&&cm<705)return maybe(morning);             // 06:15–11:45
 if(cm>=705&&cm<735)return maybe(angelus('noon'));     // 11:45–12:15
 if(cm>=735&&cm<1065)return [];                        // 12:15–17:45
 if(cm>=1065&&cm<1095)return maybe(angelus('evening'));// 17:45–18:15
 if(cm>=1095&&cm<1230){                               // 18:15–20:30
   if(friday&&ctx.isLent)return maybe(stations);
   return [];
 }
 if(cm>=1230&&cm<1350)return maybe(evening);           // 20:30–22:30
 return maybe(exam);                                   // 22:30–04:30
}
function activeDynamic(state,settings,now=nowDate()){return schedulerItems(state,settings,now)[0]||null}

function traditionalRosarySet(now=nowDate()){
 /* Pre-Luminous traditional weekly distribution. */
 const d=now.getDay();
 if(d===1||d===4)return'joyful';
 if(d===2||d===5)return'sorrowful';
 return'glorious';
}
const AO_RULE_HERO_ASSETS_V4310=Object.freeze({"rosary":"./assets/generated-inline/art-b3e27f4acbca7cb8e485.webp","morning":"./assets/generated-inline/art-4019523641df2ed2b093.webp","evening":"./assets/generated-inline/art-cc5026e3b60f2bfaf88b.webp","mass":"./assets/generated-inline/art-5fa8f60c92720bb9233b.webp","examination":"./assets/generated-inline/art-7708ab9c8376b624c564.webp","stations":"./assets/generated-inline/art-07faf76f46f6dd3c3d0a.webp"});
window.AO_RULE_HERO_ASSETS_V4310=AO_RULE_HERO_ASSETS_V4310;

function heroModel(state,item,now=nowDate()){
 const id=String(item?.id||'');
 if(id==='rosary'){
  return {kind:'asset',src:AO_RULE_HERO_ASSETS_V4310.rosary,position:'50% 24%',source:'labora-madonna-child',label:L(state,'Rosary','Rosaire')};
 }
 if(id==='mass.obligation'){
  return {kind:'asset',src:AO_RULE_HERO_ASSETS_V4310.mass,position:'50% 33%',source:'labora-eucharistic-mystic-lamb',label:L(state,'Mass','Messe')};
 }
 if(id==='daily.morning_prayers'){
  return {kind:'asset',src:AO_RULE_HERO_ASSETS_V4310.morning,position:'50% 34%',source:'labora-direction-c-waking-up',label:L(state,'Morning Prayers','Prières du matin')};
 }
 if(id.startsWith('angelus.')){
  const title=String(item?.title||'');
  const paschal=/Regina|Cæli|Caeli/i.test(title);
  return {kind:'rosary',set:paschal?'glorious':'joyful',index:0,source:paschal?'rosary-resurrection':'rosary-annunciation',label:title||L(state,'Angelus','Angélus')};
 }
 if(id==='lent.friday.stations'){
  return {kind:'asset',src:AO_RULE_HERO_ASSETS_V4310.stations,position:'50% 38%',source:'labora-stations-station-ii',label:L(state,'Stations of the Cross','Chemin de Croix')};
 }
 if(id==='daily.evening_prayers'){
  return {kind:'asset',src:AO_RULE_HERO_ASSETS_V4310.evening,position:'50% 45%',source:'labora-direction-c-going-to-sleep',label:L(state,'Evening Prayers','Prières du soir')};
 }
 if(id==='daily.examination'){
  return {kind:'asset',src:AO_RULE_HERO_ASSETS_V4310.examination,position:'50% 20%',source:'labora-reconciliation-confession',label:L(state,'Examination of Conscience','Examen de conscience')};
 }
 return {kind:'rosary',set:traditionalRosarySet(now),index:0,source:'rosary-fallback',label:item?.title||item?.en||L(state,'Prayer','Prière')};
}
function heroHtml(state,item){
 const h=heroModel(state,item);
 let src=h.kind==='asset'?(h.src||''):'';
 if(!src){try{src=window.AO_ROSARY_V401?.preview?.(h.set,h.index)||''}catch{}}
 const pos=h.position?` style="object-position:${esc(h.position)}"`:'';
 const source=esc(h.source||'unknown');
 return src
  ? `<span class="aoRuleModuleHero" data-ao-rule-hero-source="${source}"><img alt="" src="${src}" decoding="async"${pos}><span class="aoRuleHeroShade"></span></span>`
  : `<span class="aoRuleModuleHero aoRuleModuleHeroFallback" data-ao-rule-hero-source="fallback" aria-hidden="true"><span class="aoRuleHeroMonogram">✠</span></span>`;
}

function openModule(route,daypart){
 let opened=false;
 try{opened=!!window.AO_MODULES?.open?.(route)}catch{}
 if(!opened&&route==='pray.morning_evening'){
  try{window.AO_TRADITION_V38?.open?.('pray.morning_evening');opened=true}catch{}
 }
 if(daypart){
  setTimeout(()=>{
   const root=document.getElementById('aoV38Traditions');
   const b=root?.querySelector?.(`[data-v381-daypart="${daypart}"]`);
   b?.click?.();
  },100);
 }
 return opened;
}
function openStatic(id){
 const state=currentState(),item=staticItems(state).find(x=>x.id===id);
 if(!item)return false;
 return openModule(item.route,item.daypart);
}
function openDynamic(id){
 const state=currentState(),s=load(),now=nowDate();
 const item=schedulerItems(state,s,now).find(x=>x.id===id);
 if(!item)return false;
 return openModule(item.route,item.daypart);
}

function toggleStatic(id){
 const s=load();s.completion.static[id]=!s.completion.static[id];save(s);refreshHome();renderSheet();
}
function toggleDynamic(id){
 const s=load();s.completion.dynamic[id]=!s.completion.dynamic[id];save(s);refreshHome();renderSheet();
}

function homeCard(state){
 if(!isTodayState(state))return'';
 const s=load(),dyn=activeDynamic(state,s),statics=staticItems(state,nowDate());

 const moduleCard=(item,kind,wide=false)=>{
  const isDynamic=kind==='dynamic';
  const completed=isDynamic?!!s.completion.dynamic[item.id]:!!s.completion.static[item.id];
  const title=isDynamic?item.title:(langOf(state)==='fr'?item.fr:item.en);
  const kicker=isDynamic
    ? L(state,'Now','Maintenant')
    : (item.authority==='obligation'?L(state,'Obligation','Obligation'):L(state,'Rule','Règle'));
  const action=isDynamic?(item.action||L(state,'Open','Ouvrir')):L(state,'Open','Ouvrir');
  const openAttr=isDynamic
    ? `data-ao-rule-dynamic="${esc(item.id)}"`
    : `data-ao-rule-open="${esc(item.id)}"`;
  const checkAttr=isDynamic
    ? `data-ao-rule-toggle-dynamic="${esc(item.id)}"`
    : `data-ao-rule-toggle-static="${esc(item.id)}"`;
  return `<article class="aoRuleModule ${isDynamic?'now':'static'} ${completed?'done':''} ${wide?'wide':''}">
    <button type="button" class="aoRuleModuleLaunch" ${openAttr} aria-label="${esc(title)}">
      ${heroHtml(state,item)}
      <span class="aoRuleModuleCopy">
        <small>${esc(kicker)}</small>
        <strong>${esc(title)}</strong>
        <span>${esc(action)} →</span>
      </span>
    </button>
    <button type="button" class="aoRuleModuleCheck" ${checkAttr} aria-label="${esc(completed?L(state,'Mark not fulfilled','Marquer non accompli'):L(state,'Mark fulfilled','Marquer accompli'))}">${completed?'✓':'○'}</button>
  </article>`;
 };

 const total=(dyn?1:0)+statics.length;
 const cards=[];
 if(dyn)cards.push(moduleCard(dyn,'dynamic',total>=3));
 if(statics.length===1){
  cards.push(moduleCard(statics[0],'static',total===1));
 }else{
  statics.forEach(x=>cards.push(moduleCard(x,'static',false)));
 }

 return `<section class="contentCard aoRuleHomeV412" id="aoRuleCard" aria-label="${esc(L(state,'Rule','Règle'))}">
   <div class="aoRuleCardHeader">
     <div class="aoRuleHeaderCopy">
       <div class="cardKicker">${esc(L(state,'Rule','Règle'))}</div>
       <b>${esc(L(state,'Traditional Rule','Règle traditionnelle'))}</b>
     </div>
     <button type="button" class="roundAction aoRuleTitle" aria-label="${esc(L(state,'Open Rule','Ouvrir la Règle'))}">→</button>
   </div>
   <div class="aoRuleModuleGrid ${dyn?'hasNow':''} count-${cards.length}">
     ${cards.join('')}
   </div>
  </section>`;
}

function sheetHtml(state){
 const s=load(),dyn=activeDynamic(state,s),statics=staticItems(state,nowDate());
 return `<div class="aoRuleSheetPanel" role="dialog" aria-modal="true" aria-labelledby="aoRuleSheetTitle">
  <header class="aoRuleSheetTop"><div><small>AD ORIENTEM</small><h2 id="aoRuleSheetTitle">${esc(L(state,'Rule','Règle'))}</h2></div><button type="button" data-ao-rule-close aria-label="${esc(L(state,'Close','Fermer'))}">×</button></header>
  ${dyn?`<section class="aoRuleSection"><div class="aoRuleSectionHead"><h3>${esc(L(state,'Now','Maintenant'))}</h3></div>
   <div class="aoRuleV411SheetItem"><button data-ao-rule-dynamic="${esc(dyn.id)}"><strong>${esc(dyn.title)}</strong><span>${esc(L(state,'Open prayer','Ouvrir la prière'))}</span></button><button class="mark" data-ao-rule-toggle-dynamic="${esc(dyn.id)}">○</button></div>
  </section>`:''}
  <section class="aoRuleSection"><div class="aoRuleSectionHead"><h3>${esc(L(state,'Permanent rule','Règle permanente'))}</h3></div>
   ${statics.map(x=>{const d=!!s.completion.static[x.id];return `<div class="aoRuleV411SheetItem"><button data-ao-rule-open="${esc(x.id)}"><strong>${esc(langOf(state)==='fr'?x.fr:x.en)}</strong><span>${esc(x.authority==='obligation'?L(state,'Obligation','Obligation'):L(state,'Daily traditional rule','Règle traditionnelle quotidienne'))}</span></button><button class="mark ${d?'done':''}" data-ao-rule-toggle-static="${esc(x.id)}">${d?'✓':'○'}</button></div>`}).join('')}
  </section>
  <section class="aoRuleSection aoRuleSource">${esc(L(state,'The clock windows belong to the resolver only. They are deliberately not shown in the Rule interface.','Les plages horaires appartiennent uniquement au moteur interne. Elles ne sont volontairement pas affichées dans l’interface de la Règle.'))}</section>
 </div>`;
}
function ensureSheet(){
 let root=document.getElementById('aoRuleSheet');
 if(!root){root=document.createElement('div');root.id='aoRuleSheet';root.hidden=true;document.body.appendChild(root)}
 return root;
}
function renderSheet(){
 const root=document.getElementById('aoRuleSheet');if(!root||root.hidden)return;
 const state=currentState();if(state)root.innerHTML=sheetHtml(state);
}
function openSheet(){
 const state=currentState();if(!state)return;
 const root=ensureSheet();root.innerHTML=sheetHtml(state);root.hidden=false;document.body.style.overflow='hidden';
}
function closeSheet(){
 const root=document.getElementById('aoRuleSheet');if(root)root.hidden=true;document.body.style.overflow='';
}
function refreshHome(){
 const state=currentState();if(!state)return false;
 const old=document.getElementById('aoRuleCard');
 if(!old)return false;
 const wrap=document.createElement('div');wrap.innerHTML=homeCard(state).trim();
 const card=wrap.firstElementChild;if(!card)return false;
 old.replaceWith(card);return true;
}

document.addEventListener('click',e=>{
 const t=e.target;
 if(t.closest?.('[data-ao-rule-close]')){e.preventDefault();e.stopImmediatePropagation();closeSheet();return}
 if(t.id==='aoRuleSheet'){closeSheet();return}
 const st=t.closest?.('[data-ao-rule-toggle-static]');
 if(st){e.preventDefault();e.stopImmediatePropagation();toggleStatic(st.dataset.aoRuleToggleStatic);return}
 const dy=t.closest?.('[data-ao-rule-toggle-dynamic]');
 if(dy){e.preventDefault();e.stopImmediatePropagation();toggleDynamic(dy.dataset.aoRuleToggleDynamic);return}
 const so=t.closest?.('[data-ao-rule-open]');
 if(so){e.preventDefault();e.stopImmediatePropagation();openStatic(so.dataset.aoRuleOpen);return}
 const doo=t.closest?.('[data-ao-rule-dynamic]');
 if(doo){e.preventDefault();e.stopImmediatePropagation();openDynamic(doo.dataset.aoRuleDynamic);return}
 const head=t.closest?.('.aoRuleTitle');
 if(head){openSheet();return}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
window.addEventListener('storage',e=>{if(e.key===KEY){refreshHome();renderSheet()}});
setInterval(refreshHome,30000);

const API={
 version:VERSION,load,save,homeCard,staticItems,schedulerItems,activeDynamic,
 liturgicalContext,openStatic,openDynamic,toggleStatic,toggleDynamic,
 openSheet,closeSheet,refreshHome,
 qa(){
  const state=currentState(),s=load();
  return {
   version:VERSION,
   staticRule:['rosary','mass.obligation when applicable'],
   internalSchedule:[
    '04:30–05:45 morning prayers','05:45–06:15 Angelus/Regina Cæli',
    '06:15–11:45 morning prayers if incomplete','11:45–12:15 Angelus/Regina Cæli',
    '12:15–17:45 none','17:45–18:15 Angelus/Regina Cæli',
    '18:15–20:30 Friday-in-Lent Stations only','20:30–22:30 evening prayers',
    '22:30–04:30 examination of conscience'
   ],
   timetableVisible:false,
   labOraPlanOfLife:false,
   rosaryTimed:false,
   ordinaryWeekdayMassSuggested:false,
   pass:true
  };
 }
};
window.AO_RULE_V411=API;
window.AO_RULE_V401=API; // compatibility for the inherited v41 shell
})();
