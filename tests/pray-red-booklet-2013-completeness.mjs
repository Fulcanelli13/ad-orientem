/**
 * 2013 Coalition in Support of Ecclesia Dei booklet:
 * section-by-section accountability, NOT a claim of exhaustive text collation.
 * The Mass Ordinary's separate 256-cue baseline remains authoritative.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";
import {prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const registry=JSON.parse(read("data/pray/red-booklet-2013-completeness.v1.json"));
const mass=JSON.parse(read("data/research/mass-ordo-red-missal-2013-editorial.v1.json"));
assert.equal(registry.schema,"ao.pray.red-booklet-2013-completeness.v1");
assert.equal(registry.source.pdfPages,71);
assert.equal(registry.source.printedPageToPdfPageOffset,1);
assert.equal(registry.works.length,37,"Booklet private prayer inventory unexpectedly changed without source-page accounting");
assert.equal(new Set(registry.works.map(x=>x.id)).size,registry.works.length);
assert.equal(mass.canonicalCuesExpected,256,"Existing 2013 Red Missal Mass baseline must not regress");
assert.equal(mass.approvedCues.length,32);
assert.equal((mass.reviewedWithoutTextChange||[]).length,209);
assert.equal((mass.ceremonialOutOfEnglishScope||[]).length,15);
assert.ok(!registry.works.some(x=>["mass_canon","mass_proper","mass_confiteor"].includes(x.id)),"Mass forms belong to existing 1962 source owner, not a second devotional corpus");
const byStatus={reader_present:[],variant_requires_comparison:[],unresolved:[]};
const requiredGroups=["before_mass","before_communion","after_low_mass","benediction","confession","after_communion","devotional","marian"];
for(const w of registry.works){
 assert.equal(w.pdfPage,w.printedPage+1,"Wrong PDF page reference "+w.id);
 assert.ok(w.pdfPage>=4&&w.pdfPage<=68,"Outside booklet scanned text "+w.id);
 assert.ok(requiredGroups.includes(w.section),"Unknown booklet group "+w.id);
 assert.ok(w.title.length>5);
 assert.equal(w.wordingCollatedAgainst2013,false,"Exact English collation must be individually evidenced before promotion "+w.id);
 assert.equal(w.discoverableAsIndividualLibraryWork,false,"Booklet-specific direct-index claim requires real routing proof "+w.id);
 assert.ok(Object.hasOwn(byStatus,w.status),"Unknown status "+w.id);
 byStatus[w.status].push(w.id);
 if(w.owner){
  assert.notEqual(w.status,"unresolved","An unresolved work must not masquerade as an identified reader "+w.id);
  const source=read(w.owner.path);
  assert.ok(source.includes(w.owner.symbol),"Reader owner cannot be located: "+w.id+" / "+w.owner.symbol);
  assert.match(w.owner.route,/^pray\./);
  if(w.owner.path.endsWith("canonical-data.js"))assert.ok(DATA.prayers[w.owner.symbol],"Canonical record missing for "+w.id);
  if(w.owner.path.endsWith("traditional-pray-data.js"))assert.ok(COMMUNION_TREASURY_V383[w.owner.symbol],"Communion source key missing for "+w.id);
 }else assert.equal(w.status,"unresolved","Non-published or variant entry requires an exact owner before any published claim "+w.id);
}
assert.deepEqual(Object.fromEntries(Object.entries(byStatus).map(([k,v])=>[k,v.length])),{
 reader_present:24,variant_requires_comparison:3,unresolved:10
});
for(const required of ["pre_thomas","pre_ambrose","communion_thomas","communion_bonaventure","crucifix","ben_tantum","ben_praises","leonine","angelus","regina","rosary","ignatius_suscipe"])assert.ok(byStatus.reader_present.includes(required),required);
for(const required of ["before_mass","conf_exam_prayer","conf_thanksgiving","conf_joseph","communion_thanks","communion_heart","communion_dying","communion_heart_intercession","holy_spirit_augustine","our_lady_65"])assert.ok(byStatus.unresolved.includes(required),required);
const ignatius=registry.works.find(w=>w.id==="ignatius_suscipe");
assert.equal(ignatius.owner.route,"pray.morning_evening");
assert.ok(prayerAcquisitionCandidates("self_offering",{language:"en"}).some(x=>x.id==="ignatius_suscipe_lasance_1908_en"),"Existing EN Suscipe source prayer must remain available");
assert.ok(prayerAcquisitionCandidates("self_offering",{language:"la"}).some(x=>x.id==="ignatius_suscipe_lasance_1908_la"),"Existing Latin Suscipe source prayer must remain available");
assert.equal(prayerAcquisitionCandidates("self_offering",{language:"fr"}).length,0,"Do not invent French Ignatius Suscipe");
console.log("PASS booklet scan: 37 individual private/devotional work slots, 24 located owners, 3 variant checks, 10 outstanding owner matches, separate 256 Mass cues; no false full-text or French claims");
