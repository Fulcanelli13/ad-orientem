// Known Prado-source holds, independent of approval/rating status.
// Preserves artwork records; disallows release by ID even if a mirror URL is used.
export const PRADO_SOURCE_HELD_ARTWORK_IDS = Object.freeze([
  "W05-004",
  "prado-rubens-p001647",
  "W01-001",
  "W02-001",
  "prado-rubens-p001651",
  "prado-rubens-p001655",
  "W05-008",
  "ART-eter-aul-ubens-aint-atthias-postolate",
  "W05-012",
  "G25-003",
  "ART-usepe-de-ibera-aint-erome-riting",
  "prado-ribalta-p002804",
  "G17-003",
  "ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel",
  "W40-006",
  "W38-009",
  "ART-uan-de-uanes-artyrdom-of-aint-tephen",
  "G25-016",
  "ART-nthony-van-yck-aint-rancis-in-cstasy",
  "C34:ambrosiusbensonsantodomingodeguzmanmuseodelpradomadridjpg",
  "ART-laudio-oello-aint-ominic-of-uzm-n",
  "ART-aphael-and-iulio-omano-he-isitation",
  "ART-nthony-van-yck-rowning-with-horns",
  "ART-itian-hrist-arrying-the-ross",
  "ART-iandomenico-iepolo-escent-from-the-ross-rado-assion-series",
  "ART-iandomenico-iepolo-urial-of-hrist-rado-assion-series",
  "ART-eter-aul-ubens-mmaculate-onception",
  "ART-acopo-intoretto-udith-and-olofernes",
  "ART-eter-aul-ubens-doration-of-the-agi",
  "ART-artolom-steban-urillo-onversion-of-aint-aul",
  "ART-os-de-ibera-acob-s-ream"
]);
export const isPradoHeldArtworkId = id => PRADO_SOURCE_HELD_ARTWORK_IDS.includes(id);
export const pradoProvenanceInMedia = media => {
  const parts=[media?.sourceUrl,media?.rightsEvidenceUrl,media?.attribution,
    media?.sourceInstitution,media?.originInstitution,media?.sourceMuseum,
    media?.physicalArtworkCollection,media?.imageOrigin,media?.credit];
  return parts.some(x=>typeof x==="string"&&/(?:museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i.test(x));
};
