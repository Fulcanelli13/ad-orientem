
/* AO.TextDeclutter — detects block headings that only repeat their first canonical line. */
(()=>{
 'use strict';
 const AO=window.AO=window.AO||{};
 const strip=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .replace(/^\s*[℣℟]\.??\s*/,'').split('—')[0].split('·')[0]
   .replace(/[^a-zA-Z0-9]+/g,' ').trim().toLowerCase();
 function mark(root=document){
   root.querySelectorAll?.('.mass-block').forEach(sec=>{
     const head=sec.querySelector(':scope > .block-head');
     if(!head||head.classList.contains('expandable-prayer'))return;
     const titleNode=head.querySelector('.block-title-wrap > span:not(.order)');
     const first=sec.querySelector(':scope > .flow-unit[data-latin]');
     const title=strip(titleNode?.textContent), latin=strip(first?.dataset?.latin);
     const redundant=title.length>=4 && !!latin && (latin.startsWith(title)||(latin.length<80&&title.startsWith(latin)));
     head.classList.toggle('ao-redundant-title',redundant);
   });
 }
 const reader=document.getElementById('reader');
 if(reader&&window.MutationObserver)new MutationObserver(m=>{for(const x of m){if(x.addedNodes.length){mark(reader);break}}}).observe(reader,{childList:true,subtree:true});
 mark(reader||document);
 AO.TextDeclutter=Object.freeze({version:'2.2',owner:'TEXTUAL_REDUNDANCY',mark});
})();
