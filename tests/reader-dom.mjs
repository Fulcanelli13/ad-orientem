import {
  buildReaderShellMarkup,
  createReaderDomAdapter,
  extractDonorRichMaskUri,
  createDonorRichMaskLoader,
  toggleReaderTranslation,
  syncReaderRitualHighlights,
  normalizeReaderMoment,
  SCHOLA_SPEEDS,
  DEFAULT_SCHOLA_SPEED,
  normalizeScholaSpeed,
  scholaTickerDuration,
} from "../src/mass/reader-dom.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const prepared={
  readerPreferences:{mode:"LIVE"},
  session:{resolvedMass:{
    presentationMode:"LIVE",
    actualCelebration:{title:"Holy Rosary"}
  }}
};

const html=buildReaderShellMarkup(prepared);
for(const token of [
  'data-reader-mode="MISSAL"',
  'data-reader-mode="SIMPLE"',
  'data-reader-mode="LIVE"',
  'data-role="priest-position"',
  'data-role="section-title"',
  'data-role="guide-button"',
  'data-channel="posture"',
  'data-channel="posture-change"',
  'data-channel="attention"',
  'data-icon-slot="attention"',
  'data-icon-slot="posture-change"',
  'data-channel="gesture"',
  'data-channel="response"',
  'data-channel="priest-voice"',
  'data-channel="bell"',
  'data-channel="schola"',
  'data-channel="schola-shared"',
  'data-role="cinematic"',
  'data-reader-nav="previous"',
  'data-reader-nav="next"',
  'data-icon-slot="priest-position"',
  'class="ao-schola-dock"',
  'data-side="faithful"',
  'data-side="priest"',
  'data-role="guide-short"',
  'data-reader-home',
  'data-reader-preferences',
  'data-reader-parameters',
  'data-reader-glossary',
  'data-role="section-jump"',
  'data-role="section-menu"',
  'data-schola-resize',
  'data-schola-toggle',
  'data-schola-slower',
  'data-role="schola-speed"',
  'data-schola-faster',
  'data-schola-pause'
]) expect(html.includes(token),"reader shell missing "+token);
expect(html.includes('data-ao-donor-icon="home"'),"reader Home control lost exact v1.80 donor ownership");
expect(html.includes("M3.5 10.7 12 3.8l8.5 6.9v9.1h-5.4v-5.7H8.9v5.7H3.5z"),"reader Home glyph drifted from v1.80 donor");
expect(html.includes('data-ao-donor-icon="preferences"'),"reader Mass-preferences control lost exact v1.80 donor ownership");
expect(html.includes("M4 7h10M18 7h2M4 17h2M10 17h10M4 12h5M13 12h7"),"reader Mass-preferences glyph drifted from v1.80 donor");
expect(!html.includes("pending-externalization"),"reader top ribbon still advertises pending asset externalization");
expect(html.includes(".ao-reader-stage{min-height:0;position:relative"),"reader stage lost donor-derived geometry");
expect(html.includes(".ao-rail{\n  position:absolute"),"ritual rails are no longer overlay surfaces");
expect(html.includes("padding:clamp(28px,4.5vh,48px) max(18px,calc((100% - 790px)/2))"),"centre reader lost donor 790px reading measure");
expect(html.includes("border:0;border-radius:0;background:transparent;box-shadow:none"),"giant card chrome returned to the Mass reader");
expect(html.includes(".ao-reader-body")===false,"unexpected duplicate reader body presentation layer appeared");
expect(html.includes("opacity:.43"),"donor desktop focus baseline no longer matches the final executable donor");
expect(html.includes("opacity:.84"),"donor forward near-focus level no longer matches the final executable donor");
expect(html.includes("opacity:.67"),"donor backward near-focus level no longer matches the final executable donor");
expect(html.includes(".ao-state-kicker{font:700 7px/1"),"YOU / PRIEST state labels lost v1.79-v1.80 typography");
expect(html.includes('class="ao-guide-copy"><small>GUIDE</small>'),"GUIDE centre cell is missing from the state ribbon");
expect(html.includes('[data-channel="gesture"][data-active="false"]'),"inactive gesture rail no longer disappears like the final donor");
expect(html.includes('[data-channel="posture-change"][data-active="false"]'),
  "duplicate posture-change icon does not disappear when inactive");
expect(html.includes('[data-channel="attention"][data-active="false"]'),
  "inactive LISTEN cue incorrectly occupies a persistent rail slot");

