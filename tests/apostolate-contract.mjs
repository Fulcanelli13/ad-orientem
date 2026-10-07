import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  APOSTOLATE_CLAIM_CLASSES,
  APOSTOLATE_ENGINES,
  APOSTOLATE_HANDOFF_DIRECTIONS,
  APOSTOLATE_OWNER,
  APOSTOLATE_OWNERSHIP_BOUNDARIES,
  APOSTOLATE_SCENARIO_FAMILIES,
  APOSTOLATE_SCENARIO_IDS,
  APOSTOLATE_SKILLS,
  APOSTOLATE_SOT_VERSION,
  APOSTOLATE_SOURCE_STRENGTHS,
  APOSTOLATE_TEACHING_STEPS,
  APOSTOLATE_ONRAMP_STEPS,
  engineForScenarioId,
  makeApostolateHandoff,
  makeApostolateScenario,
} from "../src/apostolate/contracts.js";
import { createApostolateScenarioEngine } from "../src/apostolate/engine.js";
import { createApostolateOwner, installApostolateOwner } from "../src/apostolate/browser-entry.js";
import { APOSTOLATE_AQ_CORPUS_VERSION, APOSTOLATE_AQ_SCENARIOS } from "../src/apostolate/corpus.js";
import { APOSTOLATE_HS_CORPUS_VERSION, APOSTOLATE_HS_SCENARIOS } from "../src/apostolate/hs-corpus.js";
import { APOSTOLATE_FH_CORPUS_VERSION, APOSTOLATE_FH_SCENARIOS } from "../src/apostolate/fh-corpus.js";
import { APOSTOLATE_TF_CORPUS_VERSION, APOSTOLATE_TF_SCENARIOS } from "../src/apostolate/tf-corpus.js";
import { APOSTOLATE_DV_CORPUS_VERSION, APOSTOLATE_DV_SCENARIOS } from "../src/apostolate/dv-corpus.js";
import {
  APOSTOLATE_SOURCE_REGISTRY_VERSION,
  APOSTOLATE_SOURCES,
  unresolvedApostolateSourceIds,
} from "../src/apostolate/source-registry.js";
import { APP_SURFACES, APP_ROUTE_SURFACES, normalizeAppSurface } from "../src/app/contracts.js";

assert.equal(APOSTOLATE_SOT_VERSION,"APOSTOLATE_SOT_V1");
assert.equal(APOSTOLATE_OWNER,"AO_APOSTOLATE_APP_V1");
assert.deepEqual(APOSTOLATE_SCENARIO_FAMILIES.map(x=>[x.prefix,x.count,x.engine]),[
  ["AQ",8,APOSTOLATE_ENGINES.ANSWER],
  ["HS",7,APOSTOLATE_ENGINES.HELP],
  ["FH",8,APOSTOLATE_ENGINES.HELP],
  ["TF",5,APOSTOLATE_ENGINES.INTRODUCE],
  ["DV",5,APOSTOLATE_ENGINES.INTRODUCE],
  ["WC",3,APOSTOLATE_ENGINES.INTRODUCE],
]);
assert.equal(APOSTOLATE_SCENARIO_IDS.length,36);
assert.equal(new Set(APOSTOLATE_SCENARIO_IDS).size,36);
assert.deepEqual(APOSTOLATE_SCENARIO_IDS.slice(0,8),["AQ01","AQ02","AQ03","AQ04","AQ05","AQ06","AQ07","AQ08"]);
assert.deepEqual(APOSTOLATE_SCENARIO_IDS.slice(-3),["WC01","WC02","WC03"]);
assert.equal(APOSTOLATE_SKILLS.length,9);
assert.deepEqual(APOSTOLATE_SKILLS.map(x=>x.id),["APF01","APF02","APF03","APF04","APF05","APF06","APF07","APF08","APF09"]);
assert.deepEqual(APOSTOLATE_CLAIM_CLASSES,["D","N","T","H","S","P","C"]);
assert.deepEqual(APOSTOLATE_SOURCE_STRENGTHS,["PRIMARY","PRIMARY_PLUS_CATECHETICAL","MIXED_VERIFIED"]);
assert.deepEqual(APOSTOLATE_TEACHING_STEPS,["understand","minimum","prepare","launch","followUp"]);
assert.deepEqual(APOSTOLATE_ONRAMP_STEPS,["minimum","anxiety","boundary","handoff"]);

