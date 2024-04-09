const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const eventEmitter = require('../config/eventEmitter');
const conversationService = require('../services/conversationService');

const connectedClients = new Map();
const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
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
        console.log("New Incoming Connection:", socket.user.id);
        socket.emit('connected', {status: 'good'})
        // Save client connected to map
        connectedClients.set(socket.user.id, socket);


        // ----- Handle event in Auction Session -----
        socket.on('onSessionJoin', (body) => {
            socket.join(body);
            console.log(`Socket ${socket.id} joined room '${body}'`);

            // Get the Set of socket IDs in the room
            const clientsInRoom = io.sockets.adapter.rooms.get(body);

            // Log the socket IDs
            console.log(`Clients in room '${body}':`, Array.from(clientsInRoom));
        });


        // ----- Handle event in Conversation -----
        socket.on('onConversationJoin', (payload) => {
            socket.join(payload.conversationId);
            console.log("onConversationJoin", socket.rooms)
        })

        socket.on('onTypingStart', (payload) => {
            socket.to(payload.conversationId).emit('onTypingStart');
        })

        socket.on('onTypingStop', (payload) => {
            socket.to(payload.conversationId).emit('onTypingStart');
        })

        socket.on('onConversationLeave', (payload) => {
            socket.leave(payload.conversationId);
            console.log("onConversationLeave", socket.rooms)
        })

        socket.on('disconnect', () => {
            console.log(`Disconnected: ${socket.id}`);
            connectedClients.delete(socket.user.id);
            socket.disconnect();
        });
    });

    // ----- Handle event create message => send message to client in room chat -----
    eventEmitter.on('message.create', async (payload) => {
        const parsePayload = JSON.parse(payload);

        const senderId = parsePayload.user.id;
        const conversationId = parsePayload.conversationId;

        // Get all participants in conversation
        const participants = await conversationService.getParticipants(conversationId)

        // Send message to participant in conversation (only send to other participants, not sender
        participants.forEach((participantId) => {
            if(participantId !== senderId) {
                // Check client connected in socket
                const client = connectedClients.get(participantId);
                client && client.emit('onMessage', parsePayload);
            }
        })
    });

    eventEmitter.on('conversation.create', async (payload) => {
        const parsePayload = JSON.parse(payload);
        const recipientId = parsePayload.recipient.id;
        console.log(recipientId)

        // Check client connected in socket
        const client = connectedClients.get(recipientId);
        client && client.emit('onConversation', parsePayload);
    })
}

module.exports = initSocket;