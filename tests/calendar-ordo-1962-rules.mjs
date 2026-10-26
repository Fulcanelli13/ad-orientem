import assert from "node:assert/strict";
import {review1962OrdinaryForCalendarDay,RULES_URL} from "../src/calendar/ordo-1962-ordinary-rule-review.js";

const day=(date,id,rank,color="white")=>({
 date,status:"ready",day:{main:{id,rank,color}},
 proper:{status:"ready",data:{sourcePath:"Sancti/10-07",riteProfile:"ordinary_mass"}},
});
const check=(row,g,c)=>{
 const r=review1962OrdinaryForCalendarDay(row);
 assert.equal(r.gloria.value,g,"Gloria "+row.date);
 assert.equal(r.credo.value,c,"Credo "+row.date);
 assert.equal(r.authority,RULES_URL);
 if(g!==null)assert.equal(r.gloria.status,"RULE_SUPPORTED");
 if(c!==null)assert.equal(r.credo.status,"RULE_SUPPORTED");
 return r;
};
check(day("2026-02-01","tempora:Sept1-0:2:v",2,"violet"),false,true);
check(day("2026-03-22","tempora:Quad5-0:1:v",1,"violet"),false,true);
check(day("2026-10-11","tempora:Pent20-0:2:g",2,"green"),null,true);
check(day("2026-10-18","sancti:10-18:1:w",1,"white"),true,true);
// In a first-class *feast*, Credo follows from the feast class; a class-I
// feria must not be classified as a feast merely because it has rank I.
check(day("2026-12-08","sancti:12-08:1:w",1,"white"),true,true);
check(day("2026-12-26","sancti:12-26:2:r",2,"red"),true,true);
check(day("2026-12-31","tempora:Nat1-1:2:w",2,"white"),null,true);
check(day("2026-10-15","sancti:10-15:3:w",3,"white"),true,false);
check(day("2026-10-14","sancti:10-14:3:r",3,"red"),true,false);
check(day("2026-10-07","sancti:10-07:2:w",2,"white"),true,true);
check(day("2026-10-26","tempora:Pent22-1:4:g",4,"green"),false,false);
check(day("2026-10-26",":feria:4:w",4,"Green"),false,false);
check(day("2026-10-27",":feria:4:w",4,"Green"),false,false);
check(day("2026-01-09",":feria:4:w",4,"White"),null,null);
check(day("2026-02-18","tempora:Quadp3-3:1:v",1,"violet"),false,null);
check(day("2026-10-22","tempora:Pent22-4:4:g",4,"green"),false,false);
check(day("2026-12-02","tempora:Adv1-3:3:v",3,"violet"),false,null);
check(day("2026-10-19","sancti:10-19:2:w",2,"white"),true,null);
let r=review1962OrdinaryForCalendarDay(day("2026-10-11","tempora:Pent20-0:2:g",2,"violet"));
assert.equal(r.gloria.clause,"RGMR_432_B");
assert.equal(r.credo.clause,"RGMR_475_A");
// Never trust a colour without a precise source owner and matching class.
const wrong=day("2026-10-11","tempora:Pent20-0:2:g",3,"violet");
r=review1962OrdinaryForCalendarDay(wrong);
assert.equal(r.gloria.value,null);assert.equal(r.credo.value,null);
r=review1962OrdinaryForCalendarDay({...day("2026-10-11","tempora:Pent20-0:2:g",2,"green"),proper:{status:"loading"}});
assert.equal(r.credo.value,null);
r=review1962OrdinaryForCalendarDay({...day("2026-10-11","tempora:Pent20-0:2:g",2,"green"),status:"failed"});
assert.equal(r.credo.value,null);
r=review1962OrdinaryForCalendarDay(day("2026-04-03","tempora:Quad6-5r:1:b",1,"black"));
assert.equal(r.gloria.value,null);assert.equal(r.credo.value,null);
r=review1962OrdinaryForCalendarDay({
 ...day("2026-10-11","tempora:Pent20-0:2:g",2,"green"),
 proper:{status:"ready",data:{sourcePath:"Votive/SacredHeart",riteProfile:"votive_mass"}}
});
assert.equal(r.credo.value,null);
assert.equal(r.gloria.value,null);
console.log("PASS 1962 General Roman Ordo: Sundays, violet, class-I/III Sanctorale, feria withholding, Good Friday, source integrity");
