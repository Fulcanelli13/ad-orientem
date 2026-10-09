import { formatDisplayDate } from "../app/date-format.js";
import { NOVENA_CORPUS_V4, NOVENA_START_KIND } from "../pray/novena-corpus-v4.js";
import { addDaysIso, dateFromIso, isoDate } from "./liturgical-year.js";
import { v384Events, v384Dates } from "./traditional-year-v384.js";
import { CALENDAR_DEVOTIONAL_REGISTRY_VERSION, DEVOTIONAL_PRACTICE_REGISTRY, NOVENA_TARGET_IDS, NOVENA_SOURCE_HOLDS, devotionalPracticeDefinition } from "./devotional-registry.js";

export const CALENDAR_INTELLIGENCE_VERSION="calendar-intelligence-v2-complete-novenas";

const validIso=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||""));
const keyOf=value=>{
  if(validIso(value))return String(value);
  if(value instanceof Date&&!Number.isNaN(value.getTime()))return isoDate(value);
  throw new TypeError("Calendar intelligence requires a valid YYYY-MM-DD date or Date");
};
const L=(fr,en,frText)=>fr?frText:en;
const diffDays=(a,b)=>Math.round((dateFromIso(a)-dateFromIso(b))/86400000);
const novenaStartKind=n=>n?.startKind===NOVENA_START_KIND.TRADITIONAL?NOVENA_START_KIND.TRADITIONAL:NOVENA_START_KIND.SUGGESTED;
const novenaStartPrefix=(n,fr)=>novenaStartKind(n)===NOVENA_START_KIND.TRADITIONAL
  ?L(fr,"Traditional start","Début traditionnel")
  :L(fr,"Suggested start","Début suggéré");

const DISCIPLINE_SOURCES=Object.freeze({
  canonFast:Object.freeze({label:"Code of Canon Law · can. 919",url:"https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann879-958_en.html"}),
  canonPenance:Object.freeze({label:"Code of Canon Law · cann. 1249–1253",url:"https://press.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann1244-1253_en.html"}),
  fast1957:Object.freeze({label:"Pius XII · Sacram Communionem (1957)",url:"https://www.vatican.va/archive/aas/documents/AAS-49-1957-ocr.pdf"}),
  fast1953:Object.freeze({label:"Pius XII · Christus Dominus (1953)",url:"https://www.vatican.va/content/pius-xii/la/apost_constitutions/documents/hf_p-xii_apc_19530106_christus-dominus.html"}),
  popularPiety:Object.freeze({label:"Directory on Popular Piety · Rogation observance",url:"https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html"}),
  septemberEmber:Object.freeze({label:"1962 September Ember reckoning · Romanitas Press",url:"https://www.romanitaspress.com/reckoning-sept-ember-days"}),
});


export const CALENDAR_SEMANTIC_REGISTRY_VERSION="calendar-semantic-registry-v1";

