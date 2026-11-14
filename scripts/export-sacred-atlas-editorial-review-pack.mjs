// Export one source-linked 672-paragraph EN/FR review packet.
// This creates no approval records, modifies no draft, and cannot publish.
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {sacredGuideRevision} from "../src/find/sacred-guide-review-release.js";

const read=async file=>JSON.parse(await readFile(resolve(file),"utf8"));
const w1=["first10-extended-guides","guides11-20","guides21-30","guides31-43","guides44-56"];
const w2=["57-66","67-76","77-86","87-96","97-106","107-116","117-126",
 "127-136","137-146","147-156","157-166","167-176","177-188","189-200",
 "201-212","213-224"];
const [wave1,wave2,pre1,pre2,research,triage,supplement,canonical,decisions,approvedBank]=await Promise.all([
 Promise.all(w1.map(s=>read("data/shrines/research/sacred-atlas-wave1-"+s+"-20261105.v1.json"))),
 Promise.all(w2.map(s=>read("data/shrines/research/sacred-atlas-wave2-guides"+s+"-20261110.v1.json"))),
 read("data/shrines/research/sacred-atlas-bulk-preflight-wave1-20261111.v1.json"),
 read("data/shrines/research/sacred-atlas-bulk-preflight-wave2-20261111.v1.json"),
 read("data/shrines/research/sacred-atlas-source-claim-reconciliation-20261111.v1.json"),
 read("data/shrines/research/sacred-atlas-citation-difference-triage-20261112.v1.json"),
 read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json"),
 read("data/shrines/source-registry.v1.json"),
 read("data/shrines/research/sacred-atlas-bilingual-guide-editorial-decisions.v1.json"),
 read("data/shrines/illustrated-place-guides-reviewed-bilingual.v1.json")
]);
const guides=[...wave1.flatMap(x=>x.guides),...wave2.flatMap(x=>x.guides)];
assert.equal(guides.length,224);
assert.equal(guides.filter(x=>x.draft_order<=56).length,56);
assert.equal(guides.filter(x=>x.draft_order>=57).length,168);
assert.equal(new Set(guides.map(x=>x.place_id)).size,224);
assert.equal(research.paragraphs.length,672);
assert.equal(triage.entries.length,85);
const byPre=new Map([...pre1.guides,...pre2.guides].map(x=>[x.place_id,x]));
const byResearch=new Map(research.paragraphs.map(x=>[x.place_id+"|"+x.section_id,x]));
const byTriage=new Map(triage.entries.map(x=>[x.key,x]));
const bySource=new Map([...canonical.sources,...supplement.sources].map(x=>[x.id,x]));
// Mechanical editorial review leads only. Never convert these into approvals.
const digitYears=t=>[...String(t||"").matchAll(/\b(?:1[0-9]{3}|20[0-9]{2})s?\b/g)]
 .map(x=>x[0].replace(/s$/,"")).sort().join("|");
