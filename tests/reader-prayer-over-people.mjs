import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { resolvePrayerOverPeopleInsertion } from "../src/mass/reader-prayer-over-people.js";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { projectSpecialStructure } from "../src/mass/reader-special-structure.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const frenchOrdinary=load("../data/presentation/reader-french-ordinary.v1.json");
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const core=load("../data/mass/special-days-core.v1.1.json");

const t=(lat,en)=>({lat,en});
const proper={
  schema:"ao-proper-manifest-v2",
  sourcePath:"Tempora/Lent-Feria-Test",
  introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale","Gradual"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
  orations:{
    collectSet:[],secretSet:[],postcommunionSet:[],
    prayerOverPeople:{
      id:"POP-TEST-1",
      bodyLat:"Parce, Dómine, parce pópulo tuo.",
      bodyEn:"Spare, O Lord, spare Your people.",
      conclusionType:"PER_DOMINUM",
      conclusionLat:"Per Dóminum nostrum Iesum Christum.",
      conclusionEn:"Through our Lord Jesus Christ.",
      sourceRef:"PRIMARY_TEST_FIXTURE"
    }
  }
};

const resolved={
  schema:"ao-resolved-mass-v2",
  date:"2026-03-05",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  calendarCelebration:{id:"lent-feria",type:"CALENDAR"},
  actualCelebration:{id:"lent-feria",type:"CALENDAR"},
  explicitlySelectedCelebration:false,
  proper,
  overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
};

const insertion=resolvePrayerOverPeopleInsertion(resolved);
assert.ok(insertion);
assert.equal(insertion.orationId,"POP-TEST-1");
assert.equal(insertion.postcommunionExit.mode,"PRAYER_OVER_PEOPLE");
assert.deepEqual(insertion.postcommunionExit.suppressBaseCueIds,["AO.SM.C0256"]);
assert.equal(insertion.paragraphs.length,4);
assert.equal(insertion.paragraphs[0].primary,"Let us pray. Bow your heads to God.");
assert.equal(insertion.paragraphs[0].alternate,"Orémus. Humiliáte cápita vestra Deo.");
assert.equal(insertion.paragraphs[1].primary,"Spare, O Lord, spare Your people.");
assert.equal(insertion.paragraphs[1].alternate,"Parce, Dómine, parce pópulo tuo.");

