import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRecoveryReviewRows,buildContemporaryDraftRows,buildRecoveryDossierCoverage,createFormationRecoveryReview,RECOVERY_REVIEW_ROOT,RECOVERY_REVIEW_SECTION_KEYS,RECOVERY_REVIEW_CHILD_KEYS} from "../src/learn/formation-recovery-review.js";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";
const names=[
  ["BAQ questions","biblical-patristic-and-sedevacantist-question-supplement.v1.json"],
  ["BAQ answers","biblical-patristic-answers.v1.json"],
  ["Sedevacantism","sedevacantism-preconciliar-debates.v1.json"],
  ["Contemporary I","contemporary-controversies-source-pack.v1.json"],
  ["Contemporary II","contemporary-controversies-batch2-source-pack.v1.json"],
  ["Contemporary III · drafted","contemporary-controversies-bulk-21-debates-2026-10-08.v1.json"],
  ["Traditional Mass I","traditional-mass-objections-026-050-recovered.v1.json"],
  ["Traditional Mass II","traditional-mass-objections-051-065-reconciled.v1.json"],
  ["Traditionis custodes","traditionis-custodes-debates.v1.json"],
  ["Apologetics dossiers","apologetics-canonical.v1.json"],
  ["Church Crisis dossiers","church-crisis-canonical.v1.json"],
  ["Dossier evidence","formation-141-absorption-evidence-2026-10-09.v1.json"],
  ["Canonical syntheses","formation-canonical-synthesis-batch1-2026-10-09.v1.json"],
  ["Canonical syntheses II","formation-canonical-synthesis-batch2-2026-10-09.v1.json"]
];
const packs=names.map(([label,name])=>({label,doc:JSON.parse(readFileSync("data/learn/"+name,"utf8"))}));
const legacyRows=buildRecoveryReviewRows(packs);
const draftRows=buildContemporaryDraftRows(packs);
const rows=[...legacyRows,...draftRows];
const known=JSON.parse(readFileSync("data/learn/formation-recoverable-research-ledger-2026-10-08.v1.json","utf8"));
const ap=JSON.parse(readFileSync("data/learn/apologetics-canonical.v1.json","utf8"));
const cr=JSON.parse(readFileSync("data/learn/church-crisis-canonical.v1.json","utf8"));
const owners=new Set([...ap.dossiers,...cr.dossiers].map(x=>x.id));
assert.equal(legacyRows.length,102);
assert.equal(draftRows.length,21);
assert.equal(rows.length,123);
const coverage=buildRecoveryDossierCoverage(rows,packs);
assert.equal(coverage.dossiers.length,141);
assert.equal(coverage.covered,53);
assert.equal(coverage.linked,118);
assert.equal(coverage.external.length,5);
assert.equal(coverage.dossiers.filter(x=>x.synthesis).length,30);
assert.equal(coverage.dossiers.filter(x=>x.synthesis).every(x=>x.research.length>0),true);
const evidence=JSON.parse(readFileSync("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json","utf8"));
assert.equal(coverage.dossiers.every(d=>d.evidence?.id===d.id),true,"every canonical dossier must receive its source evidence disposition");
assert.equal(coverage.dossiers.filter(d=>d.evidence?.direct_source_bearing_research_ids?.length).length,53);
assert.equal(coverage.dossiers.filter(d=>!d.research.length&&d.evidence?.legacy_thematic_and_research_bank_leads?.length).length,57);
assert.equal(coverage.dossiers.filter(d=>!d.research.length&&!d.evidence?.legacy_thematic_and_research_bank_leads?.length).length,31);
for(const d of coverage.dossiers){
  assert.deepEqual(d.research.map(r=>r.id),d.evidence.direct_source_bearing_research_ids,d.id+" source reader diverges from the 141-dossier evidence inventory");
  assert.equal(d.evidence.dossier_content_fully_certified,false);
  assert.equal(d.evidence.released_as_public_apologetics_or_crisis_module,false);
}

