// Shared, lazy, source-owned read model for Calendar and Home.
// One cached fetch and the same reviewed-sanctoral projection; no second Ordo.
export const LIVING_SANCTORAL_READ_MODEL_VERSION="ao-living-sanctoral-shared-read-v1";
const MODEL_URL=new URL("../../data/calendar/living-sanctoral-read-model.v1.json",import.meta.url).href;
let readModel=null,loading=null;
export function getSharedSanctoralReadModel(){return readModel}
export async function loadSharedSanctoralReadModel(fetcher=globalThis.fetch){
  if(readModel)return readModel;
  if(loading)return loading;
  if(typeof fetcher!=="function")return null;
  loading=Promise.resolve().then(()=>fetcher(MODEL_URL,{headers:{accept:"application/json"}}))
    .then(response=>response?.ok?response.json():null)
    .then(json=>{
      if(json?.schema!=="AO_LIVING_SANCTORAL_READ_MODEL_V1" ||
         json.status!=="READ_ONLY_SECONDARY_CALENDAR" ||
         !Array.isArray(json.observanceRegistry?.observances) ||
         !Array.isArray(json.visualCrosswalk?.links))return null;
      readModel=json;
      return readModel;
    })
    .catch(()=>null)
    .finally(()=>{loading=null});
  return loading;
}
