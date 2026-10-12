#!/usr/bin/env node
// Full 2026 Class II-IV artwork reuse proposal; not publication approval.
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const dir="artifacts/sacred-art-coverage";
const audit=read(dir+"/liturgical-priority-v1.json");
const catalog=read("data/calendar/sacred-art-candidates.v1.json");
assert.equal(audit.observedYear.days.length,365,"Requires full year");
assert.equal(audit.observedYear.unresolvedDays,0,"Unresolved liturgical date");
const original=catalog.artworks.filter(a=>a.acquisition?.archiveOriginal&&/^[a-f0-9]{64}$/.test(a.acquisition?.originalSha256||""));
assert.equal(new Set(original.map(a=>a.acquisition.originalSha256)).size,original.length);
const cc0=original.filter(a=>a.source?.rights==="CC0");
const tags=a=>[...(a.tags?.iconography||[]),...(a.association?.subjectKeys||[])];
const subset=tag=>cc0.filter(a=>tags(a).includes(tag));
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const rules=[
 ["Holy Family",/\bholy family\b/,"holy-family"],
 ["Visitation",/\bvisitation of (?:the blessed virgin|our lady|mary)\b/,"visitation"],
 ["Assumption",/\bassumption of (?:the blessed virgin|our lady|mary)\b/,"assumption-mary"],
 ["Immaculate Conception",/\bimmaculate conception\b/,"immaculate-conception"],
 ["Transfiguration",/\btransfiguration of (?:our lord|the lord|jesus)\b/,"transfiguration"],
 ["Exaltation of Cross",/\bexaltation of the (?:holy )?cross\b/,"crucifixion"],
 ["Our Lady Sorrows",/\b(?:seven sorrows|our lady of sorrows)\b/,"seven-sorrows"],
 ["St Andrew",/\b(?:saint|st)\s+andrew\b/,"saint-andrew"],
 ["St Anthony of Padua",/\b(?:saint|st)\s+anthony of padua\b/,"saint-anthony-padua"],
 ["St Benedict",/\b(?:saint|st)\s+benedict\b(?!\s+joseph)/,"saint-benedict"],
 ["St Catherine Siena",/\b(?:saint|st)\s+catherine of siena\b/,"saint-catherine-siena"],
 ["St Dominic",/\b(?:saint|st)\s+dominic\b(?!\s+savio)/,"saint-dominic"],
 ["St Francis of Assisi",/\b(?:saint|st)\s+francis of assisi\b/,"saint-francis-assisi"],
 ["St Jerome",/\b(?:saint|st)\s+jerome\b/,"saint-jerome"],
 ["St John Baptist",/\b(?:saint|st)\s+john the baptist\b/,"saint-john-baptist"],
 ["St Michael",/\b(?:saint|st)\s+michael\b/,"saint-michael"],
 ["St Paul",/\b(?:saint|st)\s+paul\b(?!\s+(?:the hermit|of the cross|miki))/, "saint-paul"],
 ["St Peter",/\b(?:saint|st)\s+peter\b(?!\s+(?:martyr|damian|chrysologus|claver|of alcantara))/, "saint-peter"],
 ["St Thomas Aquinas",/\b(?:saint|st)\s+thomas aquinas\b/,"saint-thomas-aquinas"]
];
const season=d=>d<="2026-01-05"?"christmas":d<="2026-01-31"?"after-epiphany":
 d<="2026-02-17"?"septuagesima":d<="2026-03-21"?"lent":
 d<="2026-04-04"?"passion":d<="2026-05-13"?"easter":
 d<="2026-05-23"?"ascension":d<="2026-05-30"?"pentecost":
 d<="2026-11-28"?"after-pentecost":d<="2026-12-24"?"advent":"christmas";
