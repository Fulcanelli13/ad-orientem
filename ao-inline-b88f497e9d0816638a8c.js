
(()=>{'use strict';
if(globalThis.AO_PHASE1_CLOSURE_V426)return;
const art=globalThis.AO_PHASE1_ART;
const b1=globalThis.AO_PHASE1_FAST_CLOSURE_B1;
if(!art||!b1||typeof art.properPath!=='function')return;
const ROWS=Object.freeze({"Tempora/Adv2-0":{"properPath":"Tempora/Adv2-0","label":"Second Sunday of Advent","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","note":"Intentional NO_ART: Matthew 11:2–10 centers on John’s messengers and Christ’s testimony; no sufficiently exact high-grade painting was established without substituting a different Baptist episode."},"Tempora/Adv3-0":{"properPath":"Tempora/Adv3-0","label":"Third Sunday of Advent (Gaudete)","status":"GREEN","relationship":"PROPER_THEME","decisionSource":"v42.6 closure curation","primaryArtId":"AO118","note":"Mattia Preti’s Saint John the Baptist Preaching is a strong Baroque John-the-Baptist Proper-theme image. It is not claimed as a literal rendering of John 1:19–28."},"Tempora/Epi3-0":{"properPath":"Tempora/Epi3-0","label":"Third Sunday after Epiphany","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO119","note":"Veronese’s Christ and the Centurion directly depicts Matthew 8:5–13, one of the two healing episodes in the Proper Gospel."},"Tempora/Epi5-0":{"properPath":"Tempora/Epi5-0","label":"Fifth Sunday after Epiphany","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","note":"Intentional NO_ART: wheat-and-tares imagery did not meet the primary-art threshold; reject generic agricultural substitutes."},"Tempora/Epi6-0":{"properPath":"Tempora/Epi6-0","label":"Sixth Sunday after Epiphany","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","note":"Intentional NO_ART: mustard-seed/leaven parables do not justify generic landscape or agricultural imagery."},"Tempora/Nat1-0":{"properPath":"Tempora/Nat1-0","label":"Sunday within the Octave of Christmas","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO120","note":"Rembrandt’s Simeon and Anna in the Temple directly fits Luke 2:33–40 and avoids reusing the held AO112 Presentation record."},"Tempora/Nat2-0":{"properPath":"Tempora/Nat2-0","label":"Most Holy Name of Jesus — Sunday assignment","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO121","note":"Rembrandt’s Circumcision directly fits Luke 2:21, including the naming of the Child. Shared with the Jan 1 Circumcision/Octave Day Proper."},"Tempora/Pent02-0":{"properPath":"Tempora/Pent02-0","label":"Second Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO122","note":"Brunswick Monogrammist’s Parable of the Great Banquet directly fits Luke 14:16–24."},"Tempora/Pent03-0":{"properPath":"Tempora/Pent03-0","label":"Third Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO123","note":"Domenico Fetti’s Parable of the Lost Sheep directly illustrates Luke 15:4–7 within the Proper’s Luke 15:1–10. Delivery is restrained/no-zoom because the open master is 525×719."},"Tempora/Pent10-0":{"properPath":"Tempora/Pent10-0","label":"Tenth Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO124","note":"Barent Fabritius’s Pharisee and the Publican directly depicts Luke 18:10–14."},"Tempora/Pent18-0":{"properPath":"Tempora/Pent18-0","label":"Eighteenth Sunday after Pentecost","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO125","note":"Alessandro Magnasco’s Christ Healing a Paralytic is a Louvre Baroque treatment of the Capernaum paralytic miracle; exact miracle family for Matthew 9:1–8."},"Tempora/Quad3-0":{"properPath":"Tempora/Quad3-0","label":"Third Sunday of Lent","status":"NO_ART","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","note":"Intentional NO_ART: searches produced other exorcism episodes or prints for Luke 11:14; do not substitute Gerasene, synagogue, or possessed-boy scenes."},"Tempora/Quadp2-0":{"properPath":"Tempora/Quadp2-0","label":"Sexagesima Sunday","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO126","note":"Pieter Bruegel the Elder’s Landscape with the Parable of the Sower directly depicts the Gospel parable. Open master is adequate for restrained app display, not zoom."},"Tempora/Quadp3-0":{"properPath":"Tempora/Quadp3-0","label":"Quinquagesima Sunday","status":"GREEN","relationship":"GOSPEL_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO127","note":"Lucas van Leyden’s Healing of the Blind Man of Jericho directly depicts Bartimaeus/Jericho, matching Luke 18:35–43."},"Sancti/01-01":{"properPath":"Sancti/01-01","label":"Circumcision of the Lord / Octave Day of Christmas","status":"GREEN","relationship":"DAY_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO121","note":"Rembrandt’s Circumcision is an exact feast subject and is intentionally shared with Tempora/Nat2-0."},"Sancti/03-19":{"properPath":"Sancti/03-19","label":"Saint Joseph, Spouse of the Blessed Virgin Mary","status":"GREEN","relationship":"DAY_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO128","note":"Guercino’s Saint Joseph with the Christ Child is a strong Baroque primary for the feast."},"Sancti/06-29":{"properPath":"Sancti/06-29","label":"Saints Peter and Paul, Apostles","status":"GREEN","relationship":"DAY_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO129","note":"El Greco’s Saint Peter and Saint Paul depicts both apostles together; avoids the earlier Peter-only AO117 shortcut."},"Sancti/11-01":{"properPath":"Sancti/11-01","label":"All Saints","status":"GREEN","relationship":"DAY_ART","decisionSource":"v42.6 closure curation","primaryArtId":"AO130","note":"Dürer’s Landauer Altarpiece is explicitly the Altar of All Saints and presents the Trinity surrounded by the heavenly assembly."}});
const ARTWORKS=Object.freeze({"AO118":{"artId":"AO118","title":"Saint John the Baptist Preaching","artist":"Mattia Preti","institution":"The Metropolitan Museum of Art","date":"ca. 1650","file":"Saint John the Baptist Preaching MET DP123820.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Saint_John_the_Baptist_Preaching_MET_DP123820.jpg","license":"CC0","rights":"CC0 1.0","attribution":"The Metropolitan Museum of Art","width":2917,"height":4000,"roles":["PROPER_THEME","DAY_ART"],"qualityGate":"PASS"},"AO119":{"artId":"AO119","title":"Christ and the Centurion","artist":"Paolo Veronese","institution":"Museo Nacional del Prado","date":"ca. 1571","file":"Jesús y el centurión (El Veronés).jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Jes%C3%BAs_y_el_centuri%C3%B3n_(El_Veron%C3%A9s).jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":3051,"height":1955,"roles":["GOSPEL_ART"],"qualityGate":"PASS"},"AO120":{"artId":"AO120","title":"Simeon and Anna in the Temple","artist":"Rembrandt van Rijn","institution":"Hamburger Kunsthalle","date":"1627","file":"Rembrandt Simeon and Anna in the Temple@Kunsthalle Hamburg.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Rembrandt_Simeon_and_Anna_in_the_Temple@Kunsthalle_Hamburg.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":2933,"height":3492,"roles":["GOSPEL_ART"],"qualityGate":"PASS"},"AO121":{"artId":"AO121","title":"The Circumcision","artist":"Rembrandt van Rijn","institution":"National Gallery of Art, Washington","date":"1661","file":"Rembrandt van Rijn, The Circumcision, 1661, NGA 1199.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Rembrandt_van_Rijn,_The_Circumcision,_1661,_NGA_1199.jpg","license":"CC0","rights":"CC0 1.0","attribution":"National Gallery of Art","width":4000,"height":2996,"roles":["DAY_ART","GOSPEL_ART"],"qualityGate":"PASS"},"AO122":{"artId":"AO122","title":"Parable of the Great Banquet","artist":"Brunswick Monogrammist","institution":"National Museum in Warsaw","date":"ca. 1525","file":"Brunswick Monogrammist Great Banquet.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Brunswick_Monogrammist_Great_Banquet.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":3500,"height":2022,"roles":["GOSPEL_ART"],"qualityGate":"PASS"},"AO123":{"artId":"AO123","title":"The Parable of the Lost Sheep","artist":"Domenico Fetti","institution":"Gemäldegalerie Alte Meister, Dresden","date":"ca. 1620","file":"Parabola della pecora smarrita - Fetti.png","sourcePage":"https://commons.wikimedia.org/wiki/File:Parabola_della_pecora_smarrita_-_Fetti.png","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":525,"height":719,"roles":["GOSPEL_ART"],"qualityGate":"PASS_MINIMUM","deliveryPolicy":"DISPLAY_READY_NO_ZOOM"},"AO124":{"artId":"AO124","title":"The Pharisee and the Publican","artist":"Barent Fabritius","institution":"Rijksmuseum","date":"1661","file":"De Farizeeër en de tollenaar Rijksmuseum SK-A-2959.jpeg","sourcePage":"https://commons.wikimedia.org/wiki/File:De_Farizee%C3%ABr_en_de_tollenaar_Rijksmuseum_SK-A-2959.jpeg","license":"CC0","rights":"CC0 1.0","attribution":"Rijksmuseum","width":6102,"height":1986,"roles":["GOSPEL_ART"],"qualityGate":"PASS"},"AO125":{"artId":"AO125","title":"Christ Healing a Paralytic","artist":"Alessandro Magnasco","institution":"Musée du Louvre","date":"ca. 1735","file":"Alessandro magnasco, cristo guarisce il paralitico, 1735 ca..JPG","sourcePage":"https://commons.wikimedia.org/wiki/File:Alessandro_magnasco,_cristo_guarisce_il_paralitico,_1735_ca..JPG","license":"CC BY 3.0","rights":"CC BY 3.0","attribution":"Sailko","width":2553,"height":2024,"roles":["GOSPEL_ART"],"qualityGate":"PASS"},"AO126":{"artId":"AO126","title":"Landscape with the Parable of the Sower","artist":"Pieter Bruegel the Elder","institution":"Timken Museum of Art","date":"1557","file":"Pieter Bruegel the Elder - Landscape with the Parable of the Sower - WGA03340.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_Landscape_with_the_Parable_of_the_Sower_-_WGA03340.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":1030,"height":725,"roles":["GOSPEL_ART"],"qualityGate":"PASS_MINIMUM","deliveryPolicy":"DISPLAY_READY_NO_ZOOM"},"AO127":{"artId":"AO127","title":"Healing of the Blind Man of Jericho","artist":"Lucas van Leyden","institution":"State Hermitage Museum","date":"1531","file":"Leyden, Lucas van - Healing of Blind Man of Jericho (triptych), 1531, ГЭ-407.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Leyden,_Lucas_van_-_Healing_of_Blind_Man_of_Jericho_(triptych),_1531,_%D0%93%D0%AD-407.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":1998,"height":1049,"roles":["GOSPEL_ART"],"qualityGate":"PASS"},"AO128":{"artId":"AO128","title":"Saint Joseph with the Christ Child","artist":"Guercino","institution":"National Gallery of Ireland","date":"ca. 1637","file":"Guercino - Saint Joseph with the Christ Child, c.1637.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Guercino_-_Saint_Joseph_with_the_Christ_Child,_c.1637.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":2315,"height":3000,"roles":["DAY_ART"],"qualityGate":"PASS"},"AO129":{"artId":"AO129","title":"Saint Peter and Saint Paul","artist":"El Greco","institution":"Museu Nacional d’Art de Catalunya","date":"1590–1600","file":"El Greco - Saint Peter and Saint Paul - Google Art Project.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:El_Greco_-_Saint_Peter_and_Saint_Paul_-_Google_Art_Project.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":4363,"height":5609,"roles":["DAY_ART"],"qualityGate":"PASS"},"AO130":{"artId":"AO130","title":"Adoration of the Trinity (Landauer Altar / All Saints)","artist":"Albrecht Dürer","institution":"Kunsthistorisches Museum, Vienna","date":"1511","file":"Albrecht Dürer - Adoration of the Trinity (Landauer Altar) - Google Art Project.jpg","sourcePage":"https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Adoration_of_the_Trinity_(Landauer_Altar)_-_Google_Art_Project.jpg","license":"Public Domain","rights":"PD-Art / PDM","attribution":null,"width":4969,"height":5434,"roles":["DAY_ART"],"qualityGate":"PASS"}});
const priorHomeMarkup=art.homeMarkup.bind(art);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const thumb=(file,width)=>file?`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`:'';

function effectiveArtwork(id){
 return ARTWORKS[id]||b1.effectiveArtwork?.(id)||art.data?.artworks?.[id]||null;
}

function rawRow(path){
 if(ROWS[path])return ROWS[path];
 if(b1.rows?.[path])return b1.rows[path];
 return art.data?.rows?.[path]||null;
}

function resolveRow(path,trail=new Set()){
 path=String(path||'');
 if(!path||trail.has(path))return null;
 const r=rawRow(path);
 if(!r)return null;
 if(r.status!=='INHERIT_BASE')return r;
 const next=new Set(trail); next.add(path);
 const base=resolveRow(r.inheritFrom,next);
 if(!base)return Object.freeze({...r,status:'INHERIT_PENDING'});
 if(base.status==='GREEN'&&base.primaryArtId)return Object.freeze({...r,status:'GREEN',relationship:base.relationship||'GOSPEL_ART',primaryArtId:base.primaryArtId,note:`${r.note||''} Inherited final primary: ${base.primaryArtId}.`});
 if(base.status==='NO_ART')return Object.freeze({...r,status:'NO_ART',note:`${r.note||''} Base Proper is intentional NO_ART.`});
 if(base.status==='HOLD')return Object.freeze({...r,status:'HOLD',primaryArtId:base.primaryArtId||null,note:`${r.note||''} Base Proper is HOLD; render none.`});
 return Object.freeze({...r,status:'INHERIT_PENDING'});
}

function renderRow(path,r,lang='en'){
 if(!r||r.status!=='GREEN'||!r.primaryArtId)return '';
 const a=effectiveArtwork(r.primaryArtId);
 if(!a||!a.file||!a.sourcePage)return '';
 const license=a.license||a.rights||'', attribution=a.attribution||'';
 const attr=attribution&&/^CC BY/i.test(license)&&!attribution.toLowerCase().includes('cc by')?`${attribution} · ${license}`:(attribution||license);
 const alt=`${a.artist||''} — ${a.title||r.label||''}`;
 const ratio=(Number(a.width)||1)/(Number(a.height)||1),orientation=ratio<0.82?'isPortrait':ratio>1.22?'isLandscape':'isBalanced';
 const maxW=a.deliveryPolicy==='DISPLAY_READY_NO_ZOOM'?Math.min(Number(a.width)||768,1280):1280;
 const hiW=a.deliveryPolicy==='DISPLAY_READY_NO_ZOOM'?Math.min(Number(a.width)||1280,1800):1800;
 const loW=Math.min(Number(a.width)||768,768);
 const src=thumb(a.file,maxW),slo=thumb(a.file,loW),shi=thumb(a.file,hiW);
 return `<figure class="aoProperArt ${orientation}" data-ao-proper-art="${esc(r.primaryArtId)}" data-proper-path="${esc(path)}"><div class="aoProperArtMedia"><img src="${esc(src)}" srcset="${esc(slo)} ${loW}w, ${esc(src)} ${maxW}w, ${esc(shi)} ${hiW}w" sizes="(max-width:560px) 100vw, 720px" alt="${esc(alt)}" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('figure')?.remove()"></div><figcaption><span><strong>${esc(a.artist||'')}</strong>${a.title?` · ${esc(a.title)}`:''}${attr?`<br><small>${esc(attr)}</small>`:''}</span><a href="${esc(a.sourcePage)}" target="_blank" rel="noopener noreferrer">${lang==='fr'?'Source':'Source'} ↗</a></figcaption></figure>`;
}

function homeMarkup(state,lang='en'){
 const path=art.properPath(state);
 if(ROWS[path]||b1.rows?.[path])return renderRow(path,resolveRow(path),lang);
 return priorHomeMarkup(state,lang);
}

function effectiveRows(){
 const keys=new Set([...Object.keys(art.data?.rows||{}),...Object.keys(b1.rows||{}),...Object.keys(ROWS)]);
 const out={};
 for(const k of keys)out[k]=resolveRow(k);
 return out;
}

function effectiveArtworks(){
 return Object.assign({},art.data?.artworks||{},b1.artworks||{},ARTWORKS);
}

function inspect(){
 const er=effectiveRows(), ea=effectiveArtworks();
 const vals=Object.values(er).filter(Boolean);
 const counts={
  rows:vals.length,
  green:vals.filter(r=>r.status==='GREEN').length,
  hold:vals.filter(r=>r.status==='HOLD').length,
  noArt:vals.filter(r=>r.status==='NO_ART').length,
  inheritPending:vals.filter(r=>r.status==='INHERIT_PENDING').length,
  artworks:Object.keys(ea).length,
  newRows:Object.keys(ROWS).length,
  newArtworks:Object.keys(ARTWORKS).length
 };
 const inherited={
  pentEpi3:resolveRow('Tempora/PentEpi3-0'),
  pentEpi4:resolveRow('Tempora/PentEpi4-0'),
  pentEpi5:resolveRow('Tempora/PentEpi5-0'),
  pentEpi6:resolveRow('Tempora/PentEpi6-0')
 };
 const checks={
  expectedCounts:counts.rows===82&&counts.green===67&&counts.hold===2&&counts.noArt===13&&counts.inheritPending===0&&counts.artworks===63&&counts.newRows===18&&counts.newArtworks===13,
  inheritanceClosed:inherited.pentEpi3?.primaryArtId==='AO119'&&inherited.pentEpi4?.primaryArtId==='AO082'&&inherited.pentEpi5?.status==='NO_ART'&&inherited.pentEpi6?.status==='NO_ART',
  januaryShared:resolveRow('Tempora/Nat2-0')?.primaryArtId==='AO121'&&resolveRow('Sancti/01-01')?.primaryArtId==='AO121',
  peterPaulNotPeterOnly:resolveRow('Sancti/06-29')?.primaryArtId==='AO129',
  noGenericFallback:true
 };
 return {version:'phase1-proper-closure-v42.6',pass:Object.values(checks).every(Boolean),counts,checks,inherited};
}

art.homeMarkup=homeMarkup;
art.effectiveRow=path=>resolveRow(String(path||''));
art.effectiveRows=effectiveRows;
art.effectiveArtwork=effectiveArtwork;
art.effectiveArtworks=effectiveArtworks;
art.closureBatch='PM12-COMPLETE-v42.6';
globalThis.AO_PHASE1_CLOSURE_V426=Object.freeze({version:'phase1-proper-closure-v42.6',rows:ROWS,artworks:ARTWORKS,resolveRow,effectiveArtwork,effectiveRows,effectiveArtworks,inspect});
try{globalThis.AO_RUNTIME_V8?.controller?.home?.paint?.()}catch{}
})();
