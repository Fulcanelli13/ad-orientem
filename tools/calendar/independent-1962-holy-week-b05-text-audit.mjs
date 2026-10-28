// B05: explicitly identify content completeness holds in the live 1962 Holy Week readers.
// Passing this guard is NOT passing the full-text collation. It ensures that known
// omissions and abridgements cannot be quietly described as source-certified.
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=path=>readFile(resolve(root,path),"utf8");
const json=async path=>JSON.parse(await read(path));
const [register,b04,palm,thursday,friday,vigil,prophecies,gfReader,evReader,htReader,ordinary,passionB13]=await Promise.all([
 json("data/mass/independent-1962-holy-week-b05-text-audit.v1.json"),
 json("data/mass/independent-1962-holy-week-b04.v1.json"),
 json("data/presentation/reader-palm.v1.json"),
 json("data/presentation/reader-holy-thursday-post.v1.json"),
 json("data/presentation/reader-good-friday.v1.json"),
 json("data/presentation/reader-easter-vigil.v1.json"),
 json("data/presentation/reader-easter-vigil-prophecies.v1.json"),
 read("src/mass/reader-good-friday.js"),
 read("src/mass/reader-easter-vigil.js"),
 read("src/mass/reader-holy-thursday-post.js"),
 json("data/presentation/reader-text-sung.v1.json"),
 json("data/mass/independent-1962-good-friday-b13-passion-voice-turns.v1.json")
]);
const strict=process.argv.includes("--strict");
const checks=[];
function check(id,ok,detail){checks.push({id,passed:!!ok,detail:detail||null});}
const items=register.auditItems;
const itemById=new Map(items.map(x=>[x.id,x]));
check("audit-schema",register.schema==="AO_MR1962_HOLY_WEEK_B05_TEXT_COMPLETENESS_REGISTER_V1");
check("no-duplicate-audit-ids",itemById.size===items.length);
check("B04-rite-ownership-preserved",b04.rites.length===4&&items.every(x=>b04.rites.some(r=>r.id===x.rite)));
check("explicitly-NOT-certified",register.certification==="NOT_CERTIFIED"&&register.controls.imageVerifiedHolyWeekTypicaPages===21&&register.controls.lineByLinePrintedCollationsCertified===0);
check("all-open-items-classified",items.length===17&&items.every(x=>x.status!=="CERTIFIED"&&x.source&&x.evidence));
check("Palm-source-blessing-present-not-Passion",palm.texts.blessingPrayer.length>150&&palm.texts.gospel.length>800&&!Object.keys(palm.texts).some(k=>/passion/i.test(k)));
check("Holy-Thursday-translation-hymn-text",thursday.pangeLingua.length===4&&thursday.tantumErgo.length===2&&thursday.stripping.psalm21Pian.join(" ").length>2000);
check("Holy-Thursday-Mandatum-owned-within-Mass-and-still-textually-partial",!JSON.stringify(thursday).includes("Mandátum novum")&&!htReader.includes("Mandatum novum")&&itemById.get("THURSDAY_MANDATUM")?.status==="B08_IN_MASS_OPTIONAL_SELECTED_CHANTS__FULL_COLLATION_OPEN");
check("Holy-Thursday-Canon-proper-restored-not-original-printed-certified",itemById.get("THURSDAY_CANON")?.status==="B08_SOURCE_MAPPED_READER_VARIANTS__PRINTED_FACSIMILE_UNCOLLATED");
check("Good-Friday-nine-intentions-and-prayers",friday.solemnPrayers.length===9&&friday.solemnPrayers.every(x=>x.variants?.PRINTED_1962||x.intention?.length>50&&x.prayer?.length>130));
check("Good-Friday-Passion-body-present",friday.passion.preDeath.length===24&&friday.passion.postDeath.length===4&&friday.passion.preDeath.join(" ").length>6500);
check("Good-Friday-Passion-B13-role-annotations-present-but-full-text-not-certified",
  gfReader.includes('passionRoleRows("GF-PASS-A",payload.passion.preDeath')&&
  gfReader.includes('passionRoleRows("GF-PASS-B",payload.passion.postDeath')&&
  friday.passion?.voiceTurns?.schema==="AO_MR1962_GOOD_FRIDAY_PASSION_B13_VOICES_V1"&&
  passionB13.schema===friday.passion.voiceTurns.schema&&
  friday.passion.voiceTurns.preDeath.length===24&&
  friday.passion.voiceTurns.postDeath.length===4&&
  JSON.stringify(friday.passion.voiceTurns.preDeath)===
    JSON.stringify(passionB13.preDeath.map(x=>x.turns))&&
  JSON.stringify(friday.passion.voiceTurns.postDeath)===
    JSON.stringify(passionB13.postDeath.map(x=>x.turns))&&
  passionB13.preDeath.flatMap(x=>x.turns).length===49&&
  passionB13.scope.originalLatinTextAltered===false&&
  register.certification==="NOT_CERTIFIED"&&
  register.controls.lineByLinePrintedCollationsCertified===0&&
  itemById.get("FRIDAY_PASSION_SPEAKERS")?.status===
    "B13_49_SOURCE_MARKED_LATIN_VOICE_TURNS__MINISTERS_AND_FULL_PRINTED_COLLATION_OPEN");
