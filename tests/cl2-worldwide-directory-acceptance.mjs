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
assert.equal(world.filter(x=>x.map_publishable).length,1863);
const additional=world.filter(x=>x.physical_site_source==="CL2_MASTER"&&
 !published.some(b=>b.source_id===x.source_id));
assert.equal(additional.length,735);
const newSites=additional.filter(x=>!x.map_publishable);
assert.equal(newSites.length,719);
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
// Sixteen separately reviewed physical site or address references may be shown
// provisionally. A site marker does NOT verify a Mass or precise entrance.
for(const [group,id,name,lat,lng,osm,precision="site"] of [
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
 const mapped=additional.find(x=>x.physical_group_id===group);
 assert.ok(mapped,"Independently reviewed site pin missing");
 assert.equal(mapped.source_id,id);
 assert.equal(mapped.item_id,"tlm:cl2:"+group);
 assert.equal(mapped.title,name);
 assert.equal(mapped.geo.lat,lat);
 assert.equal(mapped.geo.lng,lng);
 assert.equal(mapped.geo.source_ref,osm);
 assert.equal(mapped.geo.precision,precision);
 assert.equal(mapped.geo.approximate,true);
 assert.equal(mapped.geo.review_scope,precision==="address"?"ADDRESS_POINT_NOT_ENTRANCE":"PHYSICAL_CHURCH_NOT_ENTRANCE");
 assert.equal(mapped.map_publishable,true);
 assert.equal(mapped.map_state,"PROVISIONAL");
 assert.match(mapped.status,/MASS UNVERIFIED/);
 assert.equal(mapped.sections.length,0);
 assert.equal(mapped.actions.length,0);
 assert.ok(mapped.source_links.length>=2&&mapped.source_links.every(l=>l.url.startsWith("https://")));
}

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
assert.equal(vm.mapped,1863);
assert.equal(vm.addressOnly,719);
const html=renderExploreToString(vm);
assert.match(html,/2,582|2582/);
assert.match(html,/719/);
assert.match(html,/list only · no map pin/);
assert.doesNotMatch(html,/735 address only/);
assert.doesNotMatch(html,/2,579 mapped/);
console.log("PASS CL2 worldwide directory: 2,579 unique physical sites, 35 R49 aliases absorbed, 719 list-only plus 10 source-backed site/address markers, 3 separate published additions");
