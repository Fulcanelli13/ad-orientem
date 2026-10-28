/**
 * Wave 04 historical witness mining — NOT the locked 48-prayer canonical bank.
 * These pre-1931 English witnesses are extracted from Lasance (1908),
 * My Prayer-Book / Prayers During the Day. Each has a visible text page.
 * Print-image collation, exact recensional agreement, and French/Latin
 * witnesses are NOT yet cleared. Nothing in this file changes user-facing
 * Prayer readers or the daily historical release switch.
 */
export const PRAYER_ACQUISITION_WITNESSES_V1=Object.freeze([
  {
    "id": "lasance_prayer_before_meditation_1908_en",
    "title": "Prayer before Meditation, Study, or Spiritual Reading",
    "titleFr": "Prière avant la méditation, l'étude ou une lecture spirituelle",
    "purpose": "prepare_spiritual_reading",
    "language": "en",
    "work_kind": "PRAYER",
    "text": "My God, I firmly believe that Thou art here present, and I humbly adore Thee in union with the angels and saints. I am sorry for having sinned, because Thou art infinitely good and sin displeases Thee. I love Thee above all things and with my whole heart. I offer Thee all that I am and all that I have,—my soul with all its faculties, my body with all its senses. Enlighten my understanding and inflame my will, that I may know and do what is pleasing to Thee.\n\nI beseech Thee to direct all the powers of my soul, all my thoughts and affections to Thy service and Thy glory as well as to my own sanctification and salvation.",
    "source_page": "225",
    "notes": "Original public-domain 1908 English edition wording; whitespace and OCR artefact 'M y' normalized. NOT a modern editor's paraphrase.",
    "source": {
      "work": "F.X. Lasance, My Prayer-Book: Happiness in Goodness",
      "edition": "Benziger Brothers, 1908",
      "url": "https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day",
      "page": "225",
      "scanPageUrl": "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/240",
      "material": "HISTORICAL_ENGLISH_EDITION",
      "witness_status": "HTML_TRANSCRIPTION_VISUALLY_REVIEWED_PRINT_IMAGE_NOT_CERTIFIED"
    },
    "release": {
      "status": "STAGED_RESEARCH_NOT_LIVE",
      "translation_status": {
        "en": "HISTORICAL_ENGLISH",
        "fr": "NOT_AVAILABLE",
        "la": "NOT_ADMITTED"
      },
      "exact_print_verified": false,
      "modern_rights_clearance": "ORIGINAL_1908_TEXT_ONLY",
      "allowed_in_prayer_hub": false
    }
  },
  {
    "id": "lasance_prayer_after_meditation_1908_en",
    "title": "Prayer after Meditation",
    "titleFr": "Prière après la méditation",
    "purpose": "conclude_spiritual_reading",
    "language": "en",
    "work_kind": "PRAYER",
    "text": "O my God, I give Thee heartfelt thanks for all the graces Thou hast conferred on me during this meditation. Pardon me, I beseech Thee, all the negligence and all the distractions of which I have been guilty. Give me strength to carry out the resolutions that I have made. Fortify me, that from henceforth I may diligently practise this virtue . . . avoid this fault . . . perform this action . . . to Thy honor.\n\nHelp me to keep my good resolutions, O sweet Virgin Mary; and do thou, my good angel, recall them to my memory, if I should ever forget or neglect them. Omnia ad majorem Dei gloriam!",
    "source_page": "226",
    "notes": "Transcription normalizes obvious OCR error in printed Latin motto 'Ommia' to 'Omnia'; substantive editorial correction must be confirmed against page image before publication.",
    "source": {
      "work": "F.X. Lasance, My Prayer-Book: Happiness in Goodness",
      "edition": "Benziger Brothers, 1908",
      "url": "https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day",
      "page": "226",
      "scanPageUrl": "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/241",
      "material": "HISTORICAL_ENGLISH_EDITION",
      "witness_status": "HISTORICAL_ENGLISH_SCAN_IMAGE_COLLATED"
    },
    "release": {
      "status": "STAGED_RESEARCH_NOT_LIVE",
      "translation_status": {
        "en": "HISTORICAL_ENGLISH",
        "fr": "NOT_AVAILABLE",
        "la": "NOT_ADMITTED"
      },
      "exact_print_verified": true,
      "modern_rights_clearance": "ORIGINAL_1908_TEXT_ONLY",
      "allowed_in_prayer_hub": false
    }
  },
  {
    "id": "ignatius_suscipe_lasance_1908_en",
    "title": "Suscipe — Take, O Lord, and Receive",
    "titleFr": "Suscipe — Prenez, Seigneur, et recevez",
    "purpose": "self_offering",
    "language": "en",
    "work_kind": "PRAYER",
    "text": "Take, O Lord, and receive all my liberty, my memory, my understanding and my whole will.\n\nThou hast given me all that I am and all that I possess; I surrender it all to Thee that Thou mayest dispose of it according to Thy will. Give me only Thy love and Thy grace; with these I will be rich enough, and will have no more to desire.",
    "source_page": "227",
    "notes": "The English and Latin are printed side by side on Lasance's 1908 page 227. Both transcribed from the page image; no historical French witness is asserted.",
    "source": {
      "work": "F.X. Lasance, My Prayer-Book: Happiness in Goodness",
      "edition": "Benziger Brothers, 1908",
      "url": "https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day",
      "page": "227",
      "scanPageUrl": "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/242",
      "material": "HISTORICAL_ENGLISH_EDITION",
      "witness_status": "HISTORICAL_ENGLISH_SCAN_IMAGE_COLLATED"
    },
    "release": {
      "status": "LIVE_CLEARED",
      "translation_status": {
        "en": "HISTORICAL_ENGLISH",
        "fr": "NOT_AVAILABLE",
        "la": "NOT_ADMITTED"
      },
      "exact_print_verified": true,
      "modern_rights_clearance": "ORIGINAL_1908_TEXT_ONLY",
      "allowed_in_prayer_hub": true
    }
  },
  {
    "id": "thomas_aquinas_concede_mihi_lasance_1908_en",
    "title": "St Thomas Aquinas — Prayer before Study",
    "titleFr": "Saint Thomas d'Aquin — Prière avant l'étude",
    "purpose": "prepare_spiritual_reading",
    "language": "en",
    "work_kind": "PRAYER",
    "text": "Grant me grace, O merciful God, to desire ardently all that is pleasing to Thee, to examine it prudently, to acknowledge it truthfully, and to accomplish it perfectly, for the praise and glory of Thy name. Amen.",
    "source_page": "228",
    "notes": "English translation collated with printed image p.228. The same image contains the Latin original; preserved in a separate, source-identified Latin witness.",
    "source": {
      "work": "F.X. Lasance, My Prayer-Book: Happiness in Goodness",
      "edition": "Benziger Brothers, 1908",
      "url": "https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day",
      "page": "228",
      "scanPageUrl": "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/243",
      "material": "HISTORICAL_ENGLISH_EDITION",
      "witness_status": "HISTORICAL_ENGLISH_SCAN_IMAGE_COLLATED"
    },
    "release": {
      "status": "STAGED_RESEARCH_NOT_LIVE",
      "translation_status": {
        "en": "HISTORICAL_ENGLISH",
        "fr": "NOT_AVAILABLE",
        "la": "NOT_ADMITTED"
      },
      "exact_print_verified": true,
      "modern_rights_clearance": "ORIGINAL_1908_TEXT_ONLY",
      "allowed_in_prayer_hub": false
    }
  },
  {
    "id": "ignatius_suscipe_lasance_1908_la",
    "title": "Suscipe — St Ignatius (Latin)",
    "titleFr": "Suscipe — saint Ignace (latin)",
    "purpose": "self_offering",
    "language": "la",
    "work_kind": "PRAYER",
    "text": "Suscipe, Domine, universam meam libertatem. Accipe memoriam, intellectum atque voluntatem omnem. Quidquid habeo vel possideo, mihi largitus es; id tibi totum restituo ac tuae prorsus voluntati trado gubernandum. Amorem tui solum cum gratia tua mihi dones et dives sum satis, nec aliud quidquam ultra posco.",
    "source_page": "227",
    "notes": "The English and Latin are printed side by side on Lasance's 1908 page 227. Both transcribed from the page image; no historical French witness is asserted.",
    "source": {
      "work": "F.X. Lasance, My Prayer-Book: Happiness in Goodness",
      "edition": "Benziger Brothers, 1908",
      "url": "https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day",
      "page": "227",
      "scanPageUrl": "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/242",
      "material": "HISTORICAL_LATIN_EDITION",
      "witness_status": "LATIN_SCAN_IMAGE_COLLATED"
    },
    "release": {
      "status": "LIVE_CLEARED",
      "translation_status": {
        "en": "NOT_APPLICABLE",
        "fr": "NOT_AVAILABLE",
        "la": "PRINTED_LATIN_1908"
      },
      "exact_print_verified": true,
      "modern_rights_clearance": "ORIGINAL_1908_TEXT_ONLY",
      "allowed_in_prayer_hub": true
    }
  },
  {
    "id": "thomas_aquinas_concede_mihi_lasance_1908_la",
    "title": "Concede mihi — St Thomas Aquinas (Latin)",
    "titleFr": "Concede mihi — saint Thomas d'Aquin (latin)",
    "purpose": "prepare_spiritual_reading",
    "language": "la",
    "work_kind": "PRAYER",
    "text": "Concede mihi, misericors Deus, quae tibi placita sunt ardenter concupiscere, prudenter investigare, veraciter agnoscere et perfecte adimplere, ad laudem et gloriam nominis tui. Amen.",
    "source_page": "228",
    "notes": "Latin transcription verified against printed page 228. Preserved separately from the English translation and not silently substituted for French.",
    "source": {
      "work": "F.X. Lasance, My Prayer-Book: Happiness in Goodness",
      "edition": "Benziger Brothers, 1908",
      "url": "https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day",
      "page": "228",
      "scanPageUrl": "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/243",
      "material": "HISTORICAL_LATIN_EDITION",
      "witness_status": "LATIN_SCAN_IMAGE_COLLATED"
    },
    "release": {
      "status": "STAGED_RESEARCH_NOT_LIVE",
      "translation_status": {
        "en": "NOT_APPLICABLE",
        "fr": "NOT_AVAILABLE",
        "la": "PRINTED_LATIN_1908"
      },
      "exact_print_verified": true,
      "modern_rights_clearance": "ORIGINAL_1908_TEXT_ONLY",
      "allowed_in_prayer_hub": false
    }
  }
]);
/**
 * Runtime access defaults to a fail-closed, published-only list. Researchers
 * must explicitly request `research:true`; merely importing this module
 * must never expose a draft prayer in Prayer's direct-choice controls.
 * A missing historical source-language witness never becomes a translation.
 */
export function prayerAcquisitionCandidates(purpose,{language="en",research=false}={}){
 return PRAYER_ACQUISITION_WITNESSES_V1.filter(w=>
  w.purpose===purpose && w.language===language &&
  (research===true || (w.release.status==="LIVE_CLEARED" &&
                       w.release.allowed_in_prayer_hub===true &&
                       w.release.exact_print_verified===true))
 );
}
