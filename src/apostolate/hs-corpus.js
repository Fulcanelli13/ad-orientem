import { APOSTOLATE_HANDOFF_DIRECTIONS } from "./contracts.js";

const formation=(fromId,targetId,reason)=>Object.freeze({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId,
  targetId,
  reason,
});
const owned=(surface,targetId,reason)=>Object.freeze({surface,targetId,reason});

export const APOSTOLATE_HS_CORPUS_VERSION="APOSTOLATE_HS_CORPUS_V1";

export const APOSTOLATE_HS_SCENARIOS=Object.freeze([
  Object.freeze({
    id:"HS01",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"I want to come back to Mass. Where do I start?",
      fr:"Je veux revenir à la Messe. Par où commencer ?",
    }),
    text:Object.freeze({
      en:"Start by coming to Mass. Attendance and Holy Communion are distinct: you do not have to receive Communion simply because you attend. If you know you are not ready to receive, come anyway, pray, and take the next step toward Confession.",
      fr:"Commencez par revenir à la Messe. L’assistance à la Messe et la Sainte Communion sont distinctes : vous n’avez pas à communier simplement parce que vous assistez. Si vous savez ne pas être prêt à communier, venez quand même, priez et faites ensuite le pas vers la Confession.",
    }),
    explanation:Object.freeze({
      en:"The immediate pastoral goal is return, not perfection before return. Canon law requires sacramental Confession before Communion when a person is conscious of grave sin, apart from the exceptional case described by the law. That rule concerns receiving Communion; it is not a reason to stay away from Mass.",
      fr:"Le but pastoral immédiat est le retour, non une perfection préalable au retour. Le droit canonique demande la Confession sacramentelle avant la Communion lorsqu’une personne a conscience d’un péché grave, sauf le cas exceptionnel prévu par le droit. Cette règle concerne la réception de la Communion ; elle n’est pas une raison de rester éloigné de la Messe.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not tell someone to receive Communion merely to avoid standing out.","Do not make Confession a psychological barrier to entering a church.","Do not promise that every irregular personal situation can be resolved by an app."]),
      fr:Object.freeze(["Ne pas dire à quelqu’un de communier simplement pour ne pas se faire remarquer.","Ne pas transformer la Confession en obstacle psychologique avant même d’entrer dans une église.","Ne pas promettre qu’une application peut résoudre toute situation personnelle irrégulière."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF05","APF08","APF09"]),
    sourceIds:Object.freeze(["CIC83-916","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("HS01","learn.catholic_life","Use Formation for a structured return to Catholic practice."),
      owned("pray","pray.confession","Confession preparation remains owned by PRAY."),
      owned("mass","mass.prepare","Mass preparation remains owned by the Mass surface."),
      owned("find","find","Use Explore/Find to locate a traditional Mass or priest."),
    ]),
  }),
  Object.freeze({
    id:"HS02",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"I haven’t been to Confession in years. What do I do?",
      fr:"Je ne me suis pas confessé depuis des années. Que dois-je faire ?",
    }),
    text:Object.freeze({
      en:"Tell the priest simply that it has been a long time. You do not need to solve everything before approaching the sacrament. Prepare honestly, make a reasonable examination of conscience, and let the priest guide the Confession.",
      fr:"Dites simplement au prêtre que cela fait longtemps. Vous n’avez pas à tout résoudre avant de vous approcher du sacrement. Préparez-vous honnêtement, faites un examen de conscience raisonnable et laissez le prêtre guider la Confession.",
    }),
    explanation:Object.freeze({
      en:"The Church asks the penitent to reject sin, intend amendment and confess grave sins remembered after diligent examination. Apostolate can reduce fear and direct the person to the sacrament, but it must not conduct a private sin intake, imitate a confessor or pronounce absolution.",
      fr:"L’Église demande au pénitent de rejeter le péché, d’avoir le propos de s’amender et de confesser les péchés graves dont il se souvient après un examen sérieux. Apostolate peut réduire la peur et orienter vers le sacrement, mais ne doit ni recueillir une confession privée de péchés, ni imiter un confesseur, ni prononcer une absolution.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not ask the user to type out grave sins into Apostolate.","Do not try to decide sacramental validity or absolution remotely.","Do not duplicate the owned Confession workflow."]),
      fr:Object.freeze(["Ne pas demander à l’utilisateur de saisir ses péchés graves dans Apostolate.","Ne pas tenter de décider à distance de la validité sacramentelle ou de l’absolution.","Ne pas dupliquer le parcours de Confession déjà possédé par PRAY."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF05","APF08","APF09"]),
    sourceIds:Object.freeze(["CIC83-987-989","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("HS02","learn.catholic_life","Use Formation for the doctrine and habits surrounding Penance."),
      owned("pray","pray.confession","The actual preparation workflow belongs to PRAY."),
    ]),
  }),
  Object.freeze({
    id:"HS03",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"I think I want to become Catholic. What should I do?",
      fr:"Je pense vouloir devenir catholique. Que dois-je faire ?",
    }),
    text:Object.freeze({
      en:"Begin by speaking with a priest and explaining your actual situation: whether you are unbaptized, baptized outside the Catholic Church, already Catholic but returning, or simply exploring. Those are not the same case, and the next step depends on which one is true.",
      fr:"Commencez par parler à un prêtre et expliquez votre situation réelle : si vous n’êtes pas baptisé, si vous avez été baptisé hors de l’Église catholique, si vous êtes déjà catholique mais revenez à la pratique, ou si vous êtes simplement en recherche. Ce ne sont pas les mêmes cas, et l’étape suivante dépend de la situation réelle.",
    }),
    explanation:Object.freeze({
      en:"Adult Baptism requires intention and sufficient instruction, but Apostolate must not turn that principle into an automated catechumenate or make canonical eligibility decisions. Its role is to clarify the broad categories, support learning and connect the person with a priest or parish.",
      fr:"Le Baptême d’un adulte suppose l’intention et une instruction suffisante, mais Apostolate ne doit pas transformer ce principe en catéchuménat automatisé ni prendre des décisions d’admissibilité canonique. Son rôle est de clarifier les grandes catégories, soutenir la formation et mettre la personne en relation avec un prêtre ou une paroisse.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not assume that every non-practising person needs Baptism.","Do not pronounce on the validity of a prior Baptism without competent review.","Do not create a pseudo-catechumenate or promise a reception date."]),
      fr:Object.freeze(["Ne pas supposer que toute personne non pratiquante a besoin du Baptême.","Ne pas se prononcer sur la validité d’un baptême antérieur sans examen compétent.","Ne pas créer un pseudo-catéchuménat ni promettre une date de réception."]),
    }),
    apfSkills:Object.freeze(["APF02","APF03","APF04","APF07","APF08","APF09"]),
    sourceIds:Object.freeze(["CIC83-865","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("HS03","learn.catholic_life","Formation supplies the structured Catholic-life curriculum."),
      owned("find","find","Find/Explore can help locate a priest or traditional Catholic community."),
    ]),
  }),
  Object.freeze({
    id:"HS04",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"I don’t really know how to pray.",
      fr:"Je ne sais pas vraiment comment prier.",
    }),
    text:Object.freeze({
      en:"Start simply. Speak to God honestly, and use the prayers Christ and the Church already give you. The Our Father is enough to begin; consistency matters more than building a complicated programme on the first day.",
      fr:"Commencez simplement. Parlez honnêtement à Dieu et utilisez les prières que le Christ et l’Église vous donnent déjà. Le Notre Père suffit pour commencer ; la fidélité compte davantage que la construction d’un programme compliqué dès le premier jour.",
    }),
    explanation:Object.freeze({
      en:"A person who is unfamiliar with prayer usually needs a low-friction beginning, not a large devotional system. Apostolate should encourage a first real act of prayer and then hand off to the existing prayer owners for morning/evening prayer, Rosary or other devotions.",
      fr:"Une personne peu familière avec la prière a généralement besoin d’un début simple, non d’un vaste système dévotionnel. Apostolate doit encourager un premier acte réel de prière puis renvoyer vers les parcours déjà existants pour la prière du matin et du soir, le Rosaire ou d’autres dévotions.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not overwhelm a beginner with a long rule of life.","Do not gamify prayer or treat quantity as the measure of fidelity.","Do not imply that spontaneous prayer and traditional formulas are rivals."]),
      fr:Object.freeze(["Ne pas accabler un débutant avec une longue règle de vie.","Ne pas gamifier la prière ni faire de la quantité la mesure de la fidélité.","Ne pas présenter la prière spontanée et les formules traditionnelles comme des rivales."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF09"]),
    sourceIds:Object.freeze(["COMPENDIUM-OUR-FATHER","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("HS04","learn.catholic_life","Formation can explain the place of prayer in Catholic life."),
      owned("pray","pray.morning_evening","Use the existing morning/evening prayer owner for a simple routine."),
      owned("pray","pray.rosary","Rosary remains an owned devotional module rather than being rebuilt here."),
    ]),
  }),
  Object.freeze({
    id:"HS05",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Someone has died. What can I do?",
      fr:"Quelqu’un est mort. Que puis-je faire ?",
    }),
    text:Object.freeze({
      en:"Be present, help with what is actually needed, and pray for the person who has died and for those who are grieving. You do not need to explain everything immediately. A simple Eternal Rest, the De profundis, and arranging Masses for the dead are concrete Catholic acts.",
      fr:"Soyez présent, aidez selon les besoins réels, et priez pour la personne décédée ainsi que pour ceux qui sont dans le deuil. Il n’est pas nécessaire de tout expliquer immédiatement. Un simple Requiem aeternam, le De profundis et l’offrande de Messes pour les défunts sont des actes catholiques concrets.",
    }),
    explanation:Object.freeze({
      en:"Catholic bereavement care combines charity toward the living with prayer and suffrage for the dead. The Church’s funeral and Requiem tradition does not require us to make confident private declarations about the deceased person’s final state; it gives us prayers, Mass and works of charity instead.",
      fr:"L’accompagnement catholique du deuil unit la charité envers les vivants à la prière et aux suffrages pour les morts. La tradition des funérailles et du Requiem ne demande pas de prononcer avec assurance des jugements privés sur l’état final du défunt ; elle nous donne plutôt la prière, la Messe et les œuvres de charité.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not lead with abstract theology when someone is in acute grief.","Do not declare that the deceased is certainly in Heaven.","Do not say that the person has ‘become an angel.’"]),
      fr:Object.freeze(["Ne pas commencer par une théologie abstraite lorsque quelqu’un est dans un deuil aigu.","Ne pas déclarer que le défunt est certainement au Ciel.","Ne pas dire que la personne est « devenue un ange »."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF05","APF07","APF09"]),
    sourceIds:Object.freeze(["TRENT-XXV-SAINTS-PURGATORY","MR62-REQUIEM","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("HS05","learn.catholic_life","Formation can deepen Catholic teaching on death, judgment and suffrage."),
      owned("pray","pray.holy_souls","Prayer for the dead belongs to the Holy Souls owner."),
      owned("pray","pray.good_death","Good Death remains the ordinary preparation treasury, not a bereavement substitute."),
    ]),
  }),
  Object.freeze({
    id:"HS06",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Someone is seriously ill or dying. What should I do?",
      fr:"Quelqu’un est gravement malade ou mourant. Que dois-je faire ?",
    }),
    text:Object.freeze({
      en:"First determine whether the person is stable, in danger of death, actively dying, or may already have died. If death may be near, contact a priest immediately. Do not wait for the final minutes. Continue ordinary medical care and use the Church’s prayers without trying to imitate the sacraments.",
      fr:"Commencez par déterminer si la personne est stable, en danger de mort, à l’agonie, ou peut-être déjà décédée. Si la mort peut être proche, contactez immédiatement un prêtre. N’attendez pas les dernières minutes. Poursuivez les soins médicaux ordinaires et utilisez les prières de l’Église sans tenter d’imiter les sacrements.",
    }),
    explanation:Object.freeze({
      en:"The Roman Ritual and current discipline both treat pastoral care of the seriously ill as something to begin before the last instant. Apostolate may help the layperson recognize urgency and reach the correct owners, but it must never perform Anointing, absolution, Viaticum or medical triage.",
      fr:"Le Rituel romain et la discipline actuelle considèrent tous deux que l’assistance pastorale aux malades graves doit commencer avant le tout dernier instant. Apostolate peut aider le laïc à reconnaître l’urgence et à rejoindre les bons parcours, mais ne doit jamais simuler l’Onction, l’absolution, le Viatique ni un triage médical.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not delay calling a priest while completing an app flow.","Do not give medical diagnosis or emergency-treatment instructions.","Do not simulate Anointing, absolution or Viaticum.","Do not keep using the dying-person flow once death is reasonably established."]),
      fr:Object.freeze(["Ne pas retarder l’appel d’un prêtre pour terminer un parcours dans l’application.","Ne pas donner de diagnostic médical ni d’instructions de traitement d’urgence.","Ne pas simuler l’Onction, l’absolution ou le Viatique.","Ne pas continuer à utiliser le parcours pour mourant lorsque le décès est raisonnablement établi."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF07","APF08","APF09"]),
    sourceIds:Object.freeze(["ROMRIT-LAST-RITES","CIC83-1001-1004","CIC83-921-922"]),
    handoffs:Object.freeze([
      formation("HS06","learn.rites.sick","Serious Illness formation owns the sacramental explanation."),
      owned("pray","pray.dying_companion","The bedside action/prayer flow belongs to Dying Companion."),
      owned("pray","pray.confession","Confession preparation remains owned by PRAY where appropriate."),
      owned("pray","pray.holy_souls","After death, switch to prayer for the dead rather than the dying-person flow."),
    ]),
  }),
  Object.freeze({
    id:"HS07",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Bad Catholics or bad clergy have made me distrust the Church.",
      fr:"De mauvais catholiques ou de mauvais clercs m’ont fait perdre confiance dans l’Église.",
    }),
    text:Object.freeze({
      en:"Sin, hypocrisy, corruption and mistreatment by Catholics—including clergy—are real evils and should not be denied. Catholic teaching does not claim that every member of the Church is holy. The failure of members must be faced truthfully while remaining distinct from the truth of Christ and the doctrine the Church is charged to preserve.",
      fr:"Le péché, l’hypocrisie, la corruption et les mauvais traitements commis par des catholiques — y compris des clercs — sont des maux réels qu’il ne faut pas nier. La doctrine catholique ne prétend pas que tous les membres de l’Église soient saints. Les fautes des membres doivent être reconnues avec vérité tout en restant distinctes de la vérité du Christ et de la doctrine que l’Église a mission de garder.",
    }),
    explanation:Object.freeze({
      en:"Pius XII explicitly taught that the Church on earth includes sinners and that weaknesses and wounds in individual members are not to be attributed to the Church’s divine constitution. That distinction must never be used to minimize personal harm. If the issue is intellectual, hand off to Formation; if someone has been harmed, listen first and help them find trustworthy human and pastoral support.",
      fr:"Pie XII enseigne explicitement que l’Église sur terre comprend des pécheurs et que les faiblesses et blessures de certains membres ne doivent pas être attribuées à la constitution divine de l’Église. Cette distinction ne doit jamais servir à minimiser un préjudice personnel. Si la difficulté est intellectuelle, renvoyer vers Formation ; si quelqu’un a subi un tort, écouter d’abord et l’aider à trouver un soutien humain et pastoral digne de confiance.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not defend the Church by denying or minimizing actual wrongdoing.","Do not tell a harmed person merely to ‘offer it up.’","Do not treat an allegation of abuse or criminal conduct as an apologetics debate.","Do not imply that holiness of doctrine guarantees holiness of every office-holder."]),
      fr:Object.freeze(["Ne pas défendre l’Église en niant ou minimisant des fautes réelles.","Ne pas dire simplement à une personne blessée de « l’offrir à Dieu ».","Ne pas traiter une accusation d’abus ou de conduite criminelle comme un débat apologétique.","Ne pas laisser entendre que la sainteté de la doctrine garantit la sainteté de chaque titulaire d’une charge."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF05","APF07","APF08"]),
    sourceIds:Object.freeze(["PIUS-XII-MYSTICI-CORPORIS","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      formation("HS07","learn.catholic_life","Formation can deepen the distinction between the Church’s holiness and the sins of her members."),
      owned("find","find","Find/Explore can help identify another priest or community when trust has broken down locally."),
    ]),
  }),
]);
