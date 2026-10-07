import { NOVENA_CORPUS_V4 } from "../pray/novena-corpus-v4.js";

export const CALENDAR_DEVOTIONAL_REGISTRY_VERSION="calendar-devotional-registry-v2-bilingual-novena-freeze";

const F=x=>Object.freeze(x);
const A=x=>Object.freeze([...x]);

export const DEVOTIONAL_SOURCE_REGISTRY=F({
  enchiridion:F({
    id:"enchiridion",
    label:"Enchiridion Indulgentiarum · 4th ed.",
    url:"https://www.vatican.va/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html",
    authority:"CURRENT_ROMAN_INDULGENCE_LAW"
  }),
  penitentiaryNovember:F({
    id:"penitentiary-november",
    label:"Apostolic Penitentiary · November indulgence decree (2020 witness to ordinary grant)",
    url:"https://press.vatican.va/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_pro_20201022_decreto-indulgenze_en.html",
    authority:"CURRENT_GRANT_WITNESS"
  }),
  piusXIChristKing:F({
    id:"pius-xi-christ-king",
    label:"Pius XI · Quas Primas (1925)",
    url:"https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_11121925_quas-primas.html",
    authority:"PRE_CONCILIAR_ROMAN"
  }),
  piusXIISacredHeart:F({
    id:"pius-xii-sacred-heart",
    label:"Pius XII · Haurietis Aquas (1956)",
    url:"https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_15051956_haurietis-aquas.html",
    authority:"PRE_CONCILIAR_ROMAN"
  }),
  traditionalResearch:F({
    id:"traditional-research",
    label:"Ad Orientem pre-conciliar / French-world research ledger",
    url:"",
    authority:"RESEARCH_LEDGER"
  })
});

const C=(observance1962,historicalDiscipline,currentObligation,traditionalDevotion,currentIndulgencedWork,localProminence)=>F({
  observance1962,
  historicalDiscipline,
  currentObligation,
  traditionalDevotion,
  currentIndulgencedWork,
  localProminence
});

