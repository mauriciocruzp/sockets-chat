const { Server } = require('net')

const host = "0.0.0.0"
const END = 'END'

const connections = new Map()

const error = (message) => {
  console.error(message)
  process.exit(1)
}

const sendMessage = (message, origin) => {
  for (const socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message)
    }
  }
}

const listen = (port) => {
  const server = new Server()

  server.on('connection', (socket) => {
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`
    console.log(`Nueva conexión desde ${remoteSocket}`)
    socket.setEncoding('utf-8')

    socket.on('data', (message) => {
      if (message === END) {
        connections.delete(socket)
        socket.end()
      }
      else if (!connections.has(socket)) {
        const values = [...connections.values()]
        if (values.includes(message)) {
          socket.write('Este usuario ya está en uso, elija otro: ')
        } else {
          connections.set(socket, message)
          console.log(`Usuario ${message} asignado para el socket ${remoteSocket}`)
        }
      } else {
        const fullMessage = `[${connections.get(socket)}]: ${message}`
        console.log(`${remoteSocket} -> ${fullMessage}`)
        sendMessage(fullMessage, socket)
      }
    })
    socket.on('error', (err) => error(err.message))
    socket.on('close', () => {
      console.log(`Conexión con ${remoteSocket} terminada`)
    })
  })

  server.listen({ port, host }, () => {
    console.log(`Escuchando en el puerto ${port}`)
  })

  server.on('error', (err) => error(err.message))
}

const main = () => {
  if (process.argv.length !== 2) {
    error(`Usage: node ${__filename}`)
  }
  listen(8000)
}

if (require.main === module) {
  main()
}