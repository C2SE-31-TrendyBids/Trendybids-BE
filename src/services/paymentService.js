const paypal = require('../config/paypal');
const Wallet = require('../models/wallet');
const TransactionHistory = require('../models/transactionHistory')
const Censor = require('../models/censor')
const User = require('../models/user')
const qrcode = require('qrcode');
const sendEmail = require("../util/sendMail");
const readFileTemplate = require("../helpers/readFileTemplate");
const crypto = require("crypto");
const NodeCache = require("node-cache");
const ProductAuction = require('../models/productAuction');
const Product = require('../models/product');
const cache = new NodeCache();

class PaymentService {
    async createPayment(senderId, amount, index, receiverId, auctionId) {
        const paymentData = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/payment-success",
                "cancel_url": "http://localhost:3000/payment-cancel"
            },
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": amount
                },
                "description": "Payment for service",
                "custom": JSON.stringify({ senderId, index, receiverId, auctionId })
            }]
        };
        try {
            const createdPayment = await new Promise((resolve, reject) => {
                paypal.payment.create(paymentData, async (error, payment) => {
                    if (error) {
                        reject(error);
                    } else {
                        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                        resolve(approvalUrl);
                    }
                });
            });
            return createdPayment;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    async createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId, auctionId) {
        try {
            await TransactionHistory.create({
                money: parseFloat(amount),
                transactionType: transactionType,
                paymentMethods: paymentMethods,
                userId: senderId,
                receiverId: receiverId,
                auctionId: auctionId
            });
            console.log("Transaction history created successfully.");
        } catch (error) {
            console.error("Error creating transaction history:", error);
            throw error;
        }
    }

    async processPayment(userId, amount) {
        console.log(userId);
        try {
            let wallet = await Wallet.findOne({ where: { userId: userId } });
            if (!wallet) {
                wallet = new Wallet({ userId: userId, money: parseFloat(amount) });
            } else {
                wallet.money = (parseFloat(wallet.money) + parseFloat(amount)).toFixed(2);
            }
            await wallet.save();
            return wallet;
        } catch (error) {
            console.error("Error processing payment:", error);
            throw error;
        }
    }
    async getTransactionType(index) {
        const transactionTypes = {
            1: 'Top_up',
            2: 'Posting_fee',
            3: 'Auction_fee',
            4: 'Product_fee',
            5: 'Tranfer_money',
            6: 'Mortgage_assets',
            7: 'Admin_return'
        };

        return transactionTypes[index] || 'Mortgage_assets';
    }

    async paypalPaymentSuccess(paymentId, token, payerId, res) {
        try {
            const payment = await new Promise((resolve, reject) => {
                paypal.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
                    if (error) {
                        console.error(error);
                        reject('Failed to process payment agreement.');
                    } else {
                        resolve(payment);
                    }
                });
            });
            let amount = payment.transactions[0].amount.total;
            let custom = JSON.parse(payment.transactions[0].custom);
            let senderId = custom.senderId;
            let auctionId = custom.auctionId
            let index = custom.index;
            let paymentMethods = 'PayPal'
            let transactionType = await this.getTransactionType(index)
            let receiverId
            console.log(auctionId);
            if (parseInt(index) === 4) {
                let receiverData = custom.receiverId || null
                if (receiverData) {
                    let receiver = await Censor.findOne({ where: { id: receiverData } });
                    if (!receiver) {
                        receiverId = receiverId;
                    } else {
                        receiverId = receiver.userId;
                    }
                }
                let productAuction = await ProductAuction.findOne({
                    where: { id: auctionId },
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            required: true,
                            attributes: { exclude: ['censorId', 'updatedAt', "categoryId"] },
                        }
                    ]
                });
                let sellerId = productAuction.product.ownerProductId
                await this.paymentForProduct(amount, senderId, receiverId, sellerId, auctionId, transactionType, paymentMethods);
                return res.status(200).json({ message: "Paypal Payment Successfully" });
            } else {

                if (parseInt(index) === 6) {
                    receiverId = process.env.ADMIN_ID
                }
                else if (parseInt(index) === 1) {
                    receiverId = senderId
                } else {
                    let receiverData = custom.receiverId || null
                    if (receiverData) {
                        let receiver = await Censor.findOne({ where: { id: receiverData } });
                        if (!receiver) receiverId = receiverData
                        else receiverId = receiver.userId
                    }
                }
                await this.processPayment(receiverId, amount);
                await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId, auctionId);
                res.status(200).json({ message: "Paypal Payment Successfully" });
            }
        } catch (error) {
            console.error("Error in paypalPaymentSuccess:", error);
            throw error;
        }
    }
    async otpTranferMoney(userId, res) {
        try {
            console.log(userId);
            const user = await User.findOne({
                where: { id: userId },
            });
            if (!user) {
                return res.status(200).json({
                    message: "User not found",
                });
            }
            let email = user.email
            console.log(email);
            // Generate OTP and send email reset password
            const otp = crypto.randomInt(100000, 999999).toString();
            console.log(otp);
            cache.set(`${userId}-tranfer-money_otp`, otp, 300);
            await sendEmail({
                email,
                subject: "OTP confirms payment - TrendyBids",
                html: readFileTemplate("tranferMoney.hbs", {
                    otp: otp,
                    fullName: user.fullName,
                }),
            });

            return res.status(200).json({
                message: "Send to your email successfully",
            });
        } catch (error) {
            throw new Error(error);
        }
    }
    async verifyOtpPayment(userId, otp, res) {
        const otpCache = cache.get(`${userId}-tranfer-money_otp`);
        if (!otpCache || otpCache !== otp) {
            return res.status(400).json({
                message: otpCache ? "Invalid OTP" : "OTP has expired",
            });
        }
        cache.del(`${userId}-verify_otp`);
        return res.status(200).json({ message: "OTP Successfully" })
    }
    async paymentForProduct(amount, senderId, receiverId, sellerId, auctionId, transactionType, paymentMethods) {
        let payments = [
            { userId: receiverId, amount: parseFloat(amount * 0.07) }, // 7% for receiver (censor)
            { userId: sellerId, amount: parseFloat(amount * 0.9) }, // 90% for seller
            { userId: process.env.ADMIN_ID, amount: parseFloat(amount * 0.03) } // 3% for admin
        ];
        payments.forEach(async (payment) => {
            await this.processPayment(payment.userId, payment.amount);
            await this.createTransactionHistory(payment.amount, transactionType, paymentMethods, senderId, payment.userId, auctionId);
        });
    }
    async transferMoney(senderId, receiverId, amount, index, auctionId, res) {
        try {
            let paymentMethods = 'E_Wallet';
            let transactionType = await this.getTransactionType(index);

            if (parseInt(index) === 1) {
                return res.status(400).json({ message: "No support" });
            }
            let senderWallet = await Wallet.findOne({ where: { userId: senderId } });
            if (!senderWallet) {
                throw new Error("Sender wallet not found.");
            }
            if (parseFloat(senderWallet.money) < parseFloat(amount)) {
                throw new Error("Insufficient funds in sender's wallet.");
            }
            senderWallet.money = (parseFloat(senderWallet.money) - parseFloat(amount)).toFixed(2);
            await senderWallet.save();

            if (parseInt(index) === 6) {
                receiverId = process.env.ADMIN_ID;
                this.processPayment(receiverId, amount);
                await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId, auctionId);
            } else {
                let receiver = await Censor.findOne({ where: { id: receiverId } });
                if (!receiver) {
                    receiverId = receiverId;
                } else {
                    receiverId = receiver.userId;
                }
                if (parseInt(index) === 4) {
                    let productAuction = await ProductAuction.findOne({
                        where: { id: auctionId },
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                required: true,
                                attributes: { exclude: ['censorId', 'updatedAt', "categoryId"] },
                            }
                        ]
                    });
                    let sellerId = productAuction.product.ownerProductId
                    await this.paymentForProduct(amount, senderId, receiverId, sellerId, auctionId, transactionType, paymentMethods);
                } else {
                    this.processPayment(receiverId, amount);
                    await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId, auctionId);
                }
            }
            res.status(200).json({ message: "Make a successful transaction" });
        } catch (error) {
            console.error("Error transferring money:", error);
            throw error;
        }
    }
    async createQr(amount, res) {
        const accountNo = process.env.ACCOUT_BANK;
        const text = `${accountNo} - ${amount} VND`
        try {
            const qrdata = await qrcode.toDataURL(text);
            return res.status(200).json({
                data: qrdata
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            res.status(500).send('Error generating QR code');
        }
    }
    async paymentQrSuccess(senderId, amount, index, receiverId, auctionId, res) {
        console.log(auctionId);
        console.log(senderId);
        try {
            let transactionType = await this.getTransactionType(index)
            let paymentMethods = 'Bank'
            if (parseInt(index) === 4) {
                let receiver = await Censor.findOne({ where: { id: receiverId } });
                if (!receiver) {
                    receiverId = receiverId;
                } else {
                    receiverId = receiver.userId;
                }
                let productAuction = await ProductAuction.findOne({
                    where: { id: auctionId },
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            required: true,
                            attributes: { exclude: ['censorId', 'updatedAt', "categoryId"] },
                        }
                    ]
                });
                let sellerId = productAuction.product.ownerProductId
                await this.paymentForProduct(amount, senderId, receiverId, sellerId, auctionId, transactionType, paymentMethods);
                return res.status(200).json({ message: "Bank Payment Successfully" });
            } else {

                if (parseInt(index) === 6) {
                    receiverId = process.env.ADMIN_ID
                }
                else if (parseInt(index) === 1) {
                    receiverId = senderId
                } else {
                    let receiver = await Censor.findOne({ where: { id: receiverId } });
                    if (!receiver) receiverId = receiverId
                    else receiverId = receiver.userId
                }

                await this.processPayment(receiverId, amount);
                await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId, auctionId);
                res.status(200).json({ message: "Bank Payment Successfully" });
            }
        } catch (error) {
            console.error("Error transferring money:", error);
            throw error;
        }
    }
    async getWallet(userId, res) {
        try {
            let wallet = await Wallet.findOne({
                where: { userId: userId },
                attributes: { exclude: ['userId'] },
                include: [
                    {
                        model: User,
                        as: 'user',
                        required: true,
                        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken'] }
                    }
                ]
            });
            if (!wallet) {
                wallet = new Wallet({ userId: userId, money: 0 });
                await wallet.save();
                return this.getWallet(userId, res);
            }
            return res.status(200).json({ wallet });
        } catch (error) {
            console.error("Error while fetching or creating wallet:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    async getWalletById(id, res) {
        try {
            let wallet = await Wallet.findOne({
                where: { id: id },
                attributes: { exclude: ['userId', 'money'] },
                include: [
                    {
                        model: User,
                        as: 'user',
                        required: true,
                        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken', 'email', 'phoneNumber', 'avatarUrl', 'address', 'status'] }
                    }
                ]
            });
            if (!wallet) {
                return res.status(400).json({
                    message: "Not found Wallet",
                });
            }
            return res.status(200).json({ wallet });
        } catch (error) {
            throw new Error(error)
        }
    }
    async isReturnMoney(senderId, receiverId, auctionId, index, res) {
        try {
            let transactionType = await this.getTransactionType(index)
            const transaction = await TransactionHistory.findOne({
                where: { userId: senderId, receiverId: receiverId, auctionId: auctionId, transactionType: transactionType },
            });

            if (!transaction) {
                return res.status(200).json({ success: false, message: "Transaction not found" });
            }

            return res.status(200).json({ success: true, message: "Transaction found" });
        } catch (error) {
            console.error("Error in isReturnMoney:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}
module.exports = new PaymentService();
