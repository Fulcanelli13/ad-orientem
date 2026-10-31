// The whole-world directory, not a smaller R49 showcase, is the Explore owner.
// This proves one site per CL2 effective physical identity and that additional
// source listings remain accessible without fabricated pins, times or status.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49}
 from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
 from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json"));
const published=projectPublishedProvisionalMassSites(base,
 read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
assert.equal(base.length,1879);
assert.equal(published.length,1882);
const reported=(label,group)=>{
 const raw=String(label??"").trim().toUpperCase();
 return ["FSSP","ICKSP","IBP","AASJMV","SSPX"].includes(raw)?raw:
   group==="SSPX"?"SSPX":"OTHER";
};
const world=projectCL2PhysicalDirectory(published,index,{mapAffiliation:reported});
assert.equal(world.length,2582,"2,579 distinct CL2 physical sites + 3 published external additions");
assert.equal(new Set(world.map(item=>item.item_id)).size,2582);
assert.equal(new Set(world.filter(x=>x.physical_group_id).map(x=>x.physical_group_id)).size,2579);
assert.equal(world.filter(x=>x.map_publishable).length,1869);
// The external Photo Finder must consume exactly the approved runtime site
// markers. Never regress to the frozen R49 snapshot or create photo-search
// coordinates independently of Explore's canonical physical-site projection.
const photoPins=read("data/directory/generated/cl2-photo-ready-pin-overlay.v1.json");
assert.equal(photoPins.schema,"AO_CL2_PHOTO_READY_PIN_OVERLAY_V1");
assert.deepEqual(photoPins.counts,{new_site_pins:22,refined_existing_site_pins:9,corrected_existing_site_pins:3});
assert.equal(photoPins.pins.length,34);
assert.equal(new Set(photoPins.pins.map(p=>p.physical_group_id)).size,34);
for(const pin of photoPins.pins){
 const venue=world.find(x=>x.physical_group_id===pin.physical_group_id);
 assert.ok(venue&&venue.map_publishable&&venue.geo,"Photo index references an unmapped venue: "+pin.physical_group_id);
 assert.ok(venue.source_ids.includes(pin.source_id),"Photo pin source identity differs from CL2");
 assert.equal(venue.geo.lat,pin.lat,"Photo Finder pin latitude differs from Explore");
 assert.equal(venue.geo.lng,pin.lon,"Photo Finder pin longitude differs from Explore");
 assert.match(pin.source_url,/^https:\/\//);
 assert.ok(pin.review_scope,"Photo Finder requires explicit site/entrance precision disclosure");
}

const additional=world.filter(x=>x.physical_site_source==="CL2_MASTER"&&
 !published.some(b=>b.source_id===x.source_id));
assert.equal(additional.length,735);
const newSites=additional.filter(x=>!x.map_publishable);
assert.equal(newSites.length,713);
assert.ok(newSites.every(x=>x.map_state==="ADDRESS_ONLY"&&x.geo===null&&
 x.sections.length===0&&x.actions.length===0&&x.source_ids.length>=1));
assert.ok(newSites.every(x=>/MASS UNVERIFIED/.test(x.status)));
assert.ok(newSites.every(x=>x.affiliation_scope==="SOURCE_LABEL_ONLY"));
assert.ok(newSites.every(x=>x.summary.includes("not been independently verified")));
assert.equal(newSites.filter(x=>x.source_links.length===0).length<=196,true);
const noSource=newSites.filter(x=>x.source_links.length===0);
assert.ok(noSource.every(x=>x.source_ids.length>0&&x.note.includes("Research-listed")));
const cantius=world.filter(x=>x.source_ids?.includes("V19:SJC-001"));
assert.equal(cantius.length,1,"Canons of St John Cantius retains one exact source-backed church");
assert.equal(cantius[0].map_publishable,true);
// Thirty-one separately reviewed physical site or address references may be shown
// provisionally. A site marker does NOT verify a Mass or precise entrance.
for(const [group,id,name,lat,lng,osm,precision="site",reviewScope=null] of [
 ["RG-A39E87B5A30C","AO-EUR-GB-008",
  "Brompton Oratory (The London Oratory)",51.49714,-0.16964,"osm:way:851727368"],
 ["RG-DA2F4D212252","ORD-GB-OXFORD-ORATORY-ST-ALOYSIUS",
  "Oxford Oratory — St Aloysius Gonzaga",51.75935,-1.26183,"osm:way:65699768"],
 ["RG-FC7B994D657F","DIO-GB-WESTMINSTER-SPANISHPLACE-ST-JAMES",
  "St James's Church, Spanish Place",51.51819,-0.15256,"osm:way:160404637"],
 ["RG-EC5A4BA48BF9","ORD-GB-BIRMINGHAM-ORATORY-IMMACULATE-CONCEPTION",
  "Birmingham Oratory — Immaculate Conception",52.4723,-1.9288,
  "historicengland:1076349","site","CHURCH_AND_ORATORY_COMPLEX_NOT_ENTRANCE"],
 ["RG-D40A53ED496A","AO-EUR-GB-018",
  "Corpus Christi Catholic, Maiden Lane - Shrine of the Blessed Sacrament",
  51.5109,-0.1225,"historicengland:1238978","site",
  "CHURCH_AND_PRESBYTERY_SITE_NOT_ENTRANCE"],
 ["RG-EEE45B6A7403","AO-B34-L-GB-9D55FB39FDF9",
  "Buckfast Abbey",50.493,-3.7756,"historicengland:1209774"],

 ["RG-00D589BAB16C","ao-fssp-church-of-st-mary-538-broadway-providence-ri-02909-usa",
  "Church of St Mary",41.81761,-71.4367,"osm:way:314290719","site"],
 ["RG-04C900D93BC2","AO-EUR-GB-006",
  "Bournemouth Oratory",50.72097,-1.87861,"osm:way:128316070","site"],
 ["RG-4D711E72B9F0","DIO-GB-EASTANGLIA-NORWICH-CATHEDRAL",
  "Cathedral of St John the Baptist, Norwich",52.62902,1.28381,"osm:way:97370578","site"],
 ["RG-40584CA8DAE1","AO-B33-L-US-D5047631A0B7",
  "Our Lady of Clear Creek Abbey",36.03363,-95.19587,"osm:way:242465722","site",
  "MONASTERY_COMPLEX_NOT_CHURCH_ENTRANCE"],
 ["RG-16C25083C6C7","ao-icksp-st-mary-oratory-517-elm-st-rockford-il-61102-6",
  "St. Mary Oratory",42.27224,-89.09816,"geonames:4909682","site",
  "CHURCH_SITE_NOT_VERIFIED_ENTRANCE"],

 ["RG-2E1FB8361143","AO-B35-L-GB-BF86E1483C54",
  "St Mary's Church",53.38963,-2.5889,"osm:way:749035677","site"],
 ["RG-3E26F1928075","AO-B36-L-GB-7FBD70FF3B8C",
  "Lanherne Convent Chapel",50.4544,-4.9994,"historicengland:1144134","site",
  "CONVENT_SITE_NOT_CHAPEL_ENTRANCE"],
 ["RG-43C77660C303","AO-B34-L-GB-43BCEF5411CB",
  "Douai Abbey",51.41,-1.1717,"historicengland:1156252","site"],
 ["RG-2E17819D4F3E","AO-B51-FR-70ECC3A856F3",
  "Abbaye canoniale Sainte-Marie de Lagrasse",
  43.09034,2.61682,"osm:way:422967480","site"],
 ["RG-01F176BB1074","AO-B35-L-GB-91CDCC69A421",
  "Westminster Cathedral",51.49582,-0.13952,"osm:way:10810446","site"],
 ["RG-02AEBA830666","AO-B34-L-GB-D2A6AB6CE828",
  "Downside Abbey",51.2557,-2.49561,"osm:way:208920439","site"],
 ["RG-126045360426","AO-B34-L-GB-C9EB4357C73A",
  "Belmont Abbey",52.03933,-2.75637,"osm:way:66739205","site"],
 ["RG-233BF6946735","AO-B35-L-GB-202B59F268FE",
  "St Michael's Abbey",51.29716,-0.74965,"osm:way:512065892","site"],
 ["RG-119C7FEEF74A","AO-B33-L-FR-F0AF6F2DC54B",
  "Abbaye Sainte-Madeleine du Barroux",44.15182,5.09845,"osm:way:85350528","site"],
 ["RG-3991DD293F9C","AO-B51-FR-92914B534B3A",
  "Abbaye Notre-Dame de l’Annonciation du Barroux",
  44.15639,5.11822,"osm:way:337377568","site"],
 ["RG-03C2AD02BC81","AO-B50-SSPV-US-FC03F5009C8",
  "Immaculate Heart of Mary Church",47.5244,-111.27331,"osm:node:9251507643","site"],
 ["RG-0611CE5E7367","AO-B51-FR-782F8A2B2031",
  "Monastère Saint-Benoît",43.41996,6.12229,"osm:node:12702212301","site"],
 ["RG-02EBA275AC72","AO-B50-CMRI-US-C169C047AC2",
  "Most Holy Rosary Church",42.71278,-85.46250,"usgs:gnis:2572764","site"],
 ["RG-03AE4CE86D2B","AO-B56-US-5EF870DC7969",
  "Blessed Sacrament Church — Martinez",38.016898,-122.130969,
  "churcheslist:blessed-sacrament-church-45","address"],
 ["RG-B65-C4264A1A8340","AO-RSCH-B65-C4264A1A8340",
  "St Antonius",47.5638664,7.572879,"osm:way:266520642","site"],
 ["RG-2447873BB8F5","AO-B41-LOC-IT-8584201FAF73",
  "Seminario Internazionale San Filippo Neri",43.8033638,11.3799351,"osm:way:848071308"],
 ["RG-54863B401267","AO-B40-LOC-BE-7CC60D5F039A",
  "Chapelle Sainte-Rita",50.5357494,3.5450717,"osm:way:962673284"],
 ["RG-B65-EF400B6F8E93","AO-RSCH-B65-EF400B6F8E93",
  "Franziskanerkirche",51.1252861,14.9862707,"osm:way:139932554"],
 ["RG-B65-AFB4955D79E8","AO-RSCH-B65-AFB4955D79E8",
  "Kerzenkapelle",51.58389,6.24377,"osm:way:152838071"],
 ["RG-B69-3A43E996D0D9","AO-RSCH-B69-3A43E996D0D9",
  "Wallfahrtskirche Maria Vesperbild",48.2798,10.54221,"osm:way:100214876"],
]){
 const mapped=world.find(x=>x.physical_group_id===group);
 assert.ok(mapped,"Independently reviewed site pin missing");
 assert.equal(mapped.source_id,id);
 const inherited=published.find(x=>x.source_id===id);
 assert.equal(mapped.item_id,inherited?.item_id||"tlm:cl2:"+group);
 assert.ok(mapped.title, "Canonical source title remains populated");
 assert.equal(index.records.find(x=>x[0]===group)[2],name);
 assert.equal(mapped.geo.lat,lat);
 assert.equal(mapped.geo.lng,lng);
 assert.equal(mapped.geo.source_ref,osm);
 assert.equal(mapped.geo.precision,precision);
 assert.equal(mapped.geo.approximate,true);
 assert.equal(mapped.geo.review_scope,reviewScope||(precision==="address"?"ADDRESS_POINT_NOT_ENTRANCE":"PHYSICAL_CHURCH_NOT_ENTRANCE"));
 assert.equal(mapped.map_publishable,true);
 assert.equal(mapped.map_state,"PROVISIONAL");
 if(!inherited)assert.match(mapped.status,/MASS UNVERIFIED/);
 assert.equal(mapped.sections.length,0);
 assert.equal(mapped.actions.length,0);
 assert.ok(mapped.source_links.length>=2&&mapped.source_links.every(l=>l.url.startsWith("https://")));
}

const rockford=world.find(x=>x.physical_group_id==="RG-16C25083C6C7");
assert.equal(rockford.address.formatted,"126 S Winnebago St, Rockford, IL 61102");
assert.ok(rockford.address.formatted.includes("126 S Winnebago St"));
assert.ok(!rockford.address.formatted.includes("517 Elm St"),"Never direct visitors to mailing address");
assert.ok(rockford.search_text.includes("517 elm st"),"Retain source-master alias for research search");
assert.match(rockford.note,/mailing address/);
const clearCreek=world.find(x=>x.physical_group_id==="RG-40584CA8DAE1");
assert.match(clearCreek.facts.find(f=>f.label==="Map position").value,/monastery complex/);
assert.equal(clearCreek.geo.review_scope,"MONASTERY_COMPLEX_NOT_CHURCH_ENTRANCE");

// Two geographically divergent R49 aliases retain the canonical selected
// church identity, but use an independently corroborated existing source pin.
for(const [group,canonical,corrected,evidence,expectedAddress] of [
 ["RG-956BB24E14EA","AO-WORLD-R35-AU-01-06",
  "LMD:maternal-heart-of-mary-church-lewisham-australia",
  "https://mapcarta.com/W1072172027","Charles O'Neill"],
 ["RG-4279040C75AD","AO-WORLD-R35-AU-02-20",
  "LMD:crypt-chapel-of-our-lady-of-sorrows-geraldton-australia",
  "https://towerbells.org/data/AUGRLNSF.HTM","Cathedral Avenue"],
]){
 const item=world.find(x=>x.physical_group_id===group);
 const original=published.find(x=>x.source_id===canonical);
 const alternate=published.find(x=>x.source_id===corrected);
 assert.ok(item&&original&&alternate,"Only existing source-backed alias points may be selected");
 assert.equal(item.item_id,original.item_id,"Canonical source identity must not change");
 assert.equal(item.source_id,canonical);
 assert.equal(item.geo.lat,alternate.geo.lat);
 assert.equal(item.geo.lng,alternate.geo.lng);
 assert.equal(item.geo.source_ref,corrected);
 assert.equal(item.geo.source_url,evidence);
 assert.equal(item.geo.review_scope,"PHYSICAL_CHURCH_NOT_ENTRANCE");
 assert.equal(item.geo.precision,"source_marker_unassessed");
 assert.equal(item.geo.approximate,true);
 assert.equal(item.map_state,"PROVISIONAL");
 assert.equal(item.map_publishable,true);
 assert.ok(item.source_ids.includes(canonical)&&item.source_ids.includes(corrected));
 assert.ok(item.source_links.some(x=>x.url===evidence));
 assert.match(item.address.formatted,new RegExp(expectedAddress,"i"));
 assert.deepEqual(published.find(x=>x.source_id===canonical),original,
   "Frozen R49 source must not be modified by the read-model adjudication");
}
const galway=world.find(x=>x.physical_group_id==="RG-9DE31147B6ED");
const galwayAlt=published.find(x=>x.source_id==="ao-research-icksp-federated-v13-icksp-stg-125");
assert.ok(galway&&galwayAlt,"Galway alias and original ICKSP site pin must remain present");
assert.equal(galway.item_id,
 "tlm:r49:LMD:seipeal-colaiste-naoi%e1%b9%81-muire-saint-marys-college-chapel-galway-ireland",
 "Deduplication must preserve canonical source identity");
assert.equal(galway.geo.lat,galwayAlt.geo.lat);
assert.equal(galway.geo.lng,galwayAlt.geo.lng);
assert.equal(galway.geo.source_ref,galwayAlt.source_id);
assert.equal(galway.geo.source_url,"https://www.galwaymusiccentre.ie/contact-1");
assert.equal(galway.geo.approximate,true);
assert.equal(galway.geo.precision,"source_marker_unassessed");
assert.equal(galway.geo.review_scope,"PHYSICAL_CHURCH_NOT_ENTRANCE");
assert.equal(galway.map_state,"PROVISIONAL");
assert.ok(galway.source_links.some(x=>x.url==="https://galway.icksp.ie/"));
const newUs=newSites.find(x=>x.title==="St Philomena Catholic Church"&&x.subtitle.includes("US"));
assert.ok(newUs,"Unlocated research-listed CMRI-directory chapel must remain searchable");
assert.ok(filterPreliminaryR49(world,{query:"St Philomena Catholic Church"}).some(x=>x.item_id===newUs.item_id));
assert.ok(/MASS UNVERIFIED/.test(renderDirectoryVenueCard(newUs)));
assert.equal(filterPreliminaryR49(world,{}).length,2582,
 "Unfiltered directory must include the worldwide corpus, not just R49");
const vm=buildExploreViewModel({language:"en",lens:"tlm",items:world,view:"list",
 filters:{directoryGroup:"ALL",affiliations:[],query:""}});
assert.equal(vm.mapped,1869);
assert.equal(vm.addressOnly,713);
const html=renderExploreToString(vm);
assert.match(html,/2,582|2582/);
assert.match(html,/713/);
assert.match(html,/list only · no map pin/);
assert.doesNotMatch(html,/735 address only/);
assert.doesNotMatch(html,/2,579 mapped/);
console.log("PASS CL2 worldwide directory: 2,579 unique physical sites, 35 R49 aliases absorbed, 715 list-only plus 10 source-backed site/address markers, 3 separate published additions");
