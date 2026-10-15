// Reconcile Doctor person IDs using BOTH a declared historical person pairing
// and an exact nominal feast/source ID. No name substring auto-canonicalization.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=file=>JSON.parse(readFileSync(resolve(root,file),"utf8"));
const hist=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const aliases=read("data/saints/1962-doctors-historical-id-alias-review.v1.json");
const roster=read("artifacts/saints-owner-inputs/calendar-doctors-38.json");
assert.equal(hist.component_count,311);
assert.equal(aliases.proposed_pairs.length,21);
assert.equal(roster.doctors.length,38);
const byDate=new Map(hist.rows.map(r=>[r.date,r]));
const byCurrent=new Map(roster.doctors.map(d=>[d.canonicalPersonId,d]));
const sourceId=id=>typeof id==="string"&&/^sancti:\d\d-\d\d[a-z]*:[1-4]:[wr]$/.test(id);
const matching=new Map();
const oldIdentitySet=new Set();
for(const entry of aliases.proposed_pairs){
 assert(!matching.has(entry.calendar_person_id),"Duplicate Calendar person alias candidate");
 assert(!oldIdentitySet.has(entry.historical_identity_id),"Two Doctor persons cannot claim same historical person identity");
 assert(entry.historical_identity_id!==entry.calendar_person_id,"No false alias where canonical ids match");
 assert(byCurrent.has(entry.calendar_person_id),"Alias has no Calendar owner record");
 assert(/^saint\.[a-z0-9-]+$/.test(entry.historical_identity_id));
 assert(["EXACT_DAY_AND_ORIGINAL_SOURCE_ID_REQUIRED","SOURCE_COLOUR_DISCREPANCY_HOLD"].includes(entry.expected_review));
 matching.set(entry.calendar_person_id,entry);
 oldIdentitySet.add(entry.historical_identity_id);
}
const outcomes=[];
for(const doc of roster.doctors){
 const date=doc.liturgicalDate1962??null;
 const source=doc.observanceSourceIdentity??null;
 const alias=matching.get(doc.canonicalPersonId)??null;
 if(!source||!date){
  assert(!alias,"Cannot promote later Doctor using date-less alias");
  outcomes.push({doctor_id:doc.canonicalPersonId,doctor_name:doc.name,nominal_date:null,
   calendar_1962_source_id:null,historic_id:null,match_status:"NO_1962_SOURCE_ID_IN_CURRENT_OWNER",
   reason:"Neither a nominal 1962 source ID nor historical person identity is asserted in this Calendar Doctor roster",
   doctor_declaration_after_1962:!!doc.recognitionAfter1962,creates_1962_title:false});
  continue;
 }
 assert(sourceId(source),"Unexpected source ID "+source);
 const row=byDate.get(date);
 assert(row,"Doctor's 1962 nominal date not in original 252 Saints art dates: "+doc.canonicalPersonId+" "+date);
 const claimedId=alias?.historical_identity_id??doc.canonicalPersonId;
 const persons=row.components.filter(c=>c.historical_identity_id===claimedId);
 assert.equal(persons.length,1,"Historical Doctor counterpart not unique on claimed date: "+doc.canonicalPersonId+" / "+claimedId);
 assert(claimedId.startsWith("saint."),"Doctor counterpart is not a person namespace");
 const oldSources=row.original_source_observances.map(x=>x.id);
 const compatible=oldSources.includes(source);
 if(!compatible)assert.equal(doc.canonicalPersonId,"saint.ephrem",
   "Unexpected source revision; do not promote an identity despite differing source IDs: "+doc.canonicalPersonId);
 if(alias?.expected_review==="SOURCE_COLOUR_DISCREPANCY_HOLD")assert(!compatible,"Ephrem conflict must not be normalized away without owner review");
 else assert(compatible,"Exact sanctioned source identity missing: "+doc.canonicalPersonId);
 const other=row.components.filter(c=>c.historical_identity_id!==claimedId).map(c=>c.historical_identity_id);
 const status=!compatible?"DIFFERING_OLD_NEW_LITURGICAL_SOURCE_ID_HOLD":
   alias?"EXPLICIT_ALIAS_SOURCE_AND_DATE_COMPATIBLE_PENDING_OWNER_REVIEW":
   "EXACT_ID_SOURCE_AND_DATE_COMPATIBLE";
 outcomes.push({doctor_id:doc.canonicalPersonId,doctor_name:doc.name,
  nominal_date:date,calendar_1962_source_id:source,historic_id:claimedId,
  historic_display_name:persons[0].display_name,
  historical_component_id:persons[0].historical_component_id,
  historical_source_ids:oldSources,
  other_historical_identities_on_same_date:other,
  historical_person_semantic_class:persons[0].historical_representation_mode,
  match_status:status,doctor_declaration_after_1962:!!doc.recognitionAfter1962,
  creates_1962_title:false,source_owner:"Calendar PR #1226 pinned Doctors roster",
  old_engine_owner:"Frozen v43.33 Saints art source occurrences"});
}
const byStatus=Object.fromEntries([...new Set(outcomes.map(x=>x.match_status))].map(s=>[s,outcomes.filter(x=>x.match_status===s).length]));
assert.deepEqual(byStatus,{
 EXACT_ID_SOURCE_AND_DATE_COMPATIBLE:13,
 EXPLICIT_ALIAS_SOURCE_AND_DATE_COMPATIBLE_PENDING_OWNER_REVIEW:20,
 DIFFERING_OLD_NEW_LITURGICAL_SOURCE_ID_HOLD:1,
 NO_1962_SOURCE_ID_IN_CURRENT_OWNER:4,
});
const ephrem=outcomes.find(x=>x.doctor_id==="saint.ephrem");
assert.equal(ephrem.match_status,"DIFFERING_OLD_NEW_LITURGICAL_SOURCE_ID_HOLD");
assert(ephrem.historical_source_ids.includes("sancti:06-18:3:r"));
assert.equal(ephrem.calendar_1962_source_id,"sancti:06-18:3:w");
assert(outcomes.every(x=>!x.creates_1962_title));
assert(outcomes.filter(x=>x.other_historical_identities_on_same_date?.length).every(x=>
 x.historical_component_id&&!x.other_historical_identities_on_same_date.includes(x.historic_id)));