expect(JSON.stringify([...SCHOLA_SPEEDS])===JSON.stringify([0.25,0.35,0.45,0.60,0.80,1]),"v1.80 Schola speed ladder changed");
expect(DEFAULT_SCHOLA_SPEED===0.45,"v1.80 Schola default speed changed");
expect(normalizeScholaSpeed(0.60)===0.60,"valid donor Schola speed was rejected");
expect(normalizeScholaSpeed(0.50)===0.45,"unknown Schola speed did not fail to donor default");
const donorDuration=scholaTickerDuration({viewportWidth:260,lineWidth:420,speed:0.45,isMobile:true});
expect(donorDuration>=15000&&donorDuration<=120000,"Schola ticker duration escaped donor bounds");

const first=normalizeReaderMoment({
  id:"A",
  sectionTitle:"Credo",
  cardTitle:"Credo",
  posture:{label:"STAND"},
  gesture:{label:"BOW"},
  response:{label:"Et incarnatus est"},
  bell:{label:"ELEVATION BELL",detail:"Sacred Host"},
  cinematic:{kind:"ELEVATION",title:"ELEVATION",subtitle:"SACRED HOST"},
  priestPosition:{label:"CENTRE"},
  priestAction:{label:"ELEVATES HOST"},
  priestVoice:{label:"AUDIBLE"},
  schola:{label:"CREDO"},
  guide:{registryAvailable:false,text:"must not render"},
  paragraphs:[{id:"p1",primary:"Credo in unum Deum",secondary:"I believe in one God",active:true}]
});
expect(first.guide===null,"unsourced Guide rubric did not fail closed");
expect(first.gesture?.label==="BOW","transient gesture missing");
expect(first.posture?.label==="STAND","persistent posture missing");
expect(first.priestAction?.label==="ELEVATES HOST","priest action did not reach the v1.80 transient action channel");

const second=normalizeReaderMoment({
  id:"B",
  sectionTitle:"Credo",
  cardUpdate:false,
  sharedTextWithSchola:true,
},first);
expect(second.posture?.label==="STAND","persistent posture did not carry");
expect(second.priestPosition?.label==="CENTRE","persistent priest position did not carry");
expect(second.priestVoice?.label==="AUDIBLE","persistent priest voice did not carry");
expect(second.priestAction===null,"transient priest action leaked into the next moment");
expect(second.gesture===null,"transient gesture leaked into next moment");
expect(second.response===null,"transient response leaked into next moment");
expect(second.bell===null,"transient bell leaked into next moment");
expect(second.cinematic===null,"transient cinematic leaked into next moment");
expect(second.schola?.label==="CREDO","underlying Schola state did not persist");
expect(second.scholaShared===true,"shared Schola text did not acquire the v1.76 rail owner");
expect(second.scholaVisible===false,"shared text did not suppress duplicate Schola dock");
expect(second.cardTitle==="Credo","action-only moment replaced the card title");
expect(second.paragraphs[0].primary==="Credo in unum Deum","action-only moment cleared the prayer card");

const third=normalizeReaderMoment({
  id:"C",
  guide:{registryAvailable:true,text:"Bow the head",detail:"At these words, bow the head."},
  schola:null,
  paragraphs:[]
},second);
expect(third.guide?.text==="Bow the head","verified Guide rubric was not retained");
expect(third.schola===null && third.scholaVisible===false && third.scholaShared===false,"explicit Schola silence did not clear state");

const translated=normalizeReaderMoment({
  id:"D",
  paragraphs:[{kind:"TEXT",primary:"I believe",alternate:"Credo",replaceOnToggle:true}]
},third);
expect(translated.paragraphs[0].alternate==="Credo","Latin alternate text was lost");
expect(translated.paragraphs[0].replaceOnToggle===true,"replace-on-toggle flag was lost");

