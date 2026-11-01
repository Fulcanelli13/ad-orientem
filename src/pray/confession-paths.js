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
  id:"regular",titleEn:"Quick Confession",titleFr:"Confession rapide",
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
/** Original editorial extension of the Ten Commandments examination for
 * Returning and General Confession. Not a transcription of the 1905 Compendio.
 * Preserve the inherited concise canonical prompts verbatim for Quick Confession.
 * Nothing here is a selection field, saved user confession, diagnosis of guilt,
 * or a substitute for discernment with the priest.
 * Sources: CCC 1454-1458, 1857-1859, 1862; Pius X catechism, Examination 25-29.
 */
export const CONFESSION_EXTENDED_EXAM_WITNESS=Object.freeze({
 editorialStatus:"ORIGINAL_EDITORIAL_PASTORAL_QUESTIONS_NOT_HISTORICAL_VERBATIM",
 doctrinal:"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vii_the_acts_of_the_penitent.html",
 mortalSinConditions:"https://www.vatican.va/content/catechism/en/part_three/section_one/chapter_one/article_8/iv_the_gravity_of_sin_mortal_and_venial_sin.index.html",
 catechismPiusX:"https://www.ewtn.com/catholicism/library/catechism-of-st-pius-x-1286"
});
export const CONFESSION_EXTENDED_QUESTIONS=Object.freeze([
 {
  "en": [
   "Have I deliberately neglected prayer or the worship I owe God?",
   "Have I knowingly rejected an essential teaching of the Catholic faith?",
   "Have I sought occult practices, divination, or superstitious substitutes for trust in God?",
   "Have I approached the sacraments irreverently or knowingly concealed a grave sin in Confession?",
   "Have I deliberately given in to despair of God's mercy or presumed upon it without repentance?"
  ],
  "fr": [
   "Ai-je délibérément négligé la prière ou le culte dû à Dieu ?",
   "Ai-je rejeté sciemment un enseignement essentiel de la foi catholique ?",
   "Ai-je recouru à l'occultisme, à la divination ou à des pratiques superstitieuses au lieu de me confier en Dieu ?",
   "Ai-je reçu les sacrements sans respect ou caché sciemment un péché grave en confession ?",
   "Ai-je volontairement désespéré de la miséricorde divine ou présumé de celle-ci sans repentir ?"
  ]
 },
 {
  "en": [
   "Have I knowingly spoken God's name with contempt or blasphemy?",
   "Have I made a false or rash oath, or broken a serious promise made to God?",
   "Have I deliberately mocked the sacraments, sacred objects, the saints, or religious worship?",
   "Have I used religious words to deceive, threaten, or manipulate another person?",
   "Have I failed to repair harm caused by a serious false oath or promise?"
  ],
  "fr": [
   "Ai-je prononcé sciemment le nom de Dieu avec mépris ou blasphème ?",
   "Ai-je prêté un serment faux ou téméraire, ou rompu une promesse grave faite à Dieu ?",
   "Ai-je délibérément tourné en dérision les sacrements, les objets sacrés, les saints ou le culte ?",
   "Ai-je employé des paroles religieuses pour tromper, menacer ou manipuler autrui ?",
   "Ai-je omis de réparer le tort causé par un faux serment ou une promesse grave ?"
  ]
 },
 {
  "en": [
   "Have I deliberately missed Sunday Mass or an obligatory holy day without a serious reason?",
   "Have I prevented someone under my care from fulfilling a religious obligation without just cause?",
   "Have I deliberately treated the church or the Holy Eucharist with irreverence?",
   "Have I neglected reasonable Sunday rest or compelled unnecessary work without regard for others?",
   "Have I failed to prepare responsibly for Holy Communion when aware of unconfessed grave sin?"
  ],
  "fr": [
   "Ai-je délibérément manqué la messe dominicale ou une fête d'obligation sans motif grave ?",
   "Ai-je empêché sans juste raison une personne dont j'ai la charge d'accomplir son devoir religieux ?",
   "Ai-je volontairement manqué de respect dans l'église ou envers la sainte Eucharistie ?",
   "Ai-je négligé le repos dominical raisonnable ou imposé sans nécessité du travail à autrui ?",
   "Ai-je omis de me préparer dignement à la sainte communion tout en ayant conscience d'un péché grave non confessé ?"
  ]
 },
 {
  "en": [
   "Have I neglected serious responsibilities to parents, children, spouse, or dependents?",
   "Have I refused needed care or respect to an elderly or vulnerable family member?",
   "Have I misused authority, manipulated, or humiliated those entrusted to me?",
   "Have I knowingly neglected the moral or religious formation of children in my care?",
   "Have I violated a just duty in family, professional, or civic life?"
  ],
  "fr": [
   "Ai-je négligé des responsabilités graves envers mes parents, mes enfants, mon conjoint ou mes proches à charge ?",
   "Ai-je refusé une aide ou un respect nécessaire à un parent âgé ou vulnérable ?",
   "Ai-je abusé de mon autorité, manipulé ou humilié les personnes confiées à mes soins ?",
   "Ai-je négligé sciemment la formation morale ou religieuse des enfants dont j'ai la charge ?",
   "Ai-je manqué à un juste devoir familial, professionnel ou civique ?"
  ]
 },
 {
  "en": [
   "Have I deliberately injured, threatened, or endangered another person's life or health?",
   "Have I cherished deliberate hatred, serious revenge, or refused a reasonable opportunity for reconciliation?",
   "Have I knowingly exposed other people to serious avoidable danger?",
   "Have I neglected a duty to protect or assist someone seriously vulnerable?",
   "Have I abused alcohol, drugs, or anger in a way that seriously harmed others?"
  ],
  "fr": [
   "Ai-je volontairement blessé, menacé ou mis en danger la vie ou la santé d'autrui ?",
   "Ai-je entretenu volontairement une haine, une vengeance grave ou refusé une réconciliation raisonnablement possible ?",
   "Ai-je exposé sciemment autrui à un danger grave et évitable ?",
   "Ai-je négligé mon devoir de protéger ou de secourir une personne gravement vulnérable ?",
   "Ai-je abusé de l'alcool, de drogues ou de la colère au point de nuire gravement à autrui ?"
  ]
 },
 {
  "en": [
   "Have I deliberately been unfaithful to my spouse or disregarded serious duties of marital fidelity?",
   "Have I freely chosen pornography or deliberately entertained sexual actions contrary to chastity?",
   "Have I pressured, coerced, exploited, or failed to respect another person's dignity and consent?",
   "Have I deliberately placed myself or another in a foreseeable near occasion of serious sexual wrongdoing?",
   "Have I been uncharitable in discussing another person's intimate life or reputation?"
  ],
  "fr": [
   "Ai-je délibérément manqué à la fidélité conjugale ou négligé un devoir grave envers mon conjoint ?",
   "Ai-je librement choisi la pornographie ou des actes délibérément contraires à la chasteté ?",
   "Ai-je fait pression sur autrui, abusé de quelqu'un ou méprisé sa dignité et son consentement ?",
   "Me suis-je volontairement placé, ou ai-je placé autrui, dans une occasion prochaine prévisible de faute sexuelle grave ?",
   "Ai-je manqué à la charité en évoquant la vie intime ou la réputation d'une autre personne ?"
  ]
 },
 {
  "en": [
   "Have I stolen, cheated, defrauded, or deliberately withheld what I owe to another?",
   "Have I failed to pay a just wage, repay a debt when able, or respect another person's property?",
   "Have I used my professional position, entrusted money, or public resources dishonestly?",
   "Have I caused material harm through deceit or serious negligence without making reasonable restitution?",
   "Have I knowingly taken advantage of someone else's vulnerability in a transaction?"
  ],
  "fr": [
   "Ai-je volé, triché, fraudé ou volontairement retenu ce que je dois à autrui ?",
   "Ai-je omis de verser un juste salaire, de rembourser une dette selon mes moyens ou de respecter le bien d'autrui ?",
   "Ai-je employé malhonnêtement ma fonction, des fonds confiés ou des ressources publiques ?",
   "Ai-je causé un dommage matériel par tromperie ou négligence grave sans réparation raisonnable ?",
   "Ai-je sciemment profité de la vulnérabilité d'autrui dans un échange ?"
  ]
 },
 {
  "en": [
   "Have I deliberately lied in a serious matter or falsely accused someone?",
   "Have I spread an unverified accusation, calumny, or harmful gossip without sufficient reason?",
   "Have I betrayed a confidence or disclosed another person's private information unjustly?",
   "Have I given false testimony, distorted facts, or concealed truth where justice required it?",
   "Have I refused to correct a harmful falsehood when I reasonably could?"
  ],
  "fr": [
   "Ai-je délibérément menti sur une matière grave ou accusé faussement quelqu'un ?",
   "Ai-je répandu une accusation non vérifiée, une calomnie ou des médisances nuisibles sans raison suffisante ?",
   "Ai-je trahi un secret ou révélé injustement des informations privées sur autrui ?",
   "Ai-je porté un faux témoignage, déformé les faits ou dissimulé la vérité quand la justice l'exigeait ?",
   "Ai-je refusé de corriger une fausseté nuisible alors que je le pouvais raisonnablement ?"
  ]
 },
 {
  "en": [
   "Have I deliberately fostered a desire to violate another person's marriage or fidelity?",
   "Have I knowingly dwelt on lustful fantasies that I freely chose to entertain?",
   "Have I tried to seduce another person into betraying serious commitments?",
   "Have I treated another person primarily as an object rather than respecting their dignity?",
   "Have I distinguished involuntary thoughts or temptations from freely chosen consent?"
  ],
  "fr": [
   "Ai-je volontairement nourri le désir de porter atteinte au mariage ou à la fidélité d'autrui ?",
   "Me suis-je complu sciemment dans des pensées impures auxquelles j'ai librement consenti ?",
   "Ai-je tenté d'entraîner quelqu'un à trahir un engagement grave ?",
   "Ai-je traité une personne comme un objet plutôt que de respecter sa dignité ?",
   "Ai-je distingué les pensées ou tentations involontaires du consentement librement donné ?"
  ]
 },
 {
  "en": [
   "Have I deliberately nourished envy or resentment at another person's legitimate possessions or success?",
   "Have I desired to obtain another person's goods through injustice or deception?",
   "Have greed or material ambition led me to neglect serious obligations to God or neighbor?",
   "Have I refused reasonable generosity despite a clear duty of care or justice?",
   "Have I fostered bitterness rather than gratitude for the good rightly enjoyed by others?"
  ],
  "fr": [
   "Ai-je volontairement entretenu l'envie ou le ressentiment devant les biens ou la réussite légitime d'autrui ?",
   "Ai-je désiré acquérir injustement ou par tromperie les biens d'une autre personne ?",
   "La cupidité ou l'ambition matérielle m'ont-elles conduit à négliger des devoirs graves envers Dieu ou autrui ?",
   "Ai-je refusé une générosité raisonnable malgré un devoir clair de charité ou de justice ?",
   "Ai-je nourri l'amertume au lieu de la gratitude pour le bien dont autrui jouit légitimement ?"
  ]
 }
]);
export function confessionExtendedSections(sections,{path="regular",french=false}={}){
 if(path==="regular")return sections;
 if(!["returning","general"].includes(path))throw Error("Unknown Confession path");
 if(!Array.isArray(sections)||sections.length!==10)throw Error("Ten original commandment sections required");
 return Object.freeze(sections.map((section,index)=>Object.freeze([
  section[0],Object.freeze([...section[1],...CONFESSION_EXTENDED_QUESTIONS[index][french?"fr":"en"]])
 ])));
}

