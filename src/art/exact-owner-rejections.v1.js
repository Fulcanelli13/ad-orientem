/**
 * Fail-closed public display gate for explicitly rejected physical originals.
 * Historical rejection: 15 Oct 2026 W68/W49 owner score 2, CMA 1942.635
 * (canonical original research ID cma-122338). See issue #2761.
 *
 * IMPORTANT: apply to the exact physical object and its known published file,
 * not to every Annunciation or every painting attributed to Albert Bouts.
 * Historical approval/rejection records remain in research and Git history.
 */
export const OWNER_REJECTED_RELEASED_ORIGINALS_V1 = Object.freeze([
  Object.freeze({
    artworkId: "cma-122338",
    legacyModuleId: "bouts",
    institutionalObject: "Cleveland Museum of Art 1942.635",
    originalSource: "https://clevelandart.org/art/1942.635",
    publishedLegacyFile: "assets/prayer/released/bouts-annunciation-original.jpg",
    ownerScore: 2,
    rejectionDate: "2026-10-15",
    authority: "W68/W49 explicit global exact-original rejection"
  })
]);

function normalizedInstitutionalObject(url) {
  if(typeof url!=="string"||!url.trim())return null;
  try {
    const parsed=new URL(url);
    if(!["https:","http:"].includes(parsed.protocol))return null;
    return parsed.hostname.replace(/^www\./i,"").toLowerCase()+parsed.pathname.replace(/\/+$/,"");
  }catch { return null; }
}
const blockedSource=normalizedInstitutionalObject("https://clevelandart.org/art/1942.635");
const blockedFile="assets/prayer/released/bouts-annunciation-original.jpg";
export function isOwnerRejectedReleasedOriginal(record) {
  if(!record||typeof record!=="object")return false;
  if(record.artworkId==="cma-122338"||record.originalArtworkId==="cma-122338")return true;
  // The 'bouts' legacy module ID denotes precisely this Cleveland object.
  if(record.id==="bouts"||record.moduleId==="bouts")return true;
  if(normalizedInstitutionalObject(record.source)===blockedSource)return true;
  return record.image===blockedFile||record.original===blockedFile;
}
