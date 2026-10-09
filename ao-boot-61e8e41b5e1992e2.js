
(()=>{'use strict';
const VERSION='43.11';
const ART=["./assets/generated-inline/art-fb204dc22794284e5695.webp","./assets/generated-inline/art-15629d9db3a572438c6a.webp","./assets/generated-inline/art-70036211f6fd9051748b.webp","./assets/generated-inline/art-1df2a01c0592977ff8b2.webp","./assets/generated-inline/art-d98af7d183ed31a024ec.webp","./assets/generated-inline/art-9137aeab4f4b63913843.webp","./assets/generated-inline/art-57d4deb242c57d1d9cf7.webp","./assets/generated-inline/art-4dffba9c70f606890570.webp","./assets/generated-inline/art-8723d64d4a7545e4a3da.webp","./assets/generated-inline/art-a604a38045c9e7486c27.webp","./assets/generated-inline/art-b96a6d5c1624996ef754.webp","./assets/generated-inline/art-4812c2362b14658aa56e.webp","./assets/generated-inline/art-035d57f5e36ea24a0865.webp","./assets/generated-inline/art-fd53e9a966634b071d8c.webp"];
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV'];
const MODE_KEY='ao.stations-sacred-art.mode.v1';
const RESUME_KEY='ao.stations.session.v1';
const LANDING_INDEX=1; // Station II — Christ takes up His Cross.
let queued=false,wrapped=false,artToken=0;
const pb=()=>window.AOTraditionalPrayerBook;
const root=()=>document.getElementById('aoPrayerBookRoot');
const state=()=>pb()?.getState?.()||null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function mode(){try{const v=localStorage.getItem(MODE_KEY);return ['on','subtle','off'].includes(v)?v:'on'}catch{return'on'}}
function setMode(v){v=['on','subtle','off'].includes(v)?v:'on';try{localStorage.setItem(MODE_KEY,v)}catch{}schedule();return v}
function saveResume(n){n=Math.trunc(Number(n)||0);try{if(n>=1&&n<=14)localStorage.setItem(RESUME_KEY,String(n));else localStorage.removeItem(RESUME_KEY)}catch{}}
function loadResume(){try{const n=Math.trunc(Number(localStorage.getItem(RESUME_KEY))||0);return n>=1&&n<=14?n:0}catch{return 0}}
function clearResume(){saveResume(0)}
function preload(index){if(index<0||index>=ART.length)return;try{const im=new Image();im.decoding='async';im.src=ART[index];if(im.decode)im.decode().catch(()=>{})}catch{}}
function cleanup(shell){if(!shell)return;shell.querySelectorAll('.aoV4311StationsArt').forEach(x=>x.remove())}
function makeFigure(index,title,landing=false){
 const fig=document.createElement('figure');fig.className='aoV4311StationsArt'+(landing?' aoV4311StationsLandingArt':'')+(mode()==='subtle'?' is-subtle':'');
 const stationNo=index+1,caption=landing?(document.documentElement.lang?.toLowerCase().startsWith('fr')?'Chemin de Croix':'Stations of the Cross'):`${ROMAN[index]} · ${title||''}`;
 const meditation=document.documentElement.lang?.toLowerCase().startsWith('fr')?'Méditation par l’art sacré':'Sacred art meditation';
 fig.innerHTML=`<img alt="${esc(landing?(document.documentElement.lang?.toLowerCase().startsWith('fr')?'Le Christ prend sa Croix':'Christ takes up His Cross'):(`Station ${stationNo} — ${title||''}`))}" src="${ART[index]}" decoding="async"><figcaption><span>${esc(caption)}</span><span>${meditation}</span></figcaption>`;
 const img=fig.querySelector('img'),token=++artToken;
 img.addEventListener('error',()=>{if(token===artToken)fig.remove()},{once:true});
 return fig;
}
function applyArt(){
 const r=root(),s=state();if(!r||s?.view!=='stations')return;
 const shell=r.querySelector('.pbShell[data-rc2-module="stations"]')||r.querySelector('.pbShell');if(!shell)return;
 cleanup(shell);if(mode()==='off')return;
 const n=Math.trunc(Number(s.station)||0);
 if(n===0){const hero=shell.querySelector('.lab-stations-hero');if(!hero)return;hero.prepend(makeFigure(LANDING_INDEX,'',true));preload(0);return}
 if(n<1||n>14)return;
 const idx=n-1,card=shell.querySelector('.lab-station-text');if(!card)return;
 const title=card.querySelector('h2')?.textContent?.trim()||'';
 card.insertAdjacentElement('beforebegin',makeFigure(idx,title,false));
 preload(idx+1);
}
function enhancePrefs(){
 const sheet=document.getElementById('rc2-module-sheet'),body=sheet?.querySelector('.rc2SheetBody');if(!body||!sheet.querySelector('[data-rc2-station-mode]')||body.querySelector('.aoV4311StationsArtPref'))return;
 const fr=(document.documentElement.lang||'').toLowerCase().startsWith('fr')||/Présentation du Chemin/.test(body.textContent||''),m=mode();
 const sec=document.createElement('section');sec.className='rc2PrefSection aoV4311StationsArtPref';
 sec.innerHTML=`<h3>${fr?'Art sacré':'Sacred art'}</h3><p>${fr?'Choisissez comment l’image de chaque Station accompagne la méditation.':'Choose how each Station image accompanies the meditation.'}</p><div class="rc2Segments three">${[['on',fr?'Activé':'On'],['subtle',fr?'Discret':'Subtle'],['off',fr?'Désactivé':'Off']].map(([v,l])=>`<button type="button" class="${m===v?'active':''}" data-v4311-station-art="${v}">${l}</button>`).join('')}</div>`;
 const first=body.querySelector('.rc2PrefSection');first?.insertAdjacentElement('afterend',sec)||body.prepend(sec);
}
function enhance(){queued=false;applyArt();enhancePrefs()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(enhance)}
function restoreSavedStation(){
 const target=loadResume();if(!target)return schedule();
 requestAnimationFrame(()=>{let guard=0;while(guard++<target){const s=state();if((Number(s?.station)||0)>=target)break;const b=root()?.querySelector('[data-pb-station-next]');if(!b)break;b.click()}schedule()});
}
function wrapPrayerBook(){
 if(wrapped||!pb()?.openModule)return false;wrapped=true;const api=pb(),orig=api.openModule.bind(api);
 api.openModule=(id,opts={})=>{const result=orig(id,opts);if(id==='stations')restoreSavedStation();return result};
 api.getStationsArtState=()=>({station:Number(state()?.station)||0,artMode:mode(),resume:loadResume()});
 return true;
}
document.addEventListener('click',e=>{
 const art=e.target.closest?.('[data-v4311-station-art]');if(art){e.preventDefault();e.stopPropagation();setMode(art.dataset.v4311StationArt);document.getElementById('rc2-module-sheet')?.remove();setTimeout(()=>{window.AO_RC2_MODULE_UX?.openPreferences?.('stations');setTimeout(enhancePrefs,0)},0);return}
 const next=e.target.closest?.('[data-pb-station-next]');if(next){const before=Number(state()?.station)||0;if(before>=14)clearResume();setTimeout(()=>{const after=Number(state()?.station)||0;if(before<14)saveResume(after);schedule()},0)}
 const prev=e.target.closest?.('[data-pb-station-prev]');if(prev)setTimeout(()=>{const after=Number(state()?.station)||0;saveResume(after);schedule()},0);
 if(e.target.closest?.('[data-pb-station-mode],[data-rc2-station-mode],[data-rc2-prefs="stations"]'))setTimeout(()=>{schedule();enhancePrefs()},0);
},true);
document.addEventListener('change',e=>{if(e.target.closest?.('[data-pb-stabat],[data-rc2-toggle="stationStabat"]'))setTimeout(schedule,0)},true);
function install(){wrapPrayerBook();schedule();if(!wrapped)setTimeout(install,60)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('pageshow',()=>{wrapPrayerBook();schedule()});
window.AO_STATIONS_ART_V4311=Object.freeze({
 version:VERSION,count:14,landingStation:2,source:'approved 2026-09-19 stained-glass XIV cycle',embedded:true,width:1086,height:1448,
 getMode:mode,setMode,resume:loadResume,clearResume,sync:schedule,
 inspect:()=>{const s=state(),r=root(),n=Number(s?.station)||0,figs=r?.querySelectorAll('.aoV4311StationsArt').length||0;return{version:VERSION,station:n,mode:mode(),resume:loadResume(),figures:figs,expectedFigure:(s?.view==='stations'&&mode()!=='off')?1:0,pass:ART.length===14&&(!s||s.view!=='stations'||mode()==='off'||figs===1)}}
});
try{document.title='Ad Orientem 2.0 · v43.11 · Stations Sacred Art Integration';document.documentElement.dataset.aoRelease='43.11'}catch{}
})();
