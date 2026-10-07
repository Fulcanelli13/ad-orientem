import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APOSTOLATE_SKILLS } from "../src/apostolate/contracts.js";
import {
  SEXUAL_ETHICS_VERSION,
  SEXUAL_ETHICS_ROUTE,
  SEXUAL_ETHICS_RESEARCH_LEAD,
  CSE_QUESTIONS,
  CSE_SECTIONS,
  CSE_SOURCES,
  CSE_SOURCE_MAP,
  CSE_VALIDATION,
} from "../src/learn/sexual-ethics-data/index.js";
import {
  CSE_SOT_VERSION,
  CSE_SOT_MATRIX,
  CSE_SOT_AUDIT,
  CSE_GAP_AUDIT,
  relatedTargetsFor,
} from "../src/learn/sexual-ethics-data/sot.js";
import {
  CSE_QUALITY_AUDIT_VERSION,
  CSE_QUALITY_AUDIT,
  CSE_QUALITY_SUMMARY,
} from "../src/learn/sexual-ethics-data/quality-audit.js";

assert.equal(SEXUAL_ETHICS_VERSION,"1.2.0");
assert.equal(SEXUAL_ETHICS_ROUTE,"learn.sexual_ethics");
assert.equal(SEXUAL_ETHICS_RESEARCH_LEAD,"LBM");
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_SECTIONS.length,15);
assert.equal(CSE_VALIDATION.ok,true,CSE_VALIDATION.errors.join("\n"));
assert.deepEqual(CSE_VALIDATION.depthCounts,{STANDARD:100,EXPANDED:25,DEBATE:25});

const ids=new Set();
for(const [index,item] of CSE_QUESTIONS.entries()){
  const n=index+1;
  const id=`CSE${String(n).padStart(3,"0")}`;
  assert.equal(item.id,id);
  assert.equal(ids.has(id),false,id);
  ids.add(id);
  assert.ok(item.q[0]&&item.q[1],`${id}: bilingual question`);
  assert.ok(item.a[0]&&item.a[1],`${id}: bilingual answer`);
  if(item.depth!=="STANDARD")assert.ok(item.d?.[0]&&item.d?.[1],`${id}: deeper explanation`);
  assert.ok(item.refs.length>0,`${id}: sources`);
  for(const [sourceId,locator] of item.refs){
    assert.ok(CSE_SOURCE_MAP[sourceId],`${id}: ${sourceId}`);
    assert.ok(locator,`${id}: source locator`);
  }
}
assert.equal(ids.size,150);
assert.equal(CSE_SOURCES.some(source=>source.id==="LBM"&&source.role==="argument_lead"),true);
assert.equal(CSE_SECTIONS.every(section=>CSE_QUESTIONS.filter(item=>item.section===section.id).length===10),true);

assert.equal(CSE_SOT_VERSION,"CSE_SOT_V2");
assert.equal(CSE_SOT_MATRIX.length,150);
assert.equal(CSE_SOT_AUDIT.records,150);
assert.equal(CSE_SOT_AUDIT.bilingual,true);
assert.equal(CSE_SOT_AUDIT.allHaveNonArgumentLeadAuthority,true);
assert.equal(CSE_SOT_AUDIT.debateHandoffs,25);
assert.ok(APOSTOLATE_SKILLS.some(skill=>skill.id==="APF06"),"CSE Debate handoff target APF06 must exist");
assert.ok(CSE_SOT_AUDIT.recordsWithCrossLinks>0);
assert.ok(CSE_SOT_AUDIT.recordsWithNarrowCitation>0);

const conscience=CSE_QUESTIONS.find(item=>item.id==="CSE016");
assert.ok(conscience.refs.some(([sourceId,locator])=>sourceId==="ST19"&&locator==="aa.5–6"),"CSE016 must link Aquinas I-II q.19 directly");
assert.equal(conscience.refs.some(([sourceId,locator])=>sourceId==="ST18"&&/q\.19/.test(locator)),false);

