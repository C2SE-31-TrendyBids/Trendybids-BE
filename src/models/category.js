const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const Category = sequelize.define("category", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: DataTypes.STRING(100),
}, {
    tableName: 'category',
    timestamps: false
});

module.exports = Category;
