// Canon minister ceremonial phase review. Data join only: not an event clock,
// an observer, a priest action, or a LIVE reader component.
import {validateCanonMinisterFormBranches} from "./reader-canon-minister-branches.js";
import {validateCanonVIII8Attendants} from "./reader-canon-viii8-elevation-attendants.js";
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const OWNER_COUNTS=Object.freeze({EXISTING_MINISTER_11:11,VIII8_ATTENDANTS_6:6,CANONICAL_R62_SERVER_3:3});
const SERVER_IDS=new Set(["AO.CANON.R62.027","AO.CANON.R62.035","AO.CANON.R62.062"]);
const OFF=Object.freeze({status:"MINISTER_EDITORIAL_PREVIEW_DISABLED",canPublish:false,observedNow:false,candidates:Object.freeze([])});
const freeze=Object.freeze;

export function validateCanon20MinisterSourceMatrix({matrix,legacy,attendants,french,sourceAnchors}={}){
 validateCanonMinisterFormBranches(legacy);
 validateCanonVIII8Attendants({source:attendants,legacyMinisters:legacy});
 if(matrix?.schema!=="ao-canon-20-minister-stage-acceptance-v1"||
    matrix.status!=="TWENTY_SOURCE_EVENT_CANDIDATES_INDEPENDENT_TIMING_NOT_VERIFIED"||
    matrix.rows?.length!==20||matrix.counts?.canonicalSourceEntries!==20||
    matrix.counts?.deacon!==9||matrix.counts?.thurifer!==2||
    matrix.counts?.acolyte!==5||matrix.counts?.subdeacon!==1||
    matrix.counts?.server!==3||matrix.counts?.candidateRowsWithUnknownActor!==0||
    matrix.counts?.independentlyTimed!==0||matrix.counts?.editoriallyApproved!==0||
    matrix.counts?.published!==0||french?.rows?.length!==62||
    sourceAnchors?.rows?.length!==62)
   throw Error("Canon 20-source-event acceptance requires complete unpublished owners");
 const byLegacy=new Map(legacy.branches.map(x=>[x.id,x]));
 const byAttendant=new Map(attendants.rows.map(x=>[x.id,x]));
 const byFrench=new Map(french.rows.map(x=>[x.id,x]));
 const byAnchor=new Map(sourceAnchors.rows.map(x=>[x.id,x]));
 const ids=new Set(),owners={EXISTING_MINISTER_11:0,VIII8_ATTENDANTS_6:0,CANONICAL_R62_SERVER_3:0};
 const accepted=[];
 for(const [i,row] of matrix.rows.entries()){
  const canonical=i<11?legacy.branches[i]:i<17?attendants.rows[i-11]:
    french.rows.find(x=>x.id===row?.id);
  if(!canonical||row?.id!==canonical.id||ids.has(row.id)||!(row.owner in owners)||
     (i<11&&row.owner!=="EXISTING_MINISTER_11")||
     (i>=11&&i<17&&row.owner!=="VIII8_ATTENDANTS_6")||
     (i>=17&&row.owner!=="CANONICAL_R62_SERVER_3")||
     row.actor!==canonical.actor||!FORMS.has(row.forms?.[0])||
     !Array.isArray(row.forms)||!row.forms.length||
     row.forms.some(f=>!FORMS.has(f))||row.clockDomain!==row.actor+"_INDEPENDENT_OBSERVATION"||
     row.cueId!==canonical.cueId||
     row.sourceClock!=="INDEPENDENT_REAL_WORLD_MINISTER_EVENT_NOT_READER_OR_TEXT"||
     row.sourceIdentityReviewed!==false||row.exactStageVerified!==false||
     row.actualObserved!==false||row.displayApproved!==false||row.canPublish!==false||
     row.faithfulPosture!==null||!row.stage||
     JSON.stringify(row.sourceUrls)!==JSON.stringify(i<17?canonical.sourceUrls:canonical.sourceURLs)||
     row.sourceSection!==(canonical.sourceSection??canonical.ritusLocator))
    throw Error("Minister source identity or observation lock drift: "+row?.id);
  if(i<11 && (byLegacy.get(row.id)!==canonical||
     JSON.stringify(row.forms)!==JSON.stringify(canonical.forms)||
     row.conditional!==canonical.condition))
    throw Error("Existing 11 minister branches must remain single-owned: "+row.id);
  if(i>=11&&i<17&&(byAttendant.get(row.id)!==canonical||
     row.forms.join(",")!=="SOLEMN"||row.conditional!==canonical.condition||
     row.stage!==canonical.anchor))
    throw Error("Torch/subdeacon source form/anchor mismatch: "+row.id);
  if(i>=17&&(!SERVER_IDS.has(row.id)||
     byFrench.get(row.id)!==canonical||byAnchor.get(row.id)?.cueId!==row.cueId||
     byAnchor.get(row.id)?.actor!=="SERVER"||
     row.conditional!=="FORM_PRACTICE_REQUIRES_SEPARATE_VERIFICATION"||
     row.actor!=="SERVER"||
     row.forms.length!==4||
     !row.forms.every(f=>FORMS.has(f))))
    throw Error("Bell source clock or form conditional drift: "+row.id);
  if(row.id==="AO.CANON.R62.062"&&
    (row.stage!=="ANTICIPATORY_CONSECRATION_SERVER_BELL"||
     byAnchor.get(row.id)?.sourceAnchorType!=="OBSERVED_ANTICIPATORY_EVENT"))
    throw Error("Anticipatory bell cannot be triggered by Hanc igitur");
  if(row.actor==="SUBDEACON"&&(row.cueId!==null||
     row.stage!=="CONSECRATION_ELEVATIONS"))
    throw Error("Subdeacon exact word/cue must remain unresolved");
  owners[row.owner]++;ids.add(row.id);
  accepted.push(freeze({...row,forms:freeze([...row.forms]),sourceUrls:freeze([...row.sourceUrls])}));
 }
 if(ids.size!==20||Object.keys(owners).some(k=>owners[k]!==OWNER_COUNTS[k]))
  throw Error("20 Canon source minister identities must be complete");
 return freeze({status:"TWENTY_MINISTER_SOURCE_IDS_RECONCILED_NOT_OBSERVED",
  coverage:20,distinctMinisterRoles:5,byOwner:freeze(owners),
  separatelyTimed:0,publishable:0,entries:freeze(accepted)});
}