const consecration=normalizeReaderMoment({
  id:"CNS",
  sectionTitle:"Consecration of the Sacred Host",
  cardTitle:"Consecration of the Sacred Host",
  paragraphs:[
    {id:"c1",kind:"TEXT",primary:"Who, the day before he suffered",alternate:"Qui, prídie quam paterétur",replaceOnToggle:true},
    {id:"c2",kind:"TEXT",primary:"FOR THIS IS MY BODY.",alternate:"Hoc est enim Corpus meum.",replaceOnToggle:true},
    {id:"c3",kind:"TEXT",primary:"[Genuflects — elevates the Sacred Host — replaces It — genuflects]"},
  ]
},translated);
expect(consecration.paragraphs[0].primary==="Qui, prídie quam paterétur","Consecration did not become Latin-prominent");
expect(consecration.paragraphs[0].secondary==="Who, the day before he suffered","Consecration lost vernacular support under Latin");
expect(consecration.paragraphs[0].replaceOnToggle===false,"Consecration still uses ordinary replace-on-toggle behavior");
expect(consecration.paragraphs[1].kind==="CONSECRATION_WORDS","Words of Consecration lost salience semantic");
expect(consecration.paragraphs[2].kind==="RUBRIC","Elevation action still renders as ordinary prayer prose");

const fakeRoot={
  innerHTML:"",
  querySelector(){return null;},
  querySelectorAll(){return [];},
  addEventListener(){},
};
const locked=createReaderDomAdapter({root:fakeRoot,allowPresentationModeSwitch:false});
locked.mount(prepared);
expect(locked.getMode()==="LIVE","locked adapter changed initial mode");
expect(locked.canSwitchPresentationMode()===false,"native parity lock was not exposed");
locked.setMode("MISSAL");
expect(locked.getMode()==="LIVE","locked reader accepted cosmetic mode switch before v1.83 parity");

let callbackMode=null;
const unlocked=createReaderDomAdapter({
  root:fakeRoot,
  allowPresentationModeSwitch:true,
  onPresentationModeChange:mode=>{callbackMode=mode;},
});
unlocked.mount(prepared);
expect(unlocked.canSwitchPresentationMode()===true,"unlocked reader did not expose mode switching");
unlocked.setMode("SIMPLE");
expect(unlocked.getMode()==="SIMPLE","unlocked reader did not change mode");
expect(callbackMode==="SIMPLE","unlocked reader did not invoke presentation mode callback");

import {readFileSync} from "node:fs";
const readerDomSource=readFileSync("src/mass/reader-dom.js","utf8");
expect(readerDomSource.includes("if(pop && current.cardUpdate)"),
  "Guide popover is still dismissed by transient in-card updates");

// The DOM adapter can be remounted against the same long-lived root. A second
// mount must not double the delegated click and keyboard commands.
const registered=new Map();
const guidePopover={hidden:true};
const rootWithListeners={
  innerHTML:"",dataset:{},
  ownerDocument:{defaultView:{}},
  querySelector(selector){
    if(selector==='[data-role="guide-popover"]')return guidePopover;
    return null;
  },
  querySelectorAll(){return [];},
  addEventListener(type,handler){
    if(!registered.has(type))registered.set(type,new Set());
    registered.get(type).add(handler);
  },
  removeEventListener(type,handler){registered.get(type)?.delete(handler);},
};
let nextCount=0;
const adapter=createReaderDomAdapter({
  root:rootWithListeners,
  onNext:()=>{nextCount++;return null;},
  allowPresentationModeSwitch:true,
});
adapter.mount(prepared);
adapter.mount(prepared);
expect(registered.get("click")?.size===1,"reader remount duplicated root click handlers");
expect(registered.get("keydown")?.size===1,"reader remount duplicated root keyboard handlers");
const navNode={dataset:{readerNav:"next"}};
const navTarget={tagName:"BUTTON",closest(selector){return selector==="[data-reader-nav]"?navNode:null;}};
const dispatch=(type,event)=>{for(const handler of registered.get(type)??[])handler(event);};
dispatch("click",{target:navTarget});
expect(nextCount===1,"single navigation click moved two Mass cards after remount");
guidePopover.hidden=false;
dispatch("keydown",{key:"ArrowRight",target:{tagName:"BUTTON"},preventDefault(){}});
expect(nextCount===1,"keyboard advanced Mass beneath an open Guide");
guidePopover.hidden=true;
dispatch("keydown",{key:"ArrowRight",target:{tagName:"ARTICLE"},preventDefault(){}});
expect(nextCount===2,"keyboard card navigation was lost after Guide closed");
adapter.destroy();
expect(registered.get("click")?.size===0&&registered.get("keydown")?.size===0,
  "reader destroy leaked delegated root listeners");
adapter.mount(prepared);
expect(registered.get("click")?.size===1&&registered.get("keydown")?.size===1,
  "reader remount after destroy did not register one set of listeners");
adapter.destroy();


