importScripts('https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.9/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAeqNPMyDw_1bBsu4IXy-xBfx4t56Zk6KM',
  authDomain: 'raven-bd761.firebaseapp.com',
  databaseURL: 'https://raven-bd761.firebaseio.com',
  projectId: 'raven-bd761',
  storageBucket: 'raven-bd761.appspot.com',
  messagingSenderId: '130665094064',
  appId: '1:130665094064:web:59751de7dc8006369b1475',
  measurementId: 'G-B4NFTLMKZH'
}

const RAVEN_APP_ID = 'ead40fc4-34a2-4e7c-abaf-337c00eef79a'

firebase.initializeApp(FIREBASE_CONFIG)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[messaging-sw.js] Received background message ', payload)
  onMessageReceived(payload)
})

function handleClick(event) {
  event.notification.close()
  updateStatus(event.notification['data']['raven_notification_id'], 'CLICKED')
  // broadcast.postMessage({
  //   type: 'CLICKED',
  //   data: event.notification.data,
  //   actions: event.notification.actions,
  //   action: event.action
  // })
}

self.addEventListener('notificationclick', handleClick)

const broadcast = new BroadcastChannel('display-notification')
broadcast.onmessage = (event) => {
  try {
    let payload = event.data
    if (payload && payload['type'] === 'DELIVERED') {
      onMessageReceived(payload)
    }

    if (payload && payload['type'] === 'CLICKED') {
      // api.updateStatus(payload['data']['raven_notification_id'], 'CLICKED')
      // if (typeof window !== 'undefined' && window.document) {
      //   const clickBroadcast = new BroadcastChannel('click-notification')
      //   var action = payload['action']
      //   if (!action) {
      //     action = payload['data']['click_action']
      //   }
      //   clickBroadcast.postMessage({
      //     click_action: action
      //   })
      // }
    }
  } catch (err) {
    console.log('Broadcast display-notification error: ' + err)
  }
}

function updateStatus(notificationId, type) {
  if (!notificationId || !type) {
    return
  }

  var BASE_URL = `https://api.ravenapp.dev/v1/apps/${RAVEN_APP_ID}`
  var SET_DELIVERY_STATUS = `${BASE_URL}/push/status`

  //get user api
  fetch(SET_DELIVERY_STATUS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_id: notificationId,
      type: type,
      timestamp: Date.now(),
      current_timestamp: Date.now()
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      // return response.json()
    })
    .then((data) => {
      // console.log(data);
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function renderNotification(reg, payload) {
  if (payload && payload['data']) {
    //form action array
    var actions = []
    for (var i = 1; i <= 4; i++) {
      if (payload['data']['action' + i]) {
        var action = payload['data']['action' + i]
        var title = payload['data']['title' + i]
        var icon = payload['data']['icon' + i]
        actions.push({ action: action, title: title, icon: icon })
      }
    }

    const notificationTitle = payload['data']['title']
    const notificationOptions = {
      body: payload['data']['body'],
      icon: payload['data']['icon'],
      data: payload['data'],
      image: payload['data']['image'],
      actions: actions
    }
    reg.showNotification(notificationTitle, notificationOptions)
  }
}

function onMessageReceived(payload) {
  renderNotification(self.registration, payload)
  setTimeout(() => {
    updateStatus(payload['data']['raven_notification_id'], 'DELIVERED')
  }, 2000)
}
