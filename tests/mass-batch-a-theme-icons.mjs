import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  MASS_LITURGICAL_PALETTES,
  normalizeMassLiturgicalColour,
  resolveMassLiturgicalTheme,
  massThemeCssVariables,
} from "../src/mass/reader-liturgical-theme.js";
import { buildReaderShellMarkup } from "../src/mass/reader-dom.js";
import { validateReaderGestureMatrix } from "../src/mass/reader-gesture-matrix.js";
import { R17_FROZEN_ACTIVE_ICON_KEYS } from "../src/mass/reader-icons.js";

assert.equal(normalizeMassLiturgicalColour("Rouge"),"RED");
assert.equal(normalizeMassLiturgicalColour("purple"),"VIOLET");
assert.equal(normalizeMassLiturgicalColour("Or"),"GOLD");
assert.equal(normalizeMassLiturgicalColour("invented"),null);
assert.equal(Object.keys(MASS_LITURGICAL_PALETTES).length,8);

const sample=(proper,legacy={})=>({
  readerPreferences:{mode:"LIVE"},
  session:{resolvedMass:{
    presentationMode:"LIVE",
    actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Our Lady of the Rosary"},
    calendarCelebration:{id:"sunday",type:"CALENDAR"},
    proper:proper==null?null:{status:"READY",data:proper},
    provenance:{colour:"green"},
  }},
  legacyResolvedMass:{calendarDay:{color:"green"},...legacy},
});
const white=resolveMassLiturgicalTheme(sample({color:"white"},{colour:"red"}));
assert.equal(white.key,"WHITE","selected votive Proper must outrank calendar and preflight");
assert.equal(white.source,"SELECTED_PROPER");
const black=resolveMassLiturgicalTheme(sample({colour:"black"}));
assert.equal(black.key,"BLACK");
const red=resolveMassLiturgicalTheme(sample({},{colourPlan:{name:"Rouge"},colour:"green"}));
assert.equal(red.key,"RED","resolved celebration must outrank stale fallback");
const violet=resolveMassLiturgicalTheme(sample({color:"violet"}));
assert.equal(violet.key,"VIOLET");
const rose=resolveMassLiturgicalTheme(sample({color:"rose"}));
assert.equal(rose.key,"ROSE");
const green=resolveMassLiturgicalTheme(sample({color:"green"}));
assert.equal(green.key,"GREEN");
const neutral=resolveMassLiturgicalTheme({session:{resolvedMass:{actualCelebration:{id:"votive"}}}});
assert.equal(neutral.key,"NEUTRAL","unknown colour must not silently become green");
assert.equal(neutral.resolved,false);
const css=massThemeCssVariables(white);
assert.match(css,/--ao-mass-bg:#191815/);
assert.match(css,/--ao-mass-accent:/);
const markup=buildReaderShellMarkup(sample({color:"white"}));
assert.match(markup,/data-liturgical-colour="WHITE"/);
assert.match(markup,/data-liturgical-source="SELECTED_PROPER"/);
assert.match(markup,/--ao-mass-bg:#191815/);
assert.match(markup,/background:linear-gradient\(180deg,var\(--ao-mass-top\),var\(--ao-mass-bottom\)\)/);
assert.doesNotMatch(markup,/--ao-bg:#0d120f/);

const matrix=JSON.parse(await readFile(fileURLToPath(new URL("../data/mass/gesture-matrix.v1.json",import.meta.url)),"utf8"));
const audit=validateReaderGestureMatrix(matrix);
assert.equal(audit.itemCount,142);
assert.equal(audit.iconBoundCount,125);
assert.equal(audit.iconPendingCount,17);
assert.equal(audit.iconBoundCount+audit.iconPendingCount,audit.itemCount);
const icons=new Set(R17_FROZEN_ACTIVE_ICON_KEYS);
for(const item of audit.items){
  if(item.iconKey)assert.ok(icons.has(item.iconKey),"unknown icon "+item.id);
  else assert.equal(item.iconStatus,"PENDING_EXACT_MASTER",item.id+" cannot be silently substituted");
}
const elevation=audit.items.find(x=>x.actor==="PRIEST"&&x.gesture==="ELEVATE_HOST");
assert.equal(elevation?.iconKey,"priest_elevate_host_rich");
const slight=audit.items.find(x=>x.id==="GM.P.C0116.01");
assert.equal(slight?.iconKey,"head_bow","slight bow must not masquerade as profound bow");
const conditional=audit.items.find(x=>x.id==="GM.F.C0096.01");
assert.equal(conditional?.iconKey,null,"calendar/profile-dependent faithful genuflection must not prescribe a universal gesture icon");
const chalice=audit.items.find(x=>x.actor==="PRIEST"&&x.gesture==="ELEVATE_CHALICE");
assert.equal(chalice?.iconKey,"priest_elevate_chalice_rich");
console.log("Mass Batch A: PASS — celebration palettes, neutral fallback, 125 matched semantic bindings, 17 quarantined");
