#!/usr/bin/env node
/**
 * Generate *ephemeral* Mass-style Divine Office previews from the already
 * normalized, source-owned pinned Office cells. No production routes,
 * artifact upload, paid hosts, remote dependencies, or site deployment.
 *
 * Usage: node scripts/office/build-mass-style-preview.mjs
 *   --out /tmp/ao-office-probe
 */
import {readFileSync,mkdirSync,writeFileSync,copyFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {renderOfficeMassStyleResearchReader} from "../../src/office/mass-style-research-reader.js";
import {missingOfficeSourceCells} from "../../src/office/research-reader.js";

const HOURS=["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"];
const safeDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s);
function pilotRoot(){
  const args=process.argv.slice(2);
  const flags=args.slice(2);
  const permitted=["--quarantine-unaligned","--quarantine-missing-translations"];
  if(args.length<2||args[0]!=="--out"||!args[1]||
    flags.length!==new Set(flags).size||flags.some(flag=>!permitted.includes(flag)))
    throw Error("OFFICE_MASS_PREVIEW_OUT_REQUIRED");
  return {root:resolve(args[1]),quarantineUnaligned:flags.includes("--quarantine-unaligned"),
    quarantineMissingTranslations:flags.includes("--quarantine-missing-translations")};
}
function build(){
  const {root,quarantineUnaligned,quarantineMissingTranslations}=pilotRoot();
  const normalized=JSON.parse(readFileSync(join(root,"normalized-manifest.json"),"utf8"));
  if(normalized.schema!=="ao.office.normalization-audit.v1"||normalized.published!==0||
    normalized.liturgicallyVerified!==0)throw Error("OFFICE_MASS_PREVIEW_RESEARCH_ONLY");
  const records=normalized.records;
  if(!Array.isArray(records)||!records.length)throw Error("OFFICE_MASS_PREVIEW_RECORDS_MISSING");
  const groups=new Map();
  for(const r of records){
    if(!safeDate(r.date)||!HOURS.includes(r.hour)||!["la","en","fr"].includes(r.language))
      throw Error("OFFICE_MASS_PREVIEW_UNEXPECTED_RECORD");
    const key=r.date+":"+r.hour;
    const g=groups.get(key)??{};
    if(g[r.language])throw Error("OFFICE_MASS_PREVIEW_DUPLICATE_RECORD");
    g[r.language]=r;
    groups.set(key,g);
  }
  const dates=[...new Set(records.map(r=>r.date))].sort();
  const eligibleGroups=new Set(),quarantined=[];
  for(const [key,group] of groups){
    if(!["la","en","fr"].every(l=>group[l]))throw Error("OFFICE_MASS_PREVIEW_TRILINGUAL_GAP");
    const counts=["la","en","fr"].map(l=>group[l].sectionCount);
    const reasons=[];
    if(new Set(counts).size!==1)reasons.push("SOURCE_CELL_COUNT_MISMATCH");
    const rows=normalized.comparisons.find(x=>x.date===group.la.date&&x.hour===group.la.hour);
    if(!rows||rows.structurallyAligned!==true)reasons.push("SOURCE_ALIGNMENT_NOT_CONFIRMED");
    if(reasons.length){
      if(!quarantineUnaligned)throw Error("OFFICE_MASS_PREVIEW_UNALIGNED:"+key+":"+reasons.join(","));
      quarantined.push({date:group.la.date,hour:group.la.hour,
        counts:{la:counts[0],en:counts[1],fr:counts[2]},reasons});
    }else eligibleGroups.add(key);
  }
  const allowedLocalePages=new Set(),blockedLocalePages=[];
  const locales=["en","fr"];
  for(const [key,group] of groups){
    if(!eligibleGroups.has(key))continue;
    for(const locale of locales){
      const d=JSON.parse(readFileSync(join(root,group.la.date,group.la.hour.toLowerCase(),
        locale+".research.json"),"utf8"));
      const missing=missingOfficeSourceCells(d);
      if(missing.length){
        if(!quarantineMissingTranslations)
          throw Error("OFFICE_MASS_PREVIEW_MISSING_TRANSLATION:"+key+":"+locale);
        blockedLocalePages.push({date:group.la.date,hour:group.la.hour,locale,
          reason:"UPSTREAM_UNRESOLVED_TRANSLATION",
          missingSourceCellIds:missing.map(x=>x.sourceCellId)});
      }else allowedLocalePages.add(key+":"+locale);
    }
  }
  const target=join(root,"preview","mass");
  mkdirSync(target,{recursive:true});
  copyFileSync(new URL("../../src/office/mass-style-research.css",import.meta.url),
    join(target,"office-research.css"));
  copyFileSync(new URL("../../src/office/mass-style-research-ui.js",import.meta.url),
    join(target,"office-research-ui.js"));
  const byHour={},files=[];
  for(const date of dates)for(const hour of HOURS){
    const group=groups.get(date+":"+hour);
    if(!group||!eligibleGroups.has(date+":"+hour))continue;
    const latin=JSON.parse(readFileSync(join(root,date,hour.toLowerCase(),"la.research.json"),"utf8"));
    for(const locale of locales){
      if(!allowedLocalePages.has(date+":"+hour+":"+locale))continue;
      const availableHours=HOURS.filter(h=>allowedLocalePages.has(date+":"+h+":"+locale));
      const availableDates=dates.filter(d=>allowedLocalePages.has(d+":"+hour+":"+locale));
      const availableLocales=locales.filter(l=>allowedLocalePages.has(date+":"+hour+":"+l));
      const translation=JSON.parse(readFileSync(join(root,date,hour.toLowerCase(),locale+".research.json"),"utf8"));
      const article=renderOfficeMassStyleResearchReader({
        latin,translation,locale,availableHours,availableDates,availableLocales,
      });
      const filename=date+"-"+hour.toLowerCase()+"-"+locale+".html";
      const html='<!doctype html><html lang="'+locale+'"><head><meta charset="utf-8">'+
        '<meta name="viewport" content="width=device-width,initial-scale=1">'+
        '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;self&#39;; style-src &#39;self&#39;; connect-src &#39;none&#39;; img-src &#39;none&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;; object-src &#39;none&#39;">'+
        '<title>Ad Orientem · '+hour+' · '+date+' · Mass-style Office research</title>'+
        '<link rel="stylesheet" href="./office-research.css"></head><body>'+
        '<nav class="aoOfficePilotNav" aria-label="Other local research Office previews">'+
        availableHours.map(h=>'<a href="'+date+'-'+h.toLowerCase()+'-'+locale+'.html"'+
          (h===hour?' aria-current="page"':'')+'>'+h+'</a>').join(" · ")+'</nav>'+
        article+'<script defer src="./office-research-ui.js"></script></body></html>';
      writeFileSync(join(target,filename),html,"utf8");
      files.push(filename);
      byHour[hour]=(byHour[hour]??0)+1;
    }
  }
  const summary={
    schema:"ao.office.mass-style-research-preview.v1",
    dates,hours:HOURS.filter(h=>byHour[h]),
    locales,files,quarantineEnabled:quarantineUnaligned,
    quarantinedSourceHours:quarantined,
    quarantinedSourceHourCount:quarantined.length,
    missingTranslationQuarantineEnabled:quarantineMissingTranslations,
    blockedLocalePageCount:blockedLocalePages.length,
    blockedLocalePages:blockedLocalePages,
    pages:files.length,byHour,
    researchOnly:true,passedIndependentRubricalReview:false,
    published:0,productionRouteRegistered:false,
    externalResources:0,chantScoreAssets:0,chantButtonEnabled:false,
    sourceManifest:"normalized-manifest.json",
  };
  writeFileSync(join(target,"preview-manifest.json"),JSON.stringify(summary,null,2)+"\n");
  console.log("OFFICE_MASS_STYLE_PREVIEW_SUMMARY",JSON.stringify({
    dates:summary.dates,hours:summary.hours,pages:summary.pages,
    published:summary.published,externalResources:summary.externalResources,
    productionRouteRegistered:summary.productionRouteRegistered,
    quarantinedSourceHours:summary.quarantinedSourceHourCount,
    blockedLocalePages:summary.blockedLocalePageCount,
  }));
  for(const block of blockedLocalePages)
    console.log("OFFICE_MISSING_TRANSLATION_QUARANTINE",JSON.stringify(block));
  if(summary.pages+summary.blockedLocalePageCount!==eligibleGroups.size*2 ||
    summary.pages+summary.blockedLocalePageCount+summary.quarantinedSourceHourCount*2!==groups.size*2)
    throw Error("OFFICE_MASS_PREVIEW_COUNT_MISMATCH");
}
try{build()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
