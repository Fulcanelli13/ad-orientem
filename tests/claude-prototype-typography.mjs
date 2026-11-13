import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {installAppDesignSystem} from "../src/app/design-system.js";
import {DEVOTIONAL_CINEMATIC_CSS} from "../src/pray/devotional-cinematic-styles.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const index=read("index.html");

// The two Claude prayer prototypes use this exact Google Fonts family/weight tuple.
// Home V9 embeds its own files, including EB Garamond numerals in Cormorant faces.
assert.ok(index.includes(
 "family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500"+
 "&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
),"the published app must load every prototype weight, including italic 500");

const elements=new Map();
const document={
 createElement(tag){assert.equal(tag,"style");return {id:"",textContent:""};},
 getElementById(id){return elements.get(id)??null;},
 head:{append(node){elements.set(node.id,node);}},
 documentElement:{dataset:{}}
};
const owner=installAppDesignSystem({document});
assert.equal(owner.installed,true);
const css=elements.get("ao-app-design-system").textContent;
assert.ok(css.includes('--ao-font-ceremonial:var(--font-display,"Cinzel",Georgia,serif)'));
assert.ok(css.includes('--ao-font-display:var(--font-cormorant,"Cormorant Garamond","EB Garamond",Georgia,serif)'));
assert.ok(css.includes('--ao-font-body:var(--font-liturgical,"EB Garamond",Georgia,serif)'));
assert.match(css,/#ao-global-ribbon\s*\{\s*font-family:var\(--ao-font-ceremonial\)/);
assert.match(css,/#aoPray435930 \.aoP435930Head h1\s*\{\s*font-family:var\(--ao-font-ceremonial\)!important/);

// Versicles may be Cormorant, but complete prayers must not inherit a global
// display-font override. The shared liturgical speaker rule stays source-faithful.
assert.match(css,/#aoPray435930 \[data-ao-angelus-recitation\] \.aoAngelusDialogueLine>span:not\(\.ao-liturgical-speaker\)/);
assert.match(css,/--ao-type-angelus-verse:clamp\(19px,5\.4vw,21px\)/);
assert.match(css,/--ao-type-caption-match:9\.5px/);
assert.match(css,/\.ao-liturgical-speaker\s*\{[\s\S]*?font-family:inherit!important/);
assert.match(css,/#aoPray435930 \[data-ao-angelus-recitation\] \.aoAngelusDialogueLine>\.ao-liturgical-speaker\s*\{[\s\S]*?font-size:17px!important/);

// 390px source-size fidelity; at narrow 320px the text stays at least 19px.
for(const [width,expected] of [[390,21],[320,19]]){
 const fontSize=Math.max(19,Math.min(width*.054,21));
 assert.equal(fontSize,expected);
}

// The ornamental/verse/reading distinction applies in cinematic transitions.
assert.match(DEVOTIONAL_CINEMATIC_CSS,/\.aoDevoCinematicHeading h2\{[^}]*var\(--ao-font-ceremonial/);
assert.match(DEVOTIONAL_CINEMATIC_CSS,/\.aoDevoPostureLatin\{[^}]*var\(--ao-font-display/);
assert.match(DEVOTIONAL_CINEMATIC_CSS,/\.aoDevoPostureResponse\{[^}]*var\(--ao-font-body/);
assert.doesNotMatch(DEVOTIONAL_CINEMATIC_CSS,/font:[^;]*?\sGeorgia,serif/,"do not reintroduce bare Georgia for prayer cinematic text");
console.log("PASS Claude typography contract: font triad, weights, semantic roles, Angelus, 390/320 text bounds");
