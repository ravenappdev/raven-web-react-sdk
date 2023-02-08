import {
  RAVEN_SECRET_KEY,
  RAVEN_APP_ID,
  USER_ID,
  RAVEN_USER,
  DEVICE_TOKEN,
  DEVICE_ID
} from './constants'

var AUTHORIZATION
var BASE_URL
var GET_USER
var SET_USER
var SET_USER_DEVICE
var REMOVE_USER_DEVICE
var SET_DELIVERY_STATUS
var SUBSCRIBE_TOPIC
var UNSUBSCRIBE_TOPIC

String.prototype.format = function () {
  return [...arguments].reduce((p, c) => p.replace(/%s/, c), this)
}

export function setupApi() {
  var secret = localStorage.getItem(RAVEN_SECRET_KEY)
  AUTHORIZATION = secret

  var appId = localStorage.getItem(RAVEN_APP_ID)
  BASE_URL = `https://api.ravenapp.dev/v1/apps/${appId}`

  GET_USER = `${BASE_URL}/users/%s/sdk`
  SET_USER = `${BASE_URL}/users/sdk`
  SET_USER_DEVICE = `${BASE_URL}/users/%s/devices/sdk`
  REMOVE_USER_DEVICE = `${BASE_URL}/users/%s/devices/%s/sdk`
  SET_DELIVERY_STATUS = `${BASE_URL}/push/status`
  SUBSCRIBE_TOPIC = `${BASE_URL}/push/fcm/subscribe-topic`
  UNSUBSCRIBE_TOPIC = `${BASE_URL}/push/fcm/unsubscribe-topic`
}

export function getUser() {
  var userId = localStorage.getItem(USER_ID)
  if (!userId) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  //get user api
  fetch(GET_USER.format(userId), {
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      return response.json()
    })
    .then((data) => {
      localStorage.setItem(RAVEN_USER, JSON.stringify(data))
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export function setUser(userId, onSuccess) {
  if (!userId) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  //get user api
  fetch(SET_USER, {
    method: 'POST',
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      return response.json()
    })
    .then((data) => {
      console.log('Success setting user:', data)
      var user = localStorage.getItem(RAVEN_USER)
      if (user) {
        user = JSON.parse(user)
      }

      if (user && user.devices) {
        user = Object.assign(data, user.devices)
        localStorage.setItem(RAVEN_USER, JSON.stringify(user))
      } else {
        localStorage.setItem(RAVEN_USER, JSON.stringify(data))
      }
      onSuccess()
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export function setUserDevice(userId, token) {
  if (!userId || !token) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  //get user api
  fetch(SET_USER_DEVICE.format(userId), {
    method: 'POST',
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      platform: 'web',
      fcm_token: token
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      return response.json()
    })
    .then((data) => {
      console.log('Success: Setting token on Raven')

      localStorage.setItem(DEVICE_TOKEN, token)
      localStorage.setItem(DEVICE_ID, data['device_sid'])

      var user = localStorage.getItem(RAVEN_USER)
      if (user) {
        user = JSON.parse(user)
      }

      if (user && user.devices) {
        let devices = [...user.devices]
        devices.push(data)
        user = Object.assign(user, devices)
        localStorage.setItem(RAVEN_USER, JSON.stringify(user))
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export function removeDevice(userId, deviceId) {
  if (!userId || !deviceId) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  //get user api
  fetch(REMOVE_USER_DEVICE.format(userId, deviceId), {
    method: 'DELETE',
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      // return response.json()
    })
    .then((data) => {
      console.log('Success: User device removed')
      AUTHORIZATION = null
      localStorage.removeItem(DEVICE_ID)
      localStorage.removeItem(RAVEN_USER)
      localStorage.removeItem(USER_ID)
      localStorage.removeItem(RAVEN_SECRET_KEY)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export function subscribeTopic(topics, userId, token) {
  if (!topics) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  var body = {}
  if (userId) {
    body = {
      user_id: userId,
      topics: topics
    }
  } else if (token) {
    body = {
      device_id: token,
      fcm_token: token,
      topics: topics
    }
  }

  //get user api
  fetch(SUBSCRIBE_TOPIC, {
    method: 'POST',
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      // return response.json()
    })
    .then((data) => {
      console.log('Success: Topic subscription')
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export function unsubscribeTopic(topics, userId, token) {
  if (!topics) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  var body = {}
  if (userId) {
    body = {
      user_id: userId,
      topics: topics
    }
  } else if (token) {
    body = {
      device_id: token,
      fcm_token: token,
      topics: topics
    }
  }

  //get user api
  fetch(UNSUBSCRIBE_TOPIC, {
    method: 'POST',
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      }
      // return response.json()
    })
    .then((data) => {
      console.log('Success: Topic unsubscription')
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