const translationSpan={textContent:"In principio",ownerDocument:{}};
const translationNode={
  dataset:{translateToggle:"true",primaryText:"In principio",altText:"Au commencement",showingAlt:"false"},
  attrs:{},
  querySelector(selector){return selector===".ao-line-primary"?translationSpan:null;},
  setAttribute(name,value){this.attrs[name]=value;},
};
expect(toggleReaderTranslation(translationNode),"translation did not activate");
expect(translationSpan.textContent==="Au commencement","alternate-language text did not render");
expect(translationNode.attrs["aria-pressed"]==="true","translation toggle state not announced");
expect(toggleReaderTranslation(translationNode),"translation did not reverse");
expect(translationSpan.textContent==="In principio","primary-language text was not restored");
expect(translationNode.attrs["aria-pressed"]==="false","translation toggle did not clear pressed state");
let switchCount=0;
const stableMode=createReaderDomAdapter({
  root:fakeRoot,
  allowPresentationModeSwitch:true,
  onPresentationModeChange:()=>{switchCount++;},
});
stableMode.mount(prepared);
stableMode.setMode("LIVE");
expect(switchCount===0,"re-selecting LIVE rebuilt the reader and displaced the active cue");
stableMode.setMode("SIMPLE");
stableMode.setMode("SIMPLE");
expect(switchCount===1,"re-selecting the active mode rebuilt the reader twice");
// Real production cue updates use cardUpdate:false. The rail may change
// without rebuilding the prayer paragraph; the exact active Latin words
// must follow the canonical cue, and all former anchors must disappear.
function fakeSpan(doc,initial=""){
  return {
    ownerDocument:doc,children:[],
    append(child){this.children.push(child);},
    replaceChildren(...items){this.children=[...items];},
    get textContent(){return this.children.map(x=>x.textContent??"").join("");},
    set textContent(value){this.children=[doc.createTextNode(value)];}
  };
}
const ritualDoc={
  createTextNode(text){return {textContent:String(text)};},
  createElement(){const node=fakeSpan(ritualDoc);node.className="";return node;}
};
function cueParagraph(cueId,plain){
  const primary=fakeSpan(ritualDoc);
  primary.textContent=plain;
  return {
    dataset:{cueId,active:"false"},
    hidden:false,
    primary,
    querySelector(q){return q===".ao-line-primary"?primary:null;}
  };
}
const adoramus=cueParagraph("AO.SM.C0056","Adoramus te, glorificamus te");
const holyName=cueParagraph("AO.SM.C0061","Iesu Christe, Fili Unigenite");
const credo=cueParagraph("AO.SM.C0096","Et incarnatus est de Spiritu Sancto et homo factus est");
const ritualRoot={
  querySelectorAll(selector){
    return selector===".ao-reader-paragraph[data-cue-id]"?[adoramus,holyName,credo]:[];
  }
};
adoramus.dataset.active="true";
expect(syncReaderRitualHighlights(ritualRoot,{canonicalCueId:"AO.SM.C0056",anchorLat:"Adorámus te"})===1,
  "accented canonical Adoramus did not match its unaccented actual Latin words");
expect(adoramus.primary.children.some(x=>x.className==="ao-ritual-trigger ao-ritual-trigger-live"),
  "canonical gesture did not add the Latin highlight span on an in-card state update");
const retainedNode=adoramus.primary.children.find(x=>x.className?.includes("ao-ritual-trigger"));
expect(syncReaderRitualHighlights(ritualRoot,{canonicalCueId:"AO.SM.C0056",anchorLat:"Adorámus te"})===1 &&
  adoramus.primary.children.includes(retainedNode),
  "same-cue projected state reconstructed an already focused prayer phrase");
adoramus.dataset.active="false";
holyName.dataset.active="true";
expect(syncReaderRitualHighlights(ritualRoot,{canonicalCueId:"AO.SM.C0061",anchorLat:"Jesu Christe"})===1,
  "Iesu/Jesu canonical spelling mismatch hid the bow cue");
expect(adoramus.primary.children.every(x=>!x.className?.includes("ao-ritual-trigger")) &&
  adoramus.primary.textContent==="Adoramus te, glorificamus te",
  "moving to a new cue left a highlight on previously active words");
expect(holyName.primary.children.some(x=>x.className?.includes("ao-ritual-trigger")),
  "the new cue did not receive the highlight");
