// Immutable archived v43.43 loading art: neither of these two pictures is
// the ordinary AO brand emblem. They are source-owned rose windows, with a
// Marian boot mark and a Four Evangelists asynchronous loader mark.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const file=url=>readFileSync(fileURLToPath(new URL(url,import.meta.url)));
const images=[
  ["../assets/loading/rose-marian-v4343.png",210066,"56bdcbdc61f8a89538ad62797e296812f3a4ceae3b5a48cbf4bf032e11fbc92b"],
  ["../assets/loading/rose-evangelists-v4343.png",219612,"8445bff378967d96b25770b40295e069bc189e154bfea18363e68b90a0c982f7"],
];
for(const [path,size,hash] of images){
  const bytes=file(path);
  assert.equal(bytes.length,size,path+": changed from exact v43.43 alpha mask");
  assert.equal(createHash("sha256").update(bytes).digest("hex"),hash,
    path+": source art was silently replaced");
  assert.equal(bytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(bytes.readUInt32BE(16),512);
  assert.equal(bytes.readUInt32BE(20),512);
  assert.equal(bytes[25],6,"both recovered masks must preserve RGBA alpha");
}
const css=file("../assets/loading/rose-windows.css").toString("utf8");
const html=file("../index.html").toString("utf8");
assert.match(html,/<link rel="stylesheet" id="ao-v4343-rose-windows-css" href="\.\/assets\/loading\/rose-windows\.css">/);
assert.match(html,/<div class="aoCinemaBootCross brandMark aoBrandEmblem aoCinemaBootLogo"/);
assert.match(html,/<span class="aoCinemaLoaderMark brandMark aoBrandEmblem aoCinemaLoaderLogo"/);
assert.match(css,/\.aoCinemaBootCross\.brandMark\.aoBrandEmblem::before\{/);
assert.match(css,/mask:url\("\.\/rose-marian-v4343\.png"\)/);
assert.match(css,/\.aoCinemaLoaderMark\.brandMark\.aoBrandEmblem::before\{/);
assert.match(css,/mask:url\("\.\/rose-evangelists-v4343\.png"\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/html\[data-reduced-motion="true"\]/);
assert.match(css,/--liturgical/);
assert.doesNotMatch(css,/(?:rotate\(|animation:\s*spin|@keyframes\s+spin)/i,
  "source windows breathe / illuminate; they never spin");
assert.match(css,/animation:aoRoseIllumine 3\.4s/);
assert.match(css,/animation:aoRoseIllumine 2\.8s/);
console.log("Archived rose-window loading: PASS — exact Marian/evangelist masks, early CSS, slow colour illumination, reduced motion.");
