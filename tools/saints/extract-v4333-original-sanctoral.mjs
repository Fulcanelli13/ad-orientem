// Extract the actual 1962 fixed SANCTI entries using the verified frozen v43.33
// Calendar source parser, never filling from monthly totals or saint name guesses.
// Research only; this deliberately does not instantiate or alter a live Calendar.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {Script} from "node:vm";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const artifact=resolve(root,"artifacts/saints-historical-v4333");
mkdirSync(artifact,{recursive:true});
const oldHtml=resolve(root,"legacy/Ad-Orientem-2.0-v43.33-ICON-OWNERSHIP-CONSOLIDATION.html");
const sourceFolder=resolve(artifact,"pinned-source");
execFileSync(process.execPath,["tools/reassemble-v43.33.mjs"],{cwd:root,stdio:"pipe",maxBuffer:300000});
const bytes=readFileSync(oldHtml);
const status=JSON.parse(readFileSync(resolve(root,"legacy/v43.33.parts/IMPORT-STATUS.json"),"utf8"));
const fullSha=createHash("sha256").update(bytes).digest("hex");
assert.equal(bytes.length,37954985);
assert.equal(fullSha,status.fullSha256);
assert.equal(status.complete,true);
const html=bytes.toString("utf8");
const startMarker="},5:function(module,exports,require){";
const endMarker="},6:function(module,exports,require){";
const start=html.indexOf(startMarker),end=html.indexOf(endMarker,start);
assert(start>0&&end>start&&end-start<110000,"Expected frozen v43.33 bundled Calendar source parser exactly once");
assert.equal(html.lastIndexOf(startMarker),start,"Ambiguous v43.33 Calendar parser module identity");
const code=html.slice(start+startMarker.length,end);
const module={exports:{}};
const runner=new Script("(function(module,exports,require){"+code+"\n})",{filename:"v43.33/calendar-source-parser-only"});
const fn=runner.runInNewContext({},{timeout:7000});
fn(module,module.exports,()=>{throw Error("Unexpected external dependency in historical calendar parser")});
const parser=module.exports.parseCalendarSources;
assert.equal(typeof parser,"function");
const filenames={
 common:"common.py",blocks:"blocks.py",titles:"translation.py"
};
const input={};
for(const [key,name] of Object.entries(filenames))
 input[key]=readFileSync(resolve(sourceFolder,name),"utf8");
const old=parser(input.common,input.blocks,input.titles);
assert(Array.isArray(old.blocks?.SANCTI)&&old.blocks.SANCTI.length>200);
const rows=old.blocks.SANCTI.map((originalId,i)=>{
 const parts=originalId.split(":");
 assert(parts.length>=4&&parts[0]==="sancti","Unexpected SANCTI row "+originalId);
 const suffix=parts[1],match=/^(\d{2})-(\d{2})(.*)$/.exec(suffix);
 assert(match,"Cannot derive nominal calendar MM-DD from "+originalId);
 const month=+match[1],day=+match[2];
 assert(month>=1&&month<=12&&day>=1&&day<=31);
 const md=match[1]+"-"+match[2];
 return {source_array_index:i,calendar_mm_dd:md,source_id:originalId,
    nominal_mass_or_local_suffix:match[3]||null,
    source_rank:Number(parts[2]),source_color_code:parts[3],
    source_title:old.titles.get(originalId)||null,
    source_constant_names:Object.entries(old.constants).filter(([k,v])=>v===originalId).map(([k])=>k),
    source_scope:"PINNED_HISTORIC_SANCTI_BLOCK_NOT_OBSERVED_2026_OR_CANONICAL_PERSON"};
});
const byMonth=Object.fromEntries(Array.from({length:12},(_,i)=>String(i+1).padStart(2,"0")).map(m=>{
 const group=rows.filter(x=>x.calendar_mm_dd.startsWith(m+"-"));
 return[m,{distinct_dates:new Set(group.map(x=>x.calendar_mm_dd)).size,component_occurrences:group.length}]
}));
const totals={component_occurrences:rows.length,distinct_nominal_date_keys:new Set(rows.map(x=>x.calendar_mm_dd)).size,
 distinct_source_ids:new Set(rows.map(x=>x.source_id)).size,
 rows_with_title:rows.filter(x=>x.source_title).length,
 named_constant_links:rows.filter(x=>x.source_constant_names.length).length};
const out={schema:"ao.saints.v4333-original-sanctoral-source-components.v1",
 publication:"RESEARCH_ONLY_NOT_1962_PERSON_OR_ART_PRODUCTION",
 provenance:{
  frozen_html_sha256:fullSha,
  frozen_archive_bytes:bytes.length,
  parser:"bundled module 5 parseCalendarSources from original frozen v43.33",
  historical_website_source_revisions:{
   missaleMeum:"f43359b7a79a5a299158651eedf75cdaf0e43c94",
   divinumOfficium:"126a07f91ede04664108abb6fb20ace3f4de14b9"},
  source_files:Object.entries(filenames).map(([role,name])=>({role,name,
    sha256:createHash("sha256").update(input[role]).digest("hex")})),
  reconstruction:"tools/reassemble-v43.33.mjs; verifies complete 37954985-byte frozen archive",
 },
 counting_policy:"Each source SANCTI tuple occurrence is one raw historical source component, not an individual person; multiple Masses, collective feasts, titles and event/Marian observances remain separate until source-verified. Date is nominal source key, not 2026 observed principal.",
 coverage_limits:["Original static SANCTI block only, not later 1962 liturgical rank/observed precedence or local calendars",
 "The observed full-year 2026 source census and the W59 252/311 historical artwork-target monthly counts are independent",
 "Do not add saints, images, or new feast days to production from this evidence"],
 totals,byMonth,rows};
writeFileSync(resolve(artifact,"v4333-original-sanctoral-source-components.json"),JSON.stringify(out,null,2)+"\n");
console.log("RECOVERED V43.33 NOMINAL SOURCE COUNTS: "+JSON.stringify({totals,byMonth}));
if(totals.component_occurrences!==311||totals.distinct_nominal_date_keys!==252){
 console.log("AUDIT WARNING: Historical W59 target 252 dates /311 components is NOT identical to this actual source SANCTI block; do not replace target with inferred rows.");
}else{
 console.log("PASS: original v43.33 source separately reproduces all historical 252 date/311 SANCTI component targets.");
}
