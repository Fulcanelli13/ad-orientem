import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sourceBoundCalendarContext} from "../src/find/saints-calendar-context.js";

const bridge=JSON.parse(readFileSync(new URL("../data/saints/parallel-owner-identity-bridge-20261015.v1.json",import.meta.url),"utf8"));
const th=sourceBoundCalendarContext("saint:therese-of-lisieux",bridge);
assert.equal(th.calendarPersonId,"saint.therese-lisieux");
assert.equal(th.observed1962.civilDate,"2026-10-03");
assert.equal(th.observed1962.principalSourceId,"sancti:10-03:3:w");
assert.equal(th.observed1962.scope,"ACTUALLY_OBSERVED_ON_THIS_DATE_IN_2026_RESOLVER");
assert.equal(th.observed1962.authority,"SOURCE_CALENDAR_RESOLVER_NOT_INDEPENDENT_LITURGICAL_CERTIFICATION");
assert.equal(th.permittedMassSelection,false);
assert.equal(th.properId,null);
assert.equal(th.modernMemorial,null);
assert(Object.isFrozen(th)&&Object.isFrozen(th.observed1962));

const claude=sourceBoundCalendarContext("saint:claude-la-colombiere",bridge);
assert.equal(claude.calendarPersonId,"saint.claude-la-colombiere");
assert.equal(claude.observed1962,null,"Canonisation 1992 does not establish a 1962 calendar feast");
assert.equal(claude.permittedMassSelection,false);

for(const name of ["blessed:jacques-desire-laval","saint:bernadette-soubirous","saint:peter-chanel","saint:margaret-mary-alacoque","saint:francois-de-montmorency-laval"]){
 assert.equal(sourceBoundCalendarContext(name,bridge),null,name+" must not inherit an unreviewed identity");
}
assert.equal(sourceBoundCalendarContext("saint:therese-of-lisieux",null),null);
assert.equal(sourceBoundCalendarContext("saint:therese-of-lisieux",{...bridge,observed_2026:{days:0}}),null);

const tamper=structuredClone(bridge);
tamper.identity_links[0].observed_date="2025-10-03";
assert.equal(sourceBoundCalendarContext("saint:therese-of-lisieux",tamper).observed1962,null,"No historic date projection");
tamper.identity_links[0].observed_date="2026-10-03";
tamper.identity_links[0].observed_calendar_2026_principal_id="sancti:10-99:3:w";
assert.equal(sourceBoundCalendarContext("saint:therese-of-lisieux",tamper).observed1962,null,"Impossible liturgical month/day must be rejected");
tamper.identity_links[0].observed_calendar_2026_principal_id="sancti:10-03:3:w";
tamper.identity_links.push(structuredClone(tamper.identity_links[0]));
assert.equal(sourceBoundCalendarContext("saint:therese-of-lisieux",tamper),null,"Duplicate or conflicting identity links fail closed");
const nonlink=structuredClone(bridge);
nonlink.nonlinks.push({saints_id:"saint:therese-of-lisieux",relation:"DISTINCT_PERSON_DO_NOT_MERGE"});
assert.equal(sourceBoundCalendarContext("saint:therese-of-lisieux",nonlink),null,"Source conflict beats nominal match");
console.log("PASS: exact 2026 observed Calendar identity consumed in Map of Saints; no generic dates, Mass options, or Laval false merge");
