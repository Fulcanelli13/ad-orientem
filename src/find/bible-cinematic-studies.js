// Cinematic comparison studies; source-owned 151-event timeline is never overwritten.
// Curated from #1018 crosswalk of #1010's four cinematic journeys. No images or GPS.
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const arr=v=>Array.isArray(v)?v:[];
const ref=v=>String(v??"").replace(/[–—]/g,"-").replace(/\s+/g," ").trim().toLowerCase();
export const CINEMATIC_REVIEW_STATUS=Object.freeze({
 EXACT_REFERENCE:["Matching citation only","Même référence uniquement"],
 PASSAGE_OVERLAP_REVIEW_ONLY:["Overlapping passages — review required","Passages qui se recoupent — à vérifier"],
 NO_DIRECT_PASSAGE_MATCH:["Additional episode — no direct timeline match","Épisode supplémentaire — sans correspondance directe"],
});
export function validateCinematicStudies(data){
 if(data?.schema!=="AO_BIBLICAL_CINEMATIC_STUDIES_REVIEW_V1"||data?.status!=="REVIEW_NOT_PRODUCTION_CERTIFIED")return false;
 if(data?.policy?.canonical151Unchanged!==true||data?.policy?.noArtworkImported!==true||
    data?.policy?.noCoordinatesImported!==true||data?.policy?.noRoutesImported!==true||
    data?.policy?.noAutomaticMerges!==true)return false;
 if(arr(data.chapters).length!==14||arr(data.scenes).length!==181||
   data.counts?.canonicalTimeline!==151)return false;
 const counts={EXACT_REFERENCE:0,PASSAGE_OVERLAP_REVIEW_ONLY:0,NO_DIRECT_PASSAGE_MATCH:0};
 const seen=new Set();
 for(const [position,s] of data.scenes.entries()){
  // Indices address the array directly in the reader. A shuffled 181-scene
  // dataset must not silently display a different scene on a chapter jump.
  if(!Number.isInteger(s.index)||s.index!==position||seen.has(s.index)||!Object.hasOwn(counts,s.status)||
   !s.reference||!s.title_en||!s.title_fr||!s.synopsis_en||!s.synopsis_fr||
   !s.evidence_en||!s.evidence_fr||s.citationOnly!==true||!Array.isArray(s.candidates)||
   (Boolean(s.sourceNote_en)!==Boolean(s.sourceNote_fr)))return false;
  if(Object.hasOwn(s,"geo")||Object.hasOwn(s,"coordinates")||Object.hasOwn(s,"art")||
     Object.hasOwn(s,"imageUrl")||Object.hasOwn(s,"sourceHasCoordinate"))return false;
  const exact=s.candidates.filter(c=>c?.relation==="EXACT_REFERENCE");
  if((s.status==="EXACT_REFERENCE"&&exact.length!==1)||
     (s.status!=="EXACT_REFERENCE"&&exact.length!==0)||
     (s.status==="NO_DIRECT_PASSAGE_MATCH"&&s.candidates.length!==0)||
     (s.status==="PASSAGE_OVERLAP_REVIEW_ONLY"&&!s.candidates.length))return false;
  const keys=new Set();
  for(const candidate of s.candidates){
   if(!Number.isInteger(candidate?.atlasIndex)||candidate.atlasIndex<0||candidate.atlasIndex>=151||
      !["EXACT_REFERENCE","PASSAGE_OVERLAP_REVIEW_ONLY"].includes(candidate.relation)||
      !candidate.reference||keys.has(candidate.atlasIndex))return false;
   if(candidate.relation==="EXACT_REFERENCE"&&ref(candidate.reference)!==ref(s.reference))return false;
   keys.add(candidate.atlasIndex);
  }
  counts[s.status]++;seen.add(s.index);
 }
 if(counts.EXACT_REFERENCE!==65||counts.PASSAGE_OVERLAP_REVIEW_ONLY!==29||counts.NO_DIRECT_PASSAGE_MATCH!==87)return false;
 const sceneIds=new Set(data.scenes.map(s=>s.index));
 const allChapterIds=new Set(),referenced=[];
 for(const chapter of data.chapters){
  if(!chapter.id||allChapterIds.has(chapter.id)||!chapter.label_en||!chapter.label_fr||!arr(chapter.sceneIndices).length)return false;
  if(Object.hasOwn(chapter,"art")||Object.hasOwn(chapter,"imageUrl"))return false;
  allChapterIds.add(chapter.id);
  for(const index of chapter.sceneIndices){
   if(!sceneIds.has(index)||data.scenes[index]?.chapter!==chapter.id) return false;
   referenced.push(index);
  }
 }
 return referenced.length===181&&new Set(referenced).size===181;
}
// Cross-reference index integrity, NOT historical/event identity certification.
// This prevents an obsolete 151-event index or stale passage from appearing as a
// valid editorial candidate after the chronology evolves.
export function validateCinematicCrosswalk(data,atlasStops=[]){
 if(!validateCinematicStudies(data)||!Array.isArray(atlasStops)||atlasStops.length!==151)return false;
 for(const s of data.scenes){
  for(const candidate of s.candidates){
   const stop=atlasStops[candidate.atlasIndex];
   if(!stop||stop.index!==candidate.atlasIndex||ref(stop.reference)!==ref(candidate.reference))return false;
  }
 }
 return true;
}
export function studyChapter(data,key){
 if(!validateCinematicStudies(data))return null;
 return data.chapters.find(c=>c.id===key)||data.chapters[0];
}
export function studyScene(data,chapterId,index){
 const chapter=studyChapter(data,chapterId);if(!chapter)return null;
 return data.scenes[chapter.sceneIndices.includes(index)?index:chapter.sceneIndices[0]];
}
export function studyStep(data,chapterId,index,direction){
 const chapter=studyChapter(data,chapterId);if(!chapter)return null;
 const pos=chapter.sceneIndices.indexOf(index);
 const at=Math.max(0,Math.min(chapter.sceneIndices.length-1,(pos<0?0:pos)+(Number(direction)||0)));
 return chapter.sceneIndices[at];
}
// Permit a reversible jump only for a single exact-citation candidate that the
// *current* 151-stop corpus independently confirms. No scene, route or coordinate merge.
export function cinematicExactAtlasTarget(study,atlasStops=[]){
 if(study?.status!=="EXACT_REFERENCE"||arr(study?.candidates).length!==1)return null;
 const c=study.candidates[0];
 if(c?.relation!=="EXACT_REFERENCE"||ref(c.reference)!==ref(study.reference)||!Number.isInteger(c.atlasIndex))return null;
 const hits=arr(atlasStops).filter(s=>ref(s.reference)===ref(study.reference));
 return hits.length===1&&hits[0].index===c.atlasIndex?c.atlasIndex:null;
}
const button=(attr,value,label,active=false)=>'<button type="button" '+attr+'="'+esc(value)+'"'+(active?' aria-pressed="true"':"")+'>'+esc(label)+'</button>';
export function renderCinematicStudies(data,{language="en",chapter="PATRIARCHS",scene=0,atlasStops=[]}={}){
 const lang=language==="fr"?"fr":"en",valid=validateCinematicStudies(data);
 const head='<div class="aoBibleStudyTop"><button type="button" data-bible-atlas-close aria-label="'+esc(L(lang,"Back to Explore","Retour à Explorer"))+'">←</button>'+
 '<div><small>'+esc(L(lang,"EXPLORE · SCRIPTURE","EXPLORER · ÉCRITURE"))+'</small><h1>'+esc(L(lang,"Biblical Atlas","Atlas biblique"))+'</h1></div></div>'+
 '<nav class="aoBibleStudyTabs" aria-label="'+esc(L(lang,"Biblical Atlas views","Vues de l’Atlas biblique"))+'">'+
 [["timeline","Chronology","Chronologie"],["genealogies","Genealogies","Généalogies"],["apostles","Apostolic lives","Vies apostoliques"],["cinematic","Scene studies","Études des scènes"]]
 .map(([k,en,fr])=>button("data-bible-review-surface",k,L(lang,en,fr),k==="cinematic")).join("")+'</nav>';
 const wrapper=body=>'<style>'+CSS+'</style><section class="aoFindSurface aoBibleStudy" data-ao-find-owner="AO_FIND_APP_V1" data-bible-cinematic-review>'+head+'<div class="aoBibleStudyScroll">'+body+'</div></section>';
 if(!valid)return wrapper('<p class="aoBibleStudyNotice">'+esc(L(lang,"Cinematic comparison evidence unavailable. The canonical 151-event timeline remains accessible.","Les scènes comparatives ne sont pas disponibles. La chronologie canonique de 151 étapes reste accessible."))+'</p>');
 const c=studyChapter(data,chapter),s=studyScene(data,c.id,scene);
 const n=c.sceneIndices.indexOf(s.index),len=c.sceneIndices.length,link=cinematicExactAtlasTarget(s,atlasStops);
 const status=L(lang,...CINEMATIC_REVIEW_STATUS[s.status]);
 const nav='<label class="aoBibleStudyChapterPicker"><span>'+esc(L(lang,"Chapter","Chapitre"))+'</span><select data-bible-study-chapter-select aria-label="'+esc(L(lang,"Choose story chapter","Choisir un chapitre"))+'">'+
 data.chapters.map(ch=>'<option value="'+esc(ch.id)+'"'+(ch.id===c.id?' selected':'')+'>'+esc(L(lang,ch.label_en,ch.label_fr))+'</option>').join("")+'</select></label>'+
 '<div class="aoBibleStudyChapters" role="group" aria-label="'+esc(L(lang,"Story chapters","Chapitres du récit"))+'">'+
 data.chapters.map(ch=>'<button type="button" data-bible-study-chapter="'+esc(ch.id)+'" aria-pressed="'+String(ch.id===c.id)+'">'+esc(L(lang,ch.label_en,ch.label_fr))+'</button>').join("")+'</div>';
 const sc='<article class="aoBibleStudyScene" data-bible-study-scene="'+s.index+'"><div class="aoBibleStudyCount">'+
 esc(L(lang,"Study scene","Scène étudiée"))+' '+(s.index+1)+' / 181 · '+(n+1)+' / '+len+'</div>'+
 '<h2>'+esc(L(lang,s.title_en,s.title_fr))+'</h2><p class="aoBibleStudySynopsis">'+esc(L(lang,s.synopsis_en,s.synopsis_fr))+'</p>'+
 '<div class="aoBibleStudyReference">'+esc(s.reference)+'</div>'+
 '<p class="aoBibleStudyEvidence">'+esc(status)+'</p>'+
 (s.sourceNote_en?'<p class="aoBibleStudyQualification">'+esc(L(lang,s.sourceNote_en,s.sourceNote_fr))+'</p>':"")+
 (s.location_en||s.location_fr?'<details class="aoBibleStudyNotes"><summary>'+esc(L(lang,"Location qualification","Précision sur le lieu"))+'</summary><p>'+esc(L(lang,"Uncertified location context; no itinerary is inferred.","Lieu non certifié ; aucun itinéraire n’est inféré."))+' '+esc(L(lang,s.location_en,s.location_fr))+'</p></details>':"")+
 '<div class="aoBibleStudyActions"><button type="button" data-ao-scripture-context="'+esc(s.reference)+'">'+esc(L(lang,"Read passage","Lire le passage"))+'</button>'+
 (link!==null?'<button type="button" data-bible-review-jump="'+link+'">'+esc(L(lang,"Related 151-event chronology reference","Référence dans la chronologie à 151 étapes"))+'</button>':"")+'</div></article>';
 const control='<div class="aoBibleStudyTransport">'+
 '<button type="button" data-bible-study-direction="-1" '+(n===0?'disabled':'')+'>'+esc(L(lang,"Previous scene","Scène précédente"))+'</button>'+
 '<span>'+esc(L(lang,c.label_en,c.label_fr))+' · '+(n+1)+' / '+len+'</span>'+
 '<button type="button" data-bible-study-direction="1" '+(n===len-1?'disabled':'')+'>'+esc(L(lang,"Next scene","Scène suivante"))+'</button></div>';
 const header='<details class="aoBibleStudyNotice"><summary>'+esc(L(lang,"Research comparison — not approved for publication.","Comparaison de recherche — publication non autorisée."))+'</summary>'+ 
 '<p>'+esc(L(lang,"181 scenes retained separately from the 151 canonical milestones: 65 matching citations, 29 passage overlaps, 87 unmatched scenes. Artwork and speculative routes are excluded.","181 scènes conservées à part des 151 étapes canoniques : 65 références identiques, 29 passages recoupés et 87 scènes sans correspondance directe. Les images et parcours conjecturaux sont exclus."))+'</p></details>'+ 
 '<div class="aoBibleStudyChapterTitle"><small>'+esc(L(lang,c.label_en,c.label_fr))+'</small><h2>'+esc(L(lang,c.headline_en,c.headline_fr))+'</h2><p>'+esc(L(lang,c.sub_en,c.sub_fr))+'</p></div>';
 return wrapper(header+nav+headerlessSpace()+sc+control);
}
function headerlessSpace(){return "";}
const CSS=[
".aoBibleStudy{height:100%;min-height:0;display:flex;flex-direction:column;background:#080c12;color:#ede4d2;font-family:Georgia,serif;overflow:hidden}",
".aoBibleStudyTop{flex:none;display:flex;gap:12px;align-items:center;padding:10px 14px;border-bottom:1px solid #c9ae7540}.aoBibleStudyTop>div{flex:1}.aoBibleStudyTop small{font:600 10px system-ui;color:#b6a27d;letter-spacing:.1em}.aoBibleStudyTop h1{font:500 23px Georgia,serif;margin:2px 0}",
".aoBibleStudyTop button{min-width:44px;min-height:44px;border-radius:50%;background:#17202b;color:#e8d2a0;border:1px solid #c9ae7577;font-size:22px}",
".aoBibleStudyTabs{display:flex;flex:none;gap:6px;overflow-x:auto;padding:8px 10px;border-bottom:1px solid #c9ae7529}.aoBibleStudyTabs button,.aoBibleStudyChapters button,.aoBibleStudyTransport button,.aoBibleStudyActions button{min-height:44px;border:1px solid #c9ae7546;border-radius:8px;padding:8px 12px;background:#17202b;color:#cfc5b2;font:600 12px system-ui;cursor:pointer}",
".aoBibleStudyTabs button{flex:none}.aoBibleStudyTabs button[aria-pressed=true],.aoBibleStudyChapters button[aria-pressed=true]{background:#3d3326;border-color:#c9ae75;color:#f4e3b8}.aoBibleStudy button:focus-visible{outline:2px solid #e6c47b;outline-offset:2px}.aoBibleStudy button:disabled{opacity:.35;cursor:default}",
".aoBibleStudyScroll{min-height:0;flex:1;overflow-y:auto;overscroll-behavior:contain;padding:14px clamp(14px,3vw,30px) 34px}.aoBibleStudyNotice{max-width:850px;font:12px/1.5 system-ui;color:#c4b8a4;background:#14191e;border-left:2px solid #927a4d;padding:9px 11px;margin:0 0 18px}.aoBibleStudyNotice summary{color:#ead3a3;font:600 12px/1.4 system-ui;cursor:pointer}.aoBibleStudyNotice p{margin:8px 0 0;color:#c4b8a4;font:12px/1.5 system-ui}",
".aoBibleStudyChapterTitle{margin:6px 0 18px}.aoBibleStudyChapterTitle small{font:600 11px system-ui;letter-spacing:.13em;text-transform:uppercase;color:#b79a68}.aoBibleStudyChapterTitle h2{font:500 clamp(25px,4.8vw,36px)/1.2 Georgia,serif;color:#f1e4d0;margin:6px 0}.aoBibleStudyChapterTitle p{font:14px/1.55 Georgia,serif;color:#cfc1aa;max-width:660px;margin:8px 0}",
".aoBibleStudyChapterPicker{display:none;gap:7px;font:600 12px system-ui;color:#cbb794;margin:10px 0}.aoBibleStudyChapterPicker select{width:100%;min-height:44px;box-sizing:border-box;border:1px solid #c9ae7588;background:#17202b;color:#f4e3d1;border-radius:8px;padding:9px 10px;font:600 13px system-ui}.aoBibleStudyChapters{display:flex;overflow-x:auto;gap:7px;padding:2px 0 12px;scrollbar-width:thin}.aoBibleStudyChapters button{flex:none;max-width:180px;white-space:normal;text-align:left}",
".aoBibleStudyScene{max-width:770px;margin:10px auto 0;background:radial-gradient(ellipse at 25% 0%,#27303b,#121922 58%);border:1px solid #d9c59a40;border-radius:16px;padding:clamp(18px,5vw,35px);box-shadow:0 18px 48px #0007}",
".aoBibleStudyCount{font:600 10px system-ui;letter-spacing:.12em;text-transform:uppercase;color:#c4a773}.aoBibleStudyScene h2{font:500 clamp(24px,4.8vw,38px)/1.15 Georgia,serif;color:#f3e5cd;margin:14px 0}.aoBibleStudySynopsis{font:17px/1.55 Georgia,serif;color:#ddd0bc;max-width:620px}",
".aoBibleStudyNotes{margin:13px 0;color:#b6a98d;font:12px/1.5 system-ui}.aoBibleStudyNotes summary{cursor:pointer;color:#d1bd94}.aoBibleStudyNotes p{margin:8px 0}.aoBibleStudyReference{font:600 12px system-ui;color:#e7c58c;margin:20px 0 10px}.aoBibleStudyEvidence{font:600 11px/1.4 system-ui;color:#c4b395;text-transform:uppercase;letter-spacing:.03em}.aoBibleStudyQualification,.aoBibleStudyLocation{font:12px/1.5 system-ui;color:#aea390;margin:10px 0}",
".aoBibleStudyActions{display:flex;flex-wrap:wrap;gap:8px;margin-top:23px}.aoBibleStudyActions button{background:#2c291e;color:#ecd2a1;white-space:normal;text-align:left}.aoBibleStudyTransport{display:flex;gap:12px;justify-content:space-between;align-items:center;max-width:770px;margin:15px auto}.aoBibleStudyTransport span{font:11px/1.3 system-ui;color:#ae9e80;text-align:center}",
"@media(max-width:480px){.aoBibleStudyTop{padding:8px 12px}.aoBibleStudyTabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible;padding:6px 9px}.aoBibleStudyTabs button{min-width:0;white-space:normal;font-size:11px;padding:7px 5px}.aoBibleStudyChapterPicker{display:grid}.aoBibleStudyChapters{display:none}.aoBibleStudyScroll{padding:10px 12px 26px}.aoBibleStudyNotice{padding:8px 10px;margin:0 0 9px}.aoBibleStudyChapterTitle{margin:5px 0 10px}.aoBibleStudyChapterTitle h2{font-size:22px;line-height:1.12;margin:3px 0}.aoBibleStudyChapterTitle p{font-size:12px;line-height:1.4;margin:5px 0}.aoBibleStudyChapters{padding:0 0 8px}.aoBibleStudyChapters button{font-size:11px;max-width:150px}.aoBibleStudyScene{padding:16px 15px}.aoBibleStudyScene h2{font-size:27px;margin:10px 0}.aoBibleStudySynopsis{font-size:15px;line-height:1.45}.aoBibleStudyTransport button{padding:7px 9px;font-size:11px}}",
"@media(prefers-reduced-motion:reduce){.aoBibleStudy *{scroll-behavior:auto!important;animation:none!important}}"
].join("\n");
