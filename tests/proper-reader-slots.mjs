import assert from "node:assert/strict";
import { properToReaderSlots, assertReaderProperReady } from "../src/mass/proper-reader-slots.js";
import { composeProperReaderParagraphs } from "../src/mass/proper-reader-composition.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";

const t=(lat,en)=>({lat,en,fr:""});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia"),
  sequence:{lat:"",en:"",fr:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const mapped=properToReaderSlots(proper);
assert.equal(mapped.ready,true);
assert.equal(mapped.missing.length,0);
assert.equal(mapped.slots.INTROIT.status,"READY");
assert.equal(mapped.slots.GRADUAL.data.paragraphs[0].latin,"Graduale et Alleluia");
assert.equal(mapped.slots.ALLELUIA_TRACT_SEQUENCE.status,"NOT_APPLICABLE");
assert.equal(assertReaderProperReady(mapped),mapped);

const withSequence=properToReaderSlots({...proper,sequence:t("Dies irae","Day of wrath")});
assert.equal(withSequence.slots.ALLELUIA_TRACT_SEQUENCE.status,"READY");
assert.equal(withSequence.slots.ALLELUIA_TRACT_SEQUENCE.data.paragraphs[0].vernacular,"Day of wrath");

const frenchProper={
  ...proper,
  introit:{lat:"Introitus",en:"",fr:"Introït"},
  collects:[{lat:"Collecta",en:"",fr:"Collecte"}],
  epistle:{lat:"Epistola",en:"",fr:"Épître"},
  gradual:{lat:"Graduale",en:"",fr:"Graduel"},
  gospel:{lat:"Evangelium",en:"",fr:"Évangile"},
  offertory:{lat:"Offertorium",en:"",fr:"Offertoire"},
  secrets:[{lat:"Secreta",en:"",fr:"Secrète"}],
  preface:{lat:"Praefatio",en:"",fr:"Préface"},
  communion:{lat:"Communio",en:"",fr:"Communion"},
  postcommunions:[{lat:"Postcommunio",en:"",fr:"Postcommunion"}],
};
const french=properToReaderSlots(frenchProper,{language:"fr"});
assert.equal(french.ready,true,"French Proper failed reader readiness");
assert.equal(french.slots.INTROIT.data.paragraphs[0].vernacular,"Introït");
const frenchSuppressed=properToReaderSlots({...frenchProper,communion:{}},{
  language:"fr",
  notApplicableSlots:["COMMUNION"],
});
assert.equal(frenchSuppressed.ready,true,"French Proper lost certified NOT_APPLICABLE support");
assert.equal(frenchSuppressed.slots.COMMUNION.status,"NOT_APPLICABLE");

// The derived intermediate Amen and canonical final Amen have the same
// text, but the responding actor differs between LOW and SUNG source clocks.
for(const [form,role] of [["LOW","MINISTERS"],["SUNG","RESPONDERS"]]){
  const p=composeProperReaderParagraphs("AO.SM.B019",[{
    id:"COLLECT_SET.1.AMEN",kind:"RESPONSE",
    latin:"℟. Amen.",vernacular:"℟. Amen.",speakerRole:"RESPONDERS",
    prayerRole:"ORATION_RESPONSE",liturgicalGroup:"COLLECT_SET.1",
  }],{language:"fr",form});
  assert.equal(p[0].speakerRole,role,form+" intermediate Collect Amen actor mismatch");
  assert.equal(p[1].id,"AO.SM.C0074");
  assert.equal(p[1].speakerRole,role,form+" canonical final Collect Amen actor mismatch");
}

// A translated first prayer must never hide an untranslated additional
// commemoration in the actual rendered Mass Proper.
const commemoration={...proper,collects:[t("Oratio","Collect"),{lat:"Commemoratio",en:"",fr:"Commémoraison"}]};
const missingCommemoration=properToReaderSlots(commemoration,{language:"en"});
assert.equal(missingCommemoration.ready,false,"Reader silently dropped the second collect");
assert.equal(missingCommemoration.slots.COLLECT_SET.status,"MISSING");
assert.ok(missingCommemoration.missing.includes("COLLECT_SET"));
assert.throws(()=>assertReaderProperReady(missingCommemoration),/COLLECT_SET/);
const completeFrenchCommemoration=properToReaderSlots({...frenchProper,collects:[
 {lat:"Oratio",en:"",fr:"Collecte"},{lat:"Commemoratio",en:"",fr:"Commémoraison"}
]},{language:"fr"});
assert.equal(completeFrenchCommemoration.ready,true);
const twoCollects=completeFrenchCommemoration.slots.COLLECT_SET.data.paragraphs;
assert.equal(twoCollects.length,4,"separate Collect groups must include intermediate Amen and second Oremus");
assert.deepEqual(twoCollects.map(x=>x.id),[
  "COLLECT_SET.1","COLLECT_SET.1.AMEN","COLLECT_SET.2.OREMUS","COLLECT_SET.2",
]);
assert.equal(twoCollects[1].kind,"RESPONSE");
assert.equal(twoCollects[1].speakerRole,"RESPONDERS");
assert.equal(twoCollects[2].speakerRole,"PRIEST");
assert.equal(twoCollects[2].latin,"Orémus.");
assert.equal(twoCollects[2].vernacular,"Prions.");
// Source text remains byte-for-byte intact while public responses are detached.
const printedAmen=properToReaderSlots({...frenchProper,collects:[
 {lat:"Príma orátio. Amen.",fr:"Première collecte. Ainsi soit-il."},
 {lat:"Secúnda orátio. Amen.",fr:"Deuxième collecte. Ainsi soit-il."},
]},{language:"fr"}).slots.COLLECT_SET.data.paragraphs;
assert.deepEqual(printedAmen.filter(p=>p.kind==="TEXT").map(p=>p.latin),[
 "Príma orátio.","Secúnda orátio.",
]);
assert.deepEqual(printedAmen.filter(p=>p.kind==="RESPONSE").map(p=>p.latin),[
 "℟. Amen.",
]); // The final Amen is owned by B019 C0074, not the slot.
assert.deepEqual(printedAmen.map(p=>p.id),[
 "COLLECT_SET.1","COLLECT_SET.1.AMEN","COLLECT_SET.2.OREMUS","COLLECT_SET.2",
]);
for(const [property,slot] of [["secrets","SECRET_SET"],["postcommunions","POSTCOMMUNION_SET"]]){
 const mixed=properToReaderSlots({...proper,[property]:[t("Oratio","Prayer"),{lat:"Commemoratio",en:"",fr:""}]});
 assert.equal(mixed.ready,false,slot+" silently filtered a missing commemoration");
 assert.ok(mixed.missing.includes(slot));
}
const missing=properToReaderSlots({...proper,gospel:{}});
assert.equal(missing.ready,false);
assert.ok(missing.missing.includes("GOSPEL"));
assert.throws(()=>assertReaderProperReady(missing),/GOSPEL/);

// The canonical Ordinary already supplies the post-Epistle and post-Gospel
// responses. If an imported source carries the same reply, display it only
// once, with the reply owned by its immutable cue (B020/B026).
const readingSource={
  epistle:{
    lat:"Léctio Epístolæ.\n℟. Deo grátias.",
    en:"Lesson from the Epistle.\n℟. Thanks be to God.",
    fr:"Lecture de l’Épître.\n℟. Deo gratias — Rendons grâce à Dieu.",
  },
  gospel:{
    lat:"Sequéntia sancti Evangélii.\n℟. Laus tibi, Christe.",
    en:"Continuation of the holy Gospel.\n℟. Praise be to Thee, O Christ.",
    fr:"Suite du saint Évangile.\n℟. Louange à vous, ô Christ.",
  },
};
for(const language of ["en","fr"]){
  const slots=properToReaderSlots({...(language==="fr"?frenchProper:proper),...readingSource},{language});
  assert.equal(slots.ready,true,language+" reading response dedup blocked a valid Proper");
  const epistle=slots.slots.EPISTLE_OR_LESSON.data.paragraphs[0];
  const gospel=slots.slots.GOSPEL.data.paragraphs[0];
  assert.equal(epistle.latin,"Léctio Epístolæ.");
  assert.equal(gospel.latin,"Sequéntia sancti Evangélii.");
  assert.doesNotMatch(epistle.vernacular,/Thanks be to God|Deo gratias/iu);
  assert.doesNotMatch(gospel.vernacular,/Praise be to Thee|Louange à vous/iu);
  assert.equal(epistle.fixedResponseCueId,"AO.SM.C0076");
  assert.equal(gospel.fixedResponseCueId,"AO.SM.C0087");
  const epistleCard=composeProperReaderParagraphs("AO.SM.B020",
    slots.slots.EPISTLE_OR_LESSON.data.paragraphs,{language});
  const gospelCard=composeProperReaderParagraphs("AO.SM.B026",
    slots.slots.GOSPEL.data.paragraphs,{language});
  assert.deepEqual(epistleCard.filter(p=>p.kind==="RESPONSE").map(p=>p.id),
    ["AO.SM.C0076"],"Epistle must have exactly one canonical Deo gratias reply");
  assert.deepEqual(gospelCard.filter(p=>p.kind==="RESPONSE").map(p=>p.id),
    ["AO.SM.C0087"],"Gospel must have exactly one canonical Laus tibi reply");
  assert.equal(gospelCard.at(-1).id,"AO.SM.C0088",
    "Gospel kiss prayer must remain after the public response");
}
assert.match(readingSource.epistle.lat,/Deo grátias/,
  "source data must remain authoritative and untouched");
assert.match(readingSource.gospel.lat,/Laus tibi/,
  "source Gospel text must remain untouched");
// Similar words in the biblical text are not sufficient to erase a line:
// removal requires a separate terminal rubric/response with ℟. or R.
const unmarkedReading=properToReaderSlots({...proper,
  epistle:{lat:"Léctio. Deo grátias.",en:"Reading. Thanks be to God."},
}).slots.EPISTLE_OR_LESSON.data.paragraphs[0];
assert.equal(unmarkedReading.latin,"Léctio. Deo grátias.");
assert.equal(unmarkedReading.vernacular,"Reading. Thanks be to God.");

// Missal 1962 §481: only the final Secret's "Per omnia" is audible.
// Its words and the respondent Amen are the immutable B041 cue pair;
// no part of the bilingual source Proper may be duplicated in B040.
const fullSecretEnding={
 lat:"Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
 en:"Through our Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
 fr:"Par Notre-Seigneur Jésus-Christ, votre Fils, qui vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
};
const secretSource=()=>({lat:"Hæc sacra nobis, Dómine.\n"+fullSecretEnding.lat,
 en:"May these offerings please Thee.\n"+fullSecretEnding.en,
 fr:"Accueillez notre offrande.\n"+fullSecretEnding.fr});
for(const language of ["en","fr"]){
  const result=properToReaderSlots({...proper,secrets:[secretSource()]},{language});
  assert.equal(result.slots.SECRET_SET.status,"READY",language+" Secret source incorrectly blocked");
  const row=result.slots.SECRET_SET.data.paragraphs.at(-1);
  assert.match(row.latin,/Deus,?\s*$/u,"private Secret must retain its silent conclusion");
  assert.doesNotMatch(row.latin,/per ómnia sǽcula|Amen\./u,
    "last Secret duplicates the public B041 ending/response");
  assert.equal(row.secretConclusionBoundary,"AUDIBLE_PER_OMNIA_IN_CANONICAL_B041");
  assert.doesNotMatch(row.vernacular,/world without end|Ainsi soit-il|Amen\./iu,
    language+" Secret duplicates the translated audible ending");
}
const multipleSecrets=properToReaderSlots({...proper,secrets:[
  secretSource(),secretSource(),
]},{language:"fr"}).slots.SECRET_SET.data.paragraphs;
assert.equal(multipleSecrets.length,2,"no public Oremus/Amen between Secrets");
assert.match(multipleSecrets[0].latin,/per ómnia sǽcula sæculórum\. Amen\.$/u,
  "earlier Secret is entirely recited silently");
assert.doesNotMatch(multipleSecrets[1].latin,/per ómnia sǽcula|Amen\./u,
  "last Secret has only the silently spoken part");
const brokenSecret=properToReaderSlots({...proper,secrets:[{
  ...secretSource(),fr:"Texte interrompu. Ainsi soit-il.",
}]},{language:"fr"});
assert.equal(brokenSecret.slots.SECRET_SET.status,"MISSING",
  "unmatched bilingual Secret endings must fail closed rather than duplicate");

// Two source-owned III/IV-class commemorations are ONE additional
// liturgical group with two focus paragraphs, never a guessed third Collect.
const joinTwo=(label)=>({
 lat:"Lat "+label+" A\n\nLat "+label+" B\nPer Dominum. Amen.",
 fr:"FR "+label+" A\n\nFR "+label+" B\nPar Notre-Seigneur. Ainsi soit-il.",
 oneConclusion:{status:"CERTIFIED",kind:"MULTIPLE_COMMEMORATIONS",
   segments:{
     lat:{principal:"Lat "+label+" A",additional:"Lat "+label+" B",
       conclusion:"Per Dominum. Amen."},
     fr:{principal:"FR "+label+" A",additional:"FR "+label+" B",
       conclusion:"Par Notre-Seigneur. Ainsi soit-il."},
   }
 }
});
const sourceDecision={status:"CERTIFIED",source:"1962_PROPER_RESOLVER",
  form:"LOW",calendarCount:2,appliedCount:2,prayerGroupCount:2};
const multiJoined=properToReaderSlots({...frenchProper,
 collects:[{lat:"Prima",fr:"Collecte principale"},joinTwo("COLLECT")],
 secrets:[{lat:"Prima",fr:"Secrète principale"},joinTwo("SECRET")],
 postcommunions:[{lat:"Prima",fr:"Postcommunion principale"},joinTwo("POST")],
 calendarCommemorations:[{path:"Sancti/01-19"},{path:"Sancti/01-19o"}],
 appliedCommemorations:[{path:"Sancti/01-19"},{path:"Sancti/01-19o"}],
 commemorationFormDecision:sourceDecision,
},{language:"fr"});
assert.equal(multiJoined.ready,true,
  "Two source prayers under ONE conclusion must not be counted as three groups");
for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
 const p=multiJoined.slots[slot].data.paragraphs;
 const publicPrayer=slot!=="SECRET_SET";
 assert.deepEqual(p.map(x=>x.id),publicPrayer?[
   slot+".1",slot+".1.AMEN",slot+".2.OREMUS",
   slot+".2.FIRST_COMMEMORATION",slot+".2.SECOND_COMMEMORATION",
 ]:[
   slot+".1",slot+".2.FIRST_COMMEMORATION",slot+".2.SECOND_COMMEMORATION",
 ],slot+" correct prayer/response/versicle sequence");
 const pair=p.filter(x=>x.prayerRole==="FIRST_COMMEMORATION"||
   x.prayerRole==="SECOND_COMMEMORATION");
 assert.equal(pair.length,2,slot+" two separate focus paragraphs");
 assert.equal(pair[0].liturgicalGroup,slot+".2");
 assert.equal(pair[1].liturgicalGroup,slot+".2",
   "the third source oration must not fabricate a third concluded group");
 assert.doesNotMatch(pair[1].vernacular,/Ainsi soit-il\\.$/,
   "printed Amen must appear as labelled response, not twice");
 assert.doesNotMatch(pair[1].latin,/Amen\\.$/,
   "printed Latin Amen must not duplicate the canonical response");
 assert.equal(p.filter(x=>x.id.endsWith(".OREMUS")).length,publicPrayer?1:0,
   "never add a public Oremus to Secrets or repeat it within joined commemorations");
 assert.equal(p.filter(x=>x.id.endsWith(".AMEN")).length,publicPrayer?1:0,
   "never invent a response to silent Secrets");
}
const corrupted=properToReaderSlots({...frenchProper,
 collects:[{lat:"Prima",fr:"Collecte principale"},
   {...joinTwo("COLLECT"),fr:"Unrelated alteration"}],
 appliedCommemorations:sourceDecision.calendarCount?[
   {path:"Sancti/01-19"},{path:"Sancti/01-19o"}]:[],
 commemorationFormDecision:sourceDecision,
},{language:"fr"});
assert.equal(corrupted.slots.COLLECT_SET.status,"MISSING",
  "A broken shared conclusion must NEVER be presented as ready");

console.log("Proper → reader slots: PASS — EN/FR vernacular projection, certified suppressions, no duplicate Gradual/Alleluia.");
