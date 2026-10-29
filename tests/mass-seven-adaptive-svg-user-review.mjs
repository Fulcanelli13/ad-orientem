import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {auditGestureIconDispositions} from "../src/mass/reader-icon-disposition-audit.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const ledger=read("../data/mass/gesture-icon-user-review-20261029.v1.json");
const disposition=read("../data/mass/gesture-icon-disposition-20261029.v1.json");
const matrix=read("../data/mass/gesture-matrix.v1.json");
const bank=read("../assets/active/mass-v46/manifest.v1.json");
const originalDecisions=read("../data/presentation/mass-icon-user-selections-20261010.v1.json");
const originalExtensions=read("../data/presentation/mass-icon-extension-approvals-20261011.v1.json");
assert.equal(ledger.schema,"ao-mass-seven-adaptive-gesture-user-review-v1");
assert.equal(ledger.reviewId,"ao-mass-seven-adaptive-monochrome-20261029");
assert.equal(ledger.authority,"DIRECT_USER_ARTWORK_REVIEW_ONLY");
assert.equal(ledger.reviewedAt,"2026-10-29T13:45:20Z");
assert.match(ledger.package.packageSha256,/^[a-f0-9]{64}$/);
assert.equal(ledger.package.theme,"MONOCHROME_CURRENT_COLOR");
assert.equal(ledger.package.sourceFormat,"SVG_TRUE_VECTOR_PATHS");
assert.equal(ledger.package.transparency,true);
assert.equal(ledger.package.sourceAssetPersistence,"EXACT_SEVEN_SVG_FILES_ARCHIVED_IN_GITHUB_REVIEW_ONLY_AND_PERSISTENT_LIBRARY");
assert.equal(ledger.package.archivedReviewSvgRoot,"assets/review/mass-adaptive-gesture-20261029");
assert.equal(ledger.package.artworkFilesArchivedCount,7);
assert.equal(ledger.package.originalArchiveSha256,ledger.package.packageSha256);
assert.match(ledger.package.libraryArchivePath,/Ad_Orientem_7_Adaptive_Gesture_SVG_Review\.zip$/);
assert.deepEqual(ledger.counts,{reviewed:7,approved:6,rejected:1,pendingInThisSevenItemBatch:0});
const expected=new Map([
 ["C0117",["APPROVE","d592b957a61e0915ccc369c1ee6a933f242007498c516a16890578f6f9128c02"]],
 ["C0155",["APPROVE","bb44d29a520b2686fcdee3b725eeead5d6f441e1007205b6eff63e61b8a4d554"]],
 ["C0161",["APPROVE","2e3b96453013420c0d80516f05ff405dc113bbef5d1eb3dd33763c941120b51f"]],
 ["C0169",["REJECT","223e9362f1e0ea660e484e9f18bc5ba87ee82c45ec5d7c0dfc0399c67efa753f"]],
 ["C0193",["APPROVE","8d156dd5cc83d3b2ee02c4db02ab7867b9771b9935efebce69397cc3c9775b30"]],
 ["C0204",["APPROVE","29e79670691c012715a7d816e540034abb6b5ac43b805f899ae1022a0b6b1a93"]],
 ["C0263",["APPROVE","53e64b17e171975b7c7a4782402b319b0429d73144778b0dca6efb88f74dc446"]]
]);
assert.equal(ledger.items.length,7);
assert.equal(new Set(ledger.items.map(x=>x.cueId)).size,7);
assert.equal(new Set(ledger.items.map(x=>x.submittedSvgSha256)).size,7);
assert.equal(ledger.items.filter(x=>x.decision==="APPROVE").length,6);
assert.equal(ledger.items.filter(x=>x.decision==="REJECT").length,1);
for(const item of ledger.items){
 const pair=expected.get(item.cueId);
 assert.ok(pair,"Unknown cue in seven-gesture artwork review: "+item.cueId);
 assert.deepEqual([item.decision,item.submittedSvgSha256],pair);
 assert.equal(item.gestureMatrixId,"GM.P."+item.cueId+".01");
 assert.equal(item.submittedSvg,"svg/"+item.cueId+".svg");
 assert.equal(item.artworkUserDecision,item.decision==="APPROVE"?"USER_APPROVED_CONCEPT":"USER_REJECTED_CONCEPT");
 assert.equal(item.assetStatus,"REVIEW_ONLY_NOT_RELEASED");
 assert.equal(item.productionBinding,null);
 assert.equal(item.originalUserSelection,true);
 const filePath="assets/review/mass-adaptive-gesture-20261029/"+item.cueId+".svg";
 assert.equal(item.archivedReviewSvg,filePath,"Artwork must remain in segregated review directory");
 assert.equal(item.archivedReviewOnly,true);
 const svg=readFileSync(new URL("../"+filePath,import.meta.url));
 const actualSha256=createHash("sha256").update(svg).digest("hex");
 assert.equal(item.submittedSvgSha256.length,64,"Incomplete user-reviewed file hash");
 assert.equal(actualSha256,item.submittedSvgSha256,
  "GitHub archive diverges from exact image that user reviewed for "+item.cueId);
 const xml=svg.toString("utf8");
 assert.ok(xml.startsWith("<svg "),item.cueId+" is not an SVG");
 assert.match(xml,/fill="currentColor"/);
 assert.ok(xml.includes('viewBox="0 0 512 512"'));
 assert.doesNotMatch(xml,/<(?:script|image|foreignObject)\b|data:image|(?:xlink:)?href="https?:\/\//i,
  "External/rasterized artwork or executable content prohibited");
 assert.doesNotMatch(xml,/fill="#[0-9a-f]{3,8}"/i,
  "Review asset must remain recolourable");
 const row=disposition.items.find(x=>x.id===item.gestureMatrixId);
 const original=matrix.items.find(x=>x.id===item.gestureMatrixId);
 assert.ok(row&&original);
 assert.equal(row.actor,"PRIEST");
 assert.equal(row.releaseAssetKey,null);
 assert.equal(row.latestAdaptiveArtworkReview.sourceOfTruth,"data/mass/gesture-icon-user-review-20261029.v1.json");
 assert.equal(row.latestAdaptiveArtworkReview.cueId,item.cueId);
 assert.equal(row.latestAdaptiveArtworkReview.conceptFileSha256Required,true);
 assert.equal(row.latestAdaptiveArtworkReview.notAutomaticallyPublished,true);
 assert.equal(original.iconKey,null);
 assert.equal(original.iconStatus,"PENDING_EXACT_MASTER");
}
assert.equal(ledger.items.find(x=>x.cueId==="C0169").ceremonialStatus,"REJECTED_NEEDS_REDRAW");
assert.equal(ledger.items.find(x=>x.cueId==="C0193").ceremonialStatus,"WRONG_MONSTRANCE_OBJECT_MUST_BE_CORRECTED");
assert.equal(ledger.items.find(x=>x.cueId==="C0204").ceremonialStatus,"MINOR_VS_MAJOR_ELEVATION_CHECK_REQUIRED");
assert.equal(ledger.items.find(x=>x.cueId==="C0161").ceremonialStatus,"PALMS_AND_OBLATIONS_GEOMETRY_CHECK_REQUIRED");
for(const flag of [
 "preserveAllEarlierUserApprovalsAndRejections","preserveOtherPendingUnreviewedItems",
 "noAutoPublication","noProductionSvgPromotion","noRubricSourceOverride","noIconKeyAssignment",
 "noGestureMatrixMutation","cannotOverrideCeremonialOrIconLegibilityGates",
 "approvedConceptIsNotCertifiedLiturgicalAccuracy","requiresIndependentCeremonialVerificationBeforeRelease",
 "requiresExactSvgSha256OnAcquisition","retainLiveTextRubricUntilAssetCertified"
])assert.equal(ledger.guardrails[flag],true,flag);
assert.equal(ledger.baseline.sourceMatrixCount,142);
assert.equal(matrix.items.length,142);
assert.equal(matrix.items.filter(x=>x.iconKey!==null).length,125);
assert.equal(matrix.items.filter(x=>x.iconKey===null).length,17);
assert.equal(bank.assets.length,67);
assert.deepEqual(auditGestureIconDispositions({dispositions:disposition,matrix,bank}).issues,[]);
assert.equal(disposition.items.length,17);
assert.equal(disposition.items.filter(x=>x.latestAdaptiveArtworkReview).length,7);
assert.equal(disposition.items.filter(x=>x.actor==="FAITHFUL").length,10);
for(const row of disposition.items.filter(x=>x.actor==="FAITHFUL"))
 assert.equal(row.latestAdaptiveArtworkReview,undefined);
const gallery=readFileSync(new URL("../reviews/mass-seven-adaptive-gesture-archive-20261029.html",import.meta.url),"utf8");
assert.match(gallery,/mask:var\(--src\)/,"SVGs must recolour through CSS-mask currentColor");
assert.match(gallery,/USER APPROVED CONCEPT/);
assert.match(gallery,/USER REJECTED/);
assert.match(gallery,/C0193's inappropriate monstrance/);
for(const cue of expected.keys())assert.ok(gallery.includes('"'+cue+'"'),"Archived icon omitted from theme gallery: "+cue);
assert.equal(originalDecisions.schema,"ao-mass-icon-user-selection-v1");
assert.equal(originalExtensions.schema,"ao-mass-icon-extension-approval-v1");
console.log("PASS: 6 user artwork concepts approved, C0169 rejected, exact SVG hashes locked and all existing 1962 source/release holds preserved.");
