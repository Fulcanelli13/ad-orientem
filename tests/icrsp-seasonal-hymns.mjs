import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ICRSP_SEASONAL_HYMNS_V1 as hymns, ICRSP_SEASONAL_HYMN_IDS_V1 as ids, ICRSP_HYMN_GROUPS_V1 as groups}
  from "../src/pray/icrsp-seasonal-hymns.v1.js";
import {SACRED_HYMNS_V381} from "../src/pray/traditional-pray-data.js";

assert.deepEqual(Object.keys(SACRED_HYMNS_V381),["te_deum","veni_creator","ave_maris_stella"],
  "Never modify original three independently source-locked hymns");
assert.equal(ids.length,8,"Seven ICRSP groups contain eight different texts");
assert.equal(Object.keys(groups).length,7);
assert.equal(new Set(ids).size,8,"Hymn IDs must be unique");
assert.deepEqual(groups.icrsp_fr_ad_cenam_agni,["ad_regias_agni_dapes","ad_cenam_agni_providi"],
  "Post-1632 and historical pre-1632 Easter versions must remain distinct");
assert.equal(hymns.ad_regias_agni_dapes.recension,"ROMAN_BREVIARY_AFTER_1632");
assert.equal(hymns.ad_cenam_agni_providi.recension,"PRE_1632_CONDITIONAL");
assert.match(hymns.ad_cenam_agni_providi.rubric,/right, custom or indult/i);
assert.match(hymns.vexilla_regis.rubric,/Kneel for O Crux/);
assert.equal(hymns.vexilla_regis.office,"Vespers");
assert.equal(hymns.lustra_sex.office,"Lauds");
assert.equal(hymns.o_sol_salutis.office,"Lauds");
assert.equal(hymns.ex_more_docti.office,"Matins");
assert.equal(hymns.aeterne_rex_altissime.season,"Ascension");
for(const id of ids){
  const h=hymns[id];
  assert.equal(h.id,id);
  assert.ok(h.la.length>400 && h.la.split(/\n\s*\n/).length>=5,id+" full hymn missing");
  assert.ok(h.la.trim().endsWith("Amen."),id+" source hymn lacks final Amen");
  assert.match(h.sourceUrl,/^https:\/\/icrspfrance\.fr\/textes-liturgiques\.php\?article=/);
  assert.ok(h.season&&h.office&&h.title);
  if(["audi_benigne","ex_more_docti"].includes(id)){
    assert.match(h.en,/^[A-Z]/,"Missing the 1849 original English edition");
    assert.match(h.englishSource.work,/Edward Caswall.*1849/);
    assert.match(h.englishSource.url,/wikimedia\.org/);
    assert.match(h.languageStatus,/CASWALL_1849_ENGLISH/);
  }else assert.equal(h.en,undefined,"Do not invent a modern English edition: "+id);
  if(id==="audi_benigne"){
    assert.equal(h.fr.split(/\n\s*\n/).length,5);
    assert.match(h.fr,/Créateur plein de bonté/);
    assert.match(h.frenchSource.work,/Guéranger.*1903/);
    assert.match(h.frenchSource.witnessStatus,/NOT_YET_PHYSICAL_PAGE_COLLATED/);
    assert.equal(h.languageStatus,"HISTORIC_LATIN_CASWALL_1849_ENGLISH_GUERANGER_1903_FRENCH");
  }else assert.equal(h.fr,undefined,"Other historical French translations remain unverified: "+id);
  if(!h.en)assert.equal(h.languageStatus,"HISTORIC_LATIN_ONLY_EN_FR_SOURCE_REQUIRED");
  assert.ok(!Object.keys(SACRED_HYMNS_V381).includes(id),"Original title collision "+id);
}
assert.equal(Object.values(groups).reduce((n,variants)=>n+variants.length,0),8);
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/const HYMN_KEYS=Object\.freeze\(\["te_deum","veni_creator","ave_maris_stella",\.\.\.ICRSP_SEASONAL_HYMN_IDS_V1\]\)/);
assert.match(runtime,/const hymnById=id=>SACRED_HYMNS_V381\[id\]\|\|ICRSP_SEASONAL_HYMNS_V1\[id\]/);
assert.match(runtime,/seasonalHymns:ICRSP_SEASONAL_HYMNS_V1/);
assert.match(runtime,/seasonalHymnCount:ICRSP_SEASONAL_HYMN_IDS_V1\.length/);
assert.match(runtime,/data-ao-hymn-catalogue/);
assert.match(runtime,/data-tp381-hymn=/);
assert.match(runtime,/seasonal\?\(h\[requested\]\?requested:"la"\)/,"Select historic English when attested; fallback to explicitly labelled Latin otherwise");
assert.match(runtime,/The French translation on the ICRSP site has not been copied/);
assert.equal(hymns.audi_benigne.en.split(/\n\s*\n/).length,5);
assert.equal(hymns.ex_more_docti.en.split(/\n\s*\n/).length,9);
assert.match(runtime,/SACRED_HYMNS_V381\[id\]\|\|ICRSP_SEASONAL_HYMNS_V1/);
console.log("ICRSP seasonal hymns: 7 selections / 8 complete Latin versions / 3 canonical hymns unchanged PASS");
