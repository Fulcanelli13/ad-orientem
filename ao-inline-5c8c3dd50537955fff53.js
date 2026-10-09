
(()=>{'use strict';
const VERSION='v42.8';
const BIO_CACHE=new Map();
let homeSyncBusy=false, homeSyncQueued=false, stateUnsub=null, lastHomeKey='', lastHomeNode=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const st=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()||null;
const fr=()=>st()?.language==='fr';
const L=(en,frText)=>fr()?frText:en;
const tokens=v=>norm(v).split(/\s+/).filter(x=>x.length>2&&!['saint','saints','pope','bishop','martyr','martyrs','virgin','confessor','apostle','archangel','companions','companion','the','and','of'].includes(x));
function queryNames(component){
 const names=[];let d=String(component?.displayName||'').trim();
 if(d)names.push(d);
 if(/^group\./.test(component?.canonicalId||'')){
   let p=d.replace(/\s+(?:and|&)\s+(?:his\s+|her\s+|the\s+)?companions.*$/i,'').replace(/,.*$/,'').trim();
   if(/\sand\s/i.test(p))p=p.split(/\sand\s/i)[0].trim();
   if(p&&p!==d)names.push(p);
 }
 if(/^event\./.test(component?.canonicalId||'')){
   const p=d.replace(/^(Conversion of|Chair of|Nativity of|Beheading of|Stigmata of|Dedication of)\s+/i,'').trim();if(p)names.push(p);
 }
 return [...new Set(names.filter(Boolean))].slice(0,3);
}
function sourceUrlForWikisource(title){return 'https://en.wikisource.org/wiki/'+encodeURIComponent(title).replace(/%2F/g,'/').replace(/%20/g,'_')}
async function apiJson(url,timeout=9000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{signal:c.signal,cache:'default'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j?.error)throw new Error(j.error.info||j.error.code||'API error');return j}finally{clearTimeout(tm)}}
function scoreTitle(title,query){const a=tokens(title),b=tokens(query);let s=0;for(const x of b)if(a.includes(x))s+=4;if(/church|cathedral|school|university|disambiguation/i.test(title))s-=8;if(/saint|st\.|pope/i.test(title))s+=1;return s}
async function catholicEncyclopediaBio(component){
 for(const q of queryNames(component)){
  const su='https://en.wikisource.org/w/api.php?action=query&list=search&srnamespace=0&srlimit=10&format=json&origin=*&srsearch='+encodeURIComponent('intitle:"'+q.replace(/"/g,'')+'"');
  let search;try{search=await apiJson(su)}catch{continue}
  const rows=(search?.query?.search||[]).filter(x=>String(x.title||'').startsWith('Catholic Encyclopedia (1913)/')).sort((a,b)=>scoreTitle(b.title,q)-scoreTitle(a.title,q));
  const hit=rows[0];if(!hit||scoreTitle(hit.title,q)<2)continue;
  const pu='https://en.wikisource.org/w/api.php?action=parse&prop=text%7Cdisplaytitle&format=json&origin=*&page='+encodeURIComponent(hit.title);
  let parsed;try{parsed=await apiJson(pu)}catch{continue}
  const html=parsed?.parse?.text?.['*'];if(!html)continue;
  const doc=new DOMParser().parseFromString(html,'text/html');
  const ps=[...doc.querySelectorAll('.mw-parser-output > p, .mw-parser-output section > p')].map(p=>p.textContent.replace(/\s+/g,' ').trim()).filter(x=>x.length>80&&!/^Coordinates:/i.test(x));
  if(!ps.length)continue;
  let total=0,kept=[];for(const p of ps){if(total>5200||kept.length>=8)break;kept.push(p);total+=p.length}
  return {kind:'catholic-encyclopedia-1913',title:parsed.parse.displaytitle?.replace(/<[^>]+>/g,'')||hit.title,paragraphs:kept,url:sourceUrlForWikisource(hit.title),label:'Catholic Encyclopedia (1913)',rights:'Public-domain original · transcription via Wikisource',language:'en'};
 }
 return null;
}
async function wikipediaBio(component,language){
 const host=language==='fr'?'fr.wikipedia.org':'en.wikipedia.org';
 for(const q0 of queryNames(component)){
  const q=q0+' saint Catholic';
  const u=`https://${host}/w/api.php?action=query&generator=search&gsrnamespace=0&gsrlimit=6&prop=extracts%7Cinfo&exintro=1&explaintext=1&inprop=url&redirects=1&format=json&origin=*&gsrsearch=${encodeURIComponent(q)}`;
  let j;try{j=await apiJson(u)}catch{continue}
  const pages=Object.values(j?.query?.pages||{}).filter(x=>x.extract&&x.fullurl).sort((a,b)=>scoreTitle(b.title,q0)-scoreTitle(a.title,q0));
  const p=pages[0];if(!p||scoreTitle(p.title,q0)<1)continue;
  const chunks=String(p.extract).split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!chunks.length)continue;
  return {kind:'wikipedia',title:p.title,paragraphs:chunks.slice(0,6),url:p.fullurl,label:language==='fr'?'Wikipédia':'Wikipedia',rights:'CC BY-SA · background source',language};
 }
 return null;
}
const BIO_PERSIST_VERSION='saint-biography-cache-v1';
const BIO_STORE_KEY='ao_saint_biography_cache_v1';
const BIO_FRESH_MATCH_MS=180*86400000;
const BIO_FRESH_FALLBACK_MS=30*86400000;
const BIO_STALE_MS=730*86400000;
const BIO_MAX_ENTRIES=32;
const BIO_MAX_ITEM_CHARS=45000;
const BIO_MAX_TOTAL_CHARS=600000;
const BIO_CACHE_STATS={reads:0,hits:0,staleHits:0,writes:0,evictions:0,errors:0,rejectedIdentity:0,sourceFallbacks:0};
function bioIdentityFingerprint(component){return JSON.stringify({manifestVersion:globalThis.AO_SAINT_ART?.version||'',componentId:String(component?.componentId||''),canonicalId:String(component?.canonicalId||''),displayName:String(component?.displayName||''),qaStatus:String(component?.qaStatus||'')})}
async function bioIdentityVerified(component){
 if(!component?.componentId||!component?.canonicalId||component?.qaStatus!=='RESOLVED')return false;
 if(globalThis.AO_SAINT_ART?.version!=='SAINT-ART-MANIFEST-v3.3')return false;
 let manifest=globalThis.AO_SAINT_ART?.lastManifest||null;
 if(!manifest){try{manifest=await globalThis.AO_SAINT_ART?.ensureManifest?.()}catch{return false}}
 const hit=manifest?.components?.find?.(c=>c.componentId===component.componentId&&c.canonicalId===component.canonicalId);
 return !!(hit&&String(hit.displayName||'')===String(component.displayName||'')&&hit.qaStatus==='RESOLVED');
}
function bioPayloadValid(bio){return !!(bio&&typeof bio==='object'&&['catholic-encyclopedia-1913','wikipedia'].includes(bio.kind)&&['en','fr'].includes(bio.language)&&typeof bio.title==='string'&&typeof bio.url==='string'&&/^https:\/\//i.test(bio.url)&&typeof bio.label==='string'&&typeof bio.rights==='string'&&Array.isArray(bio.paragraphs)&&bio.paragraphs.length>0&&bio.paragraphs.length<=8&&bio.paragraphs.every(p=>typeof p==='string'&&p.trim().length>0))}
function bioStoreLoad(){
 try{const raw=localStorage.getItem(BIO_STORE_KEY);if(!raw)return {version:BIO_PERSIST_VERSION,entries:[]};const x=JSON.parse(raw);if(x?.version!==BIO_PERSIST_VERSION||!Array.isArray(x.entries))throw new Error('BIO_CACHE_VERSION');return x}
 catch(e){BIO_CACHE_STATS.errors++;try{localStorage.removeItem(BIO_STORE_KEY)}catch{}return {version:BIO_PERSIST_VERSION,entries:[]}}
}
function bioStoreSave(store){try{localStorage.setItem(BIO_STORE_KEY,JSON.stringify(store));return true}catch{BIO_CACHE_STATS.errors++;return false}}
function bioCachePrune(store){
 const now=Date.now();let entries=(store.entries||[]).filter(r=>r&&now-(+r.savedAt||0)<=BIO_STALE_MS&&bioPayloadValid(r.bio)).sort((a,b)=>(+b.lastUsed||+b.savedAt||0)-(+a.lastUsed||+a.savedAt||0));
 let total=0,kept=[];for(const r of entries){let size=0;try{size=JSON.stringify(r).length}catch{continue}if(size>BIO_MAX_ITEM_CHARS)continue;if(kept.length>=BIO_MAX_ENTRIES||total+size>BIO_MAX_TOTAL_CHARS){BIO_CACHE_STATS.evictions++;continue}kept.push(r);total+=size}
 store.entries=kept;return store;
}
function bioCacheRead(component,language){
 BIO_CACHE_STATS.reads++;const fp=bioIdentityFingerprint(component),key=`${component.canonicalId}|${language}`;let store=bioCachePrune(bioStoreLoad());const idx=store.entries.findIndex(r=>r.key===key&&r.identityFingerprint===fp);if(idx<0){bioStoreSave(store);return null}const r=store.entries[idx],age=Date.now()-(+r.savedAt||0);r.lastUsed=Date.now();store.entries.splice(idx,1);store.entries.unshift(r);bioStoreSave(store);const freshMs=r.bio.language===language?BIO_FRESH_MATCH_MS:BIO_FRESH_FALLBACK_MS;BIO_CACHE_STATS.hits++;if(age>freshMs)BIO_CACHE_STATS.staleHits++;return {record:r,fresh:age<=freshMs,stale:age>freshMs};
}
function bioCacheWrite(component,language,bio){
 if(!bioPayloadValid(bio))return false;let raw;try{raw=JSON.stringify(bio)}catch{return false}if(raw.length>BIO_MAX_ITEM_CHARS)return false;
 const fp=bioIdentityFingerprint(component),key=`${component.canonicalId}|${language}`,now=Date.now();let store=bioStoreLoad();store.entries=(store.entries||[]).filter(r=>!(r.key===key));store.entries.unshift({key,identityFingerprint:fp,savedAt:now,lastUsed:now,bio});store=bioCachePrune(store);if(!bioStoreSave(store))return false;BIO_CACHE_STATS.writes++;return true;
}
function bioCachedValue(hit,reason){if(!hit?.record?.bio)return null;const bio={...hit.record.bio,paragraphs:[...hit.record.bio.paragraphs]};try{Object.defineProperty(bio,'__aoPersistentBiography',{value:{version:BIO_PERSIST_VERSION,savedAt:hit.record.savedAt,reason},enumerable:false})}catch{}return bio}
function clearPersistentBiographyCache(){try{localStorage.removeItem(BIO_STORE_KEY)}catch{}BIO_CACHE.clear()}
async function getBiography(component,language){
 const key=(component?.canonicalId||component?.displayName||'unknown')+'|'+language;if(BIO_CACHE.has(key))return BIO_CACHE.get(key);
 const task=(async()=>{
  const verified=await bioIdentityVerified(component);if(!verified){BIO_CACHE_STATS.rejectedIdentity++;return null}
  const persisted=bioCacheRead(component,language);
  if(persisted?.fresh)return bioCachedValue(persisted,'fresh-cache');
  if(persisted&&typeof navigator!=='undefined'&&navigator.onLine===false){BIO_CACHE_STATS.sourceFallbacks++;return bioCachedValue(persisted,'offline')}
  let bio=null;try{bio=await catholicEncyclopediaBio(component);if(!bio)bio=await wikipediaBio(component,language);if(!bio&&language==='fr')bio=await wikipediaBio(component,'en')}catch{bio=null}
  if(bio&&await bioIdentityVerified(component)){bioCacheWrite(component,language,bio);return bio}
  if(persisted){BIO_CACHE_STATS.sourceFallbacks++;return bioCachedValue(persisted,'source-unavailable')}
  return null;
 })();BIO_CACHE.set(key,task);try{return await task}catch(e){BIO_CACHE.delete(key);throw e}
}
function openSaintPanel(){const mod=globalThis.AO_MODULES;if(mod?.open){mod.open('today.saint');return true}return !!globalThis.AO_NAV_V25?.open?.('saint')}
function enhanceHomeCard(card){if(!card||card.dataset.aoSaintUx===VERSION)return;card.dataset.aoSaintUx=VERSION;card.classList.add('aoSaintArtCardClickable');card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',L('Open Saint of the Day','Ouvrir le Saint du jour'))}
function enhanceAllHomeCards(){document.querySelectorAll('.aoSaintArtCard').forEach(enhanceHomeCard)}
async function ensureHomeArt(){const s=st(),home=document.querySelector('.homeScreen');if(!s||s.route!=='home'||s.resolving||!home)return;const key=`${s.selectedDate||''}|${s.language||''}`;if(home===lastHomeNode&&key===lastHomeKey){enhanceAllHomeCards();return}if(homeSyncBusy){homeSyncQueued=true;return}if(!globalThis.AO_SAINT_ART?.syncHome)return;homeSyncBusy=true;try{await globalThis.AO_SAINT_ART.syncHome(s);lastHomeKey=key;lastHomeNode=home}catch{}finally{homeSyncBusy=false;enhanceAllHomeCards();if(homeSyncQueued){homeSyncQueued=false;setTimeout(ensureHomeArt,80)}}}
function artworkCredit(item){
 const pieces=[item?.artist,item?.date,item?.credit].filter(Boolean);if(!pieces.length&&!item?.source)return '';
 const body=`${pieces.length?esc(pieces.join(' · ')):''}${item?.source?`${pieces.length?'<br>':''}<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${L('Artwork source & rights ↗','Source et droits de l’œuvre ↗')}</a>`:''}`;
 return `<details class="aoSaintArtCreditDisclosure"><summary>${L('Artwork credit','Crédit de l’œuvre')}</summary><div class="aoSaintArtCreditBody">${body}</div></details>`
}
function artPlaceholder(result,component){if(result?.status==='NO_APPROVED_ART_RULE')return L('No approved artwork has been certified for this identity yet.','Aucune œuvre approuvée n’a encore été certifiée pour cette identité.');if(result?.status==='COMMONS_ERROR')return L('Artwork could not be loaded from Wikimedia Commons.','L’œuvre n’a pas pu être chargée depuis Wikimedia Commons.');return L('No reusable artwork could be resolved for this identity.','Aucune œuvre réutilisable n’a pu être résolue pour cette identité.')}
async function renderSaintComponent(root,record,index,dateIso,language){
 const token=String(Date.now())+Math.random();root.dataset.loadToken=token;const component=record.components[index];
 root.innerHTML=`${record.components.length>1?`<div class="aoSaintReaderTabs">${record.components.map((c,i)=>`<button class="${i===index?'active':''}" data-ao-saint-component="${i}">${esc(c.displayName)}</button>`).join('')}</div>`:''}<div class="aoSaintReaderGrid"><div class="aoSaintReaderArt"><div class="aoSaintReaderArtMedia"><div class="aoSaintReaderPlaceholder">${L('Loading approved artwork…','Chargement de l’œuvre approuvée…')}</div></div><div class="aoSaintReaderArtMeta"></div></div><article class="aoSaintReaderBio"><div class="aoSaintReaderKicker">${L('SAINT OF THE DAY','SAINT DU JOUR')}</div><h3>${esc(component.displayName)}</h3><div class="aoSaintReaderStatus">${esc(globalThis.AO_DISPLAY_DATE?.(dateIso)||dateIso)}</div><div class="aoSaintReaderBioText"><p>${L('Loading a sourced biography…','Chargement d’une biographie sourcée…')}</p></div><div class="aoSaintReaderSource"></div></article></div>`;
 const [artR,bioR]=await Promise.allSettled([globalThis.AO_SAINT_ART?.resolveComponent?.(component,dateIso),getBiography(component,language)]);if(root.dataset.loadToken!==token)return;
 const art=artR.status==='fulfilled'?artR.value:null,media=root.querySelector('.aoSaintReaderArtMedia'),artMeta=root.querySelector('.aoSaintReaderArtMeta');
 if(art?.item?.thumbnail||art?.item?.thumb){const item=art.item,src=item.thumbnail||item.thumb;media.innerHTML=`<img src="${esc(src)}" alt="${esc(item.title||component.displayName)}">`;artMeta.innerHTML=artworkCredit(item);media.querySelector('img').onerror=()=>{media.innerHTML=`<div class="aoSaintReaderPlaceholder">${esc(artPlaceholder(art,component))}</div>`}}
 else{media.innerHTML=`<div class="aoSaintReaderPlaceholder">${esc(artPlaceholder(art,component))}</div>`;artMeta.textContent=''}
 const bio=bioR.status==='fulfilled'?bioR.value:null,bioBox=root.querySelector('.aoSaintReaderBioText'),source=root.querySelector('.aoSaintReaderSource');
 if(bio?.paragraphs?.length){bioBox.innerHTML=bio.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('');source.innerHTML=`<b>${esc(bio.label)}</b> · ${esc(bio.rights)}${bio.language!==language?` · ${L('English source shown because a verified French result was not found.','Source anglaise affichée faute de résultat français vérifié.')}`:''}<br><a href="${esc(bio.url)}" target="_blank" rel="noopener noreferrer">${L('Open full source ↗','Ouvrir la source complète ↗')}</a><br><small>${L('Background source; not liturgical text. Text above is retrieved from the cited source, not generated by Ad Orientem.','Source de contexte ; il ne s’agit pas d’un texte liturgique. Le texte ci-dessus est récupéré depuis la source citée, et non généré par Ad Orientem.')}</small>`}
 else{bioBox.innerHTML=`<p>${L('No sourced biography could be retrieved for this identity. Ad Orientem will not invent one.','Aucune biographie sourcée n’a pu être récupérée pour cette identité. Ad Orientem n’en inventera pas.')}</p>`;source.innerHTML=`<small>${L('Try again when online, or use the artwork/source information above.','Réessayez en ligne, ou utilisez les informations de source de l’œuvre ci-dessus.')}</small>`}
}
async function enhanceSaintPanel(){const panel=document.getElementById('ao-v25-panel');if(!panel)return;const title=panel.querySelector('#ao-v25-panel-title')?.textContent?.trim()||'';if(!/Saint of the Day|Saint du jour/i.test(title))return;const s=st();if(!s)return;const body=panel.querySelector('.aoV25Body'),dateIso=s.selectedDate,language=s.language||'en';let root=panel.querySelector('[data-ao-saint-reader]');if(root&&root.dataset.date===dateIso&&root.dataset.language===language)return;
 panel.dataset.aoSaintReader=VERSION;
 const old=[...body.querySelectorAll('.aoV25Section')].find(sec=>/Current sourced scope|Périmètre sourcé actuel/i.test(sec.textContent||''));old?.remove();
 if(!root){root=document.createElement('section');root.className='aoSaintReader';root.dataset.aoSaintReader='';const hero=body.querySelector('.aoV25Hero');hero?.insertAdjacentElement('afterend',root)}root.dataset.date=dateIso;root.dataset.language=language;root.innerHTML=`<div class="aoSaintReaderPlaceholder">${L('Loading saint identity, artwork and source…','Chargement de l’identité, de l’œuvre et de la source…')}</div>`;const guardDate=dateIso,guardLanguage=language;setTimeout(()=>{if(!root.isConnected||root.dataset.date!==guardDate||root.dataset.language!==guardLanguage)return;const txt=root.textContent||'';if(/Loading saint identity|Chargement de l’identité/i.test(txt)){root.innerHTML=`<div class="aoV37TerminalError"><b>${L('Saint content could not be loaded.','Le contenu du saint n’a pas pu être chargé.')}</b><br>${L('The liturgical day remains available. Try the Saint of the Day again when the source is reachable.','Le jour liturgique reste disponible. Réessayez le Saint du jour lorsque la source est accessible.')}</div>`;globalThis.AO_CONTENT_V37?.markSaintTimeout?.()}},10500);
 let manifest;try{manifest=await globalThis.AO_SAINT_ART?.ensureManifest?.()}catch{manifest=null}if(!manifest||root.dataset.date!==dateIso)return;const record=manifest.records?.find(r=>r.date===dateIso.slice(5));if(!record?.components?.length){root.innerHTML=`<div class="aoSaintReaderPlaceholder">${L('This observance is not represented in the saint-art layer. The liturgical title above remains authoritative for the selected day.','Cette observance n’est pas représentée dans la couche d’art des saints. Le titre liturgique ci-dessus reste l’autorité pour le jour sélectionné.')}</div>`;return}root.dataset.active='0';renderSaintComponent(root,record,0,dateIso,language)}
function scheduleStateRefresh(){setTimeout(()=>{ensureHomeArt();enhanceSaintPanel()},60)}
function installStoreHook(){const store=globalThis.AO_RUNTIME_V8?.store;if(!store?.subscribe)return false;if(stateUnsub)return true;stateUnsub=store.subscribe(()=>scheduleStateRefresh());return true}
document.addEventListener('click',e=>{const tab=e.target?.closest?.('[data-ao-saint-component]');if(tab){const root=tab.closest('[data-ao-saint-reader]'),s=st();if(!root||!s)return;const idx=Number(tab.dataset.aoSaintComponent)||0;globalThis.AO_SAINT_ART?.ensureManifest?.().then(m=>{const r=m.records.find(x=>x.date===s.selectedDate.slice(5));if(r)renderSaintComponent(root,r,idx,s.selectedDate,s.language||'en')});return}const card=e.target?.closest?.('.aoSaintArtCard.aoSaintArtCardClickable');if(card&&!e.target.closest('button,a,[data-ao-art-component],[data-ao-art-info],[data-ao-art-debug]')){openSaintPanel();setTimeout(enhanceSaintPanel,30)}},false);
document.addEventListener('keydown',e=>{const card=e.target?.closest?.('.aoSaintArtCard.aoSaintArtCardClickable');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openSaintPanel();setTimeout(enhanceSaintPanel,30)}},false);
function lifecycleRefresh(){installStoreHook();ensureHomeArt();enhanceAllHomeCards();enhanceSaintPanel()}
function boot(){
 installStoreHook();
 const run=()=>lifecycleRefresh();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
 run();
 [80,240,700,1600].forEach(ms=>setTimeout(run,ms));
}
boot();
globalThis.AO_SAINT_BIO_CACHE_V428=Object.freeze({version:BIO_PERSIST_VERSION,clear:clearPersistentBiographyCache,inspect(){const store=bioCachePrune(bioStoreLoad()),bytes=(()=>{try{return JSON.stringify(store).length}catch{return 0}})();return{version:BIO_PERSIST_VERSION,entries:store.entries.length,bytes,maxEntries:BIO_MAX_ENTRIES,maxTotalChars:BIO_MAX_TOTAL_CHARS,freshMatchDays:180,freshFallbackDays:30,staleMaxDays:730,...BIO_CACHE_STATS}}});
globalThis.AO_SAINT_DAY_READER={version:VERSION,enhanceHome:ensureHomeArt,enhancePanel:enhanceSaintPanel,getBiography,refresh:lifecycleRefresh};
})();
