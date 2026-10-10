import assert from "node:assert/strict";
import {createScrollTapGuard} from "../src/app/scroll-tap-guard.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {renderHeritageToString} from "../src/find/heritage-presentation.js";
class FakeDoc {
  #handlers=new Map();
  addEventListener(name,handler){const a=this.#handlers.get(name)??[];a.push(handler);this.#handlers.set(name,a)}
  removeEventListener(name,handler){this.#handlers.set(name,(this.#handlers.get(name)||[]).filter(f=>f!==handler))}
  emit(name,event){for(const f of this.#handlers.get(name)||[])f(event)}
}
const doc=new FakeDoc();
const root={contains:target=>target?.inRoot===true};
const button={inRoot:true};
const guard=createScrollTapGuard(doc,{contains:target=>root.contains(target)});
function point(x,y){return {clientX:x,clientY:y}}
function touchEvent(pts=[],changed=pts){return {target:button,touches:pts,changedTouches:changed}}
function click(x,y,detail=1){const e={target:button,clientX:x,clientY:y,detail,defaultPrevented:false,immediateStopped:false,
  preventDefault(){this.defaultPrevented=true},
  stopImmediatePropagation(){this.immediateStopped=true},
  stopPropagation(){}};
 doc.emit("click",e);return e;}
doc.emit("touchstart",touchEvent([point(80,100)]));
doc.emit("touchmove",touchEvent([point(82,154)]));
doc.emit("touchend",touchEvent([],[point(82,154)]));
assert.equal(click(82,154).defaultPrevented,true,"A vertical swipe must suppress the ghost click");
assert.equal(click(82,154).defaultPrevented,false,"Only the swipe click should be consumed");
doc.emit("touchstart",touchEvent([point(80,100)]));
doc.emit("touchmove",touchEvent([point(83,106)]));
doc.emit("touchend",touchEvent([],[point(83,106)]));
assert.equal(click(83,106).defaultPrevented,false,"Ordinary taps must remain responsive");
doc.emit("pointerdown",{target:button,pointerType:"mouse",button:0,clientX:30,clientY:40});
doc.emit("pointermove",{target:button,pointerType:"mouse",clientX:40,clientY:60});
doc.emit("pointerup",{target:button,pointerType:"mouse",clientX:40,clientY:60});
assert.equal(click(40,60).defaultPrevented,true,"Dragging with pointer must suppress click");
assert.equal(click(40,60,0).defaultPrevented,false,"Keyboard-activated clicks must not be suppressed");
guard.dispose();
const explore=buildExploreViewModel({lens:"tlm",view:"map",language:"en",
 items:[],filters:{directoryGroup:"ROME"},counts:{tlm:1879}});
const page=renderExploreToString(explore);
assert.match(page,/aoExploreSectionSwitcher/);
assert.match(page,/data-find-filter-value="heritage"/);
assert.match(page,/Traditional Mass/);
assert.doesNotMatch(page,/aoExploreLensTabs/);
const base=renderHeritageToString({language:"en",items:[],filters:{heritageCategories:["shrines","relics","pilgrimages","apparitions","traditions"]}},{
 placeSheet:()=>"",detailSheet:()=>"",
});
assert.match(base,/aoExploreMainDestinations/);
assert.match(base,/Find a Mass/);
assert.match(base,/data-heritage-category="shrines"/);
assert.match(base,/data-find-filter-value="traditions"/);
console.log("PASS Explore R53: passive swipe protection, nested category architecture, section switcher");
