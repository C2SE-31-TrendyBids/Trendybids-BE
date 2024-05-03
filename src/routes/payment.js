const express = require("express");
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/verifyToken')

router.use(verifyToken)
router.post('/paypal/create-payment-user', paymentController.createPaymentForUser);
router.post('/tranfer-wallet', paymentController.createPaymentTranferFromWallet);
router.post('/paypal/success', paymentController.processPaymentAgreement);
router.get('/create-qrcode', paymentController.createPaymentQrCode);
router.get('/get-wallet', paymentController.getWalletOfUser);
router.post('/qr-success', paymentController.paymentQrSuccessfully);




module.exports = router