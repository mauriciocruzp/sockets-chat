const { Socket } = require('net')

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const END = 'END'

const error = (message) => {
  console.error(message)
  process.exit(1)
}

const connect = (host, port) => {
  console.log(`Conectando a ${host}:${port}`)

  const socket = new Socket()
  socket.connect({ host, port })
  socket.setEncoding('utf-8')

  socket.on('connect', () => {
    console.log('Conectado')

    readline.question('Elija un usuario: ', (username) => {
      socket.write(username)
      console.log(`Escriba un mensaje para enviar, escriba ${END} para finalizar`)
    })

    readline.on('line', (message) => {
      socket.write(message)
      if (message === END) {
        socket.end()
        console.log('Desconectado')
      }
    })
    socket.on('data', (data) => {
      console.log(data)
    })
  })

  socket.on('error', (err) => error(err.message))
  socket.on('close', () => process.exit(0))
}

const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} host`)
  }
  let [, , host] = process.argv
  connect(host, 8000)
}

if (require.main === module) {
  main()
}