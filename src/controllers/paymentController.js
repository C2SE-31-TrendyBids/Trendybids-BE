const PaymentService = require('../services/paymentService')
const { validatePayment, validateIsReturnMoney } = require('../helpers/joiSchema')
class PaymentController {
    async createPaymentForUser(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { amount, index, receiverId, auctionId } = req.body
            const { error } = validatePayment(index, amount);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            const payment = await PaymentService.createPayment(senderId, amount, index, receiverId, auctionId);
            res.json(payment);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }
    }

    async processPaymentAgreement(req, res) {
        try {
            const { paymentId, token, payerId } = req.body;
            return await PaymentService.paypalPaymentSuccess(paymentId, token, payerId, res);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }

    }
    async createPaymentQrCode(req, res) {
        try {
            const amount = req.query.amount;
            return await PaymentService.createQr(amount, res);

        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }
    }
    async getWalletOfUser(req, res) {
        try {
            const userId = req.user.dataValues.id
            return await PaymentService.getWallet(userId, res);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async getWalletById(req, res) {
        try {
            const id = req.query.id
            return await PaymentService.getWalletById(id, res);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async createPaymentTranferFromWallet(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { amount, index, receiverId, auctionId } = req.body
            const { error } = validatePayment(index, amount);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            return await PaymentService.transferMoney(senderId, receiverId, amount, index, auctionId, res);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }
    }
    async paymentQrSuccessfully(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { amount, index, receiverId, auctionId } = req.body
            const { error } = validatePayment(index, amount);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            };
            return await PaymentService.paymentQrSuccess(senderId, amount, index, receiverId, auctionId, res);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }
    }
    async otpTranferMoney(req, res) {
        try {
            const userId = req.user.dataValues.id
            return await PaymentService.otpTranferMoney(userId, res);

        } catch (error) {
            res.status(500).json({ error: 'Error creating otp' });

        }
    }
    async verifyOtpPayment(req, res) {
        try {
            const userId = req.user.dataValues.id
            const otp = req.body.otp
            console.log(otp);
            return await PaymentService.verifyOtpPayment(userId, otp, res);

        } catch (error) {
            res.status(500).json({ error: 'Error creating otp' });

        }
    }
    isReturnMoney(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { receiverId, auctionId, index } = req.body;
            // const validationResult = validateInput({ receiverId, auctionId, index });
            // if (validationResult.error) {
            //     return res.status(400).json({ error: validationResult.error.details[0].message });
            // }
            return PaymentService.isReturnMoney(senderId, receiverId, auctionId, index, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }
}
module.exports = new PaymentController