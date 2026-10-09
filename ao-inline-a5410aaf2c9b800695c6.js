
(()=>{'use strict';
const VERSION='38-rosary-sacred-art';
const CACHE_NAME='ad-orientem-rosary-art-v1';
const PREF_KEY='ao:rosary-art:mode:v1';
const SET_KEY='ao:rosary-art:set:v1';
const SETS={"joyful":[{"id":"joyful-1","index":1,"title_en":"The Annunciation","title_fr":"L’Annonciation","preview":"assets/rosary/joyful/01-preview.webp","image":"assets/rosary/joyful/01.webp","width":825,"height":1100},{"id":"joyful-2","index":2,"title_en":"The Visitation","title_fr":"La Visitation","preview":"assets/rosary/joyful/02-preview.webp","image":"assets/rosary/joyful/02.webp","width":825,"height":1100},{"id":"joyful-3","index":3,"title_en":"The Nativity","title_fr":"La Nativité","preview":"assets/rosary/joyful/03-preview.webp","image":"assets/rosary/joyful/03.webp","width":825,"height":1100},{"id":"joyful-4","index":4,"title_en":"The Presentation","title_fr":"La Présentation","preview":"assets/rosary/joyful/04-preview.webp","image":"assets/rosary/joyful/04.webp","width":825,"height":1100},{"id":"joyful-5","index":5,"title_en":"The Finding of Jesus in the Temple","title_fr":"Le Recouvrement de Jésus au Temple","preview":"assets/rosary/joyful/05-preview.webp","image":"assets/rosary/joyful/05.webp","width":825,"height":1100}],"sorrowful":[{"id":"sorrowful-1","index":1,"title_en":"The Agony in the Garden","title_fr":"L’Agonie au Jardin des Oliviers","preview":"assets/rosary/sorrowful/01-preview.webp","image":"assets/rosary/sorrowful/01.webp","width":1100,"height":825},{"id":"sorrowful-2","index":2,"title_en":"The Scourging at the Pillar","title_fr":"La Flagellation","preview":"assets/rosary/sorrowful/02-preview.webp","image":"assets/rosary/sorrowful/02.webp","width":1100,"height":825},{"id":"sorrowful-3","index":3,"title_en":"The Crowning with Thorns","title_fr":"Le Couronnement d’épines","preview":"assets/rosary/sorrowful/03-preview.webp","image":"assets/rosary/sorrowful/03.webp","width":1100,"height":825},{"id":"sorrowful-4","index":4,"title_en":"The Carrying of the Cross","title_fr":"Le Portement de la Croix","preview":"assets/rosary/sorrowful/04-preview.webp","image":"assets/rosary/sorrowful/04.webp","width":1100,"height":825},{"id":"sorrowful-5","index":5,"title_en":"The Crucifixion","title_fr":"La Crucifixion","preview":"assets/rosary/sorrowful/05-preview.webp","image":"assets/rosary/sorrowful/05.webp","width":1100,"height":825}],"glorious":[{"id":"glorious-1","index":1,"title_en":"The Resurrection","title_fr":"La Résurrection","preview":"assets/rosary/glorious/01-preview.webp","image":"assets/rosary/glorious/01.webp","width":1100,"height":825},{"id":"glorious-2","index":2,"title_en":"The Ascension","title_fr":"L’Ascension","preview":"assets/rosary/glorious/02-preview.webp","image":"assets/rosary/glorious/02.webp","width":1100,"height":825},{"id":"glorious-3","index":3,"title_en":"The Descent of the Holy Spirit","title_fr":"La Descente du Saint-Esprit","preview":"assets/rosary/glorious/03-preview.webp","image":"assets/rosary/glorious/03.webp","width":1100,"height":825},{"id":"glorious-4","index":4,"title_en":"The Assumption of Our Lady","title_fr":"L’Assomption de Notre-Dame","preview":"assets/rosary/glorious/04-preview.webp","image":"assets/rosary/glorious/04.webp","width":1100,"height":825},{"id":"glorious-5","index":5,"title_en":"The Coronation of Our Lady","title_fr":"Le Couronnement de Notre-Dame","preview":"assets/rosary/glorious/05-preview.webp","image":"assets/rosary/glorious/05.webp","width":1100,"height":825}],"luminous":[{"id":"luminous-1","index":1,"title_en":"The Baptism of Our Lord","title_fr":"Le Baptême de Notre-Seigneur","preview":"assets/rosary/luminous/01-preview.webp","image":"assets/rosary/luminous/01.webp","width":1100,"height":825},{"id":"luminous-2","index":2,"title_en":"The Wedding Feast at Cana","title_fr":"Les Noces de Cana","preview":"assets/rosary/luminous/02-preview.webp","image":"assets/rosary/luminous/02.webp","width":1100,"height":825},{"id":"luminous-3","index":3,"title_en":"The Proclamation of the Kingdom","title_fr":"L’Annonce du Royaume","preview":"assets/rosary/luminous/03-preview.webp","image":"assets/rosary/luminous/03.webp","width":1100,"height":825},{"id":"luminous-4","index":4,"title_en":"The Transfiguration","title_fr":"La Transfiguration","preview":"assets/rosary/luminous/04-preview.webp","image":"assets/rosary/luminous/04.webp","width":1100,"height":825},{"id":"luminous-5","index":5,"title_en":"The Institution of the Holy Eucharist","title_fr":"L’Institution de la Sainte Eucharistie","preview":"assets/rosary/luminous/05-preview.webp","image":"assets/rosary/luminous/05.webp","width":1100,"height":825}]};
const MODES=new Set(['on','subtle','off']);
const resolved=new Map();
let scheduled=false,runId=0,lastSet='';
const root=()=>document.getElementById('aoPrayerBookRoot');
const isFr=r=>(r?.querySelector('.lab-lang')?.textContent||'').trim().toUpperCase()==='FR';
function mode(){try{const x=localStorage.getItem(PREF_KEY);return MODES.has(x)?x:'on'}catch{return'on'}}
function setMode(x){if(!MODES.has(x))return;try{localStorage.setItem(PREF_KEY,x)}catch{};runId++;schedule()}
function rememberedSet(){if(lastSet)return lastSet;try{return sessionStorage.getItem(SET_KEY)||''}catch{return''}}
function rememberSet(s){if(!SETS[s])return;lastSet=s;try{sessionStorage.setItem(SET_KEY,s)}catch{}}
function forgetSet(){lastSet='';try{sessionStorage.removeItem(SET_KEY)}catch{}}
function abs(path){try{return new URL(path,location.href).href}catch{return path}}
async function resolveAsset(path){
 if(!path)return'';
 const url=abs(path);if(resolved.has(url))return resolved.get(url);
 if(location.protocol==='file:'){resolved.set(url,url);return url}
 if(!('caches'in window)){resolved.set(url,url);return url}
 try{
  const cache=await caches.open(CACHE_NAME),req=new Request(url,{cache:'force-cache'});
  let res=await cache.match(req);
  if(!res){res=await fetch(req);if(!res.ok)throw new Error('HTTP '+res.status);await cache.put(req,res.clone())}
  const blob=await res.blob(),blobUrl=URL.createObjectURL(blob);resolved.set(url,blobUrl);return blobUrl
 }catch(e){resolved.set(url,url);return url}
}
function art(set,index){return SETS[set]?.[index]||null}
function currentIndex(r){
 const bar=r.querySelector('.lab-decade-bar');if(!bar)return-1;
 const cur=bar.querySelector('i.current');if(!cur)return-1;
 return Array.from(bar.children).indexOf(cur)
}
function isRosary(r){return !!r&&!!r.querySelector('[data-pb-rosary-set],[data-lab-rosary-today],.lab-decade-bar,[data-pb-rosary-change],[data-lab-rosary-change]')}
function modeControl(r){
 if(r.querySelector('.aoRosaryArtMode'))return;
 const fr=isFr(r),m=mode(),el=document.createElement('div');el.className='aoRosaryArtMode';el.setAttribute('role','group');el.setAttribute('aria-label',fr?'Art sacré du Rosaire':'Rosary sacred artwork');
 el.innerHTML=`<span>${fr?'Œuvre':'Artwork'}</span>${[['on',fr?'Activé':'On'],['subtle',fr?'Discret':'Subtle'],['off',fr?'Désactivé':'Off']].map(([v,l])=>`<button type="button" data-ao-rosary-art-mode="${v}" class="${m===v?'active':''}" aria-pressed="${m===v}">${l}</button>`).join('')}`;
 const a=r.querySelector('.lab-option-bar')||r.querySelector('.lab-decade-bar')||r.querySelector('.lab-view-head');a?.insertAdjacentElement('afterend',el)
}
function clearShellArt(r){
 r.querySelectorAll('.pbShell.aoRosaryArtPrayer').forEach(x=>{x.classList.remove('aoRosaryArtPrayer','aoArtSubtle');x.style.removeProperty('--ao-rosary-art-image');delete x.dataset.aoArtSet;delete x.dataset.aoArtIndex})
}
function removeHeroes(r){r.querySelectorAll('.aoRosaryArtHero').forEach(x=>x.remove())}
async function fillHero(hero,item,token){
 const img=hero.querySelector('img');if(!img)return;
 try{
  const p=await resolveAsset(item.preview);if(token!==runId||mode()==='off')return;img.src=p;hero.classList.add('ready');
  if(!navigator.connection?.saveData){const f=await resolveAsset(item.image);if(token!==runId||mode()==='off')return;img.src=f;hero.classList.add('ready')}
 }catch(e){if(token===runId)hero.classList.add('unavailable')}
}
async function fillBackground(shell,item,token){
 try{
  const p=await resolveAsset(item.preview);if(token!==runId||mode()==='off')return;shell.style.setProperty('--ao-rosary-art-image',`url("${String(p).replace(/"/g,'%22')}")`);
  if(!navigator.connection?.saveData){const f=await resolveAsset(item.image);if(token!==runId||mode()==='off')return;shell.style.setProperty('--ao-rosary-art-image',`url("${String(f).replace(/"/g,'%22')}")`)}
 }catch(e){}
}
function preloadNext(set,index){
 const n=art(set,index+1);if(!n||mode()==='off')return;
 const paths=navigator.connection?.saveData?[n.preview]:[n.preview,n.image];
 paths.forEach(p=>resolveAsset(p).catch(()=>{}))
}
function enhance(){
 scheduled=false;const r=root();if(!isRosary(r))return;
 modeControl(r);const m=mode();r.querySelectorAll('[data-ao-rosary-art-mode]').forEach(b=>{const a=b.dataset.aoRosaryArtMode===m;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a))});
 if(m==='off'){removeHeroes(r);clearShellArt(r);return}
 const set=rememberedSet(),idx=currentIndex(r),item=art(set,idx);
 if(!item){removeHeroes(r);clearShellArt(r);return}
 const contemplation=r.querySelector('.lab-contemplation'),shell=r.querySelector('.pbShell');
 if(contemplation){
  clearShellArt(r);
  let fig=r.querySelector('.aoRosaryArtHero');
  const same=fig&&fig.dataset.aoArtSet===set&&fig.dataset.aoArtIndex===String(idx);
  if(!same){removeHeroes(r);const fr=isFr(r),title=(contemplation.querySelector('h2')?.textContent|| (fr?item.title_fr:item.title_en)).trim();fig=document.createElement('figure');fig.className='aoRosaryArtHero';fig.dataset.aoArtSet=set;fig.dataset.aoArtIndex=String(idx);fig.innerHTML=`<img alt="${title.replace(/"/g,'&quot;')}" decoding="async"><figcaption><span>${title}</span><span>${fr?'Méditation par l’art sacré':'Sacred art meditation'}</span></figcaption>`;contemplation.insertAdjacentElement('beforebegin',fig);const token=++runId;fillHero(fig,item,token);preloadNext(set,idx)}
  fig?.classList.toggle('subtle',m==='subtle');
 }else if(shell&&r.querySelector('.lab-prayer-sheet')){
  removeHeroes(r);
  const same=shell.dataset.aoArtSet===set&&shell.dataset.aoArtIndex===String(idx);
  shell.classList.add('aoRosaryArtPrayer');shell.classList.toggle('aoArtSubtle',m==='subtle');
  if(!same){shell.dataset.aoArtSet=set;shell.dataset.aoArtIndex=String(idx);const token=++runId;fillBackground(shell,item,token);preloadNext(set,idx)}
 }else{removeHeroes(r);clearShellArt(r)}
}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{enhance();queueMicrotask(()=>globalThis.AO_ROSARY_V401?.enhance?.())},35)}
document.addEventListener('click',e=>{
 const pick=e.target.closest?.('[data-pb-rosary-set],[data-lab-rosary-today]');if(pick){const s=pick.dataset.pbRosarySet||pick.dataset.labRosaryToday;rememberSet(s)}
 if(e.target.closest?.('[data-pb-rosary-change],[data-lab-rosary-change]'))forgetSet();
 const b=e.target.closest?.('[data-ao-rosary-art-mode]');if(b){e.preventDefault();e.stopPropagation();setMode(b.dataset.aoRosaryArtMode)}
},true);
window.addEventListener('pageshow',schedule);setTimeout(schedule,120);
window.AO_ROSARY_ART_V38={
 version:VERSION,cacheName:CACHE_NAME,manifest:SETS,getMode:mode,setMode,sync:schedule,
 status:()=>({mode:mode(),set:rememberedSet(),cacheSupported:'caches'in window,saveData:!!navigator.connection?.saveData,resolvedAssets:resolved.size}),
 clearCache:async()=>{resolved.forEach(v=>{if(String(v).startsWith('blob:'))try{URL.revokeObjectURL(v)}catch{}});resolved.clear();if('caches'in window)try{await caches.delete(CACHE_NAME)}catch{};schedule()},
 preload:(set,index=0)=>{const x=art(set,index);if(!x)return Promise.resolve(false);return Promise.allSettled([resolveAsset(x.preview),resolveAsset(x.image)]).then(()=>true)}
};
})();
