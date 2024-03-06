const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const NodeCache = require('node-cache');
const User = require('../models/user');
const Role = require('../models/role')
const Wallet = require('../models/wallet')


const cache = new NodeCache();
class UserService {
    async getCurrentUser(id, res) {
        try {
            const user = await User.findOne({
                where: { id },
                attributes: {
                    exclude: ["password", "roleId", "walletId", "refreshToken",],
                },
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: { exclude: ["id"] }
                }, {
                    model: Wallet,
                    as: 'wallet',
                    attributes: { exclude: ["id"] }
                }
                ]
            });
            if (!user) {
                return res.status(401).json({
                    message: 'The email sent does not match any registered email'
                });
            }
            return res.status(200).json({ user });
        } catch (error) {
            console.error('Error retrieving user by token:', error.message);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

}

module.exports = new UserService()