const model=createMassReaderModel({resolvedMass:resolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(model.totalCards,39,"Prayer over the People must not add a reader card");
const post=model.cards.find(c=>c.sourceSectionId==="AO.CARD.027" || c.sectionId==="AO.CARD.027");
assert.ok(post);
assert.equal(post.prayerOverPeople?.orationId,"POP-TEST-1");
assert.deepEqual(post.paragraphs.slice(-4).map(p=>p.id),[
  "R17.POP.010.INVITATION","R17.POP.010.BODY","R17.POP.010.CONCLUSION","R17.POP.010.AMEN"
]);
const dismissal=model.cards.find(c=>c.sourceSectionId==="AO.CARD.028" || c.sectionId==="AO.CARD.028");
assert.ok(dismissal.paragraphs.some(p=>/Dóminus vobíscum/.test(p.primary)||/Dóminus vobíscum/.test(p.alternate??"")),
  "final Dominus vobiscum moved out of dismissal card");

const noPop={...resolved,proper:{...proper,orations:{...proper.orations,prayerOverPeople:null}}};
const ordinaryModel=createMassReaderModel({resolvedMass:noPop,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
const ordinaryPost=ordinaryModel.cards.find(c=>c.sourceSectionId==="AO.CARD.027" || c.sectionId==="AO.CARD.027");
assert.equal(ordinaryPost.paragraphs.some(p=>String(p.id).startsWith("R17.POP.010")),false);

const compiledResolved=makeResolvedMass({
  date:"2026-03-05",form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  calendarCelebration:{id:"lent-feria",type:"CALENDAR"},proper
});
const plan=compileMassPlan(compiledResolved);
assert.ok(plan.insertions.includes("PRAYER_OVER_PEOPLE_AFTER_POSTCOMMUNION_BEFORE_FINAL_DOMINUS_VOBISCUM"));
assert.equal(plan.postcommunionExit.mode,"PRAYER_OVER_PEOPLE");
const projection=projectSpecialStructure({session:{resolvedMass:compiledResolved,plan}},{registry,extension,core});
const seg=projection.segments.find(x=>x.id==="PRAYER_OVER_PEOPLE_AFTER_POSTCOMMUNION_BEFORE_FINAL_DOMINUS_VOBISCUM");
assert.ok(seg);
assert.equal(seg.renderable,true);
assert.equal(seg.planOwned,true);
assert.equal(seg.readerPayload,"PLAN_APPLIED_TO_ORDINARY_READER");
assert.equal(projection.releaseSupport,true);


// Source-checked 27 February 1962 French [Super populum] from the original
// DivinumOfficium Francais/Tempora/Quad1-5.txt (blob 05d139a1...).
// That file contains "$Per Dominum", NOT a spelled-out French conclusion;
// missing FR conclusion must remain Latin rather than borrow English.
const quad1Friday=structuredClone(resolved);
quad1Friday.date="2026-02-27";
quad1Friday.proper.sourcePath="Tempora/Quad1-5";
// Synthetic *ordinary* test values are bilingual so the existing
// Proper reader gate can verify R30's separate original French oration.
const sourceFr=value=>({...value,fr:"FR_SOURCE_TEST: "+value.lat});
for(const key of ["introit","epistle","gradual","gospel","offertory","preface","communion"])
 quad1Friday.proper[key]=sourceFr(quad1Friday.proper[key]);
for(const key of ["collects","secrets","postcommunions"])
 quad1Friday.proper[key]=quad1Friday.proper[key].map(sourceFr);
quad1Friday.proper.orations.prayerOverPeople={
  id:"TEMPORA-QUAD1-5-SUPER-POPULUM",
  bodyLat:"Exáudi nos, miséricors Deus: et méntibus nostris grátiæ tuæ lumen osténde.",
  bodyEn:"Hear us, merciful God, and shed the light of Thy grace upon our minds.",
  bodyFr:"Écoutez-nous, ô Dieu de miséricorde, et manifestez à nos âmes la lumière de votre grâce.",
  conclusionType:"PER_DOMINUM",
  conclusionLat:"Per Dóminum nostrum Iesum Christum.",
  conclusionEn:"Through our Lord Jesus Christ.",
  sourceRef:"DivinumOfficium:Francais/Tempora/Quad1-5:[Super populum]",
};
const frenchInsertion=resolvePrayerOverPeopleInsertion(quad1Friday,{language:"fr"});
assert.equal(frenchInsertion.paragraphs[0].primary,
  "Prions. Humiliez vos têtes devant Dieu.");
assert.equal(frenchInsertion.paragraphs[0].alternate,
  "Orémus. Humiliáte cápita vestra Deo.");
assert.equal(frenchInsertion.paragraphs[1].primary,
  "Écoutez-nous, ô Dieu de miséricorde, et manifestez à nos âmes la lumière de votre grâce.");
assert.equal(frenchInsertion.paragraphs[1].alternate,
  quad1Friday.proper.orations.prayerOverPeople.bodyLat);
assert.equal(frenchInsertion.paragraphs[2].primary,
  quad1Friday.proper.orations.prayerOverPeople.conclusionLat,
  "Unprinted French conclusion must not be invented or replaced with English");
assert.equal(frenchInsertion.paragraphs[2].alternate,null);
assert.ok(!frenchInsertion.paragraphs.some(p=>
  String(p.primary).includes("Hear us") ||
  String(p.primary).includes("Through our Lord") ||
  String(p.primary).includes("Bow your heads")));

const suppliedFrenchConclusion=structuredClone(quad1Friday);
suppliedFrenchConclusion.proper.orations.prayerOverPeople.conclusionFr=
  "CONCLUSION_FRANÇAISE_DE_SOURCE_TEST";
assert.equal(resolvePrayerOverPeopleInsertion(suppliedFrenchConclusion,{language:"fr"})
  .paragraphs[2].primary,"CONCLUSION_FRANÇAISE_DE_SOURCE_TEST");
const absentFrench=structuredClone(quad1Friday);
delete absentFrench.proper.orations.prayerOverPeople.bodyFr;
const latinOnly=resolvePrayerOverPeopleInsertion(absentFrench,{language:"fr"});
assert.equal(latinOnly.paragraphs[1].primary,
  absentFrench.proper.orations.prayerOverPeople.bodyLat,
  "Missing French must fall back to Latin source, NEVER English");
assert.equal(latinOnly.paragraphs[1].alternate,null);

for(const form of ["LOW","SOLEMN"]){
 for(const mode of ["LIVE","MISSAL"]){
  const selected={...quad1Friday,form,presentationMode:mode};
  const french=createMassReaderModel({resolvedMass:selected,sectionMap,
    lowCorpus:low,sungCorpus:sung,canonSourceMap,frenchOrdinary,vernacularLanguage:"fr"});
  const english=createMassReaderModel({resolvedMass:selected,sectionMap,
    lowCorpus:low,sungCorpus:sung,canonSourceMap,vernacularLanguage:"en"});
  const pick=m=>m.cards.find(c=>c.sourceSectionId==="AO.CARD.027" ||
    c.sectionId==="AO.CARD.027");
  const frPost=pick(french),enPost=pick(english);
  assert.ok(frPost&&enPost,form+" "+mode+" Postcommunion source missing");
  assert.equal(frPost.paragraphs.at(-3).primary,
    quad1Friday.proper.orations.prayerOverPeople.bodyFr);
  assert.equal(enPost.paragraphs.at(-3).primary,
    quad1Friday.proper.orations.prayerOverPeople.bodyEn);
  assert.deepEqual(frPost.paragraphs.slice(-4).map(p=>p.id),
    enPost.paragraphs.slice(-4).map(p=>p.id));
  assert.equal(frPost.prayerOverPeople.postcommunionExit.mode,"PRAYER_OVER_PEOPLE");
  assert.equal(french.totalCards,english.totalCards,
    "Changing reader locale altered source card count");
 }
}

console.log("Prayer over the People: PASS — source-owned oration is composed into Postcommunion with deferred C0256 exit and unchanged card topology.");
