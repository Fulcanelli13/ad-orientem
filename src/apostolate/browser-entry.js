import { APOSTOLATE_SKILL_CORPUS } from "./skill-corpus.js";
import { APOSTOLATE_AQ_SCENARIOS } from "./corpus.js";
import { APOSTOLATE_HS_SCENARIOS } from "./hs-corpus.js";
import { APOSTOLATE_FH_SCENARIOS } from "./fh-corpus.js";
import { APOSTOLATE_TF_SCENARIOS } from "./tf-corpus.js";
import { APOSTOLATE_DV_SCENARIOS } from "./dv-corpus.js";
import { APOSTOLATE_WC_SCENARIOS } from "./wc-corpus.js";
import {
  APOSTOLATE_HANDOFF_DIRECTIONS,
  APOSTOLATE_OWNER,
  APOSTOLATE_SCENARIO_IDS,
  APOSTOLATE_SKILLS,
  APOSTOLATE_SOT_VERSION,
  makeApostolateHandoff,
  makeApostolateSkill,
} from "./contracts.js";
import { createApostolateScenarioEngine } from "./engine.js";

export const VERSION="hidden-apostolate-v1";

export function createApostolateOwner(win=globalThis,{scenarios=[],skills=[]}={}){
  const scenariosEngine=createApostolateScenarioEngine(scenarios);
  const skillRecords=Object.freeze(skills.map(makeApostolateSkill));
  const skillMap=new Map(skillRecords.map(skill=>[skill.id,skill]));

  function receiveHandoff(input){
    const handoff=makeApostolateHandoff(input);
    if(handoff.direction!==APOSTOLATE_HANDOFF_DIRECTIONS.FORMATION_TO_APOSTOLATE){
      return Object.freeze({ok:false,reason:"WRONG_DIRECTION",handoff});
    }
    const scenario=APOSTOLATE_SCENARIO_IDS.includes(handoff.targetId)
      ? scenariosEngine.resolve(handoff.targetId)
      : null;
    const skill=skillMap.get(handoff.targetId)??null;
    return Object.freeze({
      ok:Boolean(scenario?.ok||skill),
      reason:scenario&&!scenario.ok?scenario.reason:null,
      handoff,
      scenario,
      skill,
    });
  }

  function handoffToFormation({fromId,targetRoute,reason}={}){
    return makeApostolateHandoff({
      direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
      fromId,
      targetId:targetRoute,
      reason,
    });
  }

  function status(){
    const root=win?.document?.querySelector?.("[data-ao-apostolate-root],#ao-apostolate-root")??null;
    return Object.freeze({
      version:VERSION,
      owner:APOSTOLATE_OWNER,
      sot:APOSTOLATE_SOT_VERSION,
      installed:true,
      hidden:true,
      visible:false,
      mounted:Boolean(root?.isConnected),
      ribbonExposed:Boolean(win?.document?.querySelector?.("[data-ao-app-surface='apostolate'],[data-ao-ribbon='apostolate']")),
      readyFamilies:Object.freeze(
        [...new Set(
          ["AQ","HS","FH","TF","DV","WC"].filter(prefix=>
            APOSTOLATE_SCENARIO_IDS.filter(id=>id.startsWith(prefix)).every(id=>scenariosEngine.resolve(id).ok)
          )
        )]
      ),
      skillCount:skillRecords.length,
      publishedSkillCount:skillRecords.filter(skill=>skill.publication==="READY").length,
      researchOnlySkillCount:skillRecords.filter(skill=>skill.publication!=="READY").length,
      skillsReady:skillRecords.length===APOSTOLATE_SKILLS.length&&skillRecords.every(skill=>skill.publication==="READY"),
      objectCount:scenariosEngine.status().scenarioCount+skillRecords.length,
      publishedObjectCount:scenariosEngine.status().publishedCount+skillRecords.filter(skill=>skill.publication==="READY").length,
      ...scenariosEngine.status(),
    });
  }

  return Object.freeze({
    version:VERSION,
    owner:APOSTOLATE_OWNER,
    sot:APOSTOLATE_SOT_VERSION,
    engines:Object.freeze({
      answer:scenariosEngine.answer,
      help:scenariosEngine.help,
      introduce:scenariosEngine.introduce,
      resolve:scenariosEngine.resolve,
    }),
    receiveHandoff,
    handoffToFormation,
    resolveSkill(id){return skillMap.get(String(id??"").trim().toUpperCase())??null;},
    skills:skillRecords,
    status,
  });
}

export function installApostolateOwner(win=globalThis){
  if(win?.AO_APOSTOLATE_APP_V1)return win.AO_APOSTOLATE_APP_V1;
  const api=createApostolateOwner(win,{
    scenarios:[...APOSTOLATE_AQ_SCENARIOS,...APOSTOLATE_HS_SCENARIOS,...APOSTOLATE_FH_SCENARIOS,...APOSTOLATE_TF_SCENARIOS,...APOSTOLATE_DV_SCENARIOS,...APOSTOLATE_WC_SCENARIOS],
    skills:APOSTOLATE_SKILL_CORPUS,
  });
  win.AO_APOSTOLATE_APP_V1=api;
  if(win?.document?.documentElement?.dataset){
    win.document.documentElement.dataset.aoApostolateOwner=APOSTOLATE_OWNER;
    win.document.documentElement.dataset.aoApostolateVisibility="hidden";
  }
  return api;
}

if(typeof window!=="undefined")installApostolateOwner(window);
