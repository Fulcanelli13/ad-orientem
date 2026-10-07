export const SETTINGS_DONOR_VERSION="43.59.6";
export const SETTINGS_KEYS=Object.freeze({"preferences":"ao2:preferences:v1","profiles":"ao2:local-profiles:v1","massSession":"ao2:mass-session:v2","preparation":"ao2:preparation-session:v3","thanksgiving":"ao2:thanksgiving-session:v3","prayerSession":"ao2:prayer-session:v1","notifications":"ao2:notifications:v1","progress":"ao2:progress:v1","migration":"ao2:migration-state:v1","bookmarks":"ao2:bookmarks:v1"});
export const DEFAULT_PREFERENCES=Object.freeze({"schemaVersion":1,"general":{"uiLanguage":"en","hapticsEnabled":false,"keepAwakeDuringGuidedUse":true,"offerResume":true},"accessibility":{"textScale":"system","motion":"system","contrast":"system"},"appearance":{"sacredArt":"full"},"reading":{"vernacularFollowsUiLanguage":true,"vernacular":"en"},"mass":{"defaultExperience":"simple","defaultForm":"sung","responseEmphasis":"quiet","resumeEnabled":true,"offerThanksgivingAfterMass":true,"defaultProfileId":null,"preparationDepth":"standard","thanksgivingDepth":"standard"},"prayer":{"recitationMode":"individual","rosary":{"fatimaPrayer":true,"scriptureCues":true,"commentary":true,"sacredArt":"inherit"},"stations":{"mode":"guided","stabatMater":false},"angelus":{"seasonalForm":"auto","traditionalConclusion":false}}});
export const PROFILE_DEFAULTS=Object.freeze({"postureGuidance":"oconnell_1962","communionPractice":"unspecified","secondConfiteor":"baseline","secondConfiteorParticipation":"unspecified","aspergesPractice":"unspecified","incensePractice":"unspecified","epistleMinister":"unspecified","longInterlectionSeating":"unspecified","sanctusHandling":"unspecified","marianAntiphon":"none","postureOverrides":{}});
const ENUMS=Object.freeze({"uiLanguage":["en","fr"],"textScale":["system","small","standard","large","extra_large"],"motion":["system","standard","reduced"],"contrast":["system","standard","high"],"sacredArt":["full","subtle","minimal"],"massExperience":["simple","missal","live"],"massForm":["sung","low"],"response":["quiet","responses"],"flowDepth":["quick","standard","full"],"recitation":["individual","group"],"rosaryArt":["inherit","full","subtle","off"],"stations":["guided","simple"],"angelus":["auto","angelus","regina_caeli"],"postureGuidance":["oconnell_1962","walsh_traditional","local_community"],"communion":["unspecified","usually_offered","usually_not_offered"],"secondConfiteor":["baseline","retained_locally"],"secondParticipation":["unspecified","usually_joined","usually_not_joined"],"asperges":["unspecified","usually_included","usually_not_included"],"incense":["unspecified","usually_used","usually_not_used"],"epistle":["unspecified","celebrant","lector"],"interlection":["unspecified","usually_used","usually_not_used"],"sanctus":["unspecified","gregorian_continuous","deferred_benedictus"],"marian":["none","salve_regina"],"posture":["follow","stand","sit","kneel"]});