assert.equal(engineForScenarioId("AQ03"),APOSTOLATE_ENGINES.ANSWER);
assert.equal(engineForScenarioId("HS01"),APOSTOLATE_ENGINES.HELP);
assert.equal(engineForScenarioId("FH08"),APOSTOLATE_ENGINES.HELP);
assert.equal(engineForScenarioId("TF05"),APOSTOLATE_ENGINES.INTRODUCE);
assert.equal(engineForScenarioId("DV02"),APOSTOLATE_ENGINES.INTRODUCE);
assert.equal(engineForScenarioId("WC03"),APOSTOLATE_ENGINES.INTRODUCE);
assert.equal(engineForScenarioId("NOPE"),null);

const baseReady={
  id:"AQ01",
  publication:"READY",
  claimClass:"D",
  title:{en:"Title",fr:"Titre"},
  text:{en:"English",fr:"Français"},
  explanation:{en:"Explanation",fr:"Explication"},
  avoid:{en:["Avoid"],fr:["Éviter"]},
  apfSkills:["APF04"],
  sourceIds:["SRC-1"],
  handoffs:[{targetId:"learn.catechism"}],
};

assert.throws(()=>makeApostolateScenario({...baseReady,sourceIds:[]}),/source IDs/);
assert.throws(()=>makeApostolateScenario({...baseReady,title:{en:"Title"}}),/titles/);
assert.throws(()=>makeApostolateScenario({...baseReady,text:{en:"English"}}),/English and French text/);
assert.throws(()=>makeApostolateScenario({...baseReady,explanation:{en:"Explanation"}}),/explanations/);
assert.throws(()=>makeApostolateScenario({...baseReady,avoid:{en:["Avoid"],fr:[]}}),/avoidances/);
assert.throws(()=>makeApostolateScenario({...baseReady,apfSkills:["APF99"]}),/APF skills/);
assert.throws(()=>makeApostolateScenario({...baseReady,handoffs:[]}),/handoff/);

const ready=makeApostolateScenario(baseReady);
assert.equal(ready.engine,APOSTOLATE_ENGINES.ANSWER);

const engine=createApostolateScenarioEngine([ready]);
assert.equal(engine.answer.resolve("AQ01").ok,true);
assert.equal(engine.help.resolve("AQ01").reason,"WRONG_ENGINE");
assert.equal(engine.resolve("AQ02").reason,"RESEARCH_ONLY");
assert.equal(engine.resolve("ZZ99").reason,"UNKNOWN_SCENARIO");
assert.deepEqual(engine.status(),{scenarioCount:36,registeredCount:1,publishedCount:1,researchOnlyCount:35});

assert.equal(APOSTOLATE_HS_CORPUS_VERSION,"APOSTOLATE_HS_CORPUS_V1");
assert.equal(APOSTOLATE_HS_SCENARIOS.length,7);
assert.deepEqual(APOSTOLATE_HS_SCENARIOS.map(x=>x.id),["HS01","HS02","HS03","HS04","HS05","HS06","HS07"]);
assert.deepEqual(APOSTOLATE_HS_SCENARIOS.map(x=>x.publication),Array(7).fill("READY"));

const expectedHsTitles=[
  "I want to come back to Mass. Where do I start?",
  "I haven’t been to Confession in years. What do I do?",
  "I think I want to become Catholic. What should I do?",
  "I don’t really know how to pray.",
  "Someone has died. What can I do?",
  "Someone is seriously ill or dying. What should I do?",
  "Bad Catholics or bad clergy have made me distrust the Church.",
];
assert.deepEqual(APOSTOLATE_HS_SCENARIOS.map(x=>x.title.en),expectedHsTitles);

