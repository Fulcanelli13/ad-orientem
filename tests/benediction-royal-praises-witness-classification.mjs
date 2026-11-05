import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {
 CHRIST_KING_WITNESSES,
 CHRIST_KING_OPTION_DEFAULTS,
 CHRIST_KING_ROYAL_PRAISES,
 CHRIST_KING_LAUDES_SECTIONS,
 christKingStages
} from "../src/pray/christ-king-benediction.js";

const runtime=readFileSync(fileURLToPath(new URL("../src/pray/presentation-runtime.js",import.meta.url)),"utf8");

assert.match(CHRIST_KING_WITNESSES.royalPraises,/^https:\/\/www\.vatican\.va\/news_services\/liturgy\/libretti\/2012\/20121007\.pdf$/);
assert.match(CHRIST_KING_WITNESSES.royalPraisesICKSPIndex,/^https:\/\/www\.icrsp\.org\/Livres\/pub-livret-de-chant-reactualise-24-fevrier-2009\.pdf$/);
assert.equal(CHRIST_KING_WITNESSES.royalPraisesICKSPSourceKind,
 "ADVERTISEMENT_CONTENTS_LIST_ONLY_NOT_CHANT_EDITION",
 "The 2009 PDF is a two-page preorder advertisement, not the actual chant music");
assert.match(CHRIST_KING_ROYAL_PRAISES.sourceEdition,/2012.*pages 26–41/);
assert.match(CHRIST_KING_ROYAL_PRAISES.sourceEdition,/2009 preorder advertisement merely lists/);
assert.match(CHRIST_KING_ROYAL_PRAISES.sourceEdition,/NOT a chant-text or score witness/);
assert.equal(CHRIST_KING_ROYAL_PRAISES.sourceStatus,"ATTESTED_2012_WITNESS_NOT_VERIFIED_LOCAL_2026");
assert.equal(CHRIST_KING_LAUDES_SECTIONS.length,4);
for(const language of ["en","fr","la"]){
 assert.ok(CHRIST_KING_ROYAL_PRAISES[language].length>2800,
  "Must preserve the complete 2012 four-part source presentation: "+language);
 assert.match(CHRIST_KING_ROYAL_PRAISES[language],/Christus vincit|Christ conquers|Le Christ vainc/);
}
assert.deepEqual(Object.values(CHRIST_KING_OPTION_DEFAULTS),[false,false,false,false]);
assert.deepEqual(christKingStages([["exposition"],["adoration"],["hymn"],["prayer"],["blessing"],["praises"],["reposition"]],"christKing").map(x=>x[0]),
 ["exposition","adoration","hymn","prayer","blessing","praises","reposition"]);
assert.ok(runtime.includes("ICKSP 2009 preorder brochure · contents list only, not a score"),
 "English reader must not describe the advertisement as an authenticated chant book");
assert.ok(runtime.includes("Publicité ICRSP 2009 · liste des chants uniquement, non une partition"),
 "French reader must identify the advertisement distinctly from a chant edition");
assert.ok(runtime.includes("CHRIST_KING_WITNESSES.royalPraisesICKSPIndex"),
 "Keep the primary advertisement link as an independently labelled context source");
assert.ok(!runtime.includes("ICKSP chant book · Pope, bishop and faithful verses"));
assert.ok(runtime.includes("2012 Royal Praises witness · not a prescribed local 1962 chant"),
 "Preserve distinction between Vatican 2012 witness and local rite");
console.log("PASS Benediction Laudes provenance: 2009 ICKSP advertisement not score, Vatican 2012 primary witness, 4 sections and unchanged optional 7-stage rite");
