import {neighborhood,validateCoauthors} from './coauthor-model.mjs?v=3.0.0';
const $=id=>document.getElementById(id);
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const svg=(tag,attrs={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
let data;
function render(){
  const n=neighborhood(data,$('network-author').value);if(!n)return;
  const figure=svg('svg',{viewBox:'0 0 800 360',role:'img','aria-labelledby':'network-title network-description'});
  figure.append(svg('title',{id:'network-title'},'Coauthors of '+n.author.name),svg('desc',{id:'network-description'},n.neighbors.map(a=>a.name).join(', ')+'. Shared-paper references are listed below.'));
  const center={x:400,y:180};
  const positions=n.neighbors.map((a,i)=>{const angle=-Math.PI/2+2*Math.PI*i/n.neighbors.length;return{...a,x:400+240*Math.cos(angle),y:180+112*Math.sin(angle)};});
  for(const a of positions)figure.append(svg('line',{x1:center.x,y1:center.y,x2:a.x,y2:a.y,stroke:'#9bb5ca','stroke-width':2}));
  for(const a of [...positions,{...n.author,...center}]){
    figure.append(svg('circle',{cx:a.x,cy:a.y,r:a.id===n.author.id?11:8,fill:a.id===n.author.id?'#216a9a':'#557b98'}));
    figure.append(svg('text',{x:a.x,y:a.y+29,'text-anchor':'middle',fill:'#17344d','font-size':17,'font-family':'system-ui, sans-serif'},a.name));
  }
  $('network-graph').replaceChildren(figure);
  $('network-note').textContent=n.author.name+': '+n.neighbors.length+' coauthors in '+n.papers.length+' of the five selected papers. '+data.note;
  const heading=node('h3','Shared-paper evidence'),list=node('ul');list.className='network-paper-list';
  for(const p of n.papers){const li=node('li'),a=node('a',p.title);a.href='https://doi.org/'+p.doi;li.append(a,document.createTextNode(' — '+p.authors.map(id=>data.authors.find(a=>a.id===id).name).join('; ')));list.append(li);}
  $('network-papers').replaceChildren(heading,list);
}
try{
  const response=await fetch('data/coauthors.json?v=3.0.0');if(!response.ok)throw new Error(response.status);
  data=validateCoauthors(await response.json());
  $('network-author').replaceChildren(...data.authors.map(a=>{const o=node('option',a.name);o.value=a.id;return o;}));
  $('network-author').value=data.authors.find(a=>a.name==='Cong Shi')?.id||data.authors[0].id;
  $('network-identity').textContent=data.source+'. '+data.identityRule;
  $('network-author').addEventListener('change',render);render();
}catch(error){$('network-note').textContent='The coauthor data could not be loaded. Please reload the page.';console.error(error);}
