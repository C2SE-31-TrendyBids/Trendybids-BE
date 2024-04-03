const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const MemberOrganization = sequelize.define('member_organization', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
    censorId: {
        type: DataTypes.UUID,
        field: 'censor_id',
    },
}, {
    tableName: 'member_organization',
    timestamps: false
})

module.exports = MemberOrganization;