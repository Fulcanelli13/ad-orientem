/**
 * Research-only NGA authoritative CSV verifier for the 126 frozen accepted source cards.
 * Data source (CC0 metadata): https://github.com/NationalGalleryOfArt/opendata
 *
 * Usage (from repository root):
 *  node scripts/art/reconcile-nga-opendata-126-20261029.mjs \
 *    --objects=/path/to/nga-opendata/data/objects.csv \
 *    --associations=/path/to/nga-opendata/data/object_associations.csv \
 *    --output=/tmp/nga-126-verified.json
 *
 * The associations file is optional. The output is a *separate* research
 * evidence file. It never changes canonical assets, acceptance decisions,
 * image licences, photographs, approval locks, or the existing 383 catalogue.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const arg = name => process.argv.find(a => a.startsWith("--" + name + "="))?.slice(name.length + 3);
const objectFile = arg("objects");
const assocFile = arg("associations");
const outputFile = arg("output");
if (!objectFile || !outputFile) {
  console.error("Required: --objects=<official NGA objects.csv> --output=<new report.json> [--associations=<official object_associations.csv>]");
  process.exit(2);
}
const base = resolve("data/calendar");
const sourcePath = resolve(base, "sacred-art-phase1-nga-126-official-firstpass-20261029.v1.json");
const original = JSON.parse(readFileSync(sourcePath, "utf8"));
if (original.rows.length !== 126 || original.counts.ngaSourceCards !== 126)
  throw new Error("Frozen NGA review source count changed; refuse reconciliation.");
const byId = new Map(original.rows.map(r => [r.sourceId.replace("nga:", ""), r]));
if (byId.size !== 126) throw new Error("Frozen NGA source IDs not unique.");
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");

/** RFC 4180-style CSV scanner; handles quoted commas, escaped quotes, embedded newlines. */
function visitCSV(file, visitRow) {
  const s = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  let row = [], cell = "", quoted = false, rowNo = 0, fields = null;
  const addCell = () => { row.push(cell); cell = ""; };
  const finishRow = () => {
    addCell();
    if (rowNo === 0) fields = row.map(v => v.trim().toLowerCase());
    else if (row.some(v => v.length)) {
      const record = {};
      for (let i = 0; i < fields.length; i++) record[fields[i]] = row[i] ?? "";
      visitRow(record, rowNo);
    }
    rowNo++; row = [];
  };
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") addCell();
    else if (ch === "\n") finishRow();
    else if (ch === "\r") {
      if (s[i + 1] !== "\n") finishRow();
    } else cell += ch;
  }
  if (quoted) throw new Error("Unclosed CSV quote in " + file);
  if (cell.length || row.length) finishRow();
  return { headings: fields, lines: rowNo - 1 };
}

const matches = new Map();
let rowsSeen = 0;
const objectResult = visitCSV(resolve(objectFile), r => {
  rowsSeen++;
  const id = (r.objectid ?? "").trim();
  if (!byId.has(id)) return;
  if (matches.has(id)) throw new Error("Duplicate NGA objectID in official CSV: " + id);
  matches.set(id, {
    objectId: id, accession: r.accessionnum ?? null,
    title: r.title ?? null, attribution: r.attribution ?? null,
    classification: r.classification ?? null, medium: r.medium ?? null,
    parentId: r.parentid ?? null, isVirtual: r.isvirtual ?? null,
    series: r.series ?? null, portfolio: r.portfolio ?? null,
    provenance: r.provenancetext ?? null
  });
});
for (const field of ["objectid", "accessionnum", "title", "attribution", "isvirtual"]) {
  if (!objectResult.headings.includes(field))
    throw new Error("Official NGA CSV column missing: " + field);
}

const associations = new Map();
let relatedRows = 0;
if (assocFile) {
  visitCSV(resolve(assocFile), r => {
    const parent = r.parentobjectid, child = r.childobjectid;
    if (byId.has(parent) || byId.has(child)) {
      relatedRows++;
      for (const id of [parent, child]) {
        if (!byId.has(id)) continue;
        associations.set(id, [...(associations.get(id) ?? []), {
          parentObjectId: parent, childObjectId: child,
          relationship: r.relationship || "UNSPECIFIED"
        }]);
      }
    }
  });
}
const normalizeAccession = s => String(s ?? "").trim().toLowerCase().replace(/\s+/g, "");
const normalizeTitle = s => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/\[[^\]]+\]/g, "").replace(/[^a-z0-9]/g, "");

