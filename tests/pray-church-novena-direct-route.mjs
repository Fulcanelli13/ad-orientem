import assert from "node:assert/strict";
import {CHURCH_NOVENA_IDS,resolveChurchNovenaId} from "../src/pray/church-novena-ids.v1.js";
import {openChurchNovenaRoute} from "../src/pray/church-novena-route.v1.js";
import {createPrayOwner} from "../src/pray/browser-entry.js";

assert.equal(CHURCH_NOVENA_IDS.length,19);
assert.equal(new Set(CHURCH_NOVENA_IDS).size,19);
const forbidden=["novena:","novena:other","novena:st_joseph/1","NOVENA:christmas","novena:christmas?day=1","pray.novenas","st_joseph",null,0,{}];
for(const route of forbidden){
  assert.equal(resolveChurchNovenaId(route),null);
  const called={n:0};
  const response=await openChurchNovenaRoute(route,{ensureReader:()=>{called.n++}});
  assert.equal(response.ok,false);
  assert.equal(response.reason,"UNKNOWN_NOVENA_ROUTE");
  assert.equal(called.n,0,"Unknown route must fail before importing a reader");
}
let loads=0,opens=0,returns=0;
for(const id of CHURCH_NOVENA_IDS){
  let openedOptions=null;
  const runtime={
    open(opts){openedOptions=opts;opens++;return true}
  };
  const view={selectedGallery:"votive",camera:[-5.05,9.6,-90,-12],prayerId:"novena:"+id};
  const result=await openChurchNovenaRoute("novena:"+id,{
    win:{AO_NOVENAS_V3:runtime},
    ensureReader:async()=>{loads++},
    novenaDay:9,
    returnContext:view,
    returnToChurch(receipt){
      returns++;
      assert.equal(receipt.id,id);
      assert.equal(receipt.route,"novena:"+id);
      assert.equal(receipt.context,view);
      return true;
    }
  });
  assert.deepEqual(result,{ok:true,route:"novena:"+id,id,reader:"AO_NOVENAS_V3"});
  assert.equal(openedOptions.novenaId,id);
  assert.equal(openedOptions.novenaDay,9);
  assert.equal(typeof openedOptions.onCloseReturn,"function");
  assert.equal(openedOptions.onCloseReturn(),true);
  assert.equal(openedOptions.onCloseReturn(),false,"Back must restore Church exactly once");
}
assert.equal(loads,19);
assert.equal(opens,19);
assert.equal(returns,19);

const noApi=await openChurchNovenaRoute("novena:st_joseph",{win:{},ensureReader:async()=>true});
assert.equal(noApi.reason,"READER_NOT_INSTALLED");
const rejected=await openChurchNovenaRoute("novena:st_joseph",{
  win:{AO_NOVENAS_V3:{open:()=>false}}
});
assert.equal(rejected.reason,"READER_REFUSED");
const failed=await openChurchNovenaRoute("novena:st_joseph",{
  ensureReader:async()=>{throw Error("download unavailable")}
});
assert.equal(failed.reason,"READER_LOAD_FAILED");
const thrown=await openChurchNovenaRoute("novena:st_joseph",{
  win:{AO_NOVENAS_V3:{open:()=>{throw Error("reader exception")}}}
});
assert.equal(thrown.reason,"READER_OPEN_FAILED");
const defaultDay=await openChurchNovenaRoute("novena:st_joseph",{
  win:{AO_NOVENAS_V3:{open:opts=>{
    assert.equal("novenaDay" in opts,false,"Invalid day must not override Calendar Intelligence");
    return true;
  }}},
  novenaDay:10
});
assert.equal(defaultDay.ok,true);

// Public Prayer app entry must expose the adapter without importing devotions
// into Home or rewriting the reader's source-owned texts.
const fakeWin={AO_NOVENAS_V3:{open:opts=>opts.novenaId==="christmas"}};
const owner=createPrayOwner(fakeWin);
assert.equal(typeof owner.openChurchNovenaRoute,"function");
assert.equal((await owner.openChurchNovenaRoute("novena:christmas")).ok,true);
assert.equal((await owner.openChurchNovenaRoute("novena:not_a_novena")).ok,false);
console.log("Church novena handoff: 19 IDs, lazy load, exact N3 deep links, once-only gallery return, fail-closed invalid routes.");
