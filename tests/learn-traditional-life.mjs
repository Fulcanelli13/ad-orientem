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

assert.deepEqual(Object.keys(TRADITIONAL_LEARN_ROUTES),expected,"traditional Learn route identity/order changed");
assert.equal(LOW_MASS_RESPONSES_V381.length,15,"Low Mass response trainer no longer matches donor 15-card corpus");
assert.equal(LOW_MASS_RESPONSES_V381[0].lat,"℟. Ad Deum, qui lætíficat iuventútem meam.");
assert.equal(LOW_MASS_RESPONSES_V381.at(-1).lat,"℟. Deo grátias.");
assert.equal(SEASONAL_PRACTICES_V381.length,10,"seasonal lay-practice list changed");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.ritual1952,/alcuinus\.org/);
assert.match(TRADITIONAL_LEARN_SOURCES_V381.missal1962,/archive\.org/,"Requiem formation lost the 1962 Missal witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentFuneralsCanons,/vatican\.va/,"after-death formation lost current funeral canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentFuneralsCatechism,/vatican\.va/,"after-death formation lost current funeral Catechism authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentPurgatory,/vatican\.va/,"after-death formation lost prayer-for-the-dead doctrine");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentAshes,/vatican\.va/,"after-death formation lost 2016 ashes discipline");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentAshes2023,/vatican\.va/,"after-death formation lost 2023 ashes clarification");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.familyPrayer,/vatican\.va/,"Matrimony aftercare lost family-prayer authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.piusXiiFamilyRosary,/vatican\.va/,"Matrimony aftercare lost Pius XII family-Rosary witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.leoXiiiSacredHeart,/vatican\.va/,"Matrimony aftercare lost Leo XIII Sacred Heart witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.sacredHeartFamily,/vatican\.va/,"Matrimony aftercare lost family consecration authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.marriageAnniversary,/usccb\.org/,"Matrimony aftercare lost marriage-anniversary witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.pontifical1962,/books\.google\.com/,"Confirmation formation lost the 1962 Pontifical witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentConfirmation,/vatican\.va/,"Confirmation formation lost current Catechism authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentConfirmationSponsor,/vatican\.va/,"Confirmation sponsor guidance lost current canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.frenchConfirmationCatechism,/amicidilazzaro\.it\/fr/,"Confirmation lost its French-world catechetical witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.quamSingulariAAS,/vatican\.va\/archive\/aas/,"First Communion lost the primary Quam singulari source");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.quamSingulariFrench,/laportelatine\.org/,"First Communion lost its French-world Quam singulari witness");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.currentEucharistCanons,/vatican\.va/,"First Communion lost current canon-law authority");
assert.match(TRADITIONAL_LEARN_SOURCES_V381.firstCommunionVatican,/vatican\.va/,"First Communion lost Holy See first-penance/communion authority");
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
const sickStart=runtime.indexOf("function sick(win){");
const sickEnd=runtime.indexOf("\\nfunction ",sickStart+20);
const sickSection=runtime.slice(sickStart,sickEnd);
const matrimonyStart=runtime.indexOf("function matrimony(win){");
const matrimonyEnd=runtime.indexOf("\\nfunction ",matrimonyStart+20);
const matrimonySection=runtime.slice(matrimonyStart,matrimonyEnd);