assert.equal(coverage.dossiers.filter(d=>d.corpus==="apologetics" && d.research.length).length,14);
assert.equal(coverage.dossiers.filter(d=>d.corpus==="crisis" && d.research.length).length,39);
assert.equal(coverage.dossiers.find(d=>d.id==="CR-LIT-05").research.length,5);
assert.equal(coverage.dossiers.find(d=>d.id==="APOL-012").research.length,7);
assert.ok(coverage.external.some(x=>x.id==="cremation"));

assert.deepEqual(legacyRows.map(x=>x.id).sort(),known.recovered_research.map(x=>x.id).sort());
assert.equal(draftRows.every(x=>x.qaStatus==="NEW_UNPUBLISHED_DRAFT"),true);
assert.equal(new Set(rows.map(x=>x.id)).size,123);
assert.deepEqual(Object.fromEntries([...new Set(rows.map(x=>x.bank))].map(k=>[k,rows.filter(x=>x.bank===k).length])),{
  BAQ:26,Sedevacantism:8,"Contemporary I":6,"Contemporary II":12,"Contemporary III · drafted":21,
  "Traditional Mass I":25,"Traditional Mass II":15,"Traditionis custodes":10
});
for(const r of rows){
  assert.ok(r.id&&r.title_en&&r.bank);
  assert.ok(r.sourceRegistry instanceof Map);
  assert.ok(r.sourceRegistry.size>0);
  if(r.owner?.startsWith("APOL-")||r.owner?.startsWith("CR-"))assert.ok(owners.has(r.owner),r.id+" lacks canonical owner");
  for(const s of r.sourceRegistry.values())assert.ok(/^https:\/\//.test(s.url),r.id+" invalid source URL");
}
assert.equal(rows.filter(x=>x.bank==="BAQ" && !x.content).length,0);
assert.equal(rows.filter(x=>x.bank==="BAQ" && x.title_fr).length,26,"BAQ French titles lost between question bank and answer drafts");
const countAllSources = value => {
  let count=0;
  function walk(x){
    if(Array.isArray(x))return x.forEach(walk);
    if(!x||typeof x!=="object")return;
    if(Array.isArray(x.source_ids))count++;
    for(const [key,child] of Object.entries(x))if(key!=="source_ids")walk(child);
  }
  walk(value);
  return count;
};
const countVisibleSources = value => {
  let count=0;
  function walk(x){
    if(Array.isArray(x))return x.forEach(walk);
    if(!x||typeof x!=="object")return;
    if(Array.isArray(x.source_ids))count++;
    for(const key of RECOVERY_REVIEW_CHILD_KEYS)if(x[key])walk(x[key]);
  }
  for(const key of RECOVERY_REVIEW_SECTION_KEYS)if(value?.[key])walk(value[key]);
  return count;
};
const expected=rows.reduce((n,r)=>n+countAllSources(r.content),0);
const renderable=rows.reduce((n,r)=>n+countVisibleSources(r.content),0);
assert.equal(legacyRows.reduce((n,r)=>n+countAllSources(r.content),0),known.counts.source_bearing_blocks,"legacy source blocks diverged from historical registry");
assert.equal(expected,622,"538 recovered plus 84 new four-part debates");
assert.equal(known.counts.blocks_with_french,538,"all 538 recovered source-bearing blocks now have bilingual drafts");
assert.equal(known.counts.blocks_without_french,0,"all legacy source-bearing content must have French text");
assert.equal(known.controversy_draft_completion_20261008.externally_identified_original_opponents,19);
assert.equal(known.controversy_draft_completion_20261008.newly_authored_source_references,202);

const existingI=packs.find(p=>p.label==="Contemporary I").doc;
for(const c of existingI.cases){
 const sections=[...c.short_answer,...c.positions.map(p=>p.argument),...c.objections.flatMap(p=>[p.challenge,p.reply]),...c.traditional_argument];
 assert.ok(sections.every(p=>p.text&&p.text_fr&&p.source_ids.length),"missing first-pack bilingual source block "+c.id);
}
const baqAnswers=packs.find(p=>p.label==="BAQ answers").doc;
for(const id of ["BAQ-06","BAQ-07","BAQ-23"]){
 const row=baqAnswers.answers.find(r=>r.question_id===id);
 assert.ok(row.verification_notes[0].text_fr,"missing BAQ verification-note translation "+id);
}
assert.equal(renderable,expected,"reader silently hides sourced paragraphs");

const fake={document:{getElementById:()=>null}};
const preview=createFormationRecoveryReview(fake);
assert.equal(preview.status().public,false);
assert.equal(preview.status().open,false);
assert.equal(preview.status().researchRecords,0);
assert.equal(RECOVERY_REVIEW_ROOT,"ao-formation-recovery-review");
for(const forbidden of ["learn.apologetics","learn.church_crisis","learn.formation_recovery"])assert.ok(!LEARN_MODULE_IDS.includes(forbidden));
const browser=readFileSync("src/learn/browser-entry.js","utf8");
assert.ok(browser.includes("aoFormationRecoveryReview=1"),"explicit URL gate not found");
assert.ok(browser.includes('import("./formation-recovery-review.js")'),"lazy QA import missing");
assert.ok(!browser.includes('import { createFormationRecoveryReview'),"QA reader must not be eager");

const nodes=new Map();
const fakeDocument={
  baseURI:"https://example.test/ad-orientem/index.html",
  documentElement:{lang:"en"},
  getElementById:id=>nodes.get(id)||null,
  createElement:tag=>{
    const el={tagName:tag,innerHTML:"",id:"",listeners:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},
      addEventListener(type,fn){this.listeners[type]=fn;},
      querySelector:()=>null,scrollTo(){},remove(){nodes.delete(this.id);}};
    return el;
  },
  body:{append(el){nodes.set(el.id,el);}}
};
const packLookup=new Map(names.map(([label,file])=>[file,packs.find(x=>x.label===label).doc]));
const windowLike={
  document:fakeDocument,
  location:{search:"?aoFormationRecoveryReview=1"},
  fetch:async url=>{
    const file=String(url).split("/").pop();
    const data=packLookup.get(file);
    return {ok:!!data,status:data?200:404,json:async()=>data};
  },
  AO_RUNTIME_V8:{store:{getState:()=>({language:"en"})}}
};
const live=createFormationRecoveryReview(windowLike);
assert.equal(await live.open(),true,"QA source files failed to mount");
assert.equal(live.status().researchRecords,123);
assert.equal(live.status().newContemporaryDrafts,21);
const node=nodes.get(RECOVERY_REVIEW_ROOT);
assert.equal(live.status().canonicalDossiers,141);
assert.equal(live.status().coveredDossiers,53);
assert.equal(live.status().assembledDossierReadings,53);
assert.equal(live.status().synthesisDossiers,30);
assert.equal(live.status().externalRecords,5);
assert.ok(node.innerHTML.includes("Formation recovery by topic"));
assert.ok(node.innerHTML.includes('data-rr-dossier="CR-LIT-05"'));

