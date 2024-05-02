const Censor = require('../models/censor')
const User = require('../models/user')
const Role = require('../models/role')
const MemberOrganization = require('../models/memberOrganization')
const { Op, where } = require("sequelize");
const { uploadFile, deleteFile, deleteMultipleFile } = require("../config/firebase.config");
const sendEmail = require('../util/sendMail')
const readFileTemplate = require('../helpers/readFileTemplate')


class AdminService {
    async toggleStatusCensor(type, censorId, res) {
        try {
            // Check if Censor is not found
            const censor = await Censor.findOne({
                where: { id: censorId },
                attributes: { exclude: ['walletId', 'userId'] },
                include: [
                    { model: User, as: 'user', attributes: ['id', 'email', 'fullName'] }
                ]
            })
            if (!censor) {
                return res.status(404).json({
                    message: "Censor is not found"
                })
            } else if (censor.status === "Verified") {
                return res.status(400).json({ message: "Censor is Verified" });
            }

            // Type = 1: Approve Censor, Type = 2: Reject Censor
            if (type === '1') {
                // Update status of Censor and add new member to organization
                censor.status = "Verified"
                await Promise.all([
                    MemberOrganization.findOrCreate({
                        where: { userId: censor.user.id, id: censorId },
                        defaults: {
                            userId: censor.user.id,
                            censorId: censor.id
                        }
                    }),
                    censor.save(),
                    User.update({ roleId: 'R02' }, { where: { id: censor.user.id } }),
                    sendEmail({
                        email: censor.user.email,
                        subject: "<\Notification\> Auction Organization successfully verified - TrendyBids",
                        html: readFileTemplate('approveCensor.hbs', { username: censor.user.fullName })
                    })
                ])
            } else {
                // Update status of Censor
                censor.status = "Rejected"
                await Promise.all([
                    censor.save(),
                    sendEmail({
                        email: censor.user.email,
                        subject: "<\Notification\> Reject of auction organization verification - TrendyBids",
                        html: readFileTemplate('rejectCensor.hbs', { username: censor.user.fullName })
                    })
                ])
            }

            return res.status(200).json({
                message: type === "1" ? "Approve censor successfully" : "Reject censor successfully",
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async getUsers(userId, { page, limit, order, fullName, roleId, status, email }, res) {
        try {
            const queries = { raw: true, nes: true }

            page = parseInt(page) || 1
            limit = parseInt(limit) || 10
            const offset = (page - 1) * limit

            // Query order: ASC, DESC. Example: order[0]=fullName&order[1]=ASC
            if (order) queries.order = [order]

            const userQuery = {
                ...(fullName ? { fullName: { [Op.iLike]: `${fullName}%` } } : {}),
                ...(email ? { email: { [Op.iLike]: `${email}%` } } : {}),
                ...(status ? { status } : {}),
                id: { [Op.not]: userId }
            }

            const { count, rows } = await User.findAndCountAll({
                where: userQuery,
                limit,
                offset,
                order: queries.order,
                attributes: { exclude: ['password', 'roleId', 'refreshToken', 'walletId'] },
                include: [
                    {
                        model: Role, as: 'role',
                        where: roleId ? { id: roleId } : {}
                    }
                ]
            })

            return res.status(200).json({
                users: rows,
                totalItem: count,
                totalPage: Math.ceil(count / limit)
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async editUser(userId, body, avatar, res) {
        try {
            const user = await User.findOne({
                where: { id: userId }
            })
            if (!user) {
                return res.status(404).json({
                    message: "User is not found"
                })
            }
            if (avatar) {
                const avatarUpload = await uploadFile(avatar, 'user', userId)
                body.avatar = avatarUpload.url
            }
            // Update user information
            await user.update({
                ...body
            })

            return res.status(200).json({
                message: "Edit user successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteUser(userId, res) {
        try {
            const user = await User.destroy({
                where: { id: userId },
            });

            // Delete user avatar in Firebase
            if (user > 0) {
                Array.isArray(userId)
                    ? await deleteMultipleFile(userId, 'user')
                    : await deleteFile(userId, 'user');
            }

            const status = user > 0 ? 200 : 404;
            return res.status(status).json({
                message: user > 0 ? "Delete user successfully" : "User is not found"
            })
        } catch (error) {
            throw new Error(error)
        }
    }
    async getAllRoles() {
        try {
            const roles = await Role.findAll()
            const totalItem = roles.length;
            return {
                roles: roles,
                totalItem: totalItem
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AdminService()