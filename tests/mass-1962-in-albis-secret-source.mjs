import assert from "node:assert/strict";
import pinned from "../data/mass/1962-in-albis-secret-source.v1.json" with {type:"json"};
import {recoverReaderProperOmissions} from "../src/mass/reader-proper-runtime-recovery.js";
import {recover1962InAlbisSecretFromPinnedSource,
  hasExact1962InAlbisSecretSourceOwner} from "../src/mass/1962-in-albis-secret-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const PER_DOM={
 la:"Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
 en:"Through our Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
 fr:"Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
};
const normalizer=(lines,language)=>lines.map(row=>row==="$Per Dominum"?PER_DOM[language]:row).join("\n");
const ID="tempora:Pasc1-0:1:w",PATH="Tempora/Pasc1-0";
const fixed=(secrets=[],change={})=>({
 sourcePath:PATH,principalCelebrationId:ID,
 introit:{lat:"Introit",en:"Introit",fr:"Introït"},
 collects:[{lat:"Collecta",en:"Collect",fr:"Collecte"}],
 epistle:{lat:"Epistola",en:"Epistle",fr:"Épître"},
 gradual:{lat:"Graduale",en:"Gradual",fr:"Graduel"},
 gospel:{lat:"Evangelium",en:"Gospel",fr:"Évangile"},
 offertory:{lat:"Offertorium",en:"Offertory",fr:"Offertoire"},
 secrets,preface:{lat:"Paschalis\nVere dignum sed in hoc potíssimum cum Pascha nostrum immolátus est Christus",
  en:"Easter",fr:"Pâques"},
 communion:{lat:"Communio",en:"Communion",fr:"Communion"},
 postcommunions:[{lat:"Postcommunio",en:"Postcommunion",fr:"Postcommunion"}],
 ...change
});
const owner=fixed();
assert.equal(hasExact1962InAlbisSecretSourceOwner(owner,ID),true);
assert.equal(pinned.schema,"AO_IN_ALBIS_1962_SECRET_SOURCE_V1");
assert.equal(pinned.section,"Secreta");
for(const language of ["la","en","fr"]){
 assert.match(pinned.languages[language].gitBlobSha,/^[a-f0-9]{40}$/);
 assert.equal(pinned.languages[language].rows.length,2);
 assert.ok(pinned.languages[language].url.includes("/Tempora/Pasc1-0.txt"));
}
assert.equal(pinned.languages.fr.rows[0],"$Per Dominum.",
 "Preserve upstream French row order in the permanent source archive");
const recovered=recover1962InAlbisSecretFromPinnedSource(owner,ID,normalizer);
assert.ok(recovered);
assert.match(recovered.lat,/^Súscipe múnera, Dómine/);
assert.match(recovered.en,/^Receive, we beseech Thee/);
assert.match(recovered.fr,/^Accueillez, Seigneur/);
assert.match(recovered.fr,/bonheur sans fin\.\nPar Notre-Seigneur Jésus-Christ/);
assert.equal(recovered.recoveryScope,"DOMINICA_IN_ALBIS_1962_EXACT_SOURCE");
assert.deepEqual(Object.keys(recovered.sourceEvidence.languages),["lat","en","fr"]);
assert.equal(recovered.sourceEvidence.languages.fr.gitBlobSha,
 "c7fa2dd5d87151062f519a80cfb5dd10a61fea9f");
assert.equal(owner.secrets.length,0,"Source was mutated");

// The canonical recovery worker must make the missing Secret ready without
// seeking a guessed alternative prayer from the remote donor self-reference.
const mockHost={async resolveSource(){throw Error("bad donor section must never be queried")}};
const complete=await recoverReaderProperOmissions(owner,{hostResolver:mockHost,principalCelebrationId:ID});
assert.notEqual(complete,owner);
assert.equal(complete.secrets.length,1);
assert.equal(complete.secrets[0].lat,recovered.lat);
assert.equal(complete.secrets[0].en,recovered.en);
assert.equal(complete.secrets[0].fr,recovered.fr);
assert.equal(complete.secret,complete.secrets[0]);
const slots=properToReaderSlots(complete,{language:"fr"});
assert.equal(slots.slots.SECRET_SET.status,"READY");
assert.equal(slots.slots.SECRET_SET.data.paragraphs.length,1);
assert.equal(slots.slots.SECRET_SET.data.paragraphs[0].sourcePath,"Tempora/Pasc1-0:Secreta");
assert.match(slots.slots.SECRET_SET.data.paragraphs[0].vernacular,/Accueillez, Seigneur/);
assert.ok(!slots.slots.SECRET_SET.data.paragraphs[0].vernacular.startsWith("Par Notre-Seigneur"));
assert.equal(owner.secrets.length,0);

