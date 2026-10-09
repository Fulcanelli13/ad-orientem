/* Historically identified Prayer witnesses, distinct from certification of each locale. */
export const DEVOTIONAL_WITNESSES=Object.freeze({
  stations:Object.freeze({
    type:"HISTORICAL_ENGLISH_METHOD_TEXT_NOT_TRANSLATION_CERTIFICATION",
    links:Object.freeze([
      Object.freeze({title:"St Alphonsus, Way of the Cross · Baltimore Manual (1889)",url:"https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/The_Stations_of_the_Cross"})
    ])
  }),
  penitential:Object.freeze({
    type:"HISTORICAL_SEQUENCE_REFERENCE_SCRIPTURE_EDITION_SEPARATE",
    links:Object.freeze([
      Object.freeze({title:"Seven Penitential Psalms · historical English prayer book",url:"https://en.wikisource.org/wiki/The_Catholic%27s_pocket_prayer-book/The_Seven_Penitential_Psalms"}),
      Object.freeze({title:"Baltimore Manual (1889), seven-psalm sequence · contents, p. 245",url:"https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity"})
    ])
  }),
  sevenWords:Object.freeze({
    type:"HISTORICAL_ENGLISH_MEDITATION_FRENCH_TRANSLATION_UNVERIFIED",
    links:Object.freeze([
      Object.freeze({title:"The Devotion of the Seven Words upon the Cross · Baltimore Manual (1889)",url:"https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/The_Devotion_of_the_Seven_Words_upon_the_Cross"})
    ])
  }),
  fortyHours:Object.freeze({
    type:"HISTORICAL_DEVOTION_CONTEXT_NOT_UNIVERSAL_RITE",
    links:Object.freeze([
      Object.freeze({title:"The Devotion of the Forty Hours’ Adoration · Baltimore Manual (1889)",url:"https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/The_Devotion_of_the_Forty_Hours%27_Adoration"})
    ])
  })
});

export const PRAYER_WITNESSED_VARIANTS=Object.freeze({
 foundations_act_of_hope:Object.freeze({
  language:"fr",
  source:"Compendium of the Catechism of the Catholic Church, French edition, Appendix A: Acte d’espérance",
  url:"https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html",
  noteEn:"The Holy See’s published French Acte d’espérance ends « Dans cette foi, puis-je vivre et mourir ». The English and Latin witnesses say hope (spe). This apparent printed anomaly has been retained exactly pending an independently attested correction.",
  noteFr:"Le texte français du Compendium publié par le Saint-Siège se termine ici par « Dans cette foi, puis-je vivre et mourir ». Les témoins anglais et latin parlent d’espérance (spe). Cette anomalie apparente est conservée telle qu’imprimée, dans l’attente d’une correction attestée."
 })
});
