import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");

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
  read("src/calendar/browser-entry.js"),
  read("src/learn/presentation.js"),
  read("src/settings/presentation.js"),
  read("src/pray/presentation-styles.js"),
  read("src/pray/novena-styles.js"),
  read("src/pray/traditional-pray-styles.js"),
  read("src/mass/reader-dom.js"),
]);

assert.match(design,/APP_DESIGN_SYSTEM_VERSION="ao-design-system-v1"/);
for(const token of [
  "--ao-font-display","--ao-font-body","--ao-font-liturgical","--ao-font-ui",
  "--ao-content-max","--ao-content-wide","--ao-page-gutter","--ao-page-gutter-phone",
  "--ao-control-h","--ao-card-radius","--ao-control-radius","--ao-pill-radius",
]){
  assert.ok(design.includes(token),token+" missing from the canonical design system");
}
assert.match(design,/\.homeScreen[\s\S]*#ao-calendar-modular-root[\s\S]*#ao-learn-modular-root[\s\S]*#ao-settings-modular-root/);
assert.match(design,/#aoPray435930 h1/);
assert.match(design,/\.ao-reader-shell \.ao-prayer-card/);
assert.match(design,/#ao-global-ribbon/);
assert.match(app,/import \{ installAppDesignSystem \} from "\.\/design-system\.js";/);
assert.match(app,/installAppDesignSystem\(globalThis\);/);

assert.match(calendar,/font-family:var\(--ao-font-body/);
assert.match(calendar,/width:min\(var\(--ao-content-max,760px\),100%\)/);
assert.match(calendar,/data\.aoCalendarView=calendarView/);
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

assert.match(pray,/width:min\(var\(--ao-content-max,760px\),100%\)!important/);
assert.match(pray,/max-width:var\(--ao-content-max,760px\)!important/);
assert.match(pray,/var\(--ao-font-display/);
assert.match(pray,/var\(--ao-font-liturgical/);
assert.match(pray,/var\(--ao-page-gutter-phone,12px\)/);
assert.match(novena,/var\(--ao-font-display/);
assert.match(novena,/var\(--ao-font-liturgical/);
assert.match(traditionalPray,/var\(--ao-font-display/);
assert.match(traditionalPray,/var\(--ao-font-liturgical/);

assert.match(mass,/--ao-bg:var\(--ao-bg-canvas/);
assert.match(mass,/font-family:var\(--ao-font-liturgical/);
assert.match(mass,/var\(--ao-font-ui/);
assert.match(mass,/border-radius:var\(--ao-card-radius,15px\)/);
assert.match(mass,/var\(--ao-font-display/);

console.log("Shared application typography, spacing, controls and card geometry: OK");
