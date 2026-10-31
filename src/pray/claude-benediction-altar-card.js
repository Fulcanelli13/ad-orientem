/**
 * Claude F11 Altar Card stage rail. Static seven-stage Benediction remains
 * an ordered public-rite companion; optional Christ the King stages are
 * preserved by the existing stage owner and not forced into a new rite.
 */
export const CLAUDE_BENEDICTION_RAIL=Object.freeze([
 Object.freeze({id:"exposition",roman:"I"}),
 Object.freeze({id:"adoration",roman:"II"}),
 Object.freeze({id:"hymn",roman:"III"}),
 Object.freeze({id:"prayer",roman:"IV"}),
 Object.freeze({id:"blessing",roman:"V"}),
 Object.freeze({id:"praises",roman:"VI"}),
 Object.freeze({id:"reposition",roman:"VII"})
]);
export function claudeBenedictionRail(stages,index,{esc}={}){
 if(typeof esc!=="function")throw new TypeError("esc required");
 const current=stages?.[index]?.[0]||"";
 return '<nav class="aoClaudeRiteRail" aria-label="Benediction stages I to VII">'+
 CLAUDE_BENEDICTION_RAIL.map(stage=>{
  const at=stages.findIndex(x=>x[0]===stage.id);
  if(at<0)return "";
  const active=current===stage.id;
  const done=at<index;
  return '<button type="button" data-p435930-ben-step="'+at+'" class="'+
   (active?'cu':done?'dn':'')+(stage.id==="blessing"?' key':'')+
   '" aria-current="'+(active?'step':'false')+'" aria-label="'+
   esc(stage.roman+' · '+(stages[at][1]||stage.id))+'">'+stage.roman+'</button>';
 }).join('')+'</nav>';
}
