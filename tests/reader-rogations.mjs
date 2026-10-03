import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsPayload,createRogationsReaderController} from "../src/mass/reader-rogations.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const payload=load("../data/presentation/reader-rogations.v1.json");
const graph=load("../data/mass/special-days-extension.v1.3.json").graphs.ROG;

const built=buildRogationsPayload({graph,payload});
assert.equal(built.cards.length,5);
assert.equal(built.cards[0].posture,"STAND");
assert.equal(built.cards[1].posture,"KNEEL");
assert.equal(built.cards[2].processionTrigger,"SANCTA_MARIA");
assert.ok(built.cards[2].paragraphs.some(p=>/Ut fructus terræ dare et conserváre dignéris/.test(p.latin)));
assert.equal(built.cards[3].paragraphs.filter(p=>/^ROG-R04-O/.test(p.id)).length,10);
assert.equal(built.cards.at(-1).handoff,"INTROIT");
assert.equal(built.cards.at(-1).ordinaryOpeningSuppressed,true);

const c=createRogationsReaderController({graph,payload});
c.goTo("ROG-R03");
assert.equal(c.project().participantPosture,null);
c.setProcessionalState("PARTICIPATING");
assert.equal(c.project().participantPosture,"PROCESSIONAL");
assert.equal(c.project().participantAction,"WALK_IN_PROCESSION");
c.setProcessionalState("NOT_PARTICIPATING");
assert.equal(c.project().participantPosture,"LOCAL");
c.goTo("ROG-R05");
assert.equal(c.project().handoff,"INTROIT");

console.log("native Rogations payload: PASS — full Litany corpus, actor-scoped procession and Introit handoff.");
