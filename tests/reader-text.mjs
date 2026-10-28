import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderSectionResolver } from "../src/mass/reader-sections.js";
import {
  validateReaderTextCorpus,
  selectReaderTextCorpus,
  buildReaderSectionCard,
  LIVE_LATIN_FIRST_INVITATION_CUES,
} from "../src/mass/reader-text.js";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";
import { requiemFootPsalmAndLavaboOmittedCuesForResolvedMass, requiemGospelOmittedCuesForResolvedMass } from "../src/mass/reader-requiem-conditions.js";
import { missalRequiemIntroitCrossDescription, missalChalicePreparationDescription } from "../src/mass/reader-missal-granularity.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const map=load("../data/presentation/reader-section-map.v0.13.1.json");
const sections=createReaderSectionResolver(map);

const la=validateReaderTextCorpus(low);
const sa=validateReaderTextCorpus(sung);
assert.equal(la.blocks,96);
assert.equal(sa.blocks,96);
assert.equal(la.rawSha256,"2ed36ea25b00d515a9f4a6edd1e02da274ebb92c082ecaea4dfc73feade03044");
assert.equal(sa.rawSha256,"050ce4b65918890a252078c9942f1dde282d2494dabe0e522bb842c03be20b28");
assert.equal(la.properBlocks,11);
assert.equal(sa.properBlocks,11);

for(const corpus of [low,sung]){
  for(const block of corpus.blocks.filter(b=>b.Proper_Slot)){
    assert.ok(block.units.every(u=>u.latin===null && u.english===null),
      block.Block_ID+" leaked donor-date Proper text");
  }
}

// Canonical 1962 temporal order gates: the reader must never move a
// Proper prayer, its introductory versicle, or its respondent into a
// neighbouring liturgical moment. Check BOTH source families independently.
const liturgicalCheckpoints=[
  "B017","B018","B019","B020", // Collect dialogue, Collects, Epistle
  "B023","B024","B025","B026","B096","B027", // Gospel, homily, Credo
  "B028","B029","B030","B039","B040","B041","B042", // Offertory/Secrets/Preface
  "B045","B046","B047","B052","B053","B060","B061", // Preface/Canon
  "B062","B063","B064","B065","B066","B068", // Pater to Agnus
  "B073","B074","B075","B076","B080","B081","B082", // Both communions
  "B083","B084","B085","B086","B087","B088", // Ablutions, antiphon, Postcommunions
  "B089","B090","B091","B092","B093","B094","B095", // Dismissal to Last Gospel
];
for(const corpus of [low,sung]){
  const blocks=new Map(corpus.blocks.map(x=>[x.Block_ID,x]));
  let last=-Infinity;
  for(const shortId of liturgicalCheckpoints){
    const id="AO.SM."+shortId,block=blocks.get(id);
    assert.ok(block,corpus.form+" missing essential liturgical section "+id);
    assert.ok(block.Display_Order>last,
      corpus.form+" Mass section out of order at "+id);
    last=block.Display_Order;
  }
  const secretEnd=blocks.get("AO.SM.B041").units;
  assert.match(secretEnd[0].latin,/Per ómnia sæcula sæculórum/u);
  assert.equal(secretEnd[1].latin,"℟. Amen.");
  assert.ok(/RESPONSE/.test(secretEnd[1].clock),
    "the final Secret Amen must be an actual minister/faithful response");
  const collectResponse=blocks.get("AO.SM.B019").units.at(-1);
  const postcommunionResponse=blocks.get("AO.SM.B088").units
    .find(u=>u.cue_id==="AO.SM.C0255");
  assert.ok(/RESPONSE/.test(collectResponse.clock),
    "Collect must conclude with its own response");
  assert.ok(/RESPONSE/.test(postcommunionResponse.clock),
    "Postcommunion must conclude with its own response");
}

assert.equal(selectReaderTextCorpus({form:"LOW",lowCorpus:low,sungCorpus:sung}).family,"LOW");
assert.equal(selectReaderTextCorpus({form:"MISSA_CANTATA_SIMPLE",lowCorpus:low,sungCorpus:sung}).family,"SUNG");
assert.equal(selectReaderTextCorpus({form:"SOLEMN",lowCorpus:low,sungCorpus:sung}).family,"SUNG");

const kyrie=buildReaderSectionCard({
  corpus:low,
  section:sections.sectionById("AO.CARD.002"),
});
assert.equal(kyrie.title,"Kyrie");
assert.ok(kyrie.paragraphs.length>0);
assert.ok(kyrie.paragraphs.every(p=>p.primary));

