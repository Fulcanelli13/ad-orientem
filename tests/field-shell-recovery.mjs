import assert from "node:assert/strict";
import {
  rewriteBrokenFrenchSourceUrl,
  fieldDate,
  openOct4FieldStep,
} from "../src/app/field-shell-recovery.js";

const broken="https://raw.githubusercontent.com/mmolenda/missalemeum/f43359b7a79a5a299158651eedf75cdaf0e43c94/backend/resources/divinum-officium-local/web/www/missa/Francais/Sancti/10-07.txt";
assert.equal(
  rewriteBrokenFrenchSourceUrl(broken),
  "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/missa/Francais/Sancti/10-07.txt",
);
const english="https://raw.githubusercontent.com/mmolenda/missalemeum/f43359b7a79a5a299158651eedf75cdaf0e43c94/backend/resources/divinum-officium-local/web/www/missa/English/Sancti/10-07.txt";
assert.equal(rewriteBrokenFrenchSourceUrl(english),english);

assert.equal(fieldDate({AO_RUNTIME_V8:{store:{getState:()=>({selectedDate:"2026-10-04"})}}}),"2026-10-04");

const opened=[];
const fake={
  AO_MODULES:{open:async id=>{opened.push(id);return {ok:true}}},
  AO_CELEBRATION_API:{openPreflight:()=>{opened.push("mass");return true}},
};
assert.equal(await openOct4FieldStep("adoration",fake),true);
assert.equal(await openOct4FieldStep("benediction",fake),true);
assert.equal(await openOct4FieldStep("mass",fake),true);
assert.deepEqual(opened,["pray.adoration","pray.benediction","mass"]);
assert.equal(await openOct4FieldStep("unknown",fake),false);

console.log("field shell recovery: PASS — French source routing + Adoration/Benediction/Holy Rosary launcher");
