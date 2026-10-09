
(()=>{'use strict';
const VERSION='43.20';
const HERO={
 id:'pius-x-selected-5',
 url:'https://upload.wikimedia.org/wikipedia/commons/d/db/Pope_Pius_X_%28ca_1907%29.jpg',
 source:'Wikimedia Commons · Pope Pius X (ca. 1907) · Giuseppe Felici · public domain'
};
let installed=false,queued=false,timers=[],clock=null;
const rt=()=>globalThis.AO_RUNTIME_V8||null;
const state=()=>rt()?.store?.getState?.()||null;
const home=()=>document.querySelector('.homeScreen');
const rule=()=>globalThis.AO_RULE_V411||globalThis.AO_RULE_V401||null;
const ly=()=>globalThis.AO_TRADITION_V38||null;
const lang=s=>s?.language==='fr'?'fr':'en';
const L=(s,en,fr)=>lang(s)==='fr'?fr:en;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseIso=x=>{const m=String(x||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],12):new Date()};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fmtShort=d=>`${pad(d.getDate())}/${pad(d.getMonth()+1)}`;
const fmtFull=d=>`${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
const timeLabel=(h,m=0)=>`${pad(h)}:${pad(m)}`;
function icon(type){const a='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
 if(type==='calendar')return `<svg ${a}><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 9h16"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>`;
 if(type==='rosary')return `<svg ${a}><circle cx="12" cy="9" r="6.3" stroke-dasharray="1 2.15"/><path d="M12 15.4v2.2M10.3 18h3.4M12 18v3"/></svg>`;
 if(type==='mass')return `<svg ${a}><path d="M12 2.5v5.5M9.6 5.2h4.8"/><path d="M5.2 12h13.6M6.2 12v3h11.6v-3M8 15v4M16 15v4M6 19h12"/></svg>`;
 if(type==='angelus')return `<svg ${a}><path d="M8.2 15.7h7.6l-1.2-1.8V9.4a2.6 2.6 0 0 0-5.2 0v4.5l-1.2 1.8Z"/><path d="M10.5 18c.8.8 2.2.8 3 0M12 3.4v2"/></svg>`;
 if(type==='prayer')return `<svg ${a}><path d="M8 4c1.1 3.3 2.4 5.8 4 7.4 1.6-1.6 2.9-4.1 4-7.4M12 11.4V21"/><path d="M12 15c-2.3-2-4.2-2.9-5.8-2.5M12 15c2.3-2 4.2-2.9 5.8-2.5"/></svg>`;
 if(type==='exam')return `<svg ${a}><path d="M5 5.5c2.6-.7 4.7-.4 7 1.1v12c-2.3-1.5-4.4-1.8-7-1.1v-12ZM19 5.5c-2.6-.7-4.7-.4-7 1.1v12c2.3-1.5 4.4-1.8 7-1.1v-12Z"/><path d="M8 10h2M14 10h2"/></svg>`;
 return `<svg ${a}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></svg>`;
}
function mystery(s,d=new Date()){
 const day=d.getDay(),set=(day===1||day===4)?'joyful':(day===2||day===5)?'sorrowful':'glorious';
 return ({joyful:L(s,'Joyful Mysteries','Mystères joyeux'),sorrowful:L(s,'Sorrowful Mysteries','Mystères douloureux'),glorious:L(s,'Glorious Mysteries','Mystères glorieux')})[set];
}
function obligationRow(s,settings,now){
 const a=rule(),mass=(a?.staticItems?.(s,now)||[]).find(x=>x.id==='mass.obligation');
 if(!mass||settings?.completion?.static?.['mass.obligation'])return null;
 return {id:'mass.obligation',kind:'static',route:'mass.current',when:L(s,'Today','Aujourd’hui'),title:L(s,'Mass','Messe'),sub:now.getDay()===0?L(s,'Sunday obligation','Obligation dominicale'):L(s,'Holy Day of Obligation','Fête d’obligation'),icon:'mass',priority:100};
}
function nextTimeBound(s,settings,now){
 const a=rule(),done=settings?.completion?.dynamic||{},ctx=a?.liturgicalContext?.(s)||{};
 const cm=now.getHours()*60+now.getMinutes(),out=[];
 const push=(id,mins,label,title,sub,route,ic,priority)=>{if(done[id]||mins<=cm)return;out.push({id,kind:'route',route,mins,when:label,title,sub,icon:ic,priority})};
 if(cm<705&&!done['daily.morning_prayers'])out.push({id:'daily.morning_prayers',kind:'route',route:'pray.morning_evening',mins:390,when:L(s,'This morning','Ce matin'),title:L(s,'Morning Prayers','Prières du matin'),sub:L(s,'Daily Rule','Règle quotidienne'),icon:'prayer',priority:86});
 const prayerName=ctx.isEastertide?L(s,'Regina Cæli','Regina Cæli'):L(s,'Angelus','Angélus');
 push('angelus.morning',360,timeLabel(6),prayerName,L(s,'Marian prayer','Prière mariale'),'pray.angelus_regina','angelus',90);
 push('angelus.noon',720,timeLabel(12),prayerName,L(s,'Marian prayer','Prière mariale'),'pray.angelus_regina','angelus',90);
 push('angelus.evening',1080,timeLabel(18),prayerName,L(s,'Marian prayer','Prière mariale'),'pray.angelus_regina','angelus',90);
 if(cm<1320&&!done['daily.evening_prayers'])out.push({id:'daily.evening_prayers',kind:'route',route:'pray.morning_evening',mins:1230,when:L(s,'This evening','Ce soir'),title:L(s,'Evening Prayers','Prières du soir'),sub:L(s,'Daily Rule','Règle quotidienne'),icon:'prayer',priority:70});
 if((cm>=1200||cm<270)&&!done['daily.examination'])out.push({id:'daily.examination',kind:'route',route:'pray.confession',mins:1340,when:L(s,'Before bed','Avant le coucher'),title:L(s,'Examination of Conscience','Examen de conscience'),sub:L(s,'Daily Rule','Règle quotidienne'),icon:'exam',priority:88});
 if(now.getDay()===5&&ctx.isLent&&cm<1230&&!done['lent.friday.stations'])out.push({id:'lent.friday.stations',kind:'route',route:'pray.stations',mins:1110,when:L(s,'This evening','Ce soir'),title:L(s,'Stations of the Cross','Chemin de Croix'),sub:L(s,'Lenten Friday','Vendredi de Carême'),icon:'prayer',priority:96});
 out.sort((x,y)=>y.priority-x.priority||x.mins-y.mins);return out[0]||null;
}
function rosaryRow(s,settings,now){
 if(settings?.completion?.static?.rosary)return null;
 return {id:'rosary',kind:'static',route:'pray.rosary',when:now.getHours()<18?L(s,'Tonight','Ce soir'):L(s,'Today','Aujourd’hui'),title:L(s,'Rosary','Rosaire'),sub:mystery(s,now),icon:'rosary',priority:80};
}
function liturgicalRow(s){
 const api=ly();if(!api?.eventsFor)return null;const base=parseIso(s?.selectedDate||iso(new Date()));
 for(let i=1;i<=21;i++){
  const d=addDays(base,i),key=iso(d),events=(api.eventsFor(key)||[]).filter(e=>!['october','holy-souls'].includes(e.key));
  if(!events.length)continue;const e=events[0];
  return{id:`liturgical.${key}`,kind:'liturgical',date:key,when:fmtShort(d),fullDate:fmtFull(d),title:e.title||L(s,'Liturgical observance','Observance liturgique'),sub:e.kicker||L(s,'Liturgical calendar','Calendrier liturgique'),icon:'calendar',priority:50};
 }
 return null;
}
function rows(s){
 const a=rule(),settings=a?.load?.()||{completion:{static:{},dynamic:{}}},now=new Date(),daily=[];
 const mass=obligationRow(s,settings,now),next=nextTimeBound(s,settings,now),rosary=rosaryRow(s,settings,now);
 if(mass)daily.push(mass);
 if(next&&!daily.some(x=>x.id===next.id))daily.push(next);
 if(rosary&&!daily.some(x=>x.id==='rosary'))daily.push(rosary);
 if(daily.length>2){
  /* On the homepage Rosary remains visible; exact day scheduling lives behind View all. */
  if(rosary&&!daily.slice(0,2).some(x=>x.id==='rosary'))daily.splice(1,1,rosary);
  daily.length=2;
 }
 const lit=liturgicalRow(s);if(lit)daily.push(lit);
 return daily.slice(0,3);
}
function rowHtml(s,r){
 const attrs=r.kind==='liturgical'?`data-cu20-liturgical="${esc(r.date)}"`:r.kind==='static'?`data-cu20-static="${esc(r.id)}"`:`data-cu20-route="${esc(r.route)}" data-cu20-id="${esc(r.id)}"`;
 const aria=r.fullDate?` aria-label="${esc(`${r.fullDate} · ${r.title}`)}"`:'';
 return `<button type="button" class="aoCU20Row" ${attrs}${aria}><span class="aoCU20When">${esc(r.when)}</span><span class="aoCU20Icon">${icon(r.icon)}</span><span class="aoCU20Copy"><strong>${esc(r.title)}</strong><span>${esc(r.sub)}</span></span><span class="aoCU20Arrow">›</span></button>`;
}
function markup(s){const rs=rows(s),fr=lang(s)==='fr';return `<section class="contentCard aoComingUpV4320" id="aoComingUpCardV4320" aria-label="${fr?'À venir':'Coming Up'}"><div class="aoCU20Head"><div class="aoCU20Heading">${icon('calendar')}<b>${fr?'À venir':'Coming Up'}</b></div><button type="button" class="aoCU20More" data-cu20-all>${fr?'Voir tout':'View all'} →</button></div><div class="aoCU20Rows">${rs.map(r=>rowHtml(s,r)).join('')}</div></section>`}
function decorateCatechism(){
 const c=home()?.querySelector('.aoDailyCateHome');if(!c)return false;
 c.dataset.aoHero='pius-x-selected-5';c.dataset.aoHeroSource=HERO.url;
 let media=c.querySelector('.aoPiusHeroMedia');if(!media){media=document.createElement('span');media.className='aoPiusHeroMedia';media.setAttribute('aria-hidden','true');media.innerHTML=`<img alt="" src="${HERO.url}" decoding="async" referrerpolicy="no-referrer">`;c.prepend(media)}
 const title=c.querySelector('.cateCardCopy>b');if(title&&!c.querySelector('.aoPiusXByline')){const by=document.createElement('span');by.className='aoPiusXByline';by.textContent=lang(state())==='fr'?'Saint Pie X':'St Pius X';title.insertAdjacentElement('afterend',by)}
 c.setAttribute('aria-label',lang(state())==='fr'?'Catéchisme quotidien de Saint Pie X':'Daily Catechism of St Pius X');return true;
}
function route(id){
 if(!id)return false;
 try{if(globalThis.AO_MODULES?.open?.(id))return true}catch{}
 try{if(globalThis.AO_TRADITION_V38?.open?.(id))return true}catch{}
 return false;
}
function render(){
 const root=home(),s=state();if(!root||!s)return false;
 root.querySelectorAll('.aoComingUpV4319').forEach(x=>{x.hidden=true;x.setAttribute('aria-hidden','true')});
 if(s.selectedDate!==iso(new Date())){root.querySelector('#aoComingUpCardV4320')?.remove();decorateCatechism();return true}
 const box=document.createElement('div');box.innerHTML=markup(s);const fresh=box.firstElementChild;
 const old=root.querySelector('#aoComingUpCardV4320');if(old)old.replaceWith(fresh);else{const cate=root.querySelector('.aoDailyCateHome');if(cate)cate.insertAdjacentElement('beforebegin',fresh);else root.appendChild(fresh)}
 const card=root.querySelector('#aoComingUpCardV4320'),cate=root.querySelector('.aoDailyCateHome'),nav=root.querySelector('.aoV37HomeNav');
 if(cate&&card&&card.nextElementSibling!==cate)cate.insertAdjacentElement('beforebegin',card);
 if(nav&&cate&&cate.nextElementSibling!==nav)cate.insertAdjacentElement('afterend',nav);
 decorateCatechism();root.dataset.aoHomeHierarchy='43.20';return true;
}
function queue(){if(!queued){queued=true;queueMicrotask(()=>{queued=false;render()})}timers.forEach(clearTimeout);timers=[70,220,620,1400,3600].map(ms=>setTimeout(render,ms))}
document.addEventListener('click',e=>{
 const st=e.target.closest?.('[data-cu20-static]');if(st){e.preventDefault();rule()?.openStatic?.(st.dataset.cu20Static);return}
 const ro=e.target.closest?.('[data-cu20-route]');if(ro){e.preventDefault();route(ro.dataset.cu20Route);return}
 const li=e.target.closest?.('[data-cu20-liturgical]');if(li){e.preventDefault();globalThis.AO_TRADITION_V38?.open?.('learn.liturgical_year')||globalThis.AO_MODULES?.open?.('learn.liturgical_year');return}
 const all=e.target.closest?.('[data-cu20-all]');if(all){e.preventDefault();rule()?.openSheet?.();return}
},true);
function setTitle(){}
function inspect(){
 const root=home(),cu=root?.querySelector('#aoComingUpCardV4320'),dc=root?.querySelector('.aoDailyCateHome'),nav=root?.querySelector('.aoV37HomeNav');
 const checks={homePresent:!!root,compactComingUp:!!cu&&cu.querySelectorAll('.aoCU20Row').length<=3,legacyV4319Hidden:[...root?.querySelectorAll('.aoComingUpV4319')||[]].every(x=>x.hidden||getComputedStyle(x).display==='none'),piusHeroElement:!!dc?.querySelector('.aoPiusHeroMedia img'),piusByline:!!dc?.querySelector('.aoPiusXByline'),comingUpBeforeCatechism:!cu||!dc||!!(cu.compareDocumentPosition(dc)&Node.DOCUMENT_POSITION_FOLLOWING),exploreAfterCatechism:!nav||!dc||!!(dc.compareDocumentPosition(nav)&Node.DOCUMENT_POSITION_FOLLOWING),noSyntheticResolverTimes:![...cu?.querySelectorAll('.aoCU20When')||[]].some(x=>['04:30','05:45','06:15','11:45','17:45','18:15','20:30','22:30'].includes(x.textContent.trim())),observerFree:true};
 return{version:VERSION,pass:Object.values(checks).every(Boolean),checks,hero:HERO,rowCount:cu?.querySelectorAll('.aoCU20Row').length||0};
}
function install(){if(installed)return;const store=rt()?.store;if(!store?.subscribe){setTimeout(install,60);return}installed=true;store.subscribe(queue);document.addEventListener('click',()=>setTimeout(queue,45),true);window.addEventListener('pageshow',()=>{setTitle();queue()});setTitle();queue();clock=setInterval(()=>setTimeout(render,80),30050)}
globalThis.AO_HOME_V4320=Object.freeze({version:VERSION,render,inspect,hero:HERO});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
