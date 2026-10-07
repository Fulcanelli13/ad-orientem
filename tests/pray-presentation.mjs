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
assert.match(runtime,/function prayFamilies\(\)/,"PRAY six-door family registry is missing");
for(const id of ["daily","eucharistic","penance","passion","devotions","library"]){
  assert.match(runtime,new RegExp(id+":Object\\.freeze\\("),"PRAY family missing: "+id);
}
for(const label of ["Daily Prayer","Eucharistic Prayer","Confession & Penance","Passion & Stations","Devotions & Novenas","Prayer Library"]){
  assert.ok(runtime.includes(label),"PRAY top-level door missing: "+label);
}
assert.match(runtime,/aoP435930FamilyDoor/,"PRAY family-door presentation marker is missing");
assert.match(runtime,/data-p435930-family/,"PRAY family navigation is not explicit");
assert.match(runtime,/data-p435930-external/,"PRAY family routes cannot hand off to extracted modules");
assert.match(runtime,/openFamily,close,state:/,"PRAY public owner does not expose family-return navigation");
assert.doesNotMatch(runtime,/Daily & Marian|Penance, Passion & Intercession|Devotional programmes|Around Mass/,"retired corpus-wall section taxonomy returned");

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
assert.match(coherence,/function v3410FocusY\(mount\)/,"v3.4.10 40\/42 percent focus-line owner is absent");
assert.match(coherence,/matchMedia\('\(max-width:760px\)'\)\.matches\?\.40:\.42/,"v3.4.10 phone\/desktop focus ratios changed");
assert.match(coherence,/function v3410MidpointCurrent\(nodes,y\)/,"v3.4.10 midpoint handoff is absent");
assert.match(coherence,/const preZone=matchMedia\('\(max-width:760px\)'\)\.matches\?118:138/,"v3.4.10 anticipation zone changed");
assert.match(coherence,/view==='angelus'/,"Angelus is not using the v3.4.10 focus owner");
assert.match(coherence,/view==='stations'/,"Stations are not using the v3.4.10 focus owner");
assert.match(styles,/opacity \.045s linear/,"v3.4.10 45ms visual interpolation disappeared");
assert.match(styles,/--ao346-focus-opacity/,"Angelus v3.4.10 focus energy variable is absent");
assert.match(styles,/--ao347-focus-opacity/,"Stations v3.4.10 focus energy variable is absent");
const runtimeWithoutDonorOverviewClose=runtime.replace(/<button[^>]*data-r23-overview-close[^>]*>×<\/button>/g,"");
assert.doesNotMatch(runtimeWithoutDonorOverviewClose,/>←<|>← |>×<|>→<|>⌕</,"PRAY regressed to raw Unicode navigation/search controls outside the exact donor Rosary overview close control");
assert.match(styles,/aoP435930ModuleCard i \.aoP435930UiIcon/,"PRAY module-card canonical chevrons lost explicit touch-visible geometry");
assert.match(runtime,/class="aoP435930Close" data-p435930-close/,"PRAY header lost the donor Close control");
assert.doesNotMatch(runtime,/const trailing=view==='home'/,"PRAY hub must not suppress the donor Close control");
assert.doesNotMatch(runtime,/aoP435930HeadSpacer/,"obsolete single-exit spacer returned to the PRAY header");
assert.match(runtime,/normalizeRosaryPrefs/,"PRAY lost Rosary preference normalization");
assert.match(runtime,/rosaryDonorRoot/,"PRAY lost canonical Rosary donor-root resolver");
assert.match(runtime,/restoreRosaryLaunchPrefs/,"PRAY lost post-mount Rosary owner reconciliation");
assert.ok(runtime.includes("!root?.classList?.contains('open')||!native"),
  "Rosary handoff stopped waiting for the preserved player to be visibly open");
assert.ok(runtime.includes('[data-ao-recitation="${prefs.recitation}"]'),
  "Rosary handoff stopped driving the preserved player's native recitation owner");
assert.match(runtime,/function launchRosaryPlayer\(resume=captureResume\(\)\)[\s\S]*const prefs=syncRosaryPrefs\(\{\.\.\.S\.rosary\}\)/,
  "Rosary direct launcher stopped snapshotting canonical preferences before donor mount");
