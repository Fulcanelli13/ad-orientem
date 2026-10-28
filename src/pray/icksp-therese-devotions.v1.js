/**
 * Institute-selected distinct St Therese prayer forms.
 * Primary 1925 prayer collated from Garesche, "A Novena to the Little Flower",
 * digitized Notre Dame pamphlet: printed pp. 38–39 (PDF pages 39–40, zero-based).
 *
 * The printed note cites Cardinal Della Chiesa (later Benedict XV), but does
 * NOT unambiguously document the actual author of the prayer.
 * "Hail, holy Queen" is a separate instruction, not the last sentence of
 * the prayer. Historic indulgences are NOT current-law claims.
 *
 * The contemporary ICKSP Tuesday novena has explicit member intentions and
 * the missionary version contains Institute-specific insertion. Until the
 * exact wording is cleared for free reuse, link the authenticated full source
 * without replacing its member intentions or inventing an adaptation.
 */
const F=Object.freeze;
export const ICKSP_THERESE_DEVOTIONS_V1=F({
  perennialInstituteNovena:F({
    id:"icksp_us_therese_perpetual_novena",
    title:"Perpetual Novena in Honor of St Thérèse",
    titleFr:"Neuvaine perpétuelle en l’honneur de sainte Thérèse",
    source_url:"https://www.institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus",
    status:"ORIGINAL_ICKSP_SOURCE_LINK_ONLY",
    periodicity:"TUESDAY_CONTINUOUS_PUBLIC_DEVOTION_NOT_NINE_DISTINCT_DAYS",
    preservation:"Keep named Little Flower Recurring Gift Society intentions intact in the Institute original; do not generalize the text, assert 9 independent daily prayers or imply a monetary obligation to pray.",
    historicalAlternative:"The separately authored 1925 Garesche nine-day novena is not the identical Institute Tuesday prayer, and the existing 24 Glory Bes form remains unchanged."
  }),
  missionaryIntercession:F({
    id:"icksp_us_therese_for_missionaries",
    title:"Prayer to St Thérèse for Missionaries",
    titleFr:"Prière à sainte Thérèse pour les missionnaires",
    source_url:"https://www.institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus",
    historicalContext:"Traditional Raccolta no. 573 prayer for Catholic missionaries. ICKSP adds an intention expressly for its own missionary work.",
    historicalLead:"https://www.sgg.org/wp-content/uploads/2013/10/20131020.pdf",
    status:"ORIGINAL_ICKSP_SOURCE_LINK_ONLY",
    preservation:"Do not alter the Institute's express missionary intention or reproduce a later translation as public domain without verifying its first edition."
  }),
  prayerFromNovena:F({
    id:"icksp_us_therese_benedict_xv",
    title:"Prayer to St Thérèse · 1925 historical form",
    titleFr:"Prière à sainte Thérèse · forme historique de 1925",
    en:`O little Therese of the Child Jesus, who during thy short life on earth became a mirror of angelic purity, of love strong as death, and of whole-hearted abandonment to God, now that thou rejoicest in the reward of thy virtues, cast a glance of pity on me as I leave all things in thy hands.

Make my troubles thine own—speak a word for me to our Lady Immaculate, whose flower of special love thou wert—to that Queen of heaven “who smiled on thee at the dawn of life.” Beg her as Queen of the Heart of Jesus to obtain for me by her powerful intercession the grace I yearn for so ardently at this moment, and that she join with it a blessing that may strengthen me during life, defend me at the hour of death, and lead me straight on to a happy eternity.`,
    concludingInstruction:"Hail, holy Queen.",
    attributedAuthor:"UNCONFIRMED_PAPAL_ATTRIBUTION",
    historicalPrint:"Garesche, A Novena to the Little Flower, 1925, printed pp. 38–39",
    source_url:"https://distantreader.org/stacks/pamphlets/pdf/005457174.pdf",
    printedPdfPagesZeroBased:F([39,40]),
    instituteSourceUrl:"https://www.institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus",
    languageStatus:"ENGLISH_HISTORICAL_ORIGINAL_FRENCH_UNVERIFIED",
    sourceNote:F({
      en:"The complete prayer is from a printed 1925 Catholic booklet. It ends with an instruction to say the Hail, Holy Queen. The Institute labels a closely related wording 'Prayer by Pope Benedict XV', but the original printed notice does not establish that Benedict XV wrote the prayer. No unverified French or Latin text has been substituted.",
      fr:"Cette prière provient d’un livret catholique imprimé en 1925. Elle est suivie de l’indication de réciter le Salve Regina. L’Institut attribue une forme voisine à Benoît XV, mais l’indication imprimée ne démontre pas qu’il en soit l’auteur. Aucune traduction française ou latine non attestée n’a été ajoutée."
    })
  })
});
