import assert from "node:assert/strict";
import { DIVINUM_OFFICIUM_PIN, rewriteResolvedSourceUrl, isKnownAbsentResolvedSourceUrl, isLegacyFrenchWikisourceParserUrl, installSourceTransportCompat } from "../src/app/source-transport-compat.js";

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

console.log("PASS source transport compatibility: canonical rewrites plus pinned known-absent candidates fail locally without noisy network probes.");
