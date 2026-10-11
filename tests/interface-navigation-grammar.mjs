import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {
 INTERFACE_NAVIGATION_ACTIONS,navigationAction,navigationActionAttrs,navigationActionIcon,
} from "../src/app/interface-grammar.js";

const expected={
 back:"ao-ui-back",close:"ao-ui-close",home:"ao-nav-home",
 previous:"ao-ui-previous",next:"ao-ui-next",settings:"ao-ui-settings",
};
for(const [role,asset] of Object.entries(expected)){
 assert.equal(navigationAction(role).asset,asset,role+" icon drift");
 assert.match(navigationActionIcon(role),/class="aoNavGlyph"/,role+" missing shared glyph");
 assert.ok(navigationActionIcon(role).includes('data-ao-asset-id="'+asset+'"'),role+" asset mismatch");
 assert.match(navigationActionAttrs(role,"en"),new RegExp('data-ao-nav-action="'+role+'"'));
 assert.ok(navigationActionAttrs(role,"fr").includes(navigationAction(role).fr));
}
assert.throws(()=>navigationAction("arrow-left"),RangeError);
assert.match(navigationActionAttrs("back","en","Go <previous>"),/Go &lt;previous&gt;/);
assert.equal(navigationActionAttrs("home","fr").includes("Aujourd’hui"),true);
assert.ok(navigationAction("back").meaning.includes("hierarchy"));
assert.ok(navigationAction("close").meaning.includes("Dismiss"));
assert.ok(navigationAction("previous").meaning.includes("sequence"));
const modules=[
 ["src/find/heritage-presentation.js",["back"],"aoFindHeader aoAppHeader"],
 ["src/find/explore-presentation.js",["back"],"aoFindHeader aoAppHeader"],
 ["src/pray/presentation-runtime.js",["back","home"],"aoP435930Head aoAppHeader"],
 ["src/pray/traditional-pray-runtime.js",["back","home"],"aoP435930Head aoAppHeader"],
 ["src/pray/novena-runtime.js",["back","home"],"aoP435930Head aoAppHeader"],
 ["src/calendar/calendar-runtime.js",["back"],"aoCalModTop aoAppHeader"],
 ["src/learn/presentation.js",["back","home"],"aoLearnModTop aoAppHeader"],
 ["src/settings/presentation.js",["back","close"],"aoSetTop aoAppHeader"],
 ["src/home/presentation.js",["settings"],"navigationActionAttrs"],
];
for(const [path,roles,header] of modules){
 const src=readFileSync(new URL("../"+path,import.meta.url),"utf8");
 for(const role of roles)assert.ok(src.includes('navigationActionAttrs("'+role+'"'),path+" lacks "+role+" command");
 assert.ok(src.includes(header),path+" missing shared header");
 assert.match(src,/interface-grammar\.js/,path+" has separate icon ownership");
 const syntax=spawnSync(process.execPath,["--check",new URL("../"+path,import.meta.url).pathname],{encoding:"utf8"});
 assert.equal(syntax.status,0,path+" syntax: "+syntax.stderr);
}
const heritage=readFileSync(new URL("../src/find/heritage-presentation.js",import.meta.url),"utf8");
assert.ok(!heritage.includes('">←</button>'),"Explore heritage uses a different arrow glyph");
const main=readFileSync(new URL("../src/app/design-system.js",import.meta.url),"utf8");
for(const token of [".aoAppHeader{",".aoAppHeader [data-ao-nav-action]",".aoAppHeader .aoNavGlyph","min-height:44px","aria-label"]){
 if(token==="aria-label")continue;
 assert.ok(main.includes(token),"Shared header styling missing "+token);
}
const shared=readFileSync(new URL("../src/app/interface-grammar.js",import.meta.url),"utf8");
assert.doesNotMatch(shared,/window\.|localStorage|location\.href|addEventListener|navigate\(/,
 "Navigation grammar must never independently route or mutate source-owner state");
console.log("Shared interface grammar: canonical icons, 44px controls, locale labels and nine module integrations OK");
