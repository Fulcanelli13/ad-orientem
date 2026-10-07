const freezePair=(en,fr)=>Object.freeze({en,fr});
const freezeList=(en,fr)=>Object.freeze({en:Object.freeze(en),fr:Object.freeze(fr)});

export const APOSTOLATE_SKILL_CORPUS_VERSION="APOSTOLATE_SKILL_CORPUS_V1";

export const APOSTOLATE_SKILL_CORPUS=Object.freeze([
  Object.freeze({
    id:"APF01",publication:"READY",
    title:freezePair("Apostolic spirit","Esprit apostolique"),
    summary:freezePair(
      "Seek the other person’s good, not the satisfaction of winning.",
      "Cherchez le bien de l’autre, non la satisfaction de gagner."
    ),
    explanation:freezePair(
      "Catholic apostolate begins in charity, prayer and fidelity to truth. Zeal is not measured by how many arguments are won, but by whether one bears witness to Christ prudently and helps the other person move toward the good.",
      "L’apostolat catholique commence dans la charité, la prière et la fidélité à la vérité. Le zèle ne se mesure pas au nombre d’arguments remportés, mais à la manière de témoigner du Christ avec prudence et d’aider l’autre à avancer vers le bien."
    ),
    practice:freezeList(
      ["Pray briefly for the person before or after the conversation.","Ask what concrete good you are trying to serve.","Prefer one useful next step to a display of knowledge."],
      ["Priez brièvement pour la personne avant ou après l’échange.","Demandez-vous quel bien concret vous cherchez à servir.","Préférez une prochaine étape utile à une démonstration de connaissances."]
    ),
    avoid:freezeList(
      ["Do not make another person a project or a score.","Do not confuse zeal with pressure.","Do not sacrifice truth in order to appear agreeable."],
      ["Ne faites pas de l’autre personne un projet ou un score.","Ne confondez pas zèle et pression.","Ne sacrifiez pas la vérité pour paraître agréable."]
    ),
    sourceStrength:"PRIMARY",
    sourceIds:Object.freeze(["LEO-XIII-SAPIENTIAE","PIUS-X-IL-FERMO-PROPOSITO"]),
    scenarioRefs:Object.freeze(["WC03","FH01","DV01"]),
  }),
  Object.freeze({
    id:"APF02",publication:"READY",
    title:freezePair("Listen before answering","Écouter avant de répondre"),
    summary:freezePair(
      "Hear the question, the concern behind it and the words the person is actually using.",
      "Écoutez la question, la préoccupation qui la sous-tend et les mots réellement employés par la personne."
    ),
    explanation:freezePair(
      "A good answer begins by hearing accurately. Scripture warns against answering before hearing and commends readiness to hear before speaking. In practice, this means clarifying the question before selecting doctrine, apologetics or pastoral help.",
      "Une bonne réponse commence par une écoute exacte. L’Écriture met en garde contre le fait de répondre avant d’avoir entendu et recommande d’être prompt à écouter avant de parler. En pratique, cela signifie clarifier la question avant de choisir doctrine, apologétique ou aide pastorale."
    ),
    practice:freezeList(
      ["Let the person finish the question.","Repeat the concern back in your own words.","Ask one clarifying question when two different issues are mixed together."],
      ["Laissez la personne terminer sa question.","Reformulez la préoccupation avec vos propres mots.","Posez une seule question de clarification lorsque deux problèmes différents sont mêlés."]
    ),
    avoid:freezeList(
      ["Do not answer the question you expected instead of the one asked.","Do not interrupt merely to correct terminology.","Do not treat silence as agreement."],
      ["Ne répondez pas à la question que vous attendiez au lieu de celle qui a été posée.","N’interrompez pas simplement pour corriger le vocabulaire.","Ne prenez pas le silence pour un accord."]
    ),
    sourceStrength:"PRIMARY",
    sourceIds:Object.freeze(["DR-JAS1","DR-PROV18","DR-1PET3"]),
    scenarioRefs:Object.freeze(["WC01","HS07","TF02"]),
  }),
  Object.freeze({
    id:"APF03",publication:"READY",
    title:freezePair("Discern the real need","Discerner le vrai besoin"),
    summary:freezePair(
      "Decide whether the person needs doctrine, an answer to an objection, practical help, reassurance or referral.",
      "Déterminez si la personne a besoin de doctrine, d’une réponse à une objection, d’une aide pratique, d’être rassurée ou d’être orientée."
    ),
    explanation:freezePair(
      "The same words can conceal very different needs. A doctrinal doubt, fear of Confession, grief and hostile mockery should not trigger the same response. Discernment prevents over-answering and sends the person to the owner that can actually help.",
      "Les mêmes mots peuvent cacher des besoins très différents. Un doute doctrinal, la peur de la Confession, le deuil et une moquerie hostile ne doivent pas déclencher la même réponse. Le discernement évite les réponses excessives et oriente vers le module réellement compétent."
    ),
    practice:freezeList(
      ["Classify the need before choosing a response.","Ask what would be most useful right now.","Use the smallest adequate owner: AQ, Formation, PRAY, Mass, Explore or a priest."],
      ["Classez le besoin avant de choisir une réponse.","Demandez ce qui serait le plus utile maintenant.","Utilisez le propriétaire le plus ciblé : AQ, Formation, PRAY, Messe, Explorer ou un prêtre."]
    ),
    avoid:freezeList(
      ["Do not turn every pastoral problem into apologetics.","Do not turn every objection into a long catechism lesson.","Do not assume the app is the right owner for every problem."],
      ["Ne transformez pas tout problème pastoral en apologétique.","Ne transformez pas toute objection en long cours de catéchisme.","Ne supposez pas que l’application soit le bon propriétaire de chaque problème."]
    ),
    sourceStrength:"MIXED_VERIFIED",
    sourceIds:Object.freeze(["DR-PROV18","PIUS-X-ACERBO-NIMIS"]),
    scenarioRefs:Object.freeze(["HS05","WC02","DV02"]),
  }),
  Object.freeze({
    id:"APF04",publication:"READY",
    title:freezePair("Explain clearly","Expliquer clairement"),
    summary:freezePair(
      "Give the shortest complete explanation the person can actually understand.",
      "Donnez l’explication complète la plus courte que la personne puisse réellement comprendre."
    ),
    explanation:freezePair(
      "St Pius X repeatedly insists that catechesis be plain, simple and adapted to the hearer, while still requiring preparation from the teacher. Clarity is not doctrinal dilution: it is accurate teaching without unnecessary complexity.",
      "Saint Pie X insiste à plusieurs reprises pour que la catéchèse soit claire, simple et adaptée à l’auditeur, tout en exigeant une préparation sérieuse de celui qui enseigne. La clarté n’est pas un affaiblissement doctrinal : c’est un enseignement exact sans complexité inutile."
    ),
    practice:freezeList(
      ["State one central proposition first.","Define one unfamiliar term at a time.","Use an example only if it clarifies rather than replaces the doctrine."],
      ["Énoncez d’abord une proposition centrale.","Définissez un terme inconnu à la fois.","N’utilisez un exemple que s’il éclaire la doctrine au lieu de la remplacer."]
    ),
    avoid:freezeList(
      ["Do not answer a beginner with a treatise.","Do not substitute slogans for doctrine.","Do not use technical words without defining them."],
      ["Ne répondez pas à un débutant par un traité.","Ne remplacez pas la doctrine par des slogans.","N’employez pas de termes techniques sans les définir."]
    ),
    sourceStrength:"PRIMARY_PLUS_CATECHETICAL",
    sourceIds:Object.freeze(["PIUS-X-ACERBO-NIMIS","ST-PIUS-X-CATECHISM-FR"]),
    scenarioRefs:Object.freeze(["TF01","TF02","AQ03"]),
  }),
  Object.freeze({
    id:"APF05",publication:"READY",
    title:freezePair("Charity, fairness & tact","Charité, équité et tact"),
    summary:freezePair(
      "Represent both the Catholic position and the other person’s concern fairly.",
      "Présentez avec équité à la fois la position catholique et la préoccupation de l’interlocuteur."
    ),
    explanation:freezePair(
      "Christian witness requires truth joined to meekness, reverence and charity. Fairness means answering the strongest reasonable form of the objection rather than caricaturing it; tact means choosing a form and moment that serve the person rather than humiliating them.",
      "Le témoignage chrétien exige que la vérité soit unie à la douceur, au respect et à la charité. L’équité consiste à répondre à la forme raisonnable la plus forte de l’objection plutôt qu’à la caricaturer ; le tact consiste à choisir une forme et un moment qui servent la personne au lieu de l’humilier."
    ),
    practice:freezeList(
      ["State the other person’s concern in a form they would recognize.","Correct without sarcasm.","Separate criticism of an idea from contempt for a person."],
      ["Formulez la préoccupation de l’autre d’une manière qu’il reconnaîtrait.","Corrigez sans sarcasme.","Distinguez la critique d’une idée du mépris d’une personne."]
    ),
    avoid:freezeList(
      ["Do not use ridicule as an apologetic technique.","Do not attribute motives you cannot know.","Do not soften a doctrine by misrepresenting what the Church teaches."],
      ["N’utilisez pas le ridicule comme technique apologétique.","N’attribuez pas des intentions que vous ne pouvez connaître.","N’adoucissez pas une doctrine en déformant ce que l’Église enseigne."]
    ),
    sourceStrength:"PRIMARY",
    sourceIds:Object.freeze(["DR-1PET3","LEO-XIII-SAPIENTIAE"]),
    scenarioRefs:Object.freeze(["WC01","WC02","HS07"]),
  }),
  Object.freeze({
    id:"APF06",publication:"READY",
    title:freezePair("Handle objections without wrangling","Traiter les objections sans querelle"),
    summary:freezePair(
      "Answer a real objection; do not become trapped in a fruitless quarrel.",
      "Répondez à une véritable objection ; ne vous laissez pas enfermer dans une querelle stérile."
    ),
    explanation:freezePair(
      "St Paul explicitly distinguishes teaching from wrangling and warns against foolish disputes. Apostolate therefore permits a clear answer, correction and follow-up, but it also requires recognizing when an exchange has ceased to be truth-seeking.",
      "Saint Paul distingue explicitement l’enseignement de la querelle et met en garde contre les disputes insensées. Apostolate permet donc une réponse claire, une correction et un suivi, mais exige aussi de reconnaître lorsqu’un échange ne recherche plus la vérité."
    ),
    practice:freezeList(
      ["Answer one objection at a time.","Ask whether the answer addressed the actual point.","End or pause the exchange when it becomes merely repetitive or hostile."],
      ["Traitez une objection à la fois.","Demandez si la réponse a traité le point réel.","Mettez fin à l’échange ou suspendez-le lorsqu’il devient seulement répétitif ou hostile."]
    ),
    avoid:freezeList(
      ["Do not chase every new objection indefinitely.","Do not answer aggression with aggression.","Do not mistake the ability to continue arguing for an obligation to continue."],
      ["Ne poursuivez pas indéfiniment chaque nouvelle objection.","Ne répondez pas à l’agressivité par l’agressivité.","Ne confondez pas la possibilité de continuer à argumenter avec l’obligation de le faire."]
    ),
    sourceStrength:"PRIMARY",
    sourceIds:Object.freeze(["DR-2TIM2","DR-1PET3"]),
    scenarioRefs:Object.freeze(["WC02","AQ08","AQ03"]),
  }),
  Object.freeze({
    id:"APF07",publication:"READY",
    title:freezePair("Know what you do not know","Savoir ce que l’on ne sait pas"),
    summary:freezePair(
      "Admit uncertainty, identify the missing point and verify it before teaching.",
      "Reconnaissez l’incertitude, identifiez le point manquant et vérifiez-le avant d’enseigner."
    ),
    explanation:freezePair(
      "Preparation is part of responsible catechesis. When the decisive doctrinal or factual premise is uncertain, the correct apostolic act is to verify it rather than fill the gap with confidence, memory or guesswork.",
      "La préparation fait partie d’une catéchèse responsable. Lorsque la prémisse doctrinale ou factuelle décisive est incertaine, l’acte apostolique correct consiste à la vérifier plutôt qu’à combler le vide par l’assurance, la mémoire ou une supposition."
    ),
    practice:freezeList(
      ["Say plainly when a point needs checking.","Name the kind of source required: doctrine, law, liturgy, history or custom.","Return with the source and limit the answer to what it supports."],
      ["Dites clairement lorsqu’un point doit être vérifié.","Nommez le type de source nécessaire : doctrine, droit, liturgie, histoire ou coutume.","Revenez avec la source et limitez la réponse à ce qu’elle permet d’affirmer."]
    ),
    avoid:freezeList(
      ["Do not bluff.","Do not turn memory into a citation.","Do not keep debating while the key premise is unresolved."],
      ["Ne bluffez pas.","Ne transformez pas un souvenir en citation.","Ne poursuivez pas le débat tant que la prémisse essentielle n’est pas résolue."]
    ),
    sourceStrength:"PRIMARY",
    sourceIds:Object.freeze(["PIUS-X-ACERBO-NIMIS","DR-PROV18"]),
    scenarioRefs:Object.freeze(["TF03","WC01","AQ03"]),
  }),
  Object.freeze({
    id:"APF08",publication:"READY",
    title:freezePair("Know your boundaries","Connaître ses limites"),
    summary:freezePair(
      "Know when to stop explaining and hand the matter to the sacrament, pastor or competent owner.",
      "Sachez quand cesser d’expliquer et confier la question au sacrement, au pasteur ou au propriétaire compétent."
    ),
    explanation:freezePair(
      "Lay apostolate does not erase the distinct offices and responsibilities of the Church. The faithful have a right to spiritual assistance from their pastors; practical apostolate should therefore recognize questions that require a priest, sacrament, canonical judgment, medical care or another competent authority.",
      "L’apostolat des laïcs n’efface pas les fonctions et responsabilités distinctes dans l’Église. Les fidèles ont droit aux secours spirituels de leurs pasteurs ; l’apostolat pratique doit donc reconnaître les questions qui exigent un prêtre, un sacrement, un jugement canonique, des soins médicaux ou une autre autorité compétente."
    ),
    practice:freezeList(
      ["Name the boundary explicitly when it matters.","Route sacramental questions to the sacramental owner or priest.","Use emergency, medical or safeguarding channels when the issue is not fundamentally an apologetics problem."],
      ["Nommez explicitement la limite lorsqu’elle compte.","Orientez les questions sacramentelles vers le module compétent ou le prêtre.","Utilisez les circuits d’urgence, médicaux ou de protection lorsqu’il ne s’agit pas fondamentalement d’un problème apologétique."]
    ),
    avoid:freezeList(
      ["Do not simulate a priest, confessor, tribunal or clinician.","Do not certify sacramental readiness or validity from an app conversation.","Do not use ‘apostolate’ as a reason to intrude into matters beyond your competence."],
      ["Ne simulez pas un prêtre, un confesseur, un tribunal ou un clinicien.","Ne certifiez pas l’aptitude ou la validité sacramentelle à partir d’une conversation dans l’application.","N’utilisez pas « l’apostolat » comme raison de vous immiscer dans des questions hors de votre compétence."]
    ),
    sourceStrength:"MIXED_VERIFIED",
    sourceIds:Object.freeze(["CIC83-213","LEO-XIII-SAPIENTIAE"]),
    scenarioRefs:Object.freeze(["HS06","DV02","FH05"]),
  }),
  Object.freeze({
    id:"APF09",publication:"READY",
    title:freezePair("Practise, follow up & deepen","Pratiquer, suivre et approfondir"),
    summary:freezePair(
      "Prepare before difficult conversations, follow up afterward and deepen the part that actually proved difficult.",
      "Préparez les échanges difficiles, assurez un suivi ensuite et approfondissez le point qui s’est réellement révélé difficile."
    ),
    explanation:freezePair(
      "Apostolate is learned through serious preparation and repeated faithful practice. Follow-up should serve the person and improve future competence, not create pressure or surveillance. Formation supplies depth; Apostolate supplies the practical exercise of helping another person.",
      "L’apostolat s’apprend par une préparation sérieuse et une pratique fidèle répétée. Le suivi doit servir la personne et améliorer la compétence future, non créer pression ou surveillance. Formation fournit la profondeur ; Apostolate fournit l’exercice pratique d’aider une autre personne."
    ),
    practice:freezeList(
      ["Review the source before a predictable difficult conversation.","Afterward, note one point that was unclear and study that point.","Follow up once when useful, without repeated pressure."],
      ["Relisez la source avant un échange difficile prévisible.","Ensuite, relevez un point resté obscur et étudiez ce point.","Assurez un suivi lorsque cela est utile, sans pression répétée."]
    ),
    avoid:freezeList(
      ["Do not treat people as practice targets.","Do not collect private pastoral details merely for training.","Do not confuse repetition with growth if the same sourcing error persists."],
      ["Ne traitez pas les personnes comme des cibles d’entraînement.","Ne recueillez pas de détails pastoraux privés simplement pour vous exercer.","Ne confondez pas répétition et progrès si la même erreur de source persiste."]
    ),
    sourceStrength:"PRIMARY",
    sourceIds:Object.freeze(["PIUS-X-ACERBO-NIMIS","PIUS-X-IL-FERMO-PROPOSITO"]),
    scenarioRefs:Object.freeze(["TF01","TF03","WC03"]),
  }),
]);
