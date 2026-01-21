// ============================================
// Базовые утилиты и конфигурация
// ============================================

const CONFIG = {
    OFFLINE_MESSAGE: 'Вы работаете в офлайн режиме. Некоторые функции могут быть недоступны.',
    ONLINE_MESSAGE: 'Соединение восстановлено!',
    UPDATE_MESSAGE: 'Доступна новая версия сайта. Обновить?',
    INSTALL_MESSAGE: 'Установите приложение для быстрого доступа',
    CACHE_VERSION: 'v1.0',
    DEBUG: false
};

// Функция логирования (только в режиме отладки)
function log(message, data = null) {
    if (CONFIG.DEBUG) {
        console.log(`[SGB6] ${message}`, data || '');
    }
}

// Функция показа уведомления
function showNotification(message, type = 'info', duration = 5000) {
    // Создаем контейнер для уведомлений, если его нет
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        
        // Добавляем стили для анимации
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 300px;
            }
            .notification.success { background-color: #2a9d8f; }
            .notification.warning { background-color: #e9c46a; color: #333; }
            .notification.info { background-color: #264653; }
            .notification.error { background-color: #e76f51; }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: 15px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notification-close:hover { opacity: 1; }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Определяем цвет уведомления по типу
    const colors = {
        success: '#2a9d8f',
        warning: '#e9c46a',
        info: '#264653',
        error: '#e76f51'
    };
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background-color: ${colors[type] || colors.info};
    `;
    
    // Текст уведомления
    const text = document.createElement('span');
    text.textContent = message;
    notification.appendChild(text);
    
    // Кнопка закрытия
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Закрыть уведомление');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    notification.appendChild(closeBtn);
    
    // Добавляем в контейнер
    container.appendChild(notification);
    
    // Автоматическое скрытие
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    return notification;
}

// ============================================
// Улучшенный мониторинг онлайн/офлайн статуса
// ============================================

// Детектор мобильных устройств
function isMobileDevice() {
    // Проверка по User Agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    // Проверка по ширине экрана
    const isSmallScreen = window.innerWidth <= 768;
    
    // Проверка по тач-событиям
    const hasTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 || 
                     navigator.msMaxTouchPoints > 0;
    
    return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen);
}

// Мониторинг онлайн/офлайн статуса
function monitorConnectionStatus() {
    let wasOffline = false;
    let firstLoad = true;
    let offlineNotification = null;
    let onlineNotification = null;
    let statusCheckInterval = null;
    
    // Очистка старых уведомлений о сети
    function clearNetworkNotifications() {
        if (offlineNotification && offlineNotification.parentNode) {
            offlineNotification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (offlineNotification.parentNode) {
                    offlineNotification.remove();
                }
            }, 300);
            offlineNotification = null;
        }
        
        if (onlineNotification && onlineNotification.parentNode) {
            onlineNotification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (onlineNotification.parentNode) {
                    onlineNotification.remove();
                }
            }, 300);
            onlineNotification = null;
        }
    }
    
    // Показать уведомление о сети (с умной логикой)
    function showNetworkNotification(message, type = 'info', duration = 5000) {
        const isMobile = isMobileDevice();
        
        // На десктопах показываем только warning уведомления (потеря связи)
        if (!isMobile && type === 'success') {
            return null;
        }
        
        // Очищаем предыдущие уведомления того же типа
        if (type === 'warning') {
            clearNetworkNotifications();
        } else if (type === 'success' && offlineNotification) {
            // При восстановлении связи убираем offline уведомление
            if (offlineNotification.parentNode) {
                offlineNotification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (offlineNotification.parentNode) {
                        offlineNotification.remove();
                    }
                }, 300);
            }
        }
        
        const notification = showNotification(message, type, duration);
        
        // Сохраняем ссылки на уведомления
        if (type === 'warning') {
            offlineNotification = notification;
        } else if (type === 'success') {
            onlineNotification = notification;
        }
        
        return notification;
    }
    
    // Функция обновления статуса
    function updateOnlineStatus(event = null) {
        const isOnline = navigator.onLine;
        const isMobile = isMobileDevice();
        
        log(`Статус соединения: ${isOnline ? 'online' : 'offline'}, Устройство: ${isMobile ? 'mobile' : 'desktop'}, Событие: ${event ? event.type : 'initial'}`);
        
        // Обновляем классы body
        document.body.classList.toggle('online', isOnline);
        document.body.classList.toggle('offline', !isOnline);
        
        // Обработка первого захода на сайт
        if (firstLoad) {
            firstLoad = false;
            
            if (!isOnline) {
                // Первый заход без интернета
                setTimeout(() => {
                    showNetworkNotification(
                        'Используется кешированная версия сайта. Некоторые функции ограничены.',
                        'warning',
                        7000
                    );
                }, 1500);
                wasOffline = true;
            }
            return;
        }
        
        // Обработка изменения статуса (не первая загрузка)
        if (!isOnline) {
            // Потеряли соединение
            if (!wasOffline) { // Только если до этого были онлайн
                wasOffline = true;
                
                if (isMobile) {
                    showNetworkNotification(
                        'Нет подключения к интернету',
                        'warning',
                        5000
                    );
                } else {
                    // На десктопе показываем уведомление только после 3 секунд без сети
                    clearTimeout(statusCheckInterval);
                    statusCheckInterval = setTimeout(() => {
                        if (!navigator.onLine) {
                            showNetworkNotification(
                                'Потеряно соединение с интернетом',
                                'warning',
                                4000
                            );
                        }
                    }, 3000);
                }
            }
        } else if (wasOffline) {
            // Восстановили соединение
            wasOffline = false;
            clearTimeout(statusCheckInterval);
            
            // Показываем уведомление только на мобильных
            if (isMobile) {
                setTimeout(() => {
                    showNetworkNotification('Соединение восстановлено', 'success', 3000);
                }, 500);
            }
        }
    }
    
    // Функция для троттлинга событий
    function throttle(callback, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                callback.apply(this, args);
            }
        };
    }
    
    // Обработчики событий с троттлингом
    const throttledUpdate = throttle(updateOnlineStatus, 1000);
    
    window.addEventListener('online', (e) => throttledUpdate(e));
    window.addEventListener('offline', (e) => throttledUpdate(e));
    
    // Инициализация при загрузке
    setTimeout(() => updateOnlineStatus(), 1000);
    
    // Также мониторим изменения размера окна (мобильный/десктоп может измениться при повороте)
    window.addEventListener('resize', throttle(() => {
        // При изменении размера окна перепроверяем статус для правильного отображения
        updateOnlineStatus();
    }, 500));
}

// ============================================
// Основной функционал при загрузке DOM
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    log('DOM загружен');
    
    // Добавляем класс устройства к body
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.add('desktop-device');
    }
    
    // Инициализация бургер-меню
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    
    if (burger && navLinks) {
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
            burger.setAttribute('aria-expanded', isActive);
            burger.setAttribute('aria-label', isActive ? 'Закрыть меню' : 'Открыть меню');
    
            // Блокировка скролла
            document.body.classList.toggle('menu-open', isActive);
    
            log('Меню ' + (isActive ? 'открыто' : 'закрыто'));
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
    }
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + 
                                      window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                log(`Прокрутка к элементу: ${targetId}`);
            }
        });
    });
    
    // Анимация элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдаем за элементами с анимацией
    document.querySelectorAll('.service-card, .feature, .service-category').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Мониторинг соединения
    monitorConnectionStatus();
    
    // ============================================
    // Дополнительные улучшения UX
    // ============================================
    
    // Добавляем индикатор загрузки для всех ссылок
    document.querySelectorAll('a[href]:not([href^="#"])').forEach(link => {
        link.addEventListener('click', function(e) {
            // Для внешних ссылок или переходов на другие страницы
            if (this.href && !this.href.includes(window.location.hostname)) {
                return; // Внешняя ссылка
            }
            
            // Показываем индикатор загрузки
            showNotification('Загрузка...', 'info', 2000);
        });
    });
    
    // Улучшаем доступность форм (если они появятся)
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Добавляем эффект при наведении на карточки услуг
    document.querySelectorAll('.service-card, .feature').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Улучшаем доступность для телефонов
    document.querySelectorAll('a[href^="tel:"]').forEach(phoneLink => {
        phoneLink.setAttribute('role', 'button');
        phoneLink.setAttribute('aria-label', 'Позвонить по телефону');
    });
    
    // Логируем уход со страницы (для аналитики в будущем)
    window.addEventListener('beforeunload', function() {
        log('Пользователь покидает страницу');
    });
    
    log('Инициализация завершена');
});

// ============================================
// Глобальные обработчики
// ============================================

// Обработка ошибок загрузки ресурсов
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4MCIgZmlsbD0iI2YwZjBmMCIvPjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40ODUgMTIwIDExOSAxMTEuNDg1IDExOSAxMDFDMTE5IDkwLjUxNDYgMTEwLjQ4NSA4MiAxMDAgODJDODkuNTE0NiA4yA4MSA5MC41MTQ2IDgxIDEwMUM4MSAxMTEuNDg1IDg5LjUxNDYgMTIwIDEwMCAxMjBaTTEwMCA2MUMxMjIuMDkxIDYxIDE0MCA3OC45MDkxIDE0MCAxMDFDMTQwIDEyMy4wOTEgMTIyLjA5MSAxNDEgMTAwIDE0MUM3Ny45MDkxIDE0MSA2MCAxMjMuMDkxIDYwIDEwMUM2MCA3OC45MDkxIDc3LjkwOTEgNjEgMTAwIDYxWiIgZmlsbD0iIzJhOWQ4ZiIvPjxwYXRoIGQ9Ik0xMDAgNzBDMTA3LjE4IDcwIDExMyA3NS44MTk0IDExMyA4M0MxMTMgOTAuMTgwNiAxMDcuMTggOTYgMTAwIDk2QzkyLjgxOTQgOTYgODcgOTAuMTgwNiA4NyA4M0M4NyA3NS44MTk0IDkyLjgxOTQgNzAgMTAwIDcwWiIgZmlsbD0iIzJhOWQ4ZiIvPjwvc3ZnPg==';
        e.target.alt = 'Изображение не загружено';
        log('Ошибка загрузки изображения', e.target.src);
    }
}, true);

// Добавляем стили для анимаций
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Стили для офлайн режима */
    body.offline .service-card,
    body.offline .feature {
        opacity: 0.8;
        filter: grayscale(30%);
    }
    
    /* Индикатор офлайн статуса */
    body.offline::after {
        content: '⚫ Офлайн';
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(233, 196, 106, 0.9);
        color: #333;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: pulse 2s infinite;
        pointer-events: none;
    }
    
    body.offline.mobile-device::after {
        content: '📶 Нет сети';
        background: rgba(231, 111, 81, 0.9);
        color: white;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
    }
    
    /* Скрываем индикатор на мобильных при установленном PWA */
    body.offline.mobile-device:not(.pwa-installed)::after {
        display: block;
    }
    
    /* Для мобильных устройств */
    @media (max-width: 768px) {
        body.offline::after {
            bottom: 80px; /* Выше кнопки установки PWA */
            font-size: 0.9rem;
            padding: 10px 20px;
        }
        
        body.offline.mobile-device::after {
            animation: mobilePulse 1.5s infinite;
        }
        
        @keyframes mobilePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .fade-in {
            opacity: 1;
            transform: none;
        }
        
        body.offline::after {
            animation: none;
        }
    }
`;
document.head.appendChild(animationStyles);

// Экспорт функций для отладки (опционально)
if (CONFIG.DEBUG) {
    window.SGB6 = {
        showNotification,
        log,
        isMobileDevice,
        CONFIG
    };
}
