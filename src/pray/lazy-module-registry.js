/*
 * Small first-use registry handoff for direct Novena/traditional prayer routes.
 * Calendar/Coming Up and Formation can launch these modules without first
 * visiting the Prayer tab; their existing canonical runtime still owns all
 * rendering, data, source records and module operations after import.
 */
const TRADITIONAL=[
  ["pray.morning_evening","Morning & Evening Prayer","daily-prayer"],
  ["pray.sacred_hymns","Sacred Hymns & Canticles","traditional-devotion"],
  ["pray.holy_name_litany","Litany of the Holy Name","traditional-devotion"],
  ["pray.nightly_examen","Nightly Examination","daily-prayer"],
  ["pray.meal_prayers","Grace at Meals","daily-prayer"],
  ["pray.sacred_heart","Sacred Heart of Jesus","sacred-heart"],
  ["pray.communion_treasury","Traditional Communion Prayers","eucharistic"],
  ["pray.good_death","Preparation for a Good Death","traditional-devotion"],
  ["pray.dying_companion","Dying Companion","pastoral-care"]
];
const PROVISIONAL=Object.freeze(Object.fromEntries([
  ...TRADITIONAL,
  ["pray.novenas","Novenas","traditional-devotion"]
].map(([id,title,category])=>[id,Object.freeze({id,title,category,type:"module",domain:"pray"})])));
const ALIASES=Object.freeze({novenas:"pray.novenas",novena:"pray.novenas"});
const keyOf=id=>String(id??"");
const canonical=id=>ALIASES[keyOf(id)]||keyOf(id);
export function installLazyPrayRegistry(win=globalThis,ensureReader){
  const base=win?.AO_MODULES;
  if(!base||base.__aoPrayLazyFirstUse)return false;
  const wrapper={
    ...base,
    __aoPrayLazyFirstUse:true,
    definitions:Object.freeze({...base.definitions,...PROVISIONAL}),
    aliases:Object.freeze({...base.aliases,...ALIASES}),
    get(id){return PROVISIONAL[canonical(id)]||base.get?.(id)||null;},
    resolve(id){
      const value=PROVISIONAL[canonical(id)];
      if(value)return {ok:true,input:keyOf(id),id:value.id,definition:value,defaults:{},chain:canonical(id)===keyOf(id)?[]:[keyOf(id)]};
      return base.resolve?.(id);
    },
    async open(id,options={}){
      if(!PROVISIONAL[canonical(id)])return base.open?.(id,options);
      try{
        await ensureReader({win});
        const current=win.AO_MODULES;
        if(!current||current===wrapper||typeof current.open!=="function")
          return {ok:false,canonicalId:canonical(id),error:"PRAY_RUNTIME_UNAVAILABLE"};
        // This now invokes the imported official Novena or traditional Prayer
        // registry. No duplicate devotional implementation is installed.
        return await current.open(id,options);
      }catch(error){
        try{win.console?.error?.("Prayer module load failed",error)}catch{}
        return {ok:false,canonicalId:canonical(id),error:"PRAY_RUNTIME_UNAVAILABLE"};
      }
    },
    list(filter={}){
      const previous=base.list?.(filter)||[];
      if((filter.type&&filter.type!=="module")||(filter.domain&&String(filter.domain).toLowerCase()!=="pray"))return previous;
      const known=new Set(previous.map(x=>x?.id));
      return [...previous,...Object.values(PROVISIONAL).filter(x=>!known.has(x.id))];
    },
  };
  win.AO_MODULES=wrapper;
  win.AO_MODULE_REGISTRY_V36=wrapper;
  return true;
}
