import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APOSTOLATE_SKILLS } from "../src/apostolate/contracts.js";
import {
  SEXUAL_ETHICS_VERSION,
  SEXUAL_ETHICS_ROUTE,
  SEXUAL_ETHICS_RESEARCH_LEAD,
  CSE_QUESTIONS,
  CSE_QUESTION_MAP,
  CSE_SECTIONS,
  CSE_SOURCES,
  CSE_SOURCE_MAP,
  CSE_VALIDATION,
} from "../src/learn/sexual-ethics-data/index.js";
import {
  CSE_DEBATE_FIELDS,
  CSE_DEBATE_IDS,
  CSE_DEBATE_VALIDATION,
} from "../src/learn/sexual-ethics-data/debates.js";
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

assert.equal(SEXUAL_ETHICS_VERSION,"1.3.0");
assert.equal(SEXUAL_ETHICS_ROUTE,"learn.sexual_ethics");
assert.equal(SEXUAL_ETHICS_RESEARCH_LEAD,"LBM");
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_SECTIONS.length,15);
assert.equal(CSE_VALIDATION.ok,true,CSE_VALIDATION.errors.join("\n"));
assert.deepEqual(CSE_VALIDATION.depthCounts,{STANDARD:75,EXPANDED:20,DEBATE:55});

const ids=new Set();
for(const [index,item] of CSE_QUESTIONS.entries()){
  const n=index+1;
  const id=`CSE${String(n).padStart(3,"0")}`;
  assert.equal(item.id,id);
  assert.equal(ids.has(id),false,id);
  ids.add(id);
  assert.ok(item.q[0]&&item.q[1],`${id}: bilingual question`);
  assert.ok(item.a[0]&&item.a[1],`${id}: bilingual answer`);
  if(item.depth==="EXPANDED")assert.ok(item.d?.[0]&&item.d?.[1],`${id}: expanded explanation`);
  if(item.depth==="DEBATE"){
    assert.ok(item.debate,`${id}: structured debate`);
    for(const field of CSE_DEBATE_FIELDS){
      assert.ok(item.debate[field]?.[0]&&item.debate[field]?.[1],`${id}: debate field ${field}`);
    }
  }
  assert.ok(item.refs.length>0,`${id}: sources`);
  for(const [sourceId,locator] of item.refs){
    assert.ok(CSE_SOURCE_MAP[sourceId],`${id}: ${sourceId}`);
    assert.ok(locator,`${id}: source locator`);
  }
}
assert.equal(ids.size,150);
assert.equal(CSE_SOURCES.some(source=>source.id==="LBM"&&source.role==="argument_lead"),true);
assert.equal(CSE_SECTIONS.every(section=>CSE_QUESTIONS.filter(item=>item.section===section.id).length===10),true);

assert.equal(CSE_SOT_VERSION,"CSE_SOT_V3");
assert.equal(CSE_SOT_MATRIX.length,150);
assert.equal(CSE_SOT_AUDIT.records,150);
assert.equal(CSE_SOT_AUDIT.bilingual,true);
assert.equal(CSE_SOT_AUDIT.allHaveNonArgumentLeadAuthority,true);
assert.equal(CSE_SOT_AUDIT.debateHandoffs,55);
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

const thirdPartySex=CSE_QUESTIONS.find(item=>item.id==="CSE056");
assert.match(thirdPartySex.q[0],/threesomes|third person/i);
assert.equal(/sexual sacrilege/i.test(thirdPartySex.q[0]),false);
assert.ok(thirdPartySex.refs.some(([sourceId,locator])=>sourceId==="CASTI"&&locator.includes("72–73")));
const impairedConsent=CSE_QUESTIONS.find(item=>item.id==="CSE117");
assert.match(impairedConsent.q[0],/intoxicated|incapacitated/i);
assert.equal(impairedConsent.layer,"PASTORAL_CASE");

const communion=CSE_QUESTIONS.find(item=>item.id==="CSE139");
assert.ok(communion.refs.some(([sourceId,locator])=>sourceId==="CIC_EUCHARIST"&&locator==="can. 916"));

assert.ok(CSE_GAP_AUDIT.some(item=>item.topic==="Adultery / consensual non-monogamy"&&item.status==="COVERED"));
assert.ok(CSE_GAP_AUDIT.some(item=>item.topic==="Sexual sacrilege as a distinct species"&&item.status==="EXCLUDED_LOW_USER_VALUE"));
assert.ok(CSE_GAP_AUDIT.some(item=>item.topic==="Abortion and difficult pregnancy cases"&&item.status==="COVERED"));
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

const META_COMMENTARY_EN=/(?:the strongest objection|the serious objection|the classic objection|the traditional reply|the Catholic reply|the Catholic answer|this question should|this remains a case-analysis question|this is a case-analysis question|this is a prudential case question|this module|the module|the reusable method)/i;
const META_COMMENTARY_FR=/(?:l’objection la plus forte|l’objection sérieuse|l’objection classique|la réponse traditionnelle|la réponse catholique|cette question doit|cela reste une question d’analyse|c’est une question d’analyse|c’est une question prudentielle de cas|ce module|la méthode réutilisable)/i;
for(const item of CSE_QUESTIONS){
  for(const [label,text] of [
    ["detail-en",item.d?.[0]],
    ["detail-fr",item.d?.[1]],
    ["catholic-case-en",item.debate?.catholicCase?.[0]],
    ["catholic-case-fr",item.debate?.catholicCase?.[1]],
  ]){
    if(!text)continue;
    assert.doesNotMatch(text,META_COMMENTARY_EN,`${item.id} ${label}: user-facing commentary must state the argument, not narrate the editorial debate`);
    assert.doesNotMatch(text,META_COMMENTARY_FR,`${item.id} ${label}: le commentaire doit exposer l’argument, non commenter sa propre rédaction`);
  }
}


