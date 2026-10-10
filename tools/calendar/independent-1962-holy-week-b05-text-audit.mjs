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
const [register,b04,palm,thursday,friday,vigil,prophecies,gfReader,evReader,htReader]=await Promise.all([
 json("data/mass/independent-1962-holy-week-b05-text-audit.v1.json"),
 json("data/mass/independent-1962-holy-week-b04.v1.json"),
 json("data/presentation/reader-palm.v1.json"),
 json("data/presentation/reader-holy-thursday-post.v1.json"),
 json("data/presentation/reader-good-friday.v1.json"),
 json("data/presentation/reader-easter-vigil.v1.json"),
 json("data/presentation/reader-easter-vigil-prophecies.v1.json"),
 read("src/mass/reader-good-friday.js"),
 read("src/mass/reader-easter-vigil.js"),
 read("src/mass/reader-holy-thursday-post.js")
]);
const strict=process.argv.includes("--strict");
const checks=[];
function check(id,ok,detail){checks.push({id,passed:!!ok,detail:detail||null});}
const items=register.auditItems;
const itemById=new Map(items.map(x=>[x.id,x]));
check("audit-schema",register.schema==="AO_MR1962_HOLY_WEEK_B05_TEXT_COMPLETENESS_REGISTER_V1");
check("no-duplicate-audit-ids",itemById.size===items.length);
check("B04-rite-ownership-preserved",b04.rites.length===4&&items.every(x=>b04.rites.some(r=>r.id===x.rite)));
check("explicitly-NOT-certified",register.certification==="NOT_CERTIFIED"&&register.controls.imageVerifiedHolyWeekTypicaPages===0&&register.controls.lineByLinePrintedCollationsCertified===0);
check("all-open-items-classified",items.length===17&&items.every(x=>x.status!=="CERTIFIED"&&x.source&&x.evidence));
check("Palm-source-blessing-present-not-Passion",palm.texts.blessingPrayer.length>150&&palm.texts.gospel.length>800&&!Object.keys(palm.texts).some(k=>/passion/i.test(k)));
check("Holy-Thursday-translation-hymn-text",thursday.pangeLingua.length===4&&thursday.tantumErgo.length===2&&thursday.stripping.psalm21Pian.join(" ").length>2000);
check("Holy-Thursday-Mandatum-not-rendered-as-complete",!JSON.stringify(thursday).includes("Mandátum novum")&&!htReader.includes("Mandatum novum")&&itemById.get("THURSDAY_MANDATUM")?.status==="MISSING_READER_TEXT");
check("Good-Friday-nine-intentions-and-prayers",friday.solemnPrayers.length===9&&friday.solemnPrayers.every(x=>x.variants?.PRINTED_1962||x.intention?.length>50&&x.prayer?.length>130));
check("Good-Friday-Passion-body-present",friday.passion.preDeath.length===24&&friday.passion.postDeath.length===4&&friday.passion.preDeath.join(" ").length>6500);
check("Good-Friday-Passion-renderer-has-no-speaker-roles",gfReader.includes('rows("GF-PASS-A",payload.passion.preDeath')&&gfReader.includes('rows("GF-PASS-B",payload.passion.postDeath')&&itemById.get("FRIDAY_PASSION_SPEAKERS")?.status==="ROLE_ANNOTATIONS_MISSING");
check("Good-Friday-Confiteor-is-rubric-only",gfReader.includes("Et continuo diaconus facit confessionem.")&&!gfReader.includes("Confiteor Deo omnipotenti")&&itemById.get("FRIDAY_CONFITEOR")?.status==="MISSING_READER_TEXT");
check("Jewish-prayer-variants-owned-and-not-conflated",friday.solemnPrayers.find(x=>x.key==="CONVERSION_OF_JEWS")?.variants?.PRINTED_1962&&friday.solemnPrayers.find(x=>x.key==="CONVERSION_OF_JEWS")?.variants?.HOLY_SEE_2008&&register.sourceWitnesses.find(x=>x.id==="FRIDAY_EDITORIAL")?.caution?.includes("2008"));
check("Easter-Vigil-four-complete-length-lessons",prophecies.readings.length===4&&prophecies.readings.every(x=>x.latinParagraphs.join(" ").length>=600&&x.collectLatin?.length>60));
check("Easter-Vigil-Exsultet-long-form",vigil.donor.exsultet.lat.length>=3500);
check("Easter-Vigil-complete-two-part-Litany-secondary-witness",vigil.bridge.litanyI.lat.split("\\n").length===92&&vigil.bridge.litanyII.lat.split("\\n").length===60&&evReader.includes('ritualResponseRows("EV-LIT1",payload.bridge.litanyI')&&evReader.includes('ritualResponseRows("EV-LIT2",payload.bridge.litanyII')&&itemById.get("VIGIL_LITANIES")?.status==="RESTORED_FROM_SECONDARY_1962__PRINTED_VISUAL_UNCOLLATED");
check("Easter-Vigil-font-is-a-summary",vigil.bridge.font.lat.length<200&&vigil.donor.fontOverview.lat.length<600&&itemById.get("VIGIL_FONT")?.status==="ABBREVIATED_CONFIRMED");
check("Easter-Vigil-full-promise-dialogue-and-Pater-secondary-witness",vigil.bridge.renunciations.lat.split("\\n").length===6&&vigil.bridge.professions.lat.split("\\n").length===6&&vigil.bridge.pater.lat.includes("Et ne nos indúcas in tentatiónem")&&!vigil.bridge.pater.lat.includes("…")&&itemById.get("VIGIL_BAPTISMAL_VOWS")?.status==="RESTORED_FROM_SECONDARY_1962__PRINTED_VISUAL_UNCOLLATED");
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
 criticalTextGate:"OPEN — source image, speaker ownership and complete texts required"}
};
assert.equal(register.certification,"NOT_CERTIFIED");
await mkdir(resolve(root,"artifacts"),{recursive:true});
await writeFile(resolve(root,"artifacts/independent-1962-holy-week-b05-text-holds.json"),JSON.stringify(report,null,2)+"\n");
console.log("B05_HOLY_WEEK_TEXT_DEBT "+JSON.stringify(report.summary));
if(strict&&failed.length)process.exitCode=2;
