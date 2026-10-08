export const RETURN_STACK_VERSION="ao-return-stack-v1";

const stack=[];

function cleanId(value){return String(value??"").trim()||"return-point";}

export function pushReturnPoint({id,label="",resume}={}){
  if(typeof resume!=="function")return null;
  const point=Object.freeze({id:cleanId(id),label:String(label??""),resume});
  const top=stack[stack.length-1];
  if(top?.id===point.id)stack.pop();
  stack.push(point);
  if(stack.length>24)stack.splice(0,stack.length-24);
  return Object.freeze({id:point.id,label:point.label,depth:stack.length});
}

export function hasReturnPoint(){return stack.length>0;}

export function peekReturnPoint(){
  const point=stack[stack.length-1];
  return point?Object.freeze({id:point.id,label:point.label,depth:stack.length}):null;
}

export async function returnToPrevious(){
  const point=stack.pop();
  if(!point)return Object.freeze({ok:false,reason:"EMPTY_RETURN_STACK"});
  try{
    const value=await point.resume();
    return Object.freeze({ok:value!==false,id:point.id,value});
  }catch(error){
    return Object.freeze({ok:false,id:point.id,reason:String(error?.message??error)});
  }
}

export function discardReturnPoint(id=null){
  if(!stack.length)return false;
  if(id==null){stack.pop();return true;}
  const key=cleanId(id);
  const index=stack.map(x=>x.id).lastIndexOf(key);
  if(index<0)return false;
  stack.splice(index,1);
  return true;
}

export function clearReturnStack(){stack.length=0;return true;}

export function returnStackStatus(){
  return Object.freeze({
    version:RETURN_STACK_VERSION,
    depth:stack.length,
    top:peekReturnPoint(),
  });
}
