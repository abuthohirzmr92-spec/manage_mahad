// ========================================
// Service Worker — PWA Push Notifications
// ========================================

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'Notifikasi Baru',
    message:
      "Anda menerima notifikasi dari APP MA'HAD",
  };

  const options = {
    body: data.message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard/notifikasi'));
});
