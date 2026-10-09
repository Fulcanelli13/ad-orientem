// GENERATED FROM data/pray/prayer-source-certification-inventory.v3.json.
// Only the seven material edition differences requiring user disclosure are
// loaded in the lightweight Prayer runtime. Keep the 64-entry JSON authoritative.
export const PRAY_COLLATION_NOTICES_V1=Object.freeze({
  "foundations_our_father": {
    "classification": "FRENCH_HISTORICAL_VARIANT",
    "notice": {
      "en": "The French text is the traditional form; it is not the wording of the linked French 2005 Compendium.",
      "fr": "La version française conserve la formule traditionnelle ; elle n’est pas identique au texte français du Compendium de 2005."
    },
    "relatedWitnesses": [
      {
        "label": "Traditional French catechism (historical comparison, not exact app edition)",
        "url": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_%C3%A0_l%E2%80%99usage_de_toutes_les_%C3%A9glises_de_l%E2%80%99empire_fran%C3%A7ais.djvu/164"
      }
    ]
  },
  "foundations_apostles_creed": {
    "classification": "FRENCH_HISTORICAL_VARIANT",
    "notice": {
      "en": "The French Creed uses the traditional Saint-Esprit wording rather than the 2005 Compendium's Esprit Saint.",
      "fr": "Le Credo français conserve « Saint-Esprit » au lieu de la formulation « Esprit Saint » du Compendium de 2005."
    },
    "relatedWitnesses": [
      {
        "label": "Traditional French catechism witness",
        "url": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_%C3%A0_l%E2%80%99usage_de_toutes_les_%C3%A9glises_de_l%E2%80%99empire_fran%C3%A7ais.djvu/164"
      }
    ]
  },
  "foundations_grace_after_meals": {
    "classification": "HISTORICAL_PRAYER_ALTERNATIVE",
    "notice": {
      "en": "This text follows the benefits form found in another historical prayer book, not the mercies wording on the cited Baltimore Manual page.",
      "fr": "Cette prière suit la formule anglaise « benefits » attestée dans un autre livre ancien, non « mercies » du manuel de Baltimore."
    },
    "relatedWitnesses": [
      {
        "label": "Blessed Sacrament Book, prayers during the day",
        "url": "https://en.wikisource.org/wiki/Blessed_Sacrament_Book/Prayers_During_the_Day"
      }
    ]
  },
  "marian_hail_holy_queen": {
    "classification": "FRENCH_HISTORICAL_VARIANT",
    "notice": {
      "en": "The French Salve Regina is a traditional translation, not the exact French 2005 Compendium edition.",
      "fr": "Le Salve Regina français est une traduction traditionnelle, non la reproduction exacte du Compendium français de 2005."
    },
    "relatedWitnesses": [
      {
        "label": "French Marian text, historical-style comparison (not exact edition)",
        "url": "https://www.notredamedetilly.org/rosaire-priere/pri%C3%A8res-chants"
      }
    ]
  },
  "marian_memorare": {
    "classification": "FRENCH_ALTERNATE_WITNESS",
    "notice": {
      "en": "This French Memorare follows a traditional variant independently attested by the FSSP; it differs from the 2005 French Compendium.",
      "fr": "Ce Souvenez-vous suit une variante traditionnelle également attestée par la FSSP ; il diffère du Compendium français de 2005."
    },
    "relatedWitnesses": [
      {
        "label": "FSSP French traditional devotional form (2022)",
        "url": "https://www.fssp.org/fr/consecration-de-la-fraternite-sacerdotale-saint-pierre-au-coeur-immacule-de-marie/"
      }
    ]
  },
  "adoration_anima_christi": {
    "classification": "ENGLISH_TRANSLATION_VARIANT",
    "notice": {
      "en": "The English prose rendering is not the rhymed English text printed in the 2005 Compendium; the Latin original is provided for comparison.",
      "fr": "La version anglaise en prose diffère du poème anglais imprimé dans le Compendium de 2005 ; le latin permet la comparaison."
    },
    "relatedWitnesses": []
  },
  "foundations_eternal_rest": {
    "classification": "FRENCH_TRANSLATION_VARIANT",
    "notice": {
      "en": "The French translation uses lumière éternelle, while the French Compendium of 2005 uses lumière de ta face.",
      "fr": "La traduction française emploie « lumière éternelle » ; le Compendium français de 2005 emploie « lumière de ta face »."
    },
    "relatedWitnesses": []
  }
});
export function prayCollationNotice(id){return PRAY_COLLATION_NOTICES_V1[String(id||"")]||null;}
