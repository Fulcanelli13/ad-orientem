import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditVenue } from "../../src/find/contracts.js";
import { findDuplicateCandidates } from "../../src/find/entity-resolution.js";

export const SSPX_API_BASE = "https://map.fsspx.org/api/v1";
export const SSPX_SOURCE_REGISTRY_ID = "SRC_SSPX_MAP_API";

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null && String(value).trim() !== "") ?? null;
}

function addressValue(address, ...keys) {
  if (!address || typeof address !== "object") return null;
  for (const key of keys) {
    if (address[key] !== undefined && address[key] !== null && String(address[key]).trim() !== "") {
      return String(address[key]).trim();
    }
  }
  return null;
}

function normalizeAddressObject(place) {
  const address = place?.address && typeof place.address === "object" ? place.address : {};
  const line1 = firstDefined(
    addressValue(address, "line1", "address1", "street", "street1", "address"),
    place?.street,
  );
  const line2 = addressValue(address, "line2", "address2", "street2");
  const postalCode = firstDefined(
    addressValue(address, "postalCode", "postal_code", "zip", "postcode"),
    place?.postalCode,
  );
  const city = firstDefined(addressValue(address, "city", "locality"), place?.city);
  const region = firstDefined(addressValue(address, "region", "state", "province"), place?.region);
  const countryCode = firstDefined(
    addressValue(address, "countryCode", "country_code"),
    place?.countryCode,
  );
  const country = addressValue(address, "country", "countryName");
  const formatted = firstDefined(
    addressValue(address, "formatted", "formattedAddress", "full"),
    [line1, line2, postalCode, city, region, country].filter(Boolean).join(", "),
  );
  return Object.freeze({
    line1,
    line2,
    postal_code: postalCode,
    city,
    region,
    country_code: countryCode,
    country,
    formatted,
  });
}

function stableVenueId(place) {
  const upstream = firstDefined(place?.crmId, place?.slug, place?.name);
  return `ao-sspx-${slugify(upstream)}`;
}

function placeSourceId(place) {
  return `src-sspx-place-${slugify(firstDefined(place?.crmId, place?.slug, place?.name))}`;
}

function canonicalCommunityFor(place) {
  if (place?.relationship === "fsspx") {
    return Object.freeze({
      community_id: "SSPX",
      canonical_confidence: "DIRECT",
      external_community_name: null,
    });
  }
  return Object.freeze({
    community_id: "OTHER",
    canonical_confidence: "REVIEW",
    external_community_name: place?.community ?? null,
  });
}

function venueTypeFor(place) {
  const map = new Map([
    ["chapel", "chapel"],
    ["mission", "mission"],
    ["monastery", "monastery"],
    ["convent", "convent"],
    ["priory", "priory"],
    ["seminary", "seminary"],
    ["residence", "residence"],
    ["retreat_house", "retreat_house"],
    ["school", "school_chapel"],
  ]);
  return map.get(place?.kind) ?? "other";
}

function validNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function contactList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [String(value)];
}

