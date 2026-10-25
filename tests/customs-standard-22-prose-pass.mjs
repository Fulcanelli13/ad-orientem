import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
import {validationErrors,fingerprint} from "../tools/customs/editorial-acceptance-contract.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const manifest=read("data/customs/editorial-final-acceptance.v1.json");
const ids=manifest.records.filter(x=>x.priority==="STANDARD").map(x=>x.custom_id);
assert.equal(ids.length,22);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37);
assert.deepEqual(validationErrors(manifest),[]);
const checks={
"XMAS-001":[/unconsecrated bread/i,/pain non consacré/],
"EPIP-001":[/local parish campaign/i,/campagne paroissiale locale/],
"EPIP-002":[/not rites of the Epiphany Mass/i,/non des rites de la messe/],
"CORP-001":[/optional local traditions/i,/coutumes locales facultatives/],
"EAST-001":[/not a Eucharistic procession/i,/ni une procession eucharistique/],
"DOM-002":[/does not bless its own contents/i,/ne bénit pas lui-même/],
"DOM-006":[/not a substitute for Mass/i,/ne remplace pas la messe/],
"DOM-007":[/does not itself confer a liturgical blessing/i,/ne vaut pas bénédiction liturgique/],
"DEV-001":[/do not establish an additional liturgical season/i,/n'ajoutent pas un temps liturgique/],
"DEV-009":[/neither purchases a favor/i,/n'achète aucune faveur/],
"DEAD-001":[/not a superstitious duty/i,/sans obligation superstitieuse/],
"DEAD-003":[/2 November/i,/2 novembre/],
"DOM-003":[/a sacramental/i,/c'est un sacramental/],
"DOM-013":[/not protective talismans/i,/non des talismans protecteurs/],
"NDAY-001":[/does not determine the patron automatically/i,/ne suffit pas à déterminer/],
"PATR-001":[/Chantelle/i,/Chantelle/],
"MARI-001":[/only where one is locally announced/i,/annoncée localement/],
"SANT-001":[/never payment for a miracle/i,/jamais le paiement d'un miracle/],
"SCHR-001":[/careful driving and maintenance/i,/prudence au volant ni l'entretien/],
"SNIC-001":[/avoid frightening portrayals/i,/mises en scène effrayantes/],
"BLSS-002":[/neither medicine nor protective charms/i,/ni des médicaments ni des talismans/],
"BLSS-004":[/never replaces the Easter Vigil/i,/ne remplace pas la Vigile pascale/]
};
for(const id of ids){
 const a=calendarCustomArticle(id);assert.ok(a,id+" needs published article");
 assert.match(a.caution.en,checks[id][0],id+" reader-facing English caution");
 assert.match(a.caution.fr,checks[id][1],id+" reader-facing French caution");
 assert.doesNotMatch(a.caution.en,/do not infer|in-app|module owns|Calendar owns|reader retains|avoid superstition framing|Present as a historical|Mass reader|no invented|No contact or money spending is required by the app|Keep distinct from DOM-/i,id+" internal QA prose must not leak");
 for(const dim of ["final_en","final_fr","final_claims"])assert.match(fingerprint(id,dim),/^[a-f0-9]{64}$/);
 const m=manifest.records.find(x=>x.custom_id===id);
 assert.equal(m.final_en.decision,"PENDING");
 assert.equal(m.final_fr.decision,"PENDING");
 assert.equal(m.final_claims.decision,"PENDING");
}
for(const path of ["data/customs/customs-p0-guidance-en-fr.v1.json","data/customs/customs-p1-guidance-en-fr.v1.json","data/customs/customs-fr-canonical-copy.v1.json"]){
 const j=read(path);
 for(const row of j.entries)if(ids.includes(row.custom_id)&&row.caution_fr!=null)assert.equal(row.caution_fr,calendarCustomArticle(row.custom_id).caution.fr,path+" stale caution "+row.custom_id);
}
const folios=read("data/customs/customs-historical-folios.v1.json");
for(const row of folios.entries){if(!ids.includes(row.custom_id))continue;const a=calendarCustomArticle(row.custom_id);assert.equal(row.history_en,a.history.en);assert.equal(row.history_fr,a.history.fr);}
console.log("PASS 22 standard customs: clear public EN/FR cautions, backing registers aligned, historic folios unchanged and human decisions pending");
