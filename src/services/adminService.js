const Censor = require('../models/censor')
const User = require('../models/user')
const Role = require('../models/role')
const ProductAuction = require('../models/productAuction')
const TransactionHistory = require('../models/transactionHistory')
const MemberOrganization = require('../models/memberOrganization')
const Rule = require('../models/rule')
const {Op, where, Sequelize} = require("sequelize");
const {uploadFile, deleteFile, deleteMultipleFile} = require("../config/firebase.config");
const sendEmail = require('../util/sendMail')
const readFileTemplate = require('../helpers/readFileTemplate')
const sequelize = require("../config/database");


class AdminService {
    async toggleStatusCensor(type, censorId, res) {
        try {
            // Check if Censor is not found
            const censor = await Censor.findOne({
                where: {id: censorId},
                attributes: {exclude: ['walletId', 'userId']},
                include: [
                    {model: User, as: 'user', attributes: ['id', 'email', 'fullName']}
                ]
            })
            if (!censor) {
                return res.status(404).json({
                    message: "Censor is not found"
                })
            } else if (censor.status === "Verified") {
                return res.status(400).json({message: "Censor is Verified"});
            }

            // Type = 1: Approve Censor, Type = 2: Reject Censor
            if (type === '1') {
                // Update status of Censor and add new member to organization
                censor.status = "Verified"
                await Promise.all([
                    MemberOrganization.findOrCreate({
                        where: {userId: censor.user.id, id: censorId},
                        defaults: {
                            userId: censor.user.id,
                            censorId: censor.id
                        }
                    }),
                    censor.save(),
                    User.update({roleId: 'R02'}, {where: {id: censor.user.id}}),
                    sendEmail({
                        email: censor.user.email,
                        subject: "<\Notification\> Auction Organization successfully verified - TrendyBids",
                        html: readFileTemplate('approveCensor.hbs', {username: censor.user.fullName})
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
                        html: readFileTemplate('rejectCensor.hbs', {username: censor.user.fullName})
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


    async getUsers(userId, {page, limit, order, fullName, roleId, status, email}, res) {
        try {
            const queries = {raw: true, nes: true}

            page = parseInt(page) || 1
            limit = parseInt(limit) || 10
            const offset = (page - 1) * limit

            // Query order: ASC, DESC. Example: order[0]=fullName&order[1]=ASC
            if (order) queries.order = [order]

            const userQuery = {
                ...(fullName ? {fullName: {[Op.iLike]: `${fullName}%`}} : {}),
                ...(email ? {email: {[Op.iLike]: `${email}%`}} : {}),
                ...(status ? {status} : {}),
                id: {[Op.not]: userId}
            }

            const {count, rows} = await User.findAndCountAll({
                where: userQuery,
                limit,
                offset,
                order: queries.order,
                attributes: {exclude: ['password', 'roleId', 'refreshToken', 'walletId']},
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
                where: {id: userId}
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
                where: {id: userId},
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

    async countUsersByRole(roleId) {
        try {
            return await User.count({
                where: {
                    roleId: {
                        [Op.eq]: roleId,
                    }
                }
            });
        } catch (error) {
            console.error('Error counting users by role:', error);
            throw error; // Re-throw the error for handling in the main function
        }
    }

    async calculateAdminReceivedTotal() {
        try {
            // Subquery using Sequelize
            const adminSubquery = await User.findAll({
                attributes: ['id'],
                where: {role_id: 'R03'}, // Replace 'R03' with actual Admin role ID
            });

            // Sum money received by Admins
            return await TransactionHistory.sum('money', {
                where: {
                    receiverId: {
                        [Op.in]: adminSubquery.map(user => user.id),
                    }
                }
            });
        } catch (error) {
            console.error('Error calculating total received:', error);
            throw error; // Re-throw the error for handling in the calling function
        }
    }

    async countTotalProductAuctions(filters = {}) {
        try {
            // Count with optional filters
            return await ProductAuction.count({
                where: filters, // Add filters here if needed (explained later)
            });
        } catch (error) {
            console.error('Error counting product auctions:', error);
            throw error; // Re-throw the error for handling in the calling function
        }
    }

    async getSummary() {
        try {
            // count user by role
            const userCount = await this.countUsersByRole('R01');
            const censorCount = await this.countUsersByRole('R02');
            const adminReceivedTotal = await this.calculateAdminReceivedTotal();
            const totalAuctions = await this.countTotalProductAuctions();
            return {
                totalUsers: userCount,
                totalCensors: censorCount,
                totalAuctions: totalAuctions,
                earning: adminReceivedTotal
            };
        } catch (error) {
            throw error;
        }
    }

    async getStartAndEndDay(year, period, month, week) {
        // Calculate start and end dates based on period
        let startDate, endDate;
        let monthNumber;
        switch (period.toLowerCase()) {
            case 'week':
                const weekNumber = parseInt(week) || 1; // Default to week 1 if not provided
                monthNumber = parseInt(month) || 1; // Default to month 1 if not provided

                // Calculate start and end dates for the selected week
                startDate = new Date(parseInt(year), monthNumber - 1, 1); // Start of selected month
                startDate.setDate(1 + (weekNumber - 1) * 7); // Set to the first day of the week
                endDate = new Date(startDate); // Copy start date to end date
                endDate.setDate(startDate.getDate() + 6); // Set end date to the last day of the week
                break;

            case 'month':
                monthNumber = parseInt(month) || 1; // Default to month 1 if not provided

                // Calculate start and end dates for the selected month
                startDate = new Date(parseInt(year), monthNumber - 1, 1); // Start of selected month
                endDate = new Date(parseInt(year), monthNumber, 0); // End of selected month
                break;

            case 'year':
                // Calculate start and end dates for the selected year
                startDate = new Date(parseInt(year), 0, 1); // Start of selected year
                endDate = new Date(parseInt(year), 11, 31); // End of selected year
                break;
        }
        return {startDate, endDate}
    }

    async generateProductAuctionChart({period, year}) {
        try {

            let {startDate, endDate} = await this.getStartAndEndDay(year, period)

            const auctions = await ProductAuction.findAll({
                where: {
                    [Op.or]: [
                        {status: 'not_started'},
                        {status: 'ongoing'},
                        {status: 'ended'}
                    ],
                    createdAt: {
                        [Op.gte]: startDate, // Greater than or equal to start date
                        [Op.lte]: endDate, // Less than or equal to end date
                    }
                },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('status')), 'count'], // Count for all statuses
                    'status', // Status for grouping
                ],
                group: ['status'], // Group by status
                order: ['status'], // Order by status
            });
            const statuses = auctions.map(auction => auction.status);
            const counts = auctions.map(auction => parseInt(auction.dataValues.count));
            const total = counts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            return {
                totalAuction: total,
                statuses,
                counts
            }

        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async getTransactionsByWeek(transactions, year, month, week) {
        const weekNumber = parseInt(week) || 1; // Default to week 1 if not provided
        const monthNumber = parseInt(month) || 1; // Default to month 1 if not provided

        const startDate = new Date(parseInt(year), monthNumber - 1, 1); // Start of selected month
        const endDate = new Date(parseInt(year), monthNumber, 0); // End of selected month

        // Find the first day of the week based on the week number
        const firstDayOfWeek = ((weekNumber - 1) * 7) - startDate.getDay() + 1;

        // Calculate start and end dates for the selected week
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(firstDayOfWeek);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);

        // Initialize an array to store transaction amounts for each day of the week
        const weeklyAmounts = Array(7).fill(0);

        // Loop through transactions and sum up amounts for each day of the week
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.createdAt);
            if (transactionDate >= weekStartDate && transactionDate <= weekEndDate) {
                const dayOfWeek = transactionDate.getDay();
                const transactionAmount = parseFloat(transaction.money);
                weeklyAmounts[dayOfWeek] += transactionAmount;
            }
        });

        return weeklyAmounts;
    }


    async getTransactionsByMonth(transactions, year, month) {
        const monthNumber = parseInt(month) || 1; // Default to month 1 if not provided
        const startDate = new Date(parseInt(year), monthNumber - 1, 1); // Start of selected month
        const endDate = new Date(parseInt(year), monthNumber, 0); // End of selected month

        const firstDayOfMonth = startDate.getDay(); // Get the day of the week of the first day of the month
        const daysInMonth = endDate.getDate(); // Get the total days in the month

        // Calculate the number of weeks in the month
        const weeksInMonth = Math.ceil((daysInMonth + firstDayOfMonth) / 7);

        // Initialize an array to store weekly amounts
        const monthlyAmounts = Array(weeksInMonth).fill(0);

        // Loop through each week of the month
        for (let weekNumber = 0; weekNumber < weeksInMonth; weekNumber++) {
            // Calculate start and end dates for the selected week
            const firstDayOfWeek = (weekNumber * 7) - firstDayOfMonth + 1;
            const weekStartDate = new Date(startDate);
            weekStartDate.setDate(firstDayOfWeek);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 8);
            console.log("Week", weekNumber)
            // Loop through transactions and sum up amounts for the current week
            transactions.forEach(transaction => {
                const transactionDate = new Date(transaction.createdAt);
                if (transactionDate > weekStartDate && transactionDate <= weekEndDate) {
                    const transactionAmount = parseFloat(transaction.money);
                    monthlyAmounts[weekNumber] += transactionAmount;
                }
            });
        }

        return monthlyAmounts;
    }


    async getTransactionsByYear(transactions, year) {
        const monthsInYear = 12;
        const monthlyAmounts = Array(monthsInYear).fill(0);

        for (let monthNumber = 1; monthNumber <= monthsInYear; monthNumber++) {
            const startDate = new Date(parseInt(year), monthNumber - 1, 1); // Start of selected month
            const endDate = new Date(parseInt(year), monthNumber, 0); // End of selected month

            // Loop through transactions and sum up amounts for the current month
            transactions.forEach(transaction => {
                const transactionDate = new Date(transaction.createdAt);
                if (
                    transactionDate >= startDate &&
                    transactionDate <= endDate
                ) {
                    const transactionAmount = parseFloat(transaction.money);
                    monthlyAmounts[monthNumber - 1] += transactionAmount;
                }
            });
        }

        return monthlyAmounts;
    }


    async getAdmins() {
        return await User.findAll({
            attributes: ['id'],
            where: {role_id: 'R03'}, // Replace 'R03' with actual Admin role ID
        });
    }


    async getProfitsByPeriod({period, year, month = 1, week = 1}) {
        try {
            // Calculate start and end dates based on period
            const {startDate, endDate} = await this.getStartAndEndDay(year, period, month, week)
            // Subquery using Sequelize
            const adminSubquery = await this.getAdmins()
            // Securely retrieve transaction data based on user ID (assuming `userId` is available)
            const transactions = await TransactionHistory.findAll({
                where: {
                    receiverId: {
                        [Op.in]: adminSubquery.map(user => user.id),
                    },
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                },
                raw: true,
                nest: true,
                attributes: ['money', 'createdAt'], // Select 'money' and 'createdAt' attributes
            });

            // Return the relevant data based on the selected period
            let data = [];
            switch (period.toLowerCase()) {
                case 'week':
                    data = await this.getTransactionsByWeek(transactions, year, month, week); // Return the array of daily profits for the selected week
                    break;
                case 'month':
                    data = await this.getTransactionsByMonth(transactions, year, month); // Return the first 4 elements (representing 4 weeks) of the array
                    break;
                case 'year':
                    data = await this.getTransactionsByYear(transactions, year); // Return the first 12 elements (representing 12 months) of the array
                    break;
            }

            return {period, startDate, endDate, data}; // Return relevant data
        } catch (err) {
            console.error(err);
            throw new Error('Error retrieving profits'); // Provide a more informative error message
        }
    }

    async getTransactionHistory({page, limit, order, receiverId, senderId, status, money, createdAt}, res) {
        try {
            const queries = {raw: true, nes: true}
            page = parseInt(page) || 1
            limit = parseInt(limit) || 10
            const offset = (page - 1) * limit

            // Query order: ASC, DESC. Example: order[0]=fullName&order[1]=ASC
            if (order) queries.order = [order]

            const adminSubquery = await this.getAdmins()

            // Subquery using Sequelize
            const {count, rows} = await TransactionHistory.findAndCountAll({
                where: {
                    receiverId: {
                        [Op.in]: adminSubquery.map(user => user.id),
                    }
                },
                limit,
                offset,
                order: queries.order,
                attributes: {exclude: ['userId', 'receiverId', "updatedAt"]},
                include: [
                    {
                        model: User,
                        as: 'receiverTransaction',
                        attributes: ['id', 'fullName', 'avatarUrl']
                    }
                ]
            })

            return res.status(200).json({
                totalPage: Math.ceil(count / limit),
                totalItem: count,
                transactionHistories: rows
            })
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

    async createRule({ruleNumber, description}, res) {
        try {
            console.log({ruleNumber, description});
            const rule = await Rule.create({
                ruleNumber,
                description
            })
            return res.status(201).json({
                message: "Create rule successfully",
                rule
            })
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

    async updateRule(id,{ ruleNumber, description}, res) {
        try {
            const rule = await Rule.findOne({
                where: {id}
            })
            if (!rule) {
                return res.status(404).json({
                    message: "Rule is not found"
                })
            }
            await rule.update({
                ruleNumber,
                description
            })
            return res.status(200).json({
                message: "Update rule successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteRule(id, res) {
        try {
            const rule = await Rule.findOne({
                where: {id}
            })
            if (!rule) {
                return res.status(404).json({
                    message: "Rule is not found"
                })
            }
            await rule.destroy();
            return res.status(200).json({
                message: "Delete rule successfully"
            });

        } catch (error) {
            throw new Error(error)
        }
    }

    async getRules({}, res) {
        try {
            const allRules = await Rule.findAll();
            const rulesByRuleNum = {};

            allRules.forEach(rule => {
                if (!rulesByRuleNum[rule.ruleNumber]) {
                    rulesByRuleNum[rule.ruleNumber] = {
                        ruleNumber: rule.ruleNumber.toString(),
                        ruleItems: []
                    };
                }
                rulesByRuleNum[rule.ruleNumber].ruleItems.push({
                    id: rule.id,
                    description: rule.description,
                    ruleNumber: rule.ruleNumber,
                    createdAt: rule.createdAt,
                    updatedAt: rule.updatedAt
                });
            });

            const rulesArray = Object.values(rulesByRuleNum);
            return res.status(200).json({ rules: rulesArray });
        } catch (error) {
            throw new Error(error);
        }
    }



}

module.exports = new AdminService()