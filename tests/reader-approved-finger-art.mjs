import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {APPROVED_FINGER_ART,approvedFingerRubricArt} from "../src/mass/reader-approved-finger-art.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const approval=read("data/presentation/mass-icon-extension-approvals-20261011.v1.json");
const events=read("data/presentation/reader-rubric-events.v1.json").items;
const historical=read("data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const itemById=new Map(approval.entries.map(e=>[e.id,e]));

assert.deepEqual(Object.keys(APPROVED_FINGER_ART).sort(),[
  "AO.RUB.C0174.06","AO.RUB.C0248.01"
],"Only two approved priest finger illustrations may render");
for(const [eventId,art] of Object.entries(APPROVED_FINGER_ART)){
 const event=events.find(x=>x.id===eventId);
 assert.ok(event,"Source-certified priest state missing: "+eventId);
 assert.equal(event.kind,"STATE");
 assert.equal(event.actor,"PRIEST");
 assert.equal(event.stateKey,art.stateKey);
 assert.equal(event.cueId,art.cueId);
 assert.equal(approvedFingerRubricArt(event),art);
 assert.ok(art.imageUrl.endsWith("/"+art.path));
 assert.ok(existsSync(new URL("../"+art.path,import.meta.url)));
 const record=itemById.get(art.assetId);
 assert.ok(record&&record.status==="APPROVED_ARTWORK",art.assetId+" not approved");
 assert.equal(record.asset,art.path);
 assert.equal(record.runtimeBound,false,
   "Historical 11 Oct approval must not be silently rewritten");
 assert.equal(approvedFingerRubricArt({...event,actor:"FAITHFUL"}),null);
 assert.equal(approvedFingerRubricArt({...event,cueId:"AO.SM.C0001"}),null);
 assert.equal(approvedFingerRubricArt({...event,id:"AO.RUB.C0265.01"}),null);
 assert.ok(dom.includes('icon.dataset.approvedFingerEvent=event.id'),
   "Reader does not attribute artwork to the exact source event");
}
assert.equal(approvedFingerRubricArt(events.find(x=>x.id==="AO.RUB.C0174.02")),null,
  "Consecration elevation must not acquire finger-state artwork");
assert.equal(approvedFingerRubricArt(events.find(x=>x.id==="AO.RUB.C0181.02")),null,
  "Chalice elevation must not acquire finger-state artwork");
assert.equal(approvedFingerRubricArt(events.find(x=>x.id==="AO.RUB.C0248.01") &&
  {...events.find(x=>x.id==="AO.RUB.C0248.01"),kind:"ACTION"}),null);
const laterByPath=new Map(historical.items.map(i=>[i.physicalSourceId,i]));
for(const art of Object.values(APPROVED_FINGER_ART)){
 const later=laterByPath.get(art.path);
 assert.equal(later?.status,"unreviewed",
  "The October 20 historical lock is immutable; the earlier explicit approval is reconciled at presentation binding");
}
assert.ok(dom.includes("text.prepend(icon);"));
assert.ok(dom.includes("text.textContent=short;"),"Source rubric copy must remain legible");
console.log("Approved finger art: PASS — two exact priest source states, historical approvals preserved; no action/voice/position substitution.");
