import assert from "node:assert/strict";
import {buildDraftCollisionAudit} from "../tools/mass/reconcile-annexed-translation-collisions.mjs";
const a=buildDraftCollisionAudit();
assert.equal(a.schema,"ao-draft-annex-wording-owner-collision-audit-v1");
assert.equal(a.status,"SOURCE_COMPARISON_ONLY_NO_TEXT_PROMOTIONS");
assert.equal(a.summary.rites,8);
assert.ok(a.summary.matchedRows>=45,
  "Previously known canonical text matches no longer detected");
assert.ok(a.summary.provisionalEditorialWordingCollisions>=1,
  "The reviewed Ordinary/new annex language variation disappeared suspiciously");
assert.equal(a.summary.completeExistingBilingualOwnerCandidates+
  a.summary.provisionalEditorialWordingCollisions+
  a.summary.sameDraftAndDonor,a.summary.matchedRows);
assert.ok(a.matched.some(r=>r.rite==="REQUIEM_ABSOLUTION"&&
  r.rowId==="ABS-R04-V10"&&
  r.ordinaryCueCandidates.includes("AO.SM.C0035")&&
  r.englishMatchesFrozenDonor===false),
  "Requiem's 'And with your spirit' must be reviewed against the existing 'thy spirit' wording");
assert.ok(a.matched.some(r=>r.rite==="CORPUS_CHRISTI"&&
  r.rowId==="CORPUS-R05-O"&&
  r.ordinaryCueCandidates.includes("AO.SM.C0036")),
  "Reused Benediction Oremus was not recognized");
assert.ok(a.matched.some(r=>r.rite==="ASPERGES"&&
  r.ordinaryCueCandidates.includes("AO.SM.C0032")),
  "Asperges Domine exaudi is an existing Ordinary source");
assert.ok(a.matched.every(r=>r.cardId&&r.sourceRecordId&&r.rowId),
  "Unowned source row in draft-to-canonical wording comparison");
assert.ok(a.matched.every(r=>!Object.hasOwn(r,"latin")&&
  !Object.hasOwn(r,"english")&&!Object.hasOwn(r,"french")),
  "Audit must contain owner references, not yet another duplicate liturgical text corpus");
assert.match(a.gate,/DO_NOT_RETRANSLATE/);
console.log("PASS annex English/French owner conflicts against canonical Ordinary, without duplicating or replacing liturgical text");
console.log(JSON.stringify(a.summary));
