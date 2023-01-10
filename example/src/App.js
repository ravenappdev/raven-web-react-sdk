import React, { useEffect } from 'react'
import { setupPushNotification, setUser } from '@ravenapp/raven-web-react-sdk'

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
            setUser('web1')
            setupPushNotification(
              () => console.log('Error setting up push'),
              (token) => console.log('Got the token from raven: ' + token)
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
