import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const htmlPath="data/geography/research/sacred-atlas-r27-one-bulk-61-cover-editorial-mosaic-20261104.html";
const html=readFileSync(htmlPath,"utf8");
const source=read("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json");
const rec=read("data/geography/research/sacred-atlas-round26-existing21-cover-triage-20261104.v1.json");
const cross=read("data/geography/research/sacred-atlas-existing-first-151-photo-reconciliation-20261104.v1.json");
const match=html.match(/<script type="application\/json" id="review-data">([\s\S]*?)<\/script>/);
assert.ok(match,"R27 must embed all source files offline");
const embedded=JSON.parse(match[1]);
assert.equal(embedded.schema,"AO_SACRED_ATLAS_R27_ONE_BULK_PHOTO_EDITORIAL_MOSAIC_V1");
assert.equal(embedded.places.length,23);
assert.equal(embedded.production.published,379);
assert.equal(embedded.production.total,530);
assert.equal(embedded.editorial_source.selections_approved,0);
const old=new Map(source.places.map(p=>[p.place_id,p]));
const r26=new Map(rec.rows.map(p=>[p.place_id,p]));
const existing=new Map(cross.rows.map(p=>[p.place_id,p]));
assert.equal(new Set(embedded.places.map(p=>p.place_id)).size,23);
let eligible=0,context=0,firstLooks=0,single=0,multi=0,excluded=0;
for(const place of embedded.places){
 const prior=old.get(place.place_id),editor=r26.get(place.place_id);
 assert.ok(prior&&editor&&existing.has(place.place_id));
 assert.equal(place.approval_from_source_metadata,false);
 assert.equal(place.user_cover_choice_made,false);
 assert.equal(place.review_group,editor.eligibility);
 assert.equal(place.review_recommendation,editor.first_look_source_title);
 assert.equal(place.images.length,prior.images.length);
 if(editor.candidate_count===1)single++;
 else if(editor.candidate_count>1)multi++;
 else excluded++;
 let count=0,first=0;
 for(let i=0;i<place.images.length;i++){
  const a=place.images[i],b=prior.images[i];
  assert.equal(a.file,b.file);
  assert.equal(a.url,b.url);
  assert.equal(a.sha1,b.sha1);
  assert.equal(a.bytes,b.bytes);
  assert.equal(a.author,b.author);
  assert.equal(a.license,b.license);
  assert.equal(a.role,b.role);
  assert.equal(a.byte_verified,true);
  assert.equal(a.first_look,a.file===editor.first_look_source_title);
  if(a.role==="COVER_CANDIDATE"){count++;eligible++;}else context++;
  if(a.first_look){first++;firstLooks++;}
 }
 assert.equal(count,editor.candidate_count);
 assert.ok(first<=1);
}
assert.equal(eligible,61);
assert.equal(context,3);
assert.equal(firstLooks,19);
assert.equal(single,13);
assert.equal(multi,8);
assert.equal(excluded,2);
for(const id of ["place:NZ:pukekaraka-otaki","place:CL:sanctuary-of-our-lady-of-la-tirana-chile"]){
 const p=embedded.places.find(x=>x.place_id===id);
 assert.ok(p);
 assert.ok(p.images.every(x=>x.role!=="COVER_CANDIDATE"));
 assert.ok(!p.images.some(x=>x.first_look));
}
const client=html.match(/<script>([\s\S]*?)<\/script><\/body><\/html>/)?.[1];
assert.ok(client,"inline interactive JS must remain self-contained");
new vm.Script(client,{filename:"R27-photo-review.js"});
assert.ok(html.includes("id=\"singles\"")&&html.includes("id=\"compare\"")&&html.includes("id=\"context\""));
assert.ok(html.includes("id=\"import\"")&&html.includes("id=\"export\""));
assert.ok(client.includes("AO_SACRED_ATLAS_UNDECIDED66_USER_EDITORIAL_REVIEW_EXPORT_V1"),"Import/export compatible with existing reviewer");
assert.ok(client.includes("PREFER_AS_COVER_SUBJECT_TO_VERIFICATION"),"User selection is a proposal, not publication approval");
assert.ok(client.includes("const allowed=c=>c.role===\"COVER_CANDIDATE\""),"Non-cover roles must remain disabled");
assert.ok(client.includes('document.getElementById("previews").onclick=()=>{'));
assert.ok(!client.includes('document.querySelectorAll("details.place").forEach(d=>{d.open=true;'),"Do not batch-load Commons previews");
assert.ok(!client.includes("fetch(")&&!client.includes("XMLHttpRequest"),"No API calls or remote background scraping");
assert.ok(!html.includes('publication_authorized":true')&&!html.includes('selections_approved":1'));
console.log("R27 PASS: offline 23-Place/64-photo mosaic, 61 cover candidates, 19 source first-looks, 2 context-only excludes; no auto-downloading, zero approvals.");