const unilateralContraception=CSE_QUESTIONS.find(item=>item.id==="CSE070");
assert.equal(unilateralContraception.layer,"PASTORAL_CASE");
assert.ok(unilateralContraception.refs.some(([sourceId,locator])=>sourceId==="CASTI"&&locator==="§59"));
assert.ok(unilateralContraception.cross.includes("pray.confession"));
assert.ok(unilateralContraception.cross.includes("learn.rites.matrimony"));

const adultery=CSE_QUESTIONS.find(item=>item.id==="CSE056");
assert.match(adultery.q[0],/open marriage/i);
assert.equal(/sexual sacrilege/i.test(adultery.q[0]),false);
assert.ok(adultery.refs.some(([sourceId,locator])=>sourceId==="CASTI"&&locator==="§§72–73"));
const impairedConsent=CSE_QUESTIONS.find(item=>item.id==="CSE117");
assert.match(impairedConsent.q[0],/intoxicated|incapacitated/i);
assert.equal(impairedConsent.layer,"PASTORAL_CASE");

const communion=CSE_QUESTIONS.find(item=>item.id==="CSE139");
assert.ok(communion.refs.some(([sourceId,locator])=>sourceId==="CIC_EUCHARIST"&&locator==="can. 916"));

assert.ok(CSE_GAP_AUDIT.some(item=>item.topic==="Adultery / consensual non-monogamy"&&item.status==="COVERED"));
assert.ok(CSE_GAP_AUDIT.some(item=>item.topic==="Sexual sacrilege as a distinct species"&&item.status==="EXCLUDED_LOW_USER_VALUE"));
assert.ok(relatedTargetsFor(CSE_QUESTIONS.find(item=>item.id==="CSE049")).some(target=>target.id==="learn.rites.matrimony"));
assert.ok(relatedTargetsFor(CSE_QUESTIONS.find(item=>item.id==="CSE137")).some(target=>target.id==="pray.confession"));

const q014=CSE_QUESTIONS.find(item=>item.id==="CSE014");
assert.match(q014.a[0],/Christ condemns adultery and lust/i);
assert.match(q014.a[0],/Pius XI in 1930/i);
assert.ok(q014.refs.some(([sourceId,locator])=>sourceId==="CASTI"&&locator.includes("53–59")));
assert.ok(q014.refs.some(([sourceId,locator])=>sourceId==="TRENT6"&&/adultery and fornication/i.test(locator)));

const publicQuestionFiles=[
  readFileSync("src/learn/sexual-ethics-data/questions-001-050.js","utf8"),
  readFileSync("src/learn/sexual-ethics-data/questions-051-100.js","utf8"),
  readFileSync("src/learn/sexual-ethics-data/questions-101-150.js","utf8"),
].join("\n");
assert.doesNotMatch(publicQuestionFiles,/Ad Orientem/);
assert.equal(CSE_SOURCES.every(source=>Boolean(source.canonical_url)),true,"Every displayed citation source must have a hyperlink destination");


assert.equal(CSE_QUALITY_AUDIT_VERSION,"CSE_QUALITY_V3");
assert.equal(CSE_QUALITY_AUDIT.length,150);
assert.equal(CSE_QUALITY_SUMMARY.records,150);
assert.deepEqual(CSE_QUALITY_SUMMARY.dispositions,{KEEP:3,TIGHTEN:41,REWRITE:15,SOURCE_REPAIR:91});
assert.equal(CSE_QUALITY_SUMMARY.allReviewed,true);
assert.equal(CSE_QUALITY_SUMMARY.allClickable,true);
assert.equal(CSE_QUALITY_SUMMARY.allAuthoritativelyGrounded,true);
assert.equal(CSE_QUALITY_SUMMARY.debateRecords,25);
assert.equal(CSE_QUALITY_SUMMARY.debateWithNarrowSource,25);

