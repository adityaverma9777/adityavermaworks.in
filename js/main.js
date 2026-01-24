/* ========================================
   ADITYA VERMA PORTFOLIO
   Main JavaScript - Navigation & Theme
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initViewMoreButtons();
    initMiniProjectLinks();
    // initGameModal();
});

/* ========================================
   NAVIGATION
   ======================================== */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-section');

            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });

            // Scroll to top of content smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/* ========================================
   THEME TOGGLE
   ======================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        html.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Add a subtle animation effect
        document.body.style.opacity = '0.98';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
}

/* ========================================
   VIEW MORE BUTTONS
   ======================================== */
function initViewMoreButtons() {
    const viewMoreBtns = document.querySelectorAll('.view-more-btn, .view-more-btn-full');

    viewMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-target');
            const targetNavBtn = document.querySelector(`.nav-btn[data-section="${targetSection}"]`);

            if (targetNavBtn) {
                targetNavBtn.click();
            }
        });
    });
}

/* ========================================
   MINI PROJECT LINKS
   ======================================== */
function initMiniProjectLinks() {
    const miniProjectCards = document.querySelectorAll('.mini-project-card');

    miniProjectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();

            // Navigate to projects section
            const projectsNavBtn = document.querySelector('.nav-btn[data-section="projects"]');
            if (projectsNavBtn) {
                projectsNavBtn.click();
            }
        });
    });
}

/* ========================================
   SMOOTH SECTION TRANSITIONS
   ======================================== */
// Add intersection observer for animations if needed in the future
function observeSections() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

/* ========================================
   KEYBOARD NAVIGATION
   ======================================== */
document.addEventListener('keydown', (e) => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const activeIndex = Array.from(navButtons).findIndex(btn => btn.classList.contains('active'));

    if (e.key === 'ArrowRight' && activeIndex < navButtons.length - 1) {
        navButtons[activeIndex + 1].click();
    } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        navButtons[activeIndex - 1].click();
    }
});

/* ========================================
   EASTER EGG - Konami Code (Optional Fun)
   ======================================== */
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg activated!
        document.body.style.animation = 'rainbow 2s linear';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);

        // Add rainbow animation to stylesheet
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        konamiCode = [];
    }
});


