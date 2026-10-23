import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=read("data/research/historia-salutis-p3-unified-editorial-release-worklist-20261023.v1.json");
const sources=Object.fromEntries(ledger.baseline.references.map(r=>[r.key,read(r.path)]));
const proof=sources.proof,audit=sources.audit,p0=sources.p0,p1=sources.p1,p2=sources.p2;
const allBeats=new Map(proof.movements.flatMap(m=>m.beats.map(b=>[b.id,{...b,movementId:m.id}])));
const allHinges=new Map(audit.betweenMovementSeams.map(h=>[h.id,h]));
const verseCache=new Map();
function parse(ref){
 const m=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(ref||"");
 assert.ok(m,"Invalid source reference in master worklist "+ref);
 const book=m[1],chapter=+m[2],lo=+m[3],hi=+(m[4]||m[3]);
 assert.ok(lo<=hi);
 return{book,chapter,lo,hi};
}
function exactVerse(ref,edition){
 const a=parse(ref),key=edition+"/"+a.book;
 if(!verseCache.has(key)){
  const s=read("data/scripture/witness/"+edition+"/"+a.book+".json");
  assert.equal(s.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(s.editionId,edition);
  verseCache.set(key,new Map(s.verses.map(([ch,v,t])=>[ch+":"+v,t])));
 }
 const w=verseCache.get(key),text=[];
 for(let v=a.lo;v<=a.hi;v++){
  const t=w.get(a.chapter+":"+v);
  assert.ok(t?.trim(),"Native Catholic Scripture witness missing "+edition+" "+ref+" v="+v);
  text.push(t);
 }
 return text;
}
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
assert.equal(ledger.schema,"ao.historia.p3.single-operational-acceptance-backlog.v1");
assert.equal(ledger.status,"CONSOLIDATED_RESEARCH_TO_EDITORIAL_HANDOFF_ONLY_ALL_PUBLICATION_GATES_UNPASSED");
assert.equal(ledger.policy.statusesAreNeverPromotions,true);
assert.equal(ledger.policy.sourceWordingNeverAIReconstructed,true);
assert.equal(ledger.policy.noProductionAppChange,true);
assert.equal(ledger.policy.noAtlasObjectChange,true);
assert.equal(ledger.policy.onlyFreezeAndPromoteAcceptedDiffs,true);
assert.equal(ledger.baseline.sourceOwnership,"ONE_PRIMARY_P3_MANUSCRIPT_NOT_PARALLEL_P4");
assert.equal(ledger.baseline.prNumber,1345);
assert.equal(proof.movements.length,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(ledger.baseline.canonicalSelectedScriptureUnits,93);
assert.equal(ledger.baseline.sourceMovements,37);
assert.equal(ledger.baseline.canonicalAtlasEvents,151);
assert.equal(ledger.baseline.atlasNavChapters,37);
assert.equal(ledger.baseline.provisionalReadingChapters,54);
assert.equal(buildBibleAtlas(read("data/explore/bible-places-compact.v1.json").entries).length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(p0.options.length,5);
assert.equal(p1.priorityOneHinges.length,20);
assert.equal(p2.priorityTwoHinges.length,11);
assert.equal(audit.betweenMovementSeams.length,36);
assert.equal(ledger.releaseGates.length,7);
assert.equal(ledger.releaseGates.filter(g=>g.status==="NOT_PASSED").length,6);
assert.equal(ledger.releaseGates[0].status,"RESEARCH_BASELINE_ONLY");
assert.ok(ledger.releaseGates.every(g=>g.status!=="PASSED"));
assert.ok(ledger.releaseGates.every(g=>g.checks.length>=3));
const originalHolds=proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE").map(b=>b.id));
const items=ledger.sourceDecisionWorklist;
assert.equal(originalHolds.length,16);
assert.equal(items.length,20);
assert.equal(items.filter(x=>x.ownership==="P3_EXISTING_HELD_SOURCE_BRIDGE").length,16);
assert.equal(items.filter(x=>x.ownership!=="P3_EXISTING_HELD_SOURCE_BRIDGE").length,4);
assert.deepEqual(new Set(items.filter(x=>x.ownership==="P3_EXISTING_HELD_SOURCE_BRIDGE").map(x=>x.sourceBeatId)),new Set(originalHolds));
assert.equal(new Set(items.map(x=>x.id)).size,20);
assert.deepEqual(items.map(x=>x.priority).slice(0,8),Array(8).fill("P0"));
const proposals=items.filter(x=>x.priority==="P0");
assert.equal(proposals.length,8);
assert.equal(ledger.totals.p0ResearchRecommendations,8);
assert.equal(ledger.totals.p0RecommendedOriginalSourceVerseEntries,38);
assert.equal(ledger.totals.p0AcceptedEditorialDecisions,0);
const proposedById=new Map(proposals.map(x=>[x.id,x]));
assert.deepEqual(proposals.map(x=>x.researchRecommendation.group),[
 "NOAH_ARK","PASSOVER_EXODUS","JOHN_PASSION","JOHN_PASSION",
 "PAUL_ROME","PAUL_ROME","APOCALYPTIC_VISION","NEW_JERUSALEM_VISION"
]);
let originalEntries=0;
for(const item of proposals){
 const recommendation=item.researchRecommendation;
 assert.equal(item.currentState,"RESEARCH_RECOMMENDATION_READY_NOT_ACCEPTED");
 assert.equal(recommendation.status,"SOURCE_EVIDENCE_PROPOSED_NOT_SELECTED");
 assert.equal(recommendation.acceptedByHumanEditor,false);
 assert.equal(recommendation.publicationApproved,false);
 assert.equal(recommendation.sourceWordsAndVersesNotRewritten,true);
 assert.equal(recommendation.readyForHumanEditorialDecision,true);
 assert.deepEqual(recommendation.refs,item.reviewReferences);
 assert.equal(recommendation.dependenciesToAccept.length,3);
 assert.ok(recommendation.reason.length>100);
 assert.ok(recommendation.contrast.length>65);
 for(const ref of recommendation.refs){
  originalEntries+=exactVerse(ref,"dr-challoner").length;
  for(const ed of editions)assert.ok(exactVerse(ref,ed).length>0);
 }
 for(const linked of recommendation.links)
  assert.ok(linked.startsWith("HS-W-UI-")||proposedById.has(linked),
    "Paired decisions must be owned by an existing source/UI item");
}
assert.equal(originalEntries,38);
const lowerPriority=items.filter(x=>x.priority!=="P0");
assert.equal(lowerPriority.length,12);
assert.equal(ledger.totals.allSourceResearchRecommendations,20);
assert.equal(ledger.totals.remainingSourceRecommendationResearchQueue,0);
assert.equal(ledger.totals.p1p2ResearchRecommendations,12);
assert.equal(ledger.totals.sourceEditorialAcceptances,0);
assert.equal(ledger.totals.releaseGatesPassed,0);
const expectedDispositions=new Map([
 ["HS-W-SRC-EXODUS-5-FIRST-REFUSAL","PROPOSE_TRIAL_INCLUDE_FIRST_REFUSAL"],
 ["HS-W-SRC-HS-CF-05","PROPOSE_TRIAL_INCLUDE_FULL_GOSPEL_RESPONSE"],
 ["HS-W-SRC-HS-CF-07","PROPOSE_TRIAL_INCLUDE_ASCENSION_PRELUDE"],
 ["HS-W-SRC-HS-CF-08","PROPOSE_TRIAL_INCLUDE_STEVE_REBUKE"],
 ["HS-W-SRC-HS-P3-CF-12","PROPOSE_CONDITIONAL_SOURCE_INSTEAD_OF_DUPLICATE_CONNECTOR"],
 ["HS-W-SRC-HS-CF-10","PREFER_KEEP_HELD_AS_OPTIONAL_GEOGRAPHIC_INTENTION"],
 ["HS-W-SRC-HS-CF-02","PREFER_KEEP_HELD_WITH_EDITORIAL_GENEALOGY"],
 ["HS-W-SRC-HS-CF-03","PROPOSE_TRIAL_INCLUDE_JOSEPH_PRISON_CAUSE"],
 ["HS-W-SRC-HS-P3-CF-17","PREFER_KEEP_HELD_AVOID_REPEAT_BAPTISM"],
 ["HS-W-SRC-HS-CF-09","PREFER_KEEP_HELD_FOR_SEPARATE_FAREWELL_DISCOURSE"],
 ["HS-W-SRC-MATTHEW-27-JUDAS","PREFER_KEEP_HELD_DISTINCT_JUDAS_EPISODE"],
 ["HS-W-SRC-HS-P3-CF-16","PROPOSE_TRIAL_INCLUDE_CANON_END_WITH_EXPLICIT_GAP"]
]);
assert.equal(expectedDispositions.size,12);
for(const item of lowerPriority){
 const d=item.researchRecommendation;
 assert.ok(d,"Every lower-risk source owner must have a proposed researched disposition");
 assert.equal(d.recommendation,expectedDispositions.get(item.id));
 assert.equal(d.group,item.group);
 assert.equal(d.status,"SOURCE_EVIDENCE_PROPOSED_NOT_SELECTED");
 assert.equal(item.currentState,"RESEARCH_RECOMMENDATION_READY_NOT_ACCEPTED");
 assert.equal(d.acceptedByHumanEditor,false);
 assert.equal(d.publicationApproved,false);
 assert.equal(d.nativeSourceContentNotEdited,true);
 assert.equal(d.original93UnitSelectionUnmodified,true);
 assert.equal(d.optionalUnselectedComparison,true);
 assert.equal(d.dependenciesToAccept.length,3);
 assert.ok(d.reason.length>150);
 assert.ok(d.contrast.length>110);
 assert.ok(d.conditionalEdits.length>=2);
 assert.ok(d.refs.length>0);
 assert.ok(d.refs.every(ref=>item.reviewReferences.includes(ref)),
   "No extra original Scripture introduced outside the P3 reviewed range "+item.id);
 for(const ref of d.refs)for(const edition of editions)
  assert.ok(exactVerse(ref,edition).length>0,"Missing three witness source "+item.id);
}
const low=id=>lowerPriority.find(w=>w.id===id).researchRecommendation;
assert.deepEqual(low("HS-W-SRC-EXODUS-5-FIRST-REFUSAL").refs,["Exodus 5:1–2"]);
assert.ok(low("HS-W-SRC-EXODUS-5-FIRST-REFUSAL").contrast.includes("Exodus 7:1–6"));
assert.deepEqual(low("HS-W-SRC-HS-CF-05").refs,["John 11:45–53"]);
assert.ok(low("HS-W-SRC-HS-CF-05").reason.includes("11:51–52")||
 low("HS-W-SRC-HS-CF-05").contrast.includes("11:51–52"));
assert.deepEqual(low("HS-W-SRC-HS-CF-07").refs,["Acts 1:3–5"]);
assert.deepEqual(low("HS-W-SRC-HS-CF-08").refs,["Acts 7:51–53"]);
assert.deepEqual(low("HS-W-SRC-HS-P3-CF-12").refs,["Acts 14:26–27"]);
assert.ok(low("HS-W-SRC-HS-P3-CF-12").conditionalEdits[0].includes("HS-P3-EC-10"));
assert.deepEqual(low("HS-W-SRC-HS-CF-10").refs,["Acts 19:21"]);
assert.deepEqual(low("HS-W-SRC-HS-CF-02").refs,["Genesis 11:26–31"]);
assert.deepEqual(low("HS-W-SRC-HS-CF-03").refs,["Genesis 39:19–21"]);
assert.deepEqual(low("HS-W-SRC-HS-P3-CF-17").refs,["John 1:29–34"]);
assert.deepEqual(low("HS-W-SRC-HS-CF-09").refs,["John 14:16–17"]);
assert.deepEqual(low("HS-W-SRC-MATTHEW-27-JUDAS").refs,["Matthew 27:3–10"]);
assert.deepEqual(low("HS-W-SRC-HS-P3-CF-16").refs,["Revelation 22:20–21"]);
const endingDouay=exactVerse("Revelation 22:19","dr-challoner").join(" ");
const endingFrench=exactVerse("Revelation 22:19","crampon-1923").join(" ");
assert.match(endingDouay,/book of life/i);
assert.match(endingFrench,/arbre de la vie/i);
assert.ok(low("HS-W-SRC-HS-P3-CF-16").conditionalEdits[0].includes("22:6–19"));
assert.ok(items.every(item=>item.researchRecommendation?.publicationApproved===false));
assert.equal(items.filter(x=>x.researchRecommendation?.acceptedByHumanEditor===true).length,0);

const p0Trial=id=>proposedById.get(id).researchRecommendation;
assert.deepEqual(p0Trial("HS-W-SRC-HS-CF-01").refs,["Genesis 6:9–14","Genesis 6:17–22"]);
assert.deepEqual(p0Trial("HS-W-SRC-EXODUS-12-FIRSTBORN").refs,["Exodus 12:29–30"]);
assert.deepEqual(p0Trial("HS-W-SRC-JOHN-19-PIERCED-SIDE").refs,["John 19:31–37"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-CF-06").refs,["John 19:38–42"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-CF-11").refs,["Acts 28:16"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-P3-CF-13").refs,["Acts 28:17–22"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-P3-CF-14").refs,["Revelation 4:1–2"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-P3-CF-15").refs,["Revelation 21:9–11"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-CF-06").links,["HS-W-SRC-JOHN-19-PIERCED-SIDE"]);
assert.deepEqual(p0Trial("HS-W-SRC-HS-CF-11").links,["HS-W-SRC-HS-P3-CF-13"]);
const workbench=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.ok(workbench.includes("historiaProofP0Jump"));
assert.ok(workbench.includes("historiaProofDecisionReview"));
assert.ok(workbench.includes("historiaP0Worklist.sourceDecisionWorklist"));
assert.ok(workbench.includes("if(!bridge)previous=p;"),
 "Held source comparisons cannot silently close the omitted main Scripture span");
assert.ok(workbench.includes('if(bridge&&proposedComparison)'));
assert.ok(workbench.includes("historiaProofOtherJump"));
assert.ok(workbench.includes('originalRecommendation?.recommendation?.startsWith("PROPOSE")'),
 "Only proposed source trials may expand the existing held source scope; keep-held alternatives must stay held");
assert.ok(workbench.includes("historiaProofBridgeFilter").valueOf());
assert.ok(workbench.includes('recommendation.acceptedByHumanEditor!==false'));
assert.ok(workbench.includes('recommendation.publicationApproved!==false'));
assert.ok(workbench.includes('if(!bridge&&showBridges&&(!highPriorityBridgesOnly||isPriorityHistoriaBridge(beat))&&afterTrial)'));
assert.ok(workbench.includes('recommendation.acceptedByHumanEditor!==false'));

for(const item of items){
 assert.equal(item.kind,"SOURCE_SELECTION");
 assert.equal(item.approval.selected,false);
 assert.equal(item.approval.publication,false);
 assert.equal(item.approval.oral,false);
 assert.equal(item.approval.printedEditionCertified,false);
 assert.equal(item.approval.theological,false);
 assert.equal(item.dependencyGroups.length,2);
 assert.ok(item.decisionRequired.length>85);
 assert.ok(item.acceptanceEvidence.length>=3);
 assert.ok(item.reviewReferences.length>=1);
 const beat=allBeats.get(item.sourceBeatId);
 assert.ok(beat,"No invented Scripture beat "+item.sourceBeatId);
 assert.equal(item.movementId,beat.movementId);
 if(item.ownership==="P3_EXISTING_HELD_SOURCE_BRIDGE"){
  assert.equal(beat.kind,"SOURCE_BRIDGE_CANDIDATE");
  assert.equal(item.sourceReference,beat.reference);
  assert.deepEqual(item.reviewReferences,beat.readthroughTrial?.refs||[beat.reference]);
  assert.equal(item.candidateComparisonStatus,
   beat.readthroughTrial?"EXISTING_VERBATIM_TRIAL_UNAPPROVED":"COORDINATE_HELD_NOT_SELECTED");
 }else{
  assert.equal(beat.kind,"SCRIPTURE");
  if(item.id==="HS-W-SRC-EXODUS-5-FIRST-REFUSAL"){
   assert.deepEqual(item.reviewReferences,["Exodus 5:1–2","Exodus 7:1–6"]);
   assert.ok(p1.optionalSourceComparisons.find(x=>x.hinge==="HS-HINGE-07"));
  }else if(item.id==="HS-W-SRC-EXODUS-12-FIRSTBORN"){
   assert.deepEqual(beat.afterSelectedReadthroughTrial.refs,item.reviewReferences);
  }else if(item.id==="HS-W-SRC-MATTHEW-27-JUDAS"){
   assert.deepEqual(beat.betweenSelectedReadthroughTrial.refs,item.reviewReferences);
   assert.equal(beat.betweenSelectedReadthroughTrial.publicationApproved,false);
  }else if(item.id==="HS-W-SRC-JOHN-19-PIERCED-SIDE"){
   assert.deepEqual(beat.afterSelectedReadthroughTrial.refs,item.reviewReferences);
  }else assert.fail("Unknown optional non-held source comparison "+item.id);
 }
 for(const h of item.hingeIds)assert.ok(allHinges.has(h),"Unknown hinge "+h);
 for(const r of item.reviewReferences)for(const ed of editions)assert.ok(exactVerse(r,ed).length>0);
}
const ux=ledger.readerPresentationWorklist;
assert.equal(ux.length,7);
assert.equal(new Set(ux.map(x=>x.id)).size,7);
assert.ok(ux.some(x=>x.group==="VISION_GENRE"));
assert.ok(ux.some(x=>x.group==="CITATION_BY_EDITION"));
for(const item of ux){
 assert.equal(item.kind,"READER_PRESENTATION");
 assert.equal(item.approval.publication,false);
 assert.equal(item.approval.product,false);
 assert.equal(item.approval.editorial,false);
 assert.ok(item.acceptanceEvidence.length>=5);
 assert.ok(item.decisionRequired.length>80);
 assert.ok(item.hingeIds.length>=1);
 assert.ok(item.sourceBeatIds.length>=2);
 for(const id of item.sourceBeatIds)assert.ok(allBeats.has(id),"No invented P3 UI source owner "+id);
 for(const h of item.hingeIds)assert.ok(allHinges.has(h),"No fake UI seam "+h);
}
const editorial=ledger.editorialAndAcceptanceWorklist;
assert.equal(editorial.length,6);
assert.deepEqual(editorial.map(x=>x.id),[
 "HS-W-EDIT-01","HS-W-EDIT-02","HS-W-PROV-01",
 "HS-W-THEO-01","HS-W-ORAL-01","HS-W-RELEASE-01"
]);
assert.ok(editorial.every(x=>x.approval.publication===false));
assert.equal(editorial.find(x=>x.id==="HS-W-EDIT-01").sourceUnitScope.total,41);
assert.equal(editorial.find(x=>x.id==="HS-W-EDIT-02").sourceUnitScope.total,41);
const currentContext=proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE").map(b=>({id:b.id,movementId:m.id})));
assert.deepEqual(ledger.existingEditorialContextOwners,currentContext);
assert.equal(currentContext.length,29);
const connector=[];
for(const m of proof.movements)for(const b of m.beats){
 if(b.beforeScriptureConnectorCandidate)connector.push({id:b.beforeScriptureConnectorCandidate.id,parentBeatId:b.id,movementId:m.id});
 if(b.kind==="SOURCE_BRIDGE_CANDIDATE"&&b.readthroughTrial?.editorialPreface)
  connector.push({id:b.readthroughTrial.editorialPreface.id,parentBeatId:b.id,movementId:m.id});
}
assert.deepEqual(ledger.existingEditorConnectorOwners,connector);
assert.equal(connector.length,12);
assert.equal(new Set(connector.map(x=>x.id)).size,12);
assert.equal(ledger.allThirtySixHingeAuditMap.length,36);
const ids=new Set([...items,...ux,...editorial].map(x=>x.id));
assert.equal(ids.size,33);
let active=0,deskOnly=0;
for(let i=0;i<36;i++){
 const row=ledger.allThirtySixHingeAuditMap[i],h=audit.betweenMovementSeams[i];
 assert.equal(row.id,h.id);
 assert.equal(row.from,h.fromMovement);
 assert.equal(row.to,h.toMovement);
 assert.equal(row.priority,h.priority);
 assert.equal(row.triageStatus,"DESK_TRIAGED_NOT_APPROVED");
 assert.equal(row.sourceAuditClosed,true);
 assert.deepEqual(row.assignedWorkIds,
  [...new Set([...items,...ux].filter(w=>w.hingeIds?.includes(h.id)).map(w=>w.id))]);
 for(const id of row.assignedWorkIds)assert.ok(ids.has(id));
 if(row.assignedWorkIds.length)active++;else deskOnly++;
}
assert.equal(ledger.totals.totalActionableWorkItems,33);
assert.equal(ledger.totals.sourceDecisions,20);
assert.equal(ledger.totals.existingHeldBridgeDecisions,16);
assert.equal(ledger.totals.additionalUnapprovedSourceComparisons,4);
assert.equal(ledger.totals.presentationGroups,7);
assert.equal(ledger.totals.editorialProvenanceAndGates,6);
assert.equal(ledger.totals.editorialContextUnits,29);
assert.equal(ledger.totals.editorialConnectorCandidates,12);
assert.equal(ledger.totals.allOriginalHinges,36);
assert.equal(ledger.totals.hingesWithActionableFollowup,active);
assert.equal(ledger.totals.hingesSufficientAtDeskWithoutNewWork,deskOnly);
assert.equal(ledger.totals.hingesWithActionableFollowup,32);
assert.equal(ledger.totals.publicationApproved,0);
assert.equal(ledger.antiRedundancy.parallelP4HistoricalOptionalVerses,69);
assert.equal(ledger.antiRedundancy.alreadyInP3SelectedSource+ledger.antiRedundancy.alreadyHeld+ledger.antiRedundancy.existingUnapprovedJudasComparison,69);
assert.equal(ledger.antiRedundancy.unaccountedHistoricalP4Options,0);
const originalSelected=proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="SCRIPTURE"));
assert.equal(originalSelected.length,93);
assert.ok(originalSelected.every(b=>b.publicationApproved===false));
// Research-only editorial economy is an overlay on P3 owner IDs, not a second manuscript.
const desktopEditorial=ledger.editorialDeskDispositionResearch;
assert.equal(desktopEditorial.schema,"ao.historia.p3.editorial-owner-desk-disposition.v1");
assert.equal(desktopEditorial.status,"ALL_41_DESK_TRIAGED_RESEARCH_ONLY_NO_COPY_ACCEPTED");
assert.equal(desktopEditorial.allOwners,41);
assert.equal(desktopEditorial.researched,41);
assert.equal(desktopEditorial.contextOwners,29);
assert.equal(desktopEditorial.connectorOwners,12);
assert.equal(desktopEditorial.accepted,0);
assert.equal(desktopEditorial.sourceUnitCountUnchanged,93);
assert.equal(desktopEditorial.movementCountUnchanged,37);
assert.equal(desktopEditorial.atlasEventCountUnchanged,151);
assert.equal(ledger.totals.editorialDeskProvisionalDispositions,41);
assert.equal(ledger.totals.editorialDeskAcceptedDecisions,0);
assert.equal(desktopEditorial.dispositions.length,41);
assert.deepEqual(desktopEditorial.provisionalDispositionCounts,{
 RETAIN_CONTEXT:26, TRIM_PROSE:10, CONDITIONAL_TRIM:3, CONDITIONAL_SUPPRESS:2
});
const editorialOwners=[...ledger.existingEditorialContextOwners,...ledger.existingEditorConnectorOwners];
assert.deepEqual(new Set(desktopEditorial.dispositions.map(x=>x.id)),new Set(editorialOwners.map(x=>x.id)));
assert.equal(new Set(desktopEditorial.dispositions.map(x=>x.id)).size,41);
for(const item of desktopEditorial.dispositions){
 const owner=editorialOwners.find(x=>x.id===item.id);
 assert.ok(owner && owner.movementId===item.movementId,"Lost original P3 editorial owner "+item.id);
 const movement=proof.movements.find(x=>x.id===item.movementId);
 const beat=movement?.beats.find(x=>x.id===item.sourceBeatId);
 assert.ok(beat,"Lost original source beat for "+item.id);
 const liveCandidate=item.sourceCandidateField.split(".").reduce((o,key)=>o?.[key],beat);
 assert.ok(liveCandidate && typeof liveCandidate.text==="string" && liveCandidate.text.length>10);
 assert.deepEqual(item.sourceReferences,liveCandidate.sourceReferences);
 assert.deepEqual(item.editionAwareReferences,liveCandidate.sourceReferencesByEdition||null);
 assert.equal(item.currentCandidateTextUnchanged,true);
 assert.equal(item.originalScriptureUnchanged,true);
 assert.equal(item.editorialAccepted,false);
 assert.equal(item.selectedForPublication,false);
 assert.equal(item.oralAccepted,false);
 assert.equal(item.printedEditionCollated,false);
 assert.equal(item.theologicallyApproved,false);
 assert.equal(item.status,"PROVISIONAL_SOURCE_LINKED_DESK_DISPOSITION_NOT_ACCEPTED");
 assert.ok(item.researchRationale.length>75 && item.sourceHandlingNote.length>25);
 if(item.kind==="EXISTING_EDITORIAL_CONTEXT")assert.equal(beat.kind,"EDITORIAL_CONTEXT_NOT_BIBLE");
 else {
  assert.equal(item.kind,"EXISTING_EDITOR_CONNECTOR");
  assert.equal(owner.parentBeatId,item.sourceBeatId);
 }
 if(["TRIM_PROSE","CONDITIONAL_TRIM"].includes(item.disposition))
  assert.ok(item.trialReplacementCopy?.length>15,"Missing proposed research-only shortened copy "+item.id);
 else assert.equal(item.trialReplacementCopy,null);
 if(item.relatedSourceDecisionId)
  assert.ok(items.find(w=>w.id===item.relatedSourceDecisionId),"Dangling source cross-reference "+item.id);
}
assert.deepEqual(desktopEditorial.dispositions.filter(x=>x.editionAwareReferences).map(x=>x.id),[
 "H05-02","H23-02","H37-02"
]);
// Trial the 15 proposed reductions against the native witness coordinates without
// changing, certifying or translating any canonical Scripture or editorial copy.
const sourceComparisonPhase=desktopEditorial.sourceComparisonPhase;
assert.equal(sourceComparisonPhase.schema,"ao.historia.p3.proposed-copy-and-optional-source-sequential-readthrough.v1");
assert.equal(sourceComparisonPhase.status,"15_SOURCE_EVIDENCE_COMPARISONS_COMPLETED_PROVISIONAL_NO_ORAL_ACCEPTANCE");
assert.equal(sourceComparisonPhase.changeOwnersCompared,15);
assert.equal(sourceComparisonPhase.originalScriptureUnitCount,93);
assert.equal(sourceComparisonPhase.movementProjectionsChecked,37);
assert.equal(sourceComparisonPhase.interMovementHingesCrossReferenced,36);
assert.equal(sourceComparisonPhase.heldBridgeAttachedPrefacesNotShownUnlessTheirSourceTrialIsVisible,3);
assert.deepEqual(sourceComparisonPhase.unresolvedHighestPriorityHinges,[
 "HS-HINGE-02","HS-HINGE-08","HS-HINGE-28","HS-HINGE-33","HS-HINGE-34"
]);
assert.equal(sourceComparisonPhase.originalSelectedScriptureWordsFromSeparateAudit,audit.totals.selectedDouayChallonerWords);
assert.equal(sourceComparisonPhase.wordCountIsEditorialProseOnlyExcludesScripture,true);
assert.equal(ledger.totals.sourceComparedEditorialReductionOptions,15);
assert.equal(ledger.totals.editsActuallyPromoted,0);
const copied=desktopEditorial.dispositions.filter(x=>x.disposition!=="RETAIN_CONTEXT");
assert.equal(copied.length,15);
assert.equal(new Set(copied.map(x=>x.id)).size,15);
const editorialTokenCount=s=>String(s||"").trim().split(/\s+/).filter(Boolean).length;
const copyOwners=new Map(desktopEditorial.dispositions.map(x=>[x.id,x]));
let originalTrialWords=0,editedTrialWords=0,visibleContextCount=0,visibleTrialCount=0,originalScriptureCount=0;
const projection=[];
for(const movement of proof.movements){
 let selectedInMovement=0,firstSelected=null,lastSelected=null,editorialCount=0,originalWords=0,trialWords=0;
 for(const beat of movement.beats){
  if(beat.kind==="SCRIPTURE"){
   originalScriptureCount++;
   selectedInMovement++;
   firstSelected ??= beat.refs[0];
   lastSelected=beat.refs.at(-1);
   assert.equal(beat.publicationApproved,false);
  }
  const e=beat.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"?beat.editorialReadingCandidate:null;
  const c=beat.beforeScriptureConnectorCandidate;
  for(const source of [e,c].filter(Boolean)){
   const original=source.text;
   const overlay=copyOwners.get(beat.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"?beat.id:source.id);
   if(overlay){
    assert.equal(overlay.movementId,movement.id);
    assert.equal(overlay.currentCandidateTextUnchanged,true);
   }
   let trial=overlay?.trialReplacementCopy||
    overlay?.readthroughSourceComparison?.withoutNewSource?.copy||original;
   assert.ok(original && trial,"Trial must not erase the active source-labelled handoff without a selected alternative");
   editorialCount++;
   originalWords+=editorialTokenCount(original);
   trialWords+=editorialTokenCount(trial);
  }
 }
 assert.ok(selectedInMovement>0,"Research readthrough projection must retain canonical Scripture in "+movement.id);
 const metrics=audit.perMovementMetrics.find(m=>m.movementId===movement.id);
 assert.equal(firstSelected,metrics.firstPassage);
 assert.equal(lastSelected,metrics.lastPassage);
 projection.push({id:movement.id,firstSelected,lastSelected,originalWords,trialWords,editorialCount});
 originalTrialWords+=originalWords;editedTrialWords+=trialWords;
 visibleContextCount+=editorialCount;visibleTrialCount+=editorialCount;
}
assert.equal(originalScriptureCount,93);
assert.equal(projection.length,37);
assert.equal(visibleContextCount,38);
assert.equal(visibleTrialCount,38);
assert.equal(sourceComparisonPhase.contextAndBeforeScriptureUnitsInTrial,38);
assert.equal(sourceComparisonPhase.originalContextAndBeforeConnectorApproximateWords,originalTrialWords);
assert.equal(sourceComparisonPhase.shortenedTrialContextAndBeforeConnectorApproximateWords,editedTrialWords);
assert.ok(editedTrialWords<originalTrialWords,"Research revisions should improve prose economy");
for(let i=0;i<36;i++){
 const seam=audit.betweenMovementSeams[i],a=projection[i],b=projection[i+1];
 assert.equal(seam.fromMovement,a.id);
 assert.equal(seam.toMovement,b.id);
 assert.equal(seam.fromLastSelectedSource,a.lastSelected);
 assert.equal(seam.toFirstSelectedSource,b.firstSelected);
 assert.notEqual(seam.approved,true,"Never treat desk movement continuity as a passed literary gate");
 assert.equal(seam.publicationApproved,false);
 assert.equal(seam.mayFillWithAIParaphrase,false);
}
// Held-bridge prefaces must not become visible in the 38-unit draft just
// because their own trial source exists.
const heldPrefaces=["HS-P3-EC-02","HS-P3-EC-06","HS-P3-EC-07"];
for(const id of heldPrefaces){
 const x=copyOwners.get(id);
 assert.equal(x.sourceCandidateField,"readthroughTrial.editorialPreface");
 assert.equal(x.readthroughSourceComparison.withoutNewSource.rendering,"NOT_RENDERED");
 assert.equal(x.readthroughSourceComparison.withoutNewSource.copy,null);
}
for(const x of copied){
 const comparison=x.readthroughSourceComparison;
 assert.equal(comparison.status,"THREE_WITNESS_SOURCE_REFERENCES_DESK_COMPARED_NOT_ACCEPTED");
 assert.equal(comparison.originalSourceTextNotCopiedIntoEditorialLedger,true);
 assert.equal(comparison.sourceEditoriallySelected,false);
 assert.equal(comparison.changeAppliedToMainManuscript,false);
 assert.equal(comparison.manualOralLiteraryApproval,false);
 assert.ok(comparison.sourceEvidenceFinding.length>90);
 assert.ok(comparison.sourceEvidenceReferences.length>=1);
 assert.ok(comparison.sourceEvidenceReferences.every(r=>typeof r==="string" && /^([1-3]?[A-Za-z]+) [1-9]\d*:[1-9]\d*(?:[–-][1-9]\d*)?$/.test(r)));
 for(const sourceRef of comparison.sourceEvidenceReferences){
  for(const edition of editions)assert.ok(exactVerse(sourceRef,edition).length>0,
   "Research edit lost a native Catholic witness: "+x.id+" / "+sourceRef+" / "+edition);
 }
 const withSource=comparison.withPairedOriginalSource;
 if(withSource){
  assert.ok(withSource.sourceDecisionIds.length>=1);
  for(const id of withSource.sourceDecisionIds)
   assert.ok(items.some(item=>item.id===id&&item.approval.selected===false),
    "Unaccepted source must not silently become accepted: "+id);
  if(withSource.rendering==="OMIT_EDITORIAL")assert.equal(withSource.copy,null);
  else assert.ok(withSource.copy?.length>25);
 }
}
assert.deepEqual(copied.filter(x=>x.readthroughSourceComparison.withPairedOriginalSource?.rendering==="OMIT_EDITORIAL").map(x=>x.id),[
 "HS-P3-EC-11","HS-P3-EC-09","HS-P3-EC-10"
]);
assert.equal(copyOwners.get("H34-01").trialReplacementCopy.includes("adultery with Bathsheba"),false);
assert.match(copyOwners.get("H34-01").trialReplacementCopy,/David took Bathsheba/);
assert.doesNotMatch(copyOwners.get("HS-P3-EC-07").readthroughSourceComparison.withPairedOriginalSource.copy,/Caesar|appeal/i);
assert.match(copyOwners.get("HS-P3-EC-09").readthroughSourceComparison.withoutNewSource.copy,/Son of God/);
assert.doesNotMatch(copyOwners.get("HS-P3-EC-09").readthroughSourceComparison.withoutNewSource.copy,/Lamb of God/);
assert.deepEqual(copyOwners.get("HS-P3-EC-06").readthroughSourceComparison.sourceEvidenceReferences,[
 "Acts 6:5–15","Acts 7:51–55"
]);
assert.ok(sourceComparisonPhase.semanticOutcome.includes("STILL_REQUIRED"));

const ruthCase=copyOwners.get("HS-P3-EC-03").readthroughSourceComparison;
assert.deepEqual(ruthCase.sourceEvidenceReferences,["Ruth 2:3","Ruth 4:1–12","Ruth 4:13"]);
assert.equal(ruthCase.unresolvedEditionWitnessSlot.reference,"Ruth 2:2");
assert.equal(ruthCase.unresolvedEditionWitnessSlot.edition,"cpdv-2009");
assert.equal(ruthCase.unresolvedEditionWitnessSlot.textRestored,false);
assert.equal(ruthCase.unresolvedEditionWitnessSlot.printedEditionCollationPending,true);
assert.deepEqual(sourceComparisonPhase.editionWitnessExceptions,[{
 ownerId:"HS-P3-EC-03",edition:"cpdv-2009",reference:"Ruth 2:2",
 status:"UNRESOLVED_IMPORT_GAP_FAIL_CLOSED"
}]);
assert.throws(()=>exactVerse("Ruth 2:2","cpdv-2009"),/Native Catholic Scripture witness missing/);
assert.ok(exactVerse("Ruth 2:2","dr-challoner").length===1);
assert.ok(exactVerse("Ruth 2:2","crampon-1923").length===1);
assert.ok(editions.every(ed=>exactVerse("Ruth 2:3",ed).length===1));


// Every P0 insertion choice must come from the original five-hinge P3 minimum ledger.
// This is a strictly non-publishing projection: no reader variant becomes selected.
const criticalTrial=ledger.criticalSeamInsertionPreflight;
const minimum=read(criticalTrial.sourceOfEvidence);
assert.equal(criticalTrial.schema,"ao.historia.p3.five-p0-seam-reader-insertion-preflight.v1");
assert.equal(criticalTrial.status,"FIVE_CRITICAL_SEAMS_CONDITIONALLY_ASSEMBLED_AT_DESK_NOT_SOURCE_SELECTED");
assert.equal(criticalTrial.noAutomatedPromotion,true);
assert.equal(criticalTrial.hinges,5);
assert.equal(criticalTrial.sourceOwnerIdsInP0Candidates,7);
assert.equal(criticalTrial.preferredTrialSourceOwners,6);
assert.equal(criticalTrial.optionalVisionTrialSourceOwners,1);
assert.equal(criticalTrial.caseResults.length,5);
assert.equal(criticalTrial.sourceOwnership,"REUSE_ORIGINAL_BEATS_AND_SOURCE_WORKLIST_NO_PARALLEL_MANUSCRIPT");
assert.equal(ledger.totals.p0CriticalSeamsMechanicallyCompared,5);
assert.equal(ledger.totals.p0ConditionalReadingVerseEntries,33);
assert.equal(ledger.totals.p0CriticalSourceApprovals,0);
assert.equal(criticalTrial.movementSequenceDeskGate.existingScriptureUnits,93);
assert.equal(criticalTrial.movementSequenceDeskGate.existingMovements,37);
assert.equal(criticalTrial.movementSequenceDeskGate.interMovementSeams,36);
assert.equal(criticalTrial.movementSequenceDeskGate.selectedScriptureTextChanged,false);
assert.equal(criticalTrial.movementSequenceDeskGate.acceptedSourceAdditions,0);
assert.equal(criticalTrial.movementSequenceDeskGate.readerRuntimeChanged,false);
assert.equal(criticalTrial.movementSequenceDeskGate.priorityP0StillBlockedForPublication,5);
assert.equal(criticalTrial.movementSequenceDeskGate.actualUninterruptedOralReadingCompleted,false);
assert.equal(criticalTrial.movementSequenceDeskGate.omissionDisclosureRequired,true);
assert.equal(criticalTrial.movementSequenceDeskGate.threeNativeWitnessesStillUncollated,true);
assert.deepEqual(criticalTrial.caseResults.map(x=>x.hingeId),[
 "HS-HINGE-02","HS-HINGE-08","HS-HINGE-28","HS-HINGE-33","HS-HINGE-34"
]);
const p0SelectedVerseKeys=new Set();
const baselineSelectedVerseKeys=new Set();
for(const movement of proof.movements)for(const b of movement.beats)if(b.kind==="SCRIPTURE")
 for(const ref of b.refs){const s=parse(ref);for(let v=s.lo;v<=s.hi;v++)baselineSelectedVerseKeys.add(s.book+" "+s.chapter+":"+v);}
let linkedSourceOwners=new Set();
const sourceRows=criticalTrial.caseResults.map(row=>{
 const seam=audit.betweenMovementSeams.find(s=>s.id===row.hingeId);
 const recorded=minimum.options.find(o=>o.hinge===row.hingeId);
 assert.ok(seam && recorded,"No independently source-owned critical seam "+row.hingeId);
 assert.equal(seam.priority,"P0");
 assert.equal(row.priority,"P0");
 assert.equal(row.fromMovement,seam.fromMovement);
 assert.equal(row.toMovement,seam.toMovement);
 assert.equal(row.anchorBefore,seam.fromLastSelectedSource);
 assert.equal(row.anchorAfter,seam.toFirstSelectedSource);
 assert.equal(row.causalIssueStillReleaseBlocking,true);
 assert.equal(row.sourceComparisonCompleteAtDesk,true);
 assert.equal(row.sourceSelectionAccepted,false);
 assert.equal(row.oralAccepted,false);
 assert.equal(row.theologicalAccepted,false);
 assert.equal(row.printedEditionCertified,false);
 assert.equal(row.productionAppChanged,false);
 assert.equal(row.atlas151Changed,false);
 assert.equal(row.disposition,"PREFERRED_MECHANICAL_RESEARCH_TRIAL_NOT_SELECTED");
 assert.ok(row.exactSourcePresentationRule.length>140);
 assert.ok(row.requiredOmissionOrAttributionDisclosure.length>125);
 assert.ok(row.heldWithoutPromotionBehavior.length>125);
 const variant=recorded.choices.find(c=>c.id===row.preferredExistingP0OptionId);
 assert.ok(variant,"Referenced P0 alternative was not researched: "+row.preferredExistingP0OptionId);
 assert.deepEqual(row.preferredNativeRefs,variant.refs);
 assert.deepEqual(row.preferredWitnessMetrics,variant.measurements);
 assert.equal(new Set(row.sourceInReadingOrderBeatIds).size+ (row.hingeId==="HS-HINGE-08"?1:0),
              row.sourceInReadingOrderBeatIds.length);
 for(const bid of row.sourceInReadingOrderBeatIds)assert.ok(allBeats.has(bid),"Source order invented new P3 beat "+bid);
 assert.ok(row.alternativeExistingP0OptionIds.every(id=>recorded.choices.some(c=>c.id===id)));
 for(const wid of row.sourceDecisionOwnerIds){
  assert.ok(proposedById.has(wid),"Critical hinge must use an unapproved P0 source owner "+wid);
  linkedSourceOwners.add(wid);
 }
 for(const ref of variant.refs){
  const coords=parse(ref);
  for(let v=coords.lo;v<=coords.hi;v++){
   const k=coords.book+" "+coords.chapter+":"+v;
   assert.equal(baselineSelectedVerseKeys.has(k),false,"P0 trial overlaps the original 93 Scripture owners: "+k);
   assert.equal(p0SelectedVerseKeys.has(k),false,"Newly proposed critical hinge duplicates native Scripture: "+k);
   p0SelectedVerseKeys.add(k);
  }
  for(const ed of editions)assert.ok(exactVerse(ref,ed).length>0,"Missing native P0 trial "+ed+" "+ref);
 }
 for(const ed of editions){
  const nativeWords=variant.refs.flatMap(ref=>exactVerse(ref,ed)).join(" ").trim();
  const count=nativeWords?nativeWords.split(/\s+/).length:0;
  assert.equal(count,variant.measurements[ed].sourceWords,"Never rewrite or invent P0 witness text count: "+ed+" "+row.hingeId);
 }
 return {row,variant};
});
assert.equal(linkedSourceOwners.size,6);
const genreOnlyRow=criticalTrial.caseResults.find(x=>x.hingeId==="HS-HINGE-34");
assert.deepEqual(genreOnlyRow.sourceDecisionOwnerIds,[]);
assert.deepEqual(genreOnlyRow.optionalSourceDecisionOwnerIds,["HS-W-SRC-HS-P3-CF-14"]);
assert.ok(proposedById.has(genreOnlyRow.optionalSourceDecisionOwnerIds[0]));
assert.equal(proposedById.get(genreOnlyRow.optionalSourceDecisionOwnerIds[0]).approval.selected,false);
assert.equal(new Set([...linkedSourceOwners,...genreOnlyRow.optionalSourceDecisionOwnerIds]).size,7);
assert.equal(p0SelectedVerseKeys.size,33);
const originalCost=criticalTrial.combinedUnapprovedReadingCost;
assert.equal(originalCost.genreBoundaryMandatoryAdditionalVerses,0);
assert.equal(originalCost.optionalRevelation4Verses,2);
assert.equal(originalCost.addedScriptureWordsNotAChangeToOriginal28815,true);
assert.equal(originalCost.readingRateWpmForReferenceOnly,130);
for(const ed of editions){
 const core=sourceRows.slice(0,4).reduce((z,x)=>z+x.variant.measurements[ed].sourceWords,0);
 const verses=sourceRows.slice(0,4).reduce((z,x)=>z+x.variant.measurements[ed].verseEntries,0);
 const opt=minimum.options.find(x=>x.hinge==="HS-HINGE-34").choices.find(c=>c.id==="OPEN_HEAVENLY_VISION");
 const skip=minimum.options.find(x=>x.hinge==="HS-HINGE-28").choices.find(c=>c.id==="PIERCED_SIDE_SEPARATE_WITNESS");
 const measured=originalCost.measurementsByEdition[ed];
 assert.equal(core,measured.coreUnapprovedTrialWords);
 assert.equal(verses,measured.coreUnapprovedTrialVerseEntries);
 assert.equal(measured.coreUnapprovedTrialVerseEntries,33);
 assert.equal(measured.includingOptionalVisionTrialVerseEntries,verses+opt.measurements[ed].verseEntries);
 assert.equal(measured.includingOptionalVisionTrialWords,core+opt.measurements[ed].sourceWords);
 assert.equal(measured.alternativeBurialOnlyVerseEntries,verses-skip.measurements[ed].verseEntries);
 assert.equal(measured.alternativeBurialOnlyWords,core-skip.measurements[ed].sourceWords);
}
assert.equal(originalCost.measurementsByEdition["dr-challoner"].coreUnapprovedTrialWords,855);
assert.equal(originalCost.measurementsByEdition["dr-challoner"].includingOptionalVisionTrialWords,922);
assert.equal(originalCost.measurementsByEdition["dr-challoner"].alternativeBurialOnlyWords,694);
assert.deepEqual(sourceRows.find(x=>x.row.hingeId==="HS-HINGE-34").variant.refs,[]);
assert.deepEqual(sourceRows.find(x=>x.row.hingeId==="HS-HINGE-33").row.sourceDecisionOwnerIds,
 ["HS-W-SRC-HS-CF-11","HS-W-SRC-HS-P3-CF-13"]);
assert.deepEqual(sourceRows.find(x=>x.row.hingeId==="HS-HINGE-28").row.sourceDecisionOwnerIds,
 ["HS-W-SRC-JOHN-19-PIERCED-SIDE","HS-W-SRC-HS-CF-06"]);
assert.match(sourceRows.find(x=>x.row.hingeId==="HS-HINGE-33").row.requiredOmissionOrAttributionDisclosure,/28:17–19/);
assert.match(sourceRows.find(x=>x.row.hingeId==="HS-HINGE-34").row.exactSourcePresentationRule,/non-Scripture/);

console.log("PASS Historia unified worklist: 36 fully owned hinge dispositions, 20 optional native-source decisions, 7 grouped reader tasks, 29 original contexts + 12 connectors (41 desk-triaged and 15 witness-linked comparisons, 0 accepted), 6 editorial/acceptance tracks, seven unopened release gates, no new Atlas/Scripture publication");
