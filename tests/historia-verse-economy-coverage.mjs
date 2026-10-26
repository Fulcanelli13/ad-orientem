import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p)=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const report=read("data/research/historia-salutis-p3-verse-economy-and-coverage-pilot-20261021.v1.json");
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const groups=read("data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json");
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
assert.deepEqual(report.editions,editions);
assert.equal(report.economyComparisons.length,5);
assert.equal(report.missingCoverage.length,8);
assert.equal(report.summary.nearTermEconomyCases,3);
assert.equal(report.summary.heldCuts,2);
assert.equal(report.summary.selectedNewPassages,0);
assert.equal(groups.readingChapters.length,54);
assert.equal(report.policy.noAutomaticVerseCuts,true);
assert.equal(report.policy.parallelsOutOfScope,true);
assert.equal(report.acceptance.publicationApproval,false);
const readBook=new Map();
function verses(ref,edition){
 const m=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:–(\d+))?$/.exec(ref);
 assert.ok(m,"Bad source range "+ref);
 const [book,chapter,start,end]=[m[1],+m[2],+m[3],+(m[4]||m[3])];
 const key=edition+":"+book;
 if(!readBook.has(key)){
  const f=read("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(f.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  readBook.set(key,new Map(f.verses.map(([c,v,t])=>[c+":"+v,t])));
 }
 const dictionary=readBook.get(key);
 return Array.from({length:end-start+1},(_,i)=>{
  const v=start+i,t=dictionary.get(chapter+":"+v);
  assert.ok(t,"Unattested source verse "+ref+" "+v+" "+edition);
  return {key:book+" "+chapter+":"+v,text:t};
 });
}
function get(refs,edition){return refs.flatMap(ref=>verses(ref,edition));}
const wordCount=vs=>vs.reduce((n,v)=>n+v.text.trim().split(/\s+/).length,0);
const originalP3=new Set(proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="SCRIPTURE").flatMap(b=>b.refs)));
const chosen=new Set(),held=new Set();
for(const c of report.economyComparisons){
 assert.equal(c.appliedToReader,false);
 assert.equal(c.publicationApproved,false);
 assert.ok(originalP3.has(c.original[0]),"Cannot economize an unsourced P3 selection "+c.original);
 assert.ok(groups.readingChapters.some(g=>g.id===c.owner&&g.originalChapterIds.includes(c.outline)));
 if(c.status==="HOLD_NOT_RECOMMENDED")held.add(c.original[0]);
 else chosen.add(c.original[0]);
 assert.equal(c.comparisons.length,3);
 for(const edition of editions){
  const old=get(c.original,edition),selected=get(c.proposal,edition);
  const sourceIndex=new Map(old.map((v,i)=>[v.key,i]));
  let prev=-1;
  for(const v of selected){
   const pos=sourceIndex.get(v.key);
   assert.ok(pos!==undefined&&pos>prev&&old[pos].text===v.text,"Subselection must retain exact consecutive verse text");
   prev=pos;
  }
  assert.ok(selected.length<old.length,"No economy achieved "+c.title);
  const audit=c.comparisons.find(x=>x.edition===edition);
  assert.ok(audit);
  assert.equal(audit.originalVerseCount,old.length);
  assert.equal(audit.proposedVerseCount,selected.length);
  assert.equal(audit.originalWordCount,wordCount(old));
  assert.equal(audit.proposedWordCount,wordCount(selected));
  assert.equal(audit.savedWords,wordCount(old)-wordCount(selected));
  assert.equal(audit.sourceVerified,true);
 }
}
assert.equal(chosen.size,3);
assert.equal(held.size,2);
assert.deepEqual(report.missingCoverage.map(x=>x.h),["H06","H27","H42","H45","H50","H55","H61","H74"]);
for(const x of report.missingCoverage){
 assert.ok(groups.readingChapters.some(g=>g.id===x.r&&g.originalChapterIds.includes(x.h)));
 assert.equal(x.insertedInReader,false);
 assert.equal(x.publicationApproved,false);
 assert.equal(x.sourceCosts.length,3);
 for(const edition of editions){
  const source=get(x.refs,edition);
  const data=x.sourceCosts.find(c=>c.edition===edition);
  assert.equal(data.verses,source.length);
  assert.equal(data.words,wordCount(source));
  assert.equal(data.sourceVerified,true);
 }
}
const gospelGenealogies=report.missingCoverage.find(x=>x.h==="H45");
assert.equal(gospelGenealogies.status,"SEPARATE_GENEALOGY_NAVIGATION_NOT_MAIN_NARRATIVE");
assert.deepEqual(gospelGenealogies.refs,["Matthew 1:1–17","Luke 3:23–38"]);
const essential=new Set(["H06","H50","H61","H74"]);
assert.deepEqual(new Set(report.missingCoverage.filter(x=>/^(ESSENTIAL|HIGH_PRIORITY)/.test(x.status)).map(x=>x.h)),essential);
const saving=report.economyComparisons.filter(x=>x.status!=="HOLD_NOT_RECOMMENDED").reduce((n,c)=>n+c.comparisons.find(x=>x.edition==="dr-challoner").savedWords,0);
assert.equal(saving,151);
console.log("PASS Historia verse economy: 5 checked comparisons (3 provisional and 2 held), 151 tentative Douay words, eight reviewed source gaps, seven translated witness books as needed; no canonical selection or publication change");
