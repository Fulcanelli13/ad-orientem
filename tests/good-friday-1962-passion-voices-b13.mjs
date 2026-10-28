/** B13: preserve 1962 Good Friday Passion Latin exactly while projecting its source-marked vocal turns. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildGoodFridayReader} from "../src/mass/reader-good-friday.js";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=load("data/mass/independent-1962-good-friday-b13-passion-voice-turns.v1.json");
const payload=load("data/presentation/reader-good-friday.v1.json");
const graph=load("data/mass/special-days-core.v1.1.json").graphs.GF;
assert.equal(audit.schema,"AO_MR1962_GOOD_FRIDAY_PASSION_B13_VOICES_V1");
assert.equal(payload.passion.voiceTurns.schema,audit.schema);
assert.deepEqual(payload.passion.voiceTurns.preDeath,audit.preDeath.map(x=>x.turns),
 "Audit and canonical runtime source speaking-turn registry have diverged");
assert.deepEqual(payload.passion.voiceTurns.postDeath,audit.postDeath.map(x=>x.turns));
assert.equal(payload.passion.preDeath.length,24);
assert.equal(payload.passion.postDeath.length,4);
assert.equal(audit.scope.originalLatinTextAltered,false);
assert.equal(audit.scope.currentVocalMinister,"UNDETERMINED_DEPENDS_ON_RITE_FORM_AND_LOCAL_MINISTERS");
const counted=audit.preDeath.flatMap(x=>x.turns);
assert.equal(counted.length,49);
assert.equal(counted.filter(x=>x.role==="CHRISTUS").length,15);
assert.equal(counted.filter(x=>x.role==="SYNAGOGA").length,34);
assert.ok(audit.uncertified.some(x=>x.includes("English and French")));
const built=buildGoodFridayReader({graph,payload});
assert.equal(built.ordinaryMassGraphActive,false);
assert.equal(built.sourceRecordCount,56);
const before=built.steps.find(x=>x.recordId==="GF-PASS-310");
const death=built.steps.find(x=>x.recordId==="GF-PASS-320");
const after=built.steps.find(x=>x.recordId==="GF-PASS-330");
assert.ok(before&&death&&after);
assert.equal(death.posture,"KNEEL");
assert.equal(death.action,"PAUSE_BRIEFLY");
assert.equal(after.posture,"STAND");
assert.equal(before.surfaceKey,"PASSION_BEFORE_DEATH");
assert.equal(death.surfaceKey,"PASSION_BEFORE_DEATH");
assert.equal(after.surfaceKey,"PASSION_AFTER_DEATH");
assert.deepEqual(before.paragraphs,death.paragraphs,
 "Death cue must change posture, NOT reorder or omit the pre-death original Passion");
const roles=new Set(["CHRONISTA","CHRISTUS","SYNAGOGA"]);
let reconstructedBlocks=0,utterances=0;
for(const [step,source,indexPrefix] of [
  [before,payload.passion.preDeath,"GF-PASS-A"],
  [after,payload.passion.postDeath,"GF-PASS-B"]
]){
 const blockRows=new Map();
 for(const row of step.paragraphs){
  assert.ok(roles.has(row.speaker),"Missing or invented 1962 voice label: "+row.id);
  assert.equal(row.kind,"TEXT");
  assert.ok(row.latin.trim(),"Blank Passion source paragraph "+row.id);
  assert.ok(row.sourceBlockIndex>=1&&row.sourceBlockIndex<=source.length);
  assert.ok(row.voiceSegmentIndex>=1);
  const id=indexPrefix+row.sourceBlockIndex;
  if(!blockRows.has(id))blockRows.set(id,[]);
  blockRows.get(id).push(row);
  if(row.speaker!=="CHRONISTA")utterances++;
 }
 assert.equal(blockRows.size,source.length,"Original Passion block count changed");
 for(let i=0;i<source.length;i++){
  const id=indexPrefix+(i+1),parts=blockRows.get(id);
  assert.ok(parts?.length,id+" missing voice-parsed original source");
  assert.equal(parts[0].id,id,"First source row identifier must remain stable");
  assert.equal(parts.map(x=>x.latin).join(""),source[i],
    id+" B13 introduced/deleted original Latin characters");
  assert.equal(new Set(parts.map(x=>x.id)).size,parts.length);
  assert.deepEqual(parts.map(x=>x.voiceSegmentIndex),parts.map((_,j)=>j+1));
  for(const row of parts){
   assert.deepEqual([...row.sourceIds],
     indexPrefix==="GF-PASS-A"?["GF-PASS-310","GF-PASS-320"]:["GF-PASS-330"]);
  }
  reconstructedBlocks++;
 }
}
assert.equal(reconstructedBlocks,28);
assert.equal(utterances,49,"All 49 marked Christus/Synagoga voice turns must remain distinct");
assert.equal(before.paragraphs.filter(x=>x.speaker==="CHRISTUS").length,15);
assert.equal(before.paragraphs.filter(x=>x.speaker==="SYNAGOGA").length,34);
assert.ok(before.paragraphs.find(x=>x.speaker==="CHRISTUS"&&x.latin.includes("Mulier, ecce filius tuus.")));
assert.ok(before.paragraphs.find(x=>x.speaker==="CHRISTUS"&&x.latin.includes("Consummatum est.")));
assert.ok(before.paragraphs.at(-1).latin.includes("tradidit spiritum"));
assert.equal(before.paragraphs.at(-1).speaker,"CHRONISTA",
  "At the instant of Death, narrator says tradidit spiritum, not Christ");
assert.ok(after.paragraphs.every(x=>x.speaker==="CHRONISTA"));
assert.equal(after.paragraphs.length,4,"Post-death burial narrative is all Chronista");
assert.ok(after.paragraphs.at(-1).latin.endsWith("posuerunt Iesum."));
const alternate=buildGoodFridayReader({graph,payload,jewishPrayerVariant:"HOLY_SEE_2008"});
assert.deepEqual(alternate.steps.find(x=>x.recordId==="GF-PASS-310").paragraphs,before.paragraphs,
 "2008 optional intercessory prayer must not change the 1962 Passion source");
const corrupt=structuredClone(payload);
corrupt.passion.preDeath[1]=corrupt.passion.preDeath[1].replace("Quem quaeritis?","Quem quaeritis!");
assert.throws(()=>buildGoodFridayReader({graph,payload:corrupt}),
 /Passion voice onset changed/,"B13 must fail closed on a changed source utterance");
const absent=structuredClone(payload);
delete absent.passion.voiceTurns;
assert.throws(()=>buildGoodFridayReader({graph,payload:absent}),/voice crosswalk required/);
console.log("PASS B13 PRINTED-1962 GOOD FRIDAY PASSION VOICES="+JSON.stringify({
 originalSourceBlocks:28,scriptureCharactersPreserved:true,annotatedDialogueTurns:49,
 christus:15,synagoga:34,postDeathChronistaBlocks:4,
 deathKneelAndResumePreserved:true,ministerAssignmentsCertified:false,
 completeOriginal1962LatinCollationCertified:false
}));
