import { readFileSync } from "node:fs";

const gate=JSON.parse(readFileSync(new URL("../data/presentation/reader-release-gate.v1.json",import.meta.url),"utf8"));
if(gate.status!=="READY" || gate.openBlockers.length){
  const ids=gate.openBlockers.map(x=>x.id).join(", ");
  console.error("R17 reader release certification: BLOCKED");
  console.error("Open blockers: "+ids);
  process.exit(1);
}
console.log("R17 reader release certification: READY");
