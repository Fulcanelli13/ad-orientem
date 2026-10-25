import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";
import { createNativeScholaController } from "../src/mass/reader-schola.js";

const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const t=(lat,en)=>({lat,en});
const proper={
  introit:t("Introitus","Introit"),collect:t("Collecta","Collect"),epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia"),sequence:t("Sequentia","Sequence"),
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secret:t("Secreta","Secret"),preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),postcommunion:t("Postcommunio","Postcommunion"),
};
const properSlots=properToReaderSlots(proper);
const prepared={session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}};
const schola=createNativeScholaController({sungCorpus:sung,properSlots,prepared});
assert.equal(schola.supported,true);
const frenchOrdinary=JSON.parse(readFileSync(new URL("../data/presentation/reader-french-ordinary.v1.json",import.meta.url),"utf8"));
const frenchSchola=createNativeScholaController({
  sungCorpus:sung,properSlots,
  prepared:{session:prepared.session,readerPreferences:{language:"fr"}},
  frenchOrdinary,
});
// Requiem Agnus text must agree between the main reader and the Schola's
// separate public-chant track. Independent Schola navigation is unchanged.
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const language of ["en","fr"]){
    const req=createNativeScholaController({
      sungCorpus:sung,properSlots,frenchOrdinary,
      prepared:{session:{resolvedMass:{form,overlays:["REQUIEM"]}},
        readerPreferences:{language}}
    });
    const ordinary=createNativeScholaController({
      sungCorpus:sung,properSlots,frenchOrdinary,
      prepared:{session:{resolvedMass:{form,overlays:[]}},
        readerPreferences:{language}}
    });
    const seg=req.tracks.find(x=>x.id==="AGNUS_DEI").segments;
    const plain=ordinary.tracks.find(x=>x.id==="AGNUS_DEI").segments;
    assert.equal(seg.length,3,"Requiem Schola Agnus must retain three chant cues");
    for(let i=0;i<3;i++){
      assert.equal(seg[i].cueId,"AO.SM.C022"+(i+2),form+" Schola identity changed");
      assert.match(seg[i].latin,i===2?/dona eis réquiem sempitérnam/:/dona eis réquiem/);
      assert.match(seg[i].english,language==="fr"?/donnez-leur le repos/:/grant them/);
      assert.doesNotMatch(seg[i].latin,/miserére nobis|dona nobis pacem/);
      assert.doesNotMatch(plain[i].latin,/dona eis réquiem/,"Requiem text leaked into ordinary Schola");
    }
    const first=req.selectTrack("AGNUS_DEI");
    assert.equal(first.schola.cueId,"AO.SM.C0222");
    assert.equal(req.next().schola.cueId,"AO.SM.C0223");
  }
}

const frenchGloria=frenchSchola.selectTrack("GLORIA");
assert.equal(frenchGloria.schola.cueId,"AO.SM.C0055","Schola must start Et in terra pax after celebrant intonation");
assert.match(frenchGloria.schola.latin,/Et in terra pax/);
assert.ok(frenchGloria.schola.english);
assert.notEqual(frenchGloria.schola.english,frenchGloria.schola.latin);
assert.equal(frenchGloria.schola.english,frenchOrdinary.byCue[frenchGloria.schola.cueId]);

for(const id of ["INTROIT","KYRIE","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE","CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION"]){
  assert.ok(schola.trackIds.includes(id),"missing native Schola track "+id);
}

let s=schola.activateForCard(2);
assert.equal(s.trackId,"KYRIE");
assert.equal(s.schola.cueId,"AO.SM.C0044");
assert.equal(s.schola.owner,"R17_NATIVE_SCHOLA");
s=schola.next();
assert.equal(s.schola.cueId,"AO.SM.C0045");

s=schola.syncCue("AO.SM.C0056");
assert.equal(s.trackId,"GLORIA");
assert.equal(s.schola.cueId,"AO.SM.C0056");
assert.match(s.schola.latin,/Adorámus/);

// Gloria and Credo advance on their own clocks, independently of the
// main reader's scroll/card repaint, with no duplicate-cue rewind.
s=schola.syncCue("AO.SM.C0056");
const gloriaCue=s.schola.cueId;
s=schola.next();
const gloriaAfterManual=s.schola.segmentId;
assert.notEqual(gloriaAfterManual,gloriaCue);
s=schola.syncCue("AO.SM.C0056");
assert.equal(s.schola.segmentId,gloriaAfterManual,"duplicate Gloria cue rewound independent Schola progress");
s=schola.syncCue("AO.SM.C0055");
assert.equal(s.schola.segmentId,gloriaAfterManual,
 "Earlier Gloria source paragraph must not rewind the Schola");
s=schola.syncCue("AO.SM.C0059");
assert.equal(s.schola.segmentId,gloriaAfterManual,
 "Later Gloria source paragraph must not advance the Schola");
