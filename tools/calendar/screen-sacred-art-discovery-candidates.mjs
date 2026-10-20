#!/usr/bin/env node
/**
 * Rank ALL 117 (or however many current run discovered) Commons source leads
 * within one 76-record current-run discovery artifact. Non-publishing.
 *
 * It is never safe to approve a painting identity solely from a search score.
 * Human checks remain required for physical original, file rights, image choice
 * and mobile display. No network, image acquisition, or mutable art decisions.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const source=process.argv[2]||"artifacts/qa-discovery-merged/discovery-76-ranked.json";
const output=process.argv[3]||"artifacts/qa-discovery-merged";
const input=JSON.parse(readFileSync(source,"utf8"));
const FILENAME_STOPWORDS=/\b(?:study|studies|copy|after|school|follower|workshop|attributed|engraving|etching|lithograph|print|aquatint|sketch|drawing|reproduction|facsimile|replica|verso)\b/i;
const PRADO=/(museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i;
const norm=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const scoreOf=x=>Number.isFinite(Number(x.searchScore))?Number(x.searchScore):0;
const scorePixels=x=>Math.min(Number(x.image?.width)||0,Number(x.image?.height)||0);
function screenCandidate(work,candidate) {
 const url=candidate.filePage||"";
 const desc=String(candidate.commonsTitle||"");
 const subjWords=candidate.matchedSubjectWords||[];
 const explicitMediumMismatch=Boolean(candidate.possibleEngravingOrDifferentMedium)||FILENAME_STOPWORDS.test(desc);
 const declaredCC0=/^CC0(?:\s*1\.0)?$/i.test(candidate.photoRightsDeclared||"");
 const isAttribution=/^CC BY(?:-SA)?\s+[234]\.0$/i.test(candidate.photoRightsDeclared||"");
 const isPD=/^(?:Public domain|PD)$/i.test(candidate.photoRightsDeclared||"");
 const isPrado=PRADO.test(url)||PRADO.test(desc)||PRADO.test(candidate.attribution||"");
 const adequate=scorePixels(candidate)>=1600;
 const artistMatch=candidate.artistTokenMatched===true;
 const score=scoreOf(candidate);
 // All candidates remain unconfirmed: terms like "after"/"school"/"replica"
 // may designate a different *art object*, never simply a bad crop.
 let lane="OBJECT_ACCESSION_REQUIRED";
 if(isPrado)lane="EMBARGO_PRADO";
 else if(explicitMediumMismatch)lane="MEDIUM_OR_COPY_CONFLICT";
 else if(score<20||!artistMatch)lane="WEAK_METADATA_MATCH";
 else if(!adequate)lane="SMALLER_SOURCE_NEEDS_COMPARISON";
 else if(!declaredCC0&&!isPD&&!isAttribution)lane="PHOTO_LICENSE_UNRESOLVED";
 const priority=lane==="OBJECT_ACCESSION_REQUIRED"?0:
  lane==="SMALLER_SOURCE_NEEDS_COMPARISON"?1:
  lane==="WEAK_METADATA_MATCH"?2:
  lane==="MEDIUM_OR_COPY_CONFLICT"?3:
  lane==="PHOTO_LICENSE_UNRESOLVED"?4:5;
 return {filePage:url,commonsTitle:desc,licenseClaim:candidate.photoRightsDeclared,
  licenseUrl:candidate.licenseUrl||null, attribution:candidate.attribution||null,
  image:candidate.image,matchedSubjectWords:subjWords,artistTokenMatched:artistMatch,
  originalSearchScore:score,highResolution:adequate,
  provenanceSha1:candidate.image?.sha1||null,
  documentScore:Math.min(60,score)+(adequate?15:0)+(declaredCC0?10:0)+(isPD?5:0),
  reviewLane:lane,reviewPriority:priority,
  originalIdentityIndependentlyVerified:false,
  photoRightsIndependentlyVerified:false,
  curatorPhotoChoiceApproved:false,mobileCropApproved:false,publicationApproved:false};
}
export function buildScreenedCandidateQueue(discovery){
 assert(discovery.schema==="AO_SACRED_ART_76_MERGED_DISCOVERY_REVIEW_V1");
 assert(discovery.counts.works===76&&discovery.records.length===76);
 assert(discovery.counts.editorialRatingsChanged===0&&discovery.counts.productionCertified===0);
 const seenIDs=new Set();
 const rows=discovery.records.map(row=>{
  assert(!seenIDs.has(row.artworkId),"Duplicate research artwork");
  seenIDs.add(row.artworkId);
  const list=(row.candidates||[]).map(c=>screenCandidate(row,c))
   .sort((a,b)=>a.reviewPriority-b.reviewPriority||
      b.documentScore-a.documentScore||
      a.filePage.localeCompare(b.filePage));
  return {artworkId:row.artworkId,approvedArtTitle:row.title,approvedArtist:row.artist,
   recoveryStatus:row.discoveryStatus,
   screenedCount:list.length,
   leadingCandidateForObjectComparison:list.find(x=>x.reviewLane!=="EMBARGO_PRADO")?.filePage||null,
   authoritativeObjectAccessionKnownFromThisDiscovery:false,
   numberStillNeedingPhysicalOriginalCheck:list.length,
   candidates:list};
 });
 const candidateCount=rows.reduce((s,x)=>s+x.screenedCount,0);
 assert.equal(candidateCount,discovery.counts.eligibleFileCandidates);
 const all=rows.flatMap(x=>x.candidates.map(c=>({...c,artworkId:x.artworkId,artworkTitle:x.approvedArtTitle,artist:x.approvedArtist})));
 const hash=new Map();
 for(const x of all){
  if(!x.provenanceSha1)continue;
  const group=hash.get(x.provenanceSha1)||new Set();
  group.add(x.artworkId);hash.set(x.provenanceSha1,group);
 }
 const repeatedFingerprints=[...hash].filter(([,v])=>v.size>1)
  .map(([sha1,ids])=>({sha1,artworkIds:[...ids].sort(),mustReviewIdentity:true}));
 const byLane={};
 for(const c of all)byLane[c.reviewLane]=(byLane[c.reviewLane]||0)+1;
 const sourceLeads=rows.filter(x=>x.screenedCount>0).length;
 assert.equal(rows.filter(x=>x.recoveryStatus==="HOLD_PRADO_SOURCE_POLICY").every(x=>x.screenedCount===0),true);
 assert(all.every(x=>!x.publicationApproved&&!x.originalIdentityIndependentlyVerified));
 return {schema:"AO_SACRED_ART_76_DISCOVERY_CANDIDATE_SCREEN_V1",asOf:discovery.asOf,
  sourceRun:discovery.sourceShards,
  counts:{artworkRecords:76,worksWithCandidateLeads:sourceLeads,fileCandidates:all.length,
   screenLanes:byLane,sharedFileFingerprints:repeatedFingerprints.length,
   approvedPhotos:0,publishedPhotos:0},
  hardGates:{noPradoOrMirrors:true,noAutomaticCuratorSelection:true,
   fileSearchScoreNotObjectIdentity:true,noAutomaticPhotoRightsCertification:true,
   noAutomaticAppRelease:true,noPaidLicencesOrPermissionRequests:true,
   exactObjectAccessionRequiredBeforeReusingCandidate:true},
  sharedFingerprints:repeatedFingerprints,records:rows};
}
const result=buildScreenedCandidateQueue(input);
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"discovery-117-screened.json"),JSON.stringify(result,null,2)+"\n");
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const csvVal=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
const csv=["artworkId,approvedTitle,artist,rank,lane,metadataScore,fileURL,originalSHA1,fileLicense,shortEdgePx,objectIndependentlyVerified"];
for(const r of result.records)for(const [i,c] of r.candidates.entries())
 csv.push([r.artworkId,r.approvedArtTitle,r.approvedArtist,i+1,c.reviewLane,c.documentScore,
  c.filePage,c.provenanceSha1,c.licenseClaim,
  Math.min(c.image?.width||0,c.image?.height||0),"NO"].map(csvVal).join(","));
writeFileSync(join(output,"discovery-117-screened.csv"),csv.join("\n")+"\n");
const rows=result.records.filter(r=>r.candidates.length).map(r=>"<section><h2>"+esc(r.approvedArtTitle)+
 " <small>"+esc(r.approvedArtist)+"</small></h2>"+
 "<p>Search matches: "+r.candidates.length+" — no object identity certified</p>"+
 r.candidates.map((c,i)=>"<article><strong>#"+(i+1)+
 " · "+esc(c.reviewLane)+"</strong> · documentation rank "+c.documentScore+
 " · "+esc(c.image?.width)+"×"+esc(c.image?.height)+
 " · "+esc(c.licenseClaim)+
 "<p><a href=\""+esc(c.filePage)+"\">"+esc(c.commonsTitle)+"</a></p>"+
 "</article>").join("")+"</section>").join("");
const h="<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><title>Ad Orientem · 117-image discovery screening</title>"+
 "<style>body{background:#090d13;color:#e8e1d6;font:15px/1.5 Georgia;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}section{border:1px solid #535054;padding:16px}article{border-top:1px solid #45434b;padding:9px 0}p,small{color:#b5ad9f}a{color:#a8c8df}</style>"+
 "<h1>All Commons leads screened by metadata — batch review</h1><p>"+result.counts.fileCandidates+
 " leads across "+result.counts.worksWithCandidateLeads+
 " artworks. Metadata rank is NOT object identity, image rights, or final-photo approval. No art selection has changed.</p><main>"+rows+"</main></html>";
writeFileSync(join(output,"discovery-117-screened.html"),h);
console.log(JSON.stringify(result.counts));
