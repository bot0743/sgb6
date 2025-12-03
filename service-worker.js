// Название кеша и его версия
const CACHE_NAME = 'sgb6-medical-v1.0';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/main.js',
  
  // Основные страницы
  '/pages/services.html',
  '/pages/about.html',
  '/pages/contacts.html',
  '/404.html',
  
  // Иконки и фавиконки (добавьте свои пути)
  '/favicon.ico',
  
  // Внешние ресурсы
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500&display=swap'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Установка');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кеширование файлов');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Установка завершена');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Активация');
  
  // Удаляем старые кеши
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кеша:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Активация завершена');
      return self.clients.claim();
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы на аналитику и POST-запросы
  if (event.request.method !== 'GET') return;
  
  // Для отладки можно посмотреть все запросы
  // console.log('[Service Worker] Запрос:', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Если есть в кеше - возвращаем из кеша
        if (cachedResponse) {
          // console.log('[Service Worker] Из кеша:', event.request.url);
          return cachedResponse;
        }
        
        // Иначе загружаем из сети
        return fetch(event.request)
          .then((response) => {
            // Проверяем, валидный ли ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ для кеширования
            const responseToCache = response.clone();
            
            // Добавляем в кеш
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('[Service Worker] Ошибка загрузки:', error);
            
            // Для HTML-страниц показываем кастомную офлайн страницу
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/404.html');
            }
            
            // Для других типов файлов можно показать заглушку
            if (event.request.url.includes('.css')) {
              return new Response('/* Offline */', { 
                headers: { 'Content-Type': 'text/css' } 
              });
            }
            
            return new Response('Офлайн режим. Пожалуйста, проверьте подключение к интернету.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});

// Фоновая синхронизация (если нужно будет для форм)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    console.log('[Service Worker] Фоновая синхронизация');
    // Здесь можно добавить отправку данных форм
  }
});

// Получение push-уведомлений (на будущее)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Новое уведомление от СГБ 6',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'СГБ 6', options)
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});
