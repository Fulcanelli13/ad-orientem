import assert from "node:assert/strict";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../../src/pray/novena-corpus-v4.js";

const slots=JSON.parse(readFileSync("data/calendar/sacred-art-prayer-slots.v1.json","utf8"));
const artworks=JSON.parse(readFileSync("data/calendar/sacred-art-candidates.v1.json","utf8")).artworks;
const artSubjects=(a)=>a.tags?.iconography||[];
const isOriginal=(a)=>/^[a-f0-9]{64}$/.test(a.acquisition?.originalSha256||"")&&a.review?.image==="ACQUIRED_REVIEW_ARCHIVE_ONLY";
const test=(keys,requested,type)=>{
 assert.equal(new Set(keys).size,keys.length,"Duplicate canonical "+type);
 assert.deepEqual(Object.keys(requested).sort(),[...keys].sort(),"Artwork slot source IDs differ from authoritative "+type);
 return keys.map(id=>{
  const entry=requested[id],primary=entry.primarySubjects,related=entry.relatedSymbolicSubjects;
  assert.ok(Array.isArray(primary)&&primary.length,"Missing direct subjects: "+id);
  assert.ok(Array.isArray(related)&&entry.moduleRoute,"Missing symbolic/context routes: "+id);
  const exact=artworks.filter(a=>isOriginal(a)&&primary.some(x=>artSubjects(a).includes(x)));
  const symbolic=artworks.filter(a=>isOriginal(a)&&related.some(x=>artSubjects(a).includes(x))&&!exact.includes(a));
  return {id,type,primarySubjects:primary,exactAcquired:exact.length,
     symbolicFallbackAcquired:symbolic.length,exactArtworkIds:exact.map(a=>a.id),
     note:exact.length?"PRELIMINARY_SUBJECT_MATCH":"SOURCE_SUBJECT_GAP"};
 });
};
const p=test(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers),slots.prayerSlots,"prayer");
const n=test(NOVENA_CORPUS_V4_IDS,slots.novenaSlots,"novena");
const report={
 schema:"AO_SACRED_ART_PRAYER_SLOT_COVERAGE_V1",
 warning:"Counts are preliminary iconographic matches to original paintings only; never imply approval, individual 1962 date, source authenticity or app publication.",
 summary:{canonicalPrayers:p.length,canonicalNovenas:n.length,
  prayersWithDirectSource:p.filter(x=>x.exactAcquired).length,
  novenasWithDirectSource:n.filter(x=>x.exactAcquired).length,
  prayersWithSymbolicFallback:p.filter(x=>x.symbolicFallbackAcquired).length,
  novenasWithSymbolicFallback:n.filter(x=>x.symbolicFallbackAcquired).length,
  prayerExactGaps:p.filter(x=>!x.exactAcquired).map(x=>x.id),
  novenaExactGaps:n.filter(x=>!x.exactAcquired).map(x=>x.id)},
 slots:{prayers:p,novenas:n}
};
mkdirSync("artifacts/sacred-art-coverage",{recursive:true});
writeFileSync("artifacts/sacred-art-coverage/prayer-slot-coverage.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report.summary,null,2));
