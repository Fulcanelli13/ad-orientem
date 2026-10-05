export function directChildAnchor(container,node){
  if(!container||!node)return null;
  let current=node;
  while(current&&current.parentNode&&current.parentNode!==container){
    current=current.parentNode;
  }
  return current?.parentNode===container?current:null;
}
