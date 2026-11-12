import {resolveChurchNovenaId} from "./church-novena-ids.v1.js";

/**
 * Bridge one Prayer Church novena door to the existing production N3 reader.
 * Never returns a different devotion or synthesizes a prayer body.
 *
 * returnToChurch receives {route,id,context} after the reader's Back action.
 * The Church owns its gallery/camera restoration; the novena runtime continues
 * to own daily stage, language, calendar status, and source witness.
 */
export async function openChurchNovenaRoute(route,{
  win=globalThis,ensureReader,returnToChurch,returnContext=null,novenaDay
}={}){
  const id=resolveChurchNovenaId(route);
  if(!id)return Object.freeze({ok:false,reason:"UNKNOWN_NOVENA_ROUTE",route});
  try{
    if(typeof ensureReader==="function")await ensureReader();
  }catch(error){
    return Object.freeze({ok:false,reason:"READER_LOAD_FAILED",route,error:String(error?.message??error)});
  }
  const runtime=win?.AO_NOVENAS_V3;
  if(typeof runtime?.open!=="function")
    return Object.freeze({ok:false,reason:"READER_NOT_INSTALLED",route});
  const options={novenaId:id};
  if(Number.isInteger(novenaDay)&&novenaDay>=1&&novenaDay<=9)
    options.novenaDay=novenaDay;
  if(typeof returnToChurch==="function"){
    let restored=false;
    options.onCloseReturn=()=>{
      if(restored)return false;
      restored=true;
      return returnToChurch({route,id,context:returnContext});
    };
  }
  try{
    const result=await runtime.open(options);
    if(result!==true&&result?.ok!==true)
      return Object.freeze({ok:false,reason:"READER_REFUSED",route,id});
    return Object.freeze({ok:true,route,id,reader:"AO_NOVENAS_V3"});
  }catch(error){
    return Object.freeze({ok:false,reason:"READER_OPEN_FAILED",route,id,error:String(error?.message??error)});
  }
}