export function createSettingsDonorState(win=globalThis){
  const clone=v=>JSON.parse(JSON.stringify(v));
  const isObj=v=>Boolean(v&&typeof v==="object"&&!Array.isArray(v));
  const pick=(v,a,d)=>a.includes(v)?v:d;
  const bool=(v,d)=>typeof v==="boolean"?v:d;
  const readJson=(k)=>{try{return JSON.parse(win.localStorage?.getItem?.(k)||"null");}catch{return null;}};
  const writeJson=(k,v)=>{try{win.localStorage?.setItem?.(k,JSON.stringify(v));return true;}catch{return false;}};
  const remove=(k)=>{try{win.localStorage?.removeItem?.(k);}catch{}};
  const core=()=>win?.AO_RUNTIME_V8?.store?.getState?.()||{};
  const dispatch=a=>{try{win?.AO_RUNTIME_V8?.store?.dispatch?.(a);return true;}catch{return false;}};

  function sanitizePreferences(raw){
    const d=clone(DEFAULT_PREFERENCES),r=isObj(raw)?raw:{},g=isObj(r.general)?r.general:{},a=isObj(r.accessibility)?r.accessibility:{},ap=isObj(r.appearance)?r.appearance:{},rd=isObj(r.reading)?r.reading:{},m=isObj(r.mass)?r.mass:{},p=isObj(r.prayer)?r.prayer:{},ro=isObj(p.rosary)?p.rosary:{},st=isObj(p.stations)?p.stations:{},an=isObj(p.angelus)?p.angelus:{};
    return {
      schemaVersion:1,
      general:{uiLanguage:pick(g.uiLanguage,ENUMS.uiLanguage,d.general.uiLanguage),hapticsEnabled:bool(g.hapticsEnabled,d.general.hapticsEnabled),keepAwakeDuringGuidedUse:bool(g.keepAwakeDuringGuidedUse,d.general.keepAwakeDuringGuidedUse),offerResume:bool(g.offerResume,d.general.offerResume)},
      accessibility:{textScale:pick(a.textScale,ENUMS.textScale,d.accessibility.textScale),motion:pick(a.motion,ENUMS.motion,d.accessibility.motion),contrast:pick(a.contrast,ENUMS.contrast,d.accessibility.contrast)},
      appearance:{sacredArt:pick(ap.sacredArt,ENUMS.sacredArt,d.appearance.sacredArt)},
      reading:{vernacularFollowsUiLanguage:bool(rd.vernacularFollowsUiLanguage,d.reading.vernacularFollowsUiLanguage),vernacular:pick(rd.vernacular,ENUMS.uiLanguage,d.reading.vernacular)},
      mass:{defaultExperience:pick(m.defaultExperience,ENUMS.massExperience,d.mass.defaultExperience),defaultForm:pick(m.defaultForm,ENUMS.massForm,d.mass.defaultForm),responseEmphasis:pick(m.responseEmphasis,ENUMS.response,d.mass.responseEmphasis),resumeEnabled:bool(m.resumeEnabled,d.mass.resumeEnabled),offerThanksgivingAfterMass:bool(m.offerThanksgivingAfterMass,d.mass.offerThanksgivingAfterMass),defaultProfileId:typeof m.defaultProfileId==="string"&&m.defaultProfileId.trim()?m.defaultProfileId:null,preparationDepth:pick(m.preparationDepth,ENUMS.flowDepth,d.mass.preparationDepth),thanksgivingDepth:pick(m.thanksgivingDepth,ENUMS.flowDepth,d.mass.thanksgivingDepth)},
      prayer:{recitationMode:pick(p.recitationMode,ENUMS.recitation,d.prayer.recitationMode),rosary:{fatimaPrayer:bool(ro.fatimaPrayer,d.prayer.rosary.fatimaPrayer),scriptureCues:bool(ro.scriptureCues,d.prayer.rosary.scriptureCues),commentary:bool(ro.commentary,d.prayer.rosary.commentary),sacredArt:pick(ro.sacredArt,ENUMS.rosaryArt,d.prayer.rosary.sacredArt)},stations:{mode:pick(st.mode,ENUMS.stations,d.prayer.stations.mode),stabatMater:bool(st.stabatMater,d.prayer.stations.stabatMater)},angelus:{seasonalForm:pick(an.seasonalForm,ENUMS.angelus,d.prayer.angelus.seasonalForm),traditionalConclusion:bool(an.traditionalConclusion,d.prayer.angelus.traditionalConclusion)}}
    };
  }
  function sanitizeProfile(raw){
    if(!isObj(raw)||typeof raw.id!=="string"||!raw.id.trim()||typeof raw.name!=="string"||!raw.name.trim())return null;
    const c=isObj(raw.customs)?raw.customs:{},ov=isObj(c.postureOverrides)?c.postureOverrides:{},clean={};
    for(const [k,v] of Object.entries(ov))if(ENUMS.posture.includes(v))clean[String(k)]=v;
    return {id:raw.id,name:raw.name.trim(),createdAt:raw.createdAt||new Date(0).toISOString(),updatedAt:raw.updatedAt||raw.createdAt||new Date(0).toISOString(),revision:Number.isInteger(raw.revision)&&raw.revision>=1?raw.revision:1,customs:{
      postureGuidance:pick(c.postureGuidance,ENUMS.postureGuidance,PROFILE_DEFAULTS.postureGuidance),communionPractice:pick(c.communionPractice,ENUMS.communion,PROFILE_DEFAULTS.communionPractice),secondConfiteor:pick(c.secondConfiteor,ENUMS.secondConfiteor,PROFILE_DEFAULTS.secondConfiteor),secondConfiteorParticipation:pick(c.secondConfiteorParticipation,ENUMS.secondParticipation,PROFILE_DEFAULTS.secondConfiteorParticipation),aspergesPractice:pick(c.aspergesPractice,ENUMS.asperges,PROFILE_DEFAULTS.aspergesPractice),incensePractice:pick(c.incensePractice,ENUMS.incense,PROFILE_DEFAULTS.incensePractice),epistleMinister:pick(c.epistleMinister,ENUMS.epistle,PROFILE_DEFAULTS.epistleMinister),longInterlectionSeating:pick(c.longInterlectionSeating,ENUMS.interlection,PROFILE_DEFAULTS.longInterlectionSeating),sanctusHandling:pick(c.sanctusHandling,ENUMS.sanctus,PROFILE_DEFAULTS.sanctusHandling),marianAntiphon:pick(c.marianAntiphon,ENUMS.marian,PROFILE_DEFAULTS.marianAntiphon),postureOverrides:clean
    }};
  }
  function initialPreferences(){
    const stored=readJson(SETTINGS_KEYS.preferences);
    if(stored)return sanitizePreferences(stored);
    const p=clone(DEFAULT_PREFERENCES),s=core(),cs=s.settings||{},pray=readJson("ao.pray.v435930")||{};
    p.general.uiLanguage=s.language==="fr"?"fr":"en";
    p.reading.vernacular=p.general.uiLanguage;
    if(cs.massForm==="low"||cs.massForm==="sung")p.mass.defaultForm=cs.massForm;
    p.mass.defaultExperience=cs.followMode==="missal"?"missal":cs.followMode==="vox"?"live":"simple";
    p.mass.responseEmphasis=cs.participationMode==="group"?"responses":"quiet";
    if(cs.reducedMotion===true)p.accessibility.motion="reduced";
    if(cs.textScale==="large")p.accessibility.textScale="large";
    if(pray.rosary?.recitation==="group")p.prayer.recitationMode="group";
    if(pray.stations?.mode==="simple")p.prayer.stations.mode="simple";
    p.prayer.stations.stabatMater=Boolean(pray.stations?.stabat);
    p.prayer.angelus.seasonalForm=pray.angelusMode==="angelus"?"angelus":pray.angelusMode==="regina"?"regina_caeli":"auto";
    p.prayer.angelus.traditionalConclusion=Boolean(pray.angelusHistoricalConclusion);
    writeJson(SETTINGS_KEYS.preferences,p);
    return p;
  }
  function initialProfiles(){
    const raw=readJson(SETTINGS_KEYS.profiles),arr=Array.isArray(raw)?raw:Array.isArray(raw?.profiles)?raw.profiles:[];
    return arr.map(sanitizeProfile).filter(Boolean);
  }
  let preferences=initialPreferences(),profiles=initialProfiles();

  function syncEffects(){
    const p=preferences,html=win?.document?.documentElement;
    if(html?.dataset){
      html.dataset.aoTextScaleV1=p.accessibility.textScale;
      html.dataset.aoMotionV1=p.accessibility.motion;
      html.dataset.aoContrastV1=p.accessibility.contrast;
      html.dataset.aoSacredArtV1=p.appearance.sacredArt;
    }
    const current=core();
    if(current.language!==p.general.uiLanguage)dispatch({type:"set-language",language:p.general.uiLanguage});
    const activeMass=Boolean(win?.AO_APP_LIVE_SESSION_GUARDS_V1?.status?.().live);
    try{
      if(activeMass)win?.AO_APP_LIVE_SESSION_GUARDS_V1?.forceHapticsOff?.();
      else win?.AO_HAPTICS_V4319?.setEnabled?.(Boolean(p.general.hapticsEnabled));
    }catch{}
    try{win?.AO_PRAY_V435930?.applySettingsPreferences?.(p.prayer);}catch{}
    return true;
  }
  function persist(){
    preferences=sanitizePreferences(preferences);
    profiles=profiles.map(sanitizeProfile).filter(Boolean);
    writeJson(SETTINGS_KEYS.preferences,preferences);writeJson(SETTINGS_KEYS.profiles,{schemaVersion:1,profiles});
    syncEffects();return snapshot();
  }
  function snapshot(){return Object.freeze({version:"43.59.6",preferences:clone(preferences),profiles:clone(profiles),keys:SETTINGS_KEYS});}
  function getPath(path){
    return String(path).split(".").reduce((v,k)=>v?.[k],preferences);
  }
  function setPath(path,value){
    const keys=String(path).split("."),next=clone(preferences);let node=next;
    for(let i=0;i<keys.length-1;i++){if(!isObj(node[keys[i]]))node[keys[i]]={};node=node[keys[i]];}
    node[keys.at(-1)]=value;preferences=sanitizePreferences(next);
    if(path==="general.uiLanguage"&&preferences.reading.vernacularFollowsUiLanguage)preferences.reading.vernacular=preferences.general.uiLanguage;
    return persist();
  }
  function togglePath(path){return setPath(path,!Boolean(getPath(path)));}
  function createProfile(name){
    const now=new Date().toISOString(),id="church-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
    profiles=[...profiles,{id,name:String(name||"Church profile"),createdAt:now,updatedAt:now,revision:1,customs:clone(PROFILE_DEFAULTS)}];persist();return id;
  }
  function renameProfile(id,name){
    const now=new Date().toISOString();
    profiles=profiles.map(p=>p.id===id&&String(name||"").trim()&&p.name!==String(name).trim()?{...p,name:String(name).trim(),updatedAt:now,revision:p.revision+1}:p);
    return persist();
  }
  function updateProfile(id,key,value){
    const now=new Date().toISOString();
    profiles=profiles.map(p=>p.id!==id?p:{...p,updatedAt:now,revision:p.revision+1,customs:{...p.customs,[key]:value}});
    return persist();
  }
  function deleteProfile(id){
    profiles=profiles.filter(p=>p.id!==id);
    if(preferences.mass.defaultProfileId===id)preferences={...preferences,mass:{...preferences.mass,defaultProfileId:null}};
    return persist();
  }
  function resetPreferences(){preferences=clone(DEFAULT_PREFERENCES);return persist();}
  function resetProfiles(){profiles=[];preferences={...preferences,mass:{...preferences.mass,defaultProfileId:null}};return persist();}
  function clearData(action){
    if(action==="clear-mass"){remove(SETTINGS_KEYS.massSession);remove("ao2:live-session:v1");}
    else if(action==="clear-prayer"){[SETTINGS_KEYS.preparation,SETTINGS_KEYS.thanksgiving,SETTINGS_KEYS.prayerSession,"ao2:prepare:v2","ao2:thanksgiving:v2"].forEach(remove);}
    else if(action==="clear-progress")remove(SETTINGS_KEYS.progress);
    else if(action==="clear-bookmarks")remove(SETTINGS_KEYS.bookmarks);
    else if(action==="reset-preferences")return resetPreferences();
    else if(action==="reset-profiles")return resetProfiles();
    else if(action==="reset-all"){[SETTINGS_KEYS.massSession,SETTINGS_KEYS.preparation,SETTINGS_KEYS.thanksgiving,SETTINGS_KEYS.prayerSession,SETTINGS_KEYS.notifications,SETTINGS_KEYS.progress,SETTINGS_KEYS.bookmarks].forEach(remove);preferences=clone(DEFAULT_PREFERENCES);profiles=[];return persist();}
    return snapshot();
  }
  syncEffects();
  return Object.freeze({version:"43.59.6",snapshot,setPath,togglePath,createProfile,renameProfile,updateProfile,deleteProfile,resetPreferences,resetProfiles,clearData,syncEffects});
}
