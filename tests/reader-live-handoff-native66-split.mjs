import assert from "node:assert/strict";
import {test} from "node:test";
import {LIVE_HANDOFF_REFERENCE_ANCHORS,
  resolveLiveHandoffSourceCrosswalk,liveHandoffCrosswalkAccepted,
  liveHandoffReferenceForNativeCard
} from "../src/mass/reader-live-handoff-source-crosswalk.js";
import {liveBandSourceGate} from "../src/mass/reader-live-handoff-band.js";
import {projectLiveHandoffTimeline,projectLiveHandoffWheel}
  from "../src/mass/reader-live-handoff-timeline.js";
import {claudeWheelRender} from "../src/mass/reader-live-handoff-claude-stage-d.js";

function canonical(form="SUNG"){
 const cards=LIVE_HANDOFF_REFERENCE_ANCHORS.map((ref,i)=>({
  sectionId:ref.expectedNativeId,sequence:i+1,
  title:form==="LOW"&&ref.referenceTitle.includes("The Celebrant's Intonation")
   ?ref.referenceTitle.replace("The Celebrant's Intonation","Opening"):ref.referenceTitle,
  sourceSectionId:ref.sourceKey.startsWith("AO.CANON.")?"AO.CARD.014":ref.sourceKey,
  provenance:ref.sourceKey.startsWith("AO.CANON.")?{canonSegmentId:ref.sourceKey}:{},
  paragraphs:[{id:"P"+i,sourceCueIds:["AO.SM.C"+String(i+1).padStart(4,"0")]}],
  blocks:[{blockId:"AO.SM.B"+String(i+1).padStart(3,"0")}]
 }));
 return {structureOwner:"SOURCE_FIRST_LIVE_CURATED_65_REVIEW",
  presentationMode:"LIVE",corpusFamily:form,cards,totalCards:65};
}
function native66(form="SUNG"){
 const model=canonical(form),extraIndex=12;
 model.cards[11].title="Gradual";
 model.cards.splice(extraIndex,0,{
  sectionId:"AO.LIVECURATED.AO.CARD.006.2",
  sequence:13,title:"Alleluia",sourceSectionId:"AO.CARD.006",
  provenance:{},paragraphs:[{id:"ALLELUIA_SOURCE",sourceCueIds:["AO.SM.C0066"]}],
  blocks:[{blockId:"AO.SM.B102"}]
 });
 model.cards.forEach((card,i)=>card.sequence=i+1);
 model.totalCards=66;
 return model;
}
test("real H7 source 66 preserves both Gradual and Alleluia at Claude C12 without renumbering",()=>{
 const model=native66(),before=JSON.stringify(model);
 const crosswalk=resolveLiveHandoffSourceCrosswalk({model,form:model.corpusFamily});
 assert.equal(crosswalk.status,"SOURCE_CERTIFIED_66_PRE_GOSPEL_SPLIT");
 assert.equal(crosswalk.nativeCardCount,66);
 assert.equal(crosswalk.mappings.length,65);
 assert.equal(crosswalk.expandedMappings.length,66);
 assert.equal(crosswalk.exactReferenceMatches,65);
 assert.equal(crosswalk.holds.length,0);
 assert.equal(crosswalk.additionalNativeCards.length,1);
 const graded=liveHandoffReferenceForNativeCard(crosswalk,"AO.LIVECURATED.AO.CARD.006.1");
 const alleluia=liveHandoffReferenceForNativeCard(crosswalk,"AO.LIVECURATED.AO.CARD.006.2");
 const gospelPrep=liveHandoffReferenceForNativeCard(crosswalk,"AO.LIVECURATED.AO.CARD.007.1");
 assert.equal(graded.referenceId,"C12");
 assert.equal(graded.nativeTitle,"Gradual");
 assert.equal(graded.nativeSequence,12);
 assert.equal(alleluia.referenceId,"C12");
 assert.equal(alleluia.nativeTitle,"Alleluia");
 assert.equal(alleluia.nativeSequence,13);
 assert.equal(alleluia.splitNativeSupplement,true);
 assert.equal(alleluia.evidence.sourceMacroId,"AO.CARD.006");
 assert.equal(gospelPrep.referenceId,"C13");
 assert.equal(gospelPrep.nativeSequence,14);
 assert.deepEqual(crosswalk.expandedMappings.map(x=>x.nativeCardId),
   model.cards.map(x=>x.sectionId));
 assert.equal(JSON.stringify(model),before);
});
test("real native 66 maps both exact source cards into the handoff band",()=>{
 const model=native66(),crosswalk=resolveLiveHandoffSourceCrosswalk({model,form:"SUNG"});
 for(const i of [0,11,12,13,35,65]){
  const gate=liveBandSourceGate({model,currentCard:model.cards[i],mode:"LIVE"});
  assert.equal(gate.ok,true,"native source "+(i+1));
  assert.equal(gate.reference.nativeSequence,i+1);
  assert.equal(gate.reference.nativeCardId,model.cards[i].sectionId);
  assert.equal(gate.crosswalk.status,crosswalk.status);
 }
});
test("Low 66-specific speech title and conditional no incense remain source-accepted",()=>{
 const model=native66("LOW");
 const incense=model.cards.find(x=>x.sectionId==="AO.LIVECURATED.AO.CARD.010.5");
 incense.title="Incensation omitted for this Mass";
 incense.stateOnly=true;incense.omittedByRite="1962_FORM_NO_INCENSE";
 const crosswalk=resolveLiveHandoffSourceCrosswalk({model,form:"LOW"});
 assert.equal(crosswalk.status,"SOURCE_CERTIFIED_66_PRE_GOSPEL_SPLIT");
 assert.equal(crosswalk.holds.length,0);
 assert.equal(crosswalk.mappings.find(x=>x.referenceId==="C24").titleStatus,
  "SOURCE_VALID_NO_INCENSATION");
});
test("66 source status fails closed for unknown insertion, wrong Gradual, wrong sequence, duplicate",()=>{
 const badExtra=native66();
 badExtra.cards[12].title="Unrelated insert";
 assert.equal(resolveLiveHandoffSourceCrosswalk({model:badExtra}).status,
  "SOURCE_VARIANT_OR_DRIFT_HOLD");
 const badGradual=native66();badGradual.cards[11].title="Arbitrary text";
 assert.equal(resolveLiveHandoffSourceCrosswalk({model:badGradual}).status,
  "SOURCE_VARIANT_OR_DRIFT_HOLD");
 const wrongSeq=native66();wrongSeq.cards[12].sequence=38;
 assert.equal(resolveLiveHandoffSourceCrosswalk({model:wrongSeq}).status,
  "SOURCE_VARIANT_OR_DRIFT_HOLD");
 const duplicate=native66();duplicate.cards[12].sectionId=duplicate.cards[11].sectionId;
 assert.equal(resolveLiveHandoffSourceCrosswalk({model:duplicate}).status,"SOURCE_HOLD");
 assert.equal(liveHandoffCrosswalkAccepted("SOURCE_VARIANT_OR_DRIFT_HOLD"),false);
});
test("true native 66-card wheel shows extra source card but never a parallel Mass resolver",()=>{
 const model=native66(),gate=liveBandSourceGate({model,currentCard:model.cards[12]});
 const nativeCue="AO.SM.C0066";
 const t=projectLiveHandoffTimeline({gate,model,nativeState:{
  nativeCueId:nativeCue,cueProjectionSupported:true,
  priestPosition:{station:"ALTAR_CENTER",facing:"LITURGICAL_EAST",
   label:"SOURCE",owner:"NATIVE_SOURCE"},
  posture:{value:"STAND"},bell:null
 }});
 assert.equal(t.ok,true);
 assert.equal(t.total,66);
 assert.equal(t.position,13);
 assert.equal(t.current.title,"Alleluia");
 assert.equal(t.current.referenceId,"C12");
 assert.equal(t.cards.length,66);
 const wheel=projectLiveHandoffWheel(t);
 assert.equal(wheel.ok,true);
 assert.equal(wheel.segments.length,66);
 assert.equal(wheel.segments.filter(x=>x.current).length,1);
 assert.equal(wheel.segments[11].referenceId,"C12");
 assert.equal(wheel.segments[12].referenceId,"C12");
 assert.equal(wheel.segments[13].referenceId,"C13");
 const markup=claudeWheelRender(wheel,t);
 assert.equal((markup.match(/data-wheel-segment="/g)||[]).length,66);
 assert.match(markup,/The Gradual takes its name from the altar steps/);
 assert.equal(t.scholaProgressIndependent,true);
 assert.equal(t.observedTiming,false);
});
