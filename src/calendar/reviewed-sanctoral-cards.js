// Research-only supplementary saints projection. Not an Ordo or Mass selector.
export const REVIEWED_SANCTORAL_CARDS_VERSION="ao-secondary-sanctoral-cards-v1";
const validDate = x => typeof x==="string" && /^\d{4}-\d{2}-\d{2}$/.test(x) &&
  !Number.isNaN(Date.parse(x+"T12:00:00Z")) &&
  new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x;
const baseSourceId = x=>String(x||"").replace(/:[1-4]:[a-z]{1,3}$/,"");
const sameIdentity=(a,b)=>Boolean(a&&b&&baseSourceId(a)===baseSourceId(b));
const objectName=(name,language)=>typeof name==="string"?name:name?.[language==="fr"?"fr":"en"]||name?.en||"";
const read=(o,lang)=>typeof o==="string"?o:o?.[lang]||o?.en||"";
function chooseSite(links, id, approvedPaths) {
  const candidates=links.filter(x=>x.canonicalId===id);
  const ranked=[...candidates].sort((a,b)=>Number(Boolean(b.placePhotoAsset))-Number(Boolean(a.placePhotoAsset)));
  const found=ranked.find(x=>x.placePhotoAsset===null || approvedPaths.has(x.placePhotoAsset));
  if(!found)return null;
  const photo=found.placePhotoAsset && approvedPaths.has(found.placePhotoAsset)?found.placePhotoAsset:null;
  return Object.freeze({placeId:found.placeId,role:found.role,approvedSitePhotoPath:photo,
    mediaKind:photo?"PHYSICAL_SITE_PHOTO_NOT_SACRED_PAINTING":"NO_MEDIA",approvedSacredPaintingId:null});
}
// USCCB material is only displayed when jurisdiction=US is explicitly selected.
// Vatican General Roman Calendar decrees are usable globally after publication.
export function buildReviewedSanctoralCards({
  date,language="en",jurisdiction="UNSPECIFIED",observedPrincipalId=null,
  observanceRegistry,pilotPersons=[],censusPersons=[],doctorRoster=[],
  martyrGroups=[],visualCrosswalk,approvedSiteMedia=[]
}={}) {
  if(!validDate(date))throw new TypeError("Expected real ISO date");
  if(!Array.isArray(observanceRegistry?.observances)||!Array.isArray(visualCrosswalk?.links))
    throw new TypeError("Expected source-reviewed observance and place crosswalks");
  const lang=language==="fr"?"fr":"en";
  const members=new Map([...censusPersons,...pilotPersons].filter(x=>x?.id).map(x=>[x.id,x]));
  for(const x of pilotPersons)if(x?.id)members.set(x.id,x);
  const doctors=new Map(doctorRoster.map(x=>[x.canonicalPersonId,x]));
  const groups=new Map(martyrGroups.map(x=>["canon-group."+x.id,x]));
  const approvedPaths=new Set(approvedSiteMedia.filter(x=>x.status==="APPROVED" &&
    x.rights_verified===true && x.subject_verified===true && x.crop_reviewed===true).map(x=>x.asset_path));
  const results=[];
  const seen=new Set();
  for(const row of observanceRegistry.observances) {
    if(row.monthDay!==date.slice(5) || seen.has(row.subjectId))continue;
    const general=row.authorityScope==="GENERAL_ROMAN_VATICAN_DECREE" &&
      row.universalStatus==="CERTIFIED_BY_DECREE" &&
      /^https:\/\/(?:press|www)\.vatican\.va\//.test(row.sourceUrl) &&
      (!row.publishedOn || row.publishedOn<=date);
    const us=jurisdiction==="US" &&
      row.authorityScope.startsWith("USCCB_") &&
      row.universalStatus==="NOT_INDEPENDENTLY_CERTIFIED" &&
      date.slice(0,4)==="2026" && /^https:\/\/bible\.usccb\.org\//.test(row.sourceUrl);
    if(!general&&!us)continue;
    if(row.mass1962Effect!=="NONE" || row.approved1962FormularyId!==null)continue;
    const isGroup=row.subjectId.startsWith("canon-group.");
    const group=isGroup?groups.get(row.subjectId):null;
    const person=!isGroup?members.get(row.subjectId):null;
    const doc=doctors.get(row.subjectId);
    if(isGroup && (!group?.presentation || group.individualMemberExpansionRequirement!=="NONE_FOR_APP"))continue;
    if(!isGroup && !person && !doc)continue;
    if(!isGroup && person?.publicationHold)continue;
    const c1962=person?.calendar1962?.principalId || doc?.observanceSourceIdentity;
    if(sameIdentity(c1962,observedPrincipalId))continue;
    const title=isGroup?read(group.presentation.title,lang):
      objectName(person?.name,lang)||doc?.name||"";
    const rationale=isGroup?read(group.presentation.whyHonoured,lang):
      read(person?.presentation?.whyHonoured,lang)||null;
    const shortHistory=isGroup?read(group.presentation.context,lang):
      read(person?.presentation?.historicalContribution,lang)||null;
    const site=chooseSite(visualCrosswalk.links,row.subjectId,approvedPaths);
    const sources=[row.sourceUrl,...(person?.presentation?.verifiedFurtherReadingUrls||[])];
    results.push(Object.freeze({
      id:row.subjectId,kind:isGroup?"COLLECTIVE_MARTYR_PROFILE":"INDIVIDUAL_SAINT_PROFILE",
      title,whyHonoured:rationale,context:shortHistory,
      currentCalendarDate:row.monthDay,currentCalendarKind:row.kind,
      sourceScope:general?"GENERAL_ROMAN_VATICAN_DECREE":"USCCB_2026_WITNESS_ONLY",
      universalDateCertified:general,
      sourceUrls:Object.freeze([...new Set(sources)]),
      site,approvedSacredPaintingId:null,
      doctorOfChurch:Boolean(person?.recognition?.doctorDeclaredOn&&
        person.recognition.doctorDeclaredOn<=date)||Boolean(doc?.declarationDate&&doc.declarationDate<=date),
      featuredPersonIds:Object.freeze(isGroup?[...(group.presentation.featuredCanonicalPersonIds||[])]:[]),
      secondaryOnly:true,changes1962Principal:false,massSelectionAuthority:"NONE",
      selectedFormularyId:null,requiresMartyrMemberEnumeration:false
    }));
    seen.add(row.subjectId);
  }
  return Object.freeze(results);
}
