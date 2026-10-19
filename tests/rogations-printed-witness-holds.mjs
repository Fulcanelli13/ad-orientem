import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";

// No production source amendment in this audit: failures are first recorded
// with printed-page evidence and require a 1962 edition-qualified decision.
// Do not promote the 1961 Liber Usualis chant book to a 1962 rubric authority.
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=read("../data/mass/rogation-1961-print-witness-holds.v1.json");
const source=read("../data/presentation/reader-rogations.v1.json");
const graphs=read("../data/mass/special-days-extension.v1.3.json").graphs;
const rendered=buildRogationsPayload({graph:graphs.ROG,payload:source});
assert.equal(audit.summary.publicationAllowed,false);
assert.equal(audit.summary.implementedPrepublicationCorrections,3);
assert.equal(audit.summary.releaseSourceCertificationHolds,3);
assert.equal(audit.summary.confirmed1962EditionWordingReplacements,0);
assert.equal(audit.summary.sourceRowsCertifiedAgainst1962Print,null);
assert.equal(audit.summary.knownTranslationGaps,null);
assert.match(audit.authority.rubric,/1962/);
assert.match(audit.authority.cantionalWitness.edition,/1961/);
assert.ok(audit.authority.cantionalWitness.scope.includes("NOT_SUPREME_1962"));
assert.deepEqual(audit.authority.cantionalWitness.printedPages,[835,836,837,838,839,840]);
assert.deepEqual(audit.sourcePageMap.map(x=>[x.stage,x.sourceLeafCount]),[
 ["ROG-R01",4],["ROG-R02",18],["ROG-R03",112],
 ["ROG-R04",35],["ROG-R05",18],["ROG-R06",0]
]);
assert.equal(audit.sourcePageMap.reduce((sum,x)=>sum+x.sourceLeafCount,0),187);
assert.deepEqual(audit.sourcePageMap[2].sourceIndexPageRanges.map(x=>[
 x.indexStart,x.indexEnd,x.page]),[[0,37,836],[38,89,837],[90,111,838]]);
assert.equal(rendered.cards.length,6);
for (let i=0;i<rendered.cards.length;i++){
 const {stage,sourceLeafCount,first,last}=audit.sourcePageMap[i];
 const card=rendered.cards[i];
 assert.equal(card.id,stage);
 assert.equal(card.paragraphs.length,sourceLeafCount);
 assert.equal(card.paragraphs[0]?.id??null,first);
 assert.equal(card.paragraphs.at(-1)?.id??null,last);
}
assert.equal(rendered.petitionsDuplicated,false);
assert.equal(source.processionLitany.length,112);
const holds=audit.holds;
assert.deepEqual(holds.map(x=>x.id),[
 "ROG-1961-PRINT-HOLD-01",
 "ROG-1961-PRINT-HOLD-02",
 "ROG-1961-PRINT-HOLD-03"
]);
assert.ok(holds.every(x=>x.expectedAction && x.printLocator && x.releaseDisposition?.startsWith("BLOCKED_")));
assert.equal(audit.summary.openDiscrepancies,holds.length);

// p. 840: there is an explicit Oremus between the last suffrage and
// the first oration. At present the six-stage donor has no such row.
// This is a documented, unresolved omission, NOT permission to inject
// a free-floating cue into LIVE or a duplicate event.
const firstCollect=rendered.cards[4].paragraphs[0];
const lastSuffrage=rendered.cards[3].paragraphs.at(-1);
assert.equal(firstCollect.id,"ROG-R05-OR");
assert.equal(rendered.cards[4].paragraphs[1].id,"ROG-R05-O1");
assert.equal(firstCollect.kind,"VERSICLE");
assert.equal(firstCollect.speaker,"CELEBRANT");
assert.equal(firstCollect.voice,"AUDIBLE");
assert.equal(firstCollect.canonicalWordingCandidate,"AO.SM.C0036");
assert.equal(lastSuffrage.id,"ROG-R04-S24");
assert.equal(holds[0].printedLatin,"Oremus.");
assert.equal(holds[0].donorDisposition,"RESTORED_IN_CANONICAL_SOURCE_AND_READER_R05_INVITATION");
assert.equal(firstCollect.latin,"Oremus.");
assert.equal(source.postLitany.oremus,"Oremus.");
assert.equal(rendered.cards.flatMap(x=>x.paragraphs).filter(x=>
 x.latin?.trim().toLowerCase()==="oremus.").length,1);

// p. 839: Pater noster in silence is currently just an undifferentiated
// TEXT row; only an edition-qualified decision may set voice ownership.
const pater=rendered.cards[3].paragraphs[0];
assert.equal(pater.id,"ROG-R04-PN");
assert.equal(pater.latin,"Pater noster.");
assert.equal(pater.kind,"TEXT");
assert.equal(pater.voice,"SILENT");
assert.equal(pater.voiceSource,"1961_LIBER_USUALIS_P839");
assert.equal(pater.spokenVersicleFollows,"ROG-R04-V");
assert.match(rendered.cards[3].guide,/silently/);
assert.equal(holds[1].witnessInstruction,"in silence");

// p. 840 printed fifth collect adds 'nostro'; a different online edition
// lacks it, so this is an adjudication task, not automatic emendation.
const collect5=rendered.cards[4].paragraphs[5];
assert.equal(collect5.id,"ROG-R05-O5");
assert.equal(collect5.latin,source.postLitany.orations[4]);
assert.match(collect5.latin,/Pontifici nostro N\./);
assert.doesNotMatch(collect5.latin,/miserere famulo tuo Pontifici N\./);
assert.equal(holds[2].printedLatinFragment,"Pontifici nostro N.");
assert.equal(holds[2].donorLatinFragment,"Pontifici N.");
assert.ok(holds[2].conflictingSecondaryWitness);
assert.equal(holds[2].implementation.amendedLatinFragment,"Pontifici nostro N.");
assert.ok(holds.every(x=>
 x.implementation?.status==="APPLIED_IN_DRAFT_AWAITING_1962_EDITION_CERTIFICATION"));

// The witness's two printed Gloria lines are *already* one donor
// psalm row; this cannot be counted as omitted text.
const dox=source.postLitany.psalm69.at(-1);
assert.match(dox,/Gloria Patri/);
assert.match(dox,/sicut erat in principio/);
assert.equal(audit.observations[0].status,"TEXT_PRESENT_DIFFERENT_SEGMENTATION_NOT_MISSING_TRANSLATION");
assert.equal(audit.observations[1].status,"RESOLVED_1962_RUBRIC_TAKES_PRECEDENCE");
console.log("PASS Rogations printed source corrections: source-owned Oremus, silent Pater, papal collect wording; source certification still held.");