const result={
 schema:"ao.saints.1962-doctors-original-identity-source-review.v1",
 publication:"RESEARCH_ONLY_NOT_A_CERTIFIED_PERSON_ID_MIGRATION",
 owners:{
  old:"data/saints/historical-v4333-311-components.recovered.v1.json",
  doctor:"Calendar PR #1226 data/calendar/doctors-of-church-roster.review.v1.json",
  aliases:"data/saints/1962-doctors-historical-id-alias-review.v1.json"
 },
 method:"Pair explicitly reviewed historical name ID on same nominal MM-DD; require exact historical source ID in old calendar block; preserve source mismatches as held.",
 cautions:[
 "Source/date compatibility provides a careful candidate identity bridge, not independent beatification, canonization, saint biography or all-year 1962 rubrical certification",
 "One calendrical day can hold more than one person; source identity alone would conflate same-day commemorations, so component person IDs are explicitly paired",
 "Doctor titles declared after 1962 are current honorifics, never retroactive liturgical grades or default 1962 feast titles",
 "Ephrem old red source and modern white source must be reviewed by Calendar owner before any canonical ID conversion",
 "Four post-1962 Doctor-roster entries without nominal source are not historical-calendar omission claims",
 "No mass option, proper, saint record, physical map pin, relic authenticity, artwork or canonical Calendar owner changed"
 ],
 counts:{all_doctors:38,...byStatus,source_compatible_exact_or_explicit_alias:33,
  currently_promoted_canonical_person_links:0,legacy_calendars_mutated:0},
 rows:outcomes
};
const output=resolve(root,"artifacts/saints-calendar-census/saints-38-doctors-historical-id-review.json");
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log("PASS historic 38 Doctors conservative original-source identity reconciliation: "+JSON.stringify(result.counts));
