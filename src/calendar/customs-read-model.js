/* Published Customs read model for the existing Calendar.
 * Source: canonical published IDs in customs-atlas-seed.v1.json and bilingual
 * accepted p0/p1 guidance in main. Research-master candidates are excluded.
 * This is a presentation projection, not a new canonical Calendar or Atlas.
 */
import { buildLiturgicalYear } from "./liturgical-year.js";
import { v384Dates } from "./traditional-year-v384.js";
import { CANONICAL_EXTRA_CUSTOM_ARTICLES } from "./customs-extra-articles.js";
import { calendarCustomProfileActions } from "./customs-profile-links.js";
import { customsEditorialPreviewArticle, customsEditorialPreviewIds, customsEditorialPreviewForDate } from "./customs-editorial-preview.js";

const PUBLISHED_ARTICLES = [
  {
    "id": "ADVT-001",
    "title": {
      "en": "The family Advent wreath",
      "fr": "La couronne de l’Avent en famille"
    },
    "description": {
      "en": "A ring of evergreen branches with four candles can accompany a family's Advent prayers. One more candle is lighted each Sunday, marking the approach of Christmas and the expectation of Christ's coming.",
      "fr": "Une couronne de feuillage portant quatre bougies peut accompagner la prière familiale durant l'Avent. Chaque dimanche, une bougie supplémentaire est allumée pour marquer l'approche de Noël et l'attente du Christ."
    },
    "history": {
      "en": "The Archdiocese of Cologne traces the modern Advent wreath to the Protestant pastor Johann Hinrich Wichern, who used a multi-candle wheel at a Hamburg institution in 1839. The familiar four-candle form developed later, and its use in Catholic churches spread substantially in the twentieth century. This family devotion is not an ancient Roman Mass rite.",
      "fr": "L'archidiocèse de Cologne fait remonter la couronne de l'Avent moderne au pasteur protestant Johann Hinrich Wichern, qui employait une roue munie de bougies dans un établissement de Hambourg en 1839. La forme actuelle à quatre bougies s'est développée ensuite, et son usage dans les églises catholiques s'est largement diffusé au XXe siècle. Cette dévotion familiale n'est pas un ancien rite de la messe romaine."
    },
    "meaning": {
      "en": "Its growing light reminds the household of hope and preparation for the Saviour.",
      "fr": "Sa lumière grandissante rappelle l'espérance et la préparation à la venue du Sauveur."
    },
    "practice": {
      "en": "Light the appropriate candle during a short family prayer or Scripture reading, using a safe candle arrangement. The devotion is optional; do not imply the Church prescribes it at a 1962 Mass.",
      "fr": "Allumer la bougie correspondante pendant une brève prière ou lecture de l'Écriture, en veillant à la sécurité. Cette dévotion est libre et ne constitue pas une rubrique de la messe de 1962."
    },
    "caution": {
      "en": "The wreath is a voluntary household devotion, not part of the 1962 Mass. A liturgical blessing must follow the rite and minister authorized for it; always attend to candle safety.",
      "fr": "La couronne est une dévotion familiale libre, distincte de la messe de 1962. Une bénédiction liturgique relève du rite et du ministre habilité ; les bougies exigent de la prudence."
    },
    "scope": {
      "en": "Catholic household use; adopted devotional form rather than an original ancient Roman rite",
      "fr": "Dévotion domestique catholique, sans statut de rite romain universel ancien."
    },
    "occasion": {
      "en": "The four Sundays of Advent",
      "fr": "Les quatre dimanches de l’Avent"
    },
    "history_sources": [
      {
        "id": "EBK-ADVENT-WREATH-WICHERN-2025",
        "title": "Der Adventskranz: Bedeutung und Ursprung des Adventskranzes",
        "url": "https://www.erzbistum-koeln.de/presse_und_medien/magazin/Der-Adventskranz-Bedeutung-und-Ursprung-des-Adventskranzes/"
      }
    ],
    "sources": [
      {
        "id": "USCCB-ADVENT-WREATH-HOME",
        "title": "Blessing of an Advent Wreath",
        "url": "https://www.usccb.org/prayers/blessing-advent-wreath"
      }
    ]
  },
  {
    "id": "ADVT-002",
    "title": {
      "en": "The Advent manger of good deeds",
      "fr": "La crèche préparée par les bonnes actions"
    },
    "description": {
      "en": "Children in some Catholic families place a little straw in an empty manger after doing a good deed or saying a prayer. The custom makes their preparation for the coming of the Christ Child visible, without measuring grace or turning charity into a competition.",
      "fr": "Dans certaines familles catholiques, les enfants déposent un peu de paille dans une mangeoire après une bonne action ou une prière. La coutume rend visible leur préparation à la venue de l'Enfant Jésus, sans mesurer la grâce ni transformer la charité en compétition."
    },
    "history": {
      "en": "A 2014 Catholic family account describes manger straw after good deeds and calls it French. Independently, the Archdiocese of Cologne describes the same preparation of the crib in Catholic German regions. These witnesses attest the devotion across settings, but neither establishes a specifically French origin, a precise starting date or universal practice.",
      "fr": "Un témoignage familial catholique de 2014 décrit la paille ajoutée à la crèche après de bonnes actions et qualifie l'usage de français. Indépendamment, l'archidiocèse de Cologne atteste une préparation semblable de la crèche dans des régions catholiques allemandes. Ces témoins confirment la dévotion dans plusieurs milieux, sans en prouver une origine exclusivement française, une date précise ni un usage universel."
    },
    "meaning": {
      "en": "The empty crib reminds everyone to make room for Christ through charity and conversion.",
      "fr": "La mangeoire vide rappelle qu'il faut faire place au Christ par la charité et la conversion."
    },
    "practice": {
      "en": "As a freely chosen family custom, add a little straw after acts of kindness; pray together before placing the Child Jesus in the crib at Christmas.",
      "fr": "À titre de coutume familiale libre, ajouter un peu de paille après un geste de bonté et prier ensemble avant de déposer l'Enfant Jésus dans la crèche à Noël."
    },
    "caution": {
      "en": "The custom's precise geographical origin has not been established. The straw is optional and is not a measure of grace, charitable merit or a child's spiritual progress.",
      "fr": "L'origine géographique précise de cet usage n'est pas établie. La paille est facultative et ne mesure ni la grâce, ni le mérite des bonnes actions, ni les progrès spirituels de l'enfant."
    },
    "scope": {
      "en": "Catholic household Advent custom; French origin is a traditional attribution, not universal local practice",
      "fr": "Dévotion familiale facultative liée à la préparation de Noël."
    },
    "occasion": {
      "en": "Advent; especially family preparations before Christmas",
      "fr": "Pendant l’Avent, surtout dans les préparatifs de Noël"
    },
    "history_sources": [
      {
        "id": "EBK-ADVENT-MANGER-STRAW-2025",
        "title": "Was ist Advent: Ursprung und Bedeutung der Vorweihnachtszeit",
        "url": "https://www.erzbistum-koeln.de/presse_und_medien/magazin/Was-ist-Advent-Ursprung-und-Bedeutung-der-Vorweihnachtszeit/"
      }
    ],
    "sources": [
      {
        "id": "CATHCULTURE-ADVENT-MANGER-STRAW-2014",
        "title": "Straws in the Manger—Preparing Our Hearts for Christ's Birth",
        "url": "https://www.catholicculture.org/commentary/straws-in-manger-preparing-our-hearts-for-christs-birth/"
      }
    ]
  },
  {
    "id": "ADVT-003",
    "title": {
      "en": "Las Posadas: welcoming the Holy Family",
      "fr": "Las Posadas : accueillir la Sainte Famille"
    },
    "description": {
      "en": "In Las Posadas, neighbours or parish groups remember Mary and Joseph seeking lodging before the Nativity. The community moves between homes or stations, singing, until a household symbolically offers welcome.",
      "fr": "Pendant les posadas, des familles ou des groupes paroissiaux rappellent la recherche d'un abri par Marie et Joseph avant Noël. Le groupe passe de maison en maison, souvent en chantant, jusqu'à l'accueil symbolique dans un foyer."
    },
    "history": {
      "en": "Mexico's Ministry of Culture describes Las Posadas as a tradition deeply rooted in colonial Mexican Christianity. It records one origin account locating it at San Agustín de Acolman in 1587 and another attributing transmission to Andalusia. The precise origin is therefore debated; the customary visits between households must not be confused with a mandatory liturgical procession.",
      "fr": "Le ministère mexicain de la Culture situe les posadas dans le christianisme du Mexique colonial. Il rapporte une hypothèse d'origine à San Agustín de Acolman en 1587 et une autre faisant intervenir une transmission depuis l'Andalousie. L'origine exacte reste donc discutée ; les visites coutumières de foyer en foyer ne constituent pas une procession liturgique obligatoire."
    },
    "meaning": {
      "en": "Christ's coming invites Christians to hospitality and charity toward those looking for shelter.",
      "fr": "La venue du Christ appelle les chrétiens à l'hospitalité et à la charité envers ceux qui cherchent refuge."
    },
    "practice": {
      "en": "Where celebrated, join an announced parish gathering; otherwise read Luke's infancy narrative and offer a concrete act of hospitality.",
      "fr": "Là où la coutume est célébrée, participer à une rencontre paroissiale annoncée ; autrement, lire le récit de l'enfance de Jésus et poser un acte concret d'hospitalité."
    },
    "caution": {
      "en": "Las Posadas is an optional regional custom, not a required liturgical procession or an added Mass rite. Household visits and parish gatherings depend on arrangements actually made locally.",
      "fr": "Les posadas sont une coutume régionale facultative, non une procession liturgique imposée ni un rite ajouté à la messe. Les visites et rencontres dépendent de l'organisation locale réelle."
    },
    "scope": {
      "en": "Mexico and other Latin American Catholic communities; some US parishes",
      "fr": "Tradition catholique régionale, particulièrement au Mexique et dans certaines communautés hispaniques."
    },
    "occasion": {
      "en": "Advent, traditionally beginning 16 December",
      "fr": "Avent, traditionnellement à partir du 16 décembre"
    },
    "history_sources": [
      {
        "id": "MEX-CULTURA-POSADAS-ORIGINS-2017",
        "title": "Y tú, ¿cómo celebras las posadas?",
        "url": "https://www.gob.mx/cultura/articulos/y-tu-como-celebras-las-posadas?idiom=es"
      }
    ],
    "sources": [
      {
        "id": "USCCB-POSADAS-DEC16",
        "title": "December 16 — Las Posadas",
        "url": "https://www.usccb.org/prayer-and-worship/liturgical-year/advent/advent-december-16"
      }
    ]
  },
  {
    "id": "XMAS-001",
    "title": {
      "en": "Sharing opłatek on Christmas Eve",
      "fr": "Le partage de l’opłatek à la veille de Noël"
    },
    "description": {
      "en": "Before Christmas Eve dinner, family members share a thin unleavened opłatek wafer while offering one another good wishes and reconciliation. It is ordinary blessed-or-unblessed festive bread, not Holy Communion.",
      "fr": "Avant le repas de la veille de Noël, les membres de la famille partagent une fine feuille de pain azyme non consacré, appelée opłatek, en échangeant des vœux et des paroles de réconciliation. Ce pain de fête n'est pas l'Eucharistie."
    },
    "history": {
      "en": "A Catholic parish account documents the Polish Christmas Eve sharing of opłatek and its continued use among families outside Poland. It witnesses a living Polish-rooted custom without establishing an exact date of origin.",
      "fr": "Un témoignage paroissial catholique décrit le partage de l'opłatek la veille de Noël et le maintien de cet usage dans des familles hors de Pologne. Il atteste une coutume vivante d'origine polonaise sans fixer sa date de naissance."
    },
    "meaning": {
      "en": "A tangible act of family peace and mutual charity as the household prepares to celebrate the Nativity.",
      "fr": "Un geste concret de paix familiale et de charité mutuelle avant la célébration de la Nativité."
    },
    "practice": {
      "en": "If this is part of your family tradition, share opłatek with a prayer of thanksgiving and personal good wishes; where a priest blesses the wafers, keep that ministerial act distinct.",
      "fr": "Si cette tradition appartient à votre famille, partager l'opłatek avec des vœux et une prière d'action de grâce ; lorsqu'un prêtre bénit ce pain, distinguer cette bénédiction du partage familial."
    },
    "caution": {
      "en": "Opłatek is unconsecrated bread, not Holy Communion. Sharing it is a voluntary family custom; no priestly blessing at home or special Mass formula is required.",
      "fr": "L'opłatek est un pain non consacré, et non la sainte communion. Son partage est une coutume familiale libre : il n'exige ni bénédiction sacerdotale à domicile ni formule particulière de la messe."
    },
    "scope": {
      "en": "Poland and Polish-heritage Catholic households abroad",
      "fr": "Pologne et familles catholiques d'origine polonaise établies à l'étranger."
    },
    "occasion": {
      "en": "Christmas Eve; Polish Catholic family custom",
      "fr": "Veille de Noël, tradition familiale polonaise"
    },
    "sources": [
      {
        "id": "SJV-VERMONT-OPLATKI",
        "title": "Opłatki — A Polish Christmas Tradition",
        "url": "https://stjohnvianney.vermontcatholic.org/oplatki"
      }
    ]
  },
  {
    "id": "HTHU-001",
    "title": {
      "en": "Visiting churches on Holy Thursday",
      "fr": "Visiter les églises le Jeudi saint"
    },
    "description": {
      "en": "After the Mass of the Lord's Supper, some faithful visit several churches to pray before the Blessed Sacrament at an altar of repose. Seven is a common traditional number but is not mandatory.",
      "fr": "Après la messe de la Cène du Seigneur, certains fidèles visitent plusieurs églises pour prier devant le Saint-Sacrement au reposoir. Le nombre de sept est traditionnel dans certains lieux, sans constituer une obligation."
    },
    "history": {
      "en": "A Catholic newspaper account in March 2026 describes voluntary visits to churches after the Holy Thursday Mass and notes that the number of stops varies. Links sometimes drawn to St Philip Neri's Roman pilgrimages should not be treated as proof of one exclusive historical origin.",
      "fr": "Un article de presse catholique paru en mars 2026 décrit les visites facultatives aux églises après la messe du Jeudi saint et précise que leur nombre varie. Le rapprochement parfois établi avec les pèlerinages romains de saint Philippe Néri ne prouve pas une origine historique unique."
    },
    "meaning": {
      "en": "A voluntary way to keep watch with Christ before His Passion.",
      "fr": "Une manière libre de veiller avec le Christ à la veille de sa Passion."
    },
    "practice": {
      "en": "Visit one or more churches actually open for prayer, or simply remain in adoration at your own parish's repository.",
      "fr": "Visiter une ou plusieurs églises réellement ouvertes pour la prière, ou demeurer en adoration au reposoir de sa propre paroisse."
    },
    "caution": {
      "en": "Seven church visits are not required. Pray at a church actually open for the Holy Thursday repository; this devotion does not add a ceremony to the 1962 liturgy.",
      "fr": "La visite de sept églises n'est pas obligatoire. On prie auprès d'un reposoir réellement accessible ; cette dévotion n'ajoute aucune cérémonie à la liturgie de 1962."
    },
    "scope": {
      "en": "Catholic pilgrimage custom with regionally variable number of churches",
      "fr": "Visite dévotionnelle des églises, selon les usages et possibilités locales."
    },
    "occasion": {
      "en": "Holy Thursday after the evening liturgy, where access permits",
      "fr": "Jeudi saint après la liturgie, si les églises sont accessibles"
    },
    "sources": [
      {
        "id": "CHICAGO-CATHOLIC-HOLY-THURSDAY-2026",
        "title": "Visiting seven churches on Holy Thursday a longstanding tradition",
        "url": "https://www.chicagocatholic.com/chicagoland/-/article/2026/03/18/visiting-seven-churches-on-holy-thursday-a-longstanding-tradition"
      }
    ]
  },
  {
    "id": "ROGA-001",
    "title": {
      "en": "A family Rogation prayer walk",
      "fr": "Une marche de prière familiale aux Rogations"
    },
    "description": {
      "en": "A Catholic family guide describes going on a simple prayer walk during the Rogations, asking God's blessing on gardens, crops and the labour of those who provide food. This private act is distinct from the priest-led litanies or blessings.",
      "fr": "Un ancien guide familial catholique propose une promenade de prière aux Rogations pour confier à Dieu les jardins, les récoltes et le travail de ceux qui produisent la nourriture. Ce geste privé est distinct des litanies et des bénédictions sacerdotales."
    },
    "history": {
      "en": "The cited Catholic family guide supplies an example of private Rogation prayer for crops and household walks. This adaptation is distinct from formal ecclesiastical Rogation processions and does not establish that every Catholic region kept the same domestic practice.",
      "fr": "Le guide familial catholique cité propose un exemple de prière privée des Rogations pour les récoltes et de promenade familiale. Cette adaptation se distingue des processions ecclésiastiques et ne prouve pas que toutes les régions catholiques aient connu le même usage domestique."
    },
    "meaning": {
      "en": "Prayer for the harvest recognises dependence on God's providence and the dignity of human labour.",
      "fr": "La prière pour les récoltes rappelle la dépendance envers la Providence et la dignité du travail humain."
    },
    "practice": {
      "en": "Take a short family walk, or pause beside a garden, to pray for farmers and give thanks for creation; attend a real parish Rogation if offered.",
      "fr": "Faire une courte marche en famille, ou s'arrêter dans un jardin, pour prier pour les agriculteurs et remercier Dieu de la création ; participer aux Rogations paroissiales là où elles existent."
    },
    "caution": {
      "en": "Private family prayer is distinct from the Church's Rogation processions and priestly blessings of fields. A household walk never implies a scheduled parish procession or permission to perform reserved rites.",
      "fr": "La prière familiale privée se distingue des processions des Rogations et des bénédictions sacerdotales des champs. Une promenade n'annonce pas de procession paroissiale et n'autorise aucun rite réservé."
    },
    "scope": {
      "en": "Historical Catholic household suggestion; farm, garden or city context",
      "fr": "Adaptation familiale facultative des Rogations, à la campagne, dans un jardin ou même en ville."
    },
    "occasion": {
      "en": "Major and Minor Rogation days, where traditionally observed",
      "fr": "Jours des grandes et petites Rogations, là où cette pratique est observée"
    },
    "sources": [
      {
        "id": "NEWLAND-ROGATION-FAMILY-1956",
        "title": "Family Procession for a Blessing on the Crops",
        "url": "https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=1234"
      }
    ]
  },
  {
    "id": "EPIP-001",
    "title": {
      "en": "Epiphany star singers",
      "fr": "Les chanteurs de l’Épiphanie"
    },
    "description": {
      "en": "Children dressed as the Magi visit homes around Epiphany, bringing a Christian blessing, singing and gathering support for children in need. In Germany the practice is organised through Catholic parishes and the Sternsinger campaign.",
      "fr": "Autour de l'Épiphanie, des enfants costumés en mages rendent visite aux familles, chantent et portent un message de bénédiction tout en recueillant une aide pour les enfants dans le besoin. En Allemagne, l'action est organisée par les paroisses catholiques."
    },
    "history": {
      "en": "The German Catholic children's missionary organisation documents its present-day carol-singers campaign around Epiphany, joining household visits and charitable collections. This establishes the organised contemporary form, not the precise origin of every older regional singing custom.",
      "fr": "L'organisme missionnaire catholique allemand pour les enfants présente sa campagne actuelle des chanteurs de l'Épiphanie, qui associe visites aux foyers et collecte caritative. La source atteste cette forme organisée contemporaine, non l'origine précise de tous les usages régionaux plus anciens."
    },
    "meaning": {
      "en": "The Magi's homage becomes a lesson in mission, charity and bringing Christ's light into homes.",
      "fr": "L'hommage des mages devient une leçon de mission, de charité et de présence de la lumière du Christ dans les foyers."
    },
    "practice": {
      "en": "Join only a local parish's organised visit, welcome the singers when announced, or pray for children who are in need.",
      "fr": "Participer uniquement à une action paroissiale organisée, accueillir les chanteurs annoncés ou prier pour les enfants défavorisés."
    },
    "caution": {
      "en": "Sternsinger visits depend on the local parish campaign. The children's songs and charitable collection do not necessarily include a priestly house blessing; confirm any planned visit locally.",
      "fr": "Les visites des Sternsinger dépendent de la campagne paroissiale locale. Les chants et la collecte des enfants ne constituent pas nécessairement une bénédiction sacerdotale de la maison ; se renseigner auprès de la paroisse."
    },
    "scope": {
      "en": "Germany: Catholic parish-organised Sternsinger charity campaigns",
      "fr": "Allemagne : visites caritatives organisées localement par les paroisses."
    },
    "occasion": {
      "en": "Christmas–Epiphany season, particularly near 6 January",
      "fr": "Temps de Noël et de l’Épiphanie, surtout près du 6 janvier"
    },
    "sources": [
      {
        "id": "STERN-KINDERMISSIONSWERK-2026",
        "title": "The Carol Singers’ Campaign",
        "url": "https://www.kindermissionswerk.org/en/ueber-uns/the-carol-singers-campaign"
      }
    ]
  },
  {
    "id": "EPIP-002",
    "title": {
      "en": "The Epiphany cake and the poor person's portion",
      "fr": "La galette des Rois et la part du pauvre"
    },
    "description": {
      "en": "French families may share a King Cake or galette with a hidden bean and a symbolic paper crown. Some historical forms set aside an extra portion for a poor neighbour or unexpected guest.",
      "fr": "À l'Épiphanie, on partage en France une galette ou un gâteau des Rois contenant une fève, souvent accompagnée d'une couronne. Certaines formes de la coutume prévoient une part supplémentaire pour une personne pauvre ou un invité inattendu."
    },
    "history": {
      "en": "The French Bishops' Conference describes sharing a galette or cake with a hidden bean and sometimes reserving an extra portion for a poor person or stranger. This supports the household custom without proving claims of direct descent from ancient Roman festivals.",
      "fr": "La conférence des évêques de France décrit le partage d'une galette ou d'un gâteau contenant une fève, avec parfois une part réservée au pauvre ou à l'étranger. Ce témoignage confirme la coutume familiale sans démontrer une filiation directe avec les fêtes de la Rome antique."
    },
    "meaning": {
      "en": "The feast of the Magi can connect domestic joy with generosity to others.",
      "fr": "La fête des mages unit la joie familiale à la générosité envers autrui."
    },
    "practice": {
      "en": "Share a family cake and, if appropriate, include an act of hospitality or a portion offered to someone in need.",
      "fr": "Partager une galette en famille et, si cela convient, pratiquer un geste d'hospitalité ou offrir une part à une personne dans le besoin."
    },
    "caution": {
      "en": "The bean, crown and extra portion are household customs, not rites of the Epiphany Mass. Cakes and practices differ locally, and a direct ancient Roman origin is not established.",
      "fr": "La fève, la couronne et la part supplémentaire relèvent de la coutume familiale, non des rites de la messe de l'Épiphanie. Les usages varient selon les régions et une origine directement romaine antique n'est pas démontrée."
    },
    "scope": {
      "en": "Documented French household custom; regional cakes differ",
      "fr": "France : coutume familiale de l’Épiphanie."
    },
    "occasion": {
      "en": "6 January in the 1962 Roman calendar; family dates vary",
      "fr": "6 janvier dans le calendrier romain de 1962 ; les usages familiaux varient"
    },
    "sources": [
      {
        "id": "ECF-GALETTE-EPIPHANIE",
        "title": "Fêter l’Épiphanie en famille",
        "url": "https://eglise.catholique.fr/approfondir-sa-foi/la-celebration-de-la-foi/les-grandes-fetes-chretiennes/epiphanie/426637-feter-lepiphanie/"
      }
    ]
  },
  {
    "id": "CORP-001",
    "title": {
      "en": "Flower carpets for Corpus Christi",
      "fr": "Tapis de fleurs pour la Fête-Dieu"
    },
    "description": {
      "en": "In some Catholic communities, families lay floral carpets along Corpus Christi procession routes; in others, flowers decorate nearby streets and windows. A specific Polish tradition is recognised as cultural heritage.",
      "fr": "Dans certaines communautés catholiques, les familles réalisent des tapis de fleurs sur le parcours de la procession de la Fête-Dieu ; ailleurs, les rues et les fenêtres sont fleuries. Une tradition polonaise est reconnue comme patrimoine culturel."
    },
    "history": {
      "en": "UNESCO documented the Polish tradition of families laying flower carpets for Corpus Christi processions and inscribed it in 2021. The Church's general guidance on Eucharistic processions does not make the Polish floral arrangement a universal liturgical requirement.",
      "fr": "L'UNESCO a documenté la tradition polonaise des tapis de fleurs réalisés en famille pour les processions de la Fête-Dieu et l'a inscrite en 2021. Les directives générales de l'Église sur les processions eucharistiques ne font pas de cet aménagement floral une prescription liturgique universelle."
    },
    "meaning": {
      "en": "Flowers along the route express public reverence for Christ in the Blessed Sacrament, without creating a liturgical rite.",
      "fr": "Les fleurs sur le parcours manifestent la révérence envers le Christ présent au Saint-Sacrement, sans constituer un nouveau rite liturgique."
    },
    "practice": {
      "en": "Ask your parish organisers before decorating an announced procession route or nearby window; otherwise pray on the feast.",
      "fr": "Demander l'accord de la paroisse avant d'orner le parcours d'une procession annoncée ou une fenêtre voisine ; autrement, prier pour la fête."
    },
    "caution": {
      "en": "Flower carpets and decorated windows are optional local traditions, not conditions for a Corpus Christi procession. A route or celebration exists only where it is actually organized.",
      "fr": "Les tapis de fleurs et les fenêtres fleuries sont des coutumes locales facultatives, non des conditions de la procession de la Fête-Dieu. Seules les processions et les étapes réellement organisées doivent être suivies."
    },
    "scope": {
      "en": "Documented Polish local Corpus Christi heritage, including Spycimierz",
      "fr": "Pologne et autres traditions florales locales ; aucune procession présumée."
    },
    "occasion": {
      "en": "Corpus Christi, depending on announced local procession",
      "fr": "Fête-Dieu, selon les processions annoncées localement"
    },
    "sources": [
      {
        "id": "UNESCO-CORPUS-FLOWER-CARPETS",
        "title": "Flower carpets tradition for Corpus Christi processions",
        "url": "https://ich.unesco.org/en/RL/flower-carpets-tradition-for-corpus-christi-processions-01743"
      },
      {
        "id": "VATICAN-DPP-CORPUS-FLOWERS-162",
        "title": "Directory on Popular Piety and the Liturgy, n. 162",
        "url": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html"
      }
    ]
  },
  {
    "id": "EAST-001",
    "title": {
      "en": "An Easter Monday Emmaus walk",
      "fr": "Une marche d'Emmaüs le lundi de Pâques"
    },
    "description": {
      "en": "In parts of southern Germany and Austria, a traditional Easter Monday walk commemorates the disciples' encounter with the risen Christ on the road to Emmaus. Some families or parishes walk toward a church or shrine, with moments of prayer and Scripture.",
      "fr": "Dans certaines régions du sud de l'Allemagne et d'Autriche, une promenade du lundi de Pâques rappelle la rencontre des disciples avec le Christ ressuscité sur le chemin d'Emmaüs. Des familles ou paroisses marchent parfois vers une église ou un sanctuaire en priant."
    },
    "history": {
      "en": "An account from the Archdiocese of Munich and Freising documents an Emmaus walk in a Bavarian Catholic setting. It attests a local Easter Monday practice without fixing its original date or announcing an event in every parish.",
      "fr": "Un témoignage de l'archidiocèse de Munich et Freising documente une marche d'Emmaüs dans un milieu catholique bavarois. Il atteste un usage local du lundi de Pâques sans en fixer la date d'origine ni annoncer une manifestation dans chaque paroisse."
    },
    "meaning": {
      "en": "The walk encourages recognition of the risen Lord in Scripture and ordinary companionship.",
      "fr": "La marche invite à reconnaître le Seigneur ressuscité dans l'Écriture et la rencontre fraternelle."
    },
    "practice": {
      "en": "Read Luke 24:13–35, take a gentle walk with family or friends and pray together; a real local parish walk may be joined where one is offered.",
      "fr": "Lire Luc 24, 13–35, marcher paisiblement en famille ou avec des amis et prier ensemble ; participer à une marche paroissiale là où elle est proposée."
    },
    "caution": {
      "en": "The Emmaus walk is a voluntary regional devotion, sometimes private and sometimes parish-organized. No itinerary or departure time is implied, and the walk is not a Eucharistic procession or part of Mass.",
      "fr": "La marche d'Emmaüs est une dévotion régionale libre, familiale ou paroissiale selon les lieux. Aucun itinéraire ni horaire n'est présumé ; elle ne constitue ni une procession eucharistique ni une partie de la messe."
    },
    "scope": {
      "en": "Regional Roman Catholic walks especially in Bavaria and Austria, optional",
      "fr": "Bavière et Autriche : coutume chrétienne régionale."
    },
    "occasion": {
      "en": "Easter Monday, especially in southern Germany and Austria",
      "fr": "Lundi de Pâques, notamment en Bavière et en Autriche"
    },
    "supporting_sources": [
      {
        "id": "MUNICH-EMMAUS-2026-CURIA",
        "title": "Mit Magdalena unterwegs — 2026 diocesan events including Emmausgang",
        "url": "https://www.erzbistum-muenchen.de/ueber-das-erzbistum/pressebereich/pressemitteilungen/2026-pm/maria-magdalena-suche-nach-spuren-der-apostelin-der-apostel"
      }
    ],
    "sources": [
      {
        "id": "MUNICH-FREISING-EMMAUSGANG",
        "title": "Emmausgang",
        "url": "https://www2.erzbistum-muenchen.de/news/STK-Rosenheim/Emmausgang-30834.news"
      }
    ]
  },
  {
    "id": "MARI-002",
    "title": {
      "en": "A little garden dedicated to Our Lady",
      "fr": "Un petit jardin dédié à Notre-Dame"
    },
    "description": {
      "en": "In a Marian garden, a family grows flowers or fragrant herbs chosen to recall the Blessed Virgin. The arrangement may be as modest as a few plants in pots, with a small Marian image or inscription. Some traditional plant names and legends offer subjects for reflection, not historical facts to be accepted without evidence.",
      "fr": "Dans un jardin marial, une famille cultive des fleurs ou des herbes parfumées qui rappellent la Sainte Vierge. Quelques pots et une petite image de Marie suffisent. Les noms et les légendes attachés aux plantes peuvent nourrir la méditation sans être présentés comme des faits historiques certains."
    },
    "history": {
      "en": "The University of Dayton's Marian Library dates a public Mary Garden at Woods Hole, Massachusetts, to 1932 and the Philadelphia Mary's Gardens initiative to 1951. That initiative distributed guidance and seeds for household gardens. Medieval names for Marian plants are older devotional material, not evidence that the modern garden arrangement itself is medieval.",
      "fr": "La bibliothèque mariale de l'université de Dayton situe un jardin marial public à Woods Hole (Massachusetts) en 1932 et la fondation de l'initiative Mary's Gardens à Philadelphie en 1951. Celle-ci diffusait des conseils et des graines pour des jardins familiaux. Les anciens noms marials de plantes relèvent d'une tradition symbolique plus ancienne, sans prouver que l'aménagement moderne du jardin date du Moyen Âge."
    },
    "meaning": {
      "en": "The beauty of creation leads the mind toward gratitude and the virtues of Our Lady.",
      "fr": "La beauté de la création invite à la reconnaissance et à la contemplation des vertus de Notre-Dame."
    },
    "practice": {
      "en": "Choose a few locally suitable plants, care for them and say a short Marian prayer when working in the garden.",
      "fr": "Choisir quelques plantes adaptées au climat, en prendre soin et réciter une courte prière mariale en les cultivant."
    },
    "caution": {
      "en": "Plant names and legends are devotional associations, not proof of medicinal virtues or of a medieval garden layout. A Mary Garden is optional and creates no new feast.",
      "fr": "Les noms et légendes des plantes sont des associations de piété, non des preuves de vertus médicinales ou d'un aménagement médiéval du jardin. Cet usage libre ne crée aucune nouvelle fête."
    },
    "scope": {
      "en": "Catholic household devotion; flowers' traditional Marian names vary by culture",
      "fr": "Dévotion domestique adaptable au climat ; les noms marials traditionnels des plantes varient selon les cultures."
    },
    "occasion": {
      "en": "Spring, May, or another suitable gardening season",
      "fr": "Au printemps, en mai ou pendant une saison de jardinage appropriée"
    },
    "history_sources": [
      {
        "id": "DAYTON-MARIAN-MARY-GARDENS-HISTORY",
        "title": "Background on Mary's Gardens",
        "url": "https://udayton.edu/marianlibrary/marysgardens/b/background-on-marys-gardens.php"
      }
    ],
    "sources": [
      {
        "id": "CATHCULTURE-MARY-GARDEN",
        "title": "The Annunciation and Lent: Celebrating New Life through a Mary Garden",
        "url": "https://www.catholicculture.org/commentary/annunciation-and-lent-celebrating-new-life-through-mary-garden/"
      }
    ]
  }
];
const ARTICLES = new Map([...PUBLISHED_ARTICLES,...CANONICAL_EXTRA_CUSTOM_ARTICLES].map(row=>[row.id,Object.freeze(row)]));
export const CALENDAR_CUSTOM_ARTICLE_IDS = Object.freeze([...ARTICLES.keys()]);
export function calendarCustomArticleIds({editorialPreview=false}={}){
  return editorialPreview ? Object.freeze([...CALENDAR_CUSTOM_ARTICLE_IDS,...customsEditorialPreviewIds()]) : CALENDAR_CUSTOM_ARTICLE_IDS;
}
export function calendarCustomArticle(id,{editorialPreview=false}={}){
  return ARTICLES.get(String(id))||(editorialPreview?customsEditorialPreviewArticle(id):null);
}
const validDate = date => /^\d{4}-\d{2}-\d{2}$/.test(String(date||"")) && !Number.isNaN(new Date(date+"T12:00:00").getTime());
function seasonalIds(date){
  if(!validDate(date))return [];
  const season=buildLiturgicalYear(date).currentPeriod.id;
  const mmdd=date.slice(5);
  const out=[];
  if(season==="advent"){
    out.push("ADVT-001","ADVT-002");
    if(mmdd>="12-16"&&mmdd<="12-24")out.push("ADVT-003");
  }
  // May is a customary Marian devotional month, not a liturgical season.
  if(mmdd>="05-01"&&mmdd<="05-31")out.push("DEV-001","MARI-002");
  // June/November are voluntary customary devotional months, not a new 1962 rite.
  if(mmdd>="06-01"&&mmdd<="06-30")out.push("DOM-006");
  if(mmdd>="11-01"&&mmdd<="11-30")out.push("DEAD-001");
  return out;
}
const FIXED_CUSTOMS=Object.freeze({
 "02-02":["DOM-011"],"02-03":["BLSS-001"],
 "03-19":["SJOS-001"],"06-13":["SANT-001"],"07-25":["SCHR-001"],
 "08-15":["MARI-001","BLSS-002"],"11-02":["DEAD-003"],
 "12-06":["SNIC-001"],"12-27":["BLSS-003"]
});
function additionalDateBoundIds(date){
 const x=v384Dates(Number(date.slice(0,4)));
 return [...(FIXED_CUSTOMS[date.slice(5)]||[]),
  ...(date===x.palm?["DOM-013"]:[]),
  ...(date===x.holySaturday?["BLSS-004"]:[])];
}
export function calendarCustomRecommendations(date,{events=[],fr=false,editorialPreview=false}={}){
  if(!validDate(date))return Object.freeze([]);
  const keys=Array.isArray(events)?events.map(event=>event?.key).filter(Boolean):[];
  const eventIds=keys.flatMap(key=>calendarCustomProfileActions(key,{fr}).map(row=>row[0].split(":").at(-1)));
  const ids=[...new Set([...eventIds,...additionalDateBoundIds(date),...seasonalIds(date),...(editorialPreview?customsEditorialPreviewForDate(date):[])])];
  return Object.freeze(ids.map(id=>calendarCustomArticle(id,{editorialPreview})).filter(Boolean));
}
export function calendarCustomSeasonalMonthEntries(monthId,{fr=false}={}){
  if(!/^\d{4}-\d{2}$/.test(String(monthId||"")))return Object.freeze([]);
  const [year,month]=monthId.split("-").map(Number);
  if(month<1||month>12||year<1900||year>2200)return Object.freeze([]);
  const results=new Map(),last=new Date(year,month,0).getDate();
  for(let day=1;day<=last;day++){
    const date=monthId+"-"+String(day).padStart(2,"0");
    for(const id of seasonalIds(date)){
      // Mid-month local observances remain on their date-specific day, not in
      // a month-long recommendation strip.
      if(id==="ADVT-003")continue;
      if(!results.has(id)&&ARTICLES.has(id)){
        const article=ARTICLES.get(id);
        results.set(id,Object.freeze({id,date,title:article.title[fr?"fr":"en"],occasion:article.occasion}));
      }
    }
  }
  return Object.freeze([...results.values()]);
}
