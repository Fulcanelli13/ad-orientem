import assert from "node:assert/strict";
import { repairResolvedProper } from "../src/app/proper-runtime-repair.js";

const maps={
  la:new Map([
    ["Secreta",["Hæc múnera, quǽsumus, Dómine.","$Per Dominum"]],
    ["Postcommunio",["Tua nos, Dómine, medicinális operátio.","$Per Dominum"]],
    ["Lectio",["Léctio Epístolæ beáti Pauli.","!Ephes 4:23-28","Fratres: Renovámini."]],
  ]),
  en:new Map([
    ["Secreta",["Grant, we beseech You, O Lord.","$Per Dominum"]],
    ["Postcommunio",["May Your healing power, O Lord.","$Per Dominum"]],
    ["Lectio",["Lesson from the letter of St. Paul.","!Eph 4:23-28","Brethren: Be renewed."]],
  ]),
  fr:new Map([
    ["Secreta",["Ces offrandes, Seigneur.","$Per Dominum"]],
    ["Postcommunio",["Que votre action guérissante, Seigneur.","$Per Dominum"]],
    ["Lectio",["Léctio Epístolæ beáti Pauli.","!Ephes 4:23-28","Frères, renouvelez-vous."]],
  ]),
};
const resolver={
  properResolver:{
    async resolveSource(_path,language){return{map:maps[language],order:[...maps[language].keys()]};},
  },
};
const result={
  status:"ready",
  proper:{status:"ready",data:{
    sourcePath:"Tempora/Pent19-0",
    secrets:[],secret:{},
    postcommunions:[],postcommunion:{},
    epistle:{},
  }},
  diagnostic:{warnings:[]},
};
const repaired=await repairResolvedProper(result,resolver);
const p=repaired.proper.data;
assert.equal(p.secrets.length,1);
assert.match(p.secret.lat,/Hæc múnera/);
assert.match(p.secret.fr,/Ces offrandes/);
assert.equal(p.postcommunions.length,1);
assert.match(p.postcommunion.en,/healing power/);
assert.match(p.epistle.en,/Brethren: Be renewed/);
assert.deepEqual([...p.runtimeSourceRepair.recovered],["SECRET_SET","POSTCOMMUNION_SET","EPISTLE_OR_LESSON"]);
assert.match(repaired.diagnostic.warnings[0],/Recovered base Proper sections/);

console.log("PASS proper runtime repair: sourced base Secret/Postcommunion/Lesson restored without weakening reader gates.");
