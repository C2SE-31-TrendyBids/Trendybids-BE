const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const PrdImage = sequelize.define("prd_image", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    prd_imageURL: DataTypes.TEXT,
});

module.exports = PrdImage;
