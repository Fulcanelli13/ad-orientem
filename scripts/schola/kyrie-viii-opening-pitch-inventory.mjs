// Opening Kyrie VIII De Angelis: exact 1961 GABC notehead inventory.
// Distinguishes an accidental like "gx" (flat sign) from a sounded g note.
// This is source-notation parsing, NOT validation against printed noteheads.
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {KYRIE_VIII_REVIEW_SOURCE,prepareKyrieVIIIReview}
 from "../../src/mass/reader-kyrie-viii-review-queue.js";
import {offlineKyrialeResearchScore}
 from "../../src/mass/reader-kyriale-research-gabc.js";
import {buildKyrieVIIIThreeWitnessNeumeLedger}
 from "./kyrie-viii-three-witness-neume-ledger.mjs";

const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const originalCorpus=new URL("../../data/presentation/reader-text-sung.v1.json",import.meta.url);
const GROUPS=Object.freeze([
 Object.freeze({unitId:"K8-L01-U02",lyric:"KY",expectedGabc:"(d)"}),
 Object.freeze({unitId:"K8-L01-U03",lyric:"ri",expectedGabc:"(gxfgh)"}),
 Object.freeze({unitId:"K8-L01-U04",lyric:"e",expectedGabc:"(h.ivHGh.)"}),
 Object.freeze({unitId:"K8-L01-U06",lyric:"e (post-intonation melisma)",expectedGabc:"(/[-2]kvIH'Ghih.)"}),
 Object.freeze({unitId:"K8-L01-U08",lyric:"e",expectedGabc:"(gxhvFE'Dgf)"}),
 Object.freeze({unitId:"K8-L01-U09",lyric:"lé",expectedGabc:"(e')"}),
 Object.freeze({unitId:"K8-L01-U10",lyric:"i",expectedGabc:"(e)"}),
 Object.freeze({unitId:"K8-L01-U11",lyric:"son.",expectedGabc:"(d.)"})
]);
export const KYRIE_VIII_OPENING_PITCH_SCHEMA="ao-kyrie-viii-1961-first-phrase-pitch-inventory-v1";

