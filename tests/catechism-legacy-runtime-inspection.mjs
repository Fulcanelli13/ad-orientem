import {readFileSync} from "node:fs";
const html=readFileSync("index.html","utf8");
const terms=["AO_TRADITIONAL_CATECHISM","ao-cate-root","AO_CATECHISM","aoCate","cateQuestion","catechism"];
for(const term of terms){
 const positions=[];let i=-1;
 while((i=html.indexOf(term,i+1))>=0 && positions.length<45)positions.push(i);
 console.log("\n=== "+term+" occurrences (first "+positions.length+") ===");
 for (const p of positions.slice(0,term==="AO_TRADITIONAL_CATECHISM"?20:term==="ao-cate-root"?15:5))
   console.log("\nOFFSET "+p+"\n"+html.slice(Math.max(0,p-950),Math.min(html.length,p+1450)).replace(/\n{3,}/g,"\n\n"));
}
