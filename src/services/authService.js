const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const NodeCache = require('node-cache');
const User = require('../models/user');
const sendEmail = require('../util/sendMail')
const readFileTemplate = require('../helpers/readFileTemplate')
const jwt = require("jsonwebtoken");


const cache = new NodeCache();
class AuthService {
    async register({email, password, fullName}, res) {
        try {
            const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
            const [user, created] = await User.findOrCreate({
                where: {email},
                defaults: {
                    email,
                    fullName,
                    password: hashPassword,
                    roleId: "R01"
                }
            })

            // Generate OTP and send email verify
            const otp = crypto.randomInt(100000, 999999).toString();
            cache.set(`${user.id}-verify_otp`, otp, 300);
            await sendEmail({
                email,
                subject: "Verify your email address - TrendyBids",
                html: readFileTemplate('verifyEmail.hbs',{otp: otp})
            })

            const status = created ? 201 : 409;
            return res.status(status).json({
                message: created ? "Register is successfully" : "Email has already registered",
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    async verifyOTP({email, otp}, res) {
        try {
            const user = await User.findOne({
                where: { email },
            });

            // Check user in database
            if (!user) {
                return res.status(404).json({
                    message: "The email sent does not match the registered email"
                })
            }

            // Check and compare OTP in cache
            const otpCache = cache.get(`${user.id}-verify_otp`)
            if (!otpCache || otpCache !== otp) {
                return res.status(400).json({
                    message: otpCache ? 'Invalid OTP' : 'OTP has expired'
                });
            }

            user.status = 'Active'
            await user.save()
            cache.del(`${user.id}-verify_otp`);

            return res.status(200).json({
                message: 'Success verified',
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async login({email, password}, res) {
        try {
            const user = await User.findOne({
                where: {email}
            })
            if (!user || user.status === 'Pre-Active') {
                return res.status(401).json({
                    message: !user ? "Email hasn't been registered" : "User is not yet verified"
                });
            }
            const isChecked = (user && user.password !== null)  && bcrypt.compareSync(password, user.password);
            if (!isChecked) {
                return res.status(401).json({
                    message: "Incorrect password"
                })
            }
            const token = this.generateJwtToken(user.id, email)
            if(token.refreshToken) {
                user.refreshToken = token.refreshToken;
                await user.save()
            }

            return res.status(200).json({
                message: "Login is successfully",
                ...token
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    generateJwtToken(userId, email){
        const jwtAt = jwt.sign(
            { id: userId, email },
            process.env.JWT_AT_SECRET,
            { expiresIn: "2d" }
        )
        const jwtRt = jwt.sign(
            { id: userId, email },
            process.env.JWT_RT_SECRET,
            { expiresIn: "30d" }
        )
        return {
            accessToken: jwtAt,
            refreshToken: jwtRt,
        }
    }

    async forgotPassword({email}, res){
        try {
            const user = await User.findOne({
                where: {email}
            })
            if (!user) {
                return res.status(401).json({
                    message: "Email hasn't been registered"
                });
            }

            // Generate OTP and send email reset password
            const otp = crypto.randomInt(100000, 999999).toString();
            cache.set(`${user.id}-reset-pass_otp`, otp, 300);
            await sendEmail({
                email,
                subject: "Request a new password reset - TrendyBids",
                html: readFileTemplate('forgotPassword.hbs',{otp: otp, fullName: user.fullName})
            })

            return res.status(200).json({
                message: "Send to your email successfully",
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    async resetPassword({email, password, otp}, res){
        try {
            const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
            const user = await User.findOne({
                where: {email}
            })
            if (!user) {
                return res.status(401).json({
                    message: 'The email sent does not match the registered email'
                });
            }

            const otpCache = cache.get(`${user.id}-reset-pass_otp`);
            if (!otpCache || otpCache !== otp) {
                return res.status(400).json({
                    message: otpCache ? 'Invalid OTP' : 'OTP has expired'
                });
            }

            user.password = hashPassword
            await user.save()
            cache.del(`${user.id}-reset-pass_otp`);

            return res.status(200).json({
                message: 'Reset password successfully'
            });
        } catch (error) {
            throw new Error(error)
        }
    }
}


module.exports = new AuthService()