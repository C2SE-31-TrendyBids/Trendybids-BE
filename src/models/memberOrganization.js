const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const Censor = require("./censor");
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

MemberOrganization.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'user'})
MemberOrganization.belongsTo(Censor, {foreignKey: 'censorId', targetKey: 'id', as: 'censor'})

module.exports = MemberOrganization;