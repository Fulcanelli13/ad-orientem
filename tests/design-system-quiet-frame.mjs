import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { installAppDesignSystem } from "../src/app/design-system.js";

const elements=new Map();
const document={
  head:{append(el){elements.set(el.id,el);}},
  documentElement:{dataset:{}},
  createElement(){return {id:"",textContent:""};},
  getElementById(id){return elements.get(id)??null;},
};
const first=installAppDesignSystem({document});
assert.equal(first.installed,true);
assert.equal(first.styleId,"ao-app-design-system");
const style=elements.get(first.styleId);
assert.ok(style);
const css=style.textContent;
for(const [name,value] of Object.entries({
  "--ao-frame-bg":"#0B0F13",
  "--ao-frame-card":"#141A20",
  "--ao-frame-raised":"#1C232B",
  "--ao-frame-text":"#ECE8DF",
  "--ao-frame-muted":"#A3ABB4",
})){
  assert.ok(css.includes(name+":"+value),name+" has drifted from approved prototype palette");
}
for(const selector of [
 ".aoQuietHeader",".aoQuietCard",".aoQuietRow",".aoQuietPrimary",".aoQuietSecondary",
 ".homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayV2Tabs",
 ".homeScreen.aoTodayV2 .aoTodayV2ArtOverlay",
 "#aoPray435930 .aoP435930RootOrganised .aoP435930ModuleCard",
]){
  assert.ok(css.includes(selector),selector+" missing from shared owner");
}
assert.ok(css.includes(".homeScreen.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2ArtSource"));
const original=css;
const second=installAppDesignSystem({document});
assert.equal(second.styleId,first.styleId);
assert.equal(elements.size,1,"design system must not append duplicate stylesheet");
assert.equal(style.textContent,original);
for(const selector of [
 "#ao-learn-modular-root .aoLearnModTop",
 "#ao-settings-modular-root .aoSetTop",
 "#ao-find-modular-root .aoExploreSurface>.aoFindHeader",
 "#ao-learn-modular-root .aoLearnFamilyCard",
 "#ao-settings-modular-root .aoSetRowText b",
 "#ao-settings-modular-root .aoSetRowText small",
 "#ao-find-modular-root .aoExploreSurface .aoFindSearch input",
]){
 assert.ok(css.includes(selector),"Missing visual-convergence selector "+selector);
}
assert.match(css,/prefers-reduced-motion:reduce/);
// Existing application routes and liturgical source owners must stay authoritative.
const home=await readFile(new URL("../src/home/presentation.js",import.meta.url),"utf8");
const app=await readFile(new URL("../src/app/browser-entry.js",import.meta.url),"utf8");
assert.match(home,/data-home-mass-entry/);
assert.match(home,/data-home-calendar-view/);
assert.match(home,/data-ao-home-art-slot/);
assert.match(app,/installAppDesignSystem\(globalThis\)/);
// The new Pray entrance must use *existing* route handlers and preserve
// the original catalogue behind a disclosure, not duplicate data owners.
const prayRuntime=await readFile(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const prayStyles=await readFile(new URL("../src/pray/presentation-styles.js",import.meta.url),"utf8");
const prayHome=prayRuntime.slice(prayRuntime.indexOf("function renderPrayHome(){"),prayRuntime.indexOf("\nfunction renderPrayFamily(){"));
assert.ok(prayHome.length>1000);
for(const route of ["pray.rosary","pray.confession","pray.adoration","pray.stations","pray.novenas","pray.morning_evening","pray.communion_treasury","pray.divine_mercy","pray.library"]){
 assert.ok(prayHome.includes(route),"Prayer route lost from home: "+route);
}
for(const family of ["eucharistic","penance","passion","devotions","chaplets"]){
 assert.ok(prayHome.includes("door('"+family+"')"),"Family missing from disclosure: "+family);
}
assert.match(prayHome,/aoP435930QuietTiles/);
assert.match(prayHome,/aoP435930QuietMore/);
assert.match(prayHome,/myCustomsDoor\(\)\.replace/);
assert.match(prayStyles,/QUIET_PRAY_HOME_CSS=String\.raw`/);
assert.match(prayStyles,/ao-pray-quiet-home-style/);
assert.match(prayStyles,/aoP435930QuietLibraryRow/);

console.log("AO quiet-frame visual baseline / Today / Pray contracts: OK");
