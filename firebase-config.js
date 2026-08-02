/* ============================================================
   Firebase configuration
   ============================================================ */

const firebaseConfig = {
  apiKey: 'AIzaSyCQfNxbw4TE8h9PXmqy7wE6yINPUG7Om1A',
  authDomain: 'friendship-day-cbeb2.firebaseapp.com',
  projectId: 'friendship-day-cbeb2',
  storageBucket: 'friendship-day-cbeb2.firebasestorage.app',
  messagingSenderId: '731778155967',
  appId: '1:731778155967:web:3fcc3c3401297f55b50d0a',
};

if (!window.firebase) {
  console.warn('Firebase SDK not loaded — check script tags in the HTML.');
} else if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
