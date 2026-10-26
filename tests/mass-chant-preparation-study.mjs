import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  MASS_CHANT_PREPARATION_AUDIO_SCHEMA,VERIFIED_PREPARATION_RECORDINGS,
  preparableChantScores,licensedChantPreparationRecording,
} from "../src/mass/mass-chant-preparation-study.js";
import {createMassChantProgramme} from "../src/mass/mass-chant-programme.js";
import {matchSourceOwnedProperScores} from "../src/mass/reader-proper-chant-crosswalk.js";
assert.equal(MASS_CHANT_PREPARATION_AUDIO_SCHEMA,"ao-mass-chant-preparation-audio-v1");
assert.equal(VERIFIED_PREPARATION_RECORDINGS.length,0,"Never invent or stream unreviewed recordings");
const mass={date:"2026-12-25",celebrationId:"mass_of_day",properSource:"Tempora/12-25-3"};
const programme=createMassChantProgramme(mass,{form:"MISSA_CANTATA_INCENSE",kind:"CALENDAR",
  selectedScores:{KYRIE:"GREGOBASE-1184",CREDO:"GREGOBASE-749"}});
assert.deepEqual(preparableChantScores(programme,null).map(x=>x.id),
  ["GREGOBASE-1184","GREGOBASE-749"]);
const candidate={schema:"ao-reader-proper-slots-v1",sourcePath:"Tempora/12-25-3",
  slots:{INTROIT:{status:"READY",data:{paragraphs:[{latin:"Puer natus est nobis."}]}},
    COMMUNION:{status:"READY",data:{paragraphs:[{latin:"Viderunt omnes fines terrae salutare Dei nostri."}]}}}};
const crosswalk=matchSourceOwnedProperScores(candidate);
assert.deepEqual(preparableChantScores(programme,crosswalk).map(x=>x.id),
  ["GREGOBASE-1184","GREGOBASE-749","GREGOBASE-72","GREGOBASE-1139"]);
assert.equal(preparableChantScores(null,null).length,0);
assert.equal(licensedChantPreparationRecording("GREGOBASE-1184"),null);
const pretend={scoreId:"GREGOBASE-1184",status:"CLEARED",sourceUrl:"https://example.org",
  mediaUrl:"https://example.org/recording.ogg",licenseVerified:true,editionVerified:true,
  humanReview:"PASS"};
for(const field of ["status","sourceUrl","mediaUrl","licenseVerified","editionVerified","humanReview"]){
  const altered={...pretend};
  if(field==="status")altered.status="PENDING";
  else if(field==="licenseVerified"||field==="editionVerified")altered[field]=false;
  else if(field==="humanReview")altered.humanReview="PENDING";
  else altered[field]=null;
  assert.equal(licensedChantPreparationRecording("GREGOBASE-1184",{recordings:[altered]}),null,
    "No unapproved recording may become playable: "+field);
}
assert.equal(licensedChantPreparationRecording("GREGOBASE-1184",{recordings:[pretend]})?.mediaUrl,
  pretend.mediaUrl);
const source=readFileSync(new URL("../src/mass/mass-chant-preparation-study.js",import.meta.url),"utf8");
const preflight=readFileSync(new URL("../src/mass/full-mass-preflight.js",import.meta.url),"utf8");
const reader=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.match(source,/createOfflineChantEngraver/);
assert.match(source,/VERIFIED_PREPARATION_RECORDINGS=Object\.freeze\(\[\]\)/);
assert.match(preflight,/mountMassChantPreparationStudy/);
assert.match(preflight,/properToReaderSlots\(source,\{language:summary\.readerLanguage\}\)/);
assert.match(preflight,/matchSourceOwnedProperScores\(slots\)/);
assert.match(reader,/properScoreMatches:matchSourceOwnedProperScores\(properChantSlots\)/);
assert.doesNotMatch(reader,/mass-chant-preparation-study\.js/);
console.log("PASS preparation-only score study, source crosswalk and verified-audio deny-by-default");
