import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LOW_MASS_RESPONSES_V381,
  SEASONAL_PRACTICES_V381,
  TRADITIONAL_LEARN_SOURCES_V381,
} from "../src/learn/traditional-life-data.js";
import { TRADITIONAL_LEARN_ROUTES } from "../src/learn/traditional-life.js";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const expected=[
  "learn.rites.sick",
  "learn.rites.baptism",
  "learn.rites.confirmation",
  "learn.rites.matrimony",
  "learn.serve_mass.responses",
  "learn.scapular",
  "learn.seasonal_rites",
];

assert.deepEqual(Object.keys(TRADITIONAL_LEARN_ROUTES),expected,"v38.1 traditional Learn route identity/order changed");
assert.equal(LOW_MASS_RESPONSES_V381.length,15,"Low Mass response trainer no longer matches donor 15-card corpus");
assert.equal(LOW_MASS_RESPONSES_V381[0].lat,"℟. Ad Deum, qui lætíficat iuventútem meam.");
assert.equal(LOW_MASS_RESPONSES_V381.at(-1).lat,"℟. Deo grátias.");
assert.equal(SEASONAL_PRACTICES_V381.length,10,"seasonal lay-practice list changed");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.ritual1952,/alcuinus\.org/);
assert.match(TRADITIONAL_LEARN_SOURCES_V381.pontifical1962,/books\.google\.com/,"Confirmation formation lost the 1962 Pontifical witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentConfirmation,/vatican\.va/,"Confirmation formation lost current Catechism authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentConfirmationSponsor,/vatican\.va/,"Confirmation sponsor guidance lost current canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.frenchConfirmationCatechism,/amicidilazzaro\.it\/fr/,"Confirmation lost its French-world catechetical witness");
const visibleTraditional=expected.filter(id=>id!=="learn.seasonal_rites");
assert.ok(visibleTraditional.every(id=>LEARN_MODULE_IDS.includes(id)),"recovered traditional routes are not visible in modular Learn");
assert.equal(LEARN_MODULE_IDS.includes("learn.seasonal_rites"),false,"final v38.4 donor dedupe requires Seasonal Catholic Practice to remain a compatibility alias, not a duplicate Learn launcher");

const runtime=readFileSync("src/learn/traditional-life.js","utf8");
const browser=readFileSync("src/learn/browser-entry.js","utf8");
const presentation=readFileSync("src/learn/presentation.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

assert.match(runtime,/priestCeremonialExposed:false/,"lay-only scope guard disappeared");
assert.match(runtime,/WHAT YOU MAY SEE IN THE TRADITIONAL CEREMONY/,"Matrimony lost its lay-facing traditional ceremony map");
assert.match(runtime,/one ring or two/,"Matrimony no longer warns that ring customs vary");
assert.match(runtime,/approved local custom/,"Matrimony local-custom guard disappeared");
assert.match(runtime,/special marriage prayers after the Pater noster/,"Matrimony no longer explains the certified Nuptial Mass insertions");
assert.match(runtime,/A 1951 rule is therefore never copied into the 1962 engine/,"older-missal versus 1962 authority guard disappeared");
assert.match(runtime,/AFTER DEATH · TRADITIONAL FUNERAL SEQUENCE/,"Serious Illness & Dying lost the traditional funeral sequence explanation");
assert.match(runtime,/Death may be near · Open Dying Companion/,"Serious Illness guide lost escalation into Dying Companion");
assert.match(runtime,/route:"pray\.dying_companion"/,"Serious Illness guide no longer routes imminent death to the bedside companion");
assert.match(runtime,/stop using prayers addressed to the dying person and move to suffrage for the departed/,"Serious Illness guide lost the death-state boundary");
assert.match(runtime,/dead_eternal_rest_singular/,"Serious Illness after-death section lost singular Eternal Rest");

assert.match(runtime,/TRADITIONAL ROMAN ORDER · WHAT YOU MAY SEE/,"Baptism/Confirmation lost the traditional lay-facing order map");
assert.match(runtime,/church door with the child’s name and request for faith/,"Baptism lost the traditional Roman entrance sequence");
assert.match(runtime,/Ephpheta, the renunciations and the anointing with the Oil of Catechumens/,"Baptism lost the pre-font traditional sequence");
assert.match(runtime,/Sacred Chrism, the white garment and the lighted candle/,"Baptism lost the post-baptismal traditional signs");
assert.match(runtime,/Emergency Baptism · only in real necessity/,"Baptism lost the emergency-only boundary");
assert.match(runtime,/I baptize you in the name of the Father, and of the Son, and of the Holy Spirit/,"Emergency Baptism lost the exact Trinitarian form");
assert.match(runtime,/godparent’s task is not ceremonial only/,"Baptism lost the continuing godparent responsibility");

assert.match(runtime,/learn\.rites\.confirmation/,"Confirmation route is not owned by traditional Learn");
assert.match(runtime,/Confirmation · Candidate & Sponsor/,"Confirmation module title disappeared");
assert.match(runtime,/seven gifts of the Holy Spirit/,"Confirmation lost the traditional invocation over the confirmands");
assert.match(runtime,/places the right hand on the candidate’s right shoulder/,"Confirmation lost the traditional sponsor position");
assert.match(runtime,/light touch on the cheek with the sign of peace/,"Confirmation lost the traditional peace gesture");
assert.match(runtime,/OLD PONTIFICAL RUBRICS ARE NOT AUTOMATIC CURRENT RULES/,"Confirmation lost the historical/current authority guard");
assert.match(runtime,/fasting, forehead bands and older sponsor rules/,"Confirmation no longer identifies historical Pontifical details as historical");
assert.doesNotMatch(runtime,/Signo te signo crucis|confirmo te chrismate salutis/,"Lay Confirmation guide leaked the celebrant's sacramental formula");

assert.match(runtime,/Absolution at the bier or catafalque is actually appointed/,"funeral formation no longer preserves explicit Absolution activation");
assert.match(runtime,/In paradisum accompanies the departure/,"funeral formation lost the burial-procession handoff");
assert.doesNotMatch(runtime,/Ego conjungo vos|With this ring I thee wed/,"lay formation leaked a country-specific or celebrant ritual script");
assert.match(runtime,/AO_TRADITIONAL_LEARN_V381/);
assert.match(runtime,/learn\.serve_mass.*learn\.serve_mass\.responses/s,"Low Mass alias disappeared");
assert.match(runtime,/data-ao-tradlearn-close/,"traditional Learn child shell lost donor Close control");
assert.match(runtime,/ao-ui-close/,"traditional Learn Close control stopped using the canonical utility asset");
assert.match(runtime,/Lay Companion/,"traditional Learn child shell lost the v38.1 donor kicker");
assert.doesNotMatch(runtime,/<span aria-hidden="true"><\/span><\/header>/,"traditional Learn child shell regressed to a blank trailing spacer");
assert.match(runtime,/canonical==="learn\.seasonal_rites"[\s\S]*navigate\?\.\("calendar"\)/,"Seasonal compatibility alias no longer hands off to the richer Calendar\/liturgical-year owner");
assert.doesNotMatch(runtime,/AO_TRADITION_V38/,"historical Traditions monolith was restored as a runtime owner");
assert.match(browser,/ensureTraditionalLearnRegistry/);
assert.match(browser,/TRADITIONAL_LEARN_ROUTES\[id\]/);
assert.match(presentation,/Traditional Catholic life/);
assert.doesNotMatch(presentation,/id:"learn\.seasonal_rites"/,"final v38.4 duplicate seasonal discovery card returned to Learn");
assert.match(assets,/"learn\.rites\.sick"\s*:\s*"ao-refined-help"/);
assert.match(assets,/"learn\.rites\.baptism"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.rites\.confirmation"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.rites\.matrimony"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.serve_mass\.responses"\s*:\s*"ao-refined-study"/);
assert.match(assets,/"learn\.scapular"\s*:\s*"ao-rich-our-lady-marian-devotions"/);
assert.match(assets,/"learn\.seasonal_rites"\s*:\s*"ao-refined-calendar-upcoming"/);

console.log("PASS modular v38.2 traditional Learn sacramental-life formation convergence");
