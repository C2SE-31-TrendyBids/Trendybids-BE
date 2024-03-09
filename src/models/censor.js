const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const Role = require("./role");
const ProductAuction = require("./productAuction");

const Censor = sequelize.define("censor", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    phoneNumber: {
        type: DataTypes.STRING(20),
        field: 'phone_number',
    },
    avatarUrl: {
        type: DataTypes.TEXT,
        field: 'avatar_url',
    },
    founding: DataTypes.DATE,
    address: DataTypes.TEXT,
    walletId: {
        type: DataTypes.UUID,
        field: 'wallet_id',
    },
    userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
    roleId: {
        type: DataTypes.STRING(10),
        field: 'role_id',
    },
}, {
    tableName: 'censor',
    timestamps: false
});

// Censor.hasMany(ProductAuction, {foreignKey: 'censorId', as: 'product_auction'});
Censor.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'user'});
Censor.belongsTo(Role, {foreignKey: 'roleId', targetKey: 'id', as: 'role'});

module.exports = Censor;
