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

    function initBurgerMenu() {
        const burger = document.getElementById('burger');
        const navLinks = document.getElementById('navLinks');
        
        if (!burger || !navLinks) {
            console.warn('Элементы бургер-меню не найдены');
            return;
        }
        
        burger.addEventListener('click', function() {
            // Переключаем класс для анимации бургера
            burger.classList.toggle('active');
            
            // Переключаем видимость меню
            navLinks.classList.toggle('active');
            
            // Обновляем aria-атрибуты для доступности
            const isExpanded = burger.getAttribute('aria-expanded') === 'true';
            burger.setAttribute('aria-expanded', !isExpanded);
            
            // Блокируем/разблокируем прокрутку страницы
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
        
        // Закрываем меню при клике на ссылку (для мобильных)
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Закрываем меню при клике вне его
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar') && navLinks.classList.contains('active')) {
                burger.classList.remove('active');
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // Закрываем меню при нажатии Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                burger.classList.remove('active');
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
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
