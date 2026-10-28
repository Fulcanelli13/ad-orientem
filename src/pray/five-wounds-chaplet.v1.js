/**
 * Five Wounds (Passionist) chaplet — existing Chaplets and Passion contexts.
 *
 * Historical forms are NOT interchangeable with the Holy Wounds chaplet
 * popularized later. Leo XII's Dec 1823 simplified formula is five sets of
 * five Gloria Patri, with one Ave Maria after each set in the documented
 * Raccolta recension. Wounds: left foot, right foot, left hand, right hand,
 * side. No invented opening/closing prayer, mandatory medals, blessings,
 * religious-society membership or claim about current indulgences.
 *
 * Historical support:
 * Passionist historical archives, 1821–1823 decree history:
 * https://passionistarchives.org/chaplet-of-the-five-wounds-its-history-blessing-and-indulgences/
 * The Raccolta, Jesus Crucified, §32 (1857 collection transcription):
 * https://www.liturgialatina.org/raccolta/crucified.htm
 * The New Raccolta (1903), §9 (independent published wording):
 * https://www.todayscatholicworld.com/Raccolta-Imp-1903.pdf
 */
import { PRAY_CANONICAL_DATA_V435930 } from "./canonical-data.js";
const CANON=PRAY_CANONICAL_DATA_V435930.prayers;
export const FIVE_WOUNDS_SOURCE_V1=Object.freeze({
 id:"raccolta_1857_five_wounds",
 label:{en:"Chaplet of the Five Wounds",fr:"Chapelet des Cinq Plaies"},
 family:"passion",
 historicalOrder:"Passionist simplified form (Leo XII, 1823); Raccolta after-each-set Ave wording",
 sources:Object.freeze([
 "https://passionistarchives.org/chaplet-of-the-five-wounds-its-history-blessing-and-indulgences/",
 "https://www.liturgialatina.org/raccolta/crucified.htm"
 ]),
 historicalIndulgencesCurrent:false,
 optionalMedalsRequired:false,
 originalBlessingMandatory:false,
 verifiedPrayerIds:Object.freeze(["foundations_glory_be","foundations_hail_mary"]),
 version:"2026-10-28-b17"
});
const WOUNDS=Object.freeze([
 Object.freeze({id:"left-foot",en:"Wound in His left foot",fr:"Plaie de son pied gauche"}),
 Object.freeze({id:"right-foot",en:"Wound in His right foot",fr:"Plaie de son pied droit"}),
 Object.freeze({id:"left-hand",en:"Wound in His left hand",fr:"Plaie de sa main gauche"}),
 Object.freeze({id:"right-hand",en:"Wound in His right hand",fr:"Plaie de sa main droite"}),
 Object.freeze({id:"side",en:"Wound in His sacred side",fr:"Plaie de son côté sacré"})
]);
export const FIVE_WOUNDS_WOUNDS_V1=WOUNDS;
export const FIVE_WOUNDS_CHAPLET_V1=Object.freeze(WOUNDS.flatMap((wound,group)=>{
 const base=Array.from({length:5},(_,j)=>Object.freeze({
   id:wound.id+"-gloria-"+(j+1),woundId:wound.id,
   group,bead:j,kind:"gloria",prayerId:"foundations_glory_be"
 }));
 return [...base,Object.freeze({
   id:wound.id+"-ave",woundId:wound.id,group,bead:5,
   kind:"ave",prayerId:"foundations_hail_mary"
 })];
}));
export function fiveWoundsStep(index,language="en"){
 if(!Number.isInteger(index)||index<0||index>=FIVE_WOUNDS_CHAPLET_V1.length)return null;
 if(!["en","fr","la"].includes(language))return null;
 const step=FIVE_WOUNDS_CHAPLET_V1[index],record=CANON[step.prayerId];
 const wound=WOUNDS[step.group];
 if(!record?.[language])return null;
 return Object.freeze({
   ...step,index,total:FIVE_WOUNDS_CHAPLET_V1.length,
   wound:language==="fr"?wound.fr:wound.en,
   woundNumber:step.group+1,
   withinGroup:step.bead+1,
   isGroupStart:step.bead===0,isLast:index===FIVE_WOUNDS_CHAPLET_V1.length-1,
   prayerTitle:language==="fr"?(record.titleFr||record.title):record.title,
   text:record[language],
   sourceId:step.prayerId
 });
}
export function fiveWoundsGroupProgress(index){
 const step=FIVE_WOUNDS_CHAPLET_V1[index];
 if(!step)return null;
 return Object.freeze({
  group:step.group+1,totalGroups:5,position:step.bead+1,
  totalInGroup:6,completed:index+1,total:FIVE_WOUNDS_CHAPLET_V1.length,
  final:index===FIVE_WOUNDS_CHAPLET_V1.length-1
 });
}
