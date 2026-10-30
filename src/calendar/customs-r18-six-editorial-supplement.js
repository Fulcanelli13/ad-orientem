/**
 * Original six R18 candidates, review-only.
 * Source: PR #1759, full candidate payload Git blob 743308a8ba76c9251d7303143c95ef6a43a5c7f4.
 * No article here is a published Calendar Custom and no source date is
 * an active event. This module is reached only through Calendar's explicit
 * customsR18Eleven=review gate; no separate Customs Atlas is created.
 */
import {calendarCustomArticleIds} from "./customs-read-model.js";
export const R18_SIX_SOURCE_BLOB="743308a8ba76c9251d7303143c95ef6a43a5c7f4";
const FIELDS=Object.freeze([
 ["description","Description","Présentation"],
 ["history","Historical context","Contexte historique"],
 ["meaning","Spiritual meaning","Sens spirituel"],
 ["practice","Documented practice","Pratique attestée"],
 ["caution","Cautions","Précautions"],
 ["occasion","Occasion","Occasion"],
 ["scope","Geographic and religious scope","Portée géographique et religieuse"]
]);
const SIX_RECORDS=Object.freeze([
  {
    "id": "PATR-002",
    "title": {
      "en": "St Patrick's ribbon cross",
      "fr": "La croix de rubans de saint Patrick"
    },
    "description": {
      "en": "Historically, Irish people wore homemade silk, paper or ribbon crosses on St Patrick's Day to honour the saint; the older practice later declined.",
      "fr": "Autrefois, des Irlandais portaient à la Saint-Patrick des croix faites de soie, de papier ou de rubans pour honorer le saint ; cette pratique ancienne a ensuite décliné."
    },
    "history": {
      "en": "Galway City Museum recounts Thomas Dineley’s report from the 1680s and later children’s ribbon-and-card badges. Folklore recorded in the late 1930s describes the usage mainly in the past tense; continuity cannot be assumed.",
      "fr": "Le Galway City Museum rapporte le témoignage de Thomas Dineley dans les années 1680 et décrit les insignes en carton et rubans portés ensuite par les enfants. Les collectes folkloriques de la fin des années 1930 présentent l’usage surtout au passé ; on ne peut présumer sa continuité."
    },
    "meaning": {
      "en": "A decorative cross honours the saint and recalls Christian faith.",
      "fr": "La croix décorative honore le saint et rappelle la foi chrétienne."
    },
    "practice": {
      "en": "Families made badges for children to wear on the feast, with varied colours and forms.",
      "fr": "Les familles confectionnaient des insignes que les enfants portaient le jour de la fête, selon des formes et couleurs diverses."
    },
    "caution": {
      "en": "No obligatory design, sacramental status or automatic exemption from Lenten discipline is implied.",
      "fr": "Aucun motif obligatoire, statut de sacramental ou dispense automatique des règles du Carême n'est sous-entendu."
    },
    "occasion": {
      "en": "17 March",
      "fr": "Le 17 mars, jour de la Saint-Patrick."
    },
    "scope": {
      "en": "Historical Irish household practice, with regional forms; continuity today is not established.",
      "fr": "Usage domestique irlandais historique, avec des formes régionales ; la continuité actuelle n'est pas établie."
    },
    "sources": [
      {
        "id": "NMI-STPATRICK-CROSSES",
        "title": "National Museum of Ireland",
        "url": "https://source.museum.ie/en-IE/Collections-Research/Folklife-Collections/Folklife-Collections-List-(1)/Religion-and-Calendar-Customs/St-Patrick"
      },
      {
        "id": "GALWAY-CROSSES-REVIVAL",
        "title": "Galway City Museum",
        "url": "https://galwaycitymuseum.ie/blog/1-reviving-an-old-tradition-st-patricks-crosses/"
      }
    ],
    "region": "IE",
    "dates": [
      "03-17"
    ],
    "source_pack_review_status": "UNPUBLISHED_SIGNOFF_PENDING"
  },
  {
    "id": "XMAS-002",
    "title": {
      "en": "The Irish Christmas candle",
      "fr": "La bougie de Noël dans les foyers irlandais"
    },
    "description": {
      "en": "Irish folklore records Christmas-night candles placed on tables or by windows, associated with welcoming the Holy Family or remembering the departed.",
      "fr": "Le folklore irlandais évoque des bougies de la nuit de Noël placées sur les tables ou près des fenêtres, associées à l’accueil de la Sainte Famille ou au souvenir des défunts."
    },
    "history": {
      "en": "The National Museum of Ireland cites an Annascaul, County Kerry, account from 1941 describing a Christmas-night table candle and a folk belief about the Blessed Virgin passing by. Other recollections connect candles with deceased relatives. These are recorded beliefs, not guaranteed supernatural effects.",
      "fr": "Le National Museum of Ireland cite un témoignage de 1941 recueilli à Annascaul, dans le comté de Kerry, décrivant une bougie sur la table durant la nuit de Noël et une croyance populaire liée au passage de la Sainte Vierge. D’autres souvenirs rattachent les bougies aux proches défunts. Il s’agit de croyances rapportées, sans effet surnaturel garanti."
    },
    "meaning": {
      "en": "A light can accompany welcome for Christ and remembrance of loved ones.",
      "fr": "Une lumière peut accompagner l'accueil du Christ et le souvenir des proches."
    },
    "practice": {
      "en": "Where a household wishes to adopt the custom, use a safe electric candle by a window or on the table during Christmas prayer; no universal duration is prescribed.",
      "fr": "Une famille souhaitant reprendre cet usage peut placer une bougie électrique à la fenêtre ou sur la table pendant la prière de Noël ; aucune durée universelle n’est prescrite."
    },
    "caution": {
      "en": "Use an electric candle where appropriate. Historical beliefs about returning spirits or guaranteed favours are not taught as Catholic doctrine.",
      "fr": "Préférer une bougie électrique si nécessaire. Les croyances historiques sur le retour des esprits ou les faveurs garanties ne sont pas enseignées comme doctrine catholique."
    },
    "occasion": {
      "en": "24–25 December; local duration varies",
      "fr": "La veille et la nuit de Noël, selon des horaires familiaux variables."
    },
    "scope": {
      "en": "Irish Christmas household tradition with locality-dependent testimony; not a national obligation.",
      "fr": "Tradition domestique irlandaise de Noël attestée selon les régions ; sans obligation nationale."
    },
    "sources": [
      {
        "id": "DUCHAS-ADARE-0506-062",
        "title": "National Folklore Collection, UCD / Dúchas",
        "url": "https://www.duchas.ie/en/cbes/4922029/4920129/4948861"
      },
      {
        "id": "NMI-CHRISTMAS-REMEMBRANCE",
        "title": "National Museum of Ireland; Clodagh Doyle, Irish Folklife Division",
        "url": "https://source.museum.ie/en-IE/Collections-Research/Folklife-Collections/Folklife-Collections-List-(1)/Religion-and-Calendar-Customs/Generations-past-how-Christmas-was-celebrated-in-y"
      },
      {
        "id": "R18-ADDITIONAL-EVIDENCE-02",
        "title": "Dúchas Schools' Collection — Graine school (Kilkenny), M. Delahunty (Tipperary)",
        "url": "https://www.duchas.ie/en/cbes/4758582/4756445/4934128"
      }
    ],
    "region": "IE",
    "dates": [
      "12-24",
      "12-25"
    ],
    "source_pack_review_status": "UNPUBLISHED_SIGNOFF_PENDING"
  },
  {
    "id": "XMAS-003",
    "title": {
      "en": "Christmas Eve hay beneath the tablecloth",
      "fr": "Foin sous la nappe de la veille de Noël"
    },
    "description": {
      "en": "In Polish households observing Wigilia, hay placed beneath the white Christmas Eve tablecloth recalls Christ's humility and birth in a stable.",
      "fr": "Dans les foyers polonais célébrant la Wigilia, le foin placé sous la nappe blanche du soir de Noël rappelle l’humilité du Christ et sa naissance dans une étable."
    },
    "history": {
      "en": "Poland’s Ministry of Culture identifies this custom as part of Wigilia, the Christmas Eve family meal, alongside other distinct customs such as sharing opłatek and leaving an extra table setting.",
      "fr": "Le ministère polonais de la Culture décrit cet usage dans le repas familial de la Wigilia, à côté d’autres coutumes distinctes comme le partage de l’opłatek et l’assiette réservée à un invité."
    },
    "meaning": {
      "en": "The hay recalls the poverty and humility of Christ's Nativity and invites grateful remembrance of the manger.",
      "fr": "Le foin rappelle la pauvreté et l’humilité de la Nativité du Christ et invite à se souvenir avec reconnaissance de la crèche."
    },
    "practice": {
      "en": "A little clean hay may be placed beneath the Christmas Eve tablecloth where this is customary; do not interpret straw lengths as predictions.",
      "fr": "Mettre un peu de foin propre sous la nappe de Noël selon l’usage local, sans tirer de présages des brins."
    },
    "caution": {
      "en": "This voluntary Christmas Eve table custom is not the Advent manger-straw practice, a priestly blessing or a way to predict the future.",
      "fr": "Cette coutume facultative de la veille de Noël se distingue de la paille ajoutée à la crèche de l’Avent ; elle ne constitue ni une bénédiction sacerdotale ni un moyen de prédire l’avenir."
    },
    "occasion": {
      "en": "24 December, Christmas Eve in Polish households",
      "fr": "24 décembre — veille de Noël (coutume domestique polonaise)"
    },
    "scope": {
      "en": "Polish Christmas Eve family custom; optional and regionally variable.",
      "fr": "Coutume familiale polonaise du réveillon de Noël ; facultative et variable selon les régions."
    },
    "sources": [
      {
        "id": "PL-MINISTRY-WIGILIA",
        "title": "Polish Ministry of Culture",
        "url": "https://www.gov.pl/web/kultura/nowy-wpis-na-krajowej-liscie-niematerialnego-dziedzictwa-kulturowego"
      },
      {
        "id": "PL-FORESTRY-WIGILIA",
        "title": "Polish State Forests",
        "url": "https://www.lasy.gov.pl/pl/informacje/aktualnosci/podlazniczka-i-diduch-czyli-tradycje-i-swiateczne-zwyczaje"
      }
    ],
    "region": "PL",
    "dates": [
      "12-24"
    ],
    "source_pack_review_status": "UNPUBLISHED_SIGNOFF_PENDING"
  },
  {
    "id": "SBAR-001",
    "title": {
      "en": "St Barbara branches — Barbarazweige",
      "fr": "Rameaux de sainte Barbe — Barbarazweige"
    },
    "description": {
      "en": "On 4 December, some Central European households put cherry or apple branches in water, hoping for blossoms around Christmas.",
      "fr": "Le 4 décembre, certains foyers d’Europe centrale mettent des rameaux de cerisier ou de pommier dans l’eau, dans l’espoir qu’ils fleurissent vers Noël."
    },
    "history": {
      "en": "The Archdiocese of Vienna describes this household custom and a later legend about St Barbara’s imprisonment. It also notes that her precise historical existence is uncertain; the practice does not establish the story as fact.",
      "fr": "L’archidiocèse de Vienne décrit cet usage familial et une légende tardive relative à l’emprisonnement de sainte Barbe. Il souligne aussi l’incertitude de son existence historique ; la coutume ne suffit pas à établir la légende comme un fait."
    },
    "meaning": {
      "en": "A winter sign of hope and patient preparation for Christmas.",
      "fr": "Un signe d’espérance en hiver et une préparation patiente à Noël."
    },
    "practice": {
      "en": "Place appropriate fruit-tree branches in water, where locally customary; pray for perseverance and hope.",
      "fr": "Mettre des rameaux adaptés dans l’eau selon l’usage local, et prier pour la persévérance et l’espérance."
    },
    "caution": {
      "en": "Whether a branch blooms is a natural outcome, not a guarantee of future fortune or favour.",
      "fr": "La floraison est un phénomène naturel, non une garantie de bonheur ou de faveur future."
    },
    "occasion": {
      "en": "4 December, traditional St Barbara household observance; not a Mass rite",
      "fr": "4 décembre — coutume domestique traditionnelle de la Sainte-Barbe, distincte de la messe"
    },
    "scope": {
      "en": "Traditional household custom in Austria and some Central European communities.",
      "fr": "Coutume domestique traditionnelle en Autriche et dans certaines régions d'Europe centrale."
    },
    "sources": [
      {
        "id": "AT-VIENNA-BARBARA",
        "title": "Archdiocese of Vienna — St Barbara, 4 December",
        "url": "https://www.erzdioezese-wien.at/heilige-barbara"
      }
    ],
    "region": "AT",
    "dates": [
      "12-04"
    ],
    "source_pack_review_status": "UNPUBLISHED_SIGNOFF_PENDING"
  },
  {
    "id": "XMAS-004",
    "title": {
      "en": "Provençal Christmas pain calendal and the poor person's portion",
      "fr": "Le pain calendal provençal et la part du pauvre"
    },
    "description": {
      "en": "The Provençal Christmas Eve Gros Souper traditionally features pain calendal, a round cross-scored loaf divided into portions, including one for the poor.",
      "fr": "Le gros souper provençal du 24 décembre comprend traditionnellement le pain calendal, une miche ronde incisée d’une croix et partagée en plusieurs parts, dont celle des pauvres."
    },
    "history": {
      "en": "Var regional heritage documentation describes portions of the pain calendal for the poor, for supper and for ‘miracles’ in the reported local folklore. This domestic bread is neither Eucharistic bread nor a universal blessing.",
      "fr": "La documentation patrimoniale du Var décrit des parts du pain calendal destinées aux pauvres, au souper et aux « miracles » selon le folklore rapporté. Ce pain domestique n’est ni eucharistique ni l’objet d’une bénédiction universelle."
    },
    "meaning": {
      "en": "Generosity, Christian hospitality and remembrance of those in need at Christmas.",
      "fr": "Générosité, hospitalité chrétienne et attention aux plus démunis à Noël."
    },
    "practice": {
      "en": "Where a family keeps the tradition, share festive bread and make a real charitable offering.",
      "fr": "Dans une famille qui conserve l’usage, partager le pain de fête et accomplir un geste concret de charité."
    },
    "caution": {
      "en": "Documented as Provençal regional culture; parts associated with miracles or special protection remain folklore, not promises.",
      "fr": "Coutume provençale locale ; les parts auxquelles on prête des miracles ou une protection particulière relèvent du folklore, non d’une promesse."
    },
    "occasion": {
      "en": "24 December, traditional Provençal Gros Souper; local family observance",
      "fr": "24 décembre — gros souper provençal"
    },
    "scope": {
      "en": "Provençal Gros Souper household bread custom; not liturgical blessed bread.",
      "fr": "Coutume du pain du gros souper provençal, distincte d'un pain bénit liturgique."
    },
    "sources": [
      {
        "id": "FR-VAR-PAIN-CALENDAL",
        "title": "Le Var — regional tourism authority",
        "url": "https://www.visitvar.fr/agenda/evenements-incontournables/noel-provence/traditions-de-noel-provence"
      },
      {
        "id": "FR-PACA-GROS-SOUPER",
        "title": "Provence-Alpes-Côte d’Azur regional tourism",
        "url": "https://provence-alpes-cotedazur.com/decouvrir/les-destinations/la-provence/la-veillee-de-noel/"
      }
    ],
    "region": "FR-PROVENCE",
    "dates": [
      "12-24"
    ],
    "source_pack_review_status": "UNPUBLISHED_SIGNOFF_PENDING"
  },
  {
    "id": "EPIP-004",
    "title": {
      "en": "Three Kings gifts left in children's shoes",
      "fr": "Les cadeaux des Rois mages dans les chaussures des enfants"
    },
    "description": {
      "en": "In Spain, children traditionally set out a shoe on the evening of 5 January for gifts associated with the Three Kings at Epiphany.",
      "fr": "En Espagne, des enfants déposent traditionnellement une chaussure le soir du 5 janvier pour les cadeaux associés aux Rois mages à l’Épiphanie."
    },
    "history": {
      "en": "Spain’s official tourism service documented the shoe custom and parades with actors portraying the Magi in a guide published in 2023 for 2024. The guide does not establish the tradition’s first origin or current local parade dates.",
      "fr": "L’office du tourisme espagnol a décrit les chaussures et les défilés où des acteurs représentent les Mages dans un guide publié en 2023 pour 2024. Cette source ne prouve ni la date d’origine de l’usage ni les horaires actuels des défilés."
    },
    "meaning": {
      "en": "A family festival associated with the Epiphany story and generosity.",
      "fr": "Une fête familiale liée au récit de l’Épiphanie et à la générosité."
    },
    "practice": {
      "en": "On the evening of 5 January, a family may set out children's shoes for a customary gift and, separately, read Matthew 2 or pray for generosity.",
      "fr": "Le soir du 5 janvier, une famille peut déposer les chaussures des enfants pour les cadeaux traditionnels puis, séparément, lire Matthieu 2 ou prier pour grandir dans la générosité."
    },
    "caution": {
      "en": "Not a Roman liturgical rubric or claim that the Magi literally deliver gifts.",
      "fr": "Ni rubrique de la liturgie romaine, ni affirmation d’une distribution surnaturelle effective par les Mages."
    },
    "occasion": {
      "en": "Evening of 5 January into 6 January; Spanish household custom",
      "fr": "Soir du 5 au 6 janvier — cadeaux des Rois mages"
    },
    "scope": {
      "en": "Spanish Epiphany family gift custom; not a universal Catholic practice.",
      "fr": "Coutume espagnole des cadeaux de l'Épiphanie en famille, non universelle dans l'Église."
    },
    "sources": [
      {
        "id": "ES-TOURISM-SHOE-KINGS",
        "title": "Spain's official tourism promotion service",
        "url": "https://socialnewsroom.spain.info/three-kings-day-in-spain-2024/"
      },
      {
        "id": "ES-TOURISM-MADRID",
        "title": "Spain's official tourism portal",
        "url": "https://www.spain.info/en/top/christmas-madrid/"
      }
    ],
    "region": "ES",
    "dates": [
      "01-05",
      "01-06"
    ],
    "source_pack_review_status": "UNPUBLISHED_SIGNOFF_PENDING"
  }
]);
const h=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function calendarR18SixReviewRecords({includePromoted=false,publishedIds=calendarCustomArticleIds()}={}){
 return includePromoted?SIX_RECORDS:SIX_RECORDS.filter(x=>!publishedIds.includes(x.id));
}
export function calendarR18SixEditorialSupplementMarkup({fr=false,publishedIds=calendarCustomArticleIds()}={}){
 const records=calendarR18SixReviewRecords({publishedIds});
 const cards=records.map((r,i)=>{
  const translated=language=>'<section class="aoCalR18ElevenLanguage" lang="'+language+'"><h5>'+
    (language==="fr"?"Français":"English")+'</h5>'+
    FIELDS.map(([key,en,frLabel])=>'<h6>'+h(language==="fr"?frLabel:en)+'</h6><p>'+
      h(r[key][language])+'</p>').join("")+'</section>';
  const links=r.sources.map((src,j)=>'<li><a href="'+h(src.url)+
   '" target="_blank" rel="noopener noreferrer">'+h(src.title||"Source "+(j+1))+'</a></li>').join("");
  return '<details class="aoCalCustomArticle aoCalR18SixCandidate" data-cal-r18-six-review-key="'+h(r.id)+'">'+
   '<summary><span><strong>'+h(String(i+1).padStart(2,"0")+' · '+r.title[fr?"fr":"en"])+'</strong>'+
   '<small>'+h(fr?"Proposition régionale · non publiée":"Regional proposal · not published")+
   ' · '+h(r.region)+'</small></span><span aria-hidden="true">›</span></summary>'+
   '<div class="aoCalCustomArticleContent"><p><strong>'+
   h(fr?"Approbations éditoriales requises":"Editorial approval required")+'</strong> · '+h(r.id)+'</p>'+
   '<p>'+h(fr?"Preuves historiques limitées ; aucune approbation intégrale, aucun événement annuel, aucun rite ou sacrement nouveau.":"Limited historical evidence; no full-copy approval, recurring event, or new rite or sacramental.")+'</p>'+
   '<div class="aoCalR18ElevenComparison" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px">'+
     translated("en")+translated("fr")+'</div>'+
   '<h5>'+h(fr?"Sources à examiner":"Sources to review")+'</h5><ul>'+links+'</ul>'+
   '<p><small>'+h(fr?"Dates indiquées uniquement pour le contexte historique, non programmées : ":"Dates are historical context only, not scheduled: ")+
    h(r.dates.join(", "))+'</small></p></div></details>';
 }).join("");
 return '<section class="aoCalR18SixEditorialSupplement" data-cal-r18-six-supplement data-cal-r18-six-count="'+records.length+'">'+
 '<div class="aoCalV2SectionTitle"><div><small>'+h(fr?"EXAMEN ÉDITORIAL · PREMIER GROUPE":"EDITORIAL REVIEW · FIRST COHORT")+
 ' · '+records.length+'</small><h3>'+h(fr?"Six autres traditions historiques proposées":"Six additional proposed historical Customs")+
 '</h3></div></div>'+
 '<p>'+h(fr?"Ces six textes ne sont pas publiés. Le catalogue public et les suggestions du calendrier restent inchangés.":"These six articles are not published. The public catalogue and Calendar recommendations remain unchanged.")+'</p>'+
 '<div class="aoCalR18SixItems">'+cards+'</div></section>';
}
