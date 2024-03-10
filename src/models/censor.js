const sequelize = require("../util/database");
<<<<<<< HEAD
const { DataTypes } = require("sequelize");
=======
const {DataTypes} = require("sequelize");
const User = require("./user");
const Role = require("./role");
>>>>>>> e07e9311b44784fd919409234ab929e275be623e
const Wallet = require("./wallet");

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
<<<<<<< HEAD
    },
    companyTaxCode: DataTypes.STRING,
    taxCodeIssuanceDate: DataTypes.DATE,
    position: DataTypes.STRING,
    placeTaxCode: DataTypes.STRING,

=======
    }
>>>>>>> e07e9311b44784fd919409234ab929e275be623e
}, {
    tableName: 'censor',
    timestamps: false
});

<<<<<<< HEAD
Censor.belongsTo(Wallet, { foreignKey: 'walletId', targetKey: 'id', as: 'wallet' })
=======
// Censor.hasMany(ProductAuction, {foreignKey: 'censorId', as: 'product_auction'});
Censor.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'user'});
Censor.belongsTo(Role, {foreignKey: 'roleId', targetKey: 'id', as: 'role'});
Censor.belongsTo(Wallet, {foreignKey: 'walletId', targetKey: 'id', as: 'wallet'})
>>>>>>> e07e9311b44784fd919409234ab929e275be623e

module.exports = Censor;
