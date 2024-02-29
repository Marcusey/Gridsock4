const { log } = require('console');

const app = require('express')();
const server = require('http').createServer(app);

// Impoertera Socket.io-biblioteket och konfigurera det med CORS-inställningar
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

// Skapa en enkel express-rutt för att visa att servern är igång
app.get('/test', (req, res) => {
    res.send('<h1>Socket</h1>');
});

const activeRooms = new Set();

// Hantera Socket.io-händelser när en användare ansluter
io.on('connection', (socket) => {
    console.log('connection', socket);

    socket.on('joinRoom', (room) => {
        socket.join(room);
        activeRooms.add(room);
        console.log(`${socket.id} joined room: ${room}`);
        io.to(room).emit('chat', { message: `User ${socket.id} joined the room`, room: room, userId: socket.id });
        io.emit('roomList', Array.from(activeRooms));
    });

    socket.on('chat', (data) => {
        console.log('incoming chat', data);
        io.to(data.room).emit('chat', { message: data.message, room: data.room, userId: socket.id });
    });
    
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
    });
    socket.emit('roomList', Array.from(activeRooms));
});

// server.listen(3000);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});