s=schola.syncCue("AO.SM.C0001");
assert.equal(s.schola.segmentId,gloriaAfterManual,"unrelated priest cue advanced the Schola");
s=schola.activateForCard(3);
assert.equal(s.schola.segmentId,gloriaAfterManual,"same-card Gloria redraw reset Schola");
s=schola.activateForCard(9);
assert.equal(s.trackId,"CREDO");
const credoStart=s.schola.segmentId;
s=schola.next();
assert.notEqual(s.schola.segmentId,credoStart,"Credo track has no independent progression");
s=schola.activateForCard(9);
assert.notEqual(s.schola.segmentId,credoStart,"Credo redraw reset its independent clock");

s=schola.activateForCard(6);
assert.equal(s.trackId,"GRADUAL");
assert.equal(s.schola.latin,"Graduale et Alleluia");
const gradualTrack=schola.tracks.find(x=>x.id==="GRADUAL");
const alleluiaTrack=schola.tracks.find(x=>x.id==="ALLELUIA_TRACT_SEQUENCE");
assert.deepEqual(gradualTrack.canonicalBlockIds,["AO.SM.B021"]);
assert.deepEqual(alleluiaTrack.canonicalBlockIds,["AO.SM.B022"]);
s=schola.selectTrack("ALLELUIA_TRACT_SEQUENCE");
assert.equal(s.schola.latin,"Sequentia");

// B022 source paragraph selection does not imply observed musical progress.
const splitPreGospelSlots={...properSlots,slots:{
 ...properSlots.slots,
 ALLELUIA_TRACT_SEQUENCE:{status:"READY",data:{paragraphs:[
  {id:"AO.PG.ALLELUIA",latin:"Alleluia"},
  {id:"AO.PG.SEQUENCE",latin:"Sequentia"},
 ]}},
}};
const splitChant=createNativeScholaController({
 sungCorpus:sung,properSlots:splitPreGospelSlots,prepared,
});
splitChant.selectTrack("ALLELUIA_TRACT_SEQUENCE");
splitChant.next();
assert.equal(splitChant.project().index,1);
const b022Card=ids=>({
 sourceSectionId:"AO.CARD.006",sectionId:"AO.READER.B022",
 blocks:[{blockId:"AO.SM.B022"}],
 paragraphs:ids.map(id=>({id,sourceCueIds:[]})),
});
assert.equal(splitChant.activateForCard(b022Card(["AO.PG.ALLELUIA"])).index,1);
splitChant.previous();
assert.equal(splitChant.activateForCard(b022Card(["AO.PG.SEQUENCE"])).index,0);

// The existing full Schola track traversal is explicitly Gregorian:
 // never assume this setting from an unknown local choir.
schola.setSanctusPerformance("GREGORIAN");
s=schola.activateForCard(13);
assert.equal(s.trackId,"SANCTUS_BENEDICTUS");
assert.equal(s.schola.cueId,"AO.SM.C0145");
const before=s.index;
s=schola.activateForCard(14);
assert.equal(s.trackId,"SANCTUS_BENEDICTUS");
assert.equal(s.index,before,"Canon card change fabricated Schola progress");

while(!schola.project().complete) schola.next();
const ended=schola.project();
assert.equal(ended.complete,true);
const last=ended.schola.segmentId;
assert.equal(schola.next().schola.segmentId,last,"completed Schola track looped to the beginning");

// An unspecified or polyphonic setting must NEVER imply the choir has
// begun Benedictus merely because a timer completed or priest cue advanced.
for(const performance of ["UNSPECIFIED","POLYPHONIC"]){
  const c=createNativeScholaController({sungCorpus:sung,properSlots,
    prepared:{...prepared,readerPreferences:{sanctusPerformance:performance}}});
  c.selectTrack("SANCTUS_BENEDICTUS");
  c.next();c.next();
  assert.equal(c.project().schola.cueId,"AO.SM.C0147");
  assert.equal(c.project().benedictusHold,true);
  assert.equal(c.next().schola.cueId,"AO.SM.C0147",
    "automatic ticker crossed observed sung Benedictus barrier");
  assert.equal(c.syncCue("AO.SM.C0148").schola.cueId,"AO.SM.C0147",
    "priest's Benedictus cue was misused as a Schola observation");
  assert.equal(c.project().benedictusHold,true);
  const released=c.releaseBenedictus();
  assert.equal(released.schola.cueId,"AO.SM.C0148");
  assert.equal(released.benedictusHold,false);
  assert.equal(c.next().schola.cueId,"AO.SM.C0149");
  const reset=c.setSanctusPerformance("GREGORIAN");
  assert.equal(reset.sanctusPerformance,"GREGORIAN");
}
assert.equal(schola.releaseBenedictus().schola.cueId,last,
  "Gregorian performance must not create an unnecessary second release");
s=schola.activateForCard(4);
assert.equal(s.schola,null);
assert.equal(s.ownership,"R17_EXACT_SCHOLA_NONE");

console.log("native Schola: PASS — independent tracks, exact Ordinary cues, Proper tracks, no looping, no card-driven fake progress.");
