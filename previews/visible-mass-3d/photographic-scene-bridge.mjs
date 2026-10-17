/**
 * The Visible Mass P4: read-only photographic environment adapter.
 *
 * Phase 1 researchers own the 170-object crosswalk and 134-question sanctuary
 * pilot. This adapter only binds scene/asset IDs to existing source-owned IDs.
 * No independent glossary definitions, question answers, historical assertions
 * or Mass reader events belong here.
 */
export const VISIBLE_MASS_SCENE_BRIDGE_VERSION = "visible-mass-photo-bridge-v1";
export const VISIBLE_MASS_SOURCE_OWNERS = Object.freeze({
  objects: "previews/visible-mass-3d/PHASE1_OBJECT_QUESTION_RECONCILIATION_20261017.md",
  pilot: "previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json",
  pilotHotspots: "previews/visible-mass-3d/sanctuary-hotspot-pilot.html",
  glossary: "data/glossary/concepts-*.v1.json",
  formation: "data/learn/mass-formation-campion.v1.json",
  explorer: "src/learn/mass-explorer.js",
  massReader: "src/mass/reader-live-source.js"
});

export const VISIBLE_MASS_ZONE_COUNTS = Object.freeze({
  EN:13, DV:12, SN:11, AL:20, SV:13, LN:8, EQ:16,
  SC:10, VE:20, BK:15, SA:11, SE:14, SP:7
});
export const VISIBLE_MASS_ROUTES = Object.freeze([
  Object.freeze({
    id:"LONDON_ORATORY", role:"TLM_ENVIRONMENT", venue:"Brompton Oratory, London",
    entry:"BROMPTON_PANO", primary:"BROMPTON_ALTAR_2019_A",
    inspection:"BROMPTON_ALTAR_2019_B", inspectionObjectCount:6,
    chapelRoute:"OPTIONAL_ONLY", massWitnessSource:"SEPARATE_DOCUMENTED_TLM_PHOTOGRAPHS",
    geometry:"FIXED_VANTAGE_360_PLUS_EXPLICIT_STILL_TRANSITIONS"
  }),
  Object.freeze({
    id:"NEWMAN_DUBLIN", role:"CATHOLIC_ARCHITECTURE_NOT_TLM", venue:"Newman University Church, Dublin",
    entry:"NEWMAN_360", geometry:"FIXED_VANTAGE_360_PLUS_EXPLICIT_STILL_TRANSITIONS",
    ritualClaim:"DO_NOT_LABEL_AS_1962_CELEBRATION"
  })
]);

const PILOT_IDS = Object.freeze(["AL01","AL06","AL07","AL19","SN02","SN04"]);
const EXACT_PHOTO = "BROMPTON_ALTAR_2019_B";
const PARENT_MATCH = "R";

export function projectVisibleMassSanctuary(pilot, glossaryById, photographicMarks) {
  if(pilot?.schema !== "AO_VISIBLE_MASS_P1_SANCTUARY_QUESTION_RECONCILIATION_V1" ||
     pilot?.status !== "RESEARCH_ONLY_NO_PUBLICATION") {
    throw new Error("Visible Mass must use the research-owned Phase 1 sanctuary register, not a copied publication set");
  }
  if(!Array.isArray(pilot.objects) || !Array.isArray(photographicMarks)) {
    throw new Error("Missing original sanctuary objects or image-specific hotspot coordinates");
  }
  const selected = new Map(pilot.objects.filter(o=>PILOT_IDS.includes(o.object_id)).map(o=>[o.object_id,o]));
  const marks = new Map(photographicMarks.map(h=>[h.id,h]));
  if(selected.size!==6 || marks.size!==6) throw new Error("Six reconciled photo subjects required");
  return Object.freeze(PILOT_IDS.map(objectId=>{
    const original=selected.get(objectId), mark=marks.get(objectId);
    if(!original || !mark || !Number.isFinite(mark.x) || !Number.isFinite(mark.y) ||
       mark.x<0 || mark.x>100 || mark.y<0 || mark.y>100) {
      throw new Error("Missing or invalid same-photo coordinate for "+objectId);
    }
    if(!(original.scene_audit?.scene_assets||[]).includes(EXACT_PHOTO)) {
      throw new Error("Refuse hotspot transfer to a different photograph: "+objectId);
    }
    const g=original.glossary_id;
    if(!g || !glossaryById[g]) throw new Error("Unresolved canonical glossary concept "+g);
    if(g!==mark.g) throw new Error("Parallel-photo hotspot glossary mismatch "+objectId);
    const direct=original.glossary_match==="D";
    return Object.freeze({
      id:objectId, label:mark.title, x:mark.x, y:mark.y,
      photoId:EXACT_PHOTO,
      glossaryId:g,
      glossaryRelation:direct?"DIRECT":"RELATED_PARENT_ONLY",
      briefDefinition:direct?glossaryById[g].short_definition.en:null,
      linkedQuestionIds:Object.freeze([...(original.question_ids||[])]),
      questionAnswersPublished:false,
      coordinatesStatus:"AWAITING_REAL_DEVICE_HOTSPOT_QA",
      action:"OPEN_EXISTING_GLOSSARY"
    });
  }));
}

export function assertVisibleMassIntegrity(bridge) {
  if(Object.values(VISIBLE_MASS_ZONE_COUNTS).reduce((n,x)=>n+x,0)!==170)
    throw new Error("Phase 1 object counts changed without reconciliation");
  if(!bridge || bridge.length!==6 ||
     bridge.some(x=>x.coordinatesStatus!=="AWAITING_REAL_DEVICE_HOTSPOT_QA"))
    throw new Error("Visible Mass photo pilot published without device acceptance");
  if(VISIBLE_MASS_ROUTES.some(r=>r.id==="NEWMAN_DUBLIN" && r.role==="TLM_ENVIRONMENT"))
    throw new Error("Newman architectural tour must not masquerade as an active TLM venue");
  return true;
}
