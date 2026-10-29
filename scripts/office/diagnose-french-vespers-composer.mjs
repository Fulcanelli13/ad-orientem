#!/usr/bin/env node
/**
 * Read-only research outcome; the pinned Perl source is temporarily instrumented
 * in scratch and restored byte-for-byte in finally. No deployment.
 */
import {readFileSync,writeFileSync,unlinkSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
import {spawnSync,execFileSync} from "node:child_process";
import {makeGeneratorRequest,DIVINUM_OFFICIUM_OFFICE_PIN} from "../../src/office/generator-probe-contract.js";
const args=process.argv.slice(2);
if(args.length!==4||args[0]!=="--upstream"||args[2]!=="--report")
  throw Error("USAGE: --upstream /path --report /path");
const upstream=resolve(args[1]),report=resolve(args[3]);
const target=join(upstream,"web/cgi-bin/horas/specials/orationes.pl");
const cwd=join(upstream,"standalone/tools/epubgen2"),entry=join(cwd,"EofficiumXhtml.pl");
const pinned=execFileSync("git",["rev-parse","HEAD"],{cwd:upstream,encoding:"utf8"}).trim();
if(pinned!==DIVINUM_OFFICIUM_OFFICE_PIN)throw Error("OFFICE_DIAGNOSTIC_PIN_MISMATCH");
const original=readFileSync(target);
const digest=v=>createHash("sha256").update(v).digest("hex");
const before=digest(original),source=original.toString("utf8");
const selection="        $c = getcommemoratio($cwinner, $cvespera, $lang);";
const anchor="  our ($rule, $hora, $vespera, $version, $rank, $winner, @dayname, $month, $day, %winner, %winner2);";
if(source.split(selection).length!==2||source.split(anchor).length!==2)
  throw Error("OFFICE_DIAGNOSTIC_ANCHOR_CHANGED");
const extraResult=[
"        if ($hora eq 'Vespera') {",
"          open my $ao, '>>', $ENV{'AO_VESPERS_TRACE_FILE'} or die $!;",
"          print {$ao} 'AO_COMM_RESULT|lang=' . $lang . '|cwinner=' . $cwinner . '|cvespera=' . $cvespera . '|chars=' . length($c // '') . \"\\n\";",
"          close $ao;",
"        }"
].join("\n");
const extraSource=[
"  if ($hora eq 'Vespera' && $wday =~ /Pent23|111\\-0/) {",
"    open my $ao, '>>', $ENV{'AO_VESPERS_TRACE_FILE'} or die $!;",
"    print {$ao} 'AO_COMM_SOURCE|lang=' . $lang . '|day=' . $wday . '|index=' . $ind .",
"      '|rank=' . substr(($w{Rank}//''),0,70) .",
"      '|hasOratio=' . (length($w{Oratio}//'')>0?1:0) .",
"      '|hasAnt3=' . (length($w{'Ant 3'}//'')>0?1:0) . \"\\n\";",
"    close $ao;",
"  }"
].join("\n");
const instrumented=source.replace(selection,selection+"\n"+extraResult)
  .replace(anchor,anchor+"\n"+extraSource);
const env={...process.env,TZ:"UTC"};delete env.REQUEST_METHOD;delete env.QUERY_STRING;
const runs=[],trace=report+".trace";
env.AO_VESPERS_TRACE_FILE=trace;
try{
  writeFileSync(target,instrumented,"utf8");
  for(const language of ["la","en","fr"]){
    writeFileSync(trace,"","utf8");
    const request=makeGeneratorRequest({date:"2026-11-01",hour:"VESPERS",language});
    const proc=spawnSync("perl",[entry,request.query],{
      cwd,encoding:"utf8",timeout:120000,maxBuffer:24*1024*1024,env,
    });
    if(proc.error||proc.status!==0)throw Error("OFFICE_DIAGNOSTIC_ENGINE_FAILED:"+language+
      ":"+(proc.error?.message??proc.status));
    const raw=String(proc.stdout??""),log=String(proc.stderr??"");
    const traceLines=readFileSync(trace,"utf8").split("\n").filter(x=>x.startsWith("AO_COMM_"));
    runs.push({
      language,
      sourceDiagnostics:[...traceLines,...log.split("\n").filter(x=>x.startsWith("AO_COMM_"))].slice(0,18),
      rawSourceSemantics:{
        hasSundayAntiphon:/at (?:jesus|iesus) conv[eé]rsus|j[eé]sus,? se retournant|but jesus turned him about/i.test(raw),
        hasSundayCollect:/abs[oó]lve|pardonnez, nous vous en supplions|absolve thy people/i.test(raw),
        hasSundayCommemorationHeading:/Commemoratio Dominica XXIII|Commemoration of.*Sunday|Comm[eé]moraison du dimanche/i.test(raw)
      },
      rawXhtmlSha256:digest(raw)
    });
  }
} finally {
  writeFileSync(target,original);
  try{unlinkSync(trace)}catch(e){if(e.code!=="ENOENT")throw e}
}
if(digest(readFileSync(target))!==before)throw Error("OFFICE_DIAGNOSTIC_RESTORE_FAILED");
const changed=execFileSync("git",["status","--porcelain","--","web/cgi-bin/horas/specials/orationes.pl"],{cwd:upstream,encoding:"utf8"}).trim();
if(changed)throw Error("OFFICE_DIAGNOSTIC_UPSTREAM_DIRTY");
const result={
 schema:"ao.office.french-vespers-composer-diagnostic.v1",
 sourceRevision:pinned,date:"2026-11-01",hour:"VESPERS",
 sourceRestored:true,sourceUnchanged:true,runs,
 originalBreviaryVerified:false,translationPublicationAuthorized:false,published:0
};
writeFileSync(report,JSON.stringify(result,null,2)+"\n","utf8");
console.log("OFFICE_FR_VESPERS_COMPOSER_DIAGNOSTIC",JSON.stringify(result));
