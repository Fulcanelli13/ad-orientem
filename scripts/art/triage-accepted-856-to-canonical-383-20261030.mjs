/**
 * Sacred Art Phase 1 — exhaustive candidate triage, never auto-promote.
 * Compare each of 856 accepted source cards to locked 383 artworks,
 * incorporating 192 structured artwork IDs, three Commons/museum joins,
 * three Commons multi-photo groups, and two accession-collision exclusions.
 * All identity candidates remain RESEARCH_ONLY.
 */
import {readFileSync,writeFileSync} from "node:fs";
const prefix="data/calendar/";
const load=name=>JSON.parse(readFileSync(prefix+name,"utf8"));
const source="sacred-art-accepted-856-to-canonical-383-20261029.v1.json";
const existing=load(source),main=load("sacred-art-curator-queues-383-20261029.v1.json");
const structured=load("sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json");
const sameWork=load("sacred-art-phase1-commons-305-work-qid-summary-20261030.v2.json");
const museumTriage=load("sacred-art-phase1-commons-museum-five-work-triage-20261030.v1.json");
const weak=load("sacred-art-phase1-weak-identity-13-triage-20261029.v1.json");
if(existing.records.length!==856||existing.counts.confirmed!==72||
 existing.counts.unlinked!==784||main.main_records.length!==383||
 structured.rows.length!==305||sameWork.sameWorkMediaGroups.length!==3||
 museumTriage.cases.length!==5||weak.records.length!==13)
 throw Error("Frozen source baseline / linked evidence missing");
const byId=new Map(existing.records.map(r=>[r.sourceId,r]));
const canonId=new Map(main.main_records.map(r=>[r.artwork_id,r]));
if(byId.size!==856||canonId.size!==383)throw Error("Duplicate IDs");
const folded=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const stop=new Set(["the","a","an","of","with","and","in","at","from","to","for",
"de","du","des","la","le","les","l","un","une","et","en","da","di","del","della","dello",
"die","der","das","den","von","van","und","het","een","deze","this",
"st","saint","sainte","san","santa","santo","s","holy","heilige","heilig",
"painting","picture","portrait","work","study","sketch","panel","detail"]);
const common=new Set(["christ","jesus","mary","madonna","virgin","child","saints","saint",
"crucifixion","annunciation","adoration","holy","family","resurrection","pieta"]);
const toks=s=>folded(s).split(" ").filter(x=>x.length>1&&!stop.has(x));
const uniq=a=>[...new Set(a)];
const jaccard=(x,y)=>{
 const X=new Set(x),Y=new Set(y);if(!X.size||!Y.size)return 0;
 const overlap=[...X].filter(t=>Y.has(t)).length;
 return overlap/(X.size+Y.size-overlap);
};
const dice=(a,b)=>{
 const A=folded(a).replace(/\s/g,""),B=folded(b).replace(/\s/g,"");
 if(!A||!B)return 0;if(A===B)return 1;
 const gram=s=>{const m=new Map();for(let i=0;i<s.length-1;i++){
 const k=s.slice(i,i+2);m.set(k,(m.get(k)||0)+1);}return m;};
 const G=gram(A),H=gram(B);let same=0;
 for(const [k,n] of G)same+=Math.min(n,H.get(k)||0);
 return 2*same/Math.max(1,A.length+B.length-2);
};
const titleSim=(a,b)=>Math.max(jaccard(uniq(toks(a)),uniq(toks(b))),dice(a,b)*0.93);
const qual=s=>/\b(after|workshop|circle|studio|school|follower|copy|attributed|possibly|anonymous|unknown|anonieme|atelier|d.apr.s|nach)\b/i.test(s||"");
const artistTokens=s=>uniq(toks(String(s||"").replace(/\([^)]*\)/g," ").replace(/\b\d{4}\b/g," ")))
 .filter(x=>!["attributed","after","workshop","circle","studio","school","follower",
 "copy","painter","schilder","anonymous","unknown","anonieme","master",
 "italian","german","french","spanish","dutch","flemish","english",
 "born","active","probably","possibly","painting"].includes(x));
const artSim=(a,b)=>jaccard(artistTokens(a),artistTokens(b));
const knownSameWorkGroups=[
 ...sameWork.sameWorkMediaGroups.map(x=>({relation:"COMMONS_P6243_SAME_WORK_MULTIPLE_MEDIA",
  evidence:"SAME_WIKIDATA_WORK_QID_REQUIRES_CORROBORATION",
  workQid:x.wikidataWorkId,sourceIds:x.sourceIds,
  doesNotLinkCanonical383:true,allowMerge:false})),
 ...museumTriage.cases.filter(x=>x.classification.startsWith("CROSS_SOURCE"))
 .map(x=>({relation:"CROSS_SOURCE_COMMONS_AND_MUSEUM_SAME_PHYSICAL_WORK",
  evidence:x.classification,workQid:x.workQid,
  sourceIds:[x.commonsSourceId,x.museumSourceId],
  doesNotLinkCanonical383:true,allowMerge:false}))
];
const falsePairs=museumTriage.cases.filter(x=>x.classification.startsWith("FALSE"))
 .map(x=>({sourceIds:[x.commonsSourceId,x.museumSourceId],
  reason:"DIFFERENT_COLLECTIONS_COLLIDING_ACCESSION_NUMBER",
  avoidSameWorkInference:true}));
