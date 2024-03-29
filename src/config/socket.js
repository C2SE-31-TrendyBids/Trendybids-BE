const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');


const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        const headerAuth = socket.handshake.headers.authorization;
        if (!headerAuth) {
            socket.disconnect()
            console.log(`Disconnected: ${socket.id}`);
            return next(new Error("Authentication error"));
        }
        const accessToken = headerAuth.split(" ")[1];
        jwt.verify(accessToken, process.env.JWT_AT_SECRET, async (error, decode) => {
            if (error) {
                socket.disconnect()
                console.log(`Disconnected: ${socket.id}`);
                return next(new Error("Authentication error"));
            }
            // Attach the user to the socket object
            socket.user = decode;
            next();
        });
    })

    io.on('connection', (socket) => {
        console.log(`Connected: ${socket.id}`);
        console.log(socket.user)

        socket.on('onSessionJoin', (body) => {
            socket.join(body);
            console.log(`Socket ${socket.id} joined room '${body}'`);

            // Get the Set of socket IDs in the room
            const clientsInRoom = io.sockets.adapter.rooms.get(body);

            // Log the socket IDs
            console.log(`Clients in room '${body}':`, Array.from(clientsInRoom));
        });

        socket.on('disconnect', () => {
            socket.disconnect();
            console.log(`Disconnected: ${socket.id}`);
        });
    });
}

module.exports = initSocket;