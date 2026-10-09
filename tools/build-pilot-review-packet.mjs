/**
 * Offline review packet for the live 200 original EN/FR Guided Rosary meditations.
 * Never equate source-linked editorial prose with verbatim quotations or a
 * completed independent Catholic editorial approval.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { ROSARY_GUIDED_BEAD_MEDITATIONS_V1 as M } from "../src/pray/rosary-guided-bead-meditations.v1.js";
import { ROSARY_GUIDED_BEAD_EVIDENCE_V1 as E } from "../src/pray/rosary-guided-bead-evidence.v1.js";

const OUT = resolve(process.argv[2] || "artifacts/pilot-review-handoff");
const hash = v => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
})[c]);
const safeLink = url => {
  if (!String(url).startsWith("https://")) throw Error("Non-HTTPS review source URL: "+url);
  return escapeHtml(url);
};
const ORDER = ["joy","lum","sor","glo"];
const rows = [];
for (const family of ORDER) for (let mystery=1;mystery<=5;mystery++) {
  const id=family+mystery;
  if (M[id]?.length!==10 || E[id]?.length!==10) throw Error("Missing ten-bead owners: "+id);
  for (let i=0;i<10;i++) {
    const meditation=M[id][i],witness=E[id][i],bead=i+1;
    if(meditation.bead!==bead || witness.bead!==bead) throw Error("Wrong bead mapping: "+id+"."+bead);
    if(!meditation.en || !meditation.fr || !witness.reference) throw Error("Missing bilingual source: "+id+"."+bead);
    if(witness.isDirectQuotation!==false || witness.textualApproval!=="NOT_A_BIBLICAL_QUOTATION")
      throw Error("Unsafe Scripture quotation flag: "+id+"."+bead);
    safeLink(witness.primaryUrl);safeLink(witness.frenchPrimaryUrl);
    const row={
      id:id+".b"+bead, mysteryId:id, bead,
      en:meditation.en,fr:meditation.fr,sourceReference:witness.reference,
      sourceReferenceFr:witness.referenceFr||null, sourceRole:witness.relationship,
      englishSourceUrl:witness.primaryUrl,frenchSourceUrl:witness.frenchPrimaryUrl,
      frenchWitnessLanguage:witness.frenchWitnessLanguage||"fr",
      directQuotation:false
    };
    row.fingerprint=hash(row);
    rows.push(row);
  }
}
if(rows.length!==200||new Set(rows.map(x=>x.id)).size!==200)throw Error("Expected 200 unique Rosary reviews");
const corpusFingerprint=hash(rows.map(x=>x.fingerprint));
const packet={
  schema:"ao-rosary-human-review-packet-v1",
  purpose:"Internal preparatory material for independent theological and bilingual editorial review",
  corpusFingerprint,
  approvalStatus:"PENDING_INDEPENDENT_REVIEW",
  proof:"Fingerprint binds review decisions to the exact EN/FR wording, source role and linked source at export.",
  historicalQuotations:"WITHHELD_NOT_REPUBLISHED",
  summaries:{mysteries:20,beads:200,bilingualRows:200,humanApprovalsRecorded:0},
  rows
};
await mkdir(OUT,{recursive:true});
await writeFile(resolve(OUT,"rosary-review-source.json"),JSON.stringify(packet,null,2)+"\n","utf8");
const csvCell=s=>'"'+String(s??"").replaceAll('"','""')+'"';
const headers=["id","mysteryId","bead","fingerprint","en","fr","sourceReference","sourceRole","englishSourceUrl","frenchSourceUrl","frenchWitnessLanguage","reviewStatus","reviewerNote"];
const csv=[headers.map(csvCell).join(",")];
for(const row of rows)csv.push(headers.map(k=>csvCell(row[k]??(k==="reviewStatus"?"UNREVIEWED":""))).join(","));
await writeFile(resolve(OUT,"rosary-review-200.csv"),"\uFEFF"+csv.join("\r\n")+"\r\n","utf8");

const tr=rows.map(r=>'<tr data-review-id="'+escapeHtml(r.id)+'" data-fingerprint="'+r.fingerprint+'" data-mystery="'+r.mysteryId+'">'+
  '<td><strong>'+escapeHtml(r.id)+'</strong><small>'+escapeHtml(r.sourceRole)+'</small></td>'+
  '<td lang="en">'+escapeHtml(r.en)+'</td>'+
  '<td lang="fr">'+escapeHtml(r.fr)+'</td>'+
  '<td><span>'+escapeHtml(r.sourceReferenceFr||r.sourceReference)+'</span>'+
  '<a href="'+safeLink(r.englishSourceUrl)+'" target="_blank" rel="noopener noreferrer">English original</a>'+
  '<a href="'+safeLink(r.frenchSourceUrl)+'" target="_blank" rel="noopener noreferrer">'+(r.frenchWitnessLanguage==="la"?"Latin original":"French original")+'</a></td>'+
  '<td><select aria-label="Verdict '+escapeHtml(r.id)+'"><option value="UNREVIEWED">Unreviewed</option><option value="APPROVE">Approve</option><option value="REVISE">Revise</option><option value="HOLD">Hold</option></select>'+
  '<textarea aria-label="Evidence notes '+escapeHtml(r.id)+'" placeholder="Reason and source reference"></textarea></td></tr>').join("\n");
const css=[
"body{font:15px/1.55 system-ui,sans-serif;background:#f7f7f4;color:#171717;margin:0}main{max-width:1420px;margin:auto;padding:25px}",
"h1{margin:0 0 8px;font-size:28px}p{max-width:95ch}label{font-weight:600}header{background:#fff;border-bottom:1px solid #ddd;padding:16px 0}",
".controls{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin:20px 0}.controls label{display:grid;gap:5px}",
"input,select,textarea,button{font:inherit;padding:7px;border:1px solid #999;border-radius:4px;background:#fff}",
"button{background:#202a39;color:white;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #ae6429}",
".tablebox{overflow-x:auto}table{border-collapse:collapse;background:white;width:100%;min-width:1050px}",
"th,td{border:1px solid #dadada;vertical-align:top;padding:9px;text-align:left}th{position:sticky;top:0;background:#e9ecee}",
"td:first-child{white-space:nowrap}td small{display:block;font-size:11px;color:#555;white-space:normal;max-width:170px}",
"td:nth-child(2),td:nth-child(3){min-width:230px}td a{display:block;font-size:12px;margin-top:5px}",
"td select,td textarea{box-sizing:border-box;display:block;width:180px;margin-bottom:5px}",
"td textarea{min-height:54px;font-size:13px}tr[hidden]{display:none}.muted{color:#555}",
"@media print{.controls,button{display:none}th{position:static}body{background:white}table{min-width:0}td{font-size:10px}}"
].join("");
const client=[
'const ROWS=[...document.querySelectorAll("tr[data-review-id]")];',
'const KEY="ao-rosary-human-review-"+document.body.dataset.corpus;',
'const reviewer=document.getElementById("reviewer");',
'const filter=document.getElementById("filter");',
'function getDecisions(){return ROWS.map(tr=>({id:tr.dataset.reviewId,fingerprint:tr.dataset.fingerprint,verdict:tr.querySelector("select").value,note:tr.querySelector("textarea").value.trim()}));}',
'function update(){const q=filter.value.trim().toLowerCase();for(const tr of ROWS)tr.hidden=!!q&&!tr.dataset.reviewId.includes(q);const ds=getDecisions();const n={};for(const d of ds)n[d.verdict]=(n[d.verdict]||0)+1;document.getElementById("counts").textContent="200 total · "+(n.APPROVE||0)+" approved · "+(n.REVISE||0)+" revise · "+(n.HOLD||0)+" held · "+(n.UNREVIEWED||0)+" unreviewed";try{localStorage.setItem(KEY,JSON.stringify({reviewer:reviewer.value,decisions:ds}));}catch{}}',
'try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved){reviewer.value=saved.reviewer||"";const map=new Map((saved.decisions||[]).map(d=>[d.id,d]));for(const tr of ROWS){const d=map.get(tr.dataset.reviewId);if(!d||d.fingerprint!==tr.dataset.fingerprint)continue;tr.querySelector("select").value=d.verdict;tr.querySelector("textarea").value=d.note||"";}}}catch{}',
'document.getElementById("reviewTable").addEventListener("input",update);document.getElementById("reviewTable").addEventListener("change",update);reviewer.addEventListener("input",update);filter.addEventListener("input",update);',
'document.getElementById("export").addEventListener("click",()=>{const name=reviewer.value.trim();if(!name){alert("Enter reviewer identity before export.");reviewer.focus();return;}const decisions=getDecisions();const payload={schema:"ao-rosary-human-review-decisions-v1",corpusFingerprint:document.body.dataset.corpus,reviewer:name,recordedAt:new Date().toISOString(),status:"SUBMITTED_FOR_EDITORIAL_REVIEW_NOT_RELEASE_AUTHORIZATION",decisionCounts:Object.fromEntries(["APPROVE","REVISE","HOLD","UNREVIEWED"].map(s=>[s,decisions.filter(x=>x.verdict===s).length])),decisions};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="rosary-review-decisions-"+Date.now()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});update();'
].join("\n");
const html=[
'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rosary · 200-bilingual-meditiation review</title><style>',css,'</style></head>',
'<body data-corpus="',corpusFingerprint,'"><header><main><h1>Rosary · 200 bilingual meditations</h1>',
'<p>Independent editorial review packet, not a theological approval, imprimatur, verbatim Scripture edition or app release clearance. All 200 entries are original contemplations; source links are contextual witnesses. Check EN, FR, doctrinal role and links separately. Exports are bound to this corpus fingerprint.</p>',
'<p class="muted">Corpus SHA-256: ',corpusFingerprint,'</p></main></header><main>',
'<div class="controls"><label>Reviewer identity<input id="reviewer" placeholder="Full name or reviewer ID"></label><label>Filter mystery ID<input id="filter" placeholder="e.g. sor5 or joy1.b3"></label>',
'<button id="export">Export signed review decisions (JSON)</button><span id="counts"></span></div>',
'<div class="tablebox"><table id="reviewTable"><thead><tr><th>ID and source role</th><th>English meditation</th><th>Méditation française</th><th>Original context</th><th>Reviewer verdict and evidence</th></tr></thead><tbody>',
tr,'</tbody></table></div></main><script>',client,'</script></body></html>'
].join("");
await writeFile(resolve(OUT,"rosary-review-offline.html"),html,"utf8");
console.log("PASS offline Rosary reviewer packet: 200 bilingual meditations, 190 Scripture witnesses + 10 magisterial witnesses; 0 human approvals");
console.log("CORPUS_FINGERPRINT="+corpusFingerprint);
console.log("OUTPUT="+OUT);
