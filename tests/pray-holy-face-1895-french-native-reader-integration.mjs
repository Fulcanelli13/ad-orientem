import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_HOLY_FACE_1887_B25 as original,HOLY_FACE_SOURCE_GATES_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {holyFace1895FrenchReaderCandidate,holyFace1895FrenchPreviewEnabled,
 HOLY_FACE_1895_FR_READER_DAYS as days,HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED as released,
 HOLY_FACE_1895_FR_ORIGINAL_SOURCE_URL} from "../src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js";
import {novenaSourceWitnessFaceV1} from "../src/pray/novena-source-witness-face.v1.js";
const read=p=>JSON.parse(readFileSync(new URL("../data/pray/research/"+p,import.meta.url),"utf8"));
const records=[read("pray-holy-face-1895-fr-day01-transcribed-proofread.v1.json"),
 ...Array.from({length:8},(_,i)=>read(`pray-holy-face-1895-fr-day0${i+2}-transcribed-first-pass.v1.json`))];
const first=records[0],opening=first.dayComponents.find(x=>x.key==="opening").text;
const sharedPrayer=first.dayComponents.find(x=>x.key==="prayers").text;
const sharedCollect=first.dayComponents.find(x=>x.key==="collect").text;
assert.equal(released,false,"French preview may not silently become an approved general release");
assert.equal(holyFace1895FrenchPreviewEnabled(),false,"Node and ordinary production default must not expose draft French");
assert.equal(HOLY_FACE_SOURCE_GATES_B25.verifiedFrenchPrayerBody,false);
assert.equal(HOLY_FACE_SOURCE_GATES_B25.originalPrintPhotoCollated,false);
assert.ok(HOLY_FACE_1895_FR_ORIGINAL_SOURCE_URL.startsWith("https://"));
assert.equal(days.length,9);
assert.equal(original.days.length,9);
const candidate=holyFace1895FrenchReaderCandidate(original);
assert.notEqual(candidate,original);
assert.equal(candidate.frenchReaderPreview,true);
assert.match(candidate.frenchTextStatus,/PREVIEW_UNCERTIFIED/);
assert.match(candidate.source.edition,/1895/);
assert.match(candidate.source.edition,/1887/);
assert.match(candidate.source.url,/bibliotheque-catholique/);
assert.ok(original.days.every((day,i)=>day.originalSourceDay===i+1&&day.text.fr===""&&day.text.en.length>3000));
const counts=[];
for(let i=0;i<9;i++){
 const rec=records[i],rendered=days[i],day=candidate.days[i];
 assert.equal(rendered.day,i+1);
 assert.equal(rec.day,i+1);
 assert.equal(day.originalSourceDay,i+1);
 assert.equal(day.text.en,original.days[i].text.en,"No modification to 1887 original English");
 assert.equal(day.text.fr,rendered.text);
 assert.equal(rendered.heading,rec.dayHeading);
 assert.deepEqual([...rendered.printedPages],[rec.printedPages[0],rec.printedPages.at(-1)]);
 assert.deepEqual([...rendered.sectionKeys],rec.dayComponents.map(s=>s.key));
 assert.ok(rendered.text.length>3200,`Missing full-length French day ${i+1}`);
 assert.ok(rendered.text.startsWith(opening),"Shared Day I French opening must be visible on all nine days");
 assert.ok(rendered.text.includes(rec.dayComponents.find(x=>x.key==="narrative").text));
 const paragraphs=rendered.text.split("\n\n");
 assert.equal(paragraphs.length,rec.dayComponents.length+
  (i>=1&&i<=7?1:0),"Each printed cross-reference must expand to the correct shared prayer(s)");
 for(const section of rec.dayComponents.filter(x=>x.text)){
  assert.ok(rendered.text.includes(section.text),`Lost ${section.key} on day ${i+1}`);
 }
 const faceFr=novenaSourceWitnessFaceV1(day.text,"fr");
 const faceEn=novenaSourceWitnessFaceV1(day.text,"fr",true);
 assert.equal(faceFr.language,"fr");
 assert.equal(faceFr.requestedUnavailable,false);
 assert.equal(faceFr.canToggleEnglish,true);
 assert.equal(faceFr.text,day.text.fr);
 assert.equal(faceEn.language,"en");
 assert.equal(faceEn.text,original.days[i].text.en);
 if(i<8){
  assert.ok(day.text.fr.includes(sharedPrayer));
  assert.ok(day.text.fr.includes(sharedCollect));
 }else{
  assert.ok(!day.text.fr.includes(sharedCollect),"Last-day collect differs from Day I");
  assert.match(day.text.fr,/dans l’éclat de sa gloire céleste/);
  assert.ok(day.text.fr.includes(rec.dayComponents.find(x=>x.key==="prayers_reprinted").text));
  assert.ok(day.text.fr.includes(rec.dayComponents.find(x=>x.key==="collect_reprinted").text));
 }
 counts.push({day:i+1,paragraphs:paragraphs.length,chars:day.text.fr.length});
}
assert.ok(days[1].text.includes(records[1].dayComponents.find(x=>x.key==="framing").text),"Retain Day II standalone framing");
assert.match(days[4].text,/jugement dérisoire/);
assert.match(days[5].text,/Le prétoire de Pilate fut pour Notre-Seigneur/);
assert.match(days[6].text,/elle l’essuie et le soulage/);
assert.match(days[7].text,/\n\nLe pardon accordé\. —/);
assert.doesNotMatch(days[7].text,/\n\nI\. Le pardon accordé/);
assert.match(days[7].text,/\n\nVœu à pratiquer/);
assert.match(days[8].text,/\n\nVertu à pratiquer/);
assert.equal(original.days.filter(d=>d.text.fr.trim()).length,0);
assert.ok(!("fr" in original.source),"The English witness metadata remains unchanged");
console.log("PASS 9 full French 1895 candidate day bodies in Simple/Guided source adapter, shared Day I opening/closings, unique Day IX collect, English witness unchanged, preview off by default");
console.log(JSON.stringify(counts));
