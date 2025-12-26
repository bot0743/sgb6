// js/load-header.js
(function() {
    // Функция для загрузки шапки
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
                
                // После загрузки шапки определяем активную страницу
                setActiveNavItem();
                console.log('Шапка загружена');
            })
            .catch(error => {
                console.error('Ошибка загрузки шапки:', error);
                headerContainer.innerHTML = '<p>Шапка временно недоступна</p>';
            });
    }
    
    // Функция для определения активной страницы
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            
            // Сравниваем пути, учитывая разные форматы
            if (linkPath === currentPath || 
                (currentPath === '/' && linkPath === '/index.html') ||
                (currentPath.endsWith('/') && linkPath === currentPath + 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Загружаем шапку при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
})();
