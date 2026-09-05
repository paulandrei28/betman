const savedFilters = (() => {
  try {
    return JSON.parse(
      localStorage.getItem('betman-report-filters')
    ) || {};
  } catch {
    return {};
  }
})();

/* =========================================================
   GLOBAL LEAGUES
   ========================================================= */

const SUPPORTED_LEAGUES = [
  // TOP 6
  { id: '39', name: 'Premier League', group: 'England', priority: 1 },
  { id: '140', name: 'LaLiga', group: 'Spain', priority: 2 },
  { id: '135', name: 'Serie A', group: 'Italy', priority: 3 },
  { id: '78', name: 'Bundesliga', group: 'Germany', priority: 4 },
  { id: '61', name: 'Ligue 1', group: 'France', priority: 5 },
  { id: '283', name: 'SuperLiga', group: 'Romania', priority: 6 },

  // UEFA
  { id: '2', name: 'UEFA Champions League', group: 'UEFA', priority: 7 },
  { id: '3', name: 'UEFA Europa League', group: 'UEFA', priority: 8 },
  { id: '848', name: 'UEFA Conference League', group: 'UEFA', priority: 9 },
  { id: '531', name: 'UEFA Super Cup', group: 'UEFA', priority: 10 },
  { id: '5', name: 'UEFA Nations League', group: 'UEFA', priority: 11 },
  { id: '4', name: 'UEFA Euro', group: 'UEFA', priority: 12 },
  { id: '960', name: 'UEFA Euro Qualifiers', group: 'UEFA', priority: 13 },

  // INTERNATIONAL
  { id: '1', name: 'FIFA World Cup', group: 'FIFA', priority: 14 },
  { id: '15', name: 'FIFA Club World Cup', group: 'FIFA', priority: 15 },
  { id: '13', name: 'Copa Libertadores', group: 'CONMEBOL', priority: 16 },
  { id: '11', name: 'Copa Sudamericana', group: 'CONMEBOL', priority: 17 },

  // ROMANIA
  { id: '286', name: 'Cupa României', group: 'Romania', priority: 18 },

  // ENGLAND
  { id: '45', name: 'FA Cup', group: 'England', priority: 19 },
  { id: '40', name: 'Championship', group: 'England', priority: 20 },
  { id: '48', name: 'EFL Cup', group: 'England', priority: 21 },

  // SPAIN
  { id: '143', name: 'Copa del Rey', group: 'Spain', priority: 22 },
  { id: '141', name: 'LaLiga Hypermotion', group: 'Spain', priority: 23 },
  { id: '556', name: 'Supercopa de España', group: 'Spain', priority: 24 },

  // ITALY
  { id: '137', name: 'Coppa Italia', group: 'Italy', priority: 25 },
  { id: '136', name: 'Serie B', group: 'Italy', priority: 26 },
  { id: '547', name: 'Supercoppa Italiana', group: 'Italy', priority: 27 },

  // GERMANY
  { id: '81', name: 'DFB-Pokal', group: 'Germany', priority: 28 },
  { id: '79', name: '2. Bundesliga', group: 'Germany', priority: 29 },
  { id: '529', name: 'DFL-Supercup', group: 'Germany', priority: 30 },

  // FRANCE
  { id: '66', name: 'Coupe de France', group: 'France', priority: 31 },
  { id: '62', name: 'Ligue 2', group: 'France', priority: 32 },
  { id: '526', name: 'Trophée des Champions', group: 'France', priority: 33 },

  // NETHERLANDS
  { id: '88', name: 'Eredivisie', group: 'Netherlands', priority: 34 },
  { id: '90', name: 'KNVB Beker', group: 'Netherlands', priority: 35 },

  // PORTUGAL
  { id: '94', name: 'Primeira Liga', group: 'Portugal', priority: 36 },
  { id: '96', name: 'Taça de Portugal', group: 'Portugal', priority: 37 },
  { id: '97', name: 'Taça da Liga', group: 'Portugal', priority: 38 },

  // BELGIUM
  { id: '144', name: 'Pro League', group: 'Belgium', priority: 39 },
  { id: '147', name: 'Belgian Cup', group: 'Belgium', priority: 40 },

  // TURKEY
  { id: '203', name: 'Süper Lig', group: 'Turkey', priority: 41 },

  // OTHERS
  { id: 'unknown', name: 'Unknown', group: 'Others', priority: 999 },
];


/* =========================================================
   STATE
   ========================================================= */

const state = {
  reports: new Map(),
  month: new Date(),
  selected: null,
  report: null,
  reportView: 'top',

  selectedLeagueIds: Array.isArray(savedFilters.leagues)
    ? new Set(savedFilters.leagues.map(String))
    : new Set(
        SUPPORTED_LEAGUES
          .filter(
            league =>
              league.priority >= 1 &&
              league.priority <= 13
          )
          .map(
            league => String(league.id)
          )
      ),

  selectedCategories: Array.isArray(savedFilters.categories)
    ? new Set(savedFilters.categories.map(String))
    : null,

  threshold: Math.max(
    0,
    Number(savedFilters.threshold) || 0
  ),

  lang:
  localStorage.getItem('betman-language') ||
  (
    navigator.language &&
    navigator.language.toLowerCase().startsWith('ro')
      ? 'ro'
      : 'en'
  ),
};

const LEAGUE_BY_ID = new Map();

SUPPORTED_LEAGUES.forEach((league) => {
  const id = String(league.id);

  if (!LEAGUE_BY_ID.has(id)) {
    LEAGUE_BY_ID.set(id, {
      ...league,
      id,
    });
  }
});

/* =========================================================
   GENERAL PREDICTION CATEGORIES
   ========================================================= */

const PREDICTION_CATEGORIES = [
  'cards',
  'corners',
  'goals',
  'btts',
  'cleanSheet',
  'firstToScore',
  'winner',
  'other',
];