assert.throws(()=>buildReaderSectionCard({
  corpus:low,
  section:sections.sectionById("AO.CARD.001"),
}),/Proper slot INTROIT is unresolved/);

const slots=[
  "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
  "GOSPEL","OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
];
const properSlots=Object.fromEntries(slots.map(slot=>[slot,{
  status:"READY",
  data:{
    latin:"LATIN "+slot,
    english:"ENGLISH "+slot,
  }
}]));

for(const corpus of [low,sung]){
  for(const section of sections.sections){
    const card=buildReaderSectionCard({corpus,section,properSlots});
    assert.equal(card.sequence,section.sequence);
    if(section.sectionId==="AO.CARD.008"){
      assert.equal(card.stateOnly,true,"Homily pause must be a titled state-only card");
      assert.equal(card.title,"Sermon / Homily");
      assert.equal(card.paragraphs.length,0);
    }else{
      assert.equal(card.stateOnly,false,section.sectionId+" unexpectedly became state-only");
      assert.ok(card.paragraphs.length>0,section.sectionId+" built a blank card");
      assert.ok(card.paragraphs.every(p=>p.primary),section.sectionId+" has blank primary text");
    }
  }
}

const introit=buildReaderSectionCard({
  corpus:low,
  section:sections.sectionById("AO.CARD.001"),
  properSlots,
});
assert.ok(introit.paragraphs.some(p=>p.primary==="ENGLISH INTROIT"),"resolved Proper was not inserted");
assert.ok(!introit.paragraphs.some(p=>/Salus p[oó]puli/i.test(p.primary)),"donor-date Introit leaked into generic card");

const collectSourceCard=buildReaderSectionCard({
  corpus:sung,section:sections.sectionById("AO.CARD.004"),properSlots,
});
const primaryCollect=collectSourceCard.paragraphs.find(p=>p.primary==="ENGLISH COLLECT_SET");
assert.ok(primaryCollect,"canonical Collect Proper not found");
assert.equal(primaryCollect.sourceAnchorCueId,"AO.SM.C0073",
  "principal Collect lost canonical source cue anchor");

const epistleCard=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.005"),
  properSlots,
});
assert.ok(epistleCard.paragraphs.some(p=>
  p.id==="AO.SM.C0076" &&
  /Deo grátias/.test(p.primary) &&
  /Thanks be to God/.test(p.secondary??"")
), "fixed Deo gratias follow-up disappeared behind Proper replacement");

// The published Low donor records MINISTER_RESPONSE, not a generic
// congregational voice, for the replies to Collect, Lesson, Gospel and
// Postcommunion. Sung keeps its distinct USER_RESPONSE ownership.
for(const [corpus,expectedRole] of [[low,"MINISTERS"],[sung,"RESPONDERS"]]){
  for(const [cardId,cueId] of [
    ["AO.CARD.004","AO.SM.C0074"],
    ["AO.CARD.005","AO.SM.C0076"],
    ["AO.CARD.007","AO.SM.C0087"],
    ["AO.CARD.027","AO.SM.C0255"],
  ]){
    const card=buildReaderSectionCard({corpus,section:sections.sectionById(cardId),properSlots});
    const paragraph=card.paragraphs.find(p=>p.id===cueId);
    assert.ok(paragraph,corpus.form+" missing fixed Proper reply "+cueId);
    assert.equal(paragraph.kind,"RESPONSE",corpus.form+" lost reply classification "+cueId);
    assert.equal(paragraph.speakerRole,expectedRole,
      corpus.form+" mislabels fixed Proper reply "+cueId);
  }
}

const gospelCard=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.007"),
  properSlots,
});
assert.ok(gospelCard.paragraphs.some(p=>
  p.id==="AO.SM.C0087" &&
  /Laus tibi, Christe/.test(p.primary) &&
  /Praise be to Thee, O Christ/.test(p.secondary??"")
), "fixed Laus tibi follow-up disappeared behind Proper replacement");
assert.ok(gospelCard.paragraphs.some(p=>p.id==="AO.SM.C0088" && /sins be blotted out/.test(p.primary)),
  "priest-private Per evangelica dicta disappeared behind Proper replacement");
assert.equal(gospelCard.paragraphs.filter(p=>/ENGLISH GOSPEL/.test(p.primary)).length,1,
  "Gospel Proper payload was duplicated during fixed-tail composition");