for(const scenario of APOSTOLATE_HS_SCENARIOS){
  const normalized=makeApostolateScenario(scenario);
  assert.equal(normalized.publication,"READY",scenario.id+" failed READY normalization");
  assert.ok(normalized.title.en&&normalized.title.fr,scenario.id+" lost bilingual title");
  assert.ok(normalized.text.en&&normalized.text.fr,scenario.id+" lost bilingual short answer");
  assert.ok(normalized.explanation.en&&normalized.explanation.fr,scenario.id+" lost bilingual explanation");
  assert.ok(normalized.avoid.en.length&&normalized.avoid.fr.length,scenario.id+" lost bilingual avoidances");
  assert.ok(normalized.apfSkills.length,scenario.id+" has no APF skill mapping");
  assert.deepEqual(unresolvedApostolateSourceIds(normalized.sourceIds),[],scenario.id+" contains unresolved source IDs");
  assert.ok(normalized.handoffs.some(h=>h.targetId?.startsWith("learn.")),scenario.id+" lacks canonical Formation handoff");
}
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS01").text.en,/do not have to receive Communion/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS02").avoid.en.join(" "),/type out grave sins/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS03").avoid.en.join(" "),/pseudo-catechumenate/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS04").text.en,/Our Father/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS05").avoid.en.join(" "),/certainly in Heaven/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS06").text.en,/contact a priest immediately/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS06").avoid.en.join(" "),/medical diagnosis/i);
assert.match(APOSTOLATE_HS_SCENARIOS.find(x=>x.id==="HS07").avoid.en.join(" "),/denying or minimizing actual wrongdoing/i);

const hsEngine=createApostolateScenarioEngine(APOSTOLATE_HS_SCENARIOS);
assert.deepEqual(hsEngine.status(),{scenarioCount:36,registeredCount:7,publishedCount:7,researchOnlyCount:29});
for(const id of ["HS01","HS02","HS03","HS04","HS05","HS06","HS07"])assert.equal(hsEngine.help.resolve(id).ok,true,id+" is not internally publishable");
assert.equal(hsEngine.resolve("FH01").reason,"RESEARCH_ONLY","A5 accidentally promoted family-help content");

assert.equal(APOSTOLATE_FH_CORPUS_VERSION,"APOSTOLATE_FH_CORPUS_V1");
assert.equal(APOSTOLATE_FH_SCENARIOS.length,8);
assert.deepEqual(APOSTOLATE_FH_SCENARIOS.map(x=>x.id),["FH01","FH02","FH03","FH04","FH05","FH06","FH07","FH08"]);
assert.deepEqual(APOSTOLATE_FH_SCENARIOS.map(x=>x.publication),Array(8).fill("READY"));

const expectedFhTitles=[
  "How do I start a family Rosary?",
  "How do we begin saying grace at meals?",
  "How do we establish morning and evening prayer at home?",
  "How do I teach children their basic prayers?",
  "How do I prepare a child for First Confession and First Communion?",
  "What is a godparent actually supposed to do?",
  "What should a Confirmation sponsor actually do?",
  "How can a family begin devotion to the Sacred Heart?",
];
assert.deepEqual(APOSTOLATE_FH_SCENARIOS.map(x=>x.title.en),expectedFhTitles);

for(const scenario of APOSTOLATE_FH_SCENARIOS){
  const normalized=makeApostolateScenario(scenario);
  assert.equal(normalized.publication,"READY",scenario.id+" failed READY normalization");
  assert.ok(normalized.title.en&&normalized.title.fr,scenario.id+" lost bilingual title");
  assert.ok(normalized.text.en&&normalized.text.fr,scenario.id+" lost bilingual short answer");
  assert.ok(normalized.explanation.en&&normalized.explanation.fr,scenario.id+" lost bilingual explanation");
  assert.ok(normalized.avoid.en.length&&normalized.avoid.fr.length,scenario.id+" lost bilingual avoidances");
  assert.ok(normalized.apfSkills.length,scenario.id+" has no APF skill mapping");
  assert.deepEqual(unresolvedApostolateSourceIds(normalized.sourceIds),[],scenario.id+" contains unresolved source IDs");
  assert.ok(normalized.handoffs.some(h=>h.targetId?.startsWith("learn.")),scenario.id+" lacks canonical Formation handoff");
}
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH01").explanation.en,/Pius XII/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH02").text.en,/traditional grace before meals/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH03").avoid.en.join(" "),/long devotional rule/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH04").text.en,/Sign of the Cross/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH05").avoid.en.join(" "),/certify a child/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH06").text.en,/not merely an honorary guest/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH07").text.en,/witness of Christ/i);
assert.match(APOSTOLATE_FH_SCENARIOS.find(x=>x.id==="FH08").avoid.en.join(" "),/private enthronement ceremony/i);

