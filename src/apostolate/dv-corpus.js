import { APOSTOLATE_HANDOFF_DIRECTIONS } from "./contracts.js";

const formation=(fromId,targetId,reason)=>Object.freeze({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId,
  targetId,
  reason,
});
const owned=(surface,targetId,reason)=>Object.freeze({surface,targetId,reason});
const step=(en,fr)=>Object.freeze({en,fr});

export const APOSTOLATE_DV_CORPUS_VERSION="APOSTOLATE_DV_CORPUS_V1";

export const APOSTOLATE_DV_SCENARIOS=Object.freeze([
  Object.freeze({
    id:"DV01",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Bring someone to the traditional Mass for the first time",
      fr:"Accompagner quelqu’un à la Messe traditionnelle pour la première fois",
    }),
    text:Object.freeze({
      en:"Give the newcomer a few landmarks, not a running commentary. Arrive a little early, explain that some prayers are quiet and that no one has to receive Holy Communion merely because they attend. Let the Mass itself be primary.",
      fr:"Donnez au nouveau venu quelques repères, pas un commentaire continu. Arrivez un peu en avance, expliquez que certaines prières sont dites à voix basse et que personne n’est obligé de communier simplement parce qu’il assiste à la Messe. Laissez la Messe elle-même rester première.",
    }),
    explanation:Object.freeze({
      en:"The Mass is the sacramental offering of the one sacrifice of Christ, and the 1962 Missal gives a stable order that can be learned gradually. A first visit should reduce disorientation without turning Apostolate into a duplicate Missal or live reader.",
      fr:"La Messe est l’offrande sacramentelle de l’unique sacrifice du Christ, et le Missel de 1962 offre un ordre stable que l’on peut apprendre progressivement. Une première visite doit réduire la désorientation sans transformer Apostolate en double du Missel ou du lecteur en direct.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not pressure a newcomer to receive Holy Communion.","Do not overload a first visit with every rubric, gesture or Latin response.","Do not present a local custom as universal law.","Do not narrate over the liturgy once Mass has begun."]),
      fr:Object.freeze(["Ne pas pousser un nouveau venu à recevoir la sainte Communion.","Ne pas surcharger une première Messe de toutes les rubriques, gestes ou réponses latines.","Ne pas présenter une coutume locale comme une loi universelle.","Ne pas commenter continuellement la liturgie une fois la Messe commencée."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF08","APF09"]),
    sourceStrength:"PRIMARY",
    onRamp:Object.freeze({
      minimum:step("Explain three things only: the broad order, the quiet prayer, and that Communion is not compulsory.","Expliquez seulement trois choses : l’ordre général, les prières à voix basse et le fait que la Communion n’est pas obligatoire."),
      anxiety:step("Reassure the person that they do not need to know Latin, own a missal, or copy every posture perfectly on the first visit.","Rassurez la personne : elle n’a pas besoin de connaître le latin, de posséder un missel ni de reproduire parfaitement chaque posture dès la première visite."),
      boundary:step("Respect ordinary Communion discipline and local ceremonial practice; Apostolate does not judge sacramental readiness.","Respectez la discipline ordinaire de la Communion et les usages cérémoniels locaux ; Apostolate ne juge pas l’aptitude sacramentelle."),
      handoff:step("Use Explore to find the church, Before Mass to prepare, Formation to learn, then the Mass reader only when the liturgy begins.","Utilisez Explorer pour trouver l’église, Avant la Messe pour se préparer, Formation pour apprendre, puis le lecteur de Messe seulement lorsque la liturgie commence."),
    }),
    sourceIds:Object.freeze(["TRENT-XXII-MASS","PIUS-XII-MEDIATOR-DEI","MR62-ORDINARY"]),
    handoffs:Object.freeze([
      owned("find","find","Use Explore/Find to locate the church and practical venue information."),
      owned("mass","mass.prepare","Use the canonical Before Mass preparation owner."),
      formation("DV01","learn.mass","Formation owns the structured explanation of the traditional Mass."),
      owned("mass","mass","The Mass reader owns live following once the liturgy begins."),
    ]),
  }),
  Object.freeze({
    id:"DV02",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Help somebody approach Confession for the first time",
      fr:"Aider quelqu’un à s’approcher de la Confession pour la première fois",
    }),
    text:Object.freeze({
      en:"Tell the person that the priest can guide a first Confession. They should prepare honestly, say that it is their first time, and not worry about performing a memorized script perfectly. If their Baptism or reception into the Church is uncertain, speak with the priest before treating this as an ordinary Confession.",
      fr:"Dites à la personne que le prêtre peut guider une première Confession. Elle doit se préparer honnêtement, dire qu’il s’agit de sa première fois et ne pas s’inquiéter de réciter parfaitement une formule mémorisée. Si son Baptême ou sa réception dans l’Église est incertain, il faut d’abord en parler au prêtre avant de traiter la situation comme une Confession ordinaire.",
    }),
    explanation:Object.freeze({
      en:"The sacrament requires contrition, confession and the priestly ministry of absolution. Apostolate may remove fear and explain the next step, but it cannot determine sacramental eligibility, receive a private list of grave sins or imitate the confessor.",
      fr:"Le sacrement suppose la contrition, la confession et le ministère sacerdotal de l’absolution. Apostolate peut réduire la peur et expliquer l’étape suivante, mais ne peut déterminer l’admissibilité sacramentelle, recueillir une liste privée de péchés graves ni imiter le confesseur.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not ask the person to type out grave sins into Apostolate.","Do not simulate absolution or decide whether a Confession would be valid.","Do not assume an uncertain Baptism or reception status.","Do not make memorizing a formula a prerequisite for approaching the priest."]),
      fr:Object.freeze(["Ne pas demander à la personne de saisir ses péchés graves dans Apostolate.","Ne pas simuler l’absolution ni décider si une Confession serait valide.","Ne pas supposer résolue une situation incertaine de Baptême ou de réception dans l’Église.","Ne pas faire de la mémorisation d’une formule une condition préalable pour s’approcher du prêtre."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF05","APF07","APF08","APF09"]),
    sourceStrength:"PRIMARY_PLUS_CATECHETICAL",
    onRamp:Object.freeze({
      minimum:step("Explain what Confession is, what the penitent does, and that the priest can guide the order.","Expliquez ce qu’est la Confession, ce que fait le pénitent et que le prêtre peut guider l’ordre du sacrement."),
      anxiety:step("Normalize saying, ‘This is my first Confession’ or ‘I do not know what to do.’","Normalisez le fait de dire : « C’est ma première Confession » ou « Je ne sais pas quoi faire »."),
      boundary:step("If Baptism, reception status, marriage or another canonical issue may affect the situation, direct the person to the priest rather than resolving it in-app.","Si le Baptême, la réception dans l’Église, le mariage ou une autre question canonique peut affecter la situation, orientez la personne vers le prêtre au lieu de la résoudre dans l’application."),
      handoff:step("Open the Confession preparation owner; use Find/Explore to locate a priest when needed.","Ouvrez le module canonique de préparation à la Confession ; utilisez Explorer pour trouver un prêtre lorsque cela est nécessaire."),
    }),
    sourceIds:Object.freeze(["TRENT-XIV-PENANCE","CIC83-987-989","ST-PIUS-X-CATECHISM-FR"]),
    handoffs:Object.freeze([
      owned("pray","pray.confession","The canonical Confession preparation workflow belongs to PRAY."),
      owned("find","find","Use Explore/Find when the person needs to identify a priest or church."),
    ]),
  }),
  Object.freeze({
    id:"DV03",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Introduce someone to Eucharistic Adoration or Benediction",
      fr:"Faire découvrir l’Adoration eucharistique ou la Bénédiction du Saint-Sacrement",
    }),
    text:Object.freeze({
      en:"Explain first that Adoration can be simple and silent: remain before Christ present in the Blessed Sacrament and pray without needing to fill every minute. Benediction is different: it is a public rite led by the Church, so the congregation follows what is actually happening rather than a private checklist.",
      fr:"Expliquez d’abord que l’Adoration peut être simple et silencieuse : demeurez devant le Christ présent au Saint-Sacrement et priez sans devoir remplir chaque minute. La Bénédiction est différente : c’est un rite public conduit par l’Église ; l’assemblée suit donc ce qui se passe réellement plutôt qu’une liste privée d’étapes.",
    }),
    explanation:Object.freeze({
      en:"Catholic Eucharistic devotion rests on the Real Presence. Benediction developed as a public service of veneration before the exposed Blessed Sacrament and culminates in the Eucharistic blessing given by the minister. The app already has separate Adoration and Benediction owners for these two situations.",
      fr:"La dévotion eucharistique catholique repose sur la Présence réelle. La Bénédiction s’est développée comme un office public de vénération devant le Saint-Sacrement exposé et culmine dans la bénédiction eucharistique donnée par le ministre. L’application possède déjà des modules distincts pour l’Adoration et la Bénédiction.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not tell a beginner that silence means they are ‘doing nothing.’","Do not make one posture universal where local practice or physical ability varies.","Do not let the app advance ahead of a live Benediction service.","Do not describe the Eucharistic blessing as something a layperson performs."]),
      fr:Object.freeze(["Ne pas dire à un débutant que le silence signifie qu’il « ne fait rien ».","Ne pas rendre universelle une posture lorsque l’usage local ou la capacité physique varie.","Ne pas laisser l’application devancer un office réel de Bénédiction.","Ne pas décrire la bénédiction eucharistique comme un acte accompli par un laïc."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF08","APF09"]),
    sourceStrength:"MIXED_VERIFIED",
    onRamp:Object.freeze({
      minimum:step("Distinguish private/open-ended Adoration from the public rite of Benediction.","Distinguez l’Adoration privée ou libre du rite public de la Bénédiction."),
      anxiety:step("Reassure the person that silent presence and a short act of faith are enough to begin Adoration.","Rassurez la personne : le silence et un court acte de foi suffisent pour commencer l’Adoration."),
      boundary:step("At Benediction, the public rite and minister determine the pace and actions; the app only helps the faithful follow.","À la Bénédiction, le rite public et le ministre déterminent le rythme et les actions ; l’application aide seulement les fidèles à suivre."),
      handoff:step("Open Adoration for private prayer or Benediction for the live public companion.","Ouvrez Adoration pour la prière privée ou Bénédiction pour le compagnon du rite public en direct."),
    }),
    sourceIds:Object.freeze(["TRENT-XIII-EUCHARIST","CE1911-BENEDICTION"]),
    handoffs:Object.freeze([
      owned("pray","pray.adoration","The canonical Adoration and Visit owner handles private Eucharistic prayer."),
      owned("pray","pray.benediction","The canonical Benediction owner follows the public rite."),
    ]),
  }),
  Object.freeze({
    id:"DV04",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Help someone begin a novena",
      fr:"Aider quelqu’un à commencer une neuvaine",
    }),
    text:Object.freeze({
      en:"A novena is a nine-day Catholic devotion of prayer. Start by choosing the actual novena, understanding its intention and traditional timing, then pray the verified text each day. Do not treat the nine days as a magic contract or assume every novena has identical rules.",
      fr:"Une neuvaine est une dévotion catholique de neuf jours de prière. Commencez par choisir la neuvaine elle-même, comprendre son intention et son calendrier traditionnel, puis priez chaque jour le texte vérifié. Ne traitez pas les neuf jours comme un contrat magique et ne supposez pas que toutes les neuvaines suivent des règles identiques.",
    }),
    explanation:Object.freeze({
      en:"Traditional Catholic usage includes novenas of preparation, petition, mourning and other forms, with different histories and indulgence status. Apostolate should explain the basic practice and then hand off to the app’s canonical novena record, where the text, start date, history and sources belong.",
      fr:"L’usage catholique traditionnel comprend des neuvaines de préparation, de demande, de deuil et d’autres formes, avec des histoires et des statuts d’indulgence différents. Apostolate doit expliquer la pratique de base puis renvoyer vers la fiche canonique de la neuvaine, où se trouvent le texte, la date de début, l’histoire et les sources.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not promise that completing a novena guarantees the requested favour.","Do not invent a universal rule for what happens if one day is missed.","Do not assign the same start date logic to every novena.","Do not duplicate novena texts or indulgence claims inside Apostolate."]),
      fr:Object.freeze(["Ne pas promettre que l’accomplissement d’une neuvaine garantit la faveur demandée.","Ne pas inventer une règle universelle pour le cas où un jour est manqué.","Ne pas appliquer la même logique de date de début à toutes les neuvaines.","Ne pas dupliquer dans Apostolate les textes des neuvaines ni les affirmations sur les indulgences."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF07","APF09"]),
    sourceStrength:"MIXED_VERIFIED",
    onRamp:Object.freeze({
      minimum:step("Explain that a novena is nine days of prayer and identify the specific devotion being undertaken.","Expliquez qu’une neuvaine est une prière de neuf jours et identifiez la dévotion précise qui sera suivie."),
      anxiety:step("Keep the first day simple: open the verified novena and pray the day assigned rather than researching every custom first.","Gardez le premier jour simple : ouvrez la neuvaine vérifiée et priez le jour indiqué au lieu d’étudier d’abord toutes les coutumes."),
      boundary:step("Timing, indulgences, missed-day practice and promises are source-specific; Apostolate must not generalize them.","Le calendrier, les indulgences, la conduite en cas de jour manqué et les promesses dépendent des sources ; Apostolate ne doit pas les généraliser."),
      handoff:step("Open the canonical Novenas owner and Calendar/Coming Up for temporal guidance.","Ouvrez le module canonique des Neuvaines et le Calendrier/À venir pour le guidage temporel."),
    }),
    sourceIds:Object.freeze(["CE1911-NOVENA"]),
    handoffs:Object.freeze([
      owned("pray","pray.novenas","The canonical novena corpus owns texts, histories, modes and provenance."),
      owned("calendar","calendar","Calendar owns temporal placement, starts and current/approaching presentation."),
    ]),
  }),
  Object.freeze({
    id:"DV05",publication:"READY",claimClass:"P",
    title:Object.freeze({
      en:"Introduce someone to First Friday / Sacred Heart devotion",
      fr:"Faire découvrir le premier vendredi et la dévotion au Sacré-Cœur",
    }),
    text:Object.freeze({
      en:"Begin with the centre of the devotion: love of the Sacred Heart of Jesus expressed through reparation and, in the First Friday practice, Holy Communion with a reparatory intention on the first Friday. Ordinary preparation for Communion still applies. The app may record what the user reports, but it does not certify grace, worthiness or promised effects.",
      fr:"Commencez par le centre de la dévotion : l’amour du Sacré-Cœur de Jésus exprimé par la réparation et, dans la pratique du premier vendredi, la sainte Communion avec une intention réparatrice le premier vendredi. La préparation ordinaire à la Communion demeure nécessaire. L’application peut enregistrer ce que l’utilisateur déclare, mais elle ne certifie ni grâce, ni dignité, ni effets promis.",
    }),
    explanation:Object.freeze({
      en:"Sacred Heart devotion is devotion to Jesus Christ under the sign of His Heart and has a strong reparatory character. Traditional First Friday practice is tied to Communion and reparation; the app already owns the nine-month programme and the relevant Sacred Heart prayers.",
      fr:"La dévotion au Sacré-Cœur est une dévotion à Jésus-Christ sous le signe de son Cœur et possède un caractère fortement réparateur. La pratique traditionnelle des premiers vendredis est liée à la Communion et à la réparation ; l’application possède déjà le programme des neuf mois ainsi que les prières correspondantes du Sacré-Cœur.",
    }),
    avoid:Object.freeze({
      en:Object.freeze(["Do not present First Friday as a mechanical guarantee of salvation.","Do not imply that a reparatory intention replaces ordinary Communion discipline.","Do not make an optional Holy Hour part of the essential First Friday act.","Do not duplicate the nine-month tracker or Sacred Heart prayer treasury."]),
      fr:Object.freeze(["Ne pas présenter le premier vendredi comme une garantie mécanique du salut.","Ne pas laisser entendre qu’une intention réparatrice remplace la discipline ordinaire de la Communion.","Ne pas faire d’une Heure Sainte facultative une partie essentielle de l’acte du premier vendredi.","Ne pas dupliquer le suivi des neuf mois ni le trésor de prières du Sacré-Cœur."]),
    }),
    apfSkills:Object.freeze(["APF01","APF02","APF03","APF04","APF05","APF07","APF08","APF09"]),
    sourceStrength:"MIXED_VERIFIED",
    onRamp:Object.freeze({
      minimum:step("Explain reparation, the First Friday timing, and the central place of Holy Communion.","Expliquez la réparation, le calendrier du premier vendredi et la place centrale de la sainte Communion."),
      anxiety:step("Do not make the person master every Sacred Heart prayer before beginning; start with the programme’s first guided step.","N’exigez pas que la personne maîtrise toutes les prières du Sacré-Cœur avant de commencer ; partez de la première étape guidée du programme."),
      boundary:step("Worthiness for Communion, sacramental validity, grace and devotional promises are not certified by the app.","L’application ne certifie ni la dignité pour communier, ni la validité sacramentelle, ni la grâce, ni les promesses dévotionnelles."),
      handoff:step("Open the First Friday programme; use Confession, Mass preparation, Sacred Heart prayers and Calendar as their own canonical owners.","Ouvrez le programme des premiers vendredis ; utilisez la Confession, la préparation à la Messe, les prières du Sacré-Cœur et le Calendrier dans leurs modules canoniques."),
    }),
    sourceIds:Object.freeze(["LEO-XIII-ANNUM-SACRUM","PIUS-XI-MISERENTISSIMUS","CE1911-SACRED-HEART"]),
    handoffs:Object.freeze([
      owned("pray","programme.first_friday","The nine-month guided programme owns First Friday execution and user-reported tracking."),
      owned("pray","pray.confession","Confession preparation remains owned by PRAY when needed before Communion."),
      owned("mass","mass.prepare","Mass preparation remains owned by the Mass surface."),
      owned("mass","mass","The Mass reader owns live following."),
      owned("pray","pray.library","The Prayer Library owns the Sacred Heart prayer treasury."),
      owned("calendar","calendar","Calendar owns temporal placement and recurrence."),
      owned("apostolate","FH08","FH08 covers adopting Sacred Heart devotion at the family level."),
    ]),
  }),
]);
