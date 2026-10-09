
(()=>{'use strict';
if(globalThis.AO_SACRED_ART_AESTHETIC_V4312)return;
const art=globalThis.AO_PHASE1_ART;
if(!art||typeof art.effectiveRow!=='function'||typeof art.effectiveRows!=='function'||typeof art.effectiveArtwork!=='function'||typeof art.effectiveArtworks!=='function'||typeof art.homeMarkup!=='function')return;

const priorEffectiveRow=art.effectiveRow.bind(art);
const priorEffectiveRows=art.effectiveRows.bind(art);
const priorEffectiveArtwork=art.effectiveArtwork.bind(art);
const priorEffectiveArtworks=art.effectiveArtworks.bind(art);
const priorHomeMarkup=art.homeMarkup.bind(art);

const BLOCKED_IDS=new Set(['AO087','AO092','AO122','AO125','AO147','AO148','AO149','AO150','AO152']);
const BANNED_MEDIUM=/\b(engraving|etching|woodcut|wood engraving|lithograph|book illustration|print(?: on|$)|drawing|watercolou?r|manuscript|photograph(?:ic)? print)\b/i;

const NEW_ART=Object.freeze({
 'AO153':Object.freeze({
  artId:'AO153',
  title:'Christ Healing the Paralytic',
  artist:'Anthony van Dyck',
  institution:'Royal Collection Trust · Buckingham Palace',
  date:'1618–1619',
  medium:'Oil on canvas',
  accession:'RCIN 405325',
  file:'Anthony van Dyck (1599-1641) - Christ Healing the Paralytic - RCIN 405325 - Royal Collection.jpg',
  sourcePage:'https://commons.wikimedia.org/wiki/File:Anthony_van_Dyck_(1599-1641)_-_Christ_Healing_the_Paralytic_-_RCIN_405325_-_Royal_Collection.jpg',
  license:'Public Domain',
  rights:'PD-Art / PD-old / faithful reproduction',
  attribution:null,
  width:2053,
  height:1650,
  roles:['GOSPEL_ART'],
  deliverySource:'Royal Collection Trust master via Wikimedia Commons',
  qualityGate:'PASS_AESTHETIC_AND_SOURCE',
  aestheticApproved:true,
  aestheticClass:'BAROQUE_MASTER',
  note:'Exact Matthew 9:1–8 subject; replaces Magnasco AO125 under the v43.12 aesthetic correction gate.'
 })
});

const ART_META=Object.freeze({
 'AO142':Object.freeze({aestheticApproved:true,aestheticClass:'EARLY_RENAISSANCE_PANEL_EXCEPTION',aestheticReview:'RETAINED — exact Root of Jesse / Isaiah subject; oil/mixed technique on panel; explicit reviewed exception.'}),
 'AO146':Object.freeze({aestheticApproved:true,aestheticClass:'MASTERPIECE_WALL_PAINTING_EXCEPTION',aestheticReview:'RETAINED — Leonardo Last Supper; explicit masterpiece exception to normal easel-painting medium preference.'})
});

const ROWS=Object.freeze({
 'Tempora/Pent02-0':Object.freeze({properPath:'Tempora/Pent02-0',label:'Second Sunday after Pentecost',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO122 retired. No replacement is accepted until a strong Renaissance/Baroque painting with a clean reusable master is cleared.'}),
 'Tempora/Pent03-0':Object.freeze({properPath:'Tempora/Pent03-0',label:'Third Sunday after Pentecost',status:'GREEN',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic replacement',primaryArtId:'AO100',note:'AO147 Grimshaw retired. Reuses the already-approved Philippe de Champaigne Good Shepherd (AO100): an exact lost-sheep/Good-Shepherd visual relationship, seventeenth-century sacred painting, and a cleared 2467×2987 delivery asset.'}),
 'Tempora/Pent08-0':Object.freeze({properPath:'Tempora/Pent08-0',label:'Eighth Sunday after Pentecost',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO087 Reymerswaele retired on aesthetic grounds. No clean, rights-safe replacement currently clears both the visual and delivery gates.'}),
 'Tempora/Pent16-0':Object.freeze({properPath:'Tempora/Pent16-0',label:'Sixteenth Sunday after Pentecost',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO148 engraving retired. The Gregorio/Mattia Preti hydropic healing is artistically suitable but no reusable clean master has yet been cleared; fail closed.'}),
 'Tempora/Pent17-0':Object.freeze({properPath:'Tempora/Pent17-0',label:'Seventeenth Sunday after Pentecost',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO152 Victorian wood engraving retired. Restores the earlier intentional NO_ART decision for Matthew 22:34–46 rather than forcing a secondary Proper image.'}),
 'Tempora/Pent18-0':Object.freeze({properPath:'Tempora/Pent18-0',label:'Eighteenth Sunday after Pentecost',status:'GREEN',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic replacement',primaryArtId:'AO153',note:'Anthony van Dyck, Christ Healing the Paralytic, 1618–19. Exact Matthew 9:1–8 subject; Baroque oil on canvas; replaces AO125 Magnasco.'}),
 'Tempora/Pent20-0':Object.freeze({properPath:'Tempora/Pent20-0',label:'Twentieth Sunday after Pentecost',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO092 Bendemann theme image retired. No low-resolution or merely thematic substitute is permitted; await an exact John 4:46–53 painting with a cleared master.'}),
 'Tempora/Quad3-0':Object.freeze({properPath:'Tempora/Quad3-0',label:'Third Sunday of Lent',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO149 engraving retired. Available exact alternatives are prints, watercolours, mosaics or otherwise outside the approved visual canon; fail closed.'}),
 'Tempora/Pasc5-0':Object.freeze({properPath:'Tempora/Pasc5-0',label:'Fifth Sunday after Easter',status:'NO_ART',relationship:'GOSPEL_ART',decisionSource:'v43.12 aesthetic audit',note:'AO150 Doré wood engraving retired. Restores the earlier intentional NO_ART decision for the difficult discourse Proper.'})
});

const legacyRows=priorEffectiveRows();
const legacyApproved=new Set(Object.values(legacyRows).filter(r=>r&&r.status==='GREEN'&&r.primaryArtId&&!BLOCKED_IDS.has(r.primaryArtId)).map(r=>String(r.primaryArtId)));
legacyApproved.add('AO142');legacyApproved.add('AO146');legacyApproved.add('AO153');

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const thumb=(file,width)=>file?`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`:'';

function rawArtwork(id){id=String(id||'');return NEW_ART[id]||priorEffectiveArtwork(id)||null}
function aestheticStatus(id){
 id=String(id||'');
 const a=rawArtwork(id);
 if(!a)return {ok:false,reason:'missing-artwork'};
 if(BLOCKED_IDS.has(id))return {ok:false,reason:'explicitly-blocked'};
 if(BANNED_MEDIUM.test(String(a.medium||''))&&!ART_META[id]?.aestheticApproved&&!a.aestheticApproved)return {ok:false,reason:'prohibited-medium'};
 if(!(a.aestheticApproved===true||ART_META[id]?.aestheticApproved===true||legacyApproved.has(id)))return {ok:false,reason:'not-manually-approved'};
 return {ok:true,reason:'approved'};
}
function gateRow(r){
 if(!r||r.status!=='GREEN'||!r.primaryArtId)return r||null;
 const s=aestheticStatus(r.primaryArtId);
 if(s.ok)return r;
 return Object.freeze({...r,status:'NO_ART',primaryArtId:null,decisionSource:'v43.12 aesthetic fail-closed gate',note:`${r.note?r.note+' ':''}Artwork ${r.primaryArtId} suppressed: ${s.reason}.`});
}
function effectiveRow(path){
 const key=String(path||'');
 if(ROWS[key])return ROWS[key];
 return gateRow(priorEffectiveRow(key));
}
function effectiveRows(){
 const merged={...priorEffectiveRows(),...ROWS};
 for(const key of Object.keys(merged))merged[key]=gateRow(merged[key]);
 return merged;
}
function effectiveArtwork(id){
 id=String(id||'');
 const a=rawArtwork(id);if(!a)return null;
 const meta=ART_META[id]||{};
 const s=aestheticStatus(id);
 return Object.freeze({...a,...meta,aestheticApproved:s.ok,aestheticGate:s.reason});
}
function effectiveArtworks(){
 const all={...priorEffectiveArtworks(),...NEW_ART};
 for(const id of Object.keys(all))all[id]=effectiveArtwork(id);
 return all;
}
function renderRow(path,r,lang='en'){
 if(!r||r.status!=='GREEN'||!r.primaryArtId)return '';
 const s=aestheticStatus(r.primaryArtId);if(!s.ok)return '';
 const a=effectiveArtwork(r.primaryArtId);if(!a||!a.file||!a.sourcePage)return '';
 const license=a.license||a.rights||'',attribution=a.attribution||'';
 const attr=attribution&&/^CC BY/i.test(license)&&!attribution.toLowerCase().includes('cc by')?`${attribution} · ${license}`:(attribution||license);
 const alt=`${a.artist||''} — ${a.title||r.label||''}`;
 const ratio=(Number(a.width)||1)/(Number(a.height)||1),orientation=ratio<0.82?'isPortrait':ratio>1.22?'isLandscape':'isBalanced';
 const src=thumb(a.file,1280),s800=thumb(a.file,768),s1800=thumb(a.file,1800);
 return `<figure class="aoProperArt ${orientation}" data-ao-proper-art="${esc(r.primaryArtId)}" data-proper-path="${esc(path)}"><div class="aoProperArtMedia"><img src="${esc(src)}" srcset="${esc(s800)} 768w, ${esc(src)} 1280w, ${esc(s1800)} 1800w" sizes="(max-width:560px) 100vw, 720px" alt="${esc(alt)}" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('figure')?.remove()"></div><figcaption><span><strong>${esc(a.artist||'')}</strong>${a.title?` · ${esc(a.title)}`:''}${attr?`<br><small>${esc(attr)}</small>`:''}</span><a href="${esc(a.sourcePage)}" target="_blank" rel="noopener noreferrer">${lang==='fr'?'Source':'Source'} ↗</a></figcaption></figure>`;
}
function homeMarkup(state,lang='en'){
 const path=art.properPath(state),r=effectiveRow(path);
 if(!r||r.status!=='GREEN'||!r.primaryArtId)return '';
 if(ROWS[path])return renderRow(path,r,lang);
 return aestheticStatus(r.primaryArtId).ok?priorHomeMarkup(state,lang):'';
}
function inspect(){
 const rows=effectiveRows(),arts=effectiveArtworks(),vals=Object.values(rows);
 const active=vals.filter(r=>r?.status==='GREEN'&&r.primaryArtId);
 const blockedActive=active.filter(r=>BLOCKED_IDS.has(String(r.primaryArtId))).map(r=>({path:r.properPath,id:r.primaryArtId}));
 const prohibitedActive=active.filter(r=>{const a=arts[r.primaryArtId];return a&&BANNED_MEDIUM.test(String(a.medium||''))&&!ART_META[r.primaryArtId]?.aestheticApproved&&!a.aestheticApproved}).map(r=>({path:r.properPath,id:r.primaryArtId,medium:arts[r.primaryArtId]?.medium||''}));
 const unapprovedActive=active.filter(r=>!aestheticStatus(r.primaryArtId).ok).map(r=>({path:r.properPath,id:r.primaryArtId,reason:aestheticStatus(r.primaryArtId).reason}));
 const checks={blockedActive:blockedActive.length===0,prohibitedMediumActive:prohibitedActive.length===0,allActiveApproved:unapprovedActive.length===0,tomorrowFailsClosed:rows['Tempora/Pent17-0']?.status==='NO_ART',lostSheepReplacement:rows['Tempora/Pent03-0']?.primaryArtId==='AO100',paralyticReplacement:rows['Tempora/Pent18-0']?.primaryArtId==='AO153'};
 return {version:'43.12',pass:Object.values(checks).every(Boolean),counts:{rows:vals.length,green:active.length,noArt:vals.filter(r=>r?.status==='NO_ART').length},checks,blockedActive,prohibitedActive,unapprovedActive,overrides:ROWS,newArtwork:NEW_ART['AO153']};
}

art.effectiveRow=effectiveRow;
art.effectiveRows=effectiveRows;
art.effectiveArtwork=effectiveArtwork;
art.effectiveArtworks=effectiveArtworks;
art.homeMarkup=homeMarkup;
art.closureBatch='SACRED-ART-AESTHETIC-GATE-v43.12';
art.aestheticStatus=aestheticStatus;

globalThis.AO_SACRED_ART_AESTHETIC_V4312=Object.freeze({version:'43.12',policy:'MANUAL_AESTHETIC_APPROVAL_REQUIRED',blockedIds:Object.freeze([...BLOCKED_IDS]),rows:ROWS,newArtwork:NEW_ART['AO153'],reusedArtwork:'AO100',retainedExceptions:ART_META,inspect,aestheticStatus});
globalThis.AO_SACRED_ART_AESTHETIC_V4310=globalThis.AO_SACRED_ART_AESTHETIC_V4312;
try{document.documentElement.dataset.aoV4312ArtIntegrity=inspect().pass?'pass':'fail'}catch{}
try{globalThis.AO_RUNTIME_V8?.controller?.home?.paint?.()}catch{}
})();
