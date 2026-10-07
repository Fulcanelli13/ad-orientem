import assert from "node:assert/strict";
import {
  HOME_PRESENTATION_VERSION,
  buildHomeViewModel,
  readNativeMassResume,
  renderHomeToString,
} from "../src/home/presentation.js";

const proper={
  name:"Holy Rosary",
  nameFr:"Saint Rosaire",
  rank:"II class",
  gospel:{lat:"Sequéntia sancti Evangélii\nLuc 1:26\nAve, gratia plena.",en:"Continuation of the Holy Gospel\nLuke 1:26\nHail, full of grace.",fr:"Suite du saint Évangile\nLuc 1:26\nJe vous salue, pleine de grâce."},
  introit:{lat:"Gaudeamus",en:"Let us rejoice",fr:"Réjouissons-nous"},
  collects:[{lat:"Deus",en:"O God",fr:"Ô Dieu"}],
  epistle:{lat:"Lectio",en:"Lesson",fr:"Lecture"},
  offertory:{lat:"In me",en:"In me",fr:"En moi"},
  communion:{lat:"Florete",en:"Flourish",fr:"Fleurissez"},
  languageCoverage:{
    en:{complete:true,available:6,expected:6,missing:[]},
    fr:{complete:false,available:5,expected:6,missing:["Communion"]},
  },
};
const base={
  route:"home",
  selectedDate:"2026-10-07",
  language:"en",
  resolving:false,
  lastAction:null,
  homeSheet:null,
  resume:{available:true,date:"2026-10-07",stepIndex:4},
  resolution:{
    status:"ready",
    colourPlan:{label:"White"},
    day:{
      main:{title:"Our Lady of the Rosary",rank:2,color:"White"},
      formularyIndex:1,
      massOptions:[{index:0,label:"Calendar Mass"},{index:1,label:"Holy Rosary"}],
      commemorations:[{title:"St Mark"}],
    },
    proper:{status:"ready",data:proper},
  },
};

const r17ResumeRecord={
  schema:"ao-mass-entry-bootstrap-v1",
  state:"suspended",
  session:{resolvedMass:{date:"2026-10-07"}},
  readerPreferences:{mode:"LIVE"},
  readerPosition:{sectionId:"AO.CARD.005",sequence:5},
};
const r17Win={
  AO_DISPLAY_DATE:()=> "07/10/2026",
  localStorage:{
    getItem(key){return key==="ao-r17-active-mass-v1"?JSON.stringify(r17ResumeRecord):null;},
  },
};
const nativeResume=readNativeMassResume(r17Win);
assert.equal(nativeResume?.source,"R17_NATIVE");
assert.equal(nativeResume?.stepNumber,5);
assert.equal(nativeResume?.sectionId,"AO.CARD.005");

const vm=buildHomeViewModel(base,{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.equal(vm.celebration,"Holy Rosary");
assert.equal(vm.dateLong,"07/10/2026");
assert.equal(vm.formularyLabel,"Formulary 2/2");
assert.equal(vm.commemorationLabel,"Commemorations · St Mark");
assert.equal(vm.gospelReference,"Luke 1:26");

const en=renderHomeToString(base,r17Win);
assert.match(en,new RegExp(`data-ao-home-presentation-owner="${HOME_PRESENTATION_VERSION}"`));
assert.match(en,/Holy Rosary/);
assert.match(en,/Mass in progress/);
assert.match(en,/data-ao-resume-owner="R17_NATIVE"/,"Home Resume is not owned by native R17 persistence");
assert.match(en,/07\/10\/2026 · 5/,"Home Resume lost native checkpoint date/position");
assert.match(en,/data-formulary="1"/);
assert.match(en,/Around the Mass/);
assert.match(en,/data-home-mass-entry/,"Home Follow Mass is not owned by modular app navigation");
assert.doesNotMatch(en,/data-action="follow"/,"Home Follow Mass still depends on the historical Home click controller");
assert.match(en,/Holy Gospel/);
assert.doesNotMatch(en,/data-action="today-mass"/,"duplicate Today’s Mass Home card returned");
assert.match(en,/data-home-find/,"Home does not expose the Explore entry");
assert.match(en,/Traditional Masses, shrines, customs and pilgrimages/,"Home Explore card lost cross-domain explanation");
assert.match(en,/data-home-settings/,"Home header lost the utility Settings entry");
assert.match(en,/data-ao-asset-id="ao-ui-settings"/,"Home Settings entry is not using the canonical utility asset");
assert.doesNotMatch(en,/class="languageSwitch"/,"Home still owns a duplicate language selector");
assert.doesNotMatch(en,/class="contentCard moreCard"/,"Home More junk drawer returned");
assert.doesNotMatch(en,/data-action="more"/,"Home still exposes the retired More action");
assert.doesNotMatch(en,/class="contentCard massCard"/,"duplicate Today’s Mass card returned");
assert.doesNotMatch(en,/next migration stage/i,"Home still exposes migration-era placeholder copy");

const fr=renderHomeToString({...base,language:"fr"},r17Win);
assert.match(fr,/Saint Rosaire/);
assert.match(fr,/Autour de la Messe/);
assert.match(fr,/Saint Évangile/);
assert.match(fr,/EXPLORER/,"French Home does not expose the Explore entry");
assert.match(fr,/Traduction du Propre incomplète/);
assert.match(fr,/Formulaire 2\/2/);
assert.match(fr,/data-home-settings/);
assert.doesNotMatch(fr,/class="languageSwitch"/);
assert.doesNotMatch(fr,/class="contentCard moreCard"/);
assert.doesNotMatch(fr,/étape suivante de la migration/i,"French Home still exposes migration-era placeholder copy");


const historicalOnly=renderHomeToString(base,{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.doesNotMatch(historicalOnly,/data-resume-mass/,"historical state.resume regained production Resume ownership");

const retiredSettings=renderHomeToString({
  ...base,
  homeSheet:"settings",
  settings:{massForm:"sung",followMode:"vox",textMode:"oriented",participationMode:"quiet",textScale:"normal",reducedMotion:false},
},{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.doesNotMatch(retiredSettings,/data-ao-home-settings=/,"Home still renders a second Settings surface");
assert.doesNotMatch(retiredSettings,/data-setting-form=/,"Home still owns Settings controls after extraction");

const failed=renderHomeToString({
  ...base,
  resume:{available:false},
  resolution:{status:"failed",proper:{status:"idle"}},
},{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.match(failed,/Calendar unavailable/);
assert.doesNotMatch(failed,/Mass in progress/);

console.log("PASS modular Home base presentation");
