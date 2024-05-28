const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
});
const connectionDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

connectionDatabase().then(() => {
    sequelize.sync({ alter: true}).then(() => {
        console.log("Sync table successfully")
    }).catch((error) => {
        console.log(error)
    })
});

module.exports = sequelize;
