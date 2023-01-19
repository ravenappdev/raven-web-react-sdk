import React, { useEffect } from 'react'
import { setupPushNotification } from '@ravenapp/raven-web-react-sdk'

function App() {
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

  return (
    <div className='App'>
      <header className='App-header'>
        <button
          onClick={() => {
            setupPushNotification(
              () => console.log('Error setting up push'),
              (token) => console.log('Got the token from raven: ' + token),
              process.env.PUBLIC_URL + 'firebase'
            )
          }}
        >
          Setup
        </button>
      </header>
    </div>
  )
}

export default App
