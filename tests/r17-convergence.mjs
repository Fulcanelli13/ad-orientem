import fs from "node:fs";
import path from "node:path";
import {
  makeResolvedMass,
  compileMassPlan,
  MASS_FORMS,
  PRESENTATION_MODES,
} from "../src/mass/session-engine.js";
import { projectPractice, assertPracticeProjection } from "../src/mass/practice-projection.js";

const root = process.cwd();
const forms = JSON.parse(fs.readFileSync(path.join(root, "data/mass/form-registry.v2.json"), "utf8"));
const overlays = JSON.parse(fs.readFileSync(path.join(root, "data/mass/rite-overlay-registry.v1.json"), "utf8"));
const graph = JSON.parse(fs.readFileSync(path.join(root, "data/mass/mc-event-graph.v1.json"), "utf8"));
const mcCertified = JSON.parse(fs.readFileSync(path.join(root, "data/mass/missa-cantata-certified-profile.v1.json"), "utf8"));
const specialCore = JSON.parse(fs.readFileSync(path.join(root, "data/mass/special-days-core.v1.1.json"), "utf8"));
const specialExt = JSON.parse(fs.readFileSync(path.join(root, "data/mass/special-days-extension.v1.3.json"), "utf8"));
const events = graph.storage.eventFiles.flatMap((ref) =>
  JSON.parse(fs.readFileSync(path.join(root, ref.path), "utf8")).events
);
const fail = (message) => { throw new Error(message); };
const expect = (condition, message) => { if (!condition) fail(message); };

expect(MASS_FORMS.length === 4, "four Mass forms required");
expect(PRESENTATION_MODES.join(",") === "MISSAL,SIMPLE,LIVE", "presentation mode contract changed");
expect(forms.forms.MISSA_CANTATA_SIMPLE.certifiedBindings === 189, "MC simple 189 bindings lost");
expect(forms.forms.MISSA_CANTATA_INCENSE.certifiedBindings === 189, "MC incense 189 bindings lost");
expect(forms.forms.MISSA_CANTATA_SIMPLE.sacredMinisters === false, "MC simple sacred minister leak");
expect(forms.forms.MISSA_CANTATA_INCENSE.sacredMinisters === false, "MC incense sacred minister leak");
expect(forms.forms.SOLEMN.sacredMinisters === true, "Solemn sacred topology lost");
expect(mcCertified.status === "RG003_CERTIFIED_ORDINARY_MISSA_CANTATA", "full MC certification status changed");
expect(mcCertified.e_audit.length === 71, "full MC E-audit must remain 71/71");
expect(mcCertified.mc_bindings.length === 189, "full MC binding map must remain 189/189");
expect(mcCertified.form_contract.sacred_ministers.deacon === false, "full MC profile leaked deacon");
expect(mcCertified.form_contract.sacred_ministers.subdeacon === false, "full MC profile leaked subdeacon");
expect(specialCore.graphs.GF.length === 56, "Good Friday graph must remain 56 events");
expect(specialCore.graphs.EV.length === 38, "Easter Vigil graph must remain 38 events");

const expectedCounts = {
  REQUIEM: 18,
  REQUIEM_ABSOLUTION: 5,
  ASPERGES: 6,
  PALM: 12,
  ASH: 8,
  CANDLEMAS: 11,
  HOLY_THURSDAY_POST: 6,
  GOOD_FRIDAY: 56,
  EASTER_VIGIL: 38,
  ROGATIONS: 6,
  EMBER_LESSONS: 5,
  GENERIC_PROCESSION: 7,
  CORPUS_CHRISTI_PROCESSION: 8,
};
for (const [id, count] of Object.entries(expectedCounts)) {
  expect(overlays.overlays[id]?.records === count, id + " recovery count changed");
}
const extCounts = { PALM:12, ASH:8, CND:11, ROG:6, LECT:5, PROC:7, HT_POST:6, ASP:6, REQ:18, ABS:5, CORPUS:8 };
for (const [id, count] of Object.entries(extCounts)) {
  expect(specialExt.graphs[id]?.length === count, id + " exact v43.73 payload count changed");
}
expect(String(specialExt.research_gates["RG-004_REQUIEM"]).startsWith("CLOSED"), "RG-004 closure lost");
expect(String(specialExt.research_gates["RG-005_ASPERGES"]).startsWith("CLOSED"), "RG-005 closure lost");
expect(String(specialExt.research_gates["SG-007_CORPUS_CHRISTI"]).startsWith("CLOSED"), "Corpus procession closure lost");

const base = {
  date: "2026-10-04",
  form: "MISSA_CANTATA_INCENSE",
  presentationMode: "LIVE",
  calendarCelebration: { id: "calendar-sunday", type: "CALENDAR" },
};

