// Read-only artwork publication truth check. NEVER promotes a research candidate.
// Verifies identity and release state across canonical, already-existing sources.
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {APPROVED_CLASS_I_2026,approvedClassIHeroForDate} from "../src/calendar/approved-class-i-heroes-2026.js";
import {MASS_EMBLEM_GROUPS,MASS_INSTITUTION_EMBLEMS} from "../src/find/institution-emblems.js";
import {PRAY_DOOR_ART_SLOTS_V1} from "../src/pray/art-slot-map.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=async path=>JSON.parse(await readFile(resolve(root,path),"utf8"));
const moduleLedger=await read("data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json");
const moduleReadiness=await read("data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json");
const prayerSlots=await read("data/pray/art-placement-slots-20261030.v1.json");
const emblems=await read("data/directory/research/tlm-emblem-release-crosswalk-r06.v1.json");

const approved=moduleLedger.final_approved_heroes;
const staged=moduleReadiness.entries;
const byModule=new Map(staged.map(row=>[row.module_id,row]));
assert.equal(new Set(approved.map(row=>row.module_id)).size,approved.length,
  "Module ledger repeats an editorial module identity");
assert.equal(new Set(staged.map(row=>row.module_id)).size,staged.length,
  "Module readiness repeats an editorial module identity");
assert.equal(approved.length,staged.length,
  "Editorial module roster and quality readiness roster diverged");
const moduleRows=approved.map(row=>{
  const prepared=byModule.get(row.module_id);
  assert.ok(prepared,"Approved module absent in readiness: "+row.module_id);
  assert.equal(prepared.artwork_id,row.artwork_id,
    "Module approved painting silently replaced: "+row.module_id);
  assert.equal(prepared.editorial_approved,true);
  assert.equal(row.editorial_status,"user_approved_final");
  const released=prepared.app_released===true &&
    prepared.production_release==="RELEASED" &&
    prepared.app_ready_crop_verified===true;
  // Do not infer release clearance from presence of a research file, pixel count,
  // a SHA256, a rights note, a preview or an editorial approval.
  if(prepared.app_released===true)assert.equal(released,true,
    "Module asset claims release without publication/crop certification: "+row.module_id);
  return {
    id:row.module_id,artworkId:row.artwork_id,
    title:row.title,artist:row.artist,
    editorial:"USER_APPROVED_FINAL",
    sourceOriginalArchived:prepared.physical_master_acquired===true,
    humanImageQuality:prepared.visual_quality?.verdict??"UNVERIFIED",
    responsiveCropApproved:prepared.app_ready_crop_verified===true,
    released,sourceReadinessState:prepared.production_release,
  };
});
const classIRows=APPROVED_CLASS_I_2026.map(row=>{
  assert.equal(approvedClassIHeroForDate(row.date,row.principalId),row,
    "Date-specific Calendar identity mapping has drifted");
  assert.equal(approvedClassIHeroForDate(row.date,"unrelated:principal"),null,
    "Approved artwork must not spill into a different feast");
  assert.equal(row.editorialApproval,"APPROVED_DATE_SPECIFIC_2026-10-19");
  assert.ok(row.artworkId&&row.artist&&row.title);
  if(row.imagePublicationStatus==="HELD_SOURCE_REUSE_RIGHTS")
    assert.equal(row.image,null,"Rights-held Calendar artwork must not publish image bytes");
  return {
    date:row.date,principalId:row.principalId,artworkId:row.artworkId,
    artist:row.artist,title:row.title,
    editorial:"APPROVED_DATE_SPECIFIC",
    imageAvailableToCalendar:Boolean(row.image),
    publicationStatus:row.imagePublicationStatus,
    fullyOfflineCertified:false,
  };
});
assert.equal(new Set(classIRows.map(x=>x.date)).size,classIRows.length);
assert.equal(prayerSlots.slots.length,prayerSlots.counts.slots,
  "Prayer baseline slot census changed without updating its manifest");
const prayerRows=prayerSlots.slots.map(row=>({
  id:row.slot_id??row.slotId,
  assigned:((row.painting_ids??[]).length>0),
  declared:row.publication_status??null,
}));
const doorRows=Object.entries(PRAY_DOOR_ART_SLOTS_V1).map(([door,row])=>({
  door,slotId:row.slotId,publicationState:row.publicationState,
  rotation:row.rotation,
}));
const emblemRows=emblems.records.map(row=>{
  const code=row.group_code;
  const researchRendered=row.visual_release==="RESEARCH_LICENSED_EMBLEM_RENDERED";
  const runtime=Object.hasOwn(MASS_INSTITUTION_EMBLEMS,code);
  // Research claim of 13 group symbols must match the exact runtime registry.
  assert.equal(runtime,researchRendered,
    "Explore group symbol evidence/runtime mismatch: "+code);
  if(runtime){
    assert.ok(MASS_EMBLEM_GROUPS.includes(code),
      "Runtime image missing exact-source group opt-in: "+code);
    assert.equal(MASS_INSTITUTION_EMBLEMS[code].reviewBeforeCommercialRelease,true,
      "Source symbol incorrectly treated as commercial/trademark cleared: "+code);
  }
  assert.equal(row.no_automatic_affiliation_inference,true,
    "Explore crosswalk may not infer actual operator: "+code);
  assert.equal(row.no_venue_publication_from_emblem,true,
    "An emblem does not approve a venue: "+code);
  return {group:code,visual:row.visual_release,
    runtimeImage:runtime,finalReuseApproved:row.image_reuse_final_approved===true,
    rightsReviewOpen:row.copyright_trademark_review_open===true};
});
assert.equal(new Set(emblemRows.map(x=>x.group)).size,emblemRows.length);
assert.equal(emblemRows.length,emblems.summary.total_distinct_research_groups);
assert.equal(emblemRows.filter(x=>x.runtimeImage).length,emblems.summary.image_group_mappings);

