// Source-attributed institutional insignia for the Mass finder.
// The asset URL is a public Wikimedia source for preview; self-host or obtain
// approved originals before commercial release. Insignia never imply endorsement.
// Diocesan sites use a neutral church marker: Holy See arms do not identify their owner.
// Do not infer canonical standing, Communion with Rome, or una-cum practice from logos.
export const MASS_INSTITUTION_EMBLEMS=Object.freeze({
  FSSP:Object.freeze({
    label:"FSSP",image:"https://commons.wikimedia.org/wiki/Special:FilePath/FSSP_emblem.svg",
    source:"https://commons.wikimedia.org/wiki/File:FSSP_emblem.svg",
    rights:"CC BY-SA 4.0; Benoît Riveron / Fr Stefan Reiner FSSP",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
    reviewBeforeCommercialRelease:true,
  }),
  ICKSP:Object.freeze({
    label:"ICKSP",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Coat_of_Arms_of_the_Institute_of_Christ_the_King_Sovereign_Priest.svg",
    source:"https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_the_Institute_of_Christ_the_King_Sovereign_Priest.svg",
    rights:"CC BY-SA 3.0; Tom Lemmens",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
    reviewBeforeCommercialRelease:true,
  }),
  SSPX:Object.freeze({
    label:"SSPX",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Society_of_Saint_Pius_X_logo.svg",
    source:"https://commons.wikimedia.org/wiki/File:Society_of_Saint_Pius_X_logo.svg",
    rights:"CC0 vectorisation (underlying source authorship unverified); institutional insignia rights are separate",
    licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",
    reviewBeforeCommercialRelease:true,
  }),
  AASJMV:Object.freeze({
    label:"AASJMV",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Bras%C3%A3o_da_Administra%C3%A7%C3%A3o_apost%C3%B3lica_de_Campos.jpg",
    source:"https://commons.wikimedia.org/wiki/File:Bras%C3%A3o_da_Administra%C3%A7%C3%A3o_apost%C3%B3lica_de_Campos.jpg",
    rights:"CC BY-SA 3.0; Kaiser Guilherme II. Institutional insignia rights independently protected",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
    reviewBeforeCommercialRelease:true,
  }),
  IBP:Object.freeze({
    label:"IBP",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Ibp-institutdubonpasteur-logo.svg",
    source:"https://commons.wikimedia.org/wiki/File:Ibp-institutdubonpasteur-logo.svg",
    rights:"CC BY-SA 4.0; Marcelo A. Aguinagalde",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
    reviewBeforeCommercialRelease:true,
  }),
  CAPUCHINS_MORGON:Object.freeze({
    label:"Capuchins of Morgon",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Capuchins_of_morgon_logo.png",
    source:"https://commons.wikimedia.org/wiki/File:Capuchins_of_morgon_logo.png",
    officialIdentitySource:"https://capucins-morgon.fr/histoire/ordre-capucin",
    rights:"Commons lists CC BY-SA 4.0; 2022 uploader credits the Capuchins of Morgon booklet as original source. Institution-origin licence authority requires separate review.",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
    reviewBeforeCommercialRelease:true,
  }),
  // Independently drawn public-domain geometry matching the organisation's
  // published red octagonal cross. This is NOT a copied institutional logo.
  MILITIA_TEMPLI:Object.freeze({
    label:"Militia Templi",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Maltese_Cross_variant_red.svg",
    source:"https://commons.wikimedia.org/wiki/File:Maltese_Cross_variant_red.svg",
    officialIdentitySource:"https://www.ordo-militiae-templi.org/militia/en/habit-and-insignia/",
    rights:"Public-domain geometry by AnonMoos (2010), independently made to replace a Militia Templi cross image. Not an official organisation-supplied logo; separate insignia rights must be reviewed.",
    licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/",
    symbolScope:"INDEPENDENT_INSIGNIA_RENDERING",
    reviewBeforeCommercialRelease:true,
  }),
  // Order-wide historical heraldry: only for a source record explicitly
  // classified by that ORDER_FAMILY code. It is not a local abbey's arms,
  // a claim of operator ownership, or an invented institute insignia.
  BENEDICTINE:Object.freeze({
    label:"Benedictine Order",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Coat_of_Arms_of_the_Order_of_Saint_Benedict_(simple).svg",
    source:"https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_the_Order_of_Saint_Benedict_(simple).svg",
    rights:"CC0 1.0; Tom-L. General Order of Saint Benedict heraldry, not individual monastery arms.",
    licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",
    symbolScope:"ORDER_FAMILY",
    reviewBeforeCommercialRelease:true,
  }),
  DOMINICAN:Object.freeze({
    label:"Dominican Order",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Shield_of_Dominican_Order.svg",
    source:"https://commons.wikimedia.org/wiki/File:Shield_of_Dominican_Order.svg",
    rights:"Public domain (PD-self); AnonMoos / Bmflo. General Dominican Order arms, not Avrillé or Fanjeaux arms.",
    licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/",
    symbolScope:"ORDER_FAMILY",
    reviewBeforeCommercialRelease:true,
  }),
  ORATORIAN:Object.freeze({
    label:"Oratorian Confederation",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Congregazione_oratorio_di_San_Filippo_Neri-Stemma.svg",
    source:"https://commons.wikimedia.org/wiki/File:Congregazione_oratorio_di_San_Filippo_Neri-Stemma.svg",
    rights:"CC BY-SA 4.0; Arrow303 (2024) and credited component artists. Historical blazon of the Confederation of the Oratory of Saint Philip Neri; not an individual congregation or Institute of St Philip Neri crest.",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
    symbolScope:"ORDER_FAMILY",
    reviewBeforeCommercialRelease:true,
  }),
  CISTERCIAN:Object.freeze({
    label:"Cistercian Order",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/Coat_of_arms_of_the_Cistercian_Order.svg",
    source:"https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_the_Cistercian_Order.svg",
    rights:"CC BY-SA 4.0; Tardigradius. General Cistercian Order arms, not individual abbey arms.",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
    symbolScope:"ORDER_FAMILY",
    reviewBeforeCommercialRelease:true,
  }),
  NORBERTINE:Object.freeze({
    label:"Norbertine Order",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/COA_Premonstratensians.svg",
    source:"https://commons.wikimedia.org/wiki/File:COA_Premonstratensians.svg",
    rights:"Public domain (PD-self); Flopro / Afernand74 / Perhelion. Premonstratensian/Norbertine order, not individual house arms.",
    licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/",
    symbolScope:"ORDER_FAMILY",
    reviewBeforeCommercialRelease:true,
  }),
  PREMONSTRATENSIAN:Object.freeze({
    label:"Premonstratensian Order",
    image:"https://commons.wikimedia.org/wiki/Special:FilePath/COA_Premonstratensians.svg",
    source:"https://commons.wikimedia.org/wiki/File:COA_Premonstratensians.svg",
    rights:"Public domain (PD-self); Flopro / Afernand74 / Perhelion. Same heraldry as Norbertines; not a separate institute.",
    licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/",
    symbolScope:"ORDER_FAMILY",
    reviewBeforeCommercialRelease:true,
  }),
});
export const MASS_EMBLEM_GROUPS=Object.freeze(Object.keys(MASS_INSTITUTION_EMBLEMS));
export function massInstitutionEmblem(group){
  return Object.hasOwn(MASS_INSTITUTION_EMBLEMS,String(group??"").toUpperCase())
    ?MASS_INSTITUTION_EMBLEMS[String(group).toUpperCase()]:null;
}
export function massInstitutionImageId(group){
  const key=String(group??"").toUpperCase();
  return massInstitutionEmblem(key)?"ao-mass-institution-"+key:null;
}

