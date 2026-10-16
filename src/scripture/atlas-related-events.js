/*
 * A read-only projection of the canonical Biblical Atlas event registry.
 * Atlas owns event identity, title, source verse, sequence and geographic cautions.
 * Nothing here certifies a map coordinate, a chronological year or a new reading.
 */
import {buildBibleAtlas} from "../find/bible-atlas.js";
import {parseScriptureContext} from "./context.js";

const ATLAS_DATA=new URL("../../data/explore/bible-places-compact.v1.json",import.meta.url);
let atlasPromise=null;

export function scriptureAtlasEventObjects(entries){
  const stops=buildBibleAtlas(entries);
  if(stops.length!==151||new Set(stops.map(x=>x.eventKey)).size!==151)
    throw new Error("Atlas canonical 151-event set unavailable");
  return Object.freeze(stops.map(stop=>{
    const parsed=parseScriptureContext(stop.reference);
    if(!parsed)throw new Error("Unresolved Atlas Scripture event: "+stop.eventKey);
    return Object.freeze({
      id:"atlas:"+stop.eventKey,
      source:"atlas",
      objectId:stop.eventKey,
      passage:parsed.passage,
      reference:parsed.reference,
      relation:"BIBLICAL_NARRATIVE_OR_VISION_EVENT",
      title:Object.freeze({en:"Biblical Atlas · "+stop.title_en,fr:"Atlas biblique · "+stop.title_fr}),
      description:Object.freeze({
        en:"Source-listed Atlas episode. A biblical reference does not certify a site, date or historical identification.",
        fr:"Épisode de l’Atlas appuyé sur la source. La référence ne certifie ni un site, ni une date, ni une identification historique."
      }),
      target:Object.freeze({type:"atlas",eventKey:stop.eventKey})
    });
  }));
}
export async function loadScriptureAtlasEventObjects(fetcher=globalThis.fetch){
  if(typeof fetcher!=="function")return Object.freeze([]);
  if(!atlasPromise){
    atlasPromise=(async()=>{
      const response=await fetcher(ATLAS_DATA.href);
      if(!response?.ok)throw new Error("Canonical Atlas source unavailable");
      const data=await response.json();
      if(!Array.isArray(data?.entries))throw new Error("Canonical Atlas records missing");
      return scriptureAtlasEventObjects(data.entries);
    })().catch(error=>{atlasPromise=null;throw error;});
  }
  return atlasPromise;
}
