/**
 * Source-preserving typography for the four printed dialogue marks.
 *
 * V./R. are versicle/response marks (including ℣./℟. witnesses).
 * M./S. remain minister/server as printed; never infer or rewrite
 * speakers from a section's context or from translated text.
 */
export const LITURGICAL_SPEAKER_ROLES=Object.freeze({
  "℣":"versicle","V":"versicle",
  "℟":"response","R":"response",
  "M":"minister","S":"server",
});
export function parseLiturgicalSpeakerPrefix(value){
  const raw=String(value??"");
  const found=/^(\s*)(℣\.?|℟\.?|[VRMS]\.)(?=\s|$)([ \t]*)/u.exec(raw);
  if(!found)return null;
  const mark=found[2],role=LITURGICAL_SPEAKER_ROLES[mark[0]];
  if(!role)return null;
  return Object.freeze({
    role,mark,leading:found[1],separator:found[3],
    prefix:found[0],text:raw.slice(found[0].length),
  });
}
/**
 * Decorates only a leading source text-node. No role reinterpretation,
 * transliteration or innerHTML, and no alteration to textContent.
 * May be called again after an in-place LIVE gesture or translation update.
 */
export function decorateLiturgicalSpeaker(node,original){
  const parsed=parseLiturgicalSpeakerPrefix(original);
  if(!parsed||!node?.ownerDocument?.createElement)return false;
  const first=node.firstChild;
  if(first?.nodeType!==3||!String(first.textContent??"").startsWith(parsed.prefix))return false;
  const doc=node.ownerDocument;
  const label=doc.createElement("span");
  label.className="ao-liturgical-speaker";
  label.dataset.aoSpeakerRole=parsed.role;
  label.textContent=parsed.mark;
  const trailing=String(first.textContent).slice(parsed.prefix.length);
  const prefixNode=parsed.leading?doc.createTextNode(parsed.leading):null;
  const after=doc.createTextNode(parsed.separator+trailing);
  if(prefixNode)node.insertBefore(prefixNode,first);
  node.insertBefore(label,first);
  node.insertBefore(after,first);
  node.removeChild(first);
  if(node.dataset)node.dataset.aoSpeakerRole=parsed.role;
  return true;
}
