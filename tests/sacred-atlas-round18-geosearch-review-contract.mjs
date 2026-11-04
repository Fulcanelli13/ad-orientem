#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const root="data/geography/research/";
const load=p=>JSON.parse(readFileSync(root+p,"utf8"));
const triage=load("sacred-atlas-round17-all35-source-triage-20261104.v1.json");
const registry=load("../seed-registry.v1.json");
const cover=load("sacred-atlas-round17-ten-bilingual-cover-staging-20261104.v1.json");
const falsePos=load("sacred-atlas-round18-cross-site-false-positive-screen-20261104.v1.json");
const approvals=readFileSync(root+"sacred-atlas-round18-ten-original-photo-decision-review-20261104.html","utf8");
const match=approvals.match(/const records=(.*?);const decisions=/s);
assert.ok(match,"Approval worksheet has no canonical source data");
const records=JSON.parse(match[1]);
assert.equal(records.length,10);
assert.equal(new Set(records.map(r=>r.id)).size,10);
assert.equal(new Set(records.map(r=>r.sha1)).size,10);
assert.equal(cover.rows.length,10);
assert.ok(records.every(r=>r.sha1&&r.license_url.startsWith("https://creativecommons.org/")));
assert.ok(records.every(r=>r.source_url.startsWith("https://commons.wikimedia.org/wiki/File:")));
for(const r of records){const c=cover.rows.find(x=>x.place_id===r.id);assert.ok(c);assert.equal(r.file,c.source_title);assert.equal(r.sha1,c.source_sha1)}
assert.equal(triage.rows.filter(r=>r.source_candidates.length===0).length,30);
assert.equal(registry.places.length,530);
for(const row of triage.rows.filter(r=>r.source_candidates.length===0)){
  const p=registry.places.find(p=>p.place_id===row.place_id);
  assert.ok(p,"Unresolved canonical Place ID missing");
  assert.equal(typeof p.geo?.lat,"number");
  assert.equal(typeof p.geo?.lng,"number");
}
assert.equal(falsePos.rows.length,11);
assert.equal(falsePos.place_ids,9);
assert.ok(falsePos.rows.some(r=>r.place_id==="place:BB:st-patrick-catholic-cathedral-bridgetown"&&r.screen==="EXCLUDE_WRONG_COUNTRY"));
assert.ok(approvals.includes("APPROVE_THIS_FILE_AS_PRIMARY_COVER"));
assert.ok(approvals.includes("HOLD_FOR_REVIEW"));
assert.ok(approvals.includes('const decisions=Object.create(null)'));
assert.ok(approvals.includes("created_at:new Date().toISOString()"));
assert.ok(approvals.includes("Nothing is published by this page."));
const inline=[...approvals.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(inline.length,1);
new Script(inline[0][1],{filename:"sacred-atlas-ten-approval-review.js"});
const approved=load("../approved-place-media.v1.json");
assert.equal(approved.items.length,379);
console.log(JSON.stringify({status:"PASS",remaining_geo_sites:30,verified_images_for_review:10,locked_approved_coverage:379,source_false_positive_checks:11,decision_choices_inferred:0}));
