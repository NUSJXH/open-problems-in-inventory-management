import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateCoverage, coverageRows} from '../assets/evidence-model.mjs';
const data=JSON.parse(await fs.readFile(new URL('../data/evidence-coverage.json',import.meta.url),'utf8'));
test('coverage reconciles without pooling the six-journal trend cohort',()=>{
  validateCoverage(data);
  assert.equal(data.uniqueRecords,6328);
  assert.equal(data.coreSixOverlap,312);
  assert.equal(data.additionalToCoreSix,6016);
  assert.equal(data.queries.filter(q=>q.complete).length,7);
});
test('partial perishability retains the distinct-record denominator',()=>{
  const row=coverageRows(data).find(q=>q.id==='perishable_all_venues');
  assert.equal(row.uniqueRecords,1999); assert.equal(row.exportedRows,2000); assert.equal(row.reportedResults,3911);
  assert.ok(row.percentage>51 && row.percentage<52); assert.equal(row.complete,false);
});
test('citing records and citation edges are not conflated',()=>{
  assert.equal(data.citations.distinctCitingRecords,142); assert.equal(data.citations.doiMatchedEdges,224);
  assert.equal(data.citations.anchors.length,8); assert.equal(data.citations.selfCitationsIncluded,true);
});
test('invalid completion, pooling, totals and duplicate anchors are rejected',()=>{
  for (const mutate of [d=>{d.queries.find(q=>!q.complete).complete=true;},d=>{d.cohortsArePooledWithTrends=true;},d=>{d.citations.doiMatchedEdges++;},d=>{d.citations.anchors[0].doi=d.citations.anchors[1].doi;}]) {
    const copy=structuredClone(data); mutate(copy); assert.throws(()=>validateCoverage(copy));
  }
});
test('public coverage contains no licensed row identifiers or session links',()=>{
  assert.doesNotMatch(JSON.stringify(data),/WOS:\d{10,}|easyaccess|resultUrl|\p{Script=Han}/u);
});
