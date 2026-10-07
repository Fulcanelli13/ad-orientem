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
  "learn.rites.first_communion",
  "learn.rites.confirmation",
  "learn.rites.holy_orders",
  "learn.rites.matrimony",
  "learn.serve_mass.responses",
  "learn.scapular",
  "learn.seasonal_rites",
];

assert.deepEqual(Object.keys(TRADITIONAL_LEARN_ROUTES),expected,"v38.4 traditional Learn route identity/order changed");
assert.equal(LOW_MASS_RESPONSES_V381.length,15,"Low Mass response trainer no longer matches donor 15-card corpus");
assert.equal(LOW_MASS_RESPONSES_V381[0].lat,"℟. Ad Deum, qui lætíficat iuventútem meam.");
assert.equal(LOW_MASS_RESPONSES_V381.at(-1).lat,"℟. Deo grátias.");
assert.equal(SEASONAL_PRACTICES_V381.length,10,"seasonal lay-practice list changed");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.ritual1952,/alcuinus\.org/);
assert.match(TRADITIONAL_LEARN_SOURCES_V381.pontifical1962,/books\.google\.com/,"Confirmation formation lost the 1962 Pontifical witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentConfirmation,/vatican\.va/,"Confirmation formation lost current Catechism authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentConfirmationSponsor,/vatican\.va/,"Confirmation sponsor guidance lost current canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.frenchConfirmationCatechism,/amicidilazzaro\.it\/fr/,"Confirmation lost its French-world catechetical witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.quamSingulariAAS,/vatican\.va\/archive\/aas/,"First Communion lost the primary Quam singulari source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.quamSingulariFrench,/laportelatine\.org/,"First Communion lost its French-world Quam singulari witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentEucharistCanons,/vatican\.va/,"First Communion lost current canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.firstCommunionVatican,/vatican\.va/,"First Communion lost Holy See first-penance/communion authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.campion1954,/ccwatershed\.org/,"First Communion lost Campion practical guidance source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.romanRitualCommunion1952,/rituale-romano-1952-comunione\.pdf/,"First Communion lost 1952 Roman Ritual Communion source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.oconnell1962,/Celebration%20of%20Mass/,"First Communion lost O’Connell 1962 ceremonial source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.pontifical1962Orders,/alcuinus\.org/,"Holy Orders lost the 1961–1962 Pontifical source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentHolyOrders,/vatican\.va/,"Holy Orders lost current Catechism authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentHolyOrdersCanons,/vatican\.va/,"Holy Orders lost current canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.ministeriaQuaedam,/vatican\.va/,"Holy Orders lost Ministeria quaedam historical/current discipline source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.frenchHolyOrders,/icrsp-lille\.fr/,"Holy Orders lost its French-world traditional witness");
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

assert.match(runtime,/learn\.rites\.first_communion/,"First Communion route is not owned by traditional Learn");
assert.match(runtime,/First Holy Communion · Child & Family/,"First Communion formation title disappeared");
assert.match(runtime,/about seven years old, more or less/,"First Communion lost Quam singulari's age-of-discretion formulation");
assert.match(runtime,/complete mastery of the whole Catechism is not required/,"First Communion regained an excessive pre-Communion catechism threshold");
assert.match(runtime,/Ad Orientem does not certify a child as ready/,"First Communion lost the pastoral-readiness boundary");
assert.match(runtime,/FIRST CONFESSION COMES FIRST/,"First Communion lost prior sacramental Confession");
assert.match(runtime,/route:"pray\.confession"/,"First Communion stopped reusing the canonical Confession owner");
assert.match(runtime,/route:"mass\.prepare"/,"First Communion stopped reusing Before Mass");
assert.match(runtime,/route:"mass\.thanksgiving"/,"First Communion stopped reusing After Mass");
assert.match(runtime,/route:"pray\.communion_treasury"/,"First Communion stopped reusing the Communion treasury");
assert.match(runtime,/one hour from food and drink, except water and medicine/,"First Communion lost the current Eucharistic fast");
assert.match(runtime,/midnight or three-hour fasts belong to historical discipline/,"First Communion lost historical/current fasting distinction");
assert.match(runtime,/does not create a second Communion ritual/,"First Communion began duplicating the Mass Communion ritual");
assert.match(runtime,/1962 PRACTICAL REHEARSAL/,"First Communion lost the practical 1962 reception guide");
assert.match(runtime,/priest’s Communion formula already contains Amen/,"1962 practical guide lost the no-separate-Amen rule");
assert.match(runtime,/keep the head upright and still/,"Campion practical reception guidance lost head-position instruction");
assert.match(runtime,/open the mouth and extend the tongue sufficiently/,"Campion practical reception guidance lost tongue instruction");
assert.match(runtime,/not a new set of universal rubrics/,"practical guidance was promoted into a false universal rubric");
assert.match(runtime,/FIRST COMMUNION IS A BEGINNING/,"First Communion lost continued catechesis/frequent Communion formation");
assert.doesNotMatch(runtime,/firstCommunion[\s\S]{0,9000}Since my last Confession/,"First Communion duplicated the Confession examination workflow");

assert.match(runtime,/learn\.rites\.holy_orders/,"Holy Orders route is not owned by traditional Learn");
assert.match(runtime,/Holy Orders · Understand the Ordinations/,"Holy Orders formation title disappeared");
assert.match(runtime,/three sacramental degrees of Holy Orders: episcopate, presbyterate and diaconate/,"Holy Orders lost the three-degree doctrine");
assert.match(runtime,/essential rite is the bishop’s imposition of hands/,"Holy Orders lost the essential sacramental sign");
assert.match(runtime,/clerical tonsure; the four minor orders of porter, lector, exorcist and acolyte/,"Holy Orders lost the older Roman ladder");
assert.match(runtime,/Ministeria quaedam \(1972\)/,"Holy Orders lost the historical\/current discipline boundary");
assert.match(runtime,/tonsure, minor orders or subdiaconate as additional sacramental degrees/,"Holy Orders no longer guards against treating the old ladder as extra sacramental degrees");
assert.match(runtime,/Litany of the Saints while they lie prostrate/,"Holy Orders lost the lay-visible traditional priestly ordination map");
assert.match(runtime,/not a script for the bishop, master of ceremonies or ordinands/,"Holy Orders leaked into clerical ceremonial ownership");
assert.match(runtime,/No one has a right to Holy Orders/,"Holy Orders lost the vocation-discernment boundary");
assert.match(runtime,/route:"pray\.litany_saints"/,"Holy Orders stopped reusing the existing Litany owner");
assert.match(runtime,/prayer:"sacrament_come_holy_spirit"/,"Holy Orders stopped reusing the canonical Holy Spirit prayer");
assert.doesNotMatch(runtime,/Accipe Spiritum Sanctum|Accipe potestatem|Da, quaesumus, omnipotens Pater/,"Lay Holy Orders guide leaked ordination formulae");

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
assert.match(assets,/"learn\.rites\.first_communion"\s*:\s*"ao-rich-eucharistic-life"/);
assert.match(assets,/"learn\.rites\.confirmation"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.rites\.holy_orders"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.rites\.matrimony"\s*:\s*"ao-rich-guides"/);
assert.match(assets,/"learn\.serve_mass\.responses"\s*:\s*"ao-refined-study"/);
assert.match(assets,/"learn\.scapular"\s*:\s*"ao-rich-our-lady-marian-devotions"/);
assert.match(assets,/"learn\.seasonal_rites"\s*:\s*"ao-refined-calendar-upcoming"/);

console.log("PASS modular v38.4 traditional Learn Holy Orders formation convergence without clerical-script ownership");
