import assert from "node:assert/strict";
import {selectApprovedInlineScore,selectedMassInlineSettings,
 INLINE_CHANT_SCHEMA,INLINE_CHANT_SELECTION_KEYS} from
 "../src/mass/reader-inline-chant-selector.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";

const model={
 schema:INLINE_CHANT_SCHEMA,selectionKey:"GLORIA",settingId:"MASS_08",
 riteScope:"ORDINARY",sourceCueId:"AO.SM.C0053",
 sourceCueIds:["AO.SM.C0053","AO.SM.C0054"],
 sourceLatin:"℣. Gloria in excelsis Deo.",
 approval:"USER_AND_MUSICAL_SOURCE_REVIEWED",publication:"PUBLIC_APPROVED",
 sourceTextVerified:true,musicalNotationVerified:true,
 scoreId:"SOURCE-GLORIA-INTONATION",
 gabcSha256:"0".repeat(64),sourceWitness:"Historical original score checked",
 sourceUrl:"https://example.org/source",
 gabc:"name: Gloria intonation;\n%%\n(c4)G(f)lo(g)ri(h)a(g) (;) (f)(::)"
};
const paragraph={id:"AO.ROW.GLORIA",kind:"TEXT",
 primary:model.sourceLatin,sourceCueIds:["AO.SM.C0053","AO.SM.C0054"]};
const pick=(p=paragraph,s=model,opts={})=>selectApprovedInlineScore({
 paragraph:p,cueId:p.sourceCueIds?.[0]??null,
 form:"SOLEMN",selectedSettings:{GLORIA:"MASS_08"},
 approvedScores:[s],...opts
});
assert.equal(pick()?.scoreId,model.scoreId,
 "Two source cues can belong to one exactly selected chant phrase");
assert.equal(pick(paragraph,model,{selectedSettings:{GLORIA:"MASS_11"}}),null);
assert.equal(pick(paragraph,model,{selectedSettings:{KYRIE:"MASS_08"}}),null);
assert.equal(pick({...paragraph,sourceCueIds:["AO.SM.C0054","AO.SM.C0053"]}),null);
assert.equal(pick({...paragraph,sourceCueIds:["AO.SM.C0053"]}),null);
assert.equal(pick({...paragraph,primary:"Other hymn"}),null);
assert.equal(pick(paragraph,{...model,publication:"RESEARCH_ONLY"}),null);
assert.equal(pick(paragraph,{...model,riteScope:"REQUIEM"}),null);
assert.equal(pick(paragraph,model,{form:"LOW"}),null);
assert.equal(pick(paragraph,model,{approvedScores:[model,model]}),null);
// A special-rite cue remains a source-owned paragraph rather than a new
// musical dock or a fabricated AO.SM.C... ordinary cue.
const special={...model,sourceCueId:"AO.ASP.R02.C010",
 sourceCueIds:["AO.ASP.R02.C010"],selectionKey:"ASPERSION",
 settingId:"ASPERGES_ME_ORDINARY",
 sourceLatin:"Asperges me, Domine."};
const specialRow={id:"AO.ASP.R02.P1",kind:"TEXT",
 sourceCueIds:["AO.ASP.R02.C010"],primary:special.sourceLatin};
assert.equal(pick(specialRow,special,{selectedSettings:{
 ASPERSION:"ASPERGES_ME_ORDINARY"}})?.sourceCueId,"AO.ASP.R02.C010");
assert.equal(pick({...specialRow,sourceCueIds:["AO.ASP.R02.C011"]},
 special,{selectedSettings:{ASPERSION:"ASPERGES_ME_ORDINARY"}}),null);
const proper={...model,selectionKey:"PROPER_INTROIT",settingId:"PROPER-ALL-SAINTS",
 sourceCueId:null,sourceCueIds:[],sourceParagraphId:"PROPER.INTROIT.SOLEMN",
 sourceBlockId:"AO.PROP.INTROIT",sourceLatin:"Gaudeamus omnes in Domino.",
 scoreId:"SOURCE-PROPER-INTROIT"};
const properRow={id:proper.sourceParagraphId,sourceBlockId:proper.sourceBlockId,
 kind:"TEXT",sourceCueIds:[],primary:proper.sourceLatin};
const properPick=(p,s,selection)=>selectApprovedInlineScore({
 cueId:null,paragraph:p,form:"SOLEMN",selectedSettings:selection,
 approvedScores:[s]});
assert.equal(properPick(properRow,proper,{PROPER_INTROIT:"PROPER-ALL-SAINTS"})?.scoreId,
 proper.scoreId,"Proper may match an exact block+paragraph even without single ordinary cue");
assert.equal(properPick({...properRow,id:"WRONG"},proper,{PROPER_INTROIT:"PROPER-ALL-SAINTS"}),null);
assert.equal(properPick({...properRow,sourceBlockId:"OTHER"},proper,{PROPER_INTROIT:"PROPER-ALL-SAINTS"}),null);
assert.equal(properPick(properRow,proper,{}),null);
assert.equal(properPick(properRow,{...proper,sourceParagraphId:undefined},
 {PROPER_INTROIT:"PROPER-ALL-SAINTS"}),null);

for(const selectionKey of INLINE_CHANT_SELECTION_KEYS.filter(k=>
 !["GLORIA","PROPER_INTROIT"].includes(k))){
 const isProper=selectionKey.startsWith("PROPER_");
 const score=isProper
  ?{...proper,selectionKey,settingId:"SOURCE-REVIEWED-TONE"}
  :{...model,selectionKey,settingId:"SOURCE-REVIEWED-TONE"};
 const row=isProper?properRow:paragraph;
 const result=pick(row,score,{
  selectedSettings:{[selectionKey]:"SOURCE-REVIEWED-TONE"}
 });
 assert.equal(result?.selectionKey,selectionKey,
  "Universal renderer must not hardcode one movement: "+selectionKey);
}
const local={
 ordinarySelections:{KYRIE:"MASS_08",GLORIA:"MASS_08",CREDO:"CREDO_03",
 SANCTUS_BENEDICTUS:"MASS_08",AGNUS_DEI:"MASS_08"},
 dismissalSelection:"ITE_VIII"};
const settings=selectedMassInlineSettings({localProgramme:local});
assert.equal(settings.KYRIE,"MASS_08");
assert.equal(settings.GLORIA,"MASS_08");
assert.equal(settings.CREDO,"CREDO_03");
assert.equal(settings.DISMISSAL,"ITE_VIII");
assert.equal(settings.PROPER_INTROIT,undefined,
 "Date alone never chooses a Proper melody");
const certified=selectedMassInlineSettings({
 localProgramme:local,
 resolvedMass:{sourceCertifiedInlineChantSelections:{
  status:"SOURCE_CERTIFIED_1962_MUSIC",
  selections:{PROPER_INTROIT:"PROPER-ALL-SAINTS",PREFACE_DIALOGUE:"SOLEMN_TONE"}
 }}});
assert.equal(certified.PROPER_INTROIT,"PROPER-ALL-SAINTS");
assert.equal(certified.PREFACE_DIALOGUE,"SOLEMN_TONE");
const ignored=selectedMassInlineSettings({
 resolvedMass:{sourceCertifiedInlineChantSelections:{
  status:"RESEARCH_UNREVIEWED",
  selections:{PROPER_INTROIT:"GUESS"}
 }}});
assert.equal(ignored.PROPER_INTROIT,undefined);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2,
 "Pilot source is only 2 entries, not a falsely claimed complete Mass corpus");
console.log("PASS universal inline Gregorian selection across all chant families, compound cues and exact Propers");
