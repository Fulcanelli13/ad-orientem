/* Preview-only three-subject projection from research PR #1610.
 * Research master at bcd82d9b42e16ad2c235ca1958de457e605a8813,
 * data/customs/master/customs-calendar-five-final-copy-release-candidates.v1.json.
 * NOT imported by the production Calendar. Never treat RESEARCH- IDs as
 * canonical identity assignments or an editorial acceptance.
 * Optional local observances are not 1962 Roman rites or current services.
 */
import {v384Dates} from "./traditional-year-v384.js";
export const COHORT2_RESEARCH_SHA="bcd82d9b42e16ad2c235ca1958de457e605a8813";
export const COHORT2_REVIEW_ROWS=Object.freeze([
  {
    "releaseUnit": "CU-REVIEW-002",
    "researchId": "RESEARCH-EASTER-LIGHT-HOME",
    "sourceGroupIds": [
      "CAT-WEISER-B-025"
    ],
    "releaseStatus": "RESEARCH_ONLY_NOT_PUBLISHED",
    "reviewScope": "AT_LOCAL_CUSTOMS",
    "article": {
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
      "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED"
    },
    "calendarAssociations": [
      {
        "resolver": "EXISTING_1962_CALENDAR",
        "kind": "MOVABLE_FEAST_CONTEXT",
        "calendar_accessor": "v384Dates(year).holySaturday",
        "feast_label": "Easter Vigil",
        "region_visibility": "AUSTRIA_AND_RELATED_HISTORICAL_CONTEXT"
      }
    ],
    "relatedFollowingDays": null,
    "approvals": {
      "canonical_identity": false,
      "editorial_en": false,
      "editorial_fr": false,
      "claims_and_ritual": false,
      "calendar_date_and_scope": false
    },
    "requiredGates": [
      "FR_EN_COPY_SIGNOFF",
      "IDENTITY_ASSIGNMENT_AND_RESEARCH_CROSSWALK",
      "FIRE_SAFETY_AND_LOCAL_PERMISSION",
      "CALENDAR_SCOPE_ACCEPTANCE"
    ]
  },
  {
    "releaseUnit": "CU-REVIEW-003",
    "researchId": "RESEARCH-SEVILLE-SEISES",
    "sourceGroupIds": [
      "CAT-WEISER-B-083",
      "CAT-WEISER-B-109"
    ],
    "releaseStatus": "RESEARCH_ONLY_NOT_PUBLISHED",
    "reviewScope": "SEVILLE_CATHEDRAL_ONLY",
    "article": {
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
      "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED"
    },
    "calendarAssociations": [
      {
        "resolver": "EXISTING_1962_CALENDAR",
        "kind": "MOVABLE_FEAST_CONTEXT",
        "calendar_accessor": "v384Dates(year).corpus",
        "feast_label": "Corpus Christi",
        "region_visibility": "SEVILLE_CATHEDRAL_ONLY"
      },
      {
        "resolver": "EXISTING_1962_CALENDAR",
        "kind": "FIXED_FEAST_CONTEXT",
        "month_day": "12-08",
        "feast_label": "Immaculate Conception",
        "region_visibility": "SEVILLE_CATHEDRAL_ONLY"
      }
    ],
    "relatedFollowingDays": null,
    "approvals": {
      "canonical_identity": false,
      "editorial_en": false,
      "editorial_fr": false,
      "claims_and_ritual": false,
      "calendar_date_and_scope": false
    },
    "requiredGates": [
      "FR_EN_COPY_SIGNOFF",
      "ONE_ID_MULTI_FEAST_RELATIONSHIP_APPROVAL",
      "CITY_AND_CATHEDRAL_SCOPE_ONLY",
      "CALENDAR_SCOPE_ACCEPTANCE"
    ]
  },
  {
    "releaseUnit": "CU-REVIEW-005",
    "researchId": "RESEARCH-POLISH-CORPUS-WREATHS",
    "sourceGroupIds": [
      "CAT-WEISER-B-085",
      "CAT-WEISER-B-086"
    ],
    "releaseStatus": "RESEARCH_ONLY_NOT_PUBLISHED",
    "reviewScope": "PL_LOCAL_CUSTOMS",
    "article": {
      "title": {
        "en": "Polish herb wreaths for Corpus Christi",
        "fr": "Les couronnes d'herbes de la Fête-Dieu en Pologne"
      },
      "description": {
        "en": "In some regions of Poland, families prepare small herb-and-flower wreaths during the customary celebrations after Corpus Christi. A locally arranged blessing often takes place on the eighth day, after which the wreaths are brought home and hung near sacred images.",
        "fr": "Dans certaines régions de Pologne, les familles préparent de petites couronnes d'herbes et de fleurs pendant les célébrations coutumières qui suivent la Fête-Dieu. Une bénédiction organisée localement a souvent lieu le huitième jour ; les couronnes sont ensuite rapportées à la maison et suspendues près d'images pieuses."
      },
      "history": {
        "en": "Poland's Ministry of Culture describes wreaths traditionally kept in church during the customary Corpus Christi octave and nowadays often blessed on its final day before being taken home. Łukasz Łuczaj's 2012 study near Krosno documented 245 wreaths and 133 questionnaires on local plants and related beliefs. The customary devotional week is not evidence of a universal octave in the 1962 Roman Calendar.",
        "fr": "Le ministère polonais de la Culture décrit les couronnes autrefois conservées à l'église pendant l'octave coutumière de la Fête-Dieu, et souvent bénites aujourd'hui le dernier jour avant d'être rapportées au foyer. L'étude de Łukasz Łuczaj (2012), près de Krosno, a recueilli 245 photographies de couronnes et 133 questionnaires sur les plantes et les croyances associées. Cette semaine de dévotions locales n'établit pas l'existence d'une octave universelle dans le calendrier romain de 1962."
      },
      "meaning": {
        "en": "The wreaths express gratitude for creation and the harvest, while the feast directs devotion toward Christ present in the Blessed Sacrament.",
        "fr": "Les couronnes expriment la reconnaissance pour la création et les récoltes, tandis que la fête oriente la dévotion vers le Christ présent dans le Saint-Sacrement."
      },
      "practice": {
        "en": "Where the parish actually arranges the local wreath blessing, families may prepare a small herbal wreath and bring it on the announced day, traditionally the eighth day after Corpus Christi; afterwards it may be hung respectfully at home. Where no such celebration exists, this remains an historical custom to learn about rather than a required ceremony.",
        "fr": "Là où la paroisse organise réellement une bénédiction locale, la famille peut préparer une petite couronne d'herbes et l'apporter au jour annoncé, traditionnellement le huitième jour après la Fête-Dieu ; elle peut ensuite la suspendre dignement à la maison. Ailleurs, cet usage reste une tradition historique à découvrir, non une cérémonie obligatoire."
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
          "claim_scope": "Polish Ministry text, section 'Oktawa Bożego Ciała': wreaths traditionally kept in church during the customary week, nowadays blessed on the final day, then hung at home; also records folklore without endorsing it"
        },
        {
          "id": "LUCZAJ-POLISH-CORPUS-WREATHS-2012",
          "title": "Łuczaj, A relic of medieval folklore: Corpus Christi Octave herbal wreaths in Poland (2012)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/22575705/",
          "role": "PEER_REVIEWED_FIELD_STUDY",
          "claim_scope": "Peer-reviewed Krosno-area survey: 245 wreath photographs and 133 questionnaires, local eighth-day blessing, plant composition and recorded folklore; no claim of universal 1962 octave"
        },
        {
          "id": "POLISH-MUSEUM-CORPUS-WREATHS",
          "title": "Agriculture Museum (Poland): Żywa tradycja",
          "url": "https://muzeumrolnictwa.pl/artykul/aktualnosci/niecodziennik-muzealny-zywa-tradycja",
          "role": "MUSEUM_LOCAL_CONTINUITY",
          "claim_scope": "Wreath blessing locally observed although liturgical octave no longer universal"
        }
      ],
      "editorialCopyStatus": "PREPUBLICATION_CANDIDATE_NOT_ACCEPTED"
    },
    "calendarAssociations": [
      {
        "resolver": "EXISTING_1962_CALENDAR",
        "kind": "MOVABLE_FEAST_CONTEXT",
        "calendar_accessor": "v384Dates(year).corpus",
        "feast_label": "Corpus Christi",
        "region_visibility": "POLAND_HISTORIC_AND_CONTEMPORARY_CONTEXT"
      }
    ],
    "relatedFollowingDays": {
      "status": "CUSTOMARY_REGIONAL_ONLY",
      "automatic_1962_OCTAVE_EVENT": false,
      "local_day_offset_policy": "NO_SYNTHETIC_DATE_TRIGGER_WITHOUT_EXPLICIT_COMMUNITY_EVIDENCE"
    },
    "approvals": {
      "canonical_identity": false,
      "editorial_en": false,
      "editorial_fr": false,
      "claims_and_ritual": false,
      "calendar_date_and_scope": false
    },
    "requiredGates": [
      "FR_EN_COPY_SIGNOFF",
      "IDENTITY_ASSIGNMENT_AND_RESEARCH_CROSSWALK",
      "POLISH_LOCAL_OCTAVE_VS_1962_UNIVERSAL_DISTINCTION",
      "CALENDAR_SCOPE_ACCEPTANCE"
    ]
  }
]);
export const COHORT2_REQUIRED_SCOPE=Object.freeze(["AT_LOCAL_CUSTOMS","SEVILLE_CATHEDRAL_ONLY","PL_LOCAL_CUSTOMS"]);
const isValidDate=date=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||"")))return false;
 const parsed=new Date(date+"T12:00:00Z");
 return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===date;
};
function matchesExistingCalendarDate(link,date,dates){
 if(link.kind==="FIXED_FEAST_CONTEXT")return date.slice(5)===link.month_day;
 if(link.kind!=="MOVABLE_FEAST_CONTEXT")return false;
 const accessor=link.calendar_accessor;
 if(accessor==="v384Dates(year).holySaturday")return date===dates.holySaturday;
 if(accessor==="v384Dates(year).corpus")return date===dates.corpus;
 return false; // Never guess unsupported or community-specific dates.
}
/**
 * RESEARCH/QA ADAPTER ONLY. Fail closed by default.
 * An explicit preview flag and explicit local/visitor scope are BOTH required.
 * This is not a production Calendar recommendation provider or event scheduler.
 */
export function calendarCohort2ReviewForDate(date,{preview=false,scope=null,fr=false}={}){
 if(preview!==true||!COHORT2_REQUIRED_SCOPE.includes(scope)||!isValidDate(date))return Object.freeze([]);
 const dates=v384Dates(Number(date.slice(0,4)));
 return Object.freeze(COHORT2_REVIEW_ROWS.filter(r=>r.reviewScope===scope&&
  r.calendarAssociations.some(link=>matchesExistingCalendarDate(link,date,dates)))
  .map(r=>Object.freeze({
   researchId:r.researchId,releaseUnit:r.releaseUnit,publicationState:r.releaseStatus,
   title:r.article.title[fr?"fr":"en"],occasion:r.article.occasion[fr?"fr":"en"],
   article:r.article,reviewScope:r.reviewScope,nonPublishingPreview:true,
   sourceGroupIds:r.sourceGroupIds
  })));
}
