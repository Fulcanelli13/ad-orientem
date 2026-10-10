import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseScriptureContext} from "../src/scripture/context.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
assert.equal(data.schema,"AO_EXPLORE_BIBLE_PLACES_COMPACT_V1");
assert.equal(data.entries.length,60);
assert.equal(new Set(data.entries.map(x=>x.id)).size,60);
assert.deepEqual(Object.fromEntries(data.groups.map(g=>[g,data.entries.filter(x=>x.group===g).length])),{
 CHRIST:46,OT:7,DEUTERO:3,APOSTLES:4
});
for(const row of data.entries){
 for(const k of ["title_en","title_fr","summary_en","summary_fr","period_en","period_fr","persons_en","persons_fr"]){
  assert.ok(typeof row[k]==="string"&&row[k].length>=3,row.id+": "+k);
 }
 assert.ok(row.summary_en.length<280&&row.summary_fr.length<310,"Compact card text "+row.id);
 assert.ok(row.passages.length>=1&&row.passages.length<=2,"Passage limit "+row.id);
 assert.equal(row.geolocation,"NOT_IN_THIS_COMPACT_FEATURE");
 for(const ref of row.passages)assert.ok(parseScriptureContext(ref),row.id+": Invalid native reader reference "+ref);
}
// An event-linked Life of Christ chronology is the primary content, not a
// separate site map or a dozen chapter links with no named Gospel context.
const christ=data.entries.filter(x=>x.group==="CHRIST");
assert.equal(christ.length,46);
assert.deepEqual(Object.fromEntries(["INFANCY","PUBLIC","PASSION","RESURRECTION"]
 .map(phase=>[phase,christ.filter(x=>x.phase===phase).length])),
 {INFANCY:5,PUBLIC:31,PASSION:7,RESURRECTION:3});
const gospelEvents=christ.flatMap(x=>x.events||[]);
assert.equal(gospelEvents.length,165);
assert.equal(new Set(gospelEvents.map(x=>x.id)).size,165);
for(const event of gospelEvents){
 assert.ok(event.title_en?.length>6 && event.title_fr?.length>6,event.id+": missing bilingual episode label");
 assert.ok(parseScriptureContext(event.reference),event.id+": unparseable verse "+event.reference);
}
const important=[
 ["nazareth","Luke 1:26–38"],   // Annunciation
 ["bethlehem","Luke 2:1–20"], // Nativity
 ["egypt","Matthew 2:13–15"], // Flight
 ["jerusalem-temple","Luke 2:41–52"], // Finding
 ["jordan-baptism","Matthew 3:13–17"], // Baptism
 ["judean-wilderness","Matthew 4:1–11"], // Temptation
 ["cana","John 2:1–11"], // First public sign
 ["beatitudes","Matthew 5:1–12"], // Sermon
 ["transfiguration","Matthew 17:1–8"],
 ["bethany","John 11:1–44"], // Lazarus
 ["bethphage","Matthew 21:1–7"], // Palm Sunday
 ["cenacle","Luke 22:7–20"], // Eucharist
 ["gethsemane","Matthew 26:36–46"], // Agony
 ["jerusalem-trial","John 19:1–16"], // Passion
 ["golgotha","John 19:17–30"], // Crucifixion
 ["christ-tomb","John 20:1–18"], // Resurrection
 ["emmaus","Luke 24:13–35"], // Resurrection appearance
 ["olives","Acts 1:6–12"] // Ascension
];
for(const [id,ref] of important){
 assert.ok(christ.find(x=>x.id===id)?.events.some(e=>e.reference===ref),id+": key Gospel event missing "+ref);
}
const miracleCensus=JSON.parse(readFileSync(new URL("../data/explore/bible-places-miracles.v1.json",import.meta.url),"utf8"));
assert.equal(miracleCensus.miracles.length,37);
assert.equal(new Set(miracleCensus.miracles.map(x=>x.id)).size,37);
const references=new Set(gospelEvents.map(e=>e.miracle_id).filter(Boolean));
assert.equal(references.size,37,"Each of 37 conventional miracles needs a linked in-app episode");
assert.ok(miracleCensus.miracles.every(m=>references.has(m.id)&&parseScriptureContext(m.reference)));
for(const m of miracleCensus.miracles)assert.ok(christ.some(x=>x.id===m.place_id),"Unresolved miracle place "+m.id);
assert.ok(gospelEvents.some(x=>x.reference==="Luke 15:11–32"&&x.title_en.includes("prodigal")));
assert.ok(gospelEvents.some(x=>x.reference==="John 21:15–19"&&x.title_en.includes("Peter")));
const make=(language,selectedId=null,open=false)=>buildExploreViewModel({
 language,lens:"heritage",items:[],view:"map",
 biblePlaces:data.entries,filters:{heritageCategories:["shrines","relics","pilgrimages","apparitions","traditions"],bibleOpen:open,bibleSelectedId:selectedId}
});
const closed=renderExploreToString(make("en"));
assert.match(closed,/data-bible-toggle/);
assert.match(closed,/aria-expanded="false"/);
assert.doesNotMatch(closed,/data-bible-place=/,"Closed surface should not expose all site buttons");
const opened=renderExploreToString(make("en","nazareth",true));
assert.match(opened,/aria-expanded="true"/);
assert.equal((opened.match(/data-bible-place=/g)||[]).length,60);
assert.match(opened,/The Angel Gabriel announces?|Gabriel announces/);
assert.match(opened,/data-ao-scripture-context="Luke 1:26–38"/);
assert.match(opened,/data-ao-scripture-context="Luke 4:16–30"/);
assert.match(opened,/The Annunciation/);
assert.match(opened,/data-ao-scripture-context="Matthew 2:19–23"/);
const ascension=renderExploreToString(make("en","olives",true));
assert.match(ascension,/The Ascension of Our Lord/);
assert.match(ascension,/data-ao-scripture-context="Acts 1:6–12"/);
const paschal=renderExploreToString(make("fr","christ-tomb",true));
assert.match(paschal,/Le tombeau vide et Marie-Madeleine/);
assert.match(paschal,/data-ao-scripture-context="Matthew 28:1–10"/);
assert.match(opened,/data-bible-search/);
assert.match(opened,/data-bible-scope="MIRACLES"/);
const miracleVM=buildExploreViewModel({language:"en",lens:"heritage",items:[],view:"map",biblePlaces:data.entries,
 filters:{heritageCategories:["shrines","relics","pilgrimages","apparitions","traditions"],bibleOpen:true,bibleSelectedId:"cana",bibleScope:"MIRACLES"}});
