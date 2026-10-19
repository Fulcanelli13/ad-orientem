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
  "ASP-R04","CND-R01","ASH-R01","ROG-R02","ROG-R03","ROG-R05",
  "PALM-R01","PALM-R04","PALM-R06",
  "ABS-R03","ABS-R04","CORPUS-R02","CORPUS-R05",
  "HT-R01","HT-R05",
  "EV-LIT1-400","EV-LIT2-600","EV-FONT-420","EV-FONT-440","EV-EXS-200",
  "EV-LESS-01-READ","EV-LESS-02-READ","EV-LESS-03-READ","EV-LESS-04-READ"
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
  if(id==="PALM-R01"){
    // Spoken antiphon and V/R, followed by the complete blessing collect.
    if(rows.length!==7 || rows[3].id!=="PALM-R01-04" ||
      rows.at(-1).id!=="PALM-R01-07")
      throw new Error("PALM_BLESSING_SOURCE_ROWS_CHANGED");
    groups=[rows.slice(0,3),rows.slice(3)];
  }else if(id==="PALM-R04"){
    // Processional cue dialogue remains together, followed by Gloria laus.
    if(rows.length!==3 || rows[2].id!=="PALM-R04-03")
      throw new Error("PALM_PROCESSION_SOURCE_ROWS_CHANGED");
    groups=[rows.slice(0,2),rows.slice(2)];
  }else if(id==="PALM-R06"){
    // V/R must not be detached from their counterpart.
    if(rows.length!==6 || rows[2].id!=="PALM-R06-03")
      throw new Error("PALM_CONCLUSION_SOURCE_ROWS_CHANGED");
    groups=[rows.slice(0,2),rows.slice(2)];
  }else if(id==="CORPUS-R02"||id==="HT-R01"){
    // Four source-owned Pange lingua stanzas, no alterations to the chant.
    if(rows.length!==4 || rows.some((row,i)=>asId(row)!==
      (id==="CORPUS-R02"?"CORPUS-R02-":"HT-R01-")+String(i+1)))
      throw new Error("PANGE_LINGUA_FOUR_STANZAS_CHANGED:"+id);
    groups=[rows.slice(0,2),rows.slice(2)];
  }else if(id==="CORPUS-R05"){
    // Eucharistic Benediction: spoken V/R, then Orémus / collect / Amen.
    if(rows.length!==5 || rows[2].id!=="CORPUS-R05-O" ||
      rows[4].id!=="CORPUS-R05-A")
      throw new Error("CORPUS_BENEDICTION_SOURCE_ROWS_CHANGED");
    groups=[rows.slice(0,2),rows.slice(2)];
  }else if(id==="HT-R05"){
    // Psalm 21 is already 13 individual source rows. Keep each verse
    // intact; the opening and repeated antiphon occur exactly once.
    if(rows.length!==15 || rows[0].id!=="HT-R05-A1" ||
      rows.at(-1).id!=="HT-R05-A2" ||
      rows.slice(1,-1).some((row,i)=>row.id!=="HT-R05-P"+String(i+1)))
      throw new Error("HOLY_THURSDAY_STRIPPING_SOURCE_ORDER_CHANGED");
    groups=[rows.slice(0,4),rows.slice(4,8),rows.slice(8,12),rows.slice(12)];
  }else if(id==="ABS-R03"){
    // Libera me initial response + V/R pairing; one invocation never
    // shares a page boundary without its associated response.
    if(rows.length!==7 || rows.some((row,i)=>row.id!=="ABS-R03-"+String(i+1)))
      throw new Error("REQUIEM_LIBERA_ME_SOURCE_ROWS_CHANGED");
    groups=[rows.slice(0,3),rows.slice(3)];
  }else if(id==="ABS-R04"){
    // Kyrie/Christe/Kyrie + silent Pater, then the five complete paired
    // versicles, then the entire collect with response. No lay gesture.
    if(rows.length!==16 || rows[3].id!=="ABS-R04-PN" ||
      rows[14].id!=="ABS-R04-O" || rows[15].id!=="ABS-R04-A")
      throw new Error("REQUIEM_ABSOLUTION_SOURCE_ROWS_CHANGED");
    groups=[rows.slice(0,4),rows.slice(4,10),rows.slice(10,14),rows.slice(14)];
  }else if(id==="ASP-R04"){
    // Three exact celebrant/congregation dialogue pairs, then the intact
    // Orémus + concluding collect + Amen. No duplicate or synthetic prayer.
    if(rows.length!==9 ||
      rows.slice(0,6).some((row,i)=>
        row.kind!==(i%2===0?"VERSICLE":"RESPONSE")) ||
      rows[6].id!=="ASP-050-OREMUS" ||
      rows[7].id!=="ASP-050-PRAYER" ||
      rows[8].id!=="ASP-050-AMEN")
      throw new Error("ASPERGES_1962_SOURCE_DIALOGUE_REQUIRED");
    groups=[rows.slice(0,6),rows.slice(6)];
  }else if(id==="CND-R01"||id==="ASH-R01"){
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
  }else if(/^EV-LESS-0[1-4]-READ$/.test(id)){
    // Prophecies already have source-owned Latin Scripture paragraphs.
    // Group up to three at a time, and place the appointed canticle after
    // the whole lesson on its own page, in 1962 source order.
    const canticleAt=rows.findIndex(row=>/-CIT$/.test(asId(row)));
    const prose=canticleAt<0?rows:rows.slice(0,canticleAt);
    const canticle=canticleAt<0?[]:rows.slice(canticleAt);
    if(prose.length===0 || !prose.every(row=>/EV-PROP-\d+-T\d+$/.test(asId(row))))
      throw new Error("SPECIAL_MISSAL_PROPHECY_SOURCE_ORDER:"+id);
    if(canticle.length && (!/-CIT$/.test(asId(canticle[0])) ||
      !canticle.slice(1).every(row=>/-CANT\d+$/.test(asId(row)))))
      throw new Error("SPECIAL_MISSAL_CANTICLE_SOURCE_ORDER:"+id);
    groups=[...batchGroups(prose.map(p=>[p]),3),...(canticle.length?[canticle]:[])];
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
