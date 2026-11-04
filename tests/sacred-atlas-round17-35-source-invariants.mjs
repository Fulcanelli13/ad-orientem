#!/usr/bin/env node
// Round 17 research-only source queue and reviewer checks; no network.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const root="data/geography/research/";
const load=(f)=>JSON.parse(readFileSync(root+f,"utf8"));
const triage=load("sacred-atlas-round17-all35-source-triage-20261104.v1.json");
const queue=load("sacred-atlas-undecided66-editorial-review-20261104.v1.json");
const approved=load("../approved-place-media.v1.json");
const html=readFileSync(root+"sacred-atlas-undecided66-bulk-photo-review-20261104.html","utf8");
const m=html.match(/const places=(.*?); const auditStatuses=/s);
assert.ok(m,"Review data block missing");
const page=JSON.parse(m[1]);
assert.equal(page.length,66);
assert.equal(queue.rows.length,66);
assert.equal(triage.rows.length,35);
assert.equal(new Set(triage.rows.map(x=>x.place_id)).size,35);
assert.equal(approved.items.length,379);
assert.equal(triage.counts.total_new_file_leads,10);
assert.equal(triage.counts.exact_site_commons_collections,2);
assert.equal(triage.counts.places_with_file_leads,5);
assert.equal(triage.counts.remaining_without_file_lead,30);
assert.equal(triage.counts.site_or_identity_custodian_leads,7);
const all=new Set(queue.rows.map(x=>x.place_id));
const unreviewed=new Set(page.filter(p=>p.candidates.length&&p.candidates.every(x=>x.round17)).map(x=>x.id));
assert.equal(unreviewed.size,5);
for(const r of triage.rows){
  assert.ok(all.has(r.place_id));
  assert.equal(r.publication_authorized,false);
  const p=page.find(z=>z.id===r.place_id);
  assert.ok(p);
  assert.equal(p.round17TriageStatus,r.status);
  assert.equal(r.source_candidates.length,p.candidates.filter(x=>x.round17).length);
  for(const s of r.source_candidates){
    assert.equal(s.original_bytes_verified,false);
    assert.equal(s.metadata_verified,false);
    assert.equal(s.editorial_selected,false);
    assert.equal(s.publication_authorized,false);
    assert.ok(s.source_page.startsWith("https://commons.wikimedia.org/wiki/File:"));
    const candidate=p.candidates.find(x=>x.title===s.title);
    assert.ok(candidate);
    assert.equal(candidate.audit,null);
    if(s.source_evidence.includes("HOLD"))assert.ok(candidate.visualDecision?.startsWith("HOLD_")||candidate.visualDecision?.startsWith("SECONDARY_GALLERY_"));
  }
}
assert.ok(page.reduce((n,p)=>n+p.candidates.length,0)>=103,'preserve all Round 17 leads');
assert.ok(page.filter(x=>x.candidates.length).length>=35,'preserve all Round 17 sourced Places');
assert.ok(html.includes('if(filter==="round17"&&!p.candidates.some(c=>c.round17))return false;'));
assert.ok(html.includes("function coverBlocked(p,f)"));
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
new Script(scripts[0][1]);
console.log(JSON.stringify({status:"PASS",triaged:35,new_leads:10,total_source_leads:page.reduce((n,p)=>n+p.candidates.length,0),places_with_leads:page.filter(x=>x.candidates.length).length,published_covers:379}));
