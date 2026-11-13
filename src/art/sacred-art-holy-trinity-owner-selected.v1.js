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
    "quality": "HIGH_RESOLUTION_SOURCE_IDENTIFIED_NOT_DOWNLOADED",
    "notes": "KMSKA/Vlaamse Kunstcollectie lists the image as CC0; no local source master acquired."
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
    "quality": "HOLD_LOW_RESOLUTION_REFERENCE",
    "notes": "Selected artwork. Existing reference photograph is not an adequate production master. Factum Foundation has documented digitisation but not a freely reusable master."
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
    "quality": "PUBLIC_COPY_MODERATE_RESOLUTION_IMAGE_QA_PENDING",
    "notes": "RISD marks this work CC0; known online copy is modest resolution. No master acquired."
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
    "quality": "INDEPENDENT_2024_PLUS_PIXEL_COPY_NEEDS_VISUAL_REVIEW",
    "notes": "National Gallery collection reproductions have restrictive terms. Do not treat the independent Yorck Commons copy as an institutional CC0 grant."
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
    "quality": "HIGH_RESOLUTION_SOURCE_IDENTIFIED_NOT_DOWNLOADED",
    "notes": "Already indexed as HERO::khm:GG-838 among 989 research work groups: owner approval links to that identity; do not add a second research group."
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
    "quality": "INSTITUTIONAL_DOWNLOAD_IDENTIFIED_DIMENSIONS_NOT_VERIFIED",
    "notes": "The Met marks its image public domain/Open Access; exact downloaded master not yet validated."
  }
].map(ownerSelected)
);
