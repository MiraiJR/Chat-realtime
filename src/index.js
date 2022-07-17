const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const app = express()
const server = require('http').createServer(app)
const socketIO = require('socket.io')(server)
const cookieSession = require('cookie-session')
const { time } = require('console')

// template engine 
app.engine(
    'hbs', 
    handlebars.engine({
        extname: '.hbs',
    }))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources/views'))

// static file
app.use(express.static(path.join(__dirname, 'public'))) 
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 60000000000,
}))

var listSocketConnected = []

socketIO.on('connection', (socket) => {
    
    console.log('Co nguoi ket noi: ' + socket.id )

    socket.on('disconnect', () => {
        console.log(socket.id + 'da ngat ket noi')
        listSocketConnected = listSocketConnected.filter(ele => ele.id != socket.id)

        socket.broadcast.emit('notification', participant={
            nickname: socket.nickname,
            id: socket.id,
            state: "disconnect"
        })
    })

    socket.emit('server-send-id-socket', socket.id)
    
    socket.on('client-send-nickname', (data) => {

        socket.nickname = data

        var participant = {}
        participant.nickname = data
        participant.id = socket.id
        // socket.emit('server-send-data', + socket.id)
        listSocketConnected.push(participant)
        console.log(listSocketConnected)
        // socket.broadcast.emit('server-send-data', 'hello friends. I am ' + socket.id)
        socketIO.sockets.emit('server-send-data', listSocketConnected)
        socket.broadcast.emit('notification', participant={
            nickname: socket.nickname,
            id: socket.id,
            state: "connect"
        })
    })

    socket.on('client-send-msg', (data) => {
        var participant = {}
        participant.nickname = socket.nickname
        participant.id = socket.id
        participant.contentChat = data.content
        participant.timeChat = data.time
        socket.broadcast.emit('server-send-msg-to-everyone', participant)
    })
})



app.get('/', (req, res, next) => {
    return res.render('home')
})

app.get('/Api/SocketIdClient', (req, res, next) => {
    return res.json(req.cookies)
})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})