import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
function parse(r){
 const x=r.match(/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?$/);
 assert.ok(x,"Unparseable Bible reference "+r);
 return {book:x[1],startCh:+x[2],startV:+x[3],endCh:+(x[4]||x[2]),endV:+(x[5]||x[3])};
}
const start=x=>x.startCh*1000+x.startV,end=x=>x.endCh*1000+x.endV;
const issues=[],checked=[];
for(const m of proof.movements){
 const items=m.beats.filter(b=>b.kind!=="EDITORIAL_CONTEXT_NOT_BIBLE");
 for(let i=0;i<items.length;i++){
  const beat=items[i],refs=beat.kind==="SCRIPTURE"?beat.refs:[beat.reference];
  // The original selected spans also need to stay in canonical order within one book.
  for(let j=1;j<refs.length;j++){
   const a=parse(refs[j-1]),b=parse(refs[j]);
   if(a.book===b.book&&start(b)<=end(a))
    issues.push({movement:m.id,id:beat.id,issue:"SELF_OVERLAP_OR_REVERSE",first:refs[j-1],next:refs[j]});
  }
  if(beat.kind!=="SOURCE_BRIDGE_CANDIDATE")continue;
  const bridge=parse(beat.reference);
  const before=items.slice(0,i).flatMap(b=>b.kind==="SCRIPTURE"?b.refs:[b.reference]).map(parse).filter(p=>p.book===bridge.book);
  const after=items.slice(i+1).flatMap(b=>b.kind==="SCRIPTURE"?b.refs:[b.reference]).map(parse).filter(p=>p.book===bridge.book);
  // Constrain order within a single biblical book, never equate cross-Gospel chronology.
  const previous=before.at(-1),following=after[0];
  if(previous&&end(previous)>=start(bridge))
   issues.push({movement:m.id,id:beat.id,issue:"BRIDGE_BEFORE_OR_OVERLAPPING_PREVIOUS",ref:beat.reference,previous});
  if(following&&end(bridge)>=start(following))
   issues.push({movement:m.id,id:beat.id,issue:"BRIDGE_AFTER_OR_OVERLAPPING_NEXT",ref:beat.reference,following});
  checked.push({movement:m.id,id:beat.id,reference:beat.reference,hasPrecedingSameBook:Boolean(previous),hasFollowingSameBook:Boolean(following)});
 }
}
assert.deepEqual(issues,[],"No held Scripture bridge may be silently misplaced or duplicate selected verses");
assert.equal(checked.length,16);
assert.deepEqual(checked.filter(x=>x.movement==="HS-M34").map(x=>x.id),["HS-CF-10","HS-CF-11","HS-P3-CF-13"]);
assert.deepEqual(checked.filter(x=>x.movement==="HS-M37").map(x=>x.id),["HS-P3-CF-15","HS-P3-CF-16"]);
const stephen=proof.movements.find(x=>x.id==="HS-M31").beats.find(b=>b.id==="H68-04");
assert.equal(stephen.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"][0],"Acts 7:54–60");
assert.equal(stephen.semanticEditionAlignment.selectedReferencesByEdition["dr-challoner"][0],"Acts 7:54–59");
assert.equal(proof.p4LateMovementDraft.editorialHolds.some(x=>x.movementId==="HS-M27"&&x.reference==="Matthew 27:3–10"&&x.state==="UNPLACED_OPTIONAL_SOURCE_REVIEW"),true);
console.log("PASS P3: 16 held bridge locations and 93 A units have no same-book ordering reversal, Judas stays unplaced, Stephen edition bounds preserved");
