import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

// Exercise production-bundle functions themselves: do not maintain a shadow
// prayer-ending dictionary or a second proper-composition implementation.
const source=readFileSync("ao-boot-4ef16d2b0e26d68c.js","utf8");
const between=(a,b)=>{
  const start=source.indexOf(a),end=source.indexOf(b,start+a.length);
  assert.ok(start>=0&&end>start,"Production source block missing: "+a);
  return source.slice(start,end);
};
const formulas=between("const PER_DOM = {","function sectionHeading(line)");
const clean=between("function cleanLines(lines, language) {","function textFrom(sources, section)");
const cleanLines=runInNewContext(formulas+"\n"+clean+"\ncleanLines;");
const expand=macro=>Object.fromEntries(["la","en","fr"].map(language=>[language,cleanLines([macro],language)]));
const endings={
  perDominum:expand("$Per Dominum"),
  perDominumLower:expand("$per Dominum"),
  perEundem:expand("$Per eundem"),
  quiTecum:expand("$Qui tecum"),
  quiVivis:expand("$Qui vivis"),
};
assert.deepEqual(endings.perDominum,endings.perDominumLower,"Case alias not normalized");
assert.match(endings.perDominum.la,/^Per Dóminum nostrum/);
assert.match(endings.perEundem.la,/^Per eúndem Dóminum/);
assert.match(endings.quiTecum.la,/^Qui tecum vivit/);
assert.match(endings.quiVivis.la,/^Qui vivis et regnas cum Deo Patre/);
for(const [key,lang] of Object.entries(endings))for(const [locale,text] of Object.entries(lang)){
  assert.ok(text.length>70,key+"/"+locale+" missing full conclusion");
  assert.ok(!text.includes("$"),key+"/"+locale+" still contains source macro");
}
assert.notEqual(endings.perDominum.la,endings.perEundem.la);
assert.notEqual(endings.quiVivis.la,endings.quiTecum.la);
assert.equal(cleanLines(["$Unknown unresolved"],"la"),"$Unknown unresolved",
  "Unverified source macro was silently replaced by a fabricated ending");

const composition=between("function refreshComposedProperIntegrity(proper, diagnostic) {","class DayResolver {");
const refresh=runInNewContext(composition+"\nrefreshComposedProperIntegrity;");
const a=(lat,en,fr)=>({lat,en,fr});
const p={
  introit:a("Introitus","Introit","Introït"),
  collects:[a("Oratio","Collect","Collecte")],
  secrets:[a("Secreta","Secret","Secrète")],
  postcommunions:[a("Postcommunio","Postcommunion","Postcommunion")],
  preface:a("Praefatio","Preface","Préface"),
};
const diagnostic={warnings:[]};
refresh(p,diagnostic);
assert.deepEqual(p.languageCoverage.en,{expected:5,available:5,missing:[],complete:true});
assert.deepEqual(p.languageCoverage.fr,{expected:5,available:5,missing:[],complete:true});
p.collects.push(a("Commemoratio", "Commemoration",""));
refresh(p,diagnostic);
assert.equal(p.languageCoverage.fr.expected,6,"Commemoration not included after composition");
assert.equal(p.languageCoverage.fr.complete,false);
assert.deepEqual(p.languageCoverage.fr.missing,["Collect 2"]);
assert.equal(p.languageCoverage.en.complete,true);
p.secrets.push(a("Secreta N.", "$Qui tecum", "N."));
refresh(p,diagnostic);
assert.equal(p.languageCoverage.en.complete,false,"Unresolved macro counted as translated");
assert.ok(p.composedSourceIntegrity.unresolved.some(x=>x.section==="Secret 2"&&x.marker==="$Qui tecum"));
assert.ok(p.composedSourceIntegrity.unresolved.some(x=>x.marker==="N."));
assert.ok(diagnostic.warnings.some(x=>x.includes("unresolved text/source placeholders")));
console.log("PASS actual Proper conclusion and post-commemoration coverage logic (EN/FR/LA)");
