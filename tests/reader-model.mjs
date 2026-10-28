import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { projectSourceFirst48Presentation } from "../src/mass/reader-live-product48.js";
import { projectGranularMissalCards } from "../src/mass/reader-missal-granularity.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const frenchOrdinary=load("../data/presentation/reader-french-ordinary.v1.json");
const mandatumSource=load("../data/mass/special-days-core.v1.1.json").optional_inserts.HOLY_THURSDAY_MANDATUM;
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus Rosarii","Introit of the Rosary"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const base={
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

const model=createMassReaderModel({resolvedMass:base,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(model.schema,"ao-mass-reader-model-v1");
assert.equal(model.totalCards,39);
assert.equal(model.structureOwner,"SOURCE_FIRST_LIVE");
assert.equal(model.corpusFamily,"SUNG");
assert.equal(model.actualCelebration.id,"holy_rosary");
assert.equal(model.properSource,"Sancti/10-07");
assert.equal(model.cards[13].title,"Te igitur");
assert.equal(model.cards[17].title,"Quam oblationem");
assert.equal(model.cards[18].title,"Consecration of the Sacred Host");
assert.equal(model.cards[19].title,"Consecration of the Chalice");
assert.equal(model.cards[26].title,"Per ipsum · Minor Elevation");
assert.equal(model.cards[29].title,"Agnus Dei");
assert.equal(model.cards[38].title,"Last Gospel");
assert.equal(model.cards[7].stateOnly,true,"Homily must stay state-only");

const host=model.cardForEvent("MC-CNS-010");
assert.equal(host.card.sectionId,"AO.CANON.06");
assert.equal(host.canonicalEventId,"MC-CNS-010");
assert.equal(host.progress.label,"19 / 39");
assert.equal(model.previousCard("AO.CANON.06").sectionId,"AO.CANON.05");
assert.equal(model.nextCard("AO.CANON.06").sectionId,"AO.CANON.07");
assert.equal(model.cardForEvent("MC-UNKNOWN"),null);

const lowModel=createMassReaderModel({
  resolvedMass:{...base,form:"LOW",presentationMode:"MISSAL",overlays:[]},
  sectionMap,lowCorpus:low,sungCorpus:sung
});
assert.equal(lowModel.corpusFamily,"LOW");
assert.equal(lowModel.totalCards,30);

const solemnSpeakerModel=createMassReaderModel({
  resolvedMass:{...base,form:"SOLEMN"},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
const simpleCantataSpeakerModel=createMassReaderModel({
  resolvedMass:{...base,form:"MISSA_CANTATA_SIMPLE"},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
// Ritus servandus XIII.2 and normal incensation form ownership:
// entrance incensation is entirely omitted in Requiem; Offertory remains
// possible in incensed sung forms. LOW and unincensed Missa Cantata omit BOTH
// conditional incense blocks without mutating the frozen source corpora.
const hasTextCue=(m,id)=>m.cards.some(c=>c.paragraphs.some(p=>p.sourceCueIds?.includes(id)));
for(const m of [lowModel,simpleCantataSpeakerModel]){
 for(const cueId of ["AO.SM.C0040","AO.SM.C0041","AO.SM.C0120","AO.SM.C0121","AO.SM.C0122","AO.SM.C0123","AO.SM.C0124"])
   assert.equal(hasTextCue(m,cueId),false,m.form+" showed a conditional incense prayer/direction");
 for(const id of ["AO.SM.B013","AO.SM.B036"])
   assert.equal(m.cards.flatMap(c=>c.blocks).find(b=>b.blockId===id)?.omittedByRite,
     "1962_FORM_NO_INCENSE",m.form+" lost omitted-block source ownership");
}
for(const m of [model,solemnSpeakerModel]){
 for(const cueId of ["AO.SM.C0040","AO.SM.C0041","AO.SM.C0122","AO.SM.C0124"])
   assert.equal(hasTextCue(m,cueId),true,m.form+" lost an appointed incense cue");
}
const speakerFor=(m,id)=>m.cards.flatMap(c=>c.paragraphs).find(p=>
  p.id===id || p.sourceCueIds?.includes(id)
)?.speakerRole;
for(const [selected,form] of [
  [model,"MISSA_CANTATA_INCENSE"],
  [simpleCantataSpeakerModel,"MISSA_CANTATA_SIMPLE"],
  [solemnSpeakerModel,"SOLEMN"],
  [lowModel,"LOW"],
]){
  const gospel=form==="SOLEMN"?"DEACON":"PRIEST";
  const epistle=form==="SOLEMN"?"SUBDEACON":
    form==="LOW"?"PRIEST":"MINISTER_TO_BE_OBSERVED";
  for(const id of ["AO.SM.C0082","AO.SM.C0084","GOSPEL.1"]){
    assert.equal(speakerFor(selected,id),gospel,
      form+"/"+id+" public Gospel performer");
  }
  assert.equal(speakerFor(selected,"EPISTLE_OR_LESSON.1"),epistle,
    form+" Epistle actor must match the selected 1962 Mass form");
  assert.equal(speakerFor(selected,"AO.SM.C0259"),gospel,
    form+" dismissal minister performer");
  for(const id of ["AO.SM.C0083","AO.SM.C0085","AO.SM.C0260"]){
    assert.equal(speakerFor(selected,id),"RESPONDERS",
      form+"/"+id+" response must not inherit Gospel/dismissal deacon");
  }
}
// EN/FR share the canonical cue and actor ownership. Language switching
// must not turn conditional source ministers into the generic SUNG actor.
// A bilingual *test-only* Proper fixture is used here: its French strings
// are placeholders, NOT approved translations or production Proper data.
const frenchSpeakerProper=Object.fromEntries(Object.entries(proper).map(([key,value])=>{
  const row=v=>v&&typeof v==="object"&&v.lat&&v.en
    ?{...v,fr:"FR TEST · "+v.en}:v;
  return [key,Array.isArray(value)?value.map(row):row(value)];
}));
for(const [form,enModel] of [
  ["LOW",lowModel],
  ["MISSA_CANTATA_SIMPLE",simpleCantataSpeakerModel],
  ["MISSA_CANTATA_INCENSE",model],
  ["SOLEMN",solemnSpeakerModel],
]){
  const frModel=createMassReaderModel({
    resolvedMass:{...base,form,
      presentationMode:form==="LOW"?"MISSAL":"LIVE",
      overlays:form==="LOW"?[]:base.overlays,
      proper:{...base.proper,data:frenchSpeakerProper}},
    sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
    frenchOrdinary,vernacularLanguage:"fr",
  });
  for(const cue of [
    "AO.SM.C0082","AO.SM.C0083","AO.SM.C0084","AO.SM.C0085",
    "EPISTLE_OR_LESSON.1","GOSPEL.1","AO.SM.C0259","AO.SM.C0260",
  ]){
    assert.equal(speakerFor(frModel,cue),speakerFor(enModel,cue),
      form+"/"+cue+": switching EN/FR changed the actual-form speaking minister");
  }
}

assert.match(model.cards.flatMap(c=>c.paragraphs).find(p=>
  p.sourceCueIds?.includes("AO.SM.C0020"))?.primary??"",
  /^S\. Amen\./,
  "Selected Cantata must retain the historically sourced Sung preparatory prefix");


assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,proper:null},sectionMap,lowCorpus:low,sungCorpus:sung
}),/READY resolved Proper/);

// At incensed Requiem, do not show the omitted entrance/Introit
// incensation, but keep Offertory incensation where rubric permits.
const incensedRequiemEntrModel=createMassReaderModel({
  resolvedMass:{...base,overlays:["REQUIEM"]},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
});
for(const id of ["AO.SM.C0040","AO.SM.C0041"])
 assert.equal(hasTextCue(incensedRequiemEntrModel,id),false,
   "Requiem displayed the forbidden entrance incensation "+id);
for(const id of ["AO.SM.C0120","AO.SM.C0121","AO.SM.C0122","AO.SM.C0123","AO.SM.C0124"])
 assert.equal(hasTextCue(incensedRequiemEntrModel,id),true,
   "Requiem incorrectly suppressed permitted Offertory incensation "+id);
assert.equal(incensedRequiemEntrModel.cards.flatMap(c=>c.blocks)
 .find(b=>b.blockId==="AO.SM.B013")?.omittedByRite,
 "RITUS_XIII_2_REQUIEM");
for(const id of ["AO.SM.C0263","AO.SM.C0264","AO.SM.C0265","AO.SM.C0266"])
 assert.equal(hasTextCue(incensedRequiemEntrModel,id),false,
   "Requiem improperly displayed the final blessing "+id);
for(const id of ["AO.SM.C0261","AO.SM.C0262","AO.SM.C0267","AO.SM.C0269"])
 assert.equal(hasTextCue(incensedRequiemEntrModel,id),true,
   "Requiem incorrectly omitted Placeat, altar kiss or Last Gospel "+id);
assert.equal(incensedRequiemEntrModel.cards.flatMap(c=>c.blocks)
 .find(b=>b.blockId==="AO.SM.B092")?.omittedByRite,
 "RITUS_XIII_1_REQUIEM");
const reqIncense=incensedRequiemEntrModel.cards.flatMap(c=>c.paragraphs)
 .find(p=>p.sourceCueIds?.includes("AO.SM.C0124"));
const ordinaryIncense=model.cards.flatMap(c=>c.paragraphs)
 .find(p=>p.sourceCueIds?.includes("AO.SM.C0124"));
assert.ok(reqIncense&&ordinaryIncense);
assert.match([reqIncense.primary,reqIncense.alternate,reqIncense.secondary].join(" "),
 /Only the celebrant is incensed/u);
assert.match([ordinaryIncense.primary,ordinaryIncense.alternate,ordinaryIncense.secondary].join(" "),
 /clergy and people are incensed/u);

const requiemModel=createMassReaderModel({
  resolvedMass:{...base,overlays:["REQUIEM"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(requiemModel.totalCards,39,"plan-owned Requiem overlay duplicated or removed Mass reader cards");

// Source 39 / product 48 and MISSAL granularities must retain the two valid
// Communion prayers, omit only B069/C0225 at Requiem, and never invent a
// blank card or disturb the historical presentation-card denominator.
const requiem48=projectSourceFirst48Presentation(requiemModel);
assert.equal(requiem48.totalCards,48,"Requiem omission changed the 48-card LIVE structure");
assert.equal(requiem48.cards.filter(c=>c.paragraphs?.some(p=>
  p.sourceCueIds?.includes("AO.SM.C0225"))).length,0);
const communion48=requiem48.cards.find(c=>c.sectionId==="AO.LIVE48.022.A");
assert.ok(communion48,"Missing original decompressed Communion source card");
for(const cueId of ["AO.SM.C0226","AO.SM.C0227"])
  assert.ok(communion48.paragraphs.some(p=>p.sourceCueIds?.includes(cueId)),
    "Requiem 48-step projection lost "+cueId);
assert.equal(communion48.blocks.find(b=>b.blockId==="AO.SM.B069")?.paragraphCount,0);

const requiemMissal=projectGranularMissalCards(createMassReaderModel({
  resolvedMass:{...base,form:"LOW",presentationMode:"MISSAL",overlays:["REQUIEM"]},
  sectionMap,lowCorpus:low,sungCorpus:sung
}));
assert.ok(requiemMissal.totalCards>30,"Missal prayer granularity unexpectedly collapsed");
assert.ok(requiemMissal.cards.every(c=>c.stateOnly||c.paragraphs?.length>0),
  "Requiem Missal created a blank fictional Communion prayer");
const missalText=requiemMissal.cards.flatMap(c=>c.paragraphs);
assert.ok(!missalText.some(p=>p.sourceCueIds?.includes("AO.SM.C0225")),
  "Requiem MISSAL includes omitted first peace prayer");
for(const id of ["AO.SM.C0226","AO.SM.C0227"])
  assert.ok(missalText.some(p=>p.sourceCueIds?.includes(id)),
    "Requiem MISSAL lost valid Communion prayer "+id);
assert.ok(requiemMissal.cards.flatMap(c=>c.blocks).some(b=>
  b.blockId==="AO.SM.B069"&&b.omittedByRite==="RITUS_XIII_1_REQUIEM"),
  "Requiem Missal lost canonical owner metadata for omitted prayer");


// The Requiem Ordinary substitutes the three EXACT Agnus texts. The raw
// Low/Sung donor corpora remain immutable; the preselected celebration or
// explicit overlay determines the variant, never the civil date alone.
const agnusRequiemByCue={
  "AO.SM.C0222":"dona eis réquiem.",
  "AO.SM.C0223":"dona eis réquiem.",
  "AO.SM.C0224":"dona eis réquiem sempitérnam.",
};
const paragraphForCue=(reader,id)=>reader.cards.flatMap(c=>c.paragraphs).find(
  p=>p.sourceCueIds?.includes(id)
);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const [language,expectedRest] of [["en",/grant them (?:eternal )?rest/i],
                                        ["fr",/donnez-leur le repos(?: éternel)?/i]]){
    for(const selectedRequiem of [
      {...base,form,overlays:["REQUIEM"]},
      {...base,form,overlays:[],actualCelebration:{id:"requiem",type:"REQUIEM"}},
    ]){
      const r=createMassReaderModel({
        resolvedMass:{...selectedRequiem,
          presentationMode:form==="LOW"?"MISSAL":"LIVE",
          proper:language==="fr"?{...base.proper,data:frenchSpeakerProper}:base.proper},
        sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
        frenchOrdinary,vernacularLanguage:language
      });
      assert.equal(r.cards.length,form==="LOW"?30:39,form+" changed card count");
      // XIII.1: C0225 first peace prayer is absent, while C0226 and C0227
      // remain actual prayers with their original cue IDs and navigable card.
      assert.equal(paragraphForCue(r,"AO.SM.C0225"),undefined,
        form+" Requiem displayed the forbidden peace prayer");
      for(const id of ["AO.SM.C0226","AO.SM.C0227"])
        assert.ok(paragraphForCue(r,id),form+" lost "+id+" after omission");
      const peaceBlock=r.cards.flatMap(c=>c.blocks).find(b=>b.blockId==="AO.SM.B069");
      assert.equal(peaceBlock?.omittedByRite,"RITUS_XIII_1_REQUIEM");
      assert.equal(peaceBlock.paragraphCount,0);

      for(const [cueId,ending] of Object.entries(agnusRequiemByCue)){
        const p=paragraphForCue(r,cueId);
        assert.ok(p,form+" missing Requiem "+cueId);
        const words=[p.primary,p.secondary,p.alternate,p.latin,p.vernacular].filter(Boolean);
        const joined=words.join(" | ");
        assert.ok(joined.includes(ending),form+" Latin Agnus variant missing "+cueId);
        assert.match(joined,expectedRest,form+" "+language+" Requiem variant missing "+cueId);
        assert.doesNotMatch(joined,/miserére nobis|dona nobis pacem|have mercy on us|grant us peace|ayez pitié de nous|donnez-nous la paix/i,
          form+" imported ordinary Agnus wording into Requiem "+cueId);
      }
    }
    const ordinary=createMassReaderModel({
      resolvedMass:{...base,form,overlays:[],presentationMode:form==="LOW"?"MISSAL":"LIVE",
        proper:language==="fr"?{...base.proper,data:frenchSpeakerProper}:base.proper},
      sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
      frenchOrdinary,vernacularLanguage:language
    });
    assert.ok(paragraphForCue(ordinary,"AO.SM.C0225"),
      form+" ordinary pre-Communion peace prayer disappeared");
    for(const cueId of Object.keys(agnusRequiemByCue)){
      const p=paragraphForCue(ordinary,cueId);
      assert.ok(p,form+" ordinary Agnus was removed");
      const words=[p.primary,p.secondary,p.alternate,p.latin,p.vernacular].filter(Boolean).join(" | ");
      assert.doesNotMatch(words,/dona eis réquiem/i,
        form+" unselected Requiem variant leaked into ordinary "+cueId);
    }
  }
}

const requiemAbsolutionModel=createMassReaderModel({
  resolvedMass:{...base,overlays:["REQUIEM"],followingActions:["REQUIEM_ABSOLUTION"]},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(requiemAbsolutionModel.totalCards,39,"Requiem Absolution following action mutated the Mass reader model");

const aspergesModel=createMassReaderModel({
  resolvedMass:{...base,precedingRites:["ASPERGES"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(aspergesModel.totalCards,39,"Asperges prelude mutated the LIVE Mass card model");
const palmModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["PALM"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(palmModel.totalCards,39,"Palm prelude mutated the LIVE Mass card model");
const ashModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["ASH"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(ashModel.totalCards,39,"Ash prelude mutated the LIVE Mass card model");
const candlemasModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["CANDLEMAS"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(candlemasModel.totalCards,39,"Candlemas prelude mutated the LIVE Mass card model");
const rogationsModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["ROGATIONS"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(rogationsModel.totalCards,39,"Rogations prelude mutated the LIVE Mass card model");
const corpusModel=createMassReaderModel({
  resolvedMass:{...base,followingActions:["CORPUS_CHRISTI_PROCESSION"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(corpusModel.totalCards,39,"Corpus Christi following action mutated the LIVE Mass card model");

const genericProcessionModel=createMassReaderModel({
  resolvedMass:{...base,followingActions:["GENERIC_PROCESSION"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(genericProcessionModel.totalCards,39,"Generic Procession following action mutated the LIVE Mass card model");

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,distinctRite:"UNSUPPORTED_TEST_RITE"},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
}),/distinct rite UNSUPPORTED_TEST_RITE/);

console.log("Mass reader model: PASS — 39-step source-first LIVE and 30-card MISSAL source models remain Proper-safe.");


const holyThursdayResolved={
  ...base,date:"2027-03-25",overlays:[],actualCelebration:{id:"holy-thursday",type:"CALENDAR"},
  proper:{status:"READY",sourcePath:"Tempora/Quad6-4r",
    data:{...proper,sourcePath:"Tempora/Quad6-4r"}},
  precedingRites:[],followingActions:["HOLY_THURSDAY_POST"]
};
const htQuiet=createMassReaderModel({
  resolvedMass:holyThursdayResolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(htQuiet.holyThursday,true);
assert.equal(htQuiet.mandatumPresent,false);
assert.equal(htQuiet.totalCards,38,"No Credo on 1962 Holy Thursday");
assert.equal(htQuiet.cardForEvent("MC-CRD-010"),null,"Holy Thursday Credo must not render");
const cue=(model,id)=>model.cards.flatMap(c=>c.paragraphs).find(p=>p.sourceCueIds?.includes(id));
for(const [id,phrase] of [
  ["AO.SM.C0157","et diem sacratíssimum"],
  ["AO.SM.C0161","trádidit discípulis suis Córporis et Sánguinis"],
  ["AO.SM.C0162","Per eúndem Christum"],
  ["AO.SM.C0168","hoc est, hódie"]
]){
 assert.ok(cue(htQuiet,id)?.alternate?.includes(phrase),id+" proper 1962 Latin not projected");
}
assert.equal(cue(htQuiet,"AO.SM.C0173").alternate,"HOC EST ENIM CORPUS MEUM.","Consecration formula mutated");
assert.equal(cue(htQuiet,"AO.SM.C0158").alternate,"Iesu Christi:","Communicantes cue split mutated");
assert.equal(htQuiet.cardBySequence(8).sourceSequence,8);
assert.equal(htQuiet.cardBySequence(9).sourceSequence,10);

const htMandatum=createMassReaderModel({
 resolvedMass:holyThursdayResolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
 holyThursdayMandatumPresent:true,
 holyThursdayMandatumSource:mandatumSource,
});
assert.equal(htMandatum.totalCards,39);
assert.equal(htMandatum.cardBySequence(9).sectionId,"AO.HT.MANDATUM");
assert.equal(htMandatum.cardBySequence(8).sourceSequence,8);
assert.equal(htMandatum.cardBySequence(10).sourceSequence,10);
assert.equal(htMandatum.mandatumPresent,true);
assert.deepEqual(htMandatum.mandatumEventIds,mandatumSource.events.map(x=>x.id));
assert.equal(htMandatum.cardBySequence(9).sourceRecordIds.length,6);
for(const [i,record] of mandatumSource.events.entries()){
  const found=htMandatum.cardForEvent(record.id);
  assert.equal(found.canonicalEventId,record.id);
  assert.equal(found.card.sectionId,"AO.HT.MANDATUM");
  assert.equal(found.mandatumStageIndex,i);
  assert.equal(found.mandatumEvent.actor_scope,record.actor_scope);
}
assert.throws(()=>createMassReaderModel({
 resolvedMass:holyThursdayResolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
 holyThursdayMandatumPresent:true
}),/existing 1962 Mandatum source insert/);

assert.equal(htMandatum.cardBySequence(9).provenance.textComplete,false,"selected antiphons are not full printed certification");
assert.ok(htMandatum.cardBySequence(9).paragraphs.some(p=>p.alternate.includes("Mandátum novum do vobis")));
assert.ok(htMandatum.cardBySequence(9).paragraphs.some(p=>p.alternate.includes("Ubi cáritas")));
assert.ok(htMandatum.cardBySequence(9).paragraphs.some(p=>p.alternate.includes("Adésto, Dómine")));
assert.equal(htMandatum.cardBySequence(9).faithfulPosture,"LOCAL_OR_INHERIT");
assert.equal(htMandatum.cardForEvent("MC-CRD-010"),null);
assert.equal(htMandatum.cardForEvent("MC-CNS-010").card.sectionId,"AO.CANON.06");
assert.equal(htMandatum.previousCard("AO.HT.MANDATUM").sourceSectionId,"AO.CARD.008");
assert.equal(htMandatum.nextCard("AO.HT.MANDATUM").sourceSectionId,"AO.CARD.010");

const htLow=createMassReaderModel({
 resolvedMass:{...holyThursdayResolved,form:"LOW",presentationMode:"MISSAL"},
 sectionMap,lowCorpus:low,sungCorpus:sung
});
assert.equal(htLow.totalCards,29);
assert.ok(cue(htLow,"AO.SM.C0168").alternate.includes("hoc est, hódie"));
assert.ok(cue(htLow,"AO.SM.C0161").alternate.includes("Córporis et Sánguinis"));
const genericCue=cue(model,"AO.SM.C0168");
assert.ok(genericCue.alternate.includes("Qui prídie quam paterétur"));
assert.ok(!genericCue.alternate.includes("hoc est, hódie"));
assert.throws(()=>createMassReaderModel({
 resolvedMass:base,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,holyThursdayMandatumPresent:true
}),/non-Holy-Thursday/);
console.log("1962 Holy Thursday Canon: PASS — 4 variant cues, both Mass forms, ordinary isolated, optional Mandatum after homily, no Credo.");
