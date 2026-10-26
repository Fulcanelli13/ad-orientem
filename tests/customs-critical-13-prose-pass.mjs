import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
import {validationErrors,fingerprint} from "../tools/customs/editorial-acceptance-contract.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const manifest=read("data/customs/editorial-final-acceptance.v1.json");
const ids=manifest.records.filter(x=>x.priority==="CRITICAL_SCOPE").map(x=>x.custom_id);
assert.equal(ids.length,13);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37);
assert.deepEqual(validationErrors(manifest),[]);
const expectations={
"LIFE-002":[/not ritually impure/i,/n'est pas rituellement impure/],
"DEV-006":[/current programme/i,/programme actuel/],
"DEV-010":[/does not purchase grace/i,/n'achète pas la grâce/],
"DOM-011":[/beside the deceased/i,/auprès des défunts/],
"BLSS-001":[/authorized minister/i,/ministre habilité/],
"SJOS-001":[/No particular menu/i,/Aucun menu/],
"BLSS-003":[/poisoned-wine story is a legend/i,/vin empoisonné est une légende/],
"ADVT-001":[/household devotion/i,/dévotion familiale/],
"ADVT-002":[/not a measure of grace/i,/ne mesure ni la grâce/],
"ADVT-003":[/not a required liturgical procession/i,/non une procession liturgique imposée/],
"HTHU-001":[/Seven church visits are not required/i,/sept églises n'est pas obligatoire/],
"ROGA-001":[/Private family prayer is distinct/i,/prière familiale privée se distingue/],
"MARI-002":[/not proof of medicinal virtues/i,/non des preuves de vertus médicinales/]
};
for(const id of ids){const a=calendarCustomArticle(id);assert.ok(a);const [en,fr]=expectations[id];
 assert.match(a.caution.en,en,id+" should explain specific historical/sacramental boundary in EN");
 assert.match(a.caution.fr,fr,id+" should explain specific historical/sacramental boundary in FR");
 assert.doesNotMatch(a.caution.en,/Do not imply|No in-app|app law|app-provided|Mass reader owns|Preserve the anti-misconception|inferred schedule/i,id+" internal QA language leaked");
 for(const dim of ["final_en","final_fr","final_claims"])assert.match(fingerprint(id,dim),/^[0-9a-f]{64}$/);
 const record=manifest.records.find(x=>x.custom_id===id);
 assert.equal(record.final_en.decision,"PENDING");assert.equal(record.final_fr.decision,"PENDING");assert.equal(record.final_claims.decision,"PENDING");
}
for(const path of ["data/customs/customs-p0-guidance-en-fr.v1.json","data/customs/customs-p1-guidance-en-fr.v1.json","data/customs/customs-fr-canonical-copy.v1.json"]){const data=read(path);
 for(const row of data.entries){if(!ids.includes(row.custom_id)||row.caution_fr==null)continue;assert.equal(row.caution_fr,calendarCustomArticle(row.custom_id).caution.fr,path+" contains old "+row.custom_id);}
}
const historical=read("data/customs/customs-historical-folios.v1.json");
for(const row of historical.entries){if(!ids.includes(row.custom_id))continue;const a=calendarCustomArticle(row.custom_id);assert.equal(row.history_en,a.history.en);assert.equal(row.history_fr,a.history.fr);}
console.log("PASS source-critical 13 customs: public-facing EN/FR cautions, source and supporting-copy consistency, final human signoff still pending");
