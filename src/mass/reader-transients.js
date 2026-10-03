// Native R17 bell/cinematic transient projection.
// Canonical MC-* sound events remain the authority for bell semantics.
// Exact AO.SM.C#### bindings are recovered from the v1.34 runtime donor;
// they are presentation bindings only and never advance canonical state.

const SUPPORTED_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]);

export const BELL_CUE_BINDINGS=Object.freeze([
  Object.freeze({cueId:"AO.SM.C0145",label:"SANCTUS BELL",detail:"Sanctus",canonicalEventIds:Object.freeze(["MC-SAN-020"])}),
  Object.freeze({cueId:"AO.SM.C0161",label:"WARNING BELL",detail:"Before Consecration",canonicalEventIds:Object.freeze(["MC-CAN-070"])}),
  Object.freeze({cueId:"AO.SM.C0174",label:"ELEVATION BELL",detail:"Sacred Host",canonicalEventIds:Object.freeze(["MC-CNS-030","MC-CNS-040"])}),
  Object.freeze({cueId:"AO.SM.C0181",label:"ELEVATION BELL",detail:"Precious Blood",canonicalEventIds:Object.freeze(["MC-CNS-100","MC-CNS-110"])}),
  Object.freeze({cueId:"AO.SM.C0225",label:"COMMUNION WARNING",detail:"Shortly after Agnus Dei",canonicalEventIds:Object.freeze(["MC-COM-185"])}),
]);

const CINEMATIC_BY_CUE=Object.freeze({
  "AO.SM.C0145":Object.freeze({kind:"BELL",title:"SANCTUS BELL",subtitle:"SANCTUS",durationMs:1350}),
  "AO.SM.C0161":Object.freeze({kind:"BELL",title:"WARNING BELL",subtitle:"BEFORE CONSECRATION",durationMs:1350}),
  "AO.SM.C0174":Object.freeze({kind:"ELEVATION",title:"ELEVATION",subtitle:"SACRED HOST",durationMs:1950}),
  "AO.SM.C0181":Object.freeze({kind:"ELEVATION",title:"ELEVATION",subtitle:"PRECIOUS BLOOD",durationMs:1950}),
  "AO.SM.C0225":Object.freeze({kind:"BELL",title:"COMMUNION WARNING",subtitle:"SHORTLY AFTER AGNUS DEI",durationMs:1350}),
});

function conditionSet(prepared){
  const out=new Set();
  const add=value=>{
    if(typeof value==="string" && value.trim())out.add(value.trim());
    else if(value?.id)out.add(String(value.id));
  };
  for(const value of prepared?.session?.resolvedMass?.conditions??[])add(value);
  for(const value of prepared?.session?.conditions??[])add(value);
  return out;
}

function eventIndex(events){
  if(!Array.isArray(events))throw new TypeError("Canonical event array required");
  const index=new Map();
  for(const event of events){
    if(!event?.id)throw new Error("Canonical event missing id");
    if(index.has(event.id))throw new Error("Duplicate canonical event "+event.id);
    index.set(event.id,event);
  }
  return index;
}

function altarBellEvents(event){
  return (event?.soundEvents??[]).filter(sound=>
    String(sound?.type??"").toUpperCase()==="ALTAR_BELL" && sound?.audible===true
  );
}

function eventConditionsPass(event,active){
  return (event?.conditions??[]).every(condition=>active.has(String(condition)));
}

export function validateReaderTransientBindings(events){
  const index=eventIndex(events);
  const canonicalEventIds=new Set();
  for(const binding of BELL_CUE_BINDINGS){
    if(!/^AO\.SM\.C\d{4}$/.test(binding.cueId))throw new Error("Invalid recovered bell cue "+binding.cueId);
    for(const eventId of binding.canonicalEventIds){
      const event=index.get(eventId);
      if(!event)throw new Error(binding.cueId+": missing canonical bell event "+eventId);
      if(!altarBellEvents(event).length)throw new Error(eventId+": recovered bell binding lacks canonical ALTAR_BELL sound event");
      canonicalEventIds.add(eventId);
    }
  }
  return Object.freeze({
    schema:"ao-r17-reader-transient-bindings-v1",
    donor:"v1.34 BELL_RUNTIME + event-cinema donor",
    bellCueCount:BELL_CUE_BINDINGS.length,
    canonicalBellEventCount:canonicalEventIds.size,
    cueIds:Object.freeze(BELL_CUE_BINDINGS.map(x=>x.cueId)),
  });
}

