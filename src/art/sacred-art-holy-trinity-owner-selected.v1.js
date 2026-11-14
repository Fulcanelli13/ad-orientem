/**
 * Six exact Holy Trinity paintings explicitly selected by the owner on 13 November 2026.
 * These are artwork-level CURATED GALLERY approvals, NOT approved photo bytes,
 * prayer/calendar placements or public releases. Preserve the 989 frozen research
 * groups: Durer links to its existing canonical group instead of duplicating it.
 */
const ownerSelected = (r) => Object.freeze({
  id: "owner-selected:holy-trinity:" + r.key,
  photoModuleId: null,
  title: r.title,
  artist: r.artist,
  date: r.date,
  institution: r.institution,
  accessionNumber: r.accession,
  scene: r.scene,
  categoryIds: Object.freeze(r.categories),
  depictedPersonsCandidates: Object.freeze(["God the Father", "Jesus Christ", "Holy Spirit"]),
  scriptureAnchors: Object.freeze(["Matthew 28:19"]),
  existingMatching: Object.freeze({ existingPrayerSlots: [] }),
  ownerSelectionDate: "2026-11-13",
  ownerSelectionNumber: r.number,
  ownerApproval: "APPROVED_FOR_CURATED_GALLERY",
  subjectEvidence: "EXPLICIT_OWNER_WORK_SELECTION_20261113",
  preexisting989GroupId: r.researchGroupId,
  primaryCatalogueUrl: r.source,
  candidateImageFilePageUrl: r.filePage,
  rightsEvidenceUrl: r.rightsEvidence,
  photographRightsState: r.rights,
  reproductionQualityState: r.quality,
  // The source JPEG exists in an offline research archive, not in the app repository.
  researchOriginalAcquired: r.researchOriginalAcquired,
  researchImageArchive: r.researchImageArchive,
  sourceOriginalSha256: r.sourceOriginalSha256,
  sourcePixels: Object.freeze(r.sourcePixels),
  preferredOriginalFileUrl: r.preferredOriginalFileUrl ?? null,
  originalFileAcquired: false,
  image: null,
  original: null,
  photoReleaseState: "PHOTOGRAPH_NOT_RELEASED",
  newPhotoPublication: false,
  productionEligible: false,
  sceneIsDirectScriptureIllustration: false,
  notes: r.notes + " No automatic Prayer/Calendar assignment or production transfer."
});

