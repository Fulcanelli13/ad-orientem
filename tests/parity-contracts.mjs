import fs from "node:fs";
import { auditOrdinaryParity, compareParityEntry } from "../src/mass/parity-contracts.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const ok=compareParityEntry({
  blockId:"BTEST",
  cueId:"AO.SM.TEST",
  canonicalCrossAnchors:["benedixit|host"],
  referenceCrossAnchors:["benedixit|host"],
  canonicalTextFragment:"abc",
  referenceTextFragment:"abc",
  canonicalSectionBoundaries:["P1","P2"],
  referenceSectionBoundaries:["P1","P2"],
  unexplainedDiscrepancies:[],
});
expect(ok.pass,"exact parity entry should pass");

const wrongAnchor=compareParityEntry({
  blockId:"BTEST2",
  cueId:"AO.SM.TEST2",
  canonicalCrossAnchors:[],
  referenceCrossAnchors:["Benedíctus|qui venit"],
  canonicalSectionBoundaries:["P1"],
  referenceSectionBoundaries:["P1"],
});
expect(!wrongAnchor.pass && !wrongAnchor.crossPositionPass && !wrongAnchor.crossCountPass,"cross anchor mismatch was not detected");

const wrongText=compareParityEntry({
  blockId:"BTEST3",
  cueId:"AO.SM.TEST3",
  canonicalTextFragment:"lucis pacis",
  referenceTextFragment:"lucis et pacis",
  canonicalSectionBoundaries:["P1"],
  referenceSectionBoundaries:["P1"],
});
expect(!wrongText.pass && !wrongText.textFragmentPass,"text fragment mismatch was not detected");

const wrongBoundary=compareParityEntry({
  blockId:"BTEST4",
  cueId:"AO.SM.TEST4",
  canonicalCrossPositions:[],
  referenceCrossPositions:[],
  canonicalSectionBoundaries:["P1","P2"],
  referenceSectionBoundaries:["P1","P3"],
});
expect(!wrongBoundary.pass && !wrongBoundary.sectionBoundaryPass,"section boundary mismatch was not detected");

const registry=JSON.parse(fs.readFileSync(new URL("../data/mass/ordinary-parity-register.v1.json",import.meta.url),"utf8"));
const audit=auditOrdinaryParity(registry.entries);
expect(audit.total===3,"expected exactly three reconciled parity rows");
expect(audit.failed===3 && audit.correctionRequired===3,"known source corrections must remain blocking until canonical payload is patched");
expect(registry.entries[0].cueId==="AO.SM.C0148","Benedictus cue pin changed");
expect(registry.entries[1].cueId==="AO.SM.C0153","Te igitur cue pin changed");
expect(registry.entries[2].cueId==="AO.SM.C0194","Memento-dead cue pin changed");

console.log("Ordinary parity contracts PASS: 3 pinned source corrections remain blocking until canonical patch.");
