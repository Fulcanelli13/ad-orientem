
(()=>{'use strict';
if(globalThis.AO_PHASE1_FAST_CLOSURE_B1)return;
const art=globalThis.AO_PHASE1_ART;
if(!art||typeof art.homeMarkup!=='function'||typeof art.properPath!=='function')return;
const ROWS=Object.freeze({"Tempora/Adv1-0":{"properPath":"Tempora/Adv1-0","label":"First Sunday of Advent","status":"GREEN","relationship":"PROPER_THEME","decisionSource":"PM12 fast closure curator lock","primaryArtId":"AO107","note":"Reuse locked: Rubens, The Great Last Judgement. Strong eschatological fit to Luke 21:25–33; no new curation required."},"Tempora/Epi2-0":{"properPath":"Tempora/Epi2-0","label":"Second Sunday after Epiphany","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","primaryArtId":"AO007","note":"Reuse locked: Veronese, The Wedding Feast at Cana. Exact John 2:1–11 subject. AO007 is promoted from the existing production register into this closure overlay."},"Tempora/Pent06-0":{"properPath":"Tempora/Pent06-0","label":"Sixth Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","primaryArtId":"AO010","note":"Reuse locked: Lanfranco, The Miracle of the Loaves and Fishes. Direct feeding-miracle subject for Mark 8:1–9."},"Sancti/08-06":{"properPath":"Sancti/08-06","label":"Transfiguration of Our Lord","status":"GREEN","relationship":"DAY_ART","decisionSource":"PM12 fast closure curator lock","primaryArtId":"AO008","note":"Reuse locked: Raphael, The Transfiguration. Exact feast subject; no duplicate curation."},"Tempora/PentEpi3-0":{"properPath":"Tempora/PentEpi3-0","label":"Resumed Third Sunday after Epiphany","status":"INHERIT_BASE","relationship":"INHERIT_BASE","decisionSource":"PM12 fast closure curator lock","inheritFrom":"Tempora/Epi3-0","note":"Inheritance rule locked. Resolves only when the base Third Sunday after Epiphany receives a final GREEN/NO_ART/HOLD decision."},"Tempora/PentEpi4-0":{"properPath":"Tempora/PentEpi4-0","label":"Resumed Fourth Sunday after Epiphany","status":"INHERIT_BASE","relationship":"INHERIT_BASE","decisionSource":"PM12 fast closure curator lock","inheritFrom":"Tempora/Epi4-0","note":"Inheritance rule locked. Currently resolves to AO082 through the already-locked Fourth Sunday after Epiphany."},"Tempora/PentEpi5-0":{"properPath":"Tempora/PentEpi5-0","label":"Resumed Fifth Sunday after Epiphany","status":"INHERIT_BASE","relationship":"INHERIT_BASE","decisionSource":"PM12 fast closure curator lock","inheritFrom":"Tempora/Epi5-0","note":"Inheritance rule locked. Resolves only when the base Fifth Sunday after Epiphany receives a final decision."},"Tempora/PentEpi6-0":{"properPath":"Tempora/PentEpi6-0","label":"Resumed Sixth Sunday after Epiphany","status":"INHERIT_BASE","relationship":"INHERIT_BASE","decisionSource":"PM12 fast closure curator lock","inheritFrom":"Tempora/Epi6-0","note":"Inheritance rule locked. Resolves only when the base Sixth Sunday after Epiphany receives a final decision."},"Tempora/Pasc4-0":{"properPath":"Tempora/Pasc4-0","label":"Fourth Sunday after Easter","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","note":"Intentional NO_ART: John 16:5–14 is discourse; prefer no image to a fabricated or generic scene."},"Tempora/Pasc5-0":{"properPath":"Tempora/Pasc5-0","label":"Fifth Sunday after Easter","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","note":"Intentional NO_ART: John 16:23–30 is discourse/prayer teaching; no weak generic Christ image."},"Tempora/Pent05-0":{"properPath":"Tempora/Pent05-0","label":"Fifth Sunday after Pentecost","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","note":"Intentional NO_ART: Matthew 5:20–24 is teaching on reconciliation before offering; no invented scene."},"Tempora/Pent17-0":{"properPath":"Tempora/Pent17-0","label":"Seventeenth Sunday after Pentecost","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","note":"Intentional NO_ART: Great Commandment / Son of David dialogue; no generic teaching image."},"Tempora/Quad5-0":{"properPath":"Tempora/Quad5-0","label":"Passion Sunday","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","note":"Intentional NO_ART: John 8:46–59 dispute; earlier programme analysis already favored no art."},"Tempora/Quadp1-0":{"properPath":"Tempora/Quadp1-0","label":"Septuagesima Sunday","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"PM12 fast closure curator lock","note":"Intentional NO_ART: labourers in the vineyard; reject generic vineyard imagery."}});
const ARTWORKS=Object.freeze({"AO007":{"artId":"AO007","title":"The Wedding Feast at Cana","artist":"Paolo Veronese","institution":"Musée du Louvre","file":"Les Noces de Cana - Paolo Veronese - Musée du Louvre Peintures INV 142 ; MR 384.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Les_Noces_de_Cana_-_Paolo_Veronese_-_Mus%C3%A9e_du_Louvre_Peintures_INV_142_;_MR_384.jpg","license":"Public Domain","rights":"PDM","attribution":null,"width":10068,"height":6742,"provenance":"AO-SACRED-ART-PRODUCTION-REGISTER-v10.json; Commons file verified during v42.5 QA"}});
const baseHomeMarkup=art.homeMarkup.bind(art);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const thumb=(file,width)=>file?`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`:'';
function resolveRow(path){
 const r=ROWS[path];
 if(!r)return null;
 if(r.status!=='INHERIT_BASE')return r;
 const base=art.data?.rows?.[r.inheritFrom];
 if(!base)return Object.freeze({...r,status:'INHERIT_PENDING'});
 if(base.status==='GREEN'&&base.primaryArtId)return Object.freeze({...r,status:'GREEN',relationship:base.relationship||'GOSPEL_ART',primaryArtId:base.primaryArtId,note:`${r.note} Inherited effective primary: ${base.primaryArtId}.`});
 if(base.status==='NO_ART')return Object.freeze({...r,status:'NO_ART',note:`${r.note} Base row is intentional NO_ART.`});
 if(base.status==='HOLD')return Object.freeze({...r,status:'HOLD',primaryArtId:base.primaryArtId||null,note:`${r.note} Base row is HOLD; render none.`});
 return Object.freeze({...r,status:'INHERIT_PENDING'});
}
function renderRow(path,r,lang='en'){
 if(!r||r.status!=='GREEN'||!r.primaryArtId)return '';
 const a=art.data?.artworks?.[r.primaryArtId]||ARTWORKS[r.primaryArtId];
 if(!a||!a.file||!a.sourcePage)return '';
 const license=a.license||a.rights||'',attribution=a.attribution||'';
 const attr=attribution&&/^CC BY/i.test(license)&&!attribution.toLowerCase().includes('cc by')?`${attribution} · ${license}`:(attribution||license);
 const alt=`${a.artist||''} — ${a.title||r.label||''}`;
 const ratio=(Number(a.width)||1)/(Number(a.height)||1),orientation=ratio<0.82?'isPortrait':ratio>1.22?'isLandscape':'isBalanced';
 const src=thumb(a.file,1280),s800=thumb(a.file,768),s1800=thumb(a.file,1800);
 return `<figure class="aoProperArt ${orientation}" data-ao-proper-art="${esc(r.primaryArtId)}" data-proper-path="${esc(path)}"><div class="aoProperArtMedia"><img src="${esc(src)}" srcset="${esc(s800)} 768w, ${esc(src)} 1280w, ${esc(s1800)} 1800w" sizes="(max-width:560px) 100vw, 720px" alt="${esc(alt)}" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('figure')?.remove()"></div><figcaption><span><strong>${esc(a.artist||'')}</strong>${a.title?` · ${esc(a.title)}`:''}${attr?`<br><small>${esc(attr)}</small>`:''}</span><a href="${esc(a.sourcePage)}" target="_blank" rel="noopener noreferrer">${lang==='fr'?'Source':'Source'} ↗</a></figcaption></figure>`;
}
function homeMarkup(state,lang='en'){
 const path=art.properPath(state),r=resolveRow(path);
 if(!r)return baseHomeMarkup(state,lang);
 return renderRow(path,r,lang);
}
function effectiveRows(){
 const merged={...art.data.rows};
 for(const path of Object.keys(ROWS))merged[path]=resolveRow(path);
 return merged;
}
function effectiveArtwork(id){return art.data?.artworks?.[id]||ARTWORKS[id]||null}
function inspect(){
 const resolved=Object.values(ROWS).map(r=>resolveRow(r.properPath));
 const overlay={
  total:resolved.length,
  green:resolved.filter(r=>r.status==='GREEN').length,
  noArt:resolved.filter(r=>r.status==='NO_ART').length,
  hold:resolved.filter(r=>r.status==='HOLD').length,
  inheritPending:resolved.filter(r=>r.status==='INHERIT_PENDING').length,
  inheritRules:Object.values(ROWS).filter(r=>r.status==='INHERIT_BASE').length,
  directReuse:Object.values(ROWS).filter(r=>r.status==='GREEN').length,
  promotedArtworkRecords:Object.keys(ARTWORKS).length
 };
 const base=art.inspect?.()||{};
 const effective={
  green:(base.green||0)+overlay.green,
  hold:(base.hold||0)+overlay.hold,
  noArt:(base.noArt||0)+overlay.noArt,
  inheritPending:overlay.inheritPending,
  rows:Object.keys(art.data?.rows||{}).length+overlay.total,
  artworks:Object.keys(art.data?.artworks||{}).length+Object.keys(ARTWORKS).filter(id=>!art.data?.artworks?.[id]).length
 };
 return {version:'phase1-fast-closure-b1-v1.1',overlay,effective,base,pass:overlay.total===14&&overlay.green===5&&overlay.noArt===6&&overlay.inheritPending===3&&overlay.inheritRules===4&&overlay.promotedArtworkRecords===1&&effective.green===52&&effective.hold===2&&effective.noArt===7&&effective.rows===64&&effective.artworks===50};
}
art.homeMarkup=homeMarkup;
art.effectiveRow=path=>resolveRow(String(path||''));
art.effectiveRows=effectiveRows;
art.effectiveArtwork=effectiveArtwork;
art.closureBatch='PM12-B1';
globalThis.AO_PHASE1_FAST_CLOSURE_B1=Object.freeze({version:'phase1-fast-closure-b1-v1.1',rows:ROWS,artworks:ARTWORKS,resolveRow,effectiveArtwork,inspect});
try{globalThis.AO_RUNTIME_V8?.controller?.home?.paint?.()}catch{}
})();