const q013=CSE_QUESTIONS.find(item=>item.id==="CSE013");
assert.match(q013.a[0],/1 Corinthians 6/);
assert.match(q013.a[0],/Romans 1/);
const q018=CSE_QUESTIONS.find(item=>item.id==="CSE018");
assert.match(q018.a[0],/what authority the disputed teaching has/i);
const q029=CSE_QUESTIONS.find(item=>item.id==="CSE029");
assert.match(q029.a[0],/not by definition/i);
assert.match(q029.a[0],/sexual activity is a psychological necessity/i);
const q035=CSE_QUESTIONS.find(item=>item.id==="CSE035");
assert.equal(q035.layer,"PASTORAL_CASE");
assert.match(q035.a[0],/not itself fornication/i);
const q051=CSE_QUESTIONS.find(item=>item.id==="CSE051");
assert.ok(q051.refs.some(([sourceId,locator])=>sourceId==="CASTI"&&locator==="§§19–20"));
const q057=CSE_QUESTIONS.find(item=>item.id==="CSE057");
assert.match(q057.a[0],/integrated into the marital act/i);
const q076=CSE_QUESTIONS.find(item=>item.id==="CSE076");
assert.equal(q076.layer,"PASTORAL_CASE");
assert.match(q076.a[0],/Church has not issued a specific ruling/i);
const q089=CSE_QUESTIONS.find(item=>item.id==="CSE089");
assert.ok(q089.refs.some(([sourceId,locator])=>sourceId==="CDF2003"&&locator==="§§2–4, 6–8"));
const q100=CSE_QUESTIONS.find(item=>item.id==="CSE100");
assert.match(q100.a[0],/find out what the child actually means/i);
const q108=CSE_QUESTIONS.find(item=>item.id==="CSE108");
assert.match(q108.a[0],/does not make every collection method legitimate/i);
const q128=CSE_QUESTIONS.find(item=>item.id==="CSE128");
assert.equal(q128.layer,"PASTORAL_CASE");
const q139=CSE_QUESTIONS.find(item=>item.id==="CSE139");
assert.match(q139.a[0],/Canon 916 gives a narrow exception/i);
const q141=CSE_QUESTIONS.find(item=>item.id==="CSE141");
assert.match(q141.a[0],/It should not be/i);
const q143=CSE_QUESTIONS.find(item=>item.id==="CSE143");
assert.match(q143.a[0],/guilt and shame are not the same thing/i);
const q149=CSE_QUESTIONS.find(item=>item.id==="CSE149");
assert.match(q149.a[0],/false factual premise must be corrected/i);

const presentation=readFileSync("src/learn/presentation.js","utf8");
const owner=readFileSync("src/learn/browser-entry.js","utf8");
const runtime=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.doesNotMatch(runtime,/Related in Ad Orientem|À voir aussi dans Ad Orientem/);
assert.match(presentation,/id:"learn\.sexual_ethics"/);
assert.match(owner,/installSexualEthicsModule/);
assert.match(owner,/ensureSexualEthicsRegistry/);
assert.match(owner,/AO_SEXUAL_ETHICS_V1/);
assert.match(runtime,/Search all 150 questions/);
assert.match(runtime,/Sources & provenance/);
assert.match(runtime,/Lawler · Boyle · May/);
assert.match(runtime,/Related topics/);
assert.match(runtime,/data-ao-cse-related/);
assert.match(runtime,/<a href="\$\{esc\(url\)\}" target="_blank" rel="noopener"><strong>\$\{esc\(citation\)\}<\/strong> ↗<\/a>/);
assert.match(runtime,/handoffToApostolate/);
assert.match(runtime,/FORMATION_TO_APOSTOLATE/);

console.log(JSON.stringify({
  version:SEXUAL_ETHICS_VERSION,
  route:SEXUAL_ETHICS_ROUTE,
  questions:CSE_QUESTIONS.length,
  sections:CSE_SECTIONS.length,
  sources:CSE_SOURCES.length,
  depth:CSE_VALIDATION.depthCounts,
  bilingual:true,
  sot:CSE_SOT_VERSION,
  sotCrossLinks:CSE_SOT_AUDIT.recordsWithCrossLinks,
  qualityAudit:CSE_QUALITY_AUDIT_VERSION,
  qualityDispositions:CSE_QUALITY_SUMMARY.dispositions,
  validation:"PASS",
},null,2));
