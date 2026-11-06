// Opt-in 1961 OLDER SOLEMN (ad libitum) Amen review candidate.
// This is not the standard festive, ferial A/B or old simple melody.
// Transcription from Graduale Romanum (Solesmes 1961), folio 116*,
// under the OLD solemn c4 clef attested at folio 115* (GregoBase #4488).
// Original facsimile governs; not approved for normal public display.
import {resolveOrationAmenSourceHandoff} from "./reader-oration-amen-source-handoff.js";

export const OLD_SOLEMN_ORATION_AMEN_SOURCE=Object.freeze({
 sourceEdition:"Graduale Romanum (Solesmes, 1961)",
 sourceFolio:"116*",
 pdfPageZeroIndex:117,
 facsimile:"https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf",
 sourceImage:"https://gregobase.selapa.net/sources/2/993.png",
 companionGreetingId:4488,
 companionGreetingGabc:"(c4) DO(g)mi(h)nus(h) vo(gh)bís(hg)cum.(g.) (::)",
 selection:"OLD_SOLEMN_1961",
 reviewStatus:"1961_GRADUALE_116_AND_LIBER_100_G_TO_H_STEP_VISUALLY_COLLATED__INDEPENDENT_EDITORIAL_APPROVAL_PENDING",
 publicScoreApproved:false,
 // The old solemn p.116* R. Amen is an upward STEP (not a third):
 // first syllable at the same c4 g as the greeting's Dom(inus),
 // second syllable at adjacent c4 h (cf. GregoBase #4488).
 // Collated visually with the 1961 Graduale p.116* and Liber p.100.
 // Keep separate from old simple (c3) g-h and festive (c3) h-h.
 gabc:"name: Old solemn oration Amen (ad libitum);\noffice-part: Toni Communes;\nsource: Graduale Romanum (Solesmes, 1961), p. 116*;\n%%\n(c4) <sp>R/</sp>. A(g)men.(h.) (::)"
});
const norm=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .replace(/j/gi,"i").toLowerCase().replace(/[^a-z0-9]/g,"");
// Only complete conclusion as printed in this 1961 example. Alternative
// endings remain held until independent source-specific formula matching.
const endingProven=s=>{
 const n=norm(s);
 return n.endsWith("peromniasaeculasaeculorum")||
        n.endsWith("peromniasaeculasaeculorumamen");
};
export function sourceBoundOldSolemnOrationAmenScores({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null,selectedSettings={}
}={}){
 if(String(selectedSettings?.ORATION_TONE??"").toUpperCase()!=="OLD_SOLEMN_1961")
  return Object.freeze([]);
 const h=resolveOrationAmenSourceHandoff({paragraph,paragraphs,form,resolvedMass});
 if(h.status!=="SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING"||
   !["SOLEMN","FERIAL"].includes(h.toneFamily))return Object.freeze([]);
 const data=resolvedMass?.proper?.data;
 const slot=h.eventId==="COLLECT"?"collects":"postcommunions";
 const single=h.eventId==="COLLECT"?"collect":"postcommunion";
 const groups=Array.isArray(data?.[slot])&&data[slot].length?
  data[slot]:data?.[single]?[data[single]]:[];
 const selected=groups[h.sourceOrationGroupIndex-1];
 if(!selected||!endingProven(selected.lat??selected.la??""))return Object.freeze([]);
 return Object.freeze([Object.freeze({
  id:"AO.REF.ORATION_OLD_SOLEMN_AMEN."+h.eventId+
   ".G"+h.sourceOrationGroupIndex+"."+paragraph.id,
  sourceId:null,sourceName:"Toni antiqui ad libitum — tonus solemnis: Amen",
  sourceUrl:OLD_SOLEMN_ORATION_AMEN_SOURCE.facsimile,
  sourceFolio:"Graduale Romanum (Solesmes, 1961), p. 116*",
  sourceDocument:"data/mass/oration-amen-notation-source-gate.v1.json",
  sourceCueIds:Object.freeze([paragraph.id]),
  sourceCueLatin:Object.freeze(["℟. Amen."]),
  sourceLatin:"℟. Amen.",kind:"PEOPLE_RESPONSE",
  eventId:h.eventId,toneFamily:"OLD_SOLEMN_1961",
  rubricalToneFamily:h.toneFamily,
  sourceOrationGroupIndex:h.sourceOrationGroupIndex,
  sourceOrationDonor:h.sourceOrationDonor,
  printVerification:OLD_SOLEMN_ORATION_AMEN_SOURCE.reviewStatus,
  publicScoreApproved:false,gabc:OLD_SOLEMN_ORATION_AMEN_SOURCE.gabc
 })]);
}
