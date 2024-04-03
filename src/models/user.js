const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("user", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING(50),
        field: 'full_name',
    },
    email: DataTypes.STRING,
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'phone_number',
    },
    avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'avatar_url',
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pre-Active', 'Active', 'Suspended'),
        defaultValue: 'Pre-Active',
    },
    refreshToken: {
        type: DataTypes.STRING,
        field: 'refresh_token',
        allowNull: true
    },
    walletId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'wallet_id',
    },
    roleId: {
        type: DataTypes.STRING(10),
        field: 'role_id',
    },
}, {
    tableName: 'user',
    timestamps: false
});

module.exports = User;
