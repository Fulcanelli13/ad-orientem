// Editorial review of source-owned Campion/1962 gesture artwork.
// Never auto-promote a suggestion into the frozen v4.6 icon resolver.
const KNOWN_STATION_GAPS=Object.freeze([
 Object.freeze({id:"POS.EPISTLE_MISSAL",station:"ALTAR_EPISTLE_MISSAL",title:"Priest at Epistle-side Missal",current:"priest_centre",candidate:"priest-epistle-side.svg",priority:"HIGH"}),
 Object.freeze({id:"POS.EPISTLE_SIDE",station:"ALTAR_EPISTLE_SIDE",title:"Priest at Epistle side",current:"priest_centre",candidate:"priest-epistle-side.svg",priority:"HIGH"}),
 Object.freeze({id:"POS.GOSPEL_MISSAL",station:"ALTAR_GOSPEL_MISSAL",title:"Priest at Gospel-side Missal",current:"priest_centre",candidate:"priest-gospel-side.svg",priority:"HIGH"}),
]);
const PENDING_CANDIDATES=Object.freeze({
 "GM.P.C0117.01":Object.freeze({candidate:"priest-eyes-hands-raised.svg",comparator:"priest_centre_arms_rich",issue:"Exact eyes-up and arms-up action; compare new line drawing with frozen rich action art"}),
 "GM.P.C0263.01":Object.freeze({candidate:"priest-eyes-hands-raised.svg",comparator:"priest_centre_arms_rich",issue:"Reuse same source-verified gesture artwork only if the movements match"}),
 "GM.P.C0161.01":Object.freeze({candidate:"priest-hands-over-oblations.svg",comparator:"priest_centre_hands_rich",issue:"Palms above oblations must differ visibly from joined hands"}),
 "GM.P.C0155.01":Object.freeze({candidate:null,comparator:"priest_centre_hands_rich",issue:"Combined joining of hands and bow of head: verify pose, not just hand position"}),
 "GM.P.C0169.01":Object.freeze({candidate:null,comparator:"priest_centre_arms_rich",issue:"Raising eyes alone must not display raised hands"}),
 "GM.P.C0193.01":Object.freeze({candidate:null,comparator:"priest_centre_hands_rich",issue:"Joined hands and eyes toward Sacrament need distinct detail"}),
 "GM.P.C0204.01":Object.freeze({candidate:null,comparator:"canon",issue:"Minor elevation of Host and Chalice must not look like major elevations"}),
 "GM.F.C0021.01":Object.freeze({candidate:null,comparator:"profound_bow",issue:"Conditional profound bow versus kneeling; profile-aware action, not generic instruction"}),
 "GM.F.C0023.01":Object.freeze({candidate:null,comparator:"head_bow",issue:"Dynamic bowed/return cue; static bow alone misrepresents transition"}),
 "GM.F.C0056.01":Object.freeze({candidate:null,comparator:"head_bow",issue:"Customary only: must never become a universal congregational instruction"}),
 "GM.F.C0096.01":Object.freeze({candidate:null,comparator:"genuflect",issue:"Posture depends on seasonal and sung/local condition; may require split assets"}),
 "GM.F.C0173.01":Object.freeze({candidate:null,comparator:"kneel",issue:"Sequence kneel, bow, look to elevated Host; one static kneel is incomplete"}),
 "GM.F.C0174.01":Object.freeze({candidate:null,comparator:"kneel",issue:"Source-owned continuation at elevation of Host"}),
 "GM.F.C0179.01":Object.freeze({candidate:null,comparator:"kneel",issue:"Source-owned continuation at elevation of Chalice"}),
 "GM.F.C0235.01":Object.freeze({candidate:null,comparator:"head_bow",issue:"Recollected/bowed is sustained instruction; prefer unobtrusive textual cue"}),
 "GM.F.C0237.01":Object.freeze({candidate:null,comparator:"head_bow",issue:"Same family as C0235; do not duplicate icon without justified state"}),
 "GM.F.C0242.01":Object.freeze({candidate:null,comparator:"communion",issue:"Attention to Host is devotional; no invented prescribed body movement"}),
});
export function reviewCampionGestureIconGaps({matrix,positionRegistry,masterManifest}={}){
 if(matrix?.schema!=="ao-mass-gesture-matrix-v1"||!Array.isArray(matrix.items))
   throw new TypeError("Canonical 1962 gesture matrix required");
 if(positionRegistry?.schema!=="ao-r17-reader-priest-positions-v1")
   throw new TypeError("Canonical priest-position source required");
 if(masterManifest?.schema!=="ao-mass-v46-master-icon-bank-v1")
   throw new TypeError("Frozen master icon manifest required");
 const available=new Set(masterManifest.assets?.map(x=>x.key));
 const bound=matrix.items.filter(x=>x.iconStatus==="V46_SEMANTIC_BINDING"&&x.iconKey&&available.has(x.iconKey));
 const pending=matrix.items.filter(x=>x.iconStatus==="PENDING_EXACT_MASTER"&&!x.iconKey);
 const unmapped=matrix.items.filter(x=>!bound.includes(x)&&!pending.includes(x));
 if(unmapped.length)throw new Error("UNEXPECTED_GESTURE_ICON_STATE:"+unmapped.map(x=>x.id).join(","));
 const proposals=pending.map(item=>{
   const note=PENDING_CANDIDATES[item.id];
   if(!note)throw new Error("MISSING_GESTURE_ARTWORK_DISPOSITION:"+item.id);
   if(note.comparator&&!available.has(note.comparator))throw new Error("UNKNOWN_COMPARISON_ICON:"+item.id);
   return Object.freeze({
     id:item.id,cueId:item.cueId,actor:item.actor,gesture:item.gesture,label:item.label,
     sourceAuthority:item.authorityClass,campionPages:item.campionPages??[],
     candidate:note.candidate,comparator:note.comparator,reason:note.issue,
     status:"REVIEW_REQUIRED",runtimeBinding:null,postureProfileGate:item.runtimeProfile,
   });
 });
 const stations=KNOWN_STATION_GAPS.map(item=>{
   if(!positionRegistry.items.some(row=>row.station===item.station))
     throw new Error("UNKNOWN_PRIEST_STATION:"+item.station);
   return Object.freeze({...item,status:"REVIEW_REQUIRED",runtimeBinding:null});
 });
 return Object.freeze({
   schema:"ao-mass-icon-gap-audit-v1",
   matrixRows:matrix.items.length,priestRows:matrix.items.filter(x=>x.actor==="PRIEST").length,
   faithfulRows:matrix.items.filter(x=>x.actor==="FAITHFUL").length,
   activeBankMasters:masterManifest.assets.length,
   approvedMatrixBindings:bound.length,
   pendingMatrixBindings:pending.length,
   stationCueTransitions:positionRegistry.items.length,
   stationVariantsToReview:stations.length,
   remainingLiveAmbiguity:pending.length+stations.length,
   matrixReviewRows:Object.freeze(proposals),
   positionReviewRows:Object.freeze(stations),
   campionRole:"DISCOVERY_ONLY_1962_MISSAL_NORMATIVE",
   activationPolicy:"USER_REVIEW_AND_SOURCE_VERIFICATION_REQUIRED",
 });
}
