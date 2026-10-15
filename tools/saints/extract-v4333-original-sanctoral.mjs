// Extract the actual 1962 fixed SANCTI entries using the verified frozen v43.33
// Calendar source parser, never filling from monthly totals or saint name guesses.
// Research only; this deliberately does not instantiate or alter a live Calendar.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {Script,createContext} from "node:vm";
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
// Crucial: the archived Saints-of-the-Day artwork manifest is a separate
// reducer over these 338 source rows. Run ITS ACTUAL frozen version, not
// a new classification algorithm or monthly-target row padding.
const artStartMarker='<script id="ao-saint-art-runtime-v1-js">';
const artStart=html.indexOf(artStartMarker);
const artEnd=html.indexOf("</script>",artStart);
assert(artStart>0&&artEnd>artStart&&artEnd-artStart<150000,
 "Frozen v43.33 Saint-Art script is absent or changed beyond reviewed bounds");
assert.equal(html.lastIndexOf(artStartMarker),artStart,"Ambiguous frozen Saint-Art script");
const saintArtScript=html.slice(artStart+artStartMarker.length,artEnd);
const ctx=createContext({
 console:{log(){},warn(){},error(){}},
 document:{addEventListener(){}},
 window:{addEventListener(){}},
 AO_RUNTIME_V8:{resolver:{calendarEngine:{loadSource:async()=>old}}},
 localStorage:{length:0,removeItem(){},getItem(){return null},key(){return null}},
});
const artRunner=new Script(saintArtScript,{filename:"frozen-v43.33/saint-art-runtime-v3.3"});
artRunner.runInContext(ctx,{timeout:10000});
assert.equal(typeof ctx.SAINT_COMPONENTS?.generate,"function",
  "Frozen Saints source manifest entrypoint missing");
const historical=await ctx.SAINT_COMPONENTS.generate();
const hist=historical.summary;
assert.equal(hist.calendarOccurrencesParsed,338,
 "Historic saint-art engine did not consume all 338 original source rows");
const histRows=historical.records.map(r=>({
 calendar_mm_dd:r.date,
 original_source_observances:r.source.rawObservances.map(x=>({
   id:x.id,title:x.rawTitle,original_constant:x.constant,
   original_commemoration:!!x.rawCommemoration,
   original_scope_included:!!x.scope?.include,
   original_scope_reason:x.scope?.reason||null
 })),
 historical_art_components:r.components.map((c,i)=>({
   occurrence_index:i,original_component_id:c.componentId,
   historical_canonical_id:c.canonicalId??null,
   historical_display_name:c.displayName??null,
   historical_representation_mode:c.representationMode??null,
   historical_companion_model:c.companionModel??null,
   original_qa_status:c.qaStatus??null,
   historical_evidence:c.evidence??null,
   owner_review:"V43_FROZEN_HISTORICAL_ID_NOT_CURRENT_CANONICAL_PERSON_OR_APPROVED_ART"
 }))
}));
const histCount=histRows.reduce((n,x)=>n+x.historical_art_components.length,0);
const historicalMonthly=Object.fromEntries(Object.entries(hist.monthly).map(([m,row])=>[m,{
 dates:row.days,components:row.components,
 historical_target_dates:row.targetDays,historical_target_components:row.targetComponents,
 passes_day_count:row.passDays,passes_component_count:row.passComponents
}]));
const historicalOutput={
 schema:"ao.saints.v4333-original-saint-art-component-manifest.v1",
 publication:"HISTORICAL_RESEARCH_ONLY_NOT_CURRENT_ART_APPROVAL_OR_CALENDAR_STATUS",
 frozen_html_sha256:fullSha,
 archive_script_id:"ao-saint-art-runtime-v1-js",
 archive_runtime_version:historical.version,
 data_source:"verified pinned original v43.33 bundled calendar parser and original source.blocks.SANCTI",
 artifact_owner:"Historical v43.33 original; W59/W63 Sacred Art retains original-ID ratings/rights",
 counts:{
  original_raw_sancti_rows:hist.calendarOccurrencesParsed,
  original_excluded_from_saint_art_scope:hist.scopeExcludedOccurrences,
  historical_saint_bearing_dates:hist.saintBearingDates,
  historical_component_occurrences:hist.artworkComponents,
  nonresolved_legacy_canonical_ids:hist.ambiguousIds,
  counted_components_from_serialized_rows:histCount,
  dates_from_serialized_rows:histRows.length,
  historical_expected_dates:hist.expected.saintBearingDates,
  historical_expected_components:hist.expected.components,
  historical_month_differences:hist.countReconciliationPending,
  original_override_dates_applied:hist.explicitOverridesApplied,
  historical_count_matches:hist.countMatches,
 },
 historicalMonthly,records:histRows,
 no_promotions:["Archived 'approved' art status is not current user 0–5 approval",
 "Historical component identity may denote groups, angels or distinct source traditions, not unique canonized saints",
 "The source 338 raw rows and historical art component count may diverge intentionally",
 "No physical saint image or new calendar entry published"],
};
writeFileSync(resolve(artifact,"v4333-original-saint-art-manifest-instance-rows.json"),
 JSON.stringify(historicalOutput,null,2)+"\n");
console.log("RECOVERED ACTUAL V43.33 SAINT ART MANIFEST: "+JSON.stringify(historicalOutput.counts));
console.log("ACTUAL HISTORICAL MONTHLY COUNTS: "+JSON.stringify(historicalMonthly));
if(histCount===311&&histRows.length===252&&hist.countMatches.saintBearingDates&&hist.countMatches.components)
 console.log("PASS: ORIGINAL archived saint-art runtime generated its authentic 252 dates / 311 historical component instances");
else
 console.log("AUDIT HOLD: Frozen runtime actual entries do not agree with historic 252/311 target; rows preserved, no fabricated fillers");
console.log("RECOVERED V43.33 NOMINAL SOURCE COUNTS: "+JSON.stringify({totals,byMonth}));
if(totals.component_occurrences!==311||totals.distinct_nominal_date_keys!==252){
 console.log("AUDIT WARNING: Historical W59 target 252 dates /311 components is NOT identical to this actual source SANCTI block; do not replace target with inferred rows.");
}else{
 console.log("PASS: original v43.33 source separately reproduces all historical 252 date/311 SANCTI component targets.");
}
