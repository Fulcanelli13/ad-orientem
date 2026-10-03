
/* AO.Audit — semantic icon audit; reports without substituting artwork. */
(function(){
 function audit(){
  const semRefs=[...new Set(Array.from(document.querySelectorAll('[data-icon-semantic]')).map(x=>x.dataset.iconSemantic).filter(Boolean))];
  const unresolved=semRefs.filter(s=>!aoResolveIconRef('SEM:'+s));
  const legacyActive=Array.from(document.querySelectorAll('img.asset-icon[src^="data:"], .icon-fallback')).filter(x=>x.offsetParent!==null);
  window.AO_ICON_AUDIT={version:'v2.2',semantic_refs:semRefs.length,unresolved,visible_legacy_or_fallback_count:legacyActive.length};
  if(unresolved.length)console.warn('V4.6 unresolved semantic icons',unresolved);
 }
 requestAnimationFrame(()=>setTimeout(audit,0));
})();