assert.equal(CSE_QUALITY_AUDIT_VERSION,"CSE_QUALITY_V4");
assert.equal(CSE_QUALITY_AUDIT.length,150);
assert.equal(CSE_QUALITY_SUMMARY.records,150);
assert.deepEqual(CSE_QUALITY_SUMMARY.dispositions,{KEEP:3,TIGHTEN:41,REWRITE:24,SOURCE_REPAIR:82});
assert.equal(CSE_QUALITY_SUMMARY.allReviewed,true);
assert.equal(CSE_QUALITY_SUMMARY.allClickable,true);
assert.equal(CSE_QUALITY_SUMMARY.allAuthoritativelyGrounded,true);
assert.equal(CSE_QUALITY_SUMMARY.debateRecords,55);
assert.equal(CSE_QUALITY_SUMMARY.debateWithNarrowSource,55);

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


assert.equal(CSE_DEBATE_VALIDATION.count,55);
assert.equal(CSE_DEBATE_VALIDATION.complete,true);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);

const q038=CSE_QUESTIONS.find(item=>item.id==="CSE038");
assert.match(q038.q[0],/looking at attractive/i);
assert.ok(q038.aliases.includes("checking out girls"));
assert.equal(q038.depth,"DEBATE");

const q039=CSE_QUESTIONS.find(item=>item.id==="CSE039");
assert.match(q039.q[0],/flirting/i);
assert.ok(q039.aliases.includes("emotional cheating"));

const q040=CSE_QUESTIONS.find(item=>item.id==="CSE040");
assert.match(q040.q[0],/oral sex, manual stimulation/i);
assert.ok(q040.aliases.includes("handjob before marriage"));
assert.equal(q040.depth,"DEBATE");

const q055=CSE_QUESTIONS.find(item=>item.id==="CSE055");
assert.match(q055.q[0],/sex toys/i);
assert.ok(q055.refs.some(([sourceId,locator])=>sourceId==="MCHUGH"&&locator==="§1624"));
assert.equal(q055.depth,"DEBATE");

const q058=CSE_QUESTIONS.find(item=>item.id==="CSE058");
assert.match(q058.q[0],/anal sex/i);
assert.match(q058.a[0],/not compatible|not be presented as clearly permitted/i);
assert.equal(q058.depth,"DEBATE");

const q123=CSE_QUESTIONS.find(item=>item.id==="CSE123");
const q124=CSE_QUESTIONS.find(item=>item.id==="CSE124");
const q125=CSE_QUESTIONS.find(item=>item.id==="CSE125");
assert.match(q123.q[0],/abortion/i);
assert.ok(q123.refs.some(([sourceId,locator])=>sourceId==="CASTI"&&locator==="§§63–66"));
assert.match(q124.q[0],/rape or incest/i);
assert.equal(q124.layer,"PASTORAL_CASE");
assert.match(q125.q[0],/mother’s life|mother's life/i);
assert.ok(q125.refs.some(([sourceId,locator])=>sourceId==="ABORTCLAR"));
assert.equal(q125.layer,"PASTORAL_CASE");

for(const id of ["CSE038","CSE039","CSE040","CSE055","CSE058","CSE112","CSE117","CSE123","CSE124","CSE125","CSE141","CSE142","CSE143","CSE145","CSE149"]){
  const item=CSE_QUESTION_MAP?.[id]||CSE_QUESTIONS.find(row=>row.id===id);
  assert.equal(item.depth,"DEBATE",`${id}: expected debate`);
  assert.ok(item.debate?.opposition?.[0]&&item.debate?.response?.[0]&&item.debate?.bottom?.[0],`${id}: debate payload`);
}

assert.ok(CSE_SOURCES.some(source=>source.id==="ABORT74"&&source.canonical_url));
assert.ok(CSE_SOURCES.some(source=>source.id==="ABORTCLAR"&&source.canonical_url));
assert.ok(CSE_SOURCES.some(source=>source.id==="MCHUGH"&&source.canonical_url));

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
assert.doesNotMatch(runtime,/Research architecture informed by Lawler · Boyle · May/,"research-method copy leaked back onto the learner landing");
assert.match(runtime,/ao-ui-back/);
assert.match(runtime,/ao-ui-close/);
assert.match(runtime,/Related topics/);
assert.match(runtime,/data-ao-cse-related/);
assert.match(runtime,/<a href="\$\{esc\(url\)\}" target="_blank" rel="noopener"><strong>\$\{esc\(citation\)\}<\/strong> ↗<\/a>/);
assert.match(runtime,/handoffToApostolate/);
assert.match(runtime,/FORMATION_TO_APOSTOLATE/);
assert.match(runtime,/The strongest objection/);
assert.match(runtime,/Where the argument breaks/);
assert.match(runtime,/The strongest comeback/);
assert.match(runtime,/Examine the argument/);
assert.match(runtime,/item\.aliases/);
assert.match(runtime,/Object\.values\(item\.debate\)/);

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
