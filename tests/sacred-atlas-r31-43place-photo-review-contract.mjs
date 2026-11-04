import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const q=read("data/geography/research/sacred-atlas-r31-undecided43-bulk-image-review-20261105.v1.json");
const p=read("data/geography/research/sacred-atlas-r26-43remaining-source-lead-triage-20261104.v1.json");
const old19=read("data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const html=readFileSync("data/geography/research/sacred-atlas-r31-undecided43-photo-review-20261105.html","utf8");
assert.equal(q.schema,"AO_SACRED_ATLAS_R31_UNDECIDED43_BULK_PHOTO_VISUAL_REVIEW_V1");
assert.equal(q.publication,"RESEARCH_ONLY_USER_EDITORIAL_SELECTION_NEEDED");
assert.equal(q.source_blob_sha,"71c3ab1ca04be5b65550741e5867a622ab31de36");
assert.equal(q.places.length,43);
assert.equal(p.rows.length,43);
assert.equal(covers.items.length,379);
assert.equal(new Set(q.places.map(x=>x.place_id)).size,43);
assert.deepEqual(q.places.map(x=>x.place_id).sort(),p.rows.map(x=>x.place_id).sort());
const approved19=new Set(old19.decisions.map(x=>x.place_id));
assert.ok(q.places.every(x=>!approved19.has(x.place_id)),"Never re-review any owner-approved source");
const gate=new Set(["COVER_REVIEW_CANDIDATE"]);
let images=0,eligible=0,context=0,candidates=0,contextOnly=0,unpictured=0,newSources=0;
const oldById=new Map(p.rows.map(x=>[x.place_id,x]));
const candidatePlaceCounts={
"place:PH:national-shrine-of-our-lady-of-guadalupe-makati":5,
"place:SK:kaplnka-zjavenia-litmanova-zvir":3,
"place:MY:st-anne-bukit-mertajam":3,
"place:MG:ilot-de-la-vierge-ampefy":3,
"place:PE:santuario-candelaria-chapi-polobaya":1,
"place:LK:national-basilica-of-our-lady-of-lanka-tewatta":1,
"place:PK:karachi-our-lady-fatima-parish":1
};
for(const row of q.places){
 const previous=oldById.get(row.place_id);
 assert.ok(previous);
 assert.equal(row.place_name,previous.place_name);
 assert.equal(row.cohort,previous.work_group);
 assert.equal(row.no_owner_choice_in_original_R26,true);
 assert.equal(row.owner_selection,null);
 assert.equal(row.original_bytes_verified,false);
 assert.equal(row.publication_authorized,false);
 assert.equal(row.review_candidates,candidatePlaceCounts[row.place_id]||0);
 assert.equal(new Set(row.photo_sources.map(x=>x.title)).size,row.photo_sources.length);
 if(row.review_candidates)candidates++;
 else if(row.context_holds)contextOnly++;
 else unpictured++;
 for(const item of row.photo_sources){
  images++;
  const match=previous.candidate_file_title_leads.some(x=>x.title===item.title);
  const indexed=previous.existing_category_index_leads.some(x=>x.title===item.title);
  const tooSmall=previous.prior_exact_source_metadata_claims.some(x=>x.title===item.title);
  if(!match&&!indexed&&!tooSmall)newSources++;
  assert.ok(item.title.startsWith("File:"));
  assert.ok(item.source_page.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.ok(item.publication_authorized===false);
  assert.ok(item.source_sha1_byte_verified===false);
  if(item.source_sha1_claim!==null)assert.match(item.source_sha1_claim,/^[0-9a-f]{40}$/);
  if(gate.has(item.role))eligible++;else context++;
  if(item.title.toLowerCase().endsWith(".tif")){
   assert.ok(!gate.has(item.role),"Litchfield TIFF source is a context/technical hold");
  }
  if(row.place_id==="place:EG:zeitoun-coptic-saint-mary")
   assert.ok(!gate.has(item.role),"566x390 source cannot be full-size cover");
  if(row.place_id==="place:AR:santuario-san-cayetano-liniers")
   assert.ok(!gate.has(item.role),"Archival 609x960 original cannot be a contemporary hero");
  if(row.place_id==="place:LK:saint-anne-s-national-shrine-talawila")
   assert.ok(!gate.has(item.role),"Statue is not exact canonical church building");
 }
}
assert.equal(images,35);
assert.equal(eligible,17);
assert.equal(context,18);
assert.equal(candidates,7);
assert.equal(contextOnly,9);
assert.equal(unpictured,27);
assert.equal(newSources,18);
assert.equal(q.counts.review_candidates,17);
assert.equal(q.counts.context_technical_holds,18);
assert.equal(q.counts.sites_without_any_photo,27);
assert.equal(q.counts.negative_evidence_specific_sites,4);
assert.equal(q.counts.r32_new_file_description_leads,10);
assert.equal(q.counts.r32_additional_cover_review_candidates,2);
assert.equal(q.counts.r32_context_only_sources,8);
for(const id of ["place:JP:our-lady-akita-convent","place:SV:capilla-divina-providencia-san-salvador","place:PA:basilica-menor-jesus-nazareno-atalaya","place:SL:sacred-heart-cathedral-freetown"]){
 const site=q.places.find(x=>x.place_id===id);
 assert.ok(site&&site.photo_sources.length>0);
 assert.ok(site.photo_sources.every(x=>x.role!=="COVER_REVIEW_CANDIDATE"),"Context or copyright-unverified photo must never be approved");
}

for(const id of ["place:SL:sacred-heart-cathedral-freetown","place:AS:holy-family-cathedral-tafuna","place:BZ:belmopan-our-lady-guadalupe-co-cathedral","place:BB:st-patrick-catholic-cathedral-bridgetown"]){
 assert.ok(q.places.find(x=>x.place_id===id)?.negative_source_evidence?.length>60);
}
const m=html.match(/<script type="application\/json" id="review-data">([\s\S]*?)<\/script>/);
assert.ok(m);
const embedded=JSON.parse(m[1]);
assert.equal(embedded.schema,q.schema);
assert.equal(embedded.places.length,43);
assert.deepEqual(embedded.places,q.places,"HTML must embed exactly source-locked R31 review records");
const client=html.match(/<script>([\s\S]*?)<\/script><\/body><\/html>/)?.[1];
assert.ok(client);
new vm.Script(client,{filename:"R31-43-Place-Photo-Review.js"});
assert.ok(html.includes("17 cover candidates"));
assert.ok(html.includes('id="gallery"'));
assert.ok(html.includes('id="export"')&&html.includes('id="import"'));
assert.ok(client.includes('const eligible=x=>x.role==="COVER_REVIEW_CANDIDATE"'));
assert.ok(client.includes('kind==="prefer"&&im&&eligible(im)'));
assert.ok(client.includes('kind==="reject"&&im&&eligible(im)'));
assert.ok(client.includes('AO_SACRED_ATLAS_R31_UNDECIDED43_USER_EDITORIAL_EXPORT_V1'));
assert.ok(client.includes("original_byte_verified:false,editorial_approved:true,publication_authorized:false"));
assert.ok(client.includes("mobile_crop_approved:false"));
assert.ok(client.includes("IntersectionObserver"));
assert.ok(client.includes("2200-(Date.now()-lastStart)"));
assert.ok(client.includes("if(failures>=3){paused=true"));
assert.ok(!client.includes("XMLHttpRequest")&&!client.includes("fetch("));
assert.ok(!html.includes('"publication_authorized":true'));
console.log("R31+R32 PASS: 43 Places, 17 provisional photo SUBJ leads, 18 context/technical holds, 27 unsourced, zero source-byte approvals, existing UI export format preserved.");
