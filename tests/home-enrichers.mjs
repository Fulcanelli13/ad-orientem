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
  AO_LITURGICAL_YEAR_V384:{
    eventsFor(key){
      if(key===today)return [{key:"christ-king",priority:90,title:"Christ the King",actions:[["learn.liturgical_year"]]}];
      return [];
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
assert.equal(model.comingUp.rows[2].id,"christ-king");
assert.equal(model.dailyCatechism.badge,"2/10 completed");
assert.equal(model.dailyCatechism.meta,"1 due for review");

const html=renderHomeEnrichersToString(model,state);
assert.match(html,new RegExp(`data-ao-home-enricher-owner="${HOME_ENRICHERS_VERSION}"`));
assert.match(html,/data-home-cu-route="pray\.angelus_regina"/,"future Angelus item should route through the canonical prayer module");
assert.match(html,/data-home-cu-static="rosary"/);
assert.match(html,/data-home-cu-route="learn\.liturgical_year"/);
assert.match(html,/data-home-daily-catechism/);
assert.match(html,/data-ao-asset-id="ao-rich-rosary"/);
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
