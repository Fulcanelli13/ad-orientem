/* Historical explanations for the EXISTING Calendar day detail.
 * Non-normative research-derived context only: never a Proper, a ritual rule,
 * a new celebration, or a present-day fasting obligation.
 * Sources are linked, never reproduced.
 */
import { addDaysIso } from "./liturgical-year.js";
import { v384Dates } from "./traditional-year-v384.js";

export const CALENDAR_HISTORICAL_CONTEXT_VERSION = "calendar-historical-context-v1";

const freeze = Object.freeze;
const SOURCES = freeze({
  pentecostVigilICRSP: freeze({ label:"ICRSP · Vigile de la Pentecôte", url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0281_ancien", role:"HISTORICAL_COMMENTARY" }),
  pentecostVigilReform: freeze({ label:"New Liturgical Movement · Pius XII 1955 Pentecost Vigil changes", url:"https://www.newliturgicalmovement.org/2009/04/2009-compendium-of-1955-holy-week.html", role:"SECONDARY_HISTORICAL_CHECK" }),
  pentecostEmberICRSP: freeze({ label:"ICRSP · Mercredi des Quatre-Temps de Pentecôte", url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0170_nouveau", role:"HISTORICAL_COMMENTARY" }),
  pentecostEmberMissal: freeze({ label:"Rev. F. X. Lasance · The New Roman Missal (1936), Ember Wednesday in Pentecost Week", url:"https://www.romanmissal.org/ecclesiastical-year", role:"HISTORICAL_LITURGICAL_EXPLANATION" }),
  immaculateICRSP: freeze({ label:"ICRSP · Immaculée Conception", url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0605_ancien", role:"HISTORICAL_COMMENTARY" }),
  immaculateRubricWitness: freeze({ label:"Saint Lawrence Press · 1962 Immaculate Conception feast", url:"https://ordorecitandi.blogspot.com/2019/12/immaculate-conception-of-bvm.html", role:"INDEPENDENT_CALENDAR_CROSSCHECK" }),
  ceciliaICRSP: freeze({ label:"ICRSP · Sainte Cécile (22 November)", url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0563_ancien", role:"HISTORICAL_COMMENTARY" }),
  ceciliaEncyclopedia: freeze({ label:"Catholic Encyclopedia · St Cecilia", url:"https://www.newadvent.org/cathen/03471b.htm", role:"INDEPENDENT_HISTORICAL_REFERENCE" }),
  leoICRSP: freeze({ label:"ICRSP · Saint Léon Ier (11 April)", url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0745_ancien", role:"HISTORICAL_COMMENTARY" }),
  leoEncyclopedia: freeze({ label:"Catholic Encyclopedia · Pope St Leo I", url:"https://www.newadvent.org/cathen/09154b.htm", role:"INDEPENDENT_HISTORICAL_REFERENCE" }),
});

const NOTES = freeze({
  "history.pentecost-vigil-pre1955": freeze({
    id:"history.pentecost-vigil-pre1955",
    title:freeze({ en:"An older Pentecost Vigil", fr:"L’ancienne vigile de la Pentecôte" }),
    explanation:freeze({
      en:"Before the 1955 reform, the Pentecost Vigil included six prophetic readings and a blessing of baptismal water, recalling Holy Saturday. Those ceremonies were omitted in the form followed by the 1962 Roman Missal.",
      fr:"Avant la réforme de 1955, la vigile de la Pentecôte comportait six prophéties et une bénédiction de l’eau baptismale, rappelant le Samedi saint. Ces cérémonies ne figurent plus dans la forme suivie par le Missel romain de 1962."
    }),
    sourceArticleId:"a0281_ancien",
    sourcePath:null,
    historicalScope:"BEFORE_1955_NOT_1962_RUBRIC",
    sources:freeze([SOURCES.pentecostVigilICRSP, SOURCES.pentecostVigilReform]),
  }),
  "history.pentecost-ember-wednesday": freeze({
    id:"history.pentecost-ember-wednesday",
    title:freeze({ en:"Pentecost Ember Wednesday", fr:"Mercredi des Quatre-Temps de Pentecôte" }),
    explanation:freeze({
      en:"The traditional Roman station for Pentecost Ember Wednesday is Saint Mary Major. The day's Mass places the gifts of the Holy Ghost beside Christ's teaching on the bread of life; the Ember days also recall the Church's prayers for those preparing for Holy Orders.",
      fr:"La station romaine traditionnelle du mercredi des Quatre-Temps de Pentecôte est Sainte-Marie-Majeure. La messe du jour rapproche les dons du Saint-Esprit de l’enseignement du Christ sur le pain de vie ; les Quatre-Temps rappellent aussi la prière de l’Église pour les futurs ordinands."
    }),
    sourceArticleId:"a0170_nouveau",
    sourcePath:null,
    historicalScope:"1962_DAY_HISTORICAL_EXPLANATION_NOT_NEW_RUBRIC",
    sources:freeze([SOURCES.pentecostEmberICRSP, SOURCES.pentecostEmberMissal]),
  }),
  "history.saint-cecilia-feast-date": freeze({
    id:"history.saint-cecilia-feast-date",
    title:freeze({ en:"Saint Cecilia: what does 22 November commemorate?", fr:"Sainte Cécile : que commémore le 22 novembre ?" }),
    explanation:freeze({
      en:"Saint Cecilia has long been honoured on 22 November in Rome. Historical liturgical scholarship connects this date with the dedication of her titular church in Trastevere; it should not be presented as a securely documented date of her martyrdom. Her early cult and the later details of her Passion should also be distinguished.",
      fr:"Sainte Cécile est honorée à Rome le 22 novembre depuis l’Antiquité. Les études liturgiques rapprochent cette date de la dédicace de son église titulaire au Transtévère : elle ne doit pas être présentée comme la date historiquement certaine de son martyre. Il faut aussi distinguer son culte ancien des détails plus tardifs de sa Passion."
    }),
    sourceArticleId:"a0563_ancien",
    historicalScope:"SAINT_CECILIA_FEAST_HISTORY_NO_DEATH_DATE_CERTIFICATION",
    requiresMainProperOwner:"sancti:11-22",
    sources:freeze([SOURCES.ceciliaICRSP,SOURCES.ceciliaEncyclopedia]),
  }),
  "history.saint-leo-i-feast-date": freeze({
    id:"history.saint-leo-i-feast-date",
    title:freeze({ en:"Saint Leo the Great: why 11 April?", fr:"Saint Léon le Grand : pourquoi le 11 avril ?" }),
    explanation:freeze({
      en:"Pope Saint Leo I died on 10 November 461, but the traditional Roman feast is on 11 April, a date associated with his burial at Saint Peter’s. Pope Sergius I transferred his remains further inside the basilica in 688; that historical remembrance is distinct from Pope Saint Leo II.",
      fr:"Le pape saint Léon Ier mourut le 10 novembre 461, mais sa fête romaine traditionnelle est célébrée le 11 avril, date liée à sa sépulture à Saint-Pierre. Le pape Serge Ier transféra ses restes dans la basilique en 688 ; ce souvenir historique est distinct de la personne du pape saint Léon II."
    }),
    sourceArticleId:"a0745_ancien",
    historicalScope:"SAINT_LEO_I_FEAST_HISTORY_DISTINCT_FROM_LEO_II",
    requiresMainProperOwner:"sancti:04-11",
    sources:freeze([SOURCES.leoICRSP,SOURCES.leoEncyclopedia]),
  }),
  "history.immaculate-conception-older-vigil-octave": freeze({
    id:"history.immaculate-conception-older-vigil-octave",
    title:freeze({ en:"Why older missals show a vigil and octave", fr:"Pourquoi les anciens missels mentionnent une vigile et une octave" }),
    explanation:freeze({
      en:"Older Roman liturgical books celebrated the Immaculate Conception with a vigil and octave. These were suppressed in the mid-twentieth-century calendar reforms and do not form part of the universal 1962 celebration on 8 December.",
      fr:"Les anciens livres liturgiques romains célébraient l’Immaculée Conception avec une vigile et une octave. Supprimées lors des réformes du calendrier au milieu du XXe siècle, elles ne font pas partie de la célébration universelle du 8 décembre selon les livres de 1962."
    }),
    sourceArticleId:"a0605_ancien",
    sourcePath:null,
    historicalScope:"OLDER_CALENDAR_NOT_1962_VIGIL_OR_OCTAVE",
    sources:freeze([SOURCES.immaculateICRSP, SOURCES.immaculateRubricWitness]),
  }),
});

function asDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value||""))) throw new TypeError("Historical context date must be YYYY-MM-DD");
  return String(value);
}

/* Date-only contextual lookup. No implicit change to calendar precedence,
 * selected Proper, gestures, processions or obligations. */
export function calendarHistoricalNotes(date,{fr=false,observedMainId=null}={}) {
  const iso=asDay(date), year=Number(iso.slice(0,4)), x=v384Dates(year);
  const chosen=[];
  if(iso===addDaysIso(x.pentecost,-1)) chosen.push(NOTES["history.pentecost-vigil-pre1955"]);
  if(iso===x.emberPent[0]) chosen.push(NOTES["history.pentecost-ember-wednesday"]);
  if(iso===`${year}-12-08`) chosen.push(NOTES["history.immaculate-conception-older-vigil-octave"]);
  // Saints notes are only attached to the *observed principal 1962 Proper*,
  // not merely a civil feast date that might be impeded or only commemorated.
  const principal=String(observedMainId||"").toLowerCase();
  if(iso===`${year}-11-22` && /^sancti:11-22(?::|$)/.test(principal)) chosen.push(NOTES["history.saint-cecilia-feast-date"]);
  if(iso===`${year}-04-11` && /^sancti:04-11(?::|$)/.test(principal)) chosen.push(NOTES["history.saint-leo-i-feast-date"]);
  return freeze(chosen.map(row=>freeze({
    id:row.id,
    title:fr?row.title.fr:row.title.en,
    explanation:fr?row.explanation.fr:row.explanation.en,
    date:iso,
    sourceArticleId:row.sourceArticleId,
    sources:row.sources,
    kind:"historical-note",
    authority:"NON_NORMATIVE_HISTORICAL_CONTEXT",
    historicalScope:row.historicalScope,
    observedMainId:row.requiresMainProperOwner?principal:null,
    isMassRubric:false,
    createsCalendarFeast:false,
    imposesObligation:false,
  })));
}

export const CALENDAR_HISTORICAL_SOURCE_ARTICLE_IDS = freeze(
  Object.values(NOTES).map(row=>row.sourceArticleId)
);
