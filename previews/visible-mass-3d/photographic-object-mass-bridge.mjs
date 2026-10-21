/**
 * Visible Mass P5 — photographic object → Mass moment presentation adapter.
 *
 * The P1 question team retains ownership of all object/question identities.
 * Guide/Formation content comes from its certified source modules. This file
 * specifies *contextual navigation candidates*, not rubrics, doctrinal answers,
 * object-specific liturgical rules, or independently approved action links.
 */
import {projectVisibleMassExplorer} from "./photographic-mass-explorer-bridge.mjs";
import {VISIBLE_MASS_ZONE_COUNTS} from "./photographic-scene-bridge.mjs";

export const VISIBLE_MASS_OBJECT_ACTION_BRIDGE_VERSION="visible-mass-p5-object-action-v1";
export const VISIBLE_MASS_OBJECT_ACTION_SOURCE_OWNERS=Object.freeze({
  objects:"previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json",
  photographs:"previews/visible-mass-3d/sanctuary-hotspot-pilot.html",
  glossary:"data/glossary/concepts-*.v1.json",
  guide:"data/presentation/guide-registry.v1.json",
  formation:"data/learn/mass-formation-campion.v1.json",
  massExplorer:"src/learn/mass-explorer.js"
});
const edge=(objectId,guideId,label,relation,note)=>Object.freeze({
  objectId,guideId,label,relation,note,
  ritualPublicationStatus:"CONTEXTUAL_UNREVIEWED",
  sourceAuthority:"EXISTING_SUNG_GUIDE_ONLY",
  assertsPhotoIsSameMass:false,
  confirms1962ObjectRubric:false
});
export const VISIBLE_MASS_OBJECT_ACTION_CANDIDATES=Object.freeze([
  edge("AL01","AO.CARD.010","The Offertory","OBJECT_MOMENT_CONTEXT",
       "This is a broader published Guide moment at the altar; no specific photographed Offertory action is certified."),
  edge("AL01","AO.CARD.015","Consecration and elevation","OBJECT_MOMENT_CONTEXT",
       "The Elevation witness is from a different church, and is not documentary proof of an action at Brompton."),
  edge("SN02","AO.CARD.024","Before the faithful receive","OBJECT_MOMENT_CONTEXT",
       "Ecce Agnus Dei is Communion preparation, not an image proving use of the Brompton rail."),
  edge("SN02","AO.CARD.025","Communion of the Faithful","OBJECT_MOMENT_CONTEXT",
       "The published Guide describes distribution, but no scene photo certifies Communion at this rail."),
  edge("AL06","AO.CARD.015","The Sacrifice of the Mass","THEMATIC_QUESTION_PENDING",
       "The crucifix/Calvary relationship remains an unanswered P1.5 research prompt; no object-specific answer is implied."),
  edge("AL07","AO.CARD.015","At the elevation","THEMATIC_QUESTION_PENDING",
       "A liturgical moment for orientation only; candle count and ceremonial prescriptions remain uncertified.")
]);
export const VISIBLE_MASS_OBJECTS_WITHOUT_ACTION_CANDIDATES=Object.freeze(["AL19","SN04"]);

export function projectVisibleMassObjectActions(sanctuary,guideRegistry,formation,{massForm="SUNG"}={}){
  const guide=projectVisibleMassExplorer(guideRegistry,formation,{massForm});
  if(!Array.isArray(sanctuary)||sanctuary.length!==6||
      Object.values(VISIBLE_MASS_ZONE_COUNTS).reduce((a,b)=>a+b,0)!==170)
    throw new Error("Six original photo bindings and research crosswalk required");
  const known=new Map(sanctuary.map(o=>[o.id,o]));
  const expected=Object.freeze({AL01:"G404",AL06:"G079",AL07:"G079",
                                AL19:"G418",SN02:"G186",SN04:"G181"});
  if(known.size!==6||Object.entries(expected).some(([id,g])=>
    known.get(id)?.glossaryId!==g||known.get(id)?.photoId!=="BROMPTON_ALTAR_2019_B"))
    throw new Error("P5 cannot rebind objects or transfer image coordinates");
  const byGuide=new Map(guide.stops.map(m=>[m.id,m]));
  const records=Array.from(known.values(),object=>{
    const edges=VISIBLE_MASS_OBJECT_ACTION_CANDIDATES.filter(e=>e.objectId===object.id)
      .map(e=>{
        const moment=byGuide.get(e.guideId);
        if(!moment)throw new Error("P5 unsupported canonical Guide ID "+e.guideId);
        return Object.freeze({...e,moment,photoContext:moment.photoContext});
      });
    return Object.freeze({
      objectId:object.id,glossaryId:object.glossaryId,
      glossaryRelation:object.glossaryRelation,photoId:object.photoId,
      sourceQuestionIds:object.linkedQuestionIds,
      edges:Object.freeze(edges),owner:"EXISTING_OBJECT_AND_SUNG_GUIDE",
      coordinateStatus:object.coordinatesStatus
    });
  });
  const all=records.flatMap(x=>x.edges);
  if(all.length!==6||records.filter(x=>x.edges.length>0).length!==4||
     VISIBLE_MASS_OBJECTS_WITHOUT_ACTION_CANDIDATES.some(id=>records.find(x=>x.objectId===id)?.edges.length!==0)||
     all.some(e=>e.assertsPhotoIsSameMass||e.confirms1962ObjectRubric))
    throw new Error("P5 relationship publication gate failed");
  return Object.freeze({schema:"AO_VISIBLE_MASS_P5_OBJECT_ACTION_PRESENTATION_V1",
    status:"DRAFT_CONTEXTUAL_CROSSWALK_NO_RUBRIC_CERTIFICATION",
    sourceOwners:VISIBLE_MASS_OBJECT_ACTION_SOURCE_OWNERS,
    photoSubjectCount:6,edgeCount:6,linkedSubjectCount:4,guideProfile:"SUNG",
    records:Object.freeze(records),publishesMassActions:false,publishesQuestionAnswers:false});
}
