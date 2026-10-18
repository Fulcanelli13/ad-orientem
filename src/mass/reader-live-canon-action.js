/**
 * One narrowly scoped LIVE correction to the frozen priest-action label.
 * C0185's donor says "SIGNS HOST", omitting the following Chalice cross.
 * The independently source-certified gesture matrix already records both.
 * Do not alter the donor or promote the unpublished R62 action catalogue.
 *
 * This is a source-cue READING aid; it is not evidence of an observed
 * priest gesture or an independently timed minister event.
 */
export function certifiedLiveCanonActionOverride({
  presentationMode=null,curatedPresentation=false,cueId=null,matrixAction=null,
}={}){
  if(String(presentationMode??"").toUpperCase()!=="LIVE" ||
     curatedPresentation!==true ||
     cueId!=="AO.SM.C0185" ||
     matrixAction?.owner!=="GESTURE_MATRIX_SOT" ||
     matrixAction?.sourceGestureId!=="GM.P.C0185.01" ||
     matrixAction?.cueId!==cueId ||
     matrixAction?.authorityClass!=="1962_NORMATIVE" ||
     matrixAction?.label!=="CROSSES HOST THEN CHALICE" ||
     matrixAction?.iconKey!=="cross" ||
     !Array.isArray(matrixAction?.sources) ||
     !matrixAction.sources.includes("MR62_RITUS"))return null;
  return Object.freeze({
    ...matrixAction,observedNow:false,
    sourceCueAdvisory:true,
  });
}
