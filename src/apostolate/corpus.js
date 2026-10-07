import { APOSTOLATE_HANDOFF_DIRECTIONS } from "./contracts.js";

const formation=(fromId,targetId,reason)=>Object.freeze({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId,
  targetId,
  reason,
});

const owned=(surface,targetId,reason)=>Object.freeze({surface,targetId,reason});

export const APOSTOLATE_AQ_CORPUS_VERSION="APOSTOLATE_AQ_CORPUS_V1";

export const APOSTOLATE_AQ_SCENARIOS=Object.freeze([
  Object.freeze({
    id:"AQ01",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"Why do Catholics pray to Mary and the saints?",
      fr:"Pourquoi les catholiques prient-ils Marie et les saints ?",
    }),
    text:Object.freeze({
      en:"Catholics adore God alone. They honour Mary and the saints and ask them to pray for us; their intercession depends entirely on God and never replaces Christ, our one Redeemer.",
      fr:"Les catholiques adorent Dieu seul. Ils honorent Marie et les saints et leur demandent de prier pour nous ; leur intercession dépend entièrement de Dieu et ne remplace jamais le Christ, notre unique Rédempteur.",
    }),
    explanation:Object.freeze({
      en:"The Church distinguishes the adoration owed to God from the honour given to the saints. Trent teaches that the saints reigning with Christ pray for us and may lawfully be invoked for their prayers and help through Jesus Christ.",
      fr:"L’Église distingue l’adoration due à Dieu de l’honneur rendu aux saints. Le concile de Trente enseigne que les saints qui règnent avec le Christ prient pour nous et qu’on peut légitimement recourir à leur intercession par Jésus-Christ.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not say that Catholics worship Mary.","Do not speak as though saints grant grace independently of God.","Do not begin with disputed or advanced Marian terminology when the objection is simply about intercession."]),
      fr:Object.freeze(["Ne pas dire que les catholiques adorent Marie.","Ne pas parler comme si les saints accordaient la grâce indépendamment de Dieu.","Ne pas commencer par une terminologie mariale disputée ou avancée lorsque l’objection porte simplement sur l’intercession."]),
    }),
    apfSkills:Object.freeze(["APF02","APF04","APF05","APF06","APF09"]),
    sourceIds:Object.freeze(["TRENT-XXV-SAINTS-PURGATORY","ST-PIUS-X-CATECHISM-FR","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ01","learn.catechism","Deepen Communion of Saints and Marian doctrine in Formation."),
      owned("pray","pray.marian","Move from explanation to owned Marian prayer only when the person actually wants to pray."),
    ]),
  }),
  Object.freeze({
    id:"AQ02",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"Why confess sins to a priest? Why not just tell God?",
      fr:"Pourquoi confesser ses péchés à un prêtre ? Pourquoi ne pas simplement les dire à Dieu ?",
    }),
    text:Object.freeze({
      en:"Forgiveness comes from God. Christ nevertheless entrusted to His Apostles and their successors a real ministry of forgiving or retaining sins; in sacramental Confession the priest acts as Christ’s minister, not as a replacement for God.",
      fr:"Le pardon vient de Dieu. Le Christ a néanmoins confié à ses Apôtres et à leurs successeurs un véritable ministère pour remettre ou retenir les péchés ; dans la Confession sacramentelle, le prêtre agit comme ministre du Christ, non à la place de Dieu.",
    }),
    explanation:Object.freeze({
      en:"Trent explains that sacramental confession belongs to the institution of Penance and that priests exercise the power of the keys ministerially. Personal prayer to God is indispensable, but it is not a reason to reject the sacrament Christ entrusted to the Church.",
      fr:"Trente explique que la confession sacramentelle appartient à l’institution de la Pénitence et que les prêtres exercent ministériellement le pouvoir des clefs. La prière personnelle adressée à Dieu est indispensable, mais elle n’est pas une raison de rejeter le sacrement confié par le Christ à l’Église.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not imply that praying directly to God is useless.","Do not simulate confession or absolution inside Apostolate.","Do not present the priest as an independent source of forgiveness."]),
      fr:Object.freeze(["Ne pas laisser entendre qu’il serait inutile de prier Dieu directement.","Ne pas simuler la confession ou l’absolution dans Apostolate.","Ne pas présenter le prêtre comme une source indépendante du pardon."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF08","APF09"]),
    sourceIds:Object.freeze(["TRENT-XIV-PENANCE","ST-PIUS-X-CATECHISM-FR","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ02","learn.catechism","Deepen the doctrine of Penance in Formation."),
      owned("pray","pray.confession","Confession preparation belongs to PRAY, not Apostolate."),
    ]),
  }),
  Object.freeze({
    id:"AQ03",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"Why do Catholics obey the Pope? Is he infallible about everything?",
      fr:"Pourquoi les catholiques obéissent-ils au Pape ? Est-il infaillible en tout ?",
    }),
    text:Object.freeze({
      en:"No. Papal infallibility is not impeccability or omniscience. Vatican I defines a specific protection from error when the Roman Pontiff, acting as supreme pastor and teacher, definitively defines a doctrine of faith or morals to be held by the whole Church.",
      fr:"Non. L’infaillibilité pontificale n’est ni l’impeccabilité ni l’omniscience. Vatican I définit une protection précise contre l’erreur lorsque le Pontife romain, agissant comme pasteur et docteur suprême, définit définitivement une doctrine de foi ou de mœurs à tenir par toute l’Église.",
    }),
    explanation:Object.freeze({
      en:"The first task is to narrow the claim. Catholic doctrine does not say that every papal opinion, interview, prudential judgment or administrative act is infallible. The dogmatic definition concerns ex cathedra definitions of faith or morals addressed to the universal Church.",
      fr:"La première tâche consiste à préciser l’affirmation. La doctrine catholique ne dit pas que toute opinion, interview, décision prudentielle ou mesure administrative du Pape est infaillible. La définition dogmatique concerne les définitions ex cathedra en matière de foi ou de mœurs adressées à l’Église universelle.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not say simply, ‘The Pope cannot be wrong.’","Do not confuse infallibility with personal holiness or sinlessness.","Do not extend the definition to every papal statement."]),
      fr:Object.freeze(["Ne pas dire simplement : « Le Pape ne peut pas se tromper. »","Ne pas confondre l’infaillibilité avec la sainteté personnelle ou l’absence de péché.","Ne pas étendre la définition à toute parole pontificale."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF06","APF07"]),
    sourceIds:Object.freeze(["VATICAN-I-PASTOR-AETERNUS","ST-PIUS-X-CATECHISM-FR","PENNY-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ03","learn.catechism","Deepen Church authority and the papacy in Formation."),
    ]),
  }),
  Object.freeze({
    id:"AQ04",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"Doesn’t the Mass sacrifice Jesus again?",
      fr:"La Messe ne sacrifie-t-elle pas Jésus une nouvelle fois ?",
    }),
    text:Object.freeze({
      en:"No. Calvary is the one sacrifice of Christ. In the Mass the same Christ and the same sacrifice are sacramentally made present and offered in an unbloody manner; the victim is the same, while the manner of offering differs.",
      fr:"Non. Le Calvaire est l’unique sacrifice du Christ. À la Messe, le même Christ et le même sacrifice sont rendus sacramentellement présents et offerts d’une manière non sanglante ; la victime est la même, tandis que le mode d’offrande diffère.",
    }),
    explanation:Object.freeze({
      en:"Trent explicitly rejects the idea of a second Calvary. The Mass does not add another redemptive death to the Cross; it sacramentally represents and applies the one sacrifice Christ offered once in a bloody manner on Calvary.",
      fr:"Trente exclut explicitement l’idée d’un second Calvaire. La Messe n’ajoute pas une autre mort rédemptrice à la Croix ; elle représente sacramentellement et applique l’unique sacrifice que le Christ a offert une fois, de manière sanglante, au Calvaire.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not describe the Mass as another death of Christ.","Do not reduce the Mass to a merely symbolic memorial.","Do not let Apostolate replace the full Mass course or live reader."]),
      fr:Object.freeze(["Ne pas décrire la Messe comme une nouvelle mort du Christ.","Ne pas réduire la Messe à un mémorial purement symbolique.","Ne pas laisser Apostolate remplacer le cours complet sur la Messe ou le lecteur liturgique."]),
    }),
    apfSkills:Object.freeze(["APF02","APF04","APF06","APF09"]),
    sourceIds:Object.freeze(["TRENT-XXII-MASS","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ04","learn.mass","Deepen sacrifice, memorial and participation in Understand the Mass."),
      owned("mass","mass","The actual Mass remains owned by the Mass surface."),
    ]),
  }),
  Object.freeze({
    id:"AQ05",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"How can Catholics believe bread really becomes Jesus?",
      fr:"Comment les catholiques peuvent-ils croire que le pain devient réellement Jésus ?",
    }),
    text:Object.freeze({
      en:"In the Eucharist the appearances of bread and wine remain, but their underlying substance is changed into Christ’s Body and Blood. The Church calls this conversion transubstantiation: Christ is truly, really and substantially present.",
      fr:"Dans l’Eucharistie, les apparences du pain et du vin demeurent, mais leur substance est changée en Corps et Sang du Christ. L’Église appelle cette conversion la transsubstantiation : le Christ y est présent vraiment, réellement et substantiellement.",
    }),
    explanation:Object.freeze({
      en:"The claim is sacramental, not chemical. Trent distinguishes the sensible appearances from the substance and teaches the conversion of the whole substance of bread and wine while the species remain.",
      fr:"L’affirmation est sacramentelle, non chimique. Trente distingue les apparences sensibles de la substance et enseigne la conversion de toute la substance du pain et du vin tandis que les espèces demeurent.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not describe the Eucharist as ordinary human flesh detectable by chemistry.","Do not reduce the Real Presence to symbolism only.","Do not invent a physical mechanism for transubstantiation."]),
      fr:Object.freeze(["Ne pas décrire l’Eucharistie comme de la chair humaine ordinaire détectable par la chimie.","Ne pas réduire la Présence réelle à un simple symbole.","Ne pas inventer un mécanisme physique de la transsubstantiation."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF07","APF09"]),
    sourceIds:Object.freeze(["TRENT-XIII-EUCHARIST","ST-PIUS-X-CATECHISM-FR","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ05","learn.mass","Deepen the Eucharist and the Mass in Formation."),
      owned("pray","pray.adoration","Adoration belongs to PRAY when the user wants to act on the doctrine devotionally."),
    ]),
  }),
  Object.freeze({
    id:"AQ06",publication:"READY",claimClass:"T",
    title:Object.freeze({
      en:"Why Latin? And why the traditional Mass?",
      fr:"Pourquoi le latin ? Et pourquoi la Messe traditionnelle ?",
    }),
    text:Object.freeze({
      en:"Latin has long served the Roman Rite as a sign of unity and as a stable vehicle for doctrine. Catholics may value the traditional Roman Mass for its inherited liturgical form without claiming that Latin is necessary for validity or that the vernacular is intrinsically wrong.",
      fr:"Le latin a longtemps servi le rite romain comme signe d’unité et comme véhicule stable de la doctrine. Les catholiques peuvent estimer la Messe romaine traditionnelle pour sa forme liturgique héritée sans prétendre que le latin est nécessaire à la validité ni que la langue vernaculaire est mauvaise en elle-même.",
    }),
    explanation:Object.freeze({
      en:"Pius XII explicitly praised Latin as a sign of unity and a safeguard against corruption of doctrinal truth while also acknowledging that the mother tongue can be advantageous in some rites. The answer should therefore defend the traditional Roman inheritance without making claims the Church herself did not make.",
      fr:"Pie XII a explicitement loué le latin comme signe d’unité et protection contre l’altération de la vérité doctrinale, tout en reconnaissant que la langue maternelle peut être avantageuse dans certains rites. La réponse doit donc défendre l’héritage romain traditionnel sans attribuer à l’Église des affirmations qu’elle n’a pas faites.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not say the Mass has been unchanged since the Apostles.","Do not imply that Latin determines validity.","Do not claim that vernacular liturgy is intrinsically wrong."]),
      fr:Object.freeze(["Ne pas dire que la Messe serait restée inchangée depuis les Apôtres.","Ne pas laisser entendre que le latin détermine la validité.","Ne pas prétendre qu’une liturgie en langue vernaculaire serait mauvaise en elle-même."]),
    }),
    apfSkills:Object.freeze(["APF02","APF04","APF05","APF06","APF07"]),
    sourceIds:Object.freeze(["PIUS-XII-MEDIATOR-DEI"]),
    handoffs:Object.freeze([
      formation("AQ06","learn.mass","Deepen the history, order and meaning of the traditional Roman Mass."),
    ]),
  }),
  Object.freeze({
    id:"AQ07",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"Why Purgatory? Didn’t Jesus already pay for our sins?",
      fr:"Pourquoi le Purgatoire ? Jésus n’a-t-il pas déjà payé pour nos péchés ?",
    }),
    text:Object.freeze({
      en:"Purgatory does not compete with Christ’s redemption. It is the final purification of souls who die destined for Heaven but still need purification; the Church’s prayer and suffrages for the dead presuppose that such souls can be helped.",
      fr:"Le Purgatoire ne concurrence pas la Rédemption du Christ. Il est la purification finale des âmes qui meurent destinées au Ciel mais ont encore besoin d’être purifiées ; la prière et les suffrages de l’Église pour les défunts supposent que ces âmes peuvent être aidées.",
    }),
    explanation:Object.freeze({
      en:"Redemption by Christ does not mean that every temporal consequence of sin or every need for purification disappears at death. Trent teaches both the existence of Purgatory and the value of suffrages, especially the sacrifice of the altar, for souls detained there.",
      fr:"La Rédemption accomplie par le Christ ne signifie pas que toute conséquence temporelle du péché ou tout besoin de purification disparaît à la mort. Trente enseigne à la fois l’existence du Purgatoire et la valeur des suffrages, surtout du sacrifice de l’autel, pour les âmes qui s’y trouvent.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not present Purgatory as a second chance after death.","Do not describe it as a second Hell.","Do not invent speculative timings, geography or mechanics."]),
      fr:Object.freeze(["Ne pas présenter le Purgatoire comme une seconde chance après la mort.","Ne pas le décrire comme un second Enfer.","Ne pas inventer de durées, de lieux ou de mécanismes spéculatifs."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF07","APF09"]),
    sourceIds:Object.freeze(["TRENT-XXV-SAINTS-PURGATORY","ST-PIUS-X-CATECHISM-FR","CAFFERATA-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ07","learn.catechism","Deepen the Last Things and Purgatory in Formation."),
      owned("pray","pray.holy_souls","Prayer for the dead belongs to PRAY."),
    ]),
  }),
  Object.freeze({
    id:"AQ08",publication:"READY",claimClass:"D",
    title:Object.freeze({
      en:"Why isn’t the Bible alone enough?",
      fr:"Pourquoi la Bible seule ne suffit-elle pas ?",
    }),
    text:Object.freeze({
      en:"Scripture is inspired and belongs at the heart of Catholic faith. But divine Revelation is transmitted through Sacred Scripture and Apostolic Tradition, entrusted to the Church that received, guards and authentically teaches that deposit rather than replacing the Bible.",
      fr:"L’Écriture est inspirée et se trouve au cœur de la foi catholique. Mais la Révélation divine est transmise par la Sainte Écriture et la Tradition apostolique, confiées à l’Église qui reçoit, garde et enseigne authentiquement ce dépôt sans remplacer la Bible.",
    }),
    explanation:Object.freeze({
      en:"Christian faith and apostolic preaching existed before the New Testament canon was complete. Trent receives both the written books and Apostolic traditions, while Leo XIII describes supernatural Revelation as contained in unwritten Tradition and written books delivered to the Church.",
      fr:"La foi chrétienne et la prédication apostolique existaient avant que le canon du Nouveau Testament ne soit achevé. Trente reçoit à la fois les livres écrits et les traditions apostoliques, tandis que Léon XIII décrit la Révélation surnaturelle comme contenue dans la Tradition non écrite et les livres écrits confiés à l’Église.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not say that the Catholic Church ‘created the Bible.’","Do not frame the issue as Church versus Bible.","Do not imply that Catholics need not read or study Scripture."]),
      fr:Object.freeze(["Ne pas dire que l’Église catholique aurait « créé la Bible ».","Ne pas présenter la question comme une opposition entre l’Église et la Bible.","Ne pas laisser entendre que les catholiques n’ont pas à lire ou étudier l’Écriture."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF05","APF06","APF09"]),
    sourceIds:Object.freeze(["TRENT-IV-SCRIPTURE-TRADITION","LEO-XIII-PROVIDENTISSIMUS","ST-PIUS-X-CATECHISM-FR","PENNY-CATECHISM"]),
    handoffs:Object.freeze([
      formation("AQ08","learn.catechism","Deepen Revelation, Scripture, Tradition and Church authority in Formation."),
    ]),
  }),
]);
