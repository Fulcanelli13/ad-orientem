import assert from "node:assert/strict";
import { properToReaderSlots, assertReaderProperReady } from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";
import {inspect1962PluralMartyrsFrenchOrationSource} from "../src/mass/1962-plural-martyr-french-source.js";

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
assert.equal(completeFrenchCommemoration.slots.COLLECT_SET.data.paragraphs.length,2);
for(const [property,slot] of [["secrets","SECRET_SET"],["postcommunions","POSTCOMMUNION_SET"]]){
 const mixed=properToReaderSlots({...proper,[property]:[t("Oratio","Prayer"),{lat:"Commemoratio",en:"",fr:""}]});
 assert.equal(mixed.ready,false,slot+" silently filtered a missing commemoration");
 assert.ok(mixed.missing.includes(slot));
}
const missing=properToReaderSlots({...proper,gospel:{}});
assert.equal(missing.ready,false);
assert.ok(missing.missing.includes("GOSPEL"));
assert.throws(()=>assertReaderProperReady(missing),/GOSPEL/);

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
 assert.equal(p.length,3,slot+" principal + two focused commemorations");
 assert.equal(p[1].liturgicalGroup,"COLLECT_UNDER_ONE_CONCLUSION");
 assert.equal(p[2].liturgicalGroup,"COLLECT_UNDER_ONE_CONCLUSION");
 if(slot==="SECRET_SET"){
   assert.equal(p[2].vernacular.endsWith("Ainsi soit-il."),true,
     "a secret conclusion remains private if its full public boundary was not sourced");
 }else{
   assert.equal(p[2].vernacular.endsWith("Par Notre-Seigneur."),true,
     "Collect/Postcommunion source prayer was truncated while splitting the respondent Amen");
   assert.equal(p[2].latin.endsWith("Per Dominum."),true,
     "Latin source conclusion lost the last word before its distinct response");
   assert.equal(p[2].vernacular.endsWith("Ainsi soit-il."),false,
     "Collect/Postcommunion duplicates the separately materialised respondent Amen");
 }
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

// Original 1962 plural female-Martyr Common: the public French donor's
// Secret/Postcommunion are singular while the Latin names two martyrs.
const martyrLatin="Oratio pro sanctarum Martyrum N. et N. sollemnitate.";
const badFrench="Prière pour votre sainte Martyre N.";
const goodFrench="Prière pour vos saintes Martyres N. et N.";
const affected={...frenchProper,sourcePath:"Commune/C6b",
  secrets:[{lat:martyrLatin,fr:badFrench,en:"Prayer for holy Martyrs N. and N."}],
  postcommunions:[{lat:martyrLatin,fr:badFrench,en:"Holy Martyrs N. and N."}],
};
const untouched=JSON.stringify(affected);
const hold=inspect1962PluralMartyrsFrenchOrationSource(affected,"SECRET_SET");
assert.equal(hold.status,"SOURCE_CONFLICT");
assert.equal(hold.latinPluralNameCount,2);
assert.equal(hold.frenchNameCount,1);
const guarded=properToReaderSlots(affected,{language:"fr"});
assert.equal(guarded.slots.SECRET_SET.status,"MISSING");
assert.equal(guarded.slots.POSTCOMMUNION_SET.status,"MISSING");
assert.ok(guarded.missing.includes("SECRET_SET")&&guarded.missing.includes("POSTCOMMUNION_SET"));
assert.equal(guarded.slots.COLLECT_SET.status,"READY","Other proper prayers unchanged");
assert.equal(JSON.stringify(affected),untouched,"Never modify the resolved Proper source");

const inheritedNonVirgin=properToReaderSlots({...affected,sourcePath:"Commune/C7b"},{language:"fr"});
assert.equal(inheritedNonVirgin.slots.SECRET_SET.status,"MISSING");
assert.equal(inheritedNonVirgin.slots.POSTCOMMUNION_SET.status,"MISSING");
const exactPlural=properToReaderSlots({...affected,
  secrets:[{lat:martyrLatin,fr:goodFrench}],
  postcommunions:[{lat:martyrLatin,fr:goodFrench}],
},{language:"fr"});
assert.equal(exactPlural.slots.SECRET_SET.status,"READY");
assert.equal(exactPlural.slots.POSTCOMMUNION_SET.status,"READY");
assert.equal(exactPlural.ready,true,"Valid plural translation remains permitted");
// English is source-complete; the French hold cannot spill across languages.
const englishUnchanged=properToReaderSlots({...proper,sourcePath:"Commune/C6b",
  secrets:[{lat:martyrLatin,en:"Saints N. and N."}],
  postcommunions:[{lat:martyrLatin,en:"Saints N. and N."}],
},{language:"en"});
assert.equal(englishUnchanged.ready,true);
const outsideOwner=properToReaderSlots({...affected,sourcePath:"Sancti/07-10"},{language:"fr"});
assert.equal(outsideOwner.ready,true,
  "The donor exception must not block unrelated selected Masses");
