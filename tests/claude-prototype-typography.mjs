import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {installAppDesignSystem} from "../src/app/design-system.js";
import {DEVOTIONAL_CINEMATIC_CSS} from "../src/pray/devotional-cinematic-styles.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const index=read("index.html");

// The generated shell must remain unmodified. Cormorant loads from the
// design-system owner, while the startup document retains Cinzel and EB.
assert.ok(index.includes("family=Cinzel:wght@500;600;700&family=EB+Garamond"));
assert.ok(!index.includes("family=Cormorant+Garamond"));

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
assert.ok(!css.includes("@import url("),"offline fonts cannot depend on CSS network imports");
assert.ok(css.includes('font-family:"AO Home V9 Cormorant"'));
assert.ok(css.includes('unicode-range:U+0030-0039'));
const fontHashes={
 "cinzel-variable.woff":"40f3efcdc979122b7632c0912ace378e680975e24f327eed811e080280525e62",
 "cormorant-variable.woff":"804bcd0f0d6781901822e9edf67d602619a52427f59c642cb35c8860cdb45c7b",
 "cormorant-italic-variable.woff":"6ae26e8b34e0d4c2d72b6ed3bf2930f663bd8d0a0a47f5538c1c17308058d5fc",
 "eb-garamond-variable.woff":"0e02f15d49a5b83f925d11c2631fdbd7dd731ddcf9c13c417a068b1c0d3e2338",
 "eb-garamond-italic-variable.woff":"f49912632d5603fedf3ac9ce0fa9a41b260c1b5da5bb5160c9cca33c1e62637c"
};
for(const [name,expectedHash] of Object.entries(fontHashes)){
 const path="assets/fonts/claude-v9/"+name;
 assert.ok(css.includes(path),"missing local font declaration: "+name);
 const body=readFileSync(new URL("../"+path,import.meta.url));
 assert.equal(createHash("sha256").update(body).digest("hex"),expectedHash,"prototype font changed: "+name);
}
const worker=read("sw.js");
assert.ok(worker.includes("OFFLINE_CRITICAL_CLAUDE_FONTS"));
assert.ok(worker.includes("...OFFLINE_CRITICAL_CLAUDE_FONTS"));
for(const file of Object.keys(fontHashes))assert.ok(worker.includes('"'+file+'"'));

assert.ok(css.includes('--ao-font-ceremonial:var(--font-display,"Cinzel",Georgia,serif)'));
assert.ok(css.includes('--ao-font-display:var(--font-cormorant,"Cormorant Garamond","EB Garamond",Georgia,serif)'));
assert.ok(css.includes('--ao-font-body:var(--font-liturgical,"EB Garamond",Georgia,serif)'));
assert.ok(css.includes(".homeScreen:not(.aoH7Screens) h1"),
 "Claude H7 donor heading must not be overridden by global Cormorant display");
assert.match(css,/#ao-global-ribbon\s*\{\s*font-family:var\(--ao-font-ceremonial\)/);
assert.match(css,/#aoPray435930 \.aoP435930Head h1\s*\{\s*font-family:var\(--ao-font-ceremonial\)!important/);

// Versicles may be Cormorant, but complete prayers must not inherit a global
// display-font override. The shared liturgical speaker rule stays source-faithful.
assert.match(css,/#aoPray435930 \.aoFolioReader \.aoDevoCardScroll \[data-ao-angelus-unit="vr"\] \.aoAngelusDialogueLine>span:not\(\.ao-liturgical-speaker\)/);
assert.match(css,/--ao-type-angelus-verse:clamp\(19px,5\.4vw,21px\)/);
assert.match(css,/--ao-type-caption-match:9\.5px/);
assert.match(css,/\.ao-liturgical-speaker\s*\{[\s\S]*?font-family:inherit!important/);
assert.match(css,/#aoPray435930 \.aoFolioReader \.aoDevoCardScroll \[data-ao-angelus-unit="vr"\] \.aoAngelusDialogueLine>\.ao-liturgical-speaker\s*\{[\s\S]*?font-size:17px!important/);
assert.match(css,/#aoPray435930 \.aoFolioReader \.aoDevoCardScroll \[data-ao-angelus-unit="hail"\] \.aoAngelusDialogueLine>span:not\(\.ao-liturgical-speaker\)/);
assert.ok(css.includes("font-size:clamp(17px,4.75vw,18.5px)!important"));
assert.match(css,/#aoPray435930 \.aoP435930AngelusReader \.aoDevoCardTitle\s*\{[\s\S]*?font-family:var\(--ao-font-ceremonial\)!important/);

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
