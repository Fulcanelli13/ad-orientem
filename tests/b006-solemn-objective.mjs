import fs from "node:fs";
import path from "node:path";
import {
  buildObjectiveTraversal,
  sourceMomentCoverage,
} from "../src/mass/objective-engine.js";

const root = process.cwd();
const graph = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-event-graph.v1.json"), "utf8"));
const profile = JSON.parse(fs.readFileSync(path.join(root, "data/mass/solemn-mass-profile.v1.json"), "utf8"));

const events = graph.storage.eventFiles.flatMap((ref) => {
  const fragment = JSON.parse(fs.readFileSync(path.join(root, ref.path), "utf8"));
  return fragment.events;
});

const gregorian = buildObjectiveTraversal(events, profile.maximalGregorianContext);
const deferred = buildObjectiveTraversal(events, profile.maximalDeferredBenedictusContext);

for (const traversal of [gregorian, deferred]) {
  if (traversal.length !== profile.acceptance.maximalSingleTraversalEventCount) {
    throw new Error(`Solemn maximal traversal count ${traversal.length} != ${profile.acceptance.maximalSingleTraversalEventCount}`);
  }
}

const union = new Map([...gregorian, ...deferred].map((event) => [event.id, event]));
if (union.size !== profile.acceptance.unionCertifiedEventCountAcrossChantBranches) {
  throw new Error(`Solemn event-union count ${union.size} != ${profile.acceptance.unionCertifiedEventCountAcrossChantBranches}`);
}

const coverage = sourceMomentCoverage([...union.values()]);
if (coverage.length !== profile.acceptance.certifiedSourceMomentCount) {
  throw new Error(`Solemn SOT coverage ${coverage.length} != ${profile.acceptance.certifiedSourceMomentCount}`);
}
for (const sourceMoment of profile.acceptance.forbiddenSourceMoments) {
  if (coverage.includes(sourceMoment)) throw new Error(sourceMoment + " leaked into certified Solemn traversal");
}

for (const requiredId of ["MC-ALT-040", "MC-OFF-110", "MC-OFF-120", "MC-COM-150", "MC-COM-160", "MC-COM-185"]) {
  if (!union.has(requiredId)) throw new Error(requiredId + " missing from certified Solemn union");
}

if (!gregorian.some((event) => event.id === "MC-SAN-040") || gregorian.some((event) => event.id === "MC-SAN-050")) {
  throw new Error("Gregorian Sanctus/Benedictus branch is wrong");
}
if (!deferred.some((event) => event.id === "MC-SAN-050") || deferred.some((event) => event.id === "MC-SAN-040")) {
  throw new Error("Deferred Benedictus branch is wrong");
}

const communionWarning = union.get("MC-COM-185");
if (communionWarning.soundEvents?.[0]?.legal_status !== "PRESCRIBED_CONDITIONALLY_IF_FAITHFUL_COMMUNICATE") {
  throw new Error("Solemn Communion-warning bell lost its legal/status contract");
}
const priestDnsd = union.get("MC-COM-200");
if (priestDnsd.soundEvents?.length) {
  throw new Error("Old priest-DNSD bell was incorrectly restored as the Communion-warning signal");
}

if (union.has("MC-GSP-040")) throw new Error("Historical private celebrant Gospel leaked into Solemn");
if ([...union.values()].some((event) => event.id === "MC-HIST-010" || /Second Confiteor/i.test(event.title))) {
  throw new Error("Second Confiteor leaked into Solemn");
}

const consecration = [...union.values()].find((event) => event.id === "MC-CNS-020");
const elevation = [...union.values()].find((event) => event.id === "MC-CNS-040");
if (!consecration || !elevation || consecration.id === elevation.id) {
  throw new Error("Consecration/Elevation identity collapsed");
}

let missaCantataGated = false;
try { buildObjectiveTraversal(events, { form: "MISSA_CANTATA" }); }
catch (error) { missaCantataGated = /RG-003/.test(String(error.message)); }
if (!missaCantataGated) throw new Error("Missa Cantata did not fail closed behind RG-003");

if (JSON.stringify(profile).includes('"form": "SUNG"')) {
  throw new Error("Generic Sung form identity reintroduced");
}

console.log(`B006 Solemn objective traversal PASS: ${union.size} certified MC events / ${coverage.length} SOT moments across explicit chant branches.`);
