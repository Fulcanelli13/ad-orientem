import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  ANGELUS_CINEMATIC_SCENES,
  ANGELUS_CINEMATIC_VERSION,
  planAngelusChapters,
  validLocalArtworkUrl,
  installAngelusCinematic
} from "../src/pray/angelus-cinematic.js";

assert.equal(ANGELUS_CINEMATIC_VERSION,"angelus-cinematic-v1");
assert.deepEqual(
  planAngelusChapters(["vr","hail","vr","hail","vr","hail","vr","collect"],"angelus"),
  [[0,1],[2,3],[4,5],[6,7]],
  "Angelus must preserve three versicle / Hail Mary pairs and its ending"
);
assert.deepEqual(
  planAngelusChapters(["vr","vr","vr","collect"],"regina"),
  [[0],[1],[2],[3]],
  "Regina Caeli requires its own four-part Paschal structure"
);
assert.deepEqual(
  planAngelusChapters(["vr","hail","vr","hail","vr","hail","vr","prayer","collect"],"angelus"),
  [[0,1],[2,3],[4,5],[6,7,8]],
  "extra historical prayer units must remain inside the concluding movement"
);
for(const form of ["angelus","regina"]){
  const scenes=ANGELUS_CINEMATIC_SCENES[form];
  assert.equal(scenes.length,4);
  assert.deepEqual(scenes.map(x=>x.effect),form==="angelus"
    ? ["reveal","camera","light","stillness"]
    : ["reveal","light","camera","stillness"]);
  for(const scene of scenes){
    for(const key of ["id","latin","en","fr","effect"])assert.ok(scene[key]);
  }
}
for(const value of ["assets/pray/angelus/01.webp","./assets/art/angelus.png","/assets/pray/fiat.jpg"]){
  assert.equal(validLocalArtworkUrl(value),true,value);
}
for(const value of ["https://example.com/image.jpg","javascript:alert(1)","assets/../secret.jpg","assets/art.jpg?cache=1","/foo.jpg",null]){
  assert.equal(validLocalArtworkUrl(value),false,String(value));
}
assert.equal(installAngelusCinematic({win:{document:null},root:null}),null,"SSR entry must be inert");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const style=readFileSync("src/pray/angelus-cinematic-styles.js","utf8");
const module=readFileSync("src/pray/angelus-cinematic.js","utf8");
assert.match(runtime,/installAngelusCinematic\(\{win:window,root:m,form,locale:lang\(\),initialStep:angelusCinemaStep/);
assert.match(runtime,/bindAngelusExactRail\(\)/,"live posture rail must still bind");
assert.match(runtime,/data-p435930-card-flip/,"existing vernacular / Latin flip must remain");
assert.match(runtime,/angelusExactPosture/,"traditional posture resolver must remain");
assert.match(runtime,/angelusHistoricalConclusion/,"historic Angelus appendix must remain optional");
assert.match(module,/container\.addEventListener\("touchend"/,"horizontal mobile movement missing");
assert.match(module,/Math\.abs\(dx\)>Math\.abs\(dy\)\*1\.45/,"vertical scroll must win over diagonal swipe");
assert.match(module,/button\.setAttribute\("aria-current","step"\)/,"current timeline milestone must be accessible");
assert.match(module,/group\.hidden=i!==step/,"invisible prayer chapters must not read or receive focus");
assert.match(module,/motionReduced\(win\)/,"reduced motion support missing");
assert.match(style,/prefers-reduced-motion:reduce/);
assert.match(style,/data-ao-angelus-form/,"dark theme must be scoped to Angelus");
assert.doesNotMatch(module,/setInterval|localStorage|requestAnimationFrame\(/,"prayer progression must be user driven");
console.log("Angelus cinematic chapter, artwork safety and canonical ownership contracts passed");