const fhEngine=createApostolateScenarioEngine(APOSTOLATE_FH_SCENARIOS);
assert.deepEqual(fhEngine.status(),{scenarioCount:36,registeredCount:8,publishedCount:8,researchOnlyCount:28});
for(const id of ["FH01","FH02","FH03","FH04","FH05","FH06","FH07","FH08"])assert.equal(fhEngine.help.resolve(id).ok,true,id+" is not internally publishable");
assert.equal(fhEngine.resolve("TF01").reason,"RESEARCH_ONLY","A6 accidentally promoted traditional-faith introduction content");

assert.equal(APOSTOLATE_TF_CORPUS_VERSION,"APOSTOLATE_TF_CORPUS_V1");
assert.equal(APOSTOLATE_TF_SCENARIOS.length,5);
assert.deepEqual(APOSTOLATE_TF_SCENARIOS.map(x=>x.id),["TF01","TF02","TF03","TF04","TF05"]);
assert.deepEqual(APOSTOLATE_TF_SCENARIOS.map(x=>x.publication),Array(5).fill("READY"));

const expectedTfTitles=[
  "How do I explain a Catechism answer to a child?",
  "How do I explain Catholic doctrine to an adult who is new to it?",
  "What should I do when I don’t know the answer?",
  "How do I teach someone to pray the Rosary?",
  "How do I explain the traditional Mass to a newcomer?",
];
assert.deepEqual(APOSTOLATE_TF_SCENARIOS.map(x=>x.title.en),expectedTfTitles);

for(const scenario of APOSTOLATE_TF_SCENARIOS){
  const normalized=makeApostolateScenario(scenario);
  assert.equal(normalized.publication,"READY",scenario.id+" failed READY normalization");
  assert.ok(normalized.doctrineRefs.length,scenario.id+" lost doctrineRefs");
  assert.ok(APOSTOLATE_SOURCE_STRENGTHS.includes(normalized.sourceStrength),scenario.id+" has invalid sourceStrength");
  for(const step of APOSTOLATE_TEACHING_STEPS){
    assert.ok(normalized.teaching[step]?.en&&normalized.teaching[step]?.fr,scenario.id+" lost bilingual teaching step "+step);
  }
  assert.deepEqual(unresolvedApostolateSourceIds(normalized.sourceIds),[],scenario.id+" contains unresolved source IDs");
}
assert.match(APOSTOLATE_TF_SCENARIOS.find(x=>x.id==="TF01").explanation.en,/St Pius X/i);
assert.match(APOSTOLATE_TF_SCENARIOS.find(x=>x.id==="TF02").teaching.understand.en,/doctrine, reason, objection/i);
assert.match(APOSTOLATE_TF_SCENARIOS.find(x=>x.id==="TF03").avoid.en.join(" "),/Do not bluff/i);
assert.match(APOSTOLATE_TF_SCENARIOS.find(x=>x.id==="TF04").handoffs[0].targetId,/pray\.rosary/);
assert.match(APOSTOLATE_TF_SCENARIOS.find(x=>x.id==="TF05").handoffs.map(x=>x.targetId).join(" "),/learn\.mass/);
assert.match(APOSTOLATE_TF_SCENARIOS.find(x=>x.id==="TF05").handoffs.map(x=>x.targetId).join(" "),/mass/);

const tfEngine=createApostolateScenarioEngine(APOSTOLATE_TF_SCENARIOS);
assert.deepEqual(tfEngine.status(),{scenarioCount:36,registeredCount:5,publishedCount:5,researchOnlyCount:31});
for(const id of ["TF01","TF02","TF03","TF04","TF05"])assert.equal(tfEngine.introduce.resolve(id).ok,true,id+" is not internally publishable");
assert.equal(tfEngine.resolve("DV01").reason,"RESEARCH_ONLY","A7 accidentally promoted devotional-introduction content");

const tfBase={...baseReady,id:"TF01",doctrineRefs:["learn.catechism"],sourceStrength:"PRIMARY",teaching:{
  understand:{en:"u",fr:"u"},minimum:{en:"m",fr:"m"},prepare:{en:"p",fr:"p"},launch:{en:"l",fr:"l"},followUp:{en:"f",fr:"f"}
}};
assert.throws(()=>makeApostolateScenario({...tfBase,doctrineRefs:[]}),/doctrineRefs/);
assert.throws(()=>makeApostolateScenario({...tfBase,sourceStrength:"WEAK"}),/sourceStrength/);
assert.throws(()=>makeApostolateScenario({...tfBase,teaching:{...tfBase.teaching,launch:{en:"l"}}}),/INTRODUCE teaching steps/);

