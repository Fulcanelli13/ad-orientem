import test from "node:test";
import assert from "node:assert/strict";
import {
 claudePaintingA3Enabled,eligibleClaudePaintingA3,renderClaudePaintingA3,
 CLAUDE_A3_ESSENTIAL_SEQUENCE
} from "../src/pray/claude-painting-a3.js";
import {CLAUDE_PAINTING_A3_CSS} from "../src/pray/claude-painting-a3-styles.js";

const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
const photo={image:"assets/prayer/released/joseph-whole-original.jpg",
 artist:"Philippe de Champaigne",title:"The Dream of Saint Joseph"};
const record={
 title:"Prayer to Saint Joseph",titleFr:"Prière à saint Joseph",
 la:"Sancte Joseph, ora pro nobis.",en:"Saint Joseph, pray for us.",
 fr:"Saint Joseph, priez pour nous."
};
test("Claude painting is explicit opt-in and never overrides default reading",()=>{
 assert.equal(claudePaintingA3Enabled({location:{search:""}}),false);
 assert.equal(claudePaintingA3Enabled({location:{search:"?aoPrayerPaintingA3=1"}}),true);
 assert.equal(claudePaintingA3Enabled({location:{search:"?aoPrayerPaintingA3=0"}}),false);
});
test("only released exact photograph URLs are eligible",()=>{
 assert.equal(eligibleClaudePaintingA3({id:"x",record,photo}),true);
 assert.equal(eligibleClaudePaintingA3({id:"x",record,photo:{image:"https://example.org/unapproved.jpg"}}),false);
 assert.equal(eligibleClaudePaintingA3({id:"x",record,photo:{image:"assets/../secret.jpg"}}),false);
 assert.equal(eligibleClaudePaintingA3({id:"x",record,photo:null}),false);
});
test("A3 renders actual source words in same-space Latin-to-vernacular swap",()=>{
 const h=renderClaudePaintingA3({id:"foundations_guardian_angel",record,photo,language:"fr",esc});
 assert.match(h,/data-ao-claude-painting-a3/);
 assert.match(h,/<img class="bg" src="\/assets\/prayer\/released\/joseph-whole-original\.jpg"/);
 assert.match(h,/class="ambient"/);
 assert.match(h,/class="sh"/);
 assert.match(h,/Sancte Joseph, ora pro nobis/);
 assert.match(h,/Saint Joseph, priez pour nous/);
 assert.match(h,/data-ao-a3-swap/);
 assert.match(h,/data-ao-a3-view/);
 assert.match(h,/lang="fr"/);
 assert.doesNotMatch(h,/<iframe/);
 assert.ok(CLAUDE_A3_ESSENTIAL_SEQUENCE.length===7);
});
test("A3 keeps Claude choir's source rows and fixed foot response intact",()=>{
 const choirRows='<p class="aoChoirBeat aoClaudeChoirBeat" data-ao-choir-answer="Ora pro nobis.">Sancta Maria</p>';
 const choirBar='<div class="aoClaudeChoirResponse"><b class="aoClaudeChoirResponseText"></b></div>';
 const h=renderClaudePaintingA3({id:"litany_loreto_1962",record,photo,language:"la",
   kind:"litany",esc,choirRows,choirBar,sourceMarkup:"<a href=\"#source\">Source</a>"});
 assert.ok(h.includes(choirRows));
 assert.match(h,/<div class="aoP435930Text aoChoirFaces" data-ao-pray-semantic="1">/,
  "The outer Choir face must be protected from the shared semantic text flattener");
 assert.ok(h.includes(choirBar));
 assert.match(h,/data-ao-choir-kind="litany"/);
 assert.match(h,/aoDevoCardScroll/);
 assert.match(h,/Source/);
 assert.doesNotMatch(h,/data-ao-a3-swap/);
});
test("the A3 port retains full bleed painting, low text gradient and reduced motion",()=>{
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.ambient\{[^}]*background-size:cover/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.bg\{[^}]*object-fit:contain/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.sw \.st>\*\{[^}]*align-self:start/,"Latin and translation must measure their own heights");
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.view \.bg\{[^}]*object-position:center/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/max-width:359px/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/@media\(max-width:600px\)\{#aoPray435930 \.aoClaudePaintingA3 \.bg\{top:0;bottom:0;height:100%/,"The painting must not shrink into a phone-only postcard");
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.aoP435930Head\{[^}]*pointer-events:none!important/,"Transparent header must not block mode taps");
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.aoP435930Head button,[^}]*pointer-events:auto!important/,"Back and Home remain actionable");
 assert.match(CLAUDE_PAINTING_A3_CSS,/#ao-global-ribbon\{display:none!important/,"A3 must not show the unrelated global ribbon");
 assert.doesNotMatch(CLAUDE_PAINTING_A3_CSS,/\.bg\{[^}]*background-size:cover/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/animation:aoClaudeA3Kb 32s/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/@keyframes aoClaudeA3Kb\{from\{transform:translate3d\(0,0,0\) scale\(1\)\}to\{transform:translate3d\(-\.6%,-\.4%,0\) scale\(1\.035\)\}\}/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.view \.bg\{[^}]*animation:none!important;transform:none!important/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/rgba\(4,6,9,\.70\) 81%/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/prefers-reduced-motion/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/aoClaudeChoirResponse/);
});

