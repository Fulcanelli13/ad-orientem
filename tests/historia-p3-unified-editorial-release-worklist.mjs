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
console.log("PASS Historia unified worklist: 36 fully owned hinge dispositions, 20 optional native-source decisions, 7 grouped reader tasks, 29 original contexts + 12 connectors (41 desk-triaged, 0 accepted), 6 editorial/acceptance tracks, seven unopened release gates, no new Atlas/Scripture publication");
