import { colors, selectYears, makeSeries, upperBound } from './chart-model.mjs?v=2.4.0';

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('en-US');
const node = (tag, cls, text) => { const n = document.createElement(tag); if(cls) n.className=cls; if(text !== undefined) n.textContent=text; return n; };
const svgNode = (tag, attrs={}, text) => { const n=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v); if(text!==undefined)n.textContent=text; return n; };
const dataCache = new Map();
let requestSequence=0;
const tooltip = node('div','chart-tooltip');
tooltip.hidden=true;
document.body.append(tooltip);
function tooltipEvents(element, label) {
  element.setAttribute('tabindex','0');
  element.setAttribute('aria-label',label);
  const show = () => {
    tooltip.textContent=label; tooltip.hidden=false;
    const rect=element.getBoundingClientRect();
    tooltip.style.left=`${Math.max(8,Math.min(window.innerWidth-tooltip.offsetWidth-8,rect.left+rect.width/2))}px`;
    tooltip.style.top=`${Math.max(8,rect.top-tooltip.offsetHeight-10)}px`;
  };
  for(const event of ['mouseenter','focus']) element.addEventListener(event,show);
  for(const event of ['mouseleave','blur']) element.addEventListener(event,()=>tooltip.hidden=true);
  element.addEventListener('keydown',event=>{if(event.key==='Escape')tooltip.hidden=true;});
}
window.addEventListener('scroll',()=>tooltip.hidden=true,{passive:true});
function pointLabel(point, measure) {
  return `${point.year}${point.incomplete?' (incomplete)':''}: ${fmt(point.count)} records; ${fmt(point.denominator)} ${measure==='overview'?'source':'inventory-scope'} records${point.value===null?'; share unavailable':''}.`;
}
function lineChart(points, color, title, maximum, compact=false, overview=false) {
  const w=compact?360:1080, h=compact?210:305;
  const m={l:48,r:24,t:16,b:40}, pw=w-m.l-m.r, ph=h-m.t-m.b;
  const svg=svgNode('svg',{viewBox:`0 0 ${w} ${h}`,role:'group','aria-label':title});
  svg.append(svgNode('title',{},title));
  const x=(i)=>m.l+(points.length===1?pw/2:i*pw/(points.length-1));
  const y=value=>m.t+ph-(value/maximum)*ph;
  for(let t=0;t<=4;t++) {
    const value=maximum*t/4, py=y(value);
    svg.append(svgNode('line',{x1:m.l,x2:w-m.r,y1:py,y2:py,class:'chart-gridline'}));
    svg.append(svgNode('text',{x:m.l-10,y:py+4,'text-anchor':'end',class:'chart-tick'},Number.isInteger(value)?String(value):value.toFixed(1)));
  }
  const tickStep=Math.max(1,Math.ceil((points.length-1)/(compact?3:8)));
  points.forEach((p,i)=>{
    if(i===0||i===points.length-1||(i%tickStep===0&&i<points.length-2))svg.append(svgNode('text',{x:x(i),y:h-14,'text-anchor':'middle',class:'chart-tick'},`${p.year}${p.incomplete?'*':''}`));
  });
  // Separate each segment so unavailable shares are gaps and partial-year segments are dashed.
  points.forEach((p,i)=>{
    if(i&&p.value!==null&&points[i-1].value!==null) svg.append(svgNode('line',{
      x1:x(i-1),x2:x(i),y1:y(points[i-1].value),y2:y(p.value),stroke:color,'stroke-width':compact?2.5:3,
      'stroke-dasharray':p.incomplete||points[i-1].incomplete?'6 5':'none','vector-effect':'non-scaling-stroke'}));
    if(p.value===null)return;
    const dot=svgNode('circle',{cx:x(i),cy:y(p.value),r:compact?3:4,fill:p.incomplete?'white':color,stroke:color,'stroke-width':1.5,class:'chart-point'});
    dot.append(svgNode('title',{},pointLabel(p,overview?'overview':'topic')));
    tooltipEvents(dot,pointLabel(p,overview?'overview':'topic'));
    svg.append(dot);
  });
  return svg;
}
function tableFor(data,rows) {
  const table=node('table','trend-table historical-table');
  table.append(node('caption','sr-only',`${data.database}: counts, not shares. 2026 is incomplete.`));
  const head=node('thead'), tr=node('tr');
  ['Year','All records','With abstract','Inventory scope',...data.categories].forEach(label=>{const cell=node('th','',label);cell.scope='col';tr.append(cell);});head.append(tr);
  const body=node('tbody');
  for(const row of rows){const tr=node('tr',row.incomplete?'incomplete-year':'');const label=node('th','',`${row.year}${row.incomplete?' (partial)':''}`);label.scope='row';tr.append(label);[row.totalRecords,row.recordsWithAbstract,row.inventoryScopeRecords,...data.categories.map(c=>row.values[c])].forEach(n=>tr.append(node('td','trend-number',fmt(n))));body.append(tr);}
  table.append(head,body);return table;
}
function heatmap(data,rows,measure,maximum) {
  const table=node('table','heatmap-table');
  table.append(node('caption','sr-only',`Topic heatmap: ${measure==='share'?'percentage of inventory-scope records':'record counts'}.`));
  const head=node('thead'), header=node('tr');header.append(node('th','','Topic'));
  rows.forEach(r=>{const th=node('th','',`${r.year}${r.incomplete?'*':''}`);th.scope='col';header.append(th);});head.append(header);
  const body=node('tbody');
  for(const category of data.categories){
    const tr=node('tr'), label=node('th','',category);label.scope='row';tr.append(label);
    for(const p of makeSeries(rows,category,measure)){
      const cell=node('td',p.incomplete?'partial-cell':'');
      const button=node('button','heat-cell',p.value===null?'—':measure==='share'?p.value.toFixed(1):String(p.count));
      button.type='button';
      const intensity=p.value===null?0:p.value/maximum;
      button.style.backgroundColor=`color-mix(in srgb, #216a9a ${Math.round(intensity*86)}%, #f3f6fa)`;
      button.style.color=intensity>0.58?'#fff':'#17344d';
      tooltipEvents(button,`${category}. ${pointLabel(p,'topic')}${p.value!==null&&measure==='share'?` ${p.value.toFixed(1)}%.`:''}`);
      cell.append(button);tr.append(cell);
    }body.append(tr);
  }table.append(head,body);return table;
}
function render(data) {
  const rows=selectYears(data,Number($('trend-from').value),Number($('trend-to').value));
  const measure=$('trend-measure').value;
  const n=rows.reduce((s,r)=>s+r.totalRecords,0), inv=rows.reduce((s,r)=>s+r.inventoryScopeRecords,0), ab=rows.reduce((s,r)=>s+r.recordsWithAbstract,0);
  $('trend-records').textContent=fmt(n);$('trend-inventory').textContent=fmt(inv);$('trend-abstracts').textContent=`${n?(100*ab/n).toFixed(1):'—'}%`;
  $('trend-years').textContent=`${rows[0].year}–${rows.at(-1).year}${rows.at(-1).incomplete?'*':''}`;
  $('trend-state').textContent=`${data.database} · snapshot ${data.asOfDate} · ${fmt(data.totalRecords)} total records, ${fmt(data.inventoryScopeRecords)} inventory matches across 2000–2026. ${rows.at(-1).incomplete?'*2026 is incomplete.':''}`;
  $('overview-unit').textContent=measure==='share'?'Inventory-scope records as a percentage of all source records in each year':'Number of inventory-scope records in each year';
  const points=makeSeries(rows,null,measure);
  $('overview-chart').replaceChildren(lineChart(points,'#216a9a','Annual inventory-scope activity',upperBound(points.map(p=>p.value)),false,true));
  const topics=data.categories.map(c=>makeSeries(rows,c,measure));
  const max=upperBound(topics.flat().map(p=>p.value));
  $('topic-unit').textContent=measure==='share'?'Percentage of inventory-scope records in each year. All panels use a common scale.':'Number of matching inventory records in each year. All panels use a common scale.';
  $('topic-charts').replaceChildren(...data.categories.map((category,i)=>{
    const panel=node('figure','topic-chart'), caption=node('figcaption');
    const dot=node('span','legend-dot');dot.style.background=colors[i];
    const title=node('h4','',category);title.prepend(dot);caption.append(title);
    panel.append(caption,lineChart(topics[i],colors[i],category,max,true));return panel;
  }));
  $('heatmap-unit').textContent=measure==='share'?'Percentage of inventory-scope records. One color scale is used across all topics.':'Matching records. One color scale is used across all topics.';
  $('topic-heatmap').replaceChildren(heatmap(data,rows,measure,max));
  $('trend-table').replaceChildren(tableFor(data,rows));
  $('trend-note').textContent=data.note;
  $('trend-download').href=`data/${$('trend-source').value==='wos'?'wos':'openalex'}-trends.json`;
}
async function update(){
  const sequence=++requestSequence, source=$('trend-source').value;
  tooltip.hidden=true;
  try{
    if(!dataCache.has(source)){
      $('trend-state').textContent='Loading source aggregates…';
      const response=await fetch(`data/${source==='wos'?'wos':'openalex'}-trends.json?v=2.4.0`);
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      dataCache.set(source,await response.json());
    }
    if(sequence===requestSequence)render(dataCache.get(source));
  }catch(error){if(sequence===requestSequence){$('trend-state').textContent='This source could not be loaded. Please reload the page.';for(const id of ['overview-chart','topic-charts','topic-heatmap','trend-table'])$(id).replaceChildren();for(const id of ['trend-records','trend-inventory','trend-abstracts','trend-years'])$(id).textContent='—';$('trend-note').textContent='';}console.error(error);}
}
for(const id of ['trend-from','trend-to']){
  for(let year=2000;year<=2026;year++){const option=node('option','',`${year}${year===2026?' (partial)':''}`);option.value=year;$(id).append(option);}
}
$('trend-from').value='2000';$('trend-to').value='2025';
for(const id of ['trend-source','trend-measure','trend-from','trend-to'])$(id).addEventListener('change',()=>{
  if(Number($('trend-from').value)>Number($('trend-to').value))$(id==='trend-from'?'trend-to':'trend-from').value=$(id).value;
  update();
});
update();
fetch('data/acquisition-summary.json?v=2.4.0').then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(data=>{
  const container=$('acquisition-summary');
  container.append(node('h3','','Additional literature discovery'),node('p','',`${fmt(data.uniqueRecords)} distinct OpenAlex search records were archived from supplementary journals, cross-journal topic searches, and forward-citation searches. A local title, abstract, and keyword screen retains ${fmt(data.inventoryKeywordMatches)} inventory matches. These records are kept separate from the six-journal trends. They are discovery candidates, not additional open-problem entries.`));
  const details=node('details'),summary=node('summary','','Search coverage and remaining evidence');details.append(summary);
  const list=node('ul');data.groups.forEach(g=>list.append(node('li','',`${g.label}: ${g.queries} of ${g.plannedQueries} searches completed; ${fmt(g.uniqueRecords)} distinct search records, ${fmt(g.inventoryKeywordMatches)} local inventory matches${g.complete?'':' (incomplete)'}.`)));details.append(list,node('p','',data.remainingEvidence));
  const link=node('a','method-link','Download acquisition summary');link.href='data/acquisition-summary.json';details.append(link);container.append(details);
}).catch(()=>{$('acquisition-summary').hidden=true;});