function decomposeNotationUnit(token){
 const source=token.slice(1,-1).replace(/\[[^\]]*\]/g,"");
 const notes=[],accidentals=[];
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(!/[a-mA-M]/.test(ch))continue;
  const next=source[i+1]??"";
  if(/[xy#]/.test(next)){
    accidentals.push(Object.freeze({
      symbol:ch+next,staffPosition:ch.toLowerCase(),
      type:next==="x"?"FLAT":next==="y"?"NATURAL":"SHARP"
    }));
    i++;continue;
  }
  let j=i+1;
  let punctumMora=0,verticalEpisema=false,horizontalEpisema=false,virga=false;
  // Only local suffix markers are interpreted. Slashes, spacing directives,
  // liquescent shapes and glyph joins stay in the source GABC field.
  while(j<source.length&&/[.'vV_]/.test(source[j])){
    if(source[j]===".")punctumMora++;
    if(source[j]==="'")verticalEpisema=true;
    if(source[j]==="_")horizontalEpisema=true;
    if(source[j]==="v"||source[j]==="V")virga=true;
    j++;
  }
  notes.push(Object.freeze({
    gabcPitch:ch,staffPosition:ch.toLowerCase(),
    notehead:ch===ch.toUpperCase()?"PUNCTUM_INCLINATUM":"SQUARE_OR_COMPOUND_GREGORIAN_NOTE",
    punctumMora,verticalEpisema,horizontalEpisema,virga
  }));
  i=j-1;
 }
 return Object.freeze({notes:Object.freeze(notes),accidentals:Object.freeze(accidentals)});
}
const hold=reason=>Object.freeze({
 schema:KYRIE_VIII_OPENING_PITCH_SCHEMA,status:"HOLD_SOURCE_DRIFT",
 reason,groups:Object.freeze([]),pitchNoteheads:0,printVerifiedNoteheads:0,
 musicalApproved:false,publishedScores:0
});
export function buildKyrieVIIIOpeningPitchInventory({source,corpus}={}){
 const item=source??offlineKyrialeResearchScore("KYRIE","MASS_08");
 if(!item?.gabc||sha(item.gabc)!==KYRIE_VIII_REVIEW_SOURCE.sourceGabcSha256)
  return hold("PINNED_1961_GABC_HASH_MISMATCH");
 const c=corpus??JSON.parse(readFileSync(originalCorpus,"utf8"));
 const check=prepareKyrieVIIIReview({corpus:c,source:item});
 const ledger=buildKyrieVIIIThreeWitnessNeumeLedger({corpus:c,source:item});
 if(check.status!=="READY_FOR_NOTE_BY_NOTE_PRINT_REVIEW_NOT_PUBLISHABLE"||
    ledger.status!=="45_SOURCE_MARKS_3_WITNESSES_PENDING_INDEPENDENT_MUSICAL_REVIEW")
  return hold("CANONICAL_NINE_CUES_OR_THREE_WITNESS_LEDGER_MISMATCH");
 const phrase=ledger.phrases[0];
 const groups=GROUPS.map(row=>{
  const unit=phrase.units.find(x=>x.id===row.unitId);
  if(unit?.rawGabc!==row.expectedGabc)return null;
  const data=decomposeNotationUnit(unit.rawGabc);
  return Object.freeze({
    unitId:unit.id,sourceGabc:unit.rawGabc,lyricFragment:row.lyric,
    noteheads:data.notes.length,notes:data.notes,
    accidentalSigns:data.accidentals.length,accidentals:data.accidentals,
    sourceTokenChecked:true,
    notesComparedWith1961Print:0,
    staffHeightVerified:false,neumeShapeVerified:false,
    rhythmicSignsVerified:false,
    status:"SOURCE_PITCHES_PARSED_PRINT_COMPARISON_PENDING",
    originalPrintUrl:"https://gregobase.selapa.net/sources/2/905.png",
    secondWitnessUrl:"https://gregobase.selapa.net/sources/3/148.png"
  });
 });
 if(groups.some(x=>!x))return hold("OPENING_KYRIE_MUSIC_GROUP_DRIFT");
 const notes=groups.flatMap(g=>g.notes);
 const flats=groups.flatMap(g=>g.accidentals).filter(x=>x.type==="FLAT");
 if(notes.length!==25||flats.length!==2||
    groups.reduce((n,g)=>n+g.noteheads,0)!==25)return hold("SOURCE_PITCH_OR_FLAT_COUNT_DRIFT");
 const upper=notes.filter(n=>n.notehead==="PUNCTUM_INCLINATUM").length;
 const rhythmic=Object.freeze({
  dottedNoteheads:notes.filter(x=>x.punctumMora>0).length,
  verticalEpisemaNoteheads:notes.filter(x=>x.verticalEpisema).length,
  virgaNoteheads:notes.filter(x=>x.virga).length,
  inclinataNoteheads:upper
 });
 return Object.freeze({
  schema:KYRIE_VIII_OPENING_PITCH_SCHEMA,
  status:"25_SOURCE_PITCHES_EXTRACTED_PRINT_COMPARISON_PENDING",
  sourceId:"GREGOBASE-1184",sourceGabcSha256:sha(item.gabc),
  canonicalCues:Object.freeze(["AO.SM.C0044","AO.SM.C0045","AO.SM.C0046"]),
  threeInvocationsSameMelody:true,
  sourceLine:1,sourcePage:"28*",staffClef:"c3",
  sungLyricSyllables:7,notatedGroups:groups.length,
  noteheadCounts:Object.freeze(groups.map(g=>g.noteheads)),
  pitchNoteheads:notes.length,
  encodedAccidentalGlyphs:flats.length,
  pitchSequence:Object.freeze(notes.map(n=>n.gabcPitch)),
  relativeStaffSequence:Object.freeze(notes.map(n=>n.staffPosition)),
  rhythmic,
  printedWitnesses:ledger.witnesses,
  printedSignMarkerObservationsAlreadyLogged:6,
  printVerifiedNoteheads:0,printVerifiedNeumeGroups:0,
  printVerifiedAccidentalGlyphs:0,printVerifiedRhythmicSigns:0,
  musicalApproved:false,publishedScores:0,
  groups:Object.freeze(groups)
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
 process.stdout.write(JSON.stringify(buildKyrieVIIIOpeningPitchInventory(),null,2)+"\n");
