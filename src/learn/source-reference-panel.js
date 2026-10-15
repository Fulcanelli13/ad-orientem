/**
 * A presentation-only adapter. It never changes claim ownership, source
 * identity, authority, text, rights, or editorial publication status.
 * Curated reading IDs are explicit; no research URL is promoted automatically.
 */
export const SOURCE_REFERENCE_PANEL_VERSION="source-reference-panel-v1";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const label=(fr,en,french)=>fr?french:en;
const getSource=(registry,id)=>registry instanceof Map?registry.get(id):registry?.[id];
const unique=items=>[...new Set(items||[])];
export function sourceReferenceSafeUrl(input){
  try {
    const url=new URL(String(input||""));
    return url.protocol==="https:"&&!url.username&&!url.password?url.href:"";
  } catch {return "";}
}
export function sourceReferencePanelCss(){
  return [
    ".aoReferencePanel{margin:24px 0 10px;border-top:1px solid var(--ao-rule,rgba(255,255,255,.14));padding-top:10px;font:400 max(13px,.8125rem)/1.5 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoReferencePanel summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:var(--ao-text-muted,#a9a5a0);font:500 max(13px,.8125rem)/1.4 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoReferencePanel summary:focus-visible,.aoReferencePanel a:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}",
    ".aoReferencePanel[open]>summary{color:var(--liturgical,#c9ad78)}",
    ".aoReferencePanel h3{margin:17px 0 7px;font:600 .79rem/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-primary,#e9e4d9)}",
    ".aoReferencePanel ul,.aoReferencePanel ol{margin:0;padding-left:22px}.aoReferencePanel li{margin:9px 0;overflow-wrap:anywhere}",
    ".aoReferencePanel a{color:var(--liturgical,#c9ad78);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}",
    ".aoReferencePanel .aoRefExcerpt{display:block;color:var(--ao-text-muted,#a9a5a0);margin:0 0 3px}",
    ".aoReferencePanel .aoRefSourceList{display:block;line-height:1.6}.aoReferencePanel .aoRefSourceList>a,.aoReferencePanel .aoRefSourceList>span{display:inline;overflow-wrap:anywhere}",
    ".aoReferencePanel .aoRefSourceList>span+span:before,.aoReferencePanel .aoRefSourceList>a+span:before,.aoReferencePanel .aoRefSourceList>span+a:before,.aoReferencePanel .aoRefSourceList>a+a:before{content:' · ';color:var(--ao-text-muted,#a9a5a0)}",
    ".aoReferencePanel .aoRefHold{color:var(--ao-text-muted,#a9a5a0);font-style:italic}",
    ".aoReferencePanel .aoRefEvidence{margin:12px 0}.aoReferencePanel .aoRefEvidence>summary{min-height:42px}",
    ".aoReferencePanel .aoRefEditorialNote{margin:7px 0 12px;color:var(--ao-text-muted,#a9a5a0);font:.73rem/1.5 var(--ao-font-ui,system-ui,sans-serif)}"
  ].join("");
}
function sourceMarkup(id,registry,french){
  const source=getSource(registry,id);
  const url=sourceReferenceSafeUrl(source?.canonical_url||source?.url);
  const name=esc(source?.display_title||source?.title||id);
  return url
    ?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" data-ao-reference-id="'+esc(id)+'">'+name+' ↗</a>'
    :'<span class="aoRefHold" data-ao-reference-hold="'+esc(id)+'">'+esc(label(french,"Unverified reference","Référence non vérifiée"))+': '+esc(id)+'</span>';
}
function excerptText(input){
  const text=String(input??"").replace(/\s+/g," ").trim();
  return text.length>124?text.slice(0,121)+"…":text;
}
/**
 * rows: [{id, text, sourceIds}], registry: {sourceId: {title, url}}
 * The evidence list is complete and maintains one-to-many row/source links.
 * Further reading is an optional, explicitly curated subset of cited sources.
 */
export function sourceReferencePanelHtml({rows=[],registry={},french=false,furtherReadingIds=[],idPrefix="ao-ref"}={}){
  if(!rows.length)return "";
  const full=rows.map((row,index)=>{
    const ids=unique(row.sourceIds);
    const refs=ids.length?ids.map(id=>sourceMarkup(id,registry,french)).join(" ")
      :'<span class="aoRefHold" data-ao-reference-hold="missing">'+
        esc(label(french,"No documentary source attached — editorial review required","Aucune source documentaire — vérification éditoriale requise"))+'</span>';
    return '<li data-ao-evidence-row="'+esc(row.id||String(index+1))+'">'+
      '<span class="aoRefExcerpt">'+esc(excerptText(row.text))+'</span>'+
      '<div class="aoRefSourceList">'+refs+'</div></li>';
  }).join("");
  const cited=new Set(rows.flatMap(row=>row.sourceIds||[]));
  const featured=unique(furtherReadingIds).filter(id=>cited.has(id)&&sourceReferenceSafeUrl(getSource(registry,id)?.canonical_url||getSource(registry,id)?.url)).slice(0,4);
  const reading=featured.length
    ?'<h3>'+esc(label(french,"Further reading","Pour approfondir"))+'</h3><ul>'+
       featured.map(id=>'<li>'+sourceMarkup(id,registry,french)+'</li>').join("")+'</ul>'
    :"";
  const count=rows.length;
  return '<details class="aoReferencePanel" data-ao-reference-panel="'+esc(idPrefix)+'"><summary>'+
    esc(label(french,"Sources & further reading","Sources et lectures complémentaires"))+
    '</summary>'+reading+
    '<details class="aoRefEvidence"><summary>'+esc(label(french,"Evidence by paragraph","Justificatifs par paragraphe"))+
    ' · '+count+'</summary>'+
    '<p class="aoRefEditorialNote">'+esc(label(french,
       "Original source links are retained for verification. Their presence does not imply a checked edition, reproduction permission, or endorsement of an interpretation.",
       "Les liens originaux sont conservés pour vérification ; ils ne certifient ni l’édition, ni les droits de reproduction, ni une interprétation."))+'</p>'+
    '<ol>'+full+'</ol></details></details>';
}
