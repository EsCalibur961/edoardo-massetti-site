importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyBr_8KqWOQ4DAMsREYsf7cgZhiTEQkOW_U",
  authDomain: "edoardo-massetti-news.firebaseapp.com",
  projectId: "edoardo-massetti-news",
  storageBucket: "edoardo-massetti-news.firebasestorage.app",
  messagingSenderId: "479711372922",
  appId: "1:479711372922:web:a7b6748ca88e7beec87dc3",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/favicon.png",
  })
})