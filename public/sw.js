const CACHE_NAME = 'fam-mobile-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Background sync for offline expense tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

async function syncExpenses() {
  const pendingExpenses = await getStoredData('pendingExpenses');
  if (pendingExpenses && pendingExpenses.length > 0) {
    for (const expense of pendingExpenses) {
      try {
        const currentExpenses = await getStoredData('familyTrip');
        if (currentExpenses) {
          const trip = JSON.parse(currentExpenses);
          trip.expenses.push(expense);
          localStorage.setItem('familyTrip', JSON.stringify(trip));
        }
      } catch (error) {
        console.error('Error syncing expense:', error);
      }
    }
    localStorage.removeItem('pendingExpenses');
  }
}

function getStoredData(key) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(key);
    resolve(data);
  });
}
