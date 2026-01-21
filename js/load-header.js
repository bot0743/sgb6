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
                
                // ИНИЦИАЛИЗИРУЕМ БУРГЕР-МЕНЮ ПОСЛЕ ЗАГРУЗКИ HEADER
                initBurgerMenu();
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
    
    // ВЫНОСИМ ФУНКЦИЮ ИНИЦИАЛИЗАЦИИ БУРГЕРА В ОТДЕЛЬНУЮ ФУНКЦИЮ
    function initBurgerMenu() {
        const burger = document.getElementById('burger');
        const navLinks = document.getElementById('navLinks');
        
        if (burger && navLinks) {
            console.log('Инициализация бургер-меню');
            
            // Устанавливаем начальные ARIA атрибуты
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Открыть меню');
            
            // Обработчик клика по бургеру
            burger.addEventListener('click', function() {
                const isActive = !navLinks.classList.contains('active');
        
                // Переключаем классы
                navLinks.classList.toggle('active');
                burger.classList.toggle('active');
        
                // Обновляем ARIA атрибуты
                burger.setAttribute('aria-expanded', isActive.toString());
                burger.setAttribute('aria-label', isActive ? 'Закрыть меню' : 'Открыть меню');
        
                // Блокировка скролла
                document.body.classList.toggle('menu-open', isActive);
        
                console.log('Меню ' + (isActive ? 'открыто' : 'закрыто'));
            });
            
            // Закрытие меню при клике на ссылку
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    burger.classList.remove('active');
                    burger.setAttribute('aria-expanded', 'false');
                    burger.setAttribute('aria-label', 'Открыть меню');
                    document.body.classList.remove('menu-open');
                });
            });
            
            // Закрытие меню при клике вне его области
            document.addEventListener('click', function(event) {
                if (!navLinks.contains(event.target) && !burger.contains(event.target)) {
                    navLinks.classList.remove('active');
                    burger.classList.remove('active');
                    burger.setAttribute('aria-expanded', 'false');
                    burger.setAttribute('aria-label', 'Открыть меню');
                    document.body.classList.remove('menu-open');
                }
            });
            
            // Закрытие меню по клавише Escape
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    burger.classList.remove('active');
                    burger.setAttribute('aria-expanded', 'false');
                    burger.setAttribute('aria-label', 'Открыть меню');
                    document.body.classList.remove('menu-open');
                }
            });
        } else {
            console.warn('Элементы бургер-меню не найдены');
        }
    }
    
    // Делаем функцию доступной глобально
    window.initBurgerMenu = initBurgerMenu;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
})();
