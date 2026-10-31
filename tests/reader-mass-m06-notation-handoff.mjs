import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectMassSungDialogue} from "../src/mass/reader-mass-sung-dialogue-pairs.js";
import {MASS_TONE_CONTEXT_SCHEMA,MASS_TONE_CONTEXT_OWNER}
 from "../src/mass/reader-mass-1962-tone-family.js";
import {resolveAspergesRiteContext,resolveAspergesFormula}
 from "../src/mass/reader-asperges.js";
import {auditM05GabcRecord} from "../src/mass/reader-music-gabc-source-screen.js";
import {resolveOrdinaryMassNotationHandoff,resolveNativeAspersionNotationHandoff,
 buildOfflineNotationResearchPayload,openOfflineResearchScoreInExistingViewer,
 approvedMassNotationForLive}
 from "../src/mass/reader-music-notation-handoff.js";

const file=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const scores=file("data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json").scores;
const sung=file("data/presentation/reader-text-sung.v1.json");
const asp=file("data/presentation/reader-asperges.v1.json");
const cueById=new Map(sung.blocks.flatMap(b=>(b.units??[])
 .filter(u=>u.latin!=null).map(u=>[u.cue_id,u.latin])));
const byId=new Map(scores.map(s=>[s.id,s]));
function screened(id){
 const record=byId.get(id);
 const screen=auditM05GabcRecord({record,cueById,aspergesFormulas:asp.formulas});
 assert.equal(screen.textParity,"PINNED_TEXT_MATCHES_GABC",id);
 return {record,sourceScreen:screen};
}
const mass=kind=>({actualCelebration:{type:"CALENDAR"},
  provenance:{musicToneContext:{
    schema:MASS_TONE_CONTEXT_SCHEMA,sourceOwner:MASS_TONE_CONTEXT_OWNER,
    verified:true,celebrationKind:kind,liturgicalClass:2
  }}});
const make=(id,resolvedMass=mass("SUNDAY"),massPlan=null)=>{
 const sungDialogue=projectMassSungDialogue({eventId:id,form:"SOLEMN",resolvedMass,massPlan});
 return resolveOrdinaryMassNotationHandoff({
  eventId:id,form:"SOLEMN",resolvedMass,massPlan,sungDialogue
 });
};
const solemn=make("PREFACE_DIALOGUE");
assert.equal(solemn.sourceCandidateId,"PREFACE_SOLEMN");
assert.equal(solemn.sourceId,4449);
assert.equal(solemn.sourceParts.length,3);
assert.deepEqual(solemn.sourceParts.map(x=>x.leaderCueIds),[
 ["AO.SM.C0137"],["AO.SM.C0139"],["AO.SM.C0141","AO.SM.C0142"]]);
assert.deepEqual(solemn.sourceParts.map(x=>x.responseCueIds),[
 ["AO.SM.C0138"],["AO.SM.C0140"],["AO.SM.C0143"]]);
assert.equal(solemn.scoreAvailableToMassUser,false);
assert.equal(solemn.scorePublished,false);
assert.equal(solemn.observedSinging,false);
const ferial=make("PREFACE_DIALOGUE",mass("FERIA"));
assert.equal(ferial.sourceCandidateId,"PREFACE_FERIAL");
assert.equal(ferial.sourceId,4450);
const unknown=make("PREFACE_DIALOGUE",{actualCelebration:{type:"CALENDAR"},
  date:"2026-11-01",provenance:{seasonalMode:"AUTUMN"}});
