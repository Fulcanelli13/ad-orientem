/* Compare two separately exported blind Mark reviews. No publication action.
 * Usage: node tools/scripture/reconcile-catena-mark-blind.mjs a.json b.json
 */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {selectCatenaPericopes} from "../../src/scripture/catena-inline.js";
import {validateMarkBlindFixture,retrieveMarkBlindCase,validateMarkBlindCaseDecision,
 reconcileMarkBlindReviews,CATENA_MARK_BLIND_EXPORT_SCHEMA}
 from "../../src/scripture/catena-mark-blind-review.js";
const [firstPath,secondPath]=process.argv.slice(2);
if(!firstPath||!secondPath)throw Error("Usage: node tools/scripture/reconcile-catena-mark-blind.mjs reviewer-a.json reviewer-b.json");
const json=path=>JSON.parse(readFileSync(path,"utf8"));
const fixture=validateMarkBlindFixture(json("data/scripture/catena/editorial-mark-blind-cases.v1.json"));
const input=[json(firstPath),json(secondPath)];
const chunkMap=new Map(),caseMap=new Map();
function getMessages(c){
 if(caseMap.has(c.id))return caseMap.get(c.id);
 const match=/^catena\.mark\.(\d+)\.(\d+)$/.exec(c.pericopeId);
 if(!match)throw Error("Invalid canonical Mark case");
 const chapter=Number(match[1]),verse=Number(match[2]);
 const from=1+4*Math.floor((chapter-1)/4);
 const file="data/scripture/catena/chunks/mark-"+String(from).padStart(2,"0")+
  "-"+String(from+3).padStart(2,"0")+".json";
 if(!chunkMap.has(file))chunkMap.set(file,json(file));
 const packet=chunkMap.get(file);
 const pericope=packet.pericopes.find(x=>x.id===c.pericopeId);
 if(!pericope)throw Error("Missing frozen pericope "+c.pericopeId);
 const section=selectCatenaPericopes([pericope],{book:"Mark",chapter,verseStart:verse,verseEnd:verse})[0];
 const rows=retrieveMarkBlindCase(c,section);
 caseMap.set(c.id,rows);return rows;
}
for(const exp of input){
 if(exp.schema!==CATENA_MARK_BLIND_EXPORT_SCHEMA||
  exp.sourceResearchCommit!==fixture.sourceResearchCommit||
  exp.reviewMode!=="independent_blind_editor_retrieval_grade"||
  exp.publicationApproval!==false||exp.mayAutoPromoteToMessenger!==false||
  exp.independentApprovalNotAuthenticated!==true||
  exp.fullCanonicalExcerptsIncluded!==false||
  exp.casesTotal!==23||exp.completedCases!==23||exp.entries?.length!==23)
  throw Error("Incomplete or malformed blind review manifest");
 const seen=new Set();
 for(const c of fixture.cases){
  const decision=exp.entries.find(x=>x.caseId===c.id);
  if(!decision||seen.has(c.id))throw Error("Missing or duplicate case "+c.id);
  seen.add(c.id);
  const messages=getMessages(c);
  const checked=validateMarkBlindCaseDecision(fixture,c.id,messages,decision);
  if(checked.messageGrades.length!==messages.length)throw Error("Missing excerpt scores");
  for(let i=0;i<messages.length;i++){
   const verified=createHash("sha256").update(messages[i].originalWords,"utf8").digest("hex");
   if(checked.messageGrades[i].sourceSHA256!==verified)
    throw Error("Original Catena text SHA mismatch: "+c.id);
  }
 }
 if(new Set(exp.entries.map(x=>x.caseId)).size!==23)throw Error("Duplicate case records");
}
const comparison=reconcileMarkBlindReviews(fixture,input[0],input[1]);
const output={schema:"ao.catena.mark-blind-reconciliation-report.v1",
 reviewerIds:input.map(x=>x.reviewerId),caseCount:23,
 disagreements:comparison.disagreements,
 disagreementsTotal:comparison.disagreements.length,
 sourceDigestsReverified:true,
 independentIdentityAuthentication:false,
 sourceAndDoctrinalSignoffStillRequired:true,
 publicationApproval:false};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
