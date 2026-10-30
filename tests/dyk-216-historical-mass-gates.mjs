import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const DIR='data/research/did-you-know';
const get=n=>JSON.parse(fs.readFileSync(path.join(DIR,n),'utf8'));
const newFiles=[
 'dyk-customs-weiser-folio-expansion-04a.v1.json',
 'dyk-customs-weiser-folio-expansion-04b.v1.json',
 'dyk-customs-pitre-new-feasts-04c.v1.json',
 'dyk-mass-canon-discoveries-04d.v1.json'
];
const oldFiles=[
 'dyk-ultramaster-batch01.v1.json',
 'dyk-ultramaster-batch02a-weiser.v1.json',
 'dyk-ultramaster-batch02b-pitre.v1.json',
 'dyk-ultramaster-batch03-wider-corpus.v1.json',
 'dyk-source-first-batch01.v1.json'
];
const newer=newFiles.flatMap(n=>get(n).facts);
const old=oldFiles.flatMap(n=>get(n).facts);
assert.equal(old.length,145);
assert.deepEqual(newFiles.map(n=>get(n).facts.length),[63,80,42,31]);
assert.equal(newer.length,216);
const ids=newer.map(f=>f.id);
assert.equal(new Set(ids).size,ids.length);
const observationIds=new Set(old.flatMap(f=>f.original_source?.observation_ids??f.source?.original_observation_ids??f.source?.observation_ids??[]));
const newSources=[];
for(const f of newer){
 assert.ok(f.fact?.en?.length>=50 && f.fact?.fr?.length>=40,f.id);
 assert.equal(f.editorial_approval,false,f.id);
 assert.equal(f.publication_authorized,false,f.id);
 if(f.source_family==='WEISER_1958'){
  assert.equal(f.source.original_passage_reviewed,true,f.id);
  assert.ok(f.source.printed_pages?.length&&f.source.observation_ids?.length,f.id);
  newSources.push(...f.source.observation_ids);
 }else if(f.source_family==='PITRE_1900'){
  assert.equal(f.source.ocr_excerpt_rematched,true,f.id);
  assert.equal(f.source.original_page_image_verified,false,f.id);
  assert.ok(f.source.printed_page && f.source.source_anchor,f.id);
  newSources.push(f.source.observation_id);
 }else if(f.source_family==='1962_ROMAN_CANON_CEREMONIAL'){
  assert.ok(f.source.action_id&&f.source.original_french_rubric&&f.source.ritus_locator,f.id);
  newSources.push(f.source.action_id);
 }else throw new Error('Unknown source family '+f.id);
}
assert.equal(new Set(newSources).size,newSources.length,'new source identifiers must be distinct');
assert.equal(newSources.filter(id=>observationIds.has(id)).length,0,'old 145 exact observation reused');
const p=get('dyk-216-folio-and-mass-checkpoint.v1.json');
assert.equal(p.counts.new_bilingual_research_drafts,216);
assert.equal(p.counts.cumulative_candidate_record_count,1001);
assert.equal(p.counts.approved_new,0);
assert.equal(p.counts.published_new,0);
assert.equal(p.publication_gates.production_import_allowed,false);
console.log('PASS DYK historical 143 + Sicilian 42 + 1962 Roman Canon 31 = 216 additional bilingual source-ID-linked drafts; no release approved. Lexical/semantic independence not proven.');
