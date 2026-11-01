/**
 * Source embargo for Museo del Prado reproductions.
 * An approved *artwork* remains approved; only its acquisition/publication source is held.
 * Does not make a legal claim about public-domain artworks in general.
 */
export const PRADO_SOURCE_HOLD = "HOLD_PRADO_SOURCE_POLICY";
const PRADO = /(?:museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i;
export function hasPradoProvenance(value) {
  if (typeof value === "string") return PRADO.test(value);
  if (!value || typeof value !== "object") return false;
  // Check provenance-identifying fields, not artist names or arbitrary prose.
  const fields = ["id", "artworkId", "title", "sourceUrl", "sourceObjectUrl",
    "filePageUrl", "commonsTitle", "originalSourcePage", "verifiedMuseumAccession",
    "museum", "institution", "sourceKind", "location", "objectUrl"];
  return fields.some(k => typeof value[k] === "string" && PRADO.test(value[k]));
}
export function commonsMetadataHasPradoProvenance(meta) {
  if (!meta || typeof meta !== "object") return false;
  const names = ["Credit","Source","Attribution","AttributionRequired","ImageDescription",
    "ObjectName","UsageTerms","Artist","LicenseUrl","Categories"];
  return names.some(k => {
    const x = meta[k]?.value;
    return typeof x === "string" && PRADO.test(x);
  });
}
