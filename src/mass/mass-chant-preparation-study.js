// The only interactive score-study surface in Mass preparation.
// Its SVG is locally rendered from source-owned records; no network or audio
// from the Mass reader. Recordings require separate permission/quality review.
import {createOfflineChantEngraver} from "./reader-chant-engraver.js";
import {SCHOLA_SCORE_CATALOGUE} from "./reader-chant-score-pilot.js";
import {MASS_CHANT_ORDINARY_TRACKS} from "./mass-chant-programme.js";

export const MASS_CHANT_PREPARATION_AUDIO_SCHEMA="ao-mass-chant-preparation-audio-v1";
// Deliberately empty until actual files are checked for rights, edition,
// vocal content, audio quality and trustworthy score alignment.
export const VERIFIED_PREPARATION_RECORDINGS=Object.freeze([]);
export function licensedChantPreparationRecording(scoreId,{
  recordings=VERIFIED_PREPARATION_RECORDINGS,
}={}){
  const record=recordings.find(item=>item?.scoreId===scoreId && item?.status==="CLEARED" &&
    item?.licenseVerified===true && item?.sourceUrl && item?.mediaUrl &&
    item?.editionVerified===true && item?.humanReview==="PASS");
  return record?Object.freeze({...record}):null;
}
export function preparableChantScores(programme,properCrosswalk){
  const chosen=new Set(Object.values(programme?.selections??{}));
  const sourceIds=(properCrosswalk?.status==="PARTIALLY_MATCHED"
    ?properCrosswalk.candidates.map(c=>c.scoreId):[]);
  sourceIds.forEach(id=>chosen.add(id));
  return Object.freeze(SCHOLA_SCORE_CATALOGUE.filter(item=>chosen.has(item.id)));
}
export function mountMassChantPreparationStudy(host,{document=host?.ownerDocument,language=()=> "en"}={}){
  if(!host?.append||!document?.createElement)
    throw new TypeError("Study requires the existing Mass preflight mount point");
  let destroyed=false,options=Object.freeze([]),scoreId=null,renderer=null;
  const details=document.createElement("details");
  details.className="aoMassChantStudy";
  details.innerHTML='<summary data-study-heading></summary>'+
    '<p data-study-intro></p><label data-study-score-label for="ao-mass-chant-study-choice"></label>'+
    '<select id="ao-mass-chant-study-choice" data-study-score-choice></select>'+
    '<div data-study-score-window class="aoMassChantStudyWindow" aria-label="Gregorian notation, for preparation only"></div>'+
    '<p data-study-status role="status"></p><p data-study-audio></p>'+
    '<p><a data-study-source target="_blank" rel="noopener noreferrer"></a></p>';
  host.append(details);
  const $=query=>details.querySelector(query);
  const scoreViewport=$("[data-study-score-window]");
  renderer=createOfflineChantEngraver({viewport:scoreViewport,document});
  renderer.observe();
  const fr=()=>String(language()).startsWith("fr");
  const t=(en,french)=>fr()?french:en;
  const progress=$("[data-study-status]");
  const source=$("[data-study-source]");
  function setMessage(value){progress.textContent=value;}
  function applyWords(){
    $("[data-study-heading]").textContent=t("Study Gregorian notation","Étudier la notation grégorienne");
    $("[data-study-intro]").textContent=t(
      "Study the selected Ordinary and source-matched Proper here, before Mass. No chanting or audio is played in the live reader.",
      "Étudiez ici l’ordinaire choisi et le propre correspondant à la source, avant la messe. Aucun son n’est diffusé dans le lecteur de messe.");
    $("[data-study-score-label]").textContent=t("Choose a score to read","Choisir une partition");
    $("[data-study-audio]").textContent=t(
      "Listening: no recording has passed source, copyright and audio-quality review for this pilot.",
      "Écoute : aucun enregistrement n’a encore satisfait les vérifications de source, de droits et de qualité sonore.");
  }
  async function draw(){
    if(destroyed||!details.open)return;
    const record=options.find(item=>item.id===scoreId);
    source.hidden=!record;
    if(!record){scoreViewport.replaceChildren();setMessage(t(
      "Select a musical setting above to study a score.",
      "Choisissez une mélodie ci-dessus pour étudier sa partition."));return;}
    source.href=record.sourceUrl;
    source.textContent=t("Notation source · GregoBase","Source de la partition · GregoBase");
    setMessage(t("Engraving locally…","Gravure locale…"));
    try{
      const ok=await renderer.engrave(record.gabc);
      if(!destroyed&&record.id===scoreId)
        setMessage(ok?t("Offline engraving · scroll the score manually",
          "Notation hors ligne · faites défiler manuellement"):
          t("Score changed during layout","La partition a changé pendant la mise en page"));
    }catch(error){
      if(!destroyed&&record.id===scoreId)
        setMessage(t("Local notation is unavailable","Notation locale indisponible"));
    }
  }
  function update({programme=null,properCrosswalk=null}={}){
    if(destroyed)return;
    applyWords();
    options=preparableChantScores(programme,properCrosswalk);
    const choices=$("[data-study-score-choice]");
    choices.replaceChildren();
    const initial=document.createElement("option");
    initial.value="";initial.textContent=t("Select a chant","Choisir un chant");choices.append(initial);
    for(const item of options){
      const entry=document.createElement("option");entry.value=item.id;
      entry.textContent=item.title+" · "+item.trackId.replaceAll("_"," ");
      choices.append(entry);
    }
    if(!options.some(row=>row.id===scoreId))scoreId=null;
    choices.value=scoreId??"";
    choices.disabled=options.length===0;
    // The disclosure may remain open while the selected Proper is changed.
    if(details.open)void draw();
  }
  const onChange=event=>{
    if(event.target?.matches?.("[data-study-score-choice]")){
      const value=event.target.value;
      scoreId=options.some(row=>row.id===value)?value:null;
      void draw();
    }
  };
  const onToggle=()=>{if(details.open)void draw();};
  details.addEventListener("change",onChange);
  details.addEventListener("toggle",onToggle);
  applyWords();
  return Object.freeze({
    update,stop:()=>{}, // Never owns Mass-reader audio or a background task.
    destroy(){
      destroyed=true;details.removeEventListener("change",onChange);
      details.removeEventListener("toggle",onToggle);renderer.destroy();
      details.remove();
    },
    state:()=>Object.freeze({open:details.open,scoreId,
      preparedOnly:true,available:options.length,audioCount:VERIFIED_PREPARATION_RECORDINGS.length}),
  });
}
