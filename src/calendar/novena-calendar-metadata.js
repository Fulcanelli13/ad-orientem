/* Generated projection of the canonical Novena Corpus V4, source src/pray/novena-corpus-v4.js.
 * Calendar/Coming Up require dates, names and source-status metadata, not the
 * 16 full devotional texts and French body modules. Do not use this for prayer
 * rendering. Regenerate with tools/perf/generate-novena-calendar-metadata.mjs
 * and enforce exact parity in tests/calendar-novena-metadata-parity.mjs.
 */
const freeze=v=>{
 if(v===null||typeof v!=="object"||Object.isFrozen(v))return v;
 for(const child of Object.values(v))freeze(child);
 return Object.freeze(v);
};
export const NOVENA_START_KIND=Object.freeze({"TRADITIONAL":"TRADITIONAL_START","SUGGESTED":"SUGGESTED_START"});
export const NOVENA_CALENDAR_METADATA=freeze({
  "holy_ghost": {
    "id": "holy_ghost",
    "title": {
      "en": "Novena to the Holy Ghost",
      "fr": "Neuvaine au Saint-Esprit"
    },
    "family": {
      "en": "Pentecost · Holy Spirit",
      "fr": "Pentecôte · Saint-Esprit"
    },
    "feast": {
      "en": "Pentecost",
      "fr": "Pentecôte"
    },
    "calendar": {
      "type": "EASTER_OFFSET",
      "startOffset": 40,
      "endOffset": 48,
      "feastOffset": 49,
      "precision": "1962_FIXED_PASCHAL"
    },
    "startKind": "TRADITIONAL_START",
    "traditionalStart": {
      "en": "Friday after the Ascension",
      "fr": "Vendredi après l’Ascension"
    },
    "sourceStatus": "1925_ORIGINAL_COPYRIGHT · ACCESSIBLE_SCAN_POST_1933_CONTENT · FIRST_EDITION_WORD_FOR_WORD_NOT_COLLATED",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "christmas": {
    "id": "christmas",
    "title": {
      "en": "Christmas Novena",
      "fr": "Neuvaine de Noël"
    },
    "family": {
      "en": "Advent · Nativity of Our Lord",
      "fr": "Avent · Nativité de Notre-Seigneur"
    },
    "feast": {
      "en": "Nativity of Our Lord",
      "fr": "Nativité de Notre-Seigneur"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 12,
      "startDay": 16,
      "endMonth": 12,
      "endDay": 24,
      "feastMonth": 12,
      "feastDay": 25,
      "precision": "SOURCE_EXPLICIT_FIXED"
    },
    "startKind": "TRADITIONAL_START",
    "traditionalStart": {
      "en": "16 December — explicit in Blessed Be God",
      "fr": "16 décembre — date explicite dans Blessed Be God"
    },
    "sourceStatus": "1925_ORIGINAL_COPYRIGHT · ACCESSIBLE_SCAN_POST_1933_CONTENT · FIRST_EDITION_WORD_FOR_WORD_NOT_COLLATED",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "corpus_christi": {
    "id": "corpus_christi",
    "title": {
      "en": "Corpus Christi Novena",
      "fr": "Neuvaine de la Fête-Dieu"
    },
    "family": {
      "en": "Eucharist · Corpus Christi",
      "fr": "Eucharistie · Fête-Dieu"
    },
    "feast": {
      "en": "Corpus Christi",
      "fr": "Fête-Dieu"
    },
    "calendar": {
      "type": "EASTER_OFFSET",
      "startOffset": 52,
      "endOffset": 60,
      "feastOffset": 60,
      "precision": "SOURCE_EXPLICIT_1962_PASCHAL"
    },
    "startKind": "TRADITIONAL_START",
    "traditionalStart": {
      "en": "Wednesday in Pentecost Week — explicit in Moran 1883",
      "fr": "Mercredi de la semaine de Pentecôte — date explicitement donnée par Moran en 1883"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_WIKISOURCE",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "sacred_heart": {
    "id": "sacred_heart",
    "title": {
      "en": "Novena to the Sacred Heart",
      "fr": "Neuvaine au Sacré-Cœur"
    },
    "family": {
      "en": "Sacred Heart · Eucharistic reparation",
      "fr": "Sacré-Cœur · réparation eucharistique"
    },
    "feast": {
      "en": "Most Sacred Heart of Jesus",
      "fr": "Sacré-Cœur de Jésus"
    },
    "calendar": {
      "type": "EASTER_OFFSET",
      "startOffset": 60,
      "endOffset": 68,
      "feastOffset": 68,
      "precision": "1962_FIXED_PASCHAL"
    },
    "startKind": "TRADITIONAL_START",
    "traditionalStart": {
      "en": "Corpus Christi, according to the 1883 source",
      "fr": "Fête-Dieu, selon la source de 1883"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_WIKISOURCE",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "immaculate_conception": {
    "id": "immaculate_conception",
    "title": {
      "en": "Novena of the Immaculate Conception",
      "fr": "Neuvaine de l’Immaculée Conception"
    },
    "family": {
      "en": "Our Lady · Advent preparation",
      "fr": "Notre-Dame · préparation de l’Avent"
    },
    "feast": {
      "en": "Immaculate Conception of the Blessed Virgin Mary",
      "fr": "Immaculée Conception de la Bienheureuse Vierge Marie"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 11,
      "startDay": 29,
      "endMonth": 12,
      "endDay": 7,
      "feastMonth": 12,
      "feastDay": 8,
      "precision": "SOURCE_EXPLICIT"
    },
    "startKind": "TRADITIONAL_START",
    "traditionalStart": {
      "en": "29 November — explicitly given by Moran",
      "fr": "29 novembre — date explicitement donnée par Moran"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_WIKISOURCE",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "annunciation": {
    "id": "annunciation",
    "title": {
      "en": "Annunciation Novena",
      "fr": "Neuvaine de l’Annonciation"
    },
    "family": {
      "en": "Our Lady · Incarnation",
      "fr": "Notre-Dame · Incarnation"
    },
    "feast": {
      "en": "Annunciation of the Blessed Virgin Mary",
      "fr": "Annonciation de la Bienheureuse Vierge Marie"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 3,
      "startDay": 16,
      "endMonth": 3,
      "endDay": 24,
      "feastMonth": 3,
      "feastDay": 25,
      "precision": "NOMINAL_FIXED_TRANSFER_AWARE_BINDING_PENDING"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "16 March before the nominal 25 March feast",
      "fr": "16 mars avant la fête nominale du 25 mars"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_PROJECT_GUTENBERG",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "assumption": {
    "id": "assumption",
    "title": {
      "en": "Assumption Novena",
      "fr": "Neuvaine de l’Assomption"
    },
    "family": {
      "en": "Our Lady · Assumption",
      "fr": "Notre-Dame · Assomption"
    },
    "feast": {
      "en": "Assumption of the Blessed Virgin Mary",
      "fr": "Assomption de la Bienheureuse Vierge Marie"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 8,
      "startDay": 6,
      "endMonth": 8,
      "endDay": 14,
      "feastMonth": 8,
      "feastDay": 15,
      "precision": "1962_FIXED"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "6 August before the 15 August feast",
      "fr": "6 août avant la fête du 15 août"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_PROJECT_GUTENBERG",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "seven_sorrows": {
    "id": "seven_sorrows",
    "title": {
      "en": "Seven Sorrows Novena",
      "fr": "Neuvaine des Sept Douleurs"
    },
    "family": {
      "en": "Our Lady of Sorrows · Passion",
      "fr": "Notre-Dame des Douleurs · Passion"
    },
    "feast": {
      "en": "Seven Sorrows of the Blessed Virgin Mary",
      "fr": "Sept Douleurs de la Bienheureuse Vierge Marie"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 9,
      "startDay": 6,
      "endMonth": 9,
      "endDay": 14,
      "feastMonth": 9,
      "feastDay": 15,
      "precision": "1962_FIXED"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "6 September before the 15 September feast in the 1962 calendar",
      "fr": "6 septembre avant la fête du 15 septembre dans le calendrier de 1962"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_PROJECT_GUTENBERG",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "st_joseph": {
    "id": "st_joseph",
    "title": {
      "en": "Novena of St Joseph",
      "fr": "Neuvaine à saint Joseph"
    },
    "family": {
      "en": "St Joseph · March devotion",
      "fr": "Saint Joseph · dévotion de mars"
    },
    "feast": {
      "en": "St Joseph, Spouse of the Blessed Virgin Mary",
      "fr": "Saint Joseph, époux de la Bienheureuse Vierge Marie"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 3,
      "startDay": 10,
      "endMonth": 3,
      "endDay": 18,
      "feastMonth": 3,
      "feastDay": 19,
      "precision": "NOMINAL_FIXED_TRANSFER_AWARE_BINDING_PENDING"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "Nine days before the nominal 19 March feast",
      "fr": "Neuf jours avant la fête nominale du 19 mars"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · DIGITAL_WITNESS_WIKISOURCE",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "holy_souls": {
    "id": "holy_souls",
    "title": {
      "en": "Novena for the Holy Souls in Purgatory",
      "fr": "Neuvaine pour les Saintes Âmes du Purgatoire"
    },
    "family": {
      "en": "Faithful Departed · November",
      "fr": "Fidèles défunts · novembre"
    },
    "feast": {
      "en": "Commemoration of All the Faithful Departed",
      "fr": "Commémoraison de tous les fidèles défunts"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 10,
      "startDay": 24,
      "endMonth": 11,
      "endDay": 1,
      "feastMonth": 11,
      "feastDay": 2,
      "precision": "AO_SEASONAL_SUGGESTION_FOR_1962_ALL_SOULS; NOT_CLAIMED_AS_HISTORICAL_START_RULE"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "Ad Orientem seasonal suggestion: 24 October–1 November when using this novena as preparation for All Souls; the historical novena itself may be prayed at any time",
      "fr": "Suggestion saisonnière d’Ad Orientem : du 24 octobre au 1er novembre lorsque cette neuvaine prépare la Commémoration des fidèles défunts ; la neuvaine historique peut elle-même être priée à tout moment"
    },
    "sourceStatus": "MODERN_DIGITAL_TRANSCRIPTION_WITH_SCANNED_1894_COPYRIGHT_PRINT_WITNESS_LOCATED · PRINT_EDITION_NOT_COLLATED",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "perpetual_help": {
    "id": "perpetual_help",
    "title": {
      "en": "Our Lady of Perpetual Help Novena",
      "fr": "Neuvaine à Notre-Dame du Perpétuel Secours"
    },
    "family": {
      "en": "Our Lady · Redemptorist devotion",
      "fr": "Notre-Dame · dévotion rédemptoriste"
    },
    "feast": {
      "en": "Our Lady of Perpetual Help",
      "fr": "Notre-Dame du Perpétuel Secours"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 6,
      "startDay": 18,
      "endMonth": 6,
      "endDay": 26,
      "feastMonth": 6,
      "feastDay": 27,
      "precision": "REDEMPTORIST_FEAST_PREP"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "18 June when used as preparation for the 27 June Redemptorist observance",
      "fr": "18 juin lorsqu’elle prépare l’observance rédemptoriste du 27 juin"
    },
    "sourceStatus": "PUBLIC_DOMAIN_ORIGINAL · WIKISOURCE_DIGITAL_WITNESS",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "st_therese": {
    "id": "st_therese",
    "title": {
      "en": "St Thérèse · Twenty-Four Glory Bes Novena",
      "fr": "Sainte Thérèse · Neuvaine des vingt-quatre Gloria"
    },
    "family": {
      "en": "St Thérèse of the Child Jesus · Little Flower",
      "fr": "Sainte Thérèse de l’Enfant-Jésus · Petite Fleur"
    },
    "feast": {
      "en": "St Thérèse of the Child Jesus",
      "fr": "Sainte Thérèse de l’Enfant-Jésus"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 9,
      "startDay": 24,
      "endMonth": 10,
      "endDay": 2,
      "feastMonth": 10,
      "feastDay": 3,
      "precision": "1962_FEAST_PREP_OPTIONAL; TRADITIONAL_MONTHLY_9_TO_17"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "The historic custom especially recommends the 9th–17th of any month; Ad Orientem also offers 24 September–2 October as a 1962-feast preparation",
      "fr": "La coutume historique recommande particulièrement du 9 au 17 de chaque mois ; Ad Orientem propose aussi du 24 septembre au 2 octobre comme préparation à la fête du calendrier de 1962"
    },
    "sourceStatus": "PUBLIC_DOMAIN_1925_TRADITIONAL_FORM · MODERN_DIGITAL_WITNESS",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_ENGLISH_SOURCE"
  },
  "st_anthony_nine_tuesdays": {
    "id": "st_anthony_nine_tuesdays",
    "title": {
      "en": "St Anthony’s Nine Tuesdays",
      "fr": "Les neuf mardis de saint Antoine"
    },
    "family": {
      "en": "St Anthony of Padua · Nine Tuesdays",
      "fr": "Saint Antoine de Padoue · Neuf mardis"
    },
    "feast": {
      "en": "St Anthony of Padua",
      "fr": "Saint Antoine de Padoue"
    },
    "calendar": {
      "type": "NINE_TUESDAYS_BEFORE_FIXED_FEAST",
      "feastMonth": 6,
      "feastDay": 13,
      "precision": "TRADITIONAL_WEEKLY_TUESDAY_CADENCE"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "Suggested feast preparation: nine consecutive Tuesdays leading toward 13 June; the traditional devotion itself may be made as nine consecutive Tuesdays at other times",
      "fr": "Préparation suggérée à la fête : neuf mardis consécutifs conduisant vers le 13 juin ; la dévotion traditionnelle elle-même peut être accomplie pendant neuf mardis consécutifs à d’autres moments"
    },
    "sourceStatus": "1966_FRANCISCAN_PAMPHLET_COMPARATIVE_WITNESS · ENGLISH_ARCHAIZED_ADAPTATION · FRENCH_EDITORIAL_TRANSLATION",
    "frenchTextStatus": "EDITORIAL_TRANSLATION_ALIGNED_TO_TRADITIONAL_ENGLISH_SOURCE"
  },
  "christ_the_king": {
    "id": "christ_the_king",
    "title": {
      "en": "Novena to Christ the King",
      "fr": "Neuvaine au Christ-Roi"
    },
    "family": {
      "en": "Christ the King · Sacred Kingship",
      "fr": "Christ-Roi · Royauté sacrée"
    },
    "feast": {
      "en": "Christ the King",
      "fr": "Christ-Roi"
    },
    "calendar": {
      "type": "LAST_SUNDAY_RELATIVE",
      "month": 10,
      "startOffset": -9,
      "endOffset": -1,
      "feastOffset": 0,
      "precision": "1962_LAST_SUNDAY_OCTOBER_PREP"
    },
    "startKind": "TRADITIONAL_START",
    "traditionalStart": {
      "en": "Nine days immediately preceding the last Sunday of October — attested pre-conciliar feast preparation",
      "fr": "Neuf jours précédant immédiatement le dernier dimanche d’octobre — préparation à la fête attestée avant le Concile"
    },
    "sourceStatus": "SOURCE_LOCKED_TRADITIONAL_FRENCH · ENGLISH_EDITORIAL_ALIGNMENT",
    "frenchTextStatus": "SOURCE_LOCKED_TRADITIONAL_FRENCH"
  },
  "immaculate_heart": {
    "id": "immaculate_heart",
    "title": {
      "en": "Novena to the Immaculate Heart of Mary",
      "fr": "Neuvaine au Cœur Immaculé de Marie"
    },
    "family": {
      "en": "Our Lady · Immaculate Heart",
      "fr": "Notre-Dame · Cœur Immaculé"
    },
    "feast": {
      "en": "Immaculate Heart of Mary",
      "fr": "Cœur Immaculé de Marie"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 8,
      "startDay": 13,
      "endMonth": 8,
      "endDay": 21,
      "feastMonth": 8,
      "feastDay": 22,
      "precision": "1962_FEAST_PREP"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "Suggested feast preparation: 13–21 August before the 22 August feast; the historical nine-day practice was not restricted to these dates",
      "fr": "Préparation suggérée à la fête : du 13 au 21 août avant la fête du 22 août ; la pratique historique de neuf jours n’était pas limitée à ces dates"
    },
    "sourceStatus": "1857_RACCOLTA_COMPARATIVE_WITNESS · ENGLISH_ADAPTED_VARIANT_NOT_VERBATIM · FRENCH_NOT_PRINT_COLLATED",
    "frenchTextStatus": "TRADITIONAL_FRENCH_WITNESS_VARIANT_NOT_PRINT_COLLATED"
  },
  "st_michael": {
    "id": "st_michael",
    "title": {
      "en": "Novena to St Michael the Archangel",
      "fr": "Neuvaine à saint Michel Archange"
    },
    "family": {
      "en": "St Michael · Prince of the heavenly host",
      "fr": "Saint Michel · Prince de la milice céleste"
    },
    "feast": {
      "en": "Dedication of St Michael the Archangel",
      "fr": "Dédicace de saint Michel Archange"
    },
    "calendar": {
      "type": "FIXED",
      "startMonth": 9,
      "startDay": 20,
      "endMonth": 9,
      "endDay": 28,
      "feastMonth": 9,
      "feastDay": 29,
      "precision": "1962_MICHAELMAS_PREP"
    },
    "startKind": "SUGGESTED_START",
    "traditionalStart": {
      "en": "Suggested feast preparation: 20–28 September before Michaelmas; the Raccolta allowed the novena at any time of year",
      "fr": "Préparation suggérée à la fête : du 20 au 28 septembre avant la Saint-Michel ; la Raccolta permettait la neuvaine à tout moment de l’année"
    },
    "sourceStatus": "SOURCE_LOCKED_TRADITIONAL_FRENCH · TRADITIONAL_ENGLISH_FORM",
    "frenchTextStatus": "SOURCE_LOCKED_TRADITIONAL_FRENCH"
  }
});
