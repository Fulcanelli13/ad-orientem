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
  note:{en:"Hammer's 1909 Section III includes a full historical MEDITATION and PRACTICE for each of the nine Annunciation days. Those original prose sections are not yet reproduced here; the short day guide is editorial. Open the cited book to read them. The 25 March feast can be transferred.",fr:"La section III du livre de Hammer (1909) contient pour chacun des neuf jours une MÉDITATION et une PRATIQUE complètes. Ces textes historiques ne sont pas encore reproduits ici ; le guide bref est rédactionnel. Consultez le livre cité. La fête du 25 mars peut être transférée."}
 }),
 seven_sorrows:Object.freeze({
  heading:{en:"Hammer, Section IV · Seven Sorrows",fr:"Hammer, section IV · Sept Douleurs"},
  note:{en:"Hammer's 1909 Section IV includes full historical MEDITATION and PRACTICE passages for each of nine Seven Sorrows days. The short day guide is editorial and does not replace those sections; read them in the cited book.",fr:"La section IV du livre de Hammer (1909) contient pour chacun des neuf jours une MÉDITATION et une PRATIQUE complètes. Le guide bref est rédactionnel et ne les remplace pas ; consultez le livre cité."}
 }),
 assumption:Object.freeze({
  heading:{en:"Hammer, Section V · Assumption",fr:"Hammer, section V · Assomption"},
  note:{en:"Hammer's 1909 Section V includes full historical MEDITATION and PRACTICE sections for the nine Assumption days. The short editorial day guide does not reproduce them; consult the cited book. Historical devotional meditation must not be mistaken for a definition of dogma.",fr:"La section V du livre de Hammer (1909) contient neuf MÉDITATIONS et PRATIQUES historiques. Le bref guide rédactionnel ne les reproduit pas ; consultez le livre cité. Ces méditations ne doivent pas être confondues avec des définitions dogmatiques."}
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
