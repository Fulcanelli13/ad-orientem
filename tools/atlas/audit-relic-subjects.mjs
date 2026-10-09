#!/usr/bin/env node
// Non-destructive triage of legacy relic records. Never assign canonical sainthood,
// authenticity, or publication tier from these heuristic classifications.
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const legacy=read("data/explore/sacred-phenomena-seed.v1.json").relics;
const places=new Set(read("data/geography/seed-registry.v1.json").places.map(x=>x.place_id));
const classes={
 BODILY_REMAINS:"POTENTIAL_FIRST_CLASS_VERIFY_ACTUAL_CUSTODY",
 BODILY_FRAGMENT:"POTENTIAL_FIRST_CLASS_FRAGMENT",
 REPUTED_BODILY_REMAINS:"TRADITIONAL_BODILY_CLAIM_NOT_VERIFIED",
 REPUTED_CONTACT_RELIC:"ASSOCIATED_OBJECT_SECOND_CLASS_UNRESOLVED",
 REPUTED_PASSION_RELIC:"EXCEPTIONAL_SACRED_OBJECT_NOT_AUTOMATICALLY_GRADED",
 REPUTED_HOLY_SITE_RELIC:"EXCEPTIONAL_SACRED_SITE_OBJECT_NOT_AUTOMATICALLY_GRADED",
 RELIC_COLLECTION:"MIXED_COLLECTION_INDIVIDUAL_GRADES_UNKNOWN"
};
const canonicalName =s=>s.trim().replace(/^(Saint|St\.?)(?=\s)/i,"Saint").replace(/^Our Lord Jesus Christ$/i,"Jesus Christ");
const findings=legacy.map(r=>{
 const flags=[];
 if(!places.has(r.place_id))flags.push("MISSING_PLACE");
 if(!r.source_url?.startsWith("https://"))flags.push("MISSING_PRIMARY_OR_INSTITUTIONAL_SOURCE");
 if(!classes[r.relic_kind])flags.push("UNKNOWN_MATERIAL_CATEGORY");
 if(/[;]|\band\b|\bMultiple\b|\bcompanions\b|\bFriars\b/i.test(r.associated_person??""))flags.push("COLLECTIVE_OR_MULTIPLE_SUBJECTS");
 if(/\btomb\b|\bgrave\b|\bsarcophagus\b/i.test(r.title_en??""))flags.push("TOMB_CUSTODY_NOT_INFERRED");
 if(/^(Jesus Christ|Our Lord Jesus Christ|Blessed Virgin Mary)$/i.test(r.associated_person))flags.push("SACRED_SUBJECT_SPECIAL");
 if(r.relic_kind.startsWith("REPUTED_"))flags.push("HISTORICAL_ATTRIBUTION_REQUIRES_SEPARATE_CHECK");
 return {legacy_relic_id:r.id,legacy_subject:r.associated_person,subject_reconciliation_hint:canonicalName(r.associated_person),place_id:r.place_id,relic_kind:r.relic_kind,material_research_bucket:classes[r.relic_kind]??"UNKNOWN",authentication:r.authentication??"UNSPECIFIED",source_url:r.source_url,review_flags:flags,canonical_subject_id:null,publish_decision:"PENDING_SUBJECT_FIRST_REVIEW"};
});
const idSet=new Set(findings.map(f=>f.legacy_relic_id));
if(idSet.size!==findings.length)throw Error("Duplicate legacy relic identity");
const byBucket=Object.fromEntries(Object.keys(classes).map(k=>[k,findings.filter(f=>f.relic_kind===k).length]));
const namedRaw=new Set(findings.map(f=>f.legacy_subject));
const namedHints=new Set(findings.map(f=>f.subject_reconciliation_hint));
const report={schema:"SACRED_ATLAS_RELIC_LEGACY_TRIAGE_V1",scope:"LEGACY_AUDIT_NOT_PRODUCTION_TAXONOMY",counts:{records:findings.length,raw_subject_labels:namedRaw.size,normalized_subject_hints:namedHints.size,ambiguous_collectives:findings.filter(f=>f.review_flags.includes("COLLECTIVE_OR_MULTIPLE_SUBJECTS")).length},kind_counts:byBucket,findings};
if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));else console.log(JSON.stringify({schema:report.schema,counts:report.counts,kind_counts:report.kind_counts,examples_needing_review:findings.filter(f=>f.review_flags.length>0).slice(0,8).map(f=>({id:f.legacy_relic_id,flags:f.review_flags}))},null,2));
