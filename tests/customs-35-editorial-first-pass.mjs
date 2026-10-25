import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const seed=read("data/customs/customs-atlas-seed.v1.json");
const registry=read("data/customs/source-registry.v1.json");
const audit=read("data/customs/research/customs-published-35-editorial-first-pass.20261023.v1.json");
// Frozen 23 Oct editorial cohort; additive releases have their own gate.
const legacyIds=new Set(audit.records.map(x=>x.custom_id));
const live=seed.customs.filter(x=>x.publication_state==="PUBLISHED"&&legacyIds.has(x.custom_id));
const contextual=seed.customs.filter(x=>x.publication_state==="CONTEXT_ONLY");
const published=new Set(live.map(x=>x.custom_id));
const src=new Map(registry.sources.map(x=>[x.id,x]));
const records=new Map(audit.records.map(x=>[x.custom_id,x]));
assert.equal(live.length,35);
assert.equal(contextual.length,3);
assert.equal(seed.customs.length,40);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37);
assert.equal(new Set(CALENDAR_CUSTOM_ARTICLE_IDS).size,37);
assert.equal(audit.records.length,35);
assert.equal(records.size,35);
assert.equal(audit.counts.fully_editorially_certified,0);
assert.equal(audit.counts.new_publications,0);
assert.equal(audit.counts.targeted_primary_text_reviews,35);
assert.equal(audit.counts.p2_source_level_adjudications,16);
assert.equal(audit.counts.p2_indexed_only_or_access_limited,1);
assert.equal(audit.counts.final_english_french_editorial_signoffs,0);
assert.equal(audit.counts.final_release_approval,0);
const newlyReviewed=audit.records.filter(row=>row.p2_source_text_review);
assert.equal(newlyReviewed.length,16);
for(const row of newlyReviewed){
  const review=row.p2_source_text_review;
  assert.equal(row.primary_text_review_this_batch,"TARGETED_MATCH_AND_SCOPE");
  assert.ok(review.claim_supported.length>70&&review.remaining_hold.length>50,row.custom_id+" unsupported review");
  assert.equal(review.source_url,row.representative_source_url);
  assert.equal(review.review_signoff,"SOURCE_SCOPE_ONLY_NOT_FINAL_BILINGUAL_ACCEPTANCE");
}
assert.equal(newlyReviewed.filter(row=>row.p2_source_text_review.status.startsWith("INDEXED")).length,0);
assert.equal(audit.counts.official_original_source_http_502,1);
assert.equal(audit.counts.additional_claim_sources,3);
assert.equal(audit.counts.p1_source_level_adjudications,13);
assert.equal(audit.counts.p1_final_editorial_certifications,0);
assert.equal(audit.records.filter(row=>row.p1_source_text_review?.status).length,13);
assert.equal(audit.counts.historical_context_witnesses,4);
assert.equal(audit.counts.p1_source_wording_discrepancies_corrected,1);
assert.equal(audit.counts.history_duplicate_fixes_proposed,11);
for(const id of legacyIds){
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
assert.equal(registry.sources.length,112,"108 frozen sources plus four bounded new witnesses; historical cohort preserved");
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
for(const id of legacyIds){
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
const supporting=registry.supplemental_claim_sources||[];
assert.equal(supporting.length,3,"Basilica, 2026 Emmaus and Metz St Nicholas witnesses remain distinct from 108 canonical attestations");
assert.equal(new Set(supporting.map(row=>row.id)).size,3);
for(const evidence of supporting){
  assert.ok(published.has(evidence.custom_id),"Supplementary witness cannot publish a new custom");
  assert.ok(!src.has(evidence.id),"Supplementary source cannot masquerade as an attestation");
  assert.match(evidence.url,/^https:\/\//);
  const article=calendarCustomArticle(evidence.custom_id);
  const match=(article.supporting_sources||[]).find(x=>x.id===evidence.id);
  assert.equal(match?.url,evidence.url,evidence.id+" missing linked supporting source");
  assert.ok(!(article.sources||[]).some(x=>x.id===evidence.id));
}
assert.match(calendarCustomArticle("DOM-003").supporting_sources[0].url,/stmarybasilicaarchives/);
assert.match(calendarCustomArticle("EAST-001").supporting_sources[0].url,/erzbistum-muenchen/);
assert.match(calendarCustomArticle("SNIC-001").supporting_sources[0].url,/metz\.catholique\.fr/);
assert.match(calendarCustomArticle("SNIC-001").history.fr,/diocèse de Metz de 2024/);
const liveSourceAudit=read("data/customs/research/customs-source-link-access-audit.20261023.v1.json");
assert.equal(liveSourceAudit.counts.access_statuses.FETCH_INCONCLUSIVE,8);
assert.equal(liveSourceAudit.records.find(x=>x.source_id==="LAGHET-EXVOTO").recheck.status,"DIRECT_FULL_PAGE_RETRIEVED");
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
assert.match(calendarRuntime,/Supporting documentation","Documentation complémentaire/);
console.log("PASS customs 35 published, 4 distinct historical sources shown, Candlemas EN\/FR source corrected, 108 attestation sources invariant");
