import { readFileSync } from "node:fs";

const gate=JSON.parse(readFileSync(new URL("../data/presentation/reader-release-gate.v1.json",import.meta.url),"utf8"));
const readyStatuses=new Set(["READY","FINAL_NATIVE_READY"]);
if(!readyStatuses.has(gate.status) || gate.openBlockers.length){
  const ids=gate.openBlockers.map(x=>x.id).join(", ");
  console.error("R17 reader release certification: BLOCKED");
  console.error("Status: "+gate.status);
  console.error("Open blockers: "+ids);
  process.exit(1);
}
if(gate.productionDefault!=="R17_NATIVE"){
  console.error("R17 reader release certification: BLOCKED — native is not production default");
  process.exit(1);
}
const shell=gate.protectedInvariants?.find(x=>x.id==="REAL_APP_SHELL_ACCEPTANCE");
if(shell?.status!=="CERTIFIED"){
  console.error("R17 reader release certification: BLOCKED — real app-shell acceptance is not certified");
  process.exit(1);
}
console.log("R17 reader release certification: FINAL_NATIVE_READY");
