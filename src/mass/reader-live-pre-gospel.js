// Recovered v1.83 LIVE pre-Gospel architecture contract.
// This module owns presentation-lane boundaries only. It does not create
// liturgical events, mutate Proper content, or enable native LIVE rendering.

export const V183_PRE_GOSPEL_LIVE_CONTRACT=Object.freeze({
  version:"v1.83-recovered-pre-gospel-v1",
  status:"RECOVERED_CONTRACT_LOCKED__SOURCE_FIRST_LIVE_INTEGRATED",
  gradual:Object.freeze({
    blockId:"AO.SM.B021",
    lane:"MAIN_READER",
    ownership:"GRADUAL_ONLY",
  }),
  alleluiaTract:Object.freeze({
    blockId:"AO.SM.B022",
    lane:"SCHOLA",
    ownership:"ALLELUIA_TRACT",
    mayMergeIntoGradual:false,
  }),
  munda:Object.freeze({
    blockId:"AO.SM.B023",
    lane:"MAIN_READER",
    ownership:"MUNDA_COR_MEUM_START",
  }),
  order:Object.freeze(["AO.SM.B021","AO.SM.B022","AO.SM.B023"]),
  nativeLiveReleaseRequires:"SOURCE_FIRST_LIVE_STRUCTURE",
});

export function assertV183PreGospelLiveContract(contract=V183_PRE_GOSPEL_LIVE_CONTRACT){
  if(contract?.gradual?.blockId!=="AO.SM.B021")throw new Error("v1.83 Gradual ownership changed");
  if(contract?.gradual?.lane!=="MAIN_READER")throw new Error("B021 left the main reader lane");
  if(contract?.alleluiaTract?.blockId!=="AO.SM.B022")throw new Error("v1.83 Alleluia/Tract ownership changed");
  if(contract?.alleluiaTract?.lane!=="SCHOLA")throw new Error("B022 must remain Schola-owned");
  if(contract?.alleluiaTract?.mayMergeIntoGradual!==false)throw new Error("B022 was allowed to merge into B021");
  if(contract?.munda?.blockId!=="AO.SM.B023")throw new Error("v1.83 Munda start changed");
  if(contract?.munda?.lane!=="MAIN_READER")throw new Error("B023 left the main reader lane");
  if(JSON.stringify(contract?.order)!==JSON.stringify(["AO.SM.B021","AO.SM.B022","AO.SM.B023"])){
    throw new Error("v1.83 pre-Gospel ordering changed");
  }
  if(contract?.nativeLiveReleaseRequires!=="SOURCE_FIRST_LIVE_STRUCTURE"){
    throw new Error("Gradual contract lost source-first LIVE ownership");
  }
  return contract;
}
