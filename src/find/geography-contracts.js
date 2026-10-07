export const EXPLORE_GEOGRAPHY_SCHEMA = "EXPLORE_GEOGRAPHY_SOT_V1";

export const AREA_SYSTEMS = Object.freeze([
  "GLOBAL",
  "CIVIL",
  "ECCLESIASTICAL",
  "CULTURAL",
  "HISTORICAL",
]);

export const AREA_TYPES = Object.freeze([
  "world",
  "country",
  "admin1",
  "admin2",
  "locality",
  "archdiocese",
  "diocese",
  "apostolic_vicariate",
  "ordinariate",
  "parish_territory",
  "cultural_region",
  "historic_region",
  "other",
]);

export const PLACE_TYPES = Object.freeze([
  "church",
  "chapel",
  "oratory",
  "cathedral",
  "basilica",
  "shrine",
  "monastery",
  "convent",
  "priory",
  "cemetery",
  "pilgrimage_destination",
  "route_waypoint",
  "city",
  "other",
]);

export const DIRECTORY_PLACE_RELATIONSHIPS = Object.freeze([
  "LOCATED_AT",
  "COLOCATED_WITH",
  "SAME_COMPLEX",
  "UNCERTAIN",
]);

export const LINK_CONFIDENCE = Object.freeze([
  "CONFIRMED",
  "PROBABLE",
  "REVIEW",
  "UNKNOWN",
]);

const areaSystemSet = new Set(AREA_SYSTEMS);
const areaTypeSet = new Set(AREA_TYPES);
const placeTypeSet = new Set(PLACE_TYPES);
const relationshipSet = new Set(DIRECTORY_PLACE_RELATIONSHIPS);
const confidenceSet = new Set(LINK_CONFIDENCE);

function issue(code, path, message) {
  return Object.freeze({ code, path, message });
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.filter(nonEmpty).length > 0;
}

