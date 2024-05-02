const paypal = require('../config/paypal');
const Wallet = require('../models/wallet');
const TransactionHistory = require('../models/transactionHistory')
const Censor = require('../models/censor')
const qrcode = require('qrcode');

class PaymentService {
    async createPayment(senderId, amount, index, receiverId) {
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
                "custom": JSON.stringify({ senderId, index, receiverId })
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

    async createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId) {
        try {
            await TransactionHistory.create({
                money: parseFloat(amount),
                transactionType: transactionType,
                paymentMethods: paymentMethods,
                userId: senderId,
                receiverId: receiverId
            });
            console.log("Transaction history created successfully.");
        } catch (error) {
            console.error("Error creating transaction history:", error);
            throw error;
        }
    }

    async processPayment(userId, amount) {
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
            5: 'Admin_payment',
            6: 'Mortgage_assets'
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
            let index = custom.index;
            let paymentMethods = 'PayPal'
            let transactionType = await this.getTransactionType(index)

            let receiverId
            if (parseInt(index) === 5 || parseInt(index) === 6) {
                receiverId = process.env.ADMIN_ID
            }
            else if (parseInt(index) === 1) {
                receiverId = null
            } else {
                let receiverData = custom.receiverId || null
                if (receiverData) {
                    let receiver = await Censor.findOne({ where: { id: receiverData } });
                    if (!receiver) receiverId = receiverData
                    else receiverId = receiver.userId
                }
            }
            await this.processPayment(receiverId, amount);
            await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId);

            res.status(200).json({ message: "Paypal Payment Successfully" });
        } catch (error) {
            console.error("Error in paypalPaymentSuccess:", error);
            throw error;
        }
    }
    async transferMoney(senderId, receiverId, amount, index, res) {
        try {
            let paymentMethods = 'E_Wallet'
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
            //Deduct money from user's wallet
            senderWallet.money = (parseFloat(senderWallet.money) - parseFloat(amount)).toFixed(2);
            await senderWallet.save();
            //Add money to the recipient's wallet
            if (parseInt(index) === 5 || parseInt(index) === 6) receiverId = process.env.ADMIN_ID
            else {
                let receiver = await Censor.findOne({ where: { id: receiverId } });
                if (!receiver) receiverId = receiverId
                else receiverId = receiver.userId
            }
            this.processPayment(receiverId, amount)
            //Record transaction history in the table
            let transactionType = await this.getTransactionType(index)
            await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId);
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
    async paymentQrSuccess(senderId, amount, index, receiverId, res) {
        try {
            if (parseInt(index) === 5 || parseInt(index) === 6) {
                receiverId = process.env.ADMIN_ID
            }
            else if (parseInt(index) === 1) {
                receiverId = null
            } else {
                let receiver = await Censor.findOne({ where: { id: receiverId } });
                if (!receiver) receiverId = receiverId
                else receiverId = receiver.userId
            }
            let transactionType = await this.getTransactionType(index)
            let paymentMethods = 'Bank'
            await this.processPayment(receiverId, amount);
            await this.createTransactionHistory(amount, transactionType, paymentMethods, senderId, receiverId);
            res.status(200).json({ message: "Bank Payment Successfully" });
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
            });
            if (!wallet) {
                wallet = new Wallet({ userId: userId });
            }
            return res.status(200).json({ wallet });
        } catch (error) {
            console.error("Error while fetching or creating wallet:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }


}
module.exports = new PaymentService();
