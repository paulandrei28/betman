const state = { reports: new Map(), month: new Date(), selected: null };
const $ = (selector) => document.querySelector(selector);
const displayDate = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date);
const dateKey = (year, month, day) => `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
const reportDate = (value) => new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6)));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function renderEvidence(items) {
  if (!items?.length) return '<p class="muted">No evidence recorded.</p>';
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.team || 'Both')}</strong> ${escapeHtml(item.name || 'Evidence')}: ${escapeHtml(item.value ?? '?')}</li>`).join('')}</ul>`;
}
function renderPrediction(prediction) {
  const bonuses = prediction.bonuses?.map((value) => ({ value })) || [];
  const penalties = prediction.penalties?.map((value) => ({ value })) || [];
  return `<details><summary>#${escapeHtml(prediction.rank ?? '-')} - ${escapeHtml(prediction.market)}</summary><div class="prediction"><p class="metrics"><strong>Strength</strong> ${Number(prediction.prediction).toFixed(2)} &nbsp; <strong>Score</strong> ${Number(prediction.score).toFixed(2)} &nbsp; <strong>Confidence</strong> ${Number(prediction.confidence).toFixed(2)}%</p><h4>Direct evidence</h4>${renderEvidence(prediction.evidence)}${prediction.supporting_evidence?.length ? `<h4>Supporting evidence</h4>${renderEvidence(prediction.supporting_evidence)}` : ''}${bonuses.length ? `<h4>Strengthened by</h4>${renderEvidence(bonuses)}` : ''}${penalties.length ? `<h4>Conflicting evidence</h4>${renderEvidence(penalties)}` : ''}</div></details>`;
}
function renderReport(data) {
  const report = data && typeof data === 'object' ? data : {};
  const groups = Object.entries(report.predictions || report).filter(([, predictions]) => Array.isArray(predictions));
  if (!groups.length) return '<p class="muted">No predictions were generated.</p>';
  const count = groups.reduce((total, [, predictions]) => total + predictions.length, 0);
  return `<p class="report-count">${count} ranked predictions</p>${groups.map(([game, predictions]) => `<section class="match"><h3>${escapeHtml(game)}</h3>${predictions.map(renderPrediction).join('')}</section>`).join('')}`;
}
function renderCalendar() {
  const year = state.month.getFullYear(); const month = state.month.getMonth();
  $('#month-label').textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(state.month);
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; const days = new Date(year, month + 1, 0).getDate(); const today = new Date(); const calendar = $('#calendar'); calendar.innerHTML = '';
  for (let index = 0; index < firstDay; index += 1) calendar.append(document.createElement('span'));
  for (let day = 1; day <= days; day += 1) { const date = dateKey(year, month, day); const button = document.createElement('button'); button.className = 'day'; button.type = 'button'; button.textContent = day; button.setAttribute('aria-label', displayDate(new Date(year, month, day))); if (date === dateKey(today.getFullYear(), today.getMonth(), today.getDate())) button.classList.add('today'); if (state.reports.has(date)) { button.classList.add('has-report'); button.addEventListener('click', () => openReport(date)); } else button.disabled = true; if (date === state.selected) button.classList.add('selected'); calendar.append(button); }
}
async function openReport(date, updateHistory = true) { const entry = state.reports.get(date); if (!entry) return; state.selected = date; document.body.classList.add('report-focus'); $('.workspace').classList.add('report-focus'); $('.report-panel').hidden = false; renderCalendar(); $('#report-error').hidden = true; $('#report-content').hidden = true; $('#report-loading').hidden = false; if (updateHistory) history.pushState(null, '', `#${date}`); try { const response = await fetch(entry.report || entry.analysis); if (!response.ok) throw Error(); const data = await response.json(); $('#report-heading').textContent = displayDate(reportDate(date)); $('#report-body').innerHTML = renderReport(data); $('#report-content').hidden = false; } catch (error) { $('#report-error').hidden = false; } finally { $('#report-loading').hidden = true; } }
function showCalendar() { state.selected = null; document.body.classList.remove('report-focus'); $('.workspace').classList.remove('report-focus'); $('.report-panel').hidden = true; $('#report-content').hidden = true; $('#report-loading').hidden = true; $('#report-error').hidden = true; renderCalendar(); }
async function loadReports() { try { const response = await fetch('data/reports.json'); if (!response.ok) throw Error(); const payload = await response.json(); const reports = Array.isArray(payload?.reports) ? payload.reports : []; for (const entry of reports) { if (entry?.date && (entry.report || entry.analysis)) state.reports.set(entry.date, entry); } renderCalendar(); const hash = location.hash.slice(1); if (state.reports.has(hash)) { state.month = new Date(Number(hash.slice(0, 4)), Number(hash.slice(4, 6)) - 1, 1); openReport(hash, false); } } catch (error) { state.reports.clear(); renderCalendar(); $('.report-panel').hidden = false; $('#report-error').hidden = false; } }
$('#previous-month').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() - 1); renderCalendar(); }); $('#next-month').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() + 1); renderCalendar(); }); window.addEventListener('popstate', () => { const hash = location.hash.slice(1); if (state.reports.has(hash)) { state.month = new Date(Number(hash.slice(0, 4)), Number(hash.slice(4, 6)) - 1, 1); openReport(hash, false); } else showCalendar(); }); let deferredInstall; window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstall = event; $('#install-button').hidden = false; }); $('#install-button').addEventListener('click', async () => { if (!deferredInstall) return; deferredInstall.prompt(); deferredInstall = null; $('#install-button').hidden = true; }); window.addEventListener('offline', () => { $('#offline-status').textContent = 'Offline mode'; }); if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js'); if (!navigator.onLine) $('#offline-status').textContent = 'Offline mode'; loadReports();
