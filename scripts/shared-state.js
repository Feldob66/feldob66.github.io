// Shared state and helpers for drag ghost, theme unlock, and easter egg discovery

let dragGhost = null;
let darkModeUnlocked = localStorage.getItem('darkModeUnlocked') === 'true';

window.easterEggStorageKeys = Object.freeze({
    darkModeFound: 'darkModeEasterEggFound',
    darkModeFoundAt: 'darkModeEasterEggFoundAt',
    playgroundTranslationFound: 'playgroundTranslationEasterEggFound',
    playgroundTranslationFoundAt: 'playgroundTranslationEasterEggFoundAt'
});

window.easterEggDefinitions = Object.freeze([
    {
        storageKey: window.easterEggStorageKeys.darkModeFound,
        page: 'index',
        label: {
            en: 'Dark Mode Unlock',
            hu: 'Sötét Mód Feloldva'
        }
    },
    {
        storageKey: window.easterEggStorageKeys.playgroundTranslationFound,
        page: 'playground',
        label: {
            en: 'Title Translation',
            hu: 'Webcím fordítás'
        }
    }
]);

function getCurrentLanguage() {
    return localStorage.getItem('language') || document.documentElement.lang || 'en';
}

function getCurrentPageId() {
    const path = window.location.pathname || '';
    if (path.includes('/Playground/') || path.includes('Html_Playground.html')) {
        return 'playground';
    }

    return 'index';
}

function getFoundEasterEggCount(page = null) {
    return window.easterEggDefinitions.filter(definition => {
        if (page && definition.page !== page) {
            return false;
        }

        return localStorage.getItem(definition.storageKey) === 'true';
    }).length;
}

function getTotalEasterEggCount(page = null) {
    return window.easterEggDefinitions.filter(definition => !page || definition.page === page).length;
}

function getToastMessage(messages, lang) {
    if (typeof messages === 'function') {
        return messages(lang);
    }

    return messages[lang] || messages.en;
}

function getEasterEggUi() {
    let ui = document.getElementById('easterEggUi');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'easterEggUi';
        ui.className = 'easter-egg-ui hidden';

        const counter = document.createElement('button');
        counter.id = 'easterEggCounter';
        counter.type = 'button';
        counter.className = 'easter-egg-counter';
        counter.setAttribute('aria-expanded', 'false');
        counter.setAttribute('aria-controls', 'easterEggPanel');
        counter.innerHTML = '<span class="easter-egg-counter-icon" aria-hidden="true">🐰</span><span class="easter-egg-counter-label">Eggs 0/2</span>';

        const panel = document.createElement('div');
        panel.id = 'easterEggPanel';
        panel.className = 'easter-egg-panel hidden';

        counter.addEventListener('click', event => {
            event.stopPropagation();
            const isOpen = !panel.classList.contains('hidden');
            panel.classList.toggle('hidden', isOpen);
            counter.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('click', event => {
            if (!ui.contains(event.target)) {
                panel.classList.add('hidden');
                counter.setAttribute('aria-expanded', 'false');
            }
        });

        ui.appendChild(counter);
        ui.appendChild(panel);
        document.body.appendChild(ui);
    }

    return ui;
}

function refreshEasterEggCounter() {
    const ui = getEasterEggUi();
    const counter = document.getElementById('easterEggCounter');
    const panel = document.getElementById('easterEggPanel');
    const count = getFoundEasterEggCount();
    const totalCount = getTotalEasterEggCount();
    const currentPage = getCurrentPageId();
    const currentPageFound = getFoundEasterEggCount(currentPage);
    const currentPageTotal = getTotalEasterEggCount(currentPage);
    const lang = getCurrentLanguage();

    if (count <= 0) {
        ui.classList.add('hidden');
        panel.classList.add('hidden');
        counter.setAttribute('aria-expanded', 'false');
        return;
    }

    ui.classList.remove('hidden');
    counter.querySelector('.easter-egg-counter-label').textContent = `Eggs ${count}/${totalCount}`;

    const pageLabel = lang === 'hu' ? 'Ezen az oldalon' : 'On this page';
    const totalLabel = lang === 'hu' ? 'Összesen' : 'Total';
    const listTitle = lang === 'hu' ? 'Felfedezések' : 'Discoveries';

    const listMarkup = window.easterEggDefinitions.map(definition => {
        const isFound = localStorage.getItem(definition.storageKey) === 'true';
        const label = isFound ? (definition.label[lang] || definition.label.en) : '???????';
        const pageName = definition.page === 'playground'
            ? (lang === 'hu' ? 'Játszótér' : 'Playground')
            : 'Index';

        return `<li class="easter-egg-panel-item${isFound ? ' found' : ''}"><span class="easter-egg-panel-item-name">${label}</span><span class="easter-egg-panel-item-page">${pageName}</span></li>`;
    }).join('');

    panel.innerHTML = `
        <div class="easter-egg-panel-header">🐰 ${lang === 'hu' ? 'Easter Egg-ek' : 'Easter Eggs'}</div>
        <div class="easter-egg-panel-stats">
            <div class="easter-egg-panel-stat"><span>${totalLabel}</span><strong>${count}/${totalCount}</strong></div>
            <div class="easter-egg-panel-stat"><span>${pageLabel}</span><strong>${currentPageFound}/${currentPageTotal}</strong></div>
        </div>
        <div class="easter-egg-panel-list-title">${listTitle}</div>
        <ul class="easter-egg-panel-list">${listMarkup}</ul>
    `;
}

function getToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    return container;
}