export function createCanon20MinisterSourceAcceptance(inputs){
 const audit=validateCanon20MinisterSourceMatrix(inputs);
 function preview({editorialPreview=false,form="LOW",
   communicantsPresent=null,fastDay1962=null,massForDead=null,
   confirmedConditions=[]}={}){
  const selected=String(form).toUpperCase();
  if(editorialPreview!==true||!FORMS.has(selected))return OFF;
  if(!Array.isArray(confirmedConditions)||
     confirmedConditions.some(x=>typeof x!=="string"))
   throw Error("Externally verified condition list must be identifiers");
  const matches=new Set(confirmedConditions);
  const solemn=selected==="SOLEMN";
  const torchConditions=[communicantsPresent,fastDay1962,massForDead];
  const torchContextVerified=torchConditions.every(x=>typeof x==="boolean");
  const keepToCommunion=torchContextVerified&&torchConditions.some(Boolean);
  const extinguishId=solemn&&torchContextVerified?
    "AO.CANON.VIII8."+(
      keepToCommunion?communicantsPresent?"004":fastDay1962?"005":"006":"003"):null;
  const selectedRows=audit.entries.filter(r=>{
    if(!r.forms.includes(selected))return false;
    if(r.owner==="VIII8_ATTENDANTS_6"&&new Set(["AO.CANON.VIII8.003","AO.CANON.VIII8.004","AO.CANON.VIII8.005","AO.CANON.VIII8.006"]).has(r.id))
      return r.id===extinguishId;
    // Actor-specific source: one acolyte light and one subdeacon genuflection
    // may be described without pretending their occurrence has been observed.
    return true;
  });
  const candidates=selectedRows.map(r=>freeze({
    id:r.id,actor:r.actor,clockDomain:r.clockDomain,
    cueId:r.cueId,stage:r.stage,conditional:r.conditional,
    sourceSection:r.sourceSection,sourceUrls:r.sourceUrls,
    sourceEligibleByForm:true,
    conditionSourceContextVerified:r.conditional==="WHEN_REQUIRED"?
      matches.has(r.id):r.owner==="VIII8_ATTENDANTS_6"&&
      new Set(["AO.CANON.VIII8.003","AO.CANON.VIII8.004","AO.CANON.VIII8.005","AO.CANON.VIII8.006"]).has(r.id)?torchContextVerified:
      r.actor==="SERVER"?false:null,
    exactStageVerified:false,observedNow:false,canPublish:false
  }));
  const groups={DEACON:0,THURIFER:0,ACOLYTES:0,SUBDEACON:0,SERVER:0};
  for(const row of candidates)groups[row.actor]++;
  return freeze({status:"MINISTER_SOURCE_MATRIX_EDITORIAL_NOT_LIVE",
   form:selected,candidateCount:candidates.length,
   torchContextVerified:solemn?torchContextVerified:null,
   torchExtinguishCandidateId:extinguishId,
   unresolvedRequiredConditionCount:candidates.filter(x=>x.conditionSourceContextVerified===false).length,
   actorCounts:freeze(groups),candidates:freeze(candidates),
   canPublish:false,observedNow:false,stageClock:"INDEPENDENT_OBSERVATION_NOT_SUPPLIED"});
 }
 return freeze({audit,preview});
}