export function partTransitionCinematic(previousCard,nextCard,{initial=false}={}){
  if(!nextCard?.part)return null;
  const changed=initial || !previousCard || previousCard.part!==nextCard.part;
  if(!changed)return null;
  return Object.freeze({
    id:"PART:"+String(nextCard.part),
    kind:"PART_TRANSITION",
    title:String(nextCard.part).toUpperCase(),
    subtitle:String(nextCard.title??nextCard.part),
    durationMs:920,
    transient:true,
    owner:"R17_SECTION_MAP_DISPLAY_GROUPING",
    canonicalAuthority:false,
    part:String(nextCard.part),
  });
}

export function createReaderTransientController({events,prepared}={}){
  const audit=validateReaderTransientBindings(events);
  const index=eventIndex(events);
  const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  const supported=SUPPORTED_FORMS.has(form);
  const activeConditions=conditionSet(prepared);
  const byCue=new Map(BELL_CUE_BINDINGS.map(binding=>[binding.cueId,binding]));

  function project(cueId){
    const id=String(cueId??"");
    if(!supported)return Object.freeze({
      supported:false,reason:"TRANSIENT_PROJECTION_NOT_CERTIFIED_FOR_"+(form||"UNKNOWN_FORM"),cueId:id||null,
      bell:null,cinematic:null,
      ownership:Object.freeze({bell:"LEGACY_FALLBACK",cinematic:"LEGACY_FALLBACK"}),
    });
    const binding=byCue.get(id)??null;
    if(!binding)return Object.freeze({
      supported:true,reason:null,cueId:id||null,bell:null,cinematic:null,
      ownership:Object.freeze({bell:"R17_EXACT_CUE_NONE",cinematic:"R17_EXACT_CUE_NONE"}),
    });
    const canonicalEvents=binding.canonicalEventIds.map(eventId=>index.get(eventId));
    const active=canonicalEvents.every(event=>eventConditionsPass(event,activeConditions));
    if(!active)return Object.freeze({
      supported:true,reason:"CANONICAL_EVENT_CONDITION_INACTIVE",cueId:id,bell:null,cinematic:null,
      ownership:Object.freeze({bell:"R17_CONDITION_FAIL_CLOSED",cinematic:"R17_CONDITION_FAIL_CLOSED"}),
    });
    const soundEvents=canonicalEvents.flatMap(event=>altarBellEvents(event).map(sound=>Object.freeze({
      canonicalEventId:event.id,
      legalStatus:sound.legal_status??null,
      authority:sound.authority??null,
      timing:sound.timing??null,
      patternRole:sound.pattern_role??null,
      permittedPatterns:Object.freeze([...(sound.permitted_patterns??[])]),
    })));
    const bell=Object.freeze({
      label:binding.label,detail:binding.detail,cueId:id,
      canonicalEventIds:binding.canonicalEventIds,
      soundEvents:Object.freeze(soundEvents),
      transient:true,owner:"R17_RECOVERED_CUE_CANONICAL_SOUND_EVENT",
    });
    const spec=CINEMATIC_BY_CUE[id];
    const cinematic=spec ? Object.freeze({
      id:"CUE:"+id,...spec,cueId:id,canonicalEventIds:binding.canonicalEventIds,
      transient:true,
      owner:spec.kind==="ELEVATION" ? "R17_EXACT_ELEVATION_CINEMATIC" : "R17_EXACT_BELL_CINEMATIC",
      canonicalAuthority:false,
    }) : null;
    return Object.freeze({
      supported:true,reason:null,cueId:id,bell,cinematic,
      ownership:Object.freeze({bell:"R17_RECOVERED_CUE_CANONICAL_SOUND_EVENT",cinematic:cinematic?.owner??"R17_EXACT_CUE_NONE"}),
    });
  }

  return Object.freeze({
    schema:"ao-r17-reader-transient-controller-v1",supported,form,audit,project,
    activeConditions:Object.freeze([...activeConditions]),
  });
}
