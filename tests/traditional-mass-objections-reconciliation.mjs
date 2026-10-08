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

let checkedParagraphs=0,legacyCitations=0,editorialFollowups=0;
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
    assert.ok(rec.question_fr, "missing French title "+rec.id);
    if(rec.id<="TLM050"){
      assert.equal(rec.translation_review,"FRENCH_DRAFT_REQUIRES_EDITORIAL_REVIEW");
    }else{
      assert.equal(rec.translation_review,"BILINGUAL_DRAFT_REQUIRES_NATIVE_THEOLOGICAL_EDITORIAL_REVIEW");
      assert.equal(rec.question_provenance,"EDITORIAL_DEBATE_PROMPT_NOT_ATTRIBUTED_TO_AN_EXTERNAL_AUTHOR");
      assert.ok(rec.question_source_ids.length>=1);
      assert.ok(rec.question_source_ids.every(id=>sourceMap.has(id)));
      assert.ok(rec.paragraphs.every(p=>p.text_fr?.length>25),"French paragraph missing "+rec.id);
      assert.ok(rec.paragraphs.every(p=>p.role!=="identified_reply"),"unsupported attribution "+rec.id);
    }
    for(const p of rec.paragraphs){
      if(p.role==="editorial_followup_question"){
        editorialFollowups++;
        assert.equal(p.provenance,"SYNTHETIC_EDITORIAL_QUESTION_NOT_A_QUOTE_OR_ATTRIBUTED_OPPOSITION");
        assert.equal(p.source_attribution,"TOPIC_CONTEXT_ONLY_NO_SOURCE_CLAIMED_AS_PROPOSING_THIS_WORDING");
        assert.ok(p.original_challenge_text && p.original_challenge_text_fr);
        assert.ok(p.text_fr && p.text && p.text.endsWith("?"));
        assert.ok(p.source_ids.length>0);
        for(const source of p.source_ids)assert.ok(sourceMap.has(source),"invalid follow-up context source "+source);
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
assert.equal(a.claim_level_audit.unattributed_followup_challenges,0);
assert.equal(a.claim_level_audit.reclassified_synthetic_followups,8);
assert.equal(a.followup_reclassification.count,8);
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
assert.equal(editorialFollowups,8);
assert.equal(a.records.flatMap(x=>x.paragraphs).filter(p=>p.role==="unattributed_challenge").length,0);
assert.equal(b.translation_progress.paragraphs_fr_draft,37);
assert.equal(b.translation_progress.questions_with_complete_paragraphs_fr_draft,15);
assert.equal(b.translation_progress.human_review_completed,false);
assert.equal(b.source_registry.length,15);
assert.equal(tc.source_registry.length,19);
assert.equal(tc.documentary_audit_20261008.reviewed_paragraphs,30);
assert.ok(tc.debates.every(x=>x.paragraphs.every(p=>p.documentary_audit?.pinpoints?.length)));
assert.equal(tc.documentary_audit_20261008.final_human_approval,false);
assert.equal(b.source_audit_20261008.human_theological_approval,false);
assert.deepEqual(b.source_audit_20261008.reviewed_cases,["TLM056","TLM058","TLM059","TLM060"]);
const q56=b.records.find(x=>x.id==="TLM056");
assert.ok(q56.paragraphs[1].text.includes("Orate, fratres"));
assert.ok(q56.paragraphs[1].text_fr.includes("Orate, fratres"));
assert.ok(q56.paragraphs[1].source_ids.includes("NOT67"));
assert.ok(b.records.find(x=>x.id==="TLM058").paragraphs[0].source_ids.includes("IGMR69_ORIGINAL"));
const s67=tc.debates.find(x=>x.id==="TLM067");
assert.ok(s67.paragraphs[1].source_ids.includes("MONT25"));
assert.ok(s67.paragraphs[2].source_ids.includes("BRUNI25"));
assert.equal(tc.audit_20261008.human_theological_approval,false);
const gate=load("data/learn/traditional-mass-publication-gates.v1.json");
assert.equal(gate.publication_allowed,false);
assert.equal(gate.records.length,50);
assert.deepEqual(gate.records.map(x=>x.id),ids(26,50));
assert.equal(gate.recovered.paragraphs,149);
assert.ok(gate.records.every(x=>x.publication_ready===false));

assert.equal(b.editorial_provenance.removed_unsupported_identified_reply_roles,3);
assert.equal(b.audit_batch_20261008.reviewed_questions,15);
assert.equal(b.audit_batch_20261008.total_paragraphs,37);
const primarySet=new Set(["TLM051","TLM052","TLM061","TLM062","TLM063","TLM064","TLM065"]);
const primaryCases=b.records.filter(x=>primarySet.has(x.id));
assert.equal(primaryCases.length,7);
assert.ok(primaryCases.every(x=>x.paragraphs.length===3));
assert.ok(primaryCases.every(x=>x.paragraphs.some(p=>p.role==="documented_reform_rationale")));
assert.equal(b.records.reduce((n,x)=>n+x.paragraphs.length,0),37);
assert.ok(b.records.every(x=>x.evidence_review?.final_theology_approval===false));
assert.ok(b.records.every(x=>x.paragraphs.every(p=>p.source_locator&&p.text_fr&&p.source_ids?.length)));
assert.equal(gate.research_review_progress.source_scoped_questions,50);
assert.equal(gate.research_review_progress.legacy_research_cases_scoped,25);
assert.equal(gate.research_review_progress.traditionis_custodes_cases_scoped,10);
assert.equal(gate.research_review_progress.final_approved_for_publication,0);
assert.ok(gate.records.every(x=>x.source_review_completed===true&&x.publication_ready===false));
assert.ok(a.records.every(x=>x.evidence_review?.publishable===false));
assert.ok(a.records.every(x=>x.question_provenance==="EDITORIAL_STEREOTYPE_OR_OBJECTION_PROMPT_NOT_A_VERBATIM_EXTERNAL_QUOTATION"));
assert.ok(a.records.every(x=>x.paragraphs.filter(p=>p.role==="substantive").every(p=>p.evidence_review?.source_locator&&p.evidence_review?.final_approval===false)));
assert.ok(tc.debates.every(x=>x.evidence_review?.final_theological_approval===false));
assert.equal(tc.audit_batch_20261008.synthetic_objection_roles_corrected,5);
assert.equal(gate.research_review_progress.tlm_051_065_reviewed,15);
assert.equal(gate.research_review_progress.primary_text_explicitly_checked,7);
assert.equal(gate.research_review_progress.final_approved_for_publication,0);
assert.equal(checkedParagraphs,141);
assert.equal(register.counts.underlying_substantive_paragraphs,checkedParagraphs);
console.log(JSON.stringify({validation:"PASS",indexed:register.records.length,unrecovered:25,substantiveParagraphs:checkedParagraphs,sourceCandidatesForLegacy:legacyCitations,directTextAnchored:37,interpretive:30,correctedPendingApproval:7,frenchDraftParagraphs:82,frenchDraftParagraphs051065:37,editorialFollowups,newNavigationDossiers:0,publications:0},null,2));
