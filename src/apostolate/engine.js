import {
  APOSTOLATE_ENGINES,
  APOSTOLATE_SCENARIO_IDS,
  engineForScenarioId,
  makeApostolateScenario,
} from "./contracts.js";

const frozenIds=new Set(APOSTOLATE_SCENARIO_IDS);

function normalizeRegistry(records=[]){
  const map=new Map();
  for(const raw of records){
    const record=makeApostolateScenario(raw);
    if(map.has(record.id))throw new Error("Duplicate Apostolate scenario id: "+record.id);
    map.set(record.id,record);
  }
  return map;
}

function unavailable(id,engine,reason){
  return Object.freeze({ok:false,id,engine,reason,scenario:null});
}

export function createApostolateScenarioEngine(records=[]){
  const registry=normalizeRegistry(records);

  function resolve(id,expectedEngine=null){
    const scenarioId=String(id??"").trim().toUpperCase();
    if(!frozenIds.has(scenarioId))return unavailable(scenarioId,null,"UNKNOWN_SCENARIO");
    const engine=engineForScenarioId(scenarioId);
    if(expectedEngine&&engine!==expectedEngine)return unavailable(scenarioId,engine,"WRONG_ENGINE");
    const scenario=registry.get(scenarioId)??makeApostolateScenario({id:scenarioId,publication:"RESEARCH_ONLY"});
    if(scenario.publication!=="READY")return unavailable(scenarioId,engine,"RESEARCH_ONLY");
    return Object.freeze({ok:true,id:scenarioId,engine,reason:null,scenario});
  }

  const answer=Object.freeze({resolve:id=>resolve(id,APOSTOLATE_ENGINES.ANSWER)});
  const help=Object.freeze({resolve:id=>resolve(id,APOSTOLATE_ENGINES.HELP)});
  const introduce=Object.freeze({resolve:id=>resolve(id,APOSTOLATE_ENGINES.INTRODUCE)});

  return Object.freeze({
    resolve,
    answer,
    help,
    introduce,
    status(){
      const published=[...registry.values()].filter(record=>record.publication==="READY").length;
      return Object.freeze({
        scenarioCount:APOSTOLATE_SCENARIO_IDS.length,
        registeredCount:registry.size,
        publishedCount:published,
        researchOnlyCount:APOSTOLATE_SCENARIO_IDS.length-published,
      });
    },
  });
}