function showToast(message, duration = 4200) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add('toast-hide');
        window.setTimeout(() => toast.remove(), 280);
    }, duration);
}

function markEasterEggFound(storageKey, timestampKey, messages) {
    if (localStorage.getItem(storageKey) === 'true') {
        refreshEasterEggCounter();
        return false;
    }

    localStorage.setItem(storageKey, 'true');
    localStorage.setItem(timestampKey, new Date().toISOString());

    const lang = getCurrentLanguage();
    showToast(getToastMessage(messages, lang));
    refreshEasterEggCounter();
    return true;
}

function unlockDarkModeEasterEgg() {
    const wasUnlocked = darkModeUnlocked;
    darkModeUnlocked = true;
    localStorage.setItem('darkModeUnlocked', 'true');

    if (!wasUnlocked) {
        markEasterEggFound(
            window.easterEggStorageKeys.darkModeFound,
            window.easterEggStorageKeys.darkModeFoundAt,
            {
                en: 'Easter egg found: Dark mode unlocked.',
                hu: 'Easter Egg megtalálva: a sötét mód feloldva.'
            }
        );
        return true;
    }

    refreshEasterEggCounter();
    return false;
}

refreshEasterEggCounter();

function createDragGhost(element) {
    // Only show drag ghost on touch devices (tablets/phones)
    // On desktop/laptop with mouse, the cursor is already visible so no need for ghost
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    if (!isTouchDevice) {
        return null; // Don't create ghost on devices with mouse/hover capability
    }

    if (dragGhost) dragGhost.remove();

    dragGhost = element.cloneNode(true);

    // Copy exact dimensions from original
    const rect = element.getBoundingClientRect();
    dragGhost.style.width = rect.width + 'px';
    dragGhost.style.height = rect.height + 'px';

    // Position and styling
    dragGhost.style.position = 'fixed';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.zIndex = '10000';
    dragGhost.style.opacity = '0.8';
    dragGhost.style.transform = 'translate(-50%, -50%)';
    dragGhost.style.boxShadow = '0 4px 20px rgba(80, 250, 123, 0.6)';
    dragGhost.style.transition = 'none';

    // Preserve all computed styles
    const computed = window.getComputedStyle(element);
    dragGhost.style.background = computed.background;
    dragGhost.style.border = computed.border;
    dragGhost.style.borderRadius = computed.borderRadius;
    dragGhost.style.padding = computed.padding;
    dragGhost.style.fontSize = computed.fontSize;
    dragGhost.style.fontFamily = computed.fontFamily;
    dragGhost.style.color = computed.color;
    dragGhost.style.fontWeight = computed.fontWeight;
    dragGhost.style.textAlign = computed.textAlign;
    dragGhost.style.lineHeight = computed.lineHeight;
    dragGhost.style.whiteSpace = 'pre-wrap';
    dragGhost.style.wordWrap = 'break-word';
    dragGhost.style.overflowWrap = 'break-word';

    // For visual mode elements (donuts/circles), preserve layout
    if (element.classList.contains('donut') || element.classList.contains('inner-circle')) {
        dragGhost.style.display = computed.display;
        dragGhost.style.justifyContent = computed.justifyContent;
        dragGhost.style.alignItems = computed.alignItems;

        // Copy styles for all children
        const originalChildren = element.querySelectorAll('*');
        const cloneChildren = dragGhost.querySelectorAll('*');
        originalChildren.forEach((child, index) => {
            if (cloneChildren[index]) {
                const childComputed = window.getComputedStyle(child);
                const childClone = cloneChildren[index];
                childClone.style.position = childComputed.position;
                childClone.style.top = childComputed.top;
                childClone.style.left = childComputed.left;
                childClone.style.right = childComputed.right;
                childClone.style.bottom = childComputed.bottom;
                childClone.style.transform = childComputed.transform;
                childClone.style.width = childComputed.width;
                childClone.style.height = childComputed.height;
            }
        });
    }

    document.body.appendChild(dragGhost);
    return dragGhost;
}

function removeDragGhost() {
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
}

function updateDragGhostPosition(x, y) {
    if (dragGhost) {
        dragGhost.style.left = x + 'px';
        dragGhost.style.top = y + 'px';
    }
}
