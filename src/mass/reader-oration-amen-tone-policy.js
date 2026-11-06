// Source-scoped participation policy, not a promise about the celebrant's
// chosen performance pitch. The 1961 Graduale (Toni Orationum, pp.113*-119*)
// distinguishes normal festive, recto-tono ferial and older optional tones.
// This module never authorizes a new public score or reader card.
import {resolveOrationAmenSourceHandoff} from "./reader-oration-amen-source-handoff.js";
export const ORATION_AMEN_TONE_POLICY_SCHEMA="ao-1961-oration-amen-tone-policy-v1";
export const ORATION_AMEN_SOURCE_1961=Object.freeze({
 edition:"Graduale Romanum (Solesmes, 1961)",
 url:"https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf",
 festiveFolio:"113*–114*",ferialFolio:"114*–115*",
 oldSolemnFolio:"115*–117*",oldSimpleFolio:"118*–119*",
 oldSolemnSource:"https://gregobase.selapa.net/chant.php?id=4488",
 oldSimpleSource:"https://gregobase.selapa.net/chant.php?id=4489",
 oldSimpleAmenGabc:"(c3) <sp>R/</sp>. A(g)men.(h.) (::)",
 oldSimpleScope:"ASPERSION_BLESSINGS_LITANIES_NOT_ORDINARY_MASS_ORATIONS",
 publicScoreApproved:false
});
const out=(status,handoff,sourceFolio,note=null,allowFestive=false)=>
 Object.freeze({schema:ORATION_AMEN_TONE_POLICY_SCHEMA,status,
  eventId:handoff?.eventId??null,sourceFolio,
  allowFestive,publicScoreApproved:false,hasMusicalScore:false,
  note:note?Object.freeze(note):null
 });
/** Only call for an actual, uniquely sourced Collect/Postcommunion Amen.
 * ORATION_TONE must be an explicitly selected historical source family:
 * default festive/ferial, optional OLD_SOLEMN_1961, or a held-ineligible
 * source. Never select old/simple/special rite automatically by feast.
 */
export function resolveOrationAmenTonePolicy({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null,selectedSettings={}
}={}){
 const handoff=resolveOrationAmenSourceHandoff({paragraph,paragraphs,form,resolvedMass});
 if(handoff.status!=="SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING")
  return out("NOT_SOURCE_CERTIFIED_ORATION_AMEN",null,null);
 const chosen=String(selectedSettings?.ORATION_TONE??"DEFAULT_1961").toUpperCase();
 if(chosen==="OLD_SIMPLE_1961")
  return out("OLD_SIMPLE_NOT_FOR_ORDINARY_MASS_ORATIONS",handoff,"118*–119*");
 if(chosen==="FERIAL_B_1961")
  return out("SPECIAL_RITE_FERIAL_B_NOT_AUTOMATIC_MASS_TONE",handoff,"115*");
 if(chosen==="OLD_SOLEMN_1961")
  return out("OPTIONAL_OLD_SOLEMN_NOTES_PENDING",handoff,"115*–117*",{
   en:"Old solemn oration tone (ad libitum) · notes awaiting review",
   fr:"Ancien ton solennel (ad libitum) · notation en cours de vérification",
   la:"Tonus antiquus solemnis ad libitum"
  });
 if(chosen!=="DEFAULT_1961")
  return out("UNRECOGNIZED_TONE_SELECTION_HOLD",handoff,null);
 if(handoff.toneFamily==="FERIAL")
  return out("FERIAL_RECTO_TONO_NO_FIXED_AMEN_SCORE",handoff,"114*–115*",{
   en:"Tonus ferialis · recto tono · no fixed Amen score (1961, p. 114*)",
   fr:"Tonus ferialis · recto tono · pas de partition fixe pour Amen (1961, p. 114*)",
   la:"Tonus ferialis · recto tono"
  });
 if(handoff.toneFamily==="SOLEMN")
  return out("FESTIVE_SOURCE_REFERENCE_ELIGIBLE",handoff,"113*–114*",null,true);
 return out("TONE_FAMILY_UNRESOLVED",handoff,null);
}