// The Requiem Introit book-cross is a static source instruction, not a
// claimed observation. Offertory water's already-correct restriction remains.
const resolvedRequiem={form:"SOLEMN",overlays:["REQUIEM"],
  actualCelebration:{type:"REQUIEM"}};
assert.match(missalRequiemIntroitCrossDescription(resolvedRequiem,{language:"en"}),
  /Cross over the Missal/);
assert.match(missalRequiemIntroitCrossDescription(resolvedRequiem,{language:"fr"}),
  /croix au-dessus du missel/);
assert.equal(missalRequiemIntroitCrossDescription({
  form:"SOLEMN",overlays:[],actualCelebration:{type:"CALENDAR"}}),null);
assert.match(missalChalicePreparationDescription(resolvedRequiem,{language:"en"}),
  /without blessing the water/);

// XIII.1: Requiem Gospel does not include the private Jube/Dominus-sit
// petition or the book-kiss Per evangelica dicta, but retains Munda cor
// meum, the Gospel Proper, and the Laus tibi response. Both texts, both forms.
const gospelOmissions=requiemGospelOmittedCuesForResolvedMass({overlays:["REQUIEM"]});
assert.deepEqual(gospelOmissions,["AO.SM.C0080","AO.SM.C0088"]);
assert.deepEqual(requiemGospelOmittedCuesForResolvedMass({overlays:[]}),[]);
const gospelFrench=load("../data/presentation/reader-french-ordinary.v1.json");
for(const corpus of [low,sung]){
 for(const language of ["en","fr"]){
  const opts={corpus,properSlots,vernacularLanguage:language,
    frenchOrdinary:gospelFrench};
  const reqPrep=buildReaderSectionCard({
    ...opts,section:sections.sectionById("AO.CARD.007"),
    omittedOrdinaryCues:gospelOmissions,
  });
  const reqGospel=buildReaderSectionCard({
    ...opts,section:sections.sectionById("AO.CARD.007"),
    omittedOrdinaryCues:gospelOmissions,
  });
  const ids=x=>x.paragraphs.flatMap(p=>p.sourceCueIds??[p.id]);
  assert.ok(ids(reqPrep).includes("AO.SM.C0079"),"Requiem lost Munda cor meum");
  assert.ok(ids(reqPrep).includes("AO.SM.C0081"),"Requiem lost Gospel-side movement");
  assert.ok(!ids(reqPrep).includes("AO.SM.C0080"),"Requiem retained Jube Domine");
  assert.ok(reqGospel.paragraphs.some(p=>p.primary==="ENGLISH GOSPEL"),
    "Requiem lost resolved Gospel text");
  assert.ok(ids(reqGospel).includes("AO.SM.C0087"),"Requiem lost Laus tibi");
  assert.ok(!ids(reqGospel).includes("AO.SM.C0088"),"Requiem retained Per evangelica dicta");
  const normalPrep=buildReaderSectionCard({
    ...opts,section:sections.sectionById("AO.CARD.007"),
  });
  const normalGospel=buildReaderSectionCard({
    ...opts,section:sections.sectionById("AO.CARD.007"),
  });
  assert.ok(ids(normalPrep).includes("AO.SM.C0080"),"Ordinary Jube Domine changed");
  assert.ok(ids(normalGospel).includes("AO.SM.C0088"),"Ordinary Gospel kiss changed");
 }
}
console.log("Ritus XIII.1 Requiem Gospel exceptions: PASS — LOW/SUNG EN/FR, Ordinary unchanged.");

const lastGospel=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.030"),
  properSlots,
});
assert.equal(lastGospel.title,"Last Gospel");
assert.ok(lastGospel.paragraphs.length>0);

const gloria=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.003"),
  properSlots,
});
assert.ok(!gloria.paragraphs.some(p=>["AO.SM.C0276","AO.SM.C0277"].includes(p.id)),
  "Gloria state sentinels leaked into prayer text");
const gloriaOpening=gloria.paragraphs.find(p=>Array.isArray(p.sourceCueIds) && p.sourceCueIds.includes("AO.SM.C0053"));
assert.ok(gloriaOpening,"Gloria opening composite was not built");
assert.deepEqual(gloriaOpening.sourceCueIds,["AO.SM.C0053","AO.SM.C0054"],
  "Gloria opening lost canonical cue provenance");
