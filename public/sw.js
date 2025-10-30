// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  const options = {
    body: 'This is a test notification from Zwickly!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Zwickly Notification';
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification('Zwickly Student Life', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});
