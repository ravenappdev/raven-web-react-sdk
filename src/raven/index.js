import { deleteToken, initializeFirebase, setup } from '../firebase'
import * as api from './api'
import {
  DEVICE_TOKEN,
  FIREBASE_CONFIG,
  FIREBASE_VAPID_KEY,
  RAVEN_USER,
  USER_ID,
  DEVICE_ID,
  RAVEN_APP_ID,
  RAVEN_SECRET_KEY
} from './constants'

//on app start
export function initFirebase(firebaseConfig, firebaseVapidKey) {
  localStorage.setItem(FIREBASE_CONFIG, JSON.stringify(firebaseConfig))
  localStorage.setItem(FIREBASE_VAPID_KEY, firebaseVapidKey)
  initializeFirebase(firebaseConfig)
  api.getUser()
}

//after initFirebase: to get permission and token
export function setupPushNotification(
  onError,
  onTokenReceived,
  customServiceWorkerPath
) {
  setup(
    onError,
    (token) => {
      //set token locally
      localStorage.setItem(DEVICE_TOKEN, token)
      if (onTokenReceived) {
        onTokenReceived(token)
      }
    },
    customServiceWorkerPath
  )
}

//after login and getting the signature using userId
export function initRaven(ravenAppId, ravenSecretKey, userId) {
  localStorage.setItem(RAVEN_APP_ID, ravenAppId)
  localStorage.setItem(RAVEN_SECRET_KEY, ravenSecretKey)
  setUser(userId)
}

//create user on raven after login and raven initialization
function setUser(userId) {
  if (!userId) {
    return
  }

  //set user id
  localStorage.setItem(USER_ID, userId)

  //check if data is already set for the user
  var user = localStorage.getItem(RAVEN_USER)
  if (user) {
    user = JSON.parse(user)
  }

  api.setUser(userId, () => {
    var token = localStorage.getItem(DEVICE_TOKEN)
    sendTokenToRaven(token)
  })
}

export function logout() {
  var deviceId = localStorage.getItem(DEVICE_ID)
  if (!deviceId) {
    return
  }

  deleteToken()

  let userId = localStorage.getItem(USER_ID)
  api.removeDevice(userId, deviceId)
}

function sendTokenToRaven(token) {
  if (!token) {
    return
  }

  //check if server already has the token, then store locally
  var user = localStorage.getItem(RAVEN_USER)
  if (user) {
    user = JSON.parse(user)
  }
  if (user && user.devices) {
    for (var it in user.devices) {
      if (it['fcm_token'] === token) {
        localStorage.setItem(DEVICE_TOKEN, token)
        localStorage.setItem(DEVICE_ID, it['device_sid'])
        return
      }
    }
  }

  //get user id
  let userId = localStorage.getItem(USER_ID)
  if (userId) {
    api.setUserDevice(userId, token)
  }
}

const broadcast = new BroadcastChannel('display-notification')
broadcast.onmessage = (event) => {
  try {
    let payload = event.data
    if (payload && payload['type'] === 'DELIVERED') {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        renderNotification(reg, payload)
        setTimeout(() => {
          api.updateStatus(
            payload['data']['raven_notification_id'],
            'DELIVERED'
          )
        }, 2000)
      })
    }

    if (payload && payload['type'] === 'CLICKED') {
      api.updateStatus(payload['data']['raven_notification_id'], 'CLICKED')
      const clickBroadcast = new BroadcastChannel('click-notification')
      var action = payload['action']
      if (!action) {
        action = payload['data']['click_action']
      }
      clickBroadcast.postMessage({
        click_action: action
      })
    }
  } catch (err) {
    console.log('Broadcast display-notification error: ' + err)
  }
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
