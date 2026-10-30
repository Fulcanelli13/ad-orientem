// Source-identity and release-state acceptance for one proposed Polish regional
// Calendar custom. This PR is intentionally unmerged and not an automatic event.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditCustom,auditAttestation,assertCustomsAtlasRegistry} from "../src/find/customs-contracts.js";
import {calendarCustomArticle,calendarCustomArticleIds,calendarCustomRecommendations,calendarCustomSeasonalMonthEntries} from "../src/calendar/customs-read-model.js";
import {groupCalendarCustomsByYear} from "../src/customs/year-led-library.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const seed=read("data/customs/customs-atlas-seed.v1.json");
const src=read("data/customs/source-registry.v1.json");
const geographic=read("data/geography/seed-registry.v1.json");
const negative=read("data/customs/negative-knowledge.v1.json");
const temporal=read("data/customs/customs-temporal-projection.v1.json");
const french=read("data/customs/customs-fr-canonical-copy.v1.json");
const consent=read("data/customs/editorial-final-acceptance.v1.json");
const release=read("data/customs/releases/customs-r18-pent-001-single-canonical-release-review.v1.json");
const id="PENT-001";
const original=new Set(read("data/customs/research/customs-published-35-editorial-first-pass.20261023.v1.json").records.map(x=>x.custom_id));
assert.equal(original.size,35,"Do not rewrite the original published-35 editorial audit");
const published=seed.customs.filter(x=>x.publication_state==="PUBLISHED");
assert.equal(published.length,36);
assert.equal(seed.customs.length,39);
assert.equal(seed.attestations.length,98);
assert.equal(src.sources.length,110);
assert.equal(seed.customs.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.deepEqual(new Set(published.map(x=>x.custom_id)),new Set([...original,id]));
const custom=seed.customs.find(x=>x.custom_id===id);
assert.deepEqual(auditCustom(custom),[]);
assert.equal(custom.custom_class,"LOCAL_REGIONAL_CUSTOM");
assert.equal(custom.calendar_trigger_hint,null);
assert.equal(custom.publication_state,"PUBLISHED");
assert.equal(custom.owners.includes("Calendar"),true);
const att=seed.attestations.filter(x=>x.custom_id===id);
assert.equal(att.length,1);
assert.deepEqual(auditAttestation(att[0]),[]);
assert.equal(att[0].geo_area_id,"geo:country:PL");
assert.equal(att[0].place_id,null);
assert.equal(att[0].geographic_precision,"COUNTRY");
assert.equal(att[0].map_policy,"NOT_MAPPED");
assert.deepEqual(att[0].source_ids,release.new_source_ids);
for(const sourceId of att[0].source_ids){
 const record=src.sources.find(x=>x.id===sourceId);
 assert.ok(record?.url.startsWith("https://www.lasy.gov.pl/"),sourceId+" requires institutional source");
}
const gate=assertCustomsAtlasRegistry({customs:seed.customs,attestations:seed.attestations,
 sources:src.sources,negativeKnowledge:negative.entries,geoAreas:geographic.geoAreas,places:geographic.places});
assert.equal(gate.pass,true,JSON.stringify(gate.issues||[]));
assert.equal(temporal.records.length,39);
const place=temporal.records.find(x=>x.custom_id===id);
assert.equal(place.kind,"movable");
assert.equal(place.group,"eastertide");
assert.ok(/Pentecost/.test(place.calendar_hint));
assert.ok(/Pentecôte/.test(place.calendar_hint_fr));
assert.equal(french.entries.length,28);
const fr=french.entries.find(x=>x.custom_id===id);
assert.ok(fr?.title_fr&&fr?.description_fr&&fr?.caution_fr);
const article=calendarCustomArticle(id);
assert.ok(article);
for(const f of ["title","description","history","meaning","practice","caution","occasion","scope"])
 for(const lang of ["en","fr"])
  assert.ok(article[f]?.[lang]?.trim().length>8,id+" missing "+f+"."+lang);
assert.equal(article.title.fr,fr.title_fr);
assert.equal(article.description.fr,fr.description_fr);
assert.equal(article.caution.fr,fr.caution_fr);
assert.equal(article.sources.length,2);
assert.deepEqual(new Set(article.sources.map(x=>x.id)),new Set(att[0].source_ids));
assert.ok(/Polish|Poland/.test(article.scope.en));
assert.ok(/polonais|polonaise|Pologne/i.test(article.scope.fr));
assert.ok(/neither a prescribed Roman Pentecost practice nor a priestly blessing/i.test(article.caution.en));
assert.ok(/pratique prescrite|bénédiction sacerdotale/i.test(article.caution.fr));
assert.ok(!/1930 archival photograph/i.test(article.history.en));
const accepted=consent.records.find(x=>x.custom_id===id);
assert.ok(accepted);
assert.equal(accepted.final_status,"BLOCKED_PENDING_HUMAN_SIGNOFF");
for(const part of ["final_en","final_fr","final_claims"]){
 assert.equal(accepted[part].decision,"PENDING");
 assert.equal(accepted[part].reviewer,null);
 assert.equal(accepted[part].content_sha256,null);
}
// Human publication remains blocked even when three independent institutional
// sources support the narrow historical account.
const editorial=release.editorial_review_20261030;
assert.equal(editorial.status,"SOURCE_CLAIMS_CORROBORATED_EDITORIAL_COPY_REVISED_NOT_HUMAN_SIGNED");
assert.match(editorial.independent_institutional_crosscheck.url,/^https:\/\/www\.muzeum-radom\.pl\//);
assert.equal(editorial.primary_crosscheck.length,2);
assert.equal(editorial.claim_decisions.length,6);
assert.ok(editorial.claim_decisions.every(x=>x.decision));
assert.deepEqual(editorial.human_final_approval,{en:false,fr:false,claims:false});
assert.equal(editorial.no_scheduled_event,true);
assert.equal(editorial.no_publication_before_approval,true);
assert.equal(release.release_gates.user_final_merge_approval,"NOT_YET_GIVEN");
assert.ok(/historical Polish Pentecost customs/i.test(article.description.en),
 "English overview must avoid implying universal present-day practice");
assert.ok(/d'anciens usages polonais/i.test(article.description.fr),
 "French overview must use historical rather than universal present-tense wording");
assert.ok(/older springtime and agricultural folk associations/.test(article.history.en));
assert.ok(/traditions populaires printanières et agricoles/.test(article.history.fr));
assert.ok(/without permission/.test(article.practice.en));
assert.ok(/sans autorisation/.test(article.practice.fr));
assert.equal(release.authorizations.human_final_copy_signoff,false);
assert.equal(release.authorizations.automatic_merge_allowed,false);
assert.equal(release.live_change_now,false);
assert.equal(release.proposed_scope.automatic_calendar_reminder,false);
assert.equal(release.proposed_scope.automatic_calendar_recommendation,false);
assert.deepEqual(new Set(calendarCustomArticleIds()),new Set(published.map(x=>x.custom_id)));
const grouped=groupCalendarCustomsByYear(calendarCustomArticleIds().map(calendarCustomArticle));
assert.equal(grouped.flatMap(x=>x.articles).length,36);
assert.ok(grouped.find(x=>x.key==="easter_rogations")?.articles.some(x=>x.id===id));
for(const date of ["2026-05-24","2027-05-16","2026-12-25"]){
 assert.ok(!calendarCustomRecommendations(date,{events:[]}).some(x=>x.id===id),
 "Regional history cannot become a global automatically dated recommendation");
}
assert.ok(!calendarCustomSeasonalMonthEntries("2026-05").some(x=>x.id===id));
assert.ok(!calendarCustomSeasonalMonthEntries("2026-06").some(x=>x.id===id));
for(const forbidden of ["CUSTOMS-R18-03","CUSTOMS-R18-04","CUSTOMS-R18-05","CUSTOMS-R18-07","CUSTOMS-R18-08","CUSTOMS-R18-09","CUSTOMS-R18-13","CUSTOMS-R18-15","CUSTOMS-R18-16","CUSTOMS-R18-17"]){
 assert.equal(calendarCustomArticle(forbidden),null);
}
console.log("PASS PENT-001 proposed single canonical regional article: 36/39 identity parity, 98 attestations, 110 sources, bilingual article, Poland-only history, no automatic event or fabricated human signoff");
