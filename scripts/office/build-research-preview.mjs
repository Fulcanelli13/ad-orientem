#!/usr/bin/env node
/**
 * Ephemeral Office research-preview compiler. Never publish this folder.
 * Example: node scripts/office/build-research-preview.mjs --out /tmp/ao-office-probe
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {renderOfficeResearchReader} from "../../src/office/research-reader.js";

function main(){
  const args=process.argv.slice(2);
  if(args.length!==2||args[0]!=="--out"||!args[1])throw Error("OFFICE_PREVIEW_OUTPUT_REQUIRED");
  const root=resolve(args[1]);
  const manifest=JSON.parse(readFileSync(join(root,"normalized-manifest.json"),"utf8"));
  if(manifest.schema!=="ao.office.normalization-audit.v1"||manifest.published!==0||
    manifest.liturgicallyVerified!==0)throw Error("OFFICE_PREVIEW_RESEARCH_ONLY");
  const css=readFileSync(new URL("../../src/office/research-preview.css",import.meta.url),"utf8");
  const dates=[...new Set(manifest.records.map(x=>x.date))].sort();
  const hours=["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"];
  const target=join(root,"preview");
  mkdirSync(target,{recursive:true});
  let count=0;
  const byHour={};
  for(const date of dates)for(const hour of hours){
    const latin=JSON.parse(readFileSync(join(root,date,hour.toLowerCase(),"la.research.json"),"utf8"));
    for(const locale of ["en","fr"]){
      const translation=JSON.parse(readFileSync(join(root,date,hour.toLowerCase(),locale+".research.json"),"utf8"));
      const article=renderOfficeResearchReader({latin,translation,locale,mode:"parallel"});
      const nav=hours.map(h=>'<a href="'+date+'-'+h.toLowerCase()+'-'+locale+'.html">'+h+'</a>').join(" · ");
      const html='<!doctype html><html lang="'+locale+'"><head><meta charset="utf-8">'+
        '<meta name="viewport" content="width=device-width,initial-scale=1">'+
        '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; object-src &#39;none&#39;">'+
        '<title>Ad Orientem · '+hour+' · '+date+' · research only</title><style>'+css+'</style></head>'+
        '<body><nav class="aoOfficePilotNav" aria-label="Other canonical hours">'+nav+'</nav>'+article+'</body></html>';
      // The renderer and navigation use only escaped source text and trusted
      // canonical paths, no live scripts, remote resources or raw upstream HTML.
      writeFileSync(join(target,date+'-'+hour.toLowerCase()+'-'+locale+'.html'),html,"utf8");
      count++;
      byHour[hour]=(byHour[hour]??0)+1;
    }
  }
  const summary={schema:"ao.office.static-preview-audit.v1",dates,hours,locales:["en","fr"],
    pages:count,researchOnly:true,published:0,byHour};
  writeFileSync(join(target,"preview-manifest.json"),JSON.stringify(summary,null,2)+"\n");
  console.log("OFFICE_PREVIEW_SUMMARY",JSON.stringify(summary));
  if(count!==dates.length*hours.length*2)throw Error("OFFICE_PREVIEW_INCOMPLETE");
}
try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
