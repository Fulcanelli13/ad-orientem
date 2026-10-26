import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load = n => JSON.parse(readFileSync(new URL("../data/customs/master/"+n,import.meta.url),"utf8"));
const pack=load("customs-r18-bilingual-calendar-candidate-pack-20261026.v1.json");
const master=load("working-master.v1.json");
const dispositions=load("customs-r18-preliminary-editorial-dispositions-20261026.v1.json");
const source=load("customs-first18-source-scope-evidence-review-20261026.v1.json");
const thirty=load("customs-editorial-thirty-review-units-20261026.v1.json");
const m=new Map(master.records.map(r=>[r.id,r]));
const t=new Map(thirty.rows.map(r=>[r.review_key,r]));
const fields=["title","description","history","meaning","practice","caution","occasion","scope"];
const core=fields.slice(0,6);
assert.equal(pack.schema,"AO_CUSTOMS_R18_BILINGUAL_CALENDAR_CANDIDATE_PACK_20261026_V1");
assert.equal(pack.summary.source_scoped_cases,18);
assert.equal(pack.summary.articles_with_all_eight_bilingual_text_fields,18);
assert.equal(pack.summary.preexisting_six_field_master_drafts_preserved,17);
assert.equal(pack.summary.new_intro_pair_drafts,1);
assert.equal(pack.summary.canonical_id_allocations,0);
assert.equal(pack.summary.authorised_calendar_app_articles,0);
assert.equal(pack.policies.do_not_patch_main_calendar_in_research_pr,true);
assert.equal(pack.policies.source_claim_check_not_whole_article_certification,true);
assert.equal(pack.records.length,18);
assert.deepEqual(pack.records.map(r=>r.review_key),dispositions.records.map(r=>r.review_key));
assert.deepEqual(pack.records.map(r=>r.review_key),source.records.map(r=>r.review_key));
assert.equal(new Set(pack.records.map(r=>r.review_key)).size,18);
let existing=0,companion=0,extraWitness=0;
for (const [i,r] of pack.records.entries()) {
 const d=dispositions.records[i],e=source.records[i],trow=t.get(r.review_key);
 assert.ok(trow);
 assert.equal(r.release_key,d.release_key);
 assert.equal(r.publication_status,"UNAPPROVED_SOURCE_BOUNDED_EDITORIAL_DRAFT");
 assert.equal(r.source_scope.principal_claim_source,e.source_support.verified_url);
 assert.equal(r.source_scope.source_type,e.source_support.type);
 assert.equal(r.source_scope.source_independence_certified,false);
 assert.equal(r.editorial_evidence.independent_full_text_review,false);
 assert.equal(r.editorial_evidence.full_source_independence_verified,false);
 assert.equal(r.existing_calendar_hint.date_authority,"EXISTING_1962_CALENDAR_RESOLVER_ONLY");
 for(const k of ["is_actual_event_schedule","auto_schedule_enabled","calendar_trigger_enabled","feast_rank_assumed"])assert.equal(r.existing_calendar_hint[k],false);
 assert.equal(r.presentation_policy.no_new_module,true);
 assert.equal(r.presentation_policy.no_inferred_mass_rite,true);
 for(const k of ["identity","claims","roman_1962_role","english_copy","french_copy","geography_scope","calendar_context","runtime_qa"])assert.equal(r.acceptance[k],"PENDING");
 assert.equal(r.acceptance.publish,"PROHIBITED");
 assert.deepEqual(Object.keys(r.article).sort(),fields.slice().sort());
 for(const field of fields)for(const locale of ["en","fr"]){
  assert.ok(typeof r.article[field][locale]==="string",r.review_key+" "+field+" "+locale);
  assert.ok(r.article[field][locale].trim().length>=(field==="occasion"?5:9),r.review_key+" "+field+" "+locale);
 }
 assert.ok(r.sources.length);
 assert.equal(new Set(r.sources.map(s=>s.url)).size,r.sources.length);
 assert.ok(r.sources.every(s=>s.url.startsWith("https://")));
 assert.ok(r.sources.some(s=>s.url===e.source_support.verified_url),"Every scoped witness must be in the article sources: "+r.review_key);
 const srcUrls=new Set(trow.source_urls);
 for(const url of srcUrls)assert.ok(r.sources.some(s=>s.url===url),"All original source links retained: "+r.review_key+" "+url);
 if(r.research_master_id){
  existing++;
  const w=m.get(r.research_master_id);
  assert.ok(w);
  assert.equal(w.publication_state,"NOT_APPROVED");
  assert.equal(r.candidate_type,"WORKING_IDENTITY_NOT_CANONICAL");
  assert.equal(r.proposed_companion_owner_id,null);
  for(const f of core)for(const locale of ["en","fr"]){
   const name=f==="title"?"name_"+locale:f+"_"+locale;
   assert.equal(r.article[f][locale],w[name],"Core EN/FR copy may not be silently revised: "+r.review_key+" "+name);
  }
  assert.equal(r.article.occasion.en,w.calendar.hint_en);
  assert.equal(r.article.occasion.fr,w.calendar.hint_fr);
  assert.equal(r.editorial_evidence.copy_origin,"EXISTING_MASTER_UNALTERED_SIX_FIELD_ARTICLE");
 }else{
  companion++;
  assert.equal(r.review_key,"OBSERVATION:BULK150-018");
  assert.equal(r.candidate_type,"EXPLANATORY_COMPANION_NOT_CANONICAL");
  assert.equal(r.proposed_companion_owner_id,"CUST-XMAS-PROVENCAL-PAIN-CALENDAL");
  assert.equal(r.article.title.en,trow.copy.title.en);
  for(const f of ["history","meaning","practice","caution"])assert.deepEqual(r.article[f],trow.copy[f]);
  assert.equal(r.editorial_evidence.copy_origin,"NEW_CONSERVATIVE_INTRO_DRAFT_FOR_PREEXISTING_SOURCE_OBSERVATION");
  assert.equal(r.existing_calendar_hint.context_kind,"NO_REVIEWED_CALENDAR_CONTEXT");
  assert.ok(r.article.description.en.includes("Gros Souper"));
  assert.ok(r.article.description.fr.includes("gros souper"));
 }
 if(r.sources.some(s=>s.provenance.startsWith("ALTERNATE_")))extraWitness++;
}
assert.equal(existing,17);
assert.equal(companion,1);
assert.equal(extraWitness,1);
assert.equal(pack.summary.companion_only_cases,1);
assert.equal(master.records.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(master.records.filter(x=>x.publication_state==="NOT_APPROVED").length,18);
assert.ok(!pack.records.some(x=>x.research_master_id==="CUST-XMAS-KASHUBIAN-ANIMAL-CARE"));
console.log("PASS R18 bilingual candidate pack: 18 eight-field EN/FR articles, 17 original master core drafts preserved, one conservative Provencal companion draft, stable sources and no approvals or Calendar runtime changes");
