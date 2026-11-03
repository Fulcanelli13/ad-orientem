import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";
import {benedictionSungStanzas} from "../src/pray/f11-sung-text-presentation.js";

const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
for(const id of ["benediction_o_salutaris","benediction_tantum_ergo","benediction_versicles"]){
 const p=prayers[id];assert.ok(p,id+" source exists");
 for(const requested of ["en","fr"]){
  const face=prayerSourceFacesV1(p,requested);
  assert.equal(face.vernacular,p[requested],id+" "+requested+" exact prayer text");
  assert.equal(face.vernacularLanguage,requested,id+" "+requested+" true witness language");
  assert.equal(face.latin,p.la,id+" Latin text unchanged");
  assert.equal(face.fallback,false);
 }
}
for(const id of ["benediction_o_salutaris","benediction_tantum_ergo"]){
 const p=prayers[id];
 for(const vern of ["en","fr"]){
  const rows=benedictionSungStanzas(id,p.la,p[vern]);
  assert.equal(rows?.length,2,id+" "+vern+" must preserve both source stanzas");
  assert.equal(rows.map(r=>r.latin).join(p.la.includes("\n\n")?"\n\n":"\n"),p.la,id+" Latin stanza text fidelity");
  assert.equal(rows.map(r=>r.vernacular).join(p[vern].includes("\n\n")?"\n\n":"\n"),p[vern],id+" "+vern+" stanza text fidelity");
 }
}
// Future EN-only/LA-only records must never masquerade as French.
const fallback=prayerSourceFacesV1({en:"English witness",la:"Latin original"},"fr");
assert.deepEqual(fallback,{vernacular:"English witness",vernacularLanguage:"en",latin:"Latin original",fallback:true});
const latinOnly=prayerSourceFacesV1({la:"Latin original"},"fr");
assert.deepEqual(latinOnly,{vernacular:"",vernacularLanguage:null,latin:"Latin original",fallback:false});

const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const body=runtime.slice(runtime.indexOf("function benSourceLanguageNotice(face){"),runtime.indexOf("function benFeastOptions(){"));
assert.ok(body.includes('data-ao-ben-source-language-fallback'));
assert.equal(body.split("benSourceLanguageNotice(face)").length-1,4,
 "Three Benediction render paths and one helper definition must be source-labelled");
assert.equal(body.split("prayerSourceFacesV1(").length-1,3,
 "The sung, liturgical and feast prayers must share the existing source resolver");
assert.match(body,/aoRiteChantVernacular" lang="'\+face\.vernacularLanguage/);
assert.match(body,/row\(vern,face\.vernacularLanguage\)/);
assert.match(body,/row\(vern\|\|latin,face\.vernacularLanguage\|\|\(latin\?'la':'en'\)\)/);
assert.match(body,/data-face-v lang="'\+face\.vernacularLanguage/);
assert.match(body,/data-face-la lang="la" hidden/);
assert.ok(body.includes("benedictionSungStanzas(id,latin,vern)"),"Approved two-stanza chant remains in place");
console.log("PASS · Benediction hymn, versicle and feast readers preserve actual source EN/FR/LA identities; exact original Latin/vernacular stanzas unchanged");