const seasonal=s=>cc0.filter(a=>(a.tags?.liturgicalSeasonIds||[]).includes(s)||(a.association?.seasonIds||[]).includes(s));
const marians=cc0.filter(a=>tags(a).includes("marian")||tags(a).includes("virgin-child"));
const universal=cc0.filter(a=>tags(a).includes("universal")||tags(a).includes("christ-blessing"));
assert.ok(universal.length);
const choose=(a,d)=>a[(Number(d.replaceAll("-",""))*11)%a.length];
const rows=audit.observedYear.days.filter(d=>[2,3,4].includes(d.rank)).map(d=>{
 assert.ok(d.observedPrincipalId&&d.title);
 const named=rules.find(r=>r[1].test(norm(d.title))&&subset(r[2]).length);
 const marian=d.observedPrincipalId.startsWith("commune:C10")&&/blessed virgin mary|virgin mary on saturday/i.test(d.title);
 const s=season(d.date);let basis,options;
 if(named){basis="NAMED_SUBJECT_CONTEXT";options=subset(named[2]);}
 else if(marian&&marians.length){basis="MARIAN_SATURDAY_CONTEXT";options=marians;}
 else if(seasonal(s).length){basis="SEASONAL_CONTEXT";options=seasonal(s);}
 else{basis="UNIVERSAL_BACKGROUND";options=universal;}
 const a=choose(options,d.date);assert.ok(a?.acquisition?.originalSha256);
 return {date:d.date,rank:d.rank,observedPrincipalId:d.observedPrincipalId,
 observedTitle:d.title,season2026:s,artworkId:a.id,paintingTitle:a.title,artist:a.artist,
 originalSha256:a.acquisition.originalSha256,sourceUrl:a.source.objectUrl,
 sourceRights:a.source.rights,basis,namedSubject:named?.[0]||null,
 warning:basis==="NAMED_SUBJECT_CONTEXT"?"Person or event only; appointed Proper not verified":
 "Illustrative thematic background only; no specific saint or appointed Gospel claim",
 exactProperCertified:false,artisticApproval:false,mobileCropApproval:false,productionApproval:false};
});
const counts=Object.fromEntries([2,3,4].map(rank=>{
 const r=rows.filter(x=>x.rank===rank);
 return [rank,{observedDays:r.length,hasResearchIllustration:r.length,
  namedSubject:r.filter(x=>x.basis==="NAMED_SUBJECT_CONTEXT").length,
  Marian:r.filter(x=>x.basis==="MARIAN_SATURDAY_CONTEXT").length,
  seasonal:r.filter(x=>x.basis==="SEASONAL_CONTEXT").length,
  generic:r.filter(x=>x.basis==="UNIVERSAL_BACKGROUND").length,
  exactArtworkCertified:0,releaseApproved:0}];
}));
assert.equal(rows.length,312);
assert.deepEqual([counts[2].observedDays,counts[3].observedDays,counts[4].observedDays],[76,165,71]);
const summary={classCounts:counts,totalResearchProposals:rows.length,uniquePhysicalOriginalsReused:new Set(rows.map(r=>r.artworkId)).size,
 publicationApproved:0,exactProperApproved:0};
const report={schema:"AO_SACRED_ART_RANK_II_IV_FIRSTPASS_V1",year:2026,status:"RESEARCH_SOURCE_ASSOCIATIONS_ONLY",
 source:"Production 1962 DayResolver full 2026 year audit; same SHA256-acquired museum CC0 originals",
 caveats:["These proposals do not establish correct art for every feast or Gospel.",
 "Only the 2026 frozen season boundaries are applicable.",
 "A subject association never creates exact observed-identity or appointed-Gospel evidence.",
 "Human artwork quality, mobile crop, and production-release gates remain unpassed."],
 summary,rows};
mkdirSync(dir,{recursive:true});
writeFileSync(dir+"/rank-ii-iv-firstpass-v1.json",JSON.stringify(report,null,2)+"\n");
const unresolved=rows.filter(r=>r.basis!=="NAMED_SUBJECT_CONTEXT");
const lines=["# Class II–IV first-pass source art — 2026","",
 "Illustration proposals only, not verified exact Mass Proper paintings or production approval.","",
 "| Class | Resolved days | Contextual original suggested | Named subject | Still generic/context-only |",
 "|---|---:|---:|---:|---:|",
 ...[2,3,4].map(k=>"| "+(["","I","II","III","IV"][k])+" | "+counts[k].observedDays+" | "+counts[k].hasResearchIllustration+" | "+counts[k].namedSubject+" | "+(counts[k].observedDays-counts[k].namedSubject)+" |"),
 "", "Existing SHA256 originals reused: "+summary.uniquePhysicalOriginalsReused+" (no new files).",
 "No images approved for publication. Exact date-specific subject deficits persist.","",
 "## Dated gaps to research by repeated topic, not by individual day","",
 ...unresolved.map(r=>"- "+r.date+" · Class "+r.rank+" · "+r.observedTitle+" · "+r.basis+" · "+r.artworkId),
 "","Machine-readable per-date hash and source URL: rank-ii-iv-firstpass-v1.json."];
writeFileSync(dir+"/rank-ii-iv-firstpass-v1.md",lines.join("\n")+"\n");
console.log("SACRED_ART_II_IV_SUMMARY="+JSON.stringify(summary));
