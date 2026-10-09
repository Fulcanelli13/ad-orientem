import { APOSTOLATE_SKILL_CORPUS } from "./skill-corpus.js";
import { APOSTOLATE_AQ_SCENARIOS } from "./corpus.js";
import { APOSTOLATE_HS_SCENARIOS } from "./hs-corpus.js";
import { APOSTOLATE_FH_SCENARIOS } from "./fh-corpus.js";
import { APOSTOLATE_TF_SCENARIOS } from "./tf-corpus.js";
import { APOSTOLATE_DV_SCENARIOS } from "./dv-corpus.js";
import { APOSTOLATE_WC_SCENARIOS } from "./wc-corpus.js";
import { APOSTOLATE_SOURCES } from "./source-registry.js";
import {
  APOSTOLATE_HANDOFF_DIRECTIONS,
  APOSTOLATE_OWNER,
  APOSTOLATE_SCENARIO_IDS,
  APOSTOLATE_SKILLS,
  APOSTOLATE_SOT_VERSION,
  makeApostolateHandoff,
  makeApostolateScenario,
  makeApostolateSkill,
} from "./contracts.js";
import { createApostolateScenarioEngine } from "./engine.js";
import {
  APOSTOLATE_PRESENTATION_VERSION,
  APOSTOLATE_ROOT_ID,
  renderApostolatePresentation,
} from "./presentation.js";

export const VERSION="apostolate-product-v1";

const language=win=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en";

