const PaymentService = require('../services/paymentService')
const { validatePayment } = require('../helpers/joiSchema')
class PaymentController {
    async createPaymentForUser(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { amount, index, receiverId } = req.body
            const { error } = validatePayment(index, amount);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            const payment = await PaymentService.createPayment(senderId, amount, index, receiverId);
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
            res.status(500).json({ error: 'Error creating payment' });
        }
    }
    async createPaymentTranferFromWallet(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { amount, index, receiverId } = req.body
            const { error } = validatePayment(index, amount);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            return await PaymentService.transferMoney(senderId, receiverId, amount, index, res);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }
    }
    async paymentQrSuccessfully(req, res) {
        try {
            const senderId = req.user.dataValues.id
            const { amount, index, receiverId } = req.body

            const { error } = validatePayment(index, amount);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            return await PaymentService.paymentQrSuccess(senderId, amount, index, receiverId, res);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment' });
        }
    }
}
module.exports = new PaymentController