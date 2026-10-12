// Consumer-only gate for a future selection owned by canonical Sacred Art.
// Not a second art catalogue and never a source of publication approval.
const ref=s=>String(s??"").replace(/[–—]/g,"-").replace(/\s+/g," ").trim().toLowerCase();
const safeObjectUrl=s=>typeof s==="string"&&/^https:\/\/[a-z0-9.-]+\/[a-z0-9/%?=._&#-]+$/i.test(s);
const safeOriginalPath=s=>typeof s==="string"&&/^assets\/sacred-art\/[a-z0-9/_-]+\.(?:webp|jpe?g|png)$/i.test(s);
export function approvedBibleSceneArtwork(scene,selection){
 if(!scene||!selection||selection.owner!=="SACRED_ART_CANONICAL"||
    selection.status!=="PUBLICATION_APPROVED")return null;
 const a=selection.association,w=selection.artwork;
 if(!a||!w||a.status!=="APPROVED"||a.relationship!=="EXACT_EPISODE"||
    a.sceneKey!==scene.sceneKey||ref(a.reference)!==ref(scene.reference))return null;
 const exact=scene.status==="EXACT_REFERENCE"&&scene.candidates?.length===1
   ?scene.candidates[0]?.atlasEventKey:null;
 // A Scene→event artwork bridge is permitted only when both stable identities match.
 if(exact?a.eventKey!==exact:a.eventKey!==null)return null;
 if(!/^[a-z0-9-]{4,96}$/.test(w.id||"")||w.medium!=="painting"||
    !w.title||!w.artist||/\bel greco\b/i.test(w.artist)||!safeObjectUrl(w.source?.objectUrl)||
    w.source?.rights!=="CC0")return null;
 if(w.review?.status!=="APPROVED"||w.review?.artistic!=="APPROVED"||
    w.review?.image!=="PASS"||w.review?.crop!=="PASS")return null;
 const im=w.image;
 if(!safeOriginalPath(im?.path)||!Number.isInteger(im?.width)||!Number.isInteger(im?.height)||
    Math.max(im.width,im.height)<2500||!/^[a-f0-9]{64}$/.test(im.sha256||"")||
    im.colour!==true||im.museumOriginal!==true||im.frameFree!==true||im.glareFree!==true)return null;
 return Object.freeze({id:w.id,title:w.title,artist:w.artist,src:im.path,
  sourceUrl:w.source.objectUrl,rights:w.source.rights,
  width:im.width,height:im.height,hash:im.sha256,sceneKey:a.sceneKey});
}
