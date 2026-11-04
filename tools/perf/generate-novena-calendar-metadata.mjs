// Regenerate the source-exact Calendar metadata projection from canonical Prayer V4.
// Usage: node tools/perf/generate-novena-calendar-metadata.mjs --check|--write
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {NOVENA_CORPUS_V4,NOVENA_START_KIND} from "../../src/pray/novena-corpus-v4.js";

const output=fileURLToPath(new URL("../../src/calendar/novena-calendar-metadata.js",import.meta.url));
const metadata=Object.fromEntries(Object.entries(NOVENA_CORPUS_V4).map(([id,n])=>[id,{
 id:n.id,title:n.title,family:n.family,feast:n.feast,calendar:n.calendar,
 startKind:n.startKind,traditionalStart:n.traditionalStart,
 sourceStatus:n.source?.status??"SOURCE_LOCKED",
 frenchTextStatus:n.frenchTextStatus??"MISSING_FRENCH_BODY"
}]));
assert.equal(Object.keys(metadata).length,16,"Unexpected canonical novena count");
const header=[
 "/* Generated projection of the canonical Novena Corpus V4, source src/pray/novena-corpus-v4.js.",
 " * Calendar/Coming Up require dates, names and source-status metadata, not the",
 " * 16 full devotional texts and French body modules. Do not use this for prayer",
 " * rendering. Regenerate with tools/perf/generate-novena-calendar-metadata.mjs",
 " * and enforce exact parity in tests/calendar-novena-metadata-parity.mjs.",
 " */",
].join("\n");
const freeze=[
 "const freeze=v=>{",
 " if(v===null||typeof v!==\"object\"||Object.isFrozen(v))return v;",
 " for(const child of Object.values(v))freeze(child);",
 " return Object.freeze(v);",
 "};",
].join("\n");
const generated=header+"\n"+freeze+"\n"+
 "export const NOVENA_START_KIND=Object.freeze("+JSON.stringify(NOVENA_START_KIND)+");\n"+
 "export const NOVENA_CALENDAR_METADATA=freeze("+JSON.stringify(metadata,null,2)+");\n";
const write=process.argv.includes("--write");
if(write){
 writeFileSync(output,generated);
 console.log("WROTE novena metadata ("+Object.keys(metadata).length+" records, "+Buffer.byteLength(generated)+" bytes)");
}else{
 assert.equal(readFileSync(output,"utf8"),generated,
  "Calendar novena metadata is stale; run node tools/perf/generate-novena-calendar-metadata.mjs --write");
 console.log("PASS reproducible novena metadata ("+Object.keys(metadata).length+" records)");
}
