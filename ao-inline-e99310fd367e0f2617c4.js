
(()=>{'use strict';
if(globalThis.AO_ART_QUALITY_V434)return;
const art=globalThis.AO_PHASE1_ART;
if(!art||typeof art.properPath!=='function'||typeof art.effectiveRows!=='function'||typeof art.effectiveArtworks!=='function')return;
const SOURCE_UPGRADES=Object.freeze({"AO008":{"file":"Raffael-verklärung-christi.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Raffael-verkl%C3%A4rung-christi.jpg","width":3737,"height":5691,"license":"Public Domain","rights":"PD-old / PDM","attribution":null,"deliverySource":"high-resolution straight reproduction","qualityGate":"PASS_HIRES_SOURCE"},"AO092":{"file":"Jews Mourning in Exile - Eduard Bendemann - Wallraf-Richartz-Museum & Fondation Corboud-6071 (without frame).jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Jews_Mourning_in_Exile_-_Eduard_Bendemann_-_Wallraf-Richartz-Museum_&_Fondation_Corboud-6071_(without_frame).jpg","width":4578,"height":2979,"license":"Public Domain","rights":"PD-Art / PD-old","attribution":null,"deliverySource":"high-resolution cropped museum photograph, frame removed","qualityGate":"PASS_HIRES_SOURCE"},"AO126":{"file":"Pieter Bruegel de Oude - Gelijkenis van de zaaier, 1557, Timken Museum of Art.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_de_Oude_-_Gelijkenis_van_de_zaaier,_1557,_Timken_Museum_of_Art.jpg","width":2000,"height":1430,"license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"deliverySource":"higher-resolution straight reproduction","qualityGate":"PASS_HIRES_SOURCE"},"AO135":{"file":"L'adoration des bergers (La Tour).jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:L'adoration_des_bergers_(La_Tour).jpg","width":4010,"height":3251,"license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"deliverySource":"high-resolution straight reproduction","qualityGate":"PASS_HIRES_SOURCE"}});
const NEW_ART=Object.freeze({"AO147":{"artId":"AO147","title":"The Parable of the Lost Sheep","artist":"John Atkinson Grimshaw","institution":"Princeton University Art Museum","date":"late 1860s","medium":"Oil on canvas","accession":"y1990-77","file":"John Atkinson Grimshaw - The Parable of the Lost Sheep - y1990-77 - Princeton University Art Museum.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:John_Atkinson_Grimshaw_-_The_Parable_of_the_Lost_Sheep_-_y1990-77_-_Princeton_University_Art_Museum.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":4220,"height":3286,"roles":["GOSPEL_ART"],"deliverySource":"Princeton University Art Museum master","qualityGate":"PASS_MUSEUM_MASTER"},"AO148":{"artId":"AO148","title":"Christ Healing a Man with Dropsy — Dominica XVI Post Pentecost","artist":"Antonie Wierix II, after Bernardino Passeri","institution":"Rijksmuseum, Amsterdam","date":"1593","medium":"Engraving","accession":"RP-P-OB-67.177","file":"Christus geneest een man met waterzucht Dominica XVI. Post Pentecost (titel op object), RP-P-OB-67.177.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Christus_geneest_een_man_met_waterzucht_Dominica_XVI._Post_Pentecost_(titel_op_object),_RP-P-OB-67.177.jpg","license":"CC0 / Public Domain","rights":"CC0 1.0","attribution":null,"width":4400,"height":6774,"roles":["GOSPEL_ART"],"deliverySource":"Rijksmuseum digitisation","qualityGate":"PASS_MUSEUM_MASTER"},"AO149":{"artId":"AO149","title":"Landscape with Christ Exorcising a Mute Man","artist":"Jan van Londerseel, after David Vinckboons I","institution":"Rijksmuseum, Amsterdam","date":"c. 1601–1625","medium":"Engraving","accession":"RP-P-2015-15","file":"Landschap met Christus die een demon uitdrijft bij een stomme man, RP-P-2015-15.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Landschap_met_Christus_die_een_demon_uitdrijft_bij_een_stomme_man,_RP-P-2015-15.jpg","license":"CC0 / Public Domain","rights":"CC0 1.0","attribution":null,"width":7024,"height":5082,"roles":["GOSPEL_ART"],"deliverySource":"Rijksmuseum digitisation","qualityGate":"PASS_MUSEUM_MASTER"},"AO150":{"artId":"AO150","title":"Cyrus Restores the Vessels of the Temple","artist":"Gustave Doré","institution":"Doré Bible / public-domain high-resolution reproduction","date":"1866","medium":"Wood engraving","accession":null,"file":"104.Cyrus Restores the Vessels of the Temple.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:104.Cyrus_Restores_the_Vessels_of_the_Temple.jpg","license":"Public Domain","rights":"PD-Art / PD-old","attribution":null,"width":2323,"height":2927,"roles":["INTROIT_ART"],"deliverySource":"faithful high-resolution public-domain reproduction of Doré Bible engraving","qualityGate":"PASS_HIRES_SOURCE"},"AO151":{"artId":"AO151","title":"The Sermon on the Mount","artist":"Jan Brueghel the Elder","institution":"J. Paul Getty Museum","date":"1598","medium":"Oil on copper","accession":"84.PC.71","file":"Jan Brueghel the Elder - The Sermon on the Mount - Google Art Project.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Jan_Brueghel_the_Elder_-_The_Sermon_on_the_Mount_-_Google_Art_Project.jpg","license":"Public Domain","rights":"PD-Art / Google Art Project","attribution":null,"width":4366,"height":3205,"roles":["GOSPEL_ART"],"deliverySource":"Getty / Google Art Project high-resolution museum reproduction","qualityGate":"PASS_MUSEUM_MASTER"},"AO152":{"artId":"AO152","title":"Daniel's Prayer","artist":"After Sir Edward John Poynter; engraved by the Dalziel Brothers","institution":"The Metropolitan Museum of Art","date":"1865–1881","medium":"Wood engraving on India paper, mounted on thin card","accession":"26.99.1(67)","file":"Daniel's Prayer (Dalziels' Bible Gallery) MET DP835898.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Daniel%27s_Prayer_(Dalziels%27_Bible_Gallery)_MET_DP835898.jpg","license":"CC0 / Public Domain","rights":"CC0 1.0 / The Met Open Access","attribution":null,"width":2940,"height":3664,"roles":["OFFERTORY_ART"],"deliverySource":"Metropolitan Museum of Art Open Access master","qualityGate":"PASS_MUSEUM_MASTER"}});
const ROWS=Object.freeze({"Tempora/Pent03-0":{"properPath":"Tempora/Pent03-0","label":"Third Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v43.3 delivery-quality replacement","primaryArtId":"AO147","note":"Exact Lost Sheep subject retained, but the 525×719 Fetti delivery is superseded by Princeton's 4220×3286 public-domain Grimshaw museum master."},"Tempora/Pent16-0":{"properPath":"Tempora/Pent16-0","label":"Sixteenth Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v43.3 delivery-quality replacement","primaryArtId":"AO148","note":"The low-resolution Monreale crop is superseded by the Rijksmuseum 4400×6774 engraving explicitly titled Dominica XVI Post Pentecost and depicting Luke 14:2–4."},"Tempora/Quad3-0":{"properPath":"Tempora/Quad3-0","label":"Third Sunday of Lent","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v43.3 delivery-quality replacement","primaryArtId":"AO149","note":"The 376×550 Monreale crop is superseded by a 7024×5082 Rijksmuseum engraving explicitly keyed to Luke 11:14 and Matthew 9:32."},"Tempora/Pasc5-0":{"properPath":"Tempora/Pasc5-0","label":"Fifth Sunday after Easter","status":"GREEN","relationship":"INTROIT_ART","decisionSource":"v43.4 full Proper-art closure","primaryArtId":"AO150","note":"Whole-Proper closure: Gospel remains difficult to depict exactly. The Introit is Isaiah 48:20, proclaiming the Lord’s deliverance of His people; Doré’s Cyrus restoring the Temple vessels depicts the Return from Babylon that forms the immediate scriptural deliverance context."},"Tempora/Pent05-0":{"properPath":"Tempora/Pent05-0","label":"Fifth Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v43.4 full Proper-art closure","primaryArtId":"AO151","note":"Exact appointed Gospel context: Matthew 5:20–24 belongs to the Sermon on the Mount; Brueghel’s Getty painting is explicitly The Sermon on the Mount."},"Tempora/Pent17-0":{"properPath":"Tempora/Pent17-0","label":"Seventeenth Sunday after Pentecost","status":"GREEN","relationship":"OFFERTORY_ART","decisionSource":"v43.4 full Proper-art closure","primaryArtId":"AO152","note":"Whole-Proper closure: rather than force a generic Pharisee scene for Matthew 22:34–46, use the Offertory’s Daniel prayer text. The Met work is explicitly titled Daniel’s Prayer and has a clean Open Access master."}});
const priorEffectiveRow=art.effectiveRow.bind(art),priorEffectiveRows=art.effectiveRows.bind(art),priorEffectiveArtwork=art.effectiveArtwork.bind(art),priorEffectiveArtworks=art.effectiveArtworks.bind(art);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const thumb=(file,width)=>file?`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`:'';
function effectiveRow(path){return ROWS[String(path||'')]||priorEffectiveRow(path)||null}
function effectiveRows(){return Object.assign({},priorEffectiveRows(),ROWS)}
function effectiveArtwork(id){
 id=String(id||'');
 if(NEW_ART[id])return NEW_ART[id];
 const base=priorEffectiveArtwork(id);
 if(SOURCE_UPGRADES[id])return Object.assign({},base||{artId:id},SOURCE_UPGRADES[id]);
 return base||null;
}
function effectiveArtworks(){
 const all=Object.assign({},priorEffectiveArtworks(),NEW_ART);
 for(const id of Object.keys(SOURCE_UPGRADES))all[id]=Object.assign({},all[id]||{artId:id},SOURCE_UPGRADES[id]);
 return all;
}
function renderRow(path,r,lang='en'){
 if(!r||r.status!=='GREEN'||!r.primaryArtId)return '';
 const a=effectiveArtwork(r.primaryArtId);if(!a||!a.file||!a.sourcePage)return '';
 const license=a.license||a.rights||'',attribution=a.attribution||'';
 const attr=attribution&&/^CC BY/i.test(license)&&!attribution.toLowerCase().includes('cc by')?`${attribution} · ${license}`:(attribution||license);
 const alt=`${a.artist||''} — ${a.title||r.label||''}`;
 const ratio=(Number(a.width)||1)/(Number(a.height)||1),orientation=ratio<0.82?'isPortrait':ratio>1.22?'isLandscape':'isBalanced';
 const nativeW=Number(a.width)||768,loW=Math.min(nativeW,768),midW=Math.min(nativeW,1280),hiW=Math.min(nativeW,1800);
 const slo=thumb(a.file,loW),smid=thumb(a.file,midW),shi=thumb(a.file,hiW);
 return `<figure class="aoProperArt ${orientation}" data-ao-proper-art="${esc(r.primaryArtId)}" data-proper-path="${esc(path)}"><div class="aoProperArtMedia"><img src="${esc(smid)}" srcset="${esc(slo)} ${loW}w, ${esc(smid)} ${midW}w, ${esc(shi)} ${hiW}w" sizes="(max-width:560px) 100vw, 720px" alt="${esc(alt)}" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('figure')?.remove()"></div><figcaption><span><strong>${esc(a.artist||'')}</strong>${a.title?` · ${esc(a.title)}`:''}${attr?`<br><small>${esc(attr)}</small>`:''}</span><a href="${esc(a.sourcePage)}" target="_blank" rel="noopener noreferrer">${lang==='fr'?'Source':'Source'} ↗</a></figcaption></figure>`;
}
function homeMarkup(state,lang='en'){const path=art.properPath(state),r=effectiveRow(path);return r?.status==='GREEN'?renderRow(path,r,lang):''}
function maxRenderedSize(a){
 const w=Number(a?.width)||0,h=Number(a?.height)||0;if(!w||!h)return {w:0,h:0};
 const ratio=w/h;let maxH=ratio<0.82?390:(ratio>1.22?250:280),rw=ratio*maxH,rh=maxH;
 if(rw>720){rw=720;rh=720/ratio}
 return {w:rw,h:rh};
}
function densityFactor(a){const r=maxRenderedSize(a),w=Number(a?.width)||0,h=Number(a?.height)||0;return (!r.w||!r.h)?0:Math.min(w/r.w,h/r.h)}
function inspect(){
 const rows=effectiveRows(),artworks=effectiveArtworks(),vals=Object.values(rows).filter(Boolean);
 const activeIds=[...new Set(vals.filter(r=>r.status==='GREEN'&&r.primaryArtId).map(r=>r.primaryArtId))];
 const missing=activeIds.filter(id=>{const a=effectiveArtwork(id);return !a||!a.file||!a.sourcePage||!Number(a.width)||!Number(a.height)});
 const under2x=activeIds.map(id=>[id,densityFactor(effectiveArtwork(id))]).filter(x=>x[1]<2);
 const retiredLowResStillActive=['AO123','AO144','AO145'].filter(id=>activeIds.includes(id));
 const checks={
  rows:vals.length===93,
  green:vals.filter(r=>r.status==='GREEN').length===93,
  hold:vals.filter(r=>r.status==='HOLD').length===0,
  noArt:vals.filter(r=>r.status==='NO_ART').length===0,
  pending:vals.filter(r=>r.status==='INHERIT_PENDING').length===0,
  artworks:Object.keys(artworks).length===85,
  lostSheep:effectiveRow('Tempora/Pent03-0')?.primaryArtId==='AO147',
  pent16:effectiveRow('Tempora/Pent16-0')?.primaryArtId==='AO148',
  lent3:effectiveRow('Tempora/Quad3-0')?.primaryArtId==='AO149',
  easter5:effectiveRow('Tempora/Pasc5-0')?.primaryArtId==='AO150'&&effectiveRow('Tempora/Pasc5-0')?.relationship==='INTROIT_ART',
  pent5:effectiveRow('Tempora/Pent05-0')?.primaryArtId==='AO151'&&effectiveRow('Tempora/Pent05-0')?.relationship==='GOSPEL_ART',
  pent17:effectiveRow('Tempora/Pent17-0')?.primaryArtId==='AO152'&&effectiveRow('Tempora/Pent17-0')?.relationship==='OFFERTORY_ART',
  sourceUpgrades:['AO008','AO092','AO126','AO135'].every(id=>SOURCE_UPGRADES[id]&&effectiveArtwork(id)?.qualityGate==='PASS_HIRES_SOURCE'),
  noMissingActiveSources:missing.length===0,
  activeDensity2x:under2x.length===0,
  lowResPrimariesRetired:retiredLowResStillActive.length===0
 };
 return {version:'43.4-proper-art-complete',pass:Object.values(checks).every(Boolean),counts:{rows:vals.length,green:vals.filter(r=>r.status==='GREEN').length,hold:vals.filter(r=>r.status==='HOLD').length,noArt:vals.filter(r=>r.status==='NO_ART').length,inheritPending:vals.filter(r=>r.status==='INHERIT_PENDING').length,artworks:Object.keys(artworks).length,activeArtworkIds:activeIds.length},quality:{minimumDisplayDensity:2,missing,under2x,retiredLowResStillActive},checks};
}
art.effectiveRow=effectiveRow;art.effectiveRows=effectiveRows;art.effectiveArtwork=effectiveArtwork;art.effectiveArtworks=effectiveArtworks;art.homeMarkup=homeMarkup;art.closureBatch='PROPER-ART-COMPLETE-v43.4';
globalThis.AO_ART_QUALITY_V434=Object.freeze({version:'43.4-proper-art-complete',rows:ROWS,newArtworks:NEW_ART,sourceUpgrades:SOURCE_UPGRADES,inspect,densityFactor});
globalThis.AO_ART_QUALITY_V433=globalThis.AO_ART_QUALITY_V434;
try{globalThis.AO_RUNTIME_V8?.controller?.home?.paint?.()}catch{}
})();