for(const g of knownSameWorkGroups)for(const id of g.sourceIds)
 if(!byId.has(id))throw Error("Missing group accepted source "+id);
const linked=existing.records.filter(r=>r.canonical383.status==="CONFIRMED_IDENTITY");
const unlinked=existing.records.filter(r=>r.canonical383.status==="NO_CONFIRMED_IDENTITY");
const canonicalSources=main.main_records.map(r=>({
 id:r.artwork_id,title:r.title,artist:r.artist,url:r.source_page,
 qualifier:qual(r.artist),titleTokens:toks(r.title)}));
const linkedSourceIds=new Set(linked.map(r=>r.sourceId));
const staged=[];
for(const r of unlinked){
 const srcTitle=r.review.title,srcArtist=r.review.artistAsPresented;
 const candidates=[];
 for(const c of canonicalSources){
  const ts=titleSim(srcTitle,c.title),as=artSim(srcArtist,c.artist);
  // Deliberately conservative lead generation; never a confirmed identity.
  if(ts<0.59)continue;
  if(as<0.30&&ts<0.92)continue;
  const score=0.71*ts+0.29*as;
  if(score<0.65)continue;
  const t=toks(srcTitle),ct=c.titleTokens;
  const generic=(t.length<2||ct.length<2||t.every(x=>common.has(x))||ct.every(x=>common.has(x)));
  const mismatchedQualifiers=qual(srcArtist)!==c.qualifier;
  candidates.push({canonicalArtworkId:c.id,
   canonicalTitle:c.title,canonicalArtist:c.artist,
   originalCanonicalPhotoSource:c.url||null,
   titleSimilarity:Number(ts.toFixed(3)),artistTokenSimilarity:Number(as.toFixed(3)),
   weightedLeadScore:Number(score.toFixed(3)),
   genericSubjectOrShortTitle:generic,
   attributionQualifierConflict:mismatchedQualifiers,
   confidenceTier:generic?"GENERIC_SUBJECT_LOW_CONFIDENCE":
    (mismatchedQualifiers?"ATTRIBUTION_CAUTION":
    (ts>=0.91&&as>=0.60?"STRONG_TEXT_ONLY_STILL_UNVERIFIED":
     "MODERATE_TEXT_ONLY_UNVERIFIED")),
   originalObjectIdentityCorroborated:false,addCanonicalLink:false});
 }
 candidates.sort((a,b)=>b.weightedLeadScore-a.weightedLeadScore||
  a.canonicalArtworkId.localeCompare(b.canonicalArtworkId));
 const top=candidates.slice(0,3);
 const cms=structured.rows.find(x=>x.sourceId===r.sourceId);
 const families=knownSameWorkGroups.filter(x=>x.sourceIds.includes(r.sourceId))
  .map(x=>({relation:x.relation,workQid:x.workQid,
   otherAcceptedSourceIds:x.sourceIds.filter(s=>s!==r.sourceId)}));
 const clashes=falsePairs.filter(x=>x.sourceIds.includes(r.sourceId))
  .map(x=>x.sourceIds.find(y=>y!==r.sourceId));
 staged.push({
  sourceId:r.sourceId,batch:r.batch,sourceLane:r.sourceId.split(":")[0],
  reviewedTitle:srcTitle,reviewedArtist:srcArtist,
  reviewedAccession:r.review.accession||null,
  originalDecision:r.review.decision,
  originalPhotoPage:r.review.originalSourceUrl,
  originalCanonical383Status:"NO_CONFIRMED_IDENTITY",
  wikidataArtworkQIds:cms?.wikidataDigitalRepresentationOf||[],
  wikiQidProofType:cms?.wikidataDigitalRepresentationOf.length?"COMMONS_STRUCTURED_LEAD_ONLY":"NONE",
  otherAcceptedSameWorkEvidenceFamilies:families,
  crossMuseumFalseJoinExclusions:clashes,
  textualCanonical383CandidateCount:candidates.length,
  topCanonicalTextOnlyCandidates:top,
  proposedQueue:families.length?"KNOWN_SAME_WORK_WITHIN_ACCEPTED_QUEUE":
   top.some(x=>x.confidenceTier==="STRONG_TEXT_ONLY_STILL_UNVERIFIED")?
      "CANONICAL_TEXT_LEADS_MANUAL_VERIFY":
   top.length?"WEAK_CANONICAL_TEXT_LEADS_MANUAL_VERIFY":
   cms?.wikidataDigitalRepresentationOf.length?"STRUCTURED_ARTWORK_QID_UNMATCHED_CANONICAL":
   "NO_CANONICAL_IDENTITY_LEAD",
  priority:r.review.decision==="IMPORT_WITH_CORRECTIONS"?"CONDITIONAL_IMAGE_REPAIR_HOLD":
   families.length?"PHYSICAL_WORK_SOURCE_FAMILY_REVIEW":
   top.length?"CANONICAL_IDENTITY_REVIEW":"SOURCE_IDENTITY_ONLY",
  confirmedNewCanonical383Link:false,
  imageRightsCertified:false,photoVisualApproved:false,publicationEligible:false,
  productionMutation:false
 });
}
const qCounts={};const laneCounts={};
for(const x of staged){
 qCounts[x.proposedQueue]=(qCounts[x.proposedQueue]||0)+1;
 const l=laneCounts[x.sourceLane]??={unlinked:0,textLead:0,withQid:0,knownWithinAcceptedFamilies:0};
 l.unlinked++;if(x.topCanonicalTextOnlyCandidates.length)l.textLead++;
 if(x.wikidataArtworkQIds.length)l.withQid++;
 if(x.otherAcceptedSameWorkEvidenceFamilies.length)l.knownWithinAcceptedFamilies++;
}
const noMatchCount=staged.filter(x=>!x.topCanonicalTextOnlyCandidates.length).length;
const counts={
 reviewedCards:2455,accepted:856,canonicalMaster:383,
 canonicalSourceCardsAlreadyLinked:72,notCanonicallyLinked:784,
 unlinkedRowsProcessed:staged.length,
 unlinkedWithAtLeastOneTextOnlyCanonicalLead:784-noMatchCount,
 unlinkedWithoutTextCanonicalLead:noMatchCount,
 unlinkedWithStrongTextOnlyLead:staged.filter(x=>x.topCanonicalTextOnlyCandidates
   .some(y=>y.confidenceTier==="STRONG_TEXT_ONLY_STILL_UNVERIFIED")).length,
 commonsWorkQidSourcesWithinUnlinked:staged.filter(x=>x.wikidataArtworkQIds.length).length,
 existingCommonsSameWorkMediaGroups:3,
 commonsToMuseumWorkFamilies:3,
 accessionCollisionFamiliesExplicitlyExcluded:2,
 distinctConfirmedNewPhysicalWorks:0,newCanonical383Links:0,
 licensingCertifications:0,publicationApprovals:0,productionMutations:0,
 queueCounts:qCounts,sourceLanes:laneCounts
};
if(staged.length!==784||linked.length!==72||
 staged.some(x=>linkedSourceIds.has(x.sourceId)||
 x.confirmedNewCanonical383Link!==false||
 x.photoVisualApproved!==false||x.publicationEligible!==false))
 throw Error("Research only candidate gate failed");
