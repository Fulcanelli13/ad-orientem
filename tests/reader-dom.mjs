import {
  buildReaderShellMarkup,
  createReaderDomAdapter,
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
dispatch("keydown",{key:"ArrowRight",target:{tagName:"BUTTON"},preventDefault(){}});
expect(nextCount===2,"keyboard card navigation was lost after Guide closed");
adapter.destroy();
expect(registered.get("click")?.size===0&&registered.get("keydown")?.size===0,
  "reader destroy leaked delegated root listeners");
adapter.mount(prepared);
expect(registered.get("click")?.size===1&&registered.get("keydown")?.size===1,
  "reader remount after destroy did not register one set of listeners");
adapter.destroy();

console.log("Reader DOM contract PASS: v1.80 Home/section/preferences ribbon, contextual glossary action, YOU/Guide/Priest state ribbon, semantic rails, Schola stream shell, and native mode switching.");
