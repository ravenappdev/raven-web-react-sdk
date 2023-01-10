importScripts("https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.9/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBfhzlaOuvzV04oHNOGN2afunCOpJJGaNs",
  authDomain: "raven-test-app.firebaseapp.com",
  databaseURL: "https://raven-test-app.firebaseio.com",
  projectId: "raven-test-app",
  storageBucket: "raven-test-app.appspot.com",
  messagingSenderId: "720703019142",
  appId: "1:720703019142:web:92852a2073af849b391907",
  measurementId: "G-9T19QD6LCS",
};

firebase.initializeApp(FIREBASE_CONFIG);

const messaging = firebase.messaging();

const broadcast = new BroadcastChannel("display-notification");

messaging.onBackgroundMessage((payload) => {
  console.log("[messaging-sw.js] Received background message ", payload);
  broadcast.postMessage({
    type: "DELIVERED",
    data: payload["data"],
  });
});

function handleClick(event) {
  event.notification.close();
  broadcast.postMessage({
    type: "CLICKED",
    data: event.notification.data,
    actions: event.notification.actions,
    action: event.action,
  });
}

self.addEventListener("notificationclick", handleClick);
