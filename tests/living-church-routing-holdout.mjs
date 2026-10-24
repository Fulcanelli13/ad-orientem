import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
const json=JSON.parse(await readFile(new URL("../data/learn/living-church-shared-question-routing-pilot.v1.json",import.meta.url),"utf8"));
const router=createSharedQuestionRouter(json);
const cases=[
  {
    "q": "I can see bread at the altar. How can that be our Lord?",
    "expect": "faith.real_presence",
    "lang": "en"
  },
  {
    "q": "When the priest says the words over the bread, what happens?",
    "expect": "faith.real_presence",
    "lang": "en"
  },
  {
    "q": "Are the saints taking the place of Jesus as mediators?",
    "expect": "mary.intercession",
    "lang": "en"
  },
  {
    "q": "Why are Catholics asking dead saints for prayers?",
    "expect": "mary.intercession",
    "lang": "en"
  },
  {
    "q": "Is someone who is sorry for sin ready for confession?",
    "expect": "penance.contrition",
    "lang": "en"
  },
  {
    "q": "Do I need to examine myself before confession?",
    "expect": "penance.examination",
    "lang": "en"
  },
  {
    "q": "What is that hard square thing on the chalice?",
    "expect": "objects.pall",
    "lang": "en"
  },
  {
    "q": "Which tiny cloth does the priest wipe the chalice with?",
    "expect": "objects.purificator",
    "lang": "en"
  },
  {
    "q": "Why is there a candle shining near where the Hosts are kept?",
    "expect": "objects.sanctuary_lamp",
    "lang": "en"
  },
  {
    "q": "Where are consecrated hosts kept between Masses?",
    "expect": "objects.tabernacle",
    "lang": "en"
  },
  {
    "q": "Who is the fellow walking in front carrying the incense?",
    "expect": "objects.glossary_g221",
    "lang": "en"
  },
  {
    "q": "I saw a priest with the garment around his neck.",
    "expect": "objects.glossary_g199",
    "lang": "en"
  },
  {
    "q": "Why does the priest kneel after consecration?",
    "expect": "mass.gestures_meaning",
    "lang": "en"
  },
  {
    "q": "Why is there a kiss on the altar?",
    "expect": "mass.altar_reverence",
    "lang": "en"
  },
  {
    "q": "Does the Church permit the pope to say anything he wants?",
    "expect": "church.papal_infallibility",
    "lang": "en"
  },
  {
    "q": "Is the old Mass just an old-fashioned performance?",
    "expect": "canon.church_crisis_cr_lit_05",
    "lang": "en"
  },
  {
    "q": "Was the traditional Mass ever suppressed?",
    "expect": "canon.church_crisis_cr_aut_07",
    "lang": "en"
  },
  {
    "q": "How can an infallible Church contain wicked priests?",
    "expect": "canon.apologetics_apol_017",
    "lang": "en"
  },
  {
    "q": "Is SSPX basically Protestant?",
    "expect": "canon.church_crisis_cr_ecc_05",
    "lang": "en"
  },
  {
    "q": "Explain sola scriptura versus Tradition.",
    "expect": "canon.apologetics_apol_014",
    "lang": "en"
  },
  {
    "q": "I want to change my password.",
    "expect": "UNKNOWN",
    "lang": "en"
  },
  {
    "q": "Why does that guy have a hat?",
    "expect": "UNKNOWN",
    "lang": "en"
  },
  {
    "q": "Le prêtre change le pain en quoi exactement ?",
    "expect": "faith.real_presence",
    "lang": "fr"
  },
  {
    "q": "Pourquoi l'Église invoque-t-elle les saints ?",
    "expect": "mary.intercession",
    "lang": "fr"
  },
  {
    "q": "Où conserve-t-on les hosties consacrées ?",
    "expect": "objects.tabernacle",
    "lang": "fr"
  },
  {
    "q": "À quoi sert le petit linge pour essuyer le calice ?",
    "expect": "objects.purificator",
    "lang": "fr"
  },
  {
    "q": "Que représente ce carré blanc sur le calice ?",
    "expect": "objects.pall",
    "lang": "fr"
  },
  {
    "q": "Pourquoi parle-t-on du Cœur immaculé de Marie ?",
    "expect": "UNKNOWN",
    "lang": "fr"
  },
  {
    "q": "Un prêtre est-il obligé d'obéir à tous les ordres ?",
    "expect": "canon.church_crisis_cr_aut_02",
    "lang": "fr"
  },
  {
    "q": "Qu'est-ce qui s'est passé à Assise en 1986 ?",
    "expect": "canon.church_crisis_cr_idm_07",
    "lang": "fr"
  }
];
let correct=0,understood=0,wrongSpecific=0;
const byChar=id=>json.topics.find(x=>x.id===id);
for(const x of cases){
 const r=router.match(x.q,{language:x.lang,currentCharacter:"pius-x"});
 assert.equal(r.answerText,null);
 if(r.kind==="handoff_context")throw Error("Unexpected automatic transfer");
 const found=r.topicId||null;
 const correctCase=x.expect==="UNKNOWN"?(r.kind==="no_coverage"||r.kind==="clarify"):(found===x.expect);
 if(correctCase)correct++;
 if(r.kind==="no_coverage"||r.kind==="clarify")understood++;
 if(found!==x.expect&&found&&r.kind!=="no_coverage"){
  wrongSpecific++;
 }
 if(!correctCase)console.log("HOLDOUT_MISS "+JSON.stringify({question:x.q,language:x.lang,expected:x.expect,
   returned:found,kind:r.kind,options:r.options?.map(o=>o.topicId)||null}));
}
const metrics={count:cases.length,correct,recallPercent:Number((correct/cases.length*100).toFixed(1)),safeClarificationsOrAbstentions:understood,
 wrongSpecific,description:"Exploratory second-set questions, not an independent population estimate"};
console.log("HOLDOUT_OBSERVATION "+JSON.stringify(metrics));
assert.equal(cases.length,30);
assert.equal(json.state,"RESEARCH_ONLY_NOT_IN_APP");
assert.equal(json.policy.canGenerateNewDoctrinalAnswer,false);
