// js/load-header.js (упрощенная версия)
(function() {
    function loadHeader() {
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) return;
        
        fetch('/components/header.html')
            .then(response => {
                if (!response.ok) throw new Error('Не удалось загрузить шапку');
                return response.text();
            })
            .then(html => {
                headerContainer.innerHTML = html;
                setActiveNavItem();
                console.log('Шапка загружена');
            })
            .catch(error => {
                console.error('Ошибка загрузки шапки:', error);
                headerContainer.innerHTML = '<p>Шапка временно недоступна</p>';
            });
    }
    
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            
            if (linkPath === currentPath || 
                (currentPath === '/' && linkPath === '/index.html') ||
                (currentPath.endsWith('/') && linkPath === currentPath + 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
})();