/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {
  en: {
    archive: 'Archive',
    reports: 'Reports',
    reportArchive: 'Report archive',
    reportCalendar: 'Report calendar',
    reportAvailable: 'Report available',
    reportUnavailable:
      'That report is not available right now.',
    selectedReport: 'Selected report',

    top20: 'Top picks',
    byGame: 'By match',
    byPrediction: 'By market',

    league: 'League',
    allLeagues: 'All leagues',
    minimumPrediction: 'Min. prediction',

    ranked: 'ranked predictions',
    categories: 'categories',
    game: 'game',
    games: 'games',
    prediction: 'prediction',
    predictions: 'predictions',

    directEvidence: 'Evidence',
    supportingEvidence: 'Supporting evidence',
    strengthenedBy: 'Strengthened by',
    conflictingEvidence: 'Conflicting evidence',
    noEvidence: 'No evidence recorded.',
    noPredictions: 'No predictions were generated.',
    strength: 'Score',

    disclaimer:
      'For informational purposes only. Bet responsibly.',

    switchTo: 'Switch to Romanian',
    changeLanguage: 'Change language',

    offline: 'Offline mode',
    loading: 'Loading report...',
    install: 'Install app',

    previousMonth: 'Previous month',
    nextMonth: 'Next month',

    reportView: 'Report view',

    introPick: 'Pick a',
    introMatchday: 'matchday.',
    introSignal: 'Read the signal.',

    categoryCards: 'Cards',
    categoryCorners: 'Corners',
    categoryGoals: 'Goals',
    categoryBtts: 'Both teams scoring',
    categoryCleanSheet: 'Clean sheet',
    categoryFirstToScore: 'First to score',
    categoryWinner: 'Winner / result',
    categoryOther: 'Other predictions',

    selectLeagues: 'Select leagues',
    leagueConfig: 'League selection',
    resetFilters: 'Reset filters',

    minScore: 'Min. score',
    predictionFilter: 'Markets',

    filters: 'Filters',
    activeFilters: 'active',
    selectAll: 'Select all',

    lastGames: 'Last games',
    headToHead: 'Head-to-head',
    otherEvidence: 'Other evidence',
    bothTeams: 'Both teams',
  },

  ro: {
    archive: 'Arhivă',
    reports: 'Rapoarte',
    reportArchive: 'Arhiva rapoartelor',
    reportCalendar: 'Calendarul rapoartelor',
    reportAvailable: 'Raport disponibil',
    reportUnavailable:
      'Raportul nu este disponibil momentan.',
    selectedReport: 'Raport selectat',

    top20: 'Top ponturi',
    byGame: 'Pe meci',
    byPrediction: 'Pe pronostic',

    league: 'Ligă',
    allLeagues: 'Toate ligile',
    minimumPrediction: 'Min. pronostic',

    ranked: 'pronosticuri clasate',
    categories: 'categorii',
    game: 'meci',
    games: 'meciuri',
    prediction: 'pronostic',
    predictions: 'pronosticuri',

    directEvidence: 'Dovezi',
    supportingEvidence: 'Dovezi suplimentare',
    strengthenedBy: 'Susținut de',
    conflictingEvidence: 'Dovezi contradictorii',
    noEvidence: 'Nu există dovezi înregistrate.',
    noPredictions:
      'Nu au fost generate pronosticuri.',
    strength: 'Scor',

    disclaimer:
      'Doar în scop informativ. Joacă responsabil.',

    switchTo: 'Comută în engleză',
    changeLanguage: 'Schimbă limba',

    offline: 'Mod offline',
    loading: 'Se încarcă raportul...',
    install: 'Instalează aplicația',

    previousMonth: 'Luna anterioară',
    nextMonth: 'Luna următoare',

    reportView: 'Vizualizare raport',

    introPick: 'Alege',
    introMatchday: 'ziua meciului.',
    introSignal: 'Descoperă pontul.',

    categoryCards: 'Cartonașe',
    categoryCorners: 'Cornere',
    categoryGoals: 'Goluri',
    categoryBtts: 'Ambele echipe marchează',
    categoryCleanSheet: 'Primește gol',
    categoryFirstToScore: 'Marchează prima',
    categoryWinner: 'Câștigător / rezultat',
    categoryOther: 'Alte pronosticuri',

    selectLeagues: 'Selectează ligile',
    leagueConfig: 'Selectarea ligilor',
    resetFilters: 'Resetează filtrele',

    minScore: 'Min. scor',
    predictionFilter: 'Piețe',

    filters: 'Filtre',
    activeFilters: 'active',
    selectAll: 'Selectează tot',

    lastGames: 'Ultimele meciuri',
    headToHead: 'Confruntări directe',
    otherEvidence: 'Alte dovezi',
    bothTeams: 'Ambele echipe',
  },
};

/*
 * Only country names are translated;
 * competitions and associations (UEFA, FIFA, Top 6, ...)
 * stay in their original form.
 */
const countryGroupTranslations = {
  England: 'Anglia',
  Spain: 'Spania',
  Italy: 'Italia',
  Germany: 'Germania',
  France: 'Franța',
  Romania: 'România',
  Netherlands: 'Olanda',
  Portugal: 'Portugalia',
  Belgium: 'Belgia',
  Turkey: 'Turcia',
};

const translateLeagueGroup = (group) =>
  state.lang === 'ro'
    ? countryGroupTranslations[group] || group
    : group;

const marketTranslations = {
  'less than': 'sub',
  'more than': 'peste',
  cards: 'cartonașe',
  corners: 'cornere',
  goals: 'goluri',
  'both teams scoring':
    'ambele echipe marchează',
  'without clean sheet': 'primește gol',
  'no clean sheet': 'primește gol',
  'first to score': 'marchează prima',
  'first half winner':
    'câștigă prima repriză',
  'no losses': 'fără înfrângere',
  'no wins': 'nu câștigă',
  wins: 'câștigă',
  losses: 'pierde',
  'first to concede':
    'primește primul gol',
};

const evidenceTranslations = {
  general: 'general',
  head2head: 'head-to-head',
  home: 'home',
  away: 'away',
  both: 'head-to-head',
};

/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const t = (key) =>
  translations[state.lang][key] ||
  translations.en[key] ||
  key;

const displayDate = (date) =>
  new Intl.DateTimeFormat(
    state.lang === 'ro'
      ? 'ro-RO'
      : undefined,
    {
      dateStyle: 'long',
    }
  ).format(date);

