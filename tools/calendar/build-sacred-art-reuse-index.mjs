/**
 * Source-only re-use index for Ad Orientem sacred art.
 *
 * A single physical original (canonical artwork ID + SHA256) may serve many
 * different observed days and canonical module subjects. It remains ONE file.
 * Exact A source links, contextual B relationships and related-but-unverified
 * subject suggestions are kept in separate namespaces. No app publication.
 *
 * Run AFTER tools/calendar/audit-sacred-art-modules.mjs
 * node tools/calendar/build-sacred-art-reuse-index.mjs
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const registry=read("data/calendar/sacred-art-candidates.v1.json");
const coverage=read("artifacts/sacred-art-coverage/all-modules-v2.json");
const observed=read("data/calendar/sacred-art-first-class-2026-research-crosswalk.v1.json");
const exact=read("data/calendar/sacred-art-1962-exact-feast-source-links.v1.json");
const contextual=read("data/calendar/sacred-art-2026-i-class-contextual-reuse.v1.json");
assert.equal(registry.schema,"AO_SACRED_ART_CANDIDATES_V1");
assert.equal(coverage.schema,"AO_SACRED_ART_ALL_MODULE_COVERAGE_AUDIT_V2");
assert.equal(observed.days.length,53,"Audit requires full first-class observed worklist");
assert.equal(exact.links.length,exact.linkCount);
const valid=a=>/^[0-9a-f]{64}$/.test(a.acquisition?.originalSha256||"")&&!!a.acquisition?.archiveOriginal;
const source=registry.artworks.filter(valid);
const byId=new Map(source.map(a=>[a.id,a]));
const originalHashes=new Set(source.map(a=>a.acquisition.originalSha256));
assert.equal(byId.size,source.length,"Canonical source ID must be unique");
assert.equal(originalHashes.size,source.length,"No physical original may be counted twice under duplicate SHA256");
assert.equal(source.length,coverage.summary.acquiredOriginals,"Must agree with master source-only acquisition audit");
const byObservedId=new Map(observed.days.map(d=>[d.observedPrincipalId,d]));
assert.equal(byObservedId.size,observed.days.length);
const grouped=new Map(source.map(a=>[a.id,{
 artworkId:a.id,
 title:a.title,
 artist:a.artist,
 museum:a.museum,
 sourceObjectUrl:a.source.objectUrl,
 originalSha256:a.acquisition.originalSha256,
 archiveOriginal:a.acquisition.archiveOriginal,
 sourceRunUrl:a.acquisition.runUrl,
 rights:a.source.rights,
 rightsHeld:a.source.rights!=="CC0",
 sourceApproval:"RESEARCH_ORIGINAL_ONLY",
 publicationApproved:false,
 exactModuleSubjects:[],
 symbolicRelatedModuleSubjects:[],
 moduleContexts:[],
 classIExact:[],
 classIContextual:[]
}]));
for(const subject of coverage.subjects){
 const chosen=new Set(subject.images||[]);
 const related=new Set(subject.relatedImageIds||[]);
 for(const id of chosen){
  if(!byId.has(id))continue;
  const row=grouped.get(id);
  row.exactModuleSubjects.push(subject.id);
  for(const c of subject.contexts||[])if(!row.moduleContexts.includes(c))row.moduleContexts.push(c);
 }
 for(const id of related){
  if(!byId.has(id)||chosen.has(id))continue;
  grouped.get(id).symbolicRelatedModuleSubjects.push(subject.id);
 }
}
const seenExact=new Set();
for(const l of exact.links){
 const token=l.artworkId+"|"+l.observedPrincipalId;
 assert.ok(!seenExact.has(token),"Duplicate original-to-principal exact association");
 seenExact.add(token);
 const a=byId.get(l.artworkId),d=byObservedId.get(l.observedPrincipalId);
 assert.ok(a&&d,"Exact source/day must exist in immutable master registry and observed list");
 assert.equal(a.acquisition.originalSha256,l.originalSha256);
 assert.equal(d.date,l.observedDate2026);
 assert.ok((a.tags?.observed1962Identifiers||[]).includes(l.observedPrincipalId),
  "An exact match must have canonical source-ID tag");
 assert.equal(l.approvedForProduction,false);
 grouped.get(l.artworkId).classIExact.push({
  principalId:l.observedPrincipalId,date:d.date,title:d.observedTitle,
  grade:"A",association:l.association,evidence:l.evidence
 });
}
const A=new Set(exact.links.map(l=>l.observedPrincipalId));
const B=new Set();
for(const l of contextual.entries){
 const a=byId.get(l.artworkId),d=byObservedId.get(l.observedPrincipalId);
 assert.ok(a&&d,"Contextual original and observed principal must exist");
 assert.equal(a.acquisition.originalSha256,l.originalSha256);
 assert.equal(l.date2026,d.date);
 assert.equal(l.grade,"B_CONTEXTUAL");
 assert.ok(!A.has(l.observedPrincipalId),"B cannot overwrite A");
 assert.ok(!B.has(l.observedPrincipalId),"At most one selected B contextual original per day");
 assert.ok(!(a.tags?.observed1962Identifiers||[]).includes(l.observedPrincipalId),
  "A contextual source must not be written as an exact day/source ID");
 B.add(l.observedPrincipalId);
 grouped.get(l.artworkId).classIContextual.push({
  principalId:l.observedPrincipalId,date:d.date,title:d.observedTitle,
  grade:"B",contextKind:l.contextKind,warning:l.rationale
 });
}
const dayIndex=observed.days.map(d=>{
 const exactOriginals=exact.links.filter(l=>l.observedPrincipalId===d.observedPrincipalId).map(l=>l.artworkId);
 const contextOriginals=contextual.entries.filter(l=>l.observedPrincipalId===d.observedPrincipalId).map(l=>l.artworkId);
 assert.ok(!(exactOriginals.length&&contextOriginals.length),"Disjoint A and B references");
 return {date:d.date,observedPrincipalId:d.observedPrincipalId,title:d.observedTitle,
  grade:exactOriginals.length?"A_EXACT":contextOriginals.length?"B_CONTEXTUAL":"C_UNRESOLVED",
  exactOriginalIds:exactOriginals,contextualOriginalIds:contextOriginals,
  approvedOriginalIds:[],publicationEligible:false,
  researchTargetId:d.researchTargetId};
});
const unique=(xs)=>new Set(xs).size;
const originals=[...grouped.values()].map(o=>({
 ...o,
 exactModuleSubjects:o.exactModuleSubjects.sort(),
 symbolicRelatedModuleSubjects:o.symbolicRelatedModuleSubjects.sort(),
 moduleContexts:o.moduleContexts.sort(),
 classIExact:o.classIExact.sort((a,b)=>a.date.localeCompare(b.date)),
 classIContextual:o.classIContextual.sort((a,b)=>a.date.localeCompare(b.date)),
}));
const multiSubject=originals.filter(x=>x.exactModuleSubjects.length>1);
const multiDay=originals.filter(x=>x.classIExact.length+x.classIContextual.length>1);
const multiDomain=originals.filter(x=>x.exactModuleSubjects.length&&x.classIExact.length+x.classIContextual.length);
const categories=Object.fromEntries(["calendar","rosary","station","devotion","scripture","person","formation"].map(type=>[
 type,{
  originalIds:originals.filter(o=>o.exactModuleSubjects.some(s=>s.startsWith(type+"."))).map(o=>o.artworkId),
  exactSubjectAssociations:originals.reduce((v,o)=>v+o.exactModuleSubjects.filter(s=>s.startsWith(type+".")).length,0)
 }
]));
const totalDays=dayIndex.length;
const countA=dayIndex.filter(d=>d.grade==="A_EXACT").length;
const countB=dayIndex.filter(d=>d.grade==="B_CONTEXTUAL").length;
const countC=dayIndex.filter(d=>d.grade==="C_UNRESOLVED").length;
assert.equal(A.size,countA);assert.equal(B.size,countB);
assert.equal(countA+countB+countC,totalDays);
assert.equal(exact.links.length,originals.reduce((n,o)=>n+o.classIExact.length,0));
assert.equal(contextual.entries.length,originals.reduce((n,o)=>n+o.classIContextual.length,0));
const report={
 schema:"AO_SACRED_ART_SOURCE_REUSE_INDEX_V1",
 generatedFrom:"Canonical hashed painting registry, subject audit, actual 2026 class I crosswalk, exact A ledger, contextual B ledger",
 policy:{
  sourceOfTruth:"data/calendar/sacred-art-candidates.v1.json",
  onePaintingOneOriginal:"One artwork ID, one original sha256, one physical file regardless of number of date/module associations.",
  A:"Direct subject or appointed text evidence; still not artistic, crop or copyright cleared.",
  B:"Contextually relevant artwork; never promoted to source ID or misrepresented as appointed reading art.",
  C:"No defensible source mapping for this day; unverified module/iconographic leads do not count.",
  crossModuleReuse:"The same original may reference many canonical subject targets and their module contexts without duplicating original assets.",
  noPublication:"No original is curator, legal or phone-crop approved by this report."
 },
 counts:{
  masterCandidatePaintings:registry.artworks.length,
  acquiredOriginalRecords:source.length,
  distinctOriginalSha256:originalHashes.size,
  originalFileCount:source.length,
  exactModuleSubjectLinks:originals.reduce((n,o)=>n+o.exactModuleSubjects.length,0),
  distinctCanonicalModuleSubjectsWithOriginals:unique(originals.flatMap(o=>o.exactModuleSubjects)),
  reusedAcrossMultipleCanonicalSubjects:multiSubject.length,
  reusedAcrossMultipleClassIDates:multiDay.length,
  reusedAcrossCalendarAndModules:multiDomain.length,
  relatedSymbolicLinksNotCounted:originals.reduce((n,o)=>n+o.symbolicRelatedModuleSubjects.length,0),
  calendarFirstClassDays:totalDays,
  strictExactADays:countA,
  contextualBDays:countB,
  unresolvedCDays:countC,
  candidateCoveredADaysPlusBDays:countA+countB,
  classIAssociationRecords:exact.links.length+contextual.entries.length,
  rightsHeldOriginals:originals.filter(o=>o.rightsHeld).length,
  calendarDaysUsingRightsHeldOriginals:dayIndex.filter(d=>[...d.exactOriginalIds,...d.contextualOriginalIds].some(id=>grouped.get(id).rightsHeld)).length,
  curatorApprovedOriginals:0
 },
 categoryIndex:categories,
 days:dayIndex,
 originals
};
assert.equal(report.counts.acquiredOriginalRecords,report.counts.distinctOriginalSha256);
assert.equal(report.counts.curatorApprovedOriginals,0);
const dir="artifacts/sacred-art-coverage";
mkdirSync(dir,{recursive:true});
writeFileSync(dir+"/reuse-index-v1.json",JSON.stringify(report,null,2)+"\n");
const top=multiDay.toSorted((a,b)=>(b.classIExact.length+b.classIContextual.length)-(a.classIExact.length+a.classIContextual.length)).slice(0,8);
const lines=[
 "# Sacred art — physical-original reuse index",
 "",
 "One unique source-original SHA256 may legitimately serve multiple **observed days and modules**. The original is never double-counted.",
 "A is exact subject/source, B is context-only, C unresolved; **all** art and publication rights approvals remain pending.",
 "",
 "| Audit metric | Count |","|---|---:|",
 "| Acquired physical originals (unique SHA256) | "+source.length+" |",
 "| Exact canonical module-subject associations | "+report.counts.exactModuleSubjectLinks+" |",
 "| Different module subjects with a matching original | "+report.counts.distinctCanonicalModuleSubjectsWithOriginals+" |",
 "| Originals reused across multiple module subjects | "+multiSubject.length+" |",
 "| Originals reused on multiple I-class days | "+multiDay.length+" |",
 "| Originals usable in both dated calendar + a canonical module subject | "+multiDomain.length+" |",
 "| I-class exact A days | "+countA+"/"+totalDays+" |",
 "| I-class contextual B days | "+countB+"/"+totalDays+" |",
 "| I-class unresolved C days | "+countC+"/"+totalDays+" |",
 "| Days with at least one research A/B candidate | "+(countA+countB)+"/"+totalDays+" |",
 "| Days with source rights held (may not publish) | "+report.counts.calendarDaysUsingRightsHeldOriginals+" |",
 "| Fully artwork/rights/crop approved | 0 |",
 "",
 "## Highly reused original artworks (research only)",
 ...top.map(a=>"- "+a.artworkId+": "+a.classIExact.length+" exact day(s), "+a.classIContextual.length+" contextual day(s), "+a.exactModuleSubjects.length+" canonical module subject(s). "+a.title),
 "",
 "## Remaining grade-C first-class 2026 dates",
 ...dayIndex.filter(d=>d.grade==="C_UNRESOLVED").map(d=>"- "+d.date+": "+d.title+" ("+d.researchTargetId+")"),
 "",
 "**Important:** These figures are associations to one original, not multiple downloaded images. The same masterpiece should be acquired and stored **once**; each app use references the original ID and retains its own accurate date/mystery/context label."
];
writeFileSync(dir+"/reuse-index-v1.md",lines.join("\n")+"\n");
console.log("SACRED_ART_REUSE_INDEX="+JSON.stringify(report.counts));
