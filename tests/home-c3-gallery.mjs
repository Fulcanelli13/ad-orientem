import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {c3PrayerMarkup,c3UpcomingMarkup,selectC3PrayerSlide,hydrateC3Art,c3ApprovedDatedHomeArt,C3_STAGED_APPROVED_PRAYER_ART} from "../src/home/c3-gallery.js";
import {HOME_C3_CSS} from "../src/home/c3-styles.js";

// Today must use the exact user-selected Class I painting already present in
// the canonical Calendar. A valid but unrelated generic Proper artwork is NOT
// a substitute for Carlo Saraceni / Carracci on the two November feasts.
const allSaints=c3ApprovedDatedHomeArt({properPath:()=>"Sancti/11-01"},{selectedDate:"2026-11-01"});
assert.equal(allSaints?.artist,"Carlo Saraceni");
assert.equal(allSaints?.title,"Paradise");
assert.match(allSaints?.source??"",/Paradise_MET_DT1448/);
assert.equal(allSaints?.imagePublicationStatus,"REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED");
const allSouls=c3ApprovedDatedHomeArt({properPath:()=>"Sancti/11-02m1"},{selectedDate:"2026-11-02"});
assert.equal(allSouls?.artist,"Ludovico Carracci");
assert.match(allSouls?.title??"",/Souls of Purgatory/);
assert.equal(c3ApprovedDatedHomeArt({properPath:()=>"Sancti/11-02m1"},{selectedDate:"2026-11-01"}),null);
assert.equal(c3ApprovedDatedHomeArt({properPath:()=>"Sancti/11-01"},{selectedDate:"2026-11-03"}),null);
// No new painting choice: all eight source-visible Class I Calendar previews
// reuse their exact observed 1962 Proper paths in Home, and nothing else.
// The two held photographs must not be surfaced merely because approved.
const datedHomePaths={
  "2026-03-29":"Tempora/Quad6-0r",
  "2026-04-02":"Tempora/Quad6-4r",
  "2026-05-23":"Tempora/Pasc6-6",
  "2026-05-24":"Tempora/Pasc7-0",
  "2026-05-27":"Tempora/Pasc7-3",
  "2026-06-12":"Tempora/Pent02-5",
  "2026-11-01":"Sancti/11-01",
  "2026-11-02":"Sancti/11-02m1"
};
for(const [date,path] of Object.entries(datedHomePaths)){
 const selected=c3ApprovedDatedHomeArt({properPath:()=>path},{selectedDate:date});
 assert.equal(selected?.date,date,"Missing approved Home reuse date: "+date);
 assert.match(selected.image??"",/^https:\/\/upload\.wikimedia\.org\//,"Home artwork must be the canonical preview");
 assert.match(selected.imagePublicationStatus,/NOT_OFFLINE_CERTIFIED/,"Must not claim released original");
 assert.equal(c3ApprovedDatedHomeArt({properPath:()=>path+"-wrong"},{selectedDate:date}),null,
   "Wrong Proper must never receive approved art: "+date);
}
assert.equal(Object.keys(datedHomePaths).length,8);
for(const [date,path] of [["2026-10-25","Sancti/10-DU"],["2026-11-29","Tempora/Adv1-0"]]){
 assert.equal(c3ApprovedDatedHomeArt({properPath:()=>path},{selectedDate:date}),null,
   "Previously held reproduction must not appear on Home: "+date);
}

assert.ok(HOME_C3_CSS.includes(".aoC3DatedImage"));
assert.ok(!HOME_C3_CSS.includes(".aoC3DatedCredit"),"C3 art metadata belongs in the existing information control, not an image caption");

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

// A draft review of two *existing approved artworks*, not new iconography.
// Direct Home art islands keep their approved exact museum identity and images
// remain under the staged path until photo/crop acceptance and a later release.
const proof=c3PrayerMarkup({feature:{id:"angelus.evening"},
  attrs:'data-home-cu-route="pray.angelus_regina"',title:"Angelus",role:"Prayer"});
assert.ok(proof.includes("angelus-frameless-candidate.webp"));
assert.ok(proof.includes("adoration-frameless-candidate.webp"));
assert.equal((proof.match(/data-stage-review-only="true"/g)||[]).length,2);
assert.match(C3_STAGED_APPROVED_PRAYER_ART.angelus.source,/438724$/);
assert.match(C3_STAGED_APPROVED_PRAYER_ART.adoration.source,/438434$/);
assert.ok(HOME_C3_CSS.includes("object-fit:contain"),"Phone composition remains uncropped");
assert.equal((c3PrayerMarkup({feature:{id:"prayer.library"}}).match(/angelus-frameless-candidate.webp/g)||[]).length,0);
assert.equal((c3PrayerMarkup({feature:{id:"prayer.library"}}).match(/adoration-frameless-candidate.webp/g)||[]).length,1);

const french=c3PrayerMarkup({fr:true,attrs:'data-home-cu-route="pray.library"',role:"Prière",title:"Livre de prières",description:"Aujourd’hui"});
assert.ok(french.includes("Confession"));assert.ok(french.includes("Choisir une prière"));
assert.equal((french.match(/data-home-cu-route="pray.library"/g)||[]).length,1,"The active Prayer Library route must not repeat as a carousel alternative");
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
