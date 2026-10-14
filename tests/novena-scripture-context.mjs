import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseScriptureContext} from "../src/scripture/context.js";
import {NOVENA_CORPUS_V4,NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {NOVENA_SCRIPTURE_CONTEXT_V1,NOVENA_SCRIPTURE_RELATIONSHIPS,
 novenaScriptureContext,novenaScriptureContextHtml} from "../src/pray/novena-scripture-context.js";

const expected=[
 ["holy_ghost","Acts 2:1–4"],
 ["christmas","Luke 2:1–20"],
 ["corpus_christi","John 6:48–58"],
 ["sacred_heart","John 19:31–37"],
 ["immaculate_conception","Luke 1:26–38"],
 ["annunciation","Luke 1:26–38"],
 ["assumption","Revelation 12:1–6"],
 ["seven_sorrows","Luke 2:34–35"],
 ["st_joseph","Matthew 1:18–25"],
 ["holy_souls","2 Maccabees 12:43–46"],
 ["perpetual_help","John 19:25–27"],
 ["st_therese","Matthew 18:1–5"],
 ["st_anthony_nine_tuesdays","Luke 15:3–7"],
 ["christ_the_king","John 18:33–37"],
 ["immaculate_heart","Luke 2:19"],
 ["st_michael","Revelation 12:7–9"]
];
assert.deepEqual(Object.keys(NOVENA_SCRIPTURE_CONTEXT_V1),NOVENA_CORPUS_V4_IDS);
assert.deepEqual(expected.map(x=>x[0]),NOVENA_CORPUS_V4_IDS);
assert.equal(expected.length,16);
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
const seen=new Set();
for(const [id,reference] of expected){
 const n=NOVENA_CORPUS_V4[id],row=novenaScriptureContext(id);
 assert.ok(n?.days?.length===9,id+" lost its canonical novena identity");
 assert.equal(row.reference,reference,id+" canonical study reference changed");
 assert.ok(NOVENA_SCRIPTURE_RELATIONSHIPS.includes(row.relation),id+" unverifiable relationship");
 assert.ok(parseScriptureContext(row.reference),id+" cannot open canonical Catholic Bible reader");
 assert.ok(row.en?.length>45&&row.fr?.length>45,id+" lacks distinct bilingual caveat");
 assert.ok(!seen.has(id));seen.add(id);
 for(const french of [false,true]){
  const html=novenaScriptureContextHtml(id,{french});
  assert.match(html,/data-n1-scripture-context=/);
  assert.match(html,/data-ao-scripture-context=/);
  assert.equal((html.match(/data-ao-scripture-context=/g)||[]).length,1,
    "One source-owned browser entry per novena, not a duplicate reader");
  assert.ok(html.includes(french?"Passage biblique à méditer":"Scripture for meditation"));
  assert.ok(html.includes(french?"n'est ni une citation":"neither a quotation"),
    "No theme passage should be called the historical source or wording of the novena");
  assert.equal(html.includes("target=\"_blank\""),false,
    "Study navigation must not silently replace the in-app Scripture reader");
 }
}
assert.equal(novenaScriptureContext("nonexistent"),null);
assert.equal(novenaScriptureContextHtml("nonexistent"),"");
assert.equal(novenaScriptureContext("assumption").relation,"TYPOLOGICAL_READING_NOT_HISTORICAL_REPORT");
assert.match(novenaScriptureContext("assumption").en,/does not narrate Mary's bodily Assumption/);
assert.match(novenaScriptureContext("immaculate_conception").en,/does not itself state the later dogmatic definition/);
assert.match(novenaScriptureContext("perpetual_help").en,/does not describe or date the icon/);
assert.match(novenaScriptureContext("st_therese").en,/not a quotation from St Thérèse/);
const runtime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/novenaScriptureContextHtml\(n.id,\{french:isFr\(\)\}\)/);
assert.match(runtime,/\$\{contextDetails\(n\)\}.*\$\{novenaScriptureContextHtml/,
 "Biblical meditation must belong to optional novena details, not the daily prayer or rubrics");
assert.match(runtime,/\$\{sourceDetails\(n\)\}/,"Historical edition/source detail remains intact");
assert.doesNotMatch(runtime,/data-n1-bible-countdown|biblicalAchievement|Bible streak/);
console.log("PASS 16/16 novena biblical contexts; all Catholic sources parse; original 9-day texts, editions and gestures remain source-owned");
