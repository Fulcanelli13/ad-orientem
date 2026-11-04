#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const root="data/geography/research/";
const read=(x)=>JSON.parse(readFileSync(root+x,"utf8"));
const c=read("sacred-atlas-round16-ten-visual-cover-candidates-20261104.v1.json");
const visual=read("sacred-atlas-round16-20-place-visual-screen-20261104.v1.json");
const six=read("sacred-atlas-round16-six-fresh-leads-visual-context-20261104.v1.json");
const audit=read("sacred-atlas-round14-85-full-source-metadata-20261104.v1.json");
const h=readFileSync(root+"sacred-atlas-undecided66-bulk-photo-review-20261104.html","utf8");
const m=h.match(/const places=(.*?); const auditStatuses=/s);
assert.ok(m);
const places=JSON.parse(m[1]);
assert.equal(places.length,66);
assert.equal(c.rows.length,10);
assert.equal(c.counts.places,10);
assert.equal(c.counts.metadata_eligible,9);
assert.equal(c.counts.requires_initial_metadata,1);
assert.equal(c.counts.user_approved,0);
assert.equal(c.counts.original_bytes_verified,0);
assert.equal(c.counts.published,0);
assert.equal(new Set(c.rows.map(r=>r.place_id)).size,10);
assert.equal(new Set(c.rows.map(r=>r.source_title)).size,10);
const auditKeys=new Set(audit.results.filter(r=>r.status==="METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL").map(r=>r.place_id+"|"+r.source_title));
for(const r of c.rows){
 assert.equal(r.publication_authorized,false);
 assert.equal(r.user_approved,false);
 assert.equal(r.source_original_bytes_verified,false);
 assert.equal(r.full_resolution_visual_review,false);
 assert.equal(r.editorial_status,"CANDIDATE_FOR_USER_PRIMARY_COVER_REVIEW");
 const source=places.find(p=>p.id===r.place_id);
 assert.ok(source, "Place absent from 66");
 assert.equal(source.top10Candidate,r.source_title);
 assert.equal(source.top10Priority,r.queue_priority);
 assert.equal(source.candidates.filter(x=>x.top10Candidate).length,1);
 assert.ok(source.candidates.some(x=>x.title===r.source_title));
 if(r.metadata_status==="METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL"){
   assert.ok(auditKeys.has(r.place_id+"|"+r.source_title));
   assert.match(r.expected_source_sha1,/^[a-f0-9]{40}$/);
   assert.ok(r.original_dimensions[0]>=1024&&r.original_dimensions[1]>=768);
 }else{
   assert.equal(r.place_id,"place:LB:monastery-saint-maron-annaya");
   assert.equal(r.expected_source_sha1,null);
   assert.equal(r.metadata_status,"NOT_YET_IN_BULK_COMMONS_AUDIT");
 }
}
const grotto=c.rows.find(x=>x.place_id==="place:US:lourdes-grotto-emmitsburg");
assert.equal(grotto?.source_title,"File:National Shrine Grotto of Our Lady of Lourdes 99.JPG");
const haemi=places.find(x=>x.id==="place:KR:haemi-martyrs-shrine-main-church");
assert.ok(!haemi.top10Candidate);
assert.ok(haemi.candidates.find(x=>x.title.includes("Holy Ground 02"))?.visualDecision.startsWith("EXCLUDE_"));
const tonga=places.find(x=>x.id==="place:TO:st-anthony-padua-basilica-nukualofa");
assert.ok(!tonga.top10Candidate);
assert.equal(visual.place_counts.first_look_places,20);
assert.equal(six.reviewed_places,6);
assert.equal(places.filter(x=>x.visualStatus).length,26);
assert.equal(places.filter(x=>x.previewInspected).length,18);
assert.equal(places.filter(x=>x.top10Candidate).length,10);
assert.ok(h.includes('if(filter==="top10"&&!p.top10Candidate)return false;'));
assert.ok(h.includes("function coverBlocked(p,f)"));
assert.ok(h.includes("CANDIDATE_FOR_USER_PRIMARY_COVER_REVIEW")===false);
const scripts=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
new Script(scripts[0][1]);
console.log(JSON.stringify({status:"PASS",places:66,visual_screened:26,visually_inspected:18,top10:10,metadata_eligible:9,publication_approved:0}));
