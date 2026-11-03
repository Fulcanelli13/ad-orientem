/**
 * Read-only, evidence-first crosswalk of selected Prayer artworks to 3,205
 * frozen source records and 989 operational works.
 *
 * No source retrieval, no image promotion, no metadata mutation.
 * "Candidate" is not a licence, a scene approval or a physical-photo proof.
 * Run in repo checkout (large source records are not readable via connector):
 *   node scripts/art/prayer-source-alias-bulk-triage.mjs
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const root="data/prayer/artwork-editorial-20261101/";
const master=read(root+"curatorial-master-267-20261101.v1.json");
const existing=read(root+"gallery-archive-crosswalk-267-20261103.v1.json");
const source=read("data/artwork/research-source-records-3205.v1.json");
const op=read("data/artwork/research-operational-989.v1.json");
const records=source.records,works=op.works;
assert.equal(master.assignments.length,267);
assert.equal(existing.assignments.length,267);
assert.equal(records.length,3205);
assert.equal(works.length,989);
const norm=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function values(obj,seen=new WeakSet(),out=[]){
 if(obj===null||obj===undefined)return out;
 if(typeof obj==="string"){out.push(obj);return out}
 if(typeof obj!=="object"||seen.has(obj))return out;
 seen.add(obj);
 if(Array.isArray(obj))for(const v of obj)values(v,seen,out);
 else for(const v of Object.values(obj))values(v,seen,out);
 return out;
}
function canonicalURL(s){
 if(typeof s!=="string"||!/^https?:\/\//i.test(s))return null;
 try{
  const u=new URL(s);
  let path;
  try{path=decodeURIComponent(u.pathname)}catch{path=u.pathname}
  path=path.replace(/\/+/g,"/").replace(/\/$/,"").toLowerCase();
  // Commons' File title uses spaces and underscores interchangeably.
  if(/wikimedia\.org$/.test(u.hostname)&&path.includes("/wiki/file:"))
   path=path.replace(/_/g," ");
  return u.hostname.toLowerCase().replace(/^www\./,"")+path;
 }catch{return null}
}
function exactText(a,b){return !!a&&!!b&&norm(a)===norm(b)}
const coll=arr=>arr.map((item,index)=>{
 const strings=values(item),literal=new Set(strings),urlStrings=[...new Set(strings.filter(s=>/^https?:\/\//i.test(s)))];
 const keys=new Set([...literal].map(norm));
 const canURLs=new Set(urlStrings.map(canonicalURL).filter(Boolean));
 return {index,keys,literal,urls:urlStrings,canURLs};
});
const srcRows=coll(records),opRows=coll(works);
const archive=existing.assignments;
const snapshots=new Map(archive.map(x=>[x.slot,x]));
const flattened=master.assignments.map(a=>{
 const p=a.currentAssignment?.painting||null;
 const url=p?.sourcePage||null,canonical=url?canonicalURL(url):null;
 return {slot:a.slot,title:p?.title||null,artist:p?.artist||null,url,canonical,
  workCandidateIds:a.sourceCrosswalk?.candidateIDs||[],
  state:snapshots.get(a.slot)?.currentRuntime?.state||null};
});
function lookup(row,dataset){
 if(!row.url)return {literal:[],canonical:[],candidateId:[],exactArtistTitle:[]};
 const targetTitle=norm(row.title),targetArtist=norm(row.artist);
 const candidateIds=new Set(row.workCandidateIds.filter(Boolean).map(norm));
 const literal=[],canonical=[],candidateId=[],exactArtistTitle=[];
 for(const v of dataset){
  if(v.literal.has(row.url))literal.push(v.index);
  else if(row.canonical&&v.canURLs.has(row.canonical))canonical.push(v.index);
  if(candidateIds.size&&[...candidateIds].some(id=>v.keys.has(id)))candidateId.push(v.index);
  if(targetTitle&&targetArtist&&v.keys.has(targetTitle)&&v.keys.has(targetArtist))exactArtistTitle.push(v.index);
 }
 return {literal,canonical,candidateId,exactArtistTitle};
}
const urlRows=flattened.filter(x=>x.url);
const uniqueURLs=new Map();
for(const row of urlRows)if(!uniqueURLs.has(row.url))uniqueURLs.set(row.url,{...row,slots:[]});
for(const row of urlRows)uniqueURLs.get(row.url).slots.push(row.slot);
const uniqueResults=new Map();
for(const [url,row] of uniqueURLs)uniqueResults.set(url,{
 records:lookup(row,srcRows),works:lookup(row,opRows)
});
const rows=flattened.map(row=>{
 const matched=row.url?uniqueResults.get(row.url):null;
 const primary=matched?.records||{literal:[],canonical:[],candidateId:[],exactArtistTitle:[]};
 const operational=matched?.works||{literal:[],canonical:[],candidateId:[],exactArtistTitle:[]};
 const verifiedLevel=primary.literal.length?"EXACT_URL_STRING_IN_SOURCE_RECORD":
  primary.canonical.length?"CANONICAL_URL_CANDIDATE_REVIEW":
  primary.candidateId.length?"RECORDED_SOURCE_ID_CANDIDATE_REVIEW":
  primary.exactArtistTitle.length?"TITLE_ARTIST_CANDIDATE_REVIEW":"NO_MATCHED_SOURCE_RECORD";
 return {...row,sourceRecordMatches:primary,operationalWorkMatches:operational,
  highestSourceEvidence:row.url?verifiedLevel:"NO_SELECTED_SOURCE_URL",
  imageReleasePermittedByScan:false};
});
const unreconciled=rows.filter(x=>x.url&&!x.sourceRecordMatches.literal.length);
const queue=existing.pendingDistinctWorksByPotentialReuse.map(w=>{
 const slots=w.slots.map(id=>rows.find(x=>x.slot===id));
 const level=slots.some(x=>x?.highestSourceEvidence==="EXACT_URL_STRING_IN_SOURCE_RECORD")?"EXACT_URL_SOURCE_RECORD":
   slots.some(x=>x?.highestSourceEvidence==="CANONICAL_URL_CANDIDATE_REVIEW")?"URL_ALIAS_CANDIDATE":
   slots.some(x=>x?.highestSourceEvidence==="RECORDED_SOURCE_ID_CANDIDATE_REVIEW")?"SOURCE_ID_CANDIDATE":
   slots.some(x=>x?.highestSourceEvidence==="TITLE_ARTIST_CANDIDATE_REVIEW")?"TITLE_ARTIST_CANDIDATE":
   "SOURCE_NOT_LINKED";
 const workName=norm(w.painting?.title);
 const maker=norm(w.painting?.artist);
 const carriedPR=((workName==="the heart of jesus"||workName==="the heart of mary")&&maker==="juan patricio morlete ruiz" ||
 (workName==="salvator mundi"&&maker==="ambrosius benson"))?2302:null;
 return {...w,recordLinkLevel:level,existingReleasePR:carriedPR,
  archiveGate:w.archivedSourceAvailable?"ARCHIVED_FILE_PRESENT_NOT_PUBLISHABLE":"SOURCE_FILE_NOT_CONFIRMED",
  nextStep:carriedPR?"RESOLVE_EXISTING_PR2302_NO_DUPLICATE":
   w.archivedSourceAvailable?"VERIFY_EXACT_FILE_RIGHTS_PHYSICAL_QA_AND_PLACEMENTS":
   "IDENTIFY_EXACT_ORIGINAL_FILE_FROM_EXISTING_GALLERY_FIRST",
  publicationPermission:false};
});
queue.sort((a,b)=>{
 const priority=x=>x.existingReleasePR?0:x.archivedSourceAvailable?1:2;
 return priority(a)-priority(b)||b.positionCount-a.positionCount||String(a.painting.title).localeCompare(String(b.painting.title));
});
const summary={
 total:rows.length,
 selectedURLs:urlRows.length,
 distinctSourceURLs:uniqueURLs.size,
 uniqueSelectedURLsLiteralRecord:[...uniqueResults.values()].filter(x=>x.records.literal.length).length,
 positionExactURL:rows.filter(x=>x.highestSourceEvidence==="EXACT_URL_STRING_IN_SOURCE_RECORD").length,
 positionCanonicalAlias:rows.filter(x=>x.highestSourceEvidence==="CANONICAL_URL_CANDIDATE_REVIEW").length,
 positionSourceIdCandidate:rows.filter(x=>x.highestSourceEvidence==="RECORDED_SOURCE_ID_CANDIDATE_REVIEW").length,
 positionTitleArtistCandidate:rows.filter(x=>x.highestSourceEvidence==="TITLE_ARTIST_CANDIDATE_REVIEW").length,
 positionNoSourceRecordMatch:rows.filter(x=>x.highestSourceEvidence==="NO_MATCHED_SOURCE_RECORD").length,
 noSelectedURL:rows.filter(x=>x.highestSourceEvidence==="NO_SELECTED_SOURCE_URL").length,
 unlinkedLiteralURLPositions:unreconciled.length,
 pendingSourceKeys:queue.length,
 pendingSourceKeysWithArchiveFile:queue.filter(x=>x.archivedSourceAvailable).length,
 pendingSourceKeysClaimedByPR2302:queue.filter(x=>x.existingReleasePR===2302).length,
 pendingPositionTotal:queue.reduce((sum,x)=>sum+x.positionCount,0)
};
const out={
 schema:"AO_PRAYER_267_SOURCE_ALIAS_AND_BATCH_RELEASE_TRIAGE_V1",
 date:"2026-11-03",
 sourceRegistries:{
  master:root+"curatorial-master-267-20261101.v1.json",
  firstPass:root+"gallery-archive-crosswalk-267-20261103.v1.json",
  source3205:"data/artwork/research-source-records-3205.v1.json",
  operational989:"data/artwork/research-operational-989.v1.json"
 },
 policy:["Source-record matches are evidence of catalogue linkage only.","URL normalization is an alias candidate, never an automatic exact object match.",
 "Title/artist or source-ID co-occurrence is not proof of a matching physical image.",
 "Photographic rights, pixels, scene, scope, existing protected covers and stage-specific mobile QA remain independently gated.",
 "PR2302 assets must not be copied or superseded; all new releases require explicit separate approval and checks."],
 summary,
 rows,unlinkedLiteralURLPositions:unreconciled,
 pendingReleaseWorkQueue:queue
};
assert.equal(summary.unlinkedLiteralURLPositions+summary.positionExactURL,summary.selectedURLs);
assert.equal(summary.pendingPositionTotal,173);
assert.equal(summary.pendingSourceKeys,81);
assert.ok(rows.every(r=>r.imageReleasePermittedByScan===false));
const dest=process.argv[2]||"artifacts/prayer-gallery/prayer-source-alias-and-batch-release-triage.v1.json";
mkdirSync(dirname(resolve(dest)),{recursive:true});
writeFileSync(dest,JSON.stringify(out,null,2)+"\n");
console.log("SOURCE_ALIAS_SUMMARY "+JSON.stringify(summary));
console.log("NONEXACT_URL_TRIAGE "+JSON.stringify(unreconciled.map(x=>({slot:x.slot,title:x.title,artist:x.artist,
 url:x.url,source:x.sourceRecordMatches,operational:x.operationalWorkMatches}))));
console.log("ARCHIVED_PENDING_QUEUE "+JSON.stringify(queue.filter(x=>x.archivedSourceAvailable).map(x=>({
 title:x.painting.title,artist:x.painting.artist,slots:x.positionCount,recordLinkLevel:x.recordLinkLevel,openReleasePR:x.existingReleasePR,
 next:x.nextStep}))));
console.log("ALIAS_SCAN_ARTIFACT "+dest);
