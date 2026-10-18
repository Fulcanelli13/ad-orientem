import assert from "node:assert/strict";
import {adjacentServiceReaderRoute,openAdjacentServiceReader} from "../src/mass/adjacent-service-reader.js";

assert.equal(adjacentServiceReaderRoute("ADORATION_BEFORE"),"pray.adoration");
assert.equal(adjacentServiceReaderRoute("ADORATION_AFTER"),"pray.adoration");
assert.equal(adjacentServiceReaderRoute("BENEDICTION_BEFORE"),"pray.benediction");
assert.equal(adjacentServiceReaderRoute("BENEDICTION_AFTER"),"pray.benediction");
assert.equal(adjacentServiceReaderRoute("ASPERGES"),null);

const trigger={dataset:{massJourneyOpenAdjacent:"ADORATION_BEFORE"}};
const calls=[];const win={AO_PRAY_V435930:{
 open(route,opts){calls.push({route,opts});return true;}
}};
assert.deepEqual(await openAdjacentServiceReader("ADORATION_BEFORE",{
 win,trigger,ensureReader:async()=>true
}),{ok:true,reason:null});
assert.equal(calls.length,1);
assert.equal(calls[0].route,"pray.adoration");
assert.equal(calls[0].opts.returnContext,null,
 "Closing Prayer must not trigger navigation that tears down the active Mass preflight");
assert.equal(calls[0].opts.trigger,trigger,
 "The Prayer owner needs the actual trigger to restore focus");
assert.deepEqual(await openAdjacentServiceReader("BENEDICTION_AFTER",{
 win,trigger,ensureReader:async()=>true
}),{ok:true,reason:null});
assert.equal(calls[1].route,"pray.benediction");
assert.equal(calls[1].opts.returnContext,null);

assert.deepEqual(await openAdjacentServiceReader("ASPERGES",{
 win,ensureReader:async()=>{throw Error("Must not load");}
}),{ok:false,reason:"UNKNOWN_SERVICE"});
assert.deepEqual(await openAdjacentServiceReader("ADORATION_BEFORE",{
 win,ensureReader:async()=>false
}),{ok:false,reason:"PRAY_READER_UNAVAILABLE"});
assert.deepEqual(await openAdjacentServiceReader("ADORATION_BEFORE",{
 win:{},ensureReader:async()=>true
}),{ok:false,reason:"PRAY_READER_UNAVAILABLE"});
assert.deepEqual(await openAdjacentServiceReader("ADORATION_BEFORE",{
 win:{AO_PRAY_V435930:{open:()=>false}},ensureReader:async()=>true
}),{ok:false,reason:"PRAY_ROUTE_UNAVAILABLE"});
assert.equal((await openAdjacentServiceReader("ADORATION_BEFORE",{
 win,ensureReader:async()=>{throw Error("load failed");}
})).reason,"PRAY_OPEN_ERROR");
console.log("PASS adjacent-service reader route; returnContext null and trigger restore; unavailable cases fail closed");
