#!/usr/bin/env node
// Research-only browser/mobile acquisition QA. NEVER infers photo licensing or user approval.
// On CI: npm install --no-package-lock --ignore-scripts --no-audit --no-fund && npx playwright install --with-deps chromium && node tests/sacred-art-mobile-photo-e2e.mjs
// Output: artifacts/sacred-art-mobile-qa/report.json + small 390px mobile screenshots.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const galleryPath=resolve('docs/research/review-galleries/ao-sacred-art-unified-curator-20261016.html');
const output=resolve('artifacts/sacred-art-mobile-qa');
mkdirSync(output,{recursive:true});
const html=readFileSync(galleryPath,'utf8');
const marker='<script type="application/json" id="model-data">';
const from=html.indexOf(marker),to=html.indexOf('</script>',from);
assert.ok(from>=0&&to>from,'Source gallery embeds model-data');
const data=JSON.parse(html.slice(from+marker.length,to));
const categories=data.categories,photos=categories.flatMap(c=>c.works.flatMap(w=>w.photos.map(p=>({
  categoryIndex:c.index,categoryId:c.id,subject:c.label,workId:w.id,photoId:p.id,
  preview:p.preview,original:p.original,sourcePage:p.page,sourceStatus:p.status||'',sourceRights:p.rights||''
}))));
const distinct=[...new Map(photos.map(p=>[p.preview,p])).values()];
const fullRemoteAudit=process.env.AO_ART_REMOTE_AUDIT==='full';
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const pageErrors=[];
page.on('pageerror',err=>pageErrors.push(String(err).slice(0,500)));
const remoteHTTPErrors=[],remoteRequestFailures=[];
page.on('response',res=>{
  const status=res.status(),url=res.url();
  if(status>=400 && /^https?:/.test(url))remoteHTTPErrors.push({status,url});
});
page.on('requestfailed',request=>{
  const url=request.url();
  if(/^https?:/.test(url)){
    const failure=request.failure();
    remoteRequestFailures.push({url,reason:typeof failure==='string'?failure:(failure?.errorText||JSON.stringify(failure)||'unknown')});
  }
});
const outcome={schema:'AO_SACRED_ART_390PX_REMOTE_PREVIEW_QA_V1',researchOnly:true,mode:fullRemoteAudit?'full-remote':'layout-only',
  testedAt:new Date().toISOString(),viewport:{width:390,height:844},
  categories:categories.length,categoryWithLinkedPreview:categories.filter(c=>c.works.some(w=>w.photos.length)).length,
  photoEntries:photos.length,distinctPreviewURLs:distinct.length,
  owner:'draft PR #887 only',ratingOrSelectedStatusChanged:false,productionPhotoRightsCertified:false,
  browserLoadChecks:{},networkDiagnostics:{httpErrors:remoteHTTPErrors,requestFailures:remoteRequestFailures},layoutChecks:[],broken:[],primaryFailures:[],recoveredViaFallback:[],unavailable:[],pageErrors,notes:[
    'A linked URL does not establish an image byte acquisition, complete painted surface or reusable app rights.',
    'Network errors from Commons or institutional servers require a human retry; never infer a painting rejection.',
    'All mobile images must be contain-fit and show the full painted surface, not clipped or stretched.'
  ]};
