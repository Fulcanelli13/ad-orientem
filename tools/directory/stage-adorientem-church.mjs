import fs from "node:fs";
import path from "node:path";
import {crosswalkThirdPartyDirectory} from "./lib/crosswalk-adorientem-church.mjs";
const [,,inputFile,existingFile,outputFile]=process.argv;
if(!inputFile||!existingFile||!outputFile){
 console.error("Usage: node tools/directory/stage-adorientem-church.mjs <third-party-export.json> <our-joined-records.json> <crosswalk-output.json>");
 process.exit(2);
}
const read=x=>JSON.parse(fs.readFileSync(path.resolve(x),"utf8"));
const candidate=read(inputFile),ours=read(existingFile);
const incoming=Array.isArray(candidate)?candidate:candidate.records;
const existing=Array.isArray(ours)?ours:ours.records;
const audit=crosswalkThirdPartyDirectory(incoming,existing,{snapshotUrl:"https://adorientem.church/",observedAt:new Date().toISOString()});
fs.writeFileSync(path.resolve(outputFile),JSON.stringify(audit,null,2)+"\n");
console.log(JSON.stringify(audit.statistics));
