import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {c3PrayerMarkup,c3UpcomingMarkup,selectC3PrayerSlide,hydrateC3Art} from "../src/home/c3-gallery.js";
import {HOME_C3_CSS} from "../src/home/c3-styles.js";

const prayer=c3PrayerMarkup({fr:false,feature:{id:"angelus.evening"},
  attrs:'data-home-cu-dynamic="angelus.evening" data-home-cu-route="pray.angelus_regina"',
  role:"Next",title:"Angelus",description:"At the appointed hour",due:"18:00"});
assert.equal((prayer.match(/class="aoC3PrayerSlide"/g)||[]).length,4);
assert.equal((prayer.match(/data-home-c3-prayer-step=/g)||[]).length,4);
assert.equal((prayer.match(/aria-current="true"/g)||[]).length,1);
for(const route of ["pray.angelus_regina","pray.confession","pray.adoration","pray.library"])
  assert.ok(prayer.includes(route),"Missing canonical route: "+route);
assert.ok(prayer.includes('data-c3-feature="angelus.evening"'));
assert.ok(!prayer.includes("pray.rosary"),"The single Rosary personal-rule chip must not duplicate in C3");
assert.ok(prayer.includes('hidden aria-hidden="true"'));
assert.ok(!prayer.includes("Montfort · 33"),"No fictional progress on Home");

const french=c3PrayerMarkup({fr:true,attrs:'data-home-cu-route="pray.library"',role:"Prière",title:"Livre de prières",description:"Aujourd’hui"});
assert.ok(french.includes("Toutes les prières"));assert.ok(french.includes("Choisir une prière"));
assert.equal((french.match(/class="aoC3PrayerSlide"/g)||[]).length,4);
const escaped=c3PrayerMarkup({attrs:'data-home-cu-route="pray.library"',title:'<script>alert("x")</script>'});
assert.ok(!escaped.includes("<script>"),"Untrusted source title escaped");

const cards=c3UpcomingMarkup([{date:"2026-11-01",en:"All Saints",fr:"Toussaint"}],false,()=>"1 Nov",()=>"Sun");
assert.ok(cards.includes('data-home-calendar-date="2026-11-01"'));
assert.ok(cards.includes("All Saints"));
assert.ok(!cards.includes("Saint Martin"),"No fabricated extra calendar appointment");
assert.equal((cards.match(/data-home-c3-info="week"/g)||[]).length,1);
assert.ok(cards.includes(" hidden>"),"Uncleared art info must stay unavailable");
const none=c3UpcomingMarkup([],false,()=>"",()=>"");
assert.equal(none,"","No invented calendar rows");

const slides=Array.from({length:4},()=>({hidden:false,attrs:{},setAttribute(n,v){this.attrs[n]=v}}));
const dots=Array.from({length:4},()=>({attrs:{},setAttribute(n,v){this.attrs[n]=v}}));
const deck={querySelectorAll(sel){return sel==="[data-home-c3-slide]"?slides:dots}};
const root={querySelector(sel){return sel==="[data-home-c3-prayer-deck]"?deck:null}};
assert.equal(selectC3PrayerSlide(root,2),true);
assert.equal(slides.filter(s=>!s.hidden).length,1);
assert.equal(slides[2].attrs["aria-hidden"],"false");
assert.equal(dots.filter(d=>d.attrs["aria-current"]==="true").length,1);
assert.equal(selectC3PrayerSlide(root,-1),false);
assert.equal(selectC3PrayerSlide(null,0),false);
assert.equal(hydrateC3Art({querySelector:()=>null},{},{}),false);

const h4=readFileSync(new URL("../src/home/today-h4-view.js",import.meta.url),"utf8");
const browser=readFileSync(new URL("../src/home/browser-entry.js",import.meta.url),"utf8");
const presentation=readFileSync(new URL("../src/home/presentation.js",import.meta.url),"utf8");
for(const term of ["c3PrayerMarkup(","c3UpcomingMarkup(","data-home-c3-info","data-home-c3-art-dialog"])
  assert.ok(h4.includes(term),"C3 markup integration missing "+term);
for(const term of ["selectC3PrayerSlide(","showC3ArtInfo(","closeC3ArtInfo("])
  assert.ok(browser.includes(term),"C3 click contract missing "+term);
assert.ok(presentation.includes("hydrateC3Art(root,state,win)"));
assert.ok(HOME_C3_CSS.includes("data-c3-orientation"));
assert.ok(HOME_C3_CSS.includes("scale(var(--ao-c3-zoom,1.075))"));
assert.ok(HOME_C3_CSS.includes("object-fit:contain"),"Full uncropped art info sheet required");
assert.ok(HOME_C3_CSS.includes("max-width:359px"));
console.log("C3 Living Gallery: 4 canonical Prayer routes, real upcoming dates, adaptive art, safe info sheet, mobile sizing PASS");
