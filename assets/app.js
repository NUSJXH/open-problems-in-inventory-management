import {filterRecords,readFilters,validateProblems} from './problem-model.mjs?v=3.0.0';
const $=id=>document.getElementById(id);
const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const link=(label,url)=>{const n=node('a','',label);n.href=url;return n;};
const state=readFilters(location.search);
if(location.hash==='#research-trends')location.replace('trends.html');
if(location.hash==='#literature-path')location.replace('index.html#OIM-R03');
let data;
const controls={query:'search',topic:'filter-topic',progress:'filter-progress',kind:'filter-kind',sort:'filter-sort'};
function paragraph(parent,label,text){const p=node('p');p.append(node('strong','',label+' '),document.createTextNode(text));parent.append(p);}
function detailsFor(record){
 const body=node('div','problem-expanded'),columns=node('div','record-detail-grid'),findings=node('div');
 findings.append(node('h3','','Result and remaining scope'));
 paragraph(findings,'Paper establishes.',record.result);paragraph(findings,'Scope.',record.boundary);
 const meta=node('aside','record-source');meta.append(node('h3','','Source'));
 meta.append(link(record.source.citationOnly?record.source.title:record.source.authors+' ('+record.source.year+'). '+record.source.title,record.source.url));
 meta.append(node('p','',record.source.outlet),node('p','',record.source.location),node('p','','Source review date: '+record.auditDate));
 meta.append(link('Link to this record','index.html#'+record.id));columns.append(findings,meta);body.append(columns);
 const progress=node('div','progress-explanation');paragraph(progress,'Progress.',record.progressNote);body.append(progress);
 body.append(node('h3','','Literature path'),node('p','timeline-note',data.timelineNote));
 const timeline=node('ol','record-timeline');
 for(const p of record.timeline){
  const li=node('li');li.append(node('span','timeline-year',String(p.year)));
  const detail=node('div');detail.append(node('span','timeline-role',p.relationship),link(p.title,p.url));
  if(p.dataRegime)detail.append(node('p','timeline-meta',p.dataRegime+' · '+p.policyBenchmark));
  if(p.result)detail.append(node('p','',p.result));
  if(p.boundary)detail.append(node('p','timeline-scope',p.boundary));li.append(detail);timeline.append(li);
 }
 body.append(timeline);
 if(record.relatedRecords.length){const p=node('p','related-records');p.append(node('strong','','Related records: '));for(const id of record.relatedRecords){const r=data.records.find(x=>x.id===id);p.append(link(r.title,'index.html#'+id),document.createTextNode(' · '));}body.append(p);}
 return body;
}
function card(record){
 const details=node('details','problem-record');details.id=record.id;
 const summary=node('summary'),top=node('div','record-topline');
 top.append(node('span','progress-pill progress-'+record.progress,data.progressLabels[record.progress]),node('span','record-topic',record.topic),node('span','record-kind',record.kind));
 summary.append(top,node('h2','record-title',record.title),node('p','record-summary',record.statement),node('p','record-citation',record.source.authors+' · '+record.source.year+' · '+record.id));
 const bottom=node('div','record-keywords');for(const word of record.keywords)bottom.append(node('span','',word));bottom.append(node('span','expand-label','Details & literature path'));
 summary.append(bottom);details.append(summary,detailsFor(record));
 details.addEventListener('toggle',()=>{if(details.open){const url=new URL(location.href);url.hash=record.id;history.replaceState(null,'',url);}});
 return details;
}
function syncUrl(){const url=new URL(location.href);url.search='';for(const [key,value]of Object.entries(state)){if(value&&!(key==='sort'&&value==='default'))url.searchParams.set(key==='query'?'q':key,value);}history.replaceState(null,'',url);}
function render(){
 const visible=filterRecords(data,state);$('open-list').replaceChildren(...visible.map(card));
 $('result-count').textContent=visible.length+' of '+data.records.length+' records';$('empty-state').hidden=visible.length>0;
}
function openLinkedRecord(){
 const id=location.hash.slice(1);if(!data.records.some(r=>r.id===id))return;
 if(!$(id)){Object.assign(state,{query:'',topic:'',progress:'',kind:'',sort:'default'});setControls();syncUrl();render();}
 $(id).open=true;$(id).scrollIntoView({block:'start',behavior:'auto'});
}
function setControls(){for(const[key,id]of Object.entries(controls))$(id).value=state[key];}
function options(id,values){for(const[value,label]of values){const o=node('option','',label);o.value=value;$(id).append(o);}}
try{
 const response=await fetch('data/problem-index.json?v=3.0.0');if(!response.ok)throw new Error('HTTP '+response.status);
 data=validateProblems(await response.json());
 options('filter-topic',[...new Set(data.records.map(r=>r.topic))].sort().map(v=>[v,v]));
 options('filter-kind',[...new Set(data.records.map(r=>r.kind))].map(v=>[v,v]));
 options('filter-progress',Object.entries(data.progressLabels));
 for(const key of ['topic','progress','kind','sort'])if(!Array.from($(controls[key]).options).some(o=>o.value===state[key]))state[key]=key==='sort'?'default':'';
 const stats=[[data.records.length,'catalogue records'],...Object.entries(data.progressLabels).map(([key,label])=>[data.records.filter(r=>r.progress===key).length,label])];
 $('record-overview').replaceChildren(...stats.map(([n,label])=>{const item=node('div');item.append(node('strong','',String(n)),node('span','',label));return item;}));
 setControls();render();openLinkedRecord();
 $('problem-filters').addEventListener('submit',event=>event.preventDefault());
 for(const[key,id]of Object.entries(controls))$(id).addEventListener(key==='query'?'input':'change',()=>{state[key]=$(id).value;const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);syncUrl();render();});
 $('clear-filters').addEventListener('click',()=>{Object.assign(state,{query:'',topic:'',progress:'',kind:'',sort:'default'});setControls();const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);syncUrl();render();});
 window.addEventListener('hashchange',openLinkedRecord);
}catch(error){$('record-overview').replaceChildren();$('result-count').textContent='The catalogue could not be loaded.';$('open-list').replaceChildren(node('p','data-notice','Please reload the page. The source data remain available through the About page.'));console.error(error);}
