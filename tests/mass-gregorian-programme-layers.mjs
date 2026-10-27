import assert from "node:assert/strict";
import {matchSourceOwnedProperScores} from "../src/mass/reader-proper-chant-crosswalk.js";
import {createMassChantProgramme} from "../src/mass/mass-chant-programme.js";
import {
  composeGregorianProgrammeLayers,GREGORIAN_PROGRAMME_LAYERS_SCHEMA,
  GREGORIAN_LOCAL_EVIDENCE_SCHEMA,
} from "../src/mass/mass-gregorian-programme-layers.js";

const slots={
  schema:"ao-reader-proper-slots-v1",sourcePath:"Tempora/Pent21-0",
  slots:Object.fromEntries([
    ["INTROIT","In voluntate tua, Domine, universa sunt posita."],
    ["GRADUAL","Domine refugium factus es nobis."],
    ["ALLELUIA_TRACT_SEQUENCE","Alleluia, alleluia. In exitu Israel de Aegypto."],
    ["OFFERTORY","Vir erat in terra nomine Job."],
    ["COMMUNION","In salutari tuo anima mea."],
  ].map(([id,latin])=>[id,{status:"READY",data:{paragraphs:[{latin}]}}])),
};
const crosswalk=matchSourceOwnedProperScores(slots);
assert.equal(crosswalk.candidates.length,5,"Reuse existing pilot, never build copies for parishes");
const date="2026-10-18";
const context={properCrosswalk:crosswalk,date,siteId:"SITE-PARIS",instituteId:"ICKSP"};
const blank=composeGregorianProgrammeLayers(context);
assert.equal(blank.schema,GREGORIAN_PROGRAMME_LAYERS_SCHEMA);
assert.equal(blank.standard.references.length,5);
assert.equal(blank.standard.approvedCount,0,"Reference scores are not approved notation");
assert.equal(blank.local.status,"UNKNOWN");
assert.equal(blank.institute.status,"UNKNOWN");
assert.equal(blank.user.status,"UNKNOWN");
assert.equal(blank.autoAssignedPerformanceScore,null);
assert.equal(blank.autoPlayback,false);
assert.equal(blank.liturgicalProperOwner,"EXISTING_1962_MASS_HOST");

const custom={
  schema:GREGORIAN_LOCAL_EVIDENCE_SCHEMA,status:"SOURCE_DOCUMENTED",
  kind:"INSTITUTE_CUSTOM",id:"icrsp-chant-practice",riteId:"ROMAN_1962",
  instituteId:"ICKSP",sourceUrl:"https://example.org/chant-practice",
  tracks:{INTROIT:"GREGORIAN",SANCTUS_BENEDICTUS:"POLYPHONY"},
};
const local={
  schema:GREGORIAN_LOCAL_EVIDENCE_SCHEMA,status:"SOURCE_DOCUMENTED",
  kind:"SITE_MASS_PROGRAMME",id:"bulletin-20261018",riteId:"ROMAN_1962",
  siteId:"SITE-PARIS",massDate:date,sourcePath:"Tempora/Pent21-0",
  sourceUrl:"https://example.org/site-paris/2026-10-18",
  tracks:{INTROIT:"PSALM_TONE",SANCTUS_BENEDICTUS:"POLYPHONY"},
};
const known=composeGregorianProgrammeLayers({...context,evidence:[custom,local]});
assert.equal(known.standard.references.length,5,"Site variations cannot mutate universal score references");
assert.equal(known.local.status,"SOURCE_DOCUMENTED_SITE_PROGRAMME");
assert.equal(known.local.source.tracks.INTROIT,"PSALM_TONE");
assert.equal(known.institute.status,"DOCUMENTED_CUSTOM_NOT_SITE_PERFORMANCE");
assert.equal(known.institute.source.tracks.INTROIT,"GREGORIAN");
assert.equal(known.local.actualChoirPerformanceConfirmed,false);
assert.equal(known.autoAssignedPerformanceScore,null);
const otherChurch=composeGregorianProgrammeLayers({...context,siteId:"SITE-LONDON",evidence:[custom,local]});
assert.equal(otherChurch.standard.references.length,5);
assert.equal(otherChurch.local.status,"UNKNOWN","No borrowing Paris performances in London");
assert.equal(otherChurch.institute.status,"DOCUMENTED_CUSTOM_NOT_SITE_PERFORMANCE");
const otherInstitute=composeGregorianProgrammeLayers({...context,instituteId:"FSSP",evidence:[custom,local]});
assert.equal(otherInstitute.institute.status,"UNKNOWN","Institute practice not inferred from Rite alone");
assert.equal(otherInstitute.local.status,"SOURCE_DOCUMENTED_SITE_PROGRAMME");
for(const bad of [
  {...context,date:"2026-10-19",evidence:[local]},
  {...context,siteId:"SITE-LONDON",evidence:[local]},
  {...context,properCrosswalk:{...crosswalk,sourcePath:"Sancti/10-18"},evidence:[local]},
]) assert.equal(composeGregorianProgrammeLayers(bad).local.status,"UNKNOWN",
  "Evidence must belong to this site's specific Mass and resolved Proper");
for(const bad of [
  {...local,status:"UNVERIFIED"},
  {...local,sourceUrl:"http://example.org/unsafe"},
  {...local,tracks:{INTROIT:"MAGICAL_MELODY"}},
  {...local,tracks:{}},
  {...local,tracks:{INVENTED_TRACK:"GREGORIAN"}},
])assert.equal(composeGregorianProgrammeLayers({...context,evidence:[bad]}).local.status,"UNKNOWN",
  "Unsupported local assertion must fail closed");
assert.equal(composeGregorianProgrammeLayers({...context,evidence:[local,{...local,id:"other-claim"}]}).local.status,
  "CONFLICTING_SITE_EVIDENCE","Never silently choose one inconsistent bulletin");
const unrelated=composeGregorianProgrammeLayers({...context,riteId:"DOMINICAN",evidence:[local,custom]});
assert.equal(unrelated.standard.references.length,0);
assert.equal(unrelated.local.status,"UNKNOWN");
assert.equal(unrelated.institute.status,"UNKNOWN");
const selected=createMassChantProgramme({
  date,celebrationId:"mass_of_day",properSource:"Tempora/Pent21-0",
},{form:"SOLEMN",kind:"CALENDAR",selectedScores:{KYRIE:"GREGOBASE-2982"}});
const user=composeGregorianProgrammeLayers({...context,chantProgramme:selected});
assert.equal(user.user.selections[0].scoreId,"GREGOBASE-2982");
assert.equal(user.user.status,"USER_SELECTED_UNVERIFIED");
assert.equal(user.local.status,"UNKNOWN","Self-reported Ordinary is not external choir evidence");
assert.equal(composeGregorianProgrammeLayers({...context,date:"2026-10-19",chantProgramme:selected}).user.status,"UNKNOWN");
assert.equal(composeGregorianProgrammeLayers({...context,
  properCrosswalk:{...crosswalk,sourcePath:"Sancti/10-18"},chantProgramme:selected}).user.status,"UNKNOWN",
  "User selections cannot travel to another Proper on the same calendar day");
const disabled=composeGregorianProgrammeLayers({properCrosswalk:null,date});
assert.equal(disabled.standard.references.length,0);
console.log("PASS Gregorian layering: reuse source-owned 1962 Proper, site and institute evidence isolated, no auto-performance");
