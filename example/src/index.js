import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { initFirebase } from '@ravenapp/raven-web-react-sdk'

export const FIREBASE_VAPID_KEY =
  'BNB_rwyFYc7VOb77u4cu6zHvv-NHXm6Z9YqTtcwytYeYNsA5BqNRACElB84B1mR9H2Q_4armx4ksNy4wjrnHZ38'

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAeqNPMyDw_1bBsu4IXy-xBfx4t56Zk6KM',
  authDomain: 'raven-bd761.firebaseapp.com',
  databaseURL: 'https://raven-bd761.firebaseio.com',
  projectId: 'raven-bd761',
  storageBucket: 'raven-bd761.appspot.com',
  messagingSenderId: '130665094064',
  appId: '1:130665094064:web:59751de7dc8006369b1475',
  measurementId: 'G-B4NFTLMKZH'
}

export const RAVEN_APP_ID = 'ead40fc4-34a2-4e7c-abaf-337c00eef79a'
export const RAVEN_SECRET_KEY =
  '59d0c0f5ccdd287dc9b46d8e18bbd3a269b5b6c91607693be0478d4c94f18f2c'
export const RAVEN_API_KEY = 'YXNkaGl3YW1zY2lhdXNuamxxamR3b3ducWlsamRrd3FlcWU='
export const RAVEN_TOKEN_SECRET =
  'e40ba90f660d71a2e47033d156df9a5cc1906aded97cb378928d9c7ef4d2883e'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

initFirebase(FIREBASE_CONFIG, FIREBASE_VAPID_KEY)