export function createApostolateOwner(win=globalThis,{scenarios=[],skills=[]}={}){
  const scenariosEngine=createApostolateScenarioEngine(scenarios);
  const scenarioRecords=Object.freeze(scenarios.map(makeApostolateScenario));
  const scenarioMap=new Map(scenarioRecords.map(record=>[record.id,record]));
  const skillRecords=Object.freeze(skills.map(makeApostolateSkill));
  const skillMap=new Map(skillRecords.map(skill=>[skill.id,skill]));
  const state={
    open:false,
    view:"home",
    returnView:"home",
    selectedId:null,
    selectedSkillId:null,
    practiceRevealed:false,
    draft:"",
    query:"",
    language:language(win),
    unsub:null,
    suspended:false,
    handoffPending:false,
    handoffError:"",
  };

  const root=()=>win?.document?.getElementById?.(APOSTOLATE_ROOT_ID)??null;

  function ensureRoot(){
    const doc=win?.document;
    if(!doc?.body||typeof doc.createElement!=="function")return null;
    let node=root();
    if(node)return node;
    node=doc.createElement("section");
    node.id=APOSTOLATE_ROOT_ID;
    node.dataset.aoApostolateOwner=APOSTOLATE_OWNER;
    node.dataset.aoApostolateVersion=VERSION;
    node.setAttribute("role","region");
    node.setAttribute("aria-label","Apostolate");
    node.addEventListener?.("click",onClick);
    node.addEventListener?.("input",onInput);
    doc.body.append?.(node);
    return node;
  }

  function render(){
    const node=root();
    if(!node||!state.open)return false;
    state.language=language(win);
    return renderApostolatePresentation(node,state,{
      scenarios:scenarioMap,
      skills:skillMap,
      sources:APOSTOLATE_SOURCES,
    });
  }

  function attach(){
    if(state.unsub)return;
    const store=win?.AO_RUNTIME_V8?.store;
    if(typeof store?.subscribe!=="function")return;
    let prior=language(win);
    state.unsub=store.subscribe?.(()=>{
      const next=language(win);
      if(next!==prior){
        prior=next;
        state.language=next;
        if(state.open)render();
      }
    })??null;
  }

  function resetHome(){
    state.view="home";
    state.returnView="home";
    state.selectedId=null;
    state.selectedSkillId=null;
    state.practiceRevealed=false;
    state.draft="";
    state.query="";
    state.handoffError="";
  }

  function selectScenario(id,{practice=false,returnView=null}={}){
    const key=String(id??"").trim().toUpperCase();
    if(!scenarioMap.has(key))return false;
    state.selectedId=key;
    state.selectedSkillId=null;
    state.returnView=returnView||(practice?"practice":state.view==="help"?"help":"answer");
    state.view=practice?"practice":"scenario";
    state.practiceRevealed=false;
    state.draft="";
    state.query="";
    state.handoffError="";
    render();
    return true;
  }

  function open(opts={}){
    const node=ensureRoot();
    if(!node)return false;
    const explicit=Boolean(opts?.scenarioId||opts?.skillId||["answer","help","practice"].includes(opts?.view));
    const restoreSuspended=state.suspended&&!explicit;
    state.open=true;
    state.suspended=false;
    attach();
    if(restoreSuspended){
      node.hidden=false;
      node.removeAttribute?.("aria-hidden");
      win?.document?.body?.classList?.add?.("aoApostolateOpen");
      if(win?.document?.documentElement?.dataset)win.document.documentElement.dataset.aoApostolateVisibility="visible";
      render();
      try{win?.AO_APP_SHELL_V1?.syncSurface?.("apostolate");}catch{}
      queueMicrotask(()=>root()?.querySelector?.("[data-ao-ap-back]")?.focus?.({preventScroll:true}));
      return true;
    }
    if(opts?.scenarioId){
      const practice=opts.practice!==false;
      if(!selectScenario(opts.scenarioId,{practice,returnView:practice?"practice":"answer"}))resetHome();
    }else if(opts?.skillId){
      const skill=skillMap.get(String(opts.skillId??"").trim().toUpperCase());
      if(skill){
        state.view="skill";
        state.returnView="home";
        state.selectedId=null;
        state.selectedSkillId=skill.id;
        state.query="";
        state.draft="";
        state.practiceRevealed=false;
      }else resetHome();
    }else if(["answer","help","practice"].includes(opts?.view)){
      state.view=opts.view;state.returnView="home";state.selectedId=null;state.selectedSkillId=null;state.query="";state.draft="";state.practiceRevealed=false;
    }else resetHome();
    node.hidden=false;
    node.removeAttribute?.("aria-hidden");
    win?.document?.body?.classList?.add?.("aoApostolateOpen");
    if(win?.document?.documentElement?.dataset)win.document.documentElement.dataset.aoApostolateVisibility="visible";
    render();
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("apostolate");}catch{}
    queueMicrotask(()=>root()?.querySelector?.("[data-ao-ap-back]")?.focus?.({preventScroll:true}));
    return true;
  }

  function suspend(){
    state.open=false;
    state.suspended=true;
    const node=root();
    try{if(node?.contains?.(win?.document?.activeElement))win.document.activeElement?.blur?.();}catch{}
    node?.remove?.();
    win?.document?.body?.classList?.remove?.("aoApostolateOpen");
    if(win?.document?.documentElement?.dataset)win.document.documentElement.dataset.aoApostolateVisibility="route";
    return true;
  }

  function close(){
    state.open=false;
    const node=root();
    try{
      if(node?.contains?.(win?.document?.activeElement))win.document.activeElement?.blur?.();
    }catch{}
    node?.remove?.();
    win?.document?.body?.classList?.remove?.("aoApostolateOpen");
    if(win?.document?.documentElement?.dataset)win.document.documentElement.dataset.aoApostolateVisibility="route";
    state.suspended=false;
    state.handoffPending=false;
    resetHome();
    return true;
  }

  async function followHandoff(index){
    const scenario=state.selectedId?scenarioMap.get(state.selectedId):null;
    const handoff=scenario?.handoffs?.[Number(index)]??null;
    if(!handoff||state.handoffPending)return false;
    const target=String(handoff.targetId??"");
    state.handoffPending=true;
    state.handoffError="";
    render();
    try{
      if(scenarioMap.has(target)){
        return selectScenario(target,{practice:false,returnView:state.view==="practice"?"practice":"help"});
      }
      const surface=target.startsWith("learn.")?"learn":handoff.surface||
        (target.startsWith("pray.")?"pray":target.startsWith("mass")?"mass":target==="find"?"find":null);
      if(!["learn","pray","find","mass"].includes(surface))throw new Error("Unknown handoff destination");
      suspend();
      const nav=await win?.AO_APP_SHELL_V1?.navigate?.(surface);
      if(nav?.ok!==true)throw new Error("Destination navigation failed");
      if(surface==="learn"){
        const opened=await win?.AO_LEARN_APP_V1?.openModule?.(target,{returnContext:{surface:"apostolate"}});
        if(opened==null||opened===false||opened?.ok===false)throw new Error("Formation module did not open");
      }
      if(surface==="pray"&&target&&target!=="pray"){
        const opened=await win?.AO_MODULES?.open?.(target,{returnContext:{surface:"apostolate"}});
        if(opened==null||opened===false||opened?.ok===false)throw new Error("Prayer module did not open");
      }
      return true;
    }catch(error){
      try{win?.console?.error?.("Apostolate handoff failed",error)}catch{}
      // Never strand the user on an empty destination or report false success.
      // Preserve the selected scenario and unsaved draft for a retry.
      if(state.suspended){
        try{await win?.AO_APP_SHELL_V1?.navigate?.("apostolate")}catch{}
        if(!state.open)open();
      }
      state.handoffError=language(win)==="fr"
        ?"Impossible d’ouvrir cette destination. Veuillez réessayer."
        :"This destination could not be opened. Please try again.";
      render();
      return false;
    }finally{
      state.handoffPending=false;
      if(state.open)render();
    }
  }

  function goBack(){
    if(state.view==="skill"){resetHome();render();return true;}
    if(state.view==="scenario"){
      const target=state.returnView||"answer";
      state.view=target;state.selectedId=null;state.practiceRevealed=false;state.draft="";state.query="";render();return true;
    }
    if(state.view==="practice"&&state.selectedId){
      state.selectedId=null;state.practiceRevealed=false;state.draft="";state.query="";render();return true;
    }
    if(state.view!=="home"){
      resetHome();render();return true;
    }
    close();
    void win?.AO_APP_SHELL_V1?.navigate?.("learn");
    return true;
  }

  function onClick(event){
    const button=event.target?.closest?.("button");
    if(!button)return;
    if(button.matches?.("[data-ao-ap-home]")){
      event.preventDefault?.();close();void win?.AO_APP_SHELL_V1?.navigate?.("home");return;
    }
    if(button.matches?.("[data-ao-ap-back]")){
      event.preventDefault?.();goBack();return;
    }
    if(button.dataset?.aoApMode){
      state.view=button.dataset.aoApMode;state.returnView="home";state.selectedId=null;state.selectedSkillId=null;state.practiceRevealed=false;state.draft="";state.query="";render();return;
    }
    if(button.dataset?.aoApScenario){
      selectScenario(button.dataset.aoApScenario,{practice:state.view==="practice",returnView:state.view});return;
    }
    if(button.matches?.("[data-ao-ap-compare]")){
      state.practiceRevealed=!state.practiceRevealed;render();return;
    }
    if(button.dataset?.aoApHandoff!==undefined){
      event.preventDefault?.();void followHandoff(button.dataset.aoApHandoff);return;
    }
  }

  function onInput(event){
    const target=event.target;
    if(target?.matches?.("[data-ao-ap-draft]")){
      state.draft=String(target.value??"");
      return;
    }
    if(target?.matches?.("[data-ao-ap-search]")){
      state.query=String(target.value??"");
      const pos=target.selectionStart;
      render();
      const next=root()?.querySelector?.("[data-ao-ap-search]");
      next?.focus?.();
      try{next?.setSelectionRange?.(pos,pos)}catch{}
    }
  }

  function receiveHandoff(input){
    const handoff=makeApostolateHandoff(input);
    if(handoff.direction!==APOSTOLATE_HANDOFF_DIRECTIONS.FORMATION_TO_APOSTOLATE){
      return Object.freeze({ok:false,reason:"WRONG_DIRECTION",handoff});
    }
    const scenario=APOSTOLATE_SCENARIO_IDS.includes(handoff.targetId)
      ? scenariosEngine.resolve(handoff.targetId)
      : null;
    const skill=skillMap.get(handoff.targetId)??null;
    const response=Object.freeze({
      ok:Boolean(scenario?.ok||skill),
      reason:scenario&&!scenario.ok?scenario.reason:null,
      handoff,
      scenario,
      skill,
    });
    if(response.ok&&win?.document?.body){
      if(scenario?.ok)open({scenarioId:handoff.targetId,practice:true});
      else if(skill)open({skillId:skill.id});
    }
    return response;
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
    const node=root();
    return Object.freeze({
      version:VERSION,
      presentation:APOSTOLATE_PRESENTATION_VERSION,
      owner:APOSTOLATE_OWNER,
      sot:APOSTOLATE_SOT_VERSION,
      installed:true,
      hidden:false,
      visible:Boolean(state.open&&node?.isConnected!==false),
      open:Boolean(state.open&&node),
      suspended:state.suspended,
      mounted:Boolean(node?.isConnected),
      view:state.open?state.view:null,
      selectedId:state.selectedId,
      selectedSkillId:state.selectedSkillId,
      handoffPending:state.handoffPending,
      handoffError:state.handoffError,
      practiceDraftPersistence:"NONE",
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
    open,
    close,
    suspend,
    render,
    selectScenario,
    receiveHandoff,
    handoffToFormation,
    resolveSkill(id){return skillMap.get(String(id??"").trim().toUpperCase())??null;},
    skills:skillRecords,
    scenarios:scenarioRecords,
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
    win.document.documentElement.dataset.aoApostolateVisibility="route";
  }
  return api;
}

if(typeof window!=="undefined")installApostolateOwner(window);
