import firebase from 'firebase'
import { FIREBASE_VAPID_KEY } from '../raven/constants'

export const initializeFirebase = (config) => {
  firebase.initializeApp(config)
}

export function setup(onError, onTokenReceived, serviceworkerPath) {
  try {
    if (typeof window !== 'undefined' && window.document) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.')
          getToken(onTokenReceived, serviceworkerPath)
        } else {
          console.log('Unable to get permission to notify.')
          if (onError) {
            onError()
          }
        }
      })
    }
  } catch (error) {
    console.error(error)
  }
}

function getToken(onTokenReceived, serviceworkerPath) {
  const messaging = firebase.messaging()

  var vapidKey = localStorage.getItem(FIREBASE_VAPID_KEY)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(serviceworkerPath)
      .then((reg) => {
        // Get registration token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        messaging
          .getToken({ serviceWorkerRegistration: reg, vapidKey: vapidKey })
          .then((currentToken) => {
            if (currentToken) {
              onTokenReceived(currentToken)
            } else {
              // Show permission request UI
              console.log(
                'No registration token available. Request permission to generate one.'
              )
              // requestPermission(onError)
            }
          })
          .catch((err) => {
            console.log('An error occurred while retrieving token. ', err)
            //Permission was denied
            // ...
          })

        setupForegroundCallback()
      })
      .catch((regErr) => {
        console.log('An error occurred while registering sw. ', regErr)
      })
  } else {
    console.log('cannot register sw')
  }
}

export function setupForegroundCallback() {
  const messaging = firebase.messaging()

  console.log('Foreground notification receiver registered')
  messaging.onMessage((payload) => {
    console.log('Foreground Message received. ')

    if (typeof window !== 'undefined' && window.document) {
      const broadcast = new BroadcastChannel('display-notification')

      broadcast.postMessage({
        type: 'DELIVERED',
        data: payload['data']
      })
    }

    //Click not handled here
  })
}

export function deleteToken() {
  const messaging = firebase.messaging()

  messaging
    .deleteToken()
    .then(() => {
      console.log('Token deleted.')
      // ...
    })
    .catch((err) => {
      console.log('Unable to delete token. ', err)
    })
}
