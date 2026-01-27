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


// ====================
// MAIN PAGE LOGIC
// ====================

document.addEventListener('DOMContentLoaded', () => {

    // --- Language toggle button ---
    const langToggle = document.getElementById('langToggle');
    const savedLang = localStorage.getItem('language') || 'en';

    setLanguage(savedLang);

    langToggle?.addEventListener('click', () => {
        const newLang = document.documentElement.lang === 'en' ? 'hu' : 'en';
        setLanguage(newLang);
    });

    // --- Link card ripple + logging ---
    document.querySelectorAll('.link-card').forEach(card => {
        if (card.tagName !== 'A') return;

        card.addEventListener('click', () => {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            const title = card.querySelector('h3')?.textContent;
            console.log(`Link clicked: ${title}`);
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
        });

        // keyboard support
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // --- View counter ---
    const views = parseInt(localStorage.getItem('pageViews') || '0', 10);
    localStorage.setItem('pageViews', views + 1);

    console.log('Portfolio loaded');
    console.log(`Page views: ${views + 1}`);
});


// ====================
// MINI GAME LOGIC
// ====================

const miniGame = document.getElementById('miniGame');
miniGame?.addEventListener('click', e => e.stopPropagation());

const langToggleBtn = document.getElementById('langToggle');
const openMiniGameCard = document.querySelector('.link-card-header');
const closeMiniGameBtn = document.getElementById('miniGameClose');
const modeToggleBtn = document.getElementById('miniGameModeToggle');

let currentMode = 'code'; // 'code' or 'visual'
const texts = {
    en: {
        run: "Run",
        incomplete: "Function is incomplete",
        langToggled: "Language toggled to",
        darkMode: "Dark mode toggled",
        demoText: "Hello World!",
        incompleteVisual: "Function incomplete",
        swapped: "Emojis swapped!",
        textRotated: "Text rotated!",
        showVisual: "Show Visual",
        showCode: "Show Code"
    },
    hu: {
        run: "Futtatás",
        incomplete: "A függvény hiányos",
        langToggled: "Nyelv váltva:",
        darkMode: "Sötét mód váltva",
        demoText: "Szia Világ!",
        incompleteVisual: "Funkció hiányos",
        swapped: "Emojik megcserélve!",
        textRotated: "Szöveg forgatva!",
        showVisual: "Vizuális Mód",
        showCode: "Kód Mód"
    }
};

// --- Open / Close ---
openMiniGameCard?.addEventListener('click', e => {
    e.preventDefault();
    miniGame.classList.remove('hidden');
    langToggleBtn.style.display = 'none';
});

closeMiniGameBtn?.addEventListener('click', e => {
    e.stopPropagation();
    miniGame.classList.add('hidden');
    langToggleBtn.style.display = '';
});

// --- Mode Toggle ---
modeToggleBtn?.addEventListener('click', () => {
    const codeContainer = document.getElementById('code-mode-container');
    const visualContainer = document.getElementById('visual-mode-container');

    const lang = document.documentElement.lang || 'en';
    if (currentMode === 'code') {
        syncCodeToVisual();
        currentMode = 'visual';
        codeContainer.classList.add('hidden');
        codeContainer.style.display = 'none';
        visualContainer.classList.remove('hidden');
        visualContainer.style.display = 'flex';
        modeToggleBtn.textContent = texts[lang].showCode;
    } else {
        syncVisualToCode();
        currentMode = 'code';
        visualContainer.classList.add('hidden');
        visualContainer.style.display = 'none';
        codeContainer.classList.remove('hidden');
        codeContainer.style.display = 'flex';
        modeToggleBtn.textContent = texts[lang].showVisual;
    }
});

// ====================
// SYNC LOGIC
// ====================

function createVisualElement(type, id, zone) {
    let source = null;
    if (type === 'donut') {
         source = document.querySelector(`#donuts .donut[data-type="${id}"]`);
         // If no direct type match, fallback to zone match logic or specific types
         if (!source && zone) {
             if (id === 'flags') source = document.querySelector(`#donuts .donut[data-type="flags"]`);
             else if (id === 'emojis') source = document.querySelector(`#donuts .donut[data-type="emojis"]`);
             else if (id === 'mode') source = document.querySelector(`#donuts .donut[data-type="mode"]`);
         }
    } else if (type === 'inner') {
        source = document.querySelector(`#donuts .inner-circle[id="${id}"]`);
    }

    if (source) {
        const clone = source.cloneNode(true);
        clone.style.top = '50%';
        clone.style.left = '50%';
        clone.style.transform = 'translate(-50%,-50%)';
        clone.addEventListener('dragstart', ev => {
            draggedVisual = clone;
            ev.dataTransfer.setData('text/plain', '');
        });
        return clone;
    }
    return null;
}

function syncCodeToVisual() {
    const zones = ['left', 'middle', 'right'];
    zones.forEach(zone => {
        const codeZone = document.querySelector(`#code-mode-container .game-zone[data-zone="${zone}"]`);
        const optionsText = codeZone.querySelector('.placeholder[data-type="options"]').innerText.trim();
        const funcText = codeZone.querySelector('.placeholder[data-type="functionality"]').innerText.trim();
        const visualSlot = document.querySelector(`#visual-mode-container .visual-zone[data-zone="${zone}"] .slot`);
        
        // Clear slot
        visualSlot.innerHTML = '<div class="cut-line"></div>';

        // Determine Donut
        let donutId = null;
        if (optionsText.includes("optionsEN") || optionsText.includes("'EN'")) donutId = "flags";
        else if (optionsText.includes("emojis") || optionsText.includes("'☀️'")) donutId = "emojis";
        else if (optionsText === "") donutId = "mode"; // Default/Empty

        if (donutId) {
             const el = createVisualElement('donut', donutId, zone);
             if (el) visualSlot.appendChild(el);
        }

        // Determine Inner
        let innerId = null;
        if (funcText.includes("langToggle") || funcText.includes("switch")) innerId = "switch";
        else if (funcText.includes("rotate")) innerId = "rotator";
        else if (funcText === "") innerId = "mode-switch"; // Default/Empty logic

        if (innerId) {
             const el = createVisualElement('inner', innerId, zone);
             if (el) visualSlot.appendChild(el);
        }
    });
}

function syncVisualToCode() {
    const zones = ['left', 'middle', 'right'];
    zones.forEach(zone => {
        const visualSlot = document.querySelector(`#visual-mode-container .visual-zone[data-zone="${zone}"] .slot`);
        const donut = visualSlot.querySelector('.donut');
        const inner = visualSlot.querySelector('.inner-circle');
        const codeZone = document.querySelector(`#code-mode-container .game-zone[data-zone="${zone}"]`);
        const optionsPH = codeZone.querySelector('.placeholder[data-type="options"]');
        const funcPH = codeZone.querySelector('.placeholder[data-type="functionality"]');
        
        // Defaults
        let optText = "";
        let funText = "";

        if (donut) {
            const type = donut.dataset.type;
            if (type === 'flags') {
                optText = "const optionsEN = ['EN','HU'];";
            } else if (type === 'emojis') {
                optText = "const emojis = ['☀️','🌙'];";
            } else if (type === 'mode') {
                // Keep empty or specific text
                optText = ""; 
            }
        }

        if (inner) {
            const id = inner.id;
            if (id === 'switch') {
                if (optText.includes('optionsEN')) funText = "langToggle(optionsEN[1]);";
                else if (optText.includes('emojis')) funText = "langToggle(emojis[1]);"; // Or toggle logic
                else funText = "langToggle();";
            } else if (id === 'rotator') {
                 if (optText.includes('optionsEN')) funText = "rotate(optionsEN);";
                 else if (optText.includes('emojis')) funText = "rotate(emojis);";
                 else funText = "rotate();";
            } else if (id === 'mode-switch') {
                funText = "";
            }
        }

        optionsPH.innerText = optText;
        funcPH.innerText = funText;
    });
}

// ====================
// CODE MODE LOGIC
// ====================

// Drag & Drop
let draggedCode = null;
const codePlaceholders = document.querySelectorAll('#code-mode-container .placeholder');

codePlaceholders.forEach(ph => {
    ph.setAttribute('draggable', 'true');

    ph.addEventListener('dragstart', () => {
        draggedCode = ph;
        ph.classList.add('dragging');
    });

    ph.addEventListener('dragend', () => {
        draggedCode = null;
        ph.classList.remove('dragging');
    });

    ph.addEventListener('dragover', e => {
        e.preventDefault();
        ph.classList.add('highlight');
    });

    ph.addEventListener('dragleave', () => {
        ph.classList.remove('highlight');
    });

    ph.addEventListener('drop', e => {
        e.preventDefault();
        ph.classList.remove('highlight');
        if (!draggedCode || draggedCode === ph) return;
        if (draggedCode.dataset.type !== ph.dataset.type) return;
        
        const temp = ph.innerHTML;
        ph.innerHTML = draggedCode.innerHTML;
        draggedCode.innerHTML = temp;

        const tempRot = ph.dataset.rotated;
        ph.dataset.rotated = draggedCode.dataset.rotated;
        draggedCode.dataset.rotated = tempRot;
    });
});

// Execution
document.querySelectorAll('#code-mode-container .executeBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const zone = btn.parentNode;
        const optionsPH = zone.querySelector('.placeholder[data-type="options"]');
        const funcPH = zone.querySelector('.placeholder[data-type="functionality"]');
        const consoleEl = zone.querySelector('.resultConsole');

        const optionsText = optionsPH.innerText.trim();
        const funcText = funcPH.innerText.trim();
        const lang = document.documentElement.lang;

        if (!optionsText || !funcText) {
            consoleEl.innerText = texts[lang].incomplete;
            consoleEl.style.color = "#ff5555";
            return;
        }

        try {
            // FLAGS LANGUAGE LOGIC
            if (optionsText.includes('EN') || optionsText.includes('HU')) {
                if (funcText.includes('langToggle')) {
                    const newLang = lang === 'en' ? 'hu' : 'en';
                    setLanguage(newLang);
                    
                    consoleEl.innerText = `${texts[newLang].langToggled} ${newLang.toUpperCase()}`;
                    consoleEl.style.color = "#50fa7b";
                }
                else if (funcText.includes('rotate')) {
                    const matches = optionsText.match(/'([^']+)'/g);
                    if (matches && matches.length === 2) {
                        const newOptions = [matches[1].replace(/'/g,''), matches[0].replace(/'/g,'')];
                        optionsPH.innerText = `const optionsEN = ['${newOptions[0]}','${newOptions[1]}'];`;
                        consoleEl.innerText = `Flags rotated: ${newOptions.join(', ')}`;
                        consoleEl.style.color = "#50fa7b";
                    }
                }
            }

            // SUN/MOON LOGIC
            if (optionsText.includes('☀️') || optionsText.includes('🌙')) {
                const rotated = optionsPH.dataset.rotated === 'true';
                if (funcText.includes('rotate')) {
                    const newOrder = rotated ? ['☀️','🌙'] : ['🌙','☀️'];
                    optionsPH.innerText = `const emojis = ['${newOrder[0]}','${newOrder[1]}'];`;
                    optionsPH.dataset.rotated = (!rotated).toString();
                    consoleEl.innerText = `Emoji order rotated: ${newOrder.join(' ')}`;
                    consoleEl.style.color = "#50fa7b";
                }
                else if (funcText.includes('langToggle')) {
                    document.body.classList.toggle('darkmode');
                    consoleEl.innerText = texts[lang].darkMode;
                    consoleEl.style.color = "#50fa7b";
                }
            }

        } catch(e) {
            consoleEl.innerText = "Error executing function";
            consoleEl.style.color = "#ff5555";
        }
    });
});

