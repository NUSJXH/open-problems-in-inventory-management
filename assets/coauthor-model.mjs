export function neighborhood(data,id){
  const author=data.authors.find(a=>a.id===id);if(!author)return null;
  const edges=data.edges.filter(e=>e.a===id||e.b===id);
  const ids=new Set(edges.map(e=>e.a===id?e.b:e.a));
  return {author,neighbors:data.authors.filter(a=>ids.has(a.id)),papers:data.papers.filter(p=>p.authors.includes(id)),edges};
}
export function validateCoauthors(data){
  const ids=new Set(data.authors.map(a=>a.id)),dois=new Set(data.papers.map(p=>p.doi));
  if(ids.size!==data.authors.length||dois.size!==data.papers.length)throw new Error('Duplicate author or paper');
  for(const p of data.papers)if(p.authors.some(id=>!ids.has(id)))throw new Error('Unidentified author');
  for(const e of data.edges){
    if(!ids.has(e.a)||!ids.has(e.b)||e.a===e.b||!e.papers.length)throw new Error('Invalid edge');
    for(const doi of e.papers){const p=data.papers.find(p=>p.doi===doi);if(!p||!p.authors.includes(e.a)||!p.authors.includes(e.b))throw new Error('Edge without shared-paper evidence');}
  }
  return data;
}
