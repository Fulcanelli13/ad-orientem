/*
 * Five chaplet artwork-stage families, from the existing 267-slot editorial
 * registry. This is NOT a chaplet prayer-text or bead-count implementation.
 * The active modular Prayer owners do not expose these five live stage routes.
 * Never mistake an eligible gallery candidate for an approved or usable photo.
 */
export const CHAPLET_ARTWORK_STAGE_CONTRACT_VERSION="2026-10-30-v1";

const F=Object.freeze;
const make=(route,title,cover,stages)=>F({
 route,title,cover:F({id:"cover",slot:cover,fit:"DEVOTION_COVER_NOT_EXACT_BEAD"}),
 stages:F(stages.map(([id,label,slot,fit])=>F({id,label,slot,fit}))),
 readerStatus:"NO_VERIFIED_ACTIVE_MODULAR_CHAPLET_OWNER",
 stageCountKnown:true,beadCountKnown:false,
 publicationReady:false
});

export const CHAPLET_ARTWORK_FAMILIES=F({
 "pray.divine_mercy":make("pray.divine_mercy","Divine Mercy","COV-pray.divine_mercy",[
  ["decades","Decades · shared scene pool","STG-pray.divine_mercy-01","SHARED_POOL_NOT_INDIVIDUAL_BEAD_SCENE"]
 ]),
 "pray.five_wounds":make("pray.five_wounds","Five Wounds","COV-pray.five_wounds",[
  ["left_foot","Left foot","STG-pray.five_wounds-01","WOUND_ANATOMY_DEPiction_NOT_CERTIFIED"],
  ["right_foot","Right foot","STG-pray.five_wounds-02","WOUND_ANATOMY_DEPiction_NOT_CERTIFIED"],
  ["left_hand","Left hand","STG-pray.five_wounds-03","WOUND_ANATOMY_DEPiction_NOT_CERTIFIED"],
  ["right_hand","Right hand","STG-pray.five_wounds-04","WOUND_ANATOMY_DEPiction_NOT_CERTIFIED"],
  ["sacred_side","Sacred side","STG-pray.five_wounds-05","PIERCED_SIDE_SCENE_APPROVAL_NOT_PHOTO_CERTIFICATION"]
 ]),
 "pray.precious_blood":make("pray.precious_blood","Precious Blood","COV-pray.precious_blood",[
  ["circumcision","Circumcision","STG-pray.precious_blood-01","EXACT_SCENE_CANDIDATES_ONLY"],
  ["agony","Agony in the Garden","STG-pray.precious_blood-02","EXACT_SCENE_CANDIDATES_ONLY"],
  ["scourging","Scourging","STG-pray.precious_blood-03","EXACT_SCENE_CANDIDATES_ONLY"],
  ["crowning","Crowning with Thorns","STG-pray.precious_blood-04","EXACT_SCENE_CANDIDATES_ONLY"],
  ["carrying_cross","Way of the Cross","STG-pray.precious_blood-05","EXACT_SCENE_CANDIDATES_ONLY"],
  ["crucifixion","Crucifixion","STG-pray.precious_blood-06","EXACT_SCENE_CANDIDATES_ONLY"],
  ["pierced_side","Piercing of the Side","STG-pray.precious_blood-07","EXACT_SCENE_CANDIDATES_ONLY"]
 ]),
 "pray.little_crown":make("pray.little_crown","Little Crown","COV-pray.little_crown",[
  ["beads","Repeated beads · shared image pool","STG-pray.little_crown-01","SHARED_POOL_NOT_INDIVIDUAL_BEAD_SCENE"]
 ]),
 "prayer.seven_sorrows_chaplet":make("prayer.seven_sorrows_chaplet","Seven Sorrows","COV-prayer.seven_sorrows_chaplet",[
  ["simeon","Prophecy of Simeon","STG-prayer.seven_sorrows_chaplet-01","EXACT_EVENT_CANDIDATES_ONLY"],
  ["flight_egypt","Flight into Egypt","STG-prayer.seven_sorrows_chaplet-02","EXACT_EVENT_CANDIDATES_ONLY"],
  ["loss_temple","Finding in Temple after loss","STG-prayer.seven_sorrows_chaplet-03","EXACT_EVENT_CANDIDATES_ONLY"],
  ["meet_cross","Mary meets Jesus carrying the Cross","STG-prayer.seven_sorrows_chaplet-04","EXACT_EVENT_CANDIDATES_ONLY"],
  ["crucifixion","Crucifixion","STG-prayer.seven_sorrows_chaplet-05","EXACT_EVENT_CANDIDATES_ONLY"],
  ["deposition","Christ taken down from the Cross","STG-prayer.seven_sorrows_chaplet-06","EXACT_EVENT_CANDIDATES_ONLY"],
  ["burial","Christ laid in tomb","STG-prayer.seven_sorrows_chaplet-07","EXACT_EVENT_CANDIDATES_ONLY"]
 ])
});

const NAMES=F({
 "divine_mercy":"pray.divine_mercy",
 "five_wounds":"pray.five_wounds",
 "precious_blood":"pray.precious_blood",
 "little_crown":"pray.little_crown",
 "seven_sorrows":"prayer.seven_sorrows_chaplet"
});

export function resolveChapletArtworkStage({id,stage="cover",bead=null}={}){
 const canonical=NAMES[id]||id;
 const family=CHAPLET_ARTWORK_FAMILIES[canonical];
 const beadNumber=Number.isInteger(bead)&&bead>=1?bead:null;
 if(!family)return F({key:"chaplet:unknown",slot:null,fit:"UNKNOWN_CHAPLET_FAMILY",publicationReady:false,assetUrl:null});
 const item=stage==="cover"?family.cover:family.stages.find(x=>x.id===stage);
 if(!item)return F({key:"chaplet:"+canonical+":unknown-stage",slot:null,fit:"UNKNOWN_CHAPLET_STAGE",publicationReady:false,assetUrl:null});
 return F({
  key:"chaplet:"+canonical+":"+item.id+(beadNumber?":bead-"+beadNumber:""),
  slot:item.slot,fit:item.fit,publicationReady:false,assetUrl:null,
  readerStatus:family.readerStatus,stageId:item.id,bead:beadNumber,
  verifiedImageIdentity:false,verifiedArtworkRights:false
 });
}
