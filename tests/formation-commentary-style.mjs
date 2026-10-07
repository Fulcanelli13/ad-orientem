import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOTS=["src/learn","src/apostolate","data/learn","src/formation","src/apologetics"].filter(existsSync);
const EXTENSIONS=new Set([".js",".mjs",".json",".md"]);
const FIELD_RE=/(?:\btraditional(?:Commentary|Take|Assessment|Argument)\b|\btraditional_(?:commentary|take|assessment|argument)\b|["']traditional (?:commentary|take|assessment|argument)["'])\s*[:=]/gi;

const META_RE=/(?:the strongest objection is|the serious objection is|the classic objection is|the traditional (?:reply|response|position|commentary|take|assessment) (?:is|would say)|this (?:module|section|question|answer|commentary) (?:should|is|explains|presents|argues|exists|was written)|the point here is|the purpose of this (?:module|section|commentary)|for the user|user-facing|the source set|editorial(?:ly)?|we (?:present|include|argue|show)|the reusable method is|l’objection la plus forte est|l’objection sérieuse est|l’objection classique est|la réponse traditionnelle est|le commentaire traditionnel (?:est|dirait)|ce (?:module|chapitre|commentaire) (?:doit|est|explique|présente|argumente)|cette (?:section|question|réponse) (?:doit|est|explique|présente)|le but de ce (?:module|chapitre|commentaire)|pour l’utilisateur|destiné à l’utilisateur|éditorial(?:e|ement)?|nous (?:présentons|incluons|argumentons|montrons)|la méthode réutilisable est)/i;

function filesUnder(root){
  const out=[];
  for(const name of readdirSync(root)){
    const path=join(root,name);
    const stat=statSync(path);
    if(stat.isDirectory())out.push(...filesUnder(path));
    else if(EXTENSIONS.has(extname(path)))out.push(path);
  }
  return out;
}

function readLiteral(text,start){
  let i=start;
  while(i<text.length&&/\s/.test(text[i]))i++;
  if(i>=text.length)return "";
  const first=text[i];

  if(first==='"'||first==="'"){
    const quote=first;
    let escaped=false;
    for(let j=i+1;j<text.length;j++){
      const ch=text[j];
      if(escaped){escaped=false;continue;}
      if(ch==="\\"){escaped=true;continue;}
      if(ch===quote)return text.slice(i,j+1);
    }
    return text.slice(i);
  }

  if(first==="["||first==="{"){
    const stack=[first];
    let quote=null;
    let escaped=false;
    for(let j=i+1;j<text.length;j++){
      const ch=text[j];
      if(quote){
        if(escaped){escaped=false;continue;}
        if(ch==="\\"){escaped=true;continue;}
        if(ch===quote)quote=null;
        continue;
      }
      if(ch==='"'||ch==="'"){quote=ch;continue;}
      if(ch==="["||ch==="{"){stack.push(ch);continue;}
      if(ch==="]"||ch==="}"){
        const expected=ch==="]"?"[":"{";
        if(stack.at(-1)===expected)stack.pop();
        if(stack.length===0)return text.slice(i,j+1);
      }
    }
    return text.slice(i);
  }

  const end=text.indexOf("\n",i);
  return text.slice(i,end===-1?text.length:end);
}

const violations=[];
let checked=0;
for(const root of ROOTS){
  for(const path of filesUnder(root)){
    const text=readFileSync(path,"utf8");
    FIELD_RE.lastIndex=0;
    for(let match=FIELD_RE.exec(text);match;match=FIELD_RE.exec(text)){
      checked++;
      const value=readLiteral(text,FIELD_RE.lastIndex);
      if(META_RE.test(value)){
        const before=text.slice(0,match.index);
        const line=before.split("\n").length;
        violations.push(`${relative(".",path)}:${line} — ${match[0].trim()}`);
      }
    }
  }
}

assert.deepEqual(
  violations,
  [],
  [
    "Traditional commentary/take/assessment fields must contain the substantive Catholic argument itself, not editorial or meta narration.",
    "Move debate labels, source-method notes, module instructions, and descriptions of what ‘the traditional reply would say’ outside the user-facing commentary field.",
    ...violations,
  ].join("\n"),
);

console.log(JSON.stringify({
  roots:ROOTS,
  namedTraditionalCommentaryFieldsChecked:checked,
  metaCommentaryViolations:violations.length,
  validation:"PASS",
},null,2));
