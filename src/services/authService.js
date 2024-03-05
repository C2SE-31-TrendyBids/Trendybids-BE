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
            console.log(error)
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
            console.log(error)
        }
    }

    async login({email, password}, res) {
        const user = await User.findOne({
            where: {email}
        })
        const isChecked = user && bcrypt.compareSync(password, user.password);

        const {accessToken, refreshToken} = isChecked && this.generateJwtToken(user.id, email)

        if(refreshToken) {
            user.refreshToken = refreshToken;
            await user.save()
        }

        const status = accessToken ? 200 : user ? 401 : 404;
        return res.status(status).json({
            message: accessToken ? "Login is successfully" : user ? "Password was incorrect" : "Email hasn't been registered",
            accessToken: accessToken ? accessToken : null,
            refreshToken: accessToken ? accessToken : null
        });
    }

    generateJwtToken(userId, email){
        const jwtAt = jwt.sign(
            { sub: userId, email },
            process.env.JWT_AT_SECRET,
            { expiresIn: "2d" }
        )
        const jwtRt = jwt.sign(
            { sub: userId, email },
            process.env.JWT_RT_SECRET,
            { expiresIn: "30d" }
        )
        return {
            accessToken: jwtAt,
            refreshToken: jwtRt,
        }
    }
}

module.exports = new AuthService()