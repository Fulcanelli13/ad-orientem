/**
 * Primary source access/edition metadata for the existing 16 Novenas.
 * Do not mislabel a modern devotional reproduction as an original printed
 * witness, or a digitized unproofread page as textually certified.
 */
export const NOVENA_SOURCE_ACCESS_V1=Object.freeze({
 holy_ghost:Object.freeze({
  heading:{en:"NOVENA FOR PENTECOST — distinct section within the Christmas-titled volume page",fr:"NOVENA FOR PENTECOST — section distincte sur la page intitulée Novena For Christmas"},
  note:{en:"The 1925 book prints all nine Pentecost days later on this shared transcription page. Its Christmas page heading does not identify the Pentecost text; find the separate NOVENA FOR PENTECOST heading.",fr:"Le livre de 1925 imprime les neuf jours de la Pentecôte plus bas sur cette page commune. Cherchez le titre distinct NOVENA FOR PENTECOST."}
 }),
 christmas:Object.freeze({
  heading:{en:"NOVENA FOR CHRISTMAS (16–24 December)",fr:"NOVENA FOR CHRISTMAS (du 16 au 24 décembre)"},
  note:{en:"Nine dated Christmas prayers are printed at the start of the linked page; Pentecost is a later independent section.",fr:"Les neuf prières datées de Noël figurent au début de la page ; la Pentecôte constitue une section ultérieure distincte."}
 }),
 annunciation:Object.freeze({
  heading:{en:"Hammer, Section III · Annunciation",fr:"Hammer, section III · Annonciation"},
  note:{en:"This source is a complete public-domain Marian novena book. Section III contains the nine Annunciation days. A nominal 25 March feast is not evidence that the 1962 feast is observed on that date in every year.",fr:"Cette source est un recueil complet de neuvaines mariales. La section III contient les neuf jours de l’Annonciation. Le 25 mars nominal ne prouve pas que la fête de 1962 tombe à cette date chaque année."}
 }),
 seven_sorrows:Object.freeze({
  heading:{en:"Hammer, Section IV · Seven Sorrows",fr:"Hammer, section IV · Sept Douleurs"},
  note:{en:"The nine meditations are in Section IV of the full book. Their historical devotional headings are not instructions to invent additional prayers.",fr:"Les neuf méditations figurent dans la section IV du livre. Leurs titres historiques n’autorisent pas l’ajout de prières inventées."}
 }),
 assumption:Object.freeze({
  heading:{en:"Hammer, Section V · Assumption",fr:"Hammer, section V · Assomption"},
  note:{en:"The nine historical Assumption meditations occur in Section V of the full book.",fr:"Les neuf méditations historiques de l’Assomption figurent dans la section V du livre."}
 }),
 perpetual_help:Object.freeze({
  heading:{en:"With God, scan page 699 · unproofread transcription",fr:"With God, page numérisée 699 · transcription non relue"},
  note:{en:"Wikisource explicitly marks the cited scan transcription as not proofread. It is a source witness, not a certified verbatim edition.",fr:"Wikisource indique explicitement que cette transcription n’a pas été relue. Il s’agit d’un témoin, non d’une édition vérifiée mot à mot."}
 }),
 st_therese:Object.freeze({
  heading:{en:"EWTN · reproduction of the 24 Glory Bes devotion",fr:"EWTN · reproduction de la dévotion des 24 Gloire au Père"},
  note:{en:"This is a contemporary devotional reproduction, not the original 1925 printed text. The historically recommended 9th–17th of each month is separate from the optional preparation for the 1962 feast.",fr:"Il s’agit d’une reproduction dévotionnelle contemporaine, non de l’imprimé original de 1925. La recommandation des 9 au 17 de chaque mois est distincte de la préparation facultative à la fête de 1962."}
 }),
 st_anthony_nine_tuesdays:Object.freeze({
  heading:{en:"O’Donoghue OFM, 1966 · Nine Tuesdays",fr:"O’Donoghue OFM, 1966 · Neuf mardis"},
  note:{en:"The Franciscan source proposes—not mandates—two prayers, one Our Father, Hail Mary and Glory Be, followed by Si quaeris. Nine Tuesdays is weekly, not nine consecutive calendar days. Historical indulgence notices require independent current-law verification.",fr:"La source franciscaine propose — sans les imposer — deux prières, puis un Notre Père, un Je vous salue Marie, un Gloire au Père et le Si quaeris. Les neuf mardis sont hebdomadaires ; les anciennes indications d’indulgences ne sont pas une preuve du droit actuel."}
 }),
});
export function novenaSourceAccess(id){return NOVENA_SOURCE_ACCESS_V1[String(id||"")]||null;}