export const SACRED_ART_HOLY_TRINITY_OWNER_SELECTED_V1 = Object.freeze(
  [
  {
    "key": "rubens-1620",
    "number": 1,
    "title": "The Holy Trinity",
    "artist": "Peter Paul Rubens",
    "date": "1620",
    "institution": "Royal Museum of Fine Arts Antwerp (KMSKA)",
    "accession": "314",
    "scene": "God the Father presents the dead Christ; the Holy Spirit is represented above",
    "categories": [
      "TRINITY",
      "PASSION"
    ],
    "researchGroupId": null,
    "source": "https://kmska.be/en/masterpiece/the-holy-trinity",
    "filePage": "https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_Heilige_Drievuldigheid_-_314_-_Royal_Museum_of_Fine_Arts_Antwerp.jpg",
    "rightsEvidence": "https://vlaamsekunstcollectie.be/en/collection/314",
    "rights": "CC0_SOURCE_DECLARATION",
    "quality": "VERIFIED_19178x19721_FRAMELESS_ARCHIVAL_MASTER_MOBILE_DERIVATIVES_AVAILABLE",
    "notes": "KMSKA 56.2MB original acquired and hash-verified in separate research ZIP; 768/1200/2000/3200 WebP candidates prepared. No automatic app publication.",
    "sourceOriginalSha256": "cd3477e583cf55ca2bd651aad191b916ec84a4af73b3ed36dc7e4e48b9c0ef38",
    "sourcePixels": {
      "width": 19178,
      "height": 19721
    },
    "researchOriginalAcquired": true,
    "researchImageArchive": "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip"
  },
  {
    "key": "reni-1625",
    "number": 2,
    "title": "The Holy Trinity",
    "artist": "Guido Reni",
    "date": "1625–1626",
    "institution": "Santissima Trinità dei Pellegrini, Rome",
    "accession": null,
    "scene": "Crucified Christ, God the Father and the Dove of the Holy Spirit amid angels",
    "categories": [
      "TRINITY",
      "PASSION"
    ],
    "researchGroupId": null,
    "source": "https://catalogo.beniculturali.it/detail/HistoricOrArtisticProperty/1200145358",
    "filePage": "https://commons.wikimedia.org/wiki/File:La_Trinit%C3%A0_-_Guido_Reni.jpg",
    "rightsEvidence": "https://catalogo.beniculturali.it/detail/HistoricOrArtisticProperty/1200145358",
    "rights": "PHOTOGRAPH_RIGHTS_NOT_INDEPENDENTLY_CLEARED",
    "quality": "SOURCE_HOLD_634x1193_CLEAN_REPRODUCTION_TOO_SMALL_FOR_CINEMATIC_CLOSEUPS",
    "notes": "The 634x1193 direct reproduction is a study reference only; larger church photographs are not frameless artwork masters. Factum Foundation's colour recording has no verified free public download.",
    "sourceOriginalSha256": "072a057948a88931b84f18699554fa50386ef84c4beb9cf448c3778cd74b7955",
    "sourcePixels": {
      "width": 634,
      "height": 1193
    },
    "researchOriginalAcquired": true,
    "researchImageArchive": "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip"
  },
  {
    "key": "dolci-1640",
    "number": 3,
    "title": "The Trinity in Glory",
    "artist": "Carlo Dolci",
    "date": "c. 1640",
    "institution": "Rhode Island School of Design Museum",
    "accession": "59.009",
    "scene": "God the Father, the risen Son and the Holy Spirit in glory",
    "categories": [
      "TRINITY"
    ],
    "researchGroupId": null,
    "source": "https://risdmuseum.org/art-design/collection/trinity-glory-59009",
    "filePage": "https://commons.wikimedia.org/wiki/File:Carlo_Dolci_-_The_Trinity_in_Glory_-_59.009_-_Rhode_Island_School_of_Design_Museum.jpg",
    "rightsEvidence": "https://risdmuseum.org/art-design/collection/trinity-glory-59009",
    "rights": "MUSEUM_CC0",
    "quality": "RISD_CC0_877x1024_NATIVE_DETAIL_LIMITED_DO_NOT_UPSCALE",
    "notes": "RISD public CC0 reproduction acquired and hash-verified; clean visual reproduction but only 877x1024. Limited/subtle cinematic motion only. Larger source not proven publicly accessible.",
    "sourceOriginalSha256": "bf2e2ddf7920d04ceb9ea92eeb15bccb39dbe38e2264451bf94ae8a21ce234fc",
    "sourcePixels": {
      "width": 877,
      "height": 1024
    },
    "researchOriginalAcquired": true,
    "researchImageArchive": "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip"
  },
  {
    "key": "tiepolo-1735",
    "number": 4,
    "title": "A Vision of the Trinity",
    "artist": "Giovanni Battista Tiepolo",
    "date": "c. 1735–1739",
    "institution": "National Gallery, London",
    "accession": "NG6273",
    "scene": "Vision of the Trinity appearing to Pope Saint Clement, surrounded by angels",
    "categories": [
      "TRINITY",
      "SAINTS"
    ],
    "researchGroupId": null,
    "source": "https://www.nationalgallery.org.uk/paintings/giovanni-battista-tiepolo-a-vision-of-the-trinity",
    "filePage": "https://commons.wikimedia.org/wiki/File:Giovanni_Battista_Tiepolo_094.jpg",
    "rightsEvidence": "https://www.nationalgallery.org.uk/terms-of-use",
    "rights": "INDEPENDENT_REPRODUCTION_RIGHTS_REVIEW_REQUIRED",
    "quality": "YORCK_2024x2623_UNCALIBRATED_COLOUR_RIGHTS_HOLD",
    "notes": "The 2024x2623 Yorck Project reproduction was acquired for research. National Gallery's official images are restricted for commercial use; Yorck PD-Art is not equivalent to museum CC0; colour fidelity not verified.",
    "sourceOriginalSha256": "18fcac3ebc74eb3ae0730cf7d662008f58c7c19ebc19691e1cf9e08de764bf65",
    "sourcePixels": {
      "width": 2024,
      "height": 2623
    },
    "researchOriginalAcquired": true,
    "researchImageArchive": "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip"
  },
  {
    "key": "durer-1511",
    "number": 8,
    "title": "The Adoration of the Holy Trinity",
    "artist": "Albrecht Dürer",
    "date": "1511",
    "institution": "Kunsthistorisches Museum, Vienna",
    "accession": "GG 838",
    "scene": "The Holy Trinity adored by saints and the heavenly assembly",
    "categories": [
      "TRINITY",
      "SAINTS"
    ],
    "researchGroupId": "HERO::khm:GG-838",
    "source": "https://artsandculture.google.com/asset/adoration-of-the-trinity-landauer-altar/_wGp9zTkz0OVqQ",
    "filePage": "https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Adoration_of_the_Trinity_(Landauer_Altar)_-_Google_Art_Project.jpg",
    "rightsEvidence": "https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Adoration_of_the_Trinity_(Landauer_Altar)_-_Google_Art_Project.jpg",
    "rights": "PUBLIC_DOMAIN_REPRODUCTION_CLAIM_REVIEW_PENDING",
    "quality": "GOOGLE_ART_PROJECT_4969x5434_CLEAN_SOURCE_KHM_RIGHTS_HOLD",
    "notes": "Acquired and hash-verified Google Art Project frameless reproduction, linked to existing research group HERO::khm:GG-838. Official KHM image terms restrict commercial reuses; independent Commons PD-Art claim requires review.",
    "sourceOriginalSha256": "137d3df4dee890524678cbd02b9690130c5550d22ca6778621b24fc6fe6ab5b2",
    "sourcePixels": {
      "width": 4969,
      "height": 5434
    },
    "researchOriginalAcquired": true,
    "researchImageArchive": "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip"
  },
  {
    "key": "campeche-1790",
    "number": 9,
    "title": "The Trinity",
    "artist": "José Campeche",
    "date": "c. 1790",
    "institution": "Metropolitan Museum of Art, New York",
    "accession": "2025.244",
    "scene": "The Father and Son enthroned beneath the Holy Spirit, with the Sanctus triangle",
    "categories": [
      "TRINITY"
    ],
    "researchGroupId": null,
    "source": "https://www.metmuseum.org/art/collection/search/917618",
    "filePage": "https://www.metmuseum.org/art/collection/search/917618",
    "rightsEvidence": "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
    "rights": "MET_OPEN_ACCESS_CC0",
    "quality": "MET_CC0_2700x4000_FULL_ORIGINAL_CINEMATIC_MOBILE_DERIVATIVES_AVAILABLE",
    "notes": "Verified direct Met 2700x4000 original at images.metmuseum.org/CRDImages/ad/original/DP-44679-003.jpg. WebP mobile versions trim only the black studio surround, preserving painting and original master.",
    "sourceOriginalSha256": "8578e12ebb3c067c567b882fb48e9ca1d008c71ab6e53f3590269892711065bb",
    "sourcePixels": {
      "width": 2700,
      "height": 4000
    },
    "researchOriginalAcquired": true,
    "researchImageArchive": "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip",
    "preferredOriginalFileUrl": "https://images.metmuseum.org/CRDImages/ad/original/DP-44679-003.jpg"
  }
].map(ownerSelected)
);
