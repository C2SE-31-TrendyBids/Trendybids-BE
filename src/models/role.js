const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const Role = sequelize.define("role", {
    id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true,
    },
    name: DataTypes.STRING(20),
}, {
    tableName: 'role',
    timestamps: false
});

module.exports = Role;
