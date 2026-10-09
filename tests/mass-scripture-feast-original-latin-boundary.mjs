import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {VERIFIED_MASS_FEAST_READINGS} from "../src/mass/scripture-feast-reading-index.js";
import {VERIFIED_SEGMENTED_MASS_READINGS} from "../src/mass/scripture-segmented-reading-index.js";
const source=JSON.parse(readFileSync(new URL("../data/mass/scripture-feast-original-latin-boundary-audit.v1.json",import.meta.url),"utf8"));
const expected={sourcePaths:29,scriptureSlots:58,single:53,segmented:5,DIRECT_LATIN:47,DIRECT_SEGMENTED_LATIN:4,EXPLICIT_INHERITED_LATIN:2,COMMON_TARGET_UNRESOLVED:2,MASS_BRANCH_UNRESOLVED:2,"1962_PASSION_VARIANT":1};
assert.equal(source.schema,"ao-major-mass-scripture-original-latin-citation-audit-v1");
assert.deepEqual(source.totals,expected);
assert.equal(source.rows.length,29);
const normalize=str=>{
 const text=String(str??"").replace(/[\u2013\u2014]/g,"-");
 const re=/(\d+):(\d+)(?:-(\d+))?|,\s*(\d+)-(\d+)/g,arr=[];let m,ch=null;
 while((m=re.exec(text))){if(m[1]){ch=m[1];arr.push(m[1]+":"+m[2]+"-"+(m[3]??m[2]));}else if(ch)arr.push(ch+":"+m[4]+"-"+m[5]);}
 return arr.join(";");
};
const ids=new Set(),status={};
for(const row of source.rows){
 assert.ok(!ids.has(row.sourcePath));ids.add(row.sourcePath);
 assert.equal(row.originalFileUrl,"https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/"+row.sourcePath+".txt");
 const base=VERIFIED_MASS_FEAST_READINGS.find(x=>x.sourcePath===row.sourcePath);assert.ok(base);
 for(const slot of ["EPISTLE_OR_LESSON","GOSPEL"]){
  const item=row.slots[slot],single=base.readings[slot],
   split=VERIFIED_SEGMENTED_MASS_READINGS.find(x=>x.sourcePath===row.sourcePath&&x.slot===slot);
  assert.ok(Boolean(single)!==Boolean(split),"Only one canonical slot owner");
  assert.equal(item.reference,(single??split).reference);
  assert.equal(item.kind,split?"SEGMENTED":"SINGLE");
  status[item.status]=(status[item.status]??0)+1;
  if(["DIRECT_LATIN","DIRECT_SEGMENTED_LATIN","EXPLICIT_INHERITED_LATIN"].includes(item.status)){
    assert.equal(normalize(item.originalLatinCitation),normalize(item.reference),row.sourcePath+" "+slot);
  }
  if(item.status==="EXPLICIT_INHERITED_LATIN")assert.ok(item.owner);
  if(item.status==="COMMON_TARGET_UNRESOLVED")assert.equal(item.alias,"@Commune/C10a");
  if(item.status==="MASS_BRANCH_UNRESOLVED")assert.equal(row.sourcePath,"Tempora/Quad6-4");
  if(item.status==="1962_PASSION_VARIANT"){
    assert.equal(row.sourcePath,"Tempora/Quad6-0");
    assert.equal(slot,"GOSPEL");
    assert.equal(item.oldHeader,"Matt 26:1-75; 27:1-66");
    assert.equal(item.witnessUrl,"https://www.missalemeum.com/en/calendar/1962-04-15");
  }
 }
}
assert.equal(ids.size,29);
for(const [key,count] of Object.entries(status))assert.equal(source.totals[key],count);
assert.equal(source.unresolvedOriginalOwnerSlots.length,4);
console.log("PASS major Mass original Latin citation/source-owner census: 29 source paths / 58 slots with 51 direct, 2 inherited, 4 explicit unresolved and one 1962 Passion variant");
