// Curated narrative *order*: source entries are grouped by location, not ordered in time.
// No inferred year for primeval history; no invented pin for disputed/unlocated episodes.
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const ERAS={
 ORIGINS:["The Beginnings","Les origines","Creation and the first generations","La Création et les premières générations"],
 PATRIARCHS:["The Patriarchs","Les Patriarches","God's promise to Abraham","La promesse de Dieu à Abraham"],
 EXODUS:["The Exodus","L'Exode","Deliverance, wilderness and Covenant","La délivrance, le désert et l'Alliance"],
 ISRAEL:["Israel and the Prophets","Israël et les Prophètes","Sanctuary, kings and the prophets","Sanctuaire, rois et prophètes"],
 EXILE:["Exile and Restoration","Exil et restauration","Exile, return and fidelity","Exil, retour et fidélité"],
 INFANCY:["The Incarnation","L'Incarnation","Annunciation, Nativity and hidden life","Annonciation, Nativité et vie cachée"],
 PUBLIC:["The Public Ministry","La Vie publique","Teaching, miracles and journeys of Christ","Enseignement, miracles et voyages du Christ"],
 PASSION:["The Passion","La Passion","From Jerusalem to the Cross","De Jérusalem à la Croix"],
 RESURRECTION:["The Resurrection","La Résurrection","The Risen Lord and His Ascension","Le Seigneur ressuscité et son Ascension"],
 APOSTLES:["The Apostolic Church","L'Église apostolique","The Gospel reaches the nations","L'Évangile parvient aux nations"],
 REVELATION:["The Apocalypse","L'Apocalypse","St John's vision, not an earthly future itinerary","La vision de saint Jean, non un itinéraire terrestre futur"]
};
// [era, corpus place id, corpus event id, EN fallback title, FR fallback title, Scripture]
// Selected major milestones are explicitly sequenced: not an exhaustive harmony.
const SEQUENCE=[
 ["ORIGINS",null,null,"Creation","La Création","Genesis 1:1–2:3"],
 ["ORIGINS",null,null,"The Fall","La Chute","Genesis 3:1–24"],
 ["ORIGINS",null,null,"The Flood","Le Déluge","Genesis 6:9–9:17"],
 ["PATRIARCHS","ur",null,"Abraham's family leaves Ur","La famille d'Abraham quitte Ur","Genesis 11:31"],
 ["PATRIARCHS","hebron",null,"Abraham at Mamre","Abraham à Mambré","Genesis 18:1–8"],
 ["EXODUS",null,null,"The departure from Egypt","La sortie d'Égypte","Exodus 12:31–42"],
 ["EXODUS","sinai",null,"The Covenant at Sinai","L'Alliance au Sinaï","Exodus 19:16–20"],
 ["EXODUS","nebo",null,"Moses sees the Promised Land","Moïse voit la Terre promise","Deuteronomy 34:1–6"],
 ["ISRAEL","shiloh",null,"Hannah and Samuel","Anne et Samuel","1Samuel 1:9–20"],
 ["ISRAEL","carmel",null,"Elijah on Mount Carmel","Élie au mont Carmel","1Kings 18:19–39"],
 ["EXILE","nineveh",null,"Tobit in Nineveh","Tobie à Ninive","Tobit 1:10"],
 ["EXILE","babylon",null,"The exile in Babylon","L'exil à Babylone","2Kings 25:8–12"],
 ["EXILE","modein",null,"The Maccabean resistance","La résistance des Maccabées","1Maccabees 2:1–5"],
 ["INFANCY","nazareth","nazareth-e1"],
 ["INFANCY","ein-karem","ein-karem-e1"],
 ["INFANCY","bethlehem","bethlehem-e1"],
 ["INFANCY","jerusalem-temple","jerusalem-temple-e1"],
 ["INFANCY","bethlehem","bethlehem-e2"],
 ["INFANCY","egypt","egypt-e1"],
 ["INFANCY","jerusalem-temple","jerusalem-temple-e2"],
 ["PUBLIC","jordan-baptism","jordan-baptism-e1"],
 ["PUBLIC","judean-wilderness","judean-wilderness-e1"],
 ["PUBLIC","cana","cana-e1"],
 ["PUBLIC","capernaum","capernaum-e1"],
 ["PUBLIC","galilee-sea","galilee-sea-e1"],
 ["PUBLIC","beatitudes","beatitudes-e2"],
 ["PUBLIC","sychar","sychar-e1"],
 ["PUBLIC","nain","nain-e1"],
 ["PUBLIC","tabgha","tabgha-e1"],
 ["PUBLIC","caesarea-philippi","caesarea-philippi-e1"],
 ["PUBLIC","transfiguration","transfiguration-e1"],
 ["PUBLIC","bethany","bethany-e1"],
 ["PUBLIC","jericho","jericho-e2"],
 ["PASSION","olives","olives-e1"],
 ["PASSION","cenacle","cenacle-e1"],
 ["PASSION","gethsemane","gethsemane-e1"],
 ["PASSION","jerusalem-trial","jerusalem-trial-e2"],
 ["PASSION","golgotha","golgotha-e2"],
 ["PASSION","christ-tomb","christ-tomb-e1"],
 ["RESURRECTION","christ-tomb","christ-tomb-e2"],
 ["RESURRECTION","emmaus","emmaus-e1"],
 ["RESURRECTION","galilee-sea","galilee-sea-e4"],
 ["RESURRECTION","olives","olives-e3"],
 ["APOSTLES","damascus",null,"Conversion of Saul","Conversion de Saul","Acts 9:1–22"],
 ["APOSTLES","antioch",null,"The disciples at Antioch","Les disciples à Antioche","Acts 11:19–26"],
 ["APOSTLES","corinth",null,"St Paul in Corinth","Saint Paul à Corinthe","Acts 18:1–18"],
 ["APOSTLES","rome",null,"St Paul in Rome","Saint Paul à Rome","Acts 28:16–31"],
 ["REVELATION",null,null,"St John's vision","La vision de saint Jean","Revelation 1:9–20"]
];
// Registered Sacred Geography site anchors or OpenBible identified ancient settlements.
// Traditional site pin is never proof of exact event geography. Jerusalem uses a city-level
// reference for events with different or disputed local settings.
export const ATLAS_GEO=Object.freeze({
 hebron:{key:"hebron",lat:31.525087,lng:35.102220,kind:"settlement",url:"https://www.openbible.info/geo/modern/m86f941/tel-rumeida"},
 nazareth:{key:"nazareth",lat:32.70209,lng:35.29779,kind:"settlement",url:"https://www.openstreetmap.org/way/97417380"},
 bethlehem:{key:"bethlehem",lat:31.704306,lng:35.207583,kind:"traditional",url:"https://www.wikidata.org/wiki/Q194504"},
 "jerusalem-temple":{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"city_context",url:"https://www.wikidata.org/wiki/Q187702"},
 capernaum:{key:"capernaum",lat:32.880999,lng:35.575371,kind:"settlement",url:"https://www.octagonproject.org/news/the-modern-church-at-capernaum"},
 transfiguration:{key:"tabor",lat:32.68627,lng:35.39242,kind:"traditional",url:"https://www.openstreetmap.org/way/255793567"},
 jericho:{key:"jericho",lat:31.871719,lng:35.444564,kind:"settlement",url:"https://www.openbible.info/geo/modern/m95349d/tell-es-sultan"},
 olives:{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"city_context",url:"https://www.wikidata.org/wiki/Q187702"},
 cenacle:{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"city_context",url:"https://www.wikidata.org/wiki/Q187702"},
 gethsemane:{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"city_context",url:"https://www.wikidata.org/wiki/Q187702"},
 "jerusalem-trial":{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"city_context",url:"https://www.wikidata.org/wiki/Q187702"},
 golgotha:{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"traditional",url:"https://www.wikidata.org/wiki/Q187702"},
 "christ-tomb":{key:"jerusalem",lat:31.778333,lng:35.229722,kind:"traditional",url:"https://www.wikidata.org/wiki/Q187702"},
 damascus:{key:"damascus",lat:33.511112,lng:36.306390,kind:"settlement",url:"https://www.openbible.info/geo/modern/m878978/damascus"},
 antioch:{key:"antioch-syria",lat:36.226691,lng:36.171743,kind:"settlement",url:"https://www.openbible.info/geo/modern/mbe432b/antioch-on-the-orontes"},
 corinth:{key:"corinth",lat:37.905785,lng:22.878741,kind:"settlement",url:"https://www.openbible.info/geo/modern/me0518f/corinth"},
 rome:{key:"rome",lat:41.8922,lng:12.4852,kind:"settlement",url:"https://www.openbible.info/geo/modern/mb083bc/rome"}
});
export function buildBibleAtlas(records){
 const byId=new Map((Array.isArray(records)?records:[]).map(row=>[row.id,row]));
 return SEQUENCE.map((s,index)=>{
  const [era,placeId,eventId,en,fr,passage]=s,place=byId.get(placeId),event=place?.events?.find(e=>e.id===eventId);
  if(placeId&&!place)throw new Error("Atlas missing place "+placeId);
  if(eventId&&!event)throw new Error("Atlas missing episode "+eventId);
  return Object.freeze({index,era,placeId,geo:ATLAS_GEO[placeId]??null,title_en:event?.title_en??en,title_fr:event?.title_fr??fr,
   reference:event?.reference??passage,place_en:place?.title_en??"",place_fr:place?.title_fr??"",
   summary_en:place?.summary_en??ERAS[era][2],summary_fr:place?.summary_fr??ERAS[era][3]});
 });
}
export function atlasMapItems(stops,index){
 const active=stops[index],seen=new Map();if(!active)return [];
 for(const s of stops.slice(0,index+1)){if(s.era===active.era&&s.geo)seen.set(s.geo.key,s);}
 return [...seen.values()].map(s=>({item_id:"atlas:"+s.geo.key,lens:"heritage",title:s.place_en||s.title_en,map_publishable:true,
 geo:{lat:s.geo.lat,lng:s.geo.lng,approximate:s.geo.kind!=="settlement",precision:s.geo.kind,source_url:s.geo.url}}));
}
export function atlasIndexForPin(stops,index,pin){
 const key=String(pin||"").replace(/^atlas:/,"");
 const matches=stops.filter(s=>s.geo?.key===key);
 if(!matches.length)return index;
 const same=matches.filter(s=>s.era===stops[index]?.era);
 return (same.length?same:matches).reduce((best,s)=>Math.abs(s.index-index)<Math.abs(best.index-index)?s:best).index;
}
export function atlasEraOverlay(era,lang){
 const data=ERAS[era]??ERAS.ORIGINS;
 return '<div class="aoBibleAtlasEraScene" role="status"><small>'+esc(L(lang,"A NEW CHAPTER","UN NOUVEAU CHAPITRE"))+'</small><h2>'+esc(L(lang,data[0],data[1]))+'</h2><p>'+esc(L(lang,data[2],data[3]))+'</p></div>';
}
export function atlasDetail(s,lang){
 if(!s)return "";
 const geo=s.geo;
 const qualification=geo?.kind==="traditional"?L(lang,"Traditional site, not proof of the exact event location.","Site traditionnel, sans certitude sur le lieu exact de cet épisode.")
  :geo?.kind==="city_context"?L(lang,"City-level reference only, not the scene's precise location.","Repère de ville seulement, non le lieu précis de la scène.")
  :!geo?L(lang,"No defensible exact map pin for this event.","Aucun repère exact établi pour cet événement."):"";
 return '<div class="aoBibleAtlasEyebrow">'+esc(L(lang,ERAS[s.era][0],ERAS[s.era][1]))+' · '+(s.index+1)+'</div>'+
 '<h2>'+esc(L(lang,s.title_en,s.title_fr))+'</h2>'+
 (s.placeId?'<p class="aoBibleAtlasPlace">'+esc(L(lang,s.place_en,s.place_fr))+'</p>':"")+
 '<p>'+esc(L(lang,s.summary_en,s.summary_fr))+'</p>'+
 (qualification?'<small class="aoBibleAtlasQualification">'+esc(qualification)+'</small>':"")+
 '<div class="aoBibleAtlasActions"><button type="button" data-ao-scripture-context="'+esc(s.reference)+'">'+esc(L(lang,"Read Scripture","Lire le passage"))+' · '+esc(s.reference)+'</button>'+
 (geo?'<a target="_blank" rel="noopener noreferrer" href="'+esc(geo.url)+'">'+esc(L(lang,"Map evidence","Source géographique"))+' ↗</a>':"")+'</div>';
}
export function renderBibleAtlasToString(vm){
 const steps=vm.atlasStops??[],index=Math.max(0,Math.min(steps.length-1,vm.atlasIndex||0)),s=steps[index],lang=vm.language==="fr"?"fr":"en";
 if(!s)return "";
 let html='<section class="aoFindSurface aoBibleAtlasSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-bible-atlas>'+
 '<header class="aoBibleAtlasHeader"><button type="button" data-bible-atlas-close aria-label="'+esc(L(lang,"Back to Explore","Retour à Explorer"))+'">←</button>'+
 '<div><small>'+esc(L(lang,"EXPLORE · SCRIPTURE","EXPLORER · ÉCRITURE"))+'</small><h1>'+esc(L(lang,"Biblical Atlas","Atlas biblique"))+'</h1></div>'+
 '<button type="button" data-bible-follow aria-label="'+esc(L(lang,"Return to active pin","Revenir au repère actif"))+'">⌖</button></header>'+
 '<div class="aoBibleAtlasEraHeader"><span data-bible-era-name>'+esc(L(lang,ERAS[s.era][0],ERAS[s.era][1]))+'</span>'+
 '<small>'+esc(L(lang,"Scroll horizontally through the milestones","Faites défiler les étapes horizontalement"))+'</small></div>'+
 '<div class="aoBibleAtlasTimeline"><div class="aoBibleAtlasCursor" aria-hidden="true"></div><div class="aoBibleAtlasTrack" data-bible-track aria-label="'+esc(L(lang,"Continuous biblical chronology","Chronologie biblique continue"))+'"><div class="aoBibleAtlasTrackPad" aria-hidden="true"></div>';
 for(const step of steps){
  const boundary=step.index===0||steps[step.index-1].era!==step.era;
  html+='<button type="button" class="aoBibleAtlasStep'+(step.index===index?" active":"")+'" data-bible-step="'+step.index+'" aria-pressed="'+String(step.index===index)+'">'+
  '<small class="aoBibleAtlasDivider">'+(boundary?esc(L(lang,ERAS[step.era][0],ERAS[step.era][1])):'&nbsp;')+'</small>'+
  '<span class="aoBibleAtlasDot" aria-hidden="true"></span><strong>'+esc(L(lang,step.title_en,step.title_fr))+'</strong>'+
  '<em>'+esc(step.placeId?L(lang,step.place_en,step.place_fr):L(lang,"No geographic pin","Sans repère localisé"))+'</em></button>';
 }
 html+='<div class="aoBibleAtlasTrackPad" aria-hidden="true"></div></div></div>'+
 '<div class="aoBibleAtlasMapStage"><div class="aoFindMap aoBibleAtlasMap" data-find-map data-bible-map><div class="aoFindMapFallback">'+esc(L(lang,"Loading the Biblical world…","Chargement du monde biblique…"))+'</div></div>'+
 '<div class="aoBibleAtlasOverlay" data-bible-era-overlay aria-live="polite"></div><div class="aoBibleAtlasDetail" data-bible-detail>'+atlasDetail(s,lang)+'</div></div></section>';
 return '<style>'+ATLAS_CSS+'</style>'+html;
}

