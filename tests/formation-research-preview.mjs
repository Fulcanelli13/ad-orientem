import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FORMATION_RESEARCH_PREVIEW_DATA as DATA} from "../src/learn/formation-research-preview-data.js";
import {TRADITIONAL_MASS_RESEARCH_PREVIEW_DATA as TLM} from "../src/learn/traditional-mass-research-preview-data.js";
import {createFormationResearchPreview,FORMATION_RESEARCH_PREVIEW_ROOT} from "../src/learn/formation-research-preview.js";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";

const answers=JSON.parse(readFileSync("data/learn/biblical-patristic-answers.v1.json","utf8"));
const debates=JSON.parse(readFileSync("data/learn/sedevacantism-preconciliar-debates.v1.json","utf8"));
const supplement=JSON.parse(readFileSync("data/learn/biblical-patristic-and-sedevacantist-question-supplement.v1.json","utf8"));
const apol=JSON.parse(readFileSync("data/learn/apologetics-canonical.v1.json","utf8"));
const crisis=JSON.parse(readFileSync("data/learn/church-crisis-canonical.v1.json","utf8"));
assert.equal(DATA.status,"INTERNAL_REVIEW_UNPUBLISHED");
assert.equal(TLM.status,"INTERNAL_REVIEW_UNPUBLISHED");
assert.equal(TLM.canonical_navigation_locked,true);
assert.equal(TLM.publication_ready,false);
assert.equal(TLM.questions.length,50);
const gate=JSON.parse(readFileSync("data/learn/traditional-mass-publication-gates.v1.json","utf8"));
assert.equal(gate.publication_allowed,false,"TLM research accidentally approved");
assert.equal(gate.records.length,50);
assert.equal(gate.recovered.paragraphs,149);
assert.equal(gate.canonical_navigation_additions,0);
assert.equal(gate.research_review_progress.source_scoped_questions,50);
assert.equal(gate.research_review_progress.tc_documentary_claims_vetted,30);
assert.equal(gate.research_review_progress.final_approved_for_publication,0);
assert.ok(TLM.questions.find(x=>x.id==="TLM075").paragraphs[1].source_ids.includes("OBED08"));
assert.ok(TLM.questions.filter(x=>x.source_group==="custodes").every(x=>x.paragraphs.every(p=>p.documentary_audit?.pinpoints?.length)));
assert.equal(gate.research_review_progress.legacy_research_cases_scoped,25);
assert.equal(gate.research_review_progress.traditionis_custodes_cases_scoped,10);
assert.equal(gate.research_review_progress.remaining_unscoped_cases,0);
assert.equal(TLM.questions.filter(x=>x.question_prompt_provenance==="UNATTRIBUTED_EDITORIAL_PROMPT_NOT_A_QUOTATION").length,25);
assert.equal(TLM.questions.filter(x=>x.source_review_state==="10_REVIEWED_30_PRIMARY_OR_PROPONENT_LOCATORS_ZERO_FINAL_APPROVAL").length,10);
assert.equal(TLM.questions.find(x=>x.id==="TLM075").paragraphs[1].role,"source_based_critical_argument");
assert.ok(TLM.questions.every(x=>x.publication_ready===false));
assert.equal(gate.research_review_progress.formerly_reviewed_reform_cases,15);
assert.equal(gate.research_review_progress.primary_text_explicitly_checked,7);
assert.equal(gate.research_review_progress.final_approved_for_publication,0);
assert.equal(TLM.questions.find(x=>x.id==="TLM061").paragraphs.length,3);
assert.ok(TLM.questions.find(x=>x.id==="TLM061").paragraphs.some(x=>x.role==="documented_reform_rationale"));
assert.deepEqual(gate.records.map(x=>x.id),TLM.questions.map(x=>x.id));
assert.ok(TLM.questions.every(x=>x.publication_ready===false&&x.reviewer_approval==="NOT_GRANTED"));
assert.ok(TLM.questions.every(x=>x.quality_gate_version===gate.version));
assert.equal(gate.verified_reference_spot_checks.length,6);
assert.equal(TLM.source_sets.reform.IGMR69_ORIGINAL?.url,"https://laportelatine.org/formation/magistere/institutio-generalis-missalis-romani-en-francais-version-revue-corrigee-et-amendee-plusieurs-fois-depuis-1969");
assert.ok(!("GIM70" in TLM.source_sets.reform),"historically mislabelled 1975 source survives");
assert.ok(TLM.questions.find(x=>x.id==="TLM058").paragraphs.some(p=>p.source_ids.includes("IGMR69_ORIGINAL")));
const q67=TLM.questions.find(x=>x.id==="TLM067");
assert.ok(q67.paragraphs[1].source_ids.includes("MONT25"));
assert.ok(q67.paragraphs[2].source_ids.includes("BRUNI25"));
assert.ok(!q67.paragraphs.some(p=>p.source_ids.includes("AP25")),"unavailable AP ref not superseded");