const result={
 schema:"AO_SACRED_ART_PHASE1_856_TO_383_EXHAUSTIVE_CANDIDATE_TRIAGE_V1",
 generatedAt:new Date().toISOString(),
 upstream:{acceptedCrosswalk:source,canonical383:"sacred-art-curator-queues-383-20261029.v1.json",
 commonsMediaInfo:"sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json",
 commonsWorkSameQid:"sacred-art-phase1-commons-305-work-qid-summary-20261030.v2.json",
 commonsMuseumTriage:"sacred-art-phase1-commons-museum-five-work-triage-20261030.v1.json"},
 rules:["Candidate title/artist similarity is discovery only. Never count similarity as a same-work identity.",
  "The 72 confirmed canonical-source links are retained as-is; 784 unlinked is not 784 novel works.",
  "Different source image hashes or artwork QIDs need not mean different physical artworks.",
  "P6243 work statements are leads; P180 depicts and P921 main subject are never physical identity.",
  "Same QID media families and accession-correlated Commons/museum identities are within-accepted relationships, not new canonical 383 joins.",
  "Attribution qualifier differences, composite objects, and workshop/copies must remain separate.",
  "All 84 IMPORT_WITH_CORRECTIONS remain held for exact image and rights QA.",
  "No automated changes to historical user choices, the original 383, image imports or production."],
 counts,
 knownWithinAcceptedSameWorkFamilies:knownSameWorkGroups,
 explicitFalseSameWorkAccessionPairs:falsePairs,
 acceptedCanonicalAlreadyLinked:linked.map(x=>({sourceId:x.sourceId,canonicalArtworkId:x.canonical383.artworkId,evidence:x.canonical383.evidence})),
 unlinkedRows:staged,release:{userChoicesUnchanged:true,canonicalMaster383Unchanged:true,
 photoLicensingUncertified:true,nativeVisualUncertified:true,productionMutation:false}};
writeFileSync(prefix+"sacred-art-phase1-856-to-383-exhaustive-candidate-triage-20261030.v1.json",
 JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(counts,null,2));