const copyLeads=(en,fr,claim)=>{
 const flags=[];
 if(digitYears(en)!==digitYears(fr))flags.push("CHECK_DIGIT_YEAR_PARITY");
 if(/\b(?:should|must|does not|cannot|not automatically|not necessarily|need(?:s)? current|require(?:s)? current)\b/i.test(en)||
    /\b(?:doit|devrait|ne signifie pas|ne prouve pas|doivent être confirm|sans présumer)\b/i.test(fr))
   flags.push("READER_FACING_EDITORIAL_CAVEAT_CANDIDATE");
 if(/\b(?:open today|today's|currently offers|every Sunday|at \d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i.test(en))
   flags.push("TIME_SENSITIVE_PRACTICAL_CLAIM_CANDIDATE");
 if(/\b(?:presently an Orthodox church|now a functioning Orthodox church|Orthodox liturgy)\b/i.test(en))
   flags.push("VERIFY_NON_CATHOLIC_WORSHIP_CLASSIFICATION");
 if((claim.claim_flags||[]).includes("YEAR_NOT_EXPLICIT_IN_SOURCE_SUMMARY"))
   flags.push("CHECK_YEAR_AGAINST_FULL_SOURCE_TEXT");
 return flags.join("; ");
};
const rows=[],seen=new Set();
for(const guide of guides){
 const pre=byPre.get(guide.place_id);
 assert.ok(pre&&pre.revision===sacredGuideRevision(guide),"Stale preflight guide: "+guide.place_id);
 assert.equal(guide.sections.length,3);
 assert.equal(guide.publication_authorized,false);
 for(const section of guide.sections){
  const key=guide.place_id+"|"+section.id;
  const claim=byResearch.get(key),sectionPre=pre.sections.find(x=>x.section_id===section.id);
  assert.ok(claim&&sectionPre&&!seen.has(key),"Missing/duplicate exact research paragraph "+key);
  seen.add(key);
  assert.equal(claim.guide_revision,pre.revision);
  assert.equal(sectionPre.source_url,claim.source_url);
  assert.equal(sectionPre.source_id??null,claim.source_id??null);
  assert.equal(section.paragraphs.length,1);
  const p=section.paragraphs[0];
  assert.equal(p.source_url,claim.source_url);
  assert.equal(p.source_id??null,claim.source_id??null);
  assert.ok(p.en?.trim()&&p.fr?.trim(),"Missing bilingual content: "+key);
  const researchSource=p.source_id?bySource.get(p.source_id):null;
  if(p.source_id)assert.ok(researchSource&&researchSource.url===p.source_url,
    "Missing or stale source registry: "+key);
  const difference=byTriage.get(guide.draft_order+":"+section.id);
  rows.push({
   priority:sectionPre.editorial_review_priority,
   draft_order:guide.draft_order,
   place_id:guide.place_id,place_name:guide.place_name,
   exact_guide_revision:pre.revision,
   section_id:section.id,
   title_en:section.title_en,title_fr:section.title_fr,
   paragraph_en:p.en,paragraph_fr:p.fr,
   source_id:p.source_id||"",source_url:p.source_url,
   source_issuer:researchSource?.issuer||"",
   source_directness:researchSource?.directness||"WAVE1_DIRECT_URL",
   evidence_scope:claim.evidence_scope||"",
   research_stage:claim.source_claim_research_stage||"",
   research_note:claim.research_evidence_note||"",
   risk_flags:(claim.claim_flags||[]).join("; "),
    digit_years_en:digitYears(p.en),digit_years_fr:digitYears(p.fr),
    qa_leads:copyLeads(p.en,p.fr,claim),
   triage_disposition:difference?.decision_status||"NO_CITATION_DIFFERENCE",
   source_url_directly_reviewed:claim.direct_year_evidence_research_only?.checked_on?
      "DIRECT_YEAR_SOURCE_SPOT_CHECK_RESEARCH_ONLY":
      difference?.direct_url_spot_check?.target_page_inspected===true?"PARTIAL_SPOT_CHECK":"NOT_ASSERTED",
   historical_source_to_claim_verified:"",
   english_copy_approved:"",french_copy_approved:"",
   ecclesial_identity_approved:"",
   reviewer_name:"",review_date:"",reviewer_notes:"",hold_reason:""
  });
 }
}
assert.equal(rows.length,672);
const targeted=rows.filter(x=>x.priority==="TARGETED_SOURCE_REVIEW").length;
const standard=rows.filter(x=>x.priority==="STANDARD_EDITORIAL_REVIEW").length;
assert.equal(targeted+standard,672);
assert.equal(seen.size,672);
const ordered=rows.sort((a,b)=>Number(b.priority==="TARGETED_SOURCE_REVIEW")-
 Number(a.priority==="TARGETED_SOURCE_REVIEW")||a.draft_order-b.draft_order);
const headers=Object.keys(ordered[0]);
// Excel-safe CSV output. Spreadsheet formula-like leading characters must not execute.
const cell=v=>{
 let s=String(v??"");
 if(/^[\s]*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
};
const csv="\uFEFF"+headers.map(cell).join(",")+"\r\n"+
 ordered.map(row=>headers.map(h=>cell(row[h])).join(",")).join("\r\n")+"\r\n";
const dest=resolve("artifacts/sacred-atlas-editorial-review");
await mkdir(dest,{recursive:true});
await writeFile(resolve(dest,"sacred-atlas-672-paragraphs-en-fr.csv"),csv,"utf8");
const issues=ordered.filter(row=>row.qa_leads.length);
const leadColumns=["draft_order","place_id","place_name","section_id","priority","qa_leads",
 "digit_years_en","digit_years_fr","risk_flags","exact_guide_revision","source_url"];
const leadCsv="\uFEFF"+leadColumns.map(cell).join(",")+"\r\n"+
 issues.map(row=>leadColumns.map(k=>cell(row[k])).join(",")).join("\r\n")+"\r\n";
await writeFile(resolve(dest,"sacred-atlas-editorial-qa-leads.csv"),leadCsv,"utf8");
const qaCounts={};
for(const row of issues)for(const flag of row.qa_leads.split("; "))
 qaCounts[flag]=(qaCounts[flag]||0)+1;
const manifest={
 schema:"AO_SACRED_ATLAS_EDITORIAL_REVIEW_EXPORT_V1",
 generated_from:"RESEARCH_ONLY_EXACT_REVISION_CORPUS",
 exact_pr_head:process.env.AO_REVIEW_HEAD_SHA||"UNKNOWN_LOCAL_REHEARSAL",
 counts:{guides:guides.length,paragraph_pairs:rows.length,targeted,standard,
  citation_cases:triage.entries.length,source_access_holds:triage.summary.access_hold_paragraphs,
   qa_lead_rows:issues.length,qa_lead_counts:qaCounts,
   direct_institutional_year_spot_checks:research.paragraphs.filter(p=>p.direct_year_evidence_research_only).length,
   remaining_year_source_summary_flags:research.paragraphs.filter(p=>p.claim_flags?.includes("YEAR_NOT_EXPLICIT_IN_SOURCE_SUMMARY")).length,
  existing_editorial_reviews:decisions.reviews.length,
  owner_batch_authorized:decisions.owner_batch_authorization?.authorized===true,
  currently_published_from_reviewed_bank:approvedBank.guides.length},
 publication_permission:"NONE_FROM_THIS_EXPORT",
 reviewer_fields:"BLANK_REQUIRED_FOR_INDEPENDENT_REVIEW",
 source_data_paths:[research.schema,triage.schema,pre1.schema,pre2.schema]
};
await writeFile(resolve(dest,"manifest.json"),JSON.stringify(manifest,null,2)+"\n","utf8");
const readme=[
 "# Sacred Atlas — exact-revision bilingual editorial review pack",
 "",
 "This CSV contains **all 672 EN/FR paragraph pairs** in **224 unpublished guides**.",
 "It is sorted with targeted source reviews first; the original draft order is preserved in the `draft_order` column.",
 "",
 "The companion QA leads CSV flags possibly excessive disclaimers, date discrepancies,",
 "time-sensitive notices and non-Catholic liturgical contexts for human assessment.",
 "These are mechanical review leads, not confirmed historical errors.",
 "",
 "Each row contains the actual bilingual paragraph, both section titles, source URL,",
 "claimed research evidence, risk flags, exact guide revision, and blank human decision fields.",
 "",
 "**Research notes and URL checks are not approval.** The reviewer must independently compare every",
 "sentence with the primary or credible institutional source, check historical attribution and",
 "ecclesial classification, then proofread English and French. Set any unresolved passage on hold",
 "and record why; do not guess a missing date, relic authenticity, pilgrimage route, or Mass time.",
 "",
 "The CSV is **an editorial working surface**, not an importable release authorization.",
 "Do not treat a populated CSV as an automatic `APPROVED_FOR_PUBLICATION` decision.",
 "Signed-off decisions must be mapped to the canonical decision schema and independently checked",
 "against the exact guide fingerprints and source-claim evidence before owner approval.",
 "",
 "The public approved-only bank remains separate. All files here are GitHub Actions artifacts only.",
 "No Vercel, Pages publication, public image release, or master Place mutation occurs.",
 ""
].join("\n");
await writeFile(resolve(dest,"README.md"),readme,"utf8");
console.log("PASS Sacred Atlas independent-editor packet: 224 guides, 672 bilingual pairs, "+
 targeted+" targeted and "+standard+" standard rows; "+issues.length+" QA leads; all reviewer fields blank.");