assert.equal(inspect1962PluralMartyrsFrenchOrationSource(affected,"COLLECT_SET"),null,
  "The printed plural Collect was not the known French source defect");

// Source-provenance exception for Perpetua/Felicity's *named* 1962 Proper.
// The pinned French Sancti/03-06 Collect and Secret say "Vierges et
// Martyres" even though Latin derives from the NON-VIRGIN female Martyrs'
// C7b Common. This must also cover an actual ferial Mass's independently
// source-identified commemorative row, not only a selected Common page.
const nonVirginLatin="Da nobis, quaesumus, Domine, palmas sanctárum Mártyrum tuárum Perpétuæ et Felicitátis venerari.";
const incorrectFrench="Donnez-nous, Seigneur, le triomphe de vos saintes Vierges et Martyres Perpétue et Félicité, afin de les honorer.";
const namedProper={...frenchProper,sourcePath:"Sancti/03-06",
  collects:[{lat:nonVirginLatin,fr:incorrectFrench}],
  secrets:[{lat:nonVirginLatin,fr:incorrectFrench}],
  postcommunions:[{lat:"Mýsticis, Dómine, repléti sumus",fr:"Nous sommes comblés, Seigneur"}],
};
const badNamed=properToReaderSlots(namedProper,{language:"fr"});
assert.equal(badNamed.slots.COLLECT_SET.status,"MISSING","Wrong Virgin identity in named Collect must be held");
assert.equal(badNamed.slots.SECRET_SET.status,"MISSING","Wrong Virgin identity in named Secret must be held");
assert.equal(badNamed.slots.POSTCOMMUNION_SET.status,"READY","Independent named Postcommunion remains available");
const correctNamed=properToReaderSlots({...namedProper,collects:[{
  lat:nonVirginLatin,fr:incorrectFrench.replace("Vierges et ","")
}],secrets:[{lat:nonVirginLatin,fr:incorrectFrench.replace("Vierges et ","")}]},{language:"fr"});
assert.equal(correctNamed.ready,true,"Correct non-Virgin French Proper must not be blocked");
const namedEnglish=properToReaderSlots({...proper,sourcePath:"Sancti/03-06",
  collects:[{lat:nonVirginLatin,en:"Collect for the Martyrs Perpetua and Felicitas"}],
  secrets:[{lat:nonVirginLatin,en:"Secret for the Martyrs Perpetua and Felicitas"}],
},{language:"en"});
assert.equal(namedEnglish.ready,true,"French editorial issue must never affect English");
const attachedCommemoration=properToReaderSlots({
  ...frenchProper,sourcePath:"Tempora/Quad2-5",
  collects:[{lat:"Ferial Collect",fr:"Collecte de la férie"},{
    sourcePath:"Sancti/03-06:Oratio",lat:nonVirginLatin,fr:incorrectFrench
  }],
  secrets:[{lat:"Ferial Secret",fr:"Secrète de la férie"},{
    sourcePath:"Sancti/03-06:Secreta",lat:nonVirginLatin,fr:incorrectFrench
  }],
},{language:"fr"});
assert.equal(attachedCommemoration.slots.COLLECT_SET.status,"MISSING",
  "Source-attested Perpetua/Felicity commemoration under Lenten Mass must fail closed");