assert.match(runtime,/priestCeremonialExposed:false/,"lay-only scope guard disappeared");
assert.match(runtime,/WHAT YOU MAY SEE IN THE TRADITIONAL CEREMONY/,"Matrimony lost its lay-facing traditional ceremony map");
assert.match(runtime,/one ring or two/,"Matrimony no longer warns that ring customs vary");
assert.match(runtime,/approved local custom/,"Matrimony local-custom guard disappeared");
assert.match(runtime,/special marriage prayers after the Pater noster/,"Matrimony no longer explains the certified Nuptial Mass insertions");
assert.match(runtime,/A 1951 rule is therefore never copied into the 1962 engine/,"older-missal versus 1962 authority guard disappeared");
assert.match(matrimonySection,/DISCERNMENT & ENGAGEMENT/,"Matrimony lost courtship\/engagement formation");
assert.match(matrimonySection,/CANONICAL PREPARATION/,"Matrimony lost canonical preparation");
assert.match(matrimonySection,/LIVING THE MARRIAGE/,"Matrimony lost aftercare formation");
assert.match(matrimonySection,/Regular family prayer supports the sacramental communion/,"Matrimony aftercare lost family prayer");
assert.match(matrimonySection,/Family consecration to the Sacred Heart is a genuine Catholic devotional practice/,"Matrimony aftercare lost Sacred Heart family devotion");
assert.match(matrimonySection,/marriage anniversary is an occasion of thanksgiving/i,"Matrimony aftercare lost anniversary thanksgiving");
assert.match(sickSection,/WHEN DEATH OCCURS/,"Serious Illness & Dying lost the sourced after-death boundary");
assert.match(sickSection,/FUNERAL & REQUIEM/,"Serious Illness & Dying lost funeral\/Requiem formation");
assert.match(sickSection,/BURIAL, CREMATION & ASHES/,"Serious Illness & Dying lost burial\/cremation\/ashes formation");
assert.match(sickSection,/Death may be near · Open Dying Companion/,"Serious Illness guide lost escalation into Dying Companion");
assert.match(sickSection,/route:"pray\.dying_companion"/,"Serious Illness guide no longer routes imminent death to the bedside companion");
assert.match(sickSection,/move from prayers for the dying to suffrage for the departed/,"Serious Illness guide lost the death-state boundary");
assert.match(sickSection,/Christian hope does not require the family or the app to declare that the deceased is certainly already in Heaven/,"after-death formation regained canonization-by-app language");
assert.match(sickSection,/The body should be treated with Christian reverence/,"after-death formation lost reverence for the body");
assert.match(sickSection,/traditional Absolution at the bier or catafalque is a funeral rite of suffrage/,"Requiem formation lost the Absolution boundary");
assert.match(sickSection,/current final commendation and the traditional funeral Absolution therefore should not be presented as the same rite/,"traditional\/current funeral distinction collapsed");
assert.match(sickSection,/A catafalque is a ceremonial representation used when the body is not present/,"Requiem formation lost catafalque explanation");
assert.match(sickSection,/1917 law governing the 1962 context prohibited voluntary cremation/,"burial formation lost historical discipline");
assert.match(sickSection,/does not create a general right to divide or distribute ashes freely/,"ashes formation lost 2023 narrow-exception boundary");
assert.match(sickSection,/data-ao-tradlearn-mass/,"after-death formation lost its explicit Mass handoff");
assert.match(sickSection,/route:"pray\.holy_souls"/,"after-death formation lost Holy Souls handoff");
assert.match(sickSection,/dead_eternal_rest_singular/,"Serious Illness after-death section lost singular Eternal Rest");

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

assert.match(sickSection,/Missale Romanum · 1962 · Masses of the Dead \/ Requiem/,"funeral formation lost its 1962 Requiem source drawer");
assert.match(sickSection,/Rituale Romanum · 1952 · De Exsequiis/,"funeral formation lost its traditional funeral-rite source drawer");
assert.doesNotMatch(runtime,/Ego conjungo vos|With this ring I thee wed/,"lay formation leaked a country-specific or celebrant ritual script");
assert.match(runtime,/AO_TRADITIONAL_LEARN_V381/);
assert.match(runtime,/learn\.serve_mass.*learn\.serve_mass\.responses/s,"Low Mass alias disappeared");
assert.match(runtime,/data-ao-tradlearn-close/,"traditional Learn child shell lost donor Close control");
assert.match(runtime,/ao-ui-close/,"traditional Learn Close control stopped using the canonical utility asset");
assert.doesNotMatch(runtime,/Lay Companion/,"retired Lay Companion sub-brand returned");
assert.match(runtime,/Formation/,"traditional Learn child shell lost Formation identity");
assert.doesNotMatch(sickSection,/DISCERNMENT & ENGAGEMENT|Courtship is discernment|CANONICAL PREPARATION/,"Serious Illness regained misplaced Matrimony content");
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

console.log("PASS modular v38.5 traditional Learn after-death and family absorption on shared shell");
