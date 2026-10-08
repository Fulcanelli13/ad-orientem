import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=(p)=>JSON.parse(readFileSync(p,"utf8"));
const register=load("data/learn/traditional-mass-objections-reconciliation.v1.json");
const a=load("data/learn/traditional-mass-objections-026-050-recovered.v1.json");
const b=load("data/learn/traditional-mass-objections-051-065-reconciled.v1.json");
const tc=load("data/learn/traditionis-custodes-debates.v1.json");
const crisis=load("data/learn/church-crisis-canonical.v1.json");
const apol=load("data/learn/apologetics-canonical.v1.json");
const owners=new Set([...crisis.dossiers,...apol.dossiers].map(x=>x.id));
const ids=(start,count)=>Array.from({length:count},(_,i)=>"TLM"+String(start+i).padStart(3,"0"));

assert.equal(crisis.dossiers.length,81,"unexpected canonical Church Crisis count");
assert.equal(apol.dossiers.length,60,"unexpected canonical Apologetics count");
assert.equal(register.not_recovered.range,"TLM001-TLM025");
assert.equal(register.not_recovered.count,25);
assert.equal(register.not_recovered.do_not_generate_synthetic_replacements,true);
assert.deepEqual(a.records.map(x=>x.id),ids(26,25));
assert.deepEqual(b.records.map(x=>x.id),ids(51,15));
assert.deepEqual(tc.debates.map(x=>x.id),ids(66,10));
assert.deepEqual(register.records.map(x=>x.id),ids(26,50));
assert.equal(register.counts.new_canonical_dossiers,0);
assert.equal(register.counts.published,0);

let checkedParagraphs=0,legacyCitations=0,unattributedChallenges=0;
function sources(pack){
  const s=new Map(pack.source_registry.map(x=>[x.id,x]));
  assert.equal(s.size,pack.source_registry.length,"duplicate source ID");
  for(const x of s.values())assert.ok(x.title&&/^https:\/\//.test(x.url),"missing full-text URL: "+x.id);
  return s;
}
const aSources=sources(a),bSources=sources(b),tcSources=sources(tc);
for(const [pack,sourceMap] of [[a,aSources],[b,bSources]]){
  for(const rec of pack.records){
    assert.ok(owners.has(rec.canonical_owner),"missing canonical owner "+rec.id);
    assert.ok(rec.paragraphs.length>=2,"missing draft "+rec.id);
    if(rec.id<="TLM050"){
      assert.ok(rec.question_fr && rec.translation_review==="FRENCH_DRAFT_REQUIRES_EDITORIAL_REVIEW","incomplete French question "+rec.id);
    }
    for(const p of rec.paragraphs){
      if(p.role==="unattributed_challenge"){
        unattributedChallenges++;
        assert.match(p.provenance,/REQUIRES_ACTUAL_PROPONENT/);
        if(rec.id<="TLM050")assert.ok(p.text_fr,"missing French follow-up "+rec.id);
        continue;
      }
      assert.ok(p.text&&!/chatgpt-content-reference/.test(p.text),"missing/redundant text "+rec.id);
      assert.ok(p.source_ids?.length,"uncited claim "+rec.id);
      for(const source of p.source_ids)assert.ok(sourceMap.has(source),"unknown source "+source+" "+rec.id);
      checkedParagraphs++;
      if(rec.id<="TLM050"){assert.ok(["TEXTUAL_ANCHOR_CHECKED_EDITORIAL_REVIEW_REQUIRED","INTERPRETIVE_SYNTHESIS_ANCHORED_EDITORIAL_REVIEW_REQUIRED","CORRECTED_SOURCE_ANCHORED_EDITORIAL_REVIEW"].includes(p.source_verification));assert.ok(Number.isInteger(p.legacy_placeholder_index));assert.ok(p.text_fr && p.text_fr.length>25,"missing French paragraph "+rec.id);assert.ok(p.citation_review?.evidence_locator);assert.ok(p.citation_review?.reviewed_on);assert.equal(p.citation_review.hyperlinked_sources.length,p.source_ids.length);for(const link of p.citation_review.hyperlinked_sources){assert.ok(sourceMap.has(link.source_id));assert.equal(link.url,sourceMap.get(link.source_id).url);assert.match(link.url,/^https:\/\//);}legacyCitations++;}
    }
  }
}
for(const rec of tc.debates){
  assert.ok(owners.has(rec.canonical_owner),"missing TC owner "+rec.id);
  for(const p of rec.paragraphs){
    assert.ok(p.text?.en && p.text?.fr);
    assert.ok(p.source_ids?.length);
    for(const source of p.source_ids)assert.ok(tcSources.has(source));
    checkedParagraphs++;
  }
}


assert.deepEqual(a.claim_level_audit.status_counts,{
  DIRECT_TEXT_ANCHORED:37,
  SOURCED_INTERPRETIVE:30,
  BLOCKED:0,
  CORRECTED_SOURCE_ANCHORED_EDITORIAL_REVIEW:7
});
assert.equal(a.claim_level_audit.publication_ready,false);
assert.equal(a.source_registry.length,36);
assert.equal(a.claim_level_audit.unattributed_followup_challenges,8);
assert.equal(a.translation_progress.question_titles_fr_draft,25);
assert.equal(a.translation_progress.paragraphs_fr_draft,82);
assert.equal(a.translation_progress.remaining_english_only_questions,0);
assert.equal(a.translation_progress.translation_stage,"COMPLETE_DRAFT_NOT_HUMAN_REVIEWED");
assert.equal(a.interpretive_review_summary.reviewed,30);
assert.equal(a.interpretive_review_summary.qualified_or_narrowed,7);
const all=a.records.flatMap(x=>x.paragraphs);
assert.equal(all.length,82,"lost challenge paragraphs");
const corrected=all.filter(p=>p.citation_review?.status==="CORRECTED_SOURCE_ANCHORED_EDITORIAL_REVIEW");
assert.equal(corrected.length,7);
assert.ok(corrected.every(p=>p.revision_history?.length&&p.citation_review.correction_reason),"lost correction provenance");
const interpretive=all.filter(p=>p.citation_review?.status==="SOURCED_INTERPRETIVE");
assert.equal(interpretive.length,30);
assert.ok(interpretive.every(p=>p.citation_review.interpretive_review?.final_approval==="PENDING_EDITORIAL_REVIEW"));
assert.equal(all.filter(p=>p.citation_review?.status==="BLOCKED").length,0);
assert.ok(all.every(p=>p.text_fr && p.text_fr.length>10),"missing French paragraph");
assert.equal(legacyCitations,74);
assert.equal(unattributedChallenges,8);
assert.equal(checkedParagraphs,134);
assert.equal(register.counts.underlying_substantive_paragraphs,checkedParagraphs);
console.log(JSON.stringify({validation:"PASS",indexed:register.records.length,unrecovered:25,substantiveParagraphs:checkedParagraphs,sourceCandidatesForLegacy:legacyCitations,directTextAnchored:37,interpretive:30,correctedPendingApproval:7,frenchDraftParagraphs:82,unattributedChallenges,newNavigationDossiers:0,publications:0},null,2));
