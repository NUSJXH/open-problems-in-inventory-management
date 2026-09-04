export const colors = ['#216a9a', '#b7592b', '#7661a8', '#188176', '#ac5074', '#797023'];
export function selectYears(data, first, last) {
  return data.years.filter(row => row.year >= first && row.year <= last);
}
export function measureValue(count, denominator, measure) {
  return measure === 'share' ? (denominator ? 100 * count / denominator : null) : count;
}
export function upperBound(values) {
  const max = Math.max(0, ...values.filter(Number.isFinite));
  if (!max) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const step = magnitude / 2;
  return Math.ceil(max / step) * step;
}
export function makeSeries(rows, category, measure) {
  return rows.map(row => ({ year: row.year, incomplete: row.incomplete,
    count: category ? row.values[category] : row.inventoryScopeRecords,
    denominator: category ? row.inventoryScopeRecords : row.totalRecords,
    value: measureValue(category ? row.values[category] : row.inventoryScopeRecords,
      category ? row.inventoryScopeRecords : row.totalRecords, measure) }));
}