// ====================
// VISUAL MODE LOGIC
// ====================

let draggedVisual = null;

// Enable dragging for donuts and inner circles
document.querySelectorAll('.donut, .inner-circle').forEach(el => {
    el.addEventListener('dragstart', e => {
        draggedVisual = el;
        e.dataTransfer.setData('text/plain', '');
    });
});

// Slot drop logic
document.querySelectorAll('#visual-mode-container .slot').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedVisual) return;
        
        let elementToDrop;

        // Check source parent
        const sourceSlot = draggedVisual.parentNode.classList.contains('slot') ? draggedVisual.parentNode : null;

        // If dragging from a slot (move), use the original. If from source (copy), clone it.
        if (sourceSlot) {
            elementToDrop = draggedVisual;
        } else {
            elementToDrop = draggedVisual.cloneNode(true);
            elementToDrop.addEventListener('dragstart', ev => {
                draggedVisual = elementToDrop;
                ev.dataTransfer.setData('text/plain', '');
            });
        }
        
        // Check for existing element of same type
        let existing = null;
        if (draggedVisual.classList.contains('donut')) {
            existing = slot.querySelector('.donut');
        } else if (draggedVisual.classList.contains('inner-circle')) {
            existing = slot.querySelector('.inner-circle');
        }

        if (existing) {
            if (sourceSlot) {
                // Swap: Move existing to source slot
                sourceSlot.appendChild(existing);
                // Reset styles for the swapped element
                existing.style.top = '50%';
                existing.style.left = '50%';
                existing.style.transform = 'translate(-50%,-50%)';
            } else {
                // Overwrite: Source is inventory, just remove existing
                existing.remove();
            }
        }

        slot.appendChild(elementToDrop);
        elementToDrop.style.top = '50%';
        elementToDrop.style.left = '50%';
        elementToDrop.style.transform = 'translate(-50%,-50%)';
        
        draggedVisual = null;
    });
});

