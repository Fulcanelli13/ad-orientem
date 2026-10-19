import {resolveRiteMusicScene} from "./reader-rite-music-authority.js";

// Presentation bridge only. The registry owns which sung material belongs to
// each special-rite card; the native rite retains its existing Latin text.
// Neither this resolver nor card navigation advances the Mass Schola clock.
export function projectRiteMusicBadge({registry,riteId,stageId,sourcePayload,condition=null}={}){
  if(!registry||!sourcePayload||!riteId||!stageId)return null;
  const scene=resolveRiteMusicScene({registry,riteId,stageId,sourcePayload,condition});
  if(scene.status!=="EXPECTED_NOT_OBSERVED")return null;
  const events=scene.events.filter(event=>event.status==="EXPECTED_NOT_OBSERVED");
  if(!events.length)return null;
  const sung=events.some(event=>event.kind!=="PRIEST_DIALOGUE_WITH_RESPONSES");
  const choir=events.some(event=>/SCHOLA/.test(event.performers));
  const category=choir?"SCHOLA":sung?"LITURGICAL CHANT":"SUNG RESPONSES";
  return Object.freeze({
    schema:"ao-special-rite-music-card-v1",category,
    label:"EXPECTED · "+category,
    description:events.some(e=>e.segmentScope)
      ? "Expected only for "+events.map(e=>e.segmentScope).filter(Boolean).join("; ")+". Not heard or timed."
      : "Expected from the rite source, not heard or timed",
    eventIds:Object.freeze(events.map(e=>e.id)),
    performers:Object.freeze(events.map(e=>e.performers)),
    riteId,stageId,sourceOwner:"EXISTING_NATIVE_RITE",
    musicStatus:"EXPECTED_NOT_OBSERVED",actuallySinging:"UNKNOWN",
  });
}

// The editable research matrix is not runtime source. Load the already
// source-validated 24-event registry; do not inline 24 duplicate chant texts.
export async function loadRiteMusicRegistry({
  fetchImpl=globalThis.fetch,baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("Rite music fetch required");
  const url=new URL("../../data/research/mass-special-rite-music-events-20261019.v1.json",baseUrl);
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("RITE_MUSIC_REGISTRY_UNAVAILABLE");
  const registry=await response.json();
  if(registry?.schema!=="ao-mass-special-rite-music-events-v1")
    throw new Error("RITE_MUSIC_REGISTRY_SCHEMA_MISMATCH");
  return registry;
}
