import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSaintSourceIndexItems} from "../src/find/saints-source-index.js";
import {projectSaintCatalogueItems} from "../src/find/saints-catalogue.js";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const bridge=read("data/saints/read-only-calendar-art-index-20261015.v1.json");
const dataset={
  saintsOwnerIndex:bridge,
  saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
  saintsDoctors:read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json"),
  saintsVocations:read("data/saints/holiness-first-sixteen-cross-vocation-research.v1.json"),
  saintsCalendarBridge:read("data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
  geography:{places:read("data/geography/seed-registry.v1.json").places},
  shrines:{shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json").shrines}
};
const hist=projectSaintSourceIndexItems(dataset,"historical");
const newer=projectSaintSourceIndexItems(dataset,"later");
const doctorsIndex=projectSaintSourceIndexItems(dataset,"doctors");
const profiles=projectSaintCatalogueItems(dataset);
const sites=projectSaintPlaceItems(dataset);
assert.equal(bridge.archive_summary.dates,252);
assert.equal(bridge.archive_summary.components,311);
assert.equal(bridge.archive_summary.source_subjects,307);
assert.equal(hist.length,307,"311 archival components are not 311 distinct identities");
assert.equal(bridge.later_summary.named_individuals,258);
assert.equal(bridge.later_summary.group_records,13);
assert.equal(newer.length,271,"Keep 258 individual names and exactly 13 collective entries");
assert.equal(newer.filter(x=>x.index_metadata.scope==="COLLECTIVE_CANONIZATION").length,13);
assert.equal(bridge.doctors_roster.length,38);
assert.equal(doctorsIndex.length,38,"All 38 Doctor source rows appear once");
assert.equal(new Set(doctorsIndex.map(x=>x.item_id)).size,38);
assert.equal(doctorsIndex.filter(x=>x.index_metadata.declared_after_1962).length,8);
assert.equal(bridge.art_owner_hand_off.length,2);
assert(bridge.art_owner_hand_off.every(x=>!x.release_allowed&&x.user_score===5&&x.owner_status==="CANDIDATE_NOT_APPROVED"));
for(const view of [hist,newer,doctorsIndex]){
 assert.equal(new Set(view.map(x=>x.item_id)).size,view.length,"No duplicate source-row IDs");
 assert(view.every(x=>x.kind==="SAINT_SOURCE_INDEX_ENTRY"));
 assert(view.every(x=>!x.map_publishable&&x.geo===null&&x.artwork_id===null&&x.saints.length===0));
 assert(view.every(x=>x.editorial_status==="SOURCE_REFERENCE_WITHOUT_BIOGRAPHY"));
}
const martyr=newer.find(x=>x.item_id==="saints:group:martyrs-otranto-1480");
assert(martyr);
assert.equal(martyr.index_metadata.members,null);
assert.equal(martyr.index_metadata.estimated_members,800);
assert(martyr.summary.includes("Approximately"));
assert(!martyr.saints.length,"Martyr group is not one invented individual life");
assert(newer.find(x=>x.item_id==="saints:modern:saint.carlo-acutis")?.subtitle.includes("2025-09-07"));
assert.equal(profiles.length,30,"The earlier complete 30 biographies stay distinct from source index rows");
const exactHist=hist.filter(x=>x.index_metadata.related_profile_item_id);
const exactLater=newer.filter(x=>x.index_metadata.related_profile_item_id);
const exactDoctors=doctorsIndex.filter(x=>x.index_metadata.related_profile_item_id);
assert.equal(exactHist.length,13,"Historical matches use exact archival owner ID only");
assert.equal(exactLater.length,6,"Later canonization matches are exact official IDs only");
assert.equal(exactDoctors.length,8,"Doctor roster links to exactly eight existing draft biographies");
const linkedProfiles=profiles.filter(x=>x.source_index_links.length);
assert.equal(linkedProfiles.length,22,"22 person records have exact owner matches; aliases remain held");
assert.equal(profiles.reduce((sum,x)=>sum+x.source_index_links.length,0),27);
assert(profiles.every(x=>x.source_index_links.every(link=>link.identity_policy==="EXACT_SOURCE_ID_ONLY")));
const gregory=profiles.find(x=>x.saint_id==="saint:gregory-great");
assert.deepEqual(gregory.source_index_links.map(x=>x.scope),["doctors"],
 "Gregory the Great historical ID differs; do not link based on name resemblance");
assert(!profiles.find(x=>x.saint_id==="saint:therese-of-lisieux").source_index_links.length,
 "The explicit Thérèse Calendar alias has not been certified as archive/Doctor direct ID");
assert.equal(sites.length,9);
assert.equal(sites.filter(x=>x.map_publishable).length,8,"No new map pins may be manufactured");
assert.equal(projectSaintSourceIndexItems({...dataset,saintsOwnerIndex:null},"historical").length,0,
 "Missing source snapshot fails closed");
assert.equal(projectSaintSourceIndexItems(dataset,"unknown").length,0);
for(const language of ["en","fr"]){
 for(const [scope,items,subject] of [
  ["historical",hist,hist.find(x=>x.item_id==="saints:historic:saint.telesphorus")],
  ["later",newer,martyr],
  ["doctors",doctorsIndex,doctorsIndex.find(x=>x.item_id==="saints:doctor:saint.thomas-aquinas")]
 ]){
  assert(subject,"Expected source index subject missing");
  const vm=buildExploreViewModel({language,lens:"saints",view:"list",items,
    selectedId:subject.item_id,filters:{query:"",saintScope:scope},
    saintsRelease:{channel:"RESEARCH_PREVIEW",researchEnabled:true}});
  const html=renderExploreToString(vm);
  assert(html.includes('data-find-filter="saintScope"'),"Browse tabs not visible");
  assert(html.includes('aoSaintSourceIndexSheet'),"Selecting a reference must show a reference sheet");
  assert(html.includes('data-saint-source-id="'+subject.index_metadata.source_id+'"'),"Canonical source ID must survive the selected source sheet");
  assert(!html.includes("aoSaintLifeEvents"),"Do not invent historical birth and death");
  assert(!html.includes('data-calendar-mass'),"Do not invent a Mass");
  assert(html.includes(scope==="historical"?(language==="fr"?"307</strong><span>sujets des archives":"307</strong><span>archived source subjects")
    :scope==="later"?(language==="fr"?"271</strong><span>références des canonisations":"271</strong><span>later canonization records")
    :(language==="fr"?"38</strong><span>références des Docteurs":"38</strong><span>Doctor source records")));
  if(scope==="later")assert(html.includes("www.causesanti.va"),"Link back to official owner source");
  if(scope==="doctors"){
    assert(html.includes('data-saint-crosslink-target="saints:person:saint:thomas-aquinas"'));
    assert(html.includes(language==="fr"?"Docteur":"Doctor"));
  }
 }
}
console.log("PASS source-only historical 307 and post-1960 258+13 groups, bilingual reference sheets, 38 Doctors, 0 extra pins or artworks");