const ordinary = compileMassPlan(makeResolvedMass(base));
expect(ordinary.massEntry === "FOOT_CLUSTER", "ordinary Mass entry changed");
expect(ordinary.normalLastGospel === true, "ordinary Last Gospel suppressed");

const holyRosary = makeResolvedMass({
  ...base,
  requestedCelebration: { id: "holy-rosary", type: "VOTIVE" },
  overlays: ["VOTIVE_PROPER"],
  proper: { status: "READY", formularyId: "holy-rosary" },
});
expect(holyRosary.actualCelebration.id === "holy-rosary", "explicit celebration did not override calendar");
expect(holyRosary.explicitlySelectedCelebration === true, "manual celebration selection lost");

let failedClosed = false;
try {
  makeResolvedMass({
    ...base,
    requestedCelebration: { id: "st-therese", type: "VOTIVE" },
    overlays: ["VOTIVE_PROPER"],
  });
} catch {
  failedClosed = true;
}
expect(failedClosed, "missing Votive Proper did not fail closed");

const requiem = compileMassPlan(makeResolvedMass({
  ...base,
  requestedCelebration: { id: "requiem", type: "REQUIEM" },
  overlays: ["REQUIEM"],
  proper: { status: "READY", formularyId: "requiem" },
}));
expect(requiem.blessingAllowed === false, "Requiem blessing not suppressed");
expect(requiem.normalLastGospel === true, "Requiem alone incorrectly suppresses Last Gospel");

const requiemAbs = compileMassPlan(makeResolvedMass({
  ...base,
  requestedCelebration: { id: "requiem", type: "REQUIEM" },
  overlays: ["REQUIEM"],
  followingActions: ["REQUIEM_ABSOLUTION"],
  proper: { status: "READY", formularyId: "requiem" },
}));
expect(requiemAbs.normalLastGospel === false, "Absolution branch did not suppress Last Gospel");

const ashDateOnly = compileMassPlan(makeResolvedMass({
  ...base,
  calendarCelebration: { id: "ash-wednesday", type: "CALENDAR" },
}));
expect(ashDateOnly.massEntry === "FOOT_CLUSTER", "Ash date alone suppressed ordinary opening");

const ashesThenMass = compileMassPlan(makeResolvedMass({
  ...base,
  calendarCelebration: { id: "ash-wednesday", type: "CALENDAR" },
  precedingRites: ["ASH"],
}));
expect(ashesThenMass.massEntry === "INTROIT", "Ash rite did not hand off at Introit");

const asperges = compileMassPlan(makeResolvedMass({
  ...base,
  precedingRites: ["ASPERGES"],
}));
expect(asperges.massEntry === "FOOT_CLUSTER", "Asperges incorrectly suppressed Prayers at the Foot");

const corpusDateOnly = compileMassPlan(makeResolvedMass({
  ...base,
  calendarCelebration: { id: "corpus-christi", type: "CALENDAR" },
  calendarImpliesCorpusProcession: true,
}));
expect(corpusDateOnly.blessingAllowed === true && corpusDateOnly.normalLastGospel === true,
  "Corpus date alone activated optional procession");

const corpus = compileMassPlan(makeResolvedMass({
  ...base,
  followingActions: ["CORPUS_CHRISTI_PROCESSION"],
}));
expect(corpus.dismissal === "BENEDICAMUS_DOMINO", "Corpus procession dismissal wrong");
expect(corpus.blessingAllowed === false && corpus.normalLastGospel === false,
  "Corpus procession ending not applied");

const goodFriday = compileMassPlan(makeResolvedMass({
  ...base,
  distinctRite: "GOOD_FRIDAY",
}));
expect(goodFriday.canonicalMassGraphActive === false, "Good Friday contaminated with ordinary Mass graph");

const vigil = compileMassPlan(makeResolvedMass({
  ...base,
  distinctRite: "EASTER_VIGIL",
}));
expect(vigil.afterMass === "LAUDS" && vigil.massEntry === "VIGIL_DEFINED_MASS_ENTRY",
  "Easter Vigil composite contract lost");

const practice = projectPractice(events, { role: "SERVER", mode: "LIVE_ASSIST_READ_ONLY" });
expect(practice.readOnly === true, "Live Assist must be read-only");
expect(practice.createsCanonicalIdentity === false, "Practice created canonical identity");
expect(assertPracticeProjection(practice, events) === true, "Practice identity audit failed");
expect(practice.events.length > 0, "Server practice projection empty");

console.log(
  "R17 convergence PASS:",
  MASS_FORMS.length + " forms;",
  Object.keys(expectedCounts).length + " recovered graph contracts;",
  practice.events.length + " server-role canonical cues."
);
