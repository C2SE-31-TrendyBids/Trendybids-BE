const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const Role = require("./role");

const Censor = sequelize.define("censor", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    phone_number: DataTypes.STRING(20),
    avatar_url: DataTypes.TEXT,
    founding: DataTypes.DATE,
    address: DataTypes.TEXT,
    wallet_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    role_id: DataTypes.UUID,
});

Censor.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id', as: 'user'})
Censor.belongsTo(Role, {foreignKey: 'role_id', targetKey: 'id', as: 'role'})

module.exports = Censor;
