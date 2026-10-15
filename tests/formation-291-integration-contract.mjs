import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>JSON.parse(readFileSync(path,"utf8"));
const dir="data/learn/";
const names=[
 "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch3-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch6-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch7-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"
];
const apol=read(dir+"apologetics-canonical.v1.json").dossiers;
const crisis=read(dir+"church-crisis-canonical.v1.json").dossiers;
const expected=new Map([...apol,...crisis].map(x=>[x.id,x]));
assert.equal(expected.size,141,"canonical APOL+CR ownership");
assert.equal(apol.length,60);
assert.equal(crisis.length,81);

const syntheses=new Map();
let passages=0,linkedSources=0;
for(const name of names){
 const pack=read(dir+name);
 assert.equal(pack.publication_allowed,false,name+" must remain unpublished");
 const sourceIds=new Set((pack.source_registry||[]).map(x=>x.id));
 assert.equal(sourceIds.size,pack.source_registry.length,name+" source IDs must be unique locally");
 for(const source of pack.source_registry){
  assert.match(source.url,/^https:\/\/[^\s]+$/,name+" source "+source.id+" URL");
 }
 for(const dossier of pack.dossiers){
  assert.ok(expected.has(dossier.id),dossier.id+" must belong to canonical inventory");
  assert.ok(!syntheses.has(dossier.id),"duplicate dossier "+dossier.id);
  syntheses.set(dossier.id,dossier);
  assert.equal(dossier.publication_allowed,false,dossier.id+" must remain unpublished");
  assert.equal(dossier.sections.length,4,dossier.id+" substantive role count");
  assert.equal(dossier.sections[0].role,"answer",dossier.id);
  assert.ok(["documented_position","documented_objection"].includes(dossier.sections[1].role),dossier.id);
  assert.equal(dossier.sections[2].role,"critical_response",dossier.id);
  assert.equal(dossier.sections[3].role,"traditional_catholic_argument",dossier.id);
  for(const section of dossier.sections){
   assert.ok(section.text?.en?.trim(),dossier.id+" EN "+section.role);
   assert.ok(section.text?.fr?.trim(),dossier.id+" FR "+section.role);
   assert.ok(section.source_ids?.length,dossier.id+" source IDs "+section.role);
   for(const id of section.source_ids){
    assert.ok(sourceIds.has(id),dossier.id+" unresolved "+id+" in "+name);
    linkedSources++;
   }
   assert.equal(section.original_context_approved,false,dossier.id+" unsupported source approval");
   assert.equal(section.french_final_approved,false,dossier.id+" unsupported FR approval");
   passages++;
  }
 }
}
assert.equal(syntheses.size,141,"all canonical APOL+CR drafts recovered");
assert.deepEqual([...syntheses.keys()].sort(),[...expected.keys()].sort(),"exact owners");

const ethicsFiles=[
 "src/learn/sexual-ethics-data/questions-001-050.js",
 "src/learn/sexual-ethics-data/questions-051-100.js",
 "src/learn/sexual-ethics-data/questions-101-150.js"
];
const ethicIds=[];
for(const file of ethicsFiles){
 const content=readFileSync(file,"utf8");
 ethicIds.push(...[...content.matchAll(/\{id:"(CSE\d{3})",q:\[/g)].map(x=>x[1]));
}
assert.equal(ethicIds.length,150,"all live Sexual Ethics questions");
assert.equal(new Set(ethicIds).size,150,"no duplicated CSE owners");
assert.deepEqual(ethicIds.slice().sort(),Array.from({length:150},(_,i)=>"CSE"+String(i+1).padStart(3,"0")).sort());

const content=read("data/app/content-items-formation.v1.json").items
 .filter(x=>/^(APOL-|CR-)/.test(x.id));
assert.equal(content.length,141,"141 canonical formation content items");
assert.deepEqual(content.map(x=>x.id).sort(),[...expected.keys()].sort());
assert.ok(content.every(x=>x.publication_state==="FROZEN_NOT_PUBLISHED"),"do not publish uncertified formation");

const integrated=read(dir+"formation-overlay-integration-reconciliation-20261015.v1.json");
assert.equal(integrated.summary.owners,30);
assert.equal(integrated.summary.unresolved_local_source_ids,0);
assert.ok(integrated.owners.every(x=>x.material_present===true));
assert.ok(integrated.owners.every(x=>x.full_editorial_certification===false));
assert.ok(integrated.owners.every(x=>x.published_in_live_app!==true));
const integratedIds=new Set(integrated.owners.map(x=>x.id));
assert.equal(integratedIds.size,30,"one integration owner per canonical ID");

const apol002=syntheses.get("APOL-002");
assert.match(apol002.sections[0].text.en,/faith and reason/i);
assert.match(apol002.sections[0].text.en,/Dei Filius/);
assert.doesNotMatch(apol002.sections[0].text.en,/polygenism/i,"old evolution answer must not replace faith and reason");
const evolution=read(dir+"formation-apol002-evolution-research-preserved-20261014.v1.json");
assert.equal(evolution.former_owner,"APOL-002");
assert.equal(evolution.original_dossier.sections.length,4,"original evolution material remains preserved");
assert.match(syntheses.get("CR-DOC-09").sections[0].text.en,/non-definitive/i);
assert.match(syntheses.get("CR-GOV-01").sections[0].text.en,/postconciliar/i);
assert.match(syntheses.get("CR-ECC-09").sections[0].text.en,/conclavism/i);
assert.match(syntheses.get("CR-LIT-07").sections[0].text.en,/Offertory/i);
assert.match(syntheses.get("CR-ECC-12").sections[0].text.en,/ordinary Magisterium/);
assert.match(syntheses.get("CR-ECC-12").sections[0].text.en,/not.*strictly normative/i);

console.log(JSON.stringify({
 status:"PASS_RESEARCH_INTEGRATION_CONTRACT",
 canonical_total:141+150,
 research_dossiers:syntheses.size,
 bilingual_sections:passages,
 source_links_resolved:linkedSources,
 ethics_questions:ethicIds.length,
 incorporated_overlay_owners:integratedIds.size,
 published_formation_dossiers:0,
 doctrinal_certification_claims:0
},null,2));
