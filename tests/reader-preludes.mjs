import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildPreludePayload, createPreludeReaderController } from "../src/mass/reader-preludes.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const ashPayload=load("../data/presentation/reader-ash.v1.json");
const candlePayload=load("../data/presentation/reader-candlemas.v1.json");

const ashBuilt=buildPreludePayload({graph:extension.graphs.ASH,payload:ashPayload});
assert.equal(ashBuilt.rite,"ASH");
assert.equal(ashBuilt.cards.length,5);
assert.equal(ashBuilt.cards[0].paragraphs.length,9);
assert.equal(ashBuilt.cards.at(-1).handoff,"INTROIT");
assert.equal(ashBuilt.cards.at(-1).ordinaryOpeningSuppressed,true);
assert.match(ashBuilt.cards[2].paragraphs[0].latin,/Memento, homo/);
const ash=createPreludeReaderController({graph:extension.graphs.ASH,payload:ashPayload});
ash.goTo("ASH-R03");
assert.equal(ash.project().personalPosture,null);
ash.setPersonalState("RECEIVE_ASHES");
assert.equal(ash.project().personalPosture,"KNEEL");
assert.equal(ash.project().personalAction,"RECEIVE_ASHES");
ash.next();
assert.equal(ash.project().personalState,null);

const candleBuilt=buildPreludePayload({graph:extension.graphs.CND,payload:candlePayload});
assert.equal(candleBuilt.rite,"CANDLEMAS");
assert.equal(candleBuilt.cards.length,5);
assert.equal(candleBuilt.massObjectStates.length,3);
assert.equal(candleBuilt.cards.at(-1).handoff,"INTROIT");
assert.equal(candleBuilt.cards[2].objectState,"CANDLE_LIT");
assert.match(candleBuilt.cards[1].paragraphs[0].latin,/Lumen ad revelat/);
assert.match(candleBuilt.cards[2].paragraphs[2].latin,/Adórna thálamum/);
const candle=createPreludeReaderController({graph:extension.graphs.CND,payload:candlePayload});
candle.goTo("CND-R02");
candle.setPersonalState("RECEIVE_CANDLE");
assert.equal(candle.project().personalPosture,"KNEEL");
assert.equal(candle.project().personalObjectState,"BLESSED_CANDLE_RECEIVED");
candle.next();
assert.equal(candle.project().card.objectState,"CANDLE_LIT");
assert.equal(candle.project().massObjectStates[0].trigger,"MC_GOSPEL_START");

for(const built of [ashBuilt,candleBuilt]){
  const ids=new Set();
  for(const card of built.cards){
    assert.ok(!ids.has(card.id),"duplicate prelude card id "+card.id);
    ids.add(card.id);
    for(const row of card.paragraphs)assert.ok(row.latin,"blank prelude reader text");
  }
}

console.log("R24 special preludes PASS: Ash and Candlemas source-pinned payloads, personal recipient state, Introit handoff and candle object-state contract.");
