import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';

const root=new URL('../../',import.meta.url);
const primary=JSON.parse(await readFile(new URL('artifacts/calendar-1962-full-year-audit.json',root),'utf8'));
const secondUrl=y=>'https://gcatholic.org/calendar/'+y+'/Extraordinary-en';
const total=y=>y===2024?366:365;
const indexByDate=new Map(primary.reviews.map(x=>[x.date,x]));
const appByDate=new Map(primary.dayRows.map(x=>[x.date,x]));
if(appByDate.size!==731)throw Error('Primary audit did not retain exactly 731 daily resolver records');
const normColour=s=>String(s||'').trim().toLowerCase().replace('purple','violet');
const normalName=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const sourceMatch=(app,second)=>app&&second&&app.rank===second.rank&&String(app.colour||'').split('/').map(normColour).includes(normColour(second.colour));
let browser;
const report={schema:'AO_CALENDAR_1962_SECONDARY_RECONCILIATION_V1',createdAt:new Date().toISOString(),
 primarySource:'https://missale.online/festkalender/en/2027/druck',
 secondarySource:'https://gcatholic.org/calendar/2027/Extraordinary-en',
 note:'Two independent digital reconstructions are corroborating sources, not an original printed 1962 missal certification. Alternative Masses must not be confused with principal observance.',
 years:[],findings:[],failures:[]};
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:'block'});
 for(const year of [2024,2027]){
  const url=secondUrl(year);let data=[];
  try{
   const result=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
   if(result.status()!==200)throw Error('GCatholic HTTP '+result.status());
   data=await page.evaluate(year=>{
    const text=e=>String(e?.innerText||e?.textContent||'').replace(/\s+/g,' ').trim();
    const byDate=new Map();
    for(const row of document.querySelectorAll('table.tb tr')){
     const id=row.id;
     if(/^\d{4}$/.test(id)){
      const dt=year+'-'+id.slice(0,2)+'-'+id.slice(2);
      if(!byDate.has(dt))byDate.set(dt,[]);
      var current=dt;
     }else if(!row.classList.contains('tbhd')&&!row.classList.contains('tbhd2')){
      // Rows without an ID immediately after a dated row are permitted
      // alternative Masses, not new calendar dates.
     }
     if(!current||row.classList.contains('tbhd')||row.classList.contains('tbhd2'))continue;
     const mass=[...row.querySelectorAll('p.indent')][0];
     if(!mass)continue;
     const cell=mass.closest('td');
     const classText=text(cell?.previousElementSibling);
     const token=classText.match(/^(IV|III|II|I)$/i)?.[1]?.toUpperCase();
     if(!token)continue;
     const symbol=mass.querySelector('[class*="feastw"],[class*="feastg"],[class*="feastr"],[class*="feastv"],[class*="feastp"],[class*="feastb"]')?.className||'';
     const code=symbol.match(/\bfeast([wgrvpb])\b/)?.[1]||'';
     const colour={w:'white',g:'green',r:'red',v:'violet',p:'rose',b:'black'}[code]||null;
     const title=text(mass);
     const commemorations=text(cell?.nextElementSibling);
     byDate.get(current)?.push({rank:{I:1,II:2,III:3,IV:4}[token],colour,title,commemorations});
    }
    return [...byDate].map(([date,candidates])=>({date,candidates,primary:candidates[0]||null}));
   },year);
   if(data.length!==total(year))throw Error('GCatholic calendar parsed '+data.length+' days; expected '+total(year));
   const seen=new Set(data.map(x=>x.date));
   if(seen.size!==total(year))throw Error('GCatholic duplicate dates');
   const missing=data.filter(x=>!x.primary);
   if(missing.length)throw Error('GCatholic unparsed principal celebrations '+missing.length+' (first '+missing[0]?.date+')');
  }catch(error){
   report.failures.push({year,url,error:String(error.message||error)});
   continue;
  }
  let secondByDate=new Map(data.map(x=>[x.date,x]));
  const counters={totalDays:total(year),primaryMissing:0,secondaryFillsPrimaryGap:0,
   primaryNeedsEditorial:0,secondaryCorroboratesAppForEditorial:0,secondaryConflictsAppForEditorial:0,
   disputedPrimary:0,secondaryAgreesAppInDispute:0,secondaryAgreesPrimaryInDispute:0,
   secondaryNewConflicts:0,secondaryAlternativeMatchesApp:0,secondaryDisagreesOnFirstSourceCompatible:0,
   editorialGenericFeria:0,editorialNamesStillToReview:0,editorialCommemorationPresenceMismatch:0};
  for(const [date,raw] of secondByDate){
   const prior=indexByDate.get(date)||null;
   const second=raw.primary;
   const app=appByDate.get(date)?.app||prior?.app||null;
   const appCommCount=Array.isArray(app?.commemorations)?app.commemorations.length:app?.commemorationCount??0;
   const alternatives=raw.candidates.slice(1);
   const secondaryColour=second?.colour;
   const secondaryRank=second?.rank;
   const finding={date,source:url,secondary:{title:second.title,rank:secondaryRank,colour:secondaryColour,commemorations:second.commemorations,
    alternativeMasses:alternatives.length},priorStatus:prior?.status||'primary_compatible',
    app:app?{title:app.title,rank:app.rank,colour:app.colour,commemorationCount:appCommCount}:null,
    firstSource:prior?.independent||null,
    review:null};
   const matchesPrimary=sourceMatch(app,second),matchesAlternative=alternatives.some(x=>sourceMatch(app,x));
   if(!matchesPrimary){
     if(matchesAlternative){counters.secondaryAlternativeMatchesApp++;finding.alternativeWarning='App may use an allowed secondary Mass';}
     else {
       counters.secondaryNewConflicts++;
       finding.secondaryConflict={expected:{rank:second.rank,colour:second.colour},actual:{rank:app?.rank,colour:app?.colour}};
       if(!prior||prior.status==='compatible')counters.secondaryDisagreesOnFirstSourceCompatible++;
     }
   }
   if(prior?.status==='needs_editorial_review'){
     const generic=/^feria$|^saturday mass|^saturday$/i.test(String(app?.title||''));
     if(generic&&/^Feria:|Blessed Virgin Mary on Saturday/i.test(String(second.title||'')))counters.editorialGenericFeria++;
     else counters.editorialNamesStillToReview++;
     const commSecond=Boolean(String(second.commemorations||'').trim());
     const commApp=appCommCount>0;
     if(commSecond!==commApp){
       counters.editorialCommemorationPresenceMismatch++;
       finding.commemorationWarning={app:appCommCount,secondaryText:second.commemorations};
     }
   }
   if(prior?.status==='oracle_unrecorded'){
    counters.primaryMissing++;
    finding.review=sourceMatch(app,second)?'secondary_supports_app_on_primary_blank':'secondary_needs_comparison_or_app_unavailable';
    if(finding.review==='secondary_supports_app_on_primary_blank')counters.secondaryFillsPrimaryGap++;
   }else if(prior?.status==='needs_editorial_review'){
    counters.primaryNeedsEditorial++;
    finding.review=sourceMatch(app,second)?'secondary_agrees_on_class_colour_editorial_still_open':'secondary_class_colour_disagreement';
    if(finding.review==='secondary_agrees_on_class_colour_editorial_still_open')counters.secondaryCorroboratesAppForEditorial++;
    else counters.secondaryConflictsAppForEditorial++;
   }else if(prior?.status==='source_disputed'){
    counters.disputedPrimary++;
    const appColour=normColour(app?.colour),firstColour=normColour(prior?.independent?.colour);
    finding.review=normColour(secondaryColour)===appColour?'secondary_agrees_with_app':
      normColour(secondaryColour)===firstColour?'secondary_agrees_with_first_oracle':'three_way_or_missing';
    if(finding.review==='secondary_agrees_with_app')counters.secondaryAgreesAppInDispute++;
    if(finding.review==='secondary_agrees_with_first_oracle')counters.secondaryAgreesPrimaryInDispute++;
   }
   if(prior?.status==='source_disputed'||prior?.status==='oracle_unrecorded'||prior?.status==='needs_editorial_review'||finding.secondaryConflict)
    report.findings.push(finding);
  }
  report.years.push({year,status:'SECONDARY_COMPARISON_NOT_CERTIFICATION',...counters,
   secondaryDates:data.length,secondaryPrimaryEntries:data.filter(x=>x.primary).length,
   secondaryAlternativeMasses:data.reduce((sum,x)=>sum+Math.max(0,x.candidates.length-1),0),source:url});
  console.log('SECONDARY_1962_YEAR '+year+' '+JSON.stringify(report.years.at(-1)));
  console.log('SECONDARY_1962_EXAMPLES '+year+' '+JSON.stringify(report.findings.filter(x=>x.date.startsWith(String(year))).slice(0,8)));
  console.log('SECONDARY_1962_DISPUTES '+year+' '+JSON.stringify(report.findings.filter(x=>x.date.startsWith(String(year))&&x.priorStatus==='source_disputed')));
  console.log('SECONDARY_1962_GAP_CONFLICTS '+year+' '+JSON.stringify(report.findings.filter(x=>x.date.startsWith(String(year))&&x.priorStatus==='oracle_unrecorded'&&x.review!=='secondary_supports_app_on_primary_blank')));
  console.log('SECONDARY_1962_NEW_CONFLICTS '+year+' '+JSON.stringify(report.findings.filter(x=>x.date.startsWith(String(year))&&x.secondaryConflict).slice(0,35)));
  console.log('SECONDARY_1962_COMM_WARNING '+year+' '+JSON.stringify(report.findings.filter(x=>x.date.startsWith(String(year))&&x.commemorationWarning).slice(0,50)));
 }
}finally{
 await writeFile(new URL('artifacts/calendar-1962-secondary-reconciliation.json',root),JSON.stringify(report,null,2)+'\n');
 await browser?.close();
}
if(report.failures.length||report.years.length!==2)process.exitCode=2;

if(report.years.some(x=>x.secondaryNewConflicts>2))process.exitCode=3;
