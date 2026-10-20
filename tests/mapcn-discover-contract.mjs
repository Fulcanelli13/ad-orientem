import assert from "node:assert/strict";
import {test} from "node:test";
import {renderMapcnDiscoverRail} from "../src/find/mapcn-discover-rail.js";
const makeItem=(id,lat=44)=>({place_id:id,map_publishable:true,geo:{lat,lng:2,precision:"site"},
  title:id,subtitle:"France",heritage_primary:"shrines"});
const makeProfile=(id,withPhoto=false)=>({place_id:id,name:"Shrine "+id,
  place_type:"shrine",address:{city:"Lourdes",country:"France"},
  media:withPhoto?{asset_path:"/assets/approved.jpg",alt_en:"Approved facade",
    credit:"Photographer",license:"CC BY-SA"}:null});
test("Only approved map-publishable canonical Places appear once",()=>{
 const html=renderMapcnDiscoverRail({language:"en",
  items:[makeItem("place:one"),makeItem("place:one"),makeItem("place:unmapped",null),
    {...makeItem("place:hidden"),map_publishable:false}],
  placeProfiles:[makeProfile("place:one")]});
 assert.equal((html.match(/data-explore-open-place=/g)||[]).length,1);
 assert.match(html,/data-explore-open-place="place:one"/);
 assert.doesNotMatch(html,/place:unmapped|place:hidden/);
 assert.doesNotMatch(html,/latitude|longitude|new maplibre/);
});
test("Photographs require approved media and preserve source identity",()=>{
 const html=renderMapcnDiscoverRail({language:"fr",items:[makeItem("place:photo")],
   placeProfiles:[makeProfile("place:photo",true)],filters:{mapcnDiscoverLimit:36}});
 assert.match(html,/src="\/assets\/approved.jpg"/);
 assert.match(html,/Lourdes · France/);
 assert.match(html,/data-explore-open-place="place:photo"/);
 assert.match(html,/Explorer les lieux/);
});
test("Hostile source fields are escaped and plain place names are not treated as HTML",()=>{
 const html=renderMapcnDiscoverRail({language:"en",
  items:[{...makeItem("place:malicious"),title:'<img src=x onerror=alert(1)>'}],
  placeProfiles:[]});
 assert.doesNotMatch(html,/<img src=x onerror/);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
});
test("Discovery grows progressively but never produces unbounded page lists",()=>{
 const items=Array.from({length:220},(_,i)=>makeItem("place:"+String(i).padStart(3,"0")));
 const html=renderMapcnDiscoverRail({language:"en",items,
   placeProfiles:[],filters:{mapcnDiscoverLimit:999}});
 assert.equal((html.match(/data-explore-open-place=/g)||[]).length,180);
 assert.match(html,/data-mapcn-discover-more/);
});