const ATLAS_CSS="\n.aoBibleAtlasSurface{display:flex;flex-direction:column;height:100%;overflow:hidden;background:#080c12;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}\n.aoBibleAtlasHeader{display:flex;align-items:center;gap:12px;padding:9px 12px;border-bottom:1px solid #d9c59a26;flex:none}.aoBibleAtlasHeader>div{flex:1}.aoBibleAtlasHeader small{color:#b4a17f;letter-spacing:.11em;font:600 10px system-ui}.aoBibleAtlasHeader h1{margin:2px 0;color:#f0e6d3;font:500 23px Georgia,serif}.aoBibleAtlasHeader button{width:44px;height:44px;flex:none;border:1px solid #d9c59a38;border-radius:50%;background:#16202b;color:#ead8ae;font-size:23px;cursor:pointer}\n.aoBibleAtlasEraHeader{padding:10px 16px 5px;display:flex;align-items:baseline;justify-content:space-between;gap:12px}.aoBibleAtlasEraHeader span{font:600 16px Georgia,serif;color:#e0c895}.aoBibleAtlasEraHeader small{font:10px/1.3 system-ui;color:#a39683}\n.aoBibleAtlasTimeline{position:relative;flex:none}.aoBibleAtlasTrack{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:thin;touch-action:pan-x;position:relative;padding:7px 0 12px}.aoBibleAtlasTrackPad{flex:0 0 calc(50% - 86px)}.aoBibleAtlasCursor{position:absolute;top:7px;bottom:12px;left:50%;border-left:1px solid #d9c59a88;pointer-events:none;z-index:2}\n.aoBibleAtlasStep{width:172px;min-width:172px;scroll-snap-align:center;text-align:center;background:transparent;border:0;color:#a79985;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:0 8px}.aoBibleAtlasDivider{height:14px;max-width:160px;font:600 9px system-ui;letter-spacing:.05em;text-transform:uppercase;color:#988462;white-space:nowrap}.aoBibleAtlasDot{width:9px;height:9px;border-radius:50%;background:#657281;box-shadow:0 0 0 2px #080c12,0 0 0 3px #5d6370}.aoBibleAtlasStep strong{font:500 13px/1.25 Georgia,serif;max-width:158px;min-height:32px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoBibleAtlasStep em{font:10px/1.3 system-ui;font-style:normal;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aoBibleAtlasStep.active{color:#f0e0bb}.aoBibleAtlasStep.active .aoBibleAtlasDot{background:#f3d99b;box-shadow:0 0 0 4px #aa874b66,0 0 16px #e9c6819c}\n.aoBibleAtlasMapStage{flex:1;min-height:180px;position:relative;padding:0 8px 8px}.aoBibleAtlasMapStage .aoBibleAtlasMap{width:100%;height:100%;min-height:0;margin:0;border-radius:12px;overflow:hidden;border:1px solid #d9c59a24}.aoBibleAtlasOverlay{position:absolute;inset:0;pointer-events:none;z-index:3;display:grid;place-items:center;overflow:hidden}.aoBibleAtlasOverlay:empty{display:none}.aoBibleAtlasEraScene{box-sizing:border-box;padding:34px 22px;width:100%;height:100%;background:radial-gradient(ellipse at center,#28323beb,#080c12f2);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;animation:aoAtlasEra 2.2s ease both}.aoBibleAtlasEraScene small{font:600 10px system-ui;letter-spacing:.25em;color:#c4a16a}.aoBibleAtlasEraScene h2{font:500 clamp(29px,6vw,48px)/1.1 Georgia,serif;color:#f5e6c8;margin:15px auto;max-width:660px}.aoBibleAtlasEraScene p{font:15px/1.5 Georgia,serif;color:#d4c4a6;max-width:510px}@keyframes aoAtlasEra{0%{opacity:0}12%,65%{opacity:1}100%{opacity:0}}\n.aoBibleAtlasDetail{position:absolute;bottom:16px;left:16px;right:16px;z-index:2;max-width:570px;max-height:43%;overflow:auto;background:#0a1015ee;border:1px solid #d9c59a46;border-radius:14px;padding:13px 16px;box-shadow:0 15px 30px #0009;backdrop-filter:blur(12px)}.aoBibleAtlasEyebrow{font:600 10px system-ui;letter-spacing:.12em;text-transform:uppercase;color:#cbb184}.aoBibleAtlasDetail h2{font:500 20px/1.15 Georgia,serif;margin:6px 0;color:#f5e7d2}.aoBibleAtlasDetail p{font:13px/1.4 Georgia,serif;margin:6px 0;color:#c7bda9}.aoBibleAtlasDetail .aoBibleAtlasPlace{color:#d9b677;font-style:italic}.aoBibleAtlasQualification{color:#b0a08a;font:11px/1.4 system-ui}.aoBibleAtlasActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}.aoBibleAtlasActions button,.aoBibleAtlasActions a{min-height:38px;padding:9px 12px;border:1px solid #d9c59a66;border-radius:999px;background:#292921;color:#edd6aa;font:600 11px system-ui;text-decoration:none;cursor:pointer}.aoBibleAtlasActions a{background:transparent}.aoBibleAtlasStep:focus-visible,.aoBibleAtlasHeader button:focus-visible,.aoBibleAtlasActions button:focus-visible{outline:2px solid #f0d79d;outline-offset:2px}\n@media(max-width:520px){.aoBibleAtlasDetail{bottom:13px;left:13px;right:13px;max-height:42%;padding:11px 12px}.aoBibleAtlasStep{width:155px;min-width:155px}.aoBibleAtlasTrackPad{flex-basis:calc(50% - 77.5px)}.aoBibleAtlasDetail h2{font-size:18px}.aoBibleAtlasEraHeader small{max-width:145px;text-align:right}}@media(prefers-reduced-motion:reduce){.aoBibleAtlasEraScene{animation:none;opacity:0}}";
