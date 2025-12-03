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
// Функционал бургер-меню
// ============================================

// Функция анимации бургер-меню
function toggleBurgerAnimation(isActive) {
    const burger = document.getElementById('burger');
    if (!burger) return;
    
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

// ============================================
// PWA функционал
// ============================================

// Регистрация Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    log('Service Worker зарегистрирован:', registration.scope);
                    
                    // Проверка обновлений каждые 1 час
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);
                    
                    // Обработчик обнаружения обновления
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        log('Обнаружено обновление Service Worker');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Показываем уведомление об обновлении
                                const notification = showNotification(CONFIG.UPDATE_MESSAGE, 'info', 10000);
                                
                                // Добавляем кнопку обновления
                                const updateBtn = document.createElement('button');
                                updateBtn.textContent = 'Обновить';
                                updateBtn.style.cssText = `
                                    margin-left: 10px;
                                    padding: 5px 10px;
                                    background: white;
                                    color: #264653;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    font-weight: bold;
                                `;
                                updateBtn.addEventListener('click', () => {
                                    window.location.reload();
                                });
                                
                                notification.querySelector('span').appendChild(updateBtn);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Ошибка регистрации Service Worker:', error);
                });
        });
    }
}

// Обработка установки PWA
function handlePWAInstall() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Предотвращаем автоматический показ промта
        e.preventDefault();
        deferredPrompt = e;
        
        // Показываем свою кнопку установки через 10 секунд
        setTimeout(() => {
            showInstallButton();
        }, 10000);
    });
    
    function showInstallButton() {
        // Проверяем, не установлено ли уже приложение
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            return;
        }
        
        const installButton = document.createElement('button');
        installButton.id = 'install-button';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Установить приложение</span>
        `;
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            background: linear-gradient(135deg, #2a9d8f, #21867a);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
            transition: transform 0.2s, box-shadow 0.2s;
        `;
        
        installButton.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // Показываем нативный промт установки
            deferredPrompt.prompt();
            
            // Ждем результата
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                log('Пользователь установил приложение');
                installButton.style.display = 'none';
                showNotification('Приложение установлено!', 'success');
            } else {
                log('Пользователь отказался от установки');
            }
            
            deferredPrompt = null;
        });
        
        installButton.addEventListener('mouseenter', () => {
            installButton.style.transform = 'translateY(-2px)';
            installButton.style.boxShadow = '0 6px 16px rgba(42, 157, 143, 0.4)';
        });
        
        installButton.addEventListener('mouseleave', () => {
            installButton.style.transform = 'translateY(0)';
            installButton.style.boxShadow = '0 4px 12px rgba(42, 157, 143, 0.3)';
        });
        
        document.body.appendChild(installButton);
        
        // Автоматическое скрытие через 30 секунд
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => installButton.remove(), 300);
            }
        }, 30000);
    }
}

// Мониторинг онлайн/офлайн статуса
function monitorConnectionStatus() {
    // Функция обновления статуса
    function updateOnlineStatus() {
        const status = navigator.onLine ? 'online' : 'offline';
        log(`Статус соединения: ${status}`);
        
        if (navigator.onLine) {
            showNotification(CONFIG.ONLINE_MESSAGE, 'success', 3000);
            document.body.classList.remove('offline');
        } else {
            showNotification(CONFIG.OFFLINE_MESSAGE, 'warning', 5000);
            document.body.classList.add('offline');
        }
    }
    
    // Обработчики событий
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Инициализация при загрузке
    updateOnlineStatus();
}

// ============================================
// Основной функционал при загрузке DOM
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    log('DOM загружен');
    
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
            navLinks.classList.toggle('active');
            
            // Обновляем ARIA атрибуты
            burger.setAttribute('aria-expanded', isActive);
            burger.setAttribute('aria-label', isActive ? 'Закрыть меню' : 'Открыть меню');
            
            // Анимация бургера
            toggleBurgerAnimation(isActive);
            
            log('Меню ' + (isActive ? 'открыто' : 'закрыто'));
        });
        
        // Закрытие меню при клике на ссылку
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Открыть меню');
                toggleBurgerAnimation(false);
            });
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !burger.contains(event.target)) {
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Открыть меню');
                toggleBurgerAnimation(false);
            }
        });
        
        // Закрытие меню по клавише Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Открыть меню');
                toggleBurgerAnimation(false);
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
    
    // ============================================
    // Инициализация PWA функционала
    // ============================================
    
    // Регистрация Service Worker
    registerServiceWorker();
    
    // Обработка установки PWA
    handlePWAInstall();
    
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
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4MCIgZmlsbD0iI2YwZjBmMCIvPjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40ODUgMTIwIDExOSAxMTEuNDg1IDExOSAxMDFDMTE5IDkwLjUxNDYgMTEwLjQ4NSA4MiAxMDAgODJDODkuNTE0NiA4MiA4MSA5MC41MTQ2IDgxIDEwMUM4MSAxMTEuNDg1IDg5LjUxNDYgMTIwIDEwMCAxMjBaTTEwMCA2MUMxMjIuMDkxIDYxIDE0MCA3OC45MDkxIDE0MCAxMDFDMTQwIDEyMy4wOTEgMTIyLjA5MSAxNDEgMTAwIDE0MUM3Ny45MDkxIDE0MSA2MCAxMjMuMDkxIDYwIDEwMUM2MCA3OC45MDkxIDc3LjkwOTEgNjEgMTAwIDYxWiIgZmlsbD0iIzJhOWQ4ZiIvPjxwYXRoIGQ9Ik0xMDAgNzBDMTA3LjE4IDcwIDExMyA3NS44MTk0IDExMyA4M0MxMTMgOTAuMTgwNiAxMDcuMTggOTYgMTAwIDk2QzkyLjgxOTQgOTYgODcgOTAuMTgwNiA4NyA4M0M4NyA3NS44MTk0IDkyLjgxOTQgNzAgMTAwIDcwWiIgZmlsbD0iIzJhOWQ4ZiIvPjwvc3ZnPg==';
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
    
    .offline .service-card,
    .offline .feature {
        opacity: 0.8;
        filter: grayscale(30%);
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
    }
`;
document.head.appendChild(animationStyles);

// Экспорт функций для отладки (опционально)
if (CONFIG.DEBUG) {
    window.SGB6 = {
        showNotification,
        log,
        toggleBurgerAnimation,
        CONFIG
    };
}
