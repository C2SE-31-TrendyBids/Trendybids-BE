const express = require('express');
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
require("dotenv").config();
require("./src/util/database")
require("./src/models")

const initRoutes = require("./src/routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

initRoutes(app);

const listener = app.listen(process.env.PORT, () => {
    console.log("Server is running on the port " + listener.address().port);
});

module.exports = app;
