/**
 * Presentation-only grouping of the canonical Rosary bead/step stream.
 * Never rewrites steps, prayers, mystery positions or their native owners.
 */
export function rosaryNamedChapters(steps,{set="joyful",french=false,titles=[]}={}){
 if(!Array.isArray(steps)||!steps.length)return Object.freeze([]);
 const groups=[];
 let lastMystery=-1;
 for(let i=0;i<steps.length;i++){
  const mi=Number.isInteger(steps[i]?.mi)&&steps[i].mi>=0?steps[i].mi:null;
  if(mi!==null)lastMystery=Math.max(lastMystery,mi);
 }
 const first=steps.findIndex(s=>Number.isInteger(s?.mi)&&s.mi>=0);
 const ending=lastMystery>=0?steps.reduce((i,s,j)=>
   Number.isInteger(s?.mi)&&s.mi===lastMystery?j:i,-1):-1;
 if(first>0)groups.push({id:"opening",title:french?"Prières initiales":"Opening prayers",start:0});
 let previous=null;
 for(let i=0;i<steps.length;i++){
  const mi=steps[i]?.mi;
  if(!Number.isInteger(mi)||mi<0||mi===previous)continue;
  previous=mi;
  const title=titles[mi]||(french?"Mystère ":"Mystery ")+(mi+1);
  groups.push({id:"mystery-"+(mi+1),title,start:i,mi});
 }
 if(ending>=0&&ending<steps.length-1)groups.push({
  id:"conclusion",title:french?"Prières finales":"Closing prayers",start:ending+1
 });
 if(!groups.length)groups.push({id:"prayers",title:french?"Prières du Rosaire":"Rosary prayers",start:0});
 return Object.freeze(groups.map((g,i)=>Object.freeze({
  ...g,end:(groups[i+1]?.start??steps.length)-1
 })));
}
export function rosaryCurrentChapter(chapters,stepIndex){
 const i=chapters.findIndex(c=>stepIndex>=c.start&&stepIndex<=c.end);
 return i<0?0:i;
}
