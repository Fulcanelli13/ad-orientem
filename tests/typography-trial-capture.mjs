import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { typographyTrialCss, TYPOGRAPHY_TRIAL_MODES } from "../src/app/typography-trial.js";

// Capture *the current real app DOM*, changing only the text family.
// Use the same viewport, route, scroll and interaction state in each variant.
// Google Fonts loading is reported explicitly; fallback is never mislabelled.
export async function captureTypographyTriptych(page,{name,out,scope,selectors=[],fullPage=false}){
  const faces=Object.keys(TYPOGRAPHY_TRIAL_MODES);
  await page.evaluate(css=>{
    const doc=document;
    if(!doc.getElementById("ao-typography-trial-fonts")){
      const link=doc.createElement("link");link.rel="stylesheet";
      link.id="ao-typography-trial-fonts";
      link.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap";
      doc.head.append(link);
    }
    if(!doc.getElementById("ao-typography-trial-style")){
      const style=doc.createElement("style");style.id="ao-typography-trial-style";
      style.textContent=css;doc.head.append(style);
    }
    doc.documentElement.dataset.aoTypographyTrialHideDock="true";
  },typographyTrialCss());
  const report={name,scope,viewport:page.viewportSize(),variants:[]};
  const variants=[null,...faces];
  try{
    for(const mode of variants){
      await page.evaluate(mode=>{
        if(mode)document.documentElement.dataset.aoTypographyTrial=mode;
        else delete document.documentElement.dataset.aoTypographyTrial;
      },mode);
      if(mode){
        const family=TYPOGRAPHY_TRIAL_MODES[mode].name;
        await page.evaluate(async family=>{
          // Some CI networks restrict Google Fonts. We record readiness rather
          // than silently presenting a fallback screenshot as the named font.
          await Promise.race([
            document.fonts.load('400 16px "'+family+'"').catch(()=>[]),
            new Promise(done=>setTimeout(done,6500)),
          ]);
        },family);
      }
      const record=await page.evaluate(({mode,scope,selectors})=>{
        const root=document.querySelector(scope);
        const family=mode==="inter"?"Inter":mode==="source-sans-3"?"Source Sans 3":null;
        const fonts=family?[...document.fonts].filter(f=>f.family.replace(/['"]/g,"")===family):[];
        const elements=Object.fromEntries(selectors.map(([key,selector])=>{
          const el=document.querySelector(selector);const style=el?getComputedStyle(el):null;
          return [key,style?{family:style.fontFamily,size:style.fontSize,weight:style.fontWeight,
            lineHeight:style.lineHeight,letterSpacing:style.letterSpacing,visible:Boolean(el.getClientRects().length)}:null];
        }));
        return {variant:mode||"original",rootMounted:Boolean(root),
          fontStatus:family?{family,declared:fonts.length,loaded:fonts.filter(x=>x.status==="loaded").length}:null,
          elements,overflowPx:root?Math.max(0,root.scrollWidth-root.clientWidth):null};
      },{mode,scope,selectors});
      report.variants.push(record);
      if(!record.rootMounted)throw Error("Typeface capture route not mounted: "+name+" "+scope);
      await page.screenshot({path:resolve(out,"type-"+name+"-"+(mode||"original")+".png"),fullPage});
    }
  }finally{
    await page.evaluate(()=>{delete document.documentElement.dataset.aoTypographyTrial});
  }
  await writeFile(resolve(out,"type-"+name+".json"),JSON.stringify(report,null,2)+"\n","utf8");
  console.log("TYPEFACE_COMPARISON="+JSON.stringify(report));
  return report;
}
