import {validateCoverage, coverageRows} from './evidence-model.mjs?v=3.0.0';

const host = document.getElementById('evidence-coverage');
const number = n => n.toLocaleString('en-US');
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function link(label, url) {
  const a = el('a', '', label); a.href = url; return a;
}
try {
  const response = await fetch('data/evidence-coverage.json?v=3.0.0');
  if (!response.ok) throw new Error('Coverage data unavailable');
  const data = validateCoverage(await response.json());
  host.replaceChildren();
  const intro = el('div', 'section-intro');
  const title = el('div'); title.append(el('p','eyebrow','Search coverage'),el('h2','','Beyond the six-journal cohort'));
  intro.append(title, el('p','',`Archived WoS searches · ${data.asOf}. Acquisition coverage, not publication growth or evidence of openness.`));
  host.append(intro);
  const stats = el('div','trend-summary evidence-stats');
  for (const [n,label] of [[data.uniqueRecords,'distinct records across overlapping searches'],[data.additionalToCoreSix,'records outside the six-journal snapshot'],[data.queries.filter(q=>q.complete).length,'query sets acquired in full; one partial']]) {
    const cell=el('div'); cell.append(el('strong','',number(n)),el('span','',label)); stats.append(cell);
  }
  host.append(stats);
  const grid=el('div','evidence-grid');
  const coverage=el('figure','chart-panel evidence-panel');
  const caption=el('figcaption'); caption.append(el('h3','','Records acquired by search'),el('p','','Distinct records / reported query results. Each bar uses its own query denominator.'));
  coverage.append(caption);
  const rows=el('ul','evidence-bars');
  for (const row of coverageRows(data)) {
    const item=el('li',row.complete?'':'is-partial');
    const label=el('div','evidence-row-label'); label.append(el('span','',row.label),el('strong','',`${number(row.uniqueRecords)} / ${number(row.reportedResults)}`));
    const track=el('div','evidence-track'); track.setAttribute('aria-hidden','true');
    const fill=el('span'); fill.style.width=`${row.percentage}%`; track.append(fill);
    item.append(label,track,el('span','evidence-row-status',row.complete?'Query acquired':`Partial · ${number(row.exportedRows)} rows; duplicate records retained in the archive`)); rows.append(item);
  }
  coverage.append(rows); grid.append(coverage);
  const citations=el('figure','chart-panel evidence-panel');
  const cc=el('figcaption'); cc.append(el('h3','','Forward-citation coverage'),el('p','',`${number(data.citations.distinctCitingRecords)} distinct citing records; ${number(data.citations.doiMatchedEdges)} DOI-matched links to eight anchors.`)); citations.append(cc);
  const list=el('ul','evidence-bars citation-bars');
  const max=Math.max(1,...data.citations.anchors.map(a=>a.citingRecords));
  for (const a of data.citations.anchors) {
    const item=el('li'); const label=el('div','evidence-row-label');
    const aLink=link(a.label,`https://doi.org/${a.doi}`); aLink.title=a.title;
    label.append(aLink,el('strong','',number(a.citingRecords)));
    const track=el('div','evidence-track'); track.setAttribute('aria-hidden','true');
    const fill=el('span'); fill.style.width=`${100*a.citingRecords/max}%`; track.append(fill);
    item.append(label,track); list.append(item);
  }
  citations.append(list,el('p','chart-note',data.citations.note)); grid.append(citations); host.append(grid);
  const details=el('details','historical-screen'); details.append(el('summary','','Query definitions, source versions, and remaining evidence'));
  const ul=el('ul'); for (const note of data.queryLimitations) ul.append(el('li','',note)); details.append(ul);
  for (const q of data.queries) {
    details.append(el('h3','',q.label),el('p','query-definition',q.query));
  }
  details.append(el('h3','','Public full texts added in this release'));
  const papers=el('ul'); for (const p of data.newlyArchivedPublicFullTexts) {
    const li=el('li'); li.append(link(`${p.authors}: ${p.title}`,p.url),document.createTextNode(` — ${p.version}; ${p.pages} PDF pages.`)); papers.append(li);
  }
  details.append(papers,el('h3','','Remaining evidence'));
  const pending=el('ul'); for (const note of data.remainingEvidence) pending.append(el('li','',note)); details.append(pending);
  host.append(details);
  const links=el('div','data-links'); links.append(link('Coverage methodology','trends.html#evidence-protocol'),link('Download aggregate coverage JSON','data/evidence-coverage.json')); host.append(links);
} catch (error) {
  host.replaceChildren(el('p','data-notice','The supplementary coverage data could not be loaded. Please reload the page; the six-journal trends are independent of this panel.'));
  console.error(error);
}