const makeClick=({id,dossier,mode,back=false,home=false})=>({
  preventDefault(){},
  target:{closest:()=>({
    hasAttribute:key=>(back&&key==="data-rr-back")||(home&&key==="data-rr-home"),
    dataset:{rrId:id,rrDossier:dossier,rrMode:mode}
  })}
});
node.listeners.click(makeClick({dossier:"CR-LIT-05"}));
assert.ok(node.innerHTML.includes("CR-LIT-05"),"dossier title not rendered");
assert.ok(node.innerHTML.includes('data-rr-id="TLM026"'),"dossier's researched subquestions missing");
assert.ok(node.innerHTML.includes('data-rr-article="TLM026"'),"TLM subquestion is not assembled as a complete source-linked reading");
node.listeners.click(makeClick({back:true}));
node.listeners.click(makeClick({dossier:"CR-LIT-05"}));
assert.ok(node.innerHTML.includes('data-rr-canonical-synthesis="CR-LIT-05"'),"Canonical answer missing from dossier reading");
node.listeners.click(makeClick({back:true}));
for(const id of ["APOL-002","APOL-004","APOL-008","APOL-010","APOL-042","APOL-050","APOL-052","APOL-053","APOL-059","APOL-060",
                 "CR-ORG-09","CR-LIT-02","CR-LIT-03","CR-LIT-06","CR-LIT-07","CR-LIT-08","CR-LIT-09","CR-LIT-10","CR-LIT-11","CR-LIT-12"]){
  node.listeners.click(makeClick({dossier:id}));
  assert.ok(node.innerHTML.includes('data-rr-canonical-synthesis="'+id+'"'),id+" is missing the new canonical answer");
  for(const role of ["answer","documented_position","critical_response","traditional_catholic_argument"])
    assert.ok(node.innerHTML.includes('data-rr-synthesis-role="'+role+'"'),id+" missing argument role "+role);
  assert.ok(node.innerHTML.includes('https://'),id+" lacks hyperlinks to original texts");
  node.listeners.click(makeClick({back:true}));
}
node.listeners.click(makeClick({dossier:"CR-LIT-05"}));
assert.ok(node.innerHTML.includes('data-rr-synthesis-role="documented_position"'),"Original historical positions missing");
assert.ok(node.innerHTML.includes("https://www.vatican.va/"),"Original canonical synthesis hyperlink missing");
assert.ok(node.innerHTML.includes('class="rrArticleSection"'),"substantive source-bearing sections are missing");
assert.ok(node.innerHTML.includes('class="rrSources"'),"original paragraph links are not carried into dossier reading");
assert.ok(node.innerHTML.includes("The Traditional Mass is just nostalgia"),"existing authored argument has been replaced by an index-only shell");

