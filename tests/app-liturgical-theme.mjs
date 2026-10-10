import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  APP_LITURGICAL_THEME_VERSION,
  resolveAppLiturgicalTheme,
  appThemeCssValues,
  installAppLiturgicalTheme,
} from "../src/app/liturgical-theme.js";
import { MASS_LITURGICAL_PALETTES, resolveMassLiturgicalTheme } from "../src/mass/reader-liturgical-theme.js";

const date="2026-10-11";
const day=(colour,on=date)=>({
  selectedDate:date,
  resolution:{date:on,status:"resolved",day:{main:{id:"test:ordinary"}},colourPlan:{massColor:colour}},
});
const white=resolveAppLiturgicalTheme(day("white"));
assert.equal(white.key,"WHITE");
assert.equal(white.resolved,true);
assert.equal(appThemeCssValues(white)["--liturgical"],"#eff0ed","liturgical white must not be gold");
assert.equal(appThemeCssValues(white)["--bg"],MASS_LITURGICAL_PALETTES.WHITE.bg);
assert.equal(resolveAppLiturgicalTheme(day("black")).key,"BLACK");
assert.equal(appThemeCssValues(resolveAppLiturgicalTheme(day("black")))["--liturgical"],"#50545c");
assert.equal(resolveAppLiturgicalTheme(day("green")).key,"GREEN");
assert.equal(resolveAppLiturgicalTheme(day("red")).key,"RED");
assert.equal(resolveAppLiturgicalTheme(day("purple")).key,"VIOLET");
assert.equal(resolveAppLiturgicalTheme(day("invented")).key,"NEUTRAL");
assert.equal(resolveAppLiturgicalTheme(day("green","2026-10-10")).key,"NEUTRAL","stale date cannot colour app");
assert.equal(resolveAppLiturgicalTheme({selectedDate:date,resolution:{date,status:"failed",day:{main:{}}}}).key,"NEUTRAL");
assert.equal(resolveAppLiturgicalTheme({selectedDate:date,resolving:true}).key,"NEUTRAL");
const goodFriday={selectedDate:date,resolution:{
  date,status:"resolved",day:{main:{id:"tempora:Quad6-5r:test"}},
  colourPlan:{primary:"black",massColor:"violet"},
}};
assert.equal(resolveAppLiturgicalTheme(goodFriday).key,"BLACK","Good Friday opening action must not assume a Mass");

// The global calendar theme must NEVER supersede an expressly chosen Mass Proper.
const mass=resolveMassLiturgicalTheme({session:{resolvedMass:{
  proper:{data:{color:"red"}},calendarCelebration:{colour:"green"},
}}});
assert.equal(mass.key,"RED");
assert.equal(mass.source,"SELECTED_PROPER");

// Test a real subscription and cleanup without a browser dependency.
let next=day("white"),onChange=null,unsubscribeCount=0;
const props=new Map();
const win={
  document:{documentElement:{
    style:{setProperty:(key,value)=>props.set(key,value)},
    dataset:{},
  }},
  AO_RUNTIME_V8:{store:{
    getState:()=>next,
    subscribe:fn=>{onChange=fn;return ()=>{onChange=null;unsubscribeCount++};},
  }},
};
const bridge=installAppLiturgicalTheme({win});
assert.equal(bridge.version,APP_LITURGICAL_THEME_VERSION);
assert.equal(win.document.documentElement.dataset.aoLiturgicalTheme,"WHITE");
assert.equal(props.get("--liturgical"),"#eff0ed");
assert.equal(props.get("--bg"),MASS_LITURGICAL_PALETTES.WHITE.bg);
assert.equal(installAppLiturgicalTheme({win}),bridge,"bridge must be idempotent");
next=day("green");onChange(next);
assert.equal(bridge.status().key,"GREEN");
assert.equal(props.get("--liturgical"),MASS_LITURGICAL_PALETTES.GREEN.accent);
next=day("green","2026-10-10");onChange(next);
assert.equal(props.get("--liturgical"),MASS_LITURGICAL_PALETTES.NEUTRAL.accent);
bridge.dispose();
assert.equal(unsubscribeCount,1);
assert.equal(win.AO_APP_LITURGICAL_THEME_V1,undefined);

const entry=await readFile(new URL("../src/app/browser-entry.js",import.meta.url),"utf8");
assert.match(entry,/import \{ installAppLiturgicalTheme \} from "\.\/liturgical-theme\.js"/);
assert.match(entry,/installAppLiturgicalTheme\(\{ win \}\)/);
console.log("Global liturgical dark theme: verified calendar/day colour, selected Mass precedence, white/black distinction and subscription cleanup OK");
