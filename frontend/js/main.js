// =========================================
// ATTENDANCE MANAGEMENT SYSTEM
// MAIN JAVASCRIPT
// =========================================


// =========================================
// NAVBAR SCROLL EFFECT
// =========================================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});


// =========================================
// SMOOTH SCROLL
// =========================================

document.querySelectorAll('a[href^="#"]').forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {
            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

});


// =========================================
// SIMPLE REVEAL ANIMATION
// =========================================

const revealElements = document.querySelectorAll(
    ".feature-card, .role-card, .section-heading, .roles-content, .cta-box"
);

const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


revealElements.forEach((element) => {

    element.classList.add("reveal");

    revealObserver.observe(element);

});


// =========================================
// CURRENT YEAR
// =========================================

const currentYear = new Date().getFullYear();

const footerYear = document.querySelector(".footer p");

if (footerYear) {

    footerYear.textContent =
        `© ${currentYear} Attendance Management System`;

}


// =========================================
// CONSOLE MESSAGE
// =========================================

console.log(
    "%cAttendance Management System",
    "color:#60a5fa;font-size:18px;font-weight:bold;"
);

console.log(
    "%cSystem initialized successfully.",
    "color:#94a3b8;font-size:12px;"
);