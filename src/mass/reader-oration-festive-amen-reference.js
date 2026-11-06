// The 1961 festive Collect/Postcommunion response as a source-bound,
// research-preview-only excerpt. The reader's 1962 Proper, prayer and tone
// must be authenticated BEFORE this two-note response is offered.
// No public score promotion or new Mass card is authorized.
import {resolveOrationAmenSourceHandoff} from "./reader-oration-amen-source-handoff.js";

export const ORATION_AMEN_REFERENCE_SCHEMA="ao-1961-festive-oration-amen-reference-v1";
export const FESTIVE_ORATION_AMEN_SOURCE=Object.freeze({
 sourceEdition:"Graduale Romanum (Solesmes, 1961)",
 sourceFolio:"114*",
 sourcePdfPageZeroIndex:115,
 sourceUrl:"https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf",
 comparatorId:4487,
 comparatorUrl:"https://gregobase.selapa.net/chant.php?id=4487",
 sourceVerification:"1961_PRINTED_TWO_EQUAL_PITCH_NOTES_C3_H_MATCHED_TO_PAGE_113_GREETING",
 musicEditorialApproval:"RESEARCH_PREVIEW_ONLY",
 // Folio 114* prints A-men on two consecutive equal-height notes.
 // Folio 113* shares its staff position with (c3) h in the exact
 // 1961 GregoBase #4487 greeting. The source also describes a separate
 // ferial tone and optional older tones: those are NOT this score.
 gabc:"name: Toni Orationum festivus - Amen;\noffice-part: Toni Communes;\nsource: Graduale Romanum (Solesmes, 1961), p. 114*;\n%%\n(c3) <sp>R/</sp>. A(h)men.(h.) (::)"
});
const normalize=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .replace(/j/gi,"i").toLowerCase().replace(/[^a-z0-9]/g,"");
const finalPrintedCadence=s=>{
 const ending=normalize(s);
 return ending.endsWith("peromniasaeculasaeculorum")||
        ending.endsWith("peromniasaeculasaeculorumamen");
};
/** Only a full, source-matched conclusion in the selected 1962 oration
 * can receive the specific 1961 festive Amen. Short/elliptical Proper
 * endings and all ferial or optional old tones remain held for review.
 */
export function sourceBoundFestiveOrationAmenScores({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null
}={}){
 const handoff=resolveOrationAmenSourceHandoff({
  paragraph,paragraphs,form,resolvedMass
 });
 if(handoff.status!=="SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING"||
    handoff.toneFamily!=="SOLEMN")return Object.freeze([]);
 const data=resolvedMass?.proper?.data;
 const slot=handoff.eventId==="COLLECT"?"collects":"postcommunions";
 const singular=handoff.eventId==="COLLECT"?"collect":"postcommunion";
 const groups=Array.isArray(data?.[slot])&&data[slot].length?
  data[slot]:data?.[singular]?[data[singular]]:[];
 const selected=groups[handoff.sourceOrationGroupIndex-1];
 if(!selected||!finalPrintedCadence(selected.lat??selected.la??""))
  return Object.freeze([]);
 // The source-gate above already certified the response's exact Latin,
 // its immediately preceding prayer, and its unique 65-card cue ownership.
 return Object.freeze([Object.freeze({
  id:"AO.REF.ORATION_FESTIVE_AMEN."+handoff.eventId+
    ".G"+handoff.sourceOrationGroupIndex+"."+paragraph.id,
  sourceId:null,
  sourceName:"Toni Orationum — tonus festivus: Amen",
  sourceUrl:FESTIVE_ORATION_AMEN_SOURCE.sourceUrl,
  sourceFolio:"Graduale Romanum (Solesmes, 1961), p. 114*",
  sourceDocument:"data/mass/oration-amen-notation-source-gate.v1.json",
  sourceCueIds:Object.freeze([paragraph.id]),
  sourceCueLatin:Object.freeze(["℟. Amen."]),
  sourceLatin:"℟. Amen.",
  kind:"PEOPLE_RESPONSE",
  eventId:handoff.eventId,
  toneFamily:"SOLEMN",
  sourceOrationGroupIndex:handoff.sourceOrationGroupIndex,
  sourceOrationDonor:handoff.sourceOrationDonor,
  printVerification:FESTIVE_ORATION_AMEN_SOURCE.sourceVerification,
  publicScoreApproved:false,
  gabc:FESTIVE_ORATION_AMEN_SOURCE.gabc
 })]);
}