// The actual source-first reader defaults to English. The same cue must
// highlight its verified English and pinned French counterpart without
// changing the selected language or broadening source cue ownership.
adoramus.dataset.active="true";
holyName.dataset.active="false";
adoramus.primary.textContent="We adore thee.";
expect(syncReaderRitualHighlights(ritualRoot,{
  canonicalCueId:"AO.SM.C0056",anchorLat:"Adorámus te",anchorEn:"We adore thee",anchorFr:"Nous vous adorons"
})===1 && adoramus.primary.children.some(x=>x.className?.includes("ao-ritual-trigger")),
  "English Gloria cue is active but its equivalent displayed words are not highlighted");
adoramus.dataset.ritualCueActive="false";
adoramus.primary.textContent="Nous vous adorons.";
expect(syncReaderRitualHighlights(ritualRoot,{
  canonicalCueId:"AO.SM.C0056",anchorLat:"Adorámus te",anchorEn:"We adore thee",anchorFr:"Nous vous adorons"
})===1 && adoramus.primary.children.some(x=>x.className?.includes("ao-ritual-trigger")),
  "pinned French Gloria words were not highlighted at the same source cue");
adoramus.dataset.active="false";
holyName.dataset.active="false";
credo.dataset.active="true";
expect(syncReaderRitualHighlights(ritualRoot,{
  canonicalCueId:"AO.SM.C0096",anchorLat:"Et incarnátus est … et homo factus est"
})===1,
  "the two separated Incarnatus fragments did not highlight together");
expect(credo.primary.children.filter(x=>x.className?.includes("ao-ritual-trigger")).length===2,
  "Incarnatus first and last source phrases were not both highlighted");
// A two-part English canonical cue highlights only its two sourced clauses.
credo.dataset.ritualCueActive="false";
credo.primary.textContent="And was incarnate by the Holy Ghost of the Virgin Mary: and was made man.";
expect(syncReaderRitualHighlights(ritualRoot,{
  canonicalCueId:"AO.SM.C0096",anchorLat:"Et incarnátus est … et homo factus est",
  anchorEn:"And was incarnate … and was made man"
})===1 && credo.primary.children.filter(x=>x.className?.includes("ao-ritual-trigger")).length===2,
  "English Incarnatus source boundaries do not yield both highlighted phrases");
credo.dataset.active="false";
expect(syncReaderRitualHighlights(ritualRoot,null)===0 &&
  credo.primary.children.every(x=>!x.className?.includes("ao-ritual-trigger")),
  "cue removal left ritual highlights behind");
credo.dataset.active="true";
credo.primary.textContent="And was incarnate by the Holy Ghost";
expect(syncReaderRitualHighlights(ritualRoot,{
  canonicalCueId:"AO.SM.C0096",anchorLat:"Et incarnátus est … et homo factus est"
})===0,"Latin cue matched unrelated vernacular words");
expect(credo.primary.textContent==="And was incarnate by the Holy Ghost",
  "live cue highlighting changed the user's displayed translation");

const previousConsoleError=console.error;
console.error=()=>{};
try{
  const failedMode=createReaderDomAdapter({
    root:fakeRoot,
    allowPresentationModeSwitch:true,
    onPresentationModeChange:()=>{throw new Error("MODE_MODEL_UNAVAILABLE");},
  });
  failedMode.mount(prepared);
  failedMode.setMode("MISSAL");
  expect(failedMode.getMode()==="LIVE","failed mode switch left wrong mode highlighted");
  failedMode.destroy();
}finally{console.error=previousConsoleError;}

const translationTarget={
  tagName:"P",
  closest(selector){return selector==='[data-translate-toggle="true"]'?translationNode:null;},
};
adapter.mount(prepared);
let preventCount=0;
dispatch("keydown",{key:"Enter",target:translationTarget,preventDefault(){preventCount++;}});
expect(translationSpan.textContent==="Au commencement"&&preventCount===1,
  "Enter failed to activate the paragraph translation control");
dispatch("keydown",{key:" ",target:translationTarget,preventDefault(){preventCount++;}});
expect(translationSpan.textContent==="In principio"&&preventCount===2,
  "Space failed to activate paragraph translation");
