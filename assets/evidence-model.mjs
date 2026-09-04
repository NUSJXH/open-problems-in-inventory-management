export function validateCoverage(data) {
  const count = n => Number.isInteger(n) && n >= 0;
  if (data.cohortsArePooledWithTrends !== false) throw new Error('Discovery cohorts must remain separate from trends');
  if (![data.uniqueRecords, data.coreSixOverlap, data.additionalToCoreSix].every(count) || data.coreSixOverlap + data.additionalToCoreSix !== data.uniqueRecords) throw new Error('Invalid cohort reconciliation');
  const ids = new Set();
  for (const q of data.queries) {
    if (!q.id || ids.has(q.id)) throw new Error('Duplicate or missing query identifier');
    ids.add(q.id);
    if (![q.uniqueRecords,q.exportedRows,q.reportedResults].every(count) || q.uniqueRecords > q.exportedRows || q.uniqueRecords > q.reportedResults) throw new Error('Invalid acquisition counts');
    if (q.complete !== (q.uniqueRecords === q.reportedResults)) throw new Error('Misleading completion flag');
  }
  const c = data.citations;
  if (![c.distinctCitingRecords,c.doiMatchedEdges,c.recordsWithoutDoiMatch].every(count)) throw new Error('Invalid citation totals');
  const dois = new Set();
  for (const a of c.anchors) {
    if (!a.doi || dois.has(a.doi) || !count(a.citingRecords) || a.citingRecords > c.distinctCitingRecords) throw new Error('Invalid anchor');
    dois.add(a.doi);
  }
  if (c.anchors.reduce((s,a)=>s+a.citingRecords,0) !== c.doiMatchedEdges) throw new Error('Citation edge total mismatch');
  return data;
}

export function coverageRows(data) {
  return data.queries.map(q => ({...q, percentage: q.reportedResults ? 100*q.uniqueRecords/q.reportedResults : 0}));
}
