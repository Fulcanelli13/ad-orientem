/**
 * Prayer B30 — Little Crown of the Holy Infant Jesus (AO-AQ-029).
 * Exact 15-bead historical core: 3 Pater in honour of Jesus, Mary and Joseph,
 * then 12 Ave in honour of the twelve years of Our Lord's childhood.
 * The aspiration precedes EVERY bead. Do not insert unsupported 12-event
 * meditations, later medal prayers, a Gloria or a modern indulgence grant.
 * EN: L. R. Mace, CTS Ireland no. bh340a (1940), digital text / PDF page 11.
 * FR: ICKSP France "Dévotions à l'Enfant-Jésus" independently agrees.
 * The rendered digital PDF is not certified to be original print photography.
 */
import {PRAY_CANONICAL_DATA_V435930} from "./canonical-data.js";
const CANON=PRAY_CANONICAL_DATA_V435930.prayers;
export const LITTLE_CROWN_B30_SOURCE=Object.freeze({
 candidateId:"AO-AQ-029",
 title:"Little Crown of the Holy Infant Jesus",
 historicalEnglishWitness:"L. R. Mace, The Holy Infant of Prague, Catholic Truth Society of Ireland, bh340a (1940), Little Chaplet of the Holy Infant Jesus",
 historicalEnglishUrl:"https://www.pamphlets.info/Ireland/ctsibh340a/",
 historicalPdfUrl:"https://www.pamphlets.info/Ireland/ctsibh340a.pdf",
 frenchIndependentWitness:"ICKSP France, Dévotions à l'Enfant-Jésus, La petite couronne",
 frenchUrl:"https://icrspfrance.fr/?page=child-jesus-devotions",
 printedOriginalPagePhotographicallyCollated:false,
 languageNotice:"EN aspiration matches the 1940 digital witness; FR aspiration is from the separate ICKSP devotional witness; Latin aspiration is John 1:14 Vulgate, not represented as 1940 text.",
 prayersCopiedFromCanonical:true,
 medalPrayerImported:false,
 optionalTwelveMysteryMeditationsImported:false,
 endingGloriaImported:false,
 historicalIndulgencesClaimedCurrent:false,
 physicalChapletRequired:false,
 permittedForms:Object.freeze(["en","fr","la"])
});
export const LITTLE_CROWN_B30_ASPIRATION=Object.freeze({
 en:"And the Word was made Flesh and dwelt amongst us.",
 fr:"Et le Verbe s'est fait chair, et il a habité parmi nous.",
 la:"Et Verbum caro factum est, et habitavit in nobis."
});
const FAMILY=Object.freeze([
 Object.freeze({id:"jesus",en:"Jesus",fr:"Jésus"}),
 Object.freeze({id:"mary",en:"Mary",fr:"Marie"}),
 Object.freeze({id:"joseph",en:"Joseph",fr:"Joseph"})
]);
export const LITTLE_CROWN_B30_BEADS=Object.freeze(Array.from({length:15},(_,index)=>Object.freeze({
 id:index<3?"holy-family-"+FAMILY[index].id:"holy-childhood-"+(index-2),
 index,group:index<3?"holy-family":"childhood",
 order:index<3?index+1:index-2,
 prayerId:index<3?"foundations_our_father":"foundations_hail_mary"
})));
export function littleCrownStep(index,language="en"){
 if(!Number.isInteger(index)||index<0||index>=15||!LITTLE_CROWN_B30_SOURCE.permittedForms.includes(language))return null;
 const bead=LITTLE_CROWN_B30_BEADS[index];
 const prayer=CANON[bead.prayerId];if(!prayer?.[language])return null;
 return Object.freeze({
  ...bead,language,total:15,isLast:index===14,aspiration:LITTLE_CROWN_B30_ASPIRATION[language],
  label:bead.group==="holy-family"?(language==="fr"?FAMILY[index].fr:FAMILY[index].en):
   (language==="fr"?"Année de l'Enfance "+bead.order:"Year of the Holy Childhood "+bead.order),
  heading:bead.group==="holy-family"?(language==="fr"?"La Sainte Famille":"The Holy Family"):
   (language==="fr"?"Les douze années de l'Enfance":"The twelve years of the Holy Childhood"),
  prayerText:prayer[language],prayerTitle:language==="fr"?(prayer.titleFr||prayer.title):prayer.title,
  sourceId:bead.prayerId
 });
}
