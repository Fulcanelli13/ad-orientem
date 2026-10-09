/**
 * Sacramental Confession presentation choices. Three paths share the same
 * indispensable confession of unconfessed grave sins by kind and number.
 * "General confession" here means a private life/period review, NEVER the
 * exceptional rite of collective general absolution.
 *
 * No history, marked sins, categories, timeline, or examination answers are
 * stored: the presentation owner keeps only session-local route/step state.
 *
 * Primary doctrine: CIC 959–960, 987–989; CCC 1454–1458.
 */
export const CONFESSION_PATHS=Object.freeze({
 regular:Object.freeze({
  id:"regular",titleEn:"Quick / regular Confession",titleFr:"Confession habituelle · rapide",
  descriptionEn:"For someone who confesses regularly. A concise but complete examination of sins since the last good Confession.",
  descriptionFr:"Pour une personne qui se confesse régulièrement. Un examen bref mais complet des péchés depuis la dernière bonne confession.",
  situationEn:"I have been to Confession recently",situationFr:"Je me suis confessé récemment"
 }),
 returning:Object.freeze({
  id:"returning",titleEn:"Returning after a long absence",titleFr:"Revenir après une longue absence",
  descriptionEn:"For someone returning after months or years. A slower, step-by-step examination and help with what to say to the priest.",
  descriptionFr:"Pour une personne qui revient après des mois ou des années. Un examen plus progressif et une aide pour parler au prêtre.",
  situationEn:"It has been a long time",situationFr:"Cela fait longtemps"
 }),
 general:Object.freeze({
  id:"general",titleEn:"General Confession",titleFr:"Confession générale",
  descriptionEn:"An optional review of a whole life or a substantial period, preferably agreed with a confessor. Not required simply because it has been years.",
  descriptionFr:"Une revue facultative de toute sa vie ou d’une longue période, de préférence en accord avec un confesseur. Non obligatoire simplement parce que plusieurs années ont passé.",
  situationEn:"I wish to prepare a general Confession",situationFr:"Je souhaite préparer une confession générale"
 })
});
export const CONFESSION_SOURCE_LINKS=Object.freeze([
 Object.freeze({label:"Catechism §§1454–1458",url:"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vii_the_acts_of_the_penitent.html"}),
 Object.freeze({label:"Canon law, can. 987–989",url:"https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann959-997_en.html"})
]);
const returningPrelude=Object.freeze([
 Object.freeze({id:"return-priest",en:"Return to Confession",fr:"Revenir à la confession",
  bodyEn:"You may simply begin: 'Father, it has been a long time since my last Confession, and I would appreciate your help.' If there is much to discuss, consider arranging a longer time.",
  bodyFr:"Vous pouvez commencer simplement : « Mon Père, il y a longtemps que je ne me suis pas confessé et j’aurais besoin de votre aide. » Si vous avez beaucoup à dire, envisagez de demander un rendez-vous."}),
 Object.freeze({id:"return-period",en:"Review the intervening period",fr:"Revoir le temps écoulé",
  bodyEn:"Recall the approximate time since your last good Confession and important changes in your duties or way of life. Do not invent exact dates or counts: if a grave sin recurred, explain its approximate frequency honestly.",
  bodyFr:"Rappelez-vous approximativement le temps écoulé depuis votre dernière bonne confession ainsi que les changements importants de votre vie. N’inventez ni dates ni nombres exacts : si un péché grave s’est répété, indiquez honnêtement sa fréquence approximative."})
]);
const generalPrelude=Object.freeze([
 Object.freeze({id:"general-scope",en:"Agree the scope with a priest",fr:"Préciser la portée avec un prêtre",
  bodyEn:"A general Confession is a more extensive personal review, sometimes of a whole life or a major period. Tell the priest that you are preparing one and ask how far back to review. This is not collective 'general absolution'.",
  bodyFr:"Une confession générale est une revue personnelle plus étendue, parfois de toute la vie ou d’une longue période. Expliquez au prêtre votre démarche et demandez-lui quelle période revoir. Il ne s’agit pas d’une « absolution générale » collective."}),
 Object.freeze({id:"general-period",en:"Look across the period",fr:"Parcourir la période choisie",
  bodyEn:"Consider the stages and responsibilities of your life within the period agreed with the priest: home, work, relationships, faith and sacramental life. Attend to grave sins not yet confessed, without constructing an exhaustive autobiography.",
  bodyFr:"Considérez les étapes et responsabilités de votre vie pour la période convenue avec le prêtre : famille, travail, relations, foi et vie sacramentelle. Repérez les péchés graves non encore confessés, sans chercher à produire une autobiographie exhaustive."}),
 Object.freeze({id:"general-forgiven",en:"Do not reopen forgiven sins compulsively",fr:"Ne pas rouvrir compulsivement les péchés pardonnés",
  bodyEn:"Sins already sincerely confessed and absolved need not be confessed again. A priest may guide a broader life review for spiritual reasons; do not repeatedly reconfess forgiven sins through anxiety or scruples.",
  bodyFr:"Les péchés déjà sincèrement confessés et absous n’ont pas à être confessés de nouveau. Un prêtre peut guider une revue de vie pour des raisons spirituelles ; ne répétez pas compulsivement l’accusation des péchés déjà pardonnés."})
]);
const conclusion=Object.freeze({
 id:"ready",en:"Prepare to speak to the priest",fr:"Se préparer à parler au prêtre",
 bodyEn:"Gather the grave sins you remember after a diligent but reasonable examination, stating their kind and number as best you can. You may also confess venial sins. Express sorrow and purpose of amendment; the priest will help with uncertainty.",
 bodyFr:"Rassemblez les péchés graves dont vous vous souvenez après un examen diligent mais raisonnable, en indiquant leur espèce et leur nombre aussi honnêtement que possible. Vous pouvez également confesser les péchés véniels. Exprimez le repentir et la résolution de vous amender ; le prêtre vous aidera en cas d’incertitude."
});
export function confessionExaminationCards(path,sections){
 if(!CONFESSION_PATHS[path])throw Error("Unknown Confession path");
 if(!Array.isArray(sections)||sections.length!==10||sections.some(s=>!Array.isArray(s)||!Array.isArray(s[1])||s[1].length<1))
  throw Error("Confession requires ten original commandment examination sections");
 if(path==="regular")return Object.freeze([]);
 const prelude=path==="returning"?returningPrelude:generalPrelude;
 const questionCards=sections.map((section,i)=>Object.freeze({
  id:"commandment-"+(i+1),kind:"questions",title:section[0],
  questions:Object.freeze([...section[1]])
 }));
 return Object.freeze([
  ...prelude.map(c=>Object.freeze({...c,kind:"reflection"})),
  ...questionCards,
  Object.freeze({...conclusion,kind:"reflection"})
 ]);
}
export function confessionStepAt(index,length){
 if(!Number.isInteger(length)||length<1)throw Error("Empty Confession examination");
 return Math.min(length-1,Math.max(0,Number.isFinite(index)?Math.trunc(index):0));
}
export function confessionPath(id){return CONFESSION_PATHS[id]||null;}
