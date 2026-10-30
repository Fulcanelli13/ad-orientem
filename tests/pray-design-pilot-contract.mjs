import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 PRAYER_DESIGN_PILOT_SCHEMA,prayerPilotEnabled,prayerPilotAliases,resolvedPrayerPilotFamilies,
 renderPilotDiscovery,renderPilotAngelusEntry
} from "../src/pray/prayer-design-pilot.js";

assert.equal(PRAYER_DESIGN_PILOT_SCHEMA,"ao-prayer-discovery-angelus-pilot-v1");
assert.equal(prayerPilotEnabled({location:{search:""}}),true);
assert.equal(prayerPilotEnabled({location:{search:"?from=home"}}),true);
assert.equal(prayerPilotEnabled({location:{search:"?aoPrayerPilot=1"}}),true);
assert.equal(prayerPilotEnabled({location:{search:"?aoPrayerPilot=0"}}),false);

const L=(en,fr)=>en;
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const families={
 daily:{title:"Daily Prayer",assetId:"ao-rich-begin-end-day",items:[["own","pray.angelus_regina","Angelus","Hourly prayer"]]},
 chaplets:{title:"Rosary & Chaplets",assetId:"ao-rich-rosary",items:[["own","pray.rosary","Rosary","Bead reader"]]},
 eucharistic:{title:"Holy Eucharist",assetId:"ao-rich-adoration",items:[]},
 library:{title:"Prayer Library",assetId:"ao-rich-prayer-library",direct:"pray.library",items:[]}
};
const aliases=prayerPilotAliases(L);
assert.deepEqual(Object.keys(aliases).sort(),["intentions","marian","novenas","ourlord","saints"]);
const bridged=resolvedPrayerPilotFamilies(L,{
 ...families,
 penance:{items:[["own","pray.confession","Confession","Prepare"],["own","pray.penitential_psalms","Seven Penitential Psalms","Source prayer"]]},
 passion:{items:[["own","pray.stations","Stations","Fourteen"],["own","pray.tenebrae","Office of Tenebrae","Triduum"]]},
 devotions:{items:[["external","pray.novenas","Novenas","Source"],["external","pray.holy_name_litany","Holy Name","Litany"]]}
});
for(const [door,route] of [["intentions","pray.penitential_psalms"],["ourlord","pray.tenebrae"],["novenas","pray.holy_name_litany"]]){
 assert.ok(bridged[door].items.some(item=>item[1]===route),"Nine-door discovery buried original route "+route);
}
assert.equal(bridged.ourlord.items.filter(item=>item[1]==="pray.stations").length,1);
assert.equal(bridged.novenas.items.filter(item=>item[1]==="pray.novenas").length,1);
const actual=renderPilotDiscovery({
 head:title=>"<header>"+title+"</header>",L,esc,DATA:{prayers:{foundations_hail_mary:{title:"Hail Mary",titleFr:"Je vous salue Marie"}}},
 families,assetIcon:(_name,cls)=>"<span class='"+cls+"'></span>"
});
assert.equal((actual.match(/class="aoPrayPilotTile(?: aoPrayPilotLarge)?"/g)||[]).length,9,"nine live mosaic doors");
for(const id of ["chaplets","marian","daily","novenas","eucharistic","ourlord","saints","intentions"])
 assert.match(actual,new RegExp('data-p435930-family="'+id+'"'));
assert.match(actual,/data-p435930-own="pray.library"/);
assert.match(actual,/data-p435930-pilot-prayer="foundations_hail_mary"/);
assert.match(actual,/data-p435930-pilot-search/);
assert.equal((actual.match(/data-p435930-pilot-facet="/g)||[]).length,5,"R1.1 has four form filters plus Latin availability");
assert.match(actual,/data-pilot-form="prayer"/);
assert.match(actual,/data-pilot-latin="false"/);
assert.doesNotMatch(actual,/Pilot: approved paintings/,"public Prayer hub must not display prototype implementation notes");

const angelus=renderPilotAngelusEntry({
 head:title=>"<header>"+title+"</header>",L,esc,form:"angelus",posture:"Kneel · ordinary days",moduleIcon:()=>"<i></i>"
});
const regina=renderPilotAngelusEntry({
 head:title=>"<header>"+title+"</header>",L,esc,form:"regina",posture:"Stand · Eastertide",moduleIcon:()=>"<i></i>"
});
assert.match(angelus,/data-p435930-pilot-angelus-begin/);
for(const mode of ["individual","group"])assert.match(angelus,new RegExp('data-p435930-pilot-angelus-recitation="'+mode+'"'));
assert.match(angelus,/aria-pressed="true">Alone/,"Individual is the default presentation");
assert.match(angelus,/Angelus/);
assert.match(regina,/Regina Cæli/);
assert.doesNotMatch(angelus,/data-ao-incarnation/,"the presentation does not invent canonical prayer units");

const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED\)return renderPilotDiscovery/);
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED&&ANGELUS_PILOT_ENTRY\)/);
assert.match(runtime,/ANGELUS_PILOT_ENTRY=false;\s*return render\(\)/);
assert.match(runtime,/function angelusExactPosture\(\)/,"the real posture owner remains");
assert.match(runtime,/installAngelusCardDeck\(/,"the real five\/four-card engine remains");
assert.match(runtime,/if\(PRAYER_PILOT_ENABLED&&x.matches\('\[data-p435930-pilot-search\]'\)\)/);
console.log("Prayer presentation pilot source contract: passed");
