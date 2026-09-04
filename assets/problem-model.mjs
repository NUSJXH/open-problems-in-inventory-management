export function filterRecords(data,{query='',topic='',progress='',kind='',sort='default'}={}) {
  const words=query.trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
  const result=data.records.filter(r=>{
    const text=[r.id,r.title,r.statement,r.topic,r.kind,r.result,r.boundary,...r.keywords,...Object.values(r.source),...r.timeline.flatMap(p=>[p.title,p.authors,p.result])].join(' ').toLocaleLowerCase('en');
    return (!topic||r.topic===topic)&&(!progress||r.progress===progress)&&(!kind||r.kind===kind)&&words.every(w=>text.includes(w));
  });
  if(sort==='newest')result.sort((a,b)=>b.source.year-a.source.year||a.id.localeCompare(b.id));
  if(sort==='oldest')result.sort((a,b)=>a.source.year-b.source.year||a.id.localeCompare(b.id));
  return result;
}
export function readFilters(search) {
  const p=new URLSearchParams(search);
  return {query:p.get('q')||'',topic:p.get('topic')||'',progress:p.get('progress')||'',kind:p.get('kind')||'',sort:p.get('sort')||'default'};
}
export function validateProblems(data) {
  const ids=new Set();
  for(const r of data.records){
    if(!r.id||ids.has(r.id))throw new Error('Duplicate or missing record ID');ids.add(r.id);
    if(!data.progressLabels[r.progress]||!r.source.url.startsWith('https://')||!r.boundary||!r.auditDate)throw new Error(`Incomplete record ${r.id}`);
    if(r.kind==='Source-stated extension'&&r.progress==='resolved')throw new Error('An extension must not be silently upgraded');
    if(!r.timeline.length||r.timeline.some((p,i)=>!p.url.startsWith('https://')||(i&&p.year<r.timeline[i-1].year)))throw new Error(`Invalid timeline ${r.id}`);
  }
  for(const r of data.records)if(r.relatedRecords.some(id=>!ids.has(id)||id===r.id))throw new Error('Broken related-record link');
  return data;
}
