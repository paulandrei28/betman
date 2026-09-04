const savedFilters = (() => { try { return JSON.parse(localStorage.getItem('betman-report-filters')) || {}; } catch { return {}; } })();
const state = { reports: new Map(), month: new Date(), selected: null, report: null, reportView: 'top', selectedLeagueIds: Array.isArray(savedFilters.leagues) ? new Set(savedFilters.leagues) : null, selectedCategories: Array.isArray(savedFilters.categories) ? new Set(savedFilters.categories) : null, threshold: Math.max(0, Number(savedFilters.threshold) || 0), lang: localStorage.getItem('betman-language') || 'en' };
const translations = {
  en: { archive: 'Archive', reports: 'Reports', reportArchive: 'Report archive', reportCalendar: 'Report calendar', reportAvailable: 'Report available', reportUnavailable: 'That report is not available right now.', selectedReport: 'Selected report', top20: 'Top 20', byGame: 'By game', byPrediction: 'By prediction', league: 'League', allLeagues: 'All leagues', minimumPrediction: 'Min. prediction', ranked: 'ranked predictions', categories: 'categories', game: 'game', games: 'games', prediction: 'prediction', predictions: 'predictions', directEvidence: 'Evidence', supportingEvidence: 'Supporting evidence', strengthenedBy: 'Strengthened by', conflictingEvidence: 'Conflicting evidence', noEvidence: 'No evidence recorded.', noPredictions: 'No predictions were generated.', strength: 'Score', disclaimer: 'For informational purposes only. Bet responsibly.', switchTo: 'Switch to Romanian', changeLanguage: 'Change language', offline: 'Offline mode', loading: 'Loading report...', install: 'Install app', previousMonth: 'Previous month', nextMonth: 'Next month', reportView: 'Report view', introPick: 'Pick a', introMatchday: 'matchday.', introSignal: 'Read the signal.', categoryCards: 'Cards', categoryCorners: 'Corners', categoryGoals: 'Goals', categoryBtts: 'Both teams scoring', categoryCleanSheet: 'Clean sheet', categoryFirstToScore: 'First to score', categoryWinner: 'Winner / result', categoryOther: 'Other predictions' },
  ro: { archive: 'Arhivă', reports: 'Rapoarte', reportArchive: 'Arhiva rapoartelor', reportCalendar: 'Calendarul rapoartelor', reportAvailable: 'Raport disponibil', reportUnavailable: 'Raportul nu este disponibil momentan.', selectedReport: 'Raport selectat', byGame: 'Pe meci', byPrediction: 'Pe pronostic', ranked: 'pronosticuri clasate', categories: 'categorii', game: 'meci', games: 'meciuri', prediction: 'pronostic', predictions: 'pronosticuri', directEvidence: 'Dovezi', supportingEvidence: 'Dovezi suplimentare', strengthenedBy: 'Susținut de', conflictingEvidence: 'Dovezi contradictorii', noEvidence: 'Nu există dovezi înregistrate.', noPredictions: 'Nu au fost generate pronosticuri.', strength: 'Scor', disclaimer: 'Doar în scop informativ. Joacă responsabil.', switchTo: 'Comută în engleză', changeLanguage: 'Schimbă limba', offline: 'Mod offline', loading: 'Se încarcă raportul...', install: 'Instalează aplicația', previousMonth: 'Luna anterioară', nextMonth: 'Luna următoare', reportView: 'Vizualizare raport', introPick: 'Alege', introMatchday: 'ziua meciului.', introSignal: 'Descoperă pontul.', categoryCards: 'Cartonașe', categoryCorners: 'Cornere', categoryGoals: 'Goluri', categoryBtts: 'Ambele echipe marchează', categoryCleanSheet: 'Primește gol', categoryFirstToScore: 'Marchează prima', categoryWinner: 'Câștigător / rezultat', categoryOther: 'Alte pronosticuri' }
};
const marketTranslations = { 'less than': 'sub', 'more than': 'peste', 'cards': 'cartonașe', 'corners': 'cornere', 'goals': 'goluri', 'both teams scoring': 'ambele echipe marchează', 'no clean sheet': 'primește gol', 'first to score': 'marchează prima', 'first half winner': 'câștigă prima repriză', 'no losses': 'fără înfrângere', 'no wins': 'nu câștigă', 'wins': 'câștigă', 'losses': 'pierde', 'first to concede': 'primește primul gol' };
const evidenceTranslations = { general: 'general', head2head: 'head-to-head', home: 'home', away: 'away', both: 'head-to-head' };
const $ = (selector) => document.querySelector(selector);
Object.assign(translations.en, { selectLeagues: 'Select leagues', leagueConfig: 'League selection', applyLeagues: 'Apply filters', resetFilters: 'Reset filters', minScore: 'Min. score', predictionFilter: 'Prediction', allPredictions: 'All predictions', filters: 'Filters', filterSettings: 'Filter settings', activeFilters: 'active', lastGames: 'Last games', headToHead: 'Head-to-head', otherEvidence: 'Other evidence', bothTeams: 'Both teams' });
Object.assign(translations.ro, { minScore: 'Min. scor', predictionFilter: 'Pronostic', allPredictions: 'Toate pronosticurile', filters: 'Filtre', filterSettings: 'Setări filtre', resetFilters: 'Resetează filtrele', activeFilters: 'active', lastGames: 'Ultimele meciuri', headToHead: 'Confruntari directe', otherEvidence: 'Alte dovezi', bothTeams: 'Both teams' });
Object.assign(translations.ro, { selectLeagues: 'Selectează ligile', leagueConfig: 'Selectarea ligilor', applyLeagues: 'Aplică filtrele' });
function mountFilterMenu() {
  const controls = document.querySelector('.report-controls');
  const menu = document.createElement('div');
  menu.className = 'filter-menu';
  menu.innerHTML = '<button id="filter-menu-toggle" class="filter-menu-toggle" type="button" aria-expanded="false" aria-controls="filter-menu-panel"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h3M11 17h9M14 4v6M7 14v6"/></svg><span data-i18n="filters">Filters</span><span id="filter-count" class="filter-count" hidden></span></button><div id="filter-menu-panel" class="filter-menu-panel" hidden><div class="filter-menu-heading"><div><p data-i18n="filters">Filters</p><span data-i18n="filterSettings">Filter settings</span></div><button id="filter-menu-close" class="filter-menu-close" type="button" aria-label="Close">×</button></div><div class="filter-fields"><label><span data-i18n="minScore">Min. score</span><input id="prediction-threshold" type="number" min="0" step="5" value="0"></label></div><div class="filter-section"><p data-i18n="predictionFilter">Prediction</p><div id="prediction-options" class="filter-options"></div></div><div class="filter-section"><p data-i18n="leagueConfig">League selection</p><div id="league-options" class="filter-options"></div></div><div class="filter-menu-footer"><button id="reset-filters" class="reset-filters" type="button" data-i18n="resetFilters">Reset filters</button><button id="apply-filters" class="apply-filters" type="button" data-i18n="applyLeagues">Apply filters</button></div></div>';
  controls.append(menu);
}
const t = (key) => translations[state.lang][key] || translations.en[key] || key;
const displayDate = (date) => new Intl.DateTimeFormat(state.lang === 'ro' ? 'ro-RO' : undefined, { dateStyle: 'long' }).format(date);
const translateMarket = (value) => { let result = String(value || ''); Object.entries(marketTranslations).forEach(([from, to]) => { result = result.replace(new RegExp(from, 'gi'), to); }); return result; };
const translateEvidenceText = (value, prediction) => { let result = String(value).replace(/\(home\)/gi, `(${prediction?.home || 'home'})`).replace(/\(away\)/gi, `(${prediction?.away || 'away'})`); if (state.lang === 'en') return result.replace(/home \+ away agreement/gi, `${prediction?.home || 'home'} + ${prediction?.away || 'away'} agreement`); return result.replace(/general \+ H2H agreement/gi, 'acord între statisticile generale și meciurile directe').replace(/home \+ away agreement/gi, `acord între ${prediction?.home || 'gazde'} și ${prediction?.away || 'oaspeți'}`).replace(/both teams first to score patterns/gi, 'ambele echipe au tendința să marcheze primele').replace(/both teams first-score tendencies/gi, 'tendința ambelor echipe de a marca primele').replace(/both teams no clean sheet/gi, 'ambele echipe primesc gol').replace(/both teams no-clean-sheet tendencies/gi, 'tendința ambelor echipe de a primi gol').replace(/first to score \+ first-half winner/gi, 'marchează prima și câștigă prima repriză').replace(/first to score \+ opponent first to concede/gi, 'marchează prima, iar adversarul primește primul gol').replace(/first-half winner \+ first to score/gi, 'câștigă prima repriză și marchează prima').replace(/first-half winner \+ opponent first to concede/gi, 'câștigă prima repriză, iar adversarul primește primul gol').replace(/opponent first to score supports no clean sheet/gi, 'prima marcare a adversarului susține pronosticul „primește gol”').replace(/opponent no clean sheet supports scoring first/gi, 'faptul că adversarul primește gol susține pronosticul „marchează prima”').replace(/general underlying-event conflict/gi, 'conflict cu statistica generală').replace(/head2head underlying-event conflict/gi, 'conflict cu meciurile directe').replace(/without clean sheet/gi, 'primește gol').replace(/no goals conceded/gi, 'nu primește gol').replace(/no losses \+ wins/gi, 'fără înfrângere și câștigă').replace(/no wins \+ losses/gi, 'nu câștigă și pierde').replace(/losses \+ no wins/gi, 'pierde și nu câștigă').replace(/win \+ no losses/gi, 'câștigă și rămâne fără înfrângere').replace(/win \+ opponent loss/gi, 'câștigă, iar adversarul pierde').replace(/over goals/gi, 'peste limita de goluri'); };
const dateKey = (year, month, day) => `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
const reportDate = (value) => new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6)));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function renderEvidenceItems(items, prediction) {
  return items.map((item) => { const team = item.team === 'home' ? prediction?.home : item.team === 'away' ? prediction?.away : null; const label = team || (item.team === 'both' ? t('bothTeams') : item.team ? evidenceTranslations[item.team] || item.team : t('directEvidence')); const name = state.lang === 'ro' ? translateMarket(item.name || '') : item.name || ''; const value = translateEvidenceText(item.value ?? '', prediction); return `<li><strong>${escapeHtml(label)}</strong>${name ? ` ${escapeHtml(name)}:` : ''} ${escapeHtml(value || '?')}</li>`; }).join('');
}
function renderEvidence(items, prediction, groupBySource = true) {
  if (!items?.length) return `<p class="muted">${t('noEvidence')}</p>`;
  if (!groupBySource) return `<ul>${renderEvidenceItems(items, prediction)}</ul>`;
  const groups = [
    { section: 'general', label: t('lastGames') },
    { section: 'head2head', label: t('headToHead') },
    { section: 'other', label: t('otherEvidence') },
  ].map((group) => ({ ...group, items: items.filter((item) => (item.section || 'other') === group.section) })).filter((group) => group.items.length);
  return `<div class="evidence-groups">${groups.map((group) => `<section class="evidence-group"><h5>${escapeHtml(group.label)}</h5><ul>${renderEvidenceItems(group.items, prediction)}</ul></section>`).join('')}</div>`;
}
function renderPrediction(prediction, summary = `#${escapeHtml(prediction.rank ?? '-')} - ${escapeHtml(prediction.market)}`) {
  const bonuses = prediction.bonuses?.map((value) => ({ value })) || [];
  const penalties = prediction.penalties?.map((value) => ({ value })) || [];
  const market = state.lang === 'ro' ? translateMarket(prediction.market) : prediction.market;
  const translatedSummary = summary.replace(escapeHtml(prediction.market), escapeHtml(market));
  return `<details><summary>${translatedSummary}</summary><div class="prediction"><p class="metrics"><strong>${t('strength')}</strong> ${Number(prediction.prediction).toFixed(2)}</p><h4>${t('directEvidence')}</h4>${renderEvidence(prediction.evidence, prediction)}${prediction.supporting_evidence?.length ? `<h4>${t('supportingEvidence')}</h4>${renderEvidence(prediction.supporting_evidence, prediction)}` : ''}${bonuses.length ? `<h4>${t('strengthenedBy')}</h4>${renderEvidence(bonuses, prediction, false)}` : ''}${penalties.length ? `<h4>${t('conflictingEvidence')}</h4>${renderEvidence(penalties, prediction, false)}` : ''}</div></details>`;
}
function reportPredictions(data) {
  const source = data?.predictions || data || {};
  if (Array.isArray(source)) return source;
  // Historical reports stored a game-to-predictions object.
  return Object.entries(source).flatMap(([game, predictions]) => Array.isArray(predictions) ? predictions.map((prediction) => ({ ...prediction, league: prediction.league || { id: null, name: 'Unknown' }, _game: game })) : []);
}
function filteredPredictions(data) {
  return reportPredictions(data).filter((prediction) => {
    const league = prediction.league || {};
    const leagueId = String(league.id ?? 'unknown');
    const category = predictionCategory(prediction.market);
    return (!state.selectedLeagueIds || state.selectedLeagueIds.has(leagueId)) && (!state.selectedCategories || state.selectedCategories.has(category)) && Number(prediction.prediction) >= state.threshold;
  });
}
function reportLeagues(data) {
  const seen = new Set();
  return reportPredictions(data).map((prediction) => prediction.league || { id: null, name: 'Unknown' })
    .filter((league) => { const key = String(league.id ?? 'unknown'); if (seen.has(key)) return false; seen.add(key); return true; })
    .sort(compareLeagueIdsAsc);
}
function compareLeagueIdsAsc(left, right) {
  const leftId = String(left?.id ?? 'unknown');
  const rightId = String(right?.id ?? 'unknown');
  return leftId.localeCompare(rightId, undefined, { numeric: true });
}
function gameName(prediction) { return prediction._game || `${prediction.home} - ${prediction.away}`; }
function predictionCategory(market) {
  const value = String(market || '').toLowerCase();
  if (value.includes('card')) return t('categoryCards');
  if (value.includes('corner')) return t('categoryCorners');
  if (value.includes('goal') || value.includes('over') || value.includes('under')) return t('categoryGoals');
  if (value.includes('both teams') || value.includes('btts')) return t('categoryBtts');
  if (value.includes('clean sheet')) return t('categoryCleanSheet');
  if (value.includes('first to score')) return t('categoryFirstToScore');
  if (value.includes('winner') || value.includes('win') || value.includes('no losses')) return t('categoryWinner');
  return market || t('categoryOther');
}
function renderByGame(predictions, count) {
  const leagues = new Map();
  predictions.forEach((prediction) => { const league = prediction.league || { id: null, name: 'Unknown' }; const key = String(league.id); if (!leagues.has(key)) leagues.set(key, { league, games: new Map() }); const games = leagues.get(key).games; const game = gameName(prediction); if (!games.has(game)) games.set(game, []); games.get(game).push(prediction); });
  return `<p class="report-count">${count} ${t('ranked')}</p>${Array.from(leagues.values()).sort((left, right) => compareLeagueIdsAsc(left.league, right.league)).map(({ league, games }) => `<section class="league-section"><h3>${escapeHtml(league.name || 'Unknown')}</h3>${Array.from(games, ([game, items]) => `<section class="match"><h3>${escapeHtml(game)}</h3>${items.map((prediction) => renderPrediction(prediction, `${escapeHtml(state.lang === 'ro' ? translateMarket(prediction.market) : prediction.market)}`)).join('')}</section>`).join('')}</section>`).join('')}`;
}
function renderByPrediction(predictions, count) {
  const categories = new Map();
  predictions.forEach((prediction) => {
    const game = gameName(prediction);
    const category = predictionCategory(prediction.market);
    if (!categories.has(category)) categories.set(category, new Map());
    if (!categories.get(category).has(game)) categories.get(category).set(game, []);
    categories.get(category).get(game).push(prediction);
  });
  return `<p class="report-count">${count} ${t('ranked')} ${categories.size} ${t('categories')}</p>${Array.from(categories, ([category, games]) => `<section class="prediction-group"><h3>${escapeHtml(category)} <span>${games.size} ${games.size === 1 ? t('game') : t('games')}</span></h3>${Array.from(games, ([game, predictions]) => `<details class="grouped-game"><summary><strong>${escapeHtml(game)}</strong><span>${predictions.length} ${predictions.length === 1 ? t('prediction') : t('predictions')}</span></summary><div class="grouped-game-body">${predictions.map((prediction) => renderPrediction(prediction, `#${escapeHtml(prediction.rank ?? '-')} - ${escapeHtml(state.lang === 'ro' ? translateMarket(prediction.market) : prediction.market)}`)).join('')}</div></details>`).join('')}</section>`).join('')}`;
}
function renderTop(predictions, count) { return `<p class="report-count">${count} ${t('ranked')}</p>${predictions.slice(0, 20).map((prediction) => `<section class="top-prediction"><h3>${escapeHtml(gameName(prediction))}</h3>${renderPrediction(prediction, `#${escapeHtml(prediction.rank ?? '-')} - ${escapeHtml(state.lang === 'ro' ? translateMarket(prediction.market) : prediction.market)}`)}</section>`).join('')}`; }
function renderReport(data) {
  const predictions = filteredPredictions(data);
  if (!predictions.length) return `<p class="muted">${t('noPredictions')}</p>`;
  return state.reportView === 'prediction' ? renderByPrediction(predictions, predictions.length) : state.reportView === 'games' ? renderByGame(predictions, predictions.length) : renderTop(predictions, predictions.length);
}
function updateFilters() {
  if (!state.report) return;
  const leagues = reportLeagues(state.report);
  const options = $('#league-options');
  if (options) options.innerHTML = leagues.map((league) => { const id = String(league.id ?? 'unknown'); return `<label><input type="checkbox" value="${escapeHtml(id)}" ${!state.selectedLeagueIds || state.selectedLeagueIds.has(id) ? 'checked' : ''}><span>${escapeHtml(league.name || 'Unknown')}</span></label>`; }).join('');
  $('#prediction-threshold').value = state.threshold;
  const categories = [...new Set(reportPredictions(state.report).map((prediction) => predictionCategory(prediction.market)))].sort((left, right) => left.localeCompare(right));
  const categoryOptions = $('#prediction-options');
  if (categoryOptions) categoryOptions.innerHTML = categories.map((category) => `<label><input type="checkbox" value="${escapeHtml(category)}" ${!state.selectedCategories || state.selectedCategories.has(category) ? 'checked' : ''}><span>${escapeHtml(category)}</span></label>`).join('');
  const selectedLeagueCount = leagues.filter((league) => state.selectedLeagueIds?.has(String(league.id ?? 'unknown'))).length;
  const activeCount = Number(state.threshold > 0) + Number(state.selectedLeagueIds && selectedLeagueCount !== leagues.length) + Number(state.selectedCategories?.size || 0);
  const badge = $('#filter-count');
  if (badge) { badge.hidden = !activeCount; badge.textContent = activeCount; }
}
function updateReportTabs() {
  document.querySelectorAll('[data-report-view]').forEach((button) => {
    const active = button.dataset.reportView === state.reportView;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
}
function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  const weekdays = state.lang === 'ro' ? ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  document.querySelectorAll('[data-weekday]').forEach((element) => { element.textContent = weekdays[Number(element.dataset.weekday)]; });
  $('#previous-month').setAttribute('aria-label', t('previousMonth'));
  $('#next-month').setAttribute('aria-label', t('nextMonth'));
  $('#report-tabs').setAttribute('aria-label', t('reportView'));
  $('.workspace').setAttribute('aria-label', t('reportArchive'));
  $('#calendar').setAttribute('aria-label', t('reportCalendar'));
  const toggle = $('#language-toggle');
  const targetLanguage = state.lang === 'en' ? 'RO' : 'EN';
  toggle.innerHTML = `<span class="language-flag" aria-hidden="true">${state.lang === 'en' ? '🇷🇴' : '🇬🇧'}</span><span class="language-code" aria-hidden="true">${targetLanguage}</span>`;
  toggle.setAttribute('aria-label', t('switchTo'));
  toggle.title = t('changeLanguage');
  $('#month-label').textContent = new Intl.DateTimeFormat(state.lang === 'ro' ? 'ro-RO' : undefined, { month: 'long', year: 'numeric' }).format(state.month);
  if (state.report) { $('#report-heading').textContent = displayDate(reportDate(state.selected)); updateFilters(); $('#report-body').innerHTML = renderReport(state.report); }
  renderCalendar();
}
function renderCalendar() {
  const year = state.month.getFullYear(); const month = state.month.getMonth();
  $('#month-label').textContent = new Intl.DateTimeFormat(state.lang === 'ro' ? 'ro-RO' : undefined, { month: 'long', year: 'numeric' }).format(state.month);
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; const days = new Date(year, month + 1, 0).getDate(); const today = new Date(); const calendar = $('#calendar'); calendar.innerHTML = '';
  for (let index = 0; index < firstDay; index += 1) calendar.append(document.createElement('span'));
  for (let day = 1; day <= days; day += 1) { const date = dateKey(year, month, day); const button = document.createElement('button'); button.className = 'day'; button.type = 'button'; button.textContent = day; button.setAttribute('aria-label', displayDate(new Date(year, month, day))); if (date === dateKey(today.getFullYear(), today.getMonth(), today.getDate())) button.classList.add('today'); if (state.reports.has(date)) { button.classList.add('has-report'); button.addEventListener('click', () => openReport(date)); } else button.disabled = true; if (date === state.selected) button.classList.add('selected'); calendar.append(button); }
}
async function openReport(date, updateHistory = true) { const entry = state.reports.get(date); if (!entry) return; state.selected = date; state.reportView = 'top'; state.report = null; updateReportTabs(); document.body.classList.add('report-focus'); $('.workspace').classList.add('report-focus'); $('.report-panel').hidden = false; renderCalendar(); $('#report-error').hidden = true; $('#report-content').hidden = true; $('#report-loading').hidden = false; if (updateHistory) history.pushState(null, '', `#${date}`); try { const reportUrl = new URL(entry.report || entry.analysis, document.baseURI); const response = await fetch(reportUrl, { cache: 'no-store' }); if (!response.ok) throw Error(); state.report = await response.json(); $('#report-heading').textContent = displayDate(reportDate(date)); updateFilters(); $('#report-body').innerHTML = renderReport(state.report); $('#report-content').hidden = false; } catch (error) { $('#report-error').hidden = false; } finally { $('#report-loading').hidden = true; } }
function showCalendar() { state.selected = null; document.body.classList.remove('report-focus'); $('.workspace').classList.remove('report-focus'); $('.report-panel').hidden = true; $('#report-content').hidden = true; $('#report-loading').hidden = true; $('#report-error').hidden = true; renderCalendar(); }
async function loadReports() { try { const response = await fetch(new URL('data/reports.json', document.baseURI), { cache: 'no-store' }); if (!response.ok) throw Error(); const payload = await response.json(); const reports = Array.isArray(payload?.reports) ? payload.reports : []; for (const entry of reports) { if (entry?.date && (entry.report || entry.analysis)) state.reports.set(entry.date, entry); } renderCalendar(); const hash = location.hash.slice(1); if (state.reports.has(hash)) { state.month = new Date(Number(hash.slice(0, 4)), Number(hash.slice(4, 6)) - 1, 1); openReport(hash, false); } } catch (error) { state.reports.clear(); renderCalendar(); $('.report-panel').hidden = false; $('#report-error').hidden = false; } }
mountFilterMenu();
$('#previous-month').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() - 1); renderCalendar(); });
$('#next-month').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() + 1); renderCalendar(); });
$('#language-toggle').addEventListener('click', () => { state.lang = state.lang === 'en' ? 'ro' : 'en'; localStorage.setItem('betman-language', state.lang); applyLanguage(); });
document.querySelectorAll('[data-report-view]').forEach((button) => button.addEventListener('click', () => { state.reportView = button.dataset.reportView; updateReportTabs(); if (state.report) $('#report-body').innerHTML = renderReport(state.report); }));
function toggleFilterMenu(open) { $('#filter-menu-panel').hidden = !open; $('#filter-menu-toggle').setAttribute('aria-expanded', String(open)); }
function persistFilters() { localStorage.setItem('betman-report-filters', JSON.stringify({ leagues: state.selectedLeagueIds ? [...state.selectedLeagueIds] : null, categories: state.selectedCategories ? [...state.selectedCategories] : null, threshold: state.threshold })); }
$('#filter-menu-toggle').addEventListener('click', () => toggleFilterMenu($('#filter-menu-panel').hidden));
$('#filter-menu-close').addEventListener('click', () => toggleFilterMenu(false));
$('#apply-filters').addEventListener('click', () => { const leagues = Array.from(document.querySelectorAll('#league-options input:checked'), (input) => input.value); const allLeagues = document.querySelectorAll('#league-options input').length; const categories = Array.from(document.querySelectorAll('#prediction-options input:checked'), (input) => input.value); const allCategories = document.querySelectorAll('#prediction-options input').length; state.selectedLeagueIds = leagues.length === allLeagues ? null : new Set(leagues); state.selectedCategories = categories.length === allCategories ? null : new Set(categories); state.threshold = Math.max(0, Number($('#prediction-threshold').value) || 0); persistFilters(); toggleFilterMenu(false); updateFilters(); if (state.report) $('#report-body').innerHTML = renderReport(state.report); });
$('#reset-filters').addEventListener('click', () => { state.selectedLeagueIds = null; state.selectedCategories = null; state.threshold = 0; persistFilters(); updateFilters(); if (state.report) $('#report-body').innerHTML = renderReport(state.report); });
window.addEventListener('popstate', () => { const hash = location.hash.slice(1); if (state.reports.has(hash)) { state.month = new Date(Number(hash.slice(0, 4)), Number(hash.slice(4, 6)) - 1, 1); openReport(hash, false); } else showCalendar(); });
let deferredInstall;
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstall = event; $('#install-button').hidden = false; });
$('#install-button').addEventListener('click', async () => { if (!deferredInstall) return; deferredInstall.prompt(); deferredInstall = null; $('#install-button').hidden = true; });
window.addEventListener('offline', () => { $('#offline-status').textContent = t('offline'); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
if (!navigator.onLine) $('#offline-status').textContent = t('offline');
updateReportTabs();
applyLanguage();
loadReports();
