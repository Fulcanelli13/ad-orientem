import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  parseLiturgicalSpeakerPrefix,
  decorateLiturgicalSpeaker,
  LITURGICAL_SPEAKER_ROLES,
} from "../src/app/liturgical-speakers.js";

const expected=[
  ["℣. Dóminus vobíscum.","versicle","℣."],
  ["℟. Et cum spíritu tuo.","response","℟."],
  ["V. Dóminus vobíscum.","versicle","V."],
  ["R. Et cum spíritu tuo.","response","R."],
  ["M. Introíbo ad altáre Dei.","minister","M."],
  ["S. Ad Deum, qui lætíficat iuventútem meam.","server","S."],
  ["  ℣. Dóminus exáudi.","versicle","℣."],
  ["℟ Et cum spíritu tuo.","response","℟"],
];
assert.equal(Object.keys(LITURGICAL_SPEAKER_ROLES).length,6);
for(const [original,role,mark] of expected){
 const p=parseLiturgicalSpeakerPrefix(original);
 assert.ok(p,"missing printed role "+original);
 assert.equal(p.role,role);
 assert.equal(p.mark,mark);
 assert.equal(p.leading+p.mark+p.separator+p.text,original,"source text was rewritten");
}
for(const original of ["Mary, Mother of God","Sanctus, Sanctus, Sanctus","Responsum","Veni Creator","S.Thomas","M.D."]){
 assert.equal(parseLiturgicalSpeakerPrefix(original),null,"prose misread as a speaker: "+original);
}

function makeNode(original){
 const doc={
  createTextNode(text){return {nodeType:3,textContent:String(text)};},
  createElement(tag){return {nodeType:1,tagName:tag,dataset:{},className:"",textContent:""};},
 };
 const node={
  ownerDocument:doc,dataset:{},children:[doc.createTextNode(original)],
  get firstChild(){return this.children[0]??null;},
  get textContent(){return this.children.map(x=>x.textContent??"").join("");},
  insertBefore(value,ref){
   const index=this.children.indexOf(ref);
   assert.notEqual(index,-1);
   this.children.splice(index,0,value);
  },
  removeChild(child){
   const index=this.children.indexOf(child);
   assert.notEqual(index,-1);this.children.splice(index,1);
  },
 };
 return node;
}
for(const [source,role,mark] of expected){
 const node=makeNode(source);
 assert.equal(decorateLiturgicalSpeaker(node,source),true);
 assert.equal(node.textContent,source,"rendered text must exactly match the source");
 assert.equal(node.dataset.aoSpeakerRole,role);
 const label=node.children.find(x=>x.className==="ao-liturgical-speaker");
 assert.ok(label);
 assert.equal(label.textContent,mark);
 assert.equal(label.dataset.aoSpeakerRole,role);
 // A second call cannot duplicate an existing speaker span.
 assert.equal(decorateLiturgicalSpeaker(node,source),false);
 assert.equal(node.textContent,source);
}
const plain=makeNode("Dóminus vobíscum.");
assert.equal(decorateLiturgicalSpeaker(plain,"Dóminus vobíscum."),false);
assert.equal(plain.textContent,"Dóminus vobíscum.");
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const [design,mass,pray,prayStyle,learn]=[
 "src/app/design-system.js","src/mass/reader-dom.js",
 "src/pray/presentation-runtime.js","src/pray/presentation-styles.js",
 "src/learn/traditional-life.js",
].map(read);
for(const token of ["--ao-font-display","--ao-font-body","--ao-font-liturgical","--ao-type-prayer","--ao-type-prose","--ao-type-speaker-weight"]){
 assert.ok(design.includes(token),"shared typography token absent: "+token);
}
assert.match(design,/\.ao-liturgical-speaker\s*\{/);
assert.match(design,/font-family:inherit!important/);
assert.match(design,/\.aoCSEAnswer/);
assert.match(mass,/import \{ decorateLiturgicalSpeaker \} from "\.\.\/app\/liturgical-speakers\.js";/);
assert.match(mass,/decorateLiturgicalSpeaker\(target,raw\)/);
assert.match(mass,/decorateLiturgicalSpeaker\(secondary,p\.secondary\)/);
assert.match(pray,/aoAngelusDialogueLine \$\{part\.role\}/);
assert.match(pray,/aoP435930VRLine \$\{role\}/);
assert.equal((pray.match(/class="ao-liturgical-speaker"/g)||[]).length,2,"Angelus and Stations must share exactly one speaker class each");
assert.match(prayStyle,/aoAngelusDialogueLine>\.ao-liturgical-speaker/);
assert.match(prayStyle,/aoP435930VRLine>\.ao-liturgical-speaker/);
assert.match(learn,/parseLiturgicalSpeakerPrefix/);
assert.match(learn,/aoLearnTradPrompt">\$\{speakerText\(/);
assert.match(learn,/aoLearnTradAnswer"><strong>\$\{speakerText\(x\.lat\)/);
console.log("PASS liturgical speaker typography: 8 source-faithful variants, Mass/Prayer/Formation role parity and design tokens");