export function mapSspxPlace(place) {
  if (!place || typeof place !== "object") throw new TypeError("mapSspxPlace requires a place object");
  const venueId = stableVenueId(place);
  const sourceId = placeSourceId(place);
  const community = canonicalCommunityFor(place);
  const address = normalizeAddressObject(place);
  const lat = validNumber(place?.lat);
  const lng = validNumber(place?.lng);

  const venue = {
    venue_id: venueId,
    name: {
      official: firstDefined(place?.churchTitle, place?.name) ?? "Unnamed SSPX directory place",
      alternate: [place?.name, place?.churchTitle].filter(Boolean)
        .map(String)
        .filter((value, index, list) => list.indexOf(value) === index),
    },
    venue_type: venueTypeFor(place),
    upstream: {
      provider: "SSPX_MAP_API",
      crm_id: place?.crmId ?? null,
      slug: place?.slug ?? null,
      relationship: place?.relationship ?? null,
      community: place?.community ?? null,
      kind: place?.kind ?? null,
      also_kinds: Array.isArray(place?.alsoKinds) ? place.alsoKinds : [],
      tags: Array.isArray(place?.tags) ? place.tags : [],
      served_by: place?.servedBy ?? null,
      serves: Array.isArray(place?.serves) ? place.serves : [],
    },
    address,
    geo: {
      lat,
      lng,
      precision: lat !== null && lng !== null ? "upstream_exact_or_asserted" : "unknown",
      geocoding_source: "SSPX_MAP_API",
    },
    diocese: {
      diocese_id: null,
      name: null,
      type: "diocese",
    },
    contact: {
      phone: contactList(place?.phone),
      email: [],
      website: contactList(place?.website),
      schedule_url: place?.url ? [String(place.url)] : [],
      bulletin_url: [],
      contact_form: contactList(place?.contactUrl),
      official_social: [],
    },
    capabilities: {
      sunday_mass: Boolean(place?.sundayMass),
      weekday_mass: Boolean(place?.weekdayMass),
      mass_frequency: place?.massFrequency ?? null,
    },
    status: "active",
    source_ids: [sourceId],
    upstream_updated_at: place?.updatedAt ?? null,
  };

  const ministry = {
    ministry_id: `ao-ministry-${venueId}`,
    venue_id: venueId,
    community_id: community.community_id,
    external_community_name: community.external_community_name,
    affiliation_confidence: community.canonical_confidence,
    upstream_relationship: place?.relationship ?? null,
    relationship: place?.relationship === "fsspx" ? "operated_by" : "unknown",
    community_profile_ref: community.community_id === "SSPX" ? "SSPX" : null,
    liturgical_usage: {
      family: "ROMAN",
      books: "UNKNOWN",
      mass_form: "TRADITIONAL_LATIN",
      evidence_source_ids: [],
    },
    active: true,
    source_ids: [sourceId],
  };

  const schedules = (Array.isArray(place?.schedules) ? place.schedules : []).map((schedule, index) => ({
    schedule_id: `ao-schedule-${slugify(venueId)}-${index + 1}`,
    ministry_id: ministry.ministry_id,
    service_type: "SOURCE_ASSERTION",
    mass_type: "UNKNOWN",
    source_kind: schedule?.source ?? null,
    upstream_kind: schedule?.kind ?? null,
    priority: schedule?.priority ?? null,
    language: schedule?.lang ?? place?.lang ?? null,
    payload: schedule?.payload ?? null,
    upstream_updated_at: schedule?.updatedAt ?? null,
    source_ids: [sourceId],
    verification: {
      state: "OFFICIAL_LIVE",
      checked_at: schedule?.updatedAt ?? place?.updatedAt ?? null,
    },
  }));

  const source = {
    source_id: sourceId,
    registry_source_id: SSPX_SOURCE_REGISTRY_ID,
    source_type: "COMMUNITY_OFFICIAL",
    publisher: "Society of Saint Pius X",
    title: firstDefined(place?.name, place?.churchTitle, "SSPX directory place"),
    url: place?.url ?? null,
    upstream_sources: place?.sources ?? null,
    upstream_updated_at: place?.updatedAt ?? null,
    retrieved_at: null,
    authority: "PRIMARY",
    fields_supported: [
      "venue",
      "venue.contact",
      "venue.geo",
      "ministry.upstream_relationship",
      "schedule",
    ],
  };

  return Object.freeze({ venue, ministry, schedules, source });
}

