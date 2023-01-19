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

String.prototype.format = function () {
  return [...arguments].reduce((p, c) => p.replace(/%s/, c), this)
}

function setupApi() {
  var secret = localStorage.getItem(RAVEN_SECRET_KEY)
  AUTHORIZATION = secret

  var appId = localStorage.getItem(RAVEN_APP_ID)
  BASE_URL = `https://api.ravenapp.dev/v1/apps/${appId}`

  GET_USER = `${BASE_URL}/users/%s/sdk`
  SET_USER = `${BASE_URL}/users/sdk`
  SET_USER_DEVICE = `${BASE_URL}/users/%s/devices/sdk`
  REMOVE_USER_DEVICE = `${BASE_URL}/users/%s/devices/%s/sdk`
  SET_DELIVERY_STATUS = `${BASE_URL}/push/status`
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
    .then((response) => response.json())
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
    .then((response) => response.json())
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
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success setting user device:", data);

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
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success deleting user device:", deviceId);

      localStorage.setItem(DEVICE_TOKEN, null)
      localStorage.setItem(DEVICE_ID, null)
      localStorage.setItem(RAVEN_USER, null)
      localStorage.setItem(USER_ID, null)
      localStorage.setItem(RAVEN_SECRET_KEY, null)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export function updateStatus(notificationId, type) {
  if (!notificationId || !type) {
    return
  }

  if (!AUTHORIZATION) {
    setupApi()
  }

  //get user api
  fetch(SET_DELIVERY_STATUS, {
    method: 'POST',
    headers: {
      'X-Raven-User-Signature': AUTHORIZATION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_id: notificationId,
      type: type,
      timestamp: Date.now(),
      current_timestamp: Date.now()
    })
  })
    .then((data) => {
      // console.log(data);
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
