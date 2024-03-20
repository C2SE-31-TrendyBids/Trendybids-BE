const sequelize = require("../util/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Role = require("./role");
const Wallet = require("./wallet");
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
    status: {
        type: DataTypes.ENUM('Processing', 'Verified', 'Rejected'),
        defaultValue: 'Processing',
    },
    walletId: {
        type: DataTypes.UUID,
        field: 'wallet_id',
        allowNull: true
    },
    companyTaxCode: DataTypes.STRING,
    taxCodeIssuanceDate: DataTypes.DATE,
    position: DataTypes.STRING,
    placeTaxCode: DataTypes.STRING,
}, {
    tableName: 'censor',
    timestamps: false
});

Censor.hasMany(ProductAuction, { foreignKey: 'censorId', as: 'productAuctions' });
Censor.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });
Censor.belongsTo(Role, { foreignKey: 'roleId', targetKey: 'id', as: 'role' });
Censor.belongsTo(Wallet, { foreignKey: 'walletId', targetKey: 'id', as: 'wallet' })
ProductAuction.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor' });


module.exports = Censor;
