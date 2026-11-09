// M48: two recurring Advent Sunday source-owned Proper previews, never
// inferred for a different Mass or musically approved by a source title.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {ADVENT_SUNDAY_REFERENCE_SCORES,ADVENT_SUNDAY_SOURCE_HOLDS,
 ADVENT_SUNDAY_1962_MASS_WITNESSES}
 from "../src/mass/reader-inline-advent-sundays-reference.js";
import {PROPER_REFERENCE_BINDINGS} from "../src/mass/reader-inline-proper-registry.js";
import {referenceScoresForParagraph} from "../src/mass/reader-inline-proper-reference.js";
const expected=[
 ["Tempora/Adv1-0","INTROIT","GREGOBASE-132","in","1"],
 ["Tempora/Adv1-0","GRADUAL","GREGOBASE-1169","gr","2"],
 ["Tempora/Adv1-0","ALLELUIA","GREGOBASE-1115","al","2"],
 ["Tempora/Adv1-0","COMMUNION","GREGOBASE-1036","co","3"],
 ["Tempora/Adv2-0","INTROIT","GREGOBASE-356","in","4"],
 ["Tempora/Adv2-0","GRADUAL","GREGOBASE-1268","gr","4"],
 ["Tempora/Adv2-0","ALLELUIA","GREGOBASE-292","al","5"],
 ["Tempora/Adv2-0","COMMUNION","GREGOBASE-966","co","6"]
];
assert.deepEqual(ADVENT_SUNDAY_1962_MASS_WITNESSES.map(x=>
 [x.sourcePath,x.exactSourceBlobSha]),[
 ["Tempora/Adv1-0","75b533254548cf9f93636ea3d44dca059c6896d1"],
 ["Tempora/Adv2-0","97130ff3f8e9e8471bc0b51f74558e49b93facf4"]
]);
assert.ok(ADVENT_SUNDAY_1962_MASS_WITNESSES.every(x=>
 x.url.includes("/divinum-officium/blob/master/web/www/missa/Latin/Tempora/")&&
 /^[a-f0-9]{40}$/.test(x.exactSourceBlobSha)));
