#!/usr/bin/env node
// Research-only regression for the frozen Sacred Atlas 66-place visual review.
// No network required. Never promotes photos into an approved registry.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const root='data/geography/research/';
const load=(name)=>JSON.parse(readFileSync(root+name,'utf8'));
const queue=load('sacred-atlas-undecided66-editorial-review-20261104.v1.json');
const audit=load('sacred-atlas-round14-85-full-source-metadata-20261104.v1.json');
const shortlist=load('sacred-atlas-round15-first-look-photo-shortlist-20261104.v1.json');
const newLeads=load('sacred-atlas-round14-six-new-place-source-leads-20261104.v1.json');
const page=readFileSync(root+'sacred-atlas-undecided66-bulk-photo-review-20261104.html','utf8');

assert.equal(queue.rows.length,66);
assert.equal(new Set(queue.rows.map(r=>r.place_id)).size,66);
assert.equal(audit.results.length,85);
assert.equal(audit.source_places,24);
assert.equal(audit.results.filter(r=>r.status==='METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL').length,71);
assert.equal(audit.results.filter(r=>r.status.startsWith('HOLD_')).length,14);
assert.equal(shortlist.rows.length,24);
assert.equal(newLeads.research_decisions.length,8);
const match=page.match(/const places=(.*?); const auditStatuses=/s);
assert.ok(match,'inline review queue missing');
const places=JSON.parse(match[1]);
assert.equal(places.length,66);
const idset=new Set(queue.rows.map(r=>r.place_id));
assert.ok(places.every(p=>idset.has(p.id)));
const chosen=new Set();
let n=0,audited=0,held=0,firstLook=0;
const status=new Map(audit.results.map(x=>[x.place_id+'|'+x.source_title,x.status]));
for(const p of places){
  assert.equal(p.id,queue.rows.find(r=>r.place_id===p.id)?.place_id);
  if(p.firstLook)firstLook++;
  for(const c of p.candidates){
    n++;
    const key=p.id+'|'+c.title;
    assert.ok(!chosen.has(key),'duplicate candidate '+key);
    chosen.add(key);
    if(status.has(key)){
      audited++;
      assert.ok(c.audit,'missing full source metadata '+key);
      assert.equal(c.audit.status,status.get(key));
      assert.match(c.audit.sha1,/^[0-9a-f]{40}$/);
      if(c.audit.status.startsWith('HOLD_'))held++;
    }else{
      if(!c.originalVerified)assert.equal(c.audit,null,'non-audited new source must not claim old audit');
      else assert.match(c.originalSHA1,/^[0-9a-f]{40}$/);
    }
  }
}
assert.ok(n>=93,'incremental source leads must retain first 93');
assert.equal(audited,85);
assert.equal(held,14);
assert.equal(firstLook,20);
assert.ok(page.includes('document.querySelector("#import").onchange'), 'review import missing');
assert.ok(page.includes("Prefer cover"), 'review UI lacks preference choice');
assert.ok(page.includes('publication approvals'), 'review page must disavow publication permissions');
const inline=[...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(inline.length,1,'unexpected inline script blocks');
new Script(inline[0],{filename:'bulk-review-inline.js'});
assert.equal(audit.published,0);
assert.equal(shortlist.rows.every(r=>r.publication_authorized===false),true);
assert.equal(newLeads.research_decisions.every(r=>r.publication_authorized===false),true);
console.log(JSON.stringify({status:'PASS',places:66,candidate_files:n,audited_files:85,metadata_eligible:71,held_files:14,first_look_places:20,unreviewed_new_leads:8}));