// Expandable source rubrics are genuine keyboard controls, not mouse-only prose.
const rubricAttrs={};
const rubricNode={
  dataset:{kind:"RUBRIC",rubricExpandable:"true",expanded:"false"},
  setAttribute(name,value){rubricAttrs[name]=value;},
};
const rubricTarget={
  tagName:"P",
  closest(selector){
    return selector==='.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]'
      ? rubricNode:null;
  },
};
dispatch("keydown",{key:"Enter",target:rubricTarget,preventDefault(){}});
expect(rubricNode.dataset.expanded==="true"&&rubricAttrs["aria-expanded"]==="true",
  "Enter failed to expand an accessible source rubric");
dispatch("keydown",{key:" ",target:rubricTarget,preventDefault(){}});
expect(rubricNode.dataset.expanded==="false"&&rubricAttrs["aria-expanded"]==="false",
  "Space failed to collapse an accessible source rubric");
dispatch("click",{target:rubricTarget});
expect(rubricNode.dataset.expanded==="true"&&rubricAttrs["aria-expanded"]==="true",
  "pointer activation did not update the rubric's accessible expanded state");
adapter.destroy();
expect(html.includes('data-schola-translate title="Tap to translate" role="button" tabindex="-1"'),
  "Schola translation remained a mouse-only div");

// A real animation can be paused while its speed is changed: tempo changes
// must adjust playback rate without restarting the words at the beginning.
const listeners=new Map(),queue=[];
const scholaAnim={
  playbackRate:1,currentTime:6000,
  effect:{getTiming:()=>({duration:40000})},
  pause(){this.paused=true;},play(){this.paused=false;},
  cancel(){this.cancelled=true;},
};
let animationsStarted=0;
const dock={dataset:{active:"true"},style:{setProperty(){}}};
const line={scrollWidth:650,style:{},animate(){animationsStarted++;return scholaAnim;}};
const viewport={clientWidth:280};
const pauseBtn={setAttribute(){},textContent:""};
const speedReadout={textContent:""};
const scrollTrack={style:{}};
const fakeNodes=new Map([
  [".ao-schola-dock",dock],['[data-channel="schola"]',dock],
  ['[data-role="schola"]',line],[".ao-schola-main",viewport],
  ['[data-role="schola-progress"]',scrollTrack],
  ['[data-role="schola-speed"]',speedReadout],['[data-schola-pause]',pauseBtn],
]);
const scholaRoot={
  innerHTML:"",dataset:{},ownerDocument:{defaultView:{
    innerWidth:400,
    requestAnimationFrame(fn){queue.push(fn);return queue.length;},
    cancelAnimationFrame(){},
    localStorage:{getItem:()=>null,setItem(){}},
  }},
  querySelector(selector){return fakeNodes.get(selector)??null;},
  querySelectorAll(){return [];},
  addEventListener(type,fn){listeners.set(type,fn);},
  removeEventListener(type,fn){if(listeners.get(type)===fn)listeners.delete(type);},
};
const scholaAdapter=createReaderDomAdapter({root:scholaRoot});
scholaAdapter.mount(prepared);
scholaAdapter.renderMoment({
  id:"SCHOLA",sectionTitle:"Credo",cardUpdate:false,
  schola:{label:"Credo",latin:"Credo",english:"I believe",trackId:"CREDO",segmentId:"s1",cueId:"c1",index:0,total:2,complete:false},
});
while(queue.length){const cb=queue.shift();cb();if(animationsStarted>0)break;}
expect(animationsStarted===1,"Schola initial animation failed to start");
listeners.get("click")({target:{closest(selector){return selector==='[data-schola-pause]'?{}:null;}}});
expect(scholaAnim.paused===true,"Schola did not pause before speed change");
const time=scholaAnim.currentTime;
listeners.get("click")({target:{closest(selector){return selector==='[data-schola-faster]'?{}:null;}}});
expect(scholaAnim.playbackRate>1,"changing Schola speed while paused did not retime existing animation");
expect(scholaAnim.currentTime===time,"Schola speed adjustment reset the current reading position");
expect(animationsStarted===1,"Schola speed adjustment unnecessarily restarted the current phrase");
scholaAdapter.destroy();

// Preserve donor baseline, then apply a legible, operable mobile-only layer.
expect(html.includes("Mobile readability/accessibility layer"),
  "mobile legibility layer disappeared from the reader");
expect(html.includes(".ao-mass-prefs-more{min-height:44px"),
  "Mass preferences actions reverted to small touch targets");
expect(html.includes(".ao-schola-control{min-height:44px"),
  "Schola tempo buttons reverted to undersized touch targets");