// Never repair the wrong date, source, selected formula, or partially
// conflicting source text. Also do not suppress unresolved commemorations.
for(const [reason,changed,id] of [
 ["wrong identity",{}, "tempora:Pasc1-1:1:w"],
 ["wrong path",{sourcePath:"Tempora/Pasc1-1"},ID],
 ["votive",{requestedCelebrationId:"votive"},ID],
 ["requiem",{riteProfile:"requiem"},ID],
 ["commemorations",{calendarCommemorations:[{path:"Sancti/04-12"}]},ID],
 ["applied commemoration",{appliedCommemorations:[{path:"Sancti/04-12"}]},ID],
 ["conflicting owner",{principalCelebrationId:"tempora:Pasc0-6:1:w"},ID],
 ["wrong Latin",{secrets:[{lat:"Alien secret Latin text that is not the same as this one",en:"",fr:""}]},ID],
 ["wrong French",{secrets:[{lat:"",en:"",fr:"O Seigneur, autre texte de la secrète non correspondante."}]},ID],
 ["already present",{secrets:[{lat:recovered.lat,en:recovered.en,fr:recovered.fr}]},ID],
 ["several Secrets",{secrets:[{lat:"",en:"",fr:""},{lat:"",en:"",fr:""}]},ID]
]){
 const sample=fixed([],changed);
 assert.equal(recover1962InAlbisSecretFromPinnedSource(sample,id,normalizer),null,reason);
}
const missingOnlyFrench=fixed([{lat:recovered.lat,en:recovered.en,fr:""}]);
assert.equal((await recoverReaderProperOmissions(missingOnlyFrench,{
 hostResolver:mockHost,principalCelebrationId:ID
})).secrets[0].fr,recovered.fr,
 "Recover exact missing French even when the Latin Secret already exists");
const wrongPartial=fixed([{lat:recovered.lat,en:"An unrelated Secret from another Mass",fr:""}]);
assert.equal(recover1962InAlbisSecretFromPinnedSource(wrongPartial,ID,normalizer),null,
 "Existing conflicting English must never be overwritten by the pinned source");
// The donor [Secreta] is an exact circular pointer; its original
// @ marker may be stripped by the normalizer. Only this named marker
// can be regarded as missing, never a different referenced prayer.
for(const pointer of [
 "@Tempora/Pasc1-0:Secreta","Tempora/Pasc1-0:Secreta"
]){
 const circular=fixed([{lat:pointer,en:pointer,fr:pointer}]);
 const replaced=recover1962InAlbisSecretFromPinnedSource(circular,ID,normalizer);
 assert.ok(replaced,"Pinned donor circular pointer not recognized: "+pointer);
 assert.equal(replaced.lat,recovered.lat);
}
for(const pointer of [
 "@Tempora/Pasc1-1:Secreta","Tempora/Pasc1-1:Secreta",
 "@Sancti/04-12:Secreta","@Tempora/Pasc1-0:Postcommunio"
]){
 assert.equal(recover1962InAlbisSecretFromPinnedSource(
   fixed([{lat:pointer,en:"",fr:""}]),ID,normalizer),null,
   "Foreign named-source pointer improperly accepted: "+pointer);
}
const placeholder=fixed([{lat:"",en:"$Per Dominum",fr:""}]);
assert.ok(recover1962InAlbisSecretFromPinnedSource(placeholder,ID,normalizer),
 "Unresolved source macro is not an authentic conflicting translated Secret");

console.log("PASS In Albis (1962) Secret: exact git-blob-pinned trilingual prayer, French macro reposition, source-first recovery, native reader Secret slot, no mismatched Mass substitution.");
