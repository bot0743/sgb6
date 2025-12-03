// js/sw-register.js
(function() {
  // Проверяем поддержку Service Worker
  if ('serviceWorker' in navigator) {
    console.log('Поддержка Service Worker обнаружена');
    
    window.addEventListener('load', function() {
      // Регистрируем Service Worker
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('Service Worker зарегистрирован:', registration.scope);
          
          // Проверяем обновления каждые 60 минут
          setInterval(function() {
            registration.update();
          }, 60 * 60 * 1000);
          
          // Обработчик обновления Service Worker
          registration.addEventListener('updatefound', function() {
            const newWorker = registration.installing;
            console.log('Обнаружено обновление Service Worker');
            
            newWorker.addEventListener('statechange', function() {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('Новая версия доступна. Обновите страницу.');
                  
                  // Показываем уведомление об обновлении
                  if (confirm('Доступна новая версия сайта. Обновить?')) {
                    window.location.reload();
                  }
                } else {
                  console.log('Service Worker установлен впервые');
                }
              }
            });
          });
        })
        .catch(function(error) {
          console.log('Ошибка регистрации Service Worker:', error);
        });
      
      // Обработчик офлайн/онлайн статуса
      window.addEventListener('online', function() {
        console.log('Вы онлайн');
        // Можно показать уведомление
        showNotification('Вы снова онлайн', 'success');
      });
      
      window.addEventListener('offline', function() {
        console.log('Вы офлайн');
        showNotification('Вы в офлайн режиме. Некоторые функции ограничены.', 'warning');
      });
      
      // Проверяем текущий статус
      if (!navigator.onLine) {
        console.log('Начальная загрузка в офлайн режиме');
        showNotification('Вы в офлайн режиме. Используется кешированная версия сайта.', 'info');
      }
    });
    
    // Функция для показа уведомлений
    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2a9d8f' : type === 'warning' ? '#e9c46a' : '#264653'};
        color: white;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
      `;
      
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Автоматическое скрытие через 5 секунд
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 5000);
      
      // Добавляем стили для анимации
      if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
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
    }
  } else {
    console.log('Service Worker не поддерживается вашим браузером');
  }
})();
