import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectHistoriaReadingSeams,explicitHistoriaBurialHold} from "../src/scripture/historia-reading-seams.js";
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
const jacob=proof.movements.find(m=>m.id==="HS-M05").beats.find(b=>b.id==="H15-02");
assert.deepEqual(jacob.refs,["Genesis 32:22–32"]);
assert.deepEqual(jacob.semanticEditionAlignment.selectedReferencesByEdition["dr-challoner"],["Genesis 32:22–32"]);
assert.deepEqual(jacob.semanticEditionAlignment.selectedReferencesByEdition["cpdv-2009"],["Genesis 32:22–32"]);
assert.deepEqual(jacob.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Genesis 32:23–33"]);
assert.equal(jacob.semanticEditionAlignment.noBlindNumericAlignment,true);
const verseByEdition=(edition,v)=>witness(edition,"Genesis").get("32:"+v);
assert.match(verseByEdition("dr-challoner",24),/wrestled with him/i);
assert.match(verseByEdition("crampon-1923",25),/lutta avec lui/i);
assert.match(verseByEdition("dr-challoner",28),/Israel/i);
assert.match(verseByEdition("crampon-1923",29),/Israël/i);
assert.match(verseByEdition("dr-challoner",32),/sinew/i);
assert.match(verseByEdition("crampon-1923",33),/nerf/i);
const cloud=proof.movements.find(m=>m.id==="HS-M10").beats.find(b=>b.id==="H23-02").editorialReadingCandidate;
assert.deepEqual(cloud.sourceReferencesByEdition["dr-challoner"],["Exodus 40:16–21","Exodus 40:32–36"]);
assert.deepEqual(cloud.sourceReferencesByEdition["cpdv-2009"],["Exodus 40:16–21","Exodus 40:32–36"]);
assert.deepEqual(cloud.sourceReferencesByEdition["crampon-1923"],["Exodus 40:16–21","Exodus 40:34–38"]);
assert.equal(cloud.publicationApproved,false);
for(const edition of editions){
 const source=witness(edition,"Exodus");
 for(const r of cloud.sourceReferencesByEdition[edition]){
  const q=passage(r);
  for(let v=q.startVerse;v<=q.endVerse;v++)assert.ok(source.get(q.startChapter+":"+v)?.trim());
 }
}
assert.match(witness("dr-challoner","Exodus").get("40:32"),/cloud covered/i);
assert.match(witness("crampon-1923","Exodus").get("40:34"),/nuée couvrit/i);
const isaiah=proof.movements.find(m=>m.id==="HS-M15").beats.find(b=>b.id==="H38-03");
assert.deepEqual(isaiah.refs,["Isaiah 9:1–6"]);
assert.deepEqual(isaiah.semanticEditionAlignment.selectedReferencesByEdition["dr-challoner"],["Isaiah 9:1–6"]);
assert.deepEqual(isaiah.semanticEditionAlignment.selectedReferencesByEdition["cpdv-2009"],["Isaiah 9:1–6"]);
assert.deepEqual(isaiah.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Isaiah 8:23","Isaiah 9:1–5"]);
assert.equal(isaiah.semanticEditionAlignment.noBlindNumericAlignment,true);
for(const edition of editions){
 const source=witness(edition,"Isaiah");
 const refs=isaiah.semanticEditionAlignment.selectedReferencesByEdition[edition];
 for(const ref of refs){
  const p=passage(ref);
  for(let v=p.startVerse;v<=p.endVerse;v++)assert.ok(source.get(p.startChapter+":"+v)?.trim());
 }
}
assert.match(witness("dr-challoner","Isaiah").get("9:1"),/Zabulon/i);
assert.match(witness("crampon-1923","Isaiah").get("8:23"),/Zabulon/i);
assert.match(witness("dr-challoner","Isaiah").get("9:6"),/CHILD IS BORN/i);
assert.match(witness("crampon-1923","Isaiah").get("9:5"),/enfant nous est né/i);
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
const seams=inspectHistoriaReadingSeams(proof.movements);
assert.equal(seams.length,36,"Continuous reading has 36 movement transitions");
const seam=(a,b)=>seams.find(x=>x.fromMovementId===a&&x.toMovementId===b);
assert.equal(seam("HS-M33","HS-M34").omittedChapterSpan,"Acts 16–27");
assert.equal(seam("HS-M35","HS-M36").omittedChapterSpan,"Revelation 6–18");
assert.equal(seam("HS-M31","HS-M32").omittedChapterSpan,"Acts 8");
assert.equal(explicitHistoriaBurialHold(seam("HS-M28","HS-M29")),true);
assert.equal(seam("HS-M28","HS-M29").nextSelectedReference,"John 20:1–3");
assert.equal(seams.filter(x=>x.sameWitnessBook).length,17);
assert.equal(seams.filter(x=>!x.sameWitnessBook).length,19);
for(const edge of seams){
 assert.ok(edge.previousSelectedReference);
 assert.ok(edge.nextSelectedReference);
 assert.equal(edge.unapprovedContextRequired,false,"Cross-movement source regression: "+edge.fromMovementId);
}
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.ok(html.includes('host.append(note);continue;'),"Editorial context may not erase source omission tracking");
assert.ok(html.includes('!isPriorityHistoriaBridge(beat))))continue;'),"Hiding held candidates must not conceal canonical omissions");
assert.ok(!html.includes('host.append(note);previous=null;continue;'),"Unattributed gap through editorial context");
assert.ok(html.includes('line.lang=edition==="crampon-1923"?"fr":"en";'),"Accurate screen-reader language for French Scripture");
assert.ok(html.includes("Scripture selections are unapproved research. Dashed sections show optional"),"One source status disclaimer per movement");
assert.ok(!html.includes("Selected Scripture · research proof · not publication-approved"),"Avoid repeated warnings on all 93 Scripture beats");
assert.ok(html.includes("explicitHistoriaBurialHold(seam)"),"A held burial seam must not look like accepted Scripture");
assert.ok(html.includes("Unselected intervening biblical chapters"),"Large canon gaps must be explicit");
console.log("PASS Historia 37-movement 3-witness range preflight: "+JSON.stringify(metrics)+"; editorial publication blocked");
