const Censor = require('../models/censor')
const User = require('../models/user')
const Role = require('../models/role')
const {Op, where} = require("sequelize");
const {uploadFile, deleteFile, deleteMultipleFile} = require("../util/firebase.config");

class AdminService {
    async approveCensor(user, censorId, res) {
        try {
            const censor = await Censor.findOne({
                where: { id: censorId }
            })
            if (!censor) {
                return res.status(404).json({
                    message: "Censor is not found"
                })
            } else if (censor.status === "Verified") {
                return res.status(400).json({ message: "Censor is Verified" });
            }

            // Update status of Censor
            censor.status = "Verified"
            await censor.save()

            return res.status(200).json({
                message: "Approve censor successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async getUsers({page, limit, order, fullName, roleId, status}, res) {
        try {
            const queries = {raw: true, nes: true}

            page = parseInt(page) || 1
            limit = parseInt(limit) || 10
            const offset = (page - 1) * limit

            // Query order: ASC, DESC. Example: order[0]=fullName&order[1]=ASC
            if(order) queries.order = [order]

            const userQuery = {
                ...(fullName ? {fullName: {[Op.iLike]: `${fullName}%`}} : {}),
                ...(status ? {status} : {}),
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
                        where: roleId ? {id: roleId} : {}
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

            if(avatar) {
                const avatarUpload = await uploadFile(avatar, 'user-avatar', userId)
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
                    ? await deleteMultipleFile(userId, 'user-avatar')
                    : await deleteFile(userId, 'user-avatar');
            }

            const status = user > 0 ? 200 : 404;
            return res.status(status).json({
                message: user > 0 ? "Delete user successfully" : "User is not found"
            })
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new AdminService()