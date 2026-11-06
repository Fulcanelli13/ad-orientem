import assert from "node:assert/strict";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";
import {resolveOrationAmenTonePolicy,ORATION_AMEN_SOURCE_1961}
 from "../src/mass/reader-oration-amen-tone-policy.js";
import {sourceBoundFestiveOrationAmenScores}
 from "../src/mass/reader-oration-festive-amen-reference.js";
const sourcePath="Tempora/Quad01-0";
const q={lat:"Concede nobis Domine misericordiam tuam. Qui tecum vivit et regnat in unitate Spiritus Sancti Deus, per omnia saecula saeculorum. Amen.",
 en:"Grant us, O Lord, Thy mercy. World without end. Amen.",
 fr:"Donnez-nous votre misericorde. Dans tous les siècles des siècles. Ainsi soit-il."};
const d={sourcePath,introit:q,epistle:q,gradual:q,gospel:q,offertory:q,
 secrets:[q],communion:q,preface:q,collects:[q],postcommunions:[q]};
const mass=kind=>({schema:"ao-resolved-mass-v2",form:"SOLEMN",
 proper:{status:"READY",sourcePath,data:d},overlays:[],
 provenance:{musicToneContext:{
  schema:"ao-1962-sourced-tone-context-v1",sourceOwner:"1962_PROPER_RESOLVER",
  sourcePath,verified:true,onlyForCommonMassPrayerTones:true,
  celebrationKind:kind,liturgicalClass:kind==="FERIA"?3:1
 }}});
const option=(p,paragraphs,resolvedMass,form="SOLEMN",tone=null)=>
 resolveOrationAmenTonePolicy({paragraph:p,paragraphs,resolvedMass,form,
  selectedSettings:tone===null?{}:{ORATION_TONE:tone}});
const score=(p,paragraphs,resolvedMass,tone=null)=>
 sourceBoundFestiveOrationAmenScores({paragraph:p,paragraphs,resolvedMass,
 form:"SOLEMN",selectedSettings:tone===null?{}:{ORATION_TONE:tone}});
assert.equal(ORATION_AMEN_SOURCE_1961.oldSimpleAmenGabc,
 "(c3) <sp>R/</sp>. A(g)men.(h.) (::)");
assert.equal(ORATION_AMEN_SOURCE_1961.oldSimpleScope,
 "ASPERSION_BLESSINGS_LITANIES_NOT_ORDINARY_MASS_ORATIONS");
for(const lang of ["en","fr"]){
 for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
  const block=slot==="COLLECT_SET"?"AO.SM.B019":"AO.SM.B088";
  const rows=composeProperReaderParagraphs(block,
   properToReaderSlots(d,{language:lang}).slots[slot].data.paragraphs,
   {language:lang,form:"SUNG"});
  const p=rows.at(-1);
  assert.equal(option(p,rows,mass("SUNDAY")).status,"FESTIVE_SOURCE_REFERENCE_ELIGIBLE");
  assert.equal(score(p,rows,mass("SUNDAY")).length,1);
  const ferial=option(p,rows,mass("FERIA"));
  assert.equal(ferial.status,"FERIAL_RECTO_TONO_NO_FIXED_AMEN_SCORE");
  assert.equal(ferial.allowFestive,false);
  assert.equal(ferial.hasMusicalScore,false);
  assert.match(ferial.note.en,/recto tono/);
  assert.match(ferial.note.fr,/recto tono/);
  assert.equal(score(p,rows,mass("FERIA")).length,0);
  const old=option(p,rows,mass("SUNDAY"),"SOLEMN","OLD_SOLEMN_1961");
  assert.equal(old.status,"OPTIONAL_OLD_SOLEMN_NOTES_PENDING");
  assert.equal(score(p,rows,mass("SUNDAY"),"OLD_SOLEMN_1961").length,0);
  assert.equal(option(p,rows,mass("SUNDAY"),"SOLEMN","OLD_SIMPLE_1961").status,
   "OLD_SIMPLE_NOT_FOR_ORDINARY_MASS_ORATIONS");
  assert.equal(score(p,rows,mass("SUNDAY"),"OLD_SIMPLE_1961").length,0);
  assert.equal(option(p,rows,mass("FERIA"),"SOLEMN","FERIAL_B_1961").status,
   "SPECIAL_RITE_FERIAL_B_NOT_AUTOMATIC_MASS_TONE");
  assert.equal(option(p,rows,mass("SUNDAY"),"SOLEMN","UNKNOWN_TONE").status,
   "UNRECOGNIZED_TONE_SELECTION_HOLD");
  assert.equal(option(p,rows,mass("SUNDAY"),"LOW").status,
   "NOT_SOURCE_CERTIFIED_ORATION_AMEN");
  assert.equal(option(p,rows,{...mass("FERIA"),provenance:{}}).note,null);
  assert.equal(option({...p,latin:"Deo gratias"},rows,mass("SUNDAY")).allowFestive,false);
 }
}
console.log("PASS 1961 ferial recto-tono and old optional tone eligibility: EN/FR source, no invented scores");
