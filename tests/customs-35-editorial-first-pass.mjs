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
assert.equal(audit.counts.targeted_primary_text_reviews,11);
assert.equal(audit.counts.historical_context_witnesses,4);
assert.equal(audit.counts.p1_source_wording_discrepancies_corrected,1);
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
const historical=registry.historical_context_sources||[];
assert.equal(registry.sources.length,108,"Existing attestation source pool must remain unchanged");
assert.equal(historical.length,4,"Historical context must use independently categorized source ownership");
const histIds=new Set(historical.map(row=>row.id));
assert.equal(histIds.size,4,"Historical witnesses must be uniquely identified");
for(const h of historical){
  assert.ok(published.has(h.custom_id),"Historical source cannot approve a new custom");
  assert.ok(!src.has(h.id),"Historical sources must not masquerade as canonical attestation sources");
  assert.match(h.url,/^https:\/\//);
  assert.ok(h.claim_supported.length>75&&h.limitations.length>70,h.id+" must be carefully bounded");
  const a=calendarCustomArticle(h.custom_id);
  const row=(a.history_sources||[]).find(row=>row.id===h.id);
  assert.ok(row,h.id+" missing historical article link");
  assert.equal(row.url,h.url,h.id+" link not identical to source registry");
}
for(const id of CALENDAR_CUSTOM_ARTICLE_IDS){
  const a=calendarCustomArticle(id);
  for(const h of a.history_sources||[]){
    assert.ok(histIds.has(h.id),id+" has unregistered historical source");
    assert.equal(historical.find(x=>x.id===h.id)?.custom_id,id,id+" historical source assigned to wrong custom");
    assert.ok(!a.sources.some(x=>x.id===h.id),id+" historical source misrepresented as existence attestation");
  }
}
const actual=Object.fromEntries(historical.map(row=>[row.custom_id,row.id]));
assert.deepEqual(actual,{
  "ADVT-001":"EBK-ADVENT-WREATH-WICHERN-2025",
  "ADVT-002":"EBK-ADVENT-MANGER-STRAW-2025",
  "ADVT-003":"MEX-CULTURA-POSADAS-ORIGINS-2017",
  "MARI-002":"DAYTON-MARIAN-MARY-GARDENS-HISTORY"
});
assert.match(calendarCustomArticle("ADVT-001").history.en,/1839/);
assert.match(calendarCustomArticle("ADVT-003").history.en,/Andalusia/);
assert.match(calendarCustomArticle("MARI-002").history.en,/1932.*1951/);
assert.match(calendarCustomArticle("ADVT-002").history.en,/German regions/);
const candle=calendarCustomArticle("DOM-011");
assert.match(candle.history.en,/beside the deceased/);
assert.match(candle.history.fr,/auprès des défunts/);
assert.doesNotMatch(candle.history.en,/near the dying/);
const liturgicalHistory=read("data/customs/customs-historical-folios.v1.json").entries.find(x=>x.custom_id==="DOM-011");
assert.match(liturgicalHistory.history_fr,/auprès des défunts/);
const storedCandle=registry.sources.find(x=>x.id==="ECF-CHANDLEUR-HOME");
assert.match(storedCandle.contribution,/auprès des morts/);
const calendarRuntime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.match(calendarRuntime,/historySources=article\.history_sources\|\|\[\]/);
assert.match(calendarRuntime,/Historical sources","Sources historiques/);
console.log("PASS customs 35 published, 4 distinct historical sources shown, Candlemas EN\/FR source corrected, 108 attestation sources invariant");
