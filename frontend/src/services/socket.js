import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

export const createSocket = () => {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'], // avoids polling races
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    autoConnect: true,
  })

  return socket
}

// await until socket.connected === true
export const ensureSocketConnected = (socket, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    if (socket.connected) return resolve()
    const onConnect = () => { cleanup(); resolve() }
    const onError = (err) => { cleanup(); reject(err) }
    const timer = setTimeout(() => { cleanup(); reject(new Error('Socket connect timeout')) }, timeoutMs)
    const cleanup = () => {
      clearTimeout(timer)
      socket.off('connect', onConnect)
      socket.off('connect_error', onError)
      socket.off('error', onError)
    }
    socket.once('connect', onConnect)
    socket.once('connect_error', onError)
    socket.once('error', onError)
  })