export const CONFESSION_HISTORICAL_SOURCE_POLICY=Object.freeze({
 piusX:Object.freeze({
  name:"St Pius X · Compendio della dottrina cristiana (1905)",
  source:"https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_III",
  status:"HISTORICAL_ITALIAN_REFERENCE_ONLY_NO_EN_FR_COLLATION",
  role:"Doctrine of contrition and preparation; optional source access, not a new sacramental formula"
 }),
 romanRitual:Object.freeze({
  name:"Rituale Romanum (1925) · Penance",
  source:"https://www.traditio-op.org/Liturgica_Rito_Latino/Rituale_Romanum_1925.pdf",
  status:"HISTORICAL_RITUAL_REFERENCE_NOT_A_LAY_SCRIPT",
  role:"Priest's sacramental ritual; never rehearsed as an app-led absolution"
 })
});
export const CONFESSION_SOURCE_LINKS=Object.freeze([
 Object.freeze({label:"St Pius X · Compendio (1905), Italian historical source",
  labelFr:"Saint Pie X · Compendio (1905), texte historique italien",
  url:CONFESSION_HISTORICAL_SOURCE_POLICY.piusX.source,
  edition:"1905-ITALIAN_NOT_TRILINGUAL_CERTIFIED"}),
 Object.freeze({label:"Rituale Romanum (1925) · historical penance rubrics",
  labelFr:"Rituel romain (1925) · rubriques historiques de la pénitence",
  url:CONFESSION_HISTORICAL_SOURCE_POLICY.romanRitual.source,
  edition:"PRIEST_RITUAL_NOT_LAY_FORMULA"}),
 Object.freeze({label:"Catechism §§1450–1460",labelFr:"Compendium du Catéchisme, nos 302–306 (CEC 1450–1460)",url:"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vii_the_acts_of_the_penitent.html",urlFr:"https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html"}),
 Object.freeze({label:"Canon law, can. 987–989",labelFr:"Code de droit canonique, can. 987–989",url:"https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann959-997_en.html",urlFr:"https://press.vatican.va/archive/cod-iuris-canonici/fra/documents/cic_libro4_cann987-991_fr.html"})
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
/** Small, canonical-source-grounded cards for rehearsing the sacrament BEFORE entering.
 * These do not claim to be the priest's rite, offer absolution, or collect sins.
 * Readings: CCC 1451–1460; CIC 959, 987–988, 981. */
const confessionRitePrelude=Object.freeze({
 regular:Object.freeze({en:"You can begin briefly: 'Bless me, Father, for I have sinned. It has been about … since my last Confession.'",fr:"Vous pouvez commencer simplement : « Bénissez-moi, mon Père, parce que j'ai péché. Il y a environ … que je me suis confessé. »"}),
 returning:Object.freeze({en:"You may begin: 'Father, it has been a long time since I confessed. I would appreciate your help.'",fr:"Vous pouvez commencer : « Mon Père, il y a longtemps que je ne me suis pas confessé. J'aurais besoin de votre aide. »"}),
 general:Object.freeze({en:"Tell the priest you wish to make a general Confession of an agreed period; ask him to confirm its scope.",fr:"Dites au prêtre que vous souhaitez faire une confession générale d'une période convenue ; demandez-lui d'en préciser la portée."})
});
/** A penitent-only rehearsal, to be read before entering a traditional confessional.
 * The priest's sacramental actions are described, NEVER simulated or advanced live.
 * Local customary opening and concluding phrases are illustrative, not mandatory.
 */
export const CONFESSION_TRADITIONAL_GUIDE_STEPS=Object.freeze([
 Object.freeze({"id":"cross-and-blessing","role":"penitent","kind":"reflection","en":"Kneel and make the Sign of the Cross","fr":"S’agenouiller et faire le signe de croix","bodyEn":"In a traditional confessional, kneel where the screen and local arrangement provide for it. Make the Sign of the Cross as the priest begins or directs you. The priest may give an opening blessing; practices vary. Follow him rather than trying to perform a fixed script.","bodyFr":"Dans un confessionnal traditionnel, agenouillez-vous lorsque le lieu et la grille le permettent. Faites le signe de croix au début, selon les indications du prêtre. Celui-ci peut donner une bénédiction initiale ; les usages locaux varient. Suivez le prêtre plutôt qu’un scénario rigide.","source":"traditionalGuide"}),
 Object.freeze({"id":"last-confession","role":"penitent","kind":"reflection","en":"Say when you last confessed","fr":"Dire depuis quand vous vous êtes confessé","bodyEn":"Begin with the customary request, “Bless me, Father, for I have sinned.” Give the approximate time since your last good Confession. If you have been away for years, say so and ask for help. Do not invent precise dates, and explain an unfinished earlier penance if it is relevant.","bodyFr":"Commencez par la formule habituelle : « Bénissez-moi, mon Père, parce que j’ai péché. » Indiquez approximativement le temps écoulé depuis votre dernière bonne confession. Après une longue absence, dites-le et demandez de l’aide. N’inventez pas de dates exactes ; signalez une ancienne pénitence non accomplie si cela importe.","source":"traditionalGuide"}),
 Object.freeze({"id":"say-sins","role":"penitent","kind":"reflection","en":"Confess your sins simply","fr":"Accuser ses péchés avec simplicité","bodyEn":"Confess remembered mortal sins not yet absolved by their kind and number, as accurately as you reasonably can. If the number is uncertain, give an honest approximation or frequency. You may also confess venial sins. Avoid unnecessary details or a rehearsed autobiography; ask the priest when unsure.","bodyFr":"Accusez les péchés mortels dont vous vous souvenez et qui n’ont pas encore été confessés et absous, selon leur espèce et leur nombre, aussi fidèlement que raisonnablement possible. Si le nombre est incertain, indiquez une fréquence approximative honnête. Vous pouvez aussi confesser les péchés véniels, sans détails inutiles ; demandez au prêtre en cas de doute.","source":"canon"}),
 Object.freeze({"id":"closing-accusation","role":"penitent","kind":"reflection","en":"Conclude your accusation","fr":"Conclure l’accusation","bodyEn":"When finished, you may say in your own words that you are sorry for these sins and for any you have forgotten, and ask for a penance and absolution. This customary conclusion is not a second list of sins or a prescribed universal formula. If the priest asks a question, answer him instead.","bodyFr":"Une fois terminé, vous pouvez exprimer avec vos mots votre regret de ces péchés et de ceux que vous auriez oubliés, puis demander une pénitence et l’absolution. Cette conclusion habituelle n’est ni une nouvelle liste ni une formule universellement imposée. Si le prêtre vous interroge, répondez-lui.","source":"traditionalGuide"}),
 Object.freeze({"id":"counsel-and-penance","role":"priest","kind":"reflection","en":"Listen to counsel and accept penance","fr":"Écouter les conseils et accepter la pénitence","bodyEn":"The priest may ask clarifying questions, offer counsel, and assign a penance. Listen attentively and accept it. If you did not understand the penance or cannot reasonably perform it, tell him before leaving. The app cannot choose the penance, decide the case, or replace the confessor.","bodyFr":"Le prêtre peut demander des précisions, donner un conseil et imposer une pénitence. Écoutez attentivement et acceptez-la. Si vous n’avez pas compris la pénitence ou ne pouvez raisonnablement l’accomplir, dites-le avant de partir. L’application ne choisit ni la pénitence ni la conduite du confesseur.","source":"traditionalGuide"}),
 Object.freeze({"id":"contrition-penance","role":"penitent","kind":"reflection","en":"Pray the Act of Contrition","fr":"Réciter l’acte de contrition","bodyEn":"When the priest invites you, recite an Act of Contrition sincerely, with sorrow for sin and a firm purpose of amendment. The familiar vernacular prayer is sufficient; the penitent does not need to recite the priest’s Latin words. If you forget the wording, ask the priest to help you.","bodyFr":"Lorsque le prêtre vous y invite, récitez sincèrement un acte de contrition, avec le regret des péchés et la ferme résolution de vous amender. La prière habituelle dans votre langue convient ; le pénitent n’a pas à réciter les paroles latines du prêtre. Si vous oubliez la formule, demandez son aide.","source":"catechism"}),
 Object.freeze({"id":"priest-absolution","role":"priest","kind":"reflection","en":"Receive the priest’s absolution","fr":"Recevoir l’absolution du prêtre","bodyEn":"The priest, not the app, pronounces the sacramental absolution, often in Latin at a traditional confessional. The excerpt below is from his formula; other prayers may precede or follow it, with permitted omissions in some circumstances. Attend quietly, make the Sign of the Cross as customary, and follow the priest’s direction. This is for learning beforehand, never for playback during Confession.","bodyFr":"Le prêtre, et non l’application, prononce l’absolution sacramentelle, souvent en latin dans un confessionnal traditionnel. L’extrait ci-dessous vient de sa formule ; d’autres prières peuvent l’entourer, avec certaines omissions prévues par les rubriques. Écoutez avec recueillement, faites le signe de croix selon l’usage et suivez ses indications. Ce texte se lit avant la confession, jamais pour reproduire l’absolution.","source":"romanRitual","latin":"Ego te absolvo a peccatis tuis, in nomine Patris, et Filii, et Spiritus Sancti. Amen."}),
 Object.freeze({"id":"leave-confessional","role":"guide","kind":"reflection","en":"Leave and return to thanksgiving","fr":"Sortir et rendre grâce","bodyEn":"When the priest indicates that Confession is finished, leave quietly. After an actual absolution, offer thanks and complete the assigned penance as soon as reasonably possible. Use the app’s After Confession section only once you are outside; advancing a card is never evidence that absolution occurred.","bodyFr":"Quand le prêtre indique que la confession est terminée, sortez paisiblement. Après une absolution réellement reçue, rendez grâce et accomplissez dès que raisonnablement possible la pénitence imposée. N’ouvrez la section Après la confession qu’une fois sorti ; changer de carte ne prouve jamais que l’absolution a eu lieu.","source":"catechism"})
]);
export const CONFESSION_TRADITIONAL_PASTORAL_WITNESSES=Object.freeze([
 Object.freeze({label:"FSSP Besançon · La Confession",url:"https://fsspbesancon.fr/confession/",role:"TRADITIONAL_PENITENT_GUIDE"}),
 Object.freeze({label:"SSPX Canada · In the Confessional",url:"https://fsspx.ca/en/news/how-make-good-confession-confessional-24043",role:"TRADITIONAL_PENITENT_GUIDE"})
]);
export function confessionRiteCards(path){
 if(!CONFESSION_PATHS[path])throw Error("Unknown Confession path");
 return Object.freeze([
  Object.freeze({id:"at-priest",kind:"reflection",role:"guide",en:"Before you enter",fr:"Avant d’entrer",
   bodyEn:confessionRitePrelude[path].en+" Study the following cards only BEFORE entering. Put the phone away before approaching the priest; no app action is performed during the sacrament.",
   bodyFr:confessionRitePrelude[path].fr+" Lisez ces cartes AVANT d’entrer. Rangez votre téléphone avant de vous approcher du prêtre ; aucune action de l’application ne se fait pendant le sacrement.",source:"canon"}),
  ...CONFESSION_TRADITIONAL_GUIDE_STEPS
 ]);
}
export function confessionAfterCards(){
 return Object.freeze([
  Object.freeze({id:"thanksgiving",kind:"reflection",en:"Give thanks",fr:"Rendre grâce",
   bodyEn:"Thank God for His mercy after receiving sacramental absolution. Do not presume that moving to this card grants absolution; only the priest celebrates the sacrament.",
   bodyFr:"Rendez grâce à Dieu pour sa miséricorde après avoir reçu l'absolution sacramentelle. Le passage à cette carte ne confère aucune absolution : seul le prêtre célèbre le sacrement.",source:"catechism"}),
  Object.freeze({id:"satisfaction",kind:"reflection",en:"Do your penance and make restitution",fr:"Accomplir la pénitence et réparer",
   bodyEn:"Complete the penance imposed by the priest as soon as reasonably possible. When justice requires, make appropriate restitution for harm done, with prudence and attention to safety.",
   bodyFr:"Accomplissez dès que raisonnablement possible la pénitence donnée par le prêtre. Si la justice le demande, réparez convenablement le tort causé, avec prudence et dans le respect de la sécurité.",source:"catechism"}),
  Object.freeze({id:"amendment",kind:"reflection",en:"Make a concrete resolution",fr:"Prendre une résolution concrète",
   bodyEn:"Choose one realistic action that helps you avoid a near occasion of sin and grow in charity. You do not need to repeat an exhaustive examination once the sacrament is finished; follow the confessor's guidance.",
   bodyFr:"Choisissez une mesure réaliste pour éviter une occasion prochaine de péché et progresser dans la charité. Il n'est pas nécessaire de recommencer un examen exhaustif après le sacrement ; suivez le conseil du confesseur.",source:"catechism"})
 ]);
}
const conclusion=Object.freeze({
 id:"ready",en:"Prepare to speak to the priest",fr:"Se préparer à parler au prêtre",
 bodyEn:"Gather the grave sins you remember after a diligent but reasonable examination, stating their kind and number as best you can. You may also confess venial sins. Express sorrow and purpose of amendment; the priest will help with uncertainty.",
 bodyFr:"Rassemblez les péchés graves dont vous vous souvenez après un examen diligent mais raisonnable, en indiquant leur espèce et leur nombre aussi honnêtement que possible. Vous pouvez également confesser les péchés véniels. Exprimez le repentir et la résolution de vous amender ; le prêtre vous aidera en cas d’incertitude."
});
export function confessionExaminationCards(path,sections){
 if(!CONFESSION_PATHS[path])throw Error("Unknown Confession path");
 if(!Array.isArray(sections)||sections.length!==10||sections.some(s=>!Array.isArray(s)||!Array.isArray(s[1])||s[1].length<1))
  throw Error("Confession requires ten original commandment examination sections");
 if(path==="regular"){
  // Four compact cards read every original commandment prompt, with no stored selections.
  const groups=[[0,3],[3,5],[5,7],[7,10]];
  return Object.freeze([
   ...groups.map(([from,to],i)=>Object.freeze({
    id:"quick-commandments-"+(i+1),kind:"questions",
    title:sections[from][0]+" – "+sections[to-1][0],
    questions:Object.freeze(sections.slice(from,to).flatMap(section=>section[1]))
   })),
   Object.freeze({...conclusion,kind:"reflection"})
  ]);
 }
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