const dateKey = (
  year,
  month,
  day
) =>
  `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;

const reportDate = (value) =>
  new Date(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6))
  );

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );

const translateMarket = (value) => {
  let result = String(value || '');

  Object.entries(
    marketTranslations
  ).forEach(([from, to]) => {
    result = result.replace(
      new RegExp(from, 'gi'),
      to
    );
  });

  return result;
};

/* =========================================================
   PREDICTION CATEGORY
   ========================================================= */

function predictionCategoryKey(market) {
  const value = String(
    market || ''
  ).toLowerCase();

  if (value.includes('card')) {
    return 'cards';
  }

  if (value.includes('corner')) {
    return 'corners';
  }

  if (
    value.includes('goal') ||
    value.includes('over') ||
    value.includes('under')
  ) {
    return 'goals';
  }

  if (
    value.includes('both teams') ||
    value.includes('btts')
  ) {
    return 'btts';
  }

  if (
    value.includes('clean sheet')
  ) {
    return 'cleanSheet';
  }

  if (
    value.includes('first to score')
  ) {
    return 'firstToScore';
  }

  if (
    value.includes('winner') ||
    value.includes('win') ||
    value.includes('no losses')
  ) {
    return 'winner';
  }

  return 'other';
}

function predictionCategoryLabel(
  category
) {
  const map = {
    cards: t('categoryCards'),
    corners: t('categoryCorners'),
    goals: t('categoryGoals'),
    btts: t('categoryBtts'),
    cleanSheet: t('categoryCleanSheet'),
    firstToScore:
      t('categoryFirstToScore'),
    winner: t('categoryWinner'),
    other: t('categoryOther'),
  };

  return map[category] || category;
}

/* =========================================================
   EVIDENCE
   ========================================================= */

const translateEvidenceText = (
  value,
  prediction
) => {
  let result = String(value)
    .replace(
      /\(home\)/gi,
      `(${prediction?.home || 'home'})`
    )
    .replace(
      /\(away\)/gi,
      `(${prediction?.away || 'away'})`
    );

  if (state.lang === 'en') {
    return result.replace(
      /home \+ away agreement/gi,
      `${prediction?.home || 'home'} + ${
        prediction?.away || 'away'
      } agreement`
    );
  }

  return result
    .replace(
      /general \+ H2H agreement/gi,
      'acord între statisticile generale și meciurile directe'
    )
    .replace(
      /home \+ away agreement/gi,
      `acord între ${
        prediction?.home || 'gazde'
      } și ${
        prediction?.away || 'oaspeți'
      }`
    )
    .replace(
      /both teams first to score patterns/gi,
      'ambele echipe au tendința să marcheze primele'
    )
    .replace(
      /both teams first-score tendencies/gi,
      'tendința ambelor echipe de a marca primele'
    )
    .replace(
      /both teams no clean sheet/gi,
      'ambele echipe primesc gol'
    )
    .replace(
      /both teams no-clean-sheet tendencies/gi,
      'tendința ambelor echipe de a primi gol'
    )
    .replace(
      /first to score \+ first-half winner/gi,
      'marchează prima și câștigă prima repriză'
    )
    .replace(
      /first to score \+ opponent first to concede/gi,
      'marchează prima, iar adversarul primește primul gol'
    )
    .replace(
      /first-half winner \+ first to score/gi,
      'câștigă prima repriză și marchează prima'
    )
    .replace(
      /first-half winner \+ opponent first to concede/gi,
      'câștigă prima repriză, iar adversarul primește primul gol'
    )
    .replace(
      /opponent first to score supports no clean sheet/gi,
      'prima marcare a adversarului susține pronosticul „primește gol”'
    )
    .replace(
      /opponent no clean sheet supports scoring first/gi,
      'faptul că adversarul primește gol susține pronosticul „marchează prima”'
    )
    .replace(
      /general underlying-event conflict/gi,
      'conflict cu statistica generală'
    )
    .replace(
      /head2head underlying-event conflict/gi,
      'conflict cu meciurile directe'
    )
    .replace(
      /without clean sheet/gi,
      'primește gol'
    )
    .replace(
      /no goals conceded/gi,
      'nu primește gol'
    )
    .replace(
      /no losses \+ wins/gi,
      'fără înfrângere și câștigă'
    )
    .replace(
      /no wins \+ losses/gi,
      'nu câștigă și pierde'
    )
    .replace(
      /losses \+ no wins/gi,
      'pierde și nu câștigă'
    )
    .replace(
      /win \+ no losses/gi,
      'câștigă și rămâne fără înfrângere'
    )
    .replace(
      /win \+ opponent loss/gi,
      'câștigă, iar adversarul pierde'
    )
    .replace(
      /over goals/gi,
      'peste limita de goluri'
    );
};

function renderEvidenceItems(
  items,
  prediction
) {
  return items
    .map((item) => {
      const team =
        item.team === 'home'
          ? prediction?.home
          : item.team === 'away'
          ? prediction?.away
          : null;

      const label =
        team ||
        (item.team === 'both'
          ? t('bothTeams')
          : item.team
          ? evidenceTranslations[
              item.team
            ] || item.team
          : t('directEvidence'));

      const name =
        state.lang === 'ro'
          ? translateMarket(
              item.name || ''
            )
          : item.name || '';

      const value =
        translateEvidenceText(
          item.value ?? '',
          prediction
        );

      return `
        <li>
          <strong>
            ${escapeHtml(label)}
          </strong>
          ${
            name
              ? ` ${escapeHtml(name)}:`
              : ''
          }
          ${escapeHtml(
            value || '?'
          )}
        </li>
      `;
    })
    .join('');
}

function renderEvidence(
  items,
  prediction,
  groupBySource = true
) {
  if (!items?.length) {
    return `
      <p class="muted">
        ${t('noEvidence')}
      </p>
    `;
  }

  if (!groupBySource) {
    return `
      <ul>
        ${renderEvidenceItems(
          items,
          prediction
        )}
      </ul>
    `;
  }

  const groups = [
    {
      section: 'general',
      label: t('lastGames'),
    },
    {
      section: 'head2head',
      label: t('headToHead'),
    },
    {
      section: 'other',
      label: t('otherEvidence'),
    },
  ]
    .map((group) => ({
      ...group,
      items: items.filter(
        (item) =>
          (item.section || 'other') ===
          group.section
      ),
    }))
    .filter(
      (group) => group.items.length
    );

  return `
    <div class="evidence-groups">
      ${groups
        .map(
          (group) => `
            <section class="evidence-group">
              <h5>
                ${escapeHtml(
                  group.label
                )}
              </h5>

              <ul>
                ${renderEvidenceItems(
                  group.items,
                  prediction
                )}
              </ul>
            </section>
          `
        )
        .join('')}
    </div>
  `;
}

/* =========================================================
   PREDICTION RENDERING
   ========================================================= */

function renderPrediction(
  prediction,
  summary = `#${escapeHtml(
    prediction.rank ?? '-'
  )} - ${escapeHtml(
    prediction.market
  )}`
) {
  const bonuses =
    prediction.bonuses?.map(
      (value) => ({ value })
    ) || [];

  const penalties =
    prediction.penalties?.map(
      (value) => ({ value })
    ) || [];

  const market =
    state.lang === 'ro'
      ? translateMarket(
          prediction.market
        )
      : prediction.market;

  const translatedSummary =
    summary.replace(
      escapeHtml(
        prediction.market
      ),
      escapeHtml(market)
    );

  return `
    <details>
      <summary>
        ${translatedSummary}
      </summary>

      <div class="prediction">

        <p class="metrics">
          <strong>
            ${t('strength')}
          </strong>
          ${Number(
            prediction.prediction
          ).toFixed(2)}
        </p>

        <h4>
          ${t('directEvidence')}
        </h4>

        ${renderEvidence(
          prediction.evidence,
          prediction
        )}

        ${
          prediction.supporting_evidence
            ?.length
            ? `
              <h4>
                ${t(
                  'supportingEvidence'
                )}
              </h4>

              ${renderEvidence(
                prediction.supporting_evidence,
                prediction
              )}
            `
            : ''
        }

        ${
          bonuses.length
            ? `
              <h4>
                ${t(
                  'strengthenedBy'
                )}
              </h4>

              ${renderEvidence(
                bonuses,
                prediction,
                false
              )}
            `
            : ''
        }

        ${
          penalties.length
            ? `
              <h4>
                ${t(
                  'conflictingEvidence'
                )}
              </h4>

              ${renderEvidence(
                penalties,
                prediction,
                false
              )}
            `
            : ''
        }

      </div>
    </details>
  `;
}

/* =========================================================
   REPORT DATA
   ========================================================= */

function reportPredictions(data) {
  const source =
    data?.predictions ||
    data ||
    {};

  if (Array.isArray(source)) {
    return source;
  }

  return Object.entries(
    source
  ).flatMap(
    ([game, predictions]) =>
      Array.isArray(predictions)
        ? predictions.map(
            (prediction) => ({
              ...prediction,
              league:
                prediction.league || {
                  id: null,
                  name: 'Unknown',
                },
              _game: game,
            })
          )
        : []
  );
}

/* =========================================================
   GLOBAL FILTERING
   ========================================================= */

function filteredPredictions(data) {
  return reportPredictions(data).filter(
    (prediction) => {
      const league =
        prediction.league || {};

      const leagueId = String(
        league.id ?? 'unknown'
      );

      const category =
        predictionCategoryKey(
          prediction.market
        );

      const leagueMatches =
        !state.selectedLeagueIds ||
        state.selectedLeagueIds.has(
          leagueId
        );

      const categoryMatches =
        !state.selectedCategories ||
        state.selectedCategories.has(
          category
        );

      const scoreMatches =
        Number(
          prediction.prediction
        ) >= state.threshold;

      return (
        leagueMatches &&
        categoryMatches &&
        scoreMatches
      );
    }
  );
}

/* =========================================================
   LEAGUES
   ========================================================= */

function compareLeagues(
  left,
  right
) {
  const leftPriority =
    left?.priority ?? 1000;

  const rightPriority =
    right?.priority ?? 1000;

  if (
    leftPriority !==
    rightPriority
  ) {
    return (
      leftPriority -
      rightPriority
    );
  }

  return String(
    left?.name || 'Unknown'
  ).localeCompare(
    String(
      right?.name || 'Unknown'
    ),
    undefined,
    {
      sensitivity: 'base',
    }
  );
}

function getAllLeagues() {
  return Array.from(
    LEAGUE_BY_ID.values()
  ).sort(compareLeagues);
}

function registerReportLeagues(
  data
) {
  reportPredictions(data).forEach(
    (prediction) => {
      const league =
        prediction.league || {
          id: null,
          name: 'Unknown',
        };

      const id = String(
        league.id ?? 'unknown'
      );

      if (!LEAGUE_BY_ID.has(id)) {
        LEAGUE_BY_ID.set(id, {
          id,
          name:
            league.name ||
            'Unknown',
        });
      }
    }
  );
}

function reportLeagues(data) {
  registerReportLeagues(data);

  return getAllLeagues();
}

/* =========================================================
   GAME
   ========================================================= */

function gameName(prediction) {
  return (
    prediction._game ||
    `${prediction.home} - ${prediction.away}`
  );
}

function bestRank(items) {
  return Math.min(
    ...items.map(
      (item) => Number(item.rank) || Infinity
    )
  );
}

function predictionSummary(prediction) {
  return escapeHtml(
    state.lang === 'ro'
      ? translateMarket(prediction.market)
      : prediction.market
  );
}

function renderGameGroup(game, items) {
  return `
    <section class="match">

      <h3>
        ${escapeHtml(game)}
      </h3>

      ${items
        .map((prediction) =>
          renderPrediction(
            prediction,
            predictionSummary(prediction)
          )
        )
        .join('')}

    </section>
  `;
}

/* =========================================================
   BY GAME
   ========================================================= */

function renderByGame(
  predictions,
  count
) {
  const leagues =
    new Map();

  predictions.forEach(
    (prediction) => {
      const league =
        prediction.league || {
          id: null,
          name: 'Unknown',
        };

      const key = String(
        league.id ?? 'unknown'
      );

      if (!leagues.has(key)) {
        leagues.set(key, {
          league:
            LEAGUE_BY_ID.get(key) ||
            league,
          games: new Map(),
        });
      }

      const games =
        leagues.get(key).games;

      const game =
        gameName(prediction);

      if (!games.has(game)) {
        games.set(game, []);
      }

      games
        .get(game)
        .push(prediction);
    }
  );

  return `
    <p class="report-count">
      ${count}
      ${t('ranked')}
    </p>

    ${Array.from(
      leagues.values()
    )
      .sort(
        (left, right) =>
          compareLeagues(
            left.league,
            right.league
          )
      )
      .map(
        ({
          league,
          games,
        }) => `
          <section class="league-section">

            <h3>
              ${escapeHtml(
                league.name ||
                  'Unknown'
              )}
            </h3>

            ${Array.from(
              games.entries()
            )
              .sort(
                (left, right) =>
                  bestRank(left[1]) -
                  bestRank(right[1])
              )
              .map(
                ([game, items]) =>
                  renderGameGroup(
                    game,
                    items
                  )
              )
              .join('')}

          </section>
        `
      )
      .join('')}
  `;
}

/* =========================================================
   BY PREDICTION
   ========================================================= */

function renderByPrediction(
  predictions,
  count
) {
  const categories =
    new Map();

  predictions.forEach(
    (prediction) => {
      const game =
        gameName(prediction);

      const category =
        predictionCategoryLabel(
          predictionCategoryKey(
            prediction.market
          )
        );

      if (!categories.has(category)) {
        categories.set(
          category,
          new Map()
        );
      }

      if (
        !categories
          .get(category)
          .has(game)
      ) {
        categories
          .get(category)
          .set(game, []);
      }

      categories
        .get(category)
        .get(game)
        .push(prediction);
    }
  );

  return `
    <p class="report-count">
      ${count}
      ${t('ranked')}
      ${categories.size}
      ${t('categories')}
    </p>

    ${Array.from(
      categories,
      (
        [category, games]
      ) => `
        <section
          class="prediction-group"
        >

          <h3>
            ${escapeHtml(
              category
            )}

            <span>
              ${games.size}
              ${
                games.size === 1
                  ? t('game')
                  : t('games')
              }
            </span>
          </h3>

          ${Array.from(
            games,
            (
              [game, predictions]
            ) =>
              renderGameGroup(
                game,
                predictions
              )
          ).join('')}

        </section>
      `
    ).join('')}
  `;
}

/* =========================================================
   TOP 20
   ========================================================= */

function renderTop(
  predictions,
  count
) {
  const games =
    new Map();

  predictions
    .slice(0, 20)
    .forEach((prediction) => {
      const game =
        gameName(prediction);

      if (!games.has(game)) {
        games.set(game, []);
      }

      games
        .get(game)
        .push(prediction);
    });

  return `
    <p class="report-count">
      ${count}
      ${t('ranked')}
    </p>

    ${Array.from(
      games.entries()
    )
      .sort(
        (left, right) =>
          bestRank(left[1]) -
          bestRank(right[1])
      )
      .map(
        ([game, items]) =>
          renderGameGroup(
            game,
            items
          )
      )
      .join('')}
  `;
}

/* =========================================================
   REPORT
   ========================================================= */

function renderReport(data) {
  const predictions =
    filteredPredictions(data);

  if (!predictions.length) {
    return `
      <p class="muted">
        ${t('noPredictions')}
      </p>
    `;
  }

  if (
    state.reportView ===
    'prediction'
  ) {
    return renderByPrediction(
      predictions,
      predictions.length
    );
  }

  if (
    state.reportView ===
    'games'
  ) {
    return renderByGame(
      predictions,
      predictions.length
    );
  }

  return renderTop(
    predictions,
    Math.min(predictions.length, 20)
  );
}

/* =========================================================
   GLOBAL FILTER MENU
   ========================================================= */

function mountFilterMenu() {
  const controls =
    document.querySelector(
      '.topbar-actions'
    );

  if (!controls) {
    return;
  }

  const menu =
    document.createElement(
      'div'
    );

  menu.className =
    'filter-menu';

  menu.innerHTML = `
    <button
      id="filter-menu-toggle"
      class="filter-menu-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="filter-menu-panel"
      title="${escapeHtml(
        t('filters')
      )}"
    >

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 7h10M18 7h2M4 17h3M11 17h9M14 4v6M7 14v6"
        />
      </svg>

      <span
        data-i18n="filters"
      >
        Filters
      </span>

      <span
        id="filter-count"
        class="filter-count"
        hidden
      ></span>

    </button>

    <div
      id="filter-menu-panel"
      class="filter-menu-panel"
      hidden
    >

      <div
        class="filter-menu-heading"
      >

        <div>
          <p data-i18n="filters">
            Filters
          </p>
        </div>

        <button
          id="reset-filters"
          class="filter-reset-icon"
          type="button"
          aria-label="${escapeHtml(t('resetFilters'))}"
          title="${escapeHtml(t('resetFilters'))}"
        >
          <span aria-hidden="true">↻</span>
        </button>

      </div>

      <div class="filter-fields">

        <label>
          <span
            data-i18n="minScore"
          >
            Min. score
          </span>

          <input
            id="prediction-threshold"
            type="number"
            min="0"
            step="5"
            value="0"
          >
        </label>

      </div>

      <div
        class="filter-section"
      >

        <div class="filter-section-heading">

          <p
            data-i18n="predictionFilter"
          >
            Markets
          </p>

          <label class="filter-select-all">
            <input
              type="checkbox"
              id="select-all-markets"
            >
            <span data-i18n="selectAll">
              Select all
            </span>
          </label>

        </div>

        <div
          id="prediction-options"
          class="filter-options"
        ></div>

      </div>

      <div
        class="filter-section"
      >

        <div class="filter-section-heading">

          <p
            data-i18n="leagueConfig"
          >
            League selection
          </p>

          <label class="filter-select-all">
            <input
              type="checkbox"
              id="select-all-leagues"
            >
            <span data-i18n="selectAll">
              Select all
            </span>
          </label>

        </div>

        <div
          id="league-options"
          class="filter-options"
        ></div>

      </div>

    </div>
  `;

  controls.prepend(menu);
}

/* =========================================================
   FILTER UI STATE
   ========================================================= */

function updateFilterBadge() {
  const leagues =
    getAllLeagues();

  const selectedLeagueCount =
    state.selectedLeagueIds
      ? leagues.filter(
          (league) =>
            state.selectedLeagueIds.has(
              String(league.id)
            )
        ).length
      : leagues.length;

  const selectedCategoryCount =
    state.selectedCategories
      ? PREDICTION_CATEGORIES.filter(
          (category) =>
            state.selectedCategories.has(
              category
            )
        ).length
      : PREDICTION_CATEGORIES.length;

  const leagueFilterActive =
    selectedLeagueCount !==
    leagues.length;

  const categoryFilterActive =
    selectedCategoryCount !==
    PREDICTION_CATEGORIES.length;

  const activeCount =
    Number(
      state.threshold > 0
    ) +
    Number(
      leagueFilterActive
    ) +
    Number(
      categoryFilterActive
    );

  const badge =
    $('#filter-count');

  if (badge) {
    badge.hidden =
      activeCount === 0;

    badge.textContent =
      activeCount;
  }
}

function syncSelectAllCheckbox(
  id,
  container
) {
  const selectAll =
    document.getElementById(id);

  if (!selectAll || !container) {
    return;
  }

  const options =
    Array.from(
      container.querySelectorAll(
        'input[type="checkbox"]'
      )
    );

  const checkedCount =
    options.filter(
      (option) => option.checked
    ).length;

  selectAll.checked =
    options.length > 0 &&
    checkedCount === options.length;

  selectAll.indeterminate =
    checkedCount > 0 &&
    checkedCount < options.length;
}

function updateFilters() {
  const predictionOptions =
    document.getElementById(
      'prediction-options'
    );

  const leagueOptions =
    document.getElementById(
      'league-options'
    );

  const thresholdInput =
    document.getElementById(
      'prediction-threshold'
    );

  if (
    !predictionOptions ||
    !leagueOptions
  ) {
    return;
  }

  /* =========================================================
     MARKETS
     ========================================================= */

  const categories = [
    {
      key: 'cards',
      label: t('categoryCards'),
    },
    {
      key: 'corners',
      label: t('categoryCorners'),
    },
    {
      key: 'goals',
      label: t('categoryGoals'),
    },
    {
      key: 'btts',
      label: t('categoryBtts'),
    },
    {
      key: 'cleanSheet',
      label: t('categoryCleanSheet'),
    },
    {
      key: 'firstToScore',
      label: t('categoryFirstToScore'),
    },
    {
      key: 'winner',
      label: t('categoryWinner'),
    },
    {
      key: 'other',
      label: t('categoryOther'),
    },
  ];

  predictionOptions.innerHTML =
    categories
      .map((category) => {
        const checked =
          state.selectedCategories === null ||
          state.selectedCategories.has(
            category.key
          );

        return `
          <label class="filter-option">
            <input
              type="checkbox"
              class="category-filter"
              value="${escapeHtml(
                category.key
              )}"
              ${checked ? 'checked' : ''}
            >
            <span>
              ${escapeHtml(
                category.label
              )}
            </span>
          </label>
        `;
      })
      .join('');


  /* =========================================================
     LEAGUES
     ========================================================= */

  const leagues =
    getAllLeagues();

  /*
   * Group leagues by their configured group.
   *
   * Priorities 1-6 are shown together
   * under "Top 6".
   */

  const groupedLeagues =
    new Map();

  leagues.forEach((league) => {
    let group;

    if (
      league.priority >= 1 &&
      league.priority <= 6
    ) {
      group = 'Top 6';
    } else {
      group =
        league.group ||
        'Others';
    }

    if (
      !groupedLeagues.has(group)
    ) {
      groupedLeagues.set(
        group,
        []
      );
    }

    groupedLeagues
      .get(group)
      .push(league);
  });


  leagueOptions.innerHTML =
    Array.from(
      groupedLeagues.entries()
    )
      .map(
        ([group, groupLeagues]) => `
          <div class="filter-league-group">

            <div class="filter-league-group-title">
              ${escapeHtml(
                translateLeagueGroup(group)
              )}
            </div>

            <div class="filter-league-group-options">

              ${groupLeagues
                .map((league) => {
                  const id =
                    String(
                      league.id
                    );

                  const checked =
                    state.selectedLeagueIds === null ||
                    state.selectedLeagueIds.has(
                      id
                    );

                  return `
                    <label class="filter-option">

                      <input
                        type="checkbox"
                        class="league-filter"
                        value="${escapeHtml(
                          id
                        )}"
                        ${checked ? 'checked' : ''}
                      >

                      <span>
                        ${escapeHtml(
                          league.name
                        )}
                      </span>

                    </label>
                  `;
                })
                .join('')}

            </div>

          </div>
        `
      )
      .join('');


  /* =========================================================
     THRESHOLD
     ========================================================= */

  if (thresholdInput) {
    thresholdInput.value =
      state.threshold;
  }


  /* =========================================================
     SELECT ALL
     ========================================================= */

  syncSelectAllCheckbox(
    'select-all-markets',
    predictionOptions
  );

  syncSelectAllCheckbox(
    'select-all-leagues',
    leagueOptions
  );


  /* =========================================================
     FILTER BADGE
     ========================================================= */

  const filterCount =
    document.getElementById(
      'filter-count'
    );

  if (filterCount) {
    let count = 0;

    if (
      state.selectedLeagueIds !==
      null
    ) {
      count++;
    }

    if (
      state.selectedCategories !==
      null
    ) {
      count++;
    }

    if (
      state.threshold > 0
    ) {
      count++;
    }

    filterCount.textContent =
      count;

    filterCount.hidden =
      count === 0;
  }
}

/* =========================================================
   APPLY FILTERS IMMEDIATELY
   ========================================================= */

function applyCurrentFilterSelection() {
  const checkedLeagues =
    Array.from(
      document.querySelectorAll(
        '#league-options input:checked'
      ),
      (input) =>
        input.value
    );

  const allLeagues =
    document.querySelectorAll(
      '#league-options input'
    ).length;

  const checkedCategories =
    Array.from(
      document.querySelectorAll(
        '#prediction-options input:checked'
      ),
      (input) =>
        input.value
    );

  state.selectedLeagueIds =
    checkedLeagues.length ===
    allLeagues
      ? null
      : new Set(
          checkedLeagues
        );

  state.selectedCategories =
    checkedCategories.length ===
    PREDICTION_CATEGORIES.length
      ? null
      : new Set(
          checkedCategories
        );

  state.threshold =
    Math.max(
      0,
      Number(
        $('#prediction-threshold')
          .value
      ) || 0
    );

  persistFilters();

  updateFilterBadge();

  syncSelectAllCheckbox(
    'select-all-markets',
    document.getElementById(
      'prediction-options'
    )
  );

  syncSelectAllCheckbox(
    'select-all-leagues',
    document.getElementById(
      'league-options'
    )
  );

  if (
    state.report
  ) {
    $('#report-body').innerHTML =
      renderReport(
        state.report
      );
  }
}

/* =========================================================
   RESET GLOBAL FILTERS
   ========================================================= */

function resetFilters() {
  /*
   * Reset leagues to the default selection:
   * priorities 1 through 13.
   */
  state.selectedLeagueIds =
    new Set(
      SUPPORTED_LEAGUES
        .filter(
          (league) =>
            league.priority >= 1 &&
            league.priority <= 13
        )
        .map(
          (league) =>
            String(league.id)
        )
    );

  /*
   * All market categories enabled.
   */
  state.selectedCategories =
    null;

  /*
   * No minimum score.
   */
  state.threshold = 0;

  /*
   * Save the default state.
   */
  persistFilters();

  /*
   * Refresh the filter UI.
   */
  updateFilters();

  /*
   * Refresh the current report.
   */
  if (state.report) {
    $('#report-body').innerHTML =
      renderReport(
        state.report
      );
  }

  /*
   * Update the filter badge.
   */
  updateFilterBadge();
}
   
/* =========================================================
   REPORT TABS
   ========================================================= */

function updateReportTabs() {
  document
    .querySelectorAll(
      '[data-report-view]'
    )
    .forEach((button) => {
      const active =
        button.dataset.reportView ===
        state.reportView;

      button.classList.toggle(
        'active',
        active
      );

      button.setAttribute(
        'aria-selected',
        String(active)
      );
    });
}

/* =========================================================
   LANGUAGE
   ========================================================= */

function applyLanguage() {
  document.documentElement.lang =
    state.lang;

  document
    .querySelectorAll(
      '[data-i18n]'
    )
    .forEach(
      (element) => {
        element.textContent =
          t(
            element.dataset
              .i18n
          );
      }
    );

  const weekdays =
    state.lang === 'ro'
      ? [
          'Dum',
          'Lun',
          'Mar',
          'Mie',
          'Joi',
          'Vin',
          'Sâm',
        ]
      : [
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
        ];

  document
    .querySelectorAll(
      '[data-weekday]'
    )
    .forEach(
      (element) => {
        element.textContent =
          weekdays[
            Number(
              element.dataset
                .weekday
            )
          ];
      }
    );

  $('#previous-month').setAttribute(
    'aria-label',
    t('previousMonth')
  );

  $('#next-month').setAttribute(
    'aria-label',
    t('nextMonth')
  );

  $('#report-tabs').setAttribute(
    'aria-label',
    t('reportView')
  );

  $('.workspace').setAttribute(
    'aria-label',
    t('reportArchive')
  );

  $('#calendar').setAttribute(
    'aria-label',
    t('reportCalendar')
  );

  const toggle =
    $('#language-toggle');

  const targetLanguage =
    state.lang === 'en'
      ? 'RO'
      : 'EN';

  toggle.innerHTML = `
    <span
      class="language-flag"
      aria-hidden="true"
    >
      ${
        state.lang === 'en'
          ? '🇷🇴'
          : '🇬🇧'
      }
    </span>

    <span
      class="language-code"
      aria-hidden="true"
    >
      ${targetLanguage}
    </span>
  `;

  toggle.setAttribute(
    'aria-label',
    t('switchTo')
  );

  toggle.title =
    t('changeLanguage');

  $('#month-label').textContent =
    new Intl.DateTimeFormat(
      state.lang === 'ro'
        ? 'ro-RO'
        : undefined,
      {
        month: 'long',
        year: 'numeric',
      }
    ).format(state.month);

  updateFilters();

  if (state.report) {
    $('#report-heading').textContent =
      displayDate(
        reportDate(
          state.selected
        )
      );

    $('#report-body').innerHTML =
      renderReport(
        state.report
      );
  }

  renderCalendar();
}

/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {
  const year =
    state.month.getFullYear();

  const month =
    state.month.getMonth();

  $('#month-label').textContent =
    new Intl.DateTimeFormat(
      state.lang === 'ro'
        ? 'ro-RO'
        : undefined,
      {
        month: 'long',
        year: 'numeric',
      }
    ).format(state.month);

  const firstDay =
    (
      new Date(
        year,
        month,
        1
      ).getDay() + 6
    ) % 7;

  const days =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const today =
    new Date();

  const calendar =
    $('#calendar');

  calendar.innerHTML = '';

  for (
    let index = 0;
    index < firstDay;
    index += 1
  ) {
    calendar.append(
      document.createElement(
        'span'
      )
    );
  }

  for (
    let day = 1;
    day <= days;
    day += 1
  ) {
    const date =
      dateKey(
        year,
        month,
        day
      );

    const button =
      document.createElement(
        'button'
      );

    button.className =
      'day';

    button.type =
      'button';

    button.textContent =
      day;

    button.setAttribute(
      'aria-label',
      displayDate(
        new Date(
          year,
          month,
          day
        )
      )
    );

    if (
      date ===
      dateKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    ) {
      button.classList.add(
        'today'
      );
    }

    if (
      state.reports.has(
        date
      )
    ) {
      button.classList.add(
        'has-report'
      );

      button.addEventListener(
        'click',
        () =>
          openReport(date)
      );
    } else {
      button.disabled =
        true;
    }

    if (
      date ===
      state.selected
    ) {
      button.classList.add(
        'selected'
      );
    }

    calendar.append(
      button
    );
  }
}

/* =========================================================
   OPEN REPORT
   ========================================================= */

async function openReport(
  date,
  updateHistory = true
) {
  const entry =
    state.reports.get(
      date
    );

  if (!entry) {
    return;
  }

  state.selected =
    date;

  state.reportView =
    'top';

  state.report =
    null;

  updateReportTabs();

  document.body.classList.add(
    'report-focus'
  );

  $('.workspace').classList.add(
    'report-focus'
  );

  $('.report-panel').hidden =
    false;

  renderCalendar();

  $('#report-error').hidden =
    true;

  $('#report-content').hidden =
    true;

  $('#report-loading').hidden =
    false;

  if (updateHistory) {
    history.pushState(
      null,
      '',
      `#${date}`
    );
  }

  try {
    const reportUrl =
      new URL(
        entry.report ||
          entry.analysis,
        document.baseURI
      );

    const response =
      await fetch(
        reportUrl,
        {
          cache:
            'no-store',
        }
      );

    if (!response.ok) {
      throw Error();
    }

    state.report =
      await response.json();

    registerReportLeagues(
      state.report
    );

    $('#report-heading').textContent =
      displayDate(
        reportDate(date)
      );

    updateFilters();

    $('#report-body').innerHTML =
      renderReport(
        state.report
      );

    $('#report-content').hidden =
      false;
  } catch (error) {
    $('#report-error').hidden =
      false;
  } finally {
    $('#report-loading').hidden =
      true;
  }
}

