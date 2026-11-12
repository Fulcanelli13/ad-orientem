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
 assert.match(h,/class="bg"/);
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
 assert.ok(h.includes(choirBar));
 assert.match(h,/data-ao-choir-kind="litany"/);
 assert.match(h,/aoDevoCardScroll/);
 assert.match(h,/Source/);
 assert.doesNotMatch(h,/data-ao-a3-swap/);
});
test("the A3 port retains full bleed painting, low text gradient and reduced motion",()=>{
 assert.match(CLAUDE_PAINTING_A3_CSS,/background-size:cover/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/animation:aoClaudeA3Kb 32s/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/rgba\(4,6,9,\.88\) 64%/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/prefers-reduced-motion/);
 assert.match(CLAUDE_PAINTING_A3_CSS,/aoClaudeChoirResponse/);
});
