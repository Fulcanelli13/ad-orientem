/* Internal, unapproved editorial candidates for the existing Calendar.
 * All public/read-model callers default to the 35 PUBLISHED IDs.
 * Source of truth: data/customs/review/calendar-five-candidate-articles.v1.json
 * THIS IS NOT A NEW CUSTOMS REGISTRY OR CALENDAR.
 */
import {v384Dates} from "./traditional-year-v384.js";

export const CUSTOMS_EDITORIAL_PREVIEW_ARTICLES = Object.freeze([
  {
    "id": "RESEARCH-EPIPHANY-HOUSE-CUSTOMS",
    "title": {
      "en": "Epiphany: blessing the home and marking the doorway",
      "fr": "Épiphanie : bénir la maison et marquer la porte"
    },
    "description": {
      "en": "At Epiphany some Catholic families mark their doorway with the Cross, the new year and the letters C+M+B. A priest may also be invited to bless the house; that ministerial blessing is distinct from the family's devotional marking.",
      "fr": "À l'Épiphanie, certaines familles catholiques inscrivent sur leur porte la croix, la nouvelle année et les lettres C+M+B. Un prêtre peut aussi être invité à bénir la maison : cette bénédiction sacerdotale reste distincte du geste familial."
    },
    "history": {
      "en": "The older Roman Ritual, published in Philip Weller's 1952 translation, includes a particular blessing of a home at Epiphany with the Magnificat, holy water and incense. The Holy See's Directory on Popular Piety (2002, §118) separately records doorway inscriptions in blessed chalk, linking them to the Magi and charity. These sources describe related actions, not an obligation or a universal parish service.",
      "fr": "L'ancien Rituel romain, dans la traduction publiée par Philip Weller en 1952, comprend une bénédiction particulière des maisons à l'Épiphanie avec le Magnificat, l'eau bénite et l'encens. Le Directoire du Saint-Siège sur la piété populaire (2002, §118) mentionne aussi les inscriptions à la craie bénite, en lien avec les Mages et la charité. Il s'agit de gestes associés, non d'une obligation ni d'un service paroissial universel."
    },
    "meaning": {
      "en": "The doorway recalls that Christ is welcomed into the home. The initials can refer to Caspar, Melchior and Balthasar and are also read as Christus mansionem benedicat—may Christ bless this house.",
      "fr": "La porte rappelle l'accueil du Christ dans le foyer. Les lettres évoquent Gaspard, Melchior et Balthazar ; on les interprète également comme Christus mansionem benedicat : que le Christ bénisse cette maison."
    },
    "practice": {
      "en": "Where customary, the household may mark the door with a small cross, the year and C+M+B, and pray together at Epiphany. Chalk already blessed by a priest can be used. If a priestly blessing is desired, arrange it with a priest and follow the rite he is authorized to use.",
      "fr": "Là où existe cette coutume, la famille peut inscrire une petite croix, l'année et C+M+B au-dessus de la porte, puis prier ensemble à l'Épiphanie. Elle peut employer de la craie déjà bénite par un prêtre. Pour une bénédiction sacerdotale, prendre rendez-vous avec un prêtre et suivre le rite qu'il est habilité à célébrer."
    },
    "caution": {
      "en": "The family's chalk marking is not the priest's Roman Ritual blessing. Do not present priestly formulas as instructions for lay imitation, assume a parish offers this rite, or claim the inscription automatically protects the house.",
      "fr": "L'inscription familiale ne remplace pas la bénédiction sacerdotale du Rituel romain. Ne pas proposer les formules réservées au prêtre comme rite à imiter, présumer qu'une paroisse offre cette bénédiction ni attribuer à l'inscription une protection automatique."
    },
    "occasion": {
      "en": "Epiphany, 6 January in the 1962 Calendar",
      "fr": "Épiphanie, le 6 janvier dans le calendrier de 1962"
    },
    "scope": {
      "en": "Optional Catholic household custom; regionally variable, with a distinct historical priestly rite",
      "fr": "Coutume domestique catholique facultative, variable selon les régions, distincte de l'ancien rite sacerdotal"
    },
    "sources": [
      {
        "id": "HOLYSEE-DIRECTORY-2002-118",
        "title": "Directory on Popular Piety and the Liturgy, §118",
        "url": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html",
        "role": "OFFICIAL_PASTORAL_DIRECTORY",
        "claim_scope": "Door chalk, Magi, charity, C+M+B and household context; document dated 2002, not a 1962 rubric"
      },
      {
        "id": "WELLER-RITUAL-1952-EPIPHANY",
        "title": "Roman Ritual: Blessing of Homes on Epiphany (Weller, 1952)",
        "url": "https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=1336",
        "role": "HISTORICAL_RITE_TEXT",
        "claim_scope": "Specific priestly formulary with Magnificat, aspersion and incense; final 1962 rubrical applicability still to be checked"
      },
      {
        "id": "WEISER-1958-EPIPHANY-149",
        "title": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958), p.149",
        "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
        "role": "HISTORICAL_1958_ORIGINAL_FOLIO",
        "claim_scope": "Epiphany house blessing account, first 1958 author witness"
      }
    ],
    "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED",
    "editorialPreview": true,
    "releaseUnit": "CU-REVIEW-001"
  },
  {
    "id": "RESEARCH-EASTER-LIGHT-HOME",
    "title": {
      "en": "Bringing the Easter light home",
      "fr": "Rapporter la lumière de Pâques à la maison"
    },
    "description": {
      "en": "In several European Catholic communities, families bring home light from the Easter Vigil, traditionally in a sheltered lantern or on a suitable candle. At home, the light may be placed near the crucifix as a reminder of the Resurrection.",
      "fr": "Dans plusieurs régions catholiques d'Europe, les familles rapportent la lumière de la Vigile pascale, autrefois dans une lanterne protégée ou sur un cierge adapté. À la maison, cette lumière peut être placée près du crucifix en souvenir de la Résurrection."
    },
    "history": {
      "en": "Francis X. Weiser's 1958 collection describes the older custom of carrying flames from the blessed Easter fire to the household. The Archdiocese of Vienna also describes taking the light of the paschal candle home after the Easter Vigil as customary in many Austrian regions. The older fire-carrying and contemporary candle-light practices are related but need not be identical in every locality.",
      "fr": "Francis X. Weiser décrit en 1958 l'ancien usage de rapporter au foyer une flamme du feu pascal béni. L'archidiocèse de Vienne présente également comme coutume de nombreuses régions autrichiennes le fait de rapporter la lumière du cierge pascal après la Vigile. Le transport ancien du feu et l'usage actuel du cierge se rattachent à un même thème, sans être partout identiques."
    },
    "meaning": {
      "en": "The light evokes the risen Christ, who dispels the darkness of sin and death, and connects prayer at home with the celebration of Easter.",
      "fr": "La lumière évoque le Christ ressuscité, qui dissipe les ténèbres du péché et de la mort, et relie la prière familiale à la célébration de Pâques."
    },
    "practice": {
      "en": "Where the parish permits it, use a suitable enclosed lantern or candle to carry light home after the Vigil, then pray briefly before extinguishing it safely. Where this is not practiced, simply light a household candle later during Easter prayer; it need not come from the Vigil.",
      "fr": "Là où la paroisse le permet, rapporter la lumière après la Vigile dans une lanterne adaptée ou avec un cierge sûr, puis prier brièvement avant de l'éteindre. Là où cet usage n'existe pas, on peut simplement allumer un cierge de la maison lors de la prière pascale : il n'a pas besoin de provenir de la Vigile."
    },
    "caution": {
      "en": "This optional household custom is not a ceremony added to the 1962 Easter Vigil and does not authorize taking fire without permission. Observe local fire rules; never leave a flame unattended. Do not confuse it with the distinct blessing of Easter foods.",
      "fr": "Cette coutume familiale facultative n'ajoute aucun rite à la Vigile pascale de 1962 et n'autorise pas à emporter du feu sans permission. Respecter les règles de sécurité et ne jamais laisser une flamme sans surveillance. Ne pas confondre cette coutume avec la bénédiction distincte des aliments de Pâques."
    },
    "occasion": {
      "en": "After the Easter Vigil, where locally practiced",
      "fr": "Après la Vigile pascale, là où la coutume existe"
    },
    "scope": {
      "en": "Historically Central European; contemporary pastoral witness from Austria",
      "fr": "Usage historique d'Europe centrale ; témoignage pastoral actuel en Autriche"
    },
    "sources": [
      {
        "id": "WEISER-1958-EASTER-FIRE-217",
        "title": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958), p.217",
        "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
        "role": "HISTORICAL_1958_ORIGINAL_FOLIO",
        "claim_scope": "Older lantern-and-fire custom, not a universal rite"
      },
      {
        "id": "VIENNA-EASTER-LIGHT",
        "title": "Archdiocese of Vienna: Osterlicht for home",
        "url": "https://www.erzdioezese-wien.at/pages/inst/21452566/service/kirchenjahr/osterfestkreis/osterlicht",
        "role": "MODERN_DIOCESAN_PASTORAL",
        "claim_scope": "Many Austrian regions take light home from the Easter Vigil"
      }
    ],
    "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED",
    "editorialPreview": true,
    "releaseUnit": "CU-REVIEW-002"
  },
  {
    "id": "RESEARCH-SEVILLE-SEISES",
    "title": {
      "en": "The Seises of Seville Cathedral",
      "fr": "Les Seises de la cathédrale de Séville"
    },
    "description": {
      "en": "At Seville Cathedral, a group of choirboys known as the Seises perform a restrained ceremonial dance in traditional dress. It is associated especially with Corpus Christi and the Immaculate Conception, and also with particular cathedral celebrations.",
      "fr": "À la cathédrale de Séville, de jeunes choristes appelés Seises exécutent une danse cérémonielle solennelle en costume traditionnel. Elle est notamment associée à la Fête-Dieu et à l'Immaculée Conception, ainsi qu'à certaines célébrations propres à la cathédrale."
    },
    "history": {
      "en": "The cathedral describes the Seises as a long-lived local tradition. Its announcements distinguish the vestments worn for the Immaculate Conception and note dances for Corpus Christi and other specified observances. The same institution and practice appear under different feast headings in our historical research; those references should form one custom identity with several Calendar associations.",
      "fr": "La cathédrale décrit les Seises comme une ancienne tradition vivante. Ses annonces distinguent les costumes portés pour l'Immaculée Conception et mentionnent les danses de la Fête-Dieu ainsi que d'autres célébrations déterminées. Les mentions de cette même institution à diverses fêtes doivent former une seule identité de coutume avec plusieurs liens au calendrier."
    },
    "meaning": {
      "en": "The choreographed dance is an act of local solemn devotion, offered before the Blessed Sacrament and, on Marian occasions, in honour of Our Lady.",
      "fr": "Cette danse réglée exprime une dévotion solennelle locale devant le Saint-Sacrement et, lors des fêtes mariales, en l'honneur de Notre-Dame."
    },
    "practice": {
      "en": "This is a custom to discover rather than reproduce. A visitor may consult the cathedral's official current announcements to learn whether a Seises service is scheduled; the historical Calendar association alone is not an event reservation or guarantee.",
      "fr": "Il s'agit d'une coutume à découvrir, non à reproduire. Le visiteur peut consulter les annonces actuelles de la cathédrale pour savoir si une célébration des Seises est prévue ; le lien au calendrier n'est ni une réservation ni une garantie de cérémonie."
    },
    "caution": {
      "en": "The Seises are specific to Seville Cathedral. Do not present them as a required element of Mass, suggest the dance is celebrated at other parishes, or automatically infer present-day performance times from liturgical dates.",
      "fr": "Les Seises sont propres à la cathédrale de Séville. Ne pas en faire un élément obligatoire de la messe, supposer cette danse dans d'autres paroisses ni déduire automatiquement des horaires actuels à partir du calendrier liturgique."
    },
    "occasion": {
      "en": "Corpus Christi and the Immaculate Conception, according to Seville Cathedral's own local calendar",
      "fr": "Fête-Dieu et Immaculée Conception, selon les usages propres à la cathédrale de Séville"
    },
    "scope": {
      "en": "Seville Cathedral, Andalusia, Spain; strictly local and institutional",
      "fr": "Cathédrale de Séville, Andalousie, Espagne ; coutume strictement locale et institutionnelle"
    },
    "sources": [
      {
        "id": "SEVILLE-SEISES-OFFICIAL",
        "title": "Seville Cathedral: La danza de los Seises",
        "url": "https://www.catedraldesevilla.es/la-danza-de-los-seises-un-tesoro-vivo-en-la-catedral-de-sevilla/",
        "role": "OFFICIAL_CURRENT_CATHEDRAL",
        "claim_scope": "Named single dance at Corpus and Immaculate; meaning, costume and institutional scope"
      },
      {
        "id": "SEVILLE-IMMACULATE-SEISES-2024",
        "title": "Seville Cathedral: Octava de la Inmaculada (2024)",
        "url": "https://www.catedraldesevilla.es/octava-de-la-inmaculada-en-la-catedral/",
        "role": "OFFICIAL_EVENT_RECORD",
        "claim_scope": "Documents Immaculate event and Seises; evidence of occurrence not perpetual timetable"
      },
      {
        "id": "SEVILLE-CARNIVAL-SEISES-2026",
        "title": "Seville Cathedral: Triduo de Carnaval (2026)",
        "url": "https://www.catedraldesevilla.es/comienza-el-triduo-de-carnaval-como-preparacion-para-la-cuaresma/",
        "role": "OFFICIAL_EVENT_RECORD",
        "claim_scope": "Additional cathedral-specific Carnival observance; not automatic 1962 Calendar event"
      },
      {
        "id": "WEISER-1958-SEISES-265",
        "title": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958), p.265",
        "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
        "role": "HISTORICAL_1958_ORIGINAL_FOLIO",
        "claim_scope": "Historic Corpus Christi Seises description"
      }
    ],
    "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED",
    "editorialPreview": true,
    "releaseUnit": "CU-REVIEW-003"
  },
  {
    "id": "RESEARCH-CANDLEMAS-CRIB-REMOVAL",
    "title": {
      "en": "Keeping the Christmas crib until Candlemas",
      "fr": "Garder la crèche jusqu'à la Chandeleur"
    },
    "description": {
      "en": "In some Catholic households, the Nativity crib remains in place until 2 February, the Presentation of the Lord, often called Candlemas. The family then puts it away, marking the close of a cherished cycle of Christmas devotion.",
      "fr": "Dans certains foyers catholiques, la crèche reste installée jusqu'au 2 février, fête de la Présentation du Seigneur, dite Chandeleur. La famille la range alors, marquant la fin d'une période de dévotion autour de Noël."
    },
    "history": {
      "en": "Weiser records Candlemas as a traditional occasion for taking down Christmas decorations. A liturgical explanation by Fr Edward McNamara (2015) confirms that customs differ: some families remove the crib after Epiphany or the Baptism of the Lord, while others retain it until 2 February. No universal liturgical norm prescribes a single household removal date.",
      "fr": "Weiser signale la Chandeleur comme date traditionnelle pour retirer les décorations de Noël. Une explication liturgique du P. Edward McNamara (2015) rappelle la diversité des usages : certaines familles rangent la crèche après l'Épiphanie ou le Baptême du Seigneur, d'autres attendent le 2 février. Aucune norme liturgique universelle n'impose une seule date à tous les foyers."
    },
    "meaning": {
      "en": "The custom prolongs contemplation of the Incarnation until the feast when Mary and Joseph present Jesus in the Temple, and Simeon welcomes him as light for the nations.",
      "fr": "Cet usage prolonge la contemplation de l'Incarnation jusqu'à la fête où Marie et Joseph présentent Jésus au Temple, et où Syméon le reconnaît comme lumière des nations."
    },
    "practice": {
      "en": "If the family follows this custom, pray briefly before putting the crib away on Candlemas. Another customary removal date is equally legitimate; no household is required to keep decorations until February.",
      "fr": "Si la famille suit cette coutume, elle peut prier brièvement avant de ranger la crèche à la Chandeleur. Une autre date conforme aux usages locaux est tout aussi légitime ; aucune famille n'est tenue de garder les décorations jusqu'en février."
    },
    "caution": {
      "en": "Candlemas does not become the formal end of the 1962 Christmas liturgical season because the household crib stays up. This voluntary practice is neither a Mass rubric nor a rule about parish decoration.",
      "fr": "Le maintien de la crèche jusqu'à la Chandeleur ne fait pas du 2 février la fin officielle du temps liturgique de Noël dans le calendrier de 1962. Il s'agit d'une coutume libre, non d'une rubrique de la messe ni d'une règle pour les décorations paroissiales."
    },
    "occasion": {
      "en": "Candlemas, 2 February; optional household tradition",
      "fr": "Chandeleur, le 2 février ; coutume familiale facultative"
    },
    "scope": {
      "en": "Attested in some European and Catholic household traditions; not universal",
      "fr": "Attestée dans certains usages familiaux catholiques, notamment européens ; non universelle"
    },
    "sources": [
      {
        "id": "WEISER-1958-CANDLEMAS-300",
        "title": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958), p.300",
        "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
        "role": "HISTORICAL_1958_ORIGINAL_FOLIO",
        "claim_scope": "Crib removal on Candlemas in historical custom"
      },
      {
        "id": "EWTN-MCNAMARA-CRIB-2015",
        "title": "Fr Edward McNamara, When to Remove the Christmas Crib (2015)",
        "url": "https://www.ewtn.com/catholicism/library/when-to-remove-the-christmas-crib-4793",
        "role": "CATHOLIC_LITURGICAL_EXPLANATION",
        "claim_scope": "Customs vary, no absolute rule; Candlemas is a documented optional date"
      }
    ],
    "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED",
    "editorialPreview": true,
    "releaseUnit": "CU-REVIEW-004"
  },
  {
    "id": "RESEARCH-POLISH-CORPUS-WREATHS",
    "title": {
      "en": "Polish herb wreaths for Corpus Christi",
      "fr": "Les couronnes d'herbes de la Fête-Dieu en Pologne"
    },
    "description": {
      "en": "In Poland, families in some regions weave small wreaths of herbs and flowers in connection with Corpus Christi and the following customary celebrations. The wreaths may be blessed in church and subsequently hung in the home.",
      "fr": "En Pologne, des familles composent dans certaines régions de petites couronnes d'herbes et de fleurs à l'occasion de la Fête-Dieu et des célébrations coutumières qui suivent. Les couronnes peuvent être bénites à l'église, puis suspendues à la maison."
    },
    "history": {
      "en": "Polish cultural documentation describes wreaths prepared during the traditional week of Corpus Christi, once kept in church and later taken home. An ethnobotanical field study near Krosno, published in 2012, documents contemporary plant choices and older uses. The custom survives in parts of Poland even though the universal liturgical octave of Corpus Christi had been suppressed before the 1962 Calendar; local devotional celebrations are a separate matter.",
      "fr": "Les institutions culturelles polonaises décrivent les couronnes préparées pendant la semaine coutumière de la Fête-Dieu, autrefois conservées à l'église puis rapportées au foyer. Une enquête ethnobotanique près de Krosno, publiée en 2012, documente les plantes utilisées aujourd'hui et leurs usages anciens. La coutume subsiste dans certaines régions bien que l'octave liturgique universelle de la Fête-Dieu ait été supprimée avant le calendrier de 1962 ; les dévotions locales relèvent d'un autre registre."
    },
    "meaning": {
      "en": "The wreaths express gratitude for creation and the harvest, while the feast directs devotion toward Christ present in the Blessed Sacrament.",
      "fr": "Les couronnes expriment la reconnaissance pour la création et les récoltes, tandis que la fête oriente la dévotion vers le Christ présent dans le Saint-Sacrement."
    },
    "practice": {
      "en": "Where practiced, families may prepare a small herbal wreath and bring it for a blessing that the parish has actually arranged; afterwards it can be hung respectfully at home. Where there is no such local custom, simply learn about it or pray in thanksgiving for the gifts of creation.",
      "fr": "Là où la coutume existe, la famille peut préparer une petite couronne d'herbes et l'apporter à une bénédiction réellement organisée par la paroisse ; elle peut ensuite la suspendre dignement chez elle. Ailleurs, on peut simplement découvrir cet usage ou rendre grâce pour les dons de la création."
    },
    "caution": {
      "en": "Blessing is not automatically available, nor is a post-Corpus octave universally prescribed in the 1962 rite. Older folk stories attribute powers against storms, illness or witches to these wreaths; those reported beliefs are not Church promises or a reason to neglect ordinary safety or medicine. Do not merge this custom with Assumption herb blessings or Corpus Christi flower carpets.",
      "fr": "La bénédiction n'est pas proposée partout, et le rite de 1962 ne prescrit pas une octave universelle après la Fête-Dieu. D'anciens récits folkloriques attribuent aux couronnes des pouvoirs contre l'orage, la maladie ou les sorcières : ce ne sont pas des promesses de l'Église et ils ne remplacent ni la prudence ni les soins. Ne pas confondre cette coutume avec les bouquets de l'Assomption ou les tapis de fleurs de la Fête-Dieu."
    },
    "occasion": {
      "en": "Corpus Christi and locally observed following days in Poland",
      "fr": "Fête-Dieu et jours de célébration locale qui suivent, en Pologne"
    },
    "scope": {
      "en": "Poland, historically broad but regionally variable; no current local-service guarantee",
      "fr": "Pologne, usage historiquement répandu mais variable selon les régions ; aucune cérémonie locale n'est présumée"
    },
    "sources": [
      {
        "id": "POLISH-GOV-CORPUS-CUSTOMS",
        "title": "Polish Ministry of Culture: Uroczystość Bożego Ciała — tradycje i obyczaje",
        "url": "https://www.gov.pl/web/kultura/uroczystosc-bozego-ciala--tradycje-i-obyczaje",
        "role": "OFFICIAL_CULTURAL_DOCUMENTATION",
        "claim_scope": "Herbal wreaths, following week, local blessing and household suspension; magical beliefs are recorded as folklore"
      },
      {
        "id": "LUCZAJ-POLISH-CORPUS-WREATHS-2012",
        "title": "Łuczaj, A relic of medieval folklore: Corpus Christi Octave herbal wreaths in Poland (2012)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22575705/",
        "role": "PEER_REVIEWED_FIELD_STUDY",
        "claim_scope": "SE Poland plants and custom; historical octave distinction and ethnobotanical context"
      },
      {
        "id": "POLISH-MUSEUM-CORPUS-WREATHS",
        "title": "Agriculture Museum (Poland): Żywa tradycja",
        "url": "https://muzeumrolnictwa.pl/artykul/aktualnosci/niecodziennik-muzealny-zywa-tradycja",
        "role": "MUSEUM_LOCAL_CONTINUITY",
        "claim_scope": "Wreath blessing locally observed although liturgical octave no longer universal"
      }
    ],
    "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED",
    "editorialPreview": true,
    "releaseUnit": "CU-REVIEW-005"
  }
].map(x=>Object.freeze(x)));
export const CUSTOMS_EDITORIAL_PREVIEW_DATE_HOOKS = Object.freeze([
  {
    "id": "RESEARCH-EPIPHANY-HOUSE-CUSTOMS",
    "kind": "FIXED_FEAST_CONTEXT",
    "month_day": "01-06",
    "movable_accessor": null,
    "scope": "WORLD_CONTEXT_ONLY_WITH_LOCAL_AVAILABILITY_CAVEAT"
  },
  {
    "id": "RESEARCH-EASTER-LIGHT-HOME",
    "kind": "MOVABLE_FEAST_CONTEXT",
    "month_day": null,
    "movable_accessor": "holySaturday",
    "scope": "AUSTRIA_AND_RELATED_HISTORICAL_CONTEXT"
  },
  {
    "id": "RESEARCH-SEVILLE-SEISES",
    "kind": "MOVABLE_FEAST_CONTEXT",
    "month_day": null,
    "movable_accessor": "corpus",
    "scope": "SEVILLE_CATHEDRAL_ONLY"
  },
  {
    "id": "RESEARCH-SEVILLE-SEISES",
    "kind": "FIXED_FEAST_CONTEXT",
    "month_day": "12-08",
    "movable_accessor": null,
    "scope": "SEVILLE_CATHEDRAL_ONLY"
  },
  {
    "id": "RESEARCH-CANDLEMAS-CRIB-REMOVAL",
    "kind": "FIXED_FEAST_CONTEXT",
    "month_day": "02-02",
    "movable_accessor": null,
    "scope": "HOUSEHOLD_CONTEXT_ALL_USERS_HISTORICALLY_SCOPED"
  },
  {
    "id": "RESEARCH-POLISH-CORPUS-WREATHS",
    "kind": "MOVABLE_FEAST_CONTEXT",
    "month_day": null,
    "movable_accessor": "corpus",
    "scope": "POLAND_HISTORIC_AND_CONTEMPORARY_CONTEXT"
  }
].map(x=>Object.freeze(x)));
const PREVIEW_BY_ID=new Map(CUSTOMS_EDITORIAL_PREVIEW_ARTICLES.map(a=>[a.id,a]));
export function customsEditorialPreviewArticle(id){return PREVIEW_BY_ID.get(String(id))??null;}
export function customsEditorialPreviewIds(){return Object.freeze([...PREVIEW_BY_ID.keys()]);}
export function customsEditorialPreviewForDate(date){
 const value=String(date||"");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return Object.freeze([]);
 const year=Number(value.slice(0,4));
 const fixed=value.slice(5),movable=v384Dates(year);
 const found=new Set();
 for(const h of CUSTOMS_EDITORIAL_PREVIEW_DATE_HOOKS){
   if(h.kind==="FIXED_FEAST_CONTEXT"&&h.month_day===fixed)found.add(h.id);
   if(h.kind==="MOVABLE_FEAST_CONTEXT"&&h.movable_accessor&&movable[h.movable_accessor]===value)found.add(h.id);
 }
 return Object.freeze([...found]);
}
