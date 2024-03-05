const nodemailer = require('nodemailer')

const sendMail = async({ email, subject, html }) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_APP_PASSWORD
            }
        });
        return await transporter.sendMail({
            from: '"TrendyBids" <no-relply-trendybids@gmail.com>',
            to: email,
            subject: subject,
            html: html,
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = sendMail;