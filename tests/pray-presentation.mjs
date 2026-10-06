import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRAY_CANONICAL_DATA_V435930 } from "../src/pray/canonical-data.js";
import { directChildAnchor } from "../src/pray/dom-anchor.js";

const prayers=PRAY_CANONICAL_DATA_V435930?.prayers??{};
assert.equal(Object.keys(prayers).length,48,"locked v43.59.30 corpus must contain exactly 48 prayer records");
assert.ok(prayers.sacrament_act_of_contrition,"Act of Contrition missing from canonical PRAY corpus");
assert.ok(prayers.litany_loreto_1962,"1962 Litany of Loreto missing from canonical PRAY corpus");

const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const coherence=readFileSync("src/pray/presentation-coherence.js","utf8");
const styles=readFileSync("src/pray/presentation-styles.js","utf8");
assert.match(runtime,/43\.59\.30-pray-acceptance/);
assert.match(runtime,/AO_PRAY_V435930/);
assert.match(coherence,/aoPrayerBookRoot/);
assert.match(coherence,/aoPray435930/);
assert.match(styles,/ao-v435930-pray-audit-style/);
assert.match(styles,/ao-v435930-pray-coherence-style/);
for(const id of ["ao-ui-back","ao-ui-close","ao-ui-next","ao-ui-search"]){
  assert.match(runtime,new RegExp(id),"PRAY lost canonical V4 control: "+id);
}
assert.doesNotMatch(runtime,/>←<|>← |>×<|>→<|>⌕</,"PRAY regressed to raw Unicode navigation/search controls");
assert.match(styles,/aoP435930ModuleCard i \.aoP435930UiIcon/,"PRAY module-card canonical chevrons lost explicit touch-visible geometry");
assert.match(runtime,/const trailing=view==='home'/,"PRAY root header no longer distinguishes its root exit state");
assert.match(runtime,/aoP435930HeadSpacer/,"PRAY root lost balanced single-exit header spacer");
assert.match(runtime,/normalizeRosaryPrefs/,"PRAY lost Rosary preference normalization");
assert.match(runtime,/rosaryDonorRoot/,"PRAY lost canonical Rosary donor-root resolver");
assert.match(runtime,/restoreRosaryLaunchPrefs/,"PRAY lost post-mount Rosary owner reconciliation");
assert.ok(runtime.includes("!root?.classList?.contains('open')||!native"),
  "Rosary handoff stopped waiting for the preserved player to be visibly open");
assert.ok(runtime.includes('[data-ao-recitation="${prefs.recitation}"]'),
  "Rosary handoff stopped driving the preserved player's native recitation owner");
assert.match(runtime,/const prefs=syncRosaryPrefs\(\{\.\.\.S\.rosary\}\)/,
  "Rosary launcher stopped snapshotting chooser state before donor mount");
assert.match(runtime,/\['individual','group'\]\.includes\(seg\)\)\{setRecitationMode\(seg\)/,
  "Rosary chooser stopped synchronizing recitation through the canonical setter");
