const express = require('express');
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
require("dotenv").config();
require("./src/config/database")
require("./src/models")
require("./src/util/passportGoogle")

const initRoutes = require("./src/routes");
const initSocket = require('./src/config/socket')

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

initRoutes(app);
initSocket(httpServer);

const listener = httpServer.listen(process.env.PORT, () => {
    console.log("Server is running on the port " + listener.address().port);
});

module.exports = app;
