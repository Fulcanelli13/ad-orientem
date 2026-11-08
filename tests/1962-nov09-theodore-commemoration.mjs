import assert from "node:assert/strict";
import {NOV09_THEODORE_SOURCE,project1962Nov09TheodoreCommemoration}
 from "../src/mass/1962-nov09-theodore-commemoration.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
const DATE="2026-11-09",PATH="Sancti/11-09",GROUPS=[
 ["collects","COLLECT_SET"],["secrets","SECRET_SET"],
 ["postcommunions","POSTCOMMUNION_SET"]
];
const day={status:"ready",date:DATE,
 day:{main:{id:"sancti:11-09:2:w",path:PATH,rank:2}}};
const original={data:{sourcePath:PATH,
 collects:[{lat:"Deus, qui nobis per síngulos annos sancti templi tui consecratiónis diem. Per Dóminum nostrum. Amen.",
  en:"O God, who hast granted this temple consecration and hear the prayers of thy people. Through our Lord. Amen.",
  fr:"Dieu, qui nous accordez chaque année la mémoire de la consécration de ce temple, écoutez nos prières. Ainsi soit-il."}],
 secrets:[{lat:"Annue, quǽsumus, Dómine, précibus nostris, ut perveníre mereámur. Per Dóminum nostrum. Amen.",
  en:"Look with favor upon our prayers, O Lord, that we may attain eternal rewards. Through our Lord. Amen.",
  fr:"Exaucez, Seigneur, nos prières pour obtenir la vie éternelle. Ainsi soit-il."}],
 postcommunions:[{lat:"Deus, qui de vivis et electis lapídibus æternum habitáculum præparas. Per Dóminum nostrum. Amen.",
  en:"O God, who prepare a dwelling with living and chosen stones, help thy people. Through our Lord. Amen.",
  fr:"Dieu qui préparez un sanctuaire de pierres vivantes et choisies, secourez votre peuple. Ainsi soit-il."}]
}};
const take=(opts={})=>project1962Nov09TheodoreCommemoration({
 proper:original,date:DATE,form:"LOW",calendarResolution:day,
 ...opts
});
const done=take();
assert.equal(done.status,"APPLIED");
assert.equal(original.data.collects.length,1,"Must never mutate the original proper");
assert.equal(done.proper.data.verifiedNov09TheodoreCommemoration?.status,"SOURCE_VERIFIED");
for(const [key,slot] of GROUPS){
 assert.equal(done.proper.data[key].length,2,key);
 assert.deepEqual(done.proper.data[key][0],original.data[key][0],
  "The original principal prayer must remain unaltered");
 const prayer=done.proper.data[key][1],source=NOV09_THEODORE_SOURCE.prayers[key];
 for(const lng of ["lat","en","fr"]){
  assert.equal(prayer[lng],source[lng]);
  assert.match(prayer[lng],lng==="fr"?/Ainsi soit-il\.$/:/Amen\.$/);
 }
 assert.equal(prayer.sourcePath,"1962_MISSALE_11_09_THEODORE_COMMEMORATION");
 assert.equal(prayer.ordoOrationId,"COMMEMORATION:SAINT_THEODORE_MARTYR");
 assert.equal(prayer.liturgicalPurpose,"COMMEMORATION_SAINT_THEODORE");
 assert.doesNotMatch(prayer.lat,/f[aá]mulum tuum N\./iu,
  "The separately attested institute pro Papa must not leak into the general Mass");
}
assert.match(NOV09_THEODORE_SOURCE.prayers.postcommunions.lat,
 /^Præsta nobis, quǽsumus, Dómine:/);
assert.doesNotMatch(NOV09_THEODORE_SOURCE.prayers.postcommunions.lat,
 /^Súscipe, Dómine, fidélium preces/,
 "Avoid the duplicated Latin Secret mistakenly printed in the ICRSP article");
for(const language of ["en","fr"]){
 const p=properToReaderSlots(done.proper.data,{language});
 assert.equal(p.ready,true,JSON.stringify(p.missing));
 for(const [,slot] of GROUPS){
  const paragraphs=p.slots?.[slot]?.data?.paragraphs??[];
  assert.deepEqual([...new Set(paragraphs.map(x=>x.orationGroupIndex)
   .filter(Number.isInteger))],[1,2],language+" "+slot);
 }
}
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const result=take({form});
 assert.equal(result.status,"OMITTED_BY_1962_RUBRIC",
  "Ordinary IV-class commemoration omitted from nonconventual sung Mass");
 assert.equal(result.proper,original);
}
for(const opts of [
 {date:"2026-11-10"},{celebrationId:"votive"},{observedSource:true},
 {isConventual:true}
])assert.equal(take(opts).proper,original);
for(const mismatch of [
 {calendarResolution:{...day,day:{main:{id:"sancti:11-09:2:w",path:"Sancti/11-09x",rank:2}}}},
 {proper:{data:{...original.data,sourcePath:"Sancti/11-09x"}}}
])assert.equal(take(mismatch).status,"UNVERIFIED");
assert.equal(take({proper:{data:{...original.data,
 postcommunions:[original.data.postcommunions[0],original.data.postcommunions[0]]}}}).status,"UNVERIFIED");
console.log("PASS 1962 Nov 9: St Theodore's 3 original sourced prayers restored in LOW only, EN/FR slots 2 groups, no false pro Papa, no ICRSP Latin Postcommunion transcription duplicate.");
