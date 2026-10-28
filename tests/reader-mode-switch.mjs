import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildReaderModeModels,
  captureReaderModeAnchor,
  findReaderModeAnchorCard,
} from "../src/mass/reader-mode-switch.js";
import { guideForPresentationCard } from "../src/mass/reader-guide.js";
import { auditOrdinarySungSourceOnlyCues } from "../src/mass/reader-source-only-cues.js";
import { missalPrayerHeadingsForCard } from "../src/mass/reader-missal-granularity.js";

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

const live=buildReaderModeModels({prepared,data,mode:"LIVE",reviewExpandedCards:true});
assert.equal(live.sourceModel.totalCards,39);
assert.equal(live.presentationModel.totalCards,65);
assert.equal(live.presentationModel.structureOwner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
assert.ok(live.presentationModel.cards.every(c=>!c.sectionId.startsWith("AO.LIVE48.")));
assert.equal(prepared.session.resolvedMass.presentationMode,"LIVE","mode rebuild mutated canonical resolved Mass");

// Curated LIVE is the only user-facing presentation for source-eligible Sung Masses.
const expandedReview=buildReaderModeModels({prepared,data,mode:"LIVE",reviewExpandedCards:true});
assert.equal(expandedReview.presentationModel.totalCards,65,
  "curated LIVE should have 65 cards with one complete Sanctus–Benedictus");
assert.equal(expandedReview.presentationModel.structureOwner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
assert.equal(expandedReview.presentationModel.sourceAuthorityModel,expandedReview.sourceModel);

const cueRegistryNames={
  gestures:"reader-gestures.v1.json",
  responses:"reader-responses.v1.json",
  postures:"reader-postures.v1.json",
  positions:"reader-priest-positions.v1.json",
  voices:"reader-priest-voices.v1.json",
  actions:"reader-priest-actions.v1.json",
};
const projectedCueCards=new Map();
const projectedCueIndexes=new Map();
for(const card of expandedReview.presentationModel.cards){
  card.paragraphs.forEach((paragraph,rowIndex)=>{
    for(const cueId of paragraph.sourceCueIds??[]){
      if(!/^AO\.SM\.C\d{4}$/.test(cueId))continue;
      assert.equal(projectedCueCards.has(cueId),false,
        cueId+" appears on multiple curated LIVE cards");
      projectedCueCards.set(cueId,card);
      projectedCueIndexes.set(cueId,{sequence:card.sequence,rowIndex});
    }
  });
}
const sourceCueSet=new Set(expandedReview.sourceModel.cards.flatMap(card=>
  card.paragraphs.flatMap(paragraph=>paragraph.sourceCueIds??[])).filter(cue=>
    /^AO\.SM\.C\d{4}$/.test(cue)));
assert.deepEqual([...projectedCueCards.keys()].sort(),[...sourceCueSet].sort(),
  "LIVE rearrangement lost original canonical cue ownership");
const nonRenderedSourceAnchors=[];
for(const [family,file] of Object.entries(cueRegistryNames)){
  const rows=load("../data/presentation/"+file).items;
  for(const row of rows){
    if(!row.cueId)continue; // Posture may be an observational state, not a textual cue.
    if(sourceCueSet.has(row.cueId)){
      assert.ok(projectedCueCards.has(row.cueId),
        family+" source cue "+row.cueId+" disappeared from the curated prayer stream");
    } else {
      // A valid historical source cue may be excluded from the selected
      // Proper or condensed by the source-first composition before any
      // 65-card split. It is an audit exception, not permission to insert
      // phantom text or move a priest/faithful state to the wrong cue.
      nonRenderedSourceAnchors.push({family,cueId:row.cueId});
    }
  }
}
assert.ok(nonRenderedSourceAnchors.every(row=>!projectedCueCards.has(row.cueId)),
  "Non-rendered rubric anchor acquired invented LIVE prayer ownership");

const exactRegistries=Object.freeze(Object.fromEntries(
  Object.entries(cueRegistryNames).map(([name,file])=>[name,load("../data/presentation/"+file)])
));
const exactSourceOnlyAudit=auditOrdinarySungSourceOnlyCues({
  sungCorpus:data.sungCorpus,sourceModel:expandedReview.sourceModel,
  registries:exactRegistries,
});
assert.equal(exactSourceOnlyAudit.sourceOnlyCueCount,15);
assert.equal(exactSourceOnlyAudit.registryReferences,28);
assert.deepEqual(exactSourceOnlyAudit.classificationCounts,{
  properBlockCues:11,conditionalSediliaCues:4,
});
assert.deepEqual(
  expandedReview.presentationModel.sourceOnlyCueRegister.map(x=>x.cueId),
  exactSourceOnlyAudit.entries.map(x=>x.cueId),
  "The curated review must expose a full source-only audit register");
for(const anchor of exactSourceOnlyAudit.entries){
  assert.equal(anchor.automatedIconAllowed,false,
    anchor.cueId+" unaligned priest cue must not generate an icon");
  assert.equal(anchor.runtimePolicy,"REQUIRE_INDEPENDENT_SOURCE_EVENT_TRIGGER");
  assert.ok(expandedReview.presentationModel.cards.some(card=>
    card.blocks.some(block=>block.blockId===anchor.blockId)),
    anchor.cueId+" lost its owning proper/Gloria/Credo source block");
  assert.equal(projectedCueCards.has(anchor.cueId),false,
    anchor.cueId+" source-only action incorrectly acquired an exact prayer focus");
}
const actualRegistryReferences=nonRenderedSourceAnchors
  .map(x=>x.family+"|"+x.cueId).sort();
const auditedReferences=exactSourceOnlyAudit.entries.flatMap(x=>
  x.registryFamilies.map(f=>f+"|"+x.cueId)).sort();
assert.deepEqual(actualRegistryReferences,auditedReferences,
  "Some hidden priest/Proper states were not covered by the exact 28-ref audit");

const transitionRegistry=load("../data/presentation/reader-responses.v1.json").items;
for(const item of transitionRegistry){
  const cueId=item.cueId;
  const owner=projectedCueCards.get(cueId);
  assert.ok(owner,cueId+" response has no prayer card");
  assert.ok(owner.paragraphs.some(p=>(p.sourceCueIds??[]).includes(cueId)),
    cueId+" response must remain with its source paragraph");
}
assert.equal(projectedCueCards.get("AO.SM.C0131"),projectedCueCards.get("AO.SM.C0132"),
  "Orate fratres and Suscipiat should not create an extra swipe");
for(const [response,properSlot] of [
  ["AO.SM.C0074","COLLECT"],
  ["AO.SM.C0255","POSTCOMMUNION"],
]){
  // Proper prayers are resolved dynamically and do not necessarily retain
  // a static donor source cue for the prayer line; the original R. Amen
  // must still be in the SAME visible card as that resolved Proper.
  const card=projectedCueCards.get(response);
  assert.ok(card&&card.blocks.some(block=>String(block.properSlot??"").includes(properSlot)),
    response+" lost its resolved Proper prayer context");
}
for(const [words,action] of [
  ["AO.SM.C0173","AO.SM.C0174"],
  ["AO.SM.C0179","AO.SM.C0181"],
]){
  assert.equal(projectedCueCards.get(words),projectedCueCards.get(action),
    "Consecration and its sourced elevation must remain on the same LIVE card");
  const a=projectedCueIndexes.get(words),b=projectedCueIndexes.get(action);
  assert.ok(b.rowIndex>a.rowIndex,"Elevation must occur after Consecration words");
}
console.log("Curated LIVE liturgical registry coverage: PASS — 6 registries, "+
  projectedCueCards.size+" distinct source cues, replies and elevations retained; "+
  nonRenderedSourceAnchors.length+" non-rendered rubric anchors held for source audit.");

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
assert.equal(cardForCue("AO.SM.C0147"),cardForCue("AO.SM.C0148"),
  "A single priestly Sanctus–Benedictus must not force another swipe");
assert.equal(cardForCue("AO.SM.C0147")?.title,"Sanctus",
  "Concise visible heading must retain both Sanctus and Benedictus on one card");
distinct("AO.SM.C0172","AO.SM.C0173","Host consecration formula must follow preparation");
distinct("AO.SM.C0178","AO.SM.C0179","Chalice consecration formula must follow preparation");
distinct("AO.SM.C0272","AO.SM.C0273","Et Verbum caro factum est must have its own card");
assert.equal(cardForCue("AO.SM.C0173"),cardForCue("AO.SM.C0174"),
  "Host elevation must remain linked to the exact words without a blank transition");
assert.equal(cardForCue("AO.SM.C0179"),cardForCue("AO.SM.C0181"),
  "Chalice elevation must remain linked to the exact words without a blank transition");
const guide=load("../data/presentation/guide-registry.v1.json");
for(const card of expandedReview.presentationModel.cards){
  const inherited=guideForPresentationCard(guide,card);
  assert.ok(inherited?.sourceLinks?.length,card.sectionId+": lost original Guide citations");
  assert.equal(inherited.moment,card.title,card.sectionId+": Guide title mismatched new stage");
  assert.equal(inherited.coverage,"INHERITED_MACRO_CONTEXT",
    "65-card titles must not pretend their Guide content is newly sourced");
}
const curatedHostWords=cardForCue("AO.SM.C0173");
const curatedHostAnchor=captureReaderModeAnchor(curatedHostWords,{activeCueId:"AO.SM.C0173"});
assert.equal(
  findReaderModeAnchorCard(expandedReview.presentationModel,curatedHostAnchor),
  curatedHostWords,"curated exact cue anchor must recover the Host words card");
assert.equal(
  findReaderModeAnchorCard(live.presentationModel,curatedHostAnchor)?.paragraphs.some(
    p=>(p.sourceCueIds??[]).includes("AO.SM.C0173")),true,
  "switching between curated LIVE models lost the Host cue");
assert.equal(
  expandedReview.presentationModel.previousCard(expandedReview.presentationModel.cards[1].sectionId)?.sectionId,
  expandedReview.presentationModel.cards[0].sectionId,
  "curated navigation must preserve previous-card sequence");
assert.equal(
  expandedReview.presentationModel.nextCard(expandedReview.presentationModel.cards[0].sectionId)?.sectionId,
  expandedReview.presentationModel.cards[1].sectionId,
  "curated navigation must preserve next-card sequence");

distinct("AO.SM.C0015","AO.SM.C0016","The celebrant Confiteor starts its own prayer card");
distinct("AO.SM.C0020","AO.SM.C0021","The server Confiteor starts its own prayer card");
assert.ok(expandedReview.presentationModel.cards.some(c=>c.title==="Introit" && c.paragraphs.length),
  "The Introit requires a separate prayer card with resolved Proper text");
distinct("AO.SM.C0094","AO.SM.C0095","The Credo Incarnation starts a separate stage");
assert.equal(cardForCue("AO.SM.C0095"),cardForCue("AO.SM.C0096"),
  "The Credo genuflection and its doctrinal context must stay on one card");
assert.equal(cardForCue("AO.SM.C0108")?.title,"Offertory · Invitation and Antiphon",
  "Short Orémus and the antiphon should not create two swipe screens");
distinct("AO.SM.C0110","AO.SM.C0114","65-card source split must distinguish Bread from Chalice offering");
distinct("AO.SM.C0116","AO.SM.C0120","Incensation is a distinct conditional stage");
distinct("AO.SM.C0237","AO.SM.C0242","Optional Communion Confiteor must not blend into Ecce Agnus Dei");
assert.ok(expandedReview.presentationModel.cards.some(c=>c.title==="Communion Antiphon" && c.paragraphs.length),
  "Communion antiphon should have a separate card with resolved Proper text");
assert.equal(cardForCue("AO.SM.C0248")?.title,"Ablutions",
  "Priest's private ablutions must remain distinct from Communion chant");
distinct("AO.SM.C0262","AO.SM.C0264","Final Blessing must not merge with Placeat");
console.log("Curated Mass LIVE review: "+expandedReview.presentationModel.totalCards+
  " unique liturgical cards; all source prayer paragraphs retained.");


const host=live.presentationModel.cards.find(card=>
  card.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0174"))
);
assert.ok(host,"LIVE Host elevation cue not found");
const anchor=captureReaderModeAnchor(host,{activeCueId:"AO.SM.C0174"});

const simple=buildReaderModeModels({prepared,data,mode:"SIMPLE"});
assert.equal(simple.mode,"LIVE","saved SIMPLE must migrate to LIVE");
assert.equal(simple.sourceModel.totalCards,39);
assert.equal(simple.presentationModel.totalCards,39);
assert.equal(simple.sourceModel.presentationMode,"LIVE");
const simpleHost=findReaderModeAnchorCard(simple.presentationModel,anchor);
assert.equal(simpleHost.sectionId,"AO.CANON.06",
  "Host elevation must retain its source-owned Canon card on saved-mode migration");
assert.ok(simpleHost.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0174")));

const missal=buildReaderModeModels({prepared,data,mode:"MISSAL"});
assert.equal(missal.sourceModel.totalCards,30);
assert.ok(missal.presentationModel.totalCards>missal.sourceModel.totalCards,
  "Missal must expose additional source prayer pages, not reuse only 30 broad sections");
assert.equal(missal.presentationModel.structureOwner,"CANONICAL_MISSAL_PRAYER_BLOCK_PRESENTATION");
assert.equal(missal.presentationModel.sourceAuthorityModel,missal.sourceModel);
const rawMissalParagraphs=missal.sourceModel.cards.flatMap(c=>c.paragraphs);
const refinedMissalParagraphs=missal.presentationModel.cards.flatMap(c=>c.paragraphs);
assert.deepEqual(refinedMissalParagraphs,rawMissalParagraphs,
  "Missal refinement must preserve every original source prayer paragraph, including Proper text");
assert.deepEqual(missal.presentationModel.cards.flatMap(c=>c.blocks.map(b=>b.blockId)),
  missal.sourceModel.cards.flatMap(c=>c.blocks.map(b=>b.blockId)),
  "No Missal prayer block may disappear, duplicate or change source order");
for(const card of missal.presentationModel.cards){
  for(const meta of card.blocks??[]){
    if(meta.paragraphCount>0){
      assert.equal(meta.firstParagraphIndex>=0,true,meta.blockId+" missing local first-paragraph offset");
      assert.ok(meta.firstParagraphIndex+meta.paragraphCount<=card.paragraphs.length,
        meta.blockId+" escaped split Missal card");
    }
  }
}
assert.equal(simple.presentationModel.totalCards,30,
  "Simple mode must remain untouched by Missal-only expansion");
const missalHost=findReaderModeAnchorCard(missal.presentationModel,anchor);
assert.equal(missalHost.sectionId,"AO.CARD.015","Host cue did not remain anchored when switching LIVE -> MISSAL");
const offertoryPage=missal.presentationModel.cards.find(c=>
  c.blocks.some(b=>b.blockId==="AO.SM.B031"));
assert.ok(offertoryPage&&offertoryPage.paragraphs.length,
  "Prayer of the offering of bread requires its own Missal page");
assert.equal(offertoryPage.blocks.length,1);
const enHeadings=missalPrayerHeadingsForCard(offertoryPage,{language:"en"});
const frHeadings=missalPrayerHeadingsForCard(offertoryPage,{language:"fr"});
assert.equal(enHeadings[0].title,"Suscipe, sancte Pater");
assert.equal(enHeadings[0].description,"The offering of the bread.");
assert.equal(frHeadings[0].description,"Offrande du pain.");
assert.equal(enHeadings[0].paragraphIndex,0);
// Ritus servandus VII.4, VII.9: describe the actual selected form without
// attributing a *live* chalice preparation action to the opening of B032.
// Requiem keeps Deus qui humanae and omits the blessing, not the prayer.
const chalicePage=missal.presentationModel.cards.find(c=>
  c.blocks.some(b=>b.blockId==="AO.SM.B032"));
assert.ok(chalicePage&&chalicePage.blocks.length===1&&chalicePage.paragraphs.length,
  "Chalice preparation must retain its own source-owned Missal prayer page");
const chaliceHeading=(mass,language="en")=>
  missalPrayerHeadingsForCard(chalicePage,{language,resolvedMass:mass})[0];
assert.equal(chaliceHeading(null).description,"Preparation of the chalice.",
  "Unknown form must not generate a form-specific ceremonial claim");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const mass={...resolvedMass,form};
  const normalEn=chaliceHeading(mass).description;
  const normalFr=chaliceHeading(mass,"fr").description;
  if(form==="SOLEMN"){
    assert.match(normalEn,/deacon pours the wine/);
    assert.match(normalEn,/subdeacon presents and adds the water/);
    assert.match(normalFr,/diacre verse le vin/);
    assert.match(normalFr,/sous-diacre présente et ajoute l’eau/);
  }else{
    assert.match(normalEn,/priest pours the wine/);
    assert.match(normalEn,/blesses and adds the water/);
    assert.match(normalFr,/prêtre verse le vin/);
  }
  assert.match(normalEn,/before this prayer/i,
    "Wine pouring must not be projected as simultaneous C0112 action");
  const requiem={...mass,actualCelebration:{id:"requiem",type:"REQUIEM"},overlays:["REQUIEM"]};
  const deadEn=chaliceHeading(requiem).description;
  const deadFr=chaliceHeading(requiem,"fr").description;
  assert.match(deadEn,/without blessing (?:the water|it)/);
  assert.match(deadFr,/sans (?:bénir l’eau|la bénir)/);
  assert.doesNotMatch(deadEn,/blesses it|blesses and adds/);
  assert.equal(chaliceHeading({...mass,overlays:["REQUIEM"]}).description,deadEn,
    "Requiem overlay must govern even when actual selection is calendar-derived");
  assert.equal(chaliceHeading({...mass,actualCelebration:{id:"requiem",type:"REQUIEM"},overlays:[]}).description,deadEn,
    "Requiem type must govern even without a duplicated overlay flag");
  assert.equal(chaliceHeading(mass).blockId,"AO.SM.B032");
  assert.equal(chaliceHeading(mass).paragraphIndex,0);
}
assert.equal(chaliceHeading({...resolvedMass,form:"UNKNOWN"}).description,
  "Preparation of the chalice.","Unsupported form must remain generic");
assert.equal(missalPrayerHeadingsForCard(offertoryPage,{
  resolvedMass:{...resolvedMass,form:"SOLEMN"},language:"en"
})[0].description,"The offering of the bread.",
  "Offertory adjacent prayer identity must not inherit chalice-specific minister text");
assert.ok(live.presentationModel.cards.some(c=>c.blocks?.some(b=>b.blockId==="AO.SM.B032")),
  "The original LIVE source block must be preserved");
assert.equal(missal.sourceModel.cards.find(c=>c.blocks.some(b=>b.blockId==="AO.SM.B031")).sectionId,
  "AO.CARD.010","canonical source section identity must remain the owner");

const backLive=findReaderModeAnchorCard(live.presentationModel,captureReaderModeAnchor(simpleHost,{activeCueId:"AO.SM.C0174"}));
assert.equal(backLive.sectionId,host.sectionId,"Host cue did not return to the exact LIVE card");

const split=live.presentationModel.cards.find(card=>
  card.sourceSectionId==="AO.CARD.020" &&
  card.blocks.some(b=>b.blockId==="AO.SM.B066"));
assert.ok(split,"Canonical Pax source block missing from curated LIVE");
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
assert.equal(nuptialLive.presentationModel.totalCards,42,
  "Nuptial insertion remains source-owned instead of legacy-expanded");
const insertion=nuptialLive.presentationModel.cards.find(card=>card.sectionId==="AO.NUPTIAL.02");
assert.ok(insertion);
const insertionAnchor=captureReaderModeAnchor(insertion);
const nuptialSimple=buildReaderModeModels({prepared:nuptialPrepared,data,mode:"SIMPLE"});
assert.equal(nuptialSimple.mode,"LIVE");
assert.equal(nuptialSimple.sourceModel.totalCards,42);
assert.equal(nuptialSimple.sourceModel.totalCards,42,
  "saved Simple mode must not revert the Nuptial source structure");
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

console.log("reader mode switch: PASS — two modes, saved SIMPLE migration, no 48 fallback, source anchors.");
