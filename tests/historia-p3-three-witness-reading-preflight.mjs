import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const editions=["cpdv-2009","dr-challoner","crampon-1923"];
const bookSets={};
const issues=[];
const movements=new Set();
const unique={};
for(const e of editions)unique[e]={selected:new Set(),bridges:new Set(),sourceSpans:0,bridgeSpans:0};
function passage(ref){
 const match=ref.match(/^([1-3]?[A-Za-z]+)\s+(\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?$/);
 assert.ok(match,"Unparseable Catholic source ref "+ref);
 return {book:match[1],startChapter:+match[2],startVerse:+match[3],endChapter:+(match[4]||match[2]),endVerse:+(match[5]||match[3])};
}
function witness(edition,book){
 const key=edition+":"+book;
 if(!bookSets[key]){
  const input=read("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(input.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(input.editionId,edition);
  assert.equal(input.book,book);
  bookSets[key]=new Map(input.verses.map(v=>[v[0]+":"+v[1],v[2]]));
 }
 return bookSets[key];
}
function selectedVerses(edition,ref,owner,kind){
 const p=passage(ref),index=witness(edition,p.book);
 assert.ok(p.endChapter>=p.startChapter,"Backwards Scripture reference "+ref);
 const result=[];
 for(let c=p.startChapter;c<=p.endChapter;c++){
  const start=c===p.startChapter?p.startVerse:1;
  const end=c===p.endChapter?p.endVerse:Math.max(...[...index.keys()].filter(k=>k.startsWith(c+":")).map(k=>+k.split(":")[1]));
  assert.ok(Number.isFinite(end),"Unresolvable biblical chapter "+edition+" "+ref);
  for(let v=start;v<=end;v++){
   const source=index.get(c+":"+v);
   assert.ok(source,"Missing "+edition+" "+ref+" verse "+c+":"+v+" at "+owner);
   assert.ok(source.trim(),"Blank "+edition+" "+ref+" "+c+":"+v);
   result.push(p.book+":"+c+":"+v);
  }
 }
 assert.ok(result.length,"Empty Scripture passage "+edition+" "+ref);
 for(const id of result)unique[edition][kind].add(id);
 unique[edition][kind==="selected"?"sourceSpans":"bridgeSpans"]++;
 return result;
}
assert.equal(proof.movements.length,37);
for(const movement of proof.movements){
 movements.add(movement.id);
 for(const beat of movement.beats){
  if(beat.kind==="EDITORIAL_CONTEXT_NOT_BIBLE")continue;
  assert.equal(beat.publicationApproved??false,false);
  for(const ed of editions){
   const refs=beat.kind==="SCRIPTURE"?(beat.semanticEditionAlignment?.selectedReferencesByEdition?.[ed]||beat.refs):[beat.reference];
   for(const ref of refs)selectedVerses(ed,ref,movement.id+"/"+beat.id,beat.kind==="SCRIPTURE"?"selected":"bridges");
  }
 }
}
assert.equal(movements.size,37);
for(const ed of editions){
 assert.ok(unique[ed].sourceSpans>140);
 assert.equal(unique[ed].bridgeSpans,16);
 assert.ok(unique[ed].selected.size>900);
}
const stephen=proof.movements.find(m=>m.id==="HS-M31").beats.find(b=>b.id==="H68-04");
assert.deepEqual(stephen.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Acts 7:54–60"]);
assert.deepEqual(stephen.semanticEditionAlignment.selectedReferencesByEdition["dr-challoner"],["Acts 7:54–59"]);
assert.equal(witness("dr-challoner","Acts").has("7:60"),false);
assert.equal(witness("cpdv-2009","Acts").has("7:60"),false);
assert.equal(witness("crampon-1923","Acts").has("7:60"),true);
const bread=proof.movements.find(m=>m.id==="HS-M22").beats.find(b=>b.id==="H56-02");
assert.equal(bread.semanticEditionAlignment.synagogueSentenceVerse["cpdv-2009"],"John 6:60");
assert.equal(bread.semanticEditionAlignment.synagogueSentenceVerse["crampon-1923"],"John 6:59");
for(const ed of editions)assert.equal(proof.totals.sourceBridgeCandidates,unique[ed].bridgeSpans);
const metrics=Object.fromEntries(editions.map(e=>[e,{
 selectedUniqueVerses:unique[e].selected.size,bridgeUniqueVerses:unique[e].bridges.size,
 selectedSourceSpans:unique[e].sourceSpans,heldSourceSpans:unique[e].bridgeSpans
}]));
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.ok(html.includes('host.append(note);continue;'),"Editorial context may not erase source omission tracking");
assert.ok(html.includes('!isPriorityHistoriaBridge(beat))))continue;'),"Hiding held candidates must not conceal canonical omissions");
assert.ok(!html.includes('host.append(note);previous=null;continue;'),"Unattributed gap through editorial context");
assert.ok(html.includes('line.lang=edition==="crampon-1923"?"fr":"en";'),"Accurate screen-reader language for French Scripture");
assert.ok(html.includes("Selected Scripture · research proof · not publication-approved"),"Selection still research, not accepted");
console.log("PASS Historia 37-movement 3-witness range preflight: "+JSON.stringify(metrics)+"; editorial publication blocked");