assert.equal(gloriaOpening.primary,"Glória in excélsis Deo.",
  "Sung Gloria opening is not Latin-first");
assert.equal(gloriaOpening.alternate,"Glory to God in the highest.",
  "Gloria English opening lost its exact replace-in-place translation");
assert.equal(gloriaOpening.secondary,null,"sung Gloria should not add translation underneath");
assert.equal(gloriaOpening.replaceOnToggle,true);
assert.equal(gloriaOpening.speakerRole,"PRIEST",
  "Gloria's entire intonation must be owned by the celebrant");
const foot=buildReaderSectionCard({corpus:sung,section:sections.sectionById("AO.CARD.001"),properSlots});
for(const [cue,prefix,actor] of [
  ["AO.SM.C0001","S.","PRIEST"],
  ["AO.SM.C0016","S.","PRIEST"],
  ["AO.SM.C0019","M.","MINISTERS"],
  ["AO.SM.C0020","S.","PRIEST"],
  ["AO.SM.C0021","M.","MINISTERS"],
  ["AO.SM.C0024","S.","PRIEST"],
  ["AO.SM.C0025","M.","MINISTERS"],
  ["AO.SM.C0026","S.","PRIEST"],
  ["AO.SM.C0027","M.","MINISTERS"],
]){
  const p=foot.paragraphs.find(p=>p.sourceCueIds?.includes(cue));
  assert.ok(p,cue+": missing opening dialogue");
  assert.ok(p.primary.startsWith(prefix+" "),cue+": opening speaker initial lost");
  assert.equal(p.speakerRole,actor,cue+": speaker metadata does not match 1962 dialogue");
}

for(const corpus of [low,sung]){
  const offertoryCard=buildReaderSectionCard({
    corpus,
    section:sections.sectionById("AO.CARD.010"),
    properSlots,
  });
  const glory=offertoryCard.paragraphs.filter(p=>/Glory be to the Father, and to the Son, and to the Holy Ghost/.test(p.primary));
  const sicut=offertoryCard.paragraphs.filter(p=>/As it was in the beginning, is now, and ever shall be/.test(p.primary));
  assert.equal(glory.length,1,corpus.form+" Lavabo projects Glory be exactly once");
  assert.equal(sicut.length,1,corpus.form+" Lavabo projects Sicut erat exactly once");
}

// P0 1962 All Souls field gate — Ritus servandus XIII.1 suppresses the
// complete Psalm 42, but NOT the original Introibo or Confiteor; at the
// Offertory it suppresses the Lavabo doxology, but NOT the Lavabo itself.
// Assert both fixed LOW/SUNG donors and both rendered reader languages.
const requiemOmissions=requiemFootPsalmAndLavaboOmittedCuesForResolvedMass({
  overlays:["REQUIEM"],
});
assert.equal(requiemOmissions.length,12);
assert.deepEqual(requiemFootPsalmAndLavaboOmittedCuesForResolvedMass({overlays:[]}),[]);
const requiemFrench=load("../data/presentation/reader-french-ordinary.v1.json");
const cuesIn=card=>card.paragraphs.flatMap(p=>p.sourceCueIds??[]);
for(const corpus of [low,sung]){
 for(const language of ["en","fr"]){
  const opt={corpus,properSlots,vernacularLanguage:language,
    frenchOrdinary:requiemFrench,omittedOrdinaryCues:requiemOmissions};
  const footRequiem=buildReaderSectionCard({
    ...opt,section:sections.sectionById("AO.CARD.001"),
  });
  const offRequiem=buildReaderSectionCard({
    ...opt,section:sections.sectionById("AO.CARD.010"),
  });
  const footCueIds=cuesIn(footRequiem),offCueIds=cuesIn(offRequiem);
  for(const kept of ["AO.SM.C0002","AO.SM.C0003","AO.SM.C0014","AO.SM.C0015",
    "AO.SM.C0016","AO.SM.C0021"])
    assert.ok(footCueIds.includes(kept),corpus.form+"/"+language+" Requiem lost "+kept);
  for(let n=4;n<=13;n++){
    const omitted="AO.SM.C"+String(n).padStart(4,"0");
    assert.ok(!footCueIds.includes(omitted),corpus.form+"/"+language+" Judica remains: "+omitted);
  }
  assert.equal(footRequiem.blocks.find(b=>b.blockId==="AO.SM.B003")?.omittedByRite,
    "RITUS_XIII_1_REQUIEM");
  assert.ok(offCueIds.includes("AO.SM.C0125"),
    corpus.form+"/"+language+" Requiem lost Lavabo Psalm");
  for(const omitted of ["AO.SM.C0126","AO.SM.C0127"])
    assert.ok(!offCueIds.includes(omitted),corpus.form+"/"+language+" Requiem retained "+omitted);
  assert.ok(!offRequiem.blocks.find(b=>b.blockId==="AO.SM.B037")?.omittedByRite,
    "Lavabo itself may not disappear at a Requiem");
 }
 // Unmodified normal Mass still renders both original, preserved donor cues.
 const normalFoot=buildReaderSectionCard({
   corpus,section:sections.sectionById("AO.CARD.001"),properSlots,
 });
 assert.ok(cuesIn(normalFoot).includes("AO.SM.C0004"),"Ordinary Judica changed");
 assert.throws(()=>buildReaderSectionCard({
   corpus,section:sections.sectionById("AO.CARD.001"),properSlots,
   omittedOrdinaryCues:["AO.SM.C0004"],
 }),/REQUIEM_JUDICA_SOURCE_IDENTITY_MISMATCH/);
 assert.throws(()=>buildReaderSectionCard({
   corpus,section:sections.sectionById("AO.CARD.010"),properSlots,
   omittedOrdinaryCues:["AO.SM.C0126"],
 }),/REQUIEM_LAVABO_SOURCE_IDENTITY_MISMATCH/);
}
console.log("1962 All Souls Judica/Lavabo exclusions: PASS — LOW/SUNG EN/FR and ordinary donor untouched.");

