// Every source-owned TLM church must remain browseable before geocoding.
// This protects published cards, preview/detail routes and bilingual fallbacks
// for the 175 currently list-only CL2 physical identities (158 additional locality markers are illustrative only).
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49}
  from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
  from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
import {renderTlmMapResultRail} from "../src/find/tlm-map-result-rail.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const r49=projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json"));
const published=projectPublishedProvisionalMassSites(r49,
  read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const world=projectCL2PhysicalDirectory(published,index);
assert.equal(world.length,2582);
const unpinned=world.filter(item=>item.kind==="TLM_VENUE"&&!item.map_publishable);
assert.equal(unpinned.length,175,"The list-only count must be reviewed when site positions change");
assert.equal(filterPreliminaryR49(world,{siteEvidence:"ADDRESS_ONLY"}).length,175,
  "The public filter must reach every unpinned church without new map geometry");
const ids=new Set();
for(const church of unpinned){
  assert.ok(church.item_id&&church.source_id&&church.title&&church.address?.formatted,
    "Each list-only church must retain an exact title, source identity and source location");
  assert.ok(!ids.has(church.item_id),"No duplicate church card identity");
  ids.add(church.item_id);
  assert.equal(church.geo,null,"No coordinates may be fabricated to populate MapLibre");
  assert.equal(church.map_state,"ADDRESS_ONLY");
  assert.ok(church.summary_fr?.includes("répertorié"),"French preview must not fall back to English");
  for(const lang of ["en","fr"]){
    const card=renderDirectoryVenueCard(church,lang);
    assert.ok(card.includes('data-explore-item="'+church.item_id+'"'));
    assert.ok(card.includes("aoTlmVenueVisual")&&card.includes("aoTlmVenueTitle"));
    assert.ok(card.includes("aoTlmVenueSchedule"));
    if(lang==="fr"){
      assert.ok(card.includes("RÉPERTORIÉ · MESSE NON VÉRIFIÉE"));
      assert.ok(!card.includes("RESEARCH-LISTED"));
    }
    const profile=renderTlmChurchProfile(church,lang);
    assert.ok(profile.includes('data-tlm-church-profile="'+church.source_id+'"'));
    assert.ok(profile.includes("aoTlmProfileEssentials")&&profile.includes("aoTlmProfileSourceSection"));
    assert.ok(profile.includes("aoTlmProfileAddress"));
    assert.ok(profile.includes("aoTlmProfileMedia"));
    if(church.source_links.some(s=>s.url?.startsWith("https://")))
      assert.ok(profile.includes("aoTlmProfileSources"),"Keep original reference available");
    assert.doesNotMatch(profile,/data-tlm-celebration-evidence=|Directions on Google Maps/,
      "An unpinned research listing must not acquire an unsupported Mass witness or route");
  }
}

const initialMap=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"tlm",view:"map",items:world,filters:{directoryGroup:"ALL",affiliations:[],query:""}
}));
assert.ok(initialMap.includes("data-tlm-map-open-unmapped"));
assert.ok(initialMap.includes("Browse 175 unpinned church profiles"));
const frenchRail=renderTlmMapResultRail({language:"fr",items:[],addressOnlyCount:175});
assert.ok(frenchRail.includes("data-tlm-map-open-unmapped"));
assert.ok(frenchRail.includes("175 fiches d’églises sans repère"));
assert.doesNotMatch(renderTlmMapResultRail({items:[],addressOnlyCount:0}),/data-tlm-map-open-unmapped/);
const list=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"tlm",view:"list",items:unpinned,
  filters:{siteEvidence:"ADDRESS_ONLY"},displayLimit:24,
  selectedId:unpinned[0].item_id,expandDetail:true,
}));
assert.ok(list.includes('data-explore-item="'+unpinned[0].item_id+'"'));
assert.ok(list.includes('data-tlm-church-profile="'+unpinned[0].source_id+'"'));
assert.ok(list.includes("175"));
const frenchPreview=renderExploreToString(buildExploreViewModel({
  language:"fr",lens:"tlm",view:"list",items:unpinned,
  filters:{siteEvidence:"ADDRESS_ONLY"},selectedId:unpinned[0].item_id,
}));
assert.ok(frenchPreview.includes("Lieu physique répertorié"),
  "The French church preview must use its translated source-safety description");
console.log("PASS TLM unpinned cards: 175/175 bilingual church cards and profiles remain accessible independently of map pins");