const rows = original.rows.map(source => {
  const objectId = source.sourceId.replace("nga:", "");
  const official = matches.get(objectId) ?? null;
  const accessionExact = official
    ? normalizeAccession(official.accession) === normalizeAccession(source.accessionFromFrozenSource)
    : false;
  const titleNormalizedEqual = official
    ? normalizeTitle(official.title) === normalizeTitle(source.reviewedTitle)
    : false;
  const flags = [];
  if (!official) flags.push("OBJECT_ID_MISSING_FROM_SNAPSHOT");
  if (official && !accessionExact) flags.push("OFFICIAL_ACCESSION_MISMATCH");
  if (official && !titleNormalizedEqual) flags.push("REVIEW_TITLE_DIFFERENT_OR_RENAMED");
  if (official && official.isVirtual === "1") flags.push("VIRTUAL_OBJECT_NOT_EXTRA_PHYSICAL_WORK");
  if (official && official.parentId) flags.push("HAS_OFFICIAL_PARENT_ID");
  if (associations.get(objectId)?.length) flags.push("OBJECT_ASSOCIATIONS_NEED_PHYSICAL_REVIEW");
  return {
    sourceId: source.sourceId, frozenReviewDecision: source.decisionFrozen,
    reviewedAccession: source.accessionFromFrozenSource,
    frozenTitle: source.reviewedTitle, frozenArtist: source.reviewedArtist,
    official: official ? {
      ...official, accessionExact, titleNormalizedEqual,
      objectAssociations: associations.get(objectId) ?? []
    } : null,
    status: !official ? "MISSING_IN_OFFICIAL_CSV_SNAPSHOT"
      : accessionExact ? "OFFICIAL_OBJECT_ID_AND_ACCESSION_MATCH"
      : "OFFICIAL_OBJECT_ID_BUT_ACCESSION_CONFLICT",
    flags,
    countedAsNewDistinctPhysicalPainting: false,
    matchedToCanonical383: false,
    sourcePhotoCertified: false, photoRightsCertified: false,
    nativeVisualCertified: false, productionMutation: false
  };
});
const counts = {
  frozenNgaSourceCards: 126,
  foundByOfficialObjectId: rows.filter(r => !!r.official).length,
  accessionExact: rows.filter(r => r.official?.accessionExact === true).length,
  accessionConflict: rows.filter(r => r.status === "OFFICIAL_OBJECT_ID_BUT_ACCESSION_CONFLICT").length,
  missingInOfficialCsv: rows.filter(r => !r.official).length,
  titleNormalizedMismatch: rows.filter(r => r.official && !r.official.titleNormalizedEqual).length,
  virtualObjects: rows.filter(r => r.official?.isVirtual === "1").length,
  associationRowsRelatedToTargetIds: relatedRows,
  newlyCertifiedDistinctPhysicalPaintings: 0,
  productionImports: 0
};
const result = {
  schema: "AO_SACRED_ART_NGA126_AUTHORITATIVE_OPEN_DATA_SNAPSHOT_REPORT_V1",
  generatedAt: new Date().toISOString(),
  sourceFrozen: "data/calendar/sacred-art-phase1-nga-126-official-firstpass-20261029.v1.json",
  sources: {
    objectsCSV: resolve(objectFile), objectsSha256: hash(resolve(objectFile)),
    associationsCSV: assocFile ? resolve(assocFile) : null,
    associationsSha256: assocFile ? hash(resolve(assocFile)) : null,
    officialDataDictionary: "https://github.com/NationalGalleryOfArt/opendata/blob/main/documentation/Data%20Dictionary.txt"
  },
  counts, notes: [
    "Object ID + accession comparison is authoritative source-data validation only, not image or editorial approval.",
    "Title differences may reflect cataloguing changes, punctuation, or historic attribution, not different artworks.",
    "A unique accession does not establish distinct physical artwork: inspect isVirtual, parentID and associations.",
    "CSV dataset contains no image bytes. Do not change original source photo approvals or release gates."
  ], rows
};
writeFileSync(resolve(outputFile), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ report: resolve(outputFile), counts, csvRowsScanned: rowsSeen }, null, 2));
