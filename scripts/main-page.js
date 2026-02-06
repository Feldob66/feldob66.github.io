// ====================
// MAIN PAGE LOGIC
// ====================

document.addEventListener('DOMContentLoaded', () => {
    // Declare theme variables at the top so they're accessible to all listeners
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

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

    // --- Dark Mode toggle ---
    // Apply saved theme on load
    if (savedTheme === 'dark') {
        document.body.classList.add('darkmode');
    }

    // Update theme toggle active state
    function updateThemeToggleState() {
        const isDark = document.body.classList.contains('darkmode');
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle(
                'active',
                (isDark && opt.dataset.theme === 'dark') ||
                (!isDark && opt.dataset.theme === 'light')
            );
        });
    }

    themeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('darkmode');
        const isDark = document.body.classList.contains('darkmode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Unlock dark mode toggle on first toggle
        if (!darkModeUnlocked) {
            darkModeUnlocked = true;
            localStorage.setItem('darkModeUnlocked', 'true');
        }

        updateThemeToggleState();
    });

    // Show theme toggle if unlocked and update its state
    if (darkModeUnlocked && themeToggle) {
        themeToggle.classList.remove('hidden');
        updateThemeToggleState();
    }

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
