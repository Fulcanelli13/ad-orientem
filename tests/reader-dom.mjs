import { buildReaderShellMarkup, createReaderDomAdapter, normalizeReaderMoment } from "../src/mass/reader-dom.js";

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
  'data-role="cinematic"',
  'data-reader-nav="previous"',
  'data-reader-nav="next"',
  'data-icon-slot="priest-action"',
  'class="ao-schola-dock"',
  'data-side="faithful"',
  'data-side="priest"',
  'data-role="guide-short"',
  'data-reader-home',
  'data-reader-parameters',
  'data-role="section-jump"',
  'data-role="section-menu"',
  'data-schola-resize',
  'data-schola-toggle'
]) expect(html.includes(token),"reader shell missing "+token);
expect(html.includes('data-ao-asset-id="ao-nav-home" data-ao-asset-renderer="mask"'),"reader Home control is not canonical-mask owned");
expect(html.includes('data-ao-asset-id="ao-nav-settings" data-ao-asset-renderer="mask"'),"reader Parameters control is not canonical-mask owned");
expect(html.includes("ao-nav-home.png"),"reader Home mask did not resolve to externalized PNG");
expect(html.includes("ao-nav-settings.png"),"reader Parameters mask did not resolve to externalized PNG");
expect(!html.includes("pending-externalization"),"reader top ribbon still advertises pending asset externalization");

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
  priestVoice:{label:"AUDIBLE"},
  schola:{label:"CREDO"},
  guide:{registryAvailable:false,text:"must not render"},
  paragraphs:[{id:"p1",primary:"Credo in unum Deum",secondary:"I believe in one God",active:true}]
});
expect(first.guide===null,"unsourced Guide rubric did not fail closed");
expect(first.gesture?.label==="BOW","transient gesture missing");
expect(first.posture?.label==="STAND","persistent posture missing");

const second=normalizeReaderMoment({
  id:"B",
  sectionTitle:"Credo",
  cardUpdate:false,
  sharedTextWithSchola:true,
},first);
expect(second.posture?.label==="STAND","persistent posture did not carry");
expect(second.priestPosition?.label==="CENTRE","persistent priest position did not carry");
expect(second.priestVoice?.label==="AUDIBLE","persistent priest voice did not carry");
expect(second.gesture===null,"transient gesture leaked into next moment");
expect(second.response===null,"transient response leaked into next moment");
expect(second.bell===null,"transient bell leaked into next moment");
expect(second.cinematic===null,"transient cinematic leaked into next moment");
expect(second.schola?.label==="CREDO","underlying Schola state did not persist");
expect(second.scholaVisible===false,"shared text did not suppress duplicate Schola lane");
expect(second.cardTitle==="Credo","action-only moment replaced the card title");
expect(second.paragraphs[0].primary==="Credo in unum Deum","action-only moment cleared the prayer card");

const third=normalizeReaderMoment({
  id:"C",
  guide:{registryAvailable:true,text:"Bow the head",detail:"At these words, bow the head."},
  schola:null,
  paragraphs:[]
},second);
expect(third.guide?.text==="Bow the head","verified Guide rubric was not retained");
expect(third.schola===null && third.scholaVisible===false,"explicit Schola silence did not clear state");

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

console.log("Reader DOM contract PASS: shell channels, top ribbon, section jump, Schola controls, persistent/transient ownership, Guide fail-closed, and parity mode lock.");
