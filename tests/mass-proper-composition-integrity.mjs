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
const sameSpirit=expand("$Per Dominum eiusdem");
const sameSpiritVariant=expand("$Per Dominum ejusdem");
const punctuation=expand("$Per Dominum.");
const punctuationQui=expand("$Qui tecum.");
assert.deepEqual(sameSpirit,sameSpiritVariant,"Latin transliteration of eiusdem changed the prayer ending");
assert.deepEqual(punctuation,endings.perDominum,"terminal punctuation changed its prayer text");
assert.deepEqual(punctuationQui,endings.quiTecum,"terminal punctuation changed the Qui tecum ending");
assert.match(sameSpirit.la,/unitáte ejúsdem Spíritus Sancti/);
assert.match(sameSpirit.en,/unity of the same Holy Ghost/);
assert.match(sameSpirit.fr,/unité du même Saint-Esprit/);
assert.notEqual(sameSpirit.la,endings.perDominum.la,"Pentecost conclusion collapsed into ordinary Per Dominum");
assert.equal(cleanLines(["$Per Dominum never-guessed"],"la"),"$Per Dominum never-guessed",
  "unknown source-specific ending was silently invented");
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
assert.deepEqual(JSON.parse(JSON.stringify(p.languageCoverage.en)),{expected:5,available:5,missing:[],complete:true});
assert.deepEqual(JSON.parse(JSON.stringify(p.languageCoverage.fr)),{expected:5,available:5,missing:[],complete:true});
p.collects.push(a("Commemoratio", "Commemoration",""));
refresh(p,diagnostic);
assert.equal(p.languageCoverage.fr.expected,6,"Commemoration not included after composition");
assert.equal(p.languageCoverage.fr.complete,false);
assert.deepEqual(Array.from(p.languageCoverage.fr.missing),["Collect 2"]);
assert.equal(p.languageCoverage.en.complete,true);
p.secrets.push(a("Secreta N.", "$Qui tecum", "N."));
refresh(p,diagnostic);
assert.equal(p.languageCoverage.en.complete,false,"Unresolved macro counted as translated");
assert.ok(p.composedSourceIntegrity.unresolved.some(x=>x.section==="Secret 2"&&x.marker==="$Qui tecum"));
assert.ok(p.composedSourceIntegrity.unresolved.some(x=>x.marker==="N."));
assert.ok(diagnostic.warnings.some(x=>x.includes("unresolved text/source placeholders")));
// Exercise the *production* donor alias, not a shadow string replacement.
// Every donor below has an original [Oratio] (ad missam) heading which
// parseSections intentionally stores under canonical key "Oratio".
const massAlias=between("// The historical English Commons label their Mass-only Collect",
  "function parseReference(line, defaultSection) {");
const canonicalSection=runInNewContext(massAlias+"\\ncanonicalReferencedProperSection;");
const parsed={map:new Map([["Oratio",["verified mass collect"]]])};
for(const donor of ["Commune/C2","Commune/C5","Commune/C5b",
  "Commune/C6-1","Commune/C6b","Commune/C11"]){
  assert.equal(canonicalSection(donor,"Oratio ad missam",parsed),"Oratio",
    "1962 named-Mass Collect was dropped for "+donor);
}
assert.equal(canonicalSection("Commune/C3","Oratio ad missam",parsed),"Oratio ad missam",
  "unverified donor was silently generalized");
assert.equal(canonicalSection("Commune/C11","Postcommunio ad missam",parsed),
  "Postcommunio ad missam","non-Collect alias was fabricated");
assert.equal(canonicalSection("Commune/C5","Oratio ad missam",
  {map:new Map([["Oratio ad missam",["direct original"]],["Oratio",["other"]]])}),
  "Oratio ad missam","original explicit section was overwritten by fallback");
console.log("PASS actual Proper conclusion and post-commemoration coverage logic (EN/FR/LA)");
