/** Public linked-source scope notes from the canonical 30-record release triage.
 * Source checks are limited to selected digital anchors; do not upgrade original
 * print, three-language, complete-text or existing prayer-body certifications.
 * The full reviewed/pending queue remains the JSON source register. */
export const PRAY_SOURCE_SCOPE_NOTICES_20261103=Object.freeze({
  "foundations_morning_offering": {
    "category": "FORMULA_VARIANT",
    "notice": {
      "en": "The cited USCCB Morning Offering includes “this month” after the Holy Father's intentions. This inherited prayer omits that phrase. The two English wordings are not identical; the original French and Latin versions remain independently uncollated.",
      "fr": "La prière du matin publiée par l’USCCB ajoute « this month » après les intentions du Saint-Père. Le texte anglais conservé dans l’application omet ces mots. Les versions française et latine n’ont pas fait l’objet d’une collation indépendante."
    },
    "sourceUrl": "https://www.usccb.org/prayers/morning-offering",
    "fullEditionCertified": false
  },
  "benediction_o_salutaris": {
    "category": "ENGLISH_HYMN_VARIANT",
    "notice": {
      "en": "The cited historical hymn gives “O saving Victim, opening wide”; the app reads “O saving Victim, open wide”. The English stanza is a traditional adaptation, not a verbatim reproduction of that edition.",
      "fr": "Le cantique historique cité porte « O saving Victim, opening wide », tandis que l’application donne « O saving Victim, open wide ». La strophe anglaise est adaptée et non reproduite mot à mot de cette édition."
    },
    "sourceUrl": "https://en.wikisource.org/wiki/With_God/Benediction_of_the_Blessed_Sacrament",
    "fullEditionCertified": false
  },
  "benediction_tantum_ergo": {
    "category": "ENGLISH_HYMN_VARIANT",
    "notice": {
      "en": "The cited historical book prints the English “Down in adoration falling” hymn. The app preserves its opening but modernizes punctuation and line grouping; this does not certify exact historical typography or the French and Latin versions.",
      "fr": "Le recueil historique cité donne l’hymne anglais « Down in adoration falling ». L’application en conserve l’incipit mais adapte la ponctuation et les vers ; ni la typographie exacte ni les versions française et latine ne sont certifiées."
    },
    "sourceUrl": "https://en.wikisource.org/wiki/With_God/Benediction_of_the_Blessed_Sacrament",
    "fullEditionCertified": false
  },
  "devotion_prayer_st_michael": {
    "category": "TRANSLATION_VARIANT",
    "notice": {
      "en": "The Holy See communiqué prints the Latin prayer and an English version using “cast into hell”; this inherited translation says “thrust into hell”. The French version was not independently collated.",
      "fr": "Le communiqué du Saint-Siège publie le latin et une traduction anglaise avec « cast into hell » ; la version conservée emploie « thrust into hell ». La traduction française reste à collationner indépendamment."
    },
    "sourceUrl": "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2018/09/29/180929d.html",
    "fullEditionCertified": false
  },
  "church_prayer_for_pope": {
    "category": "COMPOSITE_VS_CURRENT_FORM",
    "notice": {
      "en": "The linked Vatican News prayer is a current arrangement naming the Pope and giving a shorter collect. This historical composite also includes “Thou art Peter” and retains N. as a placeholder. The linked page is a comparison, not its full original edition.",
      "fr": "Le texte de Vatican News nomme le pape et donne une oraison plus courte. Cette forme historique composite comprend aussi « Tu es Pierre » et conserve N. comme emplacement à compléter. Le lien sert de comparaison, non de preuve d’identité textuelle intégrale."
    },
    "sourceUrl": "https://www.vaticannews.va/en/prayers/prayer-for-the-pope.html",
    "fullEditionCertified": false
  },
  "sub_tuum": {
    "category": "TRANSLATION_VARIANT",
    "notice": {
      "en": "The Holy See communiqué prints the Latin Sub tuum with an English rendering beginning “We fly to Thy protection”. The app preserves the traditional “We fly to your patronage”. These are not verbatim English twins; the French witness is uncollated.",
      "fr": "Le communiqué romain donne le latin et une traduction anglaise débutant par « We fly to Thy protection ». L’application conserve « We fly to your patronage ». Ces versions anglaises ne sont pas identiques ; la source française reste à collationner."
    },
    "sourceUrl": "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2018/09/29/180929d.html",
    "fullEditionCertified": false
  },
  "litany_loreto_1962": {
    "category": "WRONG_EDITION_IN_ORIGINAL_CORPUS_URL",
    "notice": {
      "en": "The original catalogue's Vatican link gives the expanded Litany with later invocations, not the 1962-era text. The reader links an older comparative prayer-book witness instead; neither link is a certified 1962 printed facsimile.",
      "fr": "Le lien du catalogue d’origine mène aux Litanies augmentées par des invocations ultérieures, et non au texte de l’époque de 1962. Le lecteur renvoie plutôt à un livre ancien comparatif ; aucun de ces liens ne certifie un imprimé de 1962."
    },
    "sourceUrl": "https://www.vatican.va/special/rosary/documents/litanie-lauretane_en.html",
    "fullEditionCertified": false
  },
  "litany_loreto_current": {
    "category": "CURRENT_FORM_ANCHOR",
    "notice": {
      "en": "The linked Holy See Litany contains later invocations, consistent with the present expanded form. This source comparison is not a complete English, French and Latin transcription certificate.",
      "fr": "Les Litanies publiées par le Saint-Siège comportent des invocations ajoutées ultérieurement, conformément à la forme augmentée. Cette comparaison ne certifie pas l’intégralité des trois versions linguistiques."
    },
    "sourceUrl": "https://www.vatican.va/special/rosary/documents/litanie-lauretane_en.html",
    "fullEditionCertified": false
  }
});
export function praySourceScopeNotice20261103(id){return PRAY_SOURCE_SCOPE_NOTICES_20261103[String(id||"")]||null;}
