const DENIED_PRODUCTION_HOSTS = Object.freeze(new Set(["categpt.chat"]));

function hostnameOf(value) {
  if(typeof value!=="string" || !value.trim()) return null;
  const raw=value.trim();
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function inspectNode(value,path,issues,seen) {
  if(value==null) return;
  if(typeof value==="string") {
    const host=hostnameOf(value);
    if(host && DENIED_PRODUCTION_HOSTS.has(host)) {
      issues.push(Object.freeze({path,host,value}));
    }
    return;
  }
  if(typeof value!=="object" || seen.has(value)) return;
  seen.add(value);
  if(Array.isArray(value)) {
    value.forEach((item,index)=>inspectNode(item,path+"["+index+"]",issues,seen));
    return;
  }
  for(const [key,item] of Object.entries(value)) {
    inspectNode(item,path ? path+"."+key : key,issues,seen);
  }
}

export function auditProductionSourceProvenance(value) {
  const issues=[];
  inspectNode(value,"",issues,new Set());
  return Object.freeze({
    pass:issues.length===0,
    deniedHosts:Object.freeze([...DENIED_PRODUCTION_HOSTS]),
    issues:Object.freeze(issues),
  });
}

export function assertProductionSourceProvenance(value) {
  const result=auditProductionSourceProvenance(value);
  if(!result.pass) {
    throw new Error("Production source provenance rejected: "+
      result.issues.map(x=>(x.path||"<root>")+" -> "+x.host).join(" | "));
  }
  return result;
}

export function isProductionAuthorityUrl(value) {
  const host=hostnameOf(value);
  return Boolean(host) && !DENIED_PRODUCTION_HOSTS.has(host);
}
