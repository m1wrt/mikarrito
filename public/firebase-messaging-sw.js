importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA001qNfQFy-Z2OUTtCQq29RYlQZvHcUHw",
  authDomain: "mikarrito-8076d.firebaseapp.com",
  projectId: "mikarrito-8076d",
  storageBucket: "mikarrito-8076d.firebasestorage.app",
  messagingSenderId: "353382490545",
  appId: "1:353382490545:web:d9d3b6f5539c93dbe59d90",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
