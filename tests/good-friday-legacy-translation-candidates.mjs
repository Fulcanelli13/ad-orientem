import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const archive=read("../data/mass/good-friday-legacy-trilingual-candidates.v1.json");
const current=read("../data/presentation/reader-good-friday.v1.json");
assert.equal(archive.schema,"ao.1962.good-friday.legacy-trilingual-candidates.v1");
assert.equal(archive.activeReaderImport,false);
assert.equal(archive.candidates.length,9);
assert.deepEqual(archive.counts,{
 archivedRows:9,archivedEnglish:9,archivedFrench:9,
 heldForPrinted1962Collation:7,quarantinedLaterEdition:2,importedToReader:0,
});
for(let i=0;i<9;i++){
 const row=archive.candidates[i];
 assert.equal(row.ordinal,i+1);
 assert.equal(row.key,current.solemnPrayers[i].key);
 assert.equal(row.publishable,false);
 assert.equal(row.readyForDirectReaderImport,false);
 for(const code of ["latin","english","french"]){
  assert.ok(row.historicalDonor[code].length>150,"Original historical source text lost for "+row.ordinal+" "+code);
 }
}
assert.equal(archive.candidates[6].donorEditionClass,"LATER_ECUMENICAL_VARIANT_NOT_PRINTED_1962");
assert.equal(archive.candidates[7].donorEditionClass,"HOLY_SEE_2008_VARIANT_NOT_PRINTED_1962");
assert.match(archive.candidates[6].historicalDonor.latin,/qui in Christum credunt/);
assert.match(current.solemnPrayers[6].intention,/haereticis et schismaticis/);
assert.match(archive.candidates[7].historicalDonor.latin,/illúminet corda eórum/);
assert.match(current.solemnPrayers[7].variants.PRINTED_1962.intention,/auferat velamen/);
assert.equal(current.status,"SOURCE_PINNED_1962_GOOD_FRIDAY_LATIN");
assert.ok(!current.solemnPrayers.some(x=>x.english||x.french||x.en||x.fr));
console.log("Good Friday donor salvage: PASS — nine EN/FR preserved as non-publishable source candidates; 7/8 edition firewall locked.");