const credo=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.009"),
  properSlots,
});
assert.ok(!credo.paragraphs.some(p=>["AO.SM.C0278","AO.SM.C0279"].includes(p.id)),
  "Credo state sentinels leaked into prayer text");

// Language is owned by the exact source: Schola/public chant versus
// private words versus the Proper, never by a generic TEXT kind.
const latinSung=buildReaderSectionCard({corpus:sung,section:sections.sectionById("AO.CARD.002"),properSlots});
const vernLow=buildReaderSectionCard({corpus:low,section:sections.sectionById("AO.CARD.002"),properSlots});
assert.match(latinSung.paragraphs[0].primary,/Kýrie/);
assert.match(latinSung.paragraphs[0].alternate,/Lord, have mercy/);
assert.match(vernLow.paragraphs[0].primary,/Lord, have mercy/);
const sanctus=buildReaderSectionCard({corpus:sung,section:sections.sectionById("AO.CARD.013"),properSlots});
assert.match(sanctus.paragraphs[0].primary,/Sanctus/i);
const agnus=buildReaderSectionCard({corpus:sung,section:sections.sectionById("AO.CARD.021"),properSlots});
assert.match(agnus.paragraphs[0].primary,/Agnus Dei/i);
const credoOpening=credo.paragraphs.find(p=>p.sourceCueIds.includes("AO.SM.C0089"));
assert.match(credoOpening.primary,/^Credo/);
assert.deepEqual(credoOpening.sourceCueIds,["AO.SM.C0089","AO.SM.C0090"],
  "Credo intonation should preserve priest-owned two-cue source identity");
assert.equal(credoOpening.primary,"Credo in unum Deum.");
assert.equal(credoOpening.speakerRole,"PRIEST");

