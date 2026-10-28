import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1 as n, monthlyInfantKingStatus as monthly} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {NOVENA_CORPUS_V4_IDS as canonicalIds} from "../src/pray/novena-corpus-v4.js";

assert.equal(canonicalIds.length,16,"Do not mutate the sixteen established novenas");
assert.ok(!canonicalIds.includes(n.id),"ICKSP variant must not overwrite a canonical novena");
assert.equal(n.id,"divine_infant_king");
assert.equal(n.instituteSourceId,"icksp_us_novena_divine_infant_king");
assert.equal(n.form,"REPEAT_FORM");
assert.equal(n.pattern,"SOURCE_REPEAT_ONLY");
assert.equal(n.days.length,9,"Nine daily prayer occasions, not nine invented source prayers");
assert.ok(n.days.every((d,i)=>d.theme.en.includes("Day "+(i+1))&&d.guide.fr));
assert.ok(Object.isFrozen(n.days)&&Object.isFrozen(n.repeatText));
assert.match(n.repeatText.en,/O CHILD Jesus, I have recourse to Thee/);
assert.match(n.repeatText.en,/Grant that I may possess Thee eternally/);
assert.match(n.repeatText.fr,/O Enfant Jésus, j'ai recours à Vous/);
assert.match(n.repeatText.fr,/Saints Anges de la Cour céleste/);
assert.match(n.frenchTextStatus,/TRADITIONAL_FRENCH_WITNESS/);
assert.equal(n.commonPrayers.length,0,"Source prescribes repeated prayer only; no fabricated common prayer additions");
assert.match(n.source.url,/wikisource\.org/);
assert.ok(n.historySources.some(x=>x.url.includes("institute-christ-king.org")));
assert.ok(n.historySources.some(x=>x.url.includes("prieresetdevotions.blogspot.com")));
assert.equal(n.calendar.startDay,17);
assert.equal(n.calendar.endDay,25);
for(const [date,kind,day,start] of [
 ["2026-10-16","upcoming",1,"2026-10-17"],
 ["2026-10-17","active",1,"2026-10-17"],
 ["2026-10-21","active",5,"2026-10-17"],
 ["2026-10-25","active",9,"2026-10-17"],
 ["2026-10-26","upcoming",1,"2026-11-17"],
 ["2026-12-31","upcoming",1,"2027-01-17"]
]){
 const status=monthly(date);
 assert.equal(status.kind,kind,date);
 assert.equal(status.day,day,date);
 assert.equal(status.window.start,start,date);
 assert.equal(status.window.end,start.slice(0,8)+"25",date);
 assert.equal(status.isLiturgicalFeast,false);
}
const runtime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/const ALL_NOVENAS=Object\.freeze\(\{\.\.\.CORPUS,\.\.\.ADDITIONAL_NOVENAS\}\)/);
assert.match(runtime,/data-n1-supplement="divine_infant_king"/);
assert.match(runtime,/function novenaChapters\(n\)/);
assert.match(runtime,/SOURCE_REPEAT_ONLY/);
assert.match(runtime,/supplemental:ADDITIONAL_NOVENAS/);
assert.match(runtime,/Object\.keys\(CORPUS\)\.length===16/);
console.log("ICKSP Divine Infant King: bilingual original, 9 daily recitations, monthly 17–25, original 16 preserved PASS");
