import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const seed=read("data/customs/customs-atlas-seed.v1.json");
const registry=read("data/customs/source-registry.v1.json");
const audit=read("data/customs/research/customs-published-35-editorial-first-pass.20261023.v1.json");
const live=seed.customs.filter(x=>x.publication_state==="PUBLISHED");
const contextual=seed.customs.filter(x=>x.publication_state==="CONTEXT_ONLY");
const published=new Set(live.map(x=>x.custom_id));
const src=new Map(registry.sources.map(x=>[x.id,x]));
const records=new Map(audit.records.map(x=>[x.custom_id,x]));
assert.equal(live.length,35);
assert.equal(contextual.length,3);
assert.equal(seed.customs.length,38);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,35);
assert.equal(new Set(CALENDAR_CUSTOM_ARTICLE_IDS).size,35);
assert.equal(audit.records.length,35);
assert.equal(records.size,35);
assert.equal(audit.counts.fully_editorially_certified,0);
assert.equal(audit.counts.new_publications,0);
assert.equal(audit.counts.targeted_primary_text_reviews,10);
assert.equal(audit.counts.history_duplicate_fixes_proposed,11);
for(const id of CALENDAR_CUSTOM_ARTICLE_IDS){
  assert.ok(published.has(id),id+" cannot publish a context/research-only identity");
  const article=calendarCustomArticle(id),row=records.get(id);
  assert.ok(article&&row,id+" missing published article or audit");
  assert.equal(row.publication_state,"PUBLISHED");
  assert.equal(row.review_stage,"EDITORIAL_FIRST_PASS_NOT_FINAL_CERTIFIED");
  assert.equal(row.new_custom_approved,false);
  assert.equal(row.needs_additional_historical_or_regional_signoff,true);
  assert.ok(row.claim_boundary?.length>45,id+" requires meaningful claim-bounding note");
  for(const field of ["title","description","history","meaning","practice","caution","occasion","scope"]){
    assert.ok(article[field]?.en?.trim(),id+" missing English "+field);
    assert.ok(article[field]?.fr?.trim(),id+" missing French "+field);
  }
  assert.notEqual(article.history.en.trim(),article.description.en.trim(),id+" History EN must not just duplicate Description");
  assert.notEqual(article.history.fr.trim(),article.description.fr.trim(),id+" History FR must not just duplicate Description");
  const attIds=new Set(seed.attestations.filter(a=>a.custom_id===id).flatMap(a=>a.source_ids||[]));
  assert.ok(article.sources?.length>0,id+" no sources");
  for(const s of article.sources){
    assert.ok(attIds.has(s.id),id+" source not attested: "+s.id);
    assert.equal(src.get(s.id)?.url,s.url,id+" source URL differs from canonical registry");
  }
  assert.ok(attIds.has(row.representative_source_id),id+" representative source missing from attestation");
  assert.equal(src.get(row.representative_source_id)?.url,row.representative_source_url);
  assert.deepEqual(new Set(row.all_attestation_source_ids),attIds,id+" source ID coverage changed");
}
for(const x of contextual)assert.ok(!CALENDAR_CUSTOM_ARTICLE_IDS.includes(x.custom_id),x.custom_id+" context-only article promoted");
assert.ok(!CALENDAR_CUSTOM_ARTICLE_IDS.some(id=>id.startsWith("CUST-")),"research proposal promoted");
console.log("PASS customs 35-article EN/FR structural parity, 11 real historical sections, 35 source chains, no new customs or Calendar rule");