assert.match(runtime,/if\(b\.dataset\.p435930Own\)\{if\(b\.dataset\.p435930Own==='pray\.rosary'\)\{launchRosaryPlayer\(captureResume\(\)\)/,
  "Rosary card no longer bypasses the redundant modular chooser");
assert.match(runtime,/\['individual','group'\]\.includes\(seg\)\)\{setRecitationMode\(seg\)/,
  "Rosary chooser stopped synchronizing recitation through the canonical setter");
assert.match(runtime,/function applySettingsPreferences\(raw=\{\}\)/,
  "PRAY lost the restored Settings preference bridge");
assert.match(runtime,/applySettingsPreferences,sources:SOURCE_REGISTRY/,
  "PRAY Settings bridge is not exposed on the canonical public owner");
assert.match(runtime,/typeof stations\.stabatMater===['"]boolean['"]/,
  "PRAY Settings bridge no longer maps Stations Stabat Mater");
assert.doesNotMatch(styles,/aoP435930HeadSpacer/,"obsolete PRAY hub spacer styling returned");
assert.match(runtime,/function semanticRails\(\)/,"PRAY lost the recovered semantic side-rail owner");
assert.match(runtime,/ao-live-stand.*ao-live-kneel/s,"Angelus semantic rail lost canonical Stand\/Kneel mapping");
assert.doesNotMatch(runtime,/view===['"]angelus['"][\s\S]{0,650}ao-rich-angelus/,"Angelus exact donor rail regained the later generic context card");
assert.match(runtime,/aoRitualReaderGrid aoAngelusRitualGrid/,"Angelus lost the donor ritual reader grid");
assert.match(runtime,/data-ao-ritual-module="angelus"/,"Angelus lost its exact donor rail ownership marker");
assert.match(runtime,/data-ao-ritual-channels="posture,gesture"/,"Angelus exact donor channel contract changed");
assert.match(runtime,/data-ao-incarnation="true"/,"Angelus lost the exact Incarnation focus marker");
assert.match(runtime,/TODO\(ANGELUS_POSTURE_SATURDAY_VESPERS\)/,"Angelus Saturday-Vespers posture blocker lost its explicit TODO");
const angelusPostureSource=runtime.match(/function selectedSunday\(\)[\s\S]*?function semanticRailChip/)?.[0]||"";
assert.doesNotMatch(angelusPostureSource,/getHours|getMinutes|18:00|6\s*PM/i,"Angelus Saturday-Vespers posture must not use a crude civil-clock heuristic");
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
assert.match(runtime,/TRADITIONAL PRAYERS OF THE ST ALPHONSUS METHOD/,"Stations lost the traditional-method status of the vocal prayers");
assert.match(runtime,/the Way of the Cross itself is centered on prayerfully visiting the stations and meditating on the Passion/,"Stations again presents the vocal prayers as constitutive requirements");
assert.match(runtime,/'pray\.de_profundis':\{id:'pray\.de_profundis',type:'prayer'/,"Direct De profundis route is not owned by PRAY");
assert.match(runtime,/'pray\.eternal_rest':\{id:'pray\.eternal_rest',type:'prayer'/,"Direct Requiem aeternam route is not owned by PRAY");
assert.match(runtime,/ADOR\.mode==='visit'&&ADOR\.visitStep===0/,"Adoration arrival cue lost exact visit-entry ownership");
assert.match(runtime,/ao-live-genuflect/,"Adoration arrival lost the donor genuflection cue");
assert.match(runtime,/Remain present/,"Adoration recollection rail lost its persistent silence state");
assert.match(runtime,/const stage=BEN_STAGES\?\.\[BEN\.step\]\?\.\[0\]/,"Benediction rails stopped following the public-rite stage");
assert.match(runtime,/blessing:\['ao-live-blessing'/,"Benediction blessing stage lost the canonical blessing cue");
assert.match(runtime,/prayer:\['ao-live-response'/,"Benediction versicle\/collect stage lost the response cue");
assert.match(runtime,/praises:\['ao-live-response'/,"Benediction Divine Praises stage lost the response cue");
assert.match(runtime,/data-p435930-handoff="pray\.sacred_heart"/,"First Friday no longer hands off to the Sacred Heart treasury");
assert.match(runtime,/Private Litany of the Saints/,"Forty Hours private Litany is no longer distinguished from the public ceremonial form");
assert.match(runtime,/Psalm 69 \(Deus, in adiutorium\)/,"Forty Hours lost the historical public Psalm 69 cue");
assert.match(runtime,/proper Forty Hours prayers/,"Forty Hours lost the historical proper-prayers cue");
assert.match(runtime,/follow the book and clergy actually being used in the church/,"Forty Hours no longer gives actual public ceremonial priority");
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
assert.match(styles,/data-ao-rosary-active-root="true"[^\n]*\.lab-recitation-mode[\s\S]*display:none!important/,"Active Rosary root can expose the legacy recitation surface during shell rebuilds");
assert.match(runtime,/api\.setStep\(target\)!==false\)\{decorateRosary\(\);setTimeout\(decorateRosary,0\)\}/,"Rosary canonical Next\/Previous no longer redecorates synchronously at the step boundary");
assert.match(styles,/data-ao-rosary-exact-donor="v3\.4\.14"[^\n]*\.lab-recitation-mode[\s\S]*display:none!important/,"Rosary still exposes duplicate native recitation controls");
assert.match(styles,/width:min\(820px,100%\)!important/,"PRAY shell diverged from the integrated v3.4.10 820px composition");
assert.match(styles,/data-ao-rosary-active-root="true"[^\n]*pbShell\[data-ao-rosary-exact-donor="v3\.4\.14"\][^\{]*\{[^\}]*max-width:760px!important[^\}]*box-sizing:border-box!important/,"Active Rosary shell lost the v3.4.10 760px composition measure");
assert.match(styles,/aoP435930ModuleGrid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,"PRAY wide hub lost the v3.4.10 two-column module grid");
assert.match(styles,/@media\(max-width:560px\)\{#aoPray435930 \.aoP435930ModuleGrid\{grid-template-columns:1fr\}/,"PRAY phone hub lost the v3.4.10 single-column collapse");
assert.match(runtime,/shell\?\.classList\?\.remove\('aoRosaryRitualGrid'\)/,"Rosary no longer removes the two-column ritual-grid class that collapsed prayer text");
assert.match(runtime,/aoRosaryLayout='single-column'/,"Rosary single-column reader ownership stamp is absent");
assert.match(runtime,/function declutterRosaryDonor\(r\)/,"Rosary duplicate-control cleanup owner is absent");
assert.match(runtime,/\['guide','preferences','préférences'\]/,"Rosary no longer suppresses redundant Guide / Preferences controls");
assert.match(runtime,/\.lab-view-head \.aoModuleHome,\.lab-view-head \.lab-lang/,"Rosary no longer suppresses redundant Home / language header chrome");
assert.match(runtime,/function setRosaryPrayerLanguage\(host,face='vernacular'\)/,"Rosary translation owner is absent");
assert.match(runtime,/function toggleRosaryPrayerLanguage\(host\)/,"Rosary tap-to-replace toggle owner is absent");
assert.match(runtime,/toggleRosaryPrayerLanguage\(flip\)/,"Rosary preserved-player click path no longer owns translation toggling");
assert.match(runtime,/e\.key==='Enter'\|\|e\.key===' '/,"Rosary translation is no longer keyboard operable");
assert.match(runtime,/setRosaryPrayerLanguage\(host,'vernacular'\)/,"Rosary no longer defaults prayer text to the vernacular face");
assert.match(runtime,/function rosarySetHeading\(set\)/,"Rosary set-heading owner is absent");
assert.match(runtime,/headerTitle&&setHeading\)headerTitle\.textContent=setHeading/,"Rosary live header still repeats the active mystery title");
assert.match(runtime,/\.lab-option-bar \.lab-step-count/,"Rosary no longer suppresses redundant helper copy");
assert.match(runtime,/\.lab-contemplation \.kicker/,"Rosary no longer suppresses duplicate mystery progress text");
assert.match(runtime,/\.lab-prayer-count/,"Rosary no longer suppresses duplicate Hail Mary count text");
assert.match(runtime,/prayerRubric&&info\?\.step\?\.phase!=='opening'/,"Rosary no longer suppresses repeated set-name prayer rubrics");
assert.match(runtime,/beadStage&&info\?\.step\?\.kind==='mystery'/,"Rosary no longer defers empty decade beads until prayer begins");
assert.doesNotMatch(runtime,/decorateRosaryExact\(r\)[\s\S]{0,2200}ensureRosaryDonorOverview\(r,info\)/,"Rosary exact decorator still injects permanent Overview chrome");
assert.match(runtime,/aoRosaryExactDonor='v3\.4\.14'/,"Rosary exact donor ownership stamp changed");
assert.match(runtime,/function rosaryDonorProgress\(info\)/,"Rosary legacy progress projection helper disappeared unexpectedly");
assert.doesNotMatch(runtime,/decorateRosaryExact\(r\)[\s\S]{0,1400}ensureRosaryDonorProgress\(r,info\)/,"Rosary exact decorator still injects a duplicate five-segment progress bar");
assert.match(runtime,/querySelectorAll\('\.rosary-decade-bar-v15\[data-ao-exact-donor-progress\]'\)\.forEach\(node=>node\.remove\(\)\)/,"Rosary does not actively remove stale injected progress surfaces");
assert.match(runtime,/function ensureRosaryDonorRecitation\(r\)/,"Rosary lost donor head recitation control");
assert.match(runtime,/r29-head-recitation/,"Rosary lost Individual\/Group head control");
assert.match(runtime,/function rosaryDonorArt\(r,info\)/,"Rosary lost donor mystery-art backdrop projection");
assert.match(runtime,/r24-has-mystery-art/,"Rosary lost donor mystery-art state");
assert.match(runtime,/function rosaryDonorMysteryFx\(r,info\)/,"Rosary lost donor mystery-entry cinematic owner");
assert.match(runtime,/info\?\.step\?\.kind!==['"]mystery['"]/,"Rosary mystery cinematic is no longer restricted to mystery-entry boundaries");
assert.match(runtime,/AO_CINEMATIC_V4312\|\|window\.AO_CINEMATIC_V4311/,"Rosary mystery cinematic no longer reuses the certified cinematic owner");
assert.match(runtime,/isReducedMotion\?\.\(\)/,"Rosary mystery cinematic no longer honors reduced motion");
assert.match(styles,/ROSARY_EXACT_DONOR_CSS/,"Rosary exact donor style block is absent");
assert.match(styles,/ROSARY_DECLUTTER_CSS/,"Rosary declutter style owner is absent");
assert.match(styles,/grid-template-columns:none!important/,"Rosary single-column style guard is absent");
assert.match(styles,/\.lab-prayer-flip\[data-pb-flip\]\{[\s\S]*display:block!important;[\s\S]*width:100%!important;[\s\S]*writing-mode:horizontal-tb!important/,"Rosary prayer flip lost its horizontal full-width text guard");
assert.match(styles,/\.lab-prayer-flip \.aoPrayerProse,[\s\S]*\.lab-prayer-flip \.aoCustomarySplit,[\s\S]*\.lab-prayer-flip \.aoPrayerDialogueLine/,"Rosary lost the late donor descendant-width guard");
assert.match(styles,/aoRecitationGroup \.aoCustomaryLeader,[\s\S]*aoRecitationGroup \.aoCustomaryResponse[\s\S]*display:block!important;[\s\S]*grid-template-columns:none!important;[\s\S]*width:100%!important/,"Rosary lost the v43.33 Group common-prayer grid-collapse repair");
assert.match(styles,/aoRecitationGroup \.lab-prayer-flip \.aoPrayerDialogueLine,[\s\S]*grid-template-columns:max-content minmax\(0,1fr\)!important/,"Rosary Group dialogue owner can regress to the historical 1.55rem first track");
assert.match(styles,/aoRecitationGroup \.lab-prayer-flip \.aoPrayerDialogueLine>\.aoPrayerDialogueBody,[\s\S]*grid-column:2!important;[\s\S]*width:100%!important/,"Rosary Group dialogue body lost explicit full reading-column ownership");
assert.match(styles,/aoRecitationGroup \.lab-prayer-flip \.aoPrayerDialogueLine>\.aoPrayerWords,[\s\S]*grid-column:2!important;[\s\S]*width:100%!important/,"Rosary Group prayer words lost explicit full reading-column ownership");
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

const prayRuntimeSource=readFileSync("src/pray/presentation-runtime.js","utf8");
for(const text of ["One Eucharistic family","5–15 MIN","OPEN-ENDED","Holy Hour","Four Ends","Traditional prayers for adoration and Benediction"]){
  assert.ok(prayRuntimeSource.includes(text),"final Adoration donor landing lost: "+text);
}
assert.doesNotMatch(prayRuntimeSource,/data-p435930-go-ben><small>\$\{esc\(L\('PUBLIC RITE'/,"Benediction must not replace Holy Hour/Four Ends on the final Adoration landing");
