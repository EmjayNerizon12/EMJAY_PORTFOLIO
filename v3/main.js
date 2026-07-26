document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // SCROLL SPY FOR NAV LINKS
    // ==========================================
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    if (sections.length && navLinks.length) {
        window.addEventListener("scroll", () => {
            let current = "";
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute("id");
                }
            });
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href").includes(current)) {
                    link.classList.add("active");
                }
            });
        });
    }

    // ==========================================
    // THEME TOGGLE (LIGHT / DARK MODE)
    // ==========================================
    const themeBtn = document.getElementById('themeBtn');
    const body = document.body;

    // Load saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark');
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // ==========================================
    // INTERNSHIP CAROUSEL
    // ==========================================
    const internTrack = document.getElementById('internTrack');
    const internSlides = document.querySelectorAll('.intern-slide');
    const internCounter = document.getElementById('internCounter');
    const internDotsContainer = document.getElementById('internDots');
    let internIndex = 0;

    if (internSlides.length && internDotsContainer) {
        internSlides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('intern-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToInternSlide(i));
            internDotsContainer.appendChild(dot);
        });

        const internDots = document.querySelectorAll('.intern-dot');

        function updateInternCarousel() {
            internSlides.forEach(slide => slide.classList.remove('active'));
            if (internSlides[internIndex]) internSlides[internIndex].classList.add('active');

            internDots.forEach(dot => dot.classList.remove('active'));
            if (internDots[internIndex]) internDots[internIndex].classList.add('active');

            if (internCounter) {
                internCounter.textContent = (internIndex + 1).toString().padStart(2, '0');
            }
        }

        function goToInternSlide(index) {
            internIndex = index;
            updateInternCarousel();
        }

        const internNext = document.getElementById('internNext');
        const internPrev = document.getElementById('internPrev');

        if (internNext) {
            internNext.addEventListener('click', () => {
                internIndex = (internIndex + 1) % internSlides.length;
                updateInternCarousel();
            });
        }

        if (internPrev) {
            internPrev.addEventListener('click', () => {
                internIndex = (internIndex - 1 + internSlides.length) % internSlides.length;
                updateInternCarousel();
            });
        }
    }

    // ==========================================
    // PROJECTS PAGINATION
    // ==========================================
    const projectsPages = document.getElementById('projectsPages');
    const pageCounter = document.getElementById('pageCounter');
    const pageNext = document.getElementById('pageNext');
    const pagePrev = document.getElementById('pagePrev');
    let currentPage = 0;
    const totalPages = 2; // Hardcoded 2 pages layout

    function updatePageNav() {
        if (projectsPages) {
            projectsPages.style.transform = `translateX(-${currentPage * 100}%)`;
        }
        if (pageCounter) {
            pageCounter.textContent = `${currentPage + 1} / ${totalPages}`;
        }
    }

    if (pageNext) {
        pageNext.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                updatePageNav();
            }
        });
    }

    if (pagePrev) {
        pagePrev.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                updatePageNav();
            }
        });
    }

    // ==========================================
    // PROJECT ITEM CAROUSELS
    // ==========================================
    const initProjCarousel = (id) => {
        const track = document.getElementById(`projTrack${id}`);
        if (!track) return;
        const slides = track.querySelectorAll('.proj-slide');
        const counter = document.getElementById(`projCounter${id}`);
        const dotsContainer = document.getElementById(`projDots${id}`);
        if (!slides.length || !dotsContainer) return;
        let currentIndex = 0;

        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('proj-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.proj-dot');

        function updateCarousel() {
            slides.forEach(slide => slide.classList.remove('active'));
            if (slides[currentIndex]) slides[currentIndex].classList.add('active');

            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentIndex]) dots[currentIndex].classList.add('active');

            if (counter) counter.textContent = currentIndex + 1;
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        const prevBtns = document.querySelectorAll(`.proj-prev[data-target="${id}"]`);
        const nextBtns = document.querySelectorAll(`.proj-next[data-target="${id}"]`);

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateCarousel();
            });
        });

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateCarousel();
            });
        });
    };

    // Initialize all project carousels (1 to 4)
    for (let i = 1; i <= 4; i++) {
        initProjCarousel(i);
    }

    // ==========================================
    // CERTIFICATIONS TAB SWITCHER
    // ==========================================
    const certTabs = document.querySelectorAll('.cert-tab');
    certTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            certTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.querySelectorAll('.cert-panel').forEach(panel => panel.classList.add('hidden'));
            const activePanel = document.getElementById(`panel-${target}`);
            if (activePanel) activePanel.classList.remove('hidden');
        });
    });

    // ==========================================
    // CERT / WEBINAR CAROUSEL FACTORY
    // ==========================================
    const initCertCarousel = (trackId, prevId, nextId, dotsId, currentSpanId) => {
        const track = document.getElementById(trackId);
        if (!track) return;
        const slides = track.querySelectorAll('.cert-slide');
        const dotsContainer = document.getElementById(dotsId);
        const currentSpan = document.getElementById(currentSpanId);
        if (!slides.length || !dotsContainer) return;
        let idx = 0;

        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('cert-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.cert-dot');

        function update() {
            slides.forEach(s => s.classList.remove('active'));
            slides[idx].classList.add('active');
            dots.forEach(d => d.classList.remove('active'));
            dots[idx].classList.add('active');
            if (currentSpan) currentSpan.textContent = idx + 1;
        }

        function goTo(i) { idx = i; update(); }

        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        if (prevBtn) prevBtn.addEventListener('click', () => { idx = (idx - 1 + slides.length) % slides.length; update(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { idx = (idx + 1) % slides.length; update(); });
    };

    initCertCarousel('certTrack', 'certPrev', 'certNext', 'certDots', 'certCounterCurrent');
    initCertCarousel('webinarTrack', 'webinarPrev', 'webinarNext', 'webinarDots', 'webinarCounterCurrent');
});
