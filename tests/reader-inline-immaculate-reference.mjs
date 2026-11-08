import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {IMMACULATE_CONCEPTION_REFERENCE_SCORES,IMMACULATE_CONCEPTION_REFERENCE_WITNESS} from "../src/mass/reader-inline-immaculate-reference.js";
import {referenceScoresForParagraph,PROPER_REFERENCE_REGISTRY_STATUS} from "../src/mass/reader-inline-proper-reference.js";
import {PROPER_REFERENCE_BINDINGS} from "../src/mass/reader-inline-proper-registry.js";
import {resolveScholaSelectedScoreAccess} from "../src/mass/reader-schola-score-access.js";
// The actual pinned Latin source is Sancti/12-08, not an unverified
// title lookup or an inference from "Gaudens gaudebo" common text.
const expected=[
 ["GREGOBASE-622","INTROIT","in","400","3"],
 ["GREGOBASE-713","GRADUAL","gr","401","5"],
 ["GREGOBASE-1057","ALLELUIA","al","402","1"],
 ["GREGOBASE-210","OFFERTORY","of","404","8"],
 ["GREGOBASE-1004","COMMUNION","co","404","8"],
];
assert.equal(IMMACULATE_CONCEPTION_REFERENCE_WITNESS.sourcePath,"Sancti/12-08");
assert.equal(IMMACULATE_CONCEPTION_REFERENCE_WITNESS.massSourceRef,"ad8783641455bae38a8eb5782b34241a7b3ff2ef");
assert.ok(PROPER_REFERENCE_REGISTRY_STATUS.scoreCount>=5);
assert.deepEqual(PROPER_REFERENCE_BINDINGS.filter(b=>b.sourcePath==="Sancti/12-08").map(b=>[b.role,b.scoreId,b.paragraphId]),[
 ["INTROIT","GREGOBASE-622","INTROIT.1"],
 ["GRADUAL","GREGOBASE-713","GRADUAL.1"],
 ["ALLELUIA","GREGOBASE-1057","ALLELUIA_TRACT_SEQUENCE.1"],
 ["ALLELUIA","GREGOBASE-1057","GRADUAL.1"],
 ["OFFERTORY","GREGOBASE-210","OFFERTORY.1"],
 ["COMMUNION","GREGOBASE-1004","COMMUNION.1"]
]);
assert.equal(IMMACULATE_CONCEPTION_REFERENCE_SCORES.length,5);
for(let i=0;i<expected.length;i++){
 const s=IMMACULATE_CONCEPTION_REFERENCE_SCORES[i],e=expected[i];
 assert.deepEqual([s.id,s.key,s.part,s.folio,s.mode],e);
 assert.equal(s.publicScoreApproved,false);
 assert.equal(s.editorialApproval,false);
 assert.equal(s.printedMusicCompared,false);
 assert.equal(s.actuallySung,"UNKNOWN");
 assert.equal(s.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+s.sourceId);
 assert.match(s.gabc,/\noffice-part: (?:in|gr|al|of|co);\nsource: Graduale Romanum 1961 p. \d+;\n%%\n/);
 const archive=JSON.parse(readFileSync(new URL("../"+s.archivePath,import.meta.url),"utf8"));
 const original=archive.items.find(x=>x.id===s.id);
 assert.ok(original,"Pinned 1961 source missing for "+s.id);
 assert.equal(original.sourceEditionId,2);
 assert.equal(original.officePart,s.part);
 assert.equal(original.gradualeRomanum1961Page,s.folio);
 assert.equal(original.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
 assert.equal(original.sha256,s.sha256);
 assert.equal(s.gabc.split("\n%%\n")[1],original.gabc,"GABC altered for "+s.id);
 assert.equal(createHash("sha256").update(original.gabc).digest("hex"),s.sha256);
}
const mass={date:"2026-12-08",proper:{data:{sourcePath:"Sancti/12-08"}},overlays:[]};
const texts=[
 {id:"INTROIT.1",primary:"Gaudens gaudébo in Dómino, et exsultábit ánima mea in Deo meo: quia índuit me vestiméntis salútis."},
 {id:"GRADUAL.1",primary:"Benedícta es tu, Virgo María, a Dómino, Deo excélso, præ ómnibus muliéribus super terram."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Tota pulchra es, María: et mácula originális non est in te. Allelúja."},
 {id:"OFFERTORY.1",primary:"Ave, María, grátia plena; Dóminus tecum: benedícta tu in muliéribus, allelúja."},
 {id:"COMMUNION.1",primary:"Gloriósa dicta sunt de te, María: quia fecit tibi magna qui potens est."}
];
const roles=["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"];
const select=(p,resolvedMass=mass,form="SOLEMN")=>referenceScoresForParagraph({
 paragraph:p,resolvedMass,form
}).map(s=>s.id);
assert.deepEqual(texts.map(t=>select(t)),expected.map(e=>[e[0]]));
assert.deepEqual(texts.map(t=>select(t,{...mass,date:"2027-12-08"})),expected.map(e=>[e[0]]));
const combined={...texts[1],primary:texts[1].primary+" Tu glória Jerúsalem, tu lætítia Israël. Allelúja, allelúja. "+texts[2].primary};
assert.deepEqual(select(combined),["GREGOBASE-713","GREGOBASE-1057"]);
assert.deepEqual(select({...texts[1],primary:texts[2].primary}),[]);
for(const wrong of [
 {...mass,date:"2026-12-09"},
 {...mass,proper:{data:{sourcePath:"Sancti/12-09"}}},
 {...mass,proper:{data:{sourcePath:"Commune/C11"}}},
 {...mass,overlays:["REQUIEM"]},
]){
 assert.ok(texts.every(t=>select(t,wrong).length===0),"source guard leaked "+JSON.stringify(wrong));
}
for(const form of ["LOW","MISSA_PRIVATA"]){
 assert.ok(texts.every(t=>select(t,mass,form).length===0),form+" released chant score");
}
assert.deepEqual(select({...texts[0],primary:"Gaudens gaudébo in Dómino, Misericórdias Dómini in ætérnum cantábo."}),[],
 "The different 1961 p.103** Introit is not the appointed p.400 setting");
assert.deepEqual(select({...texts[3],primary:"Ave María, grátia plena: Dóminus tecum, et benedíctus fructus ventris tui."}),[],
 "Unrelated Ave Maria Offertory p.[79] must remain excluded");
assert.deepEqual(select({...texts[4],id:"OFFERTORY.1"}),[]);
assert.deepEqual(select({...texts[2],primary:"Alleluia. Ave Maria, gratia plena"}),[]);
assert.deepEqual(select({...texts[0],kind:"RUBRIC"}),[]);
const itinerary={supported:true,properProgramme:texts.map((t,i)=>({
 trackId:roles[i],eventId:"IMM_CONCEPTION_"+i,
 source:"THIS_MASS_RESOLVED_1962_PROPER",
 status:"SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE",lines:[{id:t.id,latin:t.primary}]
})),events:[]};
const schola=resolveScholaSelectedScoreAccess({itinerary,resolvedMass:mass,form:"SOLEMN"});
assert.deepEqual(schola.proper.map(x=>x.scores.map(s=>s.id)),expected.map(e=>[e[0]]));
assert.equal(schola.proper.every(x=>x.notAnApproval&&x.actuallySinging==="UNKNOWN"),true);
assert.equal(schola.publicApprovalsAdded,0);
assert.equal(schola.heardMusicInferred,false);
const merged=resolveScholaSelectedScoreAccess({itinerary:{...itinerary,properProgramme:
 itinerary.properProgramme.map((e,i)=>i===1?{...e,lines:[{id:"GRADUAL.1",latin:combined.primary}]}:e)
},resolvedMass:mass,form:"SOLEMN"});
assert.deepEqual(merged.proper[1].scores.map(s=>s.id),["GREGOBASE-713","GREGOBASE-1057"]);
assert.equal(merged.proper[2].scores.length,0,"Duplicate Alleluia in combined source");
console.log("IMMACULATE_FIVE_SCORE_SOURCE_PASS five original 1961 CC0 GABCs, source-specific bindings, appointed 1962 Mass, no publication approval");
