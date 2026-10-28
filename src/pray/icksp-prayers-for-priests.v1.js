/**
 * Two separate prayer identities selected by the ICKSP.
 * First prayer: traditional English form, published by ICKSP; a related
 * prayer was printed in American Ecclesiastical Review, vol. 50 (1914).
 * The 1914 page image has NOT been independently collated; never assert
 * that the modern punctuation exactly reproduces that witness.
 * Attribution to St Therese is disputed and NOT used.
 * The second ICKSP prayer contains a visibly corrupted line; no full
 * text is released until an independent edition can repair it.
 */
const freeze=Object.freeze;
export const ICKSP_PRIEST_PRAYERS_V1=freeze({
  eternalPriest:freeze({
    id:"icksp_priest_eternal_priest",
    title:"O Jesus, Eternal Priest",
    titleFr:"Ô Jésus, Prêtre éternel",
    languageStatus:"HISTORICAL_ENGLISH_ONLY_FRENCH_UNVERIFIED",
    en:`O Jesus, Eternal Priest, keep Thy priests within the shelter of Thy Sacred Heart, where none may touch them.

Keep unstained their anointed hands, which daily touch Thy Sacred Body.

Keep unsullied their lips, daily purpled with Thy Precious Blood.

Keep pure and unworldly their hearts, sealed with the sublime mark of Thy Priesthood.

Let Thy Holy Love surround them from the world's contagion.

Bless their labors with abundant fruit.

May the souls to whom they minister be their joy and consolation here, and their everlasting crown hereafter. Amen.`,
    note:freeze({
      en:"This is the ICKSP English form of a traditional prayer for priests. A related 1914 printing is reported but not yet line-by-line collated. Authorship is not attributed to St Thérèse.",
      fr:"Texte anglais de l’Institut du Christ-Roi. Une édition apparentée de 1914 est signalée, sans collation mot à mot. L’attribution à sainte Thérèse n’est pas établie ; aucune traduction française non vérifiée n’est substituée."
    }),
    editions:freeze({
      institute:freeze({label:"ICKSP · Prayers for Priests",url:"https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests",status:"ICKSP_EN_TEXT_VERIFIED"}),
      historicalLead:freeze({label:"American Ecclesiastical Review · vol. 50 · 1914 · pp. 608–609 · bibliographic lead only",url:"https://books.google.com/books?id=2tPNAAAAMAAJ",status:"1914_ORIGINAL_UNCOLLATED"})
    })
  }),
  sacredHeartHighPriest:freeze({
    id:"icksp_priest_high_priest",
    title:"Sacred Heart, Eternal High Priest",
    titleFr:"Sacré-Cœur, Prêtre souverain et éternel",
    source_url:"https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests",
    status:"SOURCE_TEXT_CORRUPTED_RELEASE_HELD",
    note:"The present ICKSP transcription includes the foreign line fragment 'on here, and their everlasting crown hereafter'. Do not silently repair or publish it as an authenticated prayer."
  })
});
