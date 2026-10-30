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
assert.match(html,/address only/);
assert.doesNotMatch(html,/2,579 mapped/);
console.log("PASS CL2 worldwide directory: 2,579 unique physical sites, 35 R49 aliases absorbed, 735 additional searchable list-only sites, 3 separate published additions");
