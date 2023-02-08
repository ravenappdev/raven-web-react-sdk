import { initializeFirebase, setup, setupForegroundCallback } from '../firebase'
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
  setupForegroundCallback()
  api.getUser()
}

//after initFirebase: to get permission and token
export function setupPushNotification(
  onError,
  onTokenReceived,
  customServiceWorkerPath
) {
  var path = ''
  if (typeof window !== 'undefined' && window.document) {
    path = process.env.PUBLIC_URL + '/messaging-sw.js'
  }
  if (customServiceWorkerPath) {
    path = customServiceWorkerPath + '/messaging-sw.js'
  }

  setup(
    onError,
    (token) => {
      //set token locally
      localStorage.setItem(DEVICE_TOKEN, token)
      if (onTokenReceived) {
        onTokenReceived(token)
      }
    },
    path
  )
}

//OPTIONAL: before login, init raven to reach out to unidentified user using topics. use the firebase token as the userId and pass the signature as the secret
export function initRavenBeforeLogin(ravenAppId, ravenSecretKey) {
  localStorage.setItem(RAVEN_APP_ID, ravenAppId)
  localStorage.setItem(RAVEN_SECRET_KEY, ravenSecretKey)
  api.setupApi()
}

//after login, init raven and identify the user on raven. use the userId to get the signature and pass it as secret
export function initRavenAfterLogin(ravenAppId, ravenSecretKey, userId) {
  localStorage.setItem(RAVEN_APP_ID, ravenAppId)
  localStorage.setItem(RAVEN_SECRET_KEY, ravenSecretKey)
  api.setupApi()
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

  // deleteToken()

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

//topic
export function subscribeFirebaseTopic(topics) {
  let userId = localStorage.getItem(USER_ID)
  if (userId) {
    api.subscribeTopic(topics, userId, null)
  } else {
    const token = localStorage.getItem(DEVICE_TOKEN)
    if (token) {
      api.subscribeTopic(topics, null, token)
    }
  }
}

export function unsubscribeFirebaseTopic(topics) {
  let userId = localStorage.getItem(USER_ID)
  if (userId) {
    api.unsubscribeTopic(topics, userId, null)
  } else {
    const token = localStorage.getItem(DEVICE_TOKEN)
    if (token) {
      api.unsubscribeTopic(topics, null, token)
    }
  }
}