assert.equal(attachedCommemoration.slots.SECRET_SET.status,"MISSING");
// Production DayResolver does NOT annotate each commemorative prayer row
// with sourcePath. It supplies the authenticated calendarCommemorations list.
// The row-count and exact owner identity must be reconciled before display.
const realistic2026Commemoration={
 ...frenchProper,sourcePath:"Tempora/Quad2-5",
 calendarCommemorations:[{path:"Sancti/03-06",
    prayerSourcePath:"Sancti/03-06",name:"Sts. Felicitas & Perpetua"}],
 collects:[{lat:"Ferial Collect",fr:"Collecte de la férie"},
   {lat:nonVirginLatin,fr:incorrectFrench}],
 secrets:[{lat:"Ferial Secret",fr:"Secrète de la férie"},
   {lat:nonVirginLatin,fr:incorrectFrench}],
 postcommunions:[{lat:"Ferial Postcommunion",fr:"Postcommunion de la férie"},
   {lat:"Postcommunio Martyrum",fr:"Postcommunion des martyres"}]
};
const real2026=properToReaderSlots(realistic2026Commemoration,{language:"fr"});
assert.equal(real2026.slots.COLLECT_SET.status,"MISSING",
 "Exact 6 March source-owned second Collect must not display the wrong Virgin identity");
assert.equal(real2026.slots.SECRET_SET.status,"MISSING",
 "Exact 6 March source-owned second Secret must not display the wrong Virgin identity");
assert.equal(real2026.slots.POSTCOMMUNION_SET.status,"READY",
 "The independent named Postcommunion must remain visible");
const fixed2026=properToReaderSlots({...realistic2026Commemoration,
 collects:[realistic2026Commemoration.collects[0],
  {...realistic2026Commemoration.collects[1],
   fr:incorrectFrench.replace("Vierges et ","")}],
 secrets:[realistic2026Commemoration.secrets[0],
  {...realistic2026Commemoration.secrets[1],
   fr:incorrectFrench.replace("Vierges et ","")}]
},{language:"fr"});
assert.equal(fixed2026.slots.COLLECT_SET.status,"READY",
 "Correct source-identified French commemoration must remain renderable");
assert.equal(fixed2026.slots.SECRET_SET.status,"READY");
const mismatchedCount=properToReaderSlots({...realistic2026Commemoration,
 collects:realistic2026Commemoration.collects.slice(1),
 secrets:realistic2026Commemoration.secrets.slice(1)
},{language:"fr"});
assert.equal(inspect1962PluralMartyrsFrenchOrationSource({
 ...realistic2026Commemoration,collects:realistic2026Commemoration.collects.slice(1)
},"COLLECT_SET"),null,"Ambiguous row index must not invent a source identity");
const anotherCommemoration=properToReaderSlots({...realistic2026Commemoration,
 calendarCommemorations:[{path:"Sancti/11-11cc",prayerSourcePath:"Sancti/11-11cc"}]
},{language:"fr"});
assert.equal(anotherCommemoration.slots.COLLECT_SET.status,"READY",
 "Do not misattribute another saint's source to Perpetua/Felicity");
assert.equal(anotherCommemoration.slots.SECRET_SET.status,"READY");
const multipleUnderOneConclusion=properToReaderSlots({...realistic2026Commemoration,
 collects:[realistic2026Commemoration.collects[0],
   {...realistic2026Commemoration.collects[1],oneConclusion:{status:"UNVERIFIED"}}]
},{language:"fr"});
assert.equal(inspect1962PluralMartyrsFrenchOrationSource({
 ...realistic2026Commemoration,collects:[realistic2026Commemoration.collects[0],
   {...realistic2026Commemoration.collects[1],oneConclusion:{status:"UNVERIFIED"}}]
},"COLLECT_SET"),null,
 "Do not infer individual owner through one-conclusion group boundaries");

const unmarkedCommemoration=properToReaderSlots({...frenchProper,sourcePath:"Tempora/Quad2-5",
  collects:[{lat:nonVirginLatin,fr:incorrectFrench}],
},{language:"fr"});
assert.equal(unmarkedCommemoration.slots.COLLECT_SET.status,"READY",
  "Do not infer an otherwise unproven child donor identity solely from words");
const latinActuallyVirgin=properToReaderSlots({...namedProper,
  collects:[{lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
    fr:incorrectFrench}],
  secrets:[{lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
    fr:incorrectFrench}],
},{language:"fr"});
assert.equal(latinActuallyVirgin.slots.COLLECT_SET.status,"MISSING",
  "The identified 1962 non-Virgin Common takes precedence over an erroneous Latin Virgin label");
assert.equal(latinActuallyVirgin.slots.SECRET_SET.status,"MISSING",
  "Wrong Latin and French inheritance must be held together");
