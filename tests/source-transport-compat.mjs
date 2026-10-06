import assert from "node:assert/strict";
import { DIVINUM_OFFICIUM_PIN, rewriteResolvedSourceUrl, isKnownAbsentResolvedSourceUrl, installSourceTransportCompat } from "../src/app/source-transport-compat.js";

const missalemeumBase="https://raw.githubusercontent.com/mmolenda/missalemeum/f43359b7a79a5a299158651eedf75cdaf0e43c94/backend/resources/divinum-officium-local/web/www/missa/Francais/";
assert.equal(
  rewriteResolvedSourceUrl(missalemeumBase+"Tempora/Pent19-0.txt"),
  `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/web/www/missa/Francais/Tempora/Pent19-0.txt`,
  "broken Missalemeum French temporal source did not redirect to pinned Divinum Officium"
);
assert.equal(
  rewriteResolvedSourceUrl(missalemeumBase+"Commune/C3a.txt"),
  `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/web/www/horas/Francais/Commune/C3a.txt`,
  "French Common did not redirect to the canonical horas tree"
);

const doBase=`https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/`;
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/Latin/Commune/C5.txt"),
  doBase+"web/www/horas/Latin/Commune/C5.txt"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/English/Commune/C7a.txt"),
  doBase+"web/www/horas/English/Commune/C7a.txt"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"obsolete/missa/French/Commune/C4b.txt"),
  doBase+"web/www/horas/Francais/Commune/C4b.txt"
);

const ordinary=doBase+"web/www/missa/Latin/Sancti/10-07.txt";
assert.equal(rewriteResolvedSourceUrl(ordinary),ordinary,"ordinary Proper URL was rewritten unexpectedly");

const absent=[
  doBase+"web/www/horas/English/Commune/Coronatio.txt",
  doBase+"web/www/horas/Francais/Commune/Coronatio.txt",
  doBase+"web/www/missa/Latin/Sancti/10-08c.txt",
  doBase+"web/www/horas/Latin/Sancti/10-08c.txt",
];
for(const url of absent)assert.equal(isKnownAbsentResolvedSourceUrl(url),true,"known pinned-absent source was not quarantined: "+url);
assert.equal(isKnownAbsentResolvedSourceUrl(ordinary),false,"valid Proper source was quarantined");

let nativeCalls=0;
class MockResponse{
  constructor(body,{status=200,statusText="",headers={}}={}){this.body=body;this.status=status;this.statusText=statusText;this.headers=headers;this.ok=status>=200&&status<300}
}
const fakeWin={
  fetch:async()=>{nativeCalls++;return new MockResponse("ok",{status:200})},
  Response:MockResponse,
};
const compat=installSourceTransportCompat(fakeWin);
const miss=await fakeWin.fetch(absent[0]);
assert.equal(miss.status,404);
assert.equal(nativeCalls,0,"known absent source still emitted a network request");
const hit=await fakeWin.fetch(ordinary);
assert.equal(hit.status,200);
assert.equal(nativeCalls,1,"valid source no longer reaches native fetch");
assert.equal(compat.isKnownAbsent(absent[2]),true);

console.log("PASS source transport compatibility: canonical rewrites plus pinned known-absent candidates fail locally without noisy network probes.");
