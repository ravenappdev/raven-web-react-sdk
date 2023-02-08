import React, { useEffect, useState } from 'react'
import {
  logout,
  initRavenAfterLogin,
  setupPushNotification,
  subscribeFirebaseTopic,
  unsubscribeFirebaseTopic,
  initRavenBeforeLogin
} from '@ravenapp/raven-web-react-sdk'
import { RAVEN_API_KEY, RAVEN_APP_ID, RAVEN_SECRET_KEY } from '.'

async function HMAC(key, message) {
  const g = (str) =>
      new Uint8Array(
        [...unescape(encodeURIComponent(str))].map((c) => c.charCodeAt(0))
      ),
    k = g(key),
    m = g(message),
    c = await crypto.subtle.importKey(
      'raw',
      k,
      { name: 'HMAC', hash: 'SHA-256' },
      true,
      ['sign']
    ),
    s = await crypto.subtle.sign('HMAC', c, m)
  return btoa(String.fromCharCode(...new Uint8Array(s)))
}

function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem('MY_USER', false)
  )
  const [token, setToken] = useState(
    localStorage.getItem('MY_DEVICE_TOKEN', '')
  )
  const [subscribed, setSubscribed] = useState(
    localStorage.getItem('MY_TOPIC', '')
  )

  useEffect(() => {
    //Click handling
    const broadcast = new BroadcastChannel('click-notification')
    broadcast.onmessage = (event) => {
      try {
        if (event.data) {
          let clickAction = event.data['click_action']
          //Take action here
          console.log(clickAction)
        }
      } catch (err) {
        console.log('Broadcast click-notification error: ' + err)
      }
    }
  }, [])

  useEffect(() => {
    if (!loggedIn && token) {
      initRavenBeforeLogin(
        RAVEN_APP_ID,
        '7e1a3765ae43d0cf2c3628f9d98636d4f4245761e5023fd72a8bc56ff9c3d83d'
      )
    }
  }, [loggedIn, token])

  return (
    <div className='App'>
      <header className='App-header'>
        {!token ? (
          <button
            onClick={() => {
              setupPushNotification(
                () => console.log('Error setting up push'),
                (token) => {
                  console.log('Got the token from raven: ' + token)
                  localStorage.setItem('MY_DEVICE_TOKEN', token)
                  setToken(token)
                },
                process.env.PUBLIC_URL + 'firebase'
              )
            }}
          >
            {'Setup Push'}
          </button>
        ) : (
          <span>{'Token: ' + token}</span>
        )}
        <br />
        <br />
        <button
          onClick={() => {
            if (!subscribed) {
              subscribeFirebaseTopic(['check1'])
              localStorage.setItem('MY_TOPIC', 'check1')
              setSubscribed(true)
            } else {
              unsubscribeFirebaseTopic(['check1'])
              localStorage.removeItem('MY_TOPIC')
              setSubscribed(false)
            }
          }}
        >
          {!subscribed ? 'Subscribe to Topic' : 'Unsubscribe from Topic'}
        </button>
        <br />
        <br />
        <button
          onClick={() => {
            if (loggedIn) {
              logout()
              setLoggedIn(false)
              localStorage.removeItem('MY_USER')
              if (subscribed) {
                unsubscribeFirebaseTopic(['check1'])
                localStorage.removeItem('MY_TOPIC')
                setSubscribed(false)
              }
            } else {
              initRavenAfterLogin(RAVEN_APP_ID, RAVEN_SECRET_KEY, 'web1')
              setLoggedIn(true)
              localStorage.setItem('MY_USER', true)
            }
          }}
        >
          {!loggedIn ? 'Login' : 'Logout'}
        </button>
      </header>
    </div>
  )
}

export default App
