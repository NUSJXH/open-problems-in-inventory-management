import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {selectYears,measureValue,upperBound,makeSeries} from '../assets/chart-model.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const source of ['wos','openalex']){
  const data=JSON.parse(await readFile(path.join(root,`data/${source}-trends.json`),'utf8'));
  test(`${source}: complete years exclude 2026 by default`,()=>{const rows=selectYears(data,2000,2025);assert.equal(rows.length,26);assert.ok(rows.every(r=>!r.incomplete));});
  test(`${source}: source-specific overview and topic denominators`,()=>{
    const row=data.years.find(r=>r.inventoryScopeRecords>0),category=data.categories[0];
    assert.equal(makeSeries([row],null,'count')[0].value,row.inventoryScopeRecords);
    assert.equal(makeSeries([row],null,'share')[0].value,100*row.inventoryScopeRecords/row.totalRecords);
    assert.equal(makeSeries([row],category,'share')[0].value,100*row.values[category]/row.inventoryScopeRecords);
  });
  test(`${source}: all year ranges produce bounded shares`,()=>{
    for(let first=2000;first<=2026;first++)for(let last=first;last<=2026;last++){
      const rows=selectYears(data,first,last);assert.equal(rows.length,last-first+1);
      for(const c of [null,...data.categories])for(const p of makeSeries(rows,c,'share'))assert.ok(p.value===null||(p.value>=0&&p.value<=100));
    }
  });
  test(`${source}: 2026 retains its incomplete flag`,()=>assert.equal(makeSeries(selectYears(data,2026,2026),null,'count')[0].incomplete,true));
}
test('Undefined shares are gaps, not zeros',()=>{assert.equal(measureValue(0,0,'share'),null);assert.equal(measureValue(0,0,'count'),0);assert.equal(upperBound([null,0]),1);});
test('Shared scale contains every nonmissing value',()=>{for(const values of [[0,1],[2,9.8],[4,42],[0.03,0.04]])assert.ok(upperBound(values)>=Math.max(...values));});
test('Static pages have unique IDs, English content, and valid local links',async()=>{
  for(const name of ['index.html','trends.html','methodology.html','about.html','problem.html']){
    const html=await readFile(path.join(root,name),'utf8');assert.match(html,/<html lang="en">/);assert.ok(!/\p{Script=Han}/u.test(html));
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,name);
    for(const [,url] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
      if(/^(?:https?:|mailto:)/.test(url))continue;
      const [file,hash]=url.split('#'),clean=file.split('?')[0];
      await access(path.join(root,clean||name));
      if(hash){const target=await readFile(path.join(root,clean||name),'utf8');assert.ok(target.includes(`id="${hash}"`),`${name} -> ${url}`);}
    }
  }
});
test('Every chart control and target referenced by the module exists',async()=>{
  const html=await readFile(path.join(root,'trends.html'),'utf8'),js=await readFile(path.join(root,'assets/trends.js'),'utf8');
  for(const [,id] of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${id}"`),id);
  assert.match(js,/value='2000'/);assert.match(js,/value='2025'/);
  assert.ok(!js.includes('innerHTML'));assert.ok(!js.replace('http://www.w3.org/2000/svg','').includes('http://'));
});
