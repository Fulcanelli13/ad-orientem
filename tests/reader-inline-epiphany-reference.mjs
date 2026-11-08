// Exact-source Epiphany Gregorian reference acceptance. No Gregorian
// musical/editorial approval, performance assertion or church-local inference.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {EPIPHANY_REFERENCE_SCORES,EPIPHANY_REFERENCE_WITNESS} from "../src/mass/reader-inline-epiphany-reference.js";
import {referenceScoresForParagraph,PROPER_REFERENCE_REGISTRY_STATUS} from "../src/mass/reader-inline-proper-reference.js";
import {resolveScholaSelectedScoreAccess} from "../src/mass/reader-schola-score-access.js";
const expected=[
 {id:"GREGOBASE-403",key:"INTROIT",part:"in",page:"57"},
 {id:"GREGOBASE-205",key:"GRADUAL",part:"gr",page:"57"},
 {id:"GREGOBASE-524",key:"ALLELUIA",part:"al",page:"58"},
 {id:"GREGOBASE-1147",key:"OFFERTORY",part:"of",page:"59"},
 {id:"GREGOBASE-918",key:"COMMUNION",part:"co",page:"59"}
];
assert.equal(EPIPHANY_REFERENCE_WITNESS.sourcePath,"Sancti/01-06");
assert.equal(EPIPHANY_REFERENCE_WITNESS.massSourceRef,"ad8783641455bae38a8eb5782b34241a7b3ff2ef");
assert.equal(EPIPHANY_REFERENCE_SCORES.length,5);
assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.scoreCount,13);
assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.bindingCount,15);
for(let i=0;i<expected.length;i++){
 const e=expected[i],s=EPIPHANY_REFERENCE_SCORES[i];
 assert.deepEqual([s.id,s.key,s.part,s.folio],[e.id,e.key,e.part,e.page]);
 assert.equal(s.publicScoreApproved,false);
 assert.equal(s.editorialApproval,false);
 assert.equal(s.printedMusicCompared,false);
 assert.equal(s.actuallySung,"UNKNOWN");
 assert.equal(s.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+s.sourceId);
 assert.match(s.gabc,/\noffice-part: (in|gr|al|of|co);\nsource: Graduale Romanum 1961 p. \d+;\n%%\n/);
 const archive=JSON.parse(readFileSync(new URL("../"+s.archivePath,import.meta.url),"utf8"));
 const original=archive.items.find(row=>row.id===s.id);
 assert.ok(original,"Archived 1961 score unavailable: "+s.id);
 assert.equal(original.sourceEditionId,2);
 assert.equal(original.officePart,s.part);
 assert.equal(original.gradualeRomanum1961Page,s.folio);
 assert.equal(original.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
 assert.equal(original.sha256,s.sha256);
 assert.equal(s.gabc.split("\n%%\n")[1],original.gabc,
  "Archival notation was silently rewritten for "+s.id);
 assert.equal(createHash("sha256").update(original.gabc).digest("hex"),s.sha256,
  "Pinned GABC checksum mismatch for "+s.id);
}
assert.equal(EPIPHANY_REFERENCE_SCORES[2].incipit,EPIPHANY_REFERENCE_SCORES[4].incipit);
assert.notEqual(EPIPHANY_REFERENCE_SCORES[2].mode,EPIPHANY_REFERENCE_SCORES[4].mode,
 "Epiphany Alleluia and Communion are different melodic settings");
const epiphany={date:"2027-01-06",proper:{data:{sourcePath:"Sancti/01-06"}},overlays:[]};
const texts=[
 {id:"INTROIT.1",primary:"Ecce, advénit dominátor Dóminus: et regnum in manu ejus."},
 {id:"GRADUAL.1",primary:"Omnes de Saba vénient, aurum et thus deferéntes, et laudem Dómino annuntiántes."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Vídimus stellam ejus in Oriénte, et vénimus cum munéribus adoráre Dóminum."},
 {id:"OFFERTORY.1",primary:"Reges Tharsis, et ínsulæ múnera ófferent: reges Arabum et Saba dona addúcent."},
 {id:"COMMUNION.1",primary:"Vídimus stellam ejus in Oriénte, et vénimus cum munéribus adoráre Dóminum."}
];
const selection=(p,m=epiphany,form="SOLEMN")=>referenceScoresForParagraph({
 paragraph:p,resolvedMass:m,form
}).map(s=>s.id);
assert.deepEqual(texts.map(p=>selection(p)),expected.map(x=>[x.id]));
assert.deepEqual(texts.map(p=>selection(p,{...epiphany,date:"2026-01-06"})),expected.map(x=>[x.id]),
 "Correct date must apply in multiple years");
const combined={...texts[1],primary:texts[1].primary+" Allelúja, allelúja. "+texts[2].primary};
assert.deepEqual(selection(combined),["GREGOBASE-205","GREGOBASE-524"],
 "Original 1962 Graduale includes Alleluia; source-bound companion required");
assert.deepEqual(selection({...texts[1],primary:texts[2].primary}),[],
 "Alleluia-only text must not impersonate a Gradual");
assert.deepEqual(selection({...texts[2],primary:texts[4].primary}),["GREGOBASE-524"]);
assert.deepEqual(selection({...texts[4],primary:texts[2].primary}),["GREGOBASE-918"]);
for(const blocked of [
 {...epiphany,date:"2027-01-07"},
 {...epiphany,proper:{data:{sourcePath:"Sancti/01-07"}}},
 {...epiphany,overlays:["REQUIEM"]},
 {...epiphany,proper:{data:{sourcePath:"Tempora/Epi1-0"}}},
]){
 assert.ok(texts.every(p=>selection(p,blocked).length===0),
  "Unappointed 1961 melody leaked to a different Mass "+JSON.stringify(blocked));
}
assert.ok(texts.every(p=>selection(p,epiphany,"LOW").length===0));
assert.ok(texts.every(p=>selection(p,epiphany,"MISSA_PRIVATA").length===0));
assert.deepEqual(selection({...texts[4],id:"GRADUAL.1"}),[],
 "Matching Vidimus text cannot borrow Communion score for Gradual");
assert.deepEqual(selection({...texts[2],primary:"No source-backed Alleluia text"}),[]);
assert.deepEqual(selection({...texts[0],kind:"RUBRIC"}),[]);
const itinerary={supported:true,properProgramme:texts.map((text,i)=>({
 trackId:["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"][i],
 eventId:"EPIPHANY_PROPER_"+i,source:"THIS_MASS_RESOLVED_1962_PROPER",
 status:"SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE",lines:[{id:text.id,latin:text.primary}]
})),events:[]};
const schola=resolveScholaSelectedScoreAccess({itinerary,resolvedMass:epiphany,form:"SOLEMN"});
assert.deepEqual(schola.proper.map(x=>x.scores.map(s=>s.id)),expected.map(x=>[x.id]));
assert.equal(schola.publicApprovalsAdded,0);
assert.equal(schola.heardMusicInferred,false);
assert.equal(schola.proper.every(x=>x.actuallySinging==="UNKNOWN"),true);
const mergedItinerary={...itinerary,properProgramme:itinerary.properProgramme.map((e,i)=>i===1
 ? {...e,lines:[{id:"GRADUAL.1",latin:combined.primary}]}:e)};
const merged=resolveScholaSelectedScoreAccess({itinerary:mergedItinerary,resolvedMass:epiphany,form:"SOLEMN"});
assert.deepEqual(merged.proper[1].scores.map(s=>s.id),["GREGOBASE-205","GREGOBASE-524"]);
assert.equal(merged.proper[2].scores.length,0,
 "Same source Alleluia may not be shown twice in selected Schola itinerary");
console.log("EPIPHANY_FIVE_SOURCE_GABC_PASS 13 total archive scores, five 1961 Epiphany roles, identical Latin but distinct Alleluia/Communion melodies, unapproved");
