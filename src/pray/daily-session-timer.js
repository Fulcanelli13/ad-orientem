/**
 * Optional, ephemeral Morning/Evening prayer session clock.
 *
 * Timer never owns the prayer-card index. No persistence, analytics,
 * notification, automatic advancement, prayer truncation or interval here:
 * the PRAY reader explicitly opts into ticking a visual readout while running.
 */
import {dailyTimerSnapshot} from "./daily-formulation-engine.js";

const TARGETS=new Set([null,5,10,15,20]);
export const DAILY_SESSION_TARGETS=Object.freeze([null,5,10,15,20]);

export function createDailySessionTimer({clock=()=>globalThis.performance?.now?.()??Date.now()}={}){
  let startedMs=null, accumulatedMs=0, running=false, targetMinutes=null;
  const now=()=>{
    const t=Number(clock());
    if(!Number.isFinite(t)||t<0)throw new RangeError("Invalid monotonic time");
    return t;
  };
  const snapshot=()=>dailyTimerSnapshot({nowMs:now(),startedMs,accumulatedMs,running,targetMinutes});
  return Object.freeze({
    snapshot,
    start(){
      if(!running){startedMs=now();running=true;}
      return snapshot();
    },
    pause(){
      if(running){
        const t=now();
        accumulatedMs+=Math.max(0,t-startedMs);
        startedMs=null;running=false;
      }
      return snapshot();
    },
    reset(){
      startedMs=null;accumulatedMs=0;running=false;
      return snapshot();
    },
    setTarget(value){
      if(!TARGETS.has(value))throw new RangeError("Unsupported prayer session duration");
      targetMinutes=value;
      return snapshot();
    }
  });
}

export function sessionClockLabel(elapsedMs){
  const whole=Math.floor(Math.max(0,Number(elapsedMs)||0)/1000);
  return `${String(Math.floor(whole/60)).padStart(2,"0")}:${String(whole%60).padStart(2,"0")}`;
}
