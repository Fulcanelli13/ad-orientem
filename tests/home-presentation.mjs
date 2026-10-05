import assert from "node:assert/strict";
import {
  HOME_PRESENTATION_VERSION,
  buildHomeViewModel,
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

const vm=buildHomeViewModel(base,{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.equal(vm.celebration,"Holy Rosary");
assert.equal(vm.dateLong,"07/10/2026");
assert.equal(vm.formularyLabel,"Formulary 2/2");
assert.equal(vm.commemorationLabel,"Commemorations · St Mark");
assert.equal(vm.gospelReference,"Luke 1:26");

const en=renderHomeToString(base,{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.match(en,new RegExp(`data-ao-home-presentation-owner="${HOME_PRESENTATION_VERSION}"`));
assert.match(en,/Holy Rosary/);
assert.match(en,/Mass in progress/);
assert.match(en,/data-formulary="1"/);
assert.match(en,/Around the Mass/);
assert.match(en,/Holy Gospel/);
assert.match(en,/Today’s Mass/);
assert.match(en,/Settings · preparation · thanksgiving/);
assert.doesNotMatch(en,/next migration stage/i,"Home still exposes migration-era placeholder copy");

const fr=renderHomeToString({...base,language:"fr"},{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.match(fr,/Saint Rosaire/);
assert.match(fr,/Autour de la Messe/);
assert.match(fr,/Saint Évangile/);
assert.match(fr,/Traduction du Propre incomplète/);
assert.match(fr,/Formulaire 2\/2/);
assert.match(fr,/Réglages · préparation · action de grâces/);
assert.doesNotMatch(fr,/étape suivante de la migration/i,"French Home still exposes migration-era placeholder copy");


const retiredSettings=renderHomeToString({
  ...base,
  homeSheet:"settings",
  settings:{massForm:"sung",followMode:"vox",textMode:"oriented",participationMode:"quiet",textScale:"normal",reducedMotion:false},
},{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.doesNotMatch(retiredSettings,/data-ao-home-settings=/,"Home still renders a second Settings surface");
assert.doesNotMatch(retiredSettings,/data-setting-form=/,"Home still owns Settings controls after extraction");

const more=renderHomeToString({...base,homeSheet:"more"},{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.match(more,/data-ao-settings-open/,"Home More launcher does not route to modular Settings");
assert.doesNotMatch(more,/data-home-open-settings/,"historical Home Settings launcher survived extraction");

const failed=renderHomeToString({
  ...base,
  resume:{available:false},
  resolution:{status:"failed",proper:{status:"idle"}},
},{AO_DISPLAY_DATE:()=> "07/10/2026"});
assert.match(failed,/Calendar unavailable/);
assert.doesNotMatch(failed,/Mass in progress/);

console.log("PASS modular Home base presentation");
