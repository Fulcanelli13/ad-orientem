import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const graph = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-event-graph.v1.json"), "utf8"));
const contracts = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-contracts.v1.json"), "utf8"));
const low = JSON.parse(fs.readFileSync(path.join(root, "data/mass/low-mass-profile.v1.json"), "utf8"));
const solemn = JSON.parse(fs.readFileSync(path.join(root, "data/mass/solemn-mass-profile.v1.json"), "utf8"));
const invariantSpec = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mass-invariants.v1.json"), "utf8"));

const events = graph.storage.eventFiles.flatMap((ref) =>
  JSON.parse(fs.readFileSync(path.join(root, ref.path), "utf8")).events
);
const byId = new Map(events.map((event) => [event.id, event]));
const index = (id) => events.findIndex((event) => event.id === id);
const fail = (message) => { throw new Error(message); };

if (events.length !== 178 || byId.size !== 178) fail("Canonical MC graph cardinality changed");

// R001 — no normative Second Confiteor.
if (events.some((event) => event.sourceMomentRefs.includes("E61"))) fail("E61 is active");
if (byId.has("MC-HIST-010")) fail("Historical Second Confiteor marker is active");
if (events.some((event) => /Second Confiteor/i.test(event.title))) fail("Second Confiteor title is active");

// R004 / R008 / R020 — bell semantics and purposes remain separate.
if (events.some((event) => Object.prototype.hasOwnProperty.call(event, "bell"))) fail("bell boolean reintroduced");
const warning = byId.get("MC-CAN-070");
if (warning?.soundEvents?.[0]?.legal_status !== "PRESCRIBED") fail("pre-Consecration warning bell lost prescribed status");
if (warning?.soundEvents?.[0]?.timing !== "SHORTLY_BEFORE_CONSECRATION") fail("warning bell timing changed");

for (const id of ["MC-CNS-040", "MC-CNS-110"]) {
  const event = byId.get(id);
  if (event?.soundEvents?.[0]?.legal_status !== "PRESCRIBED") fail(id + " elevation bell lost prescribed status");
  if (!event.soundEvents[0].permitted_patterns?.includes("THREE_RINGS")) fail(id + " lost permitted three-ring pattern");
  if (!event.soundEvents[0].permitted_patterns?.some((pattern) => pattern.startsWith("CONTINUOUS"))) fail(id + " lost permitted continuous pattern");
}

const communionWarning = byId.get("MC-COM-185");
if (communionWarning?.sourceMomentRefs?.[0] !== "E60") fail("Communion warning lost E60 identity");
if (communionWarning?.forms?.LOW === "CERTIFIED") fail("uncertified Low Communion warning enabled");
if (communionWarning?.forms?.SOLEMN !== "CERTIFIED") fail("certified Solemn Communion warning disabled");
if (communionWarning?.soundEvents?.[0]?.legal_status !== "PRESCRIBED_CONDITIONALLY_IF_FAITHFUL_COMMUNICATE") {
  fail("Communion warning lost conditional prescribed status");
}
if (byId.get("MC-COM-200")?.soundEvents?.length) fail("old priest-DNSD bell restored");

// R007 / R012 — no active private celebrant Gospel before the public Gospel.
if (events.some((event) => event.sourceMomentRefs.includes("E17"))) fail("historical private Gospel E17 active");
if (byId.has("MC-GSP-040")) fail("private celebrant Gospel event active");
for (const id of ["MC-GSP-050", "MC-GSP-060", "MC-GSP-070"]) if (!byId.has(id)) fail(id + " public Gospel event missing");

// R015 — Consecration and Elevation are distinct and ordered for both Species.
for (const [words, elevation] of [["MC-CNS-020", "MC-CNS-040"], ["MC-CNS-090", "MC-CNS-110"]]) {
  if (!byId.has(words) || !byId.has(elevation)) fail(words + "/" + elevation + " missing");
  if (words === elevation || index(words) >= index(elevation)) fail(words + "/" + elevation + " collapsed or misordered");
}

// Actor scope.
for (const event of events) if (!event.actor) fail(event.id + " has no actor");
if (contracts.projectionInterfaces?.PARTICIPATE?.mayInferFromMinisterAction !== false) fail("actor propagation enabled");
if (byId.get("MC-CAN-150")?.actor !== "PRIEST") fail("Nobis quoque actor scope changed");

// Final rites.
const finalRiteIds = ["MC-END-090", "MC-END-110", "MC-END-130", "MC-END-160", "MC-END-170", "MC-END-200"];
for (const id of finalRiteIds) if (!byId.has(id)) fail(id + " missing");
for (let i = 1; i < finalRiteIds.length; i++) {
  if (index(finalRiteIds[i - 1]) >= index(finalRiteIds[i])) fail("final rites ordering regression at " + finalRiteIds[i]);
}
if (byId.get("MC-END-170")?.contentRef !== "ordinary.last_gospel_john_1_1_14") fail("normal Last Gospel identity changed");
if (byId.has("MC-END-230")) fail("app session boundary reintroduced as Mass event");

// Form scope.
if (graph.enabledCertifiedForms.join(",") !== "LOW,SOLEMN") fail("enabled core form set changed");
if (graph.researchGatedForms?.MISSA_CANTATA?.gapId !== "RG-003") fail("Missa Cantata gate changed");
if (graph.researchGatedForms?.REQUIEM?.gapId !== "RG-004") fail("Requiem gate changed");
if (JSON.stringify(graph).includes('"SUNG"')) fail("generic SUNG form identity reintroduced");
if (low.form !== "LOW" || solemn.form !== "SOLEMN") fail("objective profiles lost explicit form identity");

if (invariantSpec.invariants.length < 8) fail("invariant registry unexpectedly incomplete");

console.log("B007 Mass invariant regression PASS: 178 canonical events; settled 1962 decisions protected.");