function validLatLng(geo) {
  if (!geo || typeof geo !== "object") return false;
  if ([geo.lat, geo.lng].some(value => value === null || value === undefined || value === "")) return false;
  const lat = Number(geo.lat);
  const lng = Number(geo.lng);
  return Number.isFinite(lat) && lat >= -90 && lat <= 90
    && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

function hasUsableAddress(address) {
  if (!address) return false;
  if (typeof address === "string") return nonEmpty(address);
  return [address.formatted, address.line1, address.city].some(nonEmpty);
}

function aliasesOf(record) {
  const aliases = record?.name?.aliases ?? record?.aliases ?? [];
  return Array.isArray(aliases) ? aliases.filter(nonEmpty) : [];
}

export function auditGeoArea(area, path = "geo_area") {
  const issues = [];
  if (!area || typeof area !== "object") {
    return [issue("GEO_AREA_REQUIRED", path, "Geo area must be an object.")];
  }

  if (!nonEmpty(area.geo_area_id)) {
    issues.push(issue("MISSING_GEO_AREA_ID", `${path}.geo_area_id`, "Stable geo_area_id is required."));
  }
  if (!nonEmpty(area?.name?.official ?? area?.name)) {
    issues.push(issue("MISSING_GEO_AREA_NAME", `${path}.name.official`, "Canonical geo-area name is required."));
  }
  if (!areaSystemSet.has(area.area_system)) {
    issues.push(issue("INVALID_AREA_SYSTEM", `${path}.area_system`, `Unsupported area system: ${area.area_system}`));
  }
  if (!areaTypeSet.has(area.area_type)) {
    issues.push(issue("INVALID_AREA_TYPE", `${path}.area_type`, `Unsupported area type: ${area.area_type}`));
  }

  const parents = area.parent_geo_area_ids ?? [];
  if (!Array.isArray(parents)) {
    issues.push(issue("INVALID_PARENT_AREAS", `${path}.parent_geo_area_ids`, "parent_geo_area_ids must be an array."));
  } else if (nonEmpty(area.geo_area_id) && parents.includes(area.geo_area_id)) {
    issues.push(issue("SELF_PARENT_GEO_AREA", `${path}.parent_geo_area_ids`, "A geo area cannot contain itself."));
  }

  if (area.area_type === "country" && area.area_system === "CIVIL") {
    const iso = area?.codes?.iso_alpha2;
    if (!nonEmpty(iso) || !/^[A-Z]{2}$/.test(iso)) {
      issues.push(issue("COUNTRY_ISO_REQUIRED", `${path}.codes.iso_alpha2`, "Civil country areas require a two-letter uppercase ISO code."));
    }
  }

  if (area.mappable === false && (area.boundary_ref || validLatLng(area.centroid))) {
    issues.push(issue("NON_MAPPABLE_HAS_GEOMETRY", path, "Non-mappable areas should not publish boundary or centroid geometry."));
  }

  const aliases = aliasesOf(area);
  const canonical = String(area?.name?.official ?? area?.name ?? "").trim().toLocaleLowerCase();
  if (canonical && aliases.some(alias => alias.trim().toLocaleLowerCase() === canonical)) {
    issues.push(issue("REDUNDANT_GEO_ALIAS", `${path}.name.aliases`, "Alias list must not repeat the canonical name."));
  }

  return issues;
}

export function auditPlace(place, path = "place") {
  const issues = [];
  if (!place || typeof place !== "object") {
    return [issue("PLACE_REQUIRED", path, "Place must be an object.")];
  }

  if (!nonEmpty(place.place_id)) {
    issues.push(issue("MISSING_PLACE_ID", `${path}.place_id`, "Stable place_id is required."));
  }
  if (!nonEmpty(place?.name?.official ?? place?.name)) {
    issues.push(issue("MISSING_PLACE_NAME", `${path}.name.official`, "Canonical place name is required."));
  }
  if (!placeTypeSet.has(place.place_type)) {
    issues.push(issue("INVALID_PLACE_TYPE", `${path}.place_type`, `Unsupported place type: ${place.place_type}`));
  }

  const areaIds = place.geo_area_ids ?? [];
  if (!nonEmptyArray(areaIds)) {
    issues.push(issue("MISSING_PLACE_GEO_AREA", `${path}.geo_area_ids`, "Place must reference at least one geo area."));
  }

  const mappable = place.mappable !== false;
  if (mappable && !validLatLng(place.geo) && !hasUsableAddress(place.address)) {
    issues.push(issue("MISSING_PLACE_LOCATION", path, "Mappable place requires usable coordinates or a usable address."));
  }

  return issues;
}

export function auditDirectoryPlaceLink(link, path = "directory_place_link") {
  const issues = [];
  if (!link || typeof link !== "object") {
    return [issue("DIRECTORY_PLACE_LINK_REQUIRED", path, "Directory-place link must be an object.")];
  }

  for (const [field, code] of [
    ["link_id", "MISSING_LINK_ID"],
    ["venue_id", "MISSING_LINK_VENUE_ID"],
    ["place_id", "MISSING_LINK_PLACE_ID"],
  ]) {
    if (!nonEmpty(link[field])) {
      issues.push(issue(code, `${path}.${field}`, `${field} is required.`));
    }
  }

  if (!relationshipSet.has(link.relationship)) {
    issues.push(issue("INVALID_LINK_RELATIONSHIP", `${path}.relationship`, `Unsupported relationship: ${link.relationship}`));
  }
  if (!confidenceSet.has(link.confidence)) {
    issues.push(issue("INVALID_LINK_CONFIDENCE", `${path}.confidence`, `Unsupported confidence: ${link.confidence}`));
  }

  const sourceIds = link.source_ids ?? link.sourceIds ?? [];
  if (!nonEmptyArray(sourceIds)) {
    issues.push(issue("MISSING_LINK_PROVENANCE", `${path}.source_ids`, "Directory-place links require explicit source ids."));
  }

  if (link.relationship === "LOCATED_AT" && link.confidence === "CONFIRMED" && link.identity_equivalent === true) {
    issues.push(issue(
      "VENUE_PLACE_IDENTITY_COLLAPSE",
      path,
      "Directory venue and shared place must remain separate records even when the location link is confirmed.",
    ));
  }

  return issues;
}

export function assertExploreGeographyRegistry({
  geoAreas = [],
  places = [],
  directoryPlaceLinks = [],
} = {}) {
  const issues = [];
  const areaIds = new Set();
  const placeIds = new Set();

  geoAreas.forEach((area, index) => {
    issues.push(...auditGeoArea(area, `geoAreas[${index}]`));
    if (nonEmpty(area?.geo_area_id)) {
      if (areaIds.has(area.geo_area_id)) {
        issues.push(issue("DUPLICATE_GEO_AREA_ID", `geoAreas[${index}].geo_area_id`, area.geo_area_id));
      }
      areaIds.add(area.geo_area_id);
    }
  });

  geoAreas.forEach((area, index) => {
    for (const parentId of area?.parent_geo_area_ids ?? []) {
      if (nonEmpty(parentId) && !areaIds.has(parentId)) {
        issues.push(issue("UNKNOWN_PARENT_GEO_AREA", `geoAreas[${index}].parent_geo_area_ids`, parentId));
      }
    }
  });

  places.forEach((place, index) => {
    issues.push(...auditPlace(place, `places[${index}]`));
    if (nonEmpty(place?.place_id)) {
      if (placeIds.has(place.place_id)) {
        issues.push(issue("DUPLICATE_PLACE_ID", `places[${index}].place_id`, place.place_id));
      }
      placeIds.add(place.place_id);
    }
    for (const areaId of place?.geo_area_ids ?? []) {
      if (nonEmpty(areaId) && !areaIds.has(areaId)) {
        issues.push(issue("UNKNOWN_PLACE_GEO_AREA", `places[${index}].geo_area_ids`, areaId));
      }
    }
  });

  directoryPlaceLinks.forEach((link, index) => {
    issues.push(...auditDirectoryPlaceLink(link, `directoryPlaceLinks[${index}]`));
    if (nonEmpty(link?.place_id) && !placeIds.has(link.place_id)) {
      issues.push(issue("UNKNOWN_LINK_PLACE", `directoryPlaceLinks[${index}].place_id`, link.place_id));
    }
  });

  if (issues.length) {
    const error = new Error(issues.map(entry => `${entry.code} @ ${entry.path}: ${entry.message}`).join("\n"));
    error.issues = issues;
    throw error;
  }

  return Object.freeze({
    pass: true,
    counts: Object.freeze({
      geoAreas: geoAreas.length,
      places: places.length,
      directoryPlaceLinks: directoryPlaceLinks.length,
    }),
  });
}