assert.equal(APOSTOLATE_DV_CORPUS_VERSION,"APOSTOLATE_DV_CORPUS_V1");
assert.equal(APOSTOLATE_DV_SCENARIOS.length,5);
assert.deepEqual(APOSTOLATE_DV_SCENARIOS.map(x=>x.id),["DV01","DV02","DV03","DV04","DV05"]);
assert.deepEqual(APOSTOLATE_DV_SCENARIOS.map(x=>x.publication),Array(5).fill("READY"));

const expectedDvTitles=[
  "Bring someone to the traditional Mass for the first time",
  "Help somebody approach Confession for the first time",
  "Introduce someone to Eucharistic Adoration or Benediction",
  "Help someone begin a novena",
  "Introduce someone to First Friday / Sacred Heart devotion",
];
assert.deepEqual(APOSTOLATE_DV_SCENARIOS.map(x=>x.title.en),expectedDvTitles);

for(const scenario of APOSTOLATE_DV_SCENARIOS){
  const normalized=makeApostolateScenario(scenario);
  assert.equal(normalized.publication,"READY",scenario.id+" failed READY normalization");
  assert.ok(APOSTOLATE_SOURCE_STRENGTHS.includes(normalized.sourceStrength),scenario.id+" has invalid sourceStrength");
  for(const step of APOSTOLATE_ONRAMP_STEPS){
    assert.ok(normalized.onRamp[step]?.en&&normalized.onRamp[step]?.fr,scenario.id+" lost bilingual on-ramp step "+step);
  }
  assert.deepEqual(unresolvedApostolateSourceIds(normalized.sourceIds),[],scenario.id+" contains unresolved source IDs");
}
assert.match(APOSTOLATE_DV_SCENARIOS.find(x=>x.id==="DV01").avoid.en.join(" "),/receive Holy Communion/i);
assert.match(APOSTOLATE_DV_SCENARIOS.find(x=>x.id==="DV02").onRamp.boundary.en,/priest/i);
assert.match(APOSTOLATE_DV_SCENARIOS.find(x=>x.id==="DV03").handoffs.map(x=>x.targetId).join(" "),/pray\.benediction/);
assert.match(APOSTOLATE_DV_SCENARIOS.find(x=>x.id==="DV04").avoid.en.join(" "),/guarantees the requested favour/i);
assert.match(APOSTOLATE_DV_SCENARIOS.find(x=>x.id==="DV05").avoid.en.join(" "),/mechanical guarantee of salvation/i);

const dvEngine=createApostolateScenarioEngine(APOSTOLATE_DV_SCENARIOS);
assert.deepEqual(dvEngine.status(),{scenarioCount:36,registeredCount:5,publishedCount:5,researchOnlyCount:31});
for(const id of ["DV01","DV02","DV03","DV04","DV05"])assert.equal(dvEngine.introduce.resolve(id).ok,true,id+" is not internally publishable");
assert.equal(dvEngine.resolve("WC01").reason,"RESEARCH_ONLY","A8 accidentally promoted WC content");

const dvBase={...baseReady,id:"DV01",sourceStrength:"PRIMARY",onRamp:{
  minimum:{en:"m",fr:"m"},anxiety:{en:"a",fr:"a"},boundary:{en:"b",fr:"b"},handoff:{en:"h",fr:"h"}
}};
assert.throws(()=>makeApostolateScenario({...dvBase,sourceStrength:"WEAK"}),/sourceStrength/);
assert.throws(()=>makeApostolateScenario({...dvBase,onRamp:{...dvBase.onRamp,boundary:{en:"b"}}}),/bilingual on-ramp steps/);

