import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const files=[1,2,3].map((_,i)=>"data/geography/research/mass-variable-chant-bible-batch0"+(i+1)+"-20261011.v1.json");
const batches=files.map(load);
const registered=[...load("data/mass/scripture-reading-witness-register.v1.json").celebrations,
 ...load("data/mass/scripture-feast-reading-supplement.v1.json").celebrations];
const witnessPaths=new Set(registered.map(x=>x.sourcePath));
assert.equal(witnessPaths.size,105);
const slots=["INTROIT","GRADUAL","OFFERTORY","COMMUNION"];
const rows=batches.flatMap(x=>x.chants);
const holds=batches.flatMap(x=>x.holds);
const paths=batches.flatMap(x=>x.sourcePaths);
assert.deepEqual(batches.map(x=>x.batch),[1,2,3]);
assert.ok(batches.every(x=>x.schema==="MASS_VARIABLE_CHANT_BIBLE_DISCOVERY_V1"));
assert.ok(batches.every(x=>x.status==="SOURCE_NOTES_EXTRACTED_NO_1962_FACSIMILE_OR_BIBLE_TEXT_CERT"));
assert.deepEqual(batches.map(x=>x.sourcePaths.length),[8,8,7]);
assert.equal(new Set(paths).size,23);
assert.ok(paths.every(x=>witnessPaths.has(x)),"all researched Masses must use a source-owned known Proper path");
assert.equal(rows.length,92);
assert.equal(new Set(rows.map(x=>x.sourcePath+"|"+x.properSlot)).size,92);
assert.ok(rows.every(x=>paths.includes(x.sourcePath)));
for(const sourcePath of paths){
 const sourceRows=rows.filter(x=>x.sourcePath===sourcePath);
 assert.deepEqual(sourceRows.map(x=>x.properSlot),slots);
}
assert.equal(rows.filter(x=>x.biblicalCitationNotes.length).length,81);
assert.equal(rows.reduce((n,x)=>n+x.biblicalCitationNotes.length,0),117);
assert.equal(holds.length,18);
assert.equal(rows.filter(x=>x.citationStatus!=="CITATION_PRINTED_IN_WITNESS").length,11);
assert.ok(rows.every(x=>x.sourceUrl==="https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/"+x.sourcePath+".txt"));
assert.ok(rows.every(x=>x.sourceSection==={INTROIT:"Introitus",GRADUAL:"Graduale",OFFERTORY:"Offertorium",COMMUNION:"Communio"}[x.properSlot]));
assert.ok(rows.every(x=>x.biblicalCitationNotes.every(z=>!z.startsWith("!") && !/^(Tractus|Alleluia|Sequentia)(?: |$)/.test(z)))); 
assert.ok(rows.every(x=>Object.values(x.verification).every(v=>typeof v==="boolean")));
assert.ok(rows.every(x=>x.verification.sourceFileInspected===true &&
 x.verification.verseMatchesBibleEdition===false &&
 x.verification.comparedAgainstFacsimile1962===false &&
 x.verification.resolvedThroughExistingAppProper===false &&
 x.verification.approvedForApp===false));
for(const h of holds){
 const x=rows.find(r=>r.sourcePath===h.sourcePath&&r.properSlot===h.slot);
 assert.ok(x);
 assert.equal(x.citationStatus,h.status);
 assert.deepEqual(x.sectionBoundaryNotes,h.transitions);
 assert.ok(x.citationStatus!=="CITATION_PRINTED_IN_WITNESS"||x.sectionBoundaryNotes.length>0);
}
assert.ok(batches[0].scripturalIndexLeads.some(x=>x.author==="Matthew P. Hazell" && x.title.includes("1962")));
const candlemas=rows.find(r=>r.sourcePath==="Sancti/02-02"&&r.properSlot==="INTROIT");
assert.equal(candlemas.citationStatus,"INHERITED_SOURCE_REQUIRES_RESOLUTION");
assert.equal(candlemas.inheritedSourceResolution.parentSourcePath,"Tempora/Pent08-0");
assert.ok(candlemas.inheritedSourceResolution.parentCitationNotes.some(x=>x.includes("Ps 47")));
const holyThursday=rows.filter(x=>x.sourcePath==="Tempora/Quad6-4");
assert.equal(holyThursday.length,4);
assert.ok(holyThursday.every(x=>x.citationStatus==="SECTION_ABSENT"&&!x.biblicalCitationNotes.length));
const annunciation=rows.filter(x=>x.sourcePath==="Sancti/03-25");
assert.ok(annunciation.filter(x=>x.citationStatus==="INHERITED_SOURCE_REQUIRES_RESOLUTION").length>=3);
assert.ok(rows.some(x=>x.sourcePath==="Tempora/Quad1-0"&&x.properSlot==="GRADUAL"&&x.sectionBoundaryNotes.includes("Tractus")));
assert.ok(rows.some(x=>x.sourcePath==="Tempora/Pasc7-0"&&x.properSlot==="COMMUNION"&&x.biblicalCitationNotes.some(c=>c.includes("Act 2"))));
console.log("PASS Mass variable chant research: 23 confirmed source paths; 92 source chant positions; 81 annotated; 117 source citation notes; 18 holds; no production approvals");
