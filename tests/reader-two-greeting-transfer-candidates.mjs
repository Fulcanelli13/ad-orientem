import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PARTICIPATION_REFERENCE_SCORES} from "../src/mass/reader-participation-reference-scores.js";
import {GREETING_TRANSFER_CUES,GREETING_TRANSFER_SOURCE,GREETING_TRANSFER_EXPLICIT_SELECTION,
 twoGreetingTransferCandidates} from "../src/mass/reader-two-greeting-transfer-candidates.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
import {selectApprovedInlineScore} from "../src/mass/reader-inline-chant-selector.js";

const file=async p=>JSON.parse(await readFile(new URL("../"+p,import.meta.url),"utf8"));
const ledger=await file("data/mass/two-greeting-music-source-crosswalk.v1.json");
const inventory=await file("data/mass/participation-20-event-coverage.v1.json");
const audit=await file("data/mass/ordinary-sung-speaker-audit.v1.json");
const corpus=await file("data/presentation/reader-text-sung.v1.json");
assert.deepEqual(ledger.counts,{sourceCueCandidates:2,verifiedSungRituals:2,
 contextCertifiedScores:0,newPublicScores:0});
assert.equal(GREETING_TRANSFER_CUES.length,2);
assert.deepEqual(GREETING_TRANSFER_CUES.map(x=>x.cueId),["AO.SM.C0107","AO.SM.C0258"]);
assert.equal(GREETING_TRANSFER_SOURCE.sourceContextCertified,false);
assert.equal(GREETING_TRANSFER_SOURCE.publicScoreApproved,false);
const plain=PARTICIPATION_REFERENCE_SCORES.find(x=>x.id==="AO.REF.ORATIONS_FESTIVE.0071");
assert.ok(plain);
assert.equal(plain.sourceId,GREETING_TRANSFER_SOURCE.sourceId);
assert.match(plain.gabc,/Et\(h\) cum\(h\) spí\(h\)ri\(h\)tu\(h\) tu\(h\)o\.\(h\.\)/);
assert.ok(APPROVED_MASS_INLINE_GABC.every(x=>!GREETING_TRANSFER_CUES.some(y=>y.cueId===x.sourceCueId)));
const mass=(kind="SUNDAY")=>({
 schema:"ao-resolved-mass-v2",form:"SOLEMN",
 proper:{status:"READY",sourcePath:"Tempora/Quad01-0",
   data:{sourcePath:"Tempora/Quad01-0"}},
 provenance:{musicToneContext:{
   schema:"ao-1962-sourced-tone-context-v1",
   sourceOwner:"1962_PROPER_RESOLVER",verified:true,
   sourcePath:"Tempora/Quad01-0",celebrationKind:kind,liturgicalClass:1}}
});
const request=(paragraph,paragraphs=[paragraph],resolvedMass=mass(),
 settings={},form="SOLEMN")=>twoGreetingTransferCandidates({
 paragraph,paragraphs,resolvedMass,form,selectedSettings:{
 GREETING_TRANSFER_SOURCE:GREETING_TRANSFER_EXPLICIT_SELECTION,...settings}
});
const sourceRows=new Map(corpus.blocks.flatMap(b=>b.units.map(x=>[x.cue_id,x])));
for(const cue of GREETING_TRANSFER_CUES){
 const row=sourceRows.get(cue.cueId),role=audit.records.find(x=>x.cueId===cue.cueId);
 assert.equal(row.latin,"℟. Et cum spíritu tuo.");
 assert.equal(role.role,"RESPONDERS");
 assert.equal(role.sourceClock,"USER_RESPONSE");
 const current=inventory.events.find(x=>x.cueIds.includes(cue.cueId));
 assert.equal(current.state,"SOURCE_CUE_UNMAPPED",
  "A context-transfer candidate must NOT magically close a source-certified musical gap");
 const p={id:"TEST."+cue.cueId,kind:"TEXT",sourceCueIds:[cue.cueId],
  sourceBlockId:cue.blockId,speakerRole:"RESPONDERS",
  primary:row.latin,secondary:"And with thy spirit."};
 const result=request(p);
 assert.equal(result.length,1);
 assert.equal(result[0].id,"AO.REF.UNVERIFIED_CONTEXT_TRANSFER_"+cue.eventId+"."+cue.cueId);
 assert.equal(result[0].gabc,plain.gabc,"Copy exact printed melody, never new notes");
 assert.equal(result[0].sourceContextCertified,false);
 assert.equal(result[0].publicScoreApproved,false);
 assert.equal(result[0].sourceLatin,row.latin);
 assert.deepEqual(result[0].sourceCueIds,[cue.cueId]);
 assert.deepEqual(request(p,[p],mass(),{GREETING_TRANSFER_SOURCE:""}),[]);
 assert.deepEqual(request(p,[p],mass("FERIA")),[],"No automatic ferial pitch");
 assert.deepEqual(request(p,[p],mass(),{ORATION_TONE:"OLD_SOLEMN_1961"}),[]);
 assert.deepEqual(request(p,[p],mass(),{},"LOW"),[]);
 assert.deepEqual(request(p,[p],{...mass(),schema:"bad"}),[]);
 assert.deepEqual(request(p,[p],{...mass(),distinctRite:"ASPERGES"}),[]);
 assert.deepEqual(request(p,[p],{...mass(),proper:{status:"MISSING"}}),[]);
 assert.deepEqual(request(p,[p],{...mass(),provenance:{}}),[]);
 assert.deepEqual(request(p,[p],{...mass(),
  provenance:{musicToneContext:{...mass().provenance.musicToneContext,sourcePath:"Sancti/11-01"}}}),[]);
 assert.deepEqual(request(p,[p,p]),[],"Duplicated paragraph must not receive score");
 assert.deepEqual(request(p,[p,{...p,id:"OTHER"}]),[],"Duplicated cue must not receive score");
 assert.deepEqual(request({...p,primary:"℟. Laudémus Dóminum"}),[]);
 assert.deepEqual(request({...p,sourceCueIds:["AO.SM.C0071"]}),[],
  "No cross-card cue substitution");
 assert.deepEqual(request({...p,speakerRole:"PRIEST"}),[]);
 assert.deepEqual(request({...p,sourceBlockId:"AO.SM.B019"}),[]);
 assert.equal(selectApprovedInlineScore({cueId:cue.cueId,paragraph:p,
  form:"SOLEMN",settingId:"ITE_VIII"}),null);
}
assert.deepEqual(request({id:"AFTERGOSPEL",kind:"TEXT",primary:"℟. Laus tibi, Christe.",
 sourceCueIds:["AO.SM.C0087"]}),[]);
assert.deepEqual(ledger.records.map(x=>x.cueId),GREETING_TRANSFER_CUES.map(x=>x.cueId));
assert.ok(ledger.records.every(x=>!x.sourceMelodyCertifiedForThisPosition));
console.log("PASS 2 sung Mass greetings: exact 1961 candidate notes, 1962 roles, 1961-context uncertainty, explicit opt-in, no public leakage");
