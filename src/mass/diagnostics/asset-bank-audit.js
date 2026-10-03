
(()=>{
 const refs=[...new Set(Array.from(document.querySelectorAll('[data-icon-semantic]')).map(x=>x.dataset.iconSemantic).filter(Boolean))];
 const unresolved=refs.filter(s=>!window.aoResolveIconRef('SEM:'+s));
 window.AO_V46_BANK_AUDIT={version:'4.6.0',embedded_assets:window.AO_ICON_BANK_META?.embedded_asset_count||0,semantic_bindings:window.AO_ICON_BANK_META?.semantic_count||0,visible_semantics:refs.length,unresolved};
})();
