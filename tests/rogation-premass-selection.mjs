import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 isLesserRogationDay,resolvedRogationCandidate,rogationPrefaceReady,
 projectRogationPreflight,rogationPublicChoiceReady
} from "../src/mass/rogation-preflight.js";
import {prepareMassSessionFromV346} from "../src/mass/host-adapter.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sourceGate=load("../data/mass/rogation-proper-source-gate.v1.json");
const sourceProper=load("../data/mass/rogation-proper-trilingual.v1.json");
const preface=load("../data/mass/rogation-easter-preface.v1.json");
const library={sourceGate,sourceProper,preface};
assert.equal(preface.status,"PUBLISHED_1962_EASTER_PREFACE");
assert.equal(preface.source.visualWitness.status,"ORIGINAL_1962_PRINTED_PAGES_VISUALLY_VERIFIED");
assert.match(preface.source.visualWitness.page234,/316.png/);
assert.match(preface.source.visualWitness.page235,/317.png/);
assert.equal(preface.publicationAllowed,true);
assert.equal(rogationPrefaceReady(preface),true);
assert.match(preface.text.lat,/in hoc potissimum/);
assert.doesNotMatch(preface.text.lat,/in hac potissimum die/);
assert.equal(rogationPublicChoiceReady(library),true);
const proper={sourcePath:"Tempora/Pasc5-0",introit:{lat:"Deus",en:"God",fr:"Dieu"}};
for(const date of ["2024-05-06","2027-05-03"]){
 assert.equal(isLesserRogationDay(date),true);
 const legacy={canStart:true,date,calendarRank:4,properSource:"Tempora/Pasc5-0",
  calendarDay:{id:"feria-rogationum"},requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day"};
 assert.equal(resolvedRogationCandidate(legacy).eligible,true);
 const resolvedDay={status:"ready",day:{main:{rank:4}},
  proper:{status:"ready",data:{sourcePath:"Tempora/Pasc5-0"}}};
 const resolved=resolvedRogationCandidate(
  {...legacy,calendarRank:undefined,properSource:undefined},resolvedDay,{requireResolver:true});
 assert.equal(resolved.eligible,true,"real day resolver should supply missing legacy fields");
 assert.equal(resolved.authority,"DAY_RESOLVER");
 assert.equal(resolvedRogationCandidate(legacy,null,{requireResolver:true}).eligible,false,
  "public Rogation choice must wait for real day resolver");
 assert.equal(resolvedRogationCandidate(legacy,{...resolvedDay,day:{main:{rank:1}}},{requireResolver:true}).eligible,false,
  "resolved first-class celebration must impede the Rogation candidate");
 assert.equal(resolvedRogationCandidate(legacy,{...resolvedDay,proper:{status:"ready",data:{sourcePath:"Sancti/05-03"}}},{requireResolver:true}).eligible,false,
  "resolved saint Mass may not be misrepresented as a white feria");
 const checked=projectRogationPreflight({legacy,
  resolvedDay,requireResolver:true,choice:"DAY_MASS",service:"PUBLIC_PROCESSION",library});
 assert.equal(checked.selection.observanceConfirmed,true);

 const initial=projectRogationPreflight({legacy,library});
 assert.equal(initial.visible,true);
 assert.equal(initial.selection,null,"date MUST NOT imply public litanies");
 const after=projectRogationPreflight({legacy,choice:"DAY_MASS",service:"PUBLIC_PROCESSION",library});
 assert.deepEqual(after.selection && [after.selection.choice,after.selection.service],["DAY_MASS","PUBLIC_PROCESSION"]);
 const composed=prepareMassSessionFromV346(legacy,{proper,rogationSelection:after.selection});
 assert.equal(composed.plan.massEntry,"INTROIT");
 assert.equal(composed.resolvedMass.proper.data.sourcePath,"Tempora/Pasc5-0");
 assert.deepEqual([...composed.plan.precedingGraphs],["ROGATIONS"]);
 assert.notEqual(composed.resolvedMass.actualCelebration.id,"rogation-mass-1962");
 assert.equal(prepareMassSessionFromV346(legacy,{proper}).plan.massEntry,"FOOT_CLUSTER");
 const dedicated=projectRogationPreflight({legacy,choice:"ROGATION_MASS",service:"PUBLIC_PROCESSION",library});
 assert.equal(dedicated.available,true);
 assert.equal(dedicated.selection.choice,"ROGATION_MASS");
 const irrelevant=projectRogationPreflight({legacy:{...legacy,calendarRank:1},library});
 assert.equal(irrelevant.visible,false);
 const wrongSource=projectRogationPreflight({legacy:{...legacy,properSource:"Sancti/05-03"},library});
 assert.equal(wrongSource.visible,false);
 const synthetic=structuredClone(library);
 synthetic.preface.publicationAllowed=false;
 assert.equal(rogationPublicChoiceReady(synthetic),false,"Unpublished Preface must close the choice");
 synthetic.preface.publicationAllowed=true;
 synthetic.sourceGate.publicationAllowed=false;
 assert.equal(rogationPublicChoiceReady(synthetic),false,"Unpublished gate must close the choice");
 synthetic.sourceGate.publicationAllowed=true;
 synthetic.sourceProper.publicationAllowed=false;
 assert.equal(rogationPublicChoiceReady(synthetic),false,"Unpublished text corpus must close the choice");
 synthetic.sourceProper.publicationAllowed=true;
 assert.equal(rogationPublicChoiceReady(synthetic),true);
 const chosen=projectRogationPreflight({legacy,choice:"ROGATION_MASS",service:"PUBLIC_PROCESSION",library:synthetic});
 assert.equal(chosen.selection.choice,"ROGATION_MASS");
 assert.match(chosen.selection.preface.lat,/in hoc potissimum/);
 const result=prepareMassSessionFromV346(legacy,{proper,rogationSelection:chosen.selection});
 assert.equal(result.resolvedMass.actualCelebration.id,"rogation-mass-1962");
 assert.equal(result.resolvedMass.provenance.colour,"violet");
 assert.equal(result.resolvedMass.provenance.gloria,false);
 assert.equal(result.resolvedMass.provenance.credo,false);
 assert.equal(result.plan.massEntry,"INTROIT");
 assert.ok(result.plan.precedingGraphs.includes("ROGATIONS"));
 assert.match(result.resolvedMass.proper.data.preface.fr,/Christ/);
}
for(const date of ["2024-05-05","2024-05-09","2027-05-10","2026-10-10","2027-04-25"]){
 assert.equal(isLesserRogationDay(date),false,date+" is not a lesser Rogation day");
}
console.log("Rogation pre-Mass eligibility and source-closed conditional R17 assembly: PASS (2024/2027, EN/FR).");
