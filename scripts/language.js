// ====================
// GLOBAL LANGUAGE SYSTEM
// ====================

function initConsoleHistoryCapture() {
    if (window.__consoleHistory) return;
    window.__consoleHistory = [];
    window.__consoleOriginals = {};

    ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
        const original = console[method]?.bind(console);
        if (!original) return;
        window.__consoleOriginals[method] = original;
        console[method] = (...args) => {
            window.__consoleHistory.push({ method, args, time: Date.now() });
            original(...args);
        };
    });
}

async function translateTextGoogle(text, source, target) {
    if (!text || !text.trim()) return text;
    try {
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURI(text)}`
        );
        const data = await response.json();
        return data?.[0]?.[0]?.[0] || text;
    } catch (e) {
        return text;
    }
}

async function replayConsoleHistoryOppositeLanguage(sourceLang, targetLang) {
    const history = (console.history && Array.isArray(console.history) && console.history)
        || window.__consoleHistory
        || [];

    if (!history.length) return;

    const currentLang = sourceLang || document.documentElement.lang || (targetLang === 'en' ? 'hu' : 'en');
    const nextLang = targetLang || (currentLang === 'en' ? 'hu' : 'en');

    console.clear();

    for (const entry of history) {
        const args = entry.args || [];
        const stringParts = [];
        const objectParts = [];

        args.forEach(arg => {
            if (typeof arg === 'string') {
                stringParts.push(arg);
            } else {
                objectParts.push(arg);
                try {
                    stringParts.push(JSON.stringify(arg));
                } catch (e) {
                    stringParts.push(String(arg));
                }
            }
        });

        const joined = stringParts.join(' ');
        const translated = await translateTextGoogle(joined, currentLang, nextLang);
        const output = translated || joined;

        const originalLog = window.__consoleOriginals?.log || console.log;
        if (objectParts.length) {
            originalLog(output, ...objectParts);
        } else {
            originalLog(output);
        }
    }
}

initConsoleHistoryCapture();
let hasInitializedLanguage = false;

async function setLanguage(lang) {
    const previousLang = document.documentElement.lang || '';
    const langOptions = document.querySelectorAll('.lang-option');

    // Update active indicator
    langOptions.forEach(option => {
        option.classList.toggle(
            'active',
            option.getAttribute('data-lang') === lang
        );
    });

    // Update translatable text
    document.querySelectorAll('[data-en][data-hu]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) el.textContent = text;
    });

    // Toggle language-specific blocks (use inline display to avoid CSS order conflicts)
    document.querySelectorAll('[data-show-lang]').forEach(el => {
        const showFor = el.getAttribute('data-show-lang');
        const shouldHide = showFor && showFor !== lang;
        el.style.display = shouldHide ? 'none' : '';
        el.classList.toggle('hidden', shouldHide);
    });

    // Persist + document state
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);

    // Mirror console history in the opposite language
    if (hasInitializedLanguage && previousLang && previousLang !== lang) {
        replayConsoleHistoryOppositeLanguage(previousLang, lang);
    }
    hasInitializedLanguage = true;

    // Update minigame if function exists
    if (typeof updateMiniGameLanguage === 'function') {
        updateMiniGameLanguage(lang);
    }
}
