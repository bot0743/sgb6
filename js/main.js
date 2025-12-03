// Burger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    
    // Function to toggle burger animation
    function toggleBurgerAnimation(isActive) {
        const spans = burger.querySelectorAll('span');
        if (isActive) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
    
    if (burger && navLinks) {
        // Set initial ARIA attributes
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Открыть меню');
        
        burger.addEventListener('click', function() {
            const isActive = !navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            
            // Update ARIA attributes
            burger.setAttribute('aria-expanded', isActive);
            burger.setAttribute('aria-label', isActive ? 'Закрыть меню' : 'Открыть меню');
            
            // Animate burger icon
            toggleBurgerAnimation(isActive);
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Открыть меню');
                toggleBurgerAnimation(false);
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !burger.contains(event.target)) {
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Открыть меню');
                toggleBurgerAnimation(false);
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Открыть меню');
                toggleBurgerAnimation(false);
            }
        });
    }
    
    // Smooth scroll for anchor links with offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading animation for cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe service cards and features
    document.querySelectorAll('.service-card, .feature, .service-category').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
