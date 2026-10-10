// Reuse the existing six source-owned Mandatum events; never invent a second rite graph.
// A single native Mass card hosts six actor-scoped moments without growing the
// historical 48-card LIVE navigation. Post-Mass HT_POST is an independent rite.
const freeze=Object.freeze;
export const MANDATUM_RECORD_IDS=freeze(Array.from({length:6},(_,i)=>
  "SP-HT-MAND-"+String((i+1)*10).padStart(3,"0")));
const POSTURE_SCOPE="LOCAL_OR_INHERIT";
const LABELS=freeze({
  en:freeze([
    "Washing of Feet begins",
    "Preparation of the selected participant",
    "The foot is washed and dried",
    "The participant resumes shoes",
    "Concluding prayers",
    "Return to the Mass"
  ]),
  fr:freeze([
    "Début du lavement des pieds",
    "Préparation du participant choisi",
    "Le pied est lavé et essuyé",
    "Le participant remet ses chaussures",
    "Prières finales",
    "Reprise de la Messe"
  ]),
});
export function validateMandatumSource(source){
  if(source?.id!=="SP-HT-MANDATUM-1962")throw new Error("Expected existing 1962 Mandatum source insert");
  if(source.return_target!=="MC-0026")throw new Error("Mandatum original MC-0026 handoff changed");
  if(!Array.isArray(source.events)||source.events.length!==6)throw new Error("Six canonical Mandatum events required");
  for(let i=0;i<6;i++){
    const e=source.events[i],id=MANDATUM_RECORD_IDS[i];
    if(e?.id!==id)throw new Error("Mandatum canonical event order changed at "+id);
    const expected=(i>=1&&i<=3)?"MANDATUM_PARTICIPANT":i===5?"SYSTEM":"CONGREGATION";
    if(e.actor_scope!==expected)throw new Error(id+": actor scope mismatch");
  }
  const expectedActions=["REMOVE_RIGHT_SHOE_AND_SOCK","RIGHT_FOOT_WASHED_AND_DRIED","REPLACE_SOCK_AND_SHOE"];
  for(let i=1;i<=3;i++)if(source.events[i].action_state!==expectedActions[i-1]){
    throw new Error(source.events[i].id+": original choreography changed");
  }
  if(source.events[5].object_state!=="MC_ENTRY=MC-0026")throw new Error("Mandatum handoff source corrupted");
  return true;
}
export async function loadMandatumSource({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("Mandatum source fetch required");
  const sourceUrl=new URL("../../data/mass/special-days-core.v1.1.json",baseUrl);
  const response=await fetchImpl(sourceUrl);
  if(!response?.ok)throw new Error("Mandatum source fetch unavailable: "+(response?.status??"network"));
  const root=await response.json();
  const source=root?.optional_inserts?.HOLY_THURSDAY_MANDATUM;
  validateMandatumSource(source);
  return freeze({source,sourceUrl:String(sourceUrl)});
}
export function createMandatumEventController({source,language="en",participant=false}={}){
  validateMandatumSource(source);
  const locale=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  let index=0,selected=participant===true;
  function project(){
    const event=source.events[index],isPersonal=event.actor_scope==="MANDATUM_PARTICIPANT";
    // A nonparticipating member of the congregation must NOT be told to
    // remove a shoe, expose a foot, or imitate the priest's actions.
    const applicable=!isPersonal||selected;
    const posture=isPersonal&&!selected?POSTURE_SCOPE:(event.posture_state??POSTURE_SCOPE);
    return freeze({
      schema:"ao-1962-mandatum-event-state-v1",
      sourceEventId:event.id,index,total:source.events.length,
      atStart:index===0,atEnd:index===source.events.length-1,
      actorScope:event.actor_scope,trigger:event.trigger_key,
      participant:selected,action:applicable?(event.action_state??null):null,
      personalState:applicable?(event.personal_state??null):null,
      posture,
      title:LABELS[locale][index],
      sourceLocator:event.source_locator??null,
      handoff:index===source.events.length-1?source.return_target:null,
      sourceTextCompleteness:"SELECTED_CHANTS_ONLY",
    });
  }
  return freeze({
    source,project,
    next:()=>{index=Math.min(index+1,source.events.length-1);return project()},
    previous:()=>{index=Math.max(0,index-1);return project()},
    goToEvent:id=>{const at=source.events.findIndex(e=>e.id===String(id));if(at<0)throw new Error("Unknown Mandatum source ID "+id);index=at;return project()},
    setParticipant:value=>{selected=value===true;return project()},
    reset:()=>{index=0;return project()}
  });
}