assert.equal(APOSTOLATE_AQ_CORPUS_VERSION,"APOSTOLATE_AQ_CORPUS_V1");
assert.equal(APOSTOLATE_SOURCE_REGISTRY_VERSION,"APOSTOLATE_SOURCE_REGISTRY_V1");
assert.equal(APOSTOLATE_AQ_SCENARIOS.length,8);
assert.deepEqual(APOSTOLATE_AQ_SCENARIOS.map(x=>x.id),["AQ01","AQ02","AQ03","AQ04","AQ05","AQ06","AQ07","AQ08"]);
assert.deepEqual(APOSTOLATE_AQ_SCENARIOS.map(x=>x.publication),Array(8).fill("READY"));
assert.deepEqual(APOSTOLATE_AQ_SCENARIOS.map(x=>x.engine),Array(8).fill(undefined),"raw corpus must not duplicate derived engine ownership");

const expectedTitles=[
  "Why do Catholics pray to Mary and the saints?",
  "Why confess sins to a priest? Why not just tell God?",
  "Why do Catholics obey the Pope? Is he infallible about everything?",
  "Doesn’t the Mass sacrifice Jesus again?",
  "How can Catholics believe bread really becomes Jesus?",
  "Why Latin? And why the traditional Mass?",
  "Why Purgatory? Didn’t Jesus already pay for our sins?",
  "Why isn’t the Bible alone enough?",
];
assert.deepEqual(APOSTOLATE_AQ_SCENARIOS.map(x=>x.title.en),expectedTitles);

for(const scenario of APOSTOLATE_AQ_SCENARIOS){
  const normalized=makeApostolateScenario(scenario);
  assert.equal(normalized.publication,"READY",scenario.id+" failed READY normalization");
  assert.ok(normalized.title.en&&normalized.title.fr,scenario.id+" lost bilingual title");
  assert.ok(normalized.text.en&&normalized.text.fr,scenario.id+" lost bilingual short answer");
  assert.ok(normalized.explanation.en&&normalized.explanation.fr,scenario.id+" lost bilingual explanation");
  assert.ok(normalized.avoid.en.length&&normalized.avoid.fr.length,scenario.id+" lost bilingual avoidances");
  assert.ok(normalized.apfSkills.length,scenario.id+" has no APF skill mapping");
  assert.ok(normalized.sourceIds.length,scenario.id+" has no source references");
  assert.deepEqual(unresolvedApostolateSourceIds(normalized.sourceIds),[],scenario.id+" contains unresolved source IDs");
  assert.ok(normalized.handoffs.some(h=>h.targetId?.startsWith("learn.")),scenario.id+" lacks canonical Formation deepening handoff");
}
assert.ok(Object.keys(APOSTOLATE_SOURCES).length>=10,"A4 source registry unexpectedly collapsed");
for(const source of Object.values(APOSTOLATE_SOURCES)){
  assert.equal(source.id.length>0,true);
  assert.match(source.url,/^https:\/\//,source.id+" source URL is not absolute HTTPS");
  assert.ok(source.locator?.length>0,source.id+" lacks a precise locator");
  assert.ok(source.authority?.length>0,source.id+" lacks authority classification");
}

const aqEngine=createApostolateScenarioEngine(APOSTOLATE_AQ_SCENARIOS);
assert.deepEqual(aqEngine.status(),{scenarioCount:36,registeredCount:8,publishedCount:8,researchOnlyCount:28});
for(const id of ["AQ01","AQ02","AQ03","AQ04","AQ05","AQ06","AQ07","AQ08"])assert.equal(aqEngine.answer.resolve(id).ok,true,id+" is not internally publishable");
assert.equal(aqEngine.resolve("HS01").reason,"RESEARCH_ONLY","A4 accidentally promoted unrecovered accompaniment content");

const toFormation=makeApostolateHandoff({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId:"AQ01",
  targetId:"learn.catechism",
  reason:"Deepen the doctrinal answer",
});
assert.equal(toFormation.sourceSurface,"apostolate");
assert.equal(toFormation.targetSurface,"learn");
assert.throws(()=>makeApostolateHandoff({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId:"AQ01",targetId:"formation.catechism",reason:"bad namespace",
}),/learn\.\*/);

const toApostolate=makeApostolateHandoff({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.FORMATION_TO_APOSTOLATE,
  fromId:"learn.catechism",
  targetId:"AQ01",
  reason:"Practise answering",
});
assert.equal(toApostolate.sourceSurface,"learn");
assert.equal(toApostolate.targetSurface,"apostolate");

assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.CONFESSION,{owner:"pray",target:"pray.confession"});
assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.ANOINTING_VIATICUM,{owner:"formation",target:"learn.rites.sick"});
assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.FIRST_COMMUNION,{owner:"formation",target:"learn.rites.first_communion"});
assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.NOVENAS,{owner:"pray",target:"pray.novenas"});
assert.equal(APOSTOLATE_OWNERSHIP_BOUNDARIES.MASS.owner,"mass");
assert.equal(APOSTOLATE_OWNERSHIP_BOUNDARIES.RECEPTION.owner,"formation");

