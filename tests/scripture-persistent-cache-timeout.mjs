import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import vm from "node:vm";

const html=await readFile(fileURLToPath(new URL("../index.html",import.meta.url)),"utf8");
const m=html.match(/<script id="ao-v427-scripture-persistent-cache">([\s\S]*?)<\/script>/);
assert.ok(m,"Original persistent Scripture cache ownership missing from boot entry");
assert.match(m[1],/const SOURCE_TIMEOUT_MS=9000;/,"Production upstream wait bound has drifted");
assert.match(m[1],/SCRIPTURE_SOURCE_TIMEOUT/);
// Exercise the production script in an isolated JS realm with a short timeout.
// There are NO generated Scriptures or false source-availability claims.
const script=m[1].replace("const SOURCE_TIMEOUT_MS=9000;","const SOURCE_TIMEOUT_MS=65;");
const durable=new Map();
const storage={
 getItem:key=>durable.has(key)?durable.get(key):null,
 setItem:(key,value)=>durable.set(String(key),String(value)),
 removeItem:key=>durable.delete(String(key))
};
const resolved={
 reference:{book:"Psalms",start:1,end:2},
 englishChapter:[{verse:1,text:"EXACT ORIGINAL-SOURCE TEST RECORD — NOT A BIBLICAL QUOTATION"}],
 frenchChapter:[{verse:1,text:"FORMAT-ONLY TEST RECORD"}],
 latinChapter:[{verse:1,text:"FORMAT-ONLY TEST RECORD"}]
};
const id={en:"Psalms 6:1",fr:"Psalms 6:1",lat:"Psalms 6:1"};
function createRealm(source,online=true){
 const realm={
  console,
  localStorage:storage,
  navigator:{onLine:online},
  AO_RUNTIME_V8:{scriptureService:{load:source}},
  document:{readyState:"complete",addEventListener(){}},
  window:{addEventListener(){}},
  setTimeout,clearTimeout,setInterval,clearInterval,
 };
 realm.globalThis=realm;
 vm.runInNewContext(script,realm,{timeout:1000});
 const svc=realm.AO_RUNTIME_V8.scriptureService,cache=realm.AO_SCRIPTURE_CACHE_V427;
 assert.ok(svc.__aoPersistentCacheV427,"Original upstream load was not wrapped");
 assert.equal(cache.inspect().installed,true);
 return {realm,svc,cache};
}
const ref=(kind="psalm",idObj=id)=>[kind,idObj];
const get=async(svc,kind="psalm",source=idObj=>idObj)=>svc.load(...ref(kind));
const hasText=doc=>assert.equal(doc.englishChapter?.[0]?.text,resolved.englishChapter[0].text);

// Real fulfilled-source behaviour: no retries and no synthetic production data.
let working=createRealm(async()=>resolved,true);
const original=await working.svc.load(...ref());
hasText(original);
assert.equal(working.cache.inspect().writes,1);
assert.equal(working.cache.inspect().timeouts,0);
assert.equal(working.cache.inspect().fallbacks,0);

// An app reload must recreate memory and recover EXACT saved source when offline.
let offline=createRealm(async()=>{throw Error("NO_NETWORK")},false);
hasText(await offline.svc.load(...ref()));
assert.equal(offline.cache.inspect().fallbacks,1);
assert.equal(offline.cache.inspect().timeouts,0);

// Previously loaded passage: a hung ONLINE source must not block the reader
// forever. Return only the same source signature from the persistent cache.
let pending=createRealm(()=>new Promise(()=>{}),true);
const started=Date.now();
const restored=await pending.svc.load(...ref());
hasText(restored);
assert.ok(Date.now()-started<1200,"Bounded fallback exceeded deterministic test budget");
assert.equal(restored.__aoPersistentCache?.reason,"source-timeout");
assert.equal(pending.cache.inspect().timeouts,1);
assert.equal(pending.cache.inspect().fallbacks,1);
assert.equal(pending.cache.inspect().errors,0);

// Network rejection likewise recovers only exact previously saved text.
let failed=createRealm(async()=>{throw Error("UPSTREAM_403")},true);
const failback=await failed.svc.load(...ref());
hasText(failback);
assert.equal(failback.__aoPersistentCache?.reason,"network-error");
assert.equal(failed.cache.inspect().fallbacks,1);

// Never quietly borrow Psalm 6 for another Psalm or another Gospel.
let unknown=createRealm(()=>new Promise(()=>{}),true);
await assert.rejects(unknown.svc.load("psalm",{en:"Psalms 31:1",fr:"Psalms 31:1",lat:"Psalms 31:1"}),/SCRIPTURE_SOURCE_TIMEOUT/);
await assert.rejects(unknown.svc.load("gospel",{en:"Luke 23:34",fr:"Luke 23:34",lat:"Luke 23:34"}),/SCRIPTURE_SOURCE_TIMEOUT/);
assert.equal(unknown.cache.inspect().fallbacks,0);
assert.equal(unknown.cache.inspect().timeouts,2);
assert.equal(unknown.cache.inspect().errors,2);

// Stable use of a successful source must not skip the online update just
// because the previous original was cached.
let fresh=createRealm(async()=>({...resolved,englishChapter:[{verse:1,text:"NEW EDITION-OWNED SOURCE UPDATE"}]}),true);
const refreshed=await fresh.svc.load(...ref());
assert.equal(refreshed.englishChapter[0].text,"NEW EDITION-OWNED SOURCE UPDATE");
assert.equal(fresh.cache.inspect().fallbacks,0);
assert.equal(fresh.cache.inspect().timeouts,0);
console.log("PASS exact-source Scripture cache: online resolve, offline restart, stalled/rejected upstream fallback, no cross-reference leakage and fresh network preference");
