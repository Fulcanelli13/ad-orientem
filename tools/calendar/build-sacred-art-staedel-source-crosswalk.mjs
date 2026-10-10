#!/usr/bin/env node
// Research-only: group museum-confirmed painted leads by actual observed 1962 Gospel,
// retaining independent image-rights and original-image acquisition gates.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
const src=JSON.parse(readFileSync("data/calendar/sacred-art-staedel-painting-leads.v1.json","utf8"));
const year=JSON.parse(readFileSync("artifacts/sacred-art-coverage/full-year-multiple-associations.v1.json","utf8"));
assert.equal(src.schema,"AO_SACRED_ART_STADEL_PAINTING_SOURCE_LEADS_V1");
assert.equal(year.days.length,365);
assert.equal(src.sources.length,12);
const results=[],countPerLead={};
for(const d of year.days){
 const g=(d.appointedScripture||[]).find(x=>x.slot==="GOSPEL");
 if(!g)continue;
 for(const a of src.sources){
  if(!a.scriptureReferences.includes(g.reference))continue;
  results.push({
    observedDate:d.date,observedPrincipalId:d.observedPrincipalId,
    observedTitle:d.observedTitle,rank:d.class,appointedGospel:g.reference,
    paintingId:a.id,museumObjectUrl:a.sourceUrl,sourceArtworkTitle:a.title,
    subjectKeys:a.subjectKeys,relation:a.relation,
    candidateStatus:"OFFICIAL_MUSEUM_SUBJECT_PROPOSAL_NEEDS_IMAGE_AND_LEGAL_QA",
    imageRights:a.rightsStatus,acquiredOriginal:false,editorialAudit:"NOT_SUBMITTED",
    productionReady:false
  });
  countPerLead[a.id]=(countPerLead[a.id]||0)+1;
 }
}
const report={schema:"AO_SACRED_ART_STADEL_PROVISIONAL_DATE_ASSOCIATIONS_V1",
 warning:"These museum painting records are fully independent NEW SOURCE LEADS, not acquired source originals; image-license terms, full quality, source original SHA and user editorial audit pending.",
 originalsAdded:0,sourceObjectRecords:src.sources.length,
 proposedDateAssociations:results.length,uniqueObservedDates:new Set(results.map(x=>x.observedDate)).size,
 perPaintingDateCounts:countPerLead,associations:results};
const dir="artifacts/sacred-art-coverage/";
writeFileSync(dir+"staedel-source-lead-associations.v1.json",JSON.stringify(report,null,2)+"\n");
const lines=["# Additional Städel Museum original-painting research lane","",
 "**Not physical original acquisitions.** Museum-verified subjects, source URL and rights review; don't count toward app images.",
 "12 distinct painted object records; "+results.length+" candidate date uses across "+report.uniqueObservedDates+" 2026 dates.",
 "",
 "Städel official OAI image licensing may require CC BY-SA 4.0 attribution/share-alike despite object's Public Domain copyright label. Publication is held for rights review.",
 "",
 "| Painting | Proposed liturgical uses | Source |",
 "|---|---:|---|",
 ...src.sources.map(x=>"| "+x.title+" — "+x.artist+" | "+(countPerLead[x.id]||0)+" | "+x.sourceUrl+" |"),
 "",
 "Never conflate supportive symbolism with direct depiction (child Good Shepherd); don't claim that a Gospel-context painting depicts the particular saint on a date.",
 "Next step: officially download source originals or licensed exports and record bytes/SHA/resolution; hold all until full final negative-exception art audit."
];
writeFileSync(dir+"staedel-source-lead-associations.v1.md",lines.join("\n")+"\n");
console.log("STADEL_SOURCE_RESEARCH="+JSON.stringify({records:src.sources.length,proposals:results.length,uniqueDays:report.uniqueObservedDates,acquired:0}));