import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
import {
 a3CuratedPassages,a3ReadingLayout,A3_FOCUS_CUTS,A3_FIT_RATIO
} from "../src/pray/claude-painting-a3-experience.js";

test("all curated focused passages preserve the exact published text in LA/EN/FR",()=>{
 for(const id of Object.keys(A3_FOCUS_CUTS)){
   const record=canon.prayers[id];
   assert.ok(record,id+" must be in canonical corpus");
   for(const lang of ["la","en","fr"]){
     const original=record[lang];
     const pieces=a3CuratedPassages(id,original,lang);
     assert.ok(pieces?.length>1,id+" "+lang);
     assert.equal(pieces.join(""),original,id+" "+lang+" no paraphrase or loss");
     assert.equal(pieces.some(p=>!p.trim()),false);
   }
 }
});
test("contemplative splitting is disabled for uncurated prayers or changed witnesses",()=>{
 assert.equal(a3CuratedPassages("unlisted","Some words. Another.","en"),null);
 assert.equal(a3CuratedPassages("foundations_our_father","An alternate wording.","la"),null);
 assert.equal(a3CuratedPassages("foundations_our_father",null,"la"),null);
});
test("40 percent text-fit decision uses real measured text height",()=>{
 assert.equal(A3_FIT_RATIO,0.40);
 assert.equal(a3ReadingLayout(240,600),"cinematic");
 assert.equal(a3ReadingLayout(241,600),"veil");
 assert.equal(a3ReadingLayout(0,600),"cinematic");
 assert.equal(a3ReadingLayout(600,0),"cinematic");
});
test("standalone A3 surfaces provide the original painting and contextual mode controls",()=>{
 const p=canon.prayers.foundations_our_father;
 const h=renderClaudePaintingA3({id:p.id,record:p,photo,language:"fr",esc});
 assert.match(h,/data-ao-a3-mode="pray"/);
 assert.match(h,/data-ao-a3-mode="focus"/);
 assert.match(h,/aoA3VeilToggle/);
 assert.match(h,/data-ao-a3-focus-next/);
 assert.match(h,/data-a3-face="la"/);
 assert.match(h,/data-a3-face="vern"/);
 assert.match(h,/data-ao-a3-focus-step="0"/);
 assert.match(h,/<img class="bg"/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/aoA3FitVeil/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/aoA3ModeFocus/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/\.aoA3ModeFocus \.sh\{background:linear-gradient/);
 assert.doesNotMatch(CLAUDE_PAINTING_A3_CSS,/\.gl\{/);
});
test("unverified focus text never triggers punctuation splitting or made-up verses",()=>{
 const unknown={title:"Long Prayer",la:"A prayer with words; and more words.",en:"A prayer with words; and more words."};
 const h=renderClaudePaintingA3({id:"other_prayer",record:unknown,photo,esc});
 assert.doesNotMatch(h,/data-ao-a3-mode="focus"/);
 assert.match(h,/A prayer with words/);
});
test("Choir remains a single continuous prayer with no contemplation replacement",()=>{
 const h=renderClaudePaintingA3({id:"litany_loreto_1962",record,photo,kind:"litany",esc,
    choirRows:'<p class="aoChoirBeat">Kyrie eleison.</p>',
    choirBar:'<div class="aoClaudeChoirResponse"></div>'});
 assert.doesNotMatch(h,/data-ao-a3-mode="focus"/);
 assert.match(h,/aoClaudeChoirResponse/);
 assert.match(h,/data-ao-a3-kind="litany"/);
});
