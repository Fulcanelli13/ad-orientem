// Deduplicate 2026 selected pre-Gospel source-owner holds by demonstrable
// pinned inheritance.  This is a source-review worklist, NOT a chant match
// or an executable reader source alias.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {gitBlobSha1} from "./pinned-1962-source-library.mjs";

export const SCHEMA="ao-schola-2026-pregospel-original-owner-clusters-v1";
const CLOSEOUT="ao-schola-2026-source-exceptions-closeout-v1";
const INVENTORY="ao-mass-music-1962-pinned-source-universe-v1";
const PIN="ad8783641455bae38a8eb5782b34241a7b3ff2ef";
const pathRe=/^(?:Commune|Sancti|Tempora)\/[A-Za-z0-9_-]+$/;
const refRe=/^@((?:Commune|Sancti|Tempora)\/[A-Za-z0-9_-]+)(?::([A-Za-z0-9]+))?$/;
const fail=(code)=>{throw Error("SCHOLA_OWNER_GROUP_"+code)};

function parseSections(text){
 const sections=new Map();
 let current=null,top=[];
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim(),heading=/^\[([A-Za-z][A-Za-z0-9]*)\](?:\s.*)?$/.exec(line);
  if(heading){current=heading[1];if(!sections.has(current))sections.set(current,[]);continue;}
  if(!current){if(line&&!line.startsWith("!"))top.push(line);continue;}
  if(line)sections.get(current).push(line);
 }
 return {sections,top};
}
function inheritedRule(sections){
 const r=(sections.get("Rule")??[]).join("\n");
 const m=/(?:^|[\s;])ex\s+((?:Commune|Sancti|Tempora)\/[A-Za-z0-9_-]+)/i.exec(r);
 return m?.[1]??null;
}
async function resolveSection(sourcePath,section,readPinned,chain=[]){
 const key=sourcePath+":"+section;
 if(chain.includes(key)||chain.length>10)return {
  status:"CYCLE_OR_DEPTH_HOLD",ownerCandidate:null,chain:[...chain,key]};
 const source=await readPinned(sourcePath),next=[...chain,key];
 if(!source)return {status:"PATH_OUTSIDE_PINNED_TREE",ownerCandidate:null,chain:next};
 const parsed=parseSections(source.text),lines=parsed.sections.get(section)??[];
 // Some older source files consist of a whole-file @ pointer, followed by
 // overrides. A local section overrides the inherited section.
 const first=lines.length?lines[0]:null;
 const pointer=first?refRe.exec(first):null;
 if(pointer&&lines.length===1){
  const inherited=await resolveSection(pointer[1],pointer[2]||section,readPinned,next);
  return {...inherited,via:"EXPLICIT_SECTION_POINTER",chain:inherited.chain};
 }
 if(lines.length){
  if(lines.some(x=>x.startsWith("@")))return {status:"COMPLEX_INLINE_REFERENCE_HOLD",
    ownerCandidate:sourcePath,sourceSha:source.sha,chain:next};
  const substantive=lines.find(x=>x&&!/^[!$&#_]/.test(x))??"";
  return {status:"DIRECT_AUTHENTICATED_SECTION",ownerCandidate:sourcePath,
   sourceSha:source.sha,firstLatinLine:substantive.slice(0,150),chain:next};
 }
 const filePointer=parsed.top.map(x=>refRe.exec(x)).find(Boolean);
 if(filePointer){
  const inherited=await resolveSection(filePointer[1],filePointer[2]||section,
   readPinned,next);
  return {...inherited,via:"EXPLICIT_WHOLE_FILE_POINTER",chain:inherited.chain};
 }
 const rule=inheritedRule(parsed.sections);
 if(rule&&pathRe.test(rule))return {
  status:"RULE_EX_CANDIDATE_UNVERIFIED",ownerCandidate:rule,
  sourceSha:source.sha,chain:next,needsSectionProof:true};
 return {status:"SECTION_ABSENT_NO_EXPLICIT_OWNER",ownerCandidate:null,
  sourceSha:source.sha,chain:next};
}
function classification(evidence,sourcePath){
 const certain=evidence.filter(x=>x.status==="DIRECT_AUTHENTICATED_SECTION"&&x.ownerCandidate);
 const inherited=certain.filter(x=>x.ownerCandidate!==sourcePath);
 if(inherited.length){
  const owners=[...new Set(inherited.map(x=>x.ownerCandidate))].sort();
  if(owners.length===1)return {key:"PROVED_SECTION_DONOR:"+owners[0],
   status:"SHARED_PINNED_SECTION_DONOR_NEEDS_SELECTED_LATIN_REVIEW"};
  return {key:"MULTIPLE_SECTION_DONORS:"+sourcePath,
   status:"MULTIPLE_SECTION_DONORS_NEED_SEASONAL_REVIEW"};
 }
 const rules=evidence.filter(x=>x.status==="RULE_EX_CANDIDATE_UNVERIFIED");
 if(rules.length){
  const targets=[...new Set(rules.map(x=>x.ownerCandidate))];
  if(targets.length===1)return {key:"RULE_CANDIDATE:"+targets[0],
   status:"SHARED_RULE_PARENT_ONLY_NO_SECTION_CERTIFICATION"};
 }
 if(evidence.some(x=>x.status==="DIRECT_AUTHENTICATED_SECTION"))
  return {key:"LOCAL_PRESENT:"+sourcePath,
   status:"LOCAL_SECTION_PRESENT_BUT_SELECTED_TEXT_NOT_ANCHORED"};
 return {key:"UNRESOLVED:"+sourcePath,
  status:"NO_VERIFIED_SECTION_OWNER_NEEDS_LITURGICAL_SOURCE_REVIEW"};
}

export async function group2026PregospelHolds({closeout,inventory,readPinned}={}){
 if(closeout?.schema!==CLOSEOUT||closeout.sourceYear!==2026||
   closeout.counts?.selectedProperDays!==365||
   closeout.counts?.preGospelDatedOwnershipHolds!==128||
   closeout.counts?.distinctPreGospelSourceOwners!==115||
   closeout.counts?.newApprovedScores!==0||
   closeout.publication?.scorePromotionPermitted!==false||
   !Array.isArray(closeout.preGospelSourceOwnerQueue)||
   closeout.preGospelSourceOwnerQueue.length!==115||
   inventory?.schema!==INVENTORY||inventory.sourceRef!==PIN||
   inventory.sourceFiles?.length!==1049||typeof readPinned!=="function")
  fail("UNTRUSTED_2026_CENSUS");
 const sources=new Map(inventory.sourceFiles.map(x=>[x.path,x]));
 if(sources.size!==1049)fail("PINNED_MANIFEST_DUPLICATES");
 const missing=closeout.selectedSourceTreeGaps;
 if(!Array.isArray(missing)||missing.length!==5||
   missing.reduce((n,x)=>n+x.dates.length,0)!==15)fail("FIVE_GAP_SCOPE_DRIFT");
 const missingMap=new Map(missing.map(x=>[x.sourcePath,new Set(x.dates)]));
 const groups=new Map(),sourceRows=[],seenDates=new Set(),seenPaths=new Set();
 for(const x of closeout.preGospelSourceOwnerQueue){
  if(!pathRe.test(x.sourcePath)||seenPaths.has(x.sourcePath)||
    !Array.isArray(x.dates)||!x.dates.length||
    !Array.isArray(x.reasonPairs)||!x.reasonPairs.length)
   fail("INVALID_SOURCE_OWNER_QUEUE");
  seenPaths.add(x.sourcePath);
  for(const date of x.dates){
   if(!/^2026-\d{2}-\d{2}$/.test(date)||seenDates.has(date))
    fail("DUPLICATE_OR_INVALID_HOLD_DATE");
   seenDates.add(date);
  }
  const absent=!sources.has(x.sourcePath),prior=missingMap.get(x.sourcePath);
  if(absent!==Boolean(prior))fail("SOURCE_GAP_NOT_IN_CANONICAL_FIVE");
  if(prior&&x.dates.some(d=>!prior.has(d)))fail("MISSING_SOURCE_DATE_NOT_RECONCILED");
  const evidence=absent?[]:await Promise.all(["Graduale","GradualeP","Tractus"].map(
   async section=>({section,...await resolveSection(x.sourcePath,section,readPinned)})));
  const group=absent?{key:"PREVIOUSLY_DISPOSITIONED_GAP:"+x.sourcePath,
   status:"ALREADY_DISPOSITIONED_FIVE_PATH_FAMILY_NOT_EXTRA_BACKLOG"}:
   classification(evidence.filter(e=>e.section!=="Tractus"),x.sourcePath);
  const row={sourcePath:x.sourcePath,dates:x.dates,
   datedHolds:x.dates.length,reasonPairs:x.reasonPairs,
   pinnedSourceExists:!absent,
   groupKey:group.key,triageStatus:group.status,
   originalSectionEvidence:evidence,
   automaticSourceOwnerApproved:false,digitalScoreApproved:false};
  sourceRows.push(row);
  const agg=groups.get(group.key)??{
   groupKey:group.key,triageStatus:group.status,
   sourcePaths:[],dates:[],reasonPairs:[],
   originalPinnedSourceAuthenticationRequired:true,
   exactSelectedLatinAndLiturgicalSeasonReviewRequired:true,
   exact1961MusicalScoreReviewRequired:true,
   publicScoreApproved:false};
  agg.sourcePaths.push(x.sourcePath);
  agg.dates.push(...x.dates);
  agg.reasonPairs.push(...x.reasonPairs);
  groups.set(group.key,agg);
 }
 if(seenDates.size!==128||seenPaths.size!==115)fail("EXACT_HOLD_CENSUS_CHANGED");
 const grouped=[...groups.values()].map(x=>({
  ...x,sourcePaths:x.sourcePaths.sort(),
  dates:x.dates.sort(),datedHolds:x.dates.length,
  distinctSelectedSourcePaths:x.sourcePaths.length,
  reasonPairs:[...new Set(x.reasonPairs)].sort()
 })).sort((a,b)=>b.datedHolds-a.datedHolds||
   a.groupKey.localeCompare(b.groupKey));
 if(grouped.reduce((n,x)=>n+x.datedHolds,0)!==128)fail("GROUPS_LOST_OCCURRENCES");
 const overlapping=sourceRows.filter(x=>!x.pinnedSourceExists);
 const overlappingDates=overlapping.reduce((n,x)=>n+x.datedHolds,0);
 return {
  schema:SCHEMA,year:2026,
  status:"REVIEW_QUEUE_DEDUPLICATED_BY_AUTHENTICATED_SECTION_DONOR_NOT_CERTIFIED",
  authority:{yearResolver:"AO_RUNTIME_V8.resolver.resolveDay",
   pinnedLatinTreeRef:PIN,authenticatedFileCount:1049,
   inputReport:"2026-schola-closeout-source-exceptions.json"},
  counts:{datedPreGospelHolds:128,distinctSelectedSourcePaths:115,
   originalOwnerReviewGroups:grouped.length,
   groupsWithMultipleSelectedPaths:grouped.filter(x=>x.sourcePaths.length>1).length,
   previouslyDispositionedMissingSourcePaths:overlapping.length,
   previouslyDispositionedMissingPathDatedHolds:overlappingDates,
   independentCandidateGroupings:grouped.length-overlapping.length,
   approvedSourceAliases:0,approvedGregorianProperScores:0},
  groups:grouped,sourceRows,
  otherRoleExceptions:closeout.separateRoleHolds??[],
  warning:"Same 15 missing-path dates already occur in the five-family source-gap review; they must not be added as separate new missing Gregorian chants. Section and RULE pointers are research classification only.",
  publication:{publicScore:false,sourceAliasApproved:false,
   printed1961PitchNeumeUnderlayCertified:false,
   readerRuntimeChanges:false}
 };
}

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=join(root,".tmp","schola-1962-selected-annual");
const load=async path=>JSON.parse(await readFile(path,"utf8"));
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const closeout=await load(join(dir,"2026-schola-closeout-source-exceptions.json"));
 const inventory=await load(join(root,"data/research/mass-music-1962-pinned-full-source-universe.v1.json"));
 const map=new Map(inventory.sourceFiles.map(x=>[x.path,x]));
 const cache=new Map(),base=join(root,".cache","schola-pinned-1962",PIN);
 async function fetchPinned(path){
  if(!pathRe.test(path))return null;
  const entry=map.get(path);if(!entry)return null;
  if(!cache.has(path))cache.set(path,(async()=>{
   const bytes=await readFile(join(base,entry.sha+".txt"));
   if(bytes.length!==entry.size||gitBlobSha1(bytes)!==entry.sha)
    fail("PINNED_GIT_BLOB_INVALID:"+path);
   return {text:bytes.toString("utf8"),sha:entry.sha};
  })());
  return cache.get(path);
 }
 const out=await group2026PregospelHolds({closeout,inventory,readPinned:fetchPinned});
 await mkdir(dir,{recursive:true});
 await writeFile(join(dir,"2026-schola-pregospel-original-owner-clusters.json"),
  JSON.stringify(out,null,2)+"\n");
 const summary=["# 2026 pre-Gospel original-owner grouping (research only)","",
  "Exact 128 dated holds in 115 distinct selected source paths. ",
  "Grouping is by explicitly traceable pinned source-section owners or scoped rule candidates, not by chant title.",
  "No automatic source alias, reader mutation or musical approval.","",
  "| Owner review group | Dates | Selected paths | Status |",
  "|---|---:|---:|---|",
  ...out.groups.map(g=>"| "+g.groupKey+" | "+g.datedHolds+" | "+g.distinctSelectedSourcePaths+" | "+g.triageStatus+" |"),
  "", "Special separate role exceptions: "+out.otherRoleExceptions.length,
  "Previously dispositioned missing-path dates overlapping this queue: "+
   out.counts.previouslyDispositionedMissingPathDatedHolds,
  ""].join("\n");
 await writeFile(join(dir,"2026-schola-pregospel-original-owner-clusters.md"),summary);
 console.log("SCHOLA_PREGOSPEL_OWNER_CLUSTERS "+JSON.stringify(out.counts));
}
