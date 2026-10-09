/**
 * Sequential prayer-card definitions. These are reading/rubric cues, not
 * substitutes for the Catholic prayer text or new asserted devotional forms.
 * Source texts and 11/13 canonical order remain in traditional-pray-data.js.
 */
import {
 MORNING_PRAYER_SEQUENCE_V381,
 EVENING_PRAYER_SEQUENCE_V381
} from "./traditional-pray-data.js";

export const DAILY_GUIDED_STEPS=Object.freeze({
 morning:Object.freeze(MORNING_PRAYER_SEQUENCE_V381.map(([id,title,note],index)=>
  Object.freeze({id,title,note,index,kind:"canonical-prayer"}))),
 evening:Object.freeze(EVENING_PRAYER_SEQUENCE_V381.map(([id,title,note],index)=>
  Object.freeze({id,title,note,index,kind:id==="pray.nightly_examen"?"examination":"canonical-prayer"})))
});

export const NIGHTLY_EXAMEN_CARDS=Object.freeze([
 Object.freeze({
  id:"recollect",titleEn:"Recollection & thanksgiving",titleFr:"Recueillement et action de grâces",
  bodyEn:"Place yourself before God. Give thanks for the graces and good received today; ask for light to examine your freely chosen actions without anxiety.",
  bodyFr:"Mettez-vous en présence de Dieu. Remerciez-Le des grâces reçues aujourd’hui et demandez la lumière pour examiner vos actes librement choisis sans inquiétude."
 }),
 Object.freeze({
  id:"god",titleEn:"Duties towards God",titleFr:"Devoirs envers Dieu",
  bodyEn:"Consider prayer, worship, faithfulness and your deliberate acts or omissions in duties towards God.",
  bodyFr:"Examinez la prière, le culte, la fidélité et les actes ou omissions volontaires dans vos devoirs envers Dieu."
 }),
 Object.freeze({
  id:"neighbour",titleEn:"Duties towards your neighbour",titleFr:"Devoirs envers le prochain",
  bodyEn:"Consider charity, justice, truth, patience, forgiveness and the care owed to those entrusted to you today.",
  bodyFr:"Examinez la charité, la justice, la vérité, la patience, le pardon et l’attention due à ceux qui vous ont été confiés aujourd’hui."
 }),
 Object.freeze({
  id:"self",titleEn:"Your own conduct",titleFr:"Votre conduite",
  bodyEn:"Consider your thoughts, words, habits, duties, use of time and self-command. An unwanted temptation is not itself a deliberate sin. Stop when your review is sufficient.",
  bodyFr:"Examinez vos pensées, paroles, habitudes, devoirs, l’usage du temps et la maîtrise de vous-même. Une tentation non voulue n’est pas, en elle-même, un péché délibéré. Arrêtez lorsque l’examen est suffisant."
 }),
 Object.freeze({
  id:"resolve",titleEn:"Contrition & resolution",titleFr:"Contrition et résolution",
  bodyEn:"Ask God's pardon, make a sincere act of contrition and choose one concrete amendment. This short daily exercise is not a substitute for sacramental Confession.",
  bodyFr:"Demandez pardon à Dieu, faites un acte sincère de contrition et prenez une résolution concrète. Ce bref exercice quotidien ne remplace pas la Confession sacramentelle."
 })
]);

export function guidedDailyCards(daypart){
 if(daypart!=="morning"&&daypart!=="evening")throw Error("Unknown Catholic daily prayer sequence");
 return DAILY_GUIDED_STEPS[daypart];
}
export function clampPrayerCardStep(index,count){
 if(!Number.isInteger(count)||count<1)throw Error("Empty guided prayer card sequence");
 const n=Number.isFinite(index)?Math.trunc(index):0;
 return Math.max(0,Math.min(count,n));
}
export function guidedStepLabel(index,count,lang="en"){
 if(!Number.isSafeInteger(index)||!Number.isSafeInteger(count)||count<1||index<0||index>count)throw Error("Invalid guided prayer step");
 if(index===count)return lang==="fr"?"Terminé":"Finished";
 return lang==="fr"?`Étape ${index+1} sur ${count}`:`Step ${index+1} of ${count}`;
}
