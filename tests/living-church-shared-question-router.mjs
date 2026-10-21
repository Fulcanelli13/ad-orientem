import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createSharedQuestionRouter,SHARED_QUESTION_ROUTER_VERSION} from "../src/learn/living-church-shared-question-router.js";

const j=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const registry=await j("data/learn/living-church-shared-question-routing-pilot.v1.json");
const historicalPointers=await j("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
const en=await j("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const it=await j("data/learn/ltfaith-pius-x-it-witness-index.v1.json");
const gloss=[...(await j("data/glossary/concepts-001-150.v1.json")).entries,
 ...(await j("data/glossary/concepts-151-300.v1.json")).entries,
 ...(await j("data/glossary/concepts-301-450.v1.json")).entries];
const byGloss=new Map(gloss.map(x=>[x.id,x]));
const guide=await j("data/presentation/guide-registry.v1.json");
const apol=await j("data/learn/apologetics-canonical.v1.json");
const apolIds=new Set(apol.dossiers.map(x=>x.id));
const crisis=await j("data/learn/church-crisis-canonical.v1.json");
const crisisIds=new Set(crisis.dossiers.map(x=>x.id));
assert.equal(crisis.status,"FROZEN_TARGET_NOT_YET_PUBLISHED");
assert.equal(apol.status,"FROZEN_TARGET_NOT_YET_PUBLISHED");
assert.equal(guide.status,"RECOVERED_CONTINUITY_CERTIFIED");
const byEN=new Map(en.entries.map(x=>[x.q,x]));
const byIT=new Map(it.entries.map(x=>[x.q,x]));
assert.equal(registry.schema,"AO_LIVING_CHURCH_SHARED_QUESTION_ROUTING_PILOT_V1");
assert.equal(registry.state,"RESEARCH_ONLY_NOT_IN_APP");
assert.equal(registry.pilotLimits.topics,197);
assert.equal(registry.pilotLimits.approvedConversationalAnswers,0);
assert.equal(registry.policy.canGenerateNewDoctrinalAnswer,false);
assert.equal(registry.policy.canGeneratePastoralConclusion,false);
assert.equal(registry.policy.answerTextIncluded,false);
assert.equal(registry.policy.historicalSpeechClaim,false);
assert.equal(registry.policy.explicitUserAcceptanceRequired,true);
assert.equal(registry.pilotLimits.maxTransfersPerQuestion,1);
assert.equal(registry.topics.length,197);
assert.equal(registry.pilotLimits.sourceNavigableTopics,107);
assert.equal(registry.pilotLimits.newGuideMomentsIndexed,18);
assert.equal(registry.pilotLimits.totalCanonGuideTopics,28);
assert.equal(registry.topics.filter(t=>t.category==="canon_guide_existing_moment").length,18);
assert.equal(registry.pilotLimits.apologeticsDossiersIndexed,60);
assert.equal(registry.pilotLimits.researchOnlyUnpublishedAnswerCount,85);
assert.equal(registry.pilotLimits.retrievalQualityCertified,false);
assert.equal(registry.pilotLimits.sourceGapTopics,90);
assert.equal(registry.policy.referralRequiresExactRelevantSource,true);
assert.equal(registry.policy.genericRouteIsNotEvidence,true);
assert.deepEqual(Object.fromEntries(["pius-x","canon","sacristan"].map(k=>[k,registry.topics.filter(x=>x.character===k).length])),
 {"pius-x":46,canon:116,sacristan:35});
const topics=new Set();
for(const topic of registry.topics){
 assert.ok(!topics.has(topic.id),"duplicate "+topic.id);topics.add(topic.id);
 assert.equal(topic.approvedReply,false);
 assert.ok(["SOURCE_NAVIGATION_ONLY","SOURCE_GAP"].includes(topic.coverage));
 if(topic.coverage==="SOURCE_GAP"){
  assert.equal(topic.sourceRefs.length,0);assert.ok(topic.sourceGapReason.length>50);
  for(const research of topic.researchRefs||[]){
   assert.ok(["APOLOGETICS_CANONICAL_V1","CHURCH_CRISIS_CANONICAL_V1"].includes(research.owner));
   if(research.owner==="APOLOGETICS_CANONICAL_V1")assert.ok(apolIds.has(research.ref));
   else assert.ok(crisisIds.has(research.ref));
  }
 }
 else assert.ok(topic.sourceRefs.length>0);
 for(const language of ["en","fr"]){
  assert.ok(topic.title[language]);
  assert.ok(topic.questionVariants[language].length>=2);
 }
 for(const source of topic.sourceRefs){
  if(source.owner==="LTF_PIUS_X_ITALIAN_WITNESS_INDEX_V1"){
   assert.match(source.ref,/^PX1912-Q\d{3}$/);
   const n=Number(source.ref.slice(-3));
   assert.ok(byEN.has(n)&&byIT.has(n),source.ref+" not indexed in both witnesses");
  }else if(source.owner==="GLOSSARY_CONCEPTS_SOT_V1"){
   const t=byGloss.get(source.ref);
   assert.equal(t?.definition_status,"SOURCE_BACKED",source.ref+" lacks linked glossary definition");
  }else if(source.owner==="MASS_EXPLORER_PUBLISHED_GUIDE"){
   assert.match(source.ref,/^AO\.CARD\.\d{3}$/);
   assert.ok(guide.entries[source.ref]?.moment,"Guide moment unavailable "+source.ref);
   assert.equal(source.evidence,"PUBLISHED_SUNG_GUIDE_TOPIC_VERIFIED");
  }else if(source.owner==="PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1"){
   const pointer=historicalPointers.records.find(x=>x.id===source.ref);
   assert.ok(pointer,"Historical passage pointer absent: "+source.ref);
   assert.equal(source.evidence,"PASSAGE_LOCATOR_RESEARCH_ONLY");
   assert.match(pointer.originalDocumentUrl,/^https:\/\//);
   assert.ok(pointer.sourceLocator.length>=10,"Short precise paragraph locators are valid");
   assert.equal(pointer.approvedReply,false);
   const originalOwner=historicalPointers.researchOwner.fixture;
   const documentFirstOwner="https://github.com/Fulcanelli13/ad-orientem/blob/formation/1457-pius-x-conversation-evidence/data/learn/research/pius-x-document-first-unscripted-bilingual-probes-20261021.v1.json";
   const next11Owner="https://github.com/Fulcanelli13/ad-orientem/blob/formation/1457-pius-x-conversation-evidence/data/learn/research/pius-x-next11-frozen-english-french-question-probes-20261021.v1.json";
   const idNumber=Number(pointer.id.slice(-2));
   const expectedOwner=idNumber>=15?next11Owner:(idNumber>=13?documentFirstOwner:originalOwner);
   assert.equal(pointer.researchSource,expectedOwner,
     "Historical research provenance must be exact: "+pointer.id);
  }else throw Error("Unrecognised source owner "+source.owner);
 }
}
assert.equal(registry.pilotLimits.curatedTopicRelationships,77);
assert.equal(registry.pilotLimits.relationshipsAreDoctrinalImplications,false);
assert.equal(registry.policy.relatedTopicDoesNotAuthoriseNewClaim,true);
let relationCount=0;
for(const t of registry.topics){
 for(const link of t.relatedTopics||[]){
  assert.ok(topics.has(link.id),"dangling related topic "+link.id);
  assert.notEqual(t.id,link.id);
  assert.equal(link.publication,"RELATIONSHIP_RESEARCH_ONLY");
  relationCount++;
 }
}
assert.equal(relationCount,77);
for(const topic of registry.topics.filter(t=>t.category==="canon_church_crisis_unpublished")){
 assert.equal(topic.sourceRefs.length,0);
 assert.equal(topic.coverage,"SOURCE_GAP");
 for(const rel of topic.relatedTopics||[])assert.equal(rel.publication,"RELATIONSHIP_RESEARCH_ONLY");
}
for(const t of registry.topics.filter(t=>t.category==="canon_apologetics_unpublished")){
 assert.equal(t.coverage,"SOURCE_GAP");
 assert.equal(t.sourceRefs.length,0);
 assert.equal(t.researchRefs.length,1);
 assert.ok(apolIds.has(t.researchRefs[0].ref));
}

const canonApol=registry.topics.filter(t=>t.category==="canon_apologetics_unpublished");
const canonCrisis=registry.topics.filter(t=>t.category==="canon_church_crisis_unpublished");
assert.equal(canonApol.length,60);
assert.equal(canonCrisis.length,25);
assert.deepEqual(new Set(canonApol.map(t=>t.researchRefs[0].ref)),apolIds);
for(const t of canonCrisis){
 assert.equal(t.coverage,"SOURCE_GAP");
 assert.equal(t.sourceRefs.length,0);
 assert.equal(t.researchRefs.length,1);
 assert.ok(crisisIds.has(t.researchRefs[0].ref));
}
for(const a of registry.ambiguities)for(const id of a.candidates)assert.ok(topics.has(id));
const router=createSharedQuestionRouter(registry);
assert.equal(router.version,SHARED_QUESTION_ROUTER_VERSION);
assert.equal(router.topicCount,197);
const match=(q,options={})=>router.match(q,options);
let r=match("Why does the priest raise the Host?");
assert.equal(r.kind,"clarify");assert.equal(r.ambiguityId,"host_raised");
assert.deepEqual(r.options.map(x=>x.topicId),["faith.real_presence","mass.elevation"]);
assert.equal(r.answerText,null);
r=match("Why does the priest wear different colours?");
assert.equal(r.kind,"clarify");assert.equal(r.ambiguityId,"different_colours");
assert.deepEqual(r.options.map(x=>x.topicId),["objects.vestments","mass.colors_meaning"]);
assert.equal(r.options[0].coverage,"SOURCE_NAVIGATION_ONLY");
assert.equal(r.options[1].coverage,"SOURCE_GAP");
r=match("What does that gesture mean?");
assert.equal(r.kind,"clarify");assert.equal(r.requiresContext,true);assert.equal(r.options.length,0);
r=match("Tell me about the prayer at the beginning of Mass.");
assert.equal(r.kind,"clarify");assert.equal(r.ambiguityId,"opening_prayer_unspecified");
assert.deepEqual(r.options.map(x=>x.topicId),["mass.introit","mass.kyrie","mass.collect"]);
assert.equal(r.answerText,null);

r=match("what happens to the bread at mass");
assert.equal(r.kind,"source_navigation");assert.equal(r.character,"pius-x");assert.equal(r.topicId,"faith.real_presence");
assert.deepEqual(r.sourceRefs.map(x=>x.ref),["PX1912-Q325","PX1912-Q329"]);assert.equal(r.answerText,null);
assert.equal(r.requiresQuestionConfirmation,false);
assert.equal(r.matchEvidence.basis,"EXACT_VARIANT");
assert.ok(r.topic.relatedTopics.some(x=>x.id==="mass.elevation"));
assert.ok(r.topic.relatedTopics.every(x=>x.publication==="RELATIONSHIP_RESEARCH_ONLY"));
assert.equal(r.topic.approvedReply,false);
r=match("can the pope make mistakes");assert.equal(r.topicId,"church.papal_infallibility");
r=match("how do i examine my conscience");assert.equal(r.topicId,"penance.examination");
r=match("Pourquoi invoquer la Sainte Vierge ?",{language:"fr"});assert.equal(r.topicId,"mary.intercession");
r=match("Que sont les ornements sacerdotaux ?",{language:"fr",currentCharacter:"sacristan"});
assert.equal(r.topicId,"objects.vestments");assert.equal(r.kind,"source_navigation");
r=match("what is the small square over the chalice");
assert.equal(r.kind,"offer_handoff");assert.equal(r.targetCharacter,"sacristan");assert.equal(r.topicId,"objects.pall");
assert.equal(r.requiresAcceptance,true);assert.equal(r.sourceRefs[0].ref,"G189");
assert.equal(r.requiresQuestionConfirmation,false);
r=match("What's that hard square thing on the chalice?");
assert.equal(r.kind,"offer_handoff");
assert.equal(r.topicId,"objects.pall");
assert.equal(r.requiresQuestionConfirmation,true);
assert.equal(r.matchEvidence.basis,"LEXICAL_RANKED");
assert.equal(router.acceptHandoff(r,{accept:true}).kind,"needs_question_confirmation");
const explicitlyConfirmed=router.acceptHandoff(r,{accept:true,confirmQuestion:true});
assert.equal(explicitlyConfirmed.kind,"handoff_context");
assert.equal(explicitlyConfirmed.toCharacter,"sacristan");
assert.equal(explicitlyConfirmed.answerText,null);

r=match("what is the small square over the chalice");

assert.equal(router.acceptHandoff(r,{accept:false}).kind,"stay");
assert.equal(router.acceptHandoff({...r,targetCharacter:"canon"},{accept:true}).kind,"invalid_handoff");
assert.equal(router.acceptHandoff({...r,sourceRefs:[{owner:"GLOSSARY_CONCEPTS_SOT_V1",ref:"G999",evidence:"SOURCE_BACKED_GLOSSARY"}]},{accept:true}).kind,"invalid_handoff");
assert.equal(router.acceptHandoff({...r,topicId:"mass.altar_reverence"},{accept:true}).kind,"invalid_handoff");

const transfer=router.acceptHandoff(r,{accept:true});
assert.equal(transfer.kind,"handoff_context");
assert.equal(transfer.fromCharacter,"pius-x");assert.equal(transfer.toCharacter,"sacristan");
assert.equal(transfer.originalQuestion,"what is the small square over the chalice");
assert.equal(transfer.history.handoffCount,1);
assert.deepEqual(transfer.history.visitedCharacters,["pius-x","sacristan"]);
assert.equal(transfer.answerText,null);
assert.equal(router.acceptHandoff(r,{accept:true,history:transfer.history}).kind,"no_coverage");
r=match("why does the priest kiss the altar",{currentCharacter:"sacristan"});
assert.equal(r.kind,"no_coverage");assert.equal(r.reason,"TOPIC_SOURCE_GAP");
assert.equal(r.topicId,"mass.altar_reverence");
r=match("what is the roman canon",{currentCharacter:"sacristan"});
assert.equal(r.kind,"offer_handoff");assert.equal(r.targetCharacter,"canon");
assert.equal(r.targetRoute,"learn.mass_explorer");assert.equal(r.sourceRefs[0].ref,"AO.CARD.014");
for(const [q,ref] of [
 ["who sings the kyrie at mass","AO.CARD.002"],
 ["what is the collect prayer at mass","AO.CARD.004"],
 ["what is the epistle at mass","AO.CARD.005"],
 ["when is the sermon preached","AO.CARD.008"],
 ["what happens at the consecration of the chalice","AO.CARD.016"],
 ["when does the priest break the host","AO.CARD.020"],
 ["what is the postcommunion prayer","AO.CARD.027"],
 ["when does the priest give the final blessing","AO.CARD.029"]
]){
 const x=match(q,{currentCharacter:"canon"});
 assert.equal(x.kind,"source_navigation",q+": "+JSON.stringify(x));
 assert.equal(x.sourceRefs.length,1);
 assert.equal(x.sourceRefs[0].ref,ref);
 assert.equal(x.answerText,null);
 assert.equal(x.approvedReply,false);
}
r=match("what about his Blood?",{context:{activeTopicId:"faith.real_presence"}});
assert.equal(r.kind,"source_navigation");assert.equal(r.topicId,"faith.whole_christ");
r=match("why does the priest raise the Host?",{chosenTopicId:"mass.elevation"});
assert.equal(r.kind,"offer_handoff");assert.equal(r.targetCharacter,"canon");assert.equal(r.sourceRefs[0].ref,"AO.CARD.015");
assert.equal(r.requiresQuestionConfirmation,false);
assert.equal(r.matchEvidence.basis,"EXPLICIT_REFORMULATION_CHOICE");
r=match("is it wrong to seek more money for my family");
assert.equal(r.kind,"no_coverage");assert.equal(r.reason,"family_livelihood_from_Q85");
r=match("what is the current eucharistic fast");
assert.equal(r.kind,"no_coverage");assert.equal(r.reason,"unverified_modern_law");

const newer=[
 ["what is a thurible",{currentCharacter:"pius-x"},"offer_handoff","objects.glossary_g194","sacristan"],
 ["qu'est-ce qu'un encensoir",{language:"fr",currentCharacter:"sacristan"},"source_navigation","objects.glossary_g194","sacristan"],
 ["what is a chasuble",{currentCharacter:"sacristan"},"source_navigation","objects.glossary_g200","sacristan"],
 ["how must we pray",{currentCharacter:"pius-x"},"source_navigation","pius.catechism_q418","pius-x"],
 ["what is a miracle",{currentCharacter:"pius-x"},"source_navigation","pius.catechism_q87","pius-x"],
 ["what is the agnus dei at mass",{currentCharacter:"sacristan"},"offer_handoff","mass.agnus_dei","canon"],
 ["what is the last gospel at mass",{currentCharacter:"canon"},"source_navigation","mass.last_gospel","canon"],
 ["does god exist",{currentCharacter:"canon"},"no_coverage","canon.apologetics_apol_001",null],
 ["is sola scriptura biblical or historically credible",{currentCharacter:"canon"},"no_coverage","canon.apologetics_apol_014",null],
 ["la fin justifie-t-elle les moyens",{language:"fr",currentCharacter:"canon"},"no_coverage","canon.apologetics_apol_052",null]
];
for(const [question,options,kind,topicId,target] of newer){
 const x=match(question,options);
 assert.equal(x.kind,kind,question+" incorrect result: "+JSON.stringify(x));
 assert.equal(x.topicId,topicId,question+" wrong topic");
 if(target&&kind==="offer_handoff")assert.equal(x.targetCharacter,target);
 if(kind==="no_coverage")assert.equal(x.reason,"TOPIC_SOURCE_GAP");
 assert.equal(x.answerText,null);
}
r=match("is sola scriptura biblical or historically credible",{currentCharacter:"pius-x"});
assert.equal(r.kind,"no_coverage");assert.equal(r.reason,"TOPIC_SOURCE_GAP");

r=match("How do I install WiFi drivers on Linux?");
assert.equal(r.kind,"no_coverage");
assert.equal(r.answerText,null);
assert.throws(()=>match("what is a pall",{currentCharacter:"invalid"}),/Unknown character/);
assert.throws(()=>match("what is a pall",{chosenTopicId:"invented"}),/Unrecognised chosen topic/);
const clone=structuredClone(registry);clone.topics[0].sourceRefs=[];
assert.throws(()=>createSharedQuestionRouter(clone),/Topic falsely claims evidence/);
for(const c of ["pius-x","canon","sacristan"]){
 const src=router.listTopics({character:c});assert.ok(src.length>0);assert.ok(src.every(x=>x.approvedReply===false&&!x.answerText));
}
console.log("PASS Living Church shared routing: 197 topics, 107 source-nav registry entries, 90 held topics; 28 Canon Guide moment links, 60 unpublished apologetics and 25 Church Crisis studies held");


assert.equal(historicalPointers.schema,"AO_LIVING_CHURCH_PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1");
assert.equal(historicalPointers.records.length,23);
const newPius=registry.topics.filter(t=>t.id.startsWith("pius.historical_spx_pilot_"));
assert.equal(newPius.length,25);
assert.equal(newPius.filter(t=>t.coverage==="SOURCE_NAVIGATION_ONLY").length,23);
assert.equal(newPius.filter(t=>t.coverage==="SOURCE_GAP").length,2);
assert.deepEqual(newPius.map(t=>t.id),Array.from({length:25},(_,i)=>"pius.historical_spx_pilot_"+String(i+1).padStart(2,"0")));
for(const t of newPius){
 assert.equal(t.approvedReply,false);
 assert.equal(t.sourceBridgeOwner,Number(t.id.slice(-2))>=15?"PR1458_FROZEN_NEXT11_DOCUMENTARY_SOURCE_POINTERS_RESEARCH_ONLY":"PR1458_EXTERNAL_DOCUMENTARY_POINTERS_RESEARCH_ONLY");
 if(t.coverage==="SOURCE_GAP")assert.equal(t.sourceRefs.length,0);
 else assert.equal(t.sourceRefs[0].ref,"SPX-PILOT-"+t.id.slice(-2));
}
