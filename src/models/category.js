const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const Category = sequelize.define("category", {
    id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true,
    },
    name: DataTypes.STRING(100),
}, {
    tableName: 'category',
    timestamps: false
});

module.exports = Category;
