import { APOSTOLATE_HANDOFF_DIRECTIONS } from "./contracts.js";

const formation=(fromId,targetId,reason)=>Object.freeze({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId,
  targetId,
  reason,
});
const owned=(surface,targetId,reason)=>Object.freeze({surface,targetId,reason});

export const APOSTOLATE_FH_CORPUS_VERSION="APOSTOLATE_FH_CORPUS_V1";

export const APOSTOLATE_FH_SCENARIOS=Object.freeze([
  Object.freeze({
    id:"FH01",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I start a family Rosary?",
      fr:"Comment commencer le Rosaire en famille ?",
    }),
    text:Object.freeze({
      en:"Keep the first step simple: choose a regular time, gather the household, and pray five decades attentively. If young children cannot manage the whole Rosary at first, build toward it without turning family prayer into a contest or punishment.",
      fr:"Gardez le premier pas simple : choisissez une heure régulière, réunissez la famille et priez cinq dizaines avec attention. Si de jeunes enfants ne peuvent pas encore suivre tout le Rosaire, progressez vers celui-ci sans transformer la prière familiale en concours ou en punition.",
    }),
    explanation:Object.freeze({
      en:"Pius XII explicitly urged that the family recitation of the Rosary be adopted and preserved in Christian homes. The practical responsibility here belongs to parents and household leaders; Apostolate should help them begin and then hand the actual prayer to the canonical Rosary owner.",
      fr:"Pie XII a explicitement demandé que la récitation familiale du Rosaire soit adoptée et conservée dans les foyers chrétiens. La responsabilité pratique revient ici aux parents et responsables du foyer ; Apostolate doit les aider à commencer puis confier la prière elle-même au module canonique du Rosaire.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not shame a family because children are restless.","Do not present one household schedule as universally binding.","Do not rebuild the Rosary player inside Apostolate."]),
      fr:Object.freeze(["Ne pas culpabiliser une famille parce que les enfants sont agités.","Ne pas présenter un horaire domestique unique comme universellement obligatoire.","Ne pas reconstruire le lecteur du Rosaire dans Apostolate."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF09"]),
    sourceIds:Object.freeze(["PIUS-XII-INGRUENTIUM-MALORUM","CIC83-226"]),
    handoffs:Object.freeze([
      owned("pray","pray.rosary","The actual Rosary belongs to the canonical PRAY Rosary owner."),
    ]),
  }),
  Object.freeze({
    id:"FH02",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do we begin saying grace at meals?",
      fr:"Comment commencer le bénédicité aux repas ?",
    }),
    text:Object.freeze({
      en:"Begin with the traditional grace before meals and keep it consistent. A short blessing said faithfully is better than an elaborate routine that disappears after a week. Add the traditional thanksgiving after meals when it is practical.",
      fr:"Commencez par le bénédicité traditionnel avant les repas et gardez cette habitude avec constance. Une courte bénédiction dite fidèlement vaut mieux qu’un rituel compliqué abandonné après une semaine. Ajoutez l’action de grâces traditionnelle après le repas lorsque c’est pratique.",
    }),
    explanation:Object.freeze({
      en:"Grace at meals is a small but durable way for the household to acknowledge dependence on God in ordinary life. The app already stores the traditional before- and after-meal prayers; Apostolate should encourage the habit and hand off the exact texts rather than duplicate them.",
      fr:"Le bénédicité est une manière simple mais durable pour le foyer de reconnaître sa dépendance envers Dieu dans la vie ordinaire. L’application possède déjà les prières traditionnelles avant et après les repas ; Apostolate doit encourager l’habitude et renvoyer vers ces textes exacts plutôt que les dupliquer.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not imply that forgetting grace invalidates the meal or makes it sinful in itself.","Do not turn ordinary family prayer into scrupulous rule-keeping.","Do not create a second prayer-text registry."]),
      fr:Object.freeze(["Ne pas laisser entendre qu’oublier le bénédicité rend le repas invalide ou pécheur en soi.","Ne pas transformer la prière familiale ordinaire en observance scrupuleuse.","Ne pas créer un second registre de textes de prière."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF09"]),
    sourceIds:Object.freeze(["BALTIMORE-MANUAL-GRACE","CIC83-226"]),
    handoffs:Object.freeze([
      owned("pray","pray.library","Use the Prayer Library for the stored grace before and after meals."),
    ]),
  }),
  Object.freeze({
    id:"FH03",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do we establish morning and evening prayer at home?",
      fr:"Comment établir la prière du matin et du soir à la maison ?",
    }),
    text:Object.freeze({
      en:"Choose a small fixed core before adding anything else. In the morning, make an offering of the day; in the evening, give thanks, examine the day briefly, ask pardon, and commend the household to God. Expand only when the habit is stable.",
      fr:"Choisissez d’abord un petit noyau fixe avant d’ajouter quoi que ce soit. Le matin, faites l’offrande de la journée ; le soir, rendez grâce, examinez brièvement la journée, demandez pardon et confiez la famille à Dieu. N’élargissez la règle qu’une fois l’habitude stable.",
    }),
    explanation:Object.freeze({
      en:"Traditional Catholic manuals structure the day with morning and evening prayer, but the product should not force one long private rule onto every household. Apostolate’s role is practical habit formation; exact prayers remain owned by the Prayer Library and existing prayer data.",
      fr:"Les manuels catholiques traditionnels structurent la journée par la prière du matin et du soir, mais le produit ne doit pas imposer une longue règle privée identique à tous les foyers. Apostolate sert ici à établir l’habitude ; les prières exactes restent possédées par la Bibliothèque de prières et les données existantes.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not make a long devotional rule the minimum standard for every family.","Do not treat missed prayer as proof that the household has failed spiritually.","Do not duplicate the stored morning/evening prayer sequences."]),
      fr:Object.freeze(["Ne pas faire d’une longue règle dévotionnelle le minimum pour toute famille.","Ne pas traiter une prière manquée comme la preuve d’un échec spirituel du foyer.","Ne pas dupliquer les séquences de prière du matin et du soir déjà stockées."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF09"]),
    sourceIds:Object.freeze(["BALTIMORE-MANUAL-MORNING-EVENING","CIC83-226"]),
    handoffs:Object.freeze([
      owned("pray","pray.library","Use the Prayer Library for the canonical morning and evening texts."),
    ]),
  }),
  Object.freeze({
    id:"FH04",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I teach children their basic prayers?",
      fr:"Comment apprendre aux enfants leurs prières de base ?",
    }),
    text:Object.freeze({
      en:"Teach by praying with them, not only by testing them. Start with the Sign of the Cross, Our Father, Hail Mary and Glory Be; add the Creed, acts of faith, hope, charity and contrition as their understanding grows.",
      fr:"Apprenez-les en priant avec eux, et pas seulement en les interrogeant. Commencez par le Signe de Croix, le Notre Père, le Je vous salue Marie et le Gloire au Père ; ajoutez ensuite le Credo ainsi que les actes de foi, d’espérance, de charité et de contrition à mesure que leur compréhension grandit.",
    }),
    explanation:Object.freeze({
      en:"Christian parents have the primary duty to provide their children’s Christian education. The Prayer Library already holds the core formulas with provenance. Apostolate should help the parent teach progressively and naturally rather than invent a parallel children’s prayer corpus.",
      fr:"Les parents chrétiens ont la responsabilité première de l’éducation chrétienne de leurs enfants. La Bibliothèque de prières contient déjà les formules fondamentales avec leur provenance. Apostolate doit aider les parents à les enseigner progressivement et naturellement plutôt qu’à créer un corpus parallèle pour enfants.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not reduce prayer formation to memorization tests.","Do not shame children for slow recall.","Do not invent simplified paraphrases when the app already has canonical formulas."]),
      fr:Object.freeze(["Ne pas réduire la formation à la prière à des tests de mémorisation.","Ne pas culpabiliser un enfant qui mémorise lentement.","Ne pas inventer de paraphrases simplifiées lorsque l’application possède déjà les formules canoniques."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF09"]),
    sourceIds:Object.freeze(["CIC83-226","COMPENDIUM-BASIC-PRAYERS"]),
    handoffs:Object.freeze([
      owned("pray","pray.library","Use the canonical Prayer Library for the actual formulas."),
    ]),
  }),
  Object.freeze({
    id:"FH05",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How do I prepare a child for First Confession and First Communion?",
      fr:"Comment préparer un enfant à la première Confession et à la première Communion ?",
    }),
    text:Object.freeze({
      en:"Parents should help the child know whom he is receiving, approach Confession honestly, understand sin at an age-appropriate level, and learn the basic prayers and practical reverence needed for Communion. Readiness is not something the app certifies.",
      fr:"Les parents doivent aider l’enfant à savoir qui il reçoit, à s’approcher honnêtement de la Confession, à comprendre le péché selon son âge et à apprendre les prières de base ainsi que la révérence pratique nécessaire à la Communion. L’application ne certifie pas qu’un enfant est prêt.",
    }),
    explanation:Object.freeze({
      en:"The Church places a real duty on parents and pastors to prepare children who have reached the use of reason, with sacramental Confession preceding First Communion. St Pius X’s Quam singulari also rejects delaying children until an unnecessarily advanced level of knowledge. The canonical First Communion formation owner already handles this material.",
      fr:"L’Église confie réellement aux parents et aux pasteurs le devoir de préparer les enfants ayant atteint l’usage de raison, avec la Confession sacramentelle avant la première Communion. Le décret Quam singulari de saint Pie X rejette également les retards fondés sur un niveau de connaissance inutilement avancé. Le module canonique de formation à la première Communion possède déjà cette matière.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not certify a child as ready for Communion.","Do not duplicate the Confession workflow inside Apostolate.","Do not require adult theological mastery from a child.","Do not tell parents to bypass the priest or parish responsible for sacramental preparation."]),
      fr:Object.freeze(["Ne pas certifier qu’un enfant est prêt à communier.","Ne pas dupliquer le parcours de Confession dans Apostolate.","Ne pas exiger d’un enfant une maîtrise théologique d’adulte.","Ne pas conseiller aux parents de contourner le prêtre ou la paroisse responsables de la préparation sacramentelle."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF07","APF08","APF09"]),
    sourceIds:Object.freeze(["CIC83-913-914","QUAM-SINGULARI","CIC83-226"]),
    handoffs:Object.freeze([
      formation("FH05","learn.rites.first_communion","First Communion formation remains the canonical owner."),
      owned("pray","pray.confession","The Confession preparation workflow remains owned by PRAY."),
      owned("mass","mass.prepare","Mass preparation remains owned by the Mass surface."),
    ]),
  }),
  Object.freeze({
    id:"FH06",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"What is a godparent actually supposed to do?",
      fr:"Quel est réellement le rôle d’un parrain ou d’une marraine ?",
    }),
    text:Object.freeze({
      en:"A godparent is not merely an honorary guest at Baptism. The role is to assist Christian initiation and to help the baptized person live a life consistent with Baptism. That means prayer, example, encouragement and real interest in the person’s Catholic life.",
      fr:"Un parrain ou une marraine n’est pas simplement un invité d’honneur au Baptême. Son rôle est d’aider à l’initiation chrétienne et de soutenir le baptisé afin qu’il mène une vie conforme à son Baptême. Cela implique la prière, l’exemple, l’encouragement et un véritable intérêt pour sa vie catholique.",
    }),
    explanation:Object.freeze({
      en:"Canon law defines the sponsor’s continuing responsibility in explicitly Christian terms. The traditional Baptism formation module already explains both the rite and godparent aftercare, so Apostolate should translate the duty into practical follow-up rather than duplicate the ritual.",
      fr:"Le droit canonique définit la responsabilité durable du parrain en termes explicitement chrétiens. Le module traditionnel de formation au Baptême explique déjà le rite et le rôle du parrain après la cérémonie ; Apostolate doit donc traduire ce devoir en suivi concret plutôt que dupliquer le rituel.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not reduce the role to gifts, photographs or family prestige.","Do not invent canonical requirements beyond the Church’s actual rules.","Do not duplicate the Baptism rite or sponsor eligibility engine."]),
      fr:Object.freeze(["Ne pas réduire le rôle aux cadeaux, aux photos ou au prestige familial.","Ne pas inventer d’exigences canoniques au-delà des règles réelles de l’Église.","Ne pas dupliquer le rite du Baptême ni une logique parallèle d’admissibilité des parrains."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF08","APF09"]),
    sourceIds:Object.freeze(["CIC83-872-874","ROMRIT-BAPTISM"]),
    handoffs:Object.freeze([
      formation("FH06","learn.rites.baptism","Baptism formation owns the rite, sponsor criteria and aftercare explanation."),
    ]),
  }),
  Object.freeze({
    id:"FH07",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"What should a Confirmation sponsor actually do?",
      fr:"Que doit réellement faire un parrain ou une marraine de Confirmation ?",
    }),
    text:Object.freeze({
      en:"A Confirmation sponsor should help the confirmed person live as a genuine witness of Christ and remain faithful to the obligations of the sacrament. The role should continue after the ceremony through prayer, example, encouragement and concrete support.",
      fr:"Le parrain ou la marraine de Confirmation doit aider le confirmé à vivre comme un véritable témoin du Christ et à rester fidèle aux obligations du sacrement. Le rôle doit continuer après la cérémonie par la prière, l’exemple, l’encouragement et un soutien concret.",
    }),
    explanation:Object.freeze({
      en:"Current canon law states the sponsor’s purpose directly and links sponsor eligibility to the Baptism sponsor conditions. The Formation module already owns preparation, sponsor criteria and the traditional Roman ceremonies; Apostolate should focus on the continuing relationship.",
      fr:"Le droit canonique actuel énonce directement la finalité du parrain et rattache son admissibilité aux conditions prévues pour le parrain de Baptême. Le module Formation possède déjà la préparation, les critères du parrain et les cérémonies romaines traditionnelles ; Apostolate doit se concentrer sur la relation qui continue après la cérémonie.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not treat the sponsor as a ceremonial accessory.","Do not invent extra canonical qualifications.","Do not replace the candidate’s own responsibility for Christian life."]),
      fr:Object.freeze(["Ne pas traiter le parrain comme un simple accessoire cérémoniel.","Ne pas inventer de qualifications canoniques supplémentaires.","Ne pas remplacer la responsabilité personnelle du confirmé dans sa vie chrétienne."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF08","APF09"]),
    sourceIds:Object.freeze(["CIC83-892-893","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("FH07","learn.rites.confirmation","Confirmation formation owns preparation, sponsor criteria and ritual explanation."),
    ]),
  }),
  Object.freeze({
    id:"FH08",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"How can a family begin devotion to the Sacred Heart?",
      fr:"Comment une famille peut-elle commencer la dévotion au Sacré-Cœur ?",
    }),
    text:Object.freeze({
      en:"Begin with a concrete household practice: honour the Sacred Heart, pray the Litany or an approved act of consecration or reparation, and connect the devotion with real conversion, Confession, Communion and charity. Do not reduce it to decoration alone.",
      fr:"Commencez par une pratique concrète au foyer : honorer le Sacré-Cœur, prier les Litanies ou un acte approuvé de consécration ou de réparation, et relier la dévotion à une véritable conversion, à la Confession, à la Communion et à la charité. Ne la réduisez pas à une simple décoration.",
    }),
    explanation:Object.freeze({
      en:"Leo XIII strongly promoted consecration to the Sacred Heart, and Pius XI emphasized reparation as intrinsic to the devotion. A family may therefore adopt Sacred Heart prayer and consecration without treating one private enthronement custom as universally mandatory. Existing Sacred Heart prayers and First Friday material remain the canonical prayer owners.",
      fr:"Léon XIII a fortement promu la consécration au Sacré-Cœur, et Pie XI a souligné que la réparation appartient intrinsèquement à cette dévotion. Une famille peut donc adopter la prière et la consécration au Sacré-Cœur sans présenter une coutume privée d’intronisation comme universellement obligatoire. Les prières du Sacré-Cœur et le programme des premiers vendredis restent les propriétaires canoniques de cette pratique.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not present a particular private enthronement ceremony as universal law.","Do not reduce the devotion to displaying an image.","Do not duplicate Sacred Heart prayers already stored in PRAY.","Do not separate consecration from conversion and reparation."]),
      fr:Object.freeze(["Ne pas présenter une cérémonie privée particulière d’intronisation comme une loi universelle.","Ne pas réduire la dévotion à l’exposition d’une image.","Ne pas dupliquer les prières du Sacré-Cœur déjà stockées dans PRAY.","Ne pas séparer la consécration de la conversion et de la réparation."]),
    }),
    apfSkills:Object.freeze(["APF01","APF03","APF04","APF05","APF07","APF09"]),
    sourceIds:Object.freeze(["LEO-XIII-ANNUM-SACRUM","PIUS-XI-MISERENTISSIMUS","CIC83-226"]),
    handoffs:Object.freeze([
      owned("pray","pray.library","Use the Prayer Library for Sacred Heart prayers and approved texts."),
      owned("pray","programme.first_friday","First Friday remains the owned reparatory programme."),
    ]),
  }),
]);
