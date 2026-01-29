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

// Global drag ghost element
let dragGhost = null;

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
    dragGhost.style.whiteSpace = 'pre-wrap'; // Preserve text wrapping
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

document.addEventListener('DOMContentLoaded', () => {

    // Disable image dragging and selection globally
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.style.userSelect = 'none';
        img.style.WebkitUserSelect = 'none';
        img.style.WebkitTouchCallout = 'none';
        img.style.pointerEvents = 'none';
    });

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
            //console.log(`Link clicked: ${title}`);
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
    
    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        //console.log('Back to Top button found');
        let scrollAnimationId = null;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
                //console.log('Scroll > 300, showing button');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            // If already scrolling, cancel and snap to top instantly
            if (scrollAnimationId !== null) {
                cancelAnimationFrame(scrollAnimationId);
                window.scrollTo(0, 0);
                scrollAnimationId = null;
                return;
            }
            
            const startPosition = window.scrollY;
            const duration = 1200; // Slower: 1.2 seconds
            const startTime = performance.now();
            
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }
            
            function scroll(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easing = easeOutCubic(progress);
                
                window.scrollTo(0, startPosition * (1 - easing));
                
                if (progress < 1) {
                    scrollAnimationId = requestAnimationFrame(scroll);
                } else {
                    scrollAnimationId = null;
                }
            }
            
            scrollAnimationId = requestAnimationFrame(scroll);
        });
    } else {
        //console.log('Back to Top button NOT found');
    }
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
        langToggled: "Language changed!",
        darkMode: "Theme changed!",
        demoText: "Hello World!",
        incompleteVisual: "Function incomplete",
        swapped: "Options order swapped!",
        optionsRotated: "Options order swapped!",
        showVisual: "Show Visual",
        showCode: "Show Code"
    },
    hu: {
        run: "Futtatás",
        incomplete: "A függvény hiányos",
        langToggled: "Nyelv megváltoztatva!",
        darkMode: "Téma megváltoztatva!",
        demoText: "Szia Világ!",
        incompleteVisual: "Funkció hiányos",
        swapped: "Opciók sorrendeje felcserélve!",
        optionsRotated: "Opciók sorrendeje felcserélve!",
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
        // what are we looking for at visual mode when swapping between flags?

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
        // Prevent image selection on cloned element
        clone.style.userSelect = 'none';
        clone.style.WebkitUserSelect = 'none';
        clone.style.WebkitTouchCallout = 'none';
        clone.style.cursor = 'grab';
        clone.querySelectorAll('*').forEach(child => {
            child.style.pointerEvents = 'none';
            child.style.userSelect = 'none';
            child.style.WebkitUserSelect = 'none';
        });
        // Disable dragging for any images inside
        clone.querySelectorAll('img').forEach(img => {
            img.setAttribute('draggable', 'false');
            img.style.pointerEvents = 'none';
        });
        // Mouse drag
        clone.addEventListener('dragstart', ev => {
            draggedVisual = clone;
            ev.dataTransfer.setData('text/plain', '');
            createDragGhost(clone);
        });
        clone.addEventListener('drag', (ev) => {
            if (ev.clientX !== 0 || ev.clientY !== 0) {
                updateDragGhostPosition(ev.clientX, ev.clientY);
            }
        });
        clone.addEventListener('dragend', () => {
            removeDragGhost();
        });
        // Touch drag (phone support)
        clone.addEventListener('touchstart', (e) => {
            draggedVisual = clone;
            touchStartXVisual = e.touches[0].clientX;
            touchStartYVisual = e.touches[0].clientY;
            // Create ghost that follows finger
            createDragGhost(clone);
            updateDragGhostPosition(e.touches[0].clientX, e.touches[0].clientY);
            clone.style.opacity = '0.5';
        });
        clone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (draggedVisual && draggedVisual === clone) {
                const touch = e.touches[0];
                // Update ghost position to follow finger
                updateDragGhostPosition(touch.clientX, touch.clientY);
            }
        });
        clone.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elementBelow) {
                const slot = elementBelow.closest('.slot');
                if (slot && draggedVisual) {
                    handleVisualDrop(slot, draggedVisual);
                }
            }
            // Remove visual feedback
            clone.style.opacity = '1';
            removeDragGhost();
            draggedVisual = null;
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
        if (optionsText.includes("'EN'") || optionsText.includes("'HU'")) donutId = "flags";
        else if (optionsText.includes("'☀️'") || optionsText.includes("'🌙'")) donutId = "emojis";
        else if (optionsText === "") donutId = "mode"; // Default/Empty

        if (donutId) {
            const el = createVisualElement('donut', donutId, zone);
            if (el) visualSlot.appendChild(el);
        }

        // Determine Inner
        let innerId = null;
        if (funcText.includes("toggle")) innerId = "switch";
        else if (funcText.includes("rotate")) innerId = "rotator";
        else if (funcText === "") innerId = "empty-inner"; // Default/Empty logic - show empty outline

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
                optText = "const options = ['EN','HU'];";
            } else if (type === 'emojis') {
                optText = "const options = ['☀️','🌙'];";
            } else if (type === 'mode') {
                // Keep empty or specific text
                optText = ""; 
            }
        }

        if (inner) {
            const id = inner.id;
            if (id === 'switch') {
                if (optText.includes('options')) funText = "toggle(options);";
                else if (optText.includes('emojis')) funText = "toggle(options);"; // Or toggle logic
                else funText = "langToggle();";
            } else if (id === 'rotator') {
                if (optText.includes('options')) funText = "rotate(options);";
                else if (optText.includes('emojis')) funText = "rotate(options);";
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
let touchStartX = 0;
let touchStartY = 0;
const codePlaceholders = document.querySelectorAll('#code-mode-container .placeholder');

codePlaceholders.forEach(ph => {
    ph.setAttribute('draggable', 'true');
    // Prevent image selection and focus
    ph.style.userSelect = 'none';
    ph.style.WebkitUserSelect = 'none';
    ph.style.WebkitTouchCallout = 'none';
    ph.style.cursor = 'grab';
    ph.querySelectorAll('*').forEach(child => {
        child.style.pointerEvents = 'none';
    });

    // Mouse drag
    ph.addEventListener('dragstart', (e) => {
        draggedCode = ph;
        ph.classList.add('dragging');
        createDragGhost(ph);
    });

    ph.addEventListener('drag', (e) => {
        if (e.clientX !== 0 || e.clientY !== 0) {
            updateDragGhostPosition(e.clientX, e.clientY);
        }
    });

    ph.addEventListener('dragend', () => {
        draggedCode = null;
        ph.classList.remove('dragging');
        // Remove visual feedback
        ph.style.opacity = '1';
        removeDragGhost();
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

    // Touch drag (phone support)
    ph.addEventListener('touchstart', (e) => {
        draggedCode = ph;
        ph.classList.add('dragging');
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        // Create visual ghost that follows finger
        createDragGhost(ph);
        updateDragGhostPosition(e.touches[0].clientX, e.touches[0].clientY);
        ph.style.opacity = '0.5';
    });

    ph.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        // Update ghost position to follow finger
        updateDragGhostPosition(touch.clientX, touch.clientY);
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        document.querySelectorAll('.placeholder.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
        
        if (elementBelow && elementBelow.classList.contains('placeholder')) {
            elementBelow.classList.add('highlight');
        }
    });

    ph.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        document.querySelectorAll('.placeholder.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
        
        if (elementBelow && elementBelow.classList.contains('placeholder')) {
            const targetPh = elementBelow;
            if (draggedCode && draggedCode !== targetPh && draggedCode.dataset.type === targetPh.dataset.type) {
                const temp = targetPh.innerHTML;
                targetPh.innerHTML = draggedCode.innerHTML;
                draggedCode.innerHTML = temp;

                const tempRot = targetPh.dataset.rotated;
                targetPh.dataset.rotated = draggedCode.dataset.rotated;
                draggedCode.dataset.rotated = tempRot;
            }
        }
        
        draggedCode = null;
        ph.classList.remove('dragging');
        // Remove visual feedback
        ph.style.opacity = '1';
        removeDragGhost();
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
                if (funcText.includes('toggle')) {
                    const newLang = lang === 'en' ? 'hu' : 'en';
                    setLanguage(newLang);
                    
                    consoleEl.innerText = `${texts[newLang].langToggled}`;
                    consoleEl.style.color = "#50fa7b";
                }
                else if (funcText.includes('rotate')) {
                    const matches = optionsText.match(/'([^']+)'/g);
                    if (matches && matches.length === 2) {
                        const newOptions = [matches[1].replace(/'/g,''), matches[0].replace(/'/g,'')];
                        optionsPH.innerText = `const options = ['${newOptions[0]}','${newOptions[1]}'];`;
                        consoleEl.innerText = texts[lang].optionsRotated;
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
                    consoleEl.innerText = texts[lang].optionsRotated;
                    consoleEl.style.color = "#50fa7b";
                }
                else if (funcText.includes('toggle')) {
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
let touchStartXVisual = 0;
let touchStartYVisual = 0;

// Enable dragging for donuts and inner circles
document.querySelectorAll('.donut, .inner-circle').forEach(el => {
    // Skip empty-inner - it's just a decoration
    if (el.id === 'empty-inner') {
        el.style.userSelect = 'none';
        el.style.WebkitUserSelect = 'none';
        el.style.cursor = 'default';
        el.style.pointerEvents = 'none';
        return; // Don't attach drag handlers
    }
    
    // Prevent image selection and focus
    el.style.userSelect = 'none';
    el.style.WebkitUserSelect = 'none';
    el.style.WebkitTouchCallout = 'none';
    el.style.cursor = 'grab';
    el.querySelectorAll('*').forEach(child => {
        child.style.pointerEvents = 'none';
        child.style.userSelect = 'none';
        child.style.WebkitUserSelect = 'none';
    });
    // Disable dragging for any images inside
    el.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.style.pointerEvents = 'none';
    });

    // Mouse drag
    el.addEventListener('dragstart', e => {
        draggedVisual = el;
        e.dataTransfer.setData('text/plain', '');
        createDragGhost(el);
    });

    el.addEventListener('drag', (e) => {
        if (e.clientX !== 0 || e.clientY !== 0) {
            updateDragGhostPosition(e.clientX, e.clientY);
        }
    });

    el.addEventListener('dragend', () => {
        draggedVisual = null;
        removeDragGhost();
    });

    // Touch drag (phone support)
    el.addEventListener('touchstart', (e) => {
        draggedVisual = el;
        touchStartXVisual = e.touches[0].clientX;
        touchStartYVisual = e.touches[0].clientY;
        // Create visual ghost that follows finger
        createDragGhost(el);
        updateDragGhostPosition(e.touches[0].clientX, e.touches[0].clientY);
        el.style.opacity = '0.5';
    });

    el.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (draggedVisual && draggedVisual === el) {
            const touch = e.touches[0];
            // Update ghost position to follow finger
            updateDragGhostPosition(touch.clientX, touch.clientY);
        }
    });

    el.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (elementBelow) {
            const slot = elementBelow.closest('.slot');
            if (slot && draggedVisual) {
                // Trigger drop logic
                handleVisualDrop(slot, draggedVisual);
            }
        }
        // Remove visual feedback
        el.style.opacity = '1';
        removeDragGhost();
        draggedVisual = null;
    });
});

// Shared drop logic for both mouse and touch
function handleVisualDrop(slot, element) {
    if (!element) return;
    
    let elementToDrop;

    // Check source parent
    const sourceSlot = element.parentNode.classList.contains('slot') ? element.parentNode : null;

    // If dragging from a slot (move), use the original. If from source (copy), clone it.
    if (sourceSlot) {
        elementToDrop = element;
    } else {
        elementToDrop = element.cloneNode(true);
        // Disable dragging for any images inside
        elementToDrop.querySelectorAll('img').forEach(img => {
            img.setAttribute('draggable', 'false');
            img.style.pointerEvents = 'none';
        });
        // Mouse drag
        elementToDrop.addEventListener('dragstart', ev => {
            draggedVisual = elementToDrop;
            ev.dataTransfer.setData('text/plain', '');
            createDragGhost(elementToDrop);
        });
        elementToDrop.addEventListener('drag', (ev) => {
            if (ev.clientX !== 0 || ev.clientY !== 0) {
                updateDragGhostPosition(ev.clientX, ev.clientY);
            }
        });
        elementToDrop.addEventListener('dragend', () => {
            removeDragGhost();
        });
        // Touch drag
        elementToDrop.addEventListener('touchstart', (e) => {
            draggedVisual = elementToDrop;
            touchStartXVisual = e.touches[0].clientX;
            touchStartYVisual = e.touches[0].clientY;
            createDragGhost(elementToDrop);
            updateDragGhostPosition(e.touches[0].clientX, e.touches[0].clientY);
            elementToDrop.style.opacity = '0.5';
        });
        elementToDrop.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            updateDragGhostPosition(touch.clientX, touch.clientY);
        });
        elementToDrop.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elementBelow) {
                const targetSlot = elementBelow.closest('.slot');
                if (targetSlot && draggedVisual) {
                    handleVisualDrop(targetSlot, draggedVisual);
                }
            }
            elementToDrop.style.opacity = '1';
            removeDragGhost();
            draggedVisual = null;
        });
    }
    
    // Check for existing element of same type
    let existing = null;
    if (element.classList.contains('donut')) {
        existing = slot.querySelector('.donut');
    } else if (element.classList.contains('inner-circle')) {
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
}

// Slot drop logic
document.querySelectorAll('#visual-mode-container .slot').forEach(slot => {
    // Mouse drag
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedVisual) return;
        handleVisualDrop(slot, draggedVisual);
        draggedVisual = null;
    });

    // Touch drag handled by touchend on elements
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
                consoleEl.innerText = `${texts[newLang].langToggled}`;
                consoleEl.style.color = "#50fa7b";
            } else if (inner.id === 'rotator') {
                if (top.tagName === 'IMG') {
                    const temp = top.src;
                    top.src = bottom.src;
                    bottom.src = temp;
                }
                consoleEl.innerText = texts[lang].optionsRotated;
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
