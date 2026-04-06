/* ============================================
   PPT WEB ENGINE — Navigation + Animations
   ============================================ */
(function () {
    'use strict';

    let currentSlide = 1;
    const totalSlides = 17;
    let countersAnimated = {};

    function init() {
        updateSlide(1);
        bindEvents();
    }

    function updateSlide(n) {
        if (n < 1 || n > totalSlides) return;

        // Remove active from all slides
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));

        currentSlide = n;
        const active = document.querySelector(`[data-slide="${n}"]`);
        if (active) {
            active.classList.add('active');
            // Trigger number counter animation for slide 11
            if (n === 11 && !countersAnimated[n]) {
                countersAnimated[n] = true;
                setTimeout(() => animateCounters(active), 600);
            }
        }

        // Progress bar
        document.getElementById('progressBar').style.width = (n / totalSlides * 100) + '%';

        // Counter display
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

    function animateCounters(slideEl) {
        const counters = slideEl.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            const duration = 1500;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                counter.textContent = current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target + suffix;
                }
            }
            requestAnimationFrame(update);
        });
    }

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

        // Click navigation
        document.addEventListener('click', e => {
            if (e.target.closest('.slide-nav, a, button, input')) return;
            if (e.clientX > window.innerWidth / 3) updateSlide(currentSlide + 1);
            else updateSlide(currentSlide - 1);
        });
    }

    init();
})();
