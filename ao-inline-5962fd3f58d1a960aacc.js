
(()=>{'use strict';
const VERSION='43.23';
let installed=false,queued=false,timers=[],clock=null;
const rt=()=>globalThis.AO_RUNTIME_V8||null;
const state=()=>rt()?.store?.getState?.()||null;
const home=()=>document.querySelector('.homeScreen');
const rule=()=>globalThis.AO_RULE_V411||globalThis.AO_RULE_V401||null;
const year=()=>globalThis.AO_LITURGICAL_YEAR_V384||null;
const lang=s=>s?.language==='fr'?'fr':'en';
const L=(s,en,fr)=>lang(s)==='fr'?fr:en;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const mins=d=>d.getHours()*60+d.getMinutes();
const externalRegistry=[];
function symbolIcon(symbol,cls='aoCU23LaboraIcon'){return `<svg class="${cls}" viewBox="0 0 128 128" aria-hidden="true" focusable="false"><use href="#${symbol}"></use></svg>`}
function icon(type){
 const map=globalThis.AO_ICON_REGISTRY_V4333?.comingMap||{
  calendar:'ao-refined-calendar-upcoming',rosary:'ao-rich-rosary',mass:'ao-rich-mass-preparation-thanksgiving',angelus:'ao-rich-angelus',exam:'ao-rich-examination-of-conscience',heart:'ao-rich-sacred-heart',marian:'ao-rich-our-lady-marian-devotions',church:'ao-refined-church',prayer:'ao-refined-pray-now',morning:'ao-rich-morning-offering',evening:'ao-rich-night-prayer',stations:'ao-rich-stations'
 };
 const symbol=map[type]||'ao-refined-pray-now';
 return symbolIcon(symbol,type==='calendar'?'aoCU23HeaderLaboraIcon':'aoCU23LaboraIcon');
}
function mystery(s,d=new Date()){const day=d.getDay(),set=(day===1||day===4)?'joyful':(day===2||day===5)?'sorrowful':'glorious';return ({joyful:L(s,'Joyful Mysteries','Mystères joyeux'),sorrowful:L(s,'Sorrowful Mysteries','Mystères douloureux'),glorious:L(s,'Glorious Mysteries','Mystères glorieux')})[set]}
function dynamicIcon(id){if(/^angelus\./.test(id))return'angelus';if(id==='daily.morning_prayers')return'morning';if(id==='daily.evening_prayers')return'evening';if(id==='daily.examination')return'exam';if(id==='lent.friday.stations')return'stations';return'prayer'}
function nextDynamic(s,settings,now){
 const api=rule(),active=api?.activeDynamic?.(s,settings,now);if(active)return{id:active.id,role:L(s,'Now','Maintenant'),when:L(s,'Now','Maintenant'),title:active.title,sub:L(s,'Appropriate for this moment','Pour ce moment de la journée'),icon:dynamicIcon(active.id),action:'dynamic',route:active.route};
 const done=settings?.completion?.dynamic||{},cm=mins(now),ctx=api?.liturgicalContext?.(s)||{},c=[];
 const add=(id,due,title,sub,route,ic)=>{if(!done[id]&&due>cm)c.push({id,due,title,sub,route,icon:ic})};
 const marian=ctx.isEastertide?L(s,'Regina Cæli','Regina Cæli'):L(s,'Angelus','Angélus');
 if(cm<705&&!done['daily.morning_prayers'])add('daily.morning_prayers',390,L(s,'Morning Prayers','Prières du matin'),L(s,'Begin the day with God','Commencer la journée avec Dieu'),'pray.morning_evening','morning');
 add('angelus.morning',360,marian,L(s,'Morning Marian prayer','Prière mariale du matin'),'pray.angelus_regina','angelus');
 add('angelus.noon',720,marian,L(s,'Pause around midday','Pause autour de midi'),'pray.angelus_regina','angelus');
 add('angelus.evening',1080,marian,L(s,'Sanctify the evening hour','Sanctifier l’heure du soir'),'pray.angelus_regina','angelus');
 if(now.getDay()===5&&ctx.isLent)add('lent.friday.stations',1110,L(s,'Stations of the Cross','Chemin de Croix'),L(s,'Friday in Lent','Vendredi de Carême'),'pray.stations','stations');
 add('daily.evening_prayers',1230,L(s,'Evening Prayers','Prières du soir'),L(s,'Close the day in prayer','Clore la journée dans la prière'),'pray.morning_evening','evening');
 add('daily.examination',1340,L(s,'Examination of Conscience','Examen de conscience'),L(s,'Before retiring','Avant le coucher'),'pray.confession','exam');
 c.sort((a,b)=>a.due-b.due);const n=c[0];if(n)return{id:n.id,role:L(s,'Next','Ensuite'),when:n.id.includes('noon')?L(s,'Noon','Midi'):n.id.includes('evening')||n.id==='daily.evening_prayers'?L(s,'Evening','Soir'):n.id==='daily.examination'?L(s,'Before bed','Avant le coucher'):L(s,'Later','Plus tard'),title:n.title,sub:n.sub,icon:n.icon,action:'route',route:n.route};
 return{id:'dynamic.free',role:L(s,'Now','Maintenant'),when:L(s,'Today','Aujourd’hui'),title:L(s,'Remain with God','Rester avec Dieu'),sub:L(s,'No scheduled practice is due now','Aucune pratique programmée n’est due maintenant'),icon:'prayer',action:'route',route:'pray.library'};
}
function staticSlot(s,settings,now){
 const api=rule(),all=(api?.staticItems?.(s,now)||[]).filter(x=>x.id!=='mass.obligation');if(!all.length)return{id:'static.none',role:L(s,'Daily','Quotidien'),when:L(s,'Today','Aujourd’hui'),title:L(s,'Daily Rule','Règle quotidienne'),sub:L(s,'Open your rule','Ouvrir votre règle'),icon:'prayer',action:'all'};
 const pending=all.find(x=>!settings?.completion?.static?.[x.id])||all[0],done=!!settings?.completion?.static?.[pending.id];const title=lang(s)==='fr'?(pending.fr||pending.en):(pending.en||pending.fr);
 return{id:pending.id,role:L(s,'Daily','Quotidien'),when:done?L(s,'Done','Fait'):L(s,'Today','Aujourd’hui'),title:title||L(s,'Daily Rule','Règle quotidienne'),sub:pending.id==='rosary'?(done?L(s,'Prayed today','Prié aujourd’hui'):mystery(s,now)):done?L(s,'Completed today','Accompli aujourd’hui'):L(s,'Permanent rule','Règle permanente'),icon:pending.id==='rosary'?'rosary':'prayer',action:'static',done};
}
function shortEventSub(s,e){const k=String(e?.key||'');
 if(k.startsWith('ember'))return L(s,'Proper Mass · prayer & penance','Messe propre · prière & pénitence');
 if(k==='rogation')return L(s,'Litany · procession where celebrated','Litanies · procession là où elle est célébrée');
 if(k==='holy-thursday')return L(s,'Mass · visit the Altar of Repose','Messe · visite au reposoir');
 if(k==='good-friday')return L(s,'Fast & abstinence · Passion','Jeûne & abstinence · Passion');
 if(k==='ash')return L(s,'Fast & abstinence · begin Lent','Jeûne & abstinence · commencer le Carême');
 if(k==='candlemas')return L(s,'Blessed candles · procession · Mass','Cierges bénits · procession · Messe');
 if(k==='palm')return L(s,'Procession · Passion · Mass','Procession · Passion · Messe');
 if(k==='corpus')return L(s,'Mass · procession · Eucharistic prayer','Messe · procession · prière eucharistique');
 if(k==='holy-souls')return L(s,'Pray for the faithful departed','Prier pour les fidèles défunts');
 if(k==='christ-king')return L(s,'Mass · devotion to Christ the King','Messe · dévotion au Christ-Roi');
 if(k==='septuagesima')return L(s,'Prepare for Lent','Se préparer au Carême');
 return e?.kicker||L(s,'Liturgical observance','Observance liturgique');
}
function eventAction(e){const a=Array.isArray(e?.actions)?e.actions.find(x=>Array.isArray(x)&&x[0]):null;return a?.[0]||'learn.liturgical_year'}
function explicitObligation(s,now){return (rule()?.staticItems?.(s,now)||[]).some(x=>x.id==='mass.obligation')}
function weeklyEvent(s,d){const dow=d.getDay(),dom=d.getDate(),first=dom<=7;
 if(dow===0)return{key:'sunday-mass',priority:100,title:L(s,'Sunday Mass','Messe dominicale'),sub:L(s,'Sunday obligation','Obligation dominicale'),route:'mass.current',icon:'mass'};
 if(dow===5&&first)return{key:'first-friday',priority:76,title:L(s,'First Friday','Premier vendredi'),sub:L(s,'Sacred Heart devotion','Dévotion au Sacré-Cœur'),route:'pray.visit_blessed_sacrament',icon:'heart'};
 if(dow===6&&first)return{key:'first-saturday',priority:76,title:L(s,'First Saturday','Premier samedi'),sub:L(s,'Immaculate Heart devotion','Dévotion au Cœur Immaculé'),route:'pray.rosary',icon:'marian'};
 if(dow===5)return{key:'friday',priority:50,title:L(s,'Friday devotion','Dévotion du vendredi'),sub:L(s,'Sacred Heart · prayer & penance','Sacré-Cœur · prière & pénitence'),route:'pray.visit_blessed_sacrament',icon:'heart'};
 if(dow===6)return{key:'saturday',priority:50,title:L(s,'Saturday of Our Lady','Samedi de Notre-Dame'),sub:L(s,'Traditional Marian devotion','Dévotion mariale traditionnelle'),route:'pray.library',icon:'marian'};
 return null;
}
function sourceEvents(s,d){const y=year(),key=iso(d),out=[];try{for(const e of y?.eventsFor?.(key)||[])out.push({key:e.key,priority:+e.priority||40,title:e.title,sub:shortEventSub(s,e),route:eventAction(e),icon:/ember|rogation|candlemas|palm|holy-thursday|corpus/.test(e.key)?'church':'calendar',source:e})}catch{}
 for(const e of externalRegistry){if(e&&e.date===key)out.push({key:e.key||`external.${key}`,priority:+e.priority||90,title:lang(s)==='fr'?(e.titleFr||e.title):(e.title||e.titleFr),sub:lang(s)==='fr'?(e.subFr||e.sub||''):(e.sub||e.subFr||''),route:e.route||'learn.liturgical_year',icon:e.icon||'church',source:e})}
 return out;
}
function candidateForDate(s,d){const src=sourceEvents(s,d),weekly=weeklyEvent(s,d);if(weekly)src.push(weekly);if(explicitObligation(s,d)&&d.getDay()!==0)src.push({key:'holy-day-obligation',priority:101,title:L(s,'Mass','Messe'),sub:L(s,'Holy Day of Obligation','Fête d’obligation'),route:'mass.current',icon:'mass'});
 src.sort((a,b)=>b.priority-a.priority);let best=src[0]||null;
 /* On Sundays retain a genuinely significant named observance while still saying that Mass is obligatory. */
 if(d.getDay()===0){const named=src.find(x=>x.source&&x.priority>=70&& !['october'].includes(x.key));if(named){best={...named,priority:Math.max(102,named.priority),sub:`${L(s,'Sunday obligation','Obligation dominicale')} · ${named.sub}`}}}
 return best;
}
function eventSlot(s,now){let today=candidateForDate(s,now);if(today)return{id:today.key,role:L(s,'Observance','Observance'),when:L(s,'Today','Aujourd’hui'),title:today.title,sub:today.sub,icon:today.icon,action:'event',route:today.route,date:iso(now)};
 let best=null;for(let i=1;i<=14;i++){const d=addDays(now,i),c=candidateForDate(s,d);if(!c)continue;const score=c.priority-i*4;if(!best||score>best.score)best={...c,date:iso(d),days:i,score,d};}
 if(best){const when=best.days===1?L(s,'Tomorrow','Demain'):best.days<7?new Intl.DateTimeFormat(lang(s)==='fr'?'fr-FR':'en-GB',{weekday:'short'}).format(best.d):`${pad(best.d.getDate())}/${pad(best.d.getMonth()+1)}`;return{id:best.key,role:L(s,'Upcoming','À venir'),when,title:best.title,sub:best.sub,icon:best.icon,action:'event',route:best.route,date:best.date}}
 return{id:'event.calendar',role:L(s,'Upcoming','À venir'),when:L(s,'Calendar','Calendrier'),title:L(s,'Liturgical calendar','Calendrier liturgique'),sub:L(s,'See the next observance','Voir la prochaine observance'),icon:'calendar',action:'event',route:'learn.liturgical_year',date:iso(now)};
}
function comingUpHeroSrc(r){
 const A=globalThis.AO_RULE_HERO_ASSETS_V4310||null;
 if(!A)return'';
 const id=String(r?.id||'').toLowerCase(),ic=String(r?.icon||'').toLowerCase();
 if(id.startsWith('angelus.')){try{return globalThis.AO_ROSARY_V401?.preview?.('joyful',0)||A.rosary||''}catch{return A.rosary||''}}
 if(id==='rosary'||ic==='marian')return A.rosary||'';
 if(id==='mass.obligation'||id==='sunday-mass'||id==='holy-day-obligation'||ic==='mass')return A.mass||'';
 if(id==='daily.morning_prayers')return A.morning||A.rosary||'';
 if(id==='daily.evening_prayers')return A.evening||A.rosary||'';
 if(id==='daily.examination')return A.examination||A.rosary||'';
 if(id==='lent.friday.stations'||/station|good-friday|palm/.test(id))return A.stations||A.mass||'';
 if(/first-friday|friday|corpus|christ-king|ember|rogation|holy-thursday/.test(id)||ic==='heart'||ic==='church')return A.mass||A.rosary||'';
 return A.rosary||A.mass||'';
}
function heroHtml(r){const src=comingUpHeroSrc(r);return src?`<span class="aoCU23Hero" aria-hidden="true"><img alt="" src="${src}" decoding="async"></span>`:`<span class="aoCU23Hero aoCU23HeroFallback" aria-hidden="true">✠</span>`}
function rowHtml(s,r,cls=''){const attrs=r.action==='dynamic'?`data-cu23-dynamic="${esc(r.id)}"`:r.action==='static'?`data-cu23-static="${esc(r.id)}"`:r.action==='all'?`data-cu23-all`:r.action==='event'?`data-cu23-event="${esc(r.route||'')}" data-cu23-date="${esc(r.date||'')}"`:`data-cu23-route="${esc(r.route||'')}"`;return `<button type="button" class="aoCU23Row ${cls} ${r.done?'done':''}" ${attrs}><span class="aoCU23Role">${esc(r.role)}<small>${esc(r.when)}</small></span><span class="aoCU23Icon">${icon(r.icon)}</span><span class="aoCU23Copy"><strong>${esc(r.title)}</strong><span>${esc(r.sub)}</span></span>${heroHtml(r)}<span class="aoCU23Arrow">›</span></button>`}
function markup(s){const api=rule(),settings=api?.load?.()||{completion:{static:{},dynamic:{}}},now=new Date(),dyn=nextDynamic(s,settings,now),stat=staticSlot(s,settings,now),evt=eventSlot(s,now),fr=lang(s)==='fr';return `<section class="contentCard aoComingUpV4323" id="aoComingUpCardV4323" aria-label="${fr?'À venir':'Coming Up'}"><div class="aoCU23Head"><div class="aoCU23Heading">${icon('calendar')}<b>${fr?'À venir':'Coming Up'}</b></div><button type="button" class="aoCU23More" data-cu23-all>${fr?'Voir tout':'View all'} →</button></div><div class="aoCU23Rows">${rowHtml(s,dyn,'dynamic')}${rowHtml(s,stat,'static')}${rowHtml(s,evt,'event')}</div></section>`}
function route(id){if(!id)return false;try{if(globalThis.AO_MODULES?.open?.(id))return true}catch{}try{if(globalThis.AO_TRADITION_V38?.open?.(id))return true}catch{}return false}
function render(){const root=home(),s=state();if(!root||!s)return false;const old20=root.querySelector('#aoComingUpCardV4320');if(old20){old20.hidden=true;old20.setAttribute('aria-hidden','true')}if(s.selectedDate!==iso(new Date())){root.querySelector('#aoComingUpCardV4323')?.remove();return true}const box=document.createElement('div');box.innerHTML=markup(s);const fresh=box.firstElementChild,old=root.querySelector('#aoComingUpCardV4323');if(old)old.replaceWith(fresh);else{const cate=root.querySelector('.aoDailyCateHome');if(cate)cate.insertAdjacentElement('beforebegin',fresh);else root.appendChild(fresh)}const cate=root.querySelector('.aoDailyCateHome'),nav=root.querySelector('.aoV37HomeNav'),card=root.querySelector('#aoComingUpCardV4323');if(cate&&card&&card.nextElementSibling!==cate)cate.insertAdjacentElement('beforebegin',card);if(nav&&cate&&cate.nextElementSibling!==nav)cate.insertAdjacentElement('afterend',nav);root.dataset.aoHomeHierarchy=VERSION;return true}
function queue(){if(!queued){queued=true;queueMicrotask(()=>{queued=false;render()})}timers.forEach(clearTimeout);timers=[30,120,400,1000].map(ms=>setTimeout(render,ms))}
document.addEventListener('click',e=>{const dy=e.target.closest?.('[data-cu23-dynamic]');if(dy){e.preventDefault();const id=dy.dataset.cu23Dynamic;if(id==='dynamic.free'){route('pray.library');return}if(!rule()?.openDynamic?.(id))route(dy.dataset.cu23Route);return}const st=e.target.closest?.('[data-cu23-static]');if(st){e.preventDefault();rule()?.openStatic?.(st.dataset.cu23Static);return}const ev=e.target.closest?.('[data-cu23-event]');if(ev){e.preventDefault();if(!route(ev.dataset.cu23Event))route('learn.liturgical_year');return}const ro=e.target.closest?.('[data-cu23-route]');if(ro){e.preventDefault();route(ro.dataset.cu23Route);return}const all=e.target.closest?.('[data-cu23-all]');if(all){e.preventDefault();rule()?.openSheet?.();return}},true);
function registerEvent(e){if(!e||!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date||''))||!e.title)return false;externalRegistry.push({...e});queue();return true}
function inspect(){const c=home()?.querySelector('#aoComingUpCardV4323'),roles=[...c?.querySelectorAll('.aoCU23Role')||[]].map(x=>x.firstChild?.textContent?.trim()||'');const checks={cardPresent:!!c,exactlyThreeLayers:(c?.querySelectorAll('.aoCU23Row').length||0)===3,dynamicLayer:!!c?.querySelector('.aoCU23Row.dynamic'),staticLayer:!!c?.querySelector('.aoCU23Row.static'),eventLayer:!!c?.querySelector('.aoCU23Row.event'),legacyCardHidden:!home()?.querySelector('#aoComingUpCardV4320')||getComputedStyle(home().querySelector('#aoComingUpCardV4320')).display==='none',noResolverClockLeak:![...c?.querySelectorAll('.aoCU23Role small')||[]].some(x=>['04:30','05:45','06:15','11:45','17:45','18:15','20:30','22:30'].includes(x.textContent.trim())),observerFree:true};return{version:VERSION,pass:Object.values(checks).every(Boolean),checks,roles,eventRegistrySize:externalRegistry.length}}
function install(){if(installed)return;const store=rt()?.store;if(!store?.subscribe){setTimeout(install,60);return}installed=true;store.subscribe(queue);document.addEventListener('click',()=>setTimeout(queue,45),true);window.addEventListener('pageshow',()=>queue());queue();clock=setInterval(()=>setTimeout(render,70),15000);}
globalThis.AO_COMING_UP_V4323=Object.freeze({version:VERSION,render,inspect,registerEvent,getExternalEvents:()=>externalRegistry.map(x=>({...x}))});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
