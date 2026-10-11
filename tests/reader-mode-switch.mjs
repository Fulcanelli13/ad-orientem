import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildReaderModeModels,
  captureReaderModeAnchor,
  findReaderModeAnchorCard,
} from "../src/mass/reader-mode-switch.js";

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
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),postcommunions:[t("Postcommunio","Postcommunion")],
};
const resolvedMass={
  schema:"ao-resolved-mass-v2",
  date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
  calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
  explicitlySelectedCelebration:true,
  proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
  overlays:["VOTIVE_PROPER"],
  precedingRites:[],
  followingActions:[],
  distinctRite:null,
};
const prepared={
  session:{resolvedMass,plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"],normalLastGospel:true,blessingAllowed:true}},
  readerPreferences:{mode:"LIVE",language:"en",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};

const live=buildReaderModeModels({prepared,data,mode:"LIVE"});
assert.equal(live.sourceModel.totalCards,39);
assert.equal(live.presentationModel.totalCards,48);
assert.equal(live.presentationModel.structureOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
assert.equal(prepared.session.resolvedMass.presentationMode,"LIVE","mode rebuild mutated canonical resolved Mass");

// Explicit review mode uses curated liturgical turns, not one card per block.
// The production 48-card reader is untouched.
const expandedReview=buildReaderModeModels({prepared,data,mode:"LIVE",reviewExpandedCards:true});
assert.equal(expandedReview.presentationModel.totalCards,65,
  "curated LIVE should have precisely 65 cards for the standard Sung Ordinary");
assert.equal(expandedReview.presentationModel.structureOwner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
assert.equal(expandedReview.presentationModel.sourceAuthorityModel,expandedReview.sourceModel);
assert.equal(expandedReview.presentationModel.cardForEvent,undefined,
  "review cards cannot claim canonical event ownership");
const inputParagraphIds=expandedReview.sourceModel.cards.flatMap(c=>c.paragraphs.map(p=>p.id));
const expandedParagraphIds=expandedReview.presentationModel.cards.flatMap(c=>c.paragraphs.map(p=>p.id));
assert.deepEqual(expandedParagraphIds,inputParagraphIds,
  "curated stage boundaries duplicated or dropped canonical prayer paragraphs");
const cardForCue=id=>expandedReview.presentationModel.cards.find(c=>
  c.paragraphs.some(p=>(p.sourceCueIds??[]).includes(id)));
assert.equal(cardForCue("AO.SM.C0053"),cardForCue("AO.SM.C0054"),
  "Gloria priestly intonation must stay together");
assert.notEqual(cardForCue("AO.SM.C0054"),cardForCue("AO.SM.C0055"),
  "Schola's Et in terra pax must be its own prayer card");
assert.equal(cardForCue("AO.SM.C0089"),cardForCue("AO.SM.C0090"),
  "Credo priestly intonation must stay together");
assert.notEqual(cardForCue("AO.SM.C0090"),cardForCue("AO.SM.C0091"),
  "Schola's Patrem omnipotentem must start a separate prayer card");
for(const id of ["AO.SM.C0074","AO.SM.C0255"]){
  const parent=cardForCue(id);
  assert.ok(parent,id+": actual canonical R. Amen response missing after resolved Proper");
  const line=parent.paragraphs.find(p=>(p.sourceCueIds??[]).includes(id));
  assert.equal(line.kind,"RESPONSE");
  assert.equal(line.primary,"℟. Amen.");
  assert.equal(line.speakerRole,"RESPONDERS");
}
assert.equal(cardForCue("AO.SM.C0020").paragraphs.find(p=>
  p.sourceCueIds.includes("AO.SM.C0020")).speakerRole,"PRIEST");
assert.equal(cardForCue("AO.SM.C0025").paragraphs.find(p=>
  p.sourceCueIds.includes("AO.SM.C0025")).speakerRole,"MINISTERS");
assert.equal(cardForCue("AO.SM.C0027").paragraphs.find(p=>
  p.sourceCueIds.includes("AO.SM.C0027")).speakerRole,"MINISTERS");
assert.ok(expandedReview.presentationModel.cards.some(c=>c.title==="Credo · Incarnation, Passion and Resurrection"),
  "Credo Incarnation and Passion milestone lost");
const distinct=(earlier,later,message)=>assert.notEqual(
  cardForCue(earlier)?.sectionId,cardForCue(later)?.sectionId,message);
assert.equal(cardForCue("AO.SM.C0009"),cardForCue("AO.SM.C0010"),
  "Psalm 42 and doxology belong on one card, not separate swipe targets");
assert.equal(cardForCue("AO.SM.C0033"),cardForCue("AO.SM.C0034"),
  "The opening dialogue remains inside the ascent prayer card");
assert.equal(cardForCue("AO.SM.C0046"),cardForCue("AO.SM.C0047"),
  "Kyrie/Christe/Kyrie is one navigable liturgical prayer");
assert.equal(cardForCue("AO.SM.C0049"),cardForCue("AO.SM.C0050"),
  "The Kyrie must not be over-segmented");
assert.equal(cardForCue("AO.SM.C0131"),cardForCue("AO.SM.C0132"),
  "Orate fratres and Suscipiat response must share one card");
distinct("AO.SM.C0147","AO.SM.C0148","Sanctus/Benedictus card boundary lost");
distinct("AO.SM.C0172","AO.SM.C0173","Host consecration formula must follow preparation");
distinct("AO.SM.C0178","AO.SM.C0179","Chalice consecration formula must follow preparation");
distinct("AO.SM.C0272","AO.SM.C0273","Et Verbum caro factum est must have its own card");
assert.equal(cardForCue("AO.SM.C0173"),cardForCue("AO.SM.C0174"),
  "Host elevation must remain linked to the exact words without a blank transition");
assert.equal(cardForCue("AO.SM.C0179"),cardForCue("AO.SM.C0181"),
  "Chalice elevation must remain linked to the exact words without a blank transition");
distinct("AO.SM.C0015","AO.SM.C0016","The celebrant Confiteor starts its own prayer card");
distinct("AO.SM.C0020","AO.SM.C0021","The server Confiteor starts its own prayer card");
distinct("AO.SM.C0036","AO.SM.C0042","The Introit is a separate liturgical stage");
distinct("AO.SM.C0094","AO.SM.C0095","The Credo Incarnation starts a separate stage");
assert.equal(cardForCue("AO.SM.C0095"),cardForCue("AO.SM.C0096"),
  "The Credo genuflection and its doctrinal context must stay on one card");
distinct("AO.SM.C0108","AO.SM.C0109","Offertory antiphon should retain source-prayer transition only within first stage");
distinct("AO.SM.C0116","AO.SM.C0120","Incensation is a distinct conditional stage");
distinct("AO.SM.C0237","AO.SM.C0242","Optional Communion Confiteor must not blend into Ecce Agnus Dei");
distinct("AO.SM.C0249","AO.SM.C0250","Ablutions and Communion antiphon need distinct ownership");
distinct("AO.SM.C0262","AO.SM.C0264","Final Blessing must not merge with Placeat");
console.log("Curated Mass LIVE review: "+expandedReview.presentationModel.totalCards+
  " unique liturgical cards; all source prayer paragraphs retained.");


const host=live.presentationModel.cards.find(card=>
  card.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0174"))
);
assert.ok(host,"LIVE Host elevation cue not found");
const anchor=captureReaderModeAnchor(host,{activeCueId:"AO.SM.C0174"});

const simple=buildReaderModeModels({prepared,data,mode:"SIMPLE"});
assert.equal(simple.sourceModel.totalCards,30);
assert.equal(simple.presentationModel.totalCards,30);
assert.equal(simple.sourceModel.presentationMode,"SIMPLE");
const simpleHost=findReaderModeAnchorCard(simple.presentationModel,anchor);
assert.equal(simpleHost.sectionId,"AO.CARD.015","Host cue did not remain anchored when switching LIVE -> SIMPLE");
assert.ok(simpleHost.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0174")));

const missal=buildReaderModeModels({prepared,data,mode:"MISSAL"});
assert.equal(missal.presentationModel.totalCards,30);
const missalHost=findReaderModeAnchorCard(missal.presentationModel,anchor);
assert.equal(missalHost.sectionId,"AO.CARD.015","Host cue did not remain anchored when switching LIVE -> MISSAL");

const backLive=findReaderModeAnchorCard(live.presentationModel,captureReaderModeAnchor(simpleHost,{activeCueId:"AO.SM.C0174"}));
assert.equal(backLive.sectionId,host.sectionId,"Host cue did not return to the exact LIVE card");

const split=live.presentationModel.cards.find(card=>card.sectionId==="AO.LIVE48.020.C");
assert.ok(split,"Pax Domini split card missing");
const splitAnchor=captureReaderModeAnchor(split);
const simplePax=findReaderModeAnchorCard(simple.presentationModel,splitAnchor);
assert.equal(simplePax.sectionId,"AO.CARD.020","split LIVE card did not collapse to its source macro without guessing");

const nuptialPrepared={
  ...prepared,
  session:{
    ...prepared.session,
    resolvedMass:{...resolvedMass,overlays:["NUPTIAL"],actualCelebration:{id:"nuptial",type:"NUPTIAL",title:"Nuptial Mass"}},
    plan:{...prepared.session.plan,overlayGraphs:["NUPTIAL"]},
  },
};
const nuptialLive=buildReaderModeModels({prepared:nuptialPrepared,data,mode:"LIVE"});
assert.equal(nuptialLive.sourceModel.totalCards,42);
assert.equal(nuptialLive.presentationModel.totalCards,51);
const insertion=nuptialLive.presentationModel.cards.find(card=>card.sectionId==="AO.NUPTIAL.02");
assert.ok(insertion);
const insertionAnchor=captureReaderModeAnchor(insertion);
const nuptialSimple=buildReaderModeModels({prepared:nuptialPrepared,data,mode:"SIMPLE"});
assert.equal(nuptialSimple.sourceModel.totalCards,33);
assert.equal(findReaderModeAnchorCard(nuptialSimple.presentationModel,insertionAnchor).sectionId,"AO.NUPTIAL.02",
  "Nuptial insertion identity was lost across mode switch");

// French mode-switch used to lose the required certified French Ordinary map.
// Preserve its explicit source pin in every reader presentation rebuild.
const translateFixture=value=>{
 if(Array.isArray(value))return value.map(translateFixture);
 if(value&&typeof value==="object"){
   const next=Object.fromEntries(Object.entries(value).map(([key,entry])=>[key,translateFixture(entry)]));
   if(typeof next.lat==="string"&&typeof next.en==="string")next.fr="Français : "+next.en;
   return next;
 }
 return value;
};
const frPrepared={
 ...prepared,readerPreferences:{...prepared.readerPreferences,language:"fr"},
 session:{...prepared.session,resolvedMass:{...resolvedMass,proper:{status:"READY",data:translateFixture(proper),sourcePath:"Sancti/10-07"}}}
};
const frenchMissal=buildReaderModeModels({prepared:frPrepared,data,mode:"MISSAL"});
assert.equal(frenchMissal.sourceModel.totalCards,30);
const sourceFrench=data.frenchOrdinary.byCue["AO.SM.C0001"];
assert.ok(sourceFrench&&sourceFrench.length>5,"Certified Ordinary source missing French opener");
assert.ok(frenchMissal.sourceModel.cards.some(card=>(card.paragraphs??[]).some(p=>
  String(p.primary??"").includes(sourceFrench)||String(p.secondary??"").includes(sourceFrench)
)),"French cue vanished when switching LIVE to MISSAL");

console.log("reader mode switch: PASS — MISSAL/SIMPLE/LIVE rebuild presentation only and preserve exact source anchors.");
