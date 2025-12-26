// service-worker.js
const CACHE_NAME = 'sgb6-medical-v1.1';
const CACHE_FILES = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/responsive.css',
    '/js/main.js',
    '/404.html',
    '/pages/services.html',
    '/pages/about.html',
    '/pages/contacts.html',

    // Иконки и фавиконки
    '/favicon.ico',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Установка v1.1');
  
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
  console.log('[Service Worker] Активация v1.1');
  
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

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы на аналитику и POST-запросы
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Если есть в кеше - возвращаем из кеша
        if (cachedResponse) {
          console.log('[Service Worker] Из кеша:', event.request.url);
          return cachedResponse;
        }
        
        // Иначе загружаем из сети
        return fetch(event.request)
          .then((response) => {
            // Проверяем, валидный ли ответ
            if (!response || response.status !== 200) {
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
            
            return new Response('Офлайн режим. Пожалуйста, проверьте подключение к интернету.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});
