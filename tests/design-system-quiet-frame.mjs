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
assert.match(css,/prefers-reduced-motion:reduce/);
// Existing application routes and liturgical source owners must stay authoritative.
const home=await readFile(new URL("../src/home/presentation.js",import.meta.url),"utf8");
const app=await readFile(new URL("../src/app/browser-entry.js",import.meta.url),"utf8");
assert.match(home,/data-home-mass-entry/);
assert.match(home,/data-home-calendar-view/);
assert.match(home,/data-ao-home-art-slot/);
assert.match(app,/installAppDesignSystem\(globalThis\)/);
console.log("AO quiet-frame visual baseline / Today / Pray contracts: OK");
