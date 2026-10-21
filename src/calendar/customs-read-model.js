/* Published Customs read model for the existing Calendar.
 * Source: canonical published IDs in customs-atlas-seed.v1.json and bilingual
 * accepted p0/p1 guidance in main. Research-master candidates are excluded.
 * This is a presentation projection, not a new canonical Calendar or Atlas.
 */
import { buildLiturgicalYear } from "./liturgical-year.js";
import { calendarCustomProfileActions } from "./customs-profile-links.js";

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
      "en": "A ring of evergreen branches with four candles can accompany a family's Advent prayers. One more candle is lighted each Sunday, marking the approach of Christmas and the expectation of Christ's coming.",
      "fr": "Une couronne de feuillage portant quatre bougies peut accompagner la prière familiale durant l'Avent. Chaque dimanche, une bougie supplémentaire est allumée pour marquer l'approche de Noël et l'attente du Christ."
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
      "en": "Household devotion only, not an ancient universal Roman rubric. Church and home blessing texts differ across rites and periods; do not insert modern blessing text or priestly gestures into the 1962 Mass.",
      "fr": "Cette dévotion familiale demeure facultative et ne fait pas partie des rubriques de la messe de 1962. Les bénédictions liturgiques doivent rester distinctes de la prière à la maison."
    },
    "scope": {
      "en": "Catholic household use; adopted devotional form rather than an original ancient Roman rite",
      "fr": "Dévotion domestique catholique, sans statut de rite romain universel ancien."
    },
    "occasion": {
      "en": "The four Sundays of Advent",
      "fr": "Les quatre dimanches de l’Avent"
    },
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
      "en": "Children in some Catholic families place a little straw in an empty manger after doing a good deed or saying a prayer. The custom makes their preparation for the coming of the Christ Child visible, without measuring grace or turning charity into a competition.",
      "fr": "Dans certaines familles catholiques, les enfants déposent un peu de paille dans une mangeoire après une bonne action ou une prière. La coutume rend visible leur préparation à la venue de l'Enfant Jésus, sans mesurer la grâce ni transformer la charité en compétition."
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
      "en": "The French origin is a reported attribution, not certification of universal French practice. No in-app good-deed scoring, merit counting, sacramental or required custom.",
      "fr": "L'origine française de cette coutume est une attribution traditionnelle, non une preuve d'usage universel. La charité n'est pas mesurée par un compteur de bonnes actions et ne donne lieu à aucune obligation."
    },
    "scope": {
      "en": "Catholic household Advent custom; French origin is a traditional attribution, not universal local practice",
      "fr": "Dévotion familiale facultative liée à la préparation de Noël."
    },
    "occasion": {
      "en": "Advent; especially family preparations before Christmas",
      "fr": "Pendant l’Avent, surtout dans les préparatifs de Noël"
    },
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
      "en": "In Las Posadas, neighbours or parish groups remember Mary and Joseph seeking lodging before the Nativity. The community moves between homes or stations, singing, until a household symbolically offers welcome.",
      "fr": "Pendant les posadas, des familles ou des groupes paroissiaux rappellent la recherche d'un abri par Marie et Joseph avant Noël. Le groupe passe de maison en maison, souvent en chantant, jusqu'à l'accueil symbolique dans un foyer."
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
      "en": "Regional and optional, not a ninth-day 1962 Mass formulary, compulsory celebration, default parish procession, confirmed public route or permission for a priestly ritual.",
      "fr": "Coutume régionale facultative : aucune procession, visite de foyer ou célébration paroissiale ne peut être présumée disponible. Elle ne modifie pas la messe de 1962."
    },
    "scope": {
      "en": "Mexico and other Latin American Catholic communities; some US parishes",
      "fr": "Tradition catholique régionale, particulièrement au Mexique et dans certaines communautés hispaniques."
    },
    "occasion": {
      "en": "Advent, traditionally beginning 16 December",
      "fr": "Avent, traditionnellement à partir du 16 décembre"
    },
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
      "fr": "Avant le repas de la veille de Noël, les membres de la famille partagent une fine hostie de pain non consacré appelée opłatek, en échangeant des vœux et des paroles de réconciliation. Ce pain de fête n'est pas la sainte communion."
    },
    "history": {
      "en": "Before Christmas Eve dinner, family members share a thin unleavened opłatek wafer while offering one another good wishes and reconciliation. It is ordinary blessed-or-unblessed festive bread, not Holy Communion.",
      "fr": "Avant le repas de la veille de Noël, les membres de la famille partagent une fine hostie de pain non consacré appelée opłatek, en échangeant des vœux et des paroles de réconciliation. Ce pain de fête n'est pas la sainte communion."
    },
    "meaning": {
      "en": "A tangible act of family peace and mutual charity as the household prepares to celebrate the Nativity.",
      "fr": "Un geste concret de paix familiale et de charité mutuelle avant la célébration de la Nativité."
    },
    "practice": {
      "en": "If this is part of your family tradition, share opłatek with a simple blessing of thanks and personal good wishes; where a priest offers a blessing of the wafers, keep that ministerial act distinct.",
      "fr": "Si cette tradition appartient à votre famille, partager l'opłatek dans la reconnaissance et adresser des vœux personnels ; si un prêtre bénit le pain, distinguer cet acte sacerdotal du partage familial."
    },
    "caution": {
      "en": "Opłatek is not the Eucharist or consecrated host; no pretend Communion, required priestly home blessing, universal Christmas obligation or fabricated fixed 1962 liturgical formula.",
      "fr": "L'opłatek est un pain non consacré, et non l'Eucharistie. Le partage domestique ne remplace ni la communion ni une bénédiction sacerdotale éventuelle."
    },
    "scope": {
      "en": "Poland and Polish-heritage Catholic households abroad",
      "fr": "Coutume des familles catholiques polonaises."
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
      "en": "After the Mass of the Lord's Supper, some faithful visit several churches to pray before the Blessed Sacrament at an altar of repose. Seven is a common traditional number but is not mandatory.",
      "fr": "Après la messe de la Cène du Seigneur, certains fidèles visitent plusieurs églises pour prier devant le Saint-Sacrement au reposoir. Le nombre de sept est traditionnel dans certains lieux, sans constituer une obligation."
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
      "en": "Visits only to actually accessible churches; no inferred schedule, map route, obligatory seven stops, priestly ceremony or new event in the Mass reader.",
      "fr": "La visite de sept églises est facultative ; le nombre de sept n'est pas une obligation. Aucun horaire, parcours ni accès aux reposoirs ne doit être inventé."
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
      "en": "A Catholic family guide describes going on a simple prayer walk during the Rogations, asking God's blessing on gardens, crops and the labour of those who provide food. This private act is distinct from the priest-led litanies or blessings.",
      "fr": "Un ancien guide familial catholique propose une promenade de prière aux Rogations pour confier à Dieu les jardins, les récoltes et le travail de ceux qui produisent la nourriture. Ce geste privé est distinct des litanies et des bénédictions sacerdotales."
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
      "en": "Domestic walk is voluntary and never an automatic liturgical procession; omit historical family's improvised blessings or ceremonial imitation. No rite, invented route, farm proximity requirement or 1962 rubric change.",
      "fr": "Cette marche familiale privée ne constitue pas une procession liturgique ni une bénédiction des champs par un prêtre. Ne pas reproduire de formules réservées au ministre."
    },
    "scope": {
      "en": "Historical Catholic household suggestion; farm, garden or city context",
      "fr": "Adaptation familiale facultative de la tradition des Rogations."
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
      "en": "Children dressed as the Magi visit homes around Epiphany, bringing a Christian blessing, singing and gathering support for children in need. In Germany the practice is organised through Catholic parishes and the Sternsinger campaign.",
      "fr": "Autour de l'Épiphanie, des enfants costumés en mages rendent visite aux familles, chantent et portent un message de bénédiction tout en recueillant une aide pour les enfants dans le besoin. En Allemagne, l'action est organisée par les paroisses catholiques."
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
      "en": "This is a German organised Catholic charitable custom, not universal priestly house blessing. Never infer local schedules, rites, donations or 1962 ceremony.",
      "fr": "Cette coutume caritative allemande dépend d'une organisation paroissiale. Aucune visite ni bénédiction sacerdotale n'est garantie ou automatiquement programmée."
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
      "en": "French families may share a King Cake or galette with a hidden bean and a symbolic paper crown. Some historical forms set aside an extra portion for a poor neighbour or unexpected guest.",
      "fr": "À l'Épiphanie, on partage en France une galette ou un gâteau des Rois contenant une fève, souvent accompagnée d'une couronne. Certaines formes de la coutume prévoient une part supplémentaire pour une personne pauvre ou un invité inattendu."
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
      "en": "Optional French household culture; the separate Weiser school-fees claim is not independently corroborated and is excluded.",
      "fr": "Coutume familiale française facultative, et non une rubrique de la Messe. Les récits historiques non corroborés ne sont pas repris."
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
      "en": "In some Catholic communities, families lay floral carpets along Corpus Christi procession routes; in others, flowers decorate nearby streets and windows. A specific Polish tradition is recognised as cultural heritage.",
      "fr": "Dans certaines communautés catholiques, les familles réalisent des tapis de fleurs sur le parcours de la procession de la Fête-Dieu ; ailleurs, les rues et les fenêtres sont fleuries. Une tradition polonaise est reconnue comme patrimoine culturel."
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
      "en": "One canonical ID for two distinct regional floral forms. Neither a procession route nor a priestly blessing is automatically created. Weiser's precise candles-and-images claim is unverified.",
      "fr": "Les tapis et fleurs aux fenêtres sont des formes locales distinctes. Ni parcours, ni procession, ni bénédiction sacerdotale ne sont présumés."
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
      "en": "In parts of southern Germany and Austria, a traditional Easter Monday walk commemorates the disciples' encounter with the risen Christ on the road to Emmaus. Some families or parishes walk toward a church or shrine, with moments of prayer and Scripture.",
      "fr": "Dans certaines régions du sud de l'Allemagne et d'Autriche, une promenade du lundi de Pâques rappelle la rencontre des disciples avec le Christ ressuscité sur le chemin d'Emmaüs. Des familles ou paroisses marchent parfois vers une église ou un sanctuaire en priant."
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
      "en": "No invented itinerary, time, local event or Eucharistic procession. Optional regional custom, separate from the 1962 Mass.",
      "fr": "Marche familiale régionale facultative ; ne présumer aucun itinéraire, horaire, événement paroissial ni rite liturgique."
    },
    "scope": {
      "en": "Regional Roman Catholic walks especially in Bavaria and Austria, optional",
      "fr": "Bavière et Autriche : coutume chrétienne régionale."
    },
    "occasion": {
      "en": "Easter Monday, especially in southern Germany and Austria",
      "fr": "Lundi de Pâques, notamment en Bavière et en Autriche"
    },
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
      "en": "In a Marian garden, a family grows flowers or fragrant herbs chosen to recall the Blessed Virgin. The arrangement may be as modest as a few plants in pots, with a small Marian image or inscription. Some traditional plant names and legends offer subjects for reflection, not historical facts to be accepted without evidence.",
      "fr": "Dans un jardin marial, une famille cultive des fleurs ou des herbes parfumées qui rappellent la Sainte Vierge. Quelques pots et une petite image de Marie suffisent. Les noms et les légendes attachés aux plantes peuvent nourrir la méditation sans être présentés comme des faits historiques certains."
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
      "en": "Voluntary household devotion connected to existing May custom DEV-001, not a new feast. No magical, medicinal or historically unsupported plant properties.",
      "fr": "Dévotion familiale facultative ; les légendes relatives aux plantes ne sont ni des faits historiques prouvés ni des promesses médicinales."
    },
    "scope": {
      "en": "Catholic household devotion; flowers' traditional Marian names vary by culture",
      "fr": "Dévotion domestique adaptable au climat et à la saison."
    },
    "occasion": {
      "en": "Spring, May, or another suitable gardening season",
      "fr": "Au printemps, en mai ou pendant une saison de jardinage appropriée"
    },
    "sources": [
      {
        "id": "CATHCULTURE-MARY-GARDEN",
        "title": "The Annunciation and Lent: Celebrating New Life through a Mary Garden",
        "url": "https://www.catholicculture.org/commentary/annunciation-and-lent-celebrating-new-life-through-mary-garden/"
      }
    ]
  }
];
const ARTICLES = new Map(PUBLISHED_ARTICLES.map(row=>[row.id,Object.freeze(row)]));
export const CALENDAR_CUSTOM_ARTICLE_IDS = Object.freeze([...ARTICLES.keys()]);
export function calendarCustomArticle(id){return ARTICLES.get(String(id))||null;}
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
  if(mmdd>="05-01"&&mmdd<="05-31")out.push("MARI-002");
  return out;
}
export function calendarCustomRecommendations(date,{events=[],fr=false}={}){
  if(!validDate(date))return Object.freeze([]);
  const keys=Array.isArray(events)?events.map(event=>event?.key).filter(Boolean):[];
  const eventIds=keys.flatMap(key=>calendarCustomProfileActions(key,{fr}).map(row=>row[0].split(":").at(-1)));
  const ids=[...new Set([...eventIds,...seasonalIds(date)])];
  return Object.freeze(ids.filter(id=>ARTICLES.has(id)).map(id=>ARTICLES.get(id)));
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
