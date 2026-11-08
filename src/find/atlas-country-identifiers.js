// Source-authoritative country/territory code resolver for Atlas coverage.
//
// ISO 3166-1 alpha-2 is used for civil country GeoAreas. Kosovo uses the
// operational, user-assigned XK code and MUST NOT be asserted to be an ISO
// country code. Operational territory routing is allowed only for an explicit,
// named GeoArea, not derived from map coordinates or display-name guesses.
export const KOSOVO_OPERATIONAL_AREA_ID = "geo:territory:XK";
export const KOSOVO_OPERATIONAL_CODE = "XK";

const code = value => String(value ?? "").trim().toUpperCase();

export function atlasCoverageAreaCode(area) {
  if (!area || typeof area !== "object") return "";
  if (area.area_type === "country") {
    const iso = code(area.codes?.iso_alpha2);
    if (/^[A-Z]{2}$/.test(iso) && iso !== KOSOVO_OPERATIONAL_CODE) return iso;
  }
  if (area.geo_area_id === KOSOVO_OPERATIONAL_AREA_ID
    && area.area_system === "CIVIL"
    && area.area_type === "other"
    && !area.codes?.iso_alpha2
    && code(area.codes?.operational_alpha2) === KOSOVO_OPERATIONAL_CODE)
    return KOSOVO_OPERATIONAL_CODE;
  return "";
}

export function atlasCoverageCountryNames(areas) {
  const out = new Map();
  for (const area of Array.isArray(areas) ? areas : []) {
    const identified = atlasCoverageAreaCode(area);
    const name = String(area?.name?.official ?? "").trim();
    if (identified && name && !out.has(identified)) out.set(identified, name);
  }
  return out;
}
