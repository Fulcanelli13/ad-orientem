/**
 * Explicit development-only Office research gate.
 * No public GitHub Pages host can satisfy the loopback and opt-in conditions.
 * This governs unapproved source-text PREVIEW only, not a release decision.
 */
const HOSTS=new Set(["127.0.0.1","localhost","[::1]"]);
export function officePrivateSourceReviewAllowed(location){
 if(!location||typeof location!=="object"||!HOSTS.has(location.hostname))
  return false;
 if(!["http:","https:"].includes(location.protocol))return false;
 if(typeof location.search!=="string")return false;
 try{return new URLSearchParams(location.search).get("aoOfficeReview")==="1"}
 catch{return false}
}