assert.equal(unknown.sourceCandidateId,null);
assert.equal(unknown.reason,"EXACT_1962_SOLEMN_FERIAL_TONE_UNRESOLVED");
assert.equal(make("PREFACE_DIALOGUE",mass("SUNDAY")).scoreAvailableToMassUser,false);
const wrongForm=resolveOrdinaryMassNotationHandoff({
 eventId:"PREFACE_DIALOGUE",form:"LOW",resolvedMass:mass("SUNDAY"),
 sungDialogue:projectMassSungDialogue({eventId:"PREFACE_DIALOGUE",form:"SOLEMN",
 resolvedMass:mass("SUNDAY")})
});
assert.equal(wrongForm.sourceCandidateId,null);
assert.equal(wrongForm.reason,"NO_SUNG_MASS_SCORE_PROJECTION");
const bogus=resolveOrdinaryMassNotationHandoff({
 eventId:"PREFACE_DIALOGUE",form:"SOLEMN",resolvedMass:mass("FERIA"),
 sungDialogue:projectMassSungDialogue({eventId:"PREFACE_DIALOGUE",
 form:"SOLEMN",resolvedMass:mass("SUNDAY")})
});
assert.equal(bogus.sourceCandidateId,null,
 "An unrelated sunny-day tone may not overwrite the selected ferial Mass");
