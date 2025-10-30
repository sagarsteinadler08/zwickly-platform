// simple WebSocket server that broadcasts item-created notifications
import WebSocket, { WebSocketServer } from 'ws'
const port = Number(process.env.WS_PORT || 4001)
const wss = new WebSocketServer({ port })
console.log('[ws] listening on', port)

wss.on('connection', (socket) => {
  console.log('[ws] connection')
  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(String(msg))
      if (data.type === 'new-item') {
        // broadcast to all connected
        wss.clients.forEach((c) => {
          if (c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify({ type: 'item', payload: data.payload }))
          }
        })
      }
    } catch (e) {
      // ignore
    }
  })
})

export default wss
