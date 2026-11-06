import assert from "node:assert/strict";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";
import {sourceBoundOldSolemnOrationAmenScores,OLD_SOLEMN_ORATION_AMEN_SOURCE}
 from "../src/mass/reader-oration-old-solemn-amen-reference.js";
import {sourceBoundFestiveOrationAmenScores}
 from "../src/mass/reader-oration-festive-amen-reference.js";
const sourcePath="Tempora/Quad01-0";
const prayer=(i,full=true)=>({
 lat:"Da nobis, quaesumus, Domine, misericordiam tuam "+i+
 (full?". Qui tecum vivit et regnat in unitate Spiritus Sancti Deus, per omnia saecula saeculorum. Amen."
      :". Per Christum Dominum nostrum. Amen."),
 en:"Grant us, O Lord, Thy mercy "+i+". World without end. Amen.",
 fr:"Donnez-nous, Seigneur, votre miséricorde "+i+". Ainsi soit-il."
});
const data=(count=2,full=true)=>({sourcePath,introit:prayer("in"),epistle:prayer("ep"),
 gradual:prayer("gr"),gospel:prayer("go"),offertory:prayer("of"),
 secrets:[prayer("se")],communion:prayer("co"),preface:prayer("pr"),
 collects:Array.from({length:count},(_,i)=>prayer("collect-"+i,full)),
 postcommunions:Array.from({length:count},(_,i)=>prayer("post-"+i,full))
});
const resolved=(d,kind="SUNDAY")=>({schema:"ao-resolved-mass-v2",form:"SOLEMN",
 proper:{status:"READY",sourcePath,data:d},overlays:[],
 provenance:{musicToneContext:{schema:"ao-1962-sourced-tone-context-v1",
  sourceOwner:"1962_PROPER_RESOLVER",verified:true,sourcePath,
  onlyForCommonMassPrayerTones:true,celebrationKind:kind,
  liturgicalClass:kind==="FERIA"?3:1}}});
const scores=(p,paragraphs,resolvedMass,form="SOLEMN",tone="OLD_SOLEMN_1961")=>
 sourceBoundOldSolemnOrationAmenScores({paragraph,paragraphs,resolvedMass,form,
 selectedSettings:{ORATION_TONE:tone}});
const festive=(p,paragraphs,resolvedMass,tone="OLD_SOLEMN_1961")=>
 sourceBoundFestiveOrationAmenScores({paragraph,paragraphs,resolvedMass,
 form:"SOLEMN",selectedSettings:{ORATION_TONE:tone}});
assert.equal(OLD_SOLEMN_ORATION_AMEN_SOURCE.sourceFolio,"116*");
assert.match(OLD_SOLEMN_ORATION_AMEN_SOURCE.gabc,/\(c4\).*A\(g\)men\.\(i\.\)/);
assert.notEqual(OLD_SOLEMN_ORATION_AMEN_SOURCE.gabc.includes("(c3)"),true);
assert.equal(OLD_SOLEMN_ORATION_AMEN_SOURCE.publicScoreApproved,false);
for(const language of ["en","fr"]){
 for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
  const d=data();
  const rows=composeProperReaderParagraphs(slot==="COLLECT_SET"?"AO.SM.B019":"AO.SM.B088",
   properToReaderSlots(d,{language}).slots[slot].data.paragraphs,
   {language,form:"SUNG"});
  const amens=rows.filter(p=>p.kind==="RESPONSE"&&/Amen/i.test(p.latin??""));
  assert.equal(amens.length,2);
  for(const [i,p] of amens.entries()){
   for(const kind of ["SUNDAY","FERIA"]){
    const mass=resolved(d,kind),out=scores(p,rows,mass);
    assert.equal(out.length,1,"Historical old solemn 1961 permits festal and ferial Mass");
    assert.equal(out[0].sourceCueIds[0],p.id);
    assert.equal(out[0].sourceOrationGroupIndex,i+1);
    assert.equal(out[0].rubricalToneFamily,kind==="SUNDAY"?"SOLEMN":"FERIAL");
    assert.equal(out[0].publicScoreApproved,false);
    assert.equal(festive(p,rows,mass).length,0,"Old solemn must never borrow festive score");
   }
   assert.equal(scores(p,rows,resolved(d),"LOW").length,0);
   assert.equal(scores(p,rows,resolved(d),"SOLEMN","DEFAULT_1961").length,0);
   assert.equal(scores(p,rows,resolved(d),"SOLEMN","OLD_SIMPLE_1961").length,0);
   assert.equal(scores(p,rows,{...resolved(d),provenance:{}}).length,0);
   assert.equal(scores(p,[...rows,p],resolved(d)).length,0);
  }
  const short=data(1,false),shortRows=composeProperReaderParagraphs(
   slot==="COLLECT_SET"?"AO.SM.B019":"AO.SM.B088",
   properToReaderSlots(short,{language}).slots[slot].data.paragraphs,
   {language,form:"SUNG"});
  assert.equal(scores(shortRows.at(-1),shortRows,resolved(short)).length,0);
 }
}
console.log("PASS old solemn 1961 Amen research-only: EN/FR, intermediate/final, ferial/festive, hold cases");
