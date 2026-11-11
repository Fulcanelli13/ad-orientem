// Build a single OFFLINE source-score review HTML from archived GABCs.
// Nothing is downloaded or scraped. Exsurge is the repo's existing vendor.
// Output stays in the unshipped Schola CI research directory.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildFull1961SourceStudy} from "./complete-1961-source-catalogue.mjs";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=join(root,".tmp/schola-1962-selected-annual");
const load=async path=>JSON.parse(await readFile(join(root,path),"utf8"));
const index=await load("data/mass/chant-corpus/gr1961-proper-index.json");
if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
   index.status!=="RESEARCH_ONLY_NOT_MASS_READER"||
   index.screening?.validStaged!==1195||
   !Array.isArray(index.batches)||index.batches.length!==6)
 throw Error("EXISTING_GR1961_ARCHIVE_INDEX_IDENTITY_INVALID");
const batches=[];
for(const entry of index.batches){
 const path=join(root,entry.path);
 const bytes=await readFile(path);
 const hash=createHash("sha256").update(bytes).digest("hex");
 if(bytes.byteLength!==entry.bytes||hash!==entry.contentSha256)
  throw Error("SOURCE_ARCHIVE_BATCH_ORIGINAL_BYTES_MISMATCH:"+entry.path);
 batches.push(JSON.parse(bytes.toString("utf8")));
}
const selected=await load(".tmp/schola-1962-selected-annual/2026-selected-full1049-inline-crosswalk.json");
const result=buildFull1961SourceStudy({batches,selected2026:selected});
if(result.counts.sourceGabcTotal!==1220||
   result.counts.originalProperGabc!==1195||
   result.counts.existingOrdinaryGabc!==20||
   result.counts.importedSequenceGabc!==5||
   result.counts.separateUnimportedSequenceLeads!==0||
   result.counts.selected2026.matched!==true||
   result.publication.publicScores!==0||
   result.entries.some(item=>item.publication!=="RESEARCH_ONLY_NOT_MUSICALLY_APPROVED"))
 throw Error("SOURCE_REVIEW_ARTIFACT_PUBLICATION_OR_CENSUS_GATE_INVALID");
const template=await readFile(join(root,"tools/mass/complete-1961-source-review-template.html"),"utf8");
const exsurge=await readFile(join(root,"assets/vendor/exsurge/exsurge.min.js"),"utf8");
if(exsurge.length<100000||!exsurge.includes("exsurge"))
 throw Error("EXISTING_OFFLINE_EXSURGE_UNAVAILABLE");
const payload=JSON.stringify(result).replace(/</g,"\\u003c")
 .replace(/>/g,"\\u003e").replace(/&/g,"\\u0026")
 .replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
if(template.split("__SOURCE_CATALOGUE_JSON__").length!==2||
   template.split("__VENDORED_EXSURGE_JS__").length!==2)
 throw Error("SOURCE_STUDY_TEMPLATE_PLACEHOLDER_IDENTITY_INVALID");
const html=template.replace("__SOURCE_CATALOGUE_JSON__",payload)
 .replace("__VENDORED_EXSURGE_JS__",exsurge.replace(/<\/script/gi,"<\\/script"));
if(html.includes("__SOURCE_CATALOGUE_JSON__")||
   html.includes("__VENDORED_EXSURGE_JS__")||
   !html.includes('document.body.dataset.aoSourceScoreReviewReady="true"')||
   html.length<500000)
 throw Error("FULL_1961_SOURCE_REVIEW_HTML_INCOMPLETE");
await mkdir(dir,{recursive:true});
const output=join(dir,"2026-all-1961-mass-source-gabc-study.html");
await writeFile(output,html,"utf8");
await writeFile(join(dir,"2026-all-1961-mass-source-gabc-study-manifest.json"),
 JSON.stringify({
  schema:result.schema,source:result.source,rights:result.rights,
  counts:result.counts,sequenceLeads:result.sequenceLeads,
  publication:result.publication,
  sources:result.entries.map(({id,category,role,part,settingId,
   title,folio,sourceUrl,originalGabcSha256,sourceMatch2026})=>({
   id,category,role,part,settingId,title,folio,sourceUrl,
   originalGabcSha256,sourceMatch2026
  }))
 },null,2)+"\n");
console.log("FULL_EXISTING_1961_GABC_REVIEW "+
 JSON.stringify({scores:result.counts.sourceGabcTotal,
  roles:result.counts.byRole,
  corroboratedSelected2026:result.counts.selected2026,
  importedSequences:result.counts.importedSequenceGabc,
  publicScores:0,htmlBytes:Buffer.byteLength(html)}));
