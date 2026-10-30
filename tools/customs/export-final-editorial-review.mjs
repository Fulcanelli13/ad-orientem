import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {articleFor,fingerprint,COPY_FIELDS,validationErrors} from "./editorial-acceptance-contract.mjs";
const read=path=>JSON.parse(readFileSync(new URL("../../"+path,import.meta.url),"utf8"));
const md=s=>String(s??"").replaceAll("|","\\|").replaceAll("\n"," ").trim();
export function renderReviewPacket(){
  const decision=read("data/customs/editorial-final-acceptance.v1.json");
  const source=read("data/customs/research/customs-published-35-editorial-first-pass.20261023.v1.json");
  const singleRelease=read("data/customs/releases/customs-r18-pent-001-single-canonical-release-review.v1.json");
  const issues=validationErrors(decision);
  if(issues.length)throw new Error(issues.join("; "));
  const reviewed=new Map(source.records.map(x=>[x.custom_id,x]));
  const rows=[...decision.records].sort((a,b)=>
    Number(b.priority==="CRITICAL_SCOPE")-Number(a.priority==="CRITICAL_SCOPE")||
    a.custom_id.localeCompare(b.custom_id));
  const lines=["# Ad Orientem — customs: final EN/FR editorial acceptance packet",
    "","Generated from the canonical Calendar article candidate texts. This is a review view; the PENT-001 proposal remains an unmerged draft until explicit final approval.",
    "","**"+rows.length+" proposed canonical article texts including one PENT-001 regional pilot; 13 previous scope-critical, 22 previous standard, one new regional. No final human EN/FR approval has been recorded unless explicitly shown on a line.**",
    "","Existing scoped editorial acceptances remain valid in their own register. This packet requests an additional final copy and historical-claim signoff, and it is not a human-signoff substitute.",
    "","A reviewer must inspect each EN and FR field and the cited evidence, record actual decisions, their identity and date, and use the current SHA-256 fingerprint below. Text changes invalidate prior decisions.",
    "","---"];
  for(let i=0;i<rows.length;i++){
    const row=rows[i],a=articleFor(row.custom_id),e=reviewed.get(row.custom_id)||
      (row.custom_id===singleRelease.record_id?{
        claim_boundary:singleRelease.reason+" "+singleRelease.proposed_scope.not+"; original 35-record 2026-10-23 review deliberately kept immutable."
      }:null);
    if(!a||!e)throw new Error("Missing text or evidence "+row.custom_id);
    lines.push("","## "+(i+1)+". "+row.custom_id+" — "+a.title.en,
      "","**Priority:** "+row.priority+"  ",
      "**Specific reviewer question:** "+row.review_focus+"  ",
      "**Signoff:** EN "+row.final_en.decision+"; FR "+row.final_fr.decision+"; historical claims "+row.final_claims.decision,
      "","| Field | English published copy | French published copy |","|---|---|---|");
    for(const k of COPY_FIELDS)
      lines.push("| "+k+" | "+md(a[k]?.en)+" | "+md(a[k]?.fr)+" |");
    lines.push("","**Primary Calendar article sources:**");
    for(const x of a.sources||[])lines.push("- "+md(x.title)+": "+x.url);
    for(const [key,label] of [["history_sources","Additional historical context"],["supporting_sources","Supporting documentation"]]){
      if((a[key]||[]).length){
        lines.push("","**"+label+":**");
        for(const x of a[key])lines.push("- "+md(x.title)+": "+x.url);
      }
    }
    const held=e.followup_primary_source_verification?.remaining_hold||e.p2_source_text_review?.remaining_hold||e.p1_source_text_review?.finding||e.claim_boundary;
    lines.push("","**Evidence boundary from research ledger:** "+md(held),
      "","**Current-copy SHA-256:** EN \`"+fingerprint(row.custom_id,"final_en")+"\`; FR \`"+fingerprint(row.custom_id,"final_fr")+"\`; claims \`"+fingerprint(row.custom_id,"final_claims")+"\`",
      "","---");
  }
  lines.push("","**Do not sign off by changing the research ledger or by marking the existing 24-item scoped-acceptance register.** Only the dedicated final-signoff manifest has the metadata fields required for final review.");
  return lines.join("\n")+"\n";
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
  process.stdout.write(renderReviewPacket());
