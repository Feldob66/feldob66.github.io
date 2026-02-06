// ====================
// GLOBAL LANGUAGE SYSTEM
// ====================

function setLanguage(lang) {
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

    // Persist + document state
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);

    // Update minigame if function exists
    if (typeof updateMiniGameLanguage === 'function') {
        updateMiniGameLanguage(lang);
    }
}