const frenchOnlyCorrected=properToReaderSlots({...namedProper,
 collects:[{lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
   fr:incorrectFrench.replace("Vierges et ","")}],
 secrets:[{lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
   fr:incorrectFrench.replace("Vierges et ","")}]
},{language:"fr"});
const badLatinEnglish=properToReaderSlots({...proper,sourcePath:"Sancti/03-06",
 collects:[{lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
   en:"Martyrs Perpetua and Felicity",fr:incorrectFrench}],
 secrets:[{lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
   en:"Holy Martyrs Perpetua and Felicity",fr:incorrectFrench}]
},{language:"en"});
assert.equal(badLatinEnglish.slots.COLLECT_SET.status,"MISSING",
 "The English reader must not display the source-wrong Latin 6 March Collect");
assert.equal(badLatinEnglish.slots.SECRET_SET.status,"MISSING",
 "The English reader must not display the source-wrong Latin 6 March Secret");
const englishNamedCommemoration=properToReaderSlots({
 ...realistic2026Commemoration,
 collects:[realistic2026Commemoration.collects[0],
   {...realistic2026Commemoration.collects[1],
     lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
     en:"Holy Martyrs Perpetua and Felicity"}],
 secrets:[realistic2026Commemoration.secrets[0],
   {...realistic2026Commemoration.secrets[1],
     lat:"sanctárum Vírginum et Mártyrum Perpétuæ et Felicitátis",
     en:"Holy Martyrs Perpetua and Felicity"}]
},{language:"en"});
assert.equal(englishNamedCommemoration.slots.COLLECT_SET.status,"MISSING",
 "Actual source-owned March 6 Latin mismatch must be blocked in English mode");
assert.equal(englishNamedCommemoration.slots.SECRET_SET.status,"MISSING");
const frenchOnlyDirectCommon=properToReaderSlots({...proper,sourcePath:"Commune/C6b",
 secrets:[{lat:martyrLatin,en:"Holy Virgins and Martyrs N. and N.",fr:badFrench}],
 postcommunions:[{lat:martyrLatin,en:"Holy Virgins and Martyrs N. and N.",fr:badFrench}]
},{language:"en"});
assert.equal(frenchOnlyDirectCommon.slots.SECRET_SET.status,"READY",
 "French-only C6b transcription problem cannot suppress accurate Latin/English");
assert.equal(frenchOnlyDirectCommon.slots.POSTCOMMUNION_SET.status,"READY");

assert.equal(frenchOnlyCorrected.slots.COLLECT_SET.status,"MISSING",
  "Correct French must not conceal a source-inconsistent Latin Virgin designation");
assert.equal(namedProper.collects[0].fr,incorrectFrench,
  "Actual source text immutable under read-only editor guard");

console.log("Proper → reader slots: PASS — EN/FR vernacular projection, certified suppressions, no duplicate Gradual/Alleluia.");


