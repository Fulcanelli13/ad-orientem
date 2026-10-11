#!/usr/bin/env node
// Produce an actionable cross-module acquisition batch without claiming editorial
// selection, exact 1962 day coverage, or image reproduction rights.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync,existsSync} from "node:fs";

const read = path => JSON.parse(readFileSync(path,"utf8"));
const base="artifacts/sacred-art-coverage";
const audit=read(base+"/all-modules-v2.json");
const saint=read(base+"/saint-visual-coverage.v1.json");
const leads=read("data/calendar/sacred-art-primary-museum-leads-20261011.v1.json");
const registry=read("data/calendar/sacred-art-candidates.v1.json");
const calendarPath=base+"/full-year-multiple-associations.v1.json";
const year=existsSync(calendarPath)?read(calendarPath):null;
const acquiredById=new Map(registry.artworks.filter(a=>
  /^[a-f0-9]{64}$/.test(a.acquisition?.originalSha256||"") &&
  a.acquisition?.archiveOriginal
).map(a=>[a.id,a]));
const leadByTarget=new Map();
for(const lead of leads.items){
 assert.ok(/^https:\/\//.test(lead.museumObjectUrl));
 assert.equal(lead.publicationApproval,false);
 assert.equal(lead.sourceOriginalSha256,null);
 assert.ok(!acquiredById.has(lead.id),"Already acquired museum lead must be reconciled as a source original");
 if(!leadByTarget.has(lead.targetId))leadByTarget.set(lead.targetId,[]);
 leadByTarget.get(lead.targetId).push(lead);
}
const saintById=new Map(saint.persons.map(p=>[p.personTargetId,p]));
const priorityRank={P0:0,P1:1,P2:2};
const missing=audit.subjects.filter(t=>t.missingToMinimum>0).map(t=>{
 const depicted=t.id.startsWith("person.")?(saintById.get(t.id)?.depictions||[]):[];
 const knownSourceIds=t.images.filter(id=>acquiredById.has(id));
 const museumLeads=(leadByTarget.get(t.id)||[]).map(l=>({
  leadId:l.id,objectUrl:l.museumObjectUrl,museum:l.museum,title:l.title,
  imageRights:l.reproductionRights,sourceOriginalDownloaded:false
 }));
 const useCount=t.contexts.length;
 const researchExposure=Number.isInteger(t.observed2026GapDatesEstimated)
  ?t.observed2026GapDatesEstimated:null;
 return {targetId:t.id,title:t.title,priority:t.priority,subjectType:t.type,
  desiredSourceOriginals:t.required,acquiredExactOriginals:t.downloadedOriginals,
  remainingOriginals:t.missingToMinimum,
  acquiredExactSourceIds:knownSourceIds,
  taggedOtherSaintDepictions:depicted
   .filter(x=>!knownSourceIds.includes(x.artworkId))
   .map(x=>({artworkId:x.artworkId,sourceUrl:x.sourceUrl,
      role:"DEPICTED_PERSON_NOT_CERTIFIED_AS_PRINCIPAL_OR_HISTORICAL_PORTRAIT"})),
  historicalPortraitRequired:t.id.startsWith("person.") &&
    /pius|leo|jacques|laval|john-xxiii/i.test(t.id),
  moduleContexts:t.contexts,contextCount:useCount,
  museumObjectLeads:museumLeads,
  sourceRightsStatus:"REVIEW_EACH_IMAGE_INDEPENDENTLY",
  researchCalendarExposureEstimate:researchExposure,
  exactObservedDatesNewlyCertified:0,curatorApproved:false,productionPublished:false
 };
}).sort((a,b)=>
 (priorityRank[a.priority]??3)-(priorityRank[b.priority]??3) ||
 b.contextCount-a.contextCount ||
 a.targetId.localeCompare(b.targetId));
assert.equal(missing.length,audit.summary.subjectsWithOriginalAcquisitionGaps);
assert.equal(new Set(missing.map(x=>x.targetId)).size,missing.length);
assert.equal(missing.reduce((n,x)=>n+x.remainingOriginals,0),
 audit.subjects.reduce((n,x)=>n+x.missingToMinimum,0));
const perPriority=Object.fromEntries(["P0","P1","P2"].map(p=>[
 p,{subjectGaps:missing.filter(x=>x.priority===p).length,
    originalsStillNeeded:missing.filter(x=>x.priority===p)
       .reduce((n,x)=>n+x.remainingOriginals,0)}
]));
const researchYear=year?.summary?.dates===365?{
 year:2026,previousDatedProposals:year.summary.datedArtworkAssociations,
 sourceSpecificResearchGaps:year.summary.needSpecificSubjectResearch,
 evidence:"Full-year source-generated audit; this worklist does NOT modify observed-day assignments"
}:null;
const report={schema:"AO_SACRED_ART_NEXT_ACQUISITION_WORKLIST_V1",
 status:"RESEARCH_GAP_WORKLIST_ONLY",ownerIssue:885,
 sourceAuditSchema:audit.schema,calendarResearchBaseline:researchYear,
 summary:{targetCount:audit.summary.sourceTargets,
  acquiredOriginals:audit.summary.acquiredOriginals,
  subjectsUnderMinimum:missing.length,
  missingOriginalSlots:missing.reduce((n,x)=>n+x.remainingOriginals,0),
  withMuseumObjectLeads:missing.filter(x=>x.museumObjectLeads.length).length,
  saintTargets:saint.summary.personTargets,
  saintTargetsWithoutTaggedDepiction:saint.summary.withoutMuseumTaggedDepiction,
  pendingArtisticApprovals:registry.artworks.length,
  publishedNewResearchArtwork:0,perPriority},
 mandatoryGates:["Original museum object identity and actual painting medium",
  "Exact iconography and saint identity independently verified",
  "Download source bytes; verify SHA256, dimensions and colour",
  "Reproduction licence and worldwide commercial reuse",
  "1962 observed-day/appointed Gospel correspondence",
  "Editorial review of artistic quality; safe mobile crop",
  "No user review fragments; one final full HTML atlas with exception-only export"],
 targets:missing
};
mkdirSync(base,{recursive:true});
writeFileSync(base+"/next-acquisition-batch.v1.json",JSON.stringify(report,null,2)+"\n");
const lines=[
 "# Sacred-art cross-module next acquisition batch (research only)","",
 "Generated from the strict source-only all-module audit. Not the user's final artwork review.",
 "Targets: "+report.summary.targetCount+"; acquired originals: "+report.summary.acquiredOriginals+
 "; below source-depth minimum: "+missing.length+"; outstanding original slots: "+report.summary.missingOriginalSlots+".",
 "Saint targets without a named tagged museum depiction: "+report.summary.saintTargetsWithoutTaggedDepiction+".",
 "Previous source-specific 2026 date gaps: "+
 (researchYear?researchYear.sourceSpecificResearchGaps+" (unchanged by this batch)":"not available in this audit run")+".",
 "",
 "## Museum-object source leads (all image rights / acquisition held)","",
 ...leads.items.map(l=>"- **"+l.targetId+"**: "+l.artist+", *"+l.title+"* ("+l.museum+"). "+
   l.museumObjectUrl+" — "+l.reproductionRights+"."),
 "",
 "## Open exact-original collection slots","",
 "| Priority | Subject | Acquired/required | Contexts | Museum leads |",
 "|---|---|---:|---:|---:|",
 ...missing.map(t=>"| "+t.priority+" | "+t.targetId+" | "+
   t.acquiredExactOriginals+"/"+t.desiredSourceOriginals+" | "+t.contextCount+" | "+
   t.museumObjectLeads.length+" |"),
 "",
 "No proposed painting or unverified saint icon qualifies automatically for publication."
];
writeFileSync(base+"/next-acquisition-batch.md",lines.join("\n")+"\n");
console.log(JSON.stringify(report.summary,null,2));
console.log("Source-only target worklist and seven independent museum object leads written");
