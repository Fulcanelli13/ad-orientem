import assert from "node:assert/strict";
import { DIVINUM_OFFICIUM_PIN, rewriteResolvedSourceUrl, isKnownAbsentResolvedSourceUrl, isLegacyFrenchWikisourceParserUrl, isPinned1962MissalTextUrl, installSourceTransportCompat } from "../src/app/source-transport-compat.js";

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

// Coronatio is a sourced Mass Common; rewriting it to horas loses the
// pinned EN/FR texts required by 22 February and 25 May.
for(const lang of ["Latin","English","Francais"]){
  const proper=doBase+"web/www/missa/"+lang+"/Commune/Coronatio.txt";
  assert.equal(rewriteResolvedSourceUrl(proper),proper,
    "Coronatio "+lang+" must stay in the verified Mass corpus");
  assert.equal(isKnownAbsentResolvedSourceUrl(proper),false,
    "Existing Coronatio source was classified as absent");
}
const ordinary=doBase+"web/www/missa/Latin/Sancti/10-07.txt";
assert.equal(rewriteResolvedSourceUrl(ordinary),ordinary,"ordinary Proper URL was rewritten unexpectedly");

const absent=[
  doBase+"web/www/horas/English/Commune/Coronatio.txt",
  doBase+"web/www/horas/Francais/Commune/Coronatio.txt",
  doBase+"web/www/horas/Latin/Commune/C10t.txt",
  doBase+"web/www/horas/English/Commune/C10t.txt",
  doBase+"web/www/horas/Francais/Commune/C10t.txt",
  doBase+"web/www/missa/Latin/Sancti/10-08c.txt",
  doBase+"web/www/horas/Latin/Sancti/10-08c.txt",
];
for(const url of absent)assert.equal(isKnownAbsentResolvedSourceUrl(url),true,"known pinned-absent source was not quarantined: "+url);
assert.equal(isKnownAbsentResolvedSourceUrl(ordinary),false,"valid Proper source was quarantined");

let nativeCalls=0;
class MockResponse{
  constructor(body,{status=200,statusText="",headers={}}={}){this.body=body;this.status=status;this.statusText=statusText;this.headers=headers;this.ok=status>=200&&status<300}
  clone(){return new MockResponse(this.body,{status:this.status,statusText:this.statusText,headers:this.headers})}
  async text(){return this.body}
}
const fakeWin={
  fetch:async()=>{nativeCalls++;return new MockResponse("ok",{status:200})},
  Response:MockResponse,
};
const compat=installSourceTransportCompat(fakeWin);
const miss=await fakeWin.fetch(absent[0]);
assert.equal(miss.status,404);
assert.equal(nativeCalls,0,"known absent source still emitted a network request");
for(const url of absent.filter(url=>url.endsWith("/C10t.txt"))){
  const unavailable=await fakeWin.fetch(url);
  assert.equal(unavailable.status,404,"Missing 1962 Common must remain explicitly unavailable");
  assert.equal(nativeCalls,0,"Missing 1962 Common triggered an unnecessary upstream request: "+url);
}
const coronatio=doBase+"web/www/missa/English/Commune/Coronatio.txt";
const massSource=await fakeWin.fetch(coronatio);
assert.equal(massSource.status,200,"source transport incorrectly blocked valid English Coronatio");
assert.equal(nativeCalls,1,"valid Mass Common was not fetched from its exact URI");
const hit=await fakeWin.fetch(ordinary);
assert.equal(hit.status,200);
assert.equal(nativeCalls,2,"valid source no longer reaches native fetch");
assert.equal(compat.isKnownAbsent(absent[2]),true);


// The boot-era ScriptureService used to hit the French Wikisource parse API
// during ordinary shell navigation and emit CORS console errors. It already
// treats a MediaWiki {error} envelope as SOURCE_UNAVAILABLE and keeps a
// clickable witness URL. Do not manufacture text or silently translate a
// different edition, and do not intercept ordinary external source links.
for(const title of [
  "Chaîne d’or sur l’évangile de saint Jean/Chapitre 15",
  "La sainte Bible selon la Vulgate (J.-B. Glaire)/Éphésiens",
  "Discours sur les psaumes (Augustin)/Psaumes I à X",
]){
  const api="https://fr.wikisource.org/w/api.php?action=parse&format=json&origin=*&redirects=1&prop=text&page="+encodeURIComponent(title);
  assert.equal(isLegacyFrenchWikisourceParserUrl(api),true,
    "historical French API was not classified: "+title);
  const response=await fakeWin.fetch(api);
  assert.equal(response.status,200,"API error envelope must remain parseable");
  const packet=JSON.parse(response.body);
  assert.equal(packet.error.code,"HISTORICAL_SOURCE_UNAVAILABLE_IN_BROWSER");
  assert.equal(packet.parse,undefined,"Do not forge source text or a parse payload");
  assert.equal(nativeCalls,2,"Known CORS-rejected historical API triggered an external request");
}
for(const unaffected of [
  "https://fr.wikisource.org/wiki/Chaîne_d’or_sur_l’évangile_de_saint_Jean",
  "https://fr.wikisource.org/w/api.php?action=query&list=search&format=json",
  "https://en.wikisource.org/w/api.php?action=parse&prop=text&page=Test",
  "https://fr.wikisource.org/w/api.php?action=parse&prop=text&page=Unrelated",
]){
  assert.equal(isLegacyFrenchWikisourceParserUrl(unaffected),false,
    "Source-transport guard intercepted unrelated Wikisource URL");
}
const nativeAfter=await fakeWin.fetch("https://fr.wikisource.org/wiki/Source");
assert.equal(nativeAfter.status,200);
assert.equal(nativeCalls,3,"Original historical source links must remain accessible");