assert.match(styles,/aoP435930HeadSpacer/,"PRAY single-exit header spacer lost visual geometry");
assert.match(runtime,/function semanticRails\(\)/,"PRAY lost the recovered semantic side-rail owner");
assert.match(runtime,/ao-live-stand.*ao-live-kneel/s,"Angelus semantic rail lost canonical Stand\/Kneel mapping");
assert.doesNotMatch(runtime,/view===['"]angelus['"][\s\S]{0,650}ao-rich-angelus/,"Angelus exact donor rail regained the later generic context card");
assert.match(runtime,/aoRitualReaderGrid aoAngelusRitualGrid/,"Angelus lost the donor ritual reader grid");
assert.match(runtime,/data-ao-ritual-module="angelus"/,"Angelus lost its exact donor rail ownership marker");
assert.match(runtime,/data-ao-ritual-channels="posture,gesture"/,"Angelus exact donor channel contract changed");
assert.match(runtime,/data-ao-incarnation="true"/,"Angelus lost the exact Incarnation focus marker");
assert.match(runtime,/ritualSlotMarkup\('gesture','ao-live-profound-bow'/,"Angelus lost the donor profound-bow gesture slot");
assert.match(runtime,/intersectionRatio>=\.56/,"Angelus gesture no longer follows the donor focus threshold");
assert.match(runtime,/ao-rich-stations/,"Stations semantic rail lost its canonical devotional identity");
assert.match(runtime,/ao-live-look/,"Stations lost the sourced face-the-Station attention cue");
assert.match(runtime,/function stationsFx\(\)/,"Stations lost its transition-cinematic presentation hook");
assert.match(runtime,/lastStationsFxStep===i/,"Stations transition no longer deduplicates repeated renders of the same Station");
assert.match(runtime,/STATIONS OF THE CROSS/,"Stations cinematic lost its devotional identity");
assert.match(runtime,/AO_CINEMATIC_V4312\|\|window\.AO_CINEMATIC_V4311/,"Stations transition no longer reuses the certified cinematic owner");
assert.match(runtime,/isReducedMotion\?\.\(\)/,"Stations transition no longer honors reduced motion");
assert.doesNotMatch(runtime,/view===['"]stations['"][\s\S]{0,900}ao-live-(?:stand|kneel)/,"Stations semantic rails invented a universal posture");
assert.match(runtime,/i===13\?'ao-refined-silence':'ao-live-look'/,"Stations XIV lost the donor silence cue");
assert.match(runtime,/i===13\?'transient':'persistent'/,"Stations XIV silence cue lost transient ownership");
assert.match(runtime,/ADOR\.mode==='visit'&&ADOR\.visitStep===0/,"Adoration arrival rail no longer keys off the first Visit step");
assert.match(runtime,/ao-live-genuflect[\s\S]{0,260}channel:'transient'/,"Adoration arrival genuflection lost transient ownership");
assert.match(runtime,/ao-refined-silence[\s\S]{0,260}channel:'persistent'/,"Adoration silence rail lost persistent ownership");
assert.match(runtime,/blessing:\['ao-live-blessing'/,"Benediction blessing stage lost the canonical Blessing asset");
assert.match(runtime,/stage==='prayer'\|\|stage==='praises'[\s\S]{0,220}ao-live-response[\s\S]{0,140}channel:'transient'/,"Benediction response cue lost transient ownership");
assert.match(runtime,/CONF\.stage===3[\s\S]{0,220}ao-live-sign-cross[\s\S]{0,180}channel:'transient'/,"Confession in-confessional Sign of Cross lost transient ownership");
assert.match(runtime,/semanticTransientKeys/,"PRAY no longer tracks transient semantic cue ownership");
assert.match(runtime,/signature&&signature!==lastSemanticTransientSignature/,"transient cue animation no longer deduplicates unchanged semantic state");
assert.match(runtime,/cue-enter/,"transient semantic cues no longer receive donor entry choreography");
assert.match(styles,/aoP435930SemanticRails/,"PRAY semantic rail geometry is not present");
assert.match(styles,/pointer-events:none/,"PRAY semantic rails may intercept touch");
assert.match(styles,/aoP435930SemanticRailIcon\{width:28px/,"PRAY semantic rail icons lost salient desktop geometry");
assert.match(styles,/grid-template-columns:80px minmax\(0,1fr\)/,"Angelus exact donor rail lost its 80px desktop reader-grid channel");
assert.match(styles,/min-height:78px/,"Angelus exact donor ritual slot lost its 78px desktop height");
assert.match(styles,/data-channel="gesture"\] \.aoRitualIcon\{width:48px!important;height:48px!important\}/,"Angelus gesture icon lost donor 48px hierarchy");
assert.match(styles,/@media\(max-width:720px\)[\s\S]*grid-template-columns:minmax\(0,1fr\)/,"Angelus exact donor rail lost mobile single-column reflow");
assert.match(styles,/@media\(max-width:620px\)[\s\S]*\.aoRitualRail\{top:70px;flex-direction:row/,"Angelus exact donor rail lost mobile horizontal cue row");
assert.match(styles,/@keyframes aoRitualHalo\{0%\{opacity:\.5;transform:scale\(\.72\)\}100%\{opacity:0;transform:scale\(1\.42\)\}\}/,"Angelus gesture halo no longer matches donor motion");
assert.match(styles,/aoP435930SemanticRail\{position:absolute;top:50%;transform:translateY\(-50%\)/,"devotional rails lost donor vertical edge centering");
assert.match(styles,/aoP435930SemanticRailChip\{display:flex;flex-direction:column;align-items:center;gap:7px;width:44px/,"devotional rail desktop width/stack changed");
assert.match(styles,/aoP435930SemanticRailChip\.persistent\{opacity:\.82\}/,"persistent devotional rail state lost quiet hierarchy");
assert.match(styles,/writing-mode:vertical-rl;transform:rotate\(180deg\)/,"desktop devotional rail labels lost donor vertical treatment");
assert.match(styles,/@keyframes aoPrayRailCueIn/,"transient devotional cue animation is absent");
assert.match(styles,/@media\(max-width:700px\)[\s\S]*aoP435930SemanticRailIcon\{width:26px!important;height:26px!important\}/,"PRAY devotional rail icons lost exact phone geometry");
assert.match(styles,/@media\(max-width:700px\)[\s\S]*aoP435930SemanticRailLabel,#aoPray435930 \.aoP435930SemanticRailChip small\{display:none\}/,"phone devotional rails no longer collapse to icon-first presentation");
assert.match(runtime,/function decorateRosaryFx\(r\)/,"Rosary lost its live FX presentation hook");
assert.match(runtime,/getElementById\(['"]aoPrayerBookRoot['"]\)/,"Rosary decorator no longer prioritizes the canonical production PrayerBook root");
assert.match(runtime,/aoP435930RosarySemanticRails/,"Rosary lost its live contextual side rail");
assert.match(runtime,/ao-rich-rosary/,"Rosary live rail lost the canonical Rosary identity");
assert.match(runtime,/step\?\.kind!==['"]mystery['"]/,"Rosary mystery cinematic is no longer restricted to mystery-entry boundaries");
assert.match(runtime,/AO_CINEMATIC_V4312\|\|window\.AO_CINEMATIC_V4311/,"Rosary mystery cinematic no longer reuses the certified cinematic owner");
assert.match(runtime,/isReducedMotion\?\.\(\)/,"Rosary mystery cinematic no longer honors reduced motion");
assert.doesNotMatch(runtime,/aoP435930RosarySemanticRail[\s\S]{0,500}ao-live-(?:stand|kneel)/,"Rosary live rail invented a universal posture");
assert.match(styles,/aoP435930RosarySemanticRails/,"Rosary live context rail styling is absent");
assert.match(styles,/aoP435930RosarySemanticRailIcon\{width:29px/,"Rosary live rail icon lost salient geometry");

const body={parentNode:null};
const direct={parentNode:body};
const nested={parentNode:direct};
assert.equal(directChildAnchor(body,direct),direct,"direct PRAY card insertion anchor changed");
assert.equal(directChildAnchor(body,nested),direct,"nested PRAY card did not resolve to a direct body child");
assert.equal(directChildAnchor(body,{parentNode:null}),null,"foreign PRAY node incorrectly became an insertion anchor");

console.log("PASS locked v43.59.30 PRAY presentation extraction");
