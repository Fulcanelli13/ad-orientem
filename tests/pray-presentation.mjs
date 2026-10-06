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
assert.match(runtime,/canonicalAssetIdForPrayRoute/,"PRAY module cards no longer resolve through the canonical route asset registry");
assert.match(runtime,/function|const moduleIcon/,"PRAY module identity icon renderer is absent");
assert.match(runtime,/data-ao-pray-module-asset/,"PRAY module cards lost canonical asset diagnostics");
assert.match(runtime,/aoP435930ModuleAsset/,"PRAY module cards lost their identity icon class");
assert.match(runtime,/data-ao-asset-renderer="embedded-symbol"/,"PRAY cannot render approved embedded canonical symbols while physical externalization is incomplete");
assert.doesNotMatch(runtime,/AO_ICON_REGISTRY_V4333/,"PRAY regressed to the historical donor icon registry");
assert.match(styles,/aoP435930ModuleIcon\{grid-column:1;grid-row:1\/4/,"PRAY module identity icons lost their dedicated card column");
assert.match(styles,/aoP435930ModuleAsset\{display:block;width:40px!important;height:40px!important/,"PRAY module identity icon hierarchy changed");
const runtimeWithoutDonorOverviewClose=runtime.replace(/<button[^>]*data-r23-overview-close[^>]*>×<\/button>/g,"");
assert.doesNotMatch(runtimeWithoutDonorOverviewClose,/>←<|>← |>×<|>→<|>⌕</,"PRAY regressed to raw Unicode navigation/search controls outside the exact donor Rosary overview close control");
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
assert.match(runtime,/i===13\?'ao-refined-silence':'ao-live-look'/,"Stations XIV no longer changes from attention to donor silence");
assert.match(runtime,/After the XIV Station/,"Stations XIV silence cue lost its donor context");
assert.match(runtime,/ADOR\.mode==='visit'&&ADOR\.visitStep===0/,"Adoration arrival cue lost exact visit-entry ownership");
assert.match(runtime,/ao-live-genuflect/,"Adoration arrival lost the donor genuflection cue");
assert.match(runtime,/Remain present/,"Adoration recollection rail lost its persistent silence state");
assert.match(runtime,/const stage=BEN_STAGES\?\.\[BEN\.step\]\?\.\[0\]/,"Benediction rails stopped following the public-rite stage");
assert.match(runtime,/blessing:\['ao-live-blessing'/,"Benediction blessing stage lost the canonical blessing cue");
assert.match(runtime,/prayer:\['ao-live-response'/,"Benediction versicle\/collect stage lost the response cue");
assert.match(runtime,/praises:\['ao-live-response'/,"Benediction Divine Praises stage lost the response cue");
assert.match(runtime,/CONF\.stage===3.*ao-live-sign-cross/s,"Confession in-confessional stage lost the donor Sign-of-Cross cue");
assert.match(runtime,/aoP435930SemanticRailChip \$\{channel\}\$\{cueClass\}/,"transient semantic rail state no longer receives its cue-enter class");
assert.match(styles,/aoP435930SemanticRails/,"PRAY semantic rail geometry is not present");
assert.match(styles,/pointer-events:none/,"PRAY semantic rails may intercept touch");
assert.match(styles,/aoP435930SemanticRailCard\{width:44px/,"PRAY lost the donor thin desktop rail-card geometry");
assert.match(styles,/writing-mode:vertical-rl/,"PRAY rail labels lost the donor vertical edge treatment");
assert.match(styles,/@media\(max-width:700px\)[\s\S]*aoP435930SemanticRailCard\{width:38px/,"PRAY lost thin phone edge rails");
assert.match(styles,/aoPrayRailCueIn/,"transient devotional cues lost their one-shot rail animation");
assert.match(styles,/grid-template-columns:80px minmax\(0,1fr\)/,"Angelus exact donor rail lost its 80px desktop reader-grid channel");
assert.match(styles,/min-height:78px/,"Angelus exact donor ritual slot lost its 78px desktop height");
assert.match(styles,/data-channel="gesture"\] \.aoRitualIcon\{width:48px!important;height:48px!important\}/,"Angelus gesture icon lost donor 48px hierarchy");
assert.match(styles,/@media\(max-width:720px\)[\s\S]*grid-template-columns:minmax\(0,1fr\)/,"Angelus exact donor rail lost mobile single-column reflow");
assert.match(styles,/@media\(max-width:620px\)[\s\S]*\.aoRitualRail\{top:70px;flex-direction:row/,"Angelus exact donor rail lost mobile horizontal cue row");
assert.match(styles,/@keyframes aoRitualHalo\{0%\{opacity:\.5;transform:scale\(\.72\)\}100%\{opacity:0;transform:scale\(1\.42\)\}\}/,"Angelus gesture halo no longer matches donor motion");
assert.match(runtime,/function decorateRosaryExact\(r\)/,"Rosary lost its exact-donor presentation owner");
assert.match(runtime,/function storeRosaryDonorReturn\(snapshot\)/,"Rosary donor return lost its root-owned snapshot writer");
assert.match(runtime,/root\.dataset\.aoPrayRosaryReturn=JSON\.stringify\(snapshot\)/,"Rosary donor return snapshot is no longer anchored on the preserved PrayerBook root");
assert.match(runtime,/function readRosaryDonorReturn\(\)/,"Rosary donor return lost its root-owned snapshot reader");
assert.match(runtime,/function bindRosaryDonorBack\(root\)[\s\S]*window\.addEventListener\('click',[\s\S]*e\.composedPath[\s\S]*node\?\.id==='aoPrayerBookRoot'/,
  "Rosary exact-donor back control lost the active-root window-capture return bridge");
assert.match(runtime,/function returnFromRosaryDonor\(e,root,snapshot\)[\s\S]*clearRosaryDonorReturn\(\);[\s\S]*api\.close\(\{silent:true\}\)[\s\S]*reopenResume\(snapshot\)/,
  "Rosary donor return no longer consumes its root snapshot, closes the donor and restores modular PRAY");
assert.ok(runtime.includes("if(!document.getElementById('aoPrayerBookRoot')?.classList?.contains('open'))clearRosaryDonorReturn()"),
  "stale Rosary donor return ownership is not cleared when the donor is actually closed");
assert.doesNotMatch(runtime,/if\(!silent\)\{navStack=\[\];externalResume=null;rosaryDonorReturnSnapshot=null\}/,
  "generic modular close must not erase an active Rosary donor return snapshot");
assert.match(runtime,/function decorateRosary\(\)\{\s*const r=rosaryDonorRoot\(\)/,"Rosary decorator is not bound to the actually visible donor root");
assert.doesNotMatch(runtime,/for\(const node of children\)center\.appendChild\(node\)/,"Rosary decorator still reparents the preserved PrayerBook DOM and can collapse donor geometry");
assert.match(runtime,/function ownRosaryDonorRoots\(active\)/,"Rosary lost single-visible-root ownership");
assert.match(runtime,/assetId:'ao-live-sign-cross'/,"Rosary still references the removed ao-posture-sign-cross asset id");
assert.doesNotMatch(runtime,/assetId:'ao-posture-sign-cross'/,"Removed Sign-of-Cross asset id survived in production PRAY");
assert.match(styles,/data-ao-rosary-active-root="false"[^}]*pointer-events:none/,"Inactive duplicate PrayerBook roots can still intercept pointer input");
assert.match(styles,/data-ao-rosary-exact-donor="v3\.4\.14"[^\n]*\.lab-recitation-mode[\s\S]*display:none!important/,"Rosary still exposes duplicate native recitation controls");
assert.match(styles,/width:min\(520px,100%\)!important/,"PRAY shell is no longer bounded to app-native width");
assert.match(styles,/data-ao-rosary-active-root="true"[^\n]*pbShell\[data-ao-rosary-exact-donor="v3\.4\.14"\][^\{]*\{[^\}]*max-width:520px!important[^\}]*box-sizing:border-box!important/,"Active exact-donor Rosary shell lost its final 520px width ownership");
assert.match(styles,/aoP435930ModuleGrid\{display:grid;grid-template-columns:1fr/,"PRAY hub regressed to the desktop two-column layout");
assert.match(runtime,/aoRosaryRitualGrid/,"Rosary lost the v3.4.14 ritual reader ownership marker");
assert.match(runtime,/aoRosaryExactDonor='v3\.4\.14'/,"Rosary exact donor ownership stamp changed");
assert.match(runtime,/function rosaryDonorProgress\(info\)/,"Rosary lost donor five-mystery progress projection");
assert.match(runtime,/rosary-decade-bar-v15/,"Rosary lost the donor five-segment progress bar");
assert.match(runtime,/data-ao-exact-donor-progress/,"Rosary progress is no longer marked as exact donor presentation");
assert.match(runtime,/function ensureRosaryDonorRecitation\(r\)/,"Rosary lost donor head recitation control");
assert.match(runtime,/r29-head-recitation/,"Rosary lost Individual\/Group head control");
assert.match(runtime,/function rosaryDonorArt\(r,info\)/,"Rosary lost donor mystery-art backdrop projection");
assert.match(runtime,/r24-has-mystery-art/,"Rosary lost donor mystery-art state");
assert.match(runtime,/function rosaryDonorMysteryFx\(r,info\)/,"Rosary lost donor mystery-entry cinematic owner");
assert.match(runtime,/info\?\.step\?\.kind!==['"]mystery['"]/,"Rosary mystery cinematic is no longer restricted to mystery-entry boundaries");
assert.match(runtime,/AO_CINEMATIC_V4312\|\|window\.AO_CINEMATIC_V4311/,"Rosary mystery cinematic no longer reuses the certified cinematic owner");
assert.match(runtime,/isReducedMotion\?\.\(\)/,"Rosary mystery cinematic no longer honors reduced motion");
assert.match(styles,/ROSARY_EXACT_DONOR_CSS/,"Rosary exact donor style block is absent");
assert.match(styles,/rosary-decade-bar-v15 i\.current/,"Rosary donor progress current-state geometry is absent");
assert.match(styles,/r29-head-recitation/,"Rosary donor recitation strip styling is absent");
assert.match(styles,/r24-has-mystery-art::before/,"Rosary donor sacred-art backdrop styling is absent");
assert.match(styles,/lab-contemplation.*r23-contemplation/,"Rosary donor contemplation-sheet styling is absent");

const body={parentNode:null};
const direct={parentNode:body};
const nested={parentNode:direct};
assert.equal(directChildAnchor(body,direct),direct,"direct PRAY card insertion anchor changed");
assert.equal(directChildAnchor(body,nested),direct,"nested PRAY card did not resolve to a direct body child");
assert.equal(directChildAnchor(body,{parentNode:null}),null,"foreign PRAY node incorrectly became an insertion anchor");

console.log("PASS locked v43.59.30 PRAY presentation extraction");
