import {projectExsultetSourceParagraphs} from "./reader-exsultet-pages.js";

// Missal-only anticipation for already-source-owned special-rite stages.
// Never split, skip or synthesize ceremonial events; navigation remains in
// each rite's native controller. Omitted vernacular texts stay unclaimed.
const GLOBAL_SCOPES=new Set(["ALL","ALL_FAITHFUL","FAITHFUL","CONGREGATION"]);
const INDIVIDUAL=/RECIPIENT|SELECTED|PARTICIPANT_ONLY|MINISTER|PRIEST|DEACON|SUBDEACON/i;
const POSTURES=new Set(["STAND","SIT","KNEEL"]);

export function specialRiteNextPosture({current=null,next=null,mode="MISSAL",
  language="en",participating=false}={}){
  if(String(mode).toUpperCase()!=="MISSAL"||!next||next.personalOnly===true)return null;
  const scope=String(next.actorScope??"");
  if(INDIVIDUAL.test(scope))return null;
  const norm=value=>String(value?.posture??"").toUpperCase();
  const posture=norm(next),prior=norm(current);
  const processional=/^(PROCESSIONAL|PROCESSIONAL_STAND|STAND_WALK)$/.test(posture);
  const participate=processional && participating===true &&
    /FAITHFUL_PARTICIPATING|FAITHFUL_WITH_CANDLE_PARTICIPATING|ALL_FAITHFUL/.test(scope);
  if(!POSTURES.has(posture)&&!participate)return null;
  if(!GLOBAL_SCOPES.has(scope)&&!participate)return null;
  if(posture===prior)return null;
  const fr=String(language).toLowerCase().startsWith("fr");
  const labels=fr
    ?{STAND:"Debout",SIT:"Assis",KNEEL:"À genoux",PROCESSIONAL:"Suivre la procession"}
    :{STAND:"Stand",SIT:"Sit",KNEEL:"Kneel",PROCESSIONAL:"Join procession"};
  return Object.freeze({
    label:participate?labels.PROCESSIONAL:labels[posture],
    posture,sourceCardId:next.id??next.recordId??next.surfaceKey??null,
    actorScope:scope,owner:"SOURCE_OWNED_RITE_STAGE_PAGE_BOUNDARY",
    personal:false,observed:false,
  });
}

/** Update only the existing page-turn control; never move a reader clock. */
export function showSpecialRiteMissalPostureHint(host,hint,{language="en"}={}){
  const button=host?.querySelector?.('.ao-reader-nav button[data-reader-nav="next"]');
  if(!button)return false;
  const fr=String(language).toLowerCase().startsWith("fr");
  if(!hint){
    delete button.dataset.nextPosture;
    button.title="";
    button.setAttribute("aria-label",fr?"Page suivante":"Next page");
    return false;
  }
  button.dataset.nextPosture=hint.label;
  button.title=(fr?"Page suivante · ":"Next page · ")+hint.label;
  button.setAttribute("aria-label",button.title);
  return true;
}

/** A French Missal must never display an English line as its French column.
 * Several older rite payloads have only Latin; null is the honest fallback.
 */
export function specialRiteVernacular(row,{language="en"}={}){
  const french=String(language).toLowerCase().startsWith("fr");
  const source=french?(row?.french??row?.fr):(row?.vernacular??row?.english??row?.en);
  return typeof source==="string"&&source.trim()?source:null;
}


// Explicitly sourced prayer/response group boundaries. All other stages
// remain intact until each source has a certified prayer subdivision.
const GROUPED_RITES=new Set([
  "CND-R01","ASH-R01","ROG-R02","ROG-R03","ROG-R05",
  "EV-LIT1-400","EV-LIT2-600","EV-FONT-420","EV-FONT-440","EV-EXS-200"
]);
function isCardGroup(id){return /^(?:CND-R01|ASH-R01|ROG-R02|ROG-R03|ROG-R05)$/.test(id)}
function asId(row){return String(row?.id??"")}
function freezePages(groups,sourceRows,stageId){
  const flat=groups.flat();
  if(flat.length!==sourceRows.length ||
    flat.some((row,i)=>row!==sourceRows[i]))
    throw new Error("SPECIAL_MISSAL_SOURCE_PARITY:"+stageId);
  if(sourceRows.length&&groups.some(x=>!x.length))throw new Error("SPECIAL_MISSAL_EMPTY_PAGE:"+stageId);
  return Object.freeze(groups.map((group,i)=>Object.freeze({
    stageId,index:i,total:groups.length,sourceRowCount:sourceRows.length,
    rows:Object.freeze([...group]),
    sourceIds:Object.freeze(group.map(row=>asId(row))),
    firstSourceId:asId(group[0]),lastSourceId:asId(group.at(-1)),
    displayOnly:true,
  })));
}
function consecutiveGroups(rows,getGroup){
  const groups=[];
  let previous=null;
  for(let i=0;i<rows.length;i++){
    const id=getGroup(rows[i],i);
    if(id!==previous)groups.push([]);
    groups.at(-1).push(rows[i]);previous=id;
  }
  return groups;
}
function batchGroups(groups,maxCount){
  const pages=[];
  for(let i=0;i<groups.length;i+=maxCount)pages.push(groups.slice(i,i+maxCount).flat());
  return pages;
}

/** Split only already-delimited *source rows*, never a word, prayer body,
 * response pair, baptism formula, or original source event. The row arrays
 * must flatten back to exact original object references in the same order.
 */
