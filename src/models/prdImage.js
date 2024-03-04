const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const PrdImage = sequelize.define("prd_image", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    prdImageURL: {
        type: DataTypes.TEXT,
        field: 'prd_imageURL'
    },
}, {
    tableName: 'prd_image',
    timestamps: false
});

module.exports = PrdImage;
