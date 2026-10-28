/** 1962 Vatican image-incipit B10: source-critical runtime crosswalk, not full-text certification. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildEasterVigilReader} from "../src/mass/reader-easter-vigil.js";

const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const image=load("data/mass/independent-1962-holy-week-b09-original-image-witness.v1.json");
const ledger=load("data/mass/independent-1962-holy-week-b10-original-runtime-crosswalk.v1.json");
const palm=load("data/presentation/reader-palm.v1.json");
const friday=load("data/presentation/reader-good-friday.v1.json");
const vigil=load("data/presentation/reader-easter-vigil.v1.json");
const graph=load("data/mass/special-days-core.v1.1.json").graphs.EV;
const roots={palm,friday,vigil};
const fold=x=>String(x??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
  .replace(/j/gi,"i").replace(/[^a-z]/gi," ").replace(/\s+/g," ").toLowerCase().trim();
const includes=(full,incipit)=>(" "+fold(full)+" ").includes(" "+fold(incipit)+" ");
function field(path){
  let value=roots;
  for(const key of path.match(/[A-Za-z_]\w*|\[\d+\]/g)||[]){
    value=value?.[key.startsWith("[")?Number(key.slice(1,-1)):key];
  }
  return value;
}

assert.equal(ledger.schema,"AO_MR1962_HOLY_WEEK_B10_ORIGINAL_IMAGE_TO_RUNTIME_INCIPIT_V1");
assert.equal(image.witnesses.length,29);
assert.equal(ledger.records.length,29);
assert.equal(new Set(ledger.records.map(r=>r.id)).size,29,"Repeated image witness");
assert.deepEqual(new Set(ledger.records.map(r=>r.id)),new Set(image.witnesses.map(w=>w.id)));
assert.equal(ledger.counts.witnesses,29);
assert.equal(ledger.counts.fullLatinTextsCertified,0);
assert.equal(ledger.counts.englishFrenchTextsCertified,0);
assert.equal(ledger.specialCorrection.printedPage,205);
assert.equal(ledger.specialCorrection.scanId,287);
assert.equal(ledger.specialCorrection.sourceImage,"https://gregobase.selapa.net/sources/42/287.png");

const byId=new Map(image.witnesses.map(w=>[w.id,w]));
let checked=0,structural=0,selectedProper=0;
for(const row of ledger.records){
  const original=byId.get(row.id);
  assert.ok(original,"Missing independent original image row "+row.id);
  assert.equal(row.printedPage,original.printedPage,row.id+" page changed");
  assert.equal(row.scanId,original.scanId,row.id+" image scan changed");
  if(row.status==="MATCHED_LATIN_INCIPIT"){
    const target=field(row.canonicalPath);
    assert.equal(typeof target,"string",row.id+" source field missing");
    assert.ok(includes(target,original.reading),row.id+" original 1962 Latin incipit diverged at "+row.canonicalPath);
    if(row.id!=="FONT_BLESSING_EXTENDED")
      assert.equal(row.canonicalPath,original.runtimePath,row.id+" changed original source owner");
    checked++;
  }else if(row.status==="STRUCTURAL_WITNESS_NO_DIRECT_TEXT_LEAF"){
    assert.equal(original.runtimePath,null,"Structural hold has a direct source path: "+row.id);
    assert.equal(row.canonicalPath,undefined);
    structural++;
  }else if(row.status==="PENDING_SELECTED_PROPER_BROWSER"){
    assert.equal(row.id,"HOLY_THURSDAY_INTROIT","Unexpected browser-only hold");
    assert.equal(original.runtimePath,"resolvedProper.introit.lat");
    selectedProper++;
  }else throw Error("Unclassified source witness "+row.id);
}
assert.deepEqual({checked,structural,selectedProper},{checked:22,structural:6,selectedProper:1});
assert.equal(checked,ledger.counts.matchedLatinIncipits);
assert.equal(structural,ledger.counts.structuralHolds);
assert.equal(selectedProper,ledger.counts.selectedProperHold);

const fontRow=ledger.records.find(x=>x.id==="FONT_BLESSING_EXTENDED");
assert.equal(fontRow.canonicalPath,"vigil.font1962.segments[9].latin");
const font=vigil.font1962.segments;
assert.equal(font.length,17,"Historic font blessing segmented source loss");
assert.equal(font[9].id,"F10");
assert.equal(font[9].section,"FOUR_DIRECTIONS");
assert.equal(font[9].action,"DIVIDE_WATER_TOWARD_FOUR_DIRECTIONS");
const sourceIncipit=byId.get("FONT_BLESSING_EXTENDED").reading;
assert.ok(includes(font[9].latin,sourceIncipit));
assert.ok(!includes(font[9].latin.replace("Qui te de paradísi","Qui te paradísi"),sourceIncipit),
  "Deliberately removing the original printed word 'de' must fail the source gate");
assert.ok(font[9].english.startsWith("He caused thee to spring from paradise"));
assert.ok(font[9].french.startsWith("Il t'a fait jaillir de la source du paradis"));
const rendered=buildEasterVigilReader({graph,payload:vigil,fontMode:"IN_CHURCH",baptismPresent:false});
const rows=rendered.steps.find(x=>x.recordId==="EV-FONT-420")?.paragraphs||[];
assert.ok(rows.some(x=>includes(x.latin,sourceIncipit)),
  "Source-correct F10 must reach the existing Easter Vigil Reader, not merely dormant JSON");
console.log("PASS 1962 Vatican image witness B10:",JSON.stringify({
  scannedIncipitsMatched:checked,structuralHolds:structural,selectedProperHolds:selectedProper,
  fullTextCertified:false,translationCertified:false,correctedF10:font[9].id,
  printedPage:205,scanId:287
}));
