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

console.log("Prayer over the People: PASS — source-owned oration is composed into Postcommunion with deferred C0256 exit and unchanged card topology.");