export function buildCanonicalSspxDataset(places, { retrievedAt = new Date().toISOString() } = {}) {
  const venueRecords = [];
  const ministryRecords = [];
  const scheduleRecords = [];
  const sourceRecords = [];
  const validationIssues = [];

  for (const place of Array.isArray(places) ? places : []) {
    const mapped = mapSspxPlace(place);
    mapped.source.retrieved_at = retrievedAt;
    venueRecords.push(mapped.venue);
    ministryRecords.push(mapped.ministry);
    scheduleRecords.push(...mapped.schedules);
    sourceRecords.push(mapped.source);

    for (const entry of auditVenue(mapped.venue, `venue:${mapped.venue.venue_id}`)) {
      validationIssues.push(entry);
    }
  }

  const seenUpstream = new Map();
  const duplicateUpstreamIds = [];
  for (const venue of venueRecords) {
    const upstreamId = venue?.upstream?.crm_id ?? venue?.upstream?.slug;
    if (!upstreamId) continue;
    if (seenUpstream.has(upstreamId)) {
      duplicateUpstreamIds.push({
        upstream_id: upstreamId,
        left_venue_id: seenUpstream.get(upstreamId),
        right_venue_id: venue.venue_id,
      });
    } else {
      seenUpstream.set(upstreamId, venue.venue_id);
    }
  }

  const duplicateCandidates = findDuplicateCandidates(venueRecords);
  const publishableIds = new Set(
    venueRecords
      .filter(venue => auditVenue(venue).length === 0)
      .map(venue => venue.venue_id),
  );

  const geojson = {
    type: "FeatureCollection",
    features: venueRecords
      .filter(venue => publishableIds.has(venue.venue_id))
      .filter(venue => venue?.geo?.lat !== null && venue?.geo?.lat !== undefined && venue?.geo?.lng !== null && venue?.geo?.lng !== undefined)
      .filter(venue => Number.isFinite(Number(venue.geo.lat)) && Number.isFinite(Number(venue.geo.lng)))
      .map(venue => {
        const ministry = ministryRecords.find(item => item.venue_id === venue.venue_id);
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [Number(venue.geo.lng), Number(venue.geo.lat)],
          },
          properties: {
            venue_id: venue.venue_id,
            name: venue.name.official,
            venue_type: venue.venue_type,
            country_code: venue.address.country_code,
            city: venue.address.city,
            community_id: ministry?.community_id ?? "UNKNOWN",
            upstream_relationship: ministry?.upstream_relationship ?? null,
            sunday_mass: venue.capabilities.sunday_mass,
            weekday_mass: venue.capabilities.weekday_mass,
          },
        };
      }),
  };

  const report = {
    schema: "AO_DIRECTORY_SSPX_IMPORT_REPORT_V1",
    retrieved_at: retrievedAt,
    place_count: venueRecords.length,
    ministry_count: ministryRecords.length,
    schedule_assertion_count: scheduleRecords.length,
    source_count: sourceRecords.length,
    geo_feature_count: geojson.features.length,
    validation_issue_count: validationIssues.length,
    duplicate_upstream_id_count: duplicateUpstreamIds.length,
    duplicate_candidate_count: duplicateCandidates.length,
    auto_merge_safe_count: duplicateCandidates.filter(item => item.classification === "AUTO_MERGE_SAFE").length,
    review_candidate_count: duplicateCandidates.filter(item => item.classification === "REVIEW").length,
  };

  return Object.freeze({
    venues: venueRecords,
    ministries: ministryRecords,
    schedules: scheduleRecords,
    sources: sourceRecords,
    geojson,
    validationIssues,
    duplicateUpstreamIds,
    duplicateCandidates,
    report,
  });
}

async function fetchJson(url, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Ad-Orientem-Directory-Importer/1.0",
    },
  });
  if (!response.ok) throw new Error(`SSPX API ${response.status} for ${url}`);
  return response.json();
}

export async function fetchAllSspxPlaceSummaries({
  lang = "en",
  pageSize = 1000,
  fetchImpl = fetch,
} = {}) {
  const items = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const url = new URL(`${SSPX_API_BASE}/places`);
    url.searchParams.set("lang", lang);
    url.searchParams.set("limit", String(Math.min(1000, Math.max(1, pageSize))));
    url.searchParams.set("offset", String(offset));
    const page = await fetchJson(url, { fetchImpl });
    const batch = Array.isArray(page?.items) ? page.items : [];
    total = Number.isFinite(Number(page?.total)) ? Number(page.total) : offset + batch.length;
    items.push(...batch);
    if (!batch.length) break;
    offset += batch.length;
  }
  return items;
}