const miraclesHTML=renderExploreToString(miracleVM);
assert.match(miraclesHTML,/Healing of a royal official/);
assert.doesNotMatch(miraclesHTML,/The choosing of the Twelve Apostles/);
const queryVM=buildExploreViewModel({language:"fr",lens:"heritage",items:[],view:"map",biblePlaces:data.entries,
 filters:{heritageCategories:["shrines","relics","pilgrimages","apparitions","traditions"],bibleOpen:true,bibleQuery:"Bethesda"}});
const searched=renderExploreToString(queryVM);
assert.equal((searched.match(/data-bible-place=/g)||[]).length,1);
assert.doesNotMatch(opened,/data-find-filter-value="bible"/,"No new global Explore map lens");
const french=renderExploreToString(make("fr","nineveh",true));
assert.match(french,/Lieux de la Bible/);
assert.match(french,/Ninive/);
assert.match(french,/data-ao-scripture-context="Tobit 1:10"/);
const existingOwner=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert.match(existingOwner,/\[data-bible-toggle\]/);
assert.match(existingOwner,/\[data-bible-place\]/);
assert.match(existingOwner,/biblePlaces:dataset\?\.biblePlaces\?\.entries/);
const service=readFileSync(new URL("../src/find/explore-data-service.js",import.meta.url),"utf8");
assert.match(service,/bible-places-compact\.v1\.json/);
assert.match(service,/fetchJson\(EXPLORE_DATA_URLS\.biblePlaces,\{fetchImpl,optional:true\}\)/);
const native=readFileSync(new URL("../src/scripture/browser-entry.js",import.meta.url),"utf8");
assert.match(native,/data-ao-scripture-context/);
console.log("PASS Explore Bible Places compact: 60 locations and 165 bilingual Life of Christ episodes, 37 miracles, Catholic passage links, bilingual disclosure, unchanged lens ownership");
