import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1 as n,annualInstituteImmaculateStatus as status} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_CORPUS_V4 as canonical,NOVENA_CORPUS_V4_IDS as canonicalIds} from "../src/pray/novena-corpus-v4.js";
assert.equal(canonicalIds.length,16,"Never alter the original sixteen novenas");
assert.ok(canonicalIds.includes("immaculate_conception"),"Existing preparatory Marian novena missing");
assert.ok(!canonicalIds.includes(n.id),"Institute option cannot overwrite Moran's novena");
assert.equal(n.id,"icksp_immaculate_conception");
assert.equal(n.instituteSourceId,"icksp_us_novena_immaculate_conception");
assert.equal(n.pattern,"SOURCE_REPEAT_ONLY");
assert.equal(n.form,"REPEAT_FORM");
assert.equal(n.days.length,9);
assert.ok(n.days.every((d,i)=>d.theme.en.includes("Day "+(i+1))&&d.theme.fr.includes("Jour "+(i+1))));
assert.equal(n.commonPrayers.length,0,"Local optional Loreto litany must not be universalized");
assert.equal(n.calendar.precision,"ICKSP_INCLUSIVE_FEAST_DAY_30_NOV_8_DEC");
assert.equal(n.calendar.startDay,30);assert.equal(n.calendar.endDay,8);
assert.match(n.repeatText.en,/Most holy Virgin, who wast pleasing to the Lord/);
assert.match(n.repeatText.en,/Church and Christian society/);
assert.match(n.repeatText.fr,/en ce solennel jubilé de la promulgation du dogme/,"1903 French historical clause was dropped or silently adapted");
assert.match(n.repeatText.fr,/l'hymne de la délivrance, de la victoire et de la paix/);
assert.equal(n.frenchTextStatus,"TRADITIONAL_FRENCH_WITNESS_1903_PERIOD_SPECIFIC");
assert.match(n.source.edition,/1903/);assert.match(n.source.edition,/1925/);
assert.ok(n.historySources.some(x=>x.url.includes("institute-christ-king.org")||x.url.includes("icksp.org.uk")));
assert.ok(n.historySources.some(x=>x.url.includes("digi-archives.org")));
assert.ok(n.historySources.some(x=>x.url.includes("wikisource.org")));
assert.equal(n.latinText,undefined,"Do not invent a Latin version or mistranslate sources");
const statuses=[
 ["2026-10-28","upcoming",1,"2026-11-30","2026-12-08"],
 ["2026-11-29","upcoming",1,"2026-11-30","2026-12-08"],
 ["2026-11-30","active",1,"2026-11-30","2026-12-08"],
 ["2026-12-01","active",2,"2026-11-30","2026-12-08"],
 ["2026-12-07","active",8,"2026-11-30","2026-12-08"],
 ["2026-12-08","active",9,"2026-11-30","2026-12-08"],
 ["2026-12-09","upcoming",1,"2027-11-30","2027-12-08"],
 ["2027-01-01","upcoming",1,"2027-11-30","2027-12-08"],
 ["2028-02-29","upcoming",1,"2028-11-30","2028-12-08"]
];
for(const [date,kind,day,start,end] of statuses){
 const s=status(date);
 assert.equal(s.kind,kind,date);assert.equal(s.day,day,date);
 assert.equal(s.window.start,start,date);assert.equal(s.window.end,end,date);
 assert.equal(s.window.feast,end,date);
 assert.equal(s.feastOnLastDay,true,date);
}
const runtime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/data-n1-supplement="divine_infant_king"/,"Existing ICKSP Infant King vanished");
assert.match(runtime,/data-n1-supplement="icksp_immaculate_conception"/,"Institute Immaculate option not visible");
assert.match(runtime,/const ALL_NOVENAS=Object.freeze\(\{\.\.\.CORPUS,\.\.\.ADDITIONAL_NOVENAS\}\)/);
assert.match(runtime,/ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1\.id\]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1/);
assert.match(runtime,/annualInstituteImmaculateStatus\(selectedDate\(\)\)/);
assert.match(runtime,/const items=Object.values\(CORPUS\)/,"Core 16-card grid was changed");
assert.match(runtime,/Object\.keys\(CORPUS\)\.length===16/);
assert.equal(Object.keys(canonical).length,16);
console.log("PASS ICKSP annual Immaculate Pius X: 16 original, one distinct repeat, 9 days, 1903/1925 source ownership, inclusive 30 Nov–8 Dec");