const collect=make("COLLECT");
assert.equal(collect.sourceCandidateId,"ORATIONS_FESTIVE");
assert.equal(collect.sourceId,4487);
assert.match(collect.reason,/GREETING_ONLY/);
assert.equal(make("POSTCOMMUNION").sourceCandidateId,"ORATIONS_FESTIVE");
assert.equal(make("COLLECT",mass("FERIA")).sourceCandidateId,null);
const pater=make("PATERNOSTER");
assert.equal(pater.sourceCandidateId,"PATERNOSTER_COMMON");
assert.match(pater.reason,/CONCLUSION_ONLY/);
const req={actualCelebration:{type:"REQUIEM"},overlays:["REQUIEM"]};
assert.equal(make("PREFACE_DIALOGUE",req).sourceCandidateId,"PREFACE_FERIAL");
const rm=make("DISMISSAL",req,{dismissal:"REQUIESCANT_IN_PACE"});
assert.equal(rm.sourceCandidateId,null);
assert.equal(rm.reason,"REQUIEM_REQUIESCANT_AMEN_MUSIC_NOT_YET_ACQUIRED");
const ben=make("DISMISSAL",mass("SUNDAY"),{dismissal:"BENEDICAMUS_DOMINO"});
assert.equal(ben.sourceCandidateId,null);
assert.equal(ben.reason,"BENEDICAMUS_DEO_GRATIAS_MUSIC_NOT_YET_ACQUIRED");
const ite=make("DISMISSAL",mass("SUNDAY"),{dismissal:"ITE_MISSA_EST"});
assert.equal(ite.sourceCandidateId,"DISMISSAL_ITE_I");
assert.equal(ite.sourceId,2988);
assert.match(ite.reason,/DOUBLE_ALLELUIA/);
for(const event of [solemn,ferial,collect,pater,ite]){
 assert.equal(event.scorePublished,false);
 assert.equal(event.scoreAvailableToMassUser,false);
 assert.equal(event.playableAudio,false);
}
const rite=(date,eventId)=>{
 const formulaState=resolveAspergesFormula(resolveAspergesRiteContext({date}));
 return resolveNativeAspersionNotationHandoff({
  riteId:"ASPERGES",stageId:"ASP-R02",eventId,formulaState
 });
};
const ordinary=rite("2026-10-18","AO.MUS.ASP.ME");
assert.equal(ordinary.sourceCandidateId,"ASPERGES_NORMAL");
const easter=rite("2026-04-05","AO.MUS.ASP.VIDI");
assert.equal(easter.sourceCandidateId,"ASPERGES_PASCHAL");
const passion=rite("2026-03-22","AO.MUS.ASP.ME");
assert.equal(passion.sourceCandidateId,"ASPERGES_NORMAL");
assert.equal(passion.reason,"PASSIONTIDE_GLORIA_MUST_BE_SUPPRESSED_IN_VIEWER");
assert.equal(rite("2026-04-05","AO.MUS.ASP.ME").sourceCandidateId,null);
assert.equal(rite("2026-10-18","AO.MUS.ASP.VIDI").sourceCandidateId,null);
assert.equal(resolveNativeAspersionNotationHandoff({
 riteId:"ASPERGES",stageId:"ASP-R01",eventId:"AO.MUS.ASP.ME",
 formulaState:{formula:"ORDINARY",omitGloriaPatri:false}
}).sourceCandidateId,null);
assert.equal(resolveNativeAspersionNotationHandoff({
 riteId:"ASPERGES",stageId:"ASP-R02",eventId:"AO.MUS.ASP.VIDI",
 formulaState:{formula:"PASCHAL",omitGloriaPatri:true}
}).sourceCandidateId,null);
const payload=buildOfflineNotationResearchPayload({
 handoff:solemn,...screened("PREFACE_SOLEMN"),editorialReview:true
});
assert.equal(payload.scoreId,"GREGOBASE-4449");
assert.equal(payload.referenceType,"RESEARCH_ONLY_NOT_RELEASED");
assert.equal(payload.targetEventId,"PREFACE_DIALOGUE");
assert.equal(payload.releaseApproved,false);
assert.equal(payload.audio,false);
assert.match(payload.gabc,/%%/);
assert.match(payload.sourceUrl,/gregobase\.selapa\.net/);
assert.equal(buildOfflineNotationResearchPayload({
 handoff:solemn,...screened("PREFACE_SOLEMN"),editorialReview:false
}),null);
assert.equal(buildOfflineNotationResearchPayload({
 handoff:solemn,...screened("PREFACE_FERIAL"),editorialReview:true
}),null,"A ferial melody must not be shown as the solemn Preface");
assert.equal(buildOfflineNotationResearchPayload({
 handoff:passion,...screened("ASPERGES_NORMAL"),editorialReview:true
}),null,"A full Passiontide Gloria-containing score is not a correct rite sheet");
assert.equal(buildOfflineNotationResearchPayload({
 handoff:ite,...screened("DISMISSAL_ITE_I"),editorialReview:true
}),null,"The double Alleluia cannot be displayed for an unsupported day");
assert.equal(buildOfflineNotationResearchPayload({
 handoff:easter,...screened("ASPERGES_PASCHAL"),editorialReview:true
})?.scoreId,"GREGOBASE-958");
for(const preview of [solemn,ferial,collect,pater,ordinary,easter,ite]){
 const record=byId.get(preview.sourceCandidateId);
 const source=record?screened(record.id):null;
 assert.equal(approvedMassNotationForLive(preview,record,{
   approved:true,userEditorialDecision:"APPROVED",
   printedEditionVerified:true
 }),null,"A research-only caller may never authorize a live score");
 if(source)assert.equal(source.sourceScreen.scoreRelease,"BLOCKED");
}
// The editorial-only adapter must pass the EXACT original viewer.open(score)
// contract, but must not render a source outside a deliberate review session.
const observed=[];
const existingViewer={open:async (score,{trigger})=>{
 observed.push({score,trigger});return true;
}};
const opened=await openOfflineResearchScoreInExistingViewer({
 viewer:existingViewer,handoff:solemn,...screened("PREFACE_SOLEMN"),
 editorialReview:true,trigger:"explicit-editor-click"
});
assert.equal(opened,true);
assert.equal(observed.length,1);
assert.equal(observed[0].score.scoreId,"GREGOBASE-4449");
assert.equal(observed[0].trigger,"explicit-editor-click");
assert.equal(await openOfflineResearchScoreInExistingViewer({
 viewer:existingViewer,handoff:solemn,...screened("PREFACE_SOLEMN"),
 editorialReview:false
}),false);
assert.equal(await openOfflineResearchScoreInExistingViewer({
 viewer:existingViewer,handoff:passion,...screened("ASPERGES_NORMAL"),
 editorialReview:true
}),false);
assert.equal(observed.length,1);
// This source model DOES NOT fork the offline renderer: it passes the exact
// data object shape expected by PR #2111's existing viewer.open(score).
const contents=readFileSync(new URL("../src/mass/reader-music-notation-handoff.js",import.meta.url),"utf8");
assert.match(contents,/EXISTING_PR2111_OFFLINE_EXSURGE_PILOT/);
assert.doesNotMatch(contents,/createOfflineChantEngraver|createKyrialeNotationViewer|new Audio\(/);
console.log("PASS M06 source-matched ordinary / native-rite handoff, preview-only Exsurge shape and fail-closed scores");