async function concurrentMap(items, concurrency, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));
  return results;
}

export async function fetchSspxPlaceDetails(summaries, {
  lang = "en",
  concurrency = 6,
  fetchImpl = fetch,
} = {}) {
  return concurrentMap(summaries, concurrency, async summary => {
    const identifier = summary?.slug ?? summary?.crmId;
    if (!identifier) return summary;
    const url = new URL(`${SSPX_API_BASE}/places/${encodeURIComponent(identifier)}`);
    url.searchParams.set("lang", lang);
    try {
      return await fetchJson(url, { fetchImpl });
    } catch (error) {
      return {
        ...summary,
        _importWarning: String(error?.message ?? error),
      };
    }
  });
}

function parseArgs(argv) {
  const options = {
    lang: "en",
    out: "data/directory/generated/sspx",
    concurrency: 6,
    details: true,
  };
  for (const arg of argv) {
    if (arg.startsWith("--lang=")) options.lang = arg.slice("--lang=".length);
    else if (arg.startsWith("--out=")) options.out = arg.slice("--out=".length);
    else if (arg.startsWith("--concurrency=")) options.concurrency = Number(arg.slice("--concurrency=".length)) || 6;
    else if (arg === "--no-details") options.details = false;
  }
  return options;
}

async function writeJson(file, value) {
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export async function runSspxImport(options = {}) {
  const summaries = await fetchAllSspxPlaceSummaries(options);
  const places = options.details === false
    ? summaries
    : await fetchSspxPlaceDetails(summaries, options);

  const retrievedAt = new Date().toISOString();
  const dataset = buildCanonicalSspxDataset(places, { retrievedAt });
  const outDir = path.resolve(options.out ?? "data/directory/generated/sspx");
  await fs.mkdir(outDir, { recursive: true });

  await writeJson(path.join(outDir, "venues.v1.json"), {
    schema: "AO_DIRECTORY_VENUES_V1",
    generated_at: retrievedAt,
    records: dataset.venues,
  });
  await writeJson(path.join(outDir, "ministries.v1.json"), {
    schema: "AO_DIRECTORY_MINISTRIES_V1",
    generated_at: retrievedAt,
    records: dataset.ministries,
  });
  await writeJson(path.join(outDir, "schedules.v1.json"), {
    schema: "AO_DIRECTORY_SCHEDULE_ASSERTIONS_V1",
    generated_at: retrievedAt,
    records: dataset.schedules,
  });
  await writeJson(path.join(outDir, "sources.v1.json"), {
    schema: "AO_DIRECTORY_SOURCES_V1",
    generated_at: retrievedAt,
    records: dataset.sources,
  });
  await writeJson(path.join(outDir, "geo.v1.geojson"), dataset.geojson);
  await writeJson(path.join(outDir, "dedupe-review.v1.json"), {
    schema: "AO_DIRECTORY_DEDUPE_REVIEW_V1",
    generated_at: retrievedAt,
    duplicate_upstream_ids: dataset.duplicateUpstreamIds,
    candidates: dataset.duplicateCandidates,
  });
  await writeJson(path.join(outDir, "validation-issues.v1.json"), {
    schema: "AO_DIRECTORY_VALIDATION_ISSUES_V1",
    generated_at: retrievedAt,
    issues: dataset.validationIssues,
  });
  await writeJson(path.join(outDir, "import-report.v1.json"), dataset.report);

  if (dataset.duplicateUpstreamIds.length) {
    throw new Error(`SSPX import blocked: ${dataset.duplicateUpstreamIds.length} duplicated upstream identifiers.`);
  }

  return dataset.report;
}

const invokedDirectly = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
  : false;

if (invokedDirectly) {
  const options = parseArgs(process.argv.slice(2));
  runSspxImport(options)
    .then(report => {
      process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    })
    .catch(error => {
      console.error(error);
      process.exitCode = 1;
    });
}
