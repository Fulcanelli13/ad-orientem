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
export function calendarHistoricalNotes(date,{fr=false}={}) {
  const iso=asDay(date), year=Number(iso.slice(0,4)), x=v384Dates(year);
  const chosen=[];
  if(iso===addDaysIso(x.pentecost,-1)) chosen.push(NOTES["history.pentecost-vigil-pre1955"]);
  if(iso===x.emberPent[0]) chosen.push(NOTES["history.pentecost-ember-wednesday"]);
  if(iso===`${year}-12-08`) chosen.push(NOTES["history.immaculate-conception-older-vigil-octave"]);
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
    isMassRubric:false,
    createsCalendarFeast:false,
    imposesObligation:false,
  })));
}

export const CALENDAR_HISTORICAL_SOURCE_ARTICLE_IDS = freeze(
  Object.values(NOTES).map(row=>row.sourceArticleId)
);
