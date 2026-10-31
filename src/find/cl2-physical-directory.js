// Derived read-model adapter for the single CL2 physical-site master.
// Exactly one Explore record per effective physical site; source aliases are
// preserved for search and provenance, never published as duplicate churches.
export const CL2_PHYSICAL_SITE_INDEX_URL=new URL("../../data/directory/generated/cl2-physical-site-index.v1.json",import.meta.url).href;
export const CL2_PHYSICAL_SITE_COUNT=2579;
export const CL2_EXPECTED_R49_GROUPS=1844;
export const CL2_EXPECTED_NEW_GROUPS=735;
const T=v=>String(v??"").trim();
const normal=s=>T(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const validUrl=s=>/^https?:\/\/[^\s<>"']+$/i.test(s);
const https=s=>/^https:\/\/[^\s<>"']+$/i.test(s);
const unique=a=>[...new Set(a)];

// Explicit adjudications of divergent *existing* R49 site pins. Keep original
// source records immutable and preserve the selected venue's item/source ID.
// A church building is corroborated; a precise visitor entrance is NOT.
// Never infer a new coordinate from the postal address or another venue.
const REVIEWED_SITE_GEO_SOURCES=Object.freeze({
 "RG-956BB24E14EA":Object.freeze({
  sourceId:"LMD:maternal-heart-of-mary-church-lewisham-australia",
  evidence:Object.freeze([
   "https://mapcarta.com/W1072172027", // OSM exact FSSP church building
   "https://maternalheart.org/contact-us/", // parish address, Charles O'Neill Way
  ]),
 }),
 "RG-4279040C75AD":Object.freeze({
  sourceId:"LMD:crypt-chapel-of-our-lady-of-sorrows-geraldton-australia",
  evidence:Object.freeze([
   "https://towerbells.org/data/AUGRLNSF.HTM", // Cathedral Avenue, independent building location
   "https://www.geraldtondiocese.org.au/parishes/geraldton-parishes",
  ]),
 }),
 "RG-9DE31147B6ED":Object.freeze({
  sourceId:"ao-research-icksp-federated-v13-icksp-stg-125",
  evidence:Object.freeze([
   "https://www.galwaymusiccentre.ie/contact-1", // same college building: published main entrance + coordinates
   "https://galway.icksp.ie/", // ICKSP: St Mary's College Chapel, St Mary's Road
   "https://weekdaymasses.org.uk/en/area/galway/churches", // chapel left behind main college building
  ]),
 }),
});
// Only separately verified exact-building coordinates can promote an
// unlocated CL2 research listing to a provisional physical-site marker.
// Names, country, source ID and street must all match the frozen source row.
const REVIEWED_NEW_SITE_PINS=Object.freeze({
 "RG-2E1FB8361143":Object.freeze({
  sourceId:"AO-B35-L-GB-BF86E1483C54",name:"St Mary's Church",
  country:"GB",addressNeedle:"Smith Street",placeId:null,
  lat:53.38963,lng:-2.5889,sourceRef:"osm:way:749035677",
  sourceUrl:"https://www.openstreetmap.org/way/749035677",
  evidence:Object.freeze([
   "https://mapcarta.com/W749035677",
   "https://fssp.org.uk/warrington/",
  ]),
 }),
 "RG-3E26F1928075":Object.freeze({
  sourceId:"AO-B36-L-GB-7FBD70FF3B8C",
  name:"Lanherne Convent Chapel",country:"GB",addressNeedle:"St Mawgan",
  placeId:null,lat:50.4544,lng:-4.9994,precision:"site",
  reviewScope:"CONVENT_SITE_NOT_CHAPEL_ENTRANCE",
  sourceRef:"historicengland:1144134",
  sourceUrl:"https://gb.britishlistedbuildings.co.uk/101144134-lanherne-carmelite-convent-mawgan-in-pydar/maps",
  attribution:"Historic England listed building 1144134 · convent campus",
  evidence:Object.freeze([
   "https://icksp.org.uk/cornwall/support-our-apostolates-in-devon-and-cornwall/",
   "https://historicengland.org.uk/listing/the-list/list-entry/1144134",
  ]),
 }),
 "RG-43C77660C303":Object.freeze({
  sourceId:"AO-B34-L-GB-43BCEF5411CB",name:"Douai Abbey",
  country:"GB",addressNeedle:"Reading",placeId:null,
  lat:51.41,lng:-1.1717,sourceRef:"historicengland:1156252",
  sourceUrl:"https://britishlistedbuildings.co.uk/101156252-douai-abbey-church-woolhampton/maps",
  attribution:"Historic England listed building 1156252 · church",
  evidence:Object.freeze([
   "https://historicengland.org.uk/listing/the-list/list-entry/1156252",
   "https://lms.org.uk/list-of-churches",
  ]),
 }),
 "RG-2E17819D4F3E":Object.freeze({
  sourceId:"AO-B51-FR-70ECC3A856F3",
  name:"Abbaye canoniale Sainte-Marie de Lagrasse",country:"FR",
  addressNeedle:"Lagrasse",placeId:null,
  lat:43.09034,lng:2.61682,sourceRef:"osm:way:422967480",
  sourceUrl:"https://www.openstreetmap.org/way/422967480",
  evidence:Object.freeze([
   "https://mapcarta.com/W422967480",
   "https://www.lagrasse.org/decouvrir-labbaye/horaires-des-offices/",
  ]),
 }),
 "RG-01F176BB1074":Object.freeze({
  sourceId:"AO-B35-L-GB-91CDCC69A421",name:"Westminster Cathedral",
  country:"GB",addressNeedle:"London",placeId:"place:GB:westminster-cathedral",
  lat:51.49582,lng:-0.13952,sourceRef:"osm:way:10810446",
  sourceUrl:"https://www.openstreetmap.org/way/10810446",
  evidence:Object.freeze([
   "https://mapcarta.com/36313110",
   "https://westminstercathedral.org.uk/",
  ]),
 }),
 "RG-02AEBA830666":Object.freeze({
  sourceId:"AO-B34-L-GB-D2A6AB6CE828",name:"Downside Abbey",
  country:"GB",addressNeedle:"Radstock",placeId:null,
  lat:51.2557,lng:-2.49561,sourceRef:"osm:way:208920439",
  sourceUrl:"https://www.openstreetmap.org/way/208920439",
  evidence:Object.freeze([
   "https://mapcarta.com/36304310",
   "https://downsideabbey.co.uk/",
  ]),
 }),
 "RG-126045360426":Object.freeze({
  sourceId:"AO-B34-L-GB-C9EB4357C73A",name:"Belmont Abbey",
  country:"GB",addressNeedle:"Hereford",placeId:null,
  lat:52.03933,lng:-2.75637,sourceRef:"osm:way:66739205",
  sourceUrl:"https://www.openstreetmap.org/way/66739205",
  evidence:Object.freeze([
   "https://mapcarta.com/W66739205",
   "https://www.belmontabbey.org.uk/",
  ]),
 }),
 "RG-233BF6946735":Object.freeze({
  sourceId:"AO-B35-L-GB-202B59F268FE",name:"St Michael's Abbey",
  country:"GB",addressNeedle:"Farnborough",placeId:null,
  lat:51.29716,lng:-0.74965,sourceRef:"osm:way:512065892",
  sourceUrl:"https://www.openstreetmap.org/way/512065892",
  evidence:Object.freeze([
   "https://mapcarta.com/W512065892",
   "https://farnboroughabbey.org/visiting",
  ]),
 }),
 "RG-119C7FEEF74A":Object.freeze({
  sourceId:"AO-B33-L-FR-F0AF6F2DC54B",name:"Abbaye Sainte-Madeleine du Barroux",
  country:"FR",addressNeedle:"1201 chemin des Rabassières",
  placeId:null,lat:44.15182,lng:5.09845,sourceRef:"osm:way:85350528",
  sourceUrl:"https://www.openstreetmap.org/way/85350528",
  evidence:Object.freeze([
   "https://mapcarta.com/fr/W85350528",
   "https://www.barroux.org/",
  ]),
 }),
 "RG-3991DD293F9C":Object.freeze({
  sourceId:"AO-B51-FR-92914B534B3A",
  name:"Abbaye Notre-Dame de l’Annonciation du Barroux",
  country:"FR",addressNeedle:"750 chemin des Ambrosis",
  placeId:null,lat:44.15639,lng:5.11822,sourceRef:"osm:way:337377568",
  sourceUrl:"https://www.openstreetmap.org/way/337377568",
  evidence:Object.freeze([
   "https://mapcarta.com/fr/W337377568",
   "https://annonciation.fr/",
  ]),
 }),
 "RG-03C2AD02BC81":Object.freeze({
  sourceId:"AO-B50-SSPV-US-FC03F5009C8",name:"Immaculate Heart of Mary Church",
  country:"US",addressNeedle:"2200 Smelter Ave",placeId:null,
  lat:47.5244,lng:-111.27331,sourceRef:"osm:node:9251507643",
  sourceUrl:"https://www.openstreetmap.org/node/9251507643",
  evidence:Object.freeze([
   "https://mapcarta.com/23662928",
   "https://stpiusvchapel.org/mass-locations/",
  ]),
 }),
 "RG-0611CE5E7367":Object.freeze({
  sourceId:"AO-B51-FR-782F8A2B2031",name:"Monastère Saint-Benoît",
  country:"FR",addressNeedle:"4763 route Théodore Linari",placeId:null,
  lat:43.41996,lng:6.12229,sourceRef:"osm:node:12702212301",
  sourceUrl:"https://www.openstreetmap.org/node/12702212301",
  evidence:Object.freeze([
   "https://mapcarta.com/fr/N12702212301",
   "https://www.monasterebrignoles.org/contact.html",
  ]),
 }),
 "RG-02EBA275AC72":Object.freeze({
  sourceId:"AO-B50-CMRI-US-C169C047AC2",name:"Most Holy Rosary Church",country:"US",
  addressNeedle:"314 E Main St",placeId:null,
  lat:42.71278,lng:-85.46250,precision:"site",
  sourceRef:"usgs:gnis:2572764",
  sourceUrl:"https://topoquest.com/map/usgs-24k/michigan/middleville/29132",
  attribution:"USGS Geographic Names Information System · named church site",
  evidence:Object.freeze([
   "https://www.mostholyrosarycmri.org/",
   "https://churcheslist.com/most-holy-rosary-church-2",
  ]),
 }),
 "RG-03AE4CE86D2B":Object.freeze({
  sourceId:"AO-B56-US-5EF870DC7969",name:"Blessed Sacrament Church — Martinez",
  country:"US",addressNeedle:"1150 Mellus St",placeId:null,
  lat:38.016898,lng:-122.130969,precision:"address",
  reviewScope:"ADDRESS_POINT_NOT_ENTRANCE",
  sourceRef:"churcheslist:blessed-sacrament-church-45",
  sourceUrl:"https://churcheslist.com/blessed-sacrament-church-45",
  attribution:"ChurchesList · approximate public street-address coordinate",
  evidence:Object.freeze([
   "https://martinezchamber.com/wp-content/uploads/RelocationGuideJune2015.pdf",
   "https://romancatholicinstitute.org/mass-centers/",
  ]),
 }),
 "RG-B65-C4264A1A8340":Object.freeze({
  sourceId:"AO-RSCH-B65-C4264A1A8340",name:"St Antonius",country:"CH",
  addressNeedle:"Kannenfeldstrasse 35",placeId:null,
  lat:47.5638664,lng:7.572879,sourceRef:"osm:way:266520642",
  sourceUrl:"https://www.openstreetmap.org/way/266520642",
  evidence:Object.freeze([
   "https://www.antoniuskirche.ch/kontakt",
   "https://www.antoniuskirche.ch/agenda?ShowStart=109&category=A1B328W5&instanceId=HC39P2DA&location=all&startDate=04.09.2026",
  ]),
 }),
 "RG-2447873BB8F5":Object.freeze({
  sourceId:"AO-B41-LOC-IT-8584201FAF73",
  name:"Seminario Internazionale San Filippo Neri",
  country:"IT",addressNeedle:"Via di Gricigliano 52",
  placeId:null,
  lat:43.8033638,lng:11.3799351,sourceRef:"osm:way:848071308",
  sourceUrl:"https://www.openstreetmap.org/way/848071308",
  evidence:Object.freeze([
   "https://mapcarta.com/W848071308",
   "https://www.icrsp.org/Publicationsbis/Publications-italiennes/Bollettino68.pdf",
  ]),
 }),
 "RG-54863B401267":Object.freeze({
  sourceId:"AO-B40-LOC-BE-7CC60D5F039A",
  name:"Chapelle Sainte-Rita",country:"BE",
  addressNeedle:"Rue de la Savatte 10",
  placeId:null,
  lat:50.5357494,lng:3.5450717,sourceRef:"osm:way:962673284",
  sourceUrl:"https://www.openstreetmap.org/way/962673284",
  evidence:Object.freeze([
   "https://icrspfrance.fr/?org=11499",
   "https://streets.openalfa.be/streets/rue-de-la-savatte-brasmenil-peruwelz",
  ]),
 }),
 "RG-B65-EF400B6F8E93":Object.freeze({
  sourceId:"AO-RSCH-B65-EF400B6F8E93",
  name:"Franziskanerkirche",country:"DE",
  addressNeedle:"An den Neißewiesen 91",
  placeId:null,
  lat:51.1252861,lng:14.9862707,sourceRef:"osm:way:139932554",
  sourceUrl:"https://www.openstreetmap.org/way/139932554",
  evidence:Object.freeze([
   "https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php",
   "https://www.fssp.org/en/find-us/where-are-we/",
  ]),
 }),
 "RG-B65-AFB4955D79E8":Object.freeze({
  sourceId:"AO-RSCH-B65-AFB4955D79E8",name:"Kerzenkapelle",
  country:"DE",addressNeedle:"Kapellenplatz",placeId:"place:DE:kevelaer-kerzenkapelle",
  lat:51.58389,lng:6.24377,sourceRef:"osm:way:152838071",
  sourceUrl:"https://www.openstreetmap.org/way/152838071",
  evidence:Object.freeze([
   "https://mapcarta.com/de/W152838071",
   "https://www.wallfahrt-kevelaer.de/gottesdienste/sommer-und-winterordnung",
  ]),
 }),
 "RG-B69-3A43E996D0D9":Object.freeze({
  sourceId:"AO-RSCH-B69-3A43E996D0D9",name:"Wallfahrtskirche Maria Vesperbild",
  country:"DE",addressNeedle:"Schellenbacher Straße 4",
  placeId:"place:DE:maria-vesperbild",
  lat:48.2798,lng:10.54221,sourceRef:"osm:way:100214876",
  sourceUrl:"https://www.openstreetmap.org/way/100214876",
  evidence:Object.freeze([
   "https://mapcarta.com/de/W100214876",
   "https://bistum-augsburg-portal.de/pfarreien/maria-vesperbild-wallfahrtsdirektion-mariae-schmerzen",
  ]),
 }),
});
const family=(aff,mapAffiliation)=>{
 const group=mapAffiliation?.(aff,"UNKNOWN");
 return T(group)||"OTHER";
};
export function validateCL2PhysicalIndex(index){
 if(index?.schema!=="AO_CL2_PHYSICAL_SITE_RUNTIME_INDEX_V1"||
   !Array.isArray(index.records)||index.records.length!==CL2_PHYSICAL_SITE_COUNT||
   index.counts?.effective_physical_sites!==CL2_PHYSICAL_SITE_COUNT)
   throw new Error("Invalid CL2 effective-physical-site directory index");
 const seen=new Set(),sourceOwners=new Map();
 for(const row of index.records){
  if(!Array.isArray(row)||row.length!==7||!/^RG-[A-Z0-9-]+$/.test(T(row[0]))||
    seen.has(row[0])||!Array.isArray(row[1])||!row[1].length||
    !T(row[2])||!/^[A-Z]{2}$/.test(T(row[3]))||
    !Array.isArray(row[6])||row[6].some(u=>!validUrl(u)))
    throw new Error("Invalid CL2 source-owned physical-site row");
  seen.add(row[0]);
  for(const source of row[1]){
   if(!T(source))throw new Error("Empty physical-site source identity");
   if(sourceOwners.has(source)&&sourceOwners.get(source)!==row[0])
    throw new Error("One source ID maps to multiple physical sites: "+source);
   sourceOwners.set(source,row[0]);
  }
 }
 return index;
}
/**
 * Reuse the existing R49 map coordinates and exact-photo source identifiers.
 * Admit missing CL2 groups as list-only research candidates. Do not geocode,
 * synthesize a schedule, or infer an institute's liturgy or ecclesial position.
 * The three separately approved additions remain distinct pending CL2 matching.
 */
export function projectCL2PhysicalDirectory(baseItems,index,{mapAffiliation}={}){
 validateCL2PhysicalIndex(index);
 const base=Array.isArray(baseItems)?baseItems:[];
 const sourceToItem=new Map();
 for(const item of base)if(item?.source_id)sourceToItem.set(item.source_id,item);
 const claimed=new Set(),result=[];let matched=0,unmapped=0,absorbedAliasRows=0;
 const list=Array.isArray(index.records)?index.records:[];
 for(const row of list){
  const [anchor,sourceIds,name,country,description,affiliation,sourceUrls]=row;
  const exact=unique(sourceIds.map(id=>sourceToItem.get(id)).filter(Boolean));
  const linked=exact.sort((a,b)=>
   Number(Boolean(b.geo?.precision==="building"))-Number(Boolean(a.geo?.precision==="building")));
  const selected=linked[0]??null;
  const review=REVIEWED_SITE_GEO_SOURCES[anchor]??null;
  const newPin=REVIEWED_NEW_SITE_PINS[anchor]??null;
  const siteGeoSource=review?linked.find(x=>x.source_id===review.sourceId):null;
  if(review&&(!selected||!sourceIds.includes(review.sourceId)||
     !siteGeoSource?.geo||!Number.isFinite(siteGeoSource.geo.lat)||
     !Number.isFinite(siteGeoSource.geo.lng)||review.evidence.some(x=>!https(x))))
    throw new Error("Unverifiable CL2 site coordinate adjudication: "+anchor);
  const source_links=unique([...(review?.evidence??[]),
    ...(linked.flatMap(item=>(item.source_links??[]).map(s=>s.url))),
    ...sourceUrls,...(newPin?.evidence??[]),...(newPin?[newPin.sourceUrl]:[])].filter(url=>https(url))).slice(0,12).map((url,i)=>Object.freeze({
     id:anchor+"-source-"+i,title:i===0?"Original listing":"Additional research source",
     issuer:"CL2 physical-site sources",url
    }));
  const search_text=normal([name,country,description,affiliation,...sourceIds,
    ...linked.flatMap(item=>[item.title,item.subtitle,item.eyebrow,item.search_text])].join(" "));
  if(selected){
   for(const a of linked)claimed.add(a.item_id);
   absorbedAliasRows+=Math.max(0,linked.length-1);
   matched++;
   // Transfer the independently corroborated *existing source point* only,
   // never the source's venue identity, timetable or implied entrance accuracy.
   const siteGeo=review?Object.freeze({...selected.geo,
    lat:siteGeoSource.geo.lat,lng:siteGeoSource.geo.lng,
    precision:"source_marker_unassessed",approximate:true,
    source_ref:review.sourceId,source_url:review.evidence[0],
    review_scope:"PHYSICAL_CHURCH_NOT_ENTRANCE",
   }):selected.geo;
   result.push(Object.freeze({...selected,
    ...(review?{
     geo:siteGeo,address:Object.freeze({formatted:T(description)}),
     note:T(selected.note)+" Site marker cross-checked against the church building, not a verified entrance.",
    }:{}),
    physical_group_id:anchor,source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",source_links:Object.freeze(source_links),
    search_text,affiliation_scope:"SOURCE_LABEL_ONLY",
   }));
  }else{
   unmapped++;
   if(newPin&&(!sourceIds.includes(newPin.sourceId)||T(name)!==newPin.name||
     country!==newPin.country||!T(description).includes(newPin.addressNeedle)||
     (newPin.placeId&&!newPin.placeId.startsWith("place:"+country+":"))||
     !Number.isFinite(newPin.lat)||Math.abs(newPin.lat)>90||
     !Number.isFinite(newPin.lng)||Math.abs(newPin.lng)>180||
     !/^(?:osm:(?:way|node):\d+|usgs:gnis:\d+|churcheslist:[a-z0-9-]+|historicengland:\d+)$/.test(newPin.sourceRef)||
     !https(newPin.sourceUrl)||newPin.evidence.some(url=>!https(url))))
    throw new Error("CL2 reviewed pin no longer matches source identity: "+anchor);
   const affiliationName=T(affiliation)||"Source affiliation not established";
   const community_id=family(affiliationName,mapAffiliation);
   result.push(Object.freeze({
    item_id:"tlm:cl2:"+anchor,source_id:sourceIds[0],
    physical_group_id:anchor,source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",lens:"tlm",kind:"TLM_VENUE",
    community_id,preliminary_group:"UNKNOWN",affiliation_scope:"SOURCE_LABEL_ONLY",
    eyebrow:affiliationName,status:"RESEARCH-LISTED · MASS UNVERIFIED",
    title:T(name),subtitle:[T(description),country].filter(Boolean).join(" · "),
    summary:"Physical site recorded in the research master. Current traditional Mass use, the minister, liturgical books and timetable have not been independently verified.",
    address:{formatted:T(description)||country},
    geo:newPin?Object.freeze({
     lat:newPin.lat,lng:newPin.lng,precision:newPin.precision||"site",approximate:true,
     attribution:newPin.attribution||"© OpenStreetMap contributors · ODbL 1.0",
     source_ref:newPin.sourceRef,source_url:newPin.sourceUrl,
     review_scope:newPin.reviewScope||"PHYSICAL_CHURCH_NOT_ENTRANCE",
    }):null,
    map_publishable:Boolean(newPin),
    map_state:newPin?"PROVISIONAL":"ADDRESS_ONLY",facts:Object.freeze([
     {label:"Source identity",value:"CL2 physical-site master · "+anchor},
     ...(newPin?[{label:"Map position",value:"Reviewed church building · entrance not independently verified"}]:[]),
     {label:"Affiliation",value:affiliationName+" (source label only)"},
     {label:"Mass times",value:"Unverified · no timetable published"},
    ]),sections:Object.freeze([]),actions:Object.freeze([]),
    source_links:Object.freeze(source_links),
    note:"Research-listed site, not a confirmed current Mass venue. Source affiliation does not establish the celebrant, Una Cum, missal, rite, or official ministry. Verify locally before travelling."+
     (newPin?" Physical site geometry sourced from "+(newPin.placeId||newPin.sourceRef)+"; entrance and Mass use are unverified.":""),
    search_text,
   }));
  }
 }
 const extra=base.filter(item=>!claimed.has(item.item_id));
 // Only the three approved, non-CL2 additions may survive outside this master.
 if(matched!==CL2_EXPECTED_R49_GROUPS||unmapped!==CL2_EXPECTED_NEW_GROUPS||
   absorbedAliasRows!==35||extra.length!==3||
   extra.some(item=>!T(item.item_id).startsWith("tlm:published-provisional:")))
  throw new Error("CL2/Explore physical-site reconciliation changed: "+
   JSON.stringify({matched,unmapped,absorbedAliasRows,extra:extra.length}));
 return Object.freeze([...result,...extra]);
}
