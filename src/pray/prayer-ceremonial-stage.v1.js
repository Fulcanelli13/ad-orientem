/**
 * Source-bound visual staging shared by Confession preparation and Tenebrae.
 * Visual-only projection: this module never owns prayer text, gestures,
 * sacramental acts, Office order, candle observations or navigation.
 *
 * Confession sequence: confession-paths.js (three routes, four macro stages).
 * Tenebrae sequence: tenebrae-1960.js; optional witnessed candle events:
 * tenebrae-ceremonial.v1.js (historical local custom, not a 1960 obligation).
 */
export const PRAYER_CEREMONIAL_SCENE_VERSION="prayer-ceremonial-scene-v1";

const CONFESSION_PHASES=Object.freeze(["prepare","examine","approach","after"]);
const CAPTIONS=Object.freeze({
  prepare:["Preparation","Préparation"],
  examine:["Examination of conscience","Examen de conscience"],
  approach:["Before entering the confessional","Avant d'entrer au confessionnal"],
  after:["After an actual Confession","Après une confession réelle"]
});
function langText(pair,french){return pair[french?1:0]}
function finiteInt(n,lo,hi){return Number.isInteger(n)?Math.min(hi,Math.max(lo,n)):lo}

export function prayerCeremonialSceneState({kind=null,stage=0,cardId=null,ceremony=null}={}){
  if(kind==="confession"){
    const index=finiteInt(stage,0,3);
    return Object.freeze({
      kind,phase:CONFESSION_PHASES[index],stage:index,
      rehearsalCross:index===2&&cardId==="cross-and-blessing",
      decorative:true,observedNow:false,performedSacrament:false,
      storesPrivateAnswers:false
    });
  }
  if(kind==="tenebrae-office"){
    // The canonical Office has no prescribed fifteen-candle choreography.
    // Render only a stationary, non-ceremonial sanctuary without candle claims.
    const hour=stage==="LAUDS"?"LAUDS":"MATINS";
    return Object.freeze({kind,phase:hour.toLowerCase(),decorative:true,
      observedNow:false,performedRite:false,candleCount:0,autoAdvancement:false});
  }
  if(kind==="tenebrae"){
    if(ceremony?.enabled!==true)return null;
    const extinguished=finiteInt(ceremony.extinguished,0,14);
    const hidden=ceremony.hidden===true&&extinguished===14;
    const strepitus=ceremony.strepitus===true&&hidden;
    const returned=ceremony.returned===true&&strepitus;
    return Object.freeze({
      kind,phase:returned?"returned":strepitus?"strepitus":hidden?"concealed":"watch",
      extinguished,hidden,strepitus,returned,candleCount:15,
      decorative:true,observedNow:false,performedRite:false,
      autoAdvancement:false,customaryOnly:true
    });
  }
  return null;
}
export function renderPrayerCeremonialScene(scene,{french=false}={}){
  if(!scene)return "";
  if(scene.kind==="confession"){
    const label=langText(CAPTIONS[scene.phase],french);
    return '<figure class="aoPrayerCeremonialScene aoPrayerCeremonialScene--confession"'+
      ' data-ao-scene-kind="confession" data-ao-scene-phase="'+scene.phase+'"'+
      ' data-ao-scene-stage="'+scene.stage+'"'+
      ' data-ao-scene-claim="visual-only" aria-label="'+label+'">'+
      '<div class="aoPrayerSceneVault" aria-hidden="true"><span class="aoPrayerSceneArch"></span>'+
      '<span class="aoPrayerSceneWindow"></span><span class="aoPrayerSceneDoor"></span>'+
      '<span class="aoPrayerSceneGrille"></span><span class="aoPrayerSceneKneeler"></span>'+
      '<span class="aoPrayerSceneFloor"></span><span class="aoPrayerSceneLight"></span></div>'+
      '<figcaption>'+label+'</figcaption></figure>';
  }
  if(scene.kind==="tenebrae-office"){
    const label=french?"Office des Ténèbres · illustration du sanctuaire":"Tenebrae Office · sanctuary illustration";
    return '<figure class="aoPrayerCeremonialScene aoPrayerCeremonialScene--office" '+
      'data-ao-scene-kind="tenebrae-office" data-ao-scene-phase="'+scene.phase+'" '+
      'data-ao-scene-claim="visual-only" aria-label="'+label+'">'+
      '<div class="aoPrayerSceneTenebraeVault" aria-hidden="true">'+
      '<span class="aoPrayerSceneTenebraeArch"></span><span class="aoPrayerSceneOfficeCross"></span>'+
      '<span class="aoPrayerSceneOfficeGlow"></span></div><figcaption>'+label+'</figcaption></figure>';
  }
  if(scene.kind==="tenebrae"){
    const phase=scene.phase;
    const candles=Array.from({length:scene.candleCount},(_,i)=>{
      const last=i===14;
      const lit=last?(!scene.hidden||scene.returned):i>=scene.extinguished;
      // Seven candles per sloping arm and one at the apex. An illustrative
      // historical hearse; positions are NOT assertions about local sequence.
      const level=last?7:(i<7?i:13-i);
      const x=last?50:(i<7?14+i*5:56+(i-7)*5);
      const rise=last?54:(8+level*5.7);
      const name=(french?"Cierge ":"Candle ")+(i+1)+" · "+
        (lit?(french?"allumé":"lit"):(french?"éteint ou caché":"extinguished or concealed"));
      return '<span class="aoPrayerCeremonialCandle'+(last?" is-final":"")+
        (lit?" is-lit":" is-dark")+(last&&scene.hidden&&!scene.returned?" is-concealed":"")+'" data-ao-candle-index="'+i+
        '" style="--ao-candle-x:'+x+'%;--ao-candle-rise:'+rise.toFixed(1)+'%" role="img" aria-label="'+name+'"><i class="aoPrayerCeremonialFlame" aria-hidden="true"></i>'+
        '<i class="aoPrayerCeremonialWick" aria-hidden="true"></i></span>';
    }).join("");
    const caption=french?"Cérémonial local facultatif · événements constatés":
      "Optional local ceremonial · observed events only";
    return '<figure class="aoPrayerCeremonialScene aoPrayerCeremonialScene--tenebrae"'+
      ' data-ao-scene-kind="tenebrae" data-ao-scene-phase="'+phase+'"'+
      ' data-ao-scene-claim="visual-only" data-ao-candles-extinguished="'+scene.extinguished+'"'+
      '><div class="aoPrayerSceneTenebraeVault"><span class="aoPrayerSceneTenebraeArch" aria-hidden="true"></span>'+
      '<div class="aoPrayerCeremonialCandleRail" role="group" aria-label="'+
      (french?"Quinze cierges du cérémonial historique":"Fifteen historical ceremonial candles")+
      '">'+candles+'</div></div><figcaption>'+caption+'</figcaption></figure>';
  }
  return "";
}
