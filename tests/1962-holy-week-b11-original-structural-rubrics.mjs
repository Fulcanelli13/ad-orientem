/** B11: read the ORIGINAL image headings as rite boundaries, not as missing prayer strings. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPalmPayload} from "../src/mass/reader-palm.js";
import {buildGoodFridayReader} from "../src/mass/reader-good-friday.js";
import {buildEasterVigilReader} from "../src/mass/reader-easter-vigil.js";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const primary=load("data/mass/independent-1962-holy-week-b09-original-image-witness.v1.json");
const b04=load("data/mass/independent-1962-holy-week-b04.v1.json");
const ledger=load("data/mass/independent-1962-holy-week-b11-structural-selected-proper.v1.json");
const evSource=load("data/mass/special-days-core.v1.1.json");
const extras=load("data/mass/special-days-extension.v1.3.json");
const palmText=load("data/presentation/reader-palm.v1.json");
const gfText=load("data/presentation/reader-good-friday.v1.json");
const evText=load("data/presentation/reader-easter-vigil.v1.json");
const structuralIds=[
 "BEGIN_PALM_BLESSING","CHRISM_MASS_DISTINCT","EVENING_MASS_DISTINCT",
 "GOOD_FRIDAY_NOT_AN_ORDINARY_MASS","CROSS_BEFORE_COMMUNION","VIGIL_HEADING"
];
assert.equal(ledger.schema,"AO_MR1962_HOLY_WEEK_B11_ORIGINAL_RITE_STRUCTURE_AND_SELECTED_PROPER_V1");
assert.equal(ledger.records.length,7);
assert.equal(new Set(ledger.records.map(r=>r.id)).size,7);
const byId=new Map(ledger.records.map(row=>[row.id,row]));
for(const id of [...structuralIds,"HOLY_THURSDAY_INTROIT"]){
 const original=primary.witnesses.find(x=>x.id===id),candidate=byId.get(id);
 assert.ok(original&&candidate,id+" missing original 1962 folio witness/crosswalk");
 assert.equal(candidate.printedPage,original.printedPage,id+" wrong original printed page");
}
for(const id of structuralIds.filter(x=>x!=="CHRISM_MASS_DISTINCT"))
 assert.equal(byId.get(id).status,"NATIVE_RITE_STRUCTURE_MATCH",id);
assert.equal(byId.get("CHRISM_MASS_DISTINCT").status,"SEPARATE_CHRISM_MASS_UNVERIFIED");
assert.equal(byId.get("HOLY_THURSDAY_INTROIT").status,"MATCHED_NATIVE_SELECTED_LATIN_INTROIT");
assert.deepEqual(ledger.counts,{
 priorB10ExactLatinIncipits:22,remainingB10Observations:7,
 structuralRiteMatches:5,structuralHolds:1,sourceSelectedIntroitMatches:1,
 fullyCollatedLatinTexts:0,certifiedEnglishFrenchTranslations:0
});

// 1. Palm blessing precedes, and is not the same surface as, ordinary Mass.
assert.equal(extras.graphs.PALM.length,12);
const palm=buildPalmPayload({graph:extras.graphs.PALM,payload:palmText});
assert.equal(palm.cards[0].id,"PALM-R01");
assert.equal(palm.cards[0].title,"Blessing of Palms");
assert.equal(palm.cards.at(-1).id,"PALM-R07");
assert.equal(palm.cards.at(-1).handoff,"INTROIT");
assert.equal(palm.cards.at(-1).ordinaryOpeningSuppressed,true);

// 2. Chrism Mass is a distinct printed form and NOT proven by the universal evening selection.
const holyThursday=b04.rites.find(x=>x.id==="HOLY_THURSDAY_1962");
assert.equal(holyThursday.appRootSourcePath,"Tempora/Quad6-4r");
assert.equal(primary.witnesses.find(x=>x.id==="CHRISM_MASS_DISTINCT").reading,"DE MISSA CHRISMATIS");
assert.equal(primary.witnesses.find(x=>x.id==="EVENING_MASS_DISTINCT").reading,
 "DE MISSA SOLEMNI VESPERTINA IN CENA DOMINI");
assert.ok(!ledger.nonClaims.some(x=>x.includes("Chrism Mass is supported")),
 "Chrism form cannot be certified by the evening Proper");
assert.deepEqual(extras.graphs.HT_POST.map(x=>x.id),[
 "HT-TRN-010","HT-TRN-020","HT-TRN-030","HT-TRN-040","HT-STRIP-010","HT-POST-900"
]);

// 3. Good Friday is a distinct non-Mass action; cross veneration comes before Communion.
const gfPlan=compileMassPlan(makeResolvedMass({
 date:"2026-04-03",form:"SOLEMN",presentationMode:"LIVE",
 calendarCelebration:{id:"good-friday",type:"CALENDAR"},distinctRite:"GOOD_FRIDAY"
}));
assert.equal(gfPlan.kind,"DISTINCT_RITE");
assert.equal(gfPlan.rite,"GOOD_FRIDAY");
assert.equal(gfPlan.canonicalMassGraphActive,false);
const friday=buildGoodFridayReader({graph:evSource.graphs.GF,payload:gfText});
assert.equal(friday.ordinaryMassGraphActive,false);
assert.equal(friday.sourceRecordCount,56);
const gfIds=friday.steps.map(x=>x.recordId);
const first=id=>gfIds.indexOf(id);
for(const id of ["GF-VEN-600","GF-VEN-640","GF-X-700","GF-COM-800","GF-COM-830"]){
 assert.ok(first(id)>=0,"Good Friday graph lost "+id);
}
assert.ok(first("GF-VEN-640")<first("GF-X-700"),"Cross replacement before veneration");
assert.ok(first("GF-X-700")<first("GF-COM-800"),"Communion entered before the Cross was replaced");
assert.ok(first("GF-COM-800")<first("GF-COM-830"),"Pater noster outside post-veneration Communion");

// 4. Easter Vigil is its own restored-1962 pre-Mass rite, with a Kyrie handoff.
const vigil=buildEasterVigilReader({graph:evSource.graphs.EV,payload:evText,fontMode:"NONE"});
assert.equal(vigil.ordinaryMassGraphActive,false);
assert.equal(vigil.sourceRecordCount,38);
const evIds=vigil.steps.map(x=>x.recordId);
assert.equal(evIds[0],"EV-FIRE-010");
assert.ok(evIds.indexOf("EV-EXS-200")<evIds.indexOf("EV-MASS-700"));
assert.equal(evIds.at(-1),"EV-MASS-700");
assert.equal(vigil.steps.at(-1).handoffToMass,true);

console.log("PASS B11 PRINTED RITE STRUCTURE="+JSON.stringify({
 headings:6,structuralMatches:5,distinctChrismHold:1,sourceSelectedIntroitBrowserGate:true,
 originalLatinWholeTextsCertified:false,translationsCertified:false
}));
