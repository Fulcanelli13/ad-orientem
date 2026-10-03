import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { assertMissaCantataCertification, projectMissaCantataEvents } from "../src/mass/missa-cantata-projection.js";

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const fail = (m) => { throw new Error(m); };
const expect = (v, m) => { if (!v) fail(m); };

const graph = readJson("data/mass/mc-event-graph.v1.json");
const manifest = readJson("data/mass/missa-cantata-certification.v1.json");
const baseEvents = graph.storage.eventFiles.flatMap((ref) => readJson(ref.path).events);
const bindings = [];
for (const ref of manifest.files) {
  const bytes = fs.readFileSync(path.join(root, ref.path));
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  expect(sha === ref.sha256, ref.path + " hash mismatch");
  const shard = JSON.parse(bytes.toString("utf8"));
  expect(shard.bindings.length === ref.count, ref.path + " binding count mismatch");
  bindings.push(...shard.bindings);
}

const audit = assertMissaCantataCertification(manifest, bindings, baseEvents);
expect(audit.baseEvents === 178, "178-event canonical base changed");
expect(audit.bindings === 189, "189 MC bindings lost");
expect(audit.certificateOnly.length === 11, "MC certificate-only boundary changed");

const common = {
  gloriaPresent: true,
  credoPresent: true,
  sequencePresent: false,
  chantSetting: "GREGORIAN",
  faithfulCommunicantsPresent: false,
  oratioSuperPopulumPresent: false,
  blessingAllowed: true,
  normalLastGospel: true,
};
const simple = projectMissaCantataEvents(baseEvents, bindings, { ...common, form: "MISSA_CANTATA_SIMPLE" });
const incense = projectMissaCantataEvents(baseEvents, bindings, { ...common, form: "MISSA_CANTATA_INCENSE" });
const simpleIds = new Set(simple.map((e) => e.id));
const incenseIds = new Set(incense.map((e) => e.id));

for (const id of ["MC-ALT-040", "MC-OFF-110", "MC-OFF-120"]) {
  expect(!simpleIds.has(id), id + " leaked into MC Simple");
  expect(incenseIds.has(id), id + " missing from MC Incense");
}

for (const events of [simple, incense]) {
  expect(events.every((e) => baseEvents.some((base) => base.id === e.id)), "projection invented MC identity");
  expect(events.every((e) => !/\b(?:DEACON|SUBDEACON)\b/i.test(e.actorResolved ?? "")), "sacred-minister leak");
  expect(events.every((e) => !/TORCHBEAR/i.test(e.actorResolved ?? "")), "torchbearer runtime leak");
  expect(!events.some((e) => e.id === "MC-COM-160"), "formal Solemn Pax leaked into MC");
}

const epistle = incense.filter((e) => e.sourceMomentRefs?.includes("E12"));
expect(epistle.length === 3, "MC Epistle resolver must project exactly 3 E12 events");
expect(epistle.every((e) => /TONSURED CLERIC IF PRESENT; OTHERWISE CELEBRANT/.test(e.actorResolved)), "MC Epistle actor resolver changed");

const gospel = incense.filter((e) => e.sourceMomentRefs?.includes("E18"));
expect(gospel.length >= 3, "public Gospel projection incomplete");
expect(!incenseIds.has("MC-GSP-040"), "historical private Gospel became canonical");

const withCommunicants = projectMissaCantataEvents(baseEvents, bindings, {
  ...common,
  form: "MISSA_CANTATA_SIMPLE",
  faithfulCommunicantsPresent: true,
});
expect(withCommunicants.some((e) => e.id === "MC-COM-185"), "conditional Communion warning missing");
expect(!simpleIds.has("MC-COM-185"), "conditional Communion warning active without communicants");

for (const id of manifest.excludedFromCanonicalCore) {
  expect(!baseEvents.some((e) => e.id === id), id + " unexpectedly entered 178-event canonical core");
}

expect(manifest.profiles["mc-incense"].runtimeTorchbearerActor === false, "MC torchbearer guard changed");
expect(!manifest.profiles["mc-incense"].staffing.includes("TORCHBEARERS"), "MC canonical staffing contains torchbearers");

console.log(`R19 Missa Cantata projection PASS: ${baseEvents.length} canonical events; ${bindings.length} certified bindings; simple=${simple.length}; incense=${incense.length}; certificate-only=${audit.certificateOnly.length}.`);
