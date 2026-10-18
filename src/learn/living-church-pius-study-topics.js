/**
 * Source-indexed study entry points for St Pius X in the Living Church.
 * Review-only navigation, NOT a historical dialogue, answer catalogue, or
 * reimplementation of the original 433-question Catechism.
 *
 * IDs correspond to the separate style branch's three-turn editorial fixture
 * (PR #1419); the C-level reconstructed replies remain deliberately excluded.
 */
export const PIUS_X_STUDY_TOPIC_REFERRALS_VERSION="AO_PX_REVIEW_TOPICS_V1";
export const PIUS_X_REVIEW_TOPICS=Object.freeze([
 Object.freeze({
  id:"PX-STYL-OUR-LADY-01",objective:"explore",branch:"ideas",
  title:Object.freeze({en:"Our Lady and intercession",fr:"Notre-Dame et l’intercession"}),
  questions:Object.freeze([433,430,431,432])
 }),
 Object.freeze({
  id:"PX-STYL-CHILD-CATECHISM-02",objective:"prepare",branch:"first_communion",
  title:Object.freeze({en:"Preparing a child for First Communion",fr:"Préparer un enfant à la Première Communion"}),
  questions:Object.freeze([342,338,335]),
  contextRequired:"CHILD_PREPARING_FOR_FIRST_COMMUNION"
 }),
 Object.freeze({
  id:"PX-STYL-TEACHING-OBJECTION-03",objective:"defend",branch:"critic",
  title:Object.freeze({en:"Questions about the Church's teaching authority",fr:"Questions sur l’autorité doctrinale de l’Église"}),
  questions:Object.freeze([114,115,236])
 })
]);
const HISTORICAL_DISCIPLINE_REF="PX1912-Q335";
const disciplineNotice=Object.freeze({
 en:"Historical Catechism warning: Q335 describes the Eucharistic fast prescribed in its period, not today's Catholic fasting rule. Do not use this answer alone for current sacramental preparation.",
 fr:"Avertissement historique : la question 335 décrit le jeûne eucharistique prescrit à son époque, non la règle catholique actuelle. Ne l'utilisez pas seule pour la préparation sacramentelle aujourd'hui."
});
export function resolvePiusXReviewTopics(index,{language="en",firstCommunionContext=false}={}){
 const status=index?.status?.();
 if(status?.sourceOwner!=="LTFAITH_PIUS_X_EN_WITNESS"||status.count!==433||
    typeof index.get!=="function"||typeof index.hasRef!=="function")
  throw Error("Existing complete 433-question original witness index required");
 const lang=language==="fr"?"fr":"en";
 return Object.freeze(PIUS_X_REVIEW_TOPICS.map(topic=>{
  const questions=topic.questions.map(number=>{
   const source=index.get(number),ref="PX1912-Q"+String(number).padStart(3,"0");
   if(source?.number!==number||source.ref!==ref||!index.hasRef(ref)||!source.stem||
      source.owner!=="LTFAITH_PIUS_X_EN_WITNESS")
     throw Error("Original source index missing "+ref);
   return Object.freeze({ref,number,stem:source.stem,
    historicalDiscipline:ref===HISTORICAL_DISCIPLINE_REF,
    warning:ref===HISTORICAL_DISCIPLINE_REF?disciplineNotice[lang]:null});
  });
  return Object.freeze({id:topic.id,objective:topic.objective,branch:topic.branch,
   title:topic.title[lang],language:lang,
   enabled:!topic.contextRequired||firstCommunionContext,
   contextRequired:topic.contextRequired||null,
   questions:Object.freeze(questions),
   publication:"REVIEW_ONLY_ORIGINAL_INDEX_REFERENCES",
   historicalSpeech:false,originalAnswersCopied:false});
 }));
}
