// R19 special-structure projection.
// Consumes the already-compiled Mass plan and recovered rite registry.
// This module does not invent rite text or mutate canonical Mass identity.

const GRAPH_ALIASES=Object.freeze({
  ASPERGES:"ASP",
  PALM:"PALM",
  ASH:"ASH",
  CANDLEMAS:"CND",
  ROGATIONS:"ROG",
  REQUIEM:"REQ",
  REQUIEM_ABSOLUTION:"ABS",
  HOLY_THURSDAY_POST:"HT_POST",
  GENERIC_PROCESSION:"PROC",
  CORPUS_CHRISTI_PROCESSION:"CORPUS",
  EMBER_LESSONS:"LECT",
  GOOD_FRIDAY:"GF",
  EASTER_VIGIL:"EV",
});

function freeze(value){return Object.freeze(value)}
function arr(value){return Array.isArray(value)?value:[]}

export function validateSpecialStructureSources({registry,extension,core}={}){
  const overlays=registry?.overlays;
  if(!overlays || typeof overlays!=="object")throw new Error("Recovered rite overlay registry required");
  const ext=extension?.graphs??{};
  const coreGraphs=core?.graphs??{};
  const required=[
    "ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS","REQUIEM","REQUIEM_ABSOLUTION",
    "HOLY_THURSDAY_POST","GENERIC_PROCESSION","CORPUS_CHRISTI_PROCESSION","EMBER_LESSONS",
    "GOOD_FRIDAY","EASTER_VIGIL"
  ];
  for(const id of required){
    if(!overlays[id])throw new Error("Rite overlay registry missing "+id);
    const key=GRAPH_ALIASES[id];
    if(!(ext[key]||coreGraphs[key]))throw new Error("Recovered special-day graph missing "+id+" ("+key+")");
  }
  return freeze({
    schema:"ao-r19-special-structure-source-audit-v1",
    recoveredRegistryEntries:required.length,
    extensionGraphs:Object.keys(ext).length,
    coreGraphs:Object.keys(coreGraphs).length,
  });
}

function graphRecords(id,sources){
  const key=GRAPH_ALIASES[id];
  const rows=sources.extension?.graphs?.[key]??sources.core?.graphs?.[key]??[];
  return freeze([...rows]);
}

function segment(id,lane,sources,extra={}){
  const meta=sources.registry?.overlays?.[id]??null;
  const records=graphRecords(id,sources);
  return freeze({
    id,
    lane,
    graphKey:GRAPH_ALIASES[id]??id,
    kind:meta?.kind??null,
    registryStatus:meta?.status??null,
    recordCount:records.length,
    sourceIds:freeze(records.map(x=>x.id)),
    readerPayload:"STRUCTURE_ONLY_NO_TEXT_PAYLOAD",
    renderable:false,
    ...extra,
  });
}

export function projectSpecialStructure(prepared,{registry,extension,core}={}){
  const plan=prepared?.session?.plan;
  if(!plan)throw new TypeError("Compiled Mass plan required");
  const sources={registry,extension,core};
  const audit=validateSpecialStructureSources(sources);

  if(plan.kind==="DISTINCT_RITE"){
    const rite=String(plan.rite??"");
    return freeze({
      schema:"ao-r19-special-structure-projection-v1",
      audit,
      kind:plan.kind,
      ordinaryMassGraphActive:false,
      segments:freeze([segment(rite,"DISTINCT_RITE",sources,{handoff:"NO_ORDINARY_MASS_ASSUMPTIONS"})]),
      readerPayloadComplete:false,
      releaseSupport:false,
      reason:"DISTINCT_RITE_READER_PAYLOAD_REQUIRED",
    });
  }

  if(plan.kind==="COMPOSITE_DISTINCT_RITE"){
    const rite=String(plan.rite??"");
    return freeze({
      schema:"ao-r19-special-structure-projection-v1",
      audit,
      kind:plan.kind,
      ordinaryMassGraphActive:Boolean(plan.canonicalMassGraphActive),
      segments:freeze([
        segment(rite,"PRECEDING_COMPOSITE_RITE",sources,{handoff:plan.massEntry??null}),
        freeze({
          id:"ORDINARY_MASS",
          lane:"MASS",
          massEntry:plan.massEntry??"VIGIL_DEFINED_MASS_ENTRY",
          renderable:true,
          ordinaryOpeningSuppressed:Boolean(plan.ordinaryOpeningSuppressed),
        }),
        freeze({
          id:String(plan.afterMass??"AFTER_MASS"),
          lane:"FOLLOWING_ACTION",
          renderable:false,
          readerPayload:"STRUCTURE_ONLY_NO_TEXT_PAYLOAD",
        }),
      ]),
      readerPayloadComplete:false,
      releaseSupport:false,
      reason:"COMPOSITE_DISTINCT_RITE_READER_PAYLOAD_REQUIRED",
    });
  }

  if(plan.kind!=="MASS")throw new Error("Unsupported compiled plan kind: "+plan.kind);

  const preceding=arr(plan.precedingGraphs).map(id=>segment(id,"PRECEDING_RITE",sources,{
    handoff:id==="ASPERGES"?"FOOT_CLUSTER":plan.massEntry,
  }));
  const overlays=arr(plan.overlayGraphs).filter(id=>id!=="VOTIVE_PROPER").map(id=>segment(id,"MASS_OVERLAY",sources,{
    massEntry:plan.massEntry,
  }));
  const insertions=arr(plan.insertions).map(id=>freeze({
    id,
    lane:"MASS_INSERTION",
    renderable:false,
    readerPayload:"STRUCTURE_ONLY_NO_TEXT_PAYLOAD",
  }));
  const following=arr(plan.followingGraphs).map(id=>segment(id,"FOLLOWING_ACTION",sources,{
    activation:"EXPLICIT_COMPILED_PLAN",
  }));

  const segments=[
    ...preceding,
    freeze({
      id:"ORDINARY_MASS",
      lane:"MASS",
      form:plan.form??prepared?.session?.resolvedMass?.form??null,
      massEntry:plan.massEntry??"FOOT_CLUSTER",
      dismissal:plan.dismissal??null,
      blessingAllowed:plan.blessingAllowed!==false,
      normalLastGospel:plan.normalLastGospel!==false,
      ordinaryPeacePrayerAllowed:plan.ordinaryPeacePrayerAllowed!==false,
      formalSolemnPaxAllowed:plan.formalSolemnPaxAllowed===true,
      renderable:true,
    }),
    ...overlays,
    ...insertions,
    ...following,
  ];

  const special=segments.filter(x=>x.id!=="ORDINARY_MASS");
  return freeze({
    schema:"ao-r19-special-structure-projection-v1",
    audit,
    kind:"MASS",
    ordinaryMassGraphActive:true,
    segments:freeze(segments),
    specialSegmentCount:special.length,
    readerPayloadComplete:special.length===0,
    releaseSupport:special.length===0,
    reason:special.length?"SPECIAL_RITE_READER_PAYLOAD_REQUIRED":null,
    massEntry:plan.massEntry??"FOOT_CLUSTER",
    ending:freeze({
      dismissal:plan.dismissal??null,
      blessingAllowed:plan.blessingAllowed!==false,
      normalLastGospel:plan.normalLastGospel!==false,
    }),
    objectStates:freeze([...arr(plan.objectStates)]),
  });
}