// Register actual emblems as MapLibre image sprites, not thousands of DOM markers.
// If network/CORS/decoding fails, map circles stay accessible and clickable.
// The caller decides which layers to show only after successful registration.
export async function registerMassInstitutionImages(map,{
  win=globalThis,onRegistered=()=>{},timeoutMs=8000,
}={}){
  if(!win?.Image||!win?.document?.createElement||!map?.addImage)return [];
  const timeout=Math.max(500,Math.min(20000,Number(timeoutMs)||8000));
  const results=await Promise.all(MASS_EMBLEM_GROUPS.map(group=>new Promise(resolve=>{
    const definition=MASS_INSTITUTION_EMBLEMS[group];
    const img=new win.Image();
    let settled=false,timer=null;
    const finish=value=>{
      if(settled)return;
      settled=true;
      if(timer!==null)win.clearTimeout?.(timer);
      img.onload=null;img.onerror=null;
      resolve(value);
    };
    img.crossOrigin="anonymous";
    img.onload=()=>{
      if(settled)return;
      try{
        // Local rasterisation removes browser/MapLibre SVG sprite incompatibilities.
        // 72 physical pixels at pixelRatio 2 gives a crisp 36 CSS-pixel marker.
        const canvas=win.document.createElement("canvas");
        canvas.width=72;canvas.height=72;
        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        if(!ctx)throw new Error("No canvas 2D context");
        const w=Number(img.naturalWidth||img.width),h=Number(img.naturalHeight||img.height);
        if(!(w>0&&h>0))throw new Error("Empty emblem");
        const ratio=Math.min(60/w,60/h);
        ctx.drawImage(img,(72-w*ratio)/2,(72-h*ratio)/2,w*ratio,h*ratio);
        const id=massInstitutionImageId(group);
        if(!map.hasImage?.(id))map.addImage(id,ctx.getImageData(0,0,72,72),{pixelRatio:2});
        // One slow image must not prevent faster logos from appearing.
        try{onRegistered(group)}catch{}
        finish(group);
      }catch{finish(null)}
    };
    img.onerror=()=>finish(null);
    if(typeof win.setTimeout==="function")
      timer=win.setTimeout(()=>finish(null),timeout);
    img.src=definition.image;
  })));
  return results.filter(Boolean);
}
