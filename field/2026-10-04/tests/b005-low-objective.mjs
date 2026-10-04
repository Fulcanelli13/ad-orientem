import fs from "node:fs";
import path from "node:path";
import {
  buildObjectiveTraversal,
  ObjectiveMassSession,
  sourceMomentCoverage,
} from "../src/mass/objective-engine.js";

const root = process.cwd();
const graph = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-event-graph.v1.json"), "utf8"));
const profile = JSON.parse(fs.readFileSync(path.join(root, "data/mass/low-mass-profile.v1.json"), "utf8"));

const events = graph.storage.eventFiles.flatMap((ref) => {
  const fragment = JSON.parse(fs.readFileSync(path.join(root, ref.path), "utf8"));
  return fragment.events;
});

const traversal = buildObjectiveTraversal(events, profile.maximalCoverageContext);
if (traversal.length !== profile.acceptance.maximalCertifiedTraversalEventCount) {
  throw new Error(`Low maximal traversal count ${traversal.length} != ${profile.acceptance.maximalCertifiedTraversalEventCount}`);
}

const coverage = sourceMomentCoverage(traversal);
if (coverage.length !== profile.acceptance.certifiedSourceMomentCount) {
  throw new Error(`Low SOT coverage ${coverage.length} != ${profile.acceptance.certifiedSourceMomentCount}`);
}

for (const sourceMoment of profile.acceptance.forbiddenOrUnavailableSourceMoments) {
  if (coverage.includes(sourceMoment)) throw new Error(sourceMoment + " leaked into certified Low traversal");
}

if (traversal.some((event) => event.id === "MC-HIST-010" || /Second Confiteor/i.test(event.title))) {
  throw new Error("Second Confiteor leaked into normative Low traversal");
}

const consecration = traversal.findIndex((event) => event.id === "MC-CNS-020");
const elevation = traversal.findIndex((event) => event.id === "MC-CNS-040");
if (consecration < 0 || elevation < 0 || consecration >= elevation) {
  throw new Error("Consecration/Elevation identity or ordering collapsed");
}

const sunday = buildObjectiveTraversal(events, {
  form: "LOW",
  gloriaPresent: true,
  credoPresent: true,
  faithfulCommunicantsPresent: true,
  blessingAllowed: true,
  normalLastGospel: true,
});
if (sunday.some((event) => event.id === "MC-OFF-110" || event.id === "MC-OFF-120")) {
  throw new Error("Solemn offertory incensation leaked into Low Mass");
}
if (sunday.some((event) => event.id === "MC-COM-185")) {
  throw new Error("Uncertified Low Communion-warning bell leaked into traversal");
}

const noCommunicants = buildObjectiveTraversal(events, {
  form: "LOW",
  gloriaPresent: true,
  credoPresent: true,
  faithfulCommunicantsPresent: false,
});
if (noCommunicants.some((event) => event.phase === "COMMUNION_OF_FAITHFUL")) {
  throw new Error("Faithful Communion branch did not fail closed");
}

const session = new ObjectiveMassSession(events, profile.maximalCoverageContext);
if (session.currentEventId !== "MC-PREP-010") throw new Error("Low session does not start at MC-PREP-010");
if (!session.goTo("MC-CNS-040") || session.currentEventId !== "MC-CNS-040") {
  throw new Error("Stable MC identity navigation failed");
}
const snap = session.snapshot();
if (snap.currentEventId !== "MC-CNS-040") throw new Error("Session snapshot lost MC identity");

let gated = false;
try { buildObjectiveTraversal(events, { form: "MISSA_CANTATA" }); }
catch (error) { gated = /RG-003/.test(String(error.message)); }
if (!gated) throw new Error("Missa Cantata did not fail closed behind RG-003");

console.log(`B005 Low objective traversal PASS: ${traversal.length} events / ${coverage.length} certified SOT moments.`);