node.listeners.click(makeClick({id:"TLM026"}));
assert.ok(node.innerHTML.includes("TLM026"),"research detail not rendered");
assert.ok(node.innerHTML.includes("BEN07")||node.innerHTML.includes("Benedict"),"linked original sources unavailable");
assert.ok(node.innerHTML.includes("https://www.vatican.va/"),"source URLs missing in detail");
node.listeners.click(makeClick({back:true}));
assert.ok(node.innerHTML.includes('data-rr-id="TLM026"'),"Back did not restore canonical dossier");
node.listeners.click(makeClick({back:true}));
assert.ok(node.innerHTML.includes('data-rr-dossier="CR-LIT-05"'),"Back did not restore dossier index");
for(const d of coverage.dossiers.filter(d=>d.research.length)){
  node.listeners.click(makeClick({dossier:d.id}));
  assert.ok(node.innerHTML.includes('data-rr-article="'+d.research[0].id+'"'),d.id+" lacks rendered source-linked article");
  for(const record of d.research)assert.ok(node.innerHTML.includes('data-rr-article="'+record.id+'"'),"Missing original source-based case "+record.id);
  assert.ok(node.innerHTML.includes('https://'),d.id+" lost paragraph source hyperlinks");
  node.listeners.click(makeClick({back:true}));
}
node.listeners.click(makeClick({mode:"records"}));
assert.ok(node.innerHTML.includes('data-rr-id="TLM026"'),"record search tab lost existing records");
node.listeners.click(makeClick({id:"TLM026"}));
node.listeners.click(makeClick({back:true}));
assert.ok(node.innerHTML.includes('data-rr-id="TLM026"'),"Back did not restore flat research list");
live.close();
assert.equal(live.status().open,false);

console.log(JSON.stringify({sourcePacks:packs.length,dossiers:coverage.dossiers.length,linkedDossiers:coverage.covered,linkedResearch:coverage.linked,externalResearch:coverage.external.length,rows:rows.length,qa:"INTERNAL_QUERY_FLAG_ONLY",publicFormationRoutesAdded:0,canonicalDossiers:owners.size,publicationCertified:false},null,2));
