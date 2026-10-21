import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const witnesses=new Map();
function bookWitness(book,edition){
 const key=edition+"|"+book;
 if(!witnesses.has(key)){
  const data=read("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(data.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(data.editionId,edition);
  const map=new Map();
  for(const [c,v,t] of data.verses){
   assert.ok(!map.has(c+":"+v),"Duplicate "+edition+" "+book+" "+c+":"+v);
   assert.ok(t.trim());
   map.set(c+":"+v,t);
  }
  witnesses.set(key,map);
 }
 return witnesses.get(key);
}
function parse(ref){
 const x=ref.match(/^((?:[1-3])?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/);
 assert.ok(x,"Invalid canonical source coordinates "+ref);
 return {book:x[1],ch:+x[2],v:+x[3],end:+(x[4]||x[3])};
}
function inspect(ref,edition){
 const a=parse(ref);
 const map=bookWitness(a.book,edition),missing=[];
 let n=0;
 for(let i=a.v;i<=a.end;i++){
  if(map.has(a.ch+":"+i))n++;
  else missing.push(a.book+" "+a.ch+":"+i);
 }
 return {requested:a.end-a.v+1,present:n,missing};
}
assert.equal(proof.movements.length,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(proof.totals.sourceBridgeCandidates,16);
const counters={sourceRefs:0,selectedRefs:0,heldRefs:0,checkedVerseSelections:0,books:new Set(),differences:[]};
const errors=[];
for(const m of proof.movements){
 for(const b of m.beats){
  if(!["SCRIPTURE","SOURCE_BRIDGE_CANDIDATE"].includes(b.kind))continue;
  const refs=b.kind==="SCRIPTURE"?b.refs:[b.reference];
  for(const edition of editions){
   const selected=b.kind==="SCRIPTURE"?(b.semanticEditionAlignment?.selectedReferencesByEdition?.[edition]||refs):refs;
   const hasExplicitOverride=Boolean(b.semanticEditionAlignment?.selectedReferencesByEdition?.[edition]);
   assert.equal(b.publicationApproved??false,false);
   assert.ok(selected.length);
   for(const r of selected){
    const a=parse(r);counters.books.add(a.book);
    const range=inspect(r,edition);
    counters.checkedVerseSelections+=range.present;
    if(range.present!==range.requested)errors.push({movement:m.id,id:b.id,edition,reference:r,missing:range.missing});
   }
   if(hasExplicitOverride)counters.differences.push({movement:m.id,id:b.id,edition,sourceSelectedRefs:refs,editionSelectedRefs:selected});
  }
  counters.sourceRefs+=refs.length;
  if(b.kind==="SCRIPTURE")counters.selectedRefs+=refs.length;
  else counters.heldRefs+=refs.length;
 }
}
assert.equal(counters.heldRefs,16);
assert.equal(counters.selectedRefs,166);
assert.equal(counters.sourceRefs,182);
assert.equal(counters.books.size,19);
assert.equal(errors.length,0,"Unresolved source verses: "+JSON.stringify(errors.slice(0,25)));
const steve=proof.movements.find(m=>m.id==="HS-M31").beats.find(b=>b.id==="H68-04");
assert.deepEqual(steve.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Acts 7:54–60"]);
assert.deepEqual(steve.refs,["Acts 7:54–59"]);
assert.equal(bookWitness("Acts","dr-challoner").has("7:60"),false);
assert.equal(bookWitness("Acts","crampon-1923").has("7:60"),true);
assert.equal(counters.differences.filter(x=>x.id==="H68-04").length,3);
const jn=proof.movements.find(m=>m.id==="HS-M22").beats.find(b=>b.id==="H56-02").semanticEditionAlignment;
assert.deepEqual(jn.synagogueSentenceVerse,{"dr-challoner":"John 6:60","cpdv-2009":"John 6:60","crampon-1923":"John 6:59"});
assert.equal(jn.noBlindNumericAlignment,true);
for(const snippet of [
 '<option value="crampon-1923">','historiaEditionName','selectedReferencesByEdition?.[edition]',
 'SAME_CLOSING_SEMANTIC_DIFFERENT_VERSE_END','CAPERNAUM_LOCATION_VERSE_SHIFT',
 'Unapproved source-bridge candidate','never approved'
])assert.ok(html.toLowerCase().includes(snippet.toLowerCase()),"Missing evidence-based proof reader guard "+snippet);
assert.ok(!html.includes('"cpdv-2009"?"CPDV":"Douay–Rheims"'),"French witness must never be mislabelled Douay");
console.log("PASS P3 three-edition corpus: "+counters.sourceRefs+" source ranges (166 selected + 16 held), "+counters.checkedVerseSelections+" cross-edition verse displays, "+counters.books.size+" biblical books, 37 movements; edition-only Stephen and John 6 provenance preserved.");