try {
  await page.goto(pathToFileURL(galleryPath).href,{waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForSelector('.imageframe img',{timeout:20000});
  await page.evaluate(()=>{
    const filter=document.getElementById('filter');
    if(filter){filter.value='all';filter.dispatchEvent(new Event('change',{bubbles:true}));}
  });
  const mobileIndices=[1,6,11,12,13,25,29,43,81,103,107,113,129,135,139,142,152,154,157,164,167];
  for(const index of mobileIndices){
    const c=categories.find(c=>c.index===index);
    await page.evaluate(id=>{
      const item=[...document.querySelectorAll('[data-action="goto"]')].find(x=>x.dataset.cat===id);
      if(item)item.click();
    },c.id);
    await page.waitForTimeout(100);
    const view=await page.evaluate(()=>{
      const image=document.querySelector('main .imageframe img');
      if(!image)return {photoPresent:false};
      const rect=image.getBoundingClientRect();
      const frame=image.closest('.imageframe').getBoundingClientRect();
      const grid=image.closest('.photogrid');
      const gridCols=grid?getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length:0;
      const fallback=image.dataset.fallback||'';
      const fallbackIsBounded=!fallback || !fallback.includes('commons.wikimedia.org/wiki/Special:FilePath/') || /[?&]width=500(?:&|$)/.test(fallback);
      return {photoPresent:true,objectFit:getComputedStyle(image).objectFit,
        boundedPreviewFallback:fallbackIsBounded,
        photoGridColumns:gridCols,
        imageBoxWidth:Math.round(rect.width),frameWidth:Math.round(frame.width),
        imageBoxHeight:Math.round(rect.height),frameHeight:Math.round(frame.height),
        docWidth:document.documentElement.scrollWidth,windowWidth:innerWidth,
        firstImageSource:image.getAttribute('src')};
    });
    outcome.layoutChecks.push({index,subject:c.label,...view,
      containFit:view.objectFit==='contain',
      singlePhotoColumn:!view.photoPresent||view.photoGridColumns===1,
      enoughMobilePaintingSpace:!view.photoPresent||view.frameHeight>=300,
      noImageFrameOverflow:!view.photoPresent||(view.imageBoxWidth<=view.frameWidth+2 &&
        view.imageBoxHeight<=view.frameHeight+2)});
    if([1,11,103,135,142,152].includes(index)){
      try{
        // Capture the actual painting review card, not the page header after render() scrolls to top.
        const card=page.locator('main .photo').first();
        await card.scrollIntoViewIfNeeded({timeout:12000});
        await page.waitForTimeout(750); // Allow newly visible lazy-loaded thumbnail to start decoding.
        await card.screenshot({path:output+'/mobile-'+String(index).padStart(3,'0')+'.png',animations:'disabled',timeout:12000});
      }
      catch(err){outcome.notes.push('Screenshot '+index+': '+String(err).slice(0,120));}
    }
  }

  if(fullRemoteAudit){
  // Actual browser decode for supported-size previews and bounded gallery fallback.
  // A 500px Commons retry is always distinguished from a successful primary load.
  const batchSize=3;
  for(let offset=0;offset<distinct.length;offset+=batchSize){
    const batch=distinct.slice(offset,offset+batchSize);
    const results=await page.evaluate(async rows=>Promise.all(rows.map(async row=>{
      const decode=url=>new Promise(done=>{
        const im=new Image();im.referrerPolicy='no-referrer';im.decoding='async';
        let settled=false;
        const finish=(ok,reason)=>{
          if(settled)return;settled=true;clearTimeout(timer);
          done({ok,reason,width:ok?im.naturalWidth:0,height:ok?im.naturalHeight:0});
        };
        const timer=setTimeout(()=>finish(false,'timeout_14s'),14000);
        im.onload=()=>finish(im.naturalWidth>0,'loaded');
        im.onerror=()=>finish(false,'image_error_or_http_failure');
        im.src=url;
      });
      const primary=await decode(row.preview);
      const commons=(row.original||row.preview).startsWith('https://commons.wikimedia.org/wiki/Special:FilePath/');
      const fallback=commons?(row.original||row.preview).split('?')[0]+'?width=500':null;
      const retryEligible=!primary.ok && fallback && fallback!==row.preview;
      const retry=retryEligible?await decode(fallback):null;
      const actual=primary.ok?primary:(retry?.ok?retry:primary);
      return {categoryIndex:row.categoryIndex,subject:row.subject,photoId:row.photoId,
        sourcePage:row.sourcePage,preview:row.preview,ok:actual.ok,
        reason:actual.ok?(primary.ok?'primary_loaded':'500px_fallback_loaded'):(retry?.reason||primary.reason),
        width:actual.width,height:actual.height,primaryOk:primary.ok,primaryReason:primary.reason,
        fallbackTried:Boolean(retryEligible),fallbackOk:retry?.ok??null,
        fallbackURL:retryEligible?fallback:null};
    })),batch);
    for(const r of results){
      if(!r.ok)outcome.broken.push(r);
      else if(r.width<300||r.height<300)outcome.unavailable.push({...r,reason:'tiny_preview_requires_photo_quality_review'});
      if(!r.primaryOk)outcome.primaryFailures.push(r);
      if(r.reason==='500px_fallback_loaded')outcome.recoveredViaFallback.push(r);
    }
    if((offset+batch.length)%32===0)process.stdout.write('Checked '+(offset+batch.length)+'/'+distinct.length+' source preview URLs\n');
    await page.waitForTimeout(220);
  }
  outcome.browserLoadChecks={primarySuccessful:distinct.length-outcome.primaryFailures.length,
    recoveredViaFallback:outcome.recoveredViaFallback.length,
    successful:distinct.length-outcome.broken.length,
    failures:outcome.broken.length,undersizeMobileCandidates:outcome.unavailable.length,
    note:'Failures may include external 403/429/network outages; retry before treating as an invalid artwork.'};
  }else{
    outcome.browserLoadChecks={skipped:true,reason:'Full 224-URL external test runs only via GitHub workflow_dispatch to avoid repeated remote-host throttling.'};
  }
  const badLayout=outcome.layoutChecks.filter(x=>x.photoPresent&&(!x.containFit||!x.singlePhotoColumn||!x.enoughMobilePaintingSpace||!x.noImageFrameOverflow||!x.boundedPreviewFallback));
  outcome.layoutFailures=badLayout;
  if(pageErrors.length)outcome.notes.push('Gallery JavaScript raised errors; review pageErrors.');
  writeFileSync(output+'/report.json',JSON.stringify(outcome,null,2)+'\n');
  writeFileSync(output+'/primary-failures.tsv',
    'categoryIndex\tphotoId\tprimaryReason\tfallbackTried\tfallbackOk\tpreview\tfallbackURL\n'+outcome.primaryFailures.map(p=>
      [p.categoryIndex,p.photoId,p.primaryReason,p.fallbackTried,p.fallbackOk,p.preview,p.fallbackURL].join('\t')).join('\n')+'\n');
  writeFileSync(output+'/broken-previews.tsv',
    'categoryIndex\tsubject\tphotoId\treason\tpreview\tsourcePage\n'+outcome.broken.map(p=>
      [p.categoryIndex,p.subject,p.photoId,p.reason,p.preview,p.sourcePage].join('\t')).join('\n')+'\n');
  process.stdout.write(JSON.stringify({linked:outcome.categoryWithLinkedPreview,remote:outcome.browserLoadChecks,
    layoutFailures:badLayout.length,pageErrors:pageErrors.length,
    httpStatuses:remoteHTTPErrors.reduce((acc,x)=>(acc[x.status]=(acc[x.status]||0)+1,acc),{}),
    report:output+'/report.json'})+'\n');
  assert.equal(categories.length,168,'Category count drifted');
  assert.ok(outcome.categoryWithLinkedPreview===168,'Source-linked categories regressed');
  assert.deepEqual(badLayout,[],'390px contain-fit or frame overflow regression');
  assert.deepEqual(pageErrors,[],'Gallery runtime JavaScript errors');
  // External image failures are evidence, not a flaky CI failure: captured in report.
}finally{await browser.close();}
