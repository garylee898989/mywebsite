const CACHE_NAME = 'myweb-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
];

// 安裝 Service Worker 並快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求 (離線支持)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 監聽推播事件 (未來擴展)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '每日提醒';
  const options = {
    body: data.body || '記得紀錄消費跟訓練紀錄',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 監聽通知點擊
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});