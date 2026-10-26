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
const jacob=proof.movements.find(m=>m.id==="HS-M05").beats.find(b=>b.id==="H15-02");
assert.deepEqual(jacob.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Genesis 32:23–33"]);
assert.deepEqual(jacob.semanticEditionAlignment.selectedReferencesByEdition["dr-challoner"],["Genesis 32:22–32"]);
assert.equal(jacob.semanticEditionAlignment.wrestlingBeginningByEdition["crampon-1923"],"Genesis 32:25");
assert.equal(jacob.semanticEditionAlignment.namingIsraelByEdition["crampon-1923"],"Genesis 32:29");
assert.ok(counters.differences.some(x=>x.id==="H15-02"&&x.edition==="crampon-1923"));
const isaiah=proof.movements.find(m=>m.id==="HS-M15").beats.find(b=>b.id==="H38-03");
assert.deepEqual(isaiah.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Isaiah 8:23","Isaiah 9:1–5"]);
assert.equal(isaiah.semanticEditionAlignment.childIsBornByEdition["dr-challoner"],"Isaiah 9:6");
assert.equal(isaiah.semanticEditionAlignment.childIsBornByEdition["crampon-1923"],"Isaiah 9:5");
assert.ok(counters.differences.some(x=>x.id==="H38-03"&&x.edition==="crampon-1923"));
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
assert.ok(html.includes('id="historiaProofBridgeFilter"'),"Research reader needs a bounded P0-only comparison mode");
assert.ok(html.includes('highPriorityBridgesOnly&&!isPriorityHistoriaBridge(beat)'),"All held passages must be filtered by the priority helper, not silently promoted");
assert.ok(html.includes('historiaProofBridgeFilter").addEventListener("change"'),"The research-bridge comparison mode must be interactive");
const priority=proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE"&&(b.researchReadthroughPriority||b.researchCuration?.sourceReadingPriority||"").startsWith("P0")).map(b=>b.id)).sort();
assert.deepEqual(priority,["HS-CF-06","HS-CF-08","HS-P3-CF-12","HS-P3-CF-15"]);
for(const m of proof.movements)for(const b of m.beats.filter(x=>x.kind==="SOURCE_BRIDGE_CANDIDATE")){
 assert.equal(b.status,"UNAPPROVED_SOURCE_COORDINATE_REFERENCE");
 assert.equal(b.publicationApproved??false,false);
}
const semanticAnchorExamples=[
 ["John",6,40,/will of my Father/i,/will of my Father/i,/volonté de mon Père/i],
 ["John",6,44,/Father.*draw him/i,/Father.*drawn him/i,/Père.*attire/i],
 ["John",11,28,/sister Mary/i,/sister Mary/i,/Marie, sa sœur/i],
 ["John",19,42,/laid Jesus/i,/placed Jesus/i,/déposèrent Jésus/i],
 ["John",20,10,/disciples.*departed/i,/disciples went away/i,/disciples.*retournèrent/i],
 ["Acts",2,36,/Lord and Christ/i,/Lord and Christ/i,/Seigneur et Christ/i],
 ["Acts",9,15,/vessel of election/i,/instrument chosen/i,/instrument que j'ai choisi/i],
 ["Acts",10,8,/sent them to Joppe/i,/sent them to Joppa/i,/envoya à Joppé/i],
 ["Acts",14,26,/door of faith/i,/door of faith/i,/porte de la foi/i],
 ["Acts",15,12,/Barnabas and Paul/i,/Barnabas and Paul/i,/Barnabé et Paul/i],
 ["Acts",28,17,/chief of the Jews/i,/leaders of the Jews/i,/principaux d'entre les Juifs/i],
 ["Revelation",4,2,/throne/i,/throne/i,/trône/i],
 ["Revelation",21,9,/seven angels/i,/seven Angels/i,/sept anges/i],
 ["Revelation",22,20,/Come, Lord Jesus/i,/Come, Lord Jesus/i,/Venez, Seigneur Jésus/i]
];
for(const [book,ch,v,...patterns] of semanticAnchorExamples){
 for(const [idx,edition] of editions.entries()){
  const text=bookWitness(book,edition).get(ch+":"+v);
  assert.ok(text,"Missing source anchor "+edition+" "+book+" "+ch+":"+v);
  assert.match(text,patterns[idx],"Source semantic anchor changed; review "+edition+" "+book+" "+ch+":"+v);
 }
}
assert.match(bookWitness("Acts","dr-challoner").get("7:59"),/lay not this sin/i);
assert.match(bookWitness("Acts","cpdv-2009").get("7:59"),/do not hold this sin/i);
assert.match(bookWitness("Acts","crampon-1923").get("7:60"),/ne leur imputez pas ce péché/i);
assert.match(bookWitness("Acts","cpdv-2009").get("9:12"),/Paul saw/i);
console.log("PASS P3 three-edition corpus: "+counters.sourceRefs+" source ranges (166 selected + 16 held), "+counters.checkedVerseSelections+" cross-edition verse displays, "+counters.books.size+" biblical books, 37 movements; edition-only Stephen and John 6 provenance preserved.");