// ICKSP traditional (pre-1970) Missal gives plural French texts for C6b/C7b.
// The pinned Divinum Officium French donor instead carries singular "N." in
// Secreta/Postcommunio. This is the only source-verified direct Common fix.
// https://icrspfrance.fr/textes-liturgiques.php?article=a0337_ancien
// https://icrspfrance.fr/textes-liturgiques.php?article=a0342_ancien
const pluralMartyrCommons=Object.freeze([
  {path:"Commune/C6b",latinCategory:"Vírginum et Mártyrum",
    latinPost:"Virgínibus et Martýribus",
    englishCategory:"Virgins and Martyrs",
    expectedFrench:"vos saintes Vierges et Martyres N. et N."},
  {path:"Commune/C7b",latinCategory:"Mártyrum",
    latinPost:"Martýribus",
    englishCategory:"Martyrs",
    expectedFrench:"vos saintes Martyres N. et N."},
]);
for(const entry of pluralMartyrCommons){
  const singular="votre sainte Vierge et Martyre N.";
  const direct={...frenchProper,sourcePath:entry.path,
    secrets:[{lat:"Inténde, Dómine, múnera pro sanctárum "+entry.latinCategory+
      " tuárum N. et N. festivitáte: ut veniam largiáris.",
      en:"O Lord, look upon gifts for thy holy "+entry.englishCategory+
      " N. and N., and grant us pardon.",
      fr:"Prêtez attention, Seigneur, aux offrandes de "+singular+
      " pour nous accorder votre pardon."}],
    postcommunions:[{lat:"Præsta nobis, Dómine, intercedéntibus sanctis "+
      entry.latinPost+" tuis N. et N.: pura mente capiámus.",
      en:"Grant, O Lord, at the intercession of thy holy "+
      entry.englishCategory+" N. and N., to receive with pure minds.",
      fr:"Accordez-nous, Seigneur, par l’intercession de "+singular+
      " de recevoir avec un cœur pur."}]
  };
  const original=JSON.stringify(direct);
  const revised=properToReaderSlots(direct,{language:"fr"});
  for(const slot of ["SECRET_SET","POSTCOMMUNION_SET"]){
    assert.equal(revised.slots[slot].status,"READY",
      entry.path+": source-backed French prayer still withheld "+slot);
    assert.match(revised.slots[slot].data.paragraphs[0].vernacular,
      /vos saintes (?:Vierges et )?Martyres N\. et N\./u,
      entry.path+": plural French text missing "+slot);
    assert.ok(revised.slots[slot].data.paragraphs[0].vernacular.includes(
      entry.expectedFrench),entry.path+": wrong 1962 Common category");
    assert.doesNotMatch(revised.slots[slot].data.paragraphs[0].vernacular,
      /votre sainte Vierge et Martyre N\./u);
  }
  assert.equal(revised.sourceEditorialCorrections?.length,2,
    entry.path+": two ICKSP authoritative corrections must be proved");
  assert.ok(revised.sourceEditorialCorrections.every(x=>
    x.sourcePath===entry.path&&x.fields.length===1&&x.fields[0]==="fr"&&
    x.authority==="ICRSP_1962_MULTIPLE_MARTYRS_COMMON_OLD_MISSAL"&&
    x.originalSourcePreserved===true));
  assert.equal(JSON.stringify(direct),original,entry.path+" source modified");
  const english=properToReaderSlots(direct,{language:"en"});
  assert.equal(english.slots.SECRET_SET.status,"READY");
  assert.equal(english.slots.POSTCOMMUNION_SET.status,"READY");
  assert.match(english.slots.SECRET_SET.data.paragraphs[0].vernacular,/N\. and N\./);
  const alreadyPlural={...direct,
    secrets:[{...direct.secrets[0],fr:direct.secrets[0].fr.replace(
      singular,entry.expectedFrench)}],
    postcommunions:[{...direct.postcommunions[0],
      fr:direct.postcommunions[0].fr.replace(singular,entry.expectedFrench)}]
  };
  const allowed=properToReaderSlots(alreadyPlural,{language:"fr"});
  assert.equal(allowed.slots.SECRET_SET.status,"READY");
  assert.equal(allowed.slots.POSTCOMMUNION_SET.status,"READY");
  assert.equal(allowed.sourceEditorialCorrections?.length??0,0,
    "Already-correct source cannot acquire a new editorial correction");
  const missingSecondLatin={...direct,
    secrets:[{...direct.secrets[0],lat:direct.secrets[0].lat.replace(
      "N. et N.","N.")}]};
  assert.equal(properToReaderSlots(missingSecondLatin,{language:"fr"})
    .sourceEditorialCorrections?.length,1,
    "Never derive a plural French Secret when Latin lacks both saints");
  assert.equal(properToReaderSlots(missingSecondLatin,{language:"fr"})
    .slots.SECRET_SET.status,"READY",
    "Do not rewrite unrelated one-name text without an authenticated Latin plural");
  const wrongEnglish={...direct,
    secrets:[{...direct.secrets[0],en:"Single Martyr N."}]};
  assert.equal(properToReaderSlots(wrongEnglish,{language:"fr"})
    .sourceEditorialCorrections?.length,1,
    "Do not pluralize without an independently matching English source");
  const nested={...direct,sourcePath:"Sancti/11-11"};
  assert.equal(properToReaderSlots(nested,{language:"fr"})
    .sourceEditorialCorrections?.length??0,0,
    "Never apply direct Common correction to a named Proper");
  const ambiguous={...direct,secrets:[...direct.secrets,direct.secrets[0]]};
  assert.equal(properToReaderSlots(ambiguous,{language:"fr"})
    .sourceEditorialCorrections?.length,1,
    "Multiple oration rows cannot be projected as one source");
}
console.log("PASS ICKSP 1962 plural French Common C6b/C7b: source-owner, bilingual, idempotent, immutability and negative cases");
