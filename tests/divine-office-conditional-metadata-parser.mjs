import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {parseConditionalOfficeMetadata}
 from "../src/office/conditional-metadata-parser.js";
const sourcePath="Sancti/11-02";
const sourceText=`[Rank]
In Commemoratione Omnium Fidelium Defunctorum;;Duplex;;3;;ex C9

[Rank] (rubrica 196)
In Commemoratione Omnium Fidelium Defunctorum;;I. classis;;6;;ex C9

[Rule]
ex C9
Psalmi Dominica
(rubrica 1955 aut rubrica 1960) No prima Vespera

[Lectio1]
Not retained in metadata.
$Unresolved
`;
test("All Souls preserves both historical rank blocks, not false 1960 appointment",()=>{
 const d=parseConditionalOfficeMetadata({sourcePath,sourceRevision:DIVINUM_OFFICIUM_PIN,sourceText});
 assert.equal(d.rankVariantBlockCount,2);
 assert.equal(d.rankWitnessCount,2);
 assert.equal(d.byKind.Rank[1].headerQualifier,"rubrica 196");
 assert.equal(d.byKind.Rank[0].rankEntries[0].sourceRankCode,"3");
 assert.equal(d.byKind.Rank[1].rankEntries[0].sourceRankCode,"6");
 assert.equal(d.byKind.Rank[1].rankEntries[0].roman1960Class,null);
 assert.equal(d.byKind.Rule.length,1);
 assert.ok(d.byKind.Rule[0].ruleTokens.some(t=>t.literal.includes("No prima Vespera")));
 assert.equal(d.class,null);
 assert.equal(d.conditionalRulesResolved,false);
 assert.equal(d.textOutputIncluded,false);
 assert.equal(JSON.stringify(d).includes("Not retained in metadata"),false);
 assert.equal(JSON.stringify(d).includes("$Unresolved"),false);
});
test("inline rubrical qualifiers retain their line identity and ordinal",()=>{
 const raw=`[Officium]
Dominica I Adventus

[Rank]
;;Semiduplex;;6.9
(sed rubrica 1960)
;;I. classis;;6.3

[Rule] (rubrica 1960)
9 lectiones
`;
 const d=parseConditionalOfficeMetadata({
  sourcePath:"Tempora/Adv1-0",sourceRevision:DIVINUM_OFFICIUM_PIN,sourceText:raw
 });
 assert.equal(d.rankVariantBlockCount,1);
 assert.equal(d.rankWitnessCount,2);
 assert.equal(d.byKind.Rank[0].lineQualifiers[0].literal,"(sed rubrica 1960)");
 assert.equal(d.byKind.Rule[0].headerQualifier,"rubrica 1960");
 assert.equal(d.byKind.Officium[0].titleHints[0].literal,"Dominica I Adventus");
 assert.equal(d.class,null);
 assert.equal(d.appointedOffice,null);
 assert.equal(d.rankQualifiersRetained,true);
});
test("metadata parser has no physical source acquisition and refuses wrong source identity",()=>{
 for(const args of [
  {sourcePath:"Sancti/../11-01"},
  {sourceRevision:"0".repeat(40)},
  {language:"en"},{sourceText:""}
 ]){
  assert.throws(()=>parseConditionalOfficeMetadata({
   sourcePath,sourceRevision:DIVINUM_OFFICIUM_PIN,sourceText,...args
  }),/OFFICE_META_SOURCE_CONTRACT_INVALID/);
 }
});
test("bad section values are refused rather than silently repaired",()=>{
 assert.throws(()=>parseConditionalOfficeMetadata({
  sourcePath,sourceRevision:DIVINUM_OFFICIUM_PIN,
  sourceText:"[Rule]\n"+("X".repeat(161))+"\n"
 }),/OFFICE_META_UNSAFE_SOURCE_VALUE/);
});
test("similarly named nonmetadata sections cannot contaminate metadata",()=>{
 const raw=`[Officium]
Title
[Rank]
;;First class;;7
[Oratio]
Excess liturgical prose must not enter the index.
[Rule]
One structural token
`;
 const d=parseConditionalOfficeMetadata({sourcePath,sourceRevision:DIVINUM_OFFICIUM_PIN,sourceText:raw});
 assert.deepEqual(d.metadataVariants.map(v=>v.kind),["Officium","Rank","Rule"]);
 assert.equal(JSON.stringify(d).includes("Excess liturgical prose"),false);
});
