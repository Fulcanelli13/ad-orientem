import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 resolveMassLiturgicalTheme,MASS_LITURGICAL_PALETTES
} from "../src/mass/reader-liturgical-theme.js";

const theme=colour=>resolveMassLiturgicalTheme({
 legacyResolvedMass:{proper:{liturgicalColour:colour}}
});
for(const id of ["WHITE","RED","GREEN","VIOLET","BLACK"]){
 const result=theme(id.toLowerCase());
 assert.equal(result.key,id);
 assert.equal(result.source,"SELECTED_PROPER");
 assert.equal(result.tokens.accent,MASS_LITURGICAL_PALETTES[id].accent);
}
assert.equal(theme("unresolved").key,"NEUTRAL");
const css=readFileSync(new URL("../src/mass/mass-entry-harmony-styles.js",import.meta.url),"utf8");
assert.match(css,/--ao-content-max/);
assert.match(css,/--ao-entry-accent/);
assert.match(css,/--ao-font-display/);
assert.match(css,/--ao-type-ui-sm/);
assert.match(css,/--ao-page-gutter/);
assert.ok(css.includes(".aoMassJourneyKind"));
assert.ok(css.includes(".aoMassJourneyIdentity"));
assert.ok(css.includes(".aoMassJourneyOrder"));
assert.ok(css.includes(".aoMassJourneyBegin"));
assert.ok(css.includes(".aoFullMassReaderModes"));
assert.ok(css.includes(".aoMassJourneyEssential"));
assert.ok(css.includes(".aoMassJourneyReaderChoice"));
assert.ok(css.includes(".aoMassJourneyFormIdentity"));
assert.ok(css.includes(".aoMassJourneyOrder:not([open])"));
assert.ok(css.includes("position:sticky"));
assert.doesNotMatch(css,/timeline|stepper|progress-bar/i,
 "A devotional entry must not be rendered as a generic progress tracker.");
assert.doesNotMatch(css,/#cfb185|#c9ad78|#d4b98b/i,
 "Mass preflight must consume the selected Proper colour, not a universal gold.");
const entry=readFileSync(new URL("../src/mass/full-mass-preflight.js",import.meta.url),"utf8");
assert.ok(entry.includes("resolveMassLiturgicalTheme({legacyResolvedMass:legacy})"));
assert.ok(entry.includes('root.style.setProperty("--ao-entry-accent",accent)'));
assert.ok(entry.includes("root.dataset.massEntryColour=entryTheme.key"));
assert.ok(entry.includes("summary.actualTitle||summary.kindLabel"));
const bridge=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.ok(bridge.includes('import "./mass-entry-harmony-styles.js"'));
assert.ok(bridge.indexOf('import "./mass-entry-harmony-styles.js"')>
 bridge.indexOf('import "./full-mass-preflight-styles.js"'));
console.log("PASS Mass entry harmonization uses canonical AO design tokens and actual-Proper palette without affecting Mass engine");
