const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const Role = sequelize.define("role", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: DataTypes.STRING(20),
});

module.exports = Role;
