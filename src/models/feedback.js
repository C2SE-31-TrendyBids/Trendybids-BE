const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./User");

const Feedback = sequelize.define("feedback", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    rating: DataTypes.SMALLINT,
    message: DataTypes.TEXT,
    user_id: DataTypes.UUID,
});

Feedback.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id', as: 'user'})

module.exports = Feedback;
