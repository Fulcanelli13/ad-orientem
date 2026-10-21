/**
 * P8 Visible Mass — selected objective events from B005 Low and B006 Solemn.
 *
 * The actual titles/actors/sound provenance are read from canonical MC-*
 * events, never transcribed or inferred from the Sung reader. Sample sequences
 * are source-order subsets, not certified full traversals or event-clock
 * simulations; minister micro-actions remain visually separated as research.
 */
export const VISIBLE_MASS_P8_VERSION="visible-mass-form-differential-v1";
export const VISIBLE_MASS_P8_SOURCE_OWNERS=Object.freeze({
 graph:"data/mass/mc-event-graph.v1.json",
 low:"data/mass/low-mass-profile.v1.json",
 solemn:"data/mass/solemn-mass-profile.v1.json",
 events:"data/mass/mc-events-01..06.v1.json",
 solemnMinisters:"data/mass/ritus-1962-solemn-ministers-batch02.v1.json",
 sung:"data/presentation/reader-text-sung.v1.json",
 massExplorer:"src/learn/mass-explorer.js"
});
const LOW=Object.freeze([
"MC-PREP-010","MC-FOOT-010","MC-ALT-010","MC-ALT-030",
"MC-OFF-040","MC-OFF-050","MC-OFF-060","MC-OFF-070",
"MC-CAN-070","MC-CNS-020","MC-CNS-030","MC-CNS-040",
"MC-CNS-090","MC-CNS-100","MC-CNS-110","MC-CAN-180",
"MC-COM-270","MC-COM-300","MC-COM-310","MC-END-130","MC-END-180"
]);
const SOLEMN=Object.freeze([
"MC-PREP-010","MC-FOOT-010","MC-ALT-010","MC-ALT-040",
"MC-EPI-020","MC-GSP-050",
"MC-OFF-040","MC-OFF-050","MC-OFF-060","MC-OFF-070",
"MC-OFF-110","MC-OFF-120","MC-CAN-070","MC-CNS-020",
"MC-CNS-030","MC-CNS-040","MC-CNS-090","MC-CNS-100",
"MC-CNS-110","MC-CAN-180","MC-COM-150","MC-COM-160",
"MC-COM-185","MC-COM-270","MC-COM-300","MC-COM-310",
"MC-END-130","MC-END-180"
]);
const MINISTER_RESEARCH=Object.freeze([
"MR62.SOL.B02.001","MR62.SOL.B02.009","MR62.SOL.B02.017",
"MR62.SOL.B02.018","MR62.SOL.B02.043","MR62.SOL.B02.044"
]);
function requireValid(condition,message){if(!condition)throw new Error("P8: "+message);}
export function projectVisibleMassP8({graph,eventFragments,lowProfile,solemnProfile,solemnMinisterResearch}){
 requireValid(graph?.status==="CANONICAL_WAVE1_BASE"&&
   graph.enabledCertifiedForms?.includes("LOW")&&
   graph.enabledCertifiedForms?.includes("SOLEMN"),"original objective graph required");
 requireValid(graph.researchGatedForms?.MISSA_CANTATA?.status==="UNAVAILABLE",
   "Missa Cantata must not inherit Solemn objective graph");
 requireValid(lowProfile?.form==="LOW"&&lowProfile.graph==="mc-event-graph.v1"&&
   lowProfile.acceptance?.maximalCertifiedTraversalEventCount===168,
   "Low B005 source profile required");
 requireValid(solemnProfile?.form==="SOLEMN"&&solemnProfile.graph==="mc-event-graph.v1"&&
   solemnProfile.acceptance?.maximalSingleTraversalEventCount===177&&
   solemnProfile.acceptance?.unionCertifiedEventCountAcrossChantBranches===178,
   "Solemn B006 source profile required");
 requireValid(Array.isArray(eventFragments)&&eventFragments.length===6,
   "six original canonical event fragments required");
 const all=eventFragments.flatMap(d=>d.events||[]);
 requireValid(all.length===graph.counts?.events&&all.length===178,
   "canonical event count mismatch");
 const lookup=new Map(all.map(e=>[e.id,e]));
 requireValid(lookup.size===all.length,"event identities must be unique");
 const ministerSource=solemnMinisterResearch;
 requireValid(ministerSource?.status==="RESEARCH_SOURCE_CHECKED_NOT_RUNTIME_CERTIFIED"&&
   ministerSource?.invariants?.noRuntimeImport===true&&
   Array.isArray(ministerSource?.events),
   "minister details must remain research-only");
 const researchById=new Map(ministerSource.events.map(e=>[e.id,e]));
 const selectedMinister=MINISTER_RESEARCH.map(id=>{
   const m=researchById.get(id);
   requireValid(m&&!m.runtimeCertified&&m.formScope==="SOLEMN",
      "missing unapproved Solemn research identity "+id);
   return Object.freeze({id:m.id,actor:m.actor,actionKey:m.actionKey,
     cueId:m.cueId,ritus:m.ritus,condition:m.condition,
     status:"RESEARCH_NOT_RUNTIME_CERTIFIED",sourceOwner:VISIBLE_MASS_P8_SOURCE_OWNERS.solemnMinisters});
 });
 const project=(form,ids)=>{
   const items=ids.map(id=>{
     const e=lookup.get(id);
     requireValid(e?.forms?.[form]==="CERTIFIED","uncertified "+form+" event "+id);
     requireValid(Number.isInteger(e.order)&&e.actor&&e.title,
       "missing objective event payload "+id);
     return Object.freeze({
       id:e.id,order:e.order,phase:e.phase,title:e.title,actor:e.actor,
       sourceMomentRefs:Object.freeze([...(e.sourceMomentRefs||[])]),
       conditions:Object.freeze([...(e.conditions||[])]),
       soundEvents:Object.freeze([...(e.soundEvents||[])]),
       evidenceTier:e.evidenceTier,
       concurrency:e.concurrency,
       sourceOwner:VISIBLE_MASS_P8_SOURCE_OWNERS.events,
       publication:"CERTIFIED_OBJECTIVE_EVENT",
       massReaderCardId:null,
       voiceClaimForSpecificForm:null,
       photoProvesAction:false
     });
   });
   requireValid(items.every((e,i)=>i===0||items[i-1].order<e.order),
     "objective source ordering changed");
   return Object.freeze({form,items:Object.freeze(items),
     selectedCount:items.length,
     maximalCertifiedContextEvents:form==="LOW"?168:177,
     publication:"SELECTED_OBJECTIVE_EVENTS_NOT_FULL_TRAVERSAL"});
 };
 const low=project("LOW",LOW),solemn=project("SOLEMN",SOLEMN);
 requireValid(low.selectedCount===21&&solemn.selectedCount===28,
   "source-backed sample cardinality changed");
 requireValid(!low.items.some(x=>["MC-ALT-040","MC-OFF-110","MC-OFF-120",
  "MC-COM-150","MC-COM-160","MC-COM-185"].includes(x.id)),
  "Solemn-only events leaked to Low");
 requireValid(solemn.items.some(x=>x.id==="MC-COM-160"&&x.evidenceTier==="A"),
   "Solemn formal Pax lost");
 const host=["MC-CNS-020","MC-CNS-030","MC-CNS-040"],
  chalice=["MC-CNS-090","MC-CNS-100","MC-CNS-110"];
 for(const form of [low,solemn]){
   for(const id of [...host,...chalice])requireValid(form.items.some(x=>x.id===id),
    "Consecration/elevation boundaries cannot be collapsed "+id);
 }
 return Object.freeze({
   schema:"AO_VISIBLE_MASS_P8_CERTIFIED_OBJECTIVE_SAMPLE_V1",
   status:"EXPERIMENTAL_SCENE_PROJECTION",
   forms:Object.freeze({LOW:low,SOLEMN:solemn}),
   ministerResearch:Object.freeze(selectedMinister),
   sourceOwners:VISIBLE_MASS_P8_SOURCE_OWNERS,
   primaryEventsFromGraph:true,formSpecificGuideParityCertified:false,
   publishesFullTraversal:false,publishesMinisterResearchAsRuntime:false,
   publishesUniversalCongregationalPosture:false,
   claimsPhotoAsActualCeremony:false,
   modifiesReader:false
 });
}
