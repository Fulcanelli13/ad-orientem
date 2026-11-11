// Publication-time and runtime integrity guard for an editorially approved
// Gregorian Schola score. A declarative SHA-256 is not proof unless it hashes
// the actual GABC rendered by Exsurge. Source/musical approval remains a
// separate requirement in reader-schola-dock-approved.js.
const SHA256=/^[a-f0-9]{64}$/;
const freeze=Object.freeze;
export const SCHOLA_SCORE_INTEGRITY_SCHEMA="ao-schola-score-integrity-v1";

export async function verifyApprovedScholaGabc(score,{
 cryptoImpl=globalThis.crypto,encoder=globalThis.TextEncoder
}={}){
 const gabc=score?.gabc,expected=score?.gabcSha256;
 if(score?.score_status!=="approved"||
    typeof gabc!=="string"||gabc.length<12||gabc.length>200000||
    !gabc.includes("%%")||!gabc.includes("(::)")||
    typeof expected!=="string"||!SHA256.test(expected)||
    typeof cryptoImpl?.subtle?.digest!=="function"||
    typeof encoder!=="function")return freeze({
      schema:SCHOLA_SCORE_INTEGRITY_SCHEMA,valid:false,
      reason:"UNVERIFIED_CONTENT_OR_HASH"
    });
 try{
   const raw=new encoder().encode(gabc);
   const digest=await cryptoImpl.subtle.digest("SHA-256",raw);
   const actual=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
   return freeze({
     schema:SCHOLA_SCORE_INTEGRITY_SCHEMA,
     valid:actual===expected,
     reason:actual===expected?"EXACT_GABC_SHA256":"GABC_SHA256_MISMATCH"
   });
 }catch{
   return freeze({
     schema:SCHOLA_SCORE_INTEGRITY_SCHEMA,
     valid:false,reason:"HASH_RUNTIME_UNAVAILABLE"
   });
 }
}