// Execute logic
document.querySelectorAll('#visual-mode-container .executeBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const zone = btn.parentNode;
        const slot = zone.querySelector('.slot');
        const consoleEl = zone.querySelector('.resultConsole');
        const donut = slot.querySelector('.donut');
        const inner = slot.querySelector('.inner-circle');
        const lang = document.documentElement.lang;

        if (!donut || !inner) {
            consoleEl.innerText = texts[lang].incompleteVisual;
            consoleEl.style.color = "#ff5555";
            return;
        }

        const top = donut.querySelector('.top-piece');
        const bottom = donut.querySelector('.bottom-piece');
        const type = donut.dataset.type;

        if (type === 'flags') {
            if (inner.id === 'switch') {
                const newLang = lang === "en" ? "hu" : "en";
                setLanguage(newLang);
                consoleEl.innerText = `${texts[newLang].langToggled} ${newLang.toUpperCase()}`;
                consoleEl.style.color = "#50fa7b";
            } else if (inner.id === 'rotator') {
                 if (top.tagName === 'IMG') {
                     const temp = top.src;
                     top.src = bottom.src;
                     bottom.src = temp;
                 }
                 consoleEl.innerText = texts[lang].textRotated;
                 consoleEl.style.color = "#50fa7b";
            }
        } else if (type === 'emojis') {
            if (inner.id === 'switch') {
                document.body.classList.toggle('darkmode');
                consoleEl.innerText = texts[lang].darkMode;
                consoleEl.style.color = "#50fa7b";
            } else if (inner.id === 'rotator') {
                [top.textContent, bottom.textContent] = [bottom.textContent, top.textContent];
                consoleEl.innerText = texts[lang].swapped;
                consoleEl.style.color = "#50fa7b";
            }
        } else if (type === 'mode') {
             if (inner.id === 'switch' || inner.id === 'mode-switch') {
                 // Just a visual feedback for now, or could toggle mode
                 consoleEl.innerText = "Function Executed"; 
                 consoleEl.style.color = "#50fa7b";
             }
        }
    });
});

