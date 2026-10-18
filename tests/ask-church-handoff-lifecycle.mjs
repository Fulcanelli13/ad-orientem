import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createAskChurchNativeHandoff} from '../src/learn/ask-church-native-handoff.js';
const survey=JSON.parse(readFileSync(new URL('../data/learn/ask-church-app-route-survey.v1.json',import.meta.url),'utf8'));
function deferred(){let release;const promise=new Promise(r=>release=r);return {promise,release};}
{
 const gate=deferred(), calls=[];
 const host={AO_APP_SHELL_V1:{navigate:async x=>{calls.push('nav:'+x);await gate.promise;return {ok:true};}},AO_MODULES:{open:async x=>{calls.push('open:'+x);return {ok:true};}}};
 const api=createAskChurchNativeHandoff(host,{survey}), first=api.open('pray.confession');
 assert.equal((await api.open('pray.rosary')).code,'OPEN_IN_PROGRESS');
 gate.release();
 assert.equal((await first).ok,true);
 assert.deepEqual(calls,['nav:pray','open:pray.confession']);
 assert.equal((await api.open('pray.rosary')).ok,true);
}
{
 let calls=0;
 const host={AO_APP_SHELL_V1:{navigate:async()=>{calls++;return {ok:true};}},AO_APOSTOLATE_APP_V1:{open:()=>true,status:()=>({open:false})}};
 assert.equal((await createAskChurchNativeHandoff(host,{survey}).open('apostolate:HS02')).code,'APOSTOLATE_NOT_VISIBLE');
 assert.equal(calls,1);
}
{
 const host={AO_APP_SHELL_V1:{navigate:async()=>({ok:false})},AO_MODULES:{open:async()=>{throw Error('must not open');}}};
 assert.equal((await createAskChurchNativeHandoff(host,{survey}).open('pray.confession')).code,'NAVIGATION_FAILED');
}
{
 let fail=true;
 const host={AO_APP_SHELL_V1:{navigate:async()=>{if(fail)throw Error('temporary');return {ok:true};}},AO_MODULES:{open:async()=>({ok:true})}};
 const api=createAskChurchNativeHandoff(host,{survey});
 assert.equal((await api.open('pray.confession')).code,'RUNTIME_EXCEPTION');
 fail=false;
 assert.equal((await api.open('pray.confession')).ok,true);
}
{
 let calls=0;
 const host={AO_APP_SHELL_V1:{navigate:async()=>{calls++;return {ok:true};}}},api=createAskChurchNativeHandoff(host,{survey});
 assert.equal((await api.open('learn.apologetics')).code,'PUBLICATION_HOLD');
 assert.equal((await api.open('learn.church_crisis')).code,'PUBLICATION_HOLD');
 assert.equal((await api.open('unknown')).code,'UNKNOWN_DESTINATION');
 const altered=structuredClone(survey);
 altered.routes.push({id:'pray.retired-test',routeStatus:'RETIRED_OR_ALIAS',releaseGate:'SOURCE_DECLARED'});
 assert.equal((await createAskChurchNativeHandoff(host,{survey:altered}).open('pray.retired-test')).code,'INACTIVE_OR_GATED');
 assert.equal(calls,0);
}
{
 const history=[];
 const host={AO_APP_SHELL_V1:{navigate:async x=>{history.push(x);return {ok:true};}},AO_APOSTOLATE_APP_V1:{open:o=>{history.push(o.scenarioId);return true;},status:()=>({open:true})}};
 const outcome=await createAskChurchNativeHandoff(host,{survey}).open('apostolate:HS02');
 assert.deepEqual(outcome,{ok:true,surface:'apostolate',id:'apostolate:HS02'});
 assert.deepEqual(history,['apostolate','HS02']);
}
console.log('Ask the Church handoff lifecycle PASS: concurrency, visibility, failures, recovery, gates');
