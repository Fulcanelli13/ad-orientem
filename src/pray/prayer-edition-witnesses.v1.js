/** Edition-specific linked witnesses. These supplement, never mutate, the locked PRAY corpus.
 * Witness links/identifications do NOT constitute three-language verbatim certification.
 */
export const PRAY_EDITION_WITNESSES_V1=Object.freeze({
  "mass_confiteor": {
    "edition": "ROMAN_MISSAL_1962",
    "witnessType": "PRINTED_MISSAL_FACSIMILE_UNCOLLATED",
    "url": "https://isidore.co/misc/Res%20pro%20Deo/ITOPL_OCR-layer-only/11a.%20Liturgy/Missale%20Romanum%201962_OCR.pdf",
    "secondaryUrl": "https://la.wikisource.org/wiki/Ordinarium_miss%C3%A6_(1962)",
    "label": {
      "en": "1962 Roman Missal · printed witness",
      "fr": "Missel romain de 1962 · témoin imprimé"
    },
    "note": {
      "en": "Traditional Confiteor with 'to you, Father': the server's form at the foot of the altar. Do not silently replace it with the modern penitential act. The printed witness remains subject to line-by-line collation.",
      "fr": "Confiteor traditionnel avec « à vous, mon Père » : forme du servant au bas de l'autel. Ne pas le remplacer par l'acte pénitentiel moderne. La comparaison mot à mot avec le témoin imprimé reste à achever."
    }
  },
  "adoration_lord_i_am_not_worthy": {
    "edition": "ROMAN_MISSAL_1962",
    "witnessType": "PRINTED_MISSAL_FACSIMILE_UNCOLLATED",
    "url": "https://isidore.co/misc/Res%20pro%20Deo/ITOPL_OCR-layer-only/11a.%20Liturgy/Missale%20Romanum%201962_OCR.pdf",
    "secondaryUrl": "https://la.wikisource.org/wiki/Ordinarium_miss%C3%A6_(1962)",
    "label": {
      "en": "1962 Roman Missal · Communion formula",
      "fr": "Missel romain de 1962 · formule de communion"
    },
    "note": {
      "en": "Traditional Mass formula, not an assertion that the lay communicant has spoken the priest's private repetitions. The printed witness remains subject to line-by-line collation.",
      "fr": "Formule de la messe traditionnelle, sans attribuer au fidèle les répétitions privées du prêtre. La comparaison mot à mot avec le témoin imprimé reste à achever."
    }
  },
  "litany_loreto_1962": {
    "edition": "LORETO_PRE_1980_FORM",
    "witnessType": "PRECONCILIAR_COMPARATIVE_WITNESS",
    "url": "https://en.wikisource.org/wiki/Prayer-book_for_Religious/Book_2",
    "secondaryUrl": "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2020/06/20/200620c.html",
    "label": {
      "en": "Litany of Loreto · traditional invocations",
      "fr": "Litanies de Lorette · invocations traditionnelles"
    },
    "note": {
      "en": "Traditional form without later additions. The older prayer-book witness is comparative, not a certified facsimile of a 1962 printed book. The 2020 Holy See decree documents three later invocations.",
      "fr": "Forme traditionnelle sans les ajouts postérieurs. L'ancien livre de prières est un témoin comparatif, non un fac-similé certifié de 1962. Le décret romain de 2020 documente trois ajouts ultérieurs."
    }
  },
  "litany_loreto_current": {
    "edition": "LORETO_CURRENT_2020",
    "witnessType": "CURRENT_HOLY_SEE_WITH_DECREE",
    "url": "https://www.vatican.va/special/rosary/documents/litanie-lauretane_en.html",
    "secondaryUrl": "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2020/06/20/200620c.html",
    "label": {
      "en": "Litany of Loreto · expanded form",
      "fr": "Litanies de Lorette · forme augmentée"
    },
    "note": {
      "en": "Includes the later invocations, notably Mother of Mercy, Mother of Hope and Solace of Migrants approved in 2020; do not present these as part of the 1962 form.",
      "fr": "Comprend des invocations ultérieures, notamment Mère de miséricorde, Mère de l'espérance et Réconfort des migrants, ajoutées en 2020 ; elles ne font pas partie de la forme de 1962."
    }
  },
  "devotion_litany_st_joseph": {
    "edition": "ST_JOSEPH_2021",
    "witnessType": "CURRENT_HOLY_SEE_WITH_DECREE",
    "url": "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501c.html",
    "secondaryUrl": "https://www.usccb.org/prayers/litany-saint-joseph",
    "label": {
      "en": "Litany of Saint Joseph · 2021 expanded form",
      "fr": "Litanies de saint Joseph · forme augmentée de 2021"
    },
    "note": {
      "en": "This is the expanded litany with seven invocations added in 2021, not the unexpanded 1909 form. The Latin decree is authoritative; French text is a devotional translation not claimed to be conference-approved.",
      "fr": "Cette version contient les sept invocations ajoutées en 2021 ; il ne s'agit pas de la forme de 1909 sans ajouts. Le décret latin fait autorité ; la traduction française n'est pas présentée comme approuvée par une conférence épiscopale."
    }
  }
});
export function prayEditionWitness(id){return PRAY_EDITION_WITNESSES_V1[String(id||"")]||null;}
