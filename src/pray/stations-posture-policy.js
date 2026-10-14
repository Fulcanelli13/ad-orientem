/**
 * Postures for an explicitly chosen traditional PUBLIC Way of the Cross.
 * This is NOT an unconditional 14-station rubric, and is never enabled
 * merely because the user selected "group" recitation.
 * Original period witness: Oakley, Catholic Worship (1872), Stations chapter.
 * Contemporary corroboration: Westminster Cathedral, public Stations guide.
 */
export const STATIONS_PUBLIC_POSTURE_SOURCE=Object.freeze({
 id:"OAKLEY.PUBLIC.STATIONS.VR-MEDITATION-PRAYER",
 url:"https://upload.wikimedia.org/wikipedia/commons/b/bb/Catholic_worship-_a_manual_of_popular_instruction_on_the_ceremonies_and_devotions_of_the_church_%28IA_catholicworshipm00oake%29.pdf",
 corroboration:"https://westminstercathedral.org.uk/how-to-make-the-stations-of-the-cross/",
 status:"DOCUMENTED_HISTORICAL_PUBLIC_METHOD",
 scope:"Optional traditional public practice; not universal private Stations."
});
const CUES=Object.freeze({
 versicle:Object.freeze({action:"GENUFLECT",phase:"versicle"}),
 meditation:Object.freeze({action:"STAND",phase:"meditation"}),
 prayer:Object.freeze({action:"KNEEL",phase:"prayer"})
});
export function certifiedPublicStationCue({stationStep=null,phase=null,enabled=false,guided=false}={}){
 if(enabled!==true||!Number.isInteger(stationStep)||stationStep<0||stationStep>13)return null;
 const row=CUES[phase];
 if(!row || (phase!=="versicle" && guided!==true))return null;
 return Object.freeze({certified:true,action:row.action,phase:row.phase,
  stationStep,method:"TRADITIONAL_PUBLIC",
  sourceCueId:"STATIONS.PUBLIC."+(stationStep+1)+"."+row.phase.toUpperCase(),
  sourceUrl:STATIONS_PUBLIC_POSTURE_SOURCE.url,
  appliesTo:"FAITHFUL",performed:false});
}
export function stationPhaseOfFocusedParagraph(paragraph){
 if(paragraph?.matches?.(".aoP435930VRLine.leader"))return "versicle";
 if(paragraph?.closest?.(".aoP435930StationConsider"))return "meditation";
 if(paragraph?.closest?.(".aoP435930StationPrayer"))return "prayer";
 return null;
}
