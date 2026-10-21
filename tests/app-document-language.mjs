import assert from "node:assert/strict";
import { documentLanguageFor, installDocumentLanguage } from "../src/app/document-language.js";

assert.equal(documentLanguageFor({language:"fr"}),"fr");
assert.equal(documentLanguageFor({language:"en"}),"en");
assert.equal(documentLanguageFor({}),"en");

const attrs={lang:"en"};
const html={getAttribute:name=>attrs[name]??null,setAttribute:(name,value)=>{attrs[name]=String(value);}};
let state={language:"en"};const listeners=new Set();
const store={getState:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
const win={document:{documentElement:html},AO_RUNTIME_V8:{store}};
const api=installDocumentLanguage({win});
assert.equal(attrs.lang,"en");
state={language:"fr"};for(const fn of listeners)fn(state);
assert.equal(attrs.lang,"fr","French UI must set <html lang=fr>");
api.dispose();
assert.equal(listeners.size,0,"dispose must release the store subscription");
assert.equal(win.AO_DOCUMENT_LANGUAGE_V1,undefined);
console.log("Document language follows the app language: OK");