assert.equal(TLM.missing_legacy_count,25);
assert.ok(!TLM.questions.some(x=>x.id==="TLM001"),"unrecovered content must not be invented");
const sourcePacks=[
  ["legacy","data/learn/traditional-mass-objections-026-050-recovered.v1.json",25],
  ["reform","data/learn/traditional-mass-objections-051-065-reconciled.v1.json",15],
  ["custodes","data/learn/traditionis-custodes-debates.v1.json",10],
];
const originalPacks=Object.fromEntries(sourcePacks.map(([key,path])=>[key,JSON.parse(readFileSync(path,"utf8"))]));
let tlmParagraphCount=0,editorialFollowups=0;
for(const [name,,count] of sourcePacks){
  const pack=originalPacks[name];
  const sourceObjects=Object.fromEntries(pack.source_registry.map(x=>[x.id,x]));
  assert.equal(Object.keys(TLM.source_sets[name]).length,Object.keys(sourceObjects).length,"source registry mismatch "+name);
  const questions=TLM.questions.filter(x=>x.source_group===name);
  const originalRecords=pack.records||pack.debates;
  assert.equal(questions.length,count,"incorrect question count "+name);
  for(let i=0;i<count;i++){
    const q=questions[i],orig=originalRecords[i];
    assert.equal(q.id,orig.id);
    assert.equal(q.owner,orig.canonical_owner);
    assert.ok(q.title_fr&&q.title_en);
    assert.equal(q.paragraphs.length,orig.paragraphs.length);
    for(let k=0;k<orig.paragraphs.length;k++){
      const p=q.paragraphs[k],o=orig.paragraphs[k];
      assert.equal(p.text,name==="custodes"?o.text.en:o.text,"English text must match canonical research");
      assert.equal(p.text_fr,name==="custodes"?o.text.fr:o.text_fr,"French text must match canonical research");
      assert.deepEqual(p.source_ids,o.source_ids);
      for(const id of p.source_ids){
        assert.equal(TLM.source_sets[name][id].url,sourceObjects[id]?.url);
        assert.match(TLM.source_sets[name][id].url,/^https:\/\//);
      }
      if(p.role==="editorial_followup_question"){
        editorialFollowups++;
        assert.equal(p.source_note,"TOPIC_LINKS_NOT_OPPONENT_PROVENANCE");
      }
      tlmParagraphCount++;
    }
  }
}
assert.equal(tlmParagraphCount,149);
assert.equal(editorialFollowups,8);
assert.equal(DATA.canonical_navigation_locked,true);
assert.equal(DATA.questions.length,26);
assert.equal(DATA.answers.length,22);
assert.equal(DATA.debates.length,8);
assert.deepEqual(DATA.questions.map(x=>x.id),supplement.questions.map(x=>x.id));
assert.deepEqual(DATA.answers.map(x=>x.question_id),answers.answers.map(x=>x.question_id));
assert.deepEqual(DATA.debates.map(x=>x.id),debates.debates.map(x=>x.id));
assert.equal(Object.keys(DATA.sourceSets.biblical).length,answers.source_registry.length);
assert.equal(Object.keys(DATA.sourceSets.sedevacantism).length,debates.source_registry.length);
const allOwners=new Set([...apol.dossiers,...crisis.dossiers].map(x=>x.id));
const answerById=new Map(DATA.answers.map(x=>[x.question_id,x]));
const debateById=new Map(DATA.debates.map(x=>[x.id,x]));
function checkParagraph(p,group,label){
  assert.ok(p?.text&&p?.text_fr,label+" bilingual");
  assert.ok(p.source_ids?.length,label+" unsourced");
  for(const key of p.source_ids){
    const item=DATA.sourceSets[group][key];
    assert.ok(item?.title&&/^https:\/\//.test(item.url),label+" missing source "+key);
  }
}
let claimCount=0;
for(const q of DATA.questions){
  assert.ok(q.id&&q.owner&&q.title_en&&q.title_fr,"incomplete title "+q.id);
  assert.ok(allOwners.has(q.owner),"invalid canonical owner "+q.id);
  if(q.debate_ids.length){for(const id of q.debate_ids)assert.ok(debateById.has(id),"missing debate "+id);}
  else assert.ok(answerById.has(q.id),"missing answer "+q.id);
}
for(const a of DATA.answers){
  assert.ok(allOwners.has(a.canonical_owner));
  const ps=[...a.answer_paragraphs,...a.objections.flatMap(x=>[x.argument,x.response]),a.traditional_argument];
  for(const p of ps){checkParagraph(p,"biblical",a.question_id);claimCount++;}
}
for(const d of DATA.debates){
  assert.ok(allOwners.has(d.canonical_owner));
  assert.ok(d.title_fr&&d.title);
  const ps=[...d.short_answer,...d.sedevacantist_case.paragraphs,...d.critical_assessment,...d.objections.flatMap(x=>[x.objection,x.response]),...d.traditional_argument];
  for(const p of ps){checkParagraph(p,"sedevacantism",d.id);claimCount++;}
}
assert.equal(claimCount,211);
assert.equal(LEARN_MODULE_IDS.includes("learn.apologetics"),false,"unapproved module wrongly public");
assert.equal(LEARN_MODULE_IDS.includes("learn.church_crisis"),false,"unapproved module wrongly public");
const browser=readFileSync("src/learn/browser-entry.js","utf8");
assert.match(browser,/aoFormationResearchPreview=1/,"missing QA gate");
assert.match(browser,/import\("\.\/formation-research-preview\.js"\)/,"QA reader missing lazy import");
assert.doesNotMatch(readFileSync("src/learn/presentation.js","utf8"),/id:"learn\.apologetics"|id:"learn\.church_crisis"/,"preview has become public");

function fakeWindow(lang="en"){
  const nodes=new Map();
  return {
    location:{search:"?aoFormationResearchPreview=1"},
    AO_RUNTIME_V8:{store:{getState:()=>({language:lang})}},
    document:{
      documentElement:{lang},
      body:{append(el){nodes.set(el.id,el);}},
      getElementById(id){return nodes.get(id)||null;},
      createElement(){return {
        id:"",lang:"",hidden:false,innerHTML:"",
        setAttribute(){},addEventListener(){},scrollTo(){},querySelector(){return null;},
        remove(){nodes.delete(this.id);}
      };}
    }
  };
}
const en=fakeWindow("en"),api=createFormationResearchPreview(en);
assert.equal(api.status().published,false);
assert.equal(api.status().approvedTraditionalMassQuestions,0);
assert.equal(api.status().traditionalMassQuestions,50);
assert.equal(api.status().questions,76);
assert.equal(api.open(),true);
assert.equal(api.status().open,true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Internal editorial preview/);
assert.equal(api.openQuestion("BAQ-06"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Infancy Gospel of Thomas|Infancy Gospel/);
assert.equal(api.openQuestion("BAQ-14"),true);
assert.equal(api.openDebate("SDV-01"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Sedevacantist argument/);
assert.equal(api.back(),true);
assert.equal(api.status().view,"question");
assert.equal(api.back(),true);
assert.equal(api.status().view,"list");
assert.equal(api.openQuestion("TLM001"),false);
assert.equal(api.openQuestion("TLM061"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Documented reform rationale/);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Normalized research summary/);
assert.equal(api.openQuestion("TLM039"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Joint Liturgical Group/);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/https:\/\//);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Unpublished editorial draft/);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Unapproved research/);
assert.equal(api.back(),true);
assert.equal(api.openQuestion("TLM026"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Question formulated for editorial study/);
assert.equal(api.openQuestion("TLM075"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Source-based critical argument/);
assert.equal(api.openQuestion("TLM026"),true);
assert.match(en.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/not a quotation/i);
assert.equal(api.back(),true);
assert.equal(api.close(),true);
assert.equal(api.status().open,false);
const french=fakeWindow("fr"),fa=createFormationResearchPreview(french);
assert.equal(fa.open(),true);
assert.equal(fa.openQuestion("BAQ-23"),true);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Édom|Edom/);
assert.equal(fa.openQuestion("BAQ-14"),true);
assert.equal(fa.openDebate("SDV-01"),true);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Argument sédévacantiste/);
assert.equal(fa.openQuestion("TLM061"),true);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Justification documentée de la réforme/);
assert.equal(fa.openQuestion("TLM056"),true);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Missa normativa|évêques/i);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/https:\/\//);
assert.equal(fa.openQuestion("TLM075"),true);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Argument critique fondé sur des sources/);
assert.equal(fa.openQuestion("TLM026"),true);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Recherche non approuvée/);
assert.match(french.document.getElementById(FORMATION_RESEARCH_PREVIEW_ROOT).innerHTML,/Question éditoriale/);
assert.equal(fa.back(),true);
assert.equal(fa.close(),true);
console.log("Formation research preview: PASS — 50 TLM source-linked bilingual drafts, primary source corrections, zero publication approvals, strict internal gate and navigation");