// P0 / #2404: the OLD 12-second MemoryTextFetcher has no transient retries.
// This wrapper must retry only pinned immutable Mass texts, coalesce genuine
// concurrent GETs and NOT poison the cache on 404 or terminal failures.
assert.equal(isPinned1962MissalTextUrl(ordinary),true);
assert.equal(isPinned1962MissalTextUrl(coronatio),true);
assert.equal(isPinned1962MissalTextUrl(
 "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/main/web/www/missa/Latin/Sancti/10-07.txt"),false);
assert.equal(isPinned1962MissalTextUrl(
 "https://raw.githubusercontent.com/other/repo/"+DIVINUM_OFFICIUM_PIN+"/web/www/missa/Latin/Sancti/10-07.txt"),false);
assert.equal(isPinned1962MissalTextUrl(
 "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+DIVINUM_OFFICIUM_PIN+"/web/www/missa/Latin/Sancti/10-07.json"),false);
let requests=0;
const failures=[429,503,200];
const recovering={
 fetch:async()=>{
  requests++;
  const status=failures.shift()??200;
  return new MockResponse("authenticated pinned Latin",{status});
 },
 Response:MockResponse,
 setTimeout:f=>{f();return 1},
};
const retry=installSourceTransportCompat(recovering);
const [first,second]=await Promise.all([
 recovering.fetch(ordinary),recovering.fetch(ordinary)
]);
assert.equal(first.status,200);
assert.equal(second.status,200);
assert.equal(await first.text(),"authenticated pinned Latin");
assert.notStrictEqual(first,second,"Concurrent consumers must receive independent Response bodies");
assert.equal(requests,3,"429 and 503 must be retried, not treated as missing Proper texts");
assert.equal(retry.sourceRetryStatus().retries,2);
assert.equal(retry.sourceRetryStatus().coalesced,1);
assert.equal(retry.sourceRetryStatus().activePinnedRequests,0);
const notFound=installSourceTransportCompat({
 fetch:async()=>new MockResponse("",{status:404}),Response:MockResponse
});
assert.equal(notFound.installed,true);
let honest404Calls=0;
const missingWin={fetch:async()=>{honest404Calls++;return new MockResponse("",{status:404})},
 Response:MockResponse};
const missingCompat=installSourceTransportCompat(missingWin);
assert.equal((await missingWin.fetch(ordinary)).status,404);
assert.equal(honest404Calls,1,"A real pinned 404 cannot be recovered by invented text or retries");
assert.equal(missingCompat.sourceRetryStatus().retries,0);
const recoveredAfterThrow={calls:0,fetch:async function(){
 this.calls++;
 if(this.calls===1)throw Error("temporary fetch refusal");
 return new MockResponse("source returned",{status:200});
},Response:MockResponse,setTimeout:f=>{f();return 1}};
const rejectCompat=installSourceTransportCompat(recoveredAfterThrow);
assert.equal((await recoveredAfterThrow.fetch(ordinary)).status,200);
assert.equal(recoveredAfterThrow.calls,2);
assert.equal(rejectCompat.sourceRetryStatus().retries,1);
let unrelatedCalls=0;
const unrelatedWin={
 fetch:async()=>{unrelatedCalls++;return new MockResponse("not Mass",{status:503})},
 Response:MockResponse,
};
installSourceTransportCompat(unrelatedWin);
assert.equal((await unrelatedWin.fetch("https://example.org/other-file.txt")).status,503);
assert.equal(unrelatedCalls,1,"Unrelated URLs must not undergo Mass source recovery");
let terminalCalls=0;
const terminalWin={
 fetch:async()=>{terminalCalls++;return new MockResponse("",{status:503})},
 Response:MockResponse,setTimeout:f=>{f();return 1},
};
const terminal=installSourceTransportCompat(terminalWin);
assert.equal((await terminalWin.fetch(ordinary)).status,503);
assert.equal(terminalCalls,3,"Transport must stop after the bounded retry budget");
assert.equal(terminal.sourceRetryStatus().unrecovered,1);


// Verified against DivinumOfficium/divinum-officium@126a07f9 original English
// Mass files: 12 historical 2026 Proper failures all returned HTTP 501
// from the older Missalemeum mirror, never a real missing Latin source.
const missing501Paths=[
 "Quad1-0","Quad2-0","Quad2-3","Quad2-4","Quad3-0",
 "Quad4-0","Quad4-1","Quad4-2","Quad4-6",
 "Pasc2-0","Pasc5-4","Pasc7-2"
];
for(const name of missing501Paths){
 const mirror="https://raw.githubusercontent.com/mmolenda/missalemeum/"+
 "f43359b7a79a5a299158651eedf75cdaf0e43c94/"+
 "backend/resources/divinum-officium-local/web/www/missa/English/Tempora/"+
 name+".txt";
 const pinned="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 DIVINUM_OFFICIUM_PIN+"/web/www/missa/English/Tempora/"+name+".txt";
 assert.equal(rewriteResolvedSourceUrl(mirror),pinned,
  "P0 1962 English Proper mirror still routes to intermittent HTTP 501: "+name);
 assert.equal(isPinned1962MissalTextUrl(pinned),true);
}
const legacyOtherEnglish="https://raw.githubusercontent.com/mmolenda/missalemeum/"+
 "f43359b7a79a5a299158651eedf75cdaf0e43c94/"+
 "backend/resources/divinum-officium-local/web/www/missa/English/Sancti/06-24.txt";
assert.equal(rewriteResolvedSourceUrl(legacyOtherEnglish),
  "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
  DIVINUM_OFFICIUM_PIN+"/web/www/missa/English/Sancti/06-24.txt",
 "English Sanctorale must use the same pinned source authority");
const canonicalCommon="https://raw.githubusercontent.com/mmolenda/missalemeum/"+
 "f43359b7a79a5a299158651eedf75cdaf0e43c94/"+
 "backend/resources/divinum-officium-local/web/www/missa/English/Commune/C10b.txt";
assert.equal(rewriteResolvedSourceUrl(canonicalCommon),
 "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 DIVINUM_OFFICIUM_PIN+"/web/www/horas/English/Commune/C10b.txt");
assert.equal(rewriteResolvedSourceUrl(canonicalCommon.replace("C10b.txt","Coronatio.txt")),
 "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 DIVINUM_OFFICIUM_PIN+"/web/www/missa/English/Commune/Coronatio.txt");
const unrelatedEnglish=legacyOtherEnglish.replace("Sancti/06-24.txt","Votive/Cross.txt");
assert.equal(rewriteResolvedSourceUrl(unrelatedEnglish),unrelatedEnglish,
 "Mirror source remapping must not invent an unverified Votive path");
// All 42 unavailable daily Proper requests on the original baseline came
// from the legacy English mirror (20 Tempora, 21 Sancti, 1 Commune).
// Route authenticated families to immutable same-language source paths;
 // each genuinely absent file still fails 404 at its canonical destination.
const original501Sanctorale=[
 "05-12","06-05","06-06","06-25","07-02","07-03r","07-10",
 "07-20","07-22","07-23","07-25","07-31","08-14","08-21",
 "08-24","08-29","08-31","09-02","09-08","10-03","10-14"
];
for(const id of original501Sanctorale){
 const mirror="https://raw.githubusercontent.com/mmolenda/missalemeum/"+
 "f43359b7a79a5a299158651eedf75cdaf0e43c94/"+
 "backend/resources/divinum-officium-local/web/www/missa/English/Sancti/"+
 id+".txt";
 const canonical="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 DIVINUM_OFFICIUM_PIN+"/web/www/missa/English/Sancti/"+id+".txt";
 assert.equal(rewriteResolvedSourceUrl(mirror),canonical,id+" must not use the HTTP 501 mirror");
}

let verifiedPinnedHit="";
const pinnedWin={fetch:async url=>{
 verifiedPinnedHit=String(url);
 return new MockResponse("[Introitus]\\nPinned canonical English Mass source",{status:200});
},Response:MockResponse};
installSourceTransportCompat(pinnedWin);
const repath="https://raw.githubusercontent.com/mmolenda/missalemeum/"+
 "f43359b7a79a5a299158651eedf75cdaf0e43c94/"+
 "backend/resources/divinum-officium-local/web/www/missa/English/Tempora/Quad1-0.txt";
assert.equal((await pinnedWin.fetch(repath)).status,200);
assert.ok(verifiedPinnedHit.startsWith("https://raw.githubusercontent.com/DivinumOfficium/"));
assert.ok(verifiedPinnedHit.includes("/web/www/missa/English/Tempora/Quad1-0.txt"));

console.log("PASS source transport compatibility: canonical rewrites plus pinned known-absent candidates fail locally without noisy network probes.");
