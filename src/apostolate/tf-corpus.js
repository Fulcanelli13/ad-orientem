import { APOSTOLATE_HANDOFF_DIRECTIONS } from "./contracts.js";

const formation=(fromId,targetId,reason)=>Object.freeze({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId,
  targetId,
  reason,
});
const owned=(surface,targetId,reason)=>Object.freeze({surface,targetId,reason});
const step=(en,fr)=>Object.freeze({en,fr});

export const APOSTOLATE_TF_CORPUS_VERSION="APOSTOLATE_TF_CORPUS_V1";

export const APOSTOLATE_TF_SCENARIOS=Object.freeze([
  Object.freeze({
    id:"TF01",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I explain a Catechism answer to a child?",
      fr:"Comment expliquer une réponse du Catéchisme à un enfant ?",
    }),
    text:Object.freeze({
      en:"Begin with the one truth the child actually needs to understand. Use plain words, one concrete example, and one practical consequence. Do not empty the doctrine of meaning, but do not bury it under adult vocabulary either.",
      fr:"Commencez par l’unique vérité que l’enfant doit réellement comprendre. Employez des mots simples, un exemple concret et une conséquence pratique. Ne videz pas la doctrine de son sens, mais ne l’enterrez pas non plus sous un vocabulaire d’adulte.",
    }),
    explanation:Object.freeze({
      en:"St Pius X insisted that catechetical teaching must be plain, simple and adapted to the intelligence of the hearer, while also requiring serious preparation from the catechist. Apostolate therefore owns the teaching act—how to explain—while Formation remains the canonical owner of the doctrine itself.",
      fr:"Saint Pie X insiste pour que l’enseignement catéchétique soit clair, simple et adapté à l’intelligence de l’auditeur, tout en exigeant une préparation sérieuse de la part du catéchiste. Apostolate possède donc l’acte d’enseigner — comment expliquer — tandis que Formation reste propriétaire canonique de la doctrine elle-même.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not replace doctrine with a vague moral story.","Do not read an adult explanation word-for-word to a small child.","Do not improvise a doctrinal answer when the canonical Catechism can be checked first."]),
      fr:Object.freeze(["Ne pas remplacer la doctrine par une vague histoire morale.","Ne pas lire mot pour mot une explication d’adulte à un jeune enfant.","Ne pas improviser une réponse doctrinale lorsque le Catéchisme canonique peut d’abord être vérifié."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF05","APF07","APF09"]),
    doctrineRefs:Object.freeze(["learn.catechism"]),
    sourceStrength:"PRIMARY_PLUS_CATECHETICAL",
    teaching:Object.freeze({
      understand:step("Find out what the child already understands and what single point is confusing.","Vérifiez ce que l’enfant comprend déjà et quel point précis lui pose difficulté."),
      minimum:step("State one correct line from the doctrine in child-sized language.","Formulez une seule ligne juste de la doctrine dans un langage adapté à l’enfant."),
      prepare:step("Choose one example and one short question that checks understanding.","Choisissez un exemple et une courte question permettant de vérifier la compréhension."),
      launch:step("Open the canonical Catechism entry when the exact wording or wider doctrine is needed.","Ouvrez l’entrée canonique du Catéchisme lorsque le texte exact ou la doctrine plus large est nécessaire."),
      followUp:step("Ask the child to say the idea back simply rather than merely repeat your words.","Demandez à l’enfant de redire simplement l’idée plutôt que de répéter vos mots."),
    }),
    sourceIds:Object.freeze(["PIUS-X-ACERBO-NIMIS","ST-PIUS-X-CATECHISM-FR","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("TF01","learn.catechism","Formation owns the canonical doctrine and exact Catechism content."),
    ]),
  }),
  Object.freeze({
    id:"TF02",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I explain Catholic doctrine to an adult who is new to it?",
      fr:"Comment expliquer la doctrine catholique à un adulte qui la découvre ?",
    }),
    text:Object.freeze({
      en:"First identify whether the person needs the basic doctrine, a reason for believing it, or an answer to an objection. Explain the minimum needed for that question, define unfamiliar terms, and only then deepen the subject.",
      fr:"Commencez par identifier si la personne a besoin de la doctrine de base, d’une raison de la croire ou d’une réponse à une objection. Expliquez le minimum nécessaire pour cette question, définissez les termes inconnus, puis approfondissez seulement ensuite.",
    }),
    explanation:Object.freeze({
      en:"St Pius X explicitly required adult catechesis in a plain and simple style adapted to the intelligence of the hearers. That means Apostolate should not dump a whole treatise on a beginner. Formation supplies the doctrinal content; the relevant AQ scenario can handle a concrete objection when one appears.",
      fr:"Saint Pie X exige explicitement que la catéchèse des adultes soit faite dans un langage clair et simple, adapté à l’intelligence des auditeurs. Apostolate ne doit donc pas déverser un traité entier sur un débutant. Formation fournit le contenu doctrinal ; le scénario AQ pertinent peut traiter une objection concrète lorsqu’elle se présente.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not confuse an honest beginner with a hostile objector.","Do not answer five questions when the person asked one.","Do not introduce specialist terminology without defining it.","Do not use secondary apologetic summaries as though they outrank primary Church sources."]),
      fr:Object.freeze(["Ne pas confondre un débutant sincère avec un objecteur hostile.","Ne pas répondre à cinq questions lorsque la personne n’en a posé qu’une.","Ne pas introduire de terminologie spécialisée sans la définir.","Ne pas présenter des résumés apologétiques secondaires comme supérieurs aux sources primaires de l’Église."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF05","APF06","APF07","APF09"]),
    doctrineRefs:Object.freeze(["learn.catechism"]),
    sourceStrength:"PRIMARY_PLUS_CATECHETICAL",
    teaching:Object.freeze({
      understand:step("Identify whether the need is doctrine, reason, objection, or simple vocabulary.","Identifiez si le besoin porte sur la doctrine, sa raison, une objection ou simplement le vocabulaire."),
      minimum:step("Give the shortest complete Catholic answer that resolves the immediate question.","Donnez la réponse catholique complète la plus courte qui résout la question immédiate."),
      prepare:step("Define the key term and choose one primary source or Catechism reference for support.","Définissez le terme clé et choisissez une source primaire ou une référence catéchétique pour l’appuyer."),
      launch:step("Open Formation for doctrine; use the matching AQ scenario only if the question is genuinely apologetic.","Ouvrez Formation pour la doctrine ; utilisez le scénario AQ correspondant seulement si la question est réellement apologétique."),
      followUp:step("Ask what remains unclear before adding another layer.","Demandez ce qui reste obscur avant d’ajouter une nouvelle couche d’explication."),
    }),
    sourceIds:Object.freeze(["PIUS-X-ACERBO-NIMIS","ST-PIUS-X-CATECHISM-FR","PENNY-CATECHISM","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("TF02","learn.catechism","Formation owns the doctrine; Apostolate owns the act of introducing it."),
    ]),
  }),
  Object.freeze({
    id:"TF03",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"What should I do when I don’t know the answer?",
      fr:"Que faire lorsque je ne connais pas la réponse ?",
    }),
    text:Object.freeze({
      en:"Say that you do not know yet. Then identify exactly what needs to be checked, consult the canonical Formation/source material, and return with a sourced answer. Admitting a limit is better apostolate than confidently inventing one.",
      fr:"Dites que vous ne savez pas encore. Identifiez ensuite précisément ce qui doit être vérifié, consultez les sources canoniques de Formation, puis revenez avec une réponse sourcée. Reconnaître une limite est un meilleur apostolat que d’inventer une réponse avec assurance.",
    }),
    explanation:Object.freeze({
      en:"Acerbo Nimis warns that catechetical teaching requires careful study and preparation even when the audience is inexperienced. The Apostolate source discipline therefore treats uncertainty as a routing problem, not permission to improvise: narrow the question, inspect the source, distinguish doctrine from custom or prudence, and only then answer.",
      fr:"Acerbo Nimis avertit que l’enseignement catéchétique exige étude et préparation sérieuses même lorsque l’auditoire est peu instruit. La discipline des sources d’Apostolate traite donc l’incertitude comme un problème d’orientation, non comme une permission d’improviser : préciser la question, vérifier la source, distinguer doctrine, coutume et prudence, puis seulement répondre.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not bluff.","Do not turn a personal guess into a Church teaching.","Do not use ‘I think’ to conceal that the source has not been checked.","Do not keep debating while the key factual or doctrinal premise is unresolved."]),
      fr:Object.freeze(["Ne pas bluffer.","Ne pas transformer une opinion personnelle en enseignement de l’Église.","Ne pas employer « je pense » pour masquer qu’aucune source n’a été vérifiée.","Ne pas poursuivre le débat tant que la prémisse doctrinale ou factuelle essentielle n’est pas résolue."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF07","APF08","APF09"]),
    doctrineRefs:Object.freeze(["learn.catechism"]),
    sourceStrength:"PRIMARY",
    teaching:Object.freeze({
      understand:step("Restate the exact question and separate what is known from what is uncertain.","Reformulez la question exacte et séparez ce qui est connu de ce qui est incertain."),
      minimum:step("Say clearly that the unresolved point needs verification; do not fill the gap.","Dites clairement que le point non résolu doit être vérifié ; ne comblez pas le vide par une invention."),
      prepare:step("Classify the question—doctrine, liturgy, discipline, history, custom or prudence—and find the corresponding source owner.","Classez la question — doctrine, liturgie, discipline, histoire, coutume ou prudence — et trouvez le propriétaire de source correspondant."),
      launch:step("Open the relevant Formation/source material before answering further.","Ouvrez la matière pertinente de Formation et ses sources avant de poursuivre la réponse."),
      followUp:step("Return with the source, answer only what it supports, and identify any remaining uncertainty.","Revenez avec la source, ne répondez que ce qu’elle permet d’affirmer et signalez toute incertitude restante."),
    }),
    sourceIds:Object.freeze(["PIUS-X-ACERBO-NIMIS","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("TF03","learn.catechism","Check canonical doctrine before answering an unresolved doctrinal question."),
    ]),
  }),
  Object.freeze({
    id:"TF04",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I teach someone to pray the Rosary?",
      fr:"Comment apprendre à quelqu’un à prier le Rosaire ?",
    }),
    text:Object.freeze({
      en:"Teach the structure first, then pray it together. Explain the mysteries, show where the Our Father, Hail Mary and Glory Be occur, and let the person follow one decade before expecting them to remember the whole sequence.",
      fr:"Enseignez d’abord la structure, puis priez ensemble. Expliquez les mystères, montrez où se placent le Notre Père, le Je vous salue Marie et le Gloire au Père, puis laissez la personne suivre une dizaine avant d’attendre qu’elle mémorise toute la séquence.",
    }),
    explanation:Object.freeze({
      en:"Pius XII strongly commended the Rosary, including its recitation in the family, but Apostolate does not need a second Rosary engine. The teaching act is to make the structure intelligible and then launch the canonical Rosary owner, where the actual mysteries and prayers already live.",
      fr:"Pie XII recommande fortement le Rosaire, y compris sa récitation en famille, mais Apostolate n’a pas besoin d’un second moteur de Rosaire. L’acte d’enseignement consiste à rendre sa structure intelligible puis à ouvrir le module canonique du Rosaire, où se trouvent déjà les mystères et les prières.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not begin with every optional devotion attached to the Rosary.","Do not require memorization before allowing the person to pray along.","Do not duplicate the Rosary prayer text or mystery engine inside Apostolate."]),
      fr:Object.freeze(["Ne pas commencer par toutes les dévotions facultatives associées au Rosaire.","Ne pas exiger la mémorisation avant de permettre à la personne de prier avec vous.","Ne pas dupliquer dans Apostolate les textes ou le moteur des mystères du Rosaire."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF09"]),
    doctrineRefs:Object.freeze(["learn.catechism"]),
    sourceStrength:"PRIMARY",
    teaching:Object.freeze({
      understand:step("Ask whether the person has ever seen or prayed a Rosary and what they already recognize.","Demandez si la personne a déjà vu ou prié un Rosaire et ce qu’elle reconnaît déjà."),
      minimum:step("Explain beads, decades and mysteries in one short sequence.","Expliquez en une courte séquence les grains, les dizaines et les mystères."),
      prepare:step("Choose one mystery and show the prayers needed for a single decade.","Choisissez un mystère et montrez les prières nécessaires pour une seule dizaine."),
      launch:step("Open the canonical Rosary and pray together in simple or guided mode.","Ouvrez le Rosaire canonique et priez ensemble en mode simple ou guidé."),
      followUp:step("At the end, ask the learner to identify the next step in the sequence without testing every prayer from memory.","À la fin, demandez à l’apprenant d’identifier l’étape suivante sans l’interroger sur chaque prière de mémoire."),
    }),
    sourceIds:Object.freeze(["PIUS-XII-INGRUENTIUM-MALORUM","COMPENDIUM-BASIC-PRAYERS"]),
    handoffs:Object.freeze([
      owned("pray","pray.rosary","The actual Rosary remains owned by PRAY."),
    ]),
  }),
  Object.freeze({
    id:"TF05",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I explain the traditional Mass to a newcomer?",
      fr:"Comment expliquer la Messe traditionnelle à un nouveau venu ?",
    }),
    text:Object.freeze({
      en:"Give the newcomer a map before giving a commentary. Explain that the Mass has a stable order, that much of the priest’s prayer may be quiet, and that the central action is the sacramental sacrifice of Christ made present at the altar. Then help them follow only the major landmarks on the first visit.",
      fr:"Donnez d’abord une carte de la Messe avant d’en donner un commentaire détaillé. Expliquez que la Messe possède un ordre stable, qu’une grande partie des prières du prêtre peut être dite à voix basse, et que l’action centrale est le sacrifice sacramentel du Christ rendu présent à l’autel. Aidez ensuite le nouveau venu à suivre seulement les grands repères lors de sa première Messe.",
    }),
    explanation:Object.freeze({
      en:"Trent identifies the Mass as the sacramental offering of the same Christ whose sacrifice was offered on Calvary, while Pius XII explains the liturgy as the public worship of the Mystical Body. The newcomer therefore needs orientation to the action and structure before detailed rubrics. Formation owns the course; the Mass reader owns live following.",
      fr:"Trente identifie la Messe comme l’offrande sacramentelle du même Christ dont le sacrifice fut offert au Calvaire, tandis que Pie XII explique la liturgie comme le culte public du Corps mystique. Le nouveau venu a donc besoin d’être orienté vers l’action et la structure avant d’entrer dans le détail des rubriques. Formation possède le cours ; le lecteur de Messe possède le suivi en direct.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not overload a first-time visitor with every gesture and rubric.","Do not imply that quiet prayer means nothing is happening.","Do not describe the Mass as a second sacrifice of Christ.","Do not turn Apostolate into a duplicate Mass reader."]),
      fr:Object.freeze(["Ne pas surcharger un nouveau venu avec tous les gestes et toutes les rubriques.","Ne pas laisser entendre que les prières silencieuses signifient qu’il ne se passe rien.","Ne pas décrire la Messe comme un second sacrifice du Christ.","Ne pas transformer Apostolate en copie du lecteur de Messe."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF09"]),
    doctrineRefs:Object.freeze(["learn.mass"]),
    sourceStrength:"PRIMARY",
    teaching:Object.freeze({
      understand:step("Ask whether the person is attending for the first time and what they most want help following.","Demandez si la personne assiste pour la première fois et ce qu’elle souhaite surtout pouvoir suivre."),
      minimum:step("Give three anchors: order of the Mass, sacrificial centre, and the fact that some prayers are quiet.","Donnez trois repères : l’ordre de la Messe, son centre sacrificiel et le fait que certaines prières sont dites à voix basse."),
      prepare:step("Choose only a few visible landmarks—Gospel, Offertory, Consecration, Communion and ending.","Choisissez seulement quelques repères visibles — Évangile, Offertoire, Consécration, Communion et fin."),
      launch:step("Use Understand the Mass for formation, then the Mass reader for live following.","Utilisez Comprendre la Messe pour la formation, puis le lecteur de Messe pour le suivi en direct."),
      followUp:step("After Mass, ask what remained confusing and deepen only that part.","Après la Messe, demandez ce qui est resté obscur et approfondissez seulement ce point."),
    }),
    sourceIds:Object.freeze(["TRENT-XXII-MASS","PIUS-XII-MEDIATOR-DEI","MR62-ORDINARY"]),
    handoffs:Object.freeze([
      formation("TF05","learn.mass","Formation owns the structured course explaining the Roman Mass."),
      owned("mass","mass","The Mass reader owns live following during the liturgy."),
    ]),
  }),
]);