export const CALENDAR_SEMANTIC_REGISTRY=Object.freeze({
  "observance.divine_mercy_sunday_current":Object.freeze({
    key:"observance.divine_mercy_sunday_current",
    title:Object.freeze({en:"Divine Mercy Sunday",fr:"Dimanche de la Divine Miséricorde"}),
    schedule:Object.freeze({type:"EASTER_OFFSET",offset:7}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:64,
    tags:Object.freeze(["CURRENT_CALENDAR_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-DIVINE-MERCY-SUNDAY"]),
  }),
  "feast.our_lady_of_lourdes":Object.freeze({
    key:"feast.our_lady_of_lourdes",
    title:Object.freeze({en:"Our Lady of Lourdes",fr:"Notre-Dame de Lourdes"}),
    schedule:Object.freeze({type:"FIXED",month:2,day:11}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    sourceIds:Object.freeze(["SHR-LOURDES-FEAST"]),
  }),
  "observance.pontmain_apparition_anniversary":Object.freeze({
    key:"observance.pontmain_apparition_anniversary",
    title:Object.freeze({en:"Anniversary of the Pontmain Apparition",fr:"Anniversaire de l’apparition de Pontmain"}),
    schedule:Object.freeze({type:"FIXED",month:1,day:17}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-PONTMAIN-JAN17"]),
  }),
  "observance.miraculous_medal_nov27":Object.freeze({
    key:"observance.miraculous_medal_nov27",
    title:Object.freeze({en:"Our Lady of the Miraculous Medal",fr:"Notre-Dame de la Médaille Miraculeuse"}),
    schedule:Object.freeze({type:"FIXED",month:11,day:27}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["OBS-RUE-DU-BAC-NOV27"]),
  }),
  "observance.mariahilf_amberg_july2":Object.freeze({
    key:"observance.mariahilf_amberg_july2",
    title:Object.freeze({en:"Maria Hilf at Amberg",fr:"Notre-Dame du Secours à Amberg"}),
    schedule:Object.freeze({type:"FIXED",month:7,day:2}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-MARIAHILF-AMBERG-BERGFEST"]),
  }),
  "observance.nussdorf_leonhardiritt":Object.freeze({
    key:"observance.nussdorf_leonhardiritt",
    title:Object.freeze({en:"Nußdorf Leonhardiritt",fr:"Leonhardiritt de Nußdorf"}),
    schedule:Object.freeze({type:"FIXED",month:11,day:6}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:65,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-ST-LEONHARD-NUSSDORF"]),
  }),
  "feast.saint_apollinaris":Object.freeze({
    key:"feast.saint_apollinaris",
    title:Object.freeze({en:"Saint Apollinaris",fr:"Saint Apollinaire"}),
    schedule:Object.freeze({type:"FIXED",month:7,day:23}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:65,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-ST-APOLLINARIS-FRIELINGSDORF"]),
  }),
  "liturgical.pentecost_monday":Object.freeze({
    key:"liturgical.pentecost_monday",
    title:Object.freeze({en:"Pentecost Monday",fr:"Lundi de Pentecôte"}),
    schedule:Object.freeze({type:"EASTER_OFFSET",offset:50}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:70,
    sourceIds:Object.freeze(["SHR-LAGHET-DEANERY"]),
  }),
  "feast.sacred_heart":Object.freeze({
    key:"feast.sacred_heart",
    title:Object.freeze({en:"Sacred Heart of Jesus",fr:"Sacré-Cœur de Jésus"}),
    schedule:Object.freeze({type:"EASTER_OFFSET",offset:68}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:72,
    sourceIds:Object.freeze(["SHR-PARAY-SACRED-HEART"]),
  }),
  "feast.saint_anne":Object.freeze({
    key:"feast.saint_anne",
    title:Object.freeze({en:"Saint Anne",fr:"Sainte Anne"}),
    schedule:Object.freeze({type:"FIXED",month:7,day:26}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:70,
    sourceIds:Object.freeze(["PIL-SAINTE-ANNE-GRAND-PARDON"]),
  }),
  "observance.knock_apparition_anniversary":Object.freeze({
    key:"observance.knock_apparition_anniversary",
    title:Object.freeze({en:"Anniversary of the Knock Apparition",fr:"Anniversaire de l’apparition de Knock"}),
    schedule:Object.freeze({type:"FIXED",month:8,day:21}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-KNOCK-ANNIVERSARY"]),
  }),
  "feast.blessed_jacques_desire_laval":Object.freeze({
    key:"feast.blessed_jacques_desire_laval",
    title:Object.freeze({en:"Blessed Jacques-Désiré Laval",fr:"Bienheureux Jacques-Désiré Laval"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:9}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-PERE-LAVAL-ANNUAL"]),
  }),
  "feast.assumption_of_mary":Object.freeze({
    key:"feast.assumption_of_mary",
    title:Object.freeze({en:"Assumption of the Blessed Virgin Mary",fr:"Assomption de la Bienheureuse Vierge Marie"}),
    schedule:Object.freeze({type:"FIXED",month:8,day:15}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:74,
    sourceIds:Object.freeze(["SHR-ALTOETTING-CURRENT-PROGRAMME"]),
  }),
  "observance.einsiedeln_engelweihe":Object.freeze({
    key:"observance.einsiedeln_engelweihe",
    title:Object.freeze({en:"Engelweihe at Einsiedeln",fr:"Engelweihe d’Einsiedeln"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:14}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:67,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["SHR-EINSIEDELN-ENGELWEIHE"]),
  }),
  "observance.our_lady_of_champion":Object.freeze({
    key:"observance.our_lady_of_champion",
    title:Object.freeze({en:"Our Lady of Champion",fr:"Notre-Dame de Champion"}),
    schedule:Object.freeze({type:"FIXED",month:10,day:9}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:67,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-CHAMPION-SOLEMNITY"]),
  }),
  "feast.our_lady_of_guadalupe":Object.freeze({
    key:"feast.our_lady_of_guadalupe",
    title:Object.freeze({en:"Our Lady of Guadalupe",fr:"Notre-Dame de Guadalupe"}),
    schedule:Object.freeze({type:"FIXED",month:12,day:12}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:70,
    sourceIds:Object.freeze(["PIL-GUADALUPE-SOLEMNITY"]),
  }),
  "observance.loreto_our_lady":Object.freeze({
    key:"observance.loreto_our_lady",
    title:Object.freeze({en:"Our Lady of Loreto",fr:"Notre-Dame de Lorette"}),
    schedule:Object.freeze({type:"FIXED",month:12,day:10}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:67,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-LORETO-FEAST"]),
  }),
  "observance.pompeii_supplica_may_8":Object.freeze({
    key:"observance.pompeii_supplica_may_8",
    title:Object.freeze({en:"Supplica to Our Lady of Pompeii",fr:"Supplique à Notre-Dame de Pompéi"}),
    schedule:Object.freeze({type:"FIXED",month:5,day:8}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-POMPEI-SUPPLICA-MAY"]),
  }),
  "observance.jasna_gora_czestochowa":Object.freeze({
    key:"observance.jasna_gora_czestochowa",
    title:Object.freeze({en:"Our Lady of Częstochowa at Jasna Góra",fr:"Notre-Dame de Częstochowa à Jasna Góra"}),
    schedule:Object.freeze({type:"FIXED",month:8,day:26}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-JASNA-GORA-FEAST"]),
  }),
  "observance.walsingham_our_lady":Object.freeze({
    key:"observance.walsingham_our_lady",
    title:Object.freeze({en:"Our Lady of Walsingham",fr:"Notre-Dame de Walsingham"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:24}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-WALSINGHAM-FEAST"]),
  }),
  "observance.holywell_saint_winefride":Object.freeze({
    key:"observance.holywell_saint_winefride",
    title:Object.freeze({en:"Saint Winefride at Holywell",fr:"Sainte Winefride à Holywell"}),
    schedule:Object.freeze({type:"FIXED",month:11,day:3}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-HOLYWELL-FEAST"]),
  }),
  "feast.saint_peter_chanel":Object.freeze({
    key:"feast.saint_peter_chanel",
    title:Object.freeze({en:"Saint Peter Chanel",fr:"Saint Pierre Chanel"}),
    schedule:Object.freeze({type:"FIXED",month:4,day:28}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["SHR-ST-PETER-CHANEL-NZ"]),
  }),
  "feast.our_lady_perpetual_help":Object.freeze({
    key:"feast.our_lady_perpetual_help",
    title:Object.freeze({en:"Our Mother of Perpetual Help",fr:"Notre-Dame du Perpétuel Secours"}),
    schedule:Object.freeze({type:"FIXED",month:6,day:27}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:67,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["SHR-UGWOGO-NATIONAL-MARIAN"]),
  }),
  "feast.uganda_martyrs":Object.freeze({
    key:"feast.uganda_martyrs",
    title:Object.freeze({en:"Uganda Martyrs",fr:"Martyrs de l’Ouganda"}),
    schedule:Object.freeze({type:"FIXED",month:6,day:3}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:70,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-NAMUGONGO-MARTYRS-DAY","SHR-MUNYONYO-OFFICIAL"]),
  }),
  "observance.zapopan_romeria":Object.freeze({
    key:"observance.zapopan_romeria",
    title:Object.freeze({en:"Romería of Our Lady of Zapopan",fr:"Romería de Notre-Dame de Zapopan"}),
    schedule:Object.freeze({type:"FIXED",month:10,day:12}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:67,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-ZAPOPAN-ROMERIA"]),
  }),
  "observance.our_lady_aparecida":Object.freeze({
    key:"observance.our_lady_aparecida",
    title:Object.freeze({en:"Our Lady Aparecida",fr:"Notre-Dame d’Aparecida"}),
    schedule:Object.freeze({type:"FIXED",month:10,day:12}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:70,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-APARECIDA-FEAST"]),
  }),
  "observance.las_lajas":Object.freeze({
    key:"observance.las_lajas",
    title:Object.freeze({en:"Our Lady of Las Lajas",fr:"Notre-Dame de Las Lajas"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:15}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-LAS-LAJAS-HISTORY"]),
  }),
  "observance.chiquinquira_july9":Object.freeze({
    key:"observance.chiquinquira_july9",
    title:Object.freeze({en:"Our Lady of Chiquinquirá",fr:"Notre-Dame de Chiquinquirá"}),
    schedule:Object.freeze({type:"FIXED",month:7,day:9}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:68,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-CHIQUINQUIRA-JULY9"]),
  }),
  "observance.banneux_first_apparition":Object.freeze({
    key:"observance.banneux_first_apparition",
    title:Object.freeze({en:"First apparition at Banneux",fr:"Première apparition à Banneux"}),
    schedule:Object.freeze({type:"FIXED",month:1,day:15}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-BANNEUX-ANNIVERSARY"]),
  }),
  "feast.saint_wenceslas":Object.freeze({
    key:"feast.saint_wenceslas",
    title:Object.freeze({en:"Saint Wenceslas",fr:"Saint Venceslas"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:28}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:69,
    tags:Object.freeze(["LOCAL_LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-ST-WENCESLAS-NATIONAL"]),
  }),
  "observance.fatima_may13":Object.freeze({
    key:"observance.fatima_may13",
    title:Object.freeze({en:"First apparition at Fátima",fr:"Première apparition à Fátima"}),
    schedule:Object.freeze({type:"FIXED",month:5,day:13}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:70,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-FATIMA-MAY13"]),
  }),
  "observance.sameiro_june12":Object.freeze({
    key:"observance.sameiro_june12",
    title:Object.freeze({en:"Our Lady of Sameiro",fr:"Notre-Dame du Sameiro"}),
    schedule:Object.freeze({type:"FIXED",month:6,day:12}),
    route:"find",
    exploreLens:"pilgrimages",
    priority:66,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["PIL-SAMEIRO-PILGRIMAGES"]),
  }),
  "observance.gietrzwald_september8":Object.freeze({
    key:"observance.gietrzwald_september8",
    title:Object.freeze({en:"Our Lady of Gietrzwałd — local shrine observance",fr:"Notre-Dame de Gietrzwałd — fête locale du sanctuaire"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:8}),
    route:"find",exploreLens:"pilgrimages",priority:65,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["SHR-GIETRZWALD-ARCHDIOCESE"]),
  }),
  "observance.siluva_silines":Object.freeze({
    key:"observance.siluva_silines",
    title:Object.freeze({en:"Šilinės pilgrimage — Šiluva",fr:"Pèlerinage de Šilinės — Šiluva"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:8}),
    route:"find",exploreLens:"pilgrimages",priority:65,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["SHR-SILUVA-OFFICIAL"]),
  }),
  "observance.san_nicolas_september25":Object.freeze({
    key:"observance.san_nicolas_september25",
    title:Object.freeze({en:"Our Lady of the Rosary of San Nicolás — local pilgrimage",fr:"Notre-Dame du Rosaire de San Nicolás — pèlerinage local"}),
    schedule:Object.freeze({type:"FIXED",month:9,day:25}),
    route:"find",exploreLens:"pilgrimages",priority:65,
    tags:Object.freeze(["LOCAL_SHRINE_OBSERVANCE","EXPLORE_TEMPORAL_LINK"]),
    sourceIds:Object.freeze(["SHR-SAN-NICOLAS-EPC"]),
  }),

});

function semanticDateForDefinition(def,year){
  const y=Number(year),schedule=def?.schedule;
  if(!Number.isInteger(y)||y<1||!schedule)return null;
  if(schedule.type==="FIXED"){
    return `${y}-${String(schedule.month).padStart(2,"0")}-${String(schedule.day).padStart(2,"0")}`;
  }
  if(schedule.type==="EASTER_OFFSET"){
    return addDaysIso(v384Dates(y).easter,Number(schedule.offset));
  }
  return null;
}

export function calendarDateForSemanticKey(key,year){
  const def=CALENDAR_SEMANTIC_REGISTRY[String(key||"")];
  return def?semanticDateForDefinition(def,year):null;
}

export function calendarSemanticEvent(key,year,{fr=false}={}){
  const def=CALENDAR_SEMANTIC_REGISTRY[String(key||"")];
  if(!def)return null;
  const date=semanticDateForDefinition(def,year);
  if(!date)return null;
  return Object.freeze({
    id:def.key,
    key:def.key,
    date,
    kind:"semantic",
    title:fr?def.title.fr:def.title.en,
    summary:"",
    priority:def.priority,
    route:def.route,
    exploreLens:def.exploreLens,
    tags:Object.freeze([...(def.tags??["LITURGICAL_OBSERVANCE","EXPLORE_TEMPORAL_LINK"])]),
    sourceIds:def.sourceIds,
    source:"calendar-semantic-registry",
  });
}

export function calendarSemanticEventsForDate(value,{fr=false}={}){
  const date=keyOf(value),year=dateFromIso(date).getFullYear(),out=[];
  for(const def of Object.values(CALENDAR_SEMANTIC_REGISTRY)){
    if(semanticDateForDefinition(def,year)!==date)continue;
    out.push(calendarSemanticEvent(def.key,year,{fr}));
  }
  return Object.freeze(out.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id)));
}

export function calendarDisciplineForDate(value,{fr=false}={}){
  const date=keyOf(value),d=dateFromIso(date),x=v384Dates(d.getFullYear());
  const todayKey=date===x.ash||date===x.goodFriday?"fast-abstinence":d.getDay()===5?"friday":"none";
  const todayLabel=todayKey==="fast-abstinence"
    ?L(fr,"Today: universal fast and abstinence.","Aujourd’hui : jeûne et abstinence universels.")
    :todayKey==="friday"
      ?L(fr,"Today is Friday, a universal penitential day; the concrete observance is subject to the Code and the competent bishops’ conference.","Aujourd’hui est vendredi, jour universel de pénitence ; l’observance concrète relève du Code et de la conférence épiscopale compétente.")
      :L(fr,"No additional universal fast or abstinence is identified for this selected date.","Aucun jeûne ou abstinence universel supplémentaire n’est identifié pour cette date.");
  const current=Object.freeze({
    id:"current",label:L(fr,"Current law","Droit actuel"),
    items:Object.freeze([
      Object.freeze({id:"eucharistic-fast",title:L(fr,"Eucharistic fast","Jeûne eucharistique"),status:L(fr,"CURRENT","ACTUEL"),summary:L(fr,"At least one hour before Holy Communion from food and drink, except water and medicine.","Au moins une heure avant la Sainte Communion sans nourriture ni boisson, sauf eau et médicaments.")}),
      Object.freeze({id:"fridays-lent",title:L(fr,"Fridays & Lent","Vendredis & Carême"),status:L(fr,"CURRENT","ACTUEL"),summary:L(fr,"Every Friday and Lent are penitential times. Ash Wednesday and Good Friday carry universal fast and abstinence; episcopal conferences can determine the concrete observance permitted by canon law.","Chaque vendredi et le Carême sont des temps pénitentiels. Le Mercredi des Cendres et le Vendredi saint comportent le jeûne et l’abstinence universels ; les conférences épiscopales peuvent déterminer l’observance concrète permise par le droit canonique."),today:todayLabel}),
    ]),
    sources:Object.freeze([DISCIPLINE_SOURCES.canonFast,DISCIPLINE_SOURCES.canonPenance]),
  });
  const era1962=Object.freeze({
    id:"1962",label:L(fr,"1962-era discipline","Discipline de l’époque 1962"),
    items:Object.freeze([
      Object.freeze({id:"eucharistic-fast-1962",title:L(fr,"Eucharistic fast","Jeûne eucharistique"),status:"1962",summary:L(fr,"The Pius XII discipline in force for the 1962 period required three hours from solid food and alcoholic drink, one hour from non-alcoholic drink; water did not break the fast.","La discipline de Pie XII en vigueur à l’époque de 1962 exigeait trois heures pour les aliments solides et les boissons alcoolisées, une heure pour les boissons non alcoolisées ; l’eau ne rompait pas le jeûne.")}),
      Object.freeze({id:"ember-rogation",title:L(fr,"Ember & Rogation observance","Quatre-Temps & Rogations"),status:L(fr,"HISTORICAL DISCIPLINE","DISCIPLINE HISTORIQUE"),summary:L(fr,"The 1962 calendar retains Ember and Rogation liturgies. Older fasting obligations are not current universal law and may be kept only as voluntary traditional observance unless another present rule applies.","Le calendrier de 1962 conserve les liturgies des Quatre-Temps et des Rogations. Les anciennes obligations de jeûne ne sont pas le droit universel actuel et ne peuvent être gardées que comme observance traditionnelle volontaire, sauf autre règle actuelle applicable.")}),
      Object.freeze({id:"source-sensitive",title:L(fr,"Exact old fasting tables","Tableaux exacts des anciens jeûnes"),status:L(fr,"SOURCE-SENSITIVE","DÉPEND DES SOURCES"),summary:L(fr,"Rules varied by period and jurisdiction. Ad Orientem therefore does not present one generic “1962 fasting calendar” as universally binding; dated and jurisdiction-specific witnesses are required.","Les règles variaient selon l’époque et la juridiction. Ad Orientem ne présente donc pas un « calendrier de jeûne 1962 » générique comme universellement obligatoire ; des témoins datés et propres à la juridiction sont nécessaires.")}),
    ]),
    sources:Object.freeze([DISCIPLINE_SOURCES.fast1957,DISCIPLINE_SOURCES.popularPiety,DISCIPLINE_SOURCES.septemberEmber]),
  });
  const earlier=Object.freeze({
    id:"older",label:L(fr,"Earlier practice","Pratique antérieure"),
    items:Object.freeze([
      Object.freeze({id:"pre-pius-xii-fast",title:L(fr,"Before the Pius XII mitigations","Avant les mitigations de Pie XII"),status:L(fr,"OLDER PRACTICE","PRATIQUE ANTÉRIEURE"),summary:L(fr,"Eucharistic fasting discipline was substantially stricter. Pius XII’s 1953 constitution explicitly presented its concessions as relaxations made for changing circumstances while reaffirming the venerable tradition of receiving the Eucharist fasting.","La discipline du jeûne eucharistique était sensiblement plus stricte. La constitution de Pie XII de 1953 présente explicitement ses concessions comme des mitigations dues aux circonstances nouvelles, tout en réaffirmant la vénérable tradition de recevoir l’Eucharistie à jeun.")}),
      Object.freeze({id:"older-fasts",title:L(fr,"Vigils, Ember Days and other fasts","Vigiles, Quatre-Temps et autres jeûnes"),status:L(fr,"HISTORICAL","HISTORIQUE"),summary:L(fr,"Earlier Catholic discipline contained a broader network of fasts, abstinences and vigils. These are worth documenting and may inspire voluntary penance, but the app will not convert them into present obligations without an exact dated and jurisdictional source.","La discipline catholique antérieure comportait un réseau plus large de jeûnes, abstinences et vigiles. Ils méritent d’être documentés et peuvent inspirer une pénitence volontaire, mais l’application ne les transforme pas en obligations actuelles sans source exacte, datée et juridictionnelle.")}),
    ]),
    sources:Object.freeze([DISCIPLINE_SOURCES.fast1953]),
  });
  return Object.freeze({
    date,
    intro:L(fr,"Older Catholic discipline is preserved as historical knowledge and voluntary practice, while current obligations remain clearly separate.","L’ancienne discipline catholique est conservée comme connaissance historique et pratique volontaire, tandis que les obligations actuelles restent clairement séparées."),
    today:Object.freeze({key:todayKey,label:todayLabel}),
    eras:Object.freeze({current,1962:era1962,older:earlier}),
  });
}

export function isFirstWeekday(value,weekday){
  const id=keyOf(value),d=dateFromIso(id);
  return d.getDay()===Number(weekday)&&d.getDate()<=7;
}

export function novenaWindowFor(novena,year){
  const n=typeof novena==="string"?NOVENA_CORPUS_V4[novena]:novena;
  if(!n?.calendar)throw new Error("Unknown novena calendar definition");
  const y=Number(year),c=n.calendar;
  if(c.type==="EASTER_OFFSET"){
    const easter=v384Dates(y).easter;
    return Object.freeze({
      start:addDaysIso(easter,c.startOffset),
      end:addDaysIso(easter,c.endOffset),
      feast:addDaysIso(easter,c.feastOffset),
    });
  }
  if(c.type==="LAST_SUNDAY_RELATIVE"){
    const feast=v384Dates(y).christKing;
    return Object.freeze({
      start:addDaysIso(feast,Number(c.startOffset)),
      end:addDaysIso(feast,Number(c.endOffset)),
      feast:addDaysIso(feast,Number(c.feastOffset||0)),
    });
  }
  if(c.type==="NINE_TUESDAYS_BEFORE_FIXED_FEAST"){
    const feast=`${y}-${String(c.feastMonth).padStart(2,"0")}-${String(c.feastDay).padStart(2,"0")}`;
    const fd=dateFromIso(feast),daysBack=(fd.getDay()-2+7)%7;
    const lastTuesday=addDaysIso(feast,-daysBack);
    const occurrences=Object.freeze(Array.from({length:9},(_,i)=>addDaysIso(lastTuesday,-7*(8-i))));
    return Object.freeze({
      start:occurrences[0],end:occurrences[8],feast,occurrences,cadence:"WEEKLY_TUESDAY"
    });
  }
  if(c.type==="FIXED"){
    return Object.freeze({
      start:`${y}-${String(c.startMonth).padStart(2,"0")}-${String(c.startDay).padStart(2,"0")}`,
      end:`${y}-${String(c.endMonth).padStart(2,"0")}-${String(c.endDay).padStart(2,"0")}`,
      feast:`${y}-${String(c.feastMonth).padStart(2,"0")}-${String(c.feastDay).padStart(2,"0")}`,
    });
  }
  throw new Error(`Unsupported novena calendar type: ${c.type}`);
}

export function novenaStatusFor(novena,value,{fr=false}={}){
  const n=typeof novena==="string"?NOVENA_CORPUS_V4[novena]:novena;
  if(!n)return null;
  const id=keyOf(value),year=dateFromIso(id).getFullYear();
  let w=novenaWindowFor(n,year);
  if(id>w.feast&&diffDays(id,w.feast)>20)w=novenaWindowFor(n,year+1);

  if(Array.isArray(w.occurrences)){
    const exact=w.occurrences.indexOf(id);
    if(exact>=0){
      return Object.freeze({
        kind:"active",day:exact+1,window:w,next:id,startKind:novenaStartKind(n),
        label:L(fr,`Tuesday ${exact+1} of 9 · feast ${formatDisplayDate(w.feast)}`,`Mardi ${exact+1} sur 9 · fête le ${formatDisplayDate(w.feast)}`)
      });
    }
    const nextIndex=w.occurrences.findIndex(x=>x>id);
    if(nextIndex>=0){
      const next=w.occurrences[nextIndex],until=diffDays(next,id);
      if(until>=0&&until<=90){
        return Object.freeze({
          kind:"upcoming",day:nextIndex+1,window:w,next,startKind:novenaStartKind(n),
          label:L(fr,`Next: Tuesday ${nextIndex+1} of 9 · ${formatDisplayDate(next)}`,`Prochain : mardi ${nextIndex+1} sur 9 · ${formatDisplayDate(next)}`)
        });
      }
    }
    return Object.freeze({
      kind:"ordinary",day:9,window:w,next:null,startKind:novenaStartKind(n),
      label:L(fr,`${novenaStartPrefix(n,false)} · nine Tuesdays · feast ${formatDisplayDate(w.feast)}`,`${novenaStartPrefix(n,true)} · neuf mardis · fête le ${formatDisplayDate(w.feast)}`)
    });
  }

  const delta=diffDays(id,w.start);
  if(delta>=0&&delta<=8){
    return Object.freeze({
      kind:"active",day:delta+1,window:w,next:id,startKind:novenaStartKind(n),
      label:L(fr,`Day ${delta+1} of 9 · feast ${formatDisplayDate(w.feast)}`,`Jour ${delta+1} sur 9 · fête le ${formatDisplayDate(w.feast)}`)
    });
  }
  const until=diffDays(w.start,id);
  if(until>=0&&until<=90){
    return Object.freeze({
      kind:"upcoming",day:1,window:w,next:w.start,startKind:novenaStartKind(n),
      label:L(fr,`${novenaStartPrefix(n,false)} ${formatDisplayDate(w.start)} · ${until} day${until===1?"":"s"} away`,`${novenaStartPrefix(n,true)} le ${formatDisplayDate(w.start)} · dans ${until} jour${until===1?"":"s"}`)
    });
  }
  return Object.freeze({
    kind:"ordinary",day:1,window:w,next:null,startKind:novenaStartKind(n),
    label:L(fr,`${novenaStartPrefix(n,false)} ${formatDisplayDate(w.start)} · feast ${formatDisplayDate(w.feast)}`,`${novenaStartPrefix(n,true)} le ${formatDisplayDate(w.start)} · fête le ${formatDisplayDate(w.feast)}`)
  });
}

const legacyV384Tags=key=>{
  if(["ash","good-friday"].includes(key))return ["LITURGICAL_OBSERVANCE","CURRENT_UNIVERSAL_DISCIPLINE"];
  if(String(key).startsWith("ember"))return ["LITURGICAL_OBSERVANCE","1962_ERA_HISTORICAL_DISCIPLINE"];
  if(["candlemas","septuagesima","palm","holy-thursday","holy-saturday","rogation"].includes(key))return ["LITURGICAL_OBSERVANCE","TRADITIONAL_DEVOTIONAL_PRACTICE"];
  return ["TRADITIONAL_DEVOTIONAL_PRACTICE"];
};

const titleFor=(def,fr)=>fr?def?.title?.fr:def?.title?.en;
const summaryFor=(def,fr)=>fr?def?.summary?.fr:def?.summary?.en;
const eventIdForKey=key=>key==="first-friday"?"programme.first_friday":key==="first-saturday"?"programme.first_saturday":key==="saturday"?"practice.saturday-marian":`practice.${key}`;
const traditionalDateOwnerKeys=new Set(["corpus","october","holy-souls","christ-king"]);

function scheduleMatches(def,date){
  const c=def?.schedule,d=dateFromIso(date),y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate(),dow=d.getDay();
  if(!c)return false;
  if(c.type==="FIRST_WEEKDAY")return dow===Number(c.weekday)&&day<=7;
  if(c.type==="WEEKDAY")return dow===Number(c.weekday);
  if(c.type==="MONTH")return m===Number(c.month);
  if(c.type==="FIXED")return m===Number(c.month)&&day===Number(c.day);
  if(c.type==="FIXED_RANGE"){
    const mmdd=m*100+day,start=Number(c.startMonth)*100+Number(c.startDay),end=Number(c.endMonth)*100+Number(c.endDay);
    return mmdd>=start&&mmdd<=end;
  }
  if(c.type==="EASTER_OFFSET")return date===addDaysIso(v384Dates(y).easter,Number(c.offset));
  if(c.type==="LAST_SUNDAY")return Number(c.month)===10&&date===v384Dates(y).christKing;
  if(c.type==="LENT_WEEKDAY"){
    const x=v384Dates(y);
    return dow===Number(c.weekday)&&date>=x.ash&&date<x.easter;
  }
  return false;
}

function registryEvent(def,date,{fr=false}={}){
  const key=def.key,id=eventIdForKey(key),programme=key==="first-friday"||key==="first-saturday";
  return Object.freeze({
    id,date,key,kind:programme?"programme":"practice",priority:Number(def.priority)||40,
    title:titleFor(def,fr)||key,summary:summaryFor(def,fr)||"",
    route:def.route||"today.calendar",
    tags:Object.freeze([...(def.tags??[])]),
    classification:def.classification??null,
    sources:Object.freeze([...(def.sources??[])]),
    source:"calendar-devotional-registry",
  });
}

function normalizeTraditionalEvent(event,date,{fr=false}={}){
  const action=Array.isArray(event?.actions)?event.actions.find(x=>Array.isArray(x)&&x[0]):null;
  const def=devotionalPracticeDefinition(event.key);
  return Object.freeze({
    id:`practice.${event.key}`,date,key:event.key,kind:"practice",
    title:event.title,summary:event.summary,current:event.current,historical:event.historical,
    priority:Number(event.priority)||Number(def?.priority)||40,route:def?.route??action?.[0]??"today.calendar",
    actions:Object.freeze([...(event.actions??[])]),
    tags:Object.freeze([...(def?.tags??legacyV384Tags(event.key))]),
    classification:def?.classification??null,
    sources:Object.freeze([...(def?.sources??[])]),
    source:def?"traditional-year-v384+calendar-devotional-registry":"traditional-year-v384",
  });
}

function recurringEvents(date,{fr=false}={}){
  const d=dateFromIso(date),out=[];
  if(d.getDay()===0)out.push(Object.freeze({
    id:"programme.sunday-mass",date,key:"sunday-mass",kind:"obligation",priority:100,
    title:L(fr,"Sunday Mass","Messe dominicale"),summary:L(fr,"Sunday obligation","Obligation dominicale"),
    route:"mass.current",tags:Object.freeze(["LITURGICAL_OBSERVANCE","CURRENT_UNIVERSAL_OBLIGATION"]),
    classification:Object.freeze({observance1962:true,historicalDiscipline:false,currentObligation:"CURRENT_UNIVERSAL_OBLIGATION",traditionalDevotion:false,currentIndulgencedWork:false,localProminence:"NONE_BY_DEFAULT"}),
    sources:Object.freeze([]),source:"calendar-intelligence",
  }));
  for(const def of Object.values(DEVOTIONAL_PRACTICE_REGISTRY)){
    if(traditionalDateOwnerKeys.has(def.key)||!scheduleMatches(def,date))continue;
    out.push(registryEvent(def,date,{fr}));
  }
  return out;
}

export function calendarPracticeEvents(value,{fr=false,properTitle=""}={}){
  const date=keyOf(value);
  const traditional=v384Events(date,{fr,properTitle}).map(event=>normalizeTraditionalEvent(event,date,{fr}));
  const recurring=recurringEvents(date,{fr});
  const byId=new Map();
  for(const event of [...traditional,...recurring]){
    const existing=byId.get(event.id);
    if(!existing||event.priority>existing.priority)byId.set(event.id,event);
  }
  return Object.freeze([...byId.values()].sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id)));
}

export function calendarPracticeMonthEntries(monthId,{fr=false}={}){
  const m=/^(\d{4})-(\d{2})$/.exec(String(monthId||""));
  if(!m)return Object.freeze([]);
  const year=Number(m[1]),month=Number(m[2]);
  if(month<1||month>12)return Object.freeze([]);
  const last=new Date(year,month,0,12).getDate(),byId=new Map();
  for(let day=1;day<=last;day+=1){
    const date=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const events=[
      ...calendarPracticeEvents(date,{fr}),
      ...calendarNovenaEvents(date,{fr,upcomingDays:0}).filter(x=>x.status?.kind==="active"&&x.status?.day===1),
    ];
    for(const event of events){
      if(["friday","saturday"].includes(event.key))continue;
      if(event.kind!=="novena"&&event.priority<55&&!event.tags?.includes("CURRENT_INDULGED_WORK_CONDITIONAL")&&!["october","sacred-heart-month","precious-blood-month"].includes(event.key))continue;
      if(!byId.has(event.id))byId.set(event.id,Object.freeze({
        id:event.id,date,eventKind:event.kind,title:event.title,summary:event.summary,route:event.route,
        priority:event.priority,tags:event.tags,classification:event.classification??null,source:event.source,
      }));
    }
  }
  return Object.freeze([...byId.values()].sort((a,b)=>a.date.localeCompare(b.date)||b.priority-a.priority||a.title.localeCompare(b.title)));
}

export function novenaTargetRegistryStatus(){
  return Object.freeze({
    registryVersion:CALENDAR_DEVOTIONAL_REGISTRY_VERSION,
    targetCount:NOVENA_TARGET_IDS.length,
    playableCount:Object.keys(NOVENA_CORPUS_V4).length,
    heldCount:Object.keys(NOVENA_SOURCE_HOLDS).length,
    targetIds:NOVENA_TARGET_IDS,
    heldIds:Object.freeze(Object.keys(NOVENA_SOURCE_HOLDS)),
  });
}

export function calendarNovenaEvents(value,{fr=false,upcomingDays=0}={}){
  const date=keyOf(value),rows=[];
  for(const novena of Object.values(NOVENA_CORPUS_V4)){
    const status=novenaStatusFor(novena,date,{fr});
    if(!status)continue;
    const startsIn=diffDays(status.next||status.window.start,date);
    if(status.kind!=="active"&&!(upcomingDays>0&&status.kind==="upcoming"&&startsIn>=0&&startsIn<=upcomingDays))continue;
    rows.push(Object.freeze({
      id:`novena.${novena.id}`,date,key:novena.id,kind:"novena",
      title:(fr?novena.title?.fr:novena.title?.en)||novena.title?.en||novena.title?.fr||novena.id,
      summary:status.label,priority:status.kind==="active"?72:58,route:"pray.novenas",
      tags:Object.freeze(["TRADITIONAL_DEVOTIONAL_PRACTICE","NOVENA"]),
      novenaId:novena.id,status,source:"novena-corpus-v4",
    }));
  }
  return Object.freeze(rows.sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title)));
}

export function calendarIntelligenceForDate(value,{fr=false,properTitle="",includeUpcomingNovenas=0}={}){
  const date=keyOf(value);
  const practices=calendarPracticeEvents(date,{fr,properTitle});
  const novenas=calendarNovenaEvents(date,{fr,upcomingDays:includeUpcomingNovenas});
  const semantic=calendarSemanticEventsForDate(date,{fr});
  const discipline=calendarDisciplineForDate(date,{fr});
  return Object.freeze({
    schema:CALENDAR_INTELLIGENCE_VERSION,registryVersion:CALENDAR_DEVOTIONAL_REGISTRY_VERSION,
    semanticRegistryVersion:CALENDAR_SEMANTIC_REGISTRY_VERSION,date,
    practices,novenas,semantic,discipline,
    events:Object.freeze([...practices,...novenas,...semantic].sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id))),
  });
}

export function nextCalendarIntelligence(value,{fr=false,days=14}={}){
  const start=keyOf(value);
  for(let i=0;i<=Number(days||0);i+=1){
    const date=addDaysIso(start,i),events=calendarIntelligenceForDate(date,{fr,includeUpcomingNovenas:0}).events;
    const meaningful=events.filter(x=>!["friday","saturday"].includes(x.key));
    if(meaningful.length)return Object.freeze({date,days:i,event:meaningful[0],events:meaningful});
  }
  return null;
}
