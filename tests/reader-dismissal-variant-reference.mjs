import assert from "node:assert/strict";
import {DISMISSAL_VARIANT_ORIGINAL_WITNESSES,DISMISSAL_VARIANT_REFERENCE_SCORES}
 from "../src/mass/reader-dismissal-variant-reference-scores.js";
import {participationReferenceScoresForParagraph}
 from "../src/mass/reader-participation-reference-scores.js";
import {researchGabcPhrases} from "../src/mass/reader-music-gabc-source-screen.js";
import {requiemDismissalVariantsForResolvedMass} from "../src/mass/reader-requiem-conditions.js";
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z0-9]/g,"");
const cueLead="AO.SM.C0259",cueResponse="AO.SM.C0260";
const massOrdinary={schema:"ao-resolved-mass-v2",form:"SOLEMN",overlays:[],
 provenance:{isRequiem:false}};
const massRequiem={schema:"ao-resolved-mass-v2",form:"SOLEMN",overlays:["REQUIEM"],
 provenance:{isRequiem:true}};
const planBenedicamus={kind:"MASS",dismissal:"BENEDICAMUS_DOMINO"};
const planRequiescant={kind:"MASS",dismissal:"REQUIESCANT_IN_PACE"};
const planIte={kind:"MASS",dismissal:"ITE_MISSA_EST"};
assert.equal(DISMISSAL_VARIANT_ORIGINAL_WITNESSES.length,2);
assert.equal(DISMISSAL_VARIANT_REFERENCE_SCORES.length,4);
const expected=[["BENEDICAMUS_DOMINO",2901,"BENEDICAMUS_VIII"],
 ["REQUIESCANT_IN_PACE",823,"REQUIESCANT_1961"]];
for(const [formula,id,setting] of expected){
 const source=DISMISSAL_VARIANT_ORIGINAL_WITNESSES.find(x=>x.formula===formula);
 assert.equal(source.sourceId,id);
 assert.equal(source.settingId,setting);
 assert.equal(source.originalPhraseCount,2);
 assert.equal(source.publicScoreApproved,false);
 const originalPhrases=researchGabcPhrases(source.fullSourceGabc);
 assert.equal(originalPhrases.length,2,source.key+" exact two-turn original Gregorian source");
 const scores=DISMISSAL_VARIANT_REFERENCE_SCORES.filter(x=>x.formula===formula);
 assert.equal(scores.length,2);
 assert.deepEqual(scores.map(x=>x.sourceCueIds[0]),[cueLead,cueResponse]);
 for(const [index,score] of scores.entries()){
  const excerptPhrases=researchGabcPhrases(score.gabc);
  assert.equal(excerptPhrases.length,1,"Extract only one authentic printed musical phrase");
  assert.equal(excerptPhrases[0],normalize(score.sourceLatin),
   "Only the complete selected Mass formula's Latin, never normal Ite text");
  assert.equal(excerptPhrases[0],originalPhrases[index],
   "No new notes, words, pitches, or response interpolation");
  assert.equal(score.publicScoreApproved,false);
  assert.equal(score.printVerification,"PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION");
  assert.equal(score.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+id);
 }
}
const variant=requiemDismissalVariantsForResolvedMass(massRequiem);
assert.equal(normalize(variant[cueLead].lat),normalize("℣. Requiéscant in pace."));
assert.equal(normalize(variant[cueResponse].lat),normalize("℟. Amen."));
const rows=(a,b)=>[
 {id:"re-dismissal-1",kind:"TEXT",sourceCueIds:[cueLead],primary:a,secondary:"translated"},
 {id:"re-dismissal-2",kind:"TEXT",sourceCueIds:[cueResponse],primary:b,secondary:"translated"}
];
const benedRows=rows("℣. Benedicámus Dómino.","℟. Deo grátias.");
const requiemRows=rows(variant[cueLead].lat,variant[cueResponse].lat);
const plainRows=rows("℣. Ite, missa est.","℟. Deo grátias.");
const choose=(p,all,resolvedMass,massPlan,selectedSettings={},form="SOLEMN")=>
 participationReferenceScoresForParagraph({paragraph:p,paragraphs:all,form,
 resolvedMass,massPlan,selectedSettings}).map(x=>x.sourceId);
for(const [cues,mass,plan,settings,sourceId] of [
 [benedRows,massOrdinary,planBenedicamus,{DISMISSAL:"BENEDICAMUS_VIII"},2901],
 [requiemRows,massRequiem,planRequiescant,{},823]
]){
 for(const paragraph of cues){
  assert.deepEqual(choose(paragraph,cues,mass,plan,settings),[sourceId]);
  assert.deepEqual(choose(paragraph,cues,mass,plan,settings,"LOW"),[]);
 }
}
assert.deepEqual(choose(benedRows[0],benedRows,massOrdinary,planBenedicamus),[],
 "Benedicamus VIII is an explicit selected musical setting, not an assumed melody");
assert.deepEqual(choose(benedRows[0],benedRows,massOrdinary,planIte,{DISMISSAL:"BENEDICAMUS_VIII"}),[]);
assert.deepEqual(choose(benedRows[0],benedRows,massRequiem,planBenedicamus,{DISMISSAL:"BENEDICAMUS_VIII"}),[]);
assert.deepEqual(choose(requiemRows[0],requiemRows,massOrdinary,planRequiescant),[]);
assert.deepEqual(choose(requiemRows[0],requiemRows,massRequiem,planIte),[]);
assert.deepEqual(choose(requiemRows[0],requiemRows,massRequiem,null),[]);
assert.deepEqual(choose(plainRows[0],plainRows,massOrdinary,planBenedicamus,{DISMISSAL:"BENEDICAMUS_VIII"}),[]);
assert.deepEqual(choose(plainRows[1],plainRows,massRequiem,planRequiescant),[],
 "Normal Deo gratias must not be converted to the Requiem Amen");
assert.deepEqual(choose(requiemRows[1],requiemRows,massRequiem,planRequiescant,{},"LOW"),[]);
assert.deepEqual(choose({...requiemRows[0],primary:"Another invocation"},requiemRows,massRequiem,planRequiescant),[]);
assert.deepEqual(choose(requiemRows[0],[requiemRows[0],requiemRows[0]],massRequiem,planRequiescant),[]);
const bilingual={...requiemRows[1],primary:"Amen (English)",secondary:requiemRows[1].primary};
assert.deepEqual(choose(bilingual,[requiemRows[0],bilingual],massRequiem,planRequiescant),[823]);
console.log("PASS Benedicamus VIII and Requiescant 1961 source phrases, 4 held excerpts, exact Mass/form/text guards");
