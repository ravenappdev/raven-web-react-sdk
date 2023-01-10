import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { initFirebase, initRaven } from 'raven-web-react-sdk'

const FIREBASE_VAPID_KEY =
  'BFCiRVNjsqqXlwqBwv-NMrPWCoI50cvFTfzh8dMp1Q6YLwesjLKwSnQJEL1O2l3VjXoY17FmA-50nj3izde5lp4'

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBfhzlaOuvzV04oHNOGN2afunCOpJJGaNs',
  authDomain: 'raven-test-app.firebaseapp.com',
  databaseURL: 'https://raven-test-app.firebaseio.com',
  projectId: 'raven-test-app',
  storageBucket: 'raven-test-app.appspot.com',
  messagingSenderId: '720703019142',
  appId: '1:720703019142:web:92852a2073af849b391907',
  measurementId: 'G-9T19QD6LCS'
}

const RAVEN_APP_ID = 'ead40fc4-34a2-4e7c-abaf-337c00eef79a'
const RAVEN_SECRET_KEY =
  '59d0c0f5ccdd287dc9b46d8e18bbd3a269b5b6c91607693be0478d4c94f18f2c'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

initFirebase(FIREBASE_CONFIG, FIREBASE_VAPID_KEY)
initRaven(RAVEN_APP_ID, RAVEN_SECRET_KEY)
