// Source-exact priest head-bow inline artwork; existing V4.6 artwork picked
// in the 10 October user's icon preferences, and separately bound to the
// priest in the original gesture matrix. It remains a published text rubric,
// not a newly observed LIVE action or a priest action-rail substitution.
const HEAD_BOW_IMAGE=new URL("../../assets/active/mass-v46/head_bow.svg",import.meta.url).href;
export const PRIEST_HEAD_BOW_RUBRIC_ART=Object.freeze({
  "AO.RUB.C0010.01":Object.freeze({cueId:"AO.SM.C0010",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0010.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0058.01":Object.freeze({cueId:"AO.SM.C0058",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0058.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0061.01":Object.freeze({cueId:"AO.SM.C0061",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0061.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0064.01":Object.freeze({cueId:"AO.SM.C0064",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0064.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0067.01":Object.freeze({cueId:"AO.SM.C0067",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0067.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0072.01":Object.freeze({cueId:"AO.SM.C0072",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0072.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0093.01":Object.freeze({cueId:"AO.SM.C0093",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0093.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0101.01":Object.freeze({cueId:"AO.SM.C0101",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0101.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0126.01":Object.freeze({cueId:"AO.SM.C0126",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0126.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0208.01":Object.freeze({cueId:"AO.SM.C0208",label:"BOWS HEAD",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0208.01",imageUrl:HEAD_BOW_IMAGE}),
  "AO.RUB.C0263.03":Object.freeze({cueId:"AO.SM.C0263",label:"BOWS HEAD TO CROSS",actor:"PRIEST",sourceKind:"GESTURE",publishedKind:"ACTION",assetPath:"assets/active/mass-v46/head_bow.svg",assetUserKey:"you:head_bow",matrixId:"GM.P.C0263.03",imageUrl:HEAD_BOW_IMAGE}),
});
export function approvedPriestHeadBowRubricArt(event){
  const art=PRIEST_HEAD_BOW_RUBRIC_ART[String(event?.id??"")];
  if(!art)return null;
  return event?.sourceCueId===art.cueId &&
    event?.shortAction===art.label &&
    event?.actor===art.actor &&
    event?.kind===art.publishedKind &&
    event?.observedNow===false &&
    event?.owner==="PUBLISHED_R17_MISSAL_INLINE" &&
    event?.review==="EXISTING_PUBLISHED_R17_1962_RUBRIC" &&
    event?.sourceId==="MR62_RITUS" ?art:null;
}
