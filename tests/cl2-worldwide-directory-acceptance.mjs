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
assert.equal(world.filter(x=>x.map_publishable).length,1847);
const newSites=world.filter(x=>x.physical_site_source==="CL2_MASTER"&&!x.map_publishable);
assert.equal(newSites.length,735);
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
assert.equal(vm.mapped,1847);
assert.equal(vm.addressOnly,735);
const html=renderExploreToString(vm);
assert.match(html,/2,582|2582/);
assert.match(html,/735/);
assert.match(html,/list only · no map pin/);
assert.doesNotMatch(html,/735 address only/);
assert.doesNotMatch(html,/2,579 mapped/);
console.log("PASS CL2 worldwide directory: 2,579 unique physical sites, 35 R49 aliases absorbed, 735 additional searchable list-only sites, 3 separate published additions");