export function projectSpecialRiteReadingPages(stageId,paragraphs,{mode="MISSAL"}={}){
  const rows=Array.isArray(paragraphs)?paragraphs:[];
  const id=String(stageId??"");
  if(String(mode).toUpperCase()!=="MISSAL" || !GROUPED_RITES.has(id) || !rows.length)
    return freezePages([rows],rows,id);
  if(id==="EV-EXS-200"){
    if(rows.length!==1||!String(rows[0]?.id??"").startsWith("EV-EXSULTET"))
      throw new Error("EXSULTET_MISSAL_SOURCE_ROW_NOT_CERTIFIED");
    const projection=projectExsultetSourceParagraphs(rows[0]);
    // Split the fixed donor at its own paragraph headings, pairing English
    // with the same Latin argument. The canonical single row stays untouched.
    return Object.freeze(projection.paragraphs.map((paragraph,index)=>Object.freeze({
      stageId:id,index,total:projection.paragraphs.length,sourceRowCount:rows.length,
      rows:Object.freeze([paragraph]),sourceIds:Object.freeze([paragraph.sourceRowId]),
      firstSourceId:paragraph.sourceRowId,lastSourceId:paragraph.sourceRowId,
      sourceAlignmentVerified:projection.verified,displayOnly:true,
    })));
  }
  let groups=null;
  if(id==="CND-R01"||id==="ASH-R01"){
    // Introductory antiphon/versicles, then each complete Orémus + prayer
    // + Amen. Each of the five Candlemas/four Ash orations stays whole.
    const head=rows.findIndex(row=>/-O(?:\d+)-INTRO$/.test(asId(row)));
    if(head<1)return freezePages([rows],rows,id);
    groups=[rows.slice(0,head)];
    const remaining=rows.slice(head);
    const prayerGroups=consecutiveGroups(remaining,(row,index)=>{
      const match=asId(row).match(/-O(\d+)(?:-INTRO|-AMEN)?$/);
      return match?match[1]:"TAIL_"+index;
    });
    groups.push(...prayerGroups);
  }else if(id==="ROG-R02"||id==="EV-LIT1-400"||id==="EV-LIT2-600"){
    // V/R source-line pairs are indivisible; 12 pairs per reading page.
    if(rows.length%2!==0)return freezePages([rows],rows,id);
    groups=batchGroups(Array.from({length:rows.length/2},(_,i)=>rows.slice(i*2,i*2+2)),12);
  }else if(id==="ROG-R03"){
    // The existing procession litany is sequential source invocations,
    // not a single prose prayer: pairs are preserved within 24-line pages.
    if(rows.length%2!==0)return freezePages([rows],rows,id);
    groups=batchGroups(Array.from({length:rows.length/2},(_,i)=>rows.slice(i*2,i*2+2)),12);
  }else if(id==="ROG-R05"){
    // Ten separately sourced concluding prayers; never split any oration.
    const prayers=rows.filter(row=>/^ROG-R05-O\d+$/.test(asId(row)));
    const after=rows.slice(prayers.length);
    if(prayers.length<2)return freezePages([rows],rows,id);
    groups=[...batchGroups(prayers.map(p=>[p]),2),...(after.length?[after]:[])];
  }else if(id==="EV-FONT-420"||id==="EV-FONT-440"){
    // The 17 distinct 1962 font-blessing segments remain whole even if
    // one source segment contains a very long multi-line prayer.
    const paragraphsBySource=consecutiveGroups(rows,(row,i)=>{
      const source=asId(row);
      const m=source.match(/^(EV-FONT-B07-.+)-(\d+)$/);
      return m?m[1]:"SOURCE_"+i;
    });
    groups=paragraphsBySource;
  }
  if(!groups||groups.length<2)return freezePages([rows],rows,id);
  return freezePages(groups,rows,id);
}

/** A reading cursor INSIDE one stage. The returned true means the arrow
 * was consumed within that stage: the underlying rite/event index must NOT
 * advance. Previous at stage entry will reopen the prior stage's last page.
 */
export function createSpecialRiteMissalPageCursor({mode="MISSAL"}={}){
  let stageId=null,active=null,pageIndex=0,enterFrom="next";
  function project(id,sourceRows){
    const key=String(id??"");
    const reset=stageId!==key;
    if(reset){
      stageId=key;
      active=projectSpecialRiteReadingPages(key,sourceRows,{mode});
      pageIndex=enterFrom==="previous"?active.length-1:0;
      enterFrom="next";
    }else if(!active || active[0]?.sourceRowCount!==(sourceRows??[]).length){
      active=projectSpecialRiteReadingPages(key,sourceRows,{mode});
      pageIndex=Math.min(pageIndex,active.length-1);
    }
    const page=active[pageIndex];
    return Object.freeze({
      stageId:key,pageIndex,totalPages:active.length,
      sourceRowCount:(sourceRows??[]).length,
      paragraphs:page.rows,
      hasPreviousPage:pageIndex>0,hasNextPage:pageIndex<active.length-1,
      isExtraPage:active.length>1,
      firstSourceId:page.firstSourceId,lastSourceId:page.lastSourceId,
      displayOnly:true,
    });
  }
  function turn(direction){
    if(direction==="next"&&pageIndex<(active?.length??1)-1){pageIndex++;return true}
    if(direction==="previous"&&pageIndex>0){pageIndex--;return true}
    enterFrom=direction==="previous"?"previous":"next";
    return false;
  }
  function clear(){stageId=null;active=null;pageIndex=0;enterFrom="next";}
  return Object.freeze({project,turn,clear,
    snapshot:()=>Object.freeze({stageId,pageIndex,totalPages:active?.length??0})});
}