// Helper to update minigame texts
function updateMiniGameLanguage(lang) {
    document.querySelectorAll('#code-mode-container .executeBtn').forEach(b => {
        b.innerText = texts[lang].run;
    });
    document.querySelectorAll('#visual-mode-container .executeBtn').forEach(b => {
        b.innerText = texts[lang].run;
    });
    document.querySelectorAll('h1.demo-text').forEach(el => {
        el.textContent = texts[lang].demoText;
    });

    const modeToggleBtn = document.getElementById('miniGameModeToggle');
    if (modeToggleBtn) {
        if (currentMode === 'code') {
            modeToggleBtn.textContent = texts[lang].showVisual;
        } else {
            modeToggleBtn.textContent = texts[lang].showCode;
        }
    }
}

// Initialize slots with original donuts/inner-circles (Visual Mode)
function initVisualMode() {
    // Rely on sync from code mode on first toggle, OR init specifically.
    // For now, let's keep the specific init matching the default code state.
    
    // Default Code State:
    // Left: Flags + Switch
    // Middle: Empty
    // Right: Emojis + Rotator
    
    // We can just call syncCodeToVisual if code is the source of truth
    syncCodeToVisual();
}
// Init visual mode on load
initVisualMode();

// ====================
// VIDEO PREVIEW LOGIC
// ====================

const video = document.getElementById('szakdogaVideo');
const gifPreview = document.querySelector('.video-gif-preview');
const projectPreview = document.querySelector('.project-preview');
const playButton = document.querySelector('.video-play-button');

if (video && gifPreview && projectPreview && playButton) {
    let hasStarted = false;

    video.addEventListener('play', () => {
        hasStarted = true;
        video.setAttribute('controls', 'controls');
        gifPreview.classList.remove('active');
        gifPreview.style.opacity = '0';
        playButton.classList.add('hidden');
    });

    video.addEventListener('ended', () => {
        hasStarted = false;
        video.removeAttribute('controls');
        video.currentTime = 0;
        video.load(); // Reload to show poster
        playButton.classList.remove('hidden');
    });

    projectPreview.addEventListener('mouseenter', () => {
        if (!hasStarted) {
            gifPreview.style.opacity = '1';
            gifPreview.classList.add('active');
        }
    });

    projectPreview.addEventListener('mouseleave', () => {
        if (!hasStarted) {
            gifPreview.style.opacity = '0';
            gifPreview.classList.remove('active');
        }
    });

    // Click on GIF preview or play button to start video
    gifPreview.addEventListener('click', () => {
        if (!hasStarted) {
            video.play();
        }
    });

    playButton.addEventListener('click', () => {
        if (!hasStarted) {
            video.play();
        }
    });
}