/* =========================================================
   CALENDAR VIEW
   ========================================================= */

function showCalendar() {
  state.selected =
    null;

  document.body.classList.remove(
    'report-focus'
  );

  $('.workspace').classList.remove(
    'report-focus'
  );

  $('.report-panel').hidden =
    true;

  $('#report-content').hidden =
    true;

  $('#report-loading').hidden =
    true;

  $('#report-error').hidden =
    true;

  renderCalendar();
}

/* =========================================================
   REPORT INDEX
   ========================================================= */

async function loadReports() {
  try {
    const response =
      await fetch(
        new URL(
          'data/reports.json',
          document.baseURI
        ),
        {
          cache:
            'no-store',
        }
      );

    if (!response.ok) {
      throw Error();
    }

    const payload =
      await response.json();

    const reports =
      Array.isArray(
        payload?.reports
      )
        ? payload.reports
        : [];

    for (
      const entry of reports
    ) {
      if (
        entry?.date &&
        (entry.report ||
          entry.analysis)
      ) {
        state.reports.set(
          entry.date,
          entry
        );
      }
    }

    renderCalendar();

    const hash =
      location.hash.slice(1);

    if (
      state.reports.has(
        hash
      )
    ) {
      state.month =
        new Date(
          Number(
            hash.slice(0, 4)
          ),
          Number(
            hash.slice(4, 6)
          ) - 1,
          1
        );

      openReport(
        hash,
        false
      );
    }
  } catch (error) {
    state.reports.clear();

    renderCalendar();

    $('.report-panel').hidden =
      false;

    $('#report-error').hidden =
      false;
  }
}