export const DEVOTIONAL_PRACTICE_REGISTRY=F({
  "first-friday":F({
    key:"first-friday",
    title:F({en:"First Friday",fr:"Premier vendredi"}),
    summary:F({en:"Sacred Heart reparatory programme",fr:"Programme réparateur du Sacré-Cœur"}),
    schedule:F({type:"FIRST_WEEKDAY",weekday:5}),
    route:"programme.first_friday",
    priority:76,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE","DEVOTIONAL_PROGRAMME"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "first-saturday":F({
    key:"first-saturday",
    title:F({en:"First Saturday",fr:"Premier samedi"}),
    summary:F({en:"Immaculate Heart reparatory programme",fr:"Programme réparateur du Cœur Immaculé"}),
    schedule:F({type:"FIRST_WEEKDAY",weekday:6}),
    route:"programme.first_saturday",
    priority:76,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE","DEVOTIONAL_PROGRAMME"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "friday":F({
    key:"friday",
    title:F({en:"Friday penance",fr:"Pénitence du vendredi"}),
    summary:F({en:"Universal penitential day · local form may vary",fr:"Jour pénitentiel universel · la forme locale peut varier"}),
    schedule:F({type:"WEEKDAY",weekday:5}),
    route:"pray.penitential_psalms",
    priority:50,
    classification:C(false,false,"CURRENT_PENITENTIAL_DAY",false,false,"JURISDICTION_DEPENDENT_FORM"),
    tags:A(["CURRENT_PENITENTIAL_DAY"]),
    sources:A([])
  }),
  "saturday":F({
    key:"saturday",
    title:F({en:"Saturday of Our Lady",fr:"Samedi de Notre-Dame"}),
    summary:F({en:"Traditional Marian devotion",fr:"Dévotion mariale traditionnelle"}),
    schedule:F({type:"WEEKDAY",weekday:6}),
    route:"pray.library",
    priority:50,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "lenten-friday":F({
    key:"lenten-friday",
    title:F({en:"Friday of Lent",fr:"Vendredi de Carême"}),
    summary:F({en:"Traditional Friday devotion · En ego after Communion carries a current conditional plenary grant",fr:"Dévotion traditionnelle du vendredi · l’En ego après la Communion comporte une concession plénière actuelle sous conditions"}),
    schedule:F({type:"LENT_WEEKDAY",weekday:5}),
    route:"pray.communion_treasury",
    priority:68,
    classification:C(false,false,"CURRENT_PENITENTIAL_DAY",true,"CONDITIONAL_USUAL_CONDITIONS","NONE_BY_DEFAULT"),
    tags:A(["CURRENT_PENITENTIAL_DAY","TRADITIONAL_DEVOTIONAL_PRACTICE","CURRENT_INDULGED_WORK_CONDITIONAL"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.enchiridion])
  }),
  "pentecost-veni-creator":F({
    key:"pentecost-veni-creator",
    title:F({en:"Veni Creator at Pentecost",fr:"Veni Creator à la Pentecôte"}),
    summary:F({en:"Solemn Veni Creator · current plenary grant is conditional on the prescribed work and usual conditions",fr:"Veni Creator solennel · la concession plénière actuelle dépend de l’œuvre prescrite et des conditions habituelles"}),
    schedule:F({type:"EASTER_OFFSET",offset:49}),
    route:"pray.sacred_hymns",
    priority:82,
    classification:C(true,false,false,true,"CONDITIONAL_USUAL_CONDITIONS","NONE_BY_DEFAULT"),
    tags:A(["LITURGICAL_OBSERVANCE","TRADITIONAL_DEVOTIONAL_PRACTICE","CURRENT_INDULGED_WORK_CONDITIONAL"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.enchiridion])
  }),
  "sacred-heart-month":F({
    key:"sacred-heart-month",
    title:F({en:"Month of the Sacred Heart",fr:"Mois du Sacré-Cœur"}),
    summary:F({en:"Traditional June devotion to the Sacred Heart",fr:"Dévotion traditionnelle de juin au Sacré-Cœur"}),
    schedule:F({type:"MONTH",month:6}),
    route:"pray.sacred_heart",
    priority:42,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.piusXIISacredHeart,DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "precious-blood-month":F({
    key:"precious-blood-month",
    title:F({en:"Month of the Precious Blood",fr:"Mois du Précieux Sang"}),
    summary:F({en:"Traditional July devotion; presented as devotional custom, not obligation",fr:"Dévotion traditionnelle de juillet ; présentée comme coutume dévotionnelle et non comme obligation"}),
    schedule:F({type:"MONTH",month:7}),
    route:"today.calendar",
    priority:40,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "portiuncula":F({
    key:"portiuncula",
    title:F({en:"Portiuncula indulgence",fr:"Indulgence de la Portioncule"}),
    summary:F({en:"2 August parish-church/oratory grant · prescribed visit and prayers; usual conditions apply",fr:"Concession du 2 août pour l’église paroissiale/oratoire · visite et prières prescrites ; conditions habituelles"}),
    schedule:F({type:"FIXED",month:8,day:2}),
    route:"today.calendar",
    priority:72,
    classification:C(false,false,false,true,"CONDITIONAL_USUAL_CONDITIONS","NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE","CURRENT_INDULGED_WORK_CONDITIONAL"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.enchiridion])
  }),
  "st-michael":F({
    key:"st-michael",
    title:F({en:"St Michael",fr:"Saint Michel"}),
    summary:F({en:"Traditional devotion associated with the feast of St Michael",fr:"Dévotion traditionnelle associée à la fête de saint Michel"}),
    schedule:F({type:"FIXED",month:9,day:29}),
    route:"today.calendar",
    priority:62,
    classification:C(true,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["LITURGICAL_OBSERVANCE","TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "october":F({
    key:"october",
    title:F({en:"Month of the Holy Rosary",fr:"Mois du Saint Rosaire"}),
    summary:F({en:"Give the Rosary a privileged place this month",fr:"Donner une place privilégiée au Rosaire ce mois-ci"}),
    schedule:F({type:"MONTH",month:10}),
    route:"pray.rosary",
    priority:30,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "christ-king":F({
    key:"christ-king",
    title:F({en:"Kingship of Christ",fr:"Royauté du Christ"}),
    summary:F({en:"1962 feast on the last Sunday of October · no current indulgence is inferred from the historical date",fr:"Fête de 1962 le dernier dimanche d’octobre · aucune indulgence actuelle n’est déduite de la date historique"}),
    schedule:F({type:"LAST_SUNDAY",month:10}),
    route:"pray.sacred_heart",
    priority:80,
    classification:C(true,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["LITURGICAL_OBSERVANCE","TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.piusXIChristKing])
  }),
  "holy-souls":F({
    key:"holy-souls",
    title:F({en:"Pray for the faithful departed",fr:"Prier pour les fidèles défunts"}),
    summary:F({en:"1–8 November cemetery prayer · current indulgence is conditional on the prescribed work and usual conditions",fr:"1er–8 novembre : prière au cimetière · l’indulgence actuelle dépend de l’œuvre prescrite et des conditions habituelles"}),
    schedule:F({type:"FIXED_RANGE",startMonth:11,startDay:1,endMonth:11,endDay:8}),
    route:"pray.de_profundis",
    priority:55,
    classification:C(false,false,false,true,"CONDITIONAL_USUAL_CONDITIONS","NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE","CURRENT_INDULGED_WORK_CONDITIONAL"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.enchiridion,DEVOTIONAL_SOURCE_REGISTRY.penitentiaryNovember])
  }),
  "immaculate-conception-novena-start":F({
    key:"immaculate-conception-novena-start",
    title:F({en:"Immaculate Conception novena begins",fr:"Début de la neuvaine de l’Immaculée Conception"}),
    summary:F({en:"Traditional source-locked novena start",fr:"Début traditionnel de la neuvaine sourcée"}),
    schedule:F({type:"FIXED",month:11,day:29}),
    route:"pray.novenas",
    priority:70,
    classification:C(false,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE","NOVENA_START"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "o-antiphons":F({
    key:"o-antiphons",
    title:F({en:"O Antiphons",fr:"Grandes antiennes « O »"}),
    summary:F({en:"17–23 December · traditional late-Advent liturgical and devotional context",fr:"17–23 décembre · contexte liturgique et dévotionnel traditionnel de la fin de l’Avent"}),
    schedule:F({type:"FIXED_RANGE",startMonth:12,startDay:17,endMonth:12,endDay:23}),
    route:"today.calendar",
    priority:64,
    classification:C(true,false,false,true,false,"NONE_BY_DEFAULT"),
    tags:A(["LITURGICAL_OBSERVANCE","TRADITIONAL_DEVOTIONAL_PRACTICE"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.traditionalResearch])
  }),
  "te-deum-year-end":F({
    key:"te-deum-year-end",
    title:F({en:"Te Deum for the year’s end",fr:"Te Deum de fin d’année"}),
    summary:F({en:"31 December thanksgiving · current plenary grant is conditional on the prescribed public recitation and usual conditions",fr:"31 décembre : action de grâce · la concession plénière actuelle dépend de la récitation publique prescrite et des conditions habituelles"}),
    schedule:F({type:"FIXED",month:12,day:31}),
    route:"pray.sacred_hymns",
    priority:78,
    classification:C(false,false,false,true,"CONDITIONAL_USUAL_CONDITIONS","NONE_BY_DEFAULT"),
    tags:A(["TRADITIONAL_DEVOTIONAL_PRACTICE","CURRENT_INDULGED_WORK_CONDITIONAL"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.enchiridion])
  }),
  "corpus":F({
    key:"corpus",
    title:F({en:"Corpus Christi",fr:"Fête-Dieu"}),
    summary:F({en:"Mass, Eucharistic procession and prayer; current plenary grant is tied to devout participation in the solemn Eucharistic procession",fr:"Messe, procession eucharistique et prière ; la concession plénière actuelle est liée à la participation pieuse à la procession eucharistique solennelle"}),
    schedule:F({type:"EASTER_OFFSET",offset:60}),
    route:"pray.benediction",
    priority:95,
    classification:C(true,false,false,true,"CONDITIONAL_PRESCRIBED_PROCESSION_AND_USUAL_CONDITIONS","NONE_BY_DEFAULT"),
    tags:A(["LITURGICAL_OBSERVANCE","TRADITIONAL_DEVOTIONAL_PRACTICE","CURRENT_INDULGED_WORK_CONDITIONAL"]),
    sources:A([DEVOTIONAL_SOURCE_REGISTRY.enchiridion])
  })
});

export const PLAYABLE_NOVENA_IDS=A(Object.keys(NOVENA_CORPUS_V4));

export const NOVENA_SOURCE_HOLDS=F({});

export const NOVENA_TARGET_REGISTRY_V1=F(Object.fromEntries(
  Object.entries(NOVENA_CORPUS_V4).map(([id,n])=>[id,F({
    id,
    title:n.title,
    family:n.family,
    availability:"PLAYABLE_BILINGUAL_SOURCE_LOCKED",
    playable:true,
    calendar:n.calendar,
    traditionalStart:n.traditionalStart,
    sourceStatus:n.source?.status??"SOURCE_LOCKED",
    frenchTextStatus:n.frenchTextStatus??"MISSING_FRENCH_BODY"
  })])
));

export const NOVENA_TARGET_IDS=A(Object.keys(NOVENA_TARGET_REGISTRY_V1));

export function devotionalPracticeDefinition(key){
  return DEVOTIONAL_PRACTICE_REGISTRY[String(key||"")]??null;
}

export function novenaTargetDefinition(id){
  return NOVENA_TARGET_REGISTRY_V1[String(id||"")]??null;
}
