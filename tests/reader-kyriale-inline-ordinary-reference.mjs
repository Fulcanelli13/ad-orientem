import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  INLINE_ORDINARY_SOURCE_ANCHORS,sourceBoundOrdinaryReferenceScores
} from "../src/mass/reader-inline-ordinary-reference.js";
import {
  offlineKyrialeResearchScore,OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT
} from "../src/mass/reader-kyriale-research-gabc.js";
import {schola1961OriginalFacsimile,SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT} from "../src/mass/reader-schola-original-facsimile.js";
import {ADDITIONAL_1961_KYRIALE_RESEARCH_SCORES} from "../src/mass/reader-kyriale-research-batch2.js";
import {ADDITIONAL_1961_KYRIALE_RESEARCH_BATCH3} from "../src/mass/reader-kyriale-research-batch3.js";
import {offlineOrdinarySettingChoices} from "../src/mass/reader-inline-ordinary-reference.js";

// These identities come from the canonical SUNG donor, not titles, a date,
// an English translation, or an inferred parish repertoire.
const donor=JSON.parse(readFileSync(new URL(
  "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const cases=[
  ["KYRIE","MASS_16","GREGOBASE-545"],
  ["KYRIE","MASS_11","GREGOBASE-2982"],
  ["KYRIE","MASS_08","GREGOBASE-1184"],
  ["GLORIA","MASS_08","GREGOBASE-961"],
  ["CREDO","CREDO_03","GREGOBASE-749"],
  ["SANCTUS_BENEDICTUS","MASS_08","GREGOBASE-1384"],
  ["AGNUS_DEI","MASS_08","GREGOBASE-2760"],
  ["KYRIE","MASS_17","GREGOBASE-272"],
  ["KYRIE","MASS_18","GREGOBASE-2522"],
  ["GLORIA","MASS_11","GREGOBASE-303"],
  ["SANCTUS_BENEDICTUS","MASS_11","GREGOBASE-1106"],
  ["AGNUS_DEI","MASS_11","GREGOBASE-1243"],
  ["KYRIE","MASS_01","GREGOBASE-1143"],
  ["GLORIA","MASS_01","GREGOBASE-2980"],
  ["SANCTUS_BENEDICTUS","MASS_01","GREGOBASE-300"],
  ["AGNUS_DEI","MASS_01","GREGOBASE-2977"],
  ["SANCTUS_BENEDICTUS","MASS_17","GREGOBASE-871"],
  ["AGNUS_DEI","MASS_17","GREGOBASE-1137"],
  ["SANCTUS_BENEDICTUS","MASS_18","GREGOBASE-298"],
  ["AGNUS_DEI","MASS_18","GREGOBASE-2412"]
];
assert.equal(INLINE_ORDINARY_SOURCE_ANCHORS.length,5);
assert.equal(new Set(INLINE_ORDINARY_SOURCE_ANCHORS.map(x=>x.firstCueId)).size,5);
assert.equal(new Set(cases.map(c=>c[2])).size,20);
assert.equal(OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT,20);
assert.equal(SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT,20);
assert.equal(ADDITIONAL_1961_KYRIALE_RESEARCH_SCORES.length,5);
assert.equal(ADDITIONAL_1961_KYRIALE_RESEARCH_BATCH3.length,8);
for(const [movement,settingId,scoreId] of cases){
  const anchor=INLINE_ORDINARY_SOURCE_ANCHORS.find(x=>x.movement===movement);
  assert.ok(anchor,"No canonical anchor for "+movement);
  const block=donor.blocks.find(b=>b.Block_ID===anchor.blockId);
  assert.ok(block,"Canonical source block missing: "+anchor.blockId);
  const unit=block.units.find(u=>u.cue_id===anchor.firstCueId);
  assert.ok(unit?.latin,"Opening source cue missing: "+anchor.firstCueId);
  const cues=[anchor.firstCueId];
  if(movement==="GLORIA")cues.push("AO.SM.C0054");
  if(movement==="CREDO")cues.push("AO.SM.C0090");
  const paragraph={
    id:cues.join("+"),sourceBlockId:anchor.blockId,
    sourceCueIds:cues,kind:"TEXT",primary:unit.latin,secondary:unit.english
  };
  const input={paragraph,form:"MISSA_CANTATA_SIMPLE",resolvedMass:{},
    selectedSettings:{[movement]:settingId}};
  const selected=sourceBoundOrdinaryReferenceScores(input);
  assert.equal(selected.length,1,movement+" locally selected score absent");
  const score=selected[0];
  assert.equal(score.id,scoreId);
  assert.equal(score.movement,movement);
  assert.equal(score.settingId,settingId);
  assert.equal(score.gabc,offlineKyrialeResearchScore(movement,settingId).gabc,
    "Source GABC must not be rewritten");
  assert.equal(score.sourceContextCertified,false);
  assert.equal(score.publicScoreApproved,false);
  assert.equal(score.status,"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED");
  const original=schola1961OriginalFacsimile(movement,settingId);
  assert.ok(original,"Original printed-page link absent for "+scoreId);
  assert.equal(original.gabcMusicallyCertified,false);
  assert.ok(original.originalPageImages.length>0);
  assert.equal(original.originalEditionPdf.includes("#page="),true);
  assert.ok(offlineOrdinarySettingChoices(movement).some(item=>
    item.id===settingId && item.scoreId===scoreId));
  assert.ok(score.sourceUrl.startsWith("https://gregobase.selapa.net/chant.php?id="));
  assert.deepEqual(score.sourceCueIds,[anchor.firstCueId]);
  assert.equal(sourceBoundOrdinaryReferenceScores({...input,form:"SOLEMN"}).length,1);
  assert.equal(sourceBoundOrdinaryReferenceScores({...input,form:"MISSA_CANTATA_INCENSE"}).length,1);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    resolvedMass:{isRequiem:true}}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    selectedSettings:{}}),[],"No melody without an explicit local setting");
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    selectedSettings:{[movement]:"CUSTOM"}}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    paragraph:{...paragraph,kind:"RUBRIC"}}),[]);
  assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    paragraph:{...paragraph,sourceBlockId:"AO.SM.B001"}}),[]);
  const later=block.units.find(u=>u.cue_id!==anchor.firstCueId && u.latin);
  if(later)assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    paragraph:{id:later.cue_id,sourceBlockId:anchor.blockId,
      sourceCueIds:[later.cue_id],kind:"TEXT",primary:later.latin}}),[],
      "Full score must not repeat at later source cue");
}
for(const movement of ["GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]){
  const other=sourceBoundOrdinaryReferenceScores({
    paragraph:{sourceCueIds:["AO.SM.C0044"],kind:"TEXT",sourceBlockId:"AO.SM.B015"},
    form:"SOLEMN",selectedSettings:{[movement]:"MASS_08"}
  });
  assert.deepEqual(other,[],"Never cross-attach unrelated music");
}
// Literal transcription and verse-completeness guard for each new source.
// This detects score-ID misbindings and dropped score endings without claiming
// printed neume, pitch, rhythm or underlay certification.
const newSources=[
  ["GREGOBASE-272","KYRIE","MASS_17","55*","KY(c)ri(df)e(evDCdfdev.)","<i>iij.</i>"],
  ["GREGOBASE-2522","KYRIE","MASS_18","57*","KY(hhg)ri(fg)e(f')","<i>iij.</i>"],
  ["GREGOBASE-303","GLORIA","MASS_11","39*","GLó(fi)ri(hg)a(hi)","A(eg/hf)men.(ef..)"],
  ["GREGOBASE-1106","SANCTUS_BENEDICTUS","MASS_11","40*","SAn(fc/ef~)ctus","Ho(fj)sán(ij~)na"],
  ["GREGOBASE-1243","AGNUS_DEI","MASS_11","41*","A(de/fd)gnus(dc)","pa(cd)cem.(d.)"]
];
for(const [id,movement,setting,folio,begin,end] of newSources){
 const source=ADDITIONAL_1961_KYRIALE_RESEARCH_SCORES.find(x=>x.scoreId===id);
 assert.ok(source,"Missing verbatim research source "+id);
 assert.equal(source.movement,movement);
 assert.equal(source.setting,setting);
 assert.equal(source.folio,folio);
 assert.ok(source.gabc.startsWith("name:"));
 assert.ok(source.gabc.includes("Graduale Romanum, 1961, p. "+folio));
 assert.ok(source.gabc.includes("transcriber:Andrew Hinkley;"));
 assert.ok(source.gabc.includes("%%\n"));
 assert.ok(source.gabc.includes(begin),id+" opening neume modified");
 assert.ok(source.gabc.includes(end),id+" complete ending absent");
 assert.ok(source.gabc.trim().endsWith("(::)"),id+" final double bar missing");
 assert.equal(offlineKyrialeResearchScore(movement,setting)?.gabc,source.gabc);
}
const xian=[...cases.filter(x=>x[1]==="MASS_11").map(x=>x[0])].sort();
assert.deepEqual(xian,["AGNUS_DEI","GLORIA","KYRIE","SANCTUS_BENEDICTUS"],
 "Mass XI must provide all four source-bound Ordinary movements; Credo remains independently selected");
// New M33 sources are literal GregoBase GABCs, not recreated melodies.
// Full printed-page witness spans are separately registered; references do
// NOT certify individual pitches, neume joins, signs or rhythmic marks.
const batch3=[
 ["GREGOBASE-1143","KYRIE","MASS_01","4*",["4*","5*"],"(c3) KY(ef!hv)ri(f)e(fhhvGE)","son.(e.) (::)"],
 ["GREGOBASE-2980","GLORIA","MASS_01","5*",["5*","6*"],"(c3) GLó(g)ri(fe)a(e')","A(iih!iw!jvIHivHG)men.(fg..) (::)"],
 ["GREGOBASE-300","SANCTUS_BENEDICTUS","MASS_01","6*",["6*","7*"],"(c3) SAn(g)ctus","ex(ih)cél(ijii)sis.(g.) (::)"],
 ["GREGOBASE-2977","AGNUS_DEI","MASS_01","7*",["7*"],"(c3) A(g)gnus(fgFE')","pa(ivHG)cem.(g.) (::)"],
 ["GREGOBASE-871","SANCTUS_BENEDICTUS","MASS_17","56*",["56*"],"(c3) SAn(hhffe~)ctus","sis.(d.) (::)"],
 ["GREGOBASE-1137","AGNUS_DEI","MASS_17","57*",["57*"],"(c3) A(hh)gnus(f)","cem.(d.) (::)"],
 ["GREGOBASE-298","SANCTUS_BENEDICTUS","MASS_18","58*",["58*"],"(c3) SAn(g)ctus","sis.(ef..) (::)"],
 ["GREGOBASE-2412","AGNUS_DEI","MASS_18","58*",["58*"],"(c4) A(g')gnus(g)","cem.(g.) (::)"]
];
for(const [id,movement,setting,folio,pages,begin,end] of batch3){
 const source=ADDITIONAL_1961_KYRIALE_RESEARCH_BATCH3.find(x=>x.scoreId===id);
 assert.ok(source,id+" must preserve an exact standalone source transcription");
 assert.equal(source.movement,movement);
 assert.equal(source.setting,setting);
 assert.equal(source.folio,folio);
 assert.deepEqual(source.printedPages,pages);
 assert.equal(source.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+id.slice(10));
 assert.ok(source.gabc.startsWith("name:"));
 assert.ok(source.gabc.includes("Graduale Romanum, 1961, p. "+folio));
 assert.ok(source.gabc.includes("transcriber:Andrew Hinkley;"));
 assert.ok(source.gabc.includes("%%\n"));
 assert.ok(source.gabc.includes(begin),id+" beginning source neumes changed");
 assert.ok(source.gabc.includes(end),id+" complete closing source neumes changed");
 assert.equal(source.gabc.trim().endsWith("(::)"),true);
 assert.equal(offlineKyrialeResearchScore(movement,setting)?.gabc,source.gabc,
   "The published offline score must be the unaltered archival GABC");
 const printed=schola1961OriginalFacsimile(movement,setting);
 assert.ok(printed);
 assert.deepEqual(printed.printedPages,pages);
 assert.equal(printed.originalPageImages.length,pages.length);
 assert.equal(printed.gabcMusicallyCertified,false);
}
for(const [setting,movements] of [
 ["MASS_01",["AGNUS_DEI","GLORIA","KYRIE","SANCTUS_BENEDICTUS"]],
 ["MASS_17",["AGNUS_DEI","KYRIE","SANCTUS_BENEDICTUS"]],
 ["MASS_18",["AGNUS_DEI","KYRIE","SANCTUS_BENEDICTUS"]]
]){
 assert.deepEqual(cases.filter(x=>x[1]===setting).map(x=>x[0]).sort(),movements,
  "No movement missing or invented for "+setting);
 if(setting!=="MASS_01")
   assert.equal(offlineOrdinarySettingChoices("GLORIA").some(x=>x.id===setting),false,
    "Advent/Lent Kyriale must not invent a Gloria");
}
assert.equal(offlineOrdinarySettingChoices("CREDO").some(x=>x.id.startsWith("MASS_")),false,
 "Credo remains independently chosen, not automatically inherited from a numbered Mass");
console.log("PASS 20 provisional 1961 Kyriale GABCs; Masses I, XVII, XVIII source-bound, no auto-selection");
