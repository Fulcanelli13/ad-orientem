import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";

const registry=JSON.parse(await readFile(new URL("../data/learn/living-church-shared-question-routing-pilot.v1.json",import.meta.url),"utf8"));
const router=createSharedQuestionRouter(registry);
const probes=[
  {
    "q": "Why does the priest lift the Host?",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "Why is that Host raised after consecration?",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "Why does the priest have different vestment colours?",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "What is he doing?",
    "k": "no_coverage",
    "t": null,
    "l": "en"
  },
  {
    "q": "What does that gesture mean?",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "Are we praying to Mary instead of Jesus?",
    "k": "source_navigation",
    "t": "mary.intercession",
    "l": "en"
  },
  {
    "q": "Does invoking saints mean distrusting Christ?",
    "k": "source_navigation",
    "t": "mary.intercession",
    "l": "en"
  },
  {
    "q": "Is the Eucharist actually Jesus or just a symbol?",
    "k": "source_navigation",
    "t": "faith.real_presence",
    "l": "en"
  },
  {
    "q": "That wafer still seems like bread.",
    "k": "source_navigation",
    "t": "faith.real_presence",
    "l": "en"
  },
  {
    "q": "What happens to the bread at Mass?",
    "k": "source_navigation",
    "t": "faith.real_presence",
    "l": "en"
  },
  {
    "q": "Is Christ's Blood also in the Host?",
    "k": "source_navigation",
    "t": "faith.whole_christ",
    "l": "en"
  },
  {
    "q": "But what about his Blood?",
    "k": "source_navigation",
    "t": "faith.whole_christ",
    "l": "en",
    "ctx": "faith.real_presence"
  },
  {
    "q": "Can a Pope ever get things wrong?",
    "k": "source_navigation",
    "t": "church.papal_infallibility",
    "l": "en"
  },
  {
    "q": "When does papal infallibility apply?",
    "k": "source_navigation",
    "t": "church.papal_infallibility",
    "l": "en"
  },
  {
    "q": "What's the difference between being sorry and confessing?",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "How do I properly examine my conscience?",
    "k": "source_navigation",
    "t": "penance.examination",
    "l": "en"
  },
  {
    "q": "What makes contrition perfect?",
    "k": "source_navigation",
    "t": "penance.contrition",
    "l": "en"
  },
  {
    "q": "Tell me about the prayer at the beginning of Mass.",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "What's that square linen thing on the chalice?",
    "k": "offer_handoff",
    "t": "objects.pall",
    "l": "en"
  },
  {
    "q": "Show me the pall.",
    "k": "offer_handoff",
    "t": "objects.pall",
    "l": "en"
  },
  {
    "q": "What's the vessel for burning incense?",
    "k": "offer_handoff",
    "t": "objects.glossary_g194",
    "l": "en"
  },
  {
    "q": "Why is there a red light by the tabernacle?",
    "k": "offer_handoff",
    "t": "objects.sanctuary_lamp",
    "l": "en"
  },
  {
    "q": "What is an amice?",
    "k": "offer_handoff",
    "t": "objects.glossary_g197",
    "l": "en"
  },
  {
    "q": "Who carries the processional cross?",
    "k": "offer_handoff",
    "t": "objects.glossary_g223",
    "l": "en"
  },
  {
    "q": "What is the Canon of the Mass?",
    "k": "offer_handoff",
    "t": "mass.roman_canon",
    "l": "en"
  },
  {
    "q": "Why is the Roman Canon silent?",
    "k": "offer_handoff",
    "t": "mass.roman_canon",
    "l": "en"
  },
  {
    "q": "What happens at the Offertory?",
    "k": "offer_handoff",
    "t": "mass.offertory",
    "l": "en"
  },
  {
    "q": "What is the last Gospel?",
    "k": "offer_handoff",
    "t": "mass.last_gospel",
    "l": "en"
  },
  {
    "q": "Does God exist?",
    "k": "no_coverage",
    "t": "canon.apologetics_apol_001",
    "l": "en"
  },
  {
    "q": "If God is good, why is there evil?",
    "k": "no_coverage",
    "t": "canon.apologetics_apol_003",
    "l": "en"
  },
  {
    "q": "Is sola Scriptura credible?",
    "k": "no_coverage",
    "t": "canon.apologetics_apol_014",
    "l": "en"
  },
  {
    "q": "Did Jesus really rise from the dead?",
    "k": "no_coverage",
    "t": "canon.apologetics_apol_009",
    "l": "en"
  },
  {
    "q": "Can doctrine develop without contradiction?",
    "k": "clarify",
    "t": null,
    "l": "en"
  },
  {
    "q": "What is the SSPX's canonical position?",
    "k": "no_coverage",
    "t": "canon.church_crisis_cr_ecc_05",
    "l": "en"
  },
  {
    "q": "Do all religions lead to the same God?",
    "k": "no_coverage",
    "t": "canon.apologetics_apol_048",
    "l": "en"
  },
  {
    "q": "What does una cum mean?",
    "k": "no_coverage",
    "t": "canon.church_crisis_cr_ecc_10",
    "l": "en"
  },
  {
    "q": "Did Vatican II require the priest face the people?",
    "k": "no_coverage",
    "t": "canon.church_crisis_cr_lit_10",
    "l": "en"
  },
  {
    "q": "Can I earn more to support my family?",
    "k": "no_coverage",
    "t": null,
    "l": "en"
  },
  {
    "q": "What is the current fasting rule before Communion?",
    "k": "no_coverage",
    "t": null,
    "l": "en"
  },
  {
    "q": "How do I reinstall Windows?",
    "k": "no_coverage",
    "t": null,
    "l": "en"
  },
  {
    "q": "Quels sont les ornements liturgiques ?",
    "k": "offer_handoff",
    "t": "objects.vestments",
    "l": "fr"
  },
  {
    "q": "Qu'est-ce que la contrition parfaite ?",
    "k": "source_navigation",
    "t": "penance.contrition",
    "l": "fr"
  },
  {
    "q": "Pourquoi élève-t-on l'hostie ?",
    "k": "clarify",
    "t": null,
    "l": "fr"
  },
  {
    "q": "Pourquoi appelle-t-on Marie à intercéder ?",
    "k": "source_navigation",
    "t": "mary.intercession",
    "l": "fr"
  },
  {
    "q": "Qu'est-ce que la pale sur le calice ?",
    "k": "offer_handoff",
    "t": "objects.pall",
    "l": "fr"
  },
  {
    "q": "Pourquoi le prêtre porte-t-il une chasuble ?",
    "k": "offer_handoff",
    "t": "objects.glossary_g200",
    "l": "fr"
  },
  {
    "q": "Qu'est-ce que le Canon romain ?",
    "k": "offer_handoff",
    "t": "mass.roman_canon",
    "l": "fr"
  },
  {
    "q": "La FSSPX est-elle schismatique ?",
    "k": "no_coverage",
    "t": "canon.church_crisis_cr_ecc_05",
    "l": "fr"
  },
  {
    "q": "Pourquoi avoir remplacé le latin à la Messe ?",
    "k": "no_coverage",
    "t": "canon.church_crisis_cr_lit_09",
    "l": "fr"
  },
  {
    "q": "La fin justifie-t-elle les moyens ?",
    "k": "no_coverage",
    "t": "canon.apologetics_apol_052",
    "l": "fr"
  },
  {
    "q": "Quel est le jeûne eucharistique actuel ?",
    "k": "no_coverage",
    "t": null,
    "l": "fr"
  }
];
let pass=0;
const fails=[];
for(const p of probes){
 const opts={language:p.l,currentCharacter:"pius-x",...(p.ctx?{context:{activeTopicId:p.ctx}}:{})};
 const out=router.match(p.q,opts);
 const ok=out.kind===p.k&&(!p.t||out.topicId===p.t);
 if(ok)pass++;
 else fails.push({q:p.q,expected:{kind:p.k,topicId:p.t},actual:{kind:out.kind,topicId:out.topicId||null,reason:out.reason||null,candidates:out.options?.map(x=>x.topicId)}});
 assert.equal(out.answerText,null,"Router generated answer for "+p.q);
 assert.equal(out.approvedReply||false,false);
}
for(const f of fails)console.log("RETRIEVAL_PROBE_MISS "+JSON.stringify(f));
console.log("SHARED_QUESTION_PILOT "+JSON.stringify({total:probes.length,pass,miss:fails.length,accuracy:Number((100*pass/probes.length).toFixed(1)),qualification:"HAND_CURATED_NONINDEPENDENT_DOES_NOT_CERTIFY_SEMANTIC_RETRIEVAL"}));
// Exploratory quality gate stays conservative; publication is separately prohibited.
assert.ok(pass>=Math.ceil(probes.length*.58),"Too many misses in deterministic pilot");
