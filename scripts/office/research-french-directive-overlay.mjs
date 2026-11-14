#!/usr/bin/env node
/**
 * Phase J, research-only syntax experiment. The pinned French 11-02.txt file
 * contains fifteen special() directives with typographic delimiters; the
 * matching Latin/English source files use ASCII apostrophes.
 *
 * Change delimiters only, in a throwaway CI checkout, after baseline capture.
 * No missing prose is created, no Office is certified, and NEVER patch the
 * public reader's bundled content from this experiment.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";

const sha256=s=>createHash("sha256").update(s,"utf8").digest("hex");
const PATTERN=/^&special\(‘([^’\r\n]+)’, ‘Francais’\)$/gm;
export const PINNED_FRENCH_SOURCE="web/www/horas/Francais/Sancti/11-02.txt";
export const EXPECTED_DIRECTIVE_COUNT=15;

export function repairFrenchAllSoulsDirectiveSyntax(input){
  if(typeof input!=="string")throw Error("OFFICE_FRENCH_SYNTAX_SOURCE_INVALID");
  let changes=0;
  const replacements=[];
  const output=input.replace(PATTERN,(_,name)=>{
    changes++;
    if(!/^(?:Initial|Conclusio|#Martyrologium|Oratio mortuorum(?:1|2)?)$/.test(name))
      throw Error("OFFICE_FRENCH_SYNTAX_UNEXPECTED_DIRECTIVE:"+name);
    replacements.push(name);
    return "&special('"+name+"', 'Francais')";
  });
  if(changes!==EXPECTED_DIRECTIVE_COUNT)throw Error("OFFICE_FRENCH_SYNTAX_COUNT:"+changes);
  if(/^&special\(‘/m.test(output))throw Error("OFFICE_FRENCH_SYNTAX_REMAINING_TYPOGRAPHIC_CALL");
  // Reversal proves that only the identical 15 directive delimiters changed.
  const reverse=output.replace(/^&special\('([^'\r\n]+)', 'Francais'\)$/gm,
    (_,name)=>"&special(‘"+name+"’, ‘Francais’)");
  if(reverse!==input)throw Error("OFFICE_FRENCH_SYNTAX_NOT_REVERSIBLE");
  return Object.freeze({content:output,
    report:Object.freeze({
      schema:"ao.office.french-special-syntax-experiment.v1",
      upstreamSource:PINNED_FRENCH_SOURCE,
      changedDirectives:changes,replacements,
      originalSha256:sha256(input),candidateSha256:sha256(output),
      originalTextPreservedExceptDelimiterSyntax:true,
      modifiedOnlyInScratchCheckout:true,
      pinnedGitWorkingTreeDirty:true,
      verifiedTranslationCells:0,certifiedLiturgicalOffices:0,published:0,
    })});
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--upstream"||args[2]!=="--report")
    throw Error("USAGE: --upstream <scratch-checkout> --report <scratch-report>");
  const upstream=resolve(args[1]),output=resolve(args[3]);
  const file=join(upstream,PINNED_FRENCH_SOURCE);
  const input=readFileSync(file,"utf8");
  const result=repairFrenchAllSoulsDirectiveSyntax(input);
  writeFileSync(file,result.content,"utf8");
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,JSON.stringify(result.report,null,2)+"\n","utf8");
  console.log("OFFICE_FRENCH_SPECIAL_SYNTAX",JSON.stringify(result.report));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main()}catch(error){console.error(error?.stack??String(error));process.exitCode=1}
}
