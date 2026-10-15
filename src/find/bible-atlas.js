import { BEFORE_MILESTONES, AFTER_MILESTONES, ATLAS_PLACE_LABELS } from "./bible-atlas-expanded-milestones.js";
import { atlasHistoricalNameReview } from "./bible-atlas-history-review.js";
import { atlasLandscapeReview } from "./bible-atlas-landscape-context.js";
import { renderAtlasReadingContents } from "./bible-atlas-reading-chapters.js";
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
// Observed *witness transcription/numbering* exceptions, not proposed
// substitutions in the canonical Catholic Scripture reader. These witnesses
// are UNCOLLATED: a gap is a research warning, not permission to change a Bible.
export const ATLAS_WITNESS_EXCEPTIONS=Object.freeze({
 "Mark 4:35–41":Object.freeze({
  en:"The imported witnesses merge the final verse into 4:40. Printed Crampon has 4:41; original-text collation is still required.",
  fr:"Les témoins importés regroupent le dernier verset sous 4,40. L'édition Crampon présente 4,41 ; une collation reste nécessaire.",
  source:"https://www.newadvent.org/bible/mar004.htm"
 }),
 "Acts 7:54–60":Object.freeze({
  en:"Stephen's final prayer is numbered 7:60 in Crampon, but 7:59 in the imported Challoner witness. Do not assume verse-number equivalence.",
  fr:"La dernière prière d'Étienne est numérotée 7,60 chez Crampon, mais 7,59 dans le témoin Challoner. Les numéros ne coïncident pas.",
  source:"https://www.newadvent.org/bible/act007.htm"
 }),
 "Exodus 40:1–38":Object.freeze({
  en:"This chapter has 38 numbered verses in the imported Crampon witness and 36 in Challoner. Closing verse boundaries differ by edition.",
  fr:"Ce chapitre compte 38 versets dans le témoin Crampon et 36 dans Challoner. Le découpage final diffère selon l'édition.",
  source:"https://www.newadvent.org/bible/exo040.htm"
 })
});
// [era, corpus place id, corpus event id, EN fallback title, FR fallback title, Scripture]
// Selected major milestones are explicitly sequenced: not an exhaustive harmony.
const SEQUENCE=[
 ["ORIGINS",null,null,"Creation","La Création","Genesis 1:1–31"],
 ["ORIGINS",null,null,"The Fall","La Chute","Genesis 3:1–24"],
 ["ORIGINS",null,null,"The Flood","Le Déluge","Genesis 7:1–24"],
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
// Correct only demonstrable *within-Gospel textual* reversals introduced by
// grouping source records by place. These precedences do NOT assert a historical
// cross-Gospel harmony, exact year, itinerary, or one-to-one event identity.
// Named source records, not 151-array offsets, own each change.
export const GOSPEL_NARRATIVE_PRECEDENCES=Object.freeze([
 Object.freeze({eventId:"galilee-sea-e1",anchorId:"capernaum-e1",side:"before",source:"Mark 1:16–28"}),
 Object.freeze({eventId:"beatitudes-e2",anchorId:"galilee-sea-e2",side:"before",source:"Matthew 5:13–48; 14:22–33"}),
 Object.freeze({eventId:"cana-miracle-02",anchorId:"sychar-additional-013",side:"after",source:"John 4:39–54"}),
 Object.freeze({eventId:"bethesda-miracle-18",anchorId:"cana-miracle-02",side:"after",source:"John 4:46–54; 5:1–15"}),
 Object.freeze({eventId:"capernaum-e3",anchorId:"tabgha-e1",side:"after",source:"John 6:1–59"}),
 Object.freeze({eventId:"siloam-miracle-26",anchorId:"bethany-e1",side:"before",source:"John 9:1–12; 11:1–44"})
]);
function applyGospelNarrativePrecedences(source){
 const sequence=[...source];
 const position=id=>{
  const hits=sequence.flatMap((row,i)=>row[2]===id?[i]:[]);
  if(hits.length!==1)throw new Error("Atlas narrative source ID must occur once: "+id);
  return hits[0];
 };
 for(const rule of GOSPEL_NARRATIVE_PRECEDENCES){
  const from=position(rule.eventId);
  const [record]=sequence.splice(from,1);
  const target=position(rule.anchorId);
  sequence.splice(target+(rule.side==="after"?1:0),0,record);
 }
 return sequence;
}
const SEQUENCE_ALL=applyGospelNarrativePrecedences(SEQUENCE.flatMap(s=>{
 const key=s[2]??s[3];
 return [...(BEFORE_MILESTONES[key]??[]),s,...(AFTER_MILESTONES[key]??[])];
}));
export const ATLAS_GEO=Object.freeze({
 "carmel":{key:"carmel",lat:32.6725,lng:35.023333,kind:"mountain_region",source_record_id:"mf9b7d7",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "ein-karem":{key:"ein-karem",lat:31.764483,lng:35.159454,kind:"traditional",source_record_id:"mc853b5",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "nain":{key:"nain",lat:32.630694,lng:35.350139,kind:"settlement",source_record_id:"m0b02a7",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "bethesda":{key:"bethesda",lat:31.781389,lng:35.235833,kind:"site",source_record_id:"m48007f",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "siloam":{key:"siloam",lat:31.770556,lng:35.235,kind:"site",source_record_id:"m068207",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "caesarea-philippi":{key:"banias",lat:33.246111,lng:35.693333,kind:"city_context",source_record_id:"m518f8e",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "bethphage":{key:"bethphage",lat:31.777619,lng:35.250839,kind:"traditional",source_record_id:"m6bd6bd",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "samaria":{key:"samaria",lat:32.276111,lng:35.195,kind:"settlement",source_record_id:"me64af8",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "tarsus":{key:"tarsus",lat:36.913028,lng:34.892056,kind:"settlement",source_record_id:"mc9df1a",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "joppa":{key:"joppa",lat:32.054481,lng:34.753039,kind:"settlement",source_record_id:"mcb49f3",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "caesarea-maritima":{key:"caesarea-maritima",lat:32.5,lng:34.891667,kind:"settlement",source_record_id:"m11da12",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "lystra":{key:"lystra",lat:37.6017,lng:32.3384,kind:"settlement",source_record_id:"ma6f6dc",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "philippi":{key:"philippi",lat:41.012072,lng:24.284576,kind:"settlement",source_record_id:"mec5201",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "thessalonica":{key:"thessalonica",lat:40.637771,lng:22.945767,kind:"settlement",source_record_id:"mdadcc0",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "athens":{key:"athens",lat:37.971851,lng:23.726738,kind:"settlement",source_record_id:"md70ac9",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "ephesus":{key:"ephesus",lat:37.939125,lng:27.3407,kind:"settlement",source_record_id:"m84025e",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "troas":{key:"troas",lat:39.751944,lng:26.158611,kind:"settlement",source_record_id:"mf8cbc7",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "miletus":{key:"miletus",lat:37.531111,lng:27.275556,kind:"settlement",source_record_id:"mcf7752",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 shiloh:{key:"shiloh",lat:32.055703,lng:35.289536,kind:"settlement",source_record_id:"m12f296",url:"https://www.openbible.info/geo/modern/m12f296/khirbet-seilun"},
 nineveh:{key:"nineveh",lat:36.3594,lng:43.1528,kind:"settlement",source_record_id:"m52bd87",url:"https://www.openbible.info/geo/modern/m52bd87/nineveh"},
 babylon:{key:"babylon",lat:32.543333,lng:44.422222,kind:"settlement",source_record_id:"md561de",url:"https://www.openbible.info/geo/modern/md561de/babylon"},
 hebron:{key:"hebron",lat:31.525087,lng:35.102220,kind:"city_context",source_record_id:"m86f941",url:"https://www.openbible.info/geo/modern/m86f941/tel-rumeida"},
 nazareth:{key:"nazareth",lat:32.70209,lng:35.29779,kind:"settlement",source_record_id:"mb3f688",url:"https://www.openstreetmap.org/way/97417380"},
 bethlehem:{key:"bethlehem",lat:31.704306,lng:35.207583,kind:"traditional",source_record_id:"m9b8daa",url:"https://www.wikidata.org/wiki/Q194504"},
 "jerusalem-temple":{key:"jerusalem",lat:31.776667,lng:35.234167,kind:"city_context",source_record_id:"m66c5b8",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 capernaum:{key:"capernaum",lat:32.880999,lng:35.575371,kind:"settlement",source_record_id:"m66efd0",url:"https://www.octagonproject.org/news/the-modern-church-at-capernaum"},
 transfiguration:{key:"tabor",lat:32.68627,lng:35.39242,kind:"traditional",source_record_id:"m8e169f",url:"https://www.openstreetmap.org/way/255793567"},
 jericho:{key:"jericho",lat:31.871719,lng:35.444564,kind:"city_context",source_record_id:"m95349d",url:"https://www.openbible.info/geo/modern/m95349d/tell-es-sultan"},
 olives:{key:"olives",lat:31.777946,lng:35.245686,kind:"mountain_region",source_record_id:"me461ba",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 cenacle:{key:"jerusalem",lat:31.776667,lng:35.234167,kind:"city_context",source_record_id:"m66c5b8",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 gethsemane:{key:"gethsemane",lat:31.779419,lng:35.239425,kind:"traditional",source_record_id:"m835caa",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 "jerusalem-trial":{key:"jerusalem",lat:31.776667,lng:35.234167,kind:"city_context",source_record_id:"m66c5b8",url:"https://github.com/openbibleinfo/Bible-Geocoding-Data/blob/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f/data/modern.jsonl"},
 golgotha:{key:"holy-sepulchre",lat:31.778333,lng:35.229722,kind:"traditional",url:"https://www.wikidata.org/wiki/Q187702"},
 "christ-tomb":{key:"holy-sepulchre",lat:31.778333,lng:35.229722,kind:"traditional",url:"https://www.wikidata.org/wiki/Q187702"},
 damascus:{key:"damascus",lat:33.511112,lng:36.306390,kind:"settlement",source_record_id:"m878978",url:"https://www.openbible.info/geo/modern/m878978/damascus"},
 antioch:{key:"antioch-syria",lat:36.226691,lng:36.171743,kind:"settlement",source_record_id:"mbe432b",url:"https://www.openbible.info/geo/modern/mbe432b/antioch-on-the-orontes"},
 corinth:{key:"corinth",lat:37.905785,lng:22.878741,kind:"settlement",source_record_id:"me0518f",url:"https://www.openbible.info/geo/modern/me0518f/corinth"},
 rome:{key:"rome",lat:41.8922,lng:12.4852,kind:"settlement",source_record_id:"mb083bc",url:"https://www.openbible.info/geo/modern/mb083bc/rome"}
});
export function buildBibleAtlas(records){
 const extraPlaces=Object.entries(ATLAS_PLACE_LABELS).map(([id,titles])=>({id,title_en:titles[0],title_fr:titles[1]}));
 const byId=new Map([...((Array.isArray(records)?records:[])),...extraPlaces].map(row=>[row.id,row]));
 // Stable content identity survives insertions and story reordering. Numeric
 // indices are presentation positions, NEVER a source key for artwork or people.
 const stops=SEQUENCE_ALL.map((s,index)=>{
  const [era,placeId,eventId,en,fr,passage]=s,place=byId.get(placeId),event=place?.events?.find(e=>e.id===eventId);
  if(placeId&&!place)throw new Error("Atlas missing place "+placeId);
  if(eventId&&!event)throw new Error("Atlas missing episode "+eventId);
  const reference=event?.reference??passage;
  const stablePassage=String(reference??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  if(!stablePassage)throw new Error("Atlas episode lacks stable Scripture identity");
  const eventKey=eventId?"biblical:event:"+eventId:"biblical:passage:"+stablePassage;
  return Object.freeze({index,eventKey,sourceEventId:eventId??null,era,placeId,geo:ATLAS_GEO[placeId]??null,title_en:event?.title_en??en,title_fr:event?.title_fr??fr,
   reference,place_en:place?.title_en??"",place_fr:place?.title_fr??"",
   summary_en:s[6]??(event?(event.summary_en??""):(en?en+". "+passage+".":ERAS[era][2])),
   summary_fr:s[7]??(event?(event.summary_fr??""):(fr?fr+". "+passage+".":ERAS[era][3]))});
 });
 if(stops.some(s=>!s.eventKey)||new Set(stops.map(s=>s.eventKey)).size!==stops.length)
  throw new Error("Atlas stable event key collision");
 return stops;
}
// Labels are editorial *aliases of already-pinned settlements*, not geocoding.
// Traditional event-site pins, uncertain sites, and geographic regions are
// intentionally absent. Provenance is the matching ATLAS_GEO source URL/ID.
export const ATLAS_SETTLEMENT_LABELS=Object.freeze({
 hebron:["Hebron","Hébron"],jerusalem:["Jerusalem","Jérusalem"],
 jericho:["Jericho","Jéricho"],nazareth:["Nazareth","Nazareth"],
 capernaum:["Capernaum","Capharnaüm"],samaria:["Samaria","Samarie"],
 "caesarea-maritima":["Caesarea Maritima","Césarée maritime"],
 joppa:["Joppa","Joppé"],nineveh:["Nineveh","Ninive"],
 babylon:["Babylon","Babylone"],damascus:["Damascus","Damas"],
 "antioch-syria":["Antioch","Antioche"],tarsus:["Tarsus","Tarse"],
 athens:["Athens","Athènes"],ephesus:["Ephesus","Éphèse"],
 philippi:["Philippi","Philippes"],corinth:["Corinth","Corinthe"],
 rome:["Rome","Rome"],lystra:["Lystra","Lystres"],
 thessalonica:["Thessalonica","Thessalonique"],
 troas:["Troas","Troade"],miletus:["Miletus","Milet"]
});
export function atlasSourceSettlementLabel(geo,language="en"){
 const pair=ATLAS_SETTLEMENT_LABELS[geo?.key];
 if(!pair||!["settlement","city_context"].includes(geo?.kind)||
    !geo?.url||!Number.isFinite(geo?.lat)||!Number.isFinite(geo?.lng))return null;
 return language==="fr"?pair[1]:pair[0];
}
export function atlasMapItems(stops,index,{cinematic=false,language="en"}={}){
 const active=stops[index],seen=new Map();if(!active)return [];
 for(const s of stops.slice(0,index+1)){if(s.era===active.era&&s.geo)seen.set(s.geo.key,s);}
 return [...seen.values()].map(s=>({item_id:"atlas:"+s.geo.key,lens:"heritage",title:s.place_en||s.title_en,map_publishable:true,
 ...(cinematic&&atlasSourceSettlementLabel(s.geo,language)?{
  atlas_label:atlasSourceSettlementLabel(s.geo,language),
  atlas_label_basis:"existing_settlement_anchor"}:{}),
 geo:{lat:s.geo.lat,lng:s.geo.lng,approximate:s.geo.kind!=="settlement",precision:s.geo.kind,source_url:s.geo.url}}));
}
export function atlasIndexForPin(stops,index,pin){
 const key=String(pin||"").replace(/^atlas:/,"");
 const matches=stops.filter(s=>s.geo?.key===key);
 if(!matches.length)return index;
 const same=matches.filter(s=>s.era===stops[index]?.era);
 return (same.length?same:matches).reduce((best,s)=>Math.abs(s.index-index)<Math.abs(best.index-index)?s:best).index;
}
// Timeline shortcuts derive only from the current, stable 151-event corpus.
export function atlasCinemaChapters(stops){
 const result=[],seen=new Set();
 for(const stop of stops??[]){
  if(!ERAS[stop.era]||seen.has(stop.era))continue;
  seen.add(stop.era);
  result.push(Object.freeze({era:stop.era,index:stop.index,
   title_en:ERAS[stop.era][0],title_fr:ERAS[stop.era][1]}));
 }
 return Object.freeze(result);
}
export function atlasCinemaPlate(era,lang){
 const info=ERAS[era];if(!info)return "";
 return '<div class="aoBibleAtlasEraScene aoBibleCinemaScene" role="status">'+
 '<button type="button" data-bible-chapter-dismiss aria-label="'+esc(L(lang,"Dismiss chapter introduction","Fermer l’introduction"))+'">×</button>'+
 '<small>'+esc(L(lang,"A NEW CHAPTER","UN NOUVEAU CHAPITRE"))+'</small>'+
 '<h2>'+esc(L(lang,info[0],info[1]))+'</h2>'+
 '<p>'+esc(L(lang,info[2],info[3]))+'</p></div>';
}
export function atlasEraOverlay(era,lang){
 const data=ERAS[era]??ERAS.ORIGINS;
 return '<div class="aoBibleAtlasEraScene" role="status"><small>'+esc(L(lang,"A NEW CHAPTER","UN NOUVEAU CHAPITRE"))+'</small><h2>'+esc(L(lang,data[0],data[1]))+'</h2><p>'+esc(L(lang,data[2],data[3]))+'</p></div>';
}
export function atlasDetail(s,lang,{historicalPreview=false}={}){
 if(!s)return "";
 const geo=s.geo,witnessNote=ATLAS_WITNESS_EXCEPTIONS[s.reference]??null;
 // A Gospel narrative's placement does not decide the disputed identity or
 // historical timing of its parallels in the other Evangelists.
 const sourceQualification=s.reference==="John 2:13–22"
  ?L(lang,"John narrates this cleansing near the beginning of his Gospel. Its relationship to the Synoptic Passion accounts remains disputed.","Saint Jean raconte cette purification au début de son Évangile. Son rapport aux récits synoptiques de la Passion reste discuté.")
  :"";
 const qualification=geo?.kind==="traditional"?L(lang,"Traditional site, not proof of the exact event location.","Site traditionnel, sans certitude sur le lieu exact de cet épisode.")
  :geo?.kind==="city_context"?L(lang,"City-level reference only, not the scene's precise location.","Repère de ville seulement, non le lieu précis de la scène.")
  :geo?.kind==="settlement"?L(lang,"Settlement marker only, not proof the episode occurred at this exact point.","Repère d'agglomération uniquement, sans preuve que l'épisode eut lieu à cet endroit précis.")
  :geo?.kind==="mountain_region"?L(lang,"Mountain-region context only; the exact event location is not established.","Repère de région montagneuse ; le lieu exact de l'épisode n'est pas établi.")
  :geo?.kind==="site"?L(lang,"Site-level location is provisional; the biblical scene is not pinpointed.","Localisation du site provisoire ; la scène biblique n'est pas localisée précisément.")
  :!geo?(s.placeId?L(lang,"A map pin has not yet been certified for this location.","Le repère de ce lieu reste à vérifier."):L(lang,"No earthly location is assigned to this episode.","Aucun lieu terrestre n’est attribué à cet épisode."))
  :L(lang,"Geographic context only; no event-specific coordinate is certified.","Simple repère géographique ; aucune coordonnée précise de l'épisode n'est certifiée.");
 return '<div class="aoBibleAtlasEyebrow">'+esc(L(lang,ERAS[s.era][0],ERAS[s.era][1]))+' · '+(s.index+1)+'</div>'+
 '<h2>'+esc(L(lang,s.title_en,s.title_fr))+'</h2>'+
 (s.placeId?'<p class="aoBibleAtlasPlace">'+esc(L(lang,s.place_en,s.place_fr))+'</p>':"")+
 (L(lang,s.summary_en,s.summary_fr)?'<p>'+esc(L(lang,s.summary_en,s.summary_fr))+'</p>':"")+
 (qualification?'<small class="aoBibleAtlasQualification">'+esc(qualification)+'</small>':"")+
 (sourceQualification?'<small class="aoBibleAtlasQualification">'+esc(sourceQualification)+'</small>':"")+
 (witnessNote?'<details class="aoBibleAtlasSourceNote"><summary>'+esc(L(lang,"Scripture edition note","Note sur l'édition biblique"))+'</summary><p>'+esc(L(lang,witnessNote.en,witnessNote.fr))+'</p><a href="'+esc(witnessNote.source)+'" target="_blank" rel="noopener noreferrer">'+esc(L(lang,"Compare source","Comparer la source"))+' ↗</a></details>':"")+
 (historicalPreview?atlasHistoricalNameReview(s,lang)+atlasLandscapeReview(s,lang):"")+
 '<div class="aoBibleAtlasActions"><button type="button" data-ao-scripture-context="'+esc(s.reference)+'">'+esc(L(lang,"Read Scripture","Lire le passage"))+' · '+esc(s.reference)+'</button>'+
 (geo?'<a target="_blank" rel="noopener noreferrer" href="'+esc(geo.url)+'">'+esc(L(lang,"Map evidence","Source géographique"))+' ↗</a>':"")+'</div>';
}
export function atlasPinEpisodes(stops,records,key,index,lang){
 const active=stops[index],currentEra=active?.era;
 const sameEra=stops.filter(s=>s.geo?.key===key&&s.era===currentEra);
 if(!sameEra.length)return "";
 const placeIds=new Set(sameEra.map(s=>s.placeId).filter(Boolean));
 const corpus=(Array.isArray(records)?records:[]).filter(row=>placeIds.has(row.id));
 const episodes=[],seen=new Set();
 const add=(title_en,title_fr,reference)=>{
  if(!reference)return;
  const id=title_en+"|"+reference;if(seen.has(id))return;seen.add(id);
  episodes.push({title_en,title_fr,reference});
 };
 if(["INFANCY","PUBLIC","PASSION","RESURRECTION"].includes(currentEra)){
  for(const row of corpus)for(const event of row.events??[]){
   const eventEra=event.chronology_phase??row.phase;
   if(eventEra===currentEra)add(event.title_en,event.title_fr,event.reference);
  }
 }
 for(const stop of sameEra)add(stop.title_en,stop.title_fr,stop.reference);
 if(episodes.length<2)return "";
 const heading=L(lang,"Biblical episodes at this location","Épisodes bibliques en ce lieu");
 return '<div class="aoBibleAtlasPinEpisodes" data-bible-pin-episodes="'+esc(key)+'"><h3>'+esc(heading)+' · '+episodes.length+'</h3>'+
 '<div role="list" class="aoBibleAtlasEpisodeScroll">'+episodes.map(e=>
  '<div role="listitem"><span>'+esc(L(lang,e.title_en,e.title_fr))+'</span>'+
  '<button type="button" data-ao-scripture-context="'+esc(e.reference)+'">'+
    esc(e.reference)+' ↗</button></div>').join("")+'</div></div>';
}
export function renderBibleAtlasToString(vm){
 const steps=vm.atlasStops??[],index=Math.max(0,Math.min(steps.length-1,vm.atlasIndex||0)),s=steps[index],lang=vm.language==="fr"?"fr":"en";
 if(!s)return "";
 const cinematic=vm.cinematicPreview===true,historyReview=cinematic&&vm.historicalPreview===true;
 let html='<section class="aoFindSurface aoBibleAtlasSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-bible-atlas'+(cinematic?' data-bible-cinematic="review"':"")+'>'+
 '<header class="aoBibleAtlasHeader"><button type="button" data-bible-atlas-close aria-label="'+esc(L(lang,"Back to Explore","Retour à Explorer"))+'">←</button>'+
 '<div><small>'+esc(L(lang,"EXPLORE · SCRIPTURE PREVIEW","EXPLORER · ÉCRITURE · APERÇU"))+'</small><h1>'+esc(L(lang,"Biblical Atlas","Atlas biblique"))+'</h1></div>'+
 '<button type="button" data-bible-follow aria-label="'+esc(L(lang,"Centre selected event","Recentrer l’étape sélectionnée"))+'"'+(cinematic?' aria-pressed="'+String(vm.cinemaFollow!==false)+'"':"")+'>⌖</button></header>'+
 '<div class="aoBibleAtlasEraHeader"><span data-bible-era-name>'+esc(L(lang,ERAS[s.era][0],ERAS[s.era][1]))+'</span>'+
 '<small>'+esc(L(lang,"Swipe events · selected reading sequence, not a dated history","Parcourez les épisodes · parcours choisi, non une chronologie datée"))+'</small></div>'+
 (cinematic?'<nav class="aoBibleCinemaChapters" data-bible-chapters aria-label="'+esc(L(lang,"Journey shortcuts","Raccourcis par période"))+'">'+
  '<button type="button" data-bible-reading-toggle class="aoBibleReadingToggle" aria-controls="ao-bible-reading-list" aria-expanded="false">'+
  esc(L(lang,"Stories · 37","Récits · 37"))+'</button>'+
  atlasCinemaChapters(steps).map(ch=>
  '<button type="button" data-bible-chapter="'+ch.index+'" aria-pressed="'+String(ch.era===s.era)+'">'+esc(L(lang,ch.title_en,ch.title_fr))+'</button>').join("")+'</nav>'+
  renderAtlasReadingContents(steps,atlasCinemaChapters(steps),lang,index):"")+
 '<div class="aoBibleAtlasTimeline"><div class="aoBibleAtlasCursor" aria-hidden="true"></div><div class="aoBibleAtlasTrack" data-bible-track aria-label="'+esc(L(lang,"Continuous biblical chronology","Chronologie biblique continue"))+'"><div class="aoBibleAtlasTrackPad" aria-hidden="true"></div>';
 for(const step of steps){
  const boundary=step.index===0||steps[step.index-1].era!==step.era;
  html+='<button type="button" class="aoBibleAtlasStep'+(step.index===index?" active":"")+'" data-bible-step="'+step.index+'" data-bible-event-key="'+esc(step.eventKey)+'" aria-pressed="'+String(step.index===index)+'">'+
  '<small class="aoBibleAtlasDivider">'+(boundary?esc(L(lang,ERAS[step.era][0],ERAS[step.era][1])):'&nbsp;')+'</small>'+
  '<span class="aoBibleAtlasDot" aria-hidden="true"></span><strong>'+esc(L(lang,step.title_en,step.title_fr))+'</strong>'+
  '<em>'+esc(step.placeId?L(lang,step.place_en,step.place_fr):L(lang,"No geographic pin","Sans repère localisé"))+'</em></button>';
 }
 html+='<div class="aoBibleAtlasTrackPad" aria-hidden="true"></div></div></div>'+
 '<div class="aoBibleAtlasMapStage" data-bible-unlocated="'+String(atlasMapItems(steps,index).length===0)+'"><div class="aoFindMap aoBibleAtlasMap" data-find-map data-bible-map><div class="aoFindMapFallback">'+esc(L(lang,"Loading the Biblical world…","Chargement du monde biblique…"))+'</div></div>'+
 (cinematic?'<div class="aoBiblePhysicalNote" data-bible-physical-note>'+esc(L(lang,
   "MODERN PHYSICAL RELIEF · PRESENT-DAY COASTLINES","RELIEF ACTUEL · LITTORAUX ACTUELS"))+'</div>':"")+
 '<div class="aoBibleAtlasOverlay" data-bible-era-overlay aria-live="polite"></div><div class="aoBibleAtlasUnlocated" data-bible-unlocated-note><small>'+esc(L(lang,"SCRIPTURE BEFORE GEOGRAPHY","L’ÉCRITURE AVANT LA GÉOGRAPHIE"))+'</small><p>'+esc(L(lang,"This chapter has no confirmed map anchor yet. Read its biblical account without an invented location.","Ce chapitre ne possède pas encore de repère géographique établi. Lisez son récit biblique sans localisation inventée."))+'</p></div><div class="aoBibleAtlasDetail"'+(cinematic?' data-bible-sheet="'+(vm.cinemaSheetExpanded?"expanded":"collapsed")+'"':"")+'>'+
 (cinematic?'<div class="aoBibleCinemaSheetActions"><button type="button" class="aoBibleCinemaSheetToggle" data-bible-sheet-toggle aria-expanded="'+String(vm.cinemaSheetExpanded===true)+'"><span data-bible-sheet-title>'+esc(L(lang,s.title_en,s.title_fr))+'</span><small>'+esc(L(lang,"Details / Scripture","Détails / Écriture"))+'</small></button>'+
  '<button type="button" class="aoBibleCinemaContextShortcut" data-bible-context-open aria-label="'+esc(L(lang,"Open Biblical scene details and context","Ouvrir les détails et le contexte biblique"))+'">'+esc(L(lang,"Context","Contexte"))+'</button></div>':"")+
 '<div data-bible-detail>'+atlasDetail(s,lang,{historicalPreview:historyReview})+'</div></div></div></section>';
 return '<style>'+ATLAS_CSS+(cinematic?ATLAS_CINEMA_CSS+ATLAS_CONTEXT_SHORTCUT_CSS+ATLAS_READING_CSS:"")+(historyReview?ATLAS_HISTORY_CSS+ATLAS_LANDSCAPE_CSS:"")+'</style>'+html;
}

const ATLAS_LANDSCAPE_CSS="\n.aoBibleAtlasLandscapeNote{margin:11px 0;border:1px solid #b5a17769;border-radius:9px;background:#18252a;color:#e1d8ca;overflow:hidden}\n.aoBibleAtlasLandscapeNote summary{min-height:44px;padding:12px 13px;cursor:pointer;color:#e8d19c;font:600 12px/1.45 system-ui}\n.aoBibleAtlasLandscapeNote summary:focus-visible{outline:2px solid #eed092;outline-offset:-3px}\n.aoBibleAtlasLandscapeNote p{margin:3px 13px 10px;font:13px/1.5 Georgia,serif;overflow-wrap:anywhere}\n.aoBibleAtlasLandscapeNote .aoBibleAtlasLandscapeCaveat{color:#d1c6ac;font-style:italic}\n.aoBibleAtlasLandscapeSources{display:flex;gap:10px;flex-wrap:wrap;margin:0 13px 13px}\n.aoBibleAtlasLandscapeSources a{min-height:38px;display:inline-flex;align-items:center;font:600 11px/1.3 system-ui;color:#e5cb96;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}\n.aoBibleAtlasLandscapeSources a:focus-visible{outline:2px solid #e5c48e;outline-offset:3px}\n@media(max-width:390px){.aoBibleAtlasLandscapeNote p{font-size:12px}}\n";
const ATLAS_HISTORY_CSS="\n.aoBibleAtlasHistoryNote{margin:10px 0;border:1px solid #c6aa7259;border-radius:9px;background:#15212bc9;color:#ded4c5;overflow:hidden}\n.aoBibleAtlasHistoryNote summary{list-style-position:inside;cursor:pointer;min-height:44px;padding:12px 13px;font:600 12px/1.4 system-ui;color:#e7c990}\n.aoBibleAtlasHistoryNote summary:focus-visible{outline:2px solid #eed092;outline-offset:-3px}\n.aoBibleAtlasHistoryNote p{margin:1px 12px 9px;font:13px/1.55 Georgia,serif;overflow-wrap:anywhere}\n.aoBibleAtlasHistorySources{display:flex;gap:8px;flex-wrap:wrap;margin:0 12px 13px}\n.aoBibleAtlasHistorySources a{display:inline-flex;align-items:center;min-height:38px;font:600 11px/1.3 system-ui;color:#f1d99f;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}\n.aoBibleAtlasHistorySources a:focus-visible{outline:2px solid #e5c48e;outline-offset:3px}\n@media(max-width:390px){.aoBibleAtlasHistoryNote p{font-size:12px}.aoBibleAtlasHistorySources{gap:10px}}";
const ATLAS_CONTEXT_SHORTCUT_CSS="\n.aoBibleCinemaSheetActions{display:flex;align-items:stretch;width:100%;background:#13202a;border-bottom:1px solid #a9946c55}\n.aoBibleCinemaSheetActions .aoBibleCinemaSheetToggle{flex:1;min-width:0;width:auto;border-bottom:0}\n.aoBibleCinemaContextShortcut{flex:none;margin:5px 6px 5px 0;min-height:40px;padding:8px 11px;border:1px solid #cdb17b66;border-radius:9px;background:#302c24;color:#efd9a8;cursor:pointer;font:600 11px/1.2 system-ui}\n.aoBibleCinemaContextShortcut:focus-visible{outline:2px solid #f5d99c;outline-offset:2px}\n@media(max-width:390px){.aoBibleCinemaSheetActions .aoBibleCinemaSheetToggle{padding:8px}.aoBibleCinemaSheetToggle>span{font-size:12px}.aoBibleCinemaContextShortcut{padding:6px 8px;margin-right:4px}}\n";
const ATLAS_READING_CSS="\n.aoBibleReadingToggle{background:#312c23!important;color:#f0d59c!important;border-color:#a8874a!important;position:sticky;left:0;z-index:2}\n.aoBibleReadingToggle[aria-expanded=true]{background:#51412c!important;outline:1px solid #dbbb76}\n.aoBibleReadingPanel{flex:none;max-height:min(38vh,290px);overflow-y:auto;overscroll-behavior:contain;border-bottom:1px solid #c6ab7944;background:#0d1823;padding:6px 12px 12px;scrollbar-width:thin}\n.aoBibleReadingPanel[hidden]{display:none!important}\n.aoBibleReadingDisclaimer{margin:5px 0 8px;color:#b6aa9a;font:11px/1.45 system-ui}\n.aoBibleReadingGroup{margin:0 0 10px}\n.aoBibleReadingGroup h3{margin:10px 0 5px;color:#d7c092;font:600 12px/1.35 Georgia,serif}\n.aoBibleReadingGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}\n.aoBibleReadingGrid button{display:flex;justify-content:space-between;align-items:center;text-align:left;gap:8px;min-height:44px;padding:9px 10px;background:#17222d;border:1px solid #9a866450;border-radius:8px;color:#eadbc5;font:12px/1.3 Georgia,serif;cursor:pointer;overflow-wrap:anywhere}\n.aoBibleReadingGrid button small{flex:none;font:10px/1.2 system-ui;color:#aeaa9e;white-space:nowrap}\n.aoBibleReadingGrid button[aria-pressed=true]{background:#353127;border-color:#e1be7a;color:#f2dcac}\n.aoBibleReadingGrid button:focus-visible,.aoBibleReadingToggle:focus-visible{outline:2px solid #efd28a;outline-offset:2px}\n@media(max-width:520px){.aoBibleReadingPanel{max-height:min(38vh,266px)}.aoBibleReadingGrid{grid-template-columns:minmax(0,1fr)}.aoBibleReadingGrid button{font-size:12px}}";
const ATLAS_CINEMA_CSS="\n.aoBibleAtlasSurface[data-bible-cinematic=review] .aoBibleCinemaChapters{display:flex;flex:none;gap:6px;overflow-x:auto;scrollbar-width:thin;overscroll-behavior-x:contain;padding:6px 11px;border-bottom:1px solid #d9c59a24;scroll-snap-type:x proximity}\n.aoBibleCinemaChapters button{scroll-snap-align:start;flex:none;max-width:180px;padding:8px 11px;min-height:44px;background:#141f2a;border:1px solid #d9c59a37;border-radius:11px;color:#c6b99d;font:600 11px/1.2 system-ui;cursor:pointer}\n.aoBibleCinemaChapters button[aria-pressed=true]{color:#f2e1bc;border-color:#d9b977;background:#332c23}\n.aoBibleCinemaChapters button:focus-visible,.aoBibleCinemaSheetToggle:focus-visible{outline:2px solid #e5c48e;outline-offset:2px}\n.aoBibleAtlasSurface[data-bible-cinematic=review] [data-bible-follow][aria-pressed=false]{color:#b0a6a0;border-color:#887762}\n.aoBibleAtlasSurface[data-bible-cinematic=review] [data-bible-follow][aria-pressed=true]{color:#f8ddb1;border-color:#e3bd7a;background:#322d24}\n.aoBibleAtlasSurface[data-bible-cinematic=review] .aoBibleAtlasDetail{max-height:62%;padding:0;overflow-y:auto}\n.aoBibleCinemaSheetToggle{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:44px;padding:12px 14px;text-align:left;color:#f3e4ce;background:#13202a;border:0;border-bottom:1px solid #a9946c55;cursor:pointer;font:500 14px/1.25 Georgia,serif}\n.aoBibleCinemaSheetToggle>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.aoBibleCinemaSheetToggle small{font:600 10px/1.2 system-ui;color:#c9ae75;white-space:nowrap}\n.aoBibleAtlasSurface[data-bible-cinematic=review] [data-bible-detail]{padding:12px 14px}\n.aoBibleAtlasSurface[data-bible-cinematic=review] .aoBibleAtlasDetail[data-bible-sheet=collapsed] [data-bible-detail]{display:none}\n.aoBibleAtlasSurface[data-bible-cinematic=review] .aoBibleAtlasOverlay:has(.aoBibleCinemaScene){pointer-events:none}\n.aoBibleCinemaScene{animation:aoAtlasCinemaScene 2.3s ease both;position:relative}\n.aoBibleCinemaScene [data-bible-chapter-dismiss]{pointer-events:auto;position:absolute;right:15px;top:15px;width:44px;height:44px;border:1px solid #d4bb8e88;border-radius:50%;color:#ead8ae;background:#15202c;font:24px Georgia,serif;cursor:pointer}\n@keyframes aoAtlasCinemaScene{0%{opacity:0}12%,65%{opacity:1}100%{opacity:0}}\n@media(max-width:520px){.aoBibleAtlasSurface[data-bible-cinematic=review] .aoBibleAtlasDetail{bottom:10px;left:10px;right:10px;max-height:60%}.aoBibleCinemaChapters button{min-height:44px}.aoBibleCinemaSheetToggle{padding:10px 12px}}\n\n.aoBiblePhysicalNote{position:absolute;top:13px;left:15px;z-index:4;pointer-events:none;\n max-width:calc(100% - 105px);padding:5px 7px;border:1px solid #bca57855;\n border-radius:6px;background:#0b1725e8;color:#dac79f;font:600 9px/1.3 system-ui;\n letter-spacing:.045em;text-transform:uppercase}\n.aoBibleAtlasSurface[data-bible-cinematic=review] .maplibregl-ctrl-attrib{\n color:#dbcba9;background:#0d1b29e0;box-shadow:none;border-radius:7px;font:10px/1.25 system-ui}\n.aoBibleAtlasSurface[data-bible-cinematic=review] .maplibregl-ctrl-attrib a{color:#e1cc92}\n.aoBibleAtlasSurface[data-bible-cinematic=review] .maplibregl-ctrl-attrib-button{\n background-color:#172635;border:1px solid #bcab8977}\n@media(max-width:520px){.aoBiblePhysicalNote{top:10px;left:12px;padding:4px 6px;max-width:calc(100% - 104px);font-size:8px}}\n@media(prefers-reduced-motion:reduce){.aoBibleCinemaScene{animation:none;opacity:1}}\n";
const ATLAS_CSS="\n.aoBibleAtlasMap{background:radial-gradient(ellipse at center,#16202a 0%,#0b111b 100%)}.aoBibleAtlasMap>.aoExploreMapLoading{inset:10px auto auto 10px;z-index:1;max-width:calc(100% - 82px);padding:6px 9px;font-size:11px}.aoBibleAtlasMapStage .aoBibleAtlasDetail{z-index:5}\n.aoBibleAtlasViewTabs{flex:none;display:flex;gap:6px;overflow-x:auto;padding:7px 10px;border-bottom:1px solid #c9ae752e}.aoBibleAtlasViewTabs button{flex:none;min-height:44px;border:1px solid #c9ae7546;border-radius:8px;padding:8px 10px;background:#17202b;color:#cfc5b2;font:600 11px system-ui}.aoBibleAtlasViewTabs button[aria-pressed=true]{background:#3d3326;border-color:#c9ae75;color:#f4e3b8}.aoBibleAtlasViewTabs button:focus-visible{outline:2px solid #e6c47b;outline-offset:2px}\n.aoBibleAtlasSurface{display:flex;flex-direction:column;height:100%;overflow:hidden;background:#080c12;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}\n.aoBibleAtlasHeader{display:flex;align-items:center;gap:12px;padding:9px 12px;border-bottom:1px solid #d9c59a26;flex:none}.aoBibleAtlasHeader>div{flex:1}.aoBibleAtlasHeader small{color:#b4a17f;letter-spacing:.11em;font:600 10px system-ui}.aoBibleAtlasHeader h1{margin:2px 0;color:#f0e6d3;font:500 23px Georgia,serif}.aoBibleAtlasHeader button{width:44px;height:44px;flex:none;border:1px solid #d9c59a38;border-radius:50%;background:#16202b;color:#ead8ae;font-size:23px;cursor:pointer}\n.aoBibleAtlasEraHeader{padding:10px 16px 5px;display:flex;align-items:baseline;justify-content:space-between;gap:12px}.aoBibleAtlasEraHeader span{font:600 16px Georgia,serif;color:#e0c895}.aoBibleAtlasEraHeader small{font:10px/1.3 system-ui;color:#a39683}\n.aoBibleAtlasTimeline{position:relative;flex:none}.aoBibleAtlasTrack{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;overscroll-behavior-x:contain;scrollbar-width:thin;touch-action:pan-x;position:relative;padding:7px 0 12px}.aoBibleAtlasTrackPad{flex:0 0 calc(50% - 86px)}.aoBibleAtlasCursor{position:absolute;top:7px;bottom:12px;left:50%;border-left:1px solid #d9c59a88;pointer-events:none;z-index:2}\n.aoBibleAtlasStep{width:172px;min-width:172px;scroll-snap-align:center;text-align:center;background:transparent;border:0;color:#a79985;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:0 8px}.aoBibleAtlasDivider{height:14px;max-width:160px;font:600 9px system-ui;letter-spacing:.05em;text-transform:uppercase;color:#988462;white-space:nowrap}.aoBibleAtlasDot{width:9px;height:9px;border-radius:50%;background:#657281;box-shadow:0 0 0 2px #080c12,0 0 0 3px #5d6370}.aoBibleAtlasStep strong{font:500 13px/1.25 Georgia,serif;max-width:158px;min-height:32px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoBibleAtlasStep em{font:10px/1.3 system-ui;font-style:normal;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aoBibleAtlasStep.active{color:#f0e0bb}.aoBibleAtlasStep.active .aoBibleAtlasDot{background:#f3d99b;box-shadow:0 0 0 4px #aa874b66,0 0 16px #e9c6819c}\n.aoBibleAtlasMapStage{flex:1;min-height:180px;position:relative;padding:0 8px 8px}.aoBibleAtlasMapStage .aoBibleAtlasMap{width:100%;height:100%;min-height:0;margin:0;border-radius:12px;overflow:hidden;border:1px solid #d9c59a24}.aoBibleAtlasOverlay{position:absolute;inset:0;pointer-events:none;z-index:3;display:grid;place-items:center;overflow:hidden}.aoBibleAtlasOverlay:empty{display:none}.aoBibleAtlasEraScene{box-sizing:border-box;padding:34px 22px;width:100%;height:100%;background:radial-gradient(ellipse at center,#28323beb,#080c12f2);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;animation:aoAtlasEra 2.2s ease both}.aoBibleAtlasEraScene small{font:600 10px system-ui;letter-spacing:.25em;color:#c4a16a}.aoBibleAtlasEraScene h2{font:500 clamp(29px,6vw,48px)/1.1 Georgia,serif;color:#f5e6c8;margin:15px auto;max-width:660px}.aoBibleAtlasEraScene p{font:15px/1.5 Georgia,serif;color:#d4c4a6;max-width:510px}@keyframes aoAtlasEra{0%{opacity:0}12%,65%{opacity:1}100%{opacity:0}}\n.aoBibleAtlasDetail{position:absolute;bottom:16px;left:16px;right:16px;z-index:2;max-width:570px;max-height:43%;overflow:auto;background:#0a1015ee;border:1px solid #d9c59a46;border-radius:14px;padding:13px 16px;box-shadow:0 15px 30px #0009;backdrop-filter:blur(12px)}.aoBibleAtlasEyebrow{font:600 10px system-ui;letter-spacing:.12em;text-transform:uppercase;color:#cbb184}.aoBibleAtlasDetail h2{font:500 20px/1.15 Georgia,serif;margin:6px 0;color:#f5e7d2}.aoBibleAtlasDetail p{font:13px/1.4 Georgia,serif;margin:6px 0;color:#c7bda9}.aoBibleAtlasDetail .aoBibleAtlasPlace{color:#d9b677;font-style:italic}.aoBibleAtlasQualification{color:#b0a08a;font:11px/1.4 system-ui}.aoBibleAtlasActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}.aoBibleAtlasActions button,.aoBibleAtlasActions a{min-height:38px;padding:9px 12px;border:1px solid #d9c59a66;border-radius:999px;background:#292921;color:#edd6aa;font:600 11px system-ui;text-decoration:none;cursor:pointer}.aoBibleAtlasActions a{background:transparent}.aoBibleAtlasPinEpisodes{margin-top:12px;padding-top:10px;border-top:1px solid #d9c59a33}.aoBibleAtlasPinEpisodes h3{font:600 12px Georgia,serif;color:#e8d6b6;margin:0 0 8px}.aoBibleAtlasEpisodeScroll{max-height:170px;overflow:auto;display:grid;gap:3px}.aoBibleAtlasEpisodeScroll>div{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #d9c59a16}.aoBibleAtlasEpisodeScroll span{font:12px/1.35 Georgia,serif;color:#d7cebc}.aoBibleAtlasEpisodeScroll button{flex:none;min-height:38px;padding:7px 8px;border:1px solid #d9c59a36;border-radius:9px;background:#18222b;color:#dec69d;font:10px system-ui}.aoBibleAtlasStep:focus-visible,.aoBibleAtlasHeader button:focus-visible,.aoBibleAtlasActions button:focus-visible{outline:2px solid #f0d79d;outline-offset:2px}\n@media(max-width:520px){.aoBibleAtlasDetail{bottom:13px;left:13px;right:13px;max-height:42%;padding:11px 12px}.aoBibleAtlasStep{width:155px;min-width:155px}.aoBibleAtlasTrackPad{flex-basis:calc(50% - 77.5px)}.aoBibleAtlasDetail h2{font-size:18px}.aoBibleAtlasEraHeader small{max-width:145px;text-align:right}}@media(prefers-reduced-motion:reduce){.aoBibleAtlasEraScene{animation:none;opacity:0}}\n@media(max-width:480px){.aoBibleAtlasViewTabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;overflow:visible;padding:6px 8px}.aoBibleAtlasViewTabs button{min-width:0;white-space:normal;font-size:10px;line-height:1.15;padding:6px 2px}}\n.aoBibleAtlasUnlocated{display:none}.aoBibleAtlasMapStage[data-bible-unlocated=true]{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:12px;overflow-y:auto;overscroll-behavior:contain;padding:clamp(14px,3vw,30px);background:radial-gradient(ellipse at 50% 25%,#1d2831,#080c12 75%)}.aoBibleAtlasMapStage[data-bible-unlocated=true] .aoBibleAtlasMap{position:absolute;inset:0;opacity:0;pointer-events:none}.aoBibleAtlasMapStage[data-bible-unlocated=true] .aoBibleAtlasUnlocated{display:block;flex:none;position:relative;z-index:2;max-width:600px;width:100%;box-sizing:border-box;border-bottom:1px solid #d9c59a38;padding:12px 8px 16px;text-align:center;color:#bfb39f}.aoBibleAtlasUnlocated small{font:600 10px system-ui;letter-spacing:.15em;color:#c6a779}.aoBibleAtlasUnlocated p{font:14px/1.5 Georgia,serif;margin:8px auto 0;max-width:430px}.aoBibleAtlasMapStage[data-bible-unlocated=true] .aoBibleAtlasDetail{position:relative;flex:none;bottom:auto;left:auto;right:auto;z-index:3;box-sizing:border-box;width:100%;max-width:600px;max-height:none;overflow:visible;background:#0d151ee9}.aoBibleAtlasMapStage[data-bible-unlocated=true] .aoBibleAtlasOverlay{z-index:4}\n";