assert.equal(APP_SURFACES.includes("apostolate"),false,"A3 exposed Apostolate in the permanent ribbon");
assert.equal(APP_ROUTE_SURFACES.includes("apostolate"),false,"A3 made Apostolate a normal app route");
assert.equal(normalizeAppSurface("apostolate"),null,"A3 made Apostolate navigable through the app shell");

const doc={
  documentElement:{dataset:{}},
  querySelector(selector){
    if(selector.includes("apostolate"))return null;
    return null;
  },
};
const win={document:doc};
const owner=createApostolateOwner(win,{scenarios:[...APOSTOLATE_AQ_SCENARIOS,...APOSTOLATE_HS_SCENARIOS,...APOSTOLATE_FH_SCENARIOS,...APOSTOLATE_TF_SCENARIOS,...APOSTOLATE_DV_SCENARIOS]});
assert.equal(owner.owner,"AO_APOSTOLATE_APP_V1");
assert.equal(owner.status().installed,true);
assert.equal(owner.status().hidden,true);
assert.equal(owner.status().visible,false);
assert.equal(owner.status().mounted,false);
assert.equal(owner.status().ribbonExposed,false);
assert.equal(owner.status().publishedCount,33);
assert.equal(owner.status().researchOnlyCount,3);
assert.deepEqual(owner.status().readyFamilies,["AQ","HS","FH","TF","DV"]);
assert.equal(owner.engines.answer.resolve("AQ01").ok,true);
assert.equal(owner.engines.answer.resolve("AQ08").ok,true);
assert.equal(owner.engines.help.resolve("HS01").ok,true);
assert.equal(owner.engines.help.resolve("HS07").ok,true);
assert.equal(owner.engines.help.resolve("FH01").ok,true);
assert.equal(owner.engines.help.resolve("FH08").ok,true);
assert.equal(owner.engines.introduce.resolve("TF01").ok,true);
assert.equal(owner.engines.introduce.resolve("TF05").ok,true);
assert.equal(owner.engines.introduce.resolve("DV01").ok,true);
assert.equal(owner.engines.introduce.resolve("DV05").ok,true);
assert.equal(owner.engines.introduce.resolve("WC01").reason,"RESEARCH_ONLY");
assert.equal(owner.receiveHandoff(toApostolate).ok,true);
assert.equal(owner.handoffToFormation({fromId:"AQ01",targetRoute:"learn.catechism",reason:"Study"}).targetSurface,"learn");

const appSource=readFileSync("src/app/browser-entry.js","utf8");
assert.match(appSource,/import "\.\.\/apostolate\/browser-entry\.js";/,"hidden Apostolate owner is not installed by the app entry");
assert.doesNotMatch(appSource,/data-ao-app-surface=["']apostolate["']/,"Apostolate UI leaked into the ribbon");
assert.doesNotMatch(readFileSync("src/home/presentation.js","utf8"),/apostolate/i,"Apostolate leaked into Home presentation");
assert.doesNotMatch(readFileSync("src/learn/presentation.js","utf8"),/data-ao-app-surface=["']apostolate["']/i,"Apostolate leaked into Formation presentation");

const installedWin={document:{documentElement:{dataset:{}},querySelector:()=>null}};
const installed=installApostolateOwner(installedWin);
assert.equal(installed.status().publishedCount,33,"production hidden owner did not load AQ + HS + FH + TF + DV corpora");
assert.equal(installed.status().researchOnlyCount,3);
assert.deepEqual(installed.status().readyFamilies,["AQ","HS","FH","TF","DV"]);
assert.equal(installed.status().visible,false);
assert.equal(installedWin.document.documentElement.dataset.aoApostolateVisibility,"hidden");

console.log("PASS hidden Apostolate A8: AQ + HS + FH + TF + DV are sourced bilingual READY; only WC remains fail-closed; no visible surface.");
