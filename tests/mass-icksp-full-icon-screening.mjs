import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const audit=JSON.parse(read("data/mass/icksp-1962-full-icon-cue-screening-20261025.v1.json"));
assert.equal(audit.schema,"ao-icksp-1962-full-mass-icon-cue-screening-v1");
assert.equal(audit.status,"AUTOMATED_SOURCE_REGISTRY_SCREENING_NOT_INDIVIDUAL_RUBRIC_CERTIFICATION");
assert.equal(audit.policy.legacyCrosswalkRuntimeTruth,false);
assert.equal(audit.policy.missingArtImpliesDefect,false);
assert.equal(audit.policy.priestChantEqualsScholaClock,false);
assert.equal(audit.rows.length,279);

const source={};
for(const [key,info] of Object.entries(audit.inputs)){
 const bytes=read(info.path),size=Buffer.byteLength(bytes,"utf8");
 const blobSha=createHash("sha1").update("blob "+size+"\0").update(bytes).digest("hex");
 assert.equal(blobSha,info.sha,"audit input drift without rescreen: "+info.path);
 source[key]=key==="frozen"?bytes:JSON.parse(bytes);
}
const cues=source.corpus.blocks.flatMap(block=>block.units??[]);
assert.equal(cues.filter(u=>u.cue_id==="AO.SM.B096.SYN").length,1,
 "synthetic pause marker absent or doubled");
const core=cues.filter(u=>/^AO\.SM\.C\d{4}$/.test(u.cue_id));
assert.equal(core.length,279);
const cueMap=new Map(core.map(x=>[x.cue_id,x]));
assert.equal(cueMap.size,279);
const matrix=source.matrix.items;
const sourceRubric=source.rubrics.items;
const actions=source.actions.items;
const faithful=source.faithful.items;
for(let i=0;i<279;i++){
 const id="AO.SM.C"+String(i+1).padStart(4,"0"),row=audit.rows[i];
 assert.equal(row.cueId,id,"canonical row order/identity drift");
 const unit=cueMap.get(id);assert.ok(unit,"missing 1962 source cue "+id);
 assert.equal(row.clock,unit.clock,id+" source clock changed");
 assert.equal(row.kind,unit.type,id+" source type changed");
 assert.deepEqual(row.sourceIds.priestGesture,
  matrix.filter(x=>x.cueId===id&&x.actor==="PRIEST").map(x=>x.id));
 assert.deepEqual(row.sourceIds.faithfulGesture,
  matrix.filter(x=>x.cueId===id&&x.actor==="FAITHFUL").map(x=>x.id));
 assert.deepEqual(row.sourceIds.publishedRubric,
  sourceRubric.filter(x=>x.cueId===id).map(x=>x.id));
 assert.deepEqual(row.sourceIds.priestAction,
  actions.filter(x=>x.cueId===id).map(x=>x.label));
 assert.deepEqual(row.sourceIds.faithfulCue,
  faithful.filter(x=>x.cueId===id).map(x=>x.action));
 assert.ok(Array.isArray(row.sourceFlags));
 assert.ok(row.legacyFrozenIcons_NotRuntime);
}
for(const x of [...matrix,...sourceRubric,...actions,...faithful])
 assert.ok(cueMap.has(x.cueId),"orphan matrix/rubric/action/faithful cue "+x.cueId);
const expected={canonicalCueCount:279,gestureMatrixRows:142,priestGestureRows:83,
 faithfulGestureRows:59,publishedRubricRows:57,priestActionRows:77,
 faithfulCueRows:59,exactIconUnboundRows:17,protectedSungChoirCues:38};
for(const [k,n] of Object.entries(expected))assert.equal(audit.summary[k],n);
const flagged={};
for(const row of audit.rows){
 for(const flag of row.sourceFlags) flagged[flag]=(flagged[flag]??0)+1;
}
assert.deepEqual(flagged,audit.summary.flaggedByCategory);
assert.equal(audit.rows.filter(row=>row.sourceFlags.length>0).length,
 audit.summary.flaggedCueCount);
assert.deepEqual(audit.rows.filter(row=>
 row.sourceFlags.includes("BODY_BOW_GENERIC_HEAD_ICON_REVIEW")).map(row=>row.cueId),
 ["AO.SM.C0116","AO.SM.C0128","AO.SM.C0145"]);
assert.equal(flagged.CHOIR_TICK_DOES_NOT_CERTIFY_PRIEST_EVENT,38);
assert.equal(flagged.UNBOUND_GESTURE_ART_SOURCE,17);
assert.equal(flagged.FAITHFUL_SOURCE_TRIGGER_OUTSIDE_CUE_TEXT,15);
// Fail closed: the research snapshot never promotes speculative ceremonial
// events or substitutes any unapproved art in the running 65-card Mass.
assert.ok(!Object.hasOwn(audit,"publishedGestures"));
console.log("PASS 1962 icon screening: 279 cue IDs + 1 synthetic pause; 142 gesture rows, 57 rubrics, 77 priest actions, 38 choir guards, 17 art holds, zero source-orphan records. Screening is NOT rubric certification.");
