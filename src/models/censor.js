const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

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
    companyTaxCode: DataTypes.STRING,
    taxCodeIssuanceDate: DataTypes.DATE,
    position: DataTypes.STRING,
    placeTaxCode: DataTypes.STRING,
    userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    }
}, {
    tableName: 'censor',
    timestamps: false
});

module.exports = Censor;
