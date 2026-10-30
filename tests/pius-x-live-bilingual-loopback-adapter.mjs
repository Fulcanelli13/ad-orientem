/**
 * PRIVATE CI adapter integration. Real HTTP against a localhost FAKE MODEL only.
 * This proves configuredModel() sends six chronological requests and six verifier
 * requests; it never contacts an external LLM or attests historical truth.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runConfiguredLiveEvaluation} from '../tools/pius-x-live-eval.mjs';

const logs=[];
const secret='LOCAL_CI_TEST_FAKE_KEY_DO_NOT_LEAK';
const server=createServer(async(req,res)=>{
 try{
  assert.equal(req.method,'POST');
  assert.equal(req.url,'/v1/chat/completions');
  assert.equal(req.headers.authorization,'Bearer '+secret);
  let data='';
  for await(const chunk of req){data+=chunk;if(data.length>120000)throw Error('unexpected large body');}
  const parsed=JSON.parse(data);
  assert.equal(parsed.model,'LOCAL_MOCK_NOT_A_REAL_LLM');
  assert.equal(parsed.response_format.type,'json_object');
  assert.equal(parsed.messages.length,2);
  const input=JSON.parse(parsed.messages[1].content);
  const compose=parsed.messages[0].content.includes('Compose a PRIVATE, UNAPPROVED');
  const system=parsed.messages[0].content.toLowerCase();
  assert(system.includes('original-language')||system.includes('latin/italian'),
   'source-only system prompt must reach the adapter');
  let output;
  if(compose){
   assert.equal(input.chapterId,'SPX-PILOT-01');
   assert(['en','fr'].includes(input.language));
   assert.equal(input.evidence.length,1);
   assert(input.evidence[0].originalLanguageWitnesses.length>0);
   assert(input.history.every(x=>x.contextOnly===true));
   const old=logs.filter(x=>x.stage==='compose'&&x.language===input.language);
   assert.equal(input.history.length,old.length);
   assert(!input.history.some(x=>x.response.includes('SENTINEL_OTHER_LANGUAGE')));
   const en='The written source recalls the weight of office, personal weakness, and the purpose of restoring all things in Christ with the help of God.';
   const fr='Le texte rappelle la gravité du pontificat, la faiblesse de celui qui l’accepte et le dessein de tout restaurer dans le Christ avec le secours de Dieu.';
   output={mode:'answer',text:input.language==='en'?en:fr,
    evidenceIds:[input.evidence[0].id],expression:'thoughtful'};
   logs.push({stage:'compose',language:input.language,history:input.history.length,
    allowedWitnesses:input.evidence[0].originalLanguageWitnesses.map(w=>w.id)});
  }else{
   assert.equal(input.candidate.ids.length,1);
   assert(input.evidence.length===1);
   assert(input.evidence[0].originalLanguageWitnesses.length>0);
   output={supported:true,allClaimsSupported:true,ids:input.candidate.ids};
   logs.push({stage:'verify'});
  }
  res.writeHead(200,{'content-type':'application/json'});
  res.end(JSON.stringify({choices:[{message:{content:JSON.stringify(output)}}]}));
 }catch(e){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:String(e)}));}
});
await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
const tmp=mkdtempSync(join(tmpdir(),'spx-local-adapter-'));
const output=join(tmp,'bilingual-mock-only.json');
const vars=['AO_SPX_MODEL_URL','AO_SPX_MODEL','AO_SPX_MODEL_KEY','AO_SPX_LIVE_EVAL','AO_SPX_REVIEW_MODE',
 'AO_SPX_EVAL_CASES','AO_SPX_EVAL_MULTITURN','AO_SPX_EVAL_BILINGUAL','AO_SPX_EVAL_CHAPTER','AO_SPX_EVAL_OUTPUT'];
const saved=Object.fromEntries(vars.map(key=>[key,process.env[key]]));
let result;
try{
 Object.assign(process.env,{
  AO_SPX_MODEL_URL:'http://127.0.0.1:'+server.address().port+'/v1/chat/completions',
  AO_SPX_MODEL:'LOCAL_MOCK_NOT_A_REAL_LLM',AO_SPX_MODEL_KEY:secret,
  AO_SPX_LIVE_EVAL:'I_ACCEPT_MODEL_COSTS_AND_DATA_TRANSFER',AO_SPX_REVIEW_MODE:'1',
  AO_SPX_EVAL_CASES:'0',AO_SPX_EVAL_MULTITURN:'1',AO_SPX_EVAL_BILINGUAL:'1',
  AO_SPX_EVAL_CHAPTER:'SPX-PILOT-01',AO_SPX_EVAL_OUTPUT:output
 });
 result=await runConfiguredLiveEvaluation();
 assert.equal(process.exitCode||0,0);
 const savedOutput=JSON.parse(readFileSync(output,'utf8'));
 assert.equal(statSync(output).mode&0o777,0o600);
 assert.equal(savedOutput.bilingualMultiturn.schema,'AO_SPX_PRIVATE_BILINGUAL_SEQUENTIAL_EVAL_V1');
 assert.equal(savedOutput.bilingualMultiturn.summary.acceptedEditorialDrafts,6);
 assert.equal(savedOutput.bilingualMultiturn.summary.turnsAttempted,6);
 assert.equal(savedOutput.summary.multiTurnDrafts,6);
 assert.equal(savedOutput.summary.languagesAttempted,2);
 assert.equal(savedOutput.summary.multiTurnReferenceFailures,0);
 assert.equal(savedOutput.providerExecution.composeRequestsAttempted,6);
 assert.equal(savedOutput.providerExecution.verifyRequestsAttempted,6);
 assert.equal(savedOutput.providerExecution.modelIdentifier,'LOCAL_MOCK_NOT_A_REAL_LLM');
 assert.equal(savedOutput.providerExecution.providerProvenanceNotIndependentlyAuthenticated,true);
 assert.equal(savedOutput.bilingualMultiturn.modelProviderConfirmed,false);
 assert.equal(savedOutput.bilingualMultiturn.summary.independentHumanSourceAudits,0);
 assert.equal(savedOutput.bilingualMultiturn.summary.publicationApproved,false);
 assert(!JSON.stringify(savedOutput).includes(secret),'key must not appear in private report');
 assert(!JSON.stringify(result).includes(secret),'key must not appear in return object');
 assert.equal(logs.length,12);
 assert.deepEqual(logs.filter(x=>x.stage==='compose').map(x=>x.language),
  ['en','en','en','fr','fr','fr']);
 assert.deepEqual(logs.filter(x=>x.stage==='compose').map(x=>x.history),
  [0,1,2,0,1,2]);
 assert.deepEqual(logs.filter(x=>x.stage==='verify').length,6);
 assert(savedOutput.bilingualMultiturn.sessions.every(s=>s.summary.humanReviewedTurns===0));
 console.log('PASS SPX_BILINGUAL_HTTP_ADAPTER: six sequential source-constrained replies in EN/FR, six verifier HTTP calls to LOCAL FAKE model, no actual LLM, keys private, approvals all false');
}finally{
 for(const key of vars){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}
 rmSync(tmp,{recursive:true,force:true});
 await new Promise(resolve=>server.close(resolve));
}
