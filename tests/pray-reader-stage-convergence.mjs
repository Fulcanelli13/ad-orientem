import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const [runtime,css,installer,design,contract]=await Promise.all([
 read("src/pray/presentation-runtime.js"),
 read("src/pray/reader-convergence-styles.js"),
 read("src/pray/focus-installer.js"),
 read("src/app/design-system.js"),
 read("src/pray/devotional-ux-contract.js"),
]);
for(const path of ["src/pray/presentation-runtime.js","src/pray/reader-convergence-styles.js","src/pray/focus-installer.js"]){
 const checked=spawnSync(process.execPath,["--check",new URL("../"+path,import.meta.url).pathname],{encoding:"utf8"});
 assert.equal(checked.status,0,path+": JS syntax broken: "+checked.stderr);
}
assert.match(runtime,/function readerStageIndicator\(items,active,kind\)/);
assert.match(runtime,/aria-valuemax="\$\{count\}"/);
assert.match(runtime,/aria-valuenow="\$\{index\+1\}"/);
assert.match(runtime,/readerStageIndicator\(items,active,kind\)/);
assert.match(runtime,/readerStageIndicator\(titles,active,'stations'\)/);
assert.match(runtime,/readerStageIndicator\(BEN_STAGES\.map\(x=>L\(x\[1\],x\[2\]\)\),step,'benediction'\)/);
assert.match(runtime,/aoReaderMacroRail/);
assert.match(runtime,/data-ao-benediction-stage/);
assert.match(css,/aoReaderBlessingReveal/);
assert.match(css,/animation:none!important/);
assert.match(runtime,/function programmeRail\(kind,step,items\)/);
assert.match(runtime,/readerStageIndicator\(titles,step,kind\)/);
assert.match(runtime,/aoP435930ProgrammeRail aoReaderStageRail/);
assert.match(runtime,/aoReaderStageRail/);
assert.match(runtime,/function guidedStage\(kind,steps,index,lastLabel\)/);
assert.match(runtime,/function renderLibrary\(\)/);
assert.match(runtime,/prayerBlock\(LIB.open,\{scriptureContext:true\}\)/);
assert.match(runtime,/aoReaderDevotionalTitle/);
assert.match(runtime,/if\(ADOR\.mode==='open'\)content=/);
assert.doesNotMatch(runtime,/readerStageIndicator\(.*ADOR\.mode==='open'/);
assert.match(css,/\.aoReaderStageIndicator/);
assert.match(css,/\.aoReaderStageTrack/);
assert.match(css,/\.aoReaderStageRail>button/);
assert.match(css,/\.aoReaderMacroRail/);
assert.match(css,/\.aoP435930PrayerHead h3/);
assert.match(css,/data-ao-pray-view="adoration"/);
assert.match(css,/data-ao-pray-view="library"/);
assert.match(css,/prefers-reduced-motion/);
assert.match(runtime,/aria-current="step"/);
assert.match(installer,/import "\.\/reader-convergence-styles\.js"/);
assert.match(contract,/spiritual acts are never inferred or automatically certified/i);
assert.match(design,/--ao-reader-focus-far/);
console.log("Devotional reader batch 3: syntax, source-ownership, stage strips, prayer titles and responsive semantics OK");
