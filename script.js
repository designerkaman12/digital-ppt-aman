/* ============================================
   PPT WEB ENGINE — Animations & Navigation
   ============================================ */
(function () {
    'use strict';

    let currentSlide = 1;
    const totalSlides = 16;

    function init() {
        updateSlide(1);
        bindEvents();
    }

    // ===== NAVIGATION =====
    function updateSlide(n) {
        if (n < 1 || n > totalSlides) return;
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        currentSlide = n;
        const active = document.querySelector(`[data-slide="${n}"]`);
        if (active) {
            active.classList.add('active');
            active.scrollTop = 0;
            triggerAnimations(active);
        }
        // Progress bar
        document.getElementById('progressBar').style.width = (n / totalSlides * 100) + '%';
        // Counter
        document.getElementById('slideCounter').textContent =
            String(n).padStart(2, '0') + ' / ' + String(totalSlides).padStart(2, '0');
        // Prev/Next states
        const prev = document.getElementById('prevBtn');
        const next = document.getElementById('nextBtn');
        prev.style.opacity = n === 1 ? '0.3' : '1';
        prev.style.pointerEvents = n === 1 ? 'none' : 'auto';
        next.style.opacity = n === totalSlides ? '0.3' : '1';
        next.style.pointerEvents = n === totalSlides ? 'none' : 'auto';
    }

    // ===== TRIGGER ALL ANIMATIONS =====
    function triggerAnimations(slide) {
        const els = slide.querySelectorAll('.anim-el');
        els.forEach(el => el.classList.remove('visible'));

        els.forEach((el) => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.classList.add('visible');
            }, delay * 180 + 80);
        });

        // Counter animations
        setTimeout(() => animateCounters(slide), 400);

        // Table row animations
        setTimeout(() => animateTableRows(slide), 500);

        // Text stagger animations
        setTimeout(() => animateTextElements(slide), 200);
    }

    // ===== COUNTER ANIMATIONS =====
    function animateCounters(slide) {
        const counters = slide.querySelectorAll('.counter, .impact-number, .brand-perf-number');
        counters.forEach(el => {
            const text = el.textContent.trim();

            // Extract numeric parts for animation
            const numMatch = text.match(/[\d,]+/);
            if (!numMatch) return;

            const targetNum = parseInt(numMatch[0].replace(/,/g, ''));
            if (isNaN(targetNum) || targetNum === 0) return;

            const prefix = text.substring(0, text.indexOf(numMatch[0]));
            const suffix = text.substring(text.indexOf(numMatch[0]) + numMatch[0].length);

            el.classList.add('counter-animating');

            const startTime = performance.now();
            const duration = 1500;

            function tick(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * targetNum);

                // Format with commas
                const formatted = current.toLocaleString('en-IN');
                el.textContent = prefix + formatted + suffix;

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = prefix + targetNum.toLocaleString('en-IN') + suffix;
                    el.classList.remove('counter-animating');
                    el.classList.add('number-pulse');
                    setTimeout(() => el.classList.remove('number-pulse'), 300);
                }
            }

            // Start from 0
            el.textContent = prefix + '0' + suffix;
            requestAnimationFrame(tick);
        });
    }

    // ===== TABLE ROW ANIMATIONS =====
    function animateTableRows(slide) {
        const rows = slide.querySelectorAll('.perf-table tbody tr');
        rows.forEach((row, i) => {
            row.classList.remove('row-visible');
            setTimeout(() => {
                row.classList.add('row-visible');
            }, i * 120 + 100);
        });
    }

    // ===== TEXT ELEMENT STAGGER =====
    function animateTextElements(slide) {
        // Add text reveal to headings and labels
        const headings = slide.querySelectorAll('.slide-heading, .person-name, .hero-title');
        headings.forEach((h, i) => {
            h.classList.remove('text-reveal');
            h.style.animation = 'none';
            h.offsetHeight; // Force reflow
            h.style.animation = '';
            setTimeout(() => {
                h.classList.add('text-reveal');
            }, i * 150 + 200);
        });

        // Animate stat cards with stagger (skip impact-stat-cards to preserve grid layout)
        const cards = slide.querySelectorAll('.anim-el .glass-card:not(.impact-stat-card)');
        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(1)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, i * 80 + 300);
        });

        // Animate list items
        const listItems = slide.querySelectorAll('.brand-win-list li, .shift-card li, .strat-card li');
        listItems.forEach((li, i) => {
            li.style.opacity = '0';
            li.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, i * 60 + 500);
        });
    }

    // ===== EVENTS =====
    function bindEvents() {
        document.getElementById('prevBtn').onclick = () => updateSlide(currentSlide - 1);
        document.getElementById('nextBtn').onclick = () => updateSlide(currentSlide + 1);

        // Fullscreen
        document.getElementById('fullscreenBtn').onclick = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        };

        // Keyboard
        document.addEventListener('keydown', e => {
            if (['ArrowRight', 'ArrowDown', ' ', 'Enter'].includes(e.key)) {
                e.preventDefault();
                updateSlide(currentSlide + 1);
            }
            if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                updateSlide(currentSlide - 1);
            }
            if (e.key === 'f' || e.key === 'F') {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
                else document.exitFullscreen().catch(() => {});
            }
            if (e.key === 'Home') { e.preventDefault(); updateSlide(1); }
            if (e.key === 'End') { e.preventDefault(); updateSlide(totalSlides); }
            // Number keys for direct slide access
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= 9) updateSlide(num);
        });

        // Touch swipe
        let touchX = 0;
        document.addEventListener('touchstart', e => {
            touchX = e.changedTouches[0].screenX;
        }, { passive: true });
        document.addEventListener('touchend', e => {
            const dx = touchX - e.changedTouches[0].screenX;
            if (Math.abs(dx) > 50) {
                dx > 0 ? updateSlide(currentSlide + 1) : updateSlide(currentSlide - 1);
            }
        }, { passive: true });

        // Mouse wheel
        let wheelTimer;
        document.addEventListener('wheel', e => {
            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
                if (e.deltaY > 30) updateSlide(currentSlide + 1);
                else if (e.deltaY < -30) updateSlide(currentSlide - 1);
            }, 100);
        }, { passive: true });

        // Click navigation (left third -> prev, right two-thirds -> next)
        document.addEventListener('click', e => {
            if (e.target.closest('.slide-nav, a, button, input, .portfolio-card, img')) return;
            if (e.clientX > window.innerWidth / 3) updateSlide(currentSlide + 1);
            else updateSlide(currentSlide - 1);
        });
    }

    // Start
    init();
})();
