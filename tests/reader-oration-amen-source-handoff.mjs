import assert from "node:assert/strict";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";
import {resolveOrationAmenSourceHandoff,ORATION_AMEN_SOURCE_SCHEMA}
 from "../src/mass/reader-oration-amen-source-handoff.js";
const tag=(name)=>({
 lat:"Da nobis, quaesumus, Domine, misericordiam tuam "+name+
  ". Per Dominum nostrum Iesum Christum. Amen.",
 en:"Grant us, O Lord, Thy mercy "+name+". Through our Lord. Amen.",
 fr:"Donnez-nous, Seigneur, votre miséricorde "+name+
  ". Par Notre-Seigneur. Ainsi soit-il."
});
const sourcePath="Tempora/Quad01-0";
const proper=(howMany=1)=>({
 sourcePath,introit:tag("introit"),epistle:tag("lesson"),
 gradual:tag("gradual"),gospel:tag("gospel"),
 offertory:tag("offertory"),secrets:[tag("secret")],
 communion:tag("communion"),preface:tag("preface"),
 collects:Array.from({length:howMany},(_,i)=>tag("collect-"+i)),
 postcommunions:Array.from({length:howMany},(_,i)=>tag("post-"+i))
});
const ctx=kind=>({
 schema:"ao-1962-sourced-tone-context-v1",sourceOwner:"1962_PROPER_RESOLVER",
 verified:true,celebrationKind:kind,liturgicalClass:1,
 sourcePath,onlyForCommonMassPrayerTones:true
});
const resolved=(data,kind="SUNDAY")=>({
 schema:"ao-resolved-mass-v2",form:"SOLEMN",
 proper:{status:"READY",data,sourcePath},
 overlays:[],provenance:{musicToneContext:ctx(kind)}
});
const response=(p)=>p.kind==="RESPONSE"&&/Amen/i.test(p.latin??"");
const project=(data,language,form,slot)=>composeProperReaderParagraphs(
 slot==="COLLECT_SET"?"AO.SM.B019":"AO.SM.B088",
 properToReaderSlots(data,{language}).slots[slot].data.paragraphs,
 {language,form});
const state=(p,rows,m,form="SOLEMN")=>resolveOrationAmenSourceHandoff({
 paragraph:p,paragraphs:rows,form,resolvedMass:m
});
assert.equal(ORATION_AMEN_SOURCE_SCHEMA,"ao-mass-oration-amen-source-handoff-v1");
for(const language of ["en","fr"]){
 for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
  const data=proper(1),original=JSON.stringify(data),m=resolved(data);
  const rows=project(data,language,"SUNG",slot);
  assert.equal(rows.filter(response).length,1);
  const result=state(rows.at(-1),rows,m);
  assert.equal(result.status,"SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING");
  assert.equal(result.sourceCueId,slot==="COLLECT_SET"?"AO.SM.C0074":"AO.SM.C0255");
  assert.equal(result.sourceBlockId,slot==="COLLECT_SET"?"AO.SM.B019":"AO.SM.B088");
  assert.equal(result.sourceProperPath,sourcePath);
  assert.equal(result.sourceOrationGroupIndex,1);
  assert.equal(result.toneFamily,"SOLEMN");
  assert.equal(result.score,null);
  assert.equal(result.publicScoreApproved,false);
  assert.equal(JSON.stringify(data),original,"Source Proper must be immutable");
  assert.equal(state(rows.at(-1),rows,m,"LOW").status,"NOT_SUNG_MASS");
  assert.equal(state(rows.at(-1),rows,{...m,proper:null}).status,
   "SELECTED_PROPER_SOURCE_NOT_READY");
  assert.equal(state(rows.at(-1),rows,{...m,provenance:{}}).status,
   "ACTUAL_MASS_TONE_CONTEXT_NOT_CERTIFIED");
  assert.equal(state(rows.at(-1),rows,{...m,provenance:{
   musicToneContext:{...ctx("SUNDAY"),sourcePath:"Tempora/Other"}
  }}).status,"ACTUAL_MASS_TONE_CONTEXT_NOT_CERTIFIED");
  const altered={...rows.at(-2),latin:"Completely different Latin oration."};
  assert.equal(state(rows.at(-1),[...rows.slice(0,-2),altered,rows.at(-1)],m).status,
   "ORATION_TEXT_NOT_IN_SELECTED_PROPER");
  const duplicate=[...rows,rows.at(-1)];
  assert.equal(state(rows.at(-1),duplicate,m).status,"RESPONSE_SOURCE_ROW_NOT_UNIQUE");
  const none={...rows.at(-1),id:"AO.SM.C0266"};
  assert.equal(state(none,[...rows.slice(0,-1),none],m).status,
   "NOT_PUBLIC_ORATION_AMEN");
 }
 const data=proper(2),m=resolved(data);
 for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
  const rows=project(data,language,"SUNG",slot);
  assert.equal(rows.filter(response).length,2,"Two prayers require two Amen rows");
  const amens=rows.filter(response);
  for(const [index,p] of amens.entries()){
   const r=state(p,rows,m);
   assert.equal(r.status,"SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING");
   assert.equal(r.sourceOrationGroupIndex,index+1);
   assert.equal(r.intermediate,index===0);
   assert.equal(r.sourceCueId,index===0?null:slot==="COLLECT_SET"?
    "AO.SM.C0074":"AO.SM.C0255");
  }
  const hacked={...rows[1],sourceAnchorCueId:"AO.SM.C0077"};
  assert.equal(state(hacked,[rows[0],hacked,...rows.slice(2)],m).status,
   "WRONG_INTERMEDIATE_AMEN_SOURCE_ANCHOR");
 }
}
// Requiem/feria or votive without the source-signed actual-Mass context
// cannot accidentally use a Sunday oration tune.
const d=proper(1),rows=project(d,"en","SUNG","COLLECT_SET");
assert.equal(state(rows.at(-1),rows,resolved(d,"FERIA")).toneFamily,"FERIAL");
const corrupt=resolved(d);corrupt.provenance.musicToneContext.verified=false;
assert.equal(state(rows.at(-1),rows,corrupt).status,
 "ACTUAL_MASS_TONE_CONTEXT_NOT_CERTIFIED");
assert.equal(state(rows.at(-1),rows,resolved(d), "UNKNOWN").status,"NOT_SUNG_MASS");
console.log("PASS Collect/Postcommunion source and tone handoff: EN/FR, one/two orations, 65-card cue ownership, no score promotion");
