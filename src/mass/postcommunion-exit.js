// P2-008 Postcommunion exit ownership.
// The canonical Ordinary keeps AO.SM.C0256 in B088. When Prayer over the People
// is inserted, an overlay suppresses that base occurrence and replays its route
// semantic only after the inserted prayer completes.

export const POSTCOMMUNION_EXIT_CUES=Object.freeze({
  postcommunionProper:"AO.SM.C0254",
  postcommunionAmen:"AO.SM.C0255",
  ordinaryExit:"AO.SM.C0256",
  finalDominusVobiscum:"AO.SM.C0257",
});

export const POSTCOMMUNION_EXIT_ACTION=Object.freeze({
  semanticDonorCueId:"AO.SM.C0256",
  action:"CLOSE_MISSAL_RETURN_CENTRE_KISS_ALTAR_TURN_TO_PEOPLE",
  fromStation:"ALTAR_EPISTLE_MISSAL",
  toStation:"ALTAR_CENTER",
  facingAfter:"PEOPLE",
});

export function compilePostcommunionExitDelta({prayerOverPeoplePresent=false}={}){
  if(!prayerOverPeoplePresent){
    return Object.freeze({
      schema:"ao-postcommunion-exit-v1",
      mode:"ORDINARY",
      suppressBaseCueIds:Object.freeze([]),
      insertionGraph:Object.freeze([]),
      activeOrder:Object.freeze([
        POSTCOMMUNION_EXIT_CUES.postcommunionProper,
        POSTCOMMUNION_EXIT_CUES.postcommunionAmen,
        POSTCOMMUNION_EXIT_CUES.ordinaryExit,
        POSTCOMMUNION_EXIT_CUES.finalDominusVobiscum,
      ]),
      exitOwner:POSTCOMMUNION_EXIT_CUES.ordinaryExit,
      handoffCueId:POSTCOMMUNION_EXIT_CUES.finalDominusVobiscum,
    });
  }

  const insertionGraph=Object.freeze([
    Object.freeze({
      id:"R17.POP.010",
      type:"PRAYER_OVER_PEOPLE_GRAPH",
      contentRef:"proper.orations.prayerOverPeople",
      station:"ALTAR_EPISTLE_MISSAL",
      orderOwner:"INSERTION",
    }),
    Object.freeze({
      id:"R17.POP.020",
      type:"DEFERRED_POSTCOMMUNION_EXIT",
      ...POSTCOMMUNION_EXIT_ACTION,
      orderOwner:"INSERTION",
      after:"R17.POP.010",
      before:POSTCOMMUNION_EXIT_CUES.finalDominusVobiscum,
    }),
  ]);

  return Object.freeze({
    schema:"ao-postcommunion-exit-v1",
    mode:"PRAYER_OVER_PEOPLE",
    suppressBaseCueIds:Object.freeze([POSTCOMMUNION_EXIT_CUES.ordinaryExit]),
    insertionGraph,
    activeOrder:Object.freeze([
      POSTCOMMUNION_EXIT_CUES.postcommunionProper,
      POSTCOMMUNION_EXIT_CUES.postcommunionAmen,
      "R17.POP.010",
      "R17.POP.020",
      POSTCOMMUNION_EXIT_CUES.finalDominusVobiscum,
    ]),
    exitOwner:"R17.POP.020",
    semanticDonorCueId:POSTCOMMUNION_EXIT_CUES.ordinaryExit,
    handoffCueId:POSTCOMMUNION_EXIT_CUES.finalDominusVobiscum,
  });
}

export function assertPostcommunionExitOwnership(delta){
  if(!delta || delta.schema!=="ao-postcommunion-exit-v1"){
    throw new TypeError("ao-postcommunion-exit-v1 required");
  }
  const order=[...(delta.activeOrder??[])];
  const finalIndex=order.indexOf(POSTCOMMUNION_EXIT_CUES.finalDominusVobiscum);
  if(finalIndex<0) throw new Error("Final Dominus vobiscum handoff missing");

  if(delta.mode==="PRAYER_OVER_PEOPLE"){
    if(!delta.suppressBaseCueIds?.includes(POSTCOMMUNION_EXIT_CUES.ordinaryExit)){
      throw new Error("B088 ordinary exit cue must be suppressed for Prayer over the People");
    }
    if(order.includes(POSTCOMMUNION_EXIT_CUES.ordinaryExit)){
      throw new Error("B088 ordinary exit executed before Prayer over the People");
    }
    const prayerIndex=order.indexOf("R17.POP.010");
    const exitIndex=order.indexOf("R17.POP.020");
    if(!(prayerIndex>=0 && exitIndex>prayerIndex && finalIndex>exitIndex)){
      throw new Error("Prayer-over-People exit/handoff ordering is invalid");
    }
    if(delta.insertionGraph?.[1]?.semanticDonorCueId!==POSTCOMMUNION_EXIT_CUES.ordinaryExit){
      throw new Error("Deferred exit lost AO.SM.C0256 semantic donor");
    }
  }else{
    const exitIndex=order.indexOf(POSTCOMMUNION_EXIT_CUES.ordinaryExit);
    if(!(exitIndex>=0 && finalIndex>exitIndex)){
      throw new Error("Ordinary Postcommunion exit ordering is invalid");
    }
  }
  return delta;
}
