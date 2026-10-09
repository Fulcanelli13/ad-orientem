/**
 * Primary source access/edition metadata for the existing 16 Novenas.
 * Do not mislabel a modern devotional reproduction as an original printed
 * witness, or a digitized unproofread page as textually certified.
 */
export const NOVENA_SOURCE_ACCESS_V1=Object.freeze({
 holy_souls:Object.freeze({
  heading:{en:"Holy Souls · nine online daily sections (modern transcription)",fr:"Âmes du purgatoire · neuf pages quotidiennes (transcription moderne)"},
  note:{en:"The source is a modern digital prayer-book reproduction, not a collated photograph of the original edition. Days 1–9 follow linked pages prayer108–prayer116. After every daily prayer and the Our Father/Hail Mary, the historical witness prints a four-line verse beginning On Thy spouses, followed by the repeated intercessions. The French verse is an editorial translation.",fr:"La source est une reproduction numérique moderne, non une collation d'un imprimé d'époque. Les neuf jours figurent sur les pages liées prayer108 à prayer116. Après chaque prière du jour, le Notre Père et le Je vous salue Marie, le témoin donne le quatrain commençant par On Thy spouses, puis les intercessions communes. La traduction française du quatrain est rédactionnelle."}
 }),
 immaculate_conception:Object.freeze({
  heading:{en:"Moran, 1883 · Litany OR Tota pulchra",fr:"Moran, 1883 · Litanies OU Tota pulchra"},
  note:{en:"The original directs the Litany of the Blessed Virgin OR the Tota pulchra hymn after each day's proper prayer. This reader renders the existing canonical Litany of Loreto; the alternative hymn, followed by historical collects including one naming Pope Leo, is available in the linked 1883 source and is not represented as current papal prayer.",fr:"L'édition de 1883 prescrit les Litanies de la Sainte Vierge OU l'hymne Tota pulchra après la prière propre. Le lecteur présente les Litanies de Lorette déjà disponibles ; l'hymne alternatif et les oraisons historiques, dont l'une nomme Léon, figurent dans la source de 1883, sans être présentées comme une prière pour le pape actuel."}
 }),
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
  note:{en:"Hammer's 1909 Section III includes a full historical MEDITATION and PRACTICE for each of the nine Annunciation days. The full historical English sections are available under Original meditation & practice; the short day guide is editorial. The digital text is not a certified print-facsimile collation. The 25 March feast can be transferred.",fr:"La section III du livre de Hammer (1909) contient pour chacun des neuf jours une MÉDITATION et une PRATIQUE complètes. Les textes historiques anglais figurent sous Méditation et pratique historiques ; le guide bref est rédactionnel. Cette transcription numérique n’est pas certifiée sur l’édition imprimée. La fête du 25 mars peut être transférée."}
 }),
 seven_sorrows:Object.freeze({
  heading:{en:"Hammer, Section IV · Seven Sorrows",fr:"Hammer, section IV · Sept Douleurs"},
  note:{en:"Hammer's 1909 Section IV includes full historical MEDITATION and PRACTICE passages for each of nine Seven Sorrows days. The complete historical English sections are available in the reader separately from the short editorial day guide; printed-edition collation is still pending.",fr:"La section IV du livre de Hammer (1909) contient pour chacun des neuf jours une MÉDITATION et une PRATIQUE complètes. Les sections anglaises historiques complètes sont consultables séparément du bref guide rédactionnel ; la collation sur l’édition imprimée reste à faire."}
 }),
 assumption:Object.freeze({
  heading:{en:"Hammer, Section V · Assumption",fr:"Hammer, section V · Assomption"},
  note:{en:"Hammer's 1909 Section V includes full historical MEDITATION and PRACTICE sections for the nine Assumption days. Their complete historical English text is available separately from the short editorial day guide; original print collation remains pending. Historical devotional meditation must not be mistaken for a definition of dogma.",fr:"La section V du livre de Hammer (1909) contient neuf MÉDITATIONS et PRATIQUES historiques. Les textes anglais historiques complets sont présentés séparément du bref guide rédactionnel ; la collation sur l’édition imprimée reste en attente. Ces méditations ne doivent pas être confondues avec des définitions dogmatiques."}
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