assert.equal(credoOpening.displayLanguage,"LATIN");
const silent=buildReaderSectionCard({corpus:sung,section:sections.sectionById("AO.CARD.014"),properSlots});
const teIgitur=silent.paragraphs.find(p=>p.id==="AO.SM.C0150");
assert.match(teIgitur.primary,/Most merciful Father, we humbly pray and beseech Thee/i);
assert.match(teIgitur.alternate,/Te igitur/i);
assert.equal(teIgitur.displayLanguage,"VERNACULAR");
for(const slot of ["COLLECT_SET","EPISTLE_OR_LESSON","GOSPEL","PREFACE","POSTCOMMUNION_SET","INTROIT","GRADUAL"]){
  const card=sung.blocks.find(b=>b.Proper_Slot===slot);
  const section=sections.sections.find(section=>section.sequence===Number(card.Macro_ID.slice(-2)));
  const resolved=buildReaderSectionCard({corpus:sung,section,properSlots});
  const p=resolved.paragraphs.find(row=>row.primary==="ENGLISH "+slot);
  assert.ok(p,slot+" Proper was incorrectly Latin-first despite the source priority");
  assert.equal(p.alternate,"LATIN "+slot);
}
const pater=buildReaderSectionCard({corpus:sung,section:sections.sectionById("AO.CARD.019"),properSlots});
assert.ok(pater.paragraphs.some(p=>/Pater noster/i.test(p.primary)),"sung Pater noster not Latin");
const t=(lat,en)=>({lat,en});
const currentProper=properToReaderSlots({
  sourcePath:"Sancti/10-07",
  introit:t("Introitus Rosarii","Introit of the Rosary"),
  collects:[t("Collecta Rosarii","Collect of the Rosary")],
  epistle:t("Epistola Rosarii","Epistle of the Rosary"),
  gradual:t("Graduale et Alleluia Rosarii","Gradual and Alleluia of the Rosary"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium Rosarii","Gospel of the Rosary"),
  offertory:t("Offertorium Rosarii","Offertory of the Rosary"),
  secrets:[t("Secreta Rosarii","Secret of the Rosary")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio Rosarii","Communion of the Rosary"),
  postcommunions:[t("Postcommunio Rosarii","Postcommunion of the Rosary")],
});
const chantCard=buildReaderSectionCard({
  corpus:sung,
  section:sections.sectionById("AO.CARD.006"),
  properSlots:currentProper.slots,
});
assert.ok(chantCard.paragraphs.some(p=>p.primary==="Gradual and Alleluia of the Rosary"));
assert.ok(!chantCard.paragraphs.some(p=>p.primary==="Day of wrath"),"nonexistent Sequence was fabricated");

for(const corpus of [low,sung]){
  for(const cueId of ["AO.SM.C0023","AO.SM.C0237"]){
    const hit=corpus.blocks.flatMap(b=>b.units??[]).find(u=>u.cue_id===cueId);
    assert.ok(hit,corpus.form+" missing "+cueId);
    assert.match(hit.latin,/oráre pro me/,"P1-011 Confiteor accent not normalized at "+cueId);
    assert.doesNotMatch(hit.latin,/\borare pro me\b/,"unaccented orare remains at "+cueId);
  }
}

console.log("reader text corpus: PASS — verified donors, Proper fail-closed, all 30 Low/Sung cards nonblank.");

// Public priest invitations are LIVE participation cues, not generic private
// text. Audit the entire 30-macro Ordinary in both source families and both
// languages; ensure no cue loses its paragraph or becomes tap-to-replace.
const frenchForInvitations=load("../data/presentation/reader-french-ordinary.v1.json");
const requiredOremus=[
  "AO.SM.C0036","AO.SM.C0072","AO.SM.C0108","AO.SM.C0208","AO.SM.C0253"
];
for(const corpus of [low,sung]){
  for(const language of ["en","fr"]){
    const all=sections.sections.flatMap(section=>
      buildReaderSectionCard({
        corpus,section,properSlots,vernacularLanguage:language,
        frenchOrdinary:frenchForInvitations,
      }).paragraphs);
    for(const id of [...requiredOremus,...LIVE_LATIN_FIRST_INVITATION_CUES]){
      const matches=all.filter(p=>p.sourceCueIds?.includes(id));
      assert.equal(matches.length,1,corpus.form+"/"+language+" missing or repeated live invitation "+id);
      const paragraph=matches[0];
      assert.ok(paragraph.primary&&paragraph.secondary,
        corpus.form+"/"+language+" public cue must expose both text faces "+id);
      assert.equal(paragraph.alternate,null,id+" must not hide translation behind tap");
      assert.equal(paragraph.replaceOnToggle,false,id+" must keep vernacular visibly underneath");
      if(requiredOremus.includes(id)){
        assert.match(paragraph.primary,/Orémus\./u,
          corpus.form+"/"+language+" Oremus is not Latin-first "+id);
        assert.match(paragraph.secondary,language==="fr"?/Prions/u:/Let us pray/u,
          corpus.form+"/"+language+" Oremus lacks vernacular undertext "+id);
      }
    }
    // Private Canon text remains vernacular-first, while sung Gloria keeps
    // its existing Latin replace-in-place style; this policy is NOT global.
    const privateCanon=all.find(p=>p.sourceCueIds?.includes("AO.SM.C0150"));
    assert.ok(privateCanon&&privateCanon.primary&&privateCanon.alternate,
      "Private Canon must retain its former language policy");
  }
}
