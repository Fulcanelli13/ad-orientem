/**
 * Ad Orientem F11: canonical staged Benediction reuses original runtime,
 * while reproducing Claude's seven-stage Roman altar-card visual grammar.
 * The base I–VII positions NEVER reassign a Holy Eucharistic blessing:
 * V remains an external action, never a button that simulates the blessing.
 */
export const CLAUDE_ALTAR_STAGES=Object.freeze(["exposition","adoration","hymn","prayer","blessing","praises","reposition"]);
export const CLAUDE_ALTAR_ROMAN=Object.freeze(["I","II","III","IV","V","VI","VII"]);
export function claudeAltarRail(stages,index,{esc}={}){
 if(!Array.isArray(stages)||typeof esc!=="function")throw Error("Valid rite stages and esc required");
 const current=stages[Math.max(0,Math.min(stages.length-1,index))]?.[0];
 return '<nav class="aoClaudeAltarStages" aria-label="Benediction stages">'+
  CLAUDE_ALTAR_STAGES.map((id,romanIndex)=>{
   const at=stages.findIndex(stage=>stage[0]===id);
   if(at<0)return "";
   const item=stages[at];
   const active=id===current;
   return '<button type="button" data-p435930-ben-step="'+at+'" class="'+
    (active?'cu':id!=="blessing"&&at<index?'dn':'')+(id==="blessing"?' key':'')+
    '" aria-current="'+(active?'step':'false')+'" aria-label="'+
    esc("Stage "+CLAUDE_ALTAR_ROMAN[romanIndex]+": "+item[1])+'">'+
    CLAUDE_ALTAR_ROMAN[romanIndex]+'</button>';
  }).join("")+'</nav>';
}
export function claudeAltarBilingualRows({latin,vernacular,esc,language="en"}){
 if(typeof esc!=="function"||!latin||!vernacular)return null;
 // Only line-aligned canonical witnesses can be interleaved. Fail closed
 // to the existing source reader; never manufacture translated wording.
 const lat=latin.split("\n"),v=vernacular.split("\n");
 if(lat.length!==v.length)return null;
 // A source line may not be paired to a missing line in the other witness.
 // Keep both original texts in the canonical fallback rather than presenting
 // a visually aligned but structurally false Latin/vernacular edition.
 if(lat.some((line,i)=>Boolean(line.trim())!==Boolean(v[i].trim())))return null;
 const result=lat.map((raw,i)=>{
  const vern=v[i],l=raw.trim();
  if(!l&&!vern.trim())return '<div class="aoClaudeAltarGap" aria-hidden="true"></div>';
  const mark=/^(?:℟|R)\./.test(l)?' aoClaudeAltarAnswer':/^(?:℣|V)\./.test(l)?' aoClaudeAltarVersicle':'';
  return '<div class="aoClaudeAltarRow'+mark+'" data-ao-rite-row="'+i+'">'+
   '<div lang="la" class="aoClaudeAltarLatin">'+esc(raw)+'</div>'+
   '<div lang="'+(language==="fr"?"fr":"en")+'" class="aoClaudeAltarVernacular">'+esc(vern)+'</div></div>';
 });
 return result.join("");
}
