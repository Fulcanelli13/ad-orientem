// Release boundary is code-owned and cannot be enabled by a URL, query string,
// localStorage, console flag or a remote Calendar/Sacred Art file.
// A deployment must explicitly change this reviewed source constant.
export const ACTIVE_SAINTS_CHANNEL="PILOT_SIX";
export const SAINTS_CHANNELS=Object.freeze({
  PILOT_SIX:"PILOT_SIX",
  RESEARCH_PREVIEW:"RESEARCH_PREVIEW",
});
export const isResearchSaintsChannel=channel=>channel===SAINTS_CHANNELS.RESEARCH_PREVIEW;
export function applySaintsReleaseBoundary(dataset,channel=ACTIVE_SAINTS_CHANNEL){
  const research=isResearchSaintsChannel(channel);
  return Object.freeze({
    ...dataset,
    saintsRelease:Object.freeze({channel:research?"RESEARCH_PREVIEW":"PILOT_SIX",researchEnabled:research,
      publicPortraitsApproved:false,allowUncertified1962Mass:false}),
    saintsDoctors:research?dataset?.saintsDoctors??null:null,
    saintsVocations:research?dataset?.saintsVocations??null:null,
    saintsOwnerIndex:research?dataset?.saintsOwnerIndex??null:null,
    saintsShrineReadiness:research?dataset?.saintsShrineReadiness??null:null,
    saintsW78Evidence:research?dataset?.saintsW78Evidence??null:null,
  });
}
