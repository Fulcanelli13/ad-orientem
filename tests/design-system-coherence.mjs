import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const readCalendarPresentation=async()=>{
  const entry=await read("src/calendar/browser-entry.js");
  // First-use loading intentionally separates startup API from the full
  // typography/layout owner. Inspect the imported runtime when it exists.
  if(!entry.includes('import("./calendar-runtime.js")'))return entry;
  assert.match(entry,/ensureCalendarRuntime/);
  return read("src/calendar/calendar-runtime.js");
};

const [
  design,
  app,
  calendar,
  learn,
  settings,
  pray,
  novena,
  traditionalPray,
  mass,
]=await Promise.all([
  read("src/app/design-system.js"),
  read("src/app/browser-entry.js"),
  readCalendarPresentation(),
  read("src/learn/presentation.js"),
  read("src/settings/presentation.js"),
  read("src/pray/presentation-styles.js"),
  read("src/pray/novena-styles.js"),
  read("src/pray/traditional-pray-styles.js"),
  read("src/mass/reader-dom.js"),
]);

assert.match(design,/APP_DESIGN_SYSTEM_VERSION="ao-design-system-v2"/);
for(const token of [
  "--ao-font-display","--ao-font-body","--ao-font-liturgical","--ao-font-ui",
  "--ao-content-max","--ao-content-wide","--ao-page-gutter","--ao-page-gutter-phone",
  "--ao-control-h","--ao-card-radius","--ao-control-radius","--ao-pill-radius",
  "--ao-type-ui-xs","--ao-type-ui-sm","--ao-z-surface","--ao-z-sheet","--ao-z-modal","--ao-z-global-nav",
]){
  assert.ok(design.includes(token),token+" missing from the canonical design system");
}
assert.match(design,/\.homeScreen[\s\S]*#ao-calendar-modular-root[\s\S]*#ao-learn-modular-root[\s\S]*#ao-settings-modular-root[\s\S]*#ao-find-modular-root/);
assert.match(design,/#aoPray435930 h1/);
assert.doesNotMatch(design,/\.ao-reader-shell \.ao-prayer-card/,"Mass reader geometry must remain reader-specific");
assert.match(design,/#ao-global-ribbon/);
assert.match(design,/\.aoSourceDisclosure/,"shared source disclosure component is missing");
assert.match(app,/import \{ installAppDesignSystem \} from "\.\/design-system\.js";/);
assert.match(app,/installAppDesignSystem\(globalThis\);/);

assert.match(calendar,/font-family:var\(--ao-font-body/);
assert.match(calendar,/width:min\(var\(--ao-content-max,760px\),100%\)/);
assert.match(calendar,/dataset\.aoCalendarView=calendarView/);
assert.match(calendar,/var\(--ao-page-gutter,14px\)/);
assert.match(calendar,/var\(--ao-card-radius,15px\)/);

assert.match(learn,/font-family:var\(--ao-font-body/);
assert.match(learn,/var\(--ao-font-display/);
assert.match(learn,/width:min\(var\(--ao-content-max,760px\),100%\)/);
assert.match(learn,/var\(--ao-page-gutter,14px\)/);
assert.match(learn,/var\(--ao-card-radius,15px\)/);

assert.match(settings,/font-family:var\(--ao-font-body/);
assert.match(settings,/font:500 19px\/1\.18 var\(--ao-font-display/);
assert.match(settings,/width:min\(var\(--ao-content-max,760px\),100%\)/);
assert.match(settings,/var\(--ao-page-gutter,14px\)/);
assert.match(settings,/border-radius:var\(--ao-pill-radius,999px\)/);

assert.match(pray,/width:min\(820px,100%\)!important/,"PRAY must preserve its locked donor shell width");
assert.match(pray,/max-width:var\(--ao-content-max,760px\)!important/);
assert.match(pray,/var\(--ao-font-display/);
assert.match(pray,/var\(--ao-font-liturgical/);
assert.match(pray,/var\(--ao-page-gutter-phone,12px\)/);
assert.match(novena,/var\(--ao-font-display/);
assert.match(novena,/var\(--ao-font-liturgical/);
assert.match(traditionalPray,/var\(--ao-font-display/);
assert.match(traditionalPray,/var\(--ao-font-liturgical/);

assert.match(mass,/font-family:var\(--ao-font-ui/);
assert.match(mass,/var\(--ao-font-liturgical/);
assert.match(mass,/var\(--ao-font-display/);
assert.match(mass,/\.ao-prayer-card\{[\s\S]*border:0;border-radius:0/,"Mass reader must preserve its edge-to-edge reading geometry");

console.log("Shared application typography, spacing, controls and card geometry: OK");