expect(html.includes(".ao-guide-short{display:none}"),
  "mobile GUIDE cell regained unreadable redundant microcopy");
expect(readerDomSource.includes('scholaCollapsed ? 44 : scholaHeight'),
  "collapsed Schola height and reader controls are out of sync");

expect(html.includes("Compact phones: keep the 48px transient cue rails"),
  "narrow-phone prayer-width and state-label improvements disappeared");
expect(html.includes(".ao-prayer-card{padding-left:0;padding-right:0}"),
  "320px reader regained redundant side insets");
expect(html.includes("-webkit-line-clamp:3;max-height:3.5em"),
  "compact state ribbon reverted to truncating longer priest/posture labels");

expect(html.includes("background:radial-gradient(circle at center,rgba(226,211,158,.075),rgba(3,7,5,0) 43%),#070b08"),
  "Elevation regressed to a transparent backdrop that overlays Source rubric text");
expect(html.includes("background:#111914;box-shadow:0 15px 46px"),
  "Schola dock reverted to showing moving prayers through its background");
expect(html.includes('content:"READ FULL RUBRIC"'),
  "rubric full-text action is no longer readable");
expect(readerDomSource.includes('node.setAttribute("aria-expanded","false")'),
  "expandable rubrics did not receive accessible collapsed semantics");

expect(html.includes("LIVE hierarchy: a persistent state gets one visual owner"),
  "LIVE one-state/one-surface hierarchy correction disappeared");
expect(html.includes('.ao-rail-left .ao-rail-item[data-channel="posture"]'),
  "persistent posture repeat suppression was removed");
expect(html.includes('.ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph{opacity:.86}'),
  "the post-focus near-line contrast hierarchy regressed");
expect(html.includes('opacity:.62'),
  "LIVE unfocused liturgical text reverted to unreadably dim donor presentation");
expect(html.includes('.ao-priest-action-badge{display:none}'),
  "LIVE action icon duplication was reintroduced");
expect(html.includes('content:"RUBRIC";display:block'),
  "non-LIVE source rubric differentiation was removed while decluttering LIVE");

// Restore the final donor's currentColor masking for rich PNG silhouettes.
// Check real frozen production wrappers rather than a fabricated SVG fixture.
const v46Manifest=JSON.parse(readFileSync(new URL("../assets/active/mass-v46/manifest.v1.json",import.meta.url),"utf8"));
const frozenRichAssets=v46Manifest.assets.filter(row=>row.key.endsWith("_rich"));
expect(v46Manifest.count===67 && frozenRichAssets.length>=20,
  "v1.80 master icon bank/alpha masters were unexpectedly reduced");
for(const {key} of frozenRichAssets){
  const svg=readFileSync(new URL("../assets/active/mass-v46/"+key+".svg",import.meta.url),"utf8");
  const png=extractDonorRichMaskUri(svg);
  expect(png?.startsWith("data:image/png;base64,iVBORw0KGgo"),
    key+" does not expose its exact alpha-bearing PNG for the v1.80 mask");
}
expect(extractDonorRichMaskUri('<svg><image href="https://untrusted.invalid/foo.png"/></svg>')===null,
  "rich-mask loader accepted an unrelated external image");
let richRequests=0;
const donorFixture=readFileSync(new URL("../assets/active/mass-v46/priest_elevate_host_rich.svg",import.meta.url),"utf8");
const loadRich=createDonorRichMaskLoader(async(_url,options)=>{
  richRequests++;
  expect(options?.credentials==="same-origin","rich donor art fetch lost local origin restriction");
  return {ok:true,text:async()=>donorFixture};
});
const pendingRich=loadRich("donor-host.svg");
expect(pendingRich===loadRich("donor-host.svg"),"duplicate cue renders refetched a rich master");
const unwrapped=await pendingRich.promise;
expect(richRequests===1 && unwrapped===pendingRich.value && unwrapped?.startsWith("data:image/png;base64,"),
  "v1.80 rich icon alpha was not extracted or cached");
const missingRich=createDonorRichMaskLoader(async()=>{throw new Error("offline")});
expect(await missingRich("unreachable.svg").promise===null,
  "offline rich master must permit visible SVG transport fallback");

console.log("Reader DOM contract PASS: v1.80 Home/section/preferences ribbon, contextual glossary action, YOU/Guide/Priest state ribbon, semantic rails, Schola stream shell, and native mode switching.");
