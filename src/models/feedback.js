const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");

const Feedback = sequelize.define("feedback", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    rating: DataTypes.SMALLINT,
    message: DataTypes.TEXT,
    userId: {
        type: DataTypes.UUID,
        field: 'user_id'
    },
    productAuctionId: {
        type: DataTypes.UUID,
        // field: 'user_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        timestamps: true
    }
}, {
    tableName: 'feedback',
    timestamps: false
});



module.exports = Feedback;
