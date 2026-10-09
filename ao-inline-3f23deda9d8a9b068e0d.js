
(()=>{'use strict';
const VERSION='25-navigation-interaction-consolidation';
const rt=()=>window.AO_RUNTIME_V8||null;
const state=()=>rt()?.store?.getState?.()||null;
const fr=()=>state()?.language==='fr';
const L=(en,frText)=>fr()?frText:en;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const V25={panel:null,historyArmed:false,initialised:false,qaRuns:0};
function isoDate(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function dayTitle(s=state()){return s?.resolution?.day?.main?.title||s?.resolution?.main?.title||document.querySelector('.celebrationBlock h1')?.textContent?.trim()||L('Liturgical day','Jour liturgique')}
function rankText(s=state()){return s?.resolution?.day?.main?.rank||document.querySelector('.celebrationBlock .metaLine span')?.textContent?.trim()||''}
function colourText(s=state()){return s?.resolution?.day?.main?.color||s?.resolution?.day?.main?.colour||s?.resolution?.colourPlan?.name||''}
function commemorationItems(s=state()){
 const raw=s?.resolution?.day?.main?.commemorations||s?.resolution?.day?.commemorations||s?.resolution?.commemorations||window.AO_CELEBRATION_API?.getResolvedMass?.()?.commemorations||[];
 if(!Array.isArray(raw))return raw?[raw]:[];
 return raw.map(x=>typeof x==='string'?x:(x?.title||x?.name||x?.label||'')).filter(Boolean);
}
function openPrayerBook(module=null){
 if(!window.AOTraditionalPrayerBook?.open)return false;if(module&&window.AOTraditionalPrayerBook.openModule)window.AOTraditionalPrayerBook.openModule(module);else window.AOTraditionalPrayerBook.open();return true
}
function closePanel(){document.getElementById('ao-v25-panel')?.remove();V25.panel=null;document.body.classList.remove('ao-v25-panel-open')}
function panelShell(title,kicker,body){return `<div class="aoV25Backdrop" id="ao-v25-panel" data-v25-backdrop><section class="aoV25Panel" role="dialog" aria-modal="true" aria-labelledby="ao-v25-panel-title"><header class="aoV25Top"><button type="button" data-v25-panel-back aria-label="${L('Back','Retour')}">←</button><div><small>${esc(kicker)}</small><strong id="ao-v25-panel-title">${esc(title)}</strong></div><button type="button" data-v25-panel-close aria-label="${L('Close','Fermer')}">×</button></header><div class="aoV25Body">${body}</div></section></div>`}
function displayDate(id){
 const v=globalThis.AO_DISPLAY_DATE?.(id);if(v&&/^\d{2}\/\d{2}\/\d{4}$/.test(v))return v;
 const m=String(id||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:String(id||'')
}
function parseDisplayDate(raw){
 const m=String(raw||'').trim().match(/^(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{4})$/);if(!m)return null;
 const day=Number(m[1]),month=Number(m[2]),year=Number(m[3]);if(year<1000||year>9999||month<1||month>12||day<1||day>31)return null;
 const d=new Date(year,month-1,day,12,0,0,0);if(d.getFullYear()!==year||d.getMonth()!==month-1||d.getDate()!==day)return null;return isoDate(d)
}
function renderCalendarBody(){
 const s=state(),selected=s?.selectedDate||isoDate(new Date()),base=new Date(`${selected}T12:00:00`),start=new Date(base);start.setDate(base.getDate()-base.getDay());
 const days=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const id=isoDate(d);return `<button type="button" class="${id===selected?'active':''}" data-v25-calendar-date="${id}"><small>${d.toLocaleDateString(fr()?'fr-FR':'en-GB',{weekday:'short'})}</small><b>${d.getDate()}</b></button>`}).join('');
 const jump=`<section class="aoV25Section aoV26DateJump"><h3>${L('Jump to date','Aller à une date')}</h3><div class="aoV26DateJumpRow"><label class="aoV26DateField"><span>${L('Date · DD/MM/YYYY','Date · JJ/MM/AAAA')}</span><input type="text" inputmode="numeric" autocomplete="off" enterkeyhint="go" value="${esc(displayDate(selected))}" placeholder="${fr()?'JJ/MM/AAAA':'DD/MM/YYYY'}" data-v26-calendar-input aria-label="${L('Date in DD/MM/YYYY format','Date au format JJ/MM/AAAA')}"></label><button type="button" class="aoV26PickerButton" data-v26-calendar-picker aria-label="${L('Open date picker','Ouvrir le sélecteur de date')}">▦</button><input class="aoV26NativeDate" type="date" value="${esc(selected)}" data-v26-calendar-native tabindex="-1" aria-hidden="true"></div><div class="aoV26DateJumpActions"><button type="button" data-v26-calendar-today>${L('Today','Aujourd’hui')}</button><button type="button" class="aoV26Go" data-v26-calendar-go>${L('Go','Aller')}</button></div><div class="aoV26DateError" data-v26-calendar-error aria-live="polite"></div></section>`;
 const comm=commemorationItems(s);return `<div class="aoV25Hero"><small>${new Date(`${selected}T12:00:00`).toLocaleDateString(fr()?'fr-FR':'en-GB',{weekday:'long'})} · ${esc(displayDate(selected))}</small><h2>${esc(dayTitle(s))}</h2><div class="aoV25Meta">${rankText(s)?`<span>${esc(rankText(s))}</span>`:''}${colourText(s)?`<span>${esc(colourText(s))}</span>`:''}</div></div>${jump}<section class="aoV25Section"><h3>${L('Liturgical week','Semaine liturgique')}</h3><div class="aoV25CalendarRail">${days}</div><div class="aoV25CalendarNav"><button type="button" data-v25-calendar-shift="-7">← ${L('Previous week','Semaine précédente')}</button><button type="button" data-v25-calendar-shift="7">${L('Next week','Semaine suivante')} →</button></div></section>${comm.length?`<section class="aoV25Section"><h3>${L('Commemorations','Commémoraisons')}</h3><div class="aoV25List">${comm.map(x=>`<article><b>${esc(x)}</b></article>`).join('')}</div></section>`:''}<p class="aoV25Note">${L('Use the date field or picker for distant dates; the week controls remain for nearby navigation.','Utilisez le champ de date ou le sélecteur pour les dates éloignées ; les commandes hebdomadaires restent disponibles pour la navigation proche.')}</p>`}
function renderSaintBody(){
 const s=state(),comm=commemorationItems(s),title=dayTitle(s);return `<div class="aoV25Hero"><small>${L('Saint / observance identity','Identité du saint / de l’observance')}</small><h2>${esc(title)}</h2><div class="aoV25Meta">${rankText(s)?`<span>${esc(rankText(s))}</span>`:''}${colourText(s)?`<span>${esc(colourText(s))}</span>`:''}</div></div>${comm.length?`<section class="aoV25Section"><h3>${L('Commemorations','Commémoraisons')}</h3><div class="aoV25List">${comm.map(x=>`<article><b>${esc(x)}</b></article>`).join('')}</div></section>`:''}<section class="aoV25Section"><h3>${L('Context','Contexte')}</h3><div class="aoV25List"><article><b>${L('Current sourced scope','Périmètre sourcé actuel')}</b><p>${L('This v25 panel keeps Saint of the Day distinct from Calendar and Proper. The integrated v24 build does not expose a complete sourced saint-biography corpus through a stable public controller, so v25 does not fabricate biography text here.','Ce panneau v25 maintient le Saint du jour distinct du Calendrier et du Propre. Le build v24 intégré n’expose pas un corpus complet et sourcé de biographies de saints par un contrôleur public stable ; v25 n’invente donc pas de biographie ici.')}</p></article></div><button class="aoV25Primary" type="button" data-v25-destination="today-mass">${L('Open Today’s Mass','Ouvrir la Messe du jour')}</button></section>`}
function renderSourcesBody(){
 const s=state(),p=s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null,rm=window.AO_CELEBRATION_API?.getResolvedMass?.();return `<div class="aoV25Hero"><small>Ad Orientem · v25</small><h2>${L('Sources & architecture','Sources & architecture')}</h2><p>${L('Current application provenance and the resolved liturgical source path, without duplicating underlying corpora.','Provenance actuelle de l’application et chemin de la source liturgique résolue, sans dupliquer les corpus sous-jacents.')}</p></div><section class="aoV25Section"><h3>${L('Build boundary','Limite du build')}</h3><div class="aoV25SourceGrid"><article><b>Mass architecture</b><code>${esc(window.AO_V24_UNIFIED_META?.massBaseline||'v23-live-sequence-certification')}</code></article><article><b>Prayer corpus</b><code>${esc(window.AO_V24_UNIFIED_META?.devotionalBaseline||'Unified RC2.2 prayer/devotional layer')}</code></article><article><b>${L('Resolved Proper source','Source du Propre résolu')}</b><code>${esc(rm?.properSource||p?.sourcePath||L('Not currently resolved','Pas encore résolu'))}</code></article><article><b>${L('Language coverage','Couverture linguistique')}</b><code>${esc(JSON.stringify(p?.languageCoverage||rm?.languageCoverage||{}))}</code></article></div></section><p class="aoV25Note">${L('v25 adds navigation, state coordination, controller wiring and QA only. The protected Mass engine/data layer is not replaced by this panel.','v25 ajoute uniquement navigation, coordination d’état, câblage des contrôleurs et QA. Le moteur et les données de Messe protégés ne sont pas remplacés par ce panneau.')}</p>`}
function renderPanel(){
 if(!V25.panel)return;document.getElementById('ao-v25-panel')?.remove();let title='',kicker='Ad Orientem',body='';
 if(V25.panel==='calendar'){title=L('Calendar','Calendrier');kicker=L('Liturgical dates','Dates liturgiques');body=renderCalendarBody()}
 else if(V25.panel==='saint'){title=L('Saint of the Day','Saint du jour');kicker=L('Identity & context','Identité & contexte');body=renderSaintBody()}
 else if(V25.panel==='sources'){title=L('Sources','Sources');kicker=L('Provenance','Provenance');body=globalThis.AO_CONTENT_V37?.sourcePanelMarkup?.()||renderSourcesBody()}
 else return;document.body.insertAdjacentHTML('beforeend',panelShell(title,kicker,body));document.body.classList.add('ao-v25-panel-open');if(V25.panel==='saint')queueMicrotask(()=>globalThis.AO_SAINT_DAY_READER?.enhancePanel?.())
}
function openPanel(kind){if(!['calendar','saint','sources'].includes(kind))return false;V25.panel=kind;renderPanel();return true}
function openTodayMass(){closePanel();const s=state();if(!s)return false;if(s.route!=='home')rt().store.dispatch({type:s.route==='live'?'leave-live':s.route==='prepare'?'leave-prepare':s.route==='thanksgiving'?'leave-thanksgiving':'scripture-close'});window.AO_CELEBRATION_ARCH_V1&&(window.AO_CELEBRATION_ARCH_V1.stage='details');return !!window.AO_CELEBRATION_API?.openPreflight?.()}
function changeCalendarDate(id){const home=rt()?.controller?.home;if(home?.changeDate){home.changeDate(id);return true}const st=rt()?.store;if(st){st.dispatch({type:'set-date',date:id});home?.resolve?.(id);return true}return false}
function shiftSelected(days){const s=state();if(!s)return;const d=new Date(`${s.selectedDate}T12:00:00`);d.setDate(d.getDate()+Number(days||0));changeCalendarDate(isoDate(d));setTimeout(renderPanel,30)}
function openSettings(){closePanel();const s=state();if(!s)return false;if(s.route!=='home'){const type=s.route==='live'?'leave-live':s.route==='prepare'?'leave-prepare':s.route==='thanksgiving'?'leave-thanksgiving':s.route==='scripture'?'scripture-close':null;if(type)rt().store.dispatch({type})}setTimeout(()=>rt()?.store?.dispatch({type:'home-sheet',sheet:'settings'}),0);return true}
function handleDestination(dest){
 if(dest==='prayers')return openPrayerBook();if(dest==='calendar')return openPanel('calendar');if(dest==='saint')return openPanel('saint');if(dest==='sources')return openPanel('sources');if(dest==='settings')return openSettings();if(dest==='today-mass')return openTodayMass();return false
}
function prayerBack(){const root=document.getElementById('aoPrayerBookRoot');if(!root?.classList.contains('open'))return false;const back=root.querySelector('[data-pb-back]');if(back){back.click();return true}window.AOTraditionalPrayerBook?.close?.();return true}
function appBack(){
 if(window.AO_NAV_V362?.back?.({source:'v25'}))return true;
 const rc=document.querySelector('#rc2-flow-sheet [data-rc2-flow-close],#rc2-module-sheet [data-rc2-close]');if(rc){rc.click();return true}
 const depth=document.querySelector('#ao-r-depth-modal.open [data-ao-r-close]');if(depth){depth.click();return true}
 if(V25.panel){closePanel();return true}
 const mass=document.getElementById('ao-mass-flow-v1');if(mass){const b=mass.querySelector('[data-ao-back]')||mass.querySelector('[data-ao-close]');b?.click();return true}
 if(document.getElementById('aoPrayerBookRoot')?.classList.contains('open'))return prayerBack();
 const s=state();if(!s)return false;if(s.homeSheet){rt().store.dispatch({type:'home-sheet',sheet:null});return true}
 if(s.route==='scripture'){rt().store.dispatch({type:'scripture-close'});return true}if(s.route==='live'){const fr=s.language==='fr';const ok=window.confirm(fr?'La Messe est en cours. Quitter le suivi ? Votre place sera enregistrée.':'Mass is in progress. Leave the follower? Your place will be saved.');if(ok)rt().store.dispatch({type:'leave-live'});return true}if(s.route==='prepare'){rt().store.dispatch({type:'leave-prepare'});return true}if(s.route==='thanksgiving'){rt().store.dispatch({type:'leave-thanksgiving'});return true}
 return false
}
function armHistory(){
 if(V25.historyArmed)return;try{history.replaceState({...history.state,aoV25Base:true},'',location.href);history.pushState({aoV25Guard:true},'',location.href);V25.historyArmed=true}catch{}
}
function rearmHistory(){try{history.pushState({aoV25Guard:true},'',location.href)}catch{}}
function staticControllerIntegrity(){
 const result={version:VERSION,inlineHandlers:{checked:0,missing:[]},expectedGlobals:{checked:0,missing:[]},duplicateIds:[],destinations:{checked:0,missing:[]},domTargets:{checked:0,missing:[]}};
 document.querySelectorAll('[onclick]').forEach(el=>{const code=el.getAttribute('onclick')||'';for(const m of code.matchAll(/(?:^|[;\s])([A-Za-z_$][\w$]*)\s*\(/g)){result.inlineHandlers.checked++;if(typeof window[m[1]]!=='function'&&!['if','for','while','switch'].includes(m[1]))result.inlineHandlers.missing.push(m[1])}});
 ['AO_RUNTIME_V8','AO_CELEBRATION_API','AOTraditionalPrayerBook','AO_SEQUENCE_BRIDGE_V23'].forEach(k=>{result.expectedGlobals.checked++;if(!window[k])result.expectedGlobals.missing.push(k)});
 const counts={};document.querySelectorAll('[id]').forEach(el=>{counts[el.id]=(counts[el.id]||0)+1});result.duplicateIds=Object.entries(counts).filter(([,n])=>n>1).map(([id,count])=>({id,count}));
 document.querySelectorAll('[data-v25-destination]').forEach(el=>{result.destinations.checked++;if(!['prayers','calendar','saint','settings','sources','today-mass'].includes(el.dataset.v25Destination))result.destinations.missing.push(el.dataset.v25Destination)});
 [['app','#app'],['prayerbook','#aoPrayerBookRoot']].forEach(([name,sel])=>{result.domTargets.checked++;if(!document.querySelector(sel))result.domTargets.missing.push(name)});
 result.pass=result.inlineHandlers.missing.length===0&&result.expectedGlobals.missing.length===0&&result.duplicateIds.length===0&&result.destinations.missing.length===0&&result.domTargets.missing.length===0;V25.qaRuns++;return result
}
function qaSnapshot(){const s=state();return{version:VERSION,route:s?.route||null,language:s?.language||null,date:s?.selectedDate||null,panel:V25.panel,prayerOpen:document.getElementById('aoPrayerBookRoot')?.classList.contains('open')||false,changeMassOpen:!!document.getElementById('ao-mass-flow-v1'),integrity:staticControllerIntegrity()}}
function init(){
 if(V25.initialised)return;const r=rt();if(!r?.store){setTimeout(init,60);return}V25.initialised=true;armHistory();
 document.addEventListener('click',e=>{
   const d=e.target.closest?.('[data-v25-destination]');if(d){e.preventDefault();e.stopPropagation();handleDestination(d.dataset.v25Destination);return}
   if(e.target.matches?.('[data-v25-backdrop]')){closePanel();return}
   const close=e.target.closest?.('[data-v25-panel-close],[data-v25-panel-back]');if(close){closePanel();return}
   const cd=e.target.closest?.('[data-v25-calendar-date]');if(cd){changeCalendarDate(cd.dataset.v25CalendarDate);setTimeout(renderPanel,30);return}
   const sh=e.target.closest?.('[data-v25-calendar-shift]');if(sh){shiftSelected(sh.dataset.v25CalendarShift);return}
   const today=e.target.closest?.('[data-v26-calendar-today]');if(today){changeCalendarDate(isoDate(new Date()));setTimeout(renderPanel,30);return}
   const picker=e.target.closest?.('[data-v26-calendar-picker]');if(picker){const native=document.querySelector('#ao-v25-panel [data-v26-calendar-native]');if(native){if(typeof native.showPicker==='function'){try{native.showPicker()}catch{native.focus({preventScroll:true});native.click()}}else{native.focus({preventScroll:true});native.click()}}return}
   const go=e.target.closest?.('[data-v26-calendar-go]');if(go){const input=document.querySelector('#ao-v25-panel [data-v26-calendar-input]'),err=document.querySelector('#ao-v25-panel [data-v26-calendar-error]'),id=parseDisplayDate(input?.value);if(!id){if(input)input.setAttribute('aria-invalid','true');if(err)err.textContent=L('Enter a valid date as DD/MM/YYYY.','Saisissez une date valide au format JJ/MM/AAAA.');return}if(input)input.removeAttribute('aria-invalid');if(err)err.textContent='';changeCalendarDate(id);setTimeout(renderPanel,30);return}
 },true);
 document.addEventListener('change',e=>{const native=e.target.closest?.('[data-v26-calendar-native]');if(native&&native.value){changeCalendarDate(native.value);setTimeout(renderPanel,30)}},true);
 document.addEventListener('keydown',e=>{const input=e.target.closest?.('[data-v26-calendar-input]');if(input&&e.key==='Enter'){e.preventDefault();document.querySelector('#ao-v25-panel [data-v26-calendar-go]')?.click()}},true);
 window.addEventListener('popstate',()=>{if(appBack())setTimeout(rearmHistory,0)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&appBack()){e.preventDefault();e.stopPropagation()}},true);
}
window.AO_NAV_V25={version:VERSION,open:handleDestination,back:appBack,openPrayerBook,openPanel,closePanel,getState:()=>({...V25,core:state()}),qa:qaSnapshot,staticControllerIntegrity};
window.AO_V25_META={version:'v25',baseline:'Ad-Orientem-2.0-v24-UNIFIED-MASS-PRAYER.html',scope:['navigation','state coordination','controller wiring','information architecture','user-path QA'],massEngineChanged:false,prayerCorpusChanged:false,taxonomy:'presentation/reference only; no prayer data duplication'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
