/**
 * Private editorial source-coverage accounting for all 106 St Pius X chapters.
 * Aggregates the existing P6 owner records; this is a REPORT, not another registry.
 * Four bounded original-language witness annexes are counted as spot checks,
 * never complete original-source collation or approval.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readCorpus} from './pius-x-generative-review.mjs';

function normalizedDocumentKey(url){
 try{
  const u=new URL(url);
  if(u.hostname==='www.vatican.va')return u.pathname.replace(/\/(?:en|fr|it|la|de|es|pt|pl|ar)\//,'/{language}/');
  return u.origin+u.pathname;
 }catch{return 'source-url-missing';}
}
export function buildPrimaryCoverageReport(store,{nextBatchDocuments=12}={}){
 if(!Number.isInteger(nextBatchDocuments)||nextBatchDocuments<1||nextBatchDocuments>30)
  throw new Error('nextBatchDocuments must be 1–30');
 const annexes=store.primaryWitnessAnnexes;
 const gate=store.sourceOnlyGate;
 const groups=new Map();let nodes=0,partialChapters=0,coveredNodes=0;
 const sourceOwnedInitialNodes=[...annexes.values()].reduce((n,a)=>n+a.dialogueMappings.length,0);
 const supplemental=JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/pius-x-eight-document-followup-triage-20261023.v1.json',import.meta.url),'utf8'));
 const eight=JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/pius-x-next12-eight-opening-context-evidence-20261023.v1.json',import.meta.url),'utf8'));
 const wave2=JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/pius-x-six-document-wave2-20261023.v1.json',import.meta.url),'utf8'));
 const wave3=JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/pius-x-six-document-wave3-20261023.v1.json',import.meta.url),'utf8'));
 const wave4=JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/pius-x-six-document-wave4-remaining60-20261023.v1.json',import.meta.url),'utf8'));
 const discovery=JSON.parse(readFileSync(new URL('../previews/pius-x-study/evidence/pius-x-next12-primary-document-discovery-20261023.v1.json',import.meta.url),'utf8'));
 const totalResearchWitnesses=[...annexes.values()].reduce((n,a)=>n+a.sourceWitnesses.length,0)+
   eight.items.reduce((n,a)=>n+a.witnesses.length,0)+supplemental.additionalOriginalWitnesses.length+wave2.witnesses.length+wave3.witnesses.length+wave4.witnesses.length;
 const discoveredNodeIds=new Set(discovery.documents.flatMap(d=>d.chapters.flatMap(c=>c.nodeIds)));
 const sourceGateNodeIds=new Set([...gate.values()].flatMap(m=>[...m.keys()]));
 const mappedInDiscovery=[...sourceGateNodeIds].filter(id=>discoveredNodeIds.has(id)).length;
 if(discoveredNodeIds.size!==195||mappedInDiscovery!==144||
    sourceGateNodeIds.size!==144||wave4.summary.newHeldNodes!==36||
    wave3.summary.newResearchHolds!==15||
    discovery.summary.documentGroups!==12)
  throw new Error('Original twelve-document source population or hold reconciliation drifted');
 const olderHolds=supplemental.followups.filter(r=>r.witnessIds.length===0);
 const resolvedOlderHolds=olderHolds.filter(r=>gate.get(r.chapterId)?.has(r.nodeId)).length;
 if(olderHolds.length!==8||resolvedOlderHolds!==3)
  throw new Error('Older source holds require reconciliation with newer passage evidence');
 for(const c of store.data.chapters){
  if(c.partial)partialChapters++;
  const sourceUrl=c.source?.url||c.nodes?.[0]?.source?.url||'';
  const key=normalizedDocumentKey(sourceUrl);
  let g=groups.get(key);
  if(!g){g={documentKey:key,representativeUrl:sourceUrl,documentTitle:c.source?.title||'',
   genres:new Set(),sourceClasses:new Set(),chapters:[],nodeCount:0,witnessMappedNodeCount:0,
   witnessAnchorIds:new Set(),papalSourceChapterCount:0};groups.set(key,g);}
  g.chapters.push(c.id);g.nodeCount+=c.nodes.length;nodes+=c.nodes.length;
  g.genres.add(c.source?.genre||'UNKNOWN');
  g.sourceClasses.add(c.sourceClass||'UNCLASSIFIED');
  if(c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'&&!c.partial)g.papalSourceChapterCount++;
  const mapped=gate.get(c.id);
  if(mapped){
   for(const [nodeId,piece] of mapped){
    if(!c.nodes.some(n=>n.id===nodeId)||!piece.pieces?.length)
     throw new Error('Unknown or unattested source-only gate entry');
    coveredNodes++;g.witnessMappedNodeCount++;
    for(const w of piece.pieces)g.witnessAnchorIds.add(w.id);
   }
  }
 }
 if(nodes!==423||store.data.chapters.length!==106||coveredNodes!==144||
    gate.size!==47||sourceOwnedInitialNodes!==14||totalResearchWitnesses!==165)
  throw new Error('Canonical P6 or 144-node original-text source-only coverage changed');
 const all=[...groups.values()].map(g=>{
  const {genres,sourceClasses,witnessAnchorIds,...rest}=g;
  return {...rest,genres:[...genres].sort(),sourceClasses:[...sourceClasses].sort(),
   witnessAnchorCount:witnessAnchorIds.size,
   nodeCountWithoutWitnessSpotcheck:g.nodeCount-g.witnessMappedNodeCount,
   status:g.witnessMappedNodeCount===0?'NO_ORIGINAL_TEXT_SPOTCHECK':
    g.witnessMappedNodeCount===g.nodeCount?'ALL_NODES_HAVE_BOUNDED_SPOTCHECK':
    'PARTIAL_NODE_SPOTCHECK'};
 }).sort((a,b)=>b.papalSourceChapterCount-a.papalSourceChapterCount||
  b.nodeCountWithoutWitnessSpotcheck-a.nodeCountWithoutWitnessSpotcheck||
  a.documentKey.localeCompare(b.documentKey));
 const pending=all.filter(g=>g.papalSourceChapterCount>0&&g.nodeCountWithoutWitnessSpotcheck>0);
 return {schema:'AO_SPX_PRIMARY_SOURCE_COVERAGE_REPORT_V1',
  status:'RESEARCH_ONLY_NOT_RELEASE_APPROVED',
  totals:{chapters:106,nodes:423,partialChapters,uniqueDocumentGroups:all.length,
   chaptersWithWitnessSpotcheck:gate.size,nodesWithWitnessSpotcheck:coveredNodes,
   oldAnnexDocumentSubjects:annexes.size,oldAnnexMappedNodes:sourceOwnedInitialNodes,
   expandedOpeningNodes:eight.items.length,newBoundedFollowupNodes:supplemental.summary.boundedFollowupCandidates,
   bulkWave2NewNodes:wave2.summary.newlyMappedNodes,bulkWave2PartialNodeHolds:wave2.summary.originalP6PartialHolds,bulkWave2Screened:wave2.summary.screenedExistingNodeIDs,bulkWave2NewExcerpts:wave2.witnesses.length,
   bulkWave3Screened:wave3.summary.previouslyUnmappedNodesScreened,
   bulkWave3NewNodes:wave3.summary.newBoundedResearchCandidates,
   bulkWave3Holds:wave3.summary.newResearchHolds,
   bulkWave3NewExcerpts:wave3.witnesses.length,
   bulkWave4Screened:wave4.summary.remainingNodesScreened,
   bulkWave4NewNodes:wave4.summary.newBoundedResearchCandidates,
   bulkWave4Holds:wave4.summary.newHeldNodes,
   bulkWave4NewExcerpts:wave4.witnesses.length,
   originalTwelveDocumentNodeCount:discoveredNodeIds.size,
   originalTwelveDocumentUnmappedNodes:discoveredNodeIds.size-mappedInDiscovery,
   originalTwelveDocumentHistoricalHolds:wave3.summary.newResearchHolds+wave4.summary.newHeldNodes,
   historicallyHeldFollowups:supplemental.summary.heldFollowupNodes,
   priorFollowupHoldsNowResolved:resolvedOlderHolds,
   heldResearchFollowups:olderHolds.length-resolvedOlderHolds,
   nodesNotYetMappedToOriginalExcerpt:423-coveredNodes,
   originalLanguageExcerptAnchors:totalResearchWitnesses,
   chaptersFullyAuthenticated:0,publishedAnswers:0},
  suggestedNextDocuments:pending.slice(0,nextBatchDocuments).map(g=>({
   documentKey:g.documentKey,representativeUrl:g.representativeUrl,
   chapters:g.chapters,pendingNodeCount:g.nodeCountWithoutWitnessSpotcheck,
   caveat:'Selection only; check source genre, original-language edition and precise claims before excerpting'
  })),
  documents:all,
  warning:'This report counts short primary-source substring spot checks, NOT certified claims, EN/FR translation correctness, or eligibility to publish.'};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const store=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
 const result=buildPrimaryCoverageReport(store);
 const out=process.env.AO_SPX_COVERAGE_REPORT_OUTPUT;
 if(out){
  const abs=resolve(out);mkdirSync(dirname(abs),{recursive:true});
  writeFileSync(abs,JSON.stringify(result,null,2)+'\n');
  process.stdout.write(JSON.stringify({output:abs,totals:result.totals,nextDocumentCount:result.suggestedNextDocuments.length})+'\n');
 }else process.stdout.write(JSON.stringify({totals:result.totals,suggestedNextDocuments:result.suggestedNextDocuments},null,2)+'\n');
}
