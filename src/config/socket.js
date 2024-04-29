const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');
const eventEmitter = require('../config/eventEmitter');
const conversationService = require('../services/conversationService');
const userServices = require('../services/userServices')
const notificationServices = require('../services/notificationService')

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
        socket.on('onSessionJoin', (payload) => {
            socket.join(payload.sessionId);
            const room = io.sockets.adapter.rooms.get(payload.sessionId);
            if (room) {
                const numberOfUsers = room.size; // or room.size
                io.to(payload.sessionId).emit('onUserParticipation', {numberOfUsers});
                console.log("Number of users in the room: " + numberOfUsers);
            } else {
                console.log("Room does not exist or there are no users in this room.");
            }
            console.log("onSessionJoin: ", socket.rooms)
        });


        socket.on('bidPrice.create', async (payload) => {
            const responsePlaceABid =  await userServices.placeABid(socket.user.id, payload.bidPrice, payload.sessionId);
            // Emit event to all sockets in the room with ID payload.sessionId
            io.to(payload.sessionId).emit('onBidPrice', responsePlaceABid);
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
            socket.to(payload.conversationId).emit('onTypingStop');
        })

        socket.on('onConversationLeave', (payload) => {
            socket.leave(payload.conversationId);
            console.log("onConversationLeave", socket.rooms)
        })

        socket.on('product.verify', async (payload) => {
            console.log(payload)
            const recipientId = payload.recipientId;
            console.log(recipientId)
            const res = await notificationServices.createNotification({
                type: 'private',
                title: `Censor - ${payload.censor.name}: Verify product`,
                content: payload.content,
                linkAttach: "/profile/management-post",
                recipientId
            })
            const client = connectedClients.get(recipientId);
            client && client.emit('onProductVerify', res.data);
        })

        socket.on('product.reject', async (payload) => {
            console.log(payload)
            const recipientId = payload.recipientId;
            console.log(recipientId)
            const res = await notificationServices.createNotification({
                type: 'private',
                title: `Censor - ${payload.censor.name}: Reject product`,
                content: payload.content,
                linkAttach: "/profile/management-post",
                recipientId
            })
            const client = connectedClients.get(recipientId);
            client && client.emit('onProductReject', res.data);
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
            if (participantId !== senderId) {
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