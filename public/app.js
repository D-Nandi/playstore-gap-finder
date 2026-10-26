/**
 * PLAY STORE GAP FINDER - FRONTEND CLIENT APPLICATION
 * Features:
 * - Dynamic configuration: COUNTRY, MAX_RATING, MIN_REVIEWS, PRICE
 * - Live SSE Streaming search & real-time progress
 * - RFC 4180 Compliant CSV Export (with UTF-8 BOM)
 * - Excel (.xlsx) Export
 * - Sorting, filtering, KPI calculations, and modal inspect
 */

// All 24 default target niche keywords from scraper.mjs
const ALL_NICHE_KEYWORDS = [
    'study planner', 'school planner', 'homework tracker', 'pomodoro timer',
    'pdf annotator', 'digital planner', 'flashcards pro', 'habit tracker pro',
    'mind map pro', 'daily agenda', 'gpa calculator', 'lecture notes',
    'scientific calculator pro', 'file manager pro', 'document scanner pro',
    'ip camera viewer pro', 'wifi analyzer pro', 'audio recorder pro',
    'unit converter pro', 'automation tool', 'clipboard manager pro', 'qr scanner pro',
    'math games kids', 'chess tutor'
];

// Curated Category definitions mapped to Google Play Categories and terms
const CATEGORY_DEFINITIONS = {
    PRODUCTIVITY: {
        title: 'Productivity',
        gplayCat: 'PRODUCTIVITY',
        terms: ['study planner', 'pomodoro timer', 'pdf annotator', 'digital planner', 'flashcards pro', 'habit tracker pro', 'daily agenda', 'mind map pro']
    },
    EDUCATION: {
        title: 'Educational',
        gplayCat: 'EDUCATION',
        terms: ['math games kids', 'spelling game', 'phonics game', 'coding game kids', 'geography quiz pro', 'chess tutor', 'language learning pro']
    },
    TOOLS: {
        title: 'Tools & Utilities',
        gplayCat: 'TOOLS',
        terms: ['scientific calculator pro', 'document scanner pro', 'wifi analyzer pro', 'audio recorder pro', 'file manager pro', 'clipboard manager pro', 'unit converter pro']
    },
    GAMES: {
        title: 'Games & Puzzles',
        gplayCat: 'GAME_PUZZLE',
        terms: ['brain training pro', 'logic puzzle educational', 'chess tutor', 'sudoku pro', 'puzzle games kids', 'math puzzle']
    },
    BUSINESS: {
        title: 'Business & Finance',
        gplayCat: 'BUSINESS',
        terms: ['invoice maker pro', 'receipt scanner', 'budget planner pro', 'expense tracker pro']
    },
    HEALTH: {
        title: 'Health & Fitness',
        gplayCat: 'HEALTH_AND_FITNESS',
        terms: ['workout planner pro', 'calorie counter pro', 'fasting tracker pro', 'stretch routine', 'posture tracker']
    },
    ALL: {
        title: 'All Categories',
        gplayCat: '',
        terms: ALL_NICHE_KEYWORDS
    }
};

// Application State
const state = {
    countries: ['in'],
    categories: ['PRODUCTIVITY', 'TOOLS'],
    maxRating: 3.5,
    minReviews: 100,
    monetization: ['paid', 'iap'],
    numLimit: 50,
    activeTerms: '',
    isScanning: false,
    eventSource: null,
    results: [], // Raw matched app objects
    filteredResults: [] // Filtered and sorted matches
};

// DOM Elements Cache
const DOM = {
    // Config elements - Country
    countryGroup: document.getElementById('countryGroup'),
    countryCheckboxes: document.querySelectorAll('#countryGroup input[name="country"]'),
    quickSelectIndia: document.getElementById('quickSelectIndia'),
    quickSelectTier1: document.getElementById('quickSelectTier1'),
    selectAllCountries: document.getElementById('selectAllCountries'),

    // Ratings & Reviews
    maxRatingSlider: document.getElementById('maxRatingSlider'),
    maxRatingInput: document.getElementById('maxRatingInput'),
    maxRatingBadge: document.getElementById('maxRatingBadge'),
    minReviewsInput: document.getElementById('minReviewsInput'),
    minReviewsBadge: document.getElementById('minReviewsBadge'),

    // Monetization
    monetizationGroup: document.getElementById('monetizationGroup'),
    monetizationCheckboxes: document.querySelectorAll('#monetizationGroup input[name="monetization"]'),
    priceBadge: document.getElementById('priceBadge'),
    resetConfigBtn: document.getElementById('resetConfigBtn'),
    activeCodeSnippet: document.getElementById('activeCodeSnippet'),
    copyConfigBtn: document.getElementById('copyConfigBtn'),
    activeConfigBadge: document.getElementById('activeConfigBadge'),

    // Search & Category elements
    searchForm: document.getElementById('searchForm'),
    searchQueryInput: document.getElementById('searchQueryInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    scanBtn: document.getElementById('scanBtn'),
    stopScanBtn: document.getElementById('stopScanBtn'),
    numLimitSelect: document.getElementById('numLimitSelect'),
    deepCrawlCheck: document.getElementById('deepCrawlCheck'),
    categoryCheckboxesGroup: document.getElementById('categoryCheckboxesGroup'),
    categoryCheckboxes: document.querySelectorAll('#categoryCheckboxesGroup input[name="category"]'),
    selectAllCategories: document.getElementById('selectAllCategories'),
    quickSelectCoreCats: document.getElementById('quickSelectCoreCats'),

    // Status & Progress elements
    systemStatusPill: document.getElementById('systemStatusPill'),
    systemStatusText: document.getElementById('systemStatusText'),
    scanProgressBox: document.getElementById('scanProgressBox'),
    progressStatusText: document.getElementById('progressStatusText'),
    progressPercentText: document.getElementById('progressPercentText'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressCheckedCount: document.getElementById('progressCheckedCount'),
    progressMatchCount: document.getElementById('progressMatchCount'),
    progressCurrentApp: document.getElementById('progressCurrentApp'),

    // Results & Exports
    resultsSection: document.getElementById('resultsSection'),
    resultsCountBadge: document.getElementById('resultsCountBadge'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportXlsxBtn: document.getElementById('exportXlsxBtn'),
    clearResultsBtn: document.getElementById('clearResultsBtn'),
    filterResultsInput: document.getElementById('filterResultsInput'),
    sortBySelect: document.getElementById('sortBySelect'),
    resultsTableBody: document.getElementById('resultsTableBody'),
    emptyStateRow: document.getElementById('emptyStateRow'),
    emptyCountryTxt: document.getElementById('emptyCountryTxt'),
    emptyRatingTxt: document.getElementById('emptyRatingTxt'),
    emptyReviewsTxt: document.getElementById('emptyReviewsTxt'),

    // Metrics
    metricTotalApps: document.getElementById('metricTotalApps'),
    metricAvgRating: document.getElementById('metricAvgRating'),
    metricTotalReviews: document.getElementById('metricTotalReviews'),
    metricAvgPrice: document.getElementById('metricAvgPrice'),

    // Modal & Toast
    toastContainer: document.getElementById('toastContainer'),
    appDetailsModal: document.getElementById('appDetailsModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalAppIcon: document.getElementById('modalAppIcon'),
    modalAppTitle: document.getElementById('modalAppTitle'),
    modalAppDeveloper: document.getElementById('modalAppDeveloper'),
    modalAppRating: document.getElementById('modalAppRating'),
    modalAppRatingsCount: document.getElementById('modalAppRatingsCount'),
    modalAppPrice: document.getElementById('modalAppPrice'),
    modalAppCategory: document.getElementById('modalAppCategory'),
    modalPackageId: document.getElementById('modalPackageId'),
    copyPackageIdBtn: document.getElementById('copyPackageIdBtn'),
    modalAppSummary: document.getElementById('modalAppSummary'),
    modalDemandReviews: document.getElementById('modalDemandReviews'),
    modalRatingScore: document.getElementById('modalRatingScore'),
    modalPlayStoreLink: document.getElementById('modalPlayStoreLink')
};

// ============================================================
// CONFIGURATION HANDLERS
// ============================================================

function updateConfigDisplay() {
    // Current country codes
    const cList = state.countries;
    const cStr = cList.map(c => c.toUpperCase()).join(', ');
    DOM.emptyCountryTxt.textContent = cStr || 'IN';

    // Max rating
    DOM.maxRatingBadge.textContent = `≤ ${Number(state.maxRating).toFixed(1)}★`;
    DOM.emptyRatingTxt.textContent = `${Number(state.maxRating).toFixed(1)}★`;

    // Min reviews
    DOM.minReviewsBadge.textContent = `≥ ${state.minReviews}`;
    DOM.emptyReviewsTxt.textContent = `${state.minReviews}`;

    // Monetization badge
    const modelLabels = { paid: 'Pure Paid', iap: 'IAP Subscriptions', ads: 'Ads', free: 'Free' };
    const activeNames = state.monetization.map(m => modelLabels[m] || m);
    DOM.priceBadge.textContent = activeNames.join(' + ') || 'Paid + IAP';

    // Live code snippet
    const monStr = state.monetization.map(m => `'${m}'`).join(', ');
    const countryCodeStr = cList.map(c => `'${c}'`).join(', ');
    const catCodeStr = state.categories.map(c => `'${c}'`).join(', ');
    DOM.activeCodeSnippet.textContent = `const COUNTRY = [${countryCodeStr}]; const CATEGORIES = [${catCodeStr}]; const MAX_RATING = ${Number(state.maxRating).toFixed(1)}; const MIN_REVIEWS = ${state.minReviews}; const MONETIZATION = [${monStr}];`;

    // Header badge
    DOM.activeConfigBadge.innerHTML = `
        <span class="cfg-code">${cList.length > 2 ? `${cList.length} STORES` : cList.map(c => c.toUpperCase()).join('/')}</span>
        <span class="cfg-sep">•</span>
        <span class="cfg-rating">≤ ${Number(state.maxRating).toFixed(1)}★</span>
        <span class="cfg-sep">•</span>
        <span class="cfg-reviews">≥ ${state.minReviews} reviews</span>
    `;
}

function initConfigListeners() {
    // Multi-Select Country Checkboxes
    DOM.countryCheckboxes.forEach((cb) => {
        cb.addEventListener('change', () => {
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', cb.checked);
            const checkedVals = Array.from(DOM.countryCheckboxes).filter(c => c.checked).map(c => c.value);
            if (checkedVals.length === 0) {
                cb.checked = true;
                cb.closest('.checkbox-model-pill')?.classList.add('active');
                state.countries = [cb.value];
            } else {
                state.countries = checkedVals;
            }
            updateConfigDisplay();
        });
    });

    // Quick country preset actions
    DOM.quickSelectIndia?.addEventListener('click', () => {
        DOM.countryCheckboxes.forEach((cb) => {
            const isIndia = cb.value === 'in';
            cb.checked = isIndia;
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', isIndia);
        });
        state.countries = ['in'];
        updateConfigDisplay();
        showToast('Targeting: India (in)', 'info');
    });

    DOM.quickSelectTier1?.addEventListener('click', () => {
        const tier1Codes = ['us', 'gb', 'ca', 'au'];
        DOM.countryCheckboxes.forEach((cb) => {
            const isT1 = tier1Codes.includes(cb.value);
            cb.checked = isT1;
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', isT1);
        });
        state.countries = tier1Codes;
        updateConfigDisplay();
        showToast('Targeting: Tier-1 (US, UK, CA, AU)', 'info');
    });

    DOM.selectAllCountries?.addEventListener('click', () => {
        DOM.countryCheckboxes.forEach((cb) => {
            cb.checked = true;
            cb.closest('.checkbox-model-pill')?.classList.add('active');
        });
        state.countries = Array.from(DOM.countryCheckboxes).map(c => c.value);
        updateConfigDisplay();
        showToast('Targeting: All 9 Country Stores', 'info');
    });

    // Rating sync: Slider <-> Number input
    DOM.maxRatingSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.maxRating = val;
        DOM.maxRatingInput.value = val;
        updateConfigDisplay();
    });

    DOM.maxRatingInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 3.5;
        if (val < 1.0) val = 1.0;
        if (val > 5.0) val = 5.0;
        state.maxRating = val;
        DOM.maxRatingSlider.value = Math.min(val, 4.5);
        updateConfigDisplay();
    });

    // Min reviews input
    DOM.minReviewsInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 100;
        state.minReviews = val;
        updateConfigDisplay();

        // Sync pill buttons
        document.querySelectorAll('.preset-pills .pill-btn').forEach((btn) => {
            btn.classList.toggle('active', parseInt(btn.dataset.reviews, 10) === val);
        });
    });

    // Review Preset Pills
    document.querySelectorAll('.preset-pills .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-pills .pill-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const rev = parseInt(btn.dataset.reviews, 10);
            state.minReviews = rev;
            DOM.minReviewsInput.value = rev;
            updateConfigDisplay();
        });
    });

    // Monetization multi-select checkboxes
    DOM.monetizationCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            checkbox.closest('.checkbox-model-pill')?.classList.toggle('active', checkbox.checked);
            const checkedVals = Array.from(DOM.monetizationCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (checkedVals.length === 0) {
                checkbox.checked = true;
                checkbox.closest('.checkbox-model-pill')?.classList.add('active');
                state.monetization = [checkbox.value];
            } else {
                state.monetization = checkedVals;
            }
            updateConfigDisplay();
        });
    });

    // Multi-Select Category Checkboxes
    DOM.categoryCheckboxes.forEach((cb) => {
        cb.addEventListener('change', () => {
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', cb.checked);
            const checkedVals = Array.from(DOM.categoryCheckboxes).filter(c => c.checked).map(c => c.value);
            if (checkedVals.length === 0) {
                cb.checked = true;
                cb.closest('.checkbox-model-pill')?.classList.add('active');
                state.categories = [cb.value];
            } else {
                state.categories = checkedVals;
            }
            const btnSpan = DOM.scanBtn.querySelector('span');
            if (btnSpan) btnSpan.textContent = `Scan Categories (${state.categories.length})`;
            updateConfigDisplay();
        });
    });

    DOM.selectAllCategories?.addEventListener('click', () => {
        DOM.categoryCheckboxes.forEach((cb) => {
            cb.checked = true;
            cb.closest('.checkbox-model-pill')?.classList.add('active');
        });
        state.categories = Array.from(DOM.categoryCheckboxes).map(c => c.value);
        const btnSpan = DOM.scanBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = `Scan Categories (${state.categories.length})`;
        updateConfigDisplay();
        showToast('Selected all categories', 'info');
    });

    DOM.quickSelectCoreCats?.addEventListener('click', () => {
        DOM.categoryCheckboxes.forEach((cb) => {
            const isCore = cb.value === 'PRODUCTIVITY' || cb.value === 'TOOLS';
            cb.checked = isCore;
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', isCore);
        });
        state.categories = ['PRODUCTIVITY', 'TOOLS'];
        const btnSpan = DOM.scanBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = `Scan Categories (${state.categories.length})`;
        updateConfigDisplay();
        showToast('Selected Productivity + Tools', 'info');
    });

    // Reset defaults button
    DOM.resetConfigBtn.addEventListener('click', () => {
        state.countries = ['in'];
        state.categories = ['PRODUCTIVITY', 'TOOLS'];
        state.maxRating = 3.5;
        state.minReviews = 100;
        state.monetization = ['paid', 'iap'];

        DOM.countryCheckboxes.forEach((cb) => {
            const isIndia = cb.value === 'in';
            cb.checked = isIndia;
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', isIndia);
        });

        DOM.categoryCheckboxes.forEach((cb) => {
            const isCore = cb.value === 'PRODUCTIVITY' || cb.value === 'TOOLS';
            cb.checked = isCore;
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', isCore);
        });

        DOM.maxRatingSlider.value = 3.5;
        DOM.maxRatingInput.value = 3.5;

        DOM.minReviewsInput.value = 100;
        document.querySelectorAll('.preset-pills .pill-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.reviews === '100');
        });

        DOM.monetizationCheckboxes.forEach((cb) => {
            const shouldCheck = cb.value === 'paid' || cb.value === 'iap';
            cb.checked = shouldCheck;
            cb.closest('.checkbox-model-pill')?.classList.toggle('active', shouldCheck);
        });

        const btnSpan = DOM.scanBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = `Scan Categories (2)`;

        updateConfigDisplay();
        showToast('Reset configuration to default parameters', 'info');
    });

    // Copy config button
    DOM.copyConfigBtn.addEventListener('click', async () => {
        const text = DOM.activeCodeSnippet.textContent;
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied configuration to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy text', 'warning');
        }
    });

    // Clear search input button
    DOM.clearSearchBtn.addEventListener('click', () => {
        DOM.searchQueryInput.value = '';
        DOM.searchQueryInput.focus();
    });

    // Inspect limit select
    DOM.numLimitSelect.addEventListener('change', (e) => {
        state.numLimit = parseInt(e.target.value, 10);
    });
}

// ============================================================
// SEARCH & STREAMING EXECUTION
// ============================================================

function setScanningUI(isScanning) {
    state.isScanning = isScanning;
    if (isScanning) {
        DOM.scanBtn.classList.add('hidden');
        DOM.stopScanBtn.classList.remove('hidden');
        DOM.scanProgressBox.classList.remove('hidden');
        DOM.systemStatusText.textContent = 'Scanning Stores & Categories...';
        DOM.systemStatusPill.querySelector('.status-dot').className = 'status-dot active';
    } else {
        DOM.scanBtn.classList.remove('hidden');
        DOM.stopScanBtn.classList.add('hidden');
        DOM.systemStatusText.textContent = 'Ready to Scan';
        DOM.systemStatusPill.querySelector('.status-dot').className = 'status-dot pulse';
    }
}

function stopCurrentScan() {
    if (state.eventSource) {
        state.eventSource.close();
        state.eventSource = null;
    }
    setScanningUI(false);
    DOM.progressStatusText.textContent = 'Scan stopped by user.';
    showToast('Scan cancelled', 'warning');
}

function startPlayStoreScan(customQuery = '') {
    if (state.isScanning) {
        stopCurrentScan();
    }

    // Reset results on each new scan
    state.results = [];
    state.filteredResults = [];
    DOM.resultsTableBody.innerHTML = '';
    DOM.resultsCountBadge.textContent = 'Scanning...';
    DOM.exportCsvBtn.setAttribute('disabled', 'true');
    DOM.exportXlsxBtn.setAttribute('disabled', 'true');
    DOM.clearResultsBtn.setAttribute('disabled', 'true');
    updateKPIs();

    // Reset progress counters
    DOM.progressBarFill.style.width = '0%';
    DOM.progressPercentText.textContent = '0%';
    DOM.progressCheckedCount.textContent = '0';
    DOM.progressMatchCount.textContent = '0';
    DOM.progressCurrentApp.textContent = '';
    DOM.progressStatusText.textContent = `Connecting to Google Play [${state.countries.map(c => c.toUpperCase()).join('/')}] for ${state.categories.length} Categories...`;

    setScanningUI(true);

    const queryParams = new URLSearchParams({
        countries: state.countries.join(','),
        categories: state.categories.join(','),
        maxRating: state.maxRating,
        minReviews: state.minReviews,
        monetization: state.monetization.join(','),
        term: customQuery && customQuery.trim() ? customQuery.trim() : '',
        num: state.numLimit,
        deepCrawl: DOM.deepCrawlCheck && DOM.deepCrawlCheck.checked ? 'true' : 'false'
    });

    const url = `/api/stream-search?${queryParams.toString()}`;
    const es = new EventSource(url);
    state.eventSource = es;

    let candidateTotal = 0;
    let checkedCount = 0;

    es.addEventListener('status', (e) => {
        const data = JSON.parse(e.data);
        DOM.progressStatusText.textContent = data.message;
        if (data.percent !== undefined) {
            updateProgressBar(data.percent);
        }
    });

    es.addEventListener('candidates_count', (e) => {
        const data = JSON.parse(e.data);
        candidateTotal = data.totalCandidates;
        DOM.progressStatusText.textContent = `Found ${candidateTotal} candidate apps for "${data.currentTerm}". Fetching store reviews...`;
    });

    es.addEventListener('match', (e) => {
        const match = JSON.parse(e.data);
        // Add to state if not duplicate appId
        if (!state.results.some((r) => r.appId === match.appId)) {
            match.priorityRank = state.results.length + 1;
            state.results.push(match);
            renderNewMatch(match);
            updateKPIs();
        }
    });

    es.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        checkedCount = data.checked;
        DOM.progressCheckedCount.textContent = `${data.checked} / ${data.total}`;
        DOM.progressMatchCount.textContent = data.matchedCount;
        DOM.progressCurrentApp.textContent = data.currentAppTitle ? `Checking: ${data.currentAppTitle}` : '';
        updateProgressBar(data.percent);
    });

    es.addEventListener('complete', (e) => {
        const data = JSON.parse(e.data);
        updateProgressBar(100);
        DOM.progressStatusText.textContent = data.message;
        DOM.progressCurrentApp.textContent = 'Finished!';
        setScanningUI(false);
        es.close();
        state.eventSource = null;

        if (state.results.length === 0) {
            DOM.resultsCountBadge.textContent = '0 matches';
            DOM.resultsTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="empty-icon-bubble">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                            <h3 class="empty-title">0 Market Gaps Found for "${escapeHtml(customQuery || state.categories.join(', '))}"</h3>
                            <p class="empty-desc">
                                All evaluated apps in the <strong>${state.countries.map(c => c.toUpperCase()).join('/')}</strong> store(s) were filtered out because:
                                <br>• They have high ratings (&gt; <strong>${Number(state.maxRating).toFixed(1)}★</strong>) where users are satisfied, OR
                                <br>• They have fewer than <strong>${state.minReviews}</strong> total buyer ratings, OR
                                <br>• They are unrated or inactive apps.
                                <br><br>💡 <strong>Tip:</strong> Truly profitable market gaps (poor satisfaction + high paid demand) are rare in single keywords. Select multiple categories (e.g. <strong>Productivity + Tools + Business</strong>) or check <strong>Tier-1 (US, UK, CA, AU)</strong> to scan across high-demand stores!
                            </p>
                        </div>
                    </td>
                </tr>
            `;
            showToast('No apps met the strict gap criteria for this keyword', 'info');
        } else {
            showToast(`Scan complete! Found ${state.results.length} market opportunities.`, 'success');
            applySortingAndFiltering();
        }
    });

    es.addEventListener('warning', (e) => {
        const data = JSON.parse(e.data);
        console.warn('Scan warning:', data.message);
    });

    es.addEventListener('error', (e) => {
        console.error('SSE connection error:', e);
        DOM.progressStatusText.textContent = 'Scan ended or interrupted.';
        setScanningUI(false);
        es.close();
        state.eventSource = null;
        applySortingAndFiltering();
    });
}

function updateProgressBar(percent) {
    const p = Math.min(Math.max(percent, 0), 100);
    DOM.progressBarFill.style.width = `${p}%`;
    DOM.progressPercentText.textContent = `${p}%`;
}

// ============================================================
// RESULTS RENDERING & KPIS
// ============================================================

function renderNewMatch(app) {
    if (DOM.emptyStateRow) {
        DOM.emptyStateRow.remove();
    }

    const tr = createTableRow(app);
    DOM.resultsTableBody.appendChild(tr);

    DOM.resultsCountBadge.textContent = `${state.results.length} match${state.results.length === 1 ? '' : 'es'}`;
    DOM.exportCsvBtn.removeAttribute('disabled');
    DOM.exportXlsxBtn.removeAttribute('disabled');
    DOM.clearResultsBtn.removeAttribute('disabled');
}

function createTableRow(app) {
    const tr = document.createElement('tr');
    tr.dataset.appid = app.appId;

    const ratingClass = app.score <= 3.0 ? 'score-tag-bad' : 'score-tag-mediocre';

    tr.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--text-muted); font-weight: 600;">#${app.priorityRank}</td>
        <td>
            <div class="app-meta-cell">
                <img class="app-icon-img" src="${app.icon || 'https://via.placeholder.com/44x44/1e293b/818cf8?text=App'}" alt="${escapeHtml(app.title)}" loading="lazy">
                <div class="app-title-group">
                    <a href="javascript:void(0)" class="app-row-title" title="View details for ${escapeHtml(app.title)}">${escapeHtml(app.title)}</a>
                    <span class="app-row-dev">${escapeHtml(app.developer)}</span>
                    <span class="app-row-pkg">${escapeHtml(app.appId)}</span>
                </div>
            </div>
        </td>
        <td>
            <div class="score-cell ${ratingClass}">
                <span class="score-star">★</span>
                <span>${Number(app.score).toFixed(2)}</span>
            </div>
        </td>
        <td>
            <div>
                <span class="reviews-val">${Number(app.ratingsCount).toLocaleString()}</span>
                <div class="reviews-written">${Number(app.writtenReviews).toLocaleString()} written</div>
            </div>
        </td>
        <td>
            <span class="badge ${app.free ? 'badge-neutral' : 'badge-purple'}">
                ${escapeHtml(app.priceText || (app.free ? 'Free' : `₹${app.price}`))}
            </span>
        </td>
        <td>
            <span class="badge badge-neutral">${escapeHtml(app.genre || 'App')}</span>
        </td>
        <td style="font-size: 0.78rem; color: var(--text-muted);">
            ${escapeHtml(app.updated || 'N/A')}
        </td>
        <td style="text-align: center;">
            <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="btn-sm-store" title="Open in Google Play Store">
                <span>Play Store</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
        </td>
    `;

    // Clicking title opens modal details
    tr.querySelector('.app-row-title').addEventListener('click', () => {
        openAppDetailsModal(app);
    });

    return tr;
}

function updateKPIs() {
    const list = state.results;
    DOM.metricTotalApps.textContent = list.length;

    if (list.length === 0) {
        DOM.metricAvgRating.textContent = '0.0★';
        DOM.metricTotalReviews.textContent = '0';
        DOM.metricAvgPrice.textContent = '₹0';
        return;
    }

    const sumRating = list.reduce((acc, a) => acc + (a.score || 0), 0);
    const avgRating = (sumRating / list.length).toFixed(2);
    DOM.metricAvgRating.textContent = `${avgRating}★`;

    const totalReviews = list.reduce((acc, a) => acc + (a.ratingsCount || 0), 0);
    DOM.metricTotalReviews.textContent = totalReviews.toLocaleString();

    // Average price among paid apps
    const paidApps = list.filter((a) => !a.free && a.price > 0);
    if (paidApps.length > 0) {
        const avgPrice = Math.round(paidApps.reduce((acc, a) => acc + a.price, 0) / paidApps.length);
        const currency = paidApps[0].currency || '₹';
        DOM.metricAvgPrice.textContent = `${currency} ${avgPrice}`;
    } else {
        DOM.metricAvgPrice.textContent = 'Free/IAP';
    }
}

function applySortingAndFiltering() {
    const query = DOM.filterResultsInput.value.trim().toLowerCase();
    const sortBy = DOM.sortBySelect.value;

    let items = [...state.results];

    // Filter
    if (query) {
        items = items.filter(
            (app) =>
                (app.title && app.title.toLowerCase().includes(query)) ||
                (app.developer && app.developer.toLowerCase().includes(query)) ||
                (app.appId && app.appId.toLowerCase().includes(query)) ||
                (app.genre && app.genre.toLowerCase().includes(query))
        );
    }

    // Sort
    if (sortBy === 'ratings_desc') {
        items.sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0));
    } else if (sortBy === 'score_asc') {
        items.sort((a, b) => (a.score || 0) - (b.score || 0));
    } else if (sortBy === 'score_desc') {
        items.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === 'price_desc') {
        items.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name_asc') {
        items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    state.filteredResults = items;

    // Render table
    DOM.resultsTableBody.innerHTML = '';
    if (items.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'empty-row';
        tr.innerHTML = `
            <td colspan="8">
                <div class="empty-state">
                    <p class="empty-desc">No matching opportunities found with your current filter "${escapeHtml(query)}".</p>
                </div>
            </td>
        `;
        DOM.resultsTableBody.appendChild(tr);
    } else {
        items.forEach((app, idx) => {
            app.priorityRank = idx + 1;
            DOM.resultsTableBody.appendChild(createTableRow(app));
        });
    }

    DOM.resultsCountBadge.textContent = `${items.length} match${items.length === 1 ? '' : 'es'}`;
}

// ============================================================
// CSV EXPORT IMPLEMENTATION (RFC 4180 COMPLIANT WITH UTF-8 BOM)
// ============================================================

function exportToCsv() {
    const apps = state.filteredResults.length > 0 ? state.filteredResults : state.results;

    if (!apps || apps.length === 0) {
        showToast('No results available to export to CSV', 'warning');
        return;
    }

    const headers = [
        'Priority Rank',
        'App Name',
        'Package ID',
        'Developer',
        'Category',
        'Price',
        'Monetization Model',
        `Rating (<= ${state.maxRating})`,
        `Total Ratings (>= ${state.minReviews})`,
        'Written Reviews',
        'Downloads',
        'Last Updated',
        'Play Store URL',
        'Summary'
    ];

    const escapeCsvField = (field) => {
        if (field === null || field === undefined) return '""';
        const str = String(field);
        // If string contains quotes, commas, newlines, or carriage returns, wrap in quotes and escape quotes
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
    };

    const csvRows = [];
    csvRows.push(headers.map(escapeCsvField).join(','));

    apps.forEach((item, index) => {
        const row = [
            index + 1,
            item.title || '',
            item.appId || '',
            item.developer || '',
            item.genre || '',
            item.priceText || (item.free ? 'Free' : `${item.currency || ''} ${item.price || 0}`),
            item.offersIAP ? 'Has In-App Purchases' : (item.free ? 'Free' : 'Pure Paid Upfront'),
            Number(item.score || 0).toFixed(2),
            item.ratingsCount || 0,
            item.writtenReviews || 0,
            item.installs || 'N/A',
            item.updated || 'N/A',
            item.url || `https://play.google.com/store/apps/details?id=${item.appId}`,
            (item.summary || '').replace(/[\r\n]+/g, ' ')
        ];
        csvRows.push(row.map(escapeCsvField).join(','));
    });

    // Add UTF-8 BOM prefix (\uFEFF) so Excel, Google Sheets & Apple Numbers open UTF-8 without garbled characters
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `playstore_gaps_${state.country.toLowerCase()}_max${state.maxRating}star_${dateStr}.csv`;

    // Trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToast(`Saved ${apps.length} records to "${fileName}"`, 'success');
}

// Export to Excel (.xlsx) using server endpoint
async function exportToXlsx() {
    const apps = state.filteredResults.length > 0 ? state.filteredResults : state.results;

    if (!apps || apps.length === 0) {
        showToast('No results available to export to Excel', 'warning');
        return;
    }

    try {
        showToast('Generating Excel (.xlsx) file...', 'info');
        const response = await fetch('/api/export-xlsx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apps })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const blob = await response.blob();
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `playstore_gaps_${state.country}_${dateStr}.xlsx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast(`Saved Excel spreadsheet to "${fileName}"`, 'success');
    } catch (err) {
        console.error('XLSX export error:', err);
        showToast('Failed to export Excel file. Please use CSV.', 'warning');
    }
}

// Clear results
function clearAllResults() {
    if (state.isScanning) {
        stopCurrentScan();
    }
    state.results = [];
    state.filteredResults = [];
    DOM.resultsTableBody.innerHTML = '';
    DOM.resultsTableBody.appendChild(DOM.emptyStateRow);
    DOM.resultsCountBadge.textContent = '0 matches';
    DOM.exportCsvBtn.setAttribute('disabled', 'true');
    DOM.exportXlsxBtn.setAttribute('disabled', 'true');
    DOM.clearResultsBtn.setAttribute('disabled', 'true');
    DOM.scanProgressBox.classList.add('hidden');
    updateKPIs();
    showToast('Cleared all scanned results', 'info');
}

// ============================================================
// MODAL & TOAST HELPERS
// ============================================================

function openAppDetailsModal(app) {
    DOM.modalAppIcon.src = app.icon || 'https://via.placeholder.com/52x52/1e293b/818cf8?text=App';
    DOM.modalAppTitle.textContent = app.title;
    DOM.modalAppDeveloper.textContent = app.developer || 'Unknown Developer';
    DOM.modalAppRating.textContent = `★ ${Number(app.score).toFixed(2)} rating`;
    DOM.modalAppRatingsCount.textContent = `${Number(app.ratingsCount).toLocaleString()} reviews`;
    DOM.modalAppPrice.textContent = app.priceText || (app.free ? 'Free' : `₹${app.price}`);
    DOM.modalAppCategory.textContent = app.genre || 'Productivity';

    DOM.modalPackageId.textContent = app.appId;
    DOM.modalAppSummary.textContent = app.summary || app.description || 'No store summary available.';
    DOM.modalDemandReviews.textContent = Number(app.ratingsCount).toLocaleString();
    DOM.modalRatingScore.textContent = Number(app.score).toFixed(2);
    DOM.modalPlayStoreLink.href = app.url || `https://play.google.com/store/apps/details?id=${app.appId}`;

    DOM.appDetailsModal.classList.remove('hidden');
}

function closeModal() {
    DOM.appDetailsModal.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================
// INITIALIZATION
// ============================================================

function init() {
    initConfigListeners();
    updateConfigDisplay();

    // Form submit
    DOM.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customQuery = DOM.searchQueryInput.value.trim();
        startPlayStoreScan(customQuery);
    });

    // Stop scan button
    DOM.stopScanBtn.addEventListener('click', stopCurrentScan);

    // Export CSV button
    DOM.exportCsvBtn.addEventListener('click', exportToCsv);

    // Export XLSX button
    DOM.exportXlsxBtn.addEventListener('click', exportToXlsx);

    // Clear results button
    DOM.clearResultsBtn.addEventListener('click', clearAllResults);

    // Filter results live input
    DOM.filterResultsInput.addEventListener('input', applySortingAndFiltering);

    // Sort selector
    DOM.sortBySelect.addEventListener('change', applySortingAndFiltering);

    // Modal close
    DOM.closeModalBtn.addEventListener('click', closeModal);
    DOM.appDetailsModal.addEventListener('click', (e) => {
        if (e.target === DOM.appDetailsModal) closeModal();
    });

    // Copy package ID in modal
    DOM.copyPackageIdBtn.addEventListener('click', async () => {
        const pkg = DOM.modalPackageId.textContent;
        try {
            await navigator.clipboard.writeText(pkg);
            showToast(`Copied package ID "${pkg}"`, 'success');
        } catch (e) {
            showToast('Failed to copy', 'warning');
        }
    });

    // Keyboard ESC to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !DOM.appDetailsModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