const ministers=ordinary.blocks.find(x=>x.Block_ID==="AO.SM.B007")?.units??[];
const gfConf=friday.communion.deaconConfiteor;
check("Good-Friday-full-deacon-Confiteor-from-1962-Ordinary",
  gfReader.includes("Et continuo diaconus facit confessionem.")&&
  gfReader.includes('"GF-COM-CONF-"+(i+1)')&&
  ministers.length===3&&gfConf?.parts?.length===3&&
  gfConf.sourcePath==="data/presentation/reader-text-sung.v1.json#AO.SM.B007"&&
  gfConf.parts.every((x,i)=>x.cueId===ministers[i]?.cue_id&&
    x.latin===ministers[i].latin&&x.english===ministers[i].english)&&
  gfConf.parts[0].latin.includes("et tibi, pater")&&
  gfConf.parts[2].latin.includes("et te, pater")&&
  itemById.get("FRIDAY_CONFITEOR")?.status===
    "B10_CANONICAL_MINISTERS_FULL_TEXT_RESTORED__PRINTED_CROSS_REFERENCE_NOT_FULLY_COLLATED"
);
check("Jewish-prayer-variants-owned-and-not-conflated",friday.solemnPrayers.find(x=>x.key==="CONVERSION_OF_JEWS")?.variants?.PRINTED_1962&&friday.solemnPrayers.find(x=>x.key==="CONVERSION_OF_JEWS")?.variants?.HOLY_SEE_2008&&register.sourceWitnesses.find(x=>x.id==="FRIDAY_EDITORIAL")?.caution?.includes("2008"));
check("Easter-Vigil-four-complete-length-lessons",prophecies.readings.length===4&&prophecies.readings.every(x=>x.latinParagraphs.join(" ").length>=600&&x.collectLatin?.length>60));
check("Easter-Vigil-Exsultet-long-form",vigil.donor.exsultet.lat.length>=3500);
check("Easter-Vigil-complete-two-part-Litany-secondary-witness",vigil.bridge.litanyI.lat.split("\n").length===92&&vigil.bridge.litanyII.lat.split("\n").length===60&&evReader.includes('ritualResponseRows("EV-LIT1",payload.bridge.litanyI')&&evReader.includes('ritualResponseRows("EV-LIT2",payload.bridge.litanyII')&&itemById.get("VIGIL_LITANIES")?.status==="RESTORED_FROM_SECONDARY_1962__PRINTED_VISUAL_UNCOLLATED");
check("Easter-Vigil-font-blessing-restored-with-uncollated-baptisms",vigil.font1962?.segments?.length===17&&vigil.font1962?.procession?.chant?.length===3&&vigil.font1962?.procession?.atFont?.length===5&&evReader.includes("fontRows(payload,{atSeparateBaptistery:true})")&&itemById.get("VIGIL_FONT")?.status==="B07_FONT_BLESSING_RESTORED__BAPTISM_RITUAL_UNCOLLATED"&&vigil.font1962?.conditionalBaptism?.status==="RITUAL_OWNER_UNRESOLVED__DO_NOT_PRESENT_AS_COMPLETE");
check("Easter-Vigil-full-promise-dialogue-and-Pater-secondary-witness",vigil.bridge.renunciations.lat.split("\n").length===6&&vigil.bridge.professions.lat.split("\n").length===6&&vigil.bridge.pater.lat.includes("Et ne nos indúcas in tentatiónem")&&!vigil.bridge.pater.lat.includes("…")&&itemById.get("VIGIL_BAPTISMAL_VOWS")?.status==="RESTORED_FROM_SECONDARY_1962__PRINTED_VISUAL_UNCOLLATED");
const counts=Object.fromEntries([...new Set(items.map(x=>x.status))].sort().map(status=>[status,items.filter(x=>x.status===status).length]));
const failed=checks.filter(x=>!x.passed);
const report={
 schema:"AO_MR1962_HOLY_WEEK_B05_TEXT_HOLDS_REPORT",
 certification:"NOT_CERTIFIED",
 meaningOfGreen:"Restored secondary-source texts and remaining debt accurately classified; original printed 1962 critical collation is still NOT certified.",
 sourceWitnessClass:register.auditClass,
 imageVerifiedHolyWeekTypicaPages:register.controls.imageVerifiedHolyWeekTypicaPages,
 auditedSurfaces:items.length,byStatus:counts,
 checks,summary:{checks:checks.length,passed:checks.length-failed.length,failed:failed.map(x=>x.id),openTextualItems:items.length,
 criticalTextGate:"OPEN — original Vatican printed full-text collation, real local minister assignment and Latin/EN/FR source verification still required"}
};
assert.equal(register.certification,"NOT_CERTIFIED");
await mkdir(resolve(root,"artifacts"),{recursive:true});
await writeFile(resolve(root,"artifacts/independent-1962-holy-week-b05-text-holds.json"),JSON.stringify(report,null,2)+"\n");
console.log("B05_HOLY_WEEK_TEXT_DEBT "+JSON.stringify(report.summary));
if(strict&&failed.length)process.exitCode=2;
