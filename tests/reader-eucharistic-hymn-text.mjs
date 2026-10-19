import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EUCHARISTIC_HYMN_TRANSLATION_SOURCE,makeEucharisticHymnRows,makeCorpusBenedictionRow}
  from "../src/mass/reader-eucharistic-hymn-text.js";
import {buildCorpusChristiProcessionPayload} from "../src/mass/reader-corpus-christi.js";
import {buildHolyThursdayPostPayload} from "../src/mass/reader-holy-thursday-post.js";
import {specialRiteVernacular,projectSpecialRiteReadingPages}
  from "../src/mass/reader-special-missal-pages.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const graph=load("../data/mass/special-days-extension.v1.3.json").graphs;
const coSource=load("../data/presentation/reader-corpus-christi.v1.json");
const htSource=load("../data/presentation/reader-holy-thursday-post.v1.json");
const corpus=buildCorpusChristiProcessionPayload({graph:graph.CORPUS,payload:coSource}).cards;
const holy=buildHolyThursdayPostPayload({graph:graph.HT_POST,payload:htSource}).cards;
const byId=(cards,id)=>cards.find(c=>c.id===id).paragraphs;
const corpusHymn=[...byId(corpus,"CORPUS-R02"),...byId(corpus,"CORPUS-R04")];
const holyHymn=[...byId(holy,"HT-R01"),...byId(holy,"HT-R03")];
assert.equal(corpusHymn.length,6);
assert.equal(holyHymn.length,6);
assert.match(EUCHARISTIC_HYMN_TRANSLATION_SOURCE.status,/EDITORIAL/);
assert.equal(EUCHARISTIC_HYMN_TRANSLATION_SOURCE.stanzaCount,6);
for(let i=0;i<6;i++){
  const expectedCo=i<4?coSource.pangeLingua[i]:coSource.tantumErgo[i-4];
  const expectedHt=i<4?htSource.pangeLingua[i]:htSource.tantumErgo[i-4];
  const cr=corpusHymn[i],hr=holyHymn[i];
  assert.equal(cr.latin,expectedCo,"Corpus original Latin altered at stanza "+(i+1));
  assert.equal(hr.latin,expectedHt,"Holy Thursday original Latin altered at stanza "+(i+1));
  assert.equal(cr.english,hr.english,"One source hymn acquired two English translations");
  assert.equal(cr.french,hr.french,"One source hymn acquired two French translations");
  assert.ok(cr.english.length>45 && cr.french.length>45,
    "Hymn translation is not a full parallel stanza "+(i+1));
  assert.ok(!cr.english.includes("Pange, lingua"),
    "Untranslated Latin presented as English");
  assert.ok(/EDITORIAL/.test(cr.sourceStatus));
  for(const row of [cr,hr]){
    assert.equal(specialRiteVernacular(row,{language:"en"}),cr.english);
    assert.equal(specialRiteVernacular(row,{language:"fr"}),cr.french);
  }
}
assert.deepEqual(corpusHymn.map(r=>r.sourceRecordId),[
  ...Array(4).fill("CORPUS-EXP-010"),...Array(2).fill("CORPUS-RET-010")]);
assert.deepEqual(holyHymn.map(r=>r.sourceRecordId),[
  ...Array(4).fill("HT-TRN-010"),...Array(2).fill("HT-TRN-030")]);
const prayers=byId(corpus,"CORPUS-R05");
const benSource=coSource.benediction;
assert.equal(prayers.length,5);
for(const [i,key] of ["versicle","response","oremus","prayer","amen"].entries()){
  const p=prayers[i];
  assert.equal(p.latin,benSource[key],"Original Benediction source was changed: "+key);
  assert.ok(p.english?.trim()&&p.french?.trim(),"Benediction translation omitted: "+key);
  assert.equal(specialRiteVernacular(p,{language:"fr"}),p.french);
  assert.equal(specialRiteVernacular(p,{language:"en"}),p.english);
  assert.equal(p.sourceRecordId,"CORPUS-BEN-010");
}
assert.deepEqual(projectSpecialRiteReadingPages("CORPUS-R05",prayers)
  .flatMap(page=>page.rows),prayers,"Benediction text/presentation lost a source row");
assert.equal(holy.find(c=>c.id==="HT-R05").paragraphs.length,15);
assert.ok(holy.find(c=>c.id==="HT-R05").paragraphs.every(row=>
  specialRiteVernacular(row,{language:"en"})&&
  specialRiteVernacular(row,{language:"fr"})&&
  row.sourceStatus?.includes("EDITORIAL")),
  "Holy Thursday Psalm 21 editorial translations are not complete or were misattributed");
const wrong=[...coSource.pangeLingua];wrong[1]=wrong[0];
assert.throws(()=>makeEucharisticHymnRows(wrong,{prefix:"X-",sourceRecordId:"CORPUS-EXP-010"}),
  /EUCHARISTIC_HYMN_LATIN_INCORRECT_STANZA/);
assert.throws(()=>makeEucharisticHymnRows([...coSource.pangeLingua, ...coSource.tantumErgo],
  {prefix:"X-",sourceRecordId:"CORPUS-EXP-010",startStanza:1}),
  /EUCHARISTIC_HYMN_STANZA_RANGE_INVALID/);
assert.throws(()=>makeCorpusBenedictionRow("P",benSource.versicle,{kind:"TEXT"}),
  /CORPUS_BENEDICTION_WITNESS_MISMATCH/);
console.log("PASS six shared 1962 source-owned hymn stanzas, Corpus Benediction V/R/collect, editorial EN/FR alignment; no Psalm 21 mistranslation");
