import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildReaderModeModels} from "../src/mass/reader-mode-switch.js";
import {createNativeScholaController} from "../src/mass/reader-schola.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
  nuptialData:load("../data/presentation/reader-nuptial.v1.json"),
  frenchOrdinary:load("../data/presentation/reader-french-ordinary.v1.json"),
};
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
function prepared(form="MISSA_CANTATA_INCENSE"){
  return {
    session:{
      resolvedMass:{
        schema:"ao-resolved-mass-v2",date:"2026-10-04",form,presentationMode:"LIVE",
        actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
        calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
        explicitlySelectedCelebration:true,
        proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
        overlays:["VOTIVE_PROPER"],
        precedingRites:[],followingActions:[],distinctRite:null,
      },
      plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],
        overlayGraphs:["VOTIVE_PROPER"],normalLastGospel:true,blessingAllowed:true},
    },
    readerPreferences:{mode:"LIVE",language:"en",
      postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
  };
}
function fixture(form="MISSA_CANTATA_INCENSE"){
  const p=prepared(form);
  const review=buildReaderModeModels({prepared:p,data,mode:"LIVE",reviewExpandedCards:true});
  const schola=createNativeScholaController({
    sungCorpus:data.sungCorpus,
    properSlots:review.sourceModel.properSlots,
    prepared:p,frenchOrdinary:data.frenchOrdinary,
  });
  return {p,review,schola,cards:review.presentationModel.cards};
}
const {review,schola,cards}=fixture();
assert.equal(review.presentationModel.totalCards,64);
const cardForCue=id=>cards.find(c=>c.paragraphs.some(p=>(p.sourceCueIds??[]).includes(id)));
const titled=s=>cards.find(c=>c.title===s);
const verify=(card,expected,message)=>{
  assert.ok(card,message+": no review card");
  const projection=schola.activateForCard(card);
  assert.equal(projection.trackId,expected,
    message+": wrong chant track for visible card "+card.sequence+" "+card.title);
  return projection;
};

verify(titled("At the Foot of the Altar · Opening and Psalm 42"),null,
  "first preparatory stage must not activate the Introit early");
verify(titled("Introit"),"INTROIT","Introit Proper should use its actual B014 card, not macro position 1");
verify(cardForCue("AO.SM.C0044"),"KYRIE","Kyrie source cue");
let state=verify(cardForCue("AO.SM.C0053"),null,
  "priest's Gloria intonation must not trigger Schola early");
state=verify(cardForCue("AO.SM.C0055"),"GLORIA","actual Et in terra pax Schola start");
assert.equal(state.schola.cueId,"AO.SM.C0055");
state=schola.next();
const forwardCue=state.schola.cueId;
assert.notEqual(forwardCue,"AO.SM.C0055");
state=verify(cardForCue("AO.SM.C0062"),"GLORIA",
  "entering another Gloria card may not rewind a manually advanced Schola");
assert.equal(state.schola.cueId,forwardCue);
state=verify(cardForCue("AO.SM.C0089"),null,"priest's Credo intonation is not Schola");
state=verify(cardForCue("AO.SM.C0091"),"CREDO","first Credo Schola cue");
assert.equal(state.schola.cueId,"AO.SM.C0091");
verify(titled("Offertory · Invitation and Antiphon"),"OFFERTORY",
  "Offertory resolves the precise B030 Proper block");
const whole=titled("Sanctus — Benedictus");
assert.ok(whole,"The celebrant's Sanctus and Benedictus must share one card");
assert.ok(whole.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0145")));
assert.ok(whole.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0148")));
assert.equal(cards.filter(c=>c.sourceSectionId==="AO.CARD.013").length,1,
  "Do not split the priest's single Sanctus text into two navigable cards");
state=verify(whole,"SANCTUS_BENEDICTUS","whole priestly Sanctus–Benedictus");
const before=schola.next();
state=verify(whole,"SANCTUS_BENEDICTUS","same prayer card must not rewind the Schola");
assert.equal(state.index,before.index,"In-card Sanctus focus rewound the Schola");
state=verify(titled("Te igitur"),"SANCTUS_BENEDICTUS",
  "Schola must remain independent while the priest begins the silent Canon");
assert.equal(state.index,before.index);
verify(titled("Pater noster"),null,"old Sanctus should not persist into Pater noster");
verify(titled("Agnus Dei"),"AGNUS_DEI","Agnus Dei correct cue vs old macro/card number");
verify(titled("Communion Antiphon"),"COMMUNION",
  "Communion Proper must only start on the explicit B085 card");
verify(titled("Final Blessing"),null,"silent/priest-only final blessing must not activate choir");

// Source-aware API also works for existing production 48 model.
const {p}=fixture();
const live=buildReaderModeModels({prepared:p,data,mode:"LIVE"});
assert.equal(live.presentationModel.totalCards,48);
const productionSchola=createNativeScholaController({
  sungCorpus:data.sungCorpus,properSlots:live.sourceModel.properSlots,
  prepared:p,frenchOrdinary:data.frenchOrdinary,
});
const getProductionCue=id=>live.presentationModel.cards.find(c=>
  c.paragraphs.some(p=>(p.sourceCueIds??[]).includes(id)));
assert.equal(productionSchola.activateForCard(getProductionCue("AO.SM.C0055")).trackId,"GLORIA");
assert.equal(productionSchola.activateForCard(getProductionCue("AO.SM.C0091")).trackId,"CREDO");
assert.equal(productionSchola.activateForCard(getProductionCue("AO.SM.C0222")).trackId,"AGNUS_DEI");
// A numeric legacy caller remains supported during migration.
assert.equal(productionSchola.activateForCard(2).trackId,"KYRIE");

// Solemn sung has the same source-owner behavior without assuming the
// celebrant proclaims the Gospel or dismissal instead of their ministers.
const solemn=fixture("SOLEMN");
assert.equal(solemn.review.presentationModel.totalCards,64);
const solemnGloria=solemn.cards.find(c=>c.paragraphs.some(p=>
  p.sourceCueIds?.includes("AO.SM.C0055")));
assert.equal(solemn.schola.activateForCard(solemnGloria).trackId,"GLORIA");

// Low Mass has no Schola. The curated sung review is not force-projected.
const low=fixture("LOW");
assert.ok(low.review.presentationModel.totalCards!==64,
  "Low Mass must not inherit the curated Sung-only segmentation");
assert.equal(low.schola.project().structuralAbsence,true);
assert.equal(low.schola.activateForCard(solemnGloria).schola,null);

console.log("Mass Schola source-aware cards PASS — 64 curated, 48 rollback, Solemn, Low, no false progress/rewinds.");