const count=(rows,predicate)=>rows.filter(predicate).length;
const report={
 schema:"AO_ARTWORK_PUBLICATION_TRUTH_AUDIT_V1",
 generatedAt:new Date().toISOString(),
 interpretation:"Source-and-runtime-registry reconciliation only. NOT a visual, image-byte, licence or production screenshot certification.",
 noResearchCandidateAutoPublished:true,
 sourceRefs:{
  calendar:"src/calendar/approved-class-i-heroes-2026.js",
  moduleEditorial:"data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json",
  moduleReadiness:"data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json",
  prayerBaseline:"data/pray/art-placement-slots-20261030.v1.json",
  exploreCrosswalk:"data/directory/research/tlm-emblem-release-crosswalk-r06.v1.json",
  exploreRuntime:"src/find/institution-emblems.js",
 },
 summary:{
  calendar:{approved:classIRows.length,remoteOrOtherPreviews:count(classIRows,r=>r.imageAvailableToCalendar),
    held:count(classIRows,r=>r.publicationStatus==="HELD_SOURCE_REUSE_RIGHTS"),
    offlineCertified:0},
  moduleHeroes:{approved:moduleRows.length,sourceOriginalsRecorded:count(moduleRows,r=>r.sourceOriginalArchived),
    released:count(moduleRows,r=>r.released)},
  prayerBaseline:{slots:prayerRows.length,slotsWithAssignedPaintingIds:count(prayerRows,r=>r.assigned),
    doorSlots:doorRows.length},
  explore:{sourceGroups:emblemRows.length,runtimeGroupSymbols:count(emblemRows,r=>r.runtimeImage),
    finalReusableApproved:count(emblemRows,r=>r.finalReuseApproved),
    textFallbacks:count(emblemRows,r=>r.visual==="EXACT_SOURCE_LABEL_PLAIN_TEXT_MARK"),
    neutralFallbacks:count(emblemRows,r=>r.visual==="NAMED_SOURCE_OR_NEUTRAL_FALLBACK"),
    noEmblemByDesign:count(emblemRows,r=>r.visual==="NO_SINGLE_GROUP_EMBLEM_BY_DESIGN")}
 },
 rows:{calendar:classIRows,moduleHeroes:moduleRows,prayerDoorSlots:doorRows,emblemGroups:emblemRows},
 separateDraftSources:["PR #2144 prayer 267 candidate assignments: not merged; proposals are not publication"],
 nextEvidenceRequired:[
  "Compare production DOM image sources/alt/caption to exact approved identity and selected date",
  "Archive and checksum actual approved image bytes; inspect full unmodified painted surface",
  "Record rights/attribution, responsive crop, and visual QA before self-hosting",
  "Verify each Explore symbol against exact community_id; fallback to neutral text where unverified",
  "Keep prayer candidate proposal and explicit user decisions separate from release-cleared images"
 ]
};
const out=resolve(root,"artifacts/artwork-publication-truth");
await mkdir(out,{recursive:true});
await writeFile(resolve(out,"report.json"),JSON.stringify(report,null,2)+"\n");
const s=report.summary;
const md=[
 "# Ad Orientem artwork publication truth — evidence report",
 "",
 "Generated from the canonical mainline registries; the script produces this report read-only.",
 "",
 "| Scope | Approved / researched | Registered in production source | Fully cleared |",
 "|---|---:|---:|---:|",
 "| Class I Calendar heroes | "+s.calendar.approved+" | "+s.calendar.remoteOrOtherPreviews+" image URLs; "+s.calendar.held+" rights-held | "+s.calendar.offlineCertified+" offline-certified |",
 "| Module heroes | "+s.moduleHeroes.approved+" | "+s.moduleHeroes.sourceOriginalsRecorded+" archived research masters | "+s.moduleHeroes.released+" |",
 "| Prayer baseline slots | "+s.prayerBaseline.slots+" | "+s.prayerBaseline.slotsWithAssignedPaintingIds+" source-baseline assigned | Not certified |",
 "| Explore group symbols | "+s.explore.sourceGroups+" groups | "+s.explore.runtimeGroupSymbols+" exact group images | "+s.explore.finalReusableApproved+" final reuse approvals |",
 "",
 "The **41 Explore groups** additionally have "+s.explore.textFallbacks+
 " exact text fallbacks, "+s.explore.neutralFallbacks+" neutral fallbacks, and "+
 s.explore.noEmblemByDesign+" deliberately without a group emblem.",
 "",
 "## Important release interpretation",
 "",
 "- These are different programmes, not a single asset count. All Calendar approvals are date-specific; no status converts a remote preview into an offline-certified original.",
 "- All 22 module-art IDs reconcile to the explicit user approval ledger. Research originals are not proof that crop, attribution, quality and app integration passed.",
 "- The 275-slot Prayer baseline is an editorial blueprint. PR #2144 contains more recent **unmerged** 267-position candidate assignments. Preserve historical rejections and user-specific approvals; do not publish any proposal automatically.",
 "- Explore emblems are rights-restricted source-group symbols. A logo never proves venue operator, affiliation, Una Cum, local community identity or Mass time.",
 "- This report does NOT assert actual image pixels, visual fidelity or licensing clearance of the live app. Review live screenshots and local archived originals separately.",
 "",
 "## Evidence to close before claiming complete artwork publication",
 "",
 ...report.nextEvidenceRequired.map((x,i)=>(i+1)+". "+x),
 ""
].join("\n");
await writeFile(resolve(out,"report.md"),md);
console.log("PASS artwork editorial identity and release-state crosswalk");
console.log(JSON.stringify(report.summary,null,2));
