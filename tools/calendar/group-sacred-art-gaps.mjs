#!/usr/bin/env node
// Group 1962 observed-day artwork gaps by repeatable Gospel / exact saint identity.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
const dir="artifacts/sacred-art-coverage";
const report=JSON.parse(readFileSync(dir+"/full-year-multiple-associations.v1.json","utf8"));
assert.equal(report.schema,"AO_SACRED_ART_FULL_YEAR_MULTIPLE_ASSOCIATIONS_V1");
assert.equal(report.days.length,365);
const gaps=report.days.filter(d=>d.specificSubjectResearchStillNeeded);
const grouped=new Map();
const noGospel=[];
for(const d of gaps){
 const p=(d.appointedScripture||[]).find(x=>x.slot==="GOSPEL"&&x.reference);
 if(!p){noGospel.push({date:d.date,rank:d.class,title:d.observedTitle,principalId:d.observedPrincipalId});continue;}
 const gospel=p.reference;
 if(!grouped.has(gospel))grouped.set(gospel,{reference:gospel,sourcePath:p.properSourcePath||null,dates:[],classes:new Set(),principalIds:[]});
 const group=grouped.get(gospel);
 group.dates.push({date:d.date,rank:d.class,title:d.observedTitle,principalId:d.observedPrincipalId});
 group.classes.add(d.class);group.principalIds.push(d.observedPrincipalId);
}
const entries=[...grouped.values()].map(g=>({
 gospel:g.reference,frequency:g.dates.length,
 firstClassDates:g.dates.filter(d=>d.rank===1).length,
 classes:[...g.classes].sort(),sourcePath:g.sourcePath,
 dates:g.dates,observedPrincipalIds:g.principalIds,
 status:"SPECIFIC_ART_RESEARCH_MISSING",
 caveat:"The same Gospel text can be assigned to multiple saints; paintings of the narrative may contextualize its appointments, not depict each saint."
})).sort((a,b)=>b.frequency-a.frequency||b.firstClassDates-a.firstClassDates||a.gospel.localeCompare(b.gospel));
const repeated=entries.filter(e=>e.frequency>=2);
const singles=entries.filter(e=>e.frequency===1);
const summary={observedDays:365,specificSubjectResearchStillNeeded:gaps.length,
 sharedGospelGroups:repeated.length,sharedGospelGapDays:repeated.reduce((n,e)=>n+e.frequency,0),
 singleGospelGroups:singles.length,gospelSourceNotPresent:noGospel.length,
 highlyReusedGospels:entries.filter(e=>e.frequency>=3).length,
 userEditorialApprovals:0,productionApprovals:0};
assert.equal(summary.sharedGospelGapDays+summary.singleGospelGroups+summary.gospelSourceNotPresent,gaps.length);
const out={schema:"AO_SACRED_ART_BULK_GAP_BACKLOG_V1",year:2026,summary,
 source:"Production 1962 DayResolver, source-bound Gospel and full-year multi-image provisional registry",
 policy:"Research shared scriptural subjects as bulk groups; saints retain distinct canonical identities; generic background does not close specific gaps; no visual user audit until full corpus research stable.",
 repeatedGospelTargets:repeated,uniqueGospelTargets:singles,gospelUnavailable:noGospel};
writeFileSync(dir+"/bulk-gospel-gap-backlog.v1.json",JSON.stringify(out,null,2)+"\n");
const lines=["# Sacred art bulk acquisition: repeatable 1962 Gospel groups","",
 "Research worklist only. A single suitable painting can legitimately serve several liturgical days, but a recurring saint's Gospel is not necessarily an illustration of that saint.",
 "| Metric | Count |","|---|---:|",
 ...Object.entries(summary).map(([k,v])=>"| "+k+" | "+v+" |"),
 "","## Highest repeated Gospel source gaps","",
 ...entries.slice(0,85).map(e=>"- **"+e.gospel+"** · "+e.frequency+" observed days · "+e.firstClassDates+" Class I · "+e.dates.map(d=>d.date).join(", ")),
 "","## No source-bound Gospel for artwork inference",
 ...noGospel.map(d=>"- "+d.date+" — "+d.title+" ["+d.principalId+"]"),
 "","Research a repeated pericope just once, then let each observed day propose the resulting paintings as contextual appointed Gospel choices. Every saint portrait/feast remains independent. No editorial acceptance or production permission is inferred."];
writeFileSync(dir+"/bulk-gospel-gap-backlog.v1.md",lines.join("\n")+"\n");
console.log("SACRED_ART_BULK_GOSPEL_BACKLOG="+JSON.stringify(summary));
