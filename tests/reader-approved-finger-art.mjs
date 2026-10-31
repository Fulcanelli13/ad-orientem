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
// The rendered LIVE pictogram now replaces only its redundant visual
// caption. Source rubrics must remain available to screen readers and in the
// MISSAL's full printed red-ink direction, not be discarded from the DOM.
assert.ok(dom.includes('text.dataset.approvedInlineIcon="true"'),
  "Source-approved finger/gesture artwork must retain its exact rubric owner");
assert.ok(dom.includes('copy.className="ao-approved-inline-rubric-copy"'),
  "Accessible published source copy must remain under the icon");
assert.ok(dom.includes('copy.textContent=short;'),
  "Approved source rubric text may not be deleted");
assert.ok(dom.includes('text.setAttribute("aria-label",short)'),
  "Icon requires the complete sourced accessible label");
assert.ok(dom.includes('text.append(icon,copy);'),
  "The approved image and published text must share their exact source event");
assert.ok(dom.includes('.ao-live-rubric-action[data-approved-inline-icon="true"]'),
  "LIVE caption-replacement must be explicitly scoped to approved artwork");
assert.ok(dom.includes('.ao-reader-shell[data-mode="MISSAL"] .ao-missal-inline-rubrics'),
  "MISSAL must preserve its printed source rubric rather than hiding its text");
console.log("Approved finger art: PASS — two exact priest source states, historical approvals preserved; no action/voice/position substitution.");
