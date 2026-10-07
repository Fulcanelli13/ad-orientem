import assert from "node:assert/strict";
import { getCanonicalAsset } from "../src/assets/asset-registry.js";
import {
  HOME_ENRICHERS_VERSION,
  HOME_ENRICHER_ICON_ASSET_IDS,
  buildHomeEnrichers,
  renderHomeEnrichersToString,
} from "../src/home/enrichers.js";

const now=new Date(2026,9,5,7,30,0);
const today="2026-10-05";
const state={
  route:"home",
  language:"en",
  selectedDate:today,
};
const local={
  version:1,
  sessions:{
    [today]:{
      ids:[1,2,3,4,5,6,7,8,9,10],
      outcomes:{1:"knew",2:"review"},
      completedAt:null,
    },
  },
  history:{
    1:{seen:1,due:"2026-10-07"},
    2:{seen:1,due:"2026-10-05"},
  },
  completionDates:[],
};
const win={
  localStorage:{
    getItem(key){return key==="ao_daily_catechism_v1"?JSON.stringify(local):null;},
  },
  AO_RULE_V411:{
    load(){return {completion:{dynamic:{},static:{rosary:false}}};},
    activeDynamic(){return null;},
    liturgicalContext(){return {isEastertide:false,isLent:false};},
    staticItems(){return [{id:"rosary",en:"Rosary",fr:"Rosaire"}];},
  },
  document:{
    getElementById(id){
      return ["ao-rich-angelus","ao-rich-rosary","ao-refined-calendar-upcoming"].includes(id)?{id}:null;
    },
  },
};

for(const assetId of Object.values(HOME_ENRICHER_ICON_ASSET_IDS)){
  assert.ok(getCanonicalAsset(assetId),"Home enricher uses a non-canonical asset: "+assetId);
}

const model=buildHomeEnrichers(state,win,{now});
assert.equal(model.version,HOME_ENRICHERS_VERSION);
assert.equal(model.visible,true);
assert.equal(model.comingUp.rows.length,3);
assert.equal(model.comingUp.rows[0].id,"angelus.noon");
assert.equal(model.comingUp.rows[1].id,"rosary");
assert.equal(model.comingUp.rows[2].id,"october");
assert.equal(model.dailyCatechism.badge,"2/10 completed");
assert.equal(model.dailyCatechism.meta,"1 due for review");

const html=renderHomeEnrichersToString(model,state,win);
assert.match(html,new RegExp(`data-ao-home-enricher-owner="${HOME_ENRICHERS_VERSION}"`));
assert.match(html,/data-home-cu-route="pray\.angelus_regina"/,"future Angelus item should route through the canonical prayer module");
assert.match(html,/data-home-cu-static="rosary"/);
assert.match(html,/data-home-cu-route="pray\.rosary"/,"October Rosary context should come from shared Calendar intelligence");
assert.match(html,/data-home-daily-catechism/);
assert.match(html,/data-ao-asset-id="ao-rich-rosary"/);
assert.match(html,/<use href="#ao-rich-angelus"><\/use>/);
assert.match(html,/<use href="#ao-rich-rosary"><\/use>/);
assert.match(html,/<use href="#ao-refined-calendar-upcoming"><\/use>/);
assert.doesNotMatch(html,/[✢✧◫]/,"embedded canonical Home icons regressed to Unicode placeholders");

const sundayNow=new Date(2026,9,11,9,0,0);
const sundayState={...state,selectedDate:"2026-10-11"};
const sundayModel=buildHomeEnrichers(sundayState,win,{now:sundayNow});
const sundayHtml=renderHomeEnrichersToString(sundayModel,sundayState,win);
assert.match(sundayHtml,/data-ao-asset-id="ao-brand-emblem"/,"Sunday Mass lost its canonical semantic asset identity");
assert.match(sundayHtml,/data-ao-asset-renderer="mask"/,"Sunday Mass did not render the externalized canonical emblem");
assert.match(sundayHtml,/ao-brand-emblem\.png/,"Sunday Mass emblem did not resolve to the frozen navigation PNG");
assert.doesNotMatch(sundayHtml,/data-ao-icon-missing="true"/,"externalized Sunday Mass artwork still fails text-only");
assert.doesNotMatch(sundayHtml,/✠/,"Mass emblem regressed to a fake Unicode cross icon");

const firstFridayNow=new Date(2026,9,2,9,0,0);
const firstFridayState={...state,selectedDate:"2026-10-02"};
const firstFridayModel=buildHomeEnrichers(firstFridayState,win,{now:firstFridayNow});
assert.equal(firstFridayModel.comingUp.rows[2].id,"first-friday","Home did not consume shared First Friday recurrence");
assert.equal(firstFridayModel.comingUp.rows[2].route,"programme.first_friday","Home First Friday still bypasses the canonical PRAY programme");

const firstSaturdayNow=new Date(2026,9,3,9,0,0);
const firstSaturdayState={...state,selectedDate:"2026-10-03"};
const firstSaturdayModel=buildHomeEnrichers(firstSaturdayState,win,{now:firstSaturdayNow});
assert.equal(firstSaturdayModel.comingUp.rows[2].id,"first-saturday","Home did not consume shared First Saturday recurrence");
assert.equal(firstSaturdayModel.comingUp.rows[2].route,"programme.first_saturday","Home First Saturday still bypasses the canonical PRAY programme");
assert.match(html,/data-ao-asset-id="ao-ui-next"/);
assert.doesNotMatch(html,/\\$\\{esc\\(url\\)\\}/,"canonical UI asset URL interpolation leaked into rendered markup");
assert.match(html,/aoComingUpV4323[^{]*aoDailyCateHome[^{]*\{display:none!important\}/,"retired donor Home cards lost suppression");

const offDate=buildHomeEnrichers({...state,selectedDate:"2026-10-04"},win,{now});
assert.equal(offDate.visible,false);
assert.equal(renderHomeEnrichersToString(offDate,state),"");

const fr=buildHomeEnrichers({...state,language:"fr"},win,{now});
assert.equal(fr.comingUp.title,"À venir");
assert.equal(fr.dailyCatechism.title,"Catéchisme quotidien");

console.log("PASS modular Home enrichers: Coming Up + Daily Catechism visible ownership");
