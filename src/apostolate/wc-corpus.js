import { APOSTOLATE_HANDOFF_DIRECTIONS } from "./contracts.js";

const formation=(fromId,targetId,reason)=>Object.freeze({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId,
  targetId,
  reason,
});
const owned=(surface,targetId,reason)=>Object.freeze({surface,targetId,reason});
const step=(en,fr)=>Object.freeze({en,fr});

export const APOSTOLATE_WC_CORPUS_VERSION="APOSTOLATE_WC_CORPUS_V1";

export const APOSTOLATE_WC_SCENARIOS=Object.freeze([
  Object.freeze({
    id:"WC01",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"A colleague asks me a serious religious question",
      fr:"Un collègue me pose une question religieuse sérieuse",
    }),
    text:Object.freeze({
      en:"Listen long enough to discover the actual question before answering. Clarify what the person means, give the shortest sound Catholic answer you can support, and say openly when something needs checking. If the question needs more than a brief answer, use the relevant Formation or apologetics material rather than inventing a second knowledge base in the conversation.",
      fr:"Écoutez assez longtemps pour découvrir la vraie question avant de répondre. Clarifiez ce que la personne veut dire, donnez la réponse catholique juste la plus courte que vous puissiez appuyer, et dites franchement lorsqu’un point doit être vérifié. Si la question demande davantage qu’une brève réponse, utilisez Formation ou le contenu apologétique pertinent plutôt que d’inventer une seconde base doctrinale dans la conversation.",
    }),
    explanation:Object.freeze({
      en:"Christian witness includes being ready to account for the faith, but that duty does not excuse careless or improvised answers. Leo XIII teaches the obligation to show forth the faith when needed; St Peter joins readiness to answer with meekness and reverence. Apostolate therefore owns the human exchange while Formation and the AQ corpus own the doctrinal depth.",
      fr:"Le témoignage chrétien comprend la disponibilité à rendre raison de la foi, mais ce devoir n’autorise ni l’improvisation ni les réponses négligentes. Léon XIII enseigne le devoir de manifester la foi lorsque cela est nécessaire ; saint Pierre unit la disponibilité à répondre à la douceur et au respect. Apostolate possède donc l’échange humain, tandis que Formation et le corpus AQ possèdent l’approfondissement doctrinal.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not answer before understanding what the person is actually asking.","Do not bluff when you do not know.","Do not turn a colleague’s sincere question into a debate they did not ask for.","Do not make personal opinion sound like defined Catholic doctrine."]),
      fr:Object.freeze(["Ne pas répondre avant d’avoir compris ce que la personne demande réellement.","Ne pas bluffer lorsque vous ne savez pas.","Ne pas transformer la question sincère d’un collègue en débat qu’il n’a pas demandé.","Ne pas présenter une opinion personnelle comme une doctrine catholique définie."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF07","APF09"]),
    sourceStrength:"PRIMARY",
    workSocial:Object.freeze({
      discern:step("Determine the actual question and whether the person wants information, a reason, or help with an objection.","Déterminez la vraie question et si la personne cherche une information, une raison de croire ou une aide face à une objection."),
      respond:step("Give one proportionate answer; use the matching AQ scenario when it exists and Formation when doctrinal depth is needed.","Donnez une réponse proportionnée ; utilisez le scénario AQ correspondant lorsqu’il existe et Formation lorsqu’un approfondissement doctrinal est nécessaire."),
      boundary:step("If the answer is uncertain, say so and verify it before continuing; do not improvise Church teaching.","Si la réponse est incertaine, dites-le et vérifiez-la avant de poursuivre ; n’improvisez pas l’enseignement de l’Église."),
      handoff:step("Deepen through Formation or the relevant AQ answer rather than creating parallel doctrine in Work & Social Life.","Approfondissez par Formation ou la réponse AQ pertinente au lieu de créer une doctrine parallèle dans Vie professionnelle et sociale."),
    }),
    sourceIds:Object.freeze(["LEO-XIII-SAPIENTIAE","DR-1PET3","PIUS-X-ACERBO-NIMIS"]),
    handoffs:Object.freeze([
      formation("WC01","learn.catechism","Formation owns the canonical doctrinal content behind the answer."),
      owned("apostolate","AQ","Use the matching AQ scenario when the question corresponds to a frozen apologetic objection."),
    ]),
  }),
  Object.freeze({
    id:"WC02",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Someone mocks or attacks the Faith",
      fr:"Quelqu’un se moque de la foi ou l’attaque",
    }),
    text:Object.freeze({
      en:"First distinguish a real objection from mockery, insult or bad faith. A sincere objection deserves a clear answer. Mockery may call for one calm correction, a redirection, or simply ending the exchange. You are not obliged to keep arguing merely because someone continues provoking you.",
      fr:"Distinguez d’abord une véritable objection de la moquerie, de l’insulte ou de la mauvaise foi. Une objection sincère mérite une réponse claire. La moquerie peut demander une correction calme, une réorientation ou simplement la fin de l’échange. Vous n’êtes pas obligé de continuer à argumenter simplement parce que quelqu’un poursuit la provocation.",
    }),
    explanation:Object.freeze({
      en:"The duty to defend and confess the faith is compatible with refusing fruitless wrangling. Leo XIII speaks of showing forth the faith when needed; St Paul warns against foolish disputes and requires the Lord’s servant not to wrangle but to be mild and able to teach. The correct response therefore depends on the disposition and conduct of the other person, not only on the words of the objection.",
      fr:"Le devoir de défendre et de confesser la foi est compatible avec le refus des disputes stériles. Léon XIII parle du devoir de manifester la foi lorsque cela est nécessaire ; saint Paul avertit contre les questions insensées et demande au serviteur du Seigneur d’éviter les querelles, d’être doux et capable d’enseigner. La bonne réponse dépend donc aussi de la disposition et de la conduite de l’interlocuteur, et pas seulement des mots de l’objection.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not answer mockery with mockery.","Do not mistake persistence or aggression for a duty to keep debating.","Do not label a sincere question as bad faith merely because it is difficult.","Do not use apologetics as permission for workplace hostility or personal retaliation."]),
      fr:Object.freeze(["Ne pas répondre à la moquerie par la moquerie.","Ne pas confondre insistance ou agressivité avec un devoir de poursuivre le débat.","Ne pas qualifier de mauvaise foi une question sincère simplement parce qu’elle est difficile.","Ne pas utiliser l’apologétique comme permission pour l’hostilité au travail ou la vengeance personnelle."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF06","APF07","APF08"]),
    sourceStrength:"PRIMARY",
    workSocial:Object.freeze({
      discern:step("Classify the exchange: sincere objection, teasing, insult, repeated provocation, or genuine bad faith.","Classez l’échange : objection sincère, plaisanterie, insulte, provocation répétée ou véritable mauvaise foi."),
      respond:step("Answer a sincere objection; for mockery, use a calm correction or redirection rather than escalating.","Répondez à une objection sincère ; face à la moquerie, corrigez calmement ou réorientez plutôt que d’escalader."),
      boundary:step("End the exchange when it has become fruitless, hostile or merely repetitive; charity does not require wrangling.","Mettez fin à l’échange lorsqu’il devient stérile, hostile ou simplement répétitif ; la charité n’exige pas la querelle."),
      handoff:step("If a sincere doctrinal question remains, move to the relevant AQ/Formation content after the social exchange is stabilized.","Si une question doctrinale sincère subsiste, passez ensuite au contenu AQ/Formation pertinent une fois l’échange social stabilisé."),
    }),
    sourceIds:Object.freeze(["LEO-XIII-SAPIENTIAE","DR-2TIM2","DR-1PET3"]),
    handoffs:Object.freeze([
      formation("WC02","learn.catechism","Formation owns doctrinal depth when a sincere objection remains."),
      owned("apostolate","AQ","Use the matching AQ scenario only when there is a genuine objection to answer."),
    ]),
  }),
  Object.freeze({
    id:"WC03",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I invite someone to Mass?",
      fr:"Comment inviter quelqu’un à la Messe ?",
    }),
    text:Object.freeze({
      en:"Make a concrete, low-pressure invitation: name the church, date and time, offer to meet them there, and make it easy to say no. If they accept, help with the practical first-visit questions and then hand off to DV01, Explore and Mass preparation. Treat the person as a friend or colleague, not as a prospect.",
      fr:"Faites une invitation concrète et sans pression : donnez l’église, la date et l’heure, proposez de retrouver la personne sur place et laissez-lui la liberté de refuser facilement. Si elle accepte, aidez-la avec les questions pratiques d’une première visite puis passez à DV01, Explorer et la préparation à la Messe. Traitez la personne comme un ami ou un collègue, non comme un prospect.",
    }),
    explanation:Object.freeze({
      en:"Lay apostolate is exercised through ordinary relationships as well as organized works. Pius X describes Catholic action as taking forms suited to concrete circumstances, while Leo XIII insists on truth joined to charity. An invitation to Mass should therefore be truthful, practical and free of manipulation; once accepted, the actual liturgical preparation belongs to the existing Mass and Explore owners.",
      fr:"L’apostolat des laïcs s’exerce dans les relations ordinaires comme dans les œuvres organisées. Saint Pie X décrit l’action catholique comme prenant des formes adaptées aux circonstances concrètes, tandis que Léon XIII unit le témoignage de la vérité à la charité. Une invitation à la Messe doit donc être vraie, pratique et dépourvue de manipulation ; une fois acceptée, la préparation liturgique appartient aux modules existants de Messe et d’Explorer.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not pressure someone after a clear refusal.","Do not hide what kind of Mass or community you are inviting them to.","Do not frame friendship as a conversion funnel or the person as a prospect.","Do not overload the invitation itself with a long apologetics lecture."]),
      fr:Object.freeze(["Ne pas faire pression après un refus clair.","Ne pas cacher le type de Messe ou de communauté auquel vous invitez la personne.","Ne pas traiter l’amitié comme un entonnoir de conversion ni la personne comme un prospect.","Ne pas surcharger l’invitation elle-même d’un long exposé apologétique."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF08","APF09"]),
    sourceStrength:"PRIMARY",
    workSocial:Object.freeze({
      discern:step("Choose an appropriate person and moment; invitation is not pressure and does not require a prior debate.","Choisissez une personne et un moment appropriés ; une invitation n’est pas une pression et ne suppose pas un débat préalable."),
      respond:step("Offer one concrete invitation with the actual place, time and your practical accompaniment.","Faites une invitation concrète avec le lieu, l’heure et votre accompagnement pratique."),
      boundary:step("Respect a refusal immediately and preserve the relationship without repeated pressure.","Respectez immédiatement un refus et préservez la relation sans pression répétée."),
      handoff:step("If accepted, open DV01, then Explore/Find, Mass preparation and the Mass reader at the appropriate moment.","Si l’invitation est acceptée, ouvrez DV01, puis Explorer, la préparation à la Messe et le lecteur de Messe au moment approprié."),
    }),
    sourceIds:Object.freeze(["PIUS-X-IL-FERMO-PROPOSITO","LEO-XIII-SAPIENTIAE","MR62-ORDINARY"]),
    handoffs:Object.freeze([
      owned("apostolate","DV01","DV01 owns the first-traditional-Mass on-ramp after the invitation is accepted."),
      owned("find","find","Explore/Find owns venue discovery and practical church information."),
      owned("mass","mass.prepare","Before Mass owns immediate liturgical preparation."),
      formation("WC03","learn.mass","Formation owns deeper explanation of the traditional Mass."),
      owned("mass","mass","The Mass reader owns live following once the liturgy begins."),
    ]),
  }),
]);
