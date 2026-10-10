import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseScriptureContext} from "../src/scripture/context.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
assert.equal(data.schema,"AO_EXPLORE_BIBLE_PLACES_COMPACT_V1");
assert.equal(data.entries.length,18);
assert.equal(new Set(data.entries.map(x=>x.id)).size,18);
assert.deepEqual(Object.fromEntries(data.groups.map(g=>[g,data.entries.filter(x=>x.group===g).length])),{
 OT:5,DEUTERO:3,CHRIST:6,APOSTLES:4
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
assert.equal((opened.match(/data-bible-place=/g)||[]).length,18);
assert.match(opened,/The Angel Gabriel announces?|Gabriel announces/);
assert.match(opened,/data-ao-scripture-context="Luke 1:26–38"/);
assert.match(opened,/data-ao-scripture-context="Luke 4:16–21"/);
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
console.log("PASS Explore Bible Places compact: 18 curated entries, Catholic passage links, bilingual disclosure, unchanged lens ownership");
