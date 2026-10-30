import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {TCM_KIT_VERSION,TCM_KIT_STYLE_ID,TCM_KIT_CSS,
  installTodayCalendarMassKit} from "../src/app/tcm-ui-kit.js";
import {renderHomeToString} from "../src/home/presentation.js";

assert.equal(TCM_KIT_VERSION,"ao-tcm-ui-kit-v1");
for(const token of [
 "--ao-tcm-bg","--ao-tcm-surface","--ao-tcm-raised","--ao-tcm-ink",
 "--ao-tcm-mute","--ao-tcm-line","--ao-tcm-sage","--ao-tcm-on-sage",
 "--ao-tcm-gold","--ao-tcm-rubric","--ao-tcm-card-radius",
 "--ao-tcm-gutter","--ao-tcm-primary-height",
])assert.ok(TCM_KIT_CSS.includes(token),"Missing shared design token: "+token);
for(const cls of [".aoTcmCard",".aoTcmRow",".aoTcmSection",".aoTcmPrimary",
  ".aoTcmSecondary",".aoTcmNotice",".aoTcmAuthority",".aoTcmSkeleton",".aoTcmLens"])
  assert.ok(TCM_KIT_CSS.includes(cls),"Missing reusable UI primitive: "+cls);
assert.match(TCM_KIT_CSS,/data-ao-appearance-v1="light"/);
assert.match(TCM_KIT_CSS,/@media\(max-width:359px\)/);
assert.match(TCM_KIT_CSS,/min-height:44px/);
assert.match(TCM_KIT_CSS,/\[aria-current="page"\]/);
assert.doesNotMatch(TCM_KIT_CSS,/\.ao-reader-shell|#aoPray435930|#aoPrayerBookRoot/,
  "TCM kit must not restyle the 65-card reader or prayer-book system");
const appended=[],head={append:el=>appended.push(el)};
const doc={head,createElement:tag=>({tagName:tag,textContent:"",id:""}),
 getElementById:id=>appended.find(x=>x.id===id)||null};
const win={document:doc};
assert.equal(installTodayCalendarMassKit(win).installed,true);
assert.equal(installTodayCalendarMassKit(win).installed,true);
assert.equal(appended.length,1,"Kit installation must be idempotent");
assert.equal(appended[0].id,TCM_KIT_STYLE_ID);
assert.equal(appended[0].textContent,TCM_KIT_CSS);
const app=await readFile(new URL("../src/app/browser-entry.js",import.meta.url),"utf8");
assert.match(app,/installTodayCalendarMassKit\(globalThis\)/,"Existing app root must install the kit");
const state={route:"home",selectedDate:"2026-10-30",resolving:false,
 resolution:{date:"2026-10-30",status:"ready",day:{main:{
   id:"tempora:Pent22-5:4:g",title:"Feria",rank:4,color:"Green"}},
  proper:{status:"idle"}}};
for(const language of ["en","fr"]){
 const html=renderHomeToString({...state,language},{location:{search:"?aoTodayH4=0"}});
 assert.match(html,/class="aoTodayV2Tabs aoTcmLens"/);
 assert.match(html,/data-home-calendar-view="picker"/);
 assert.match(html,/data-home-calendar-view="year"/);
 assert.match(html,new RegExp(language==="fr"?"Année</button>":"Year</button>"),
   "Lens label must fit 320px without wrapping");
 assert.match(html,/data-home-calendar-today aria-current="page"/);
 assert.match(html,/data-home-mass-entry/,"Do not replace the source-owned Mass entry");
}
console.log("PASS shared Today/Month/Year lens, scoped tokens, dark/light, idempotence and unchanged owners");
