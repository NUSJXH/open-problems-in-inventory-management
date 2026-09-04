import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {filterRecords,readFilters,validateProblems} from '../assets/problem-model.mjs';
import {neighborhood,validateCoauthors} from '../assets/coauthor-model.mjs';
const read=async file=>fs.readFile(new URL('../'+file,import.meta.url),'utf8');
const data=JSON.parse(await read('data/problem-index.json')),registry=JSON.parse(await read('data/registry.json')),graph=JSON.parse(await read('data/coauthors.json'));
test('13 records preserve eight source statements and all six status updates without double counting',()=>{
  validateProblems(data);assert.equal(data.records.length,13);
  for(const item of registry.openItems){const r=data.records.find(r=>r.id===item.id);assert.equal(r.statement,item.statement);assert.equal(r.boundary,item.scopeBoundary);assert.equal(r.kind,item.evidenceClass);assert.deepEqual(r.source,item.source);}
  for(const u of registry.statusUpdates)assert.ok(data.records.some(r=>r.statement===u.summary||r.timeline.some(p=>p.result===u.summary)));
  assert.deepEqual(['pending','partial','resolved'].map(p=>data.records.filter(r=>r.progress===p).length),[7,2,4]);
});
test('keywords, topics, progress, and type intersect, with empty states',()=>{
  assert.ok(filterRecords(data,{query:'FP3'}).some(r=>r.id==='OIM-001'));
  assert.equal(filterRecords(data,{progress:'partial'}).length,2);
  assert.ok(filterRecords(data,{topic:'Nonstationary inventory',progress:'pending'}).every(r=>r.topic==='Nonstationary inventory'));
  assert.equal(filterRecords(data,{kind:'Source-stated extension'}).length,3);
  assert.equal(filterRecords(data,{query:'not-a-real-inventory-topic-xyzz'}).length,0);
  assert.ok(filterRecords(data,{query:'  PIL  penalty  '}).every(r=>JSON.stringify(r).toLowerCase().includes('pil')));
});
test('year sorting is stable and does not mutate source order',()=>{
  const ids=data.records.map(r=>r.id);
  for(const sort of ['newest','oldest']){const rows=filterRecords(data,{sort});for(let i=1;i<rows.length;i++)assert.ok(sort==='newest'?rows[i-1].source.year>=rows[i].source.year:rows[i-1].source.year<=rows[i].source.year);}
  assert.deepEqual(data.records.map(r=>r.id),ids);
});
test('filters survive a shareable query string',()=>{
  assert.deepEqual(readFilters('?q=censored+demand&topic=Data-driven+lost+sales&progress=resolved&kind=Reported+result&sort=newest'),{query:'censored demand',topic:'Data-driven lost sales',progress:'resolved',kind:'Reported result',sort:'newest'});
});
test('all 14 original literature entries remain accessible in record details',()=>{
  for(const p of registry.literaturePath)assert.ok(data.records.some(r=>r.timeline.some(t=>t.url===p.url)),p.paper);
});
test('three main navigation destinations and no charts before the home catalogue',async()=>{
  for(const file of ['index.html','trends.html','about.html']){
    const html=await read(file),nav=html.match(/<nav aria-label="Primary navigation">([\s\S]*?)<\/nav>/)[1];
    assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['index.html','trends.html','about.html']);
  }
  const home=await read('index.html');assert.ok(!home.includes('assets/trends.js'));assert.ok(!home.includes('evidence-coverage'));assert.ok(home.includes('filter-progress'));
  const about=await read('about.html');assert.ok(about.includes('coauthor-network'));assert.ok(about.includes('five selected source papers'));
});
test('coauthor links have explicit shared-paper evidence and are ORCID scoped',()=>{
  validateCoauthors(graph);assert.equal(graph.papers.length,5);assert.equal(graph.authors.length,15);assert.equal(graph.edges.length,18);
  const cong=graph.authors.find(a=>a.name==='Cong Shi');assert.ok(cong.id.startsWith('https://orcid.org/'));
  const result=neighborhood(graph,cong.id);assert.equal(result.neighbors.length,4);assert.equal(result.papers.length,2);
  assert.equal(neighborhood(graph,'missing'),null);
  for(const a of graph.authors.filter(a=>!a.orcid))assert.ok(a.id.includes('::'));
});
test('invalid evidence and coauthor edges are rejected',()=>{
  const d=structuredClone(data);d.records[1].id=d.records[0].id;assert.throws(()=>validateProblems(d));
  const g=structuredClone(graph);g.edges[0].papers=['missing'];assert.throws(()=>validateCoauthors(g));
});
test('public presentation data contain no private row identifiers, access sessions, or non-English text',()=>{
  assert.doesNotMatch(JSON.stringify([data,graph]),/WOS:\d{10,}|easyaccess|\p{Script=Han}/u);
});
