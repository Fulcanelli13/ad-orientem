import test from "node:test";
import assert from "node:assert/strict";
import {repairFrenchAllSoulsDirectiveSyntax,EXPECTED_DIRECTIVE_COUNT}
  from "../scripts/office/research-french-directive-overlay.mjs";

const names=["Initial","Oratio mortuorum2","#Martyrologium","Conclusio",
"Initial","Oratio mortuorum","Conclusio","Initial","Oratio mortuorum",
"Conclusio","Initial","Oratio mortuorum","Conclusio",
"Oratio mortuorum1","Conclusio"];
test("typographic special() delimiters change, but every other source byte is preserved",()=>{
  assert.equal(names.length,EXPECTED_DIRECTIVE_COUNT);
  const input="[Rank]\nCommémoration de tous les fidèles défunts\n"+
    names.map(s=>"&special(‘"+s+"’, ‘Francais’)").join("\n")+
    "\n$v. Prière avec apostrophe typographique ‘non-macro’ et accents é è œ.\n";
  const result=repairFrenchAllSoulsDirectiveSyntax(input);
  assert.equal(result.report.changedDirectives,15);
  assert.equal(result.report.published,0);
  assert.equal(result.report.verifiedTranslationCells,0);
  assert.match(result.content,/&special\('Oratio mortuorum', 'Francais'\)/);
  assert.match(result.content,/‘non-macro’ et accents é è œ/);
  const reverted=result.content.replace(/^&special\('([^'\r\n]+)', 'Francais'\)$/gm,
    (_,name)=>"&special(‘"+name+"’, ‘Francais’)");
  assert.equal(reverted,input);
  assert.notEqual(result.report.originalSha256,result.report.candidateSha256);
});
test("candidate overlay fails closed for unexpected extra or missing directives",()=>{
  const full=names.map(s=>"&special(‘"+s+"’, ‘Francais’)").join("\n");
  assert.throws(()=>repairFrenchAllSoulsDirectiveSyntax(full.split("\n").slice(1).join("\n")),/COUNT/);
  assert.throws(()=>repairFrenchAllSoulsDirectiveSyntax(full+"\n&special(‘Danger’, ‘Francais’)"),/UNEXPECTED_DIRECTIVE/);
  assert.throws(()=>repairFrenchAllSoulsDirectiveSyntax(full.replace("‘Initial’","'Initial'")) ,/COUNT/);
});
