import {
  deleteToken,
  initializeFirebase,
  setup,
  setupForegroundCallback,
  subscribeTopic,
  unsubscribeTopic
} from '../firebase'
import * as api from './api'
import {
  DEVICE_TOKEN,
  FIREBASE_CONFIG,
  FIREBASE_VAPID_KEY,
  RAVEN_USER,
  USER_ID,
  DEVICE_ID,
  RAVEN_APP_ID,
  RAVEN_SECRET_KEY,
  SERVICE_WORKER_PATH
} from './constants'

//on app start
export function initFirebase(firebaseConfig, firebaseVapidKey) {
  localStorage.setItem(FIREBASE_CONFIG, JSON.stringify(firebaseConfig))
  localStorage.setItem(FIREBASE_VAPID_KEY, firebaseVapidKey)
  initializeFirebase(firebaseConfig)
  setupForegroundCallback()
  setupBackgroundListener(localStorage.getItem(SERVICE_WORKER_PATH, null))
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
      setupBackgroundListener(path)
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

function setupBackgroundListener(path) {
  if (path && typeof window !== 'undefined' && window.document) {
    navigator.serviceWorker.getRegistration(path).then(function (reg) {
      if (reg) {
        console.log('Background notification receiver registered')
        localStorage.setItem(SERVICE_WORKER_PATH, path)
        const broadcast = new BroadcastChannel('display-notification')
        broadcast.onmessage = (event) => {
          try {
            let payload = event.data
            if (payload && payload['type'] === 'DELIVERED') {
              renderNotification(reg, payload)
              setTimeout(() => {
                api.updateStatus(
                  payload['data']['raven_notification_id'],
                  'DELIVERED'
                )
              }, 2000)
            }

            if (payload && payload['type'] === 'CLICKED') {
              api.updateStatus(
                payload['data']['raven_notification_id'],
                'CLICKED'
              )
              if (typeof window !== 'undefined' && window.document) {
                const clickBroadcast = new BroadcastChannel(
                  'click-notification'
                )
                var action = payload['action']
                if (!action) {
                  action = payload['data']['click_action']
                }
                clickBroadcast.postMessage({
                  click_action: action
                })
              }
            }
          } catch (err) {
            console.log('Broadcast display-notification error: ' + err)
          }
        }
      }
    })
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