assert.equal(ADVENT_SUNDAY_REFERENCE_SCORES.length,8);
assert.equal(new Set(ADVENT_SUNDAY_REFERENCE_SCORES.map(s=>s.id)).size,8);
for(let i=0;i<expected.length;i++){
 const [source,key,id,part,folio]=expected[i],s=ADVENT_SUNDAY_REFERENCE_SCORES[i];
 assert.deepEqual([s.sourcePath,s.key,s.id,s.part,s.folio],
  [source,key,id,part,folio]);
 assert.equal(s.publicScoreApproved,false);
 assert.equal(s.editorialApproval,false);
 assert.equal(s.printedMusicCompared,false);
 assert.equal(s.actuallySung,"UNKNOWN");
 assert.equal(s.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+s.sourceId);
 const archive=JSON.parse(readFileSync(new URL("../"+s.archivePath,import.meta.url),"utf8"));
 const original=archive.items.find(x=>x.id===id);
 assert.ok(original,"Missing pinned 1961 archive "+id);
 assert.equal(original.sourceEditionId,2);
 assert.equal(original.officePart,part);
 assert.equal(original.gradualeRomanum1961Page,folio);
 assert.equal(original.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
 assert.equal(s.gabc.split("\n%%\n")[1],original.gabc,
  "Unaltered source GABC required "+id);
 assert.equal(s.sha256,original.sha256);
 assert.equal(createHash("sha256").update(original.gabc).digest("hex"),s.sha256);
}
assert.deepEqual(ADVENT_SUNDAY_SOURCE_HOLDS.map(x=>[x.sourcePath,x.scoreId]),[
 ["Tempora/Adv1-0","GREGOBASE-962"],["Tempora/Adv2-0","GREGOBASE-631"]
]);
assert.ok(ADVENT_SUNDAY_SOURCE_HOLDS.every(x=>x.publication==="HOLD_NO_SCORE"&&
 x.sourceLatin!==x.scoreLatin));
const datasets=[
 {date:"2026-11-29",source:"Tempora/Adv1-0",items:[
  ["INTROIT.1","Ad te levávi ánimam meam: Deus meus, in te confído, non erubéscam: neque irrídeant me inimíci mei: étenim univérsi, qui te exspéctant, non confundéntur.","GREGOBASE-132"],
  ["GRADUAL.1","Univérsi, qui te exspéctant, non confundéntur, Dómine. V. Vias tuas, Dómine, notas fac mihi: et sémitas tuas édoce me.","GREGOBASE-1169"],
  ["ALLELUIA_TRACT_SEQUENCE.1","Allelúja. Osténde nobis, Dómine, misericórdiam tuam: et salutáre tuum da nobis.","GREGOBASE-1115"],
  ["OFFERTORY.1","Ad te levávi ánimam meam: Deus meus, in te confído, non erubéscam.",""],
  ["COMMUNION.1","Dóminus dabit benignitátem: et terra nostra dabit fructum suum.","GREGOBASE-1036"]
 ]},
 {date:"2026-12-06",source:"Tempora/Adv2-0",items:[
  ["INTROIT.1","Pópulus Sion, ecce, Dóminus véniet ad salvándas gentes: et audítam fáciet Dóminus glóriam vocis suæ in lætítia cordis vestri.","GREGOBASE-356"],
  ["GRADUAL.1","Ex Sion species decóris ejus: Deus maniféste véniet, V. Congregáte illi sanctos ejus.","GREGOBASE-1268"],
  ["ALLELUIA_TRACT_SEQUENCE.1","Allelúja. Lætátus sum in his, quæ dicta sunt mihi: in domum Dómini íbimus.","GREGOBASE-292"],
  ["OFFERTORY.1","Deus, tu convérsus vivificábis nos, et plebs tua lætábitur in te.",""],
  ["COMMUNION.1","Jerúsalem, surge et sta in excélso, et vide jucunditátem, quæ véniet tibi a Deo tuo.","GREGOBASE-966"]
 ]}
];
const select=(p,m,form="MISSA_CANTATA_INCENSE")=>
 referenceScoresForParagraph({paragraph:p,resolvedMass:m,form}).map(x=>x.id);
for(const day of datasets){
 const mass={date:day.date,proper:{data:{sourcePath:day.source}},overlays:[]};
 const ps=day.items.map(([id,primary])=>({id,primary,kind:"TEXT"}));
 assert.deepEqual(ps.map(p=>select(p,mass)),day.items.map(row=>row[2]?[row[2]]:[]));
 assert.deepEqual(ps.map(p=>select(p,{...mass,date:String(Number(day.date.slice(0,4))+1)+day.date.slice(4)})),
  day.items.map(row=>row[2]?[row[2]]:[]),
  "Sundays recur by proper source owner, not fixed civil date");
 const combined={...ps[1],primary:ps[1].primary+" Allelúja, allelúja. "+ps[2].primary};
 assert.deepEqual(select(combined,mass),[day.items[1][2],day.items[2][2]],
  "Composite 1962 Gradual must own its independently sourced Alleluia");
 assert.deepEqual(select({...ps[1],primary:ps[2].primary},mass),[],
  "An Alleluia must not replace its Gradual owner");
 for(const form of ["LOW","MISSA_PRIVATA","UNKNOWN"]){
  assert.ok(ps.every(p=>select(p,mass,form).length===0),
   "Unsung form leaked notation: "+form);
 }
 for(const wrong of [
  {...mass,proper:{data:{sourcePath:"Tempora/Adv3-0"}}},
  {...mass,proper:{data:{sourcePath:day.source==="Tempora/Adv1-0"?"Tempora/Adv2-0":"Tempora/Adv1-0"}}},
  {...mass,overlays:["REQUIEM"]}
 ]){
  assert.ok(ps.every(p=>select(p,wrong).length===0),
   "Wrong Mass source leaked research score");
 }
 assert.deepEqual(select({...ps[0],kind:"RUBRIC"},mass),[]);
 assert.deepEqual(select({...ps[4],id:"GRADUAL.1"},mass),[]);
 assert.deepEqual(select({...ps[3],primary:ps[0].primary},mass),[],
  "An Offertory cannot borrow the identical Introit score");
 const bindings=PROPER_REFERENCE_BINDINGS.filter(b=>b.sourcePath===day.source);
 assert.equal(bindings.length,5,"Four scores + composite Alleluia source paragraph");
 assert.ok(bindings.every(b=>b.role!=="OFFERTORY"));
 assert.equal(bindings.filter(b=>b.role==="ALLELUIA").length,2);
}
console.log("ADVENT_M48_8_SOURCE_GABC_PASS 8 archived original 1961 GABCs, 2 textual Offertory holds, recurring 1962 source owner, no local music inference");
