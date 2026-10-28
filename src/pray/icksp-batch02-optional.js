/** Source-collated optional Institute selections for Batch 2.
 * Links are explicitly distinct from canonical prayer bodies. Modern ICKSP
 * translations have not been assumed reusable in a paid application.
 */
export const BATCH02_INSTITUTE_OPTIONAL=Object.freeze([
 Object.freeze({id:"icksp_stella_caeli",titleEn:"Stella caeli extirpavit",titleFr:"Stella caeli extirpavit",
  category:"marian-protection-hymn",destination:"benediction-optional-local",
  source:"https://www.institute-christ-king.org/images/chicago/Files/Prayer_to_Our_Lady_and_Benediction.pdf",
  language:"LATIN_SOURCE_LINK",rights:"INDEPENDENT_TEXT_COLLATION_PENDING",usage:"Not part of every Benediction"}),
 Object.freeze({id:"icksp_parce_domine",titleEn:"Parce Domine",titleFr:"Parce Domine",
  category:"penitential-chant",destination:"benediction-optional-local",
  source:"https://www.institute-christ-king.org/images/chicago/Files/Prayer_to_Our_Lady_and_Benediction.pdf",
  language:"LATIN_SOURCE_LINK",rights:"INDEPENDENT_TEXT_COLLATION_PENDING",usage:"Local penitential chant"}),
 Object.freeze({id:"icksp_loreto_booklet",titleEn:"Litany of Loreto · Institute booklet",titleFr:"Litanies de Lorette · livret de l'Institut",
  category:"marian-litany-variant",destination:"benediction-optional-local",
  source:"https://www.institute-christ-king.org/images/chicago/Files/Prayer_to_Our_Lady_and_Benediction.pdf",
  language:"SOURCE_LINK",rights:"RECENSION_COMPARISON_PENDING",usage:"Later invocations do not replace the 1962 form"}),
 Object.freeze({id:"icksp_spiritual_communion",titleEn:"Act of Spiritual Communion · Institute wording",titleFr:"Communion spirituelle · formulation de l'Institut",
  category:"eucharistic-prayer-variant",destination:"adoration-optional",
  source:"https://institute-christ-king.org/videostreamprayers",
  language:"EN_SOURCE_LINK",rights:"MODERN_TRANSLATION_REUSE_PENDING",usage:"Existing St Alphonsus formulation remains primary"}),
 Object.freeze({id:"icksp_reparation",titleEn:"Prayer of Reparation",titleFr:"Prière de réparation",
  category:"eucharistic-reparation",destination:"adoration-optional",
  source:"https://institute-christ-king.org/resources/devotions-prayers",
  language:"SOURCE_LINK",rights:"EXACT_TEXT_AND_REUSE_PENDING",usage:"Optional reparation / First Friday"}),
 Object.freeze({id:"icksp_priests_jesus",titleEn:"O Jesus, Eternal Priest",titleFr:"Ô Jésus, Prêtre éternel",
  category:"intercession-for-priests",destination:"adoration-optional",
  source:"https://institute-christ-king.org/resources/devotions-prayers",
  language:"SOURCE_LINK",rights:"EXACT_TEXT_AND_REUSE_PENDING",usage:"Optional priestly intercession"}),
 Object.freeze({id:"icksp_priests_heart",titleEn:"Sacred Heart, Eternal High Priest",titleFr:"Sacré-Cœur, Grand Prêtre éternel",
  category:"intercession-for-priests",destination:"adoration-optional",
  source:"https://institute-christ-king.org/resources/devotions-prayers",
  language:"SOURCE_LINK",rights:"EXACT_TEXT_AND_REUSE_PENDING",usage:"Optional priestly intercession"})
]);
export function instituteOptionalFor(destination){return BATCH02_INSTITUTE_OPTIONAL.filter(x=>x.destination===destination)}
