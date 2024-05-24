const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Rule = sequelize.define("rule", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ruleNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'rules',
    timestamps: true
});

module.exports = Rule;
