import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";

const root = process.cwd();
const graph = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-event-graph.v1.json"), "utf8"));
const contracts = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-contracts.v1.json"), "utf8"));

const fail = (message) => { throw new Error(message); };
const ids = new Set();
const mapped = new Set();
const events = [];

for (const ref of graph.storage.eventFiles) {
  const full = path.join(root, ref.path);
  const bytes = fs.readFileSync(full);
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  if (sha !== ref.sha256) fail(ref.path + " hash mismatch");
  const fragment = JSON.parse(bytes.toString("utf8"));
  if (fragment.events.length !== ref.eventCount) fail(ref.path + " count mismatch");
  events.push(...fragment.events);
}

if (events.length !== graph.counts.events) fail("graph event count mismatch");

for (const event of events) {
  if (!/^MC-[A-Z0-9-]+$/.test(event.id)) fail("bad MC id " + event.id);
  if (ids.has(event.id)) fail("duplicate MC id " + event.id);
  ids.add(event.id);
  if (!event.sourceMomentRefs?.length) fail(event.id + " has no SOT trace");
  for (const ref of event.sourceMomentRefs) {
    if (!/^E(?:0[1-9]|[1-6][0-9]|7[01])$/.test(ref)) fail(event.id + " has bad E ref " + ref);
    mapped.add(ref);
  }
  if (!event.actor || typeof event.actor !== "string") fail(event.id + " actor scope not explicit");
  if ("bell" in event) fail(event.id + " reintroduced bell boolean");
  if (!event.forms?.LOW || !event.forms?.SOLEMN) fail(event.id + " missing form scope");
}

if (events.some((event) => event.sourceMomentRefs.includes("E17"))) fail("historical private Gospel active");
if (events.some((event) => event.sourceMomentRefs.includes("E61"))) fail("Second Confiteor active");
if (events.some((event) => event.id === "MC-END-230")) fail("app session boundary inside MC graph");
if (graph.enabledCertifiedForms.join(",") !== "LOW,SOLEMN") fail("uncertified form enabled");
if (graph.counts.certifiedSourceMomentsMissing !== 0) fail("certified SOT source moment missing");
if (contracts.sound.bellBooleanForbidden !== true) fail("bell contract regression");
if (contracts.projectionInterfaces.PARTICIPATE.mayInferFromMinisterAction !== false) fail("actor propagation reintroduced");

console.log("Wave 1 contract validation PASS: " + events.length + " MC events, " + mapped.size + " SOT moments represented.");
