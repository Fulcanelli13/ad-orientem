import assert from "node:assert/strict";
import {test} from "node:test";
import {prayerCeremonialSceneState as project,renderPrayerCeremonialScene as render} from "../src/pray/prayer-ceremonial-stage.v1.js";

test("Confession uses existing four stages; never projects absolution or stores answers",()=>{
  for(let stage=0;stage<4;stage++){
    const scene=project({kind:"confession",stage});
    assert.equal(scene.stage,stage);
    assert.equal(scene.performedSacrament,false);
    assert.equal(scene.storesPrivateAnswers,false);
    assert.equal(scene.observedNow,false);
    assert.match(render(scene,{french:true}),/visual-only/);
  }
  assert.equal(project({kind:"confession",stage:2,cardId:"cross-and-blessing"}).rehearsalCross,true);
  assert.equal(project({kind:"confession",stage:2,cardId:"contrition-penance"}).rehearsalCross,false);
  assert.doesNotMatch(render(project({kind:"confession",stage:2})),/absolution|absolve/i);
});
test("Tenebrae artwork requires explicit optional historical ceremonial enable",()=>{
  assert.equal(project({kind:"tenebrae",ceremony:{enabled:false}}),null);
  const scene=project({kind:"tenebrae",ceremony:{enabled:true,extinguished:8}});
  assert.equal(scene.candleCount,15);
  assert.equal(scene.extinguished,8);
  assert.equal(scene.autoAdvancement,false);
  assert.equal(scene.customaryOnly,true);
  const html=render(scene);
  assert.equal((html.match(/class="aoPrayerCeremonialCandle[^"]*" data-ao-candle-index=/g)||[]).length,15,
   "All fifteen candles must expose valid DOM data attributes, not malformed class strings");
  assert.equal((html.match(/--ao-candle-x:/g)||[]).length,15,
   "Each candle needs an explicit position on the triangular historical hearse");
  assert.match(html,/--ao-candle-x:50%;--ao-candle-rise:54\.0%/,
   "The final candle must be at the triangle apex");
  assert.equal((render(scene).match(/data-ao-candle-index=/g)||[]).length,15);
  assert.equal((render(scene).match(/is-dark/g)||[]).length,8);
});
test("Tenebrae last candle may be concealed and returned only from witnessed state",()=>{
  const concealed=project({kind:"tenebrae",ceremony:{enabled:true,extinguished:14,hidden:true}});
  assert.equal(concealed.phase,"concealed");
  assert.equal((render(concealed).match(/is-dark/g)||[]).length,15);
  assert.equal((render(concealed).match(/is-concealed/g)||[]).length,1,
   "The last observed concealed candle must disappear rather than merely dim");
  const noise=project({kind:"tenebrae",ceremony:{enabled:true,extinguished:14,hidden:true,strepitus:true}});
  assert.equal(noise.phase,"strepitus");
  const returned=project({kind:"tenebrae",ceremony:{enabled:true,extinguished:14,hidden:true,strepitus:true,returned:true}});
  assert.equal(returned.phase,"returned");
  assert.equal((render(returned).match(/is-dark/g)||[]).length,14);
  assert.equal((render(returned).match(/is-concealed/g)||[]).length,0,
   "The candle becomes visible again only when its observed return is marked");
});
