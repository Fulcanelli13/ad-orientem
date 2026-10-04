import fs from "node:fs";

const path="index.html";
let html=fs.readFileSync(path,"utf8");
const beforeBytes=Buffer.byteLength(html);

function removeBlockById(tag,id){
  const re=new RegExp(
    "<"+tag+"\\b[^>]*\\bid=[\\\"']"+id+"[\\\"'][^>]*>[\\s\\S]*?<\\/"+tag+">",
    "gi"
  );
  const hits=html.match(re)??[];
  if(hits.length!==1)throw new Error(id+": expected exactly one "+tag+" block, found "+hits.length);
  html=html.replace(re,"");
  return hits.length;
}

removeBlockById("style","ao-v4333-emergency-stable-css");
removeBlockById("script","ao-v4333-emergency-stable-js");

const entryRe=/<script\b[^>]*\bsrc=["']\.\/src\/mass\/browser-entry\.js["'][^>]*>\s*<\/script>/gi;
const entries=html.match(entryRe)??[];
if(entries.length!==2)throw new Error("expected exactly two Mass browser-entry script tags before cleanup, found "+entries.length);
let seen=0;
html=html.replace(entryRe,(match)=>{
  seen+=1;
  return seen===1?match:"";
});

const remaining=html.match(entryRe)??[];
if(remaining.length!==1)throw new Error("Mass browser-entry cleanup failed: "+remaining.length+" remain");
if(/AO_EMERGENCY_STABLE_V4333|ao-v4333-emergency-stable-js|aoEmergencyStable|aoEmergencyLive|ao-v4333-emergency-stable-css/.test(html)){
  throw new Error("v43.33 emergency runtime identifiers remain after cleanup");
}
if(!/id=["']ao-shared-prayer-repairs-css["']/.test(html)){
  throw new Error("shared prayer repairs CSS was lost during emergency cleanup");
}

fs.writeFileSync(path,html,"utf8");
console.log(JSON.stringify({
  cleaned:path,
  beforeBytes,
  afterBytes:Buffer.byteLength(html),
  removedBytes:beforeBytes-Buffer.byteLength(html),
  browserEntries:remaining.length,
  emergencyRuntime:false,
  sharedPrayerRepairs:true
},null,2));
