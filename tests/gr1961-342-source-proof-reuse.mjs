import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 recoverSelectedPreGospelFor342,reconcile342WithSelectedMass
} from "../tools/mass/reconcile-gr1961-342-selected-proper.mjs";
import {validatedPreGospelChantParts} from "../src/mass/reader-pre-gospel-chant-source.js";

const ledger=JSON.parse(readFileSync(new URL("../data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json",import.meta.url),"utf8"));
const candidate=ledger.records.find(r=>r.tier==="STRONG_INITIAL_TEXT"&&["gr","al","tr"].includes(r.officePart));
assert.ok(candidate);
const path=candidate.sourcePaths[0];
const originalLines={
 la:["Dómine, exáudi oratiónem meam, et clamor meus ad te véniat.","Allelúja, allelúja. Exsultáte Deo, adjutóri nostro."],
 en:["Lord, hear my prayer, and let my cry come unto Thee.","Alleluia, alleluia. Rejoice to God our helper."],
 fr:["Seigneur, exaucez ma prière, que mon cri parvienne jusqu’à vous.","Alléluia, alléluia. Réjouissez-vous en Dieu notre secours."]
};
const langs=Object.fromEntries(Object.entries(originalLines).map(([key,lines])=>[key,{map:new Map([
 ["Graduale",[lines[0]]],["Alleluia",[lines[1]]],
 ]),order:["Graduale","Alleluia"]}]));
const tri={
 lat:originalLines.la.join("\n"),
 en:originalLines.en.join("\n"),
 fr:originalLines.fr.join("\n"),
};
const tr={lat:"Testis Latínus.",en:"English test.",fr:"Essai français."};
const data={sourcePath:path,gradual:tri,epistle:tr,preface:tr,
 collects:[tr],secrets:[tr],postcommunions:[tr]};
const at=date=>({date,status:"ready",day:{main:{id:"test:gr1961:selected"}},
 proper:{status:"ready",sourcePath:path,data}});
const hostCalls=[];
const hostResolver={async resolveSource(sourcePath,lang){
 hostCalls.push([sourcePath,lang]);
 assert.equal(sourcePath,path,"Never fetch any source other than selected Proper");
 return langs[lang];
}};
const cache=new Map();
const first=await recoverSelectedPreGospelFor342(ledger,at("2026-01-12"),{hostResolver,cache});
assert.equal(first.status,"SOURCE_BOUNDARY_CERTIFIED");
assert.equal(first.certified,true);
assert.equal(first.cacheHit,false);
assert.notEqual(first.actual,at("2026-01-12"));
assert.equal(first.actual.proper.data.gradual,data.gradual,"Host 1962 Latin must remain identical");
assert.equal(first.actual.proper.data.epistle,data.epistle,"Only proof, no reconstructed orations/readings");
assert.equal(first.actual.proper.data.collects,data.collects);
assert.equal(first.actual.proper.data.readerChantSourceProof.status,"SOURCE_VERIFIED_EXACT");
assert.deepEqual(validatedPreGospelChantParts(first.actual.proper.data).map(x=>x.kind),["GRADUAL","ALLELUIA"]);
assert.equal(cache.size,1);
assert.deepEqual(hostCalls,[[path,"la"],[path,"en"],[path,"fr"]]);
const another=await recoverSelectedPreGospelFor342(ledger,at("2026-01-13"),{hostResolver,cache});
assert.equal(another.status,"SOURCE_BOUNDARY_CERTIFIED");
assert.equal(another.cacheHit,true);
assert.equal(hostCalls.length,3,"Reused a fully verified source, no duplicate three-language fetch");
const changed={...at("2026-01-14"),proper:{...at("2026-01-14").proper,
 data:{...data,gradual:{...tri,fr:tri.fr+" Unrelated ending."}}}};
const variant=await recoverSelectedPreGospelFor342(ledger,changed,{hostResolver,cache});
assert.equal(variant.status,"SOURCE_BOUNDARY_UNRESOLVED");
assert.equal(variant.certified,false,"A different selected translation is NOT the original proof");
assert.equal(cache.size,2,"Full selected trilingual text, not date or path alone, owns cache");
assert.equal(hostCalls.length,6);
const res=await recoverSelectedPreGospelFor342(ledger,at("2026-01-15"),{cache});
assert.equal(res.status,"SOURCE_RESOLVER_UNAVAILABLE");
assert.equal(res.certified,false);
const badProof={...at("2026-01-16"),proper:{...at("2026-01-16").proper,
 data:{...data,readerChantSourceProof:{status:"SOURCE_VERIFIED_EXACT",sourcePath:"WRONG"}}}};
const invalid=await recoverSelectedPreGospelFor342(ledger,badProof,{hostResolver,cache});
assert.equal(invalid.status,"HOST_PROOF_INVALID");
assert.equal(invalid.certified,false);
const unchanged=await recoverSelectedPreGospelFor342(ledger,{...at("2026-01-16"),status:"failed"},{hostResolver,cache});
assert.equal(unchanged.status,"NOT_IN_RESEARCH_SCOPE");
assert.equal(unchanged.certified,false);
const screened=reconcile342WithSelectedMass(ledger,first.actual);
assert.equal(screened.readerPromotions,0);
assert.equal(screened.musicalApprovals,0);
assert.equal(screened.actualChoirProgramme,"UNKNOWN");
console.log("PASS 342-source trilingual pre-Gospel proof reuse: three-language parity, date reuse, variant hold, no source mutation or release");
