import { auditOrdinaryParity, compareParityEntry } from "../src/mass/parity-contracts.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const ok=compareParityEntry({
  blockId:"BTEST",
  cueId:"AO.SM.TEST",
  canonicalCrossPositions:[4,18],
  referenceCrossPositions:[4,18],
  canonicalSectionBoundaries:["P1","P2"],
  referenceSectionBoundaries:["P1","P2"],
  unexplainedDiscrepancies:[],
});
expect(ok.pass,"exact parity entry should pass");

const wrongPosition=compareParityEntry({
  blockId:"BTEST2",
  cueId:"AO.SM.TEST2",
  canonicalCrossPositions:[4,19],
  referenceCrossPositions:[4,18],
  canonicalSectionBoundaries:["P1"],
  referenceSectionBoundaries:["P1"],
});
expect(!wrongPosition.pass && !wrongPosition.crossPositionPass,"cross position mismatch was not detected");

const wrongBoundary=compareParityEntry({
  blockId:"BTEST3",
  cueId:"AO.SM.TEST3",
  canonicalCrossPositions:[],
  referenceCrossPositions:[],
  canonicalSectionBoundaries:["P1","P2"],
  referenceSectionBoundaries:["P1","P3"],
});
expect(!wrongBoundary.pass && !wrongBoundary.sectionBoundaryPass,"section boundary mismatch was not detected");

const audit=auditOrdinaryParity([{
  blockId:"B1",cueId:"C1",
  canonicalCrossPositions:[1],referenceCrossPositions:[1],
  canonicalSectionBoundaries:["A"],referenceSectionBoundaries:["A"],
},{
  blockId:"B2",cueId:"C2",
  canonicalCrossPositions:[2],referenceCrossPositions:[3],
  canonicalSectionBoundaries:["A"],referenceSectionBoundaries:["A"],
}]);
expect(audit.total===2 && audit.passed===1 && audit.failed===1 && audit.pass===false,"aggregate parity audit changed");

console.log("Ordinary parity contracts PASS: exact cross positions and section boundaries enforced.");
