import assert from "node:assert/strict";
import {calendarCommemorationNames} from "../src/calendar/calendar-runtime.js";
const principal={name:"Pent20-0",title:"XX Sunday after Pentecost"};
const named={name:"10-11",title:"Maternity of the Blessed Virgin Mary",titleFr:"Maternité divine de la Bienheureuse Vierge Marie",id:"sancti:10-11:2:w"};
const today={status:"ready",date:"2026-10-11",day:{
  main:{...principal,commemorations:[{name:"10-11",id:"sancti:10-11:2:w"}]},
  commemorations:[named]
}};
assert.deepEqual(calendarCommemorationNames(today),["Maternity of the Blessed Virgin Mary"]);
assert.deepEqual(calendarCommemorationNames(today,{language:"fr"}),["Maternité divine de la Bienheureuse Vierge Marie"]);
assert.deepEqual(calendarCommemorationNames({
 day:{main:{...principal,commemorations:[]},commemorations:[named,{name:"saint:2",title:"St Luke"}]}
}),["Maternity of the Blessed Virgin Mary","St Luke"]);
assert.deepEqual(calendarCommemorationNames({day:{main:{commemorations:[{name:"10-11",title:"Maternity of the Blessed Virgin Mary"}]}}}),["Maternity of the Blessed Virgin Mary"]);
assert.deepEqual(calendarCommemorationNames({day:{main:{commemorations:[{name:"10-11"}]},commemorations:[]}}),[]);
assert.deepEqual(calendarCommemorationNames({day:{main:{commemorations:[]},commemorations:[]}}),[]);
assert.deepEqual(calendarCommemorationNames({day:{commemorations:[named,named]}}),["Maternity of the Blessed Virgin Mary"]);
assert.deepEqual(calendarCommemorationNames({day:{commemorations:[{title:{en:"St Barbara",fr:"Sainte Barbe"}}]}} ,{language:"fr"}),["Sainte Barbe"]);
assert.deepEqual(calendarCommemorationNames({day:{commemorations:[{title:{en:"St Barbara",fr:"Sainte Barbe"}}]}}),["St Barbara"]);
console.log("PASS: Calendar uses canonical same-day commemoration titles, never opaque 10-11 codes; English/French and multiple/deduplicated feasts.");