/* =========================================================
   FILTER MENU
   ========================================================= */

let filterMenuHistoryPushed = false;

function toggleFilterMenu(
  open
) {
  const panel =
    $('#filter-menu-panel');

  const toggle =
    $('#filter-menu-toggle');

  if (!panel || !toggle) {
    return;
  }

  if (open === !panel.hidden) {
    return;
  }

  panel.hidden =
    !open;

  toggle.setAttribute(
    'aria-expanded',
    String(open)
  );

  /*
   * Push a dummy history entry while open so the
   * phone/browser back button closes the menu
   * instead of leaving the page.
   */
  if (open) {
    history.pushState(
      { filterMenu: true },
      '',
      location.href
    );

    filterMenuHistoryPushed = true;
  } else if (filterMenuHistoryPushed) {
    filterMenuHistoryPushed = false;

    history.back();
  }
}

/* =========================================================
   PERSISTENCE
   ========================================================= */

function persistFilters() {
  localStorage.setItem(
    'betman-report-filters',
    JSON.stringify({
      leagues:
        state.selectedLeagueIds
          ? [
              ...state.selectedLeagueIds,
            ]
          : null,

      categories:
        state.selectedCategories
          ? [
              ...state.selectedCategories,
            ]
          : null,

      threshold:
        state.threshold,
    })
  );
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

mountFilterMenu();

updateFilters();

/* =========================================================
   CALENDAR BUTTONS
   ========================================================= */

$('#previous-month').addEventListener(
  'click',
  () => {
    state.month.setMonth(
      state.month.getMonth() -
        1
    );

    renderCalendar();
  }
);

$('#next-month').addEventListener(
  'click',
  () => {
    state.month.setMonth(
      state.month.getMonth() +
        1
    );

    renderCalendar();
  }
);

/* =========================================================
   LANGUAGE
   ========================================================= */

$('#language-toggle').addEventListener(
  'click',
  () => {
    state.lang =
      state.lang === 'en'
        ? 'ro'
        : 'en';

    localStorage.setItem(
      'betman-language',
      state.lang
    );

    applyLanguage();
  }
);

/* =========================================================
   REPORT TABS
   ========================================================= */

document
  .querySelectorAll(
    '[data-report-view]'
  )
  .forEach(
    (button) =>
      button.addEventListener(
        'click',
        () => {
          state.reportView =
            button.dataset
              .reportView;

          updateReportTabs();

          if (
            state.report
          ) {
            $('#report-body').innerHTML =
              renderReport(
                state.report
              );
          }
        }
      )
  );

/* =========================================================
   OPEN / CLOSE GLOBAL FILTER
   ========================================================= */

$('#filter-menu-toggle').addEventListener(
  'click',
  () => {
    toggleFilterMenu(
      $('#filter-menu-panel')
        .hidden
    );
  }
);

$('#filter-menu-close')?.addEventListener(
  'click',
  () => {
    toggleFilterMenu(false);
  }
);

/* =========================================================
   RESET BUTTON
   ========================================================= */

$('#reset-filters').addEventListener(
  'click',
  (event) => {
    event.preventDefault();

    resetFilters();
  }
);

/* =========================================================
   LIVE FILTERING
   ========================================================= */

/*
 * League checkboxes:
 * apply immediately.
 */
document.addEventListener(
  'change',
  (event) => {
    if (
      event.target.matches(
        '#league-options input[type="checkbox"]'
      )
    ) {
      applyCurrentFilterSelection();
    }

    if (
      event.target.matches(
        '#prediction-options input[type="checkbox"]'
      )
    ) {
      applyCurrentFilterSelection();
    }

    if (
      event.target.id ===
      'select-all-leagues'
    ) {
      document
        .querySelectorAll(
          '#league-options input[type="checkbox"]'
        )
        .forEach((option) => {
          option.checked =
            event.target.checked;
        });

      applyCurrentFilterSelection();
    }

    if (
      event.target.id ===
      'select-all-markets'
    ) {
      document
        .querySelectorAll(
          '#prediction-options input[type="checkbox"]'
        )
        .forEach((option) => {
          option.checked =
            event.target.checked;
        });

      applyCurrentFilterSelection();
    }
  }
);

/*
 * Score:
 * apply while typing/changing.
 */
$('#prediction-threshold').addEventListener(
  'input',
  () => {
    applyCurrentFilterSelection();
  }
);

/*
 * Closing does NOT apply anything,
 * because everything is already live.
 */
document.addEventListener(
  'click',
  (event) => {
    const menu =
      $('.filter-menu');

    const panel =
      $('#filter-menu-panel');

    if (
      !panel ||
      panel.hidden ||
      !menu
    ) {
      return;
    }

    if (
      !menu.contains(
        event.target
      )
    ) {
      toggleFilterMenu(false);
    }
  }
);

/*
 * Escape closes the menu.
 */
document.addEventListener(
  'keydown',
  (event) => {
    if (
      event.key ===
      'Escape'
    ) {
      toggleFilterMenu(false);
    }
  }
);

/* =========================================================
   BROWSER HISTORY
   ========================================================= */

window.addEventListener(
  'popstate',
  () => {
    const panel =
      $('#filter-menu-panel');

    /*
     * Back button while the filter menu is open:
     * just close it, don't navigate away.
     */
    if (panel && !panel.hidden) {
      filterMenuHistoryPushed = false;

      panel.hidden = true;

      $('#filter-menu-toggle')?.setAttribute(
        'aria-expanded',
        'false'
      );

      return;
    }

    const hash =
      location.hash.slice(1);

    if (
      state.reports.has(
        hash
      )
    ) {
      state.month =
        new Date(
          Number(
            hash.slice(0, 4)
          ),
          Number(
            hash.slice(4, 6)
          ) - 1,
          1
        );

      openReport(
        hash,
        false
      );
    } else {
      showCalendar();
    }
  }
);

/* =========================================================
   PWA INSTALL
   ========================================================= */

let deferredInstall;

window.addEventListener(
  'beforeinstallprompt',
  (event) => {
    event.preventDefault();

    deferredInstall =
      event;

    $('#install-button').hidden =
      false;
  }
);

$('#install-button').addEventListener(
  'click',
  async () => {
    if (!deferredInstall) {
      return;
    }

    deferredInstall.prompt();

    deferredInstall =
      null;

    $('#install-button').hidden =
      true;
  }
);

/* =========================================================
   OFFLINE
   ========================================================= */

window.addEventListener(
  'offline',
  () => {
    $('#offline-status').textContent =
      t('offline');
  }
);

if (
  'serviceWorker' in
  navigator
) {
  navigator.serviceWorker.register(
    'sw.js',
    {
      updateViaCache:
        'none',
    }
  );
}

if (!navigator.onLine) {
  $('#offline-status').textContent =
    t('offline');
}

/* =========================================================
   START
   ========================================================= */

updateReportTabs();
applyLanguage();
loadReports();
