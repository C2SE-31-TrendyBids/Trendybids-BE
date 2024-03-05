const joi = require("joi");

const validateRegister =
    joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        password: joi.string().min(6).required(),
        fullName: joi.string().min(3).max(30).required(),
    })

const validateVerify =
    joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        otp: joi.string().min(6).max(6).required(),
    })

const validateLogin =
    joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        password: joi.string().min(6).required(),
    })

const validateForgotPassword =
    joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
    })

const validateResetPassword =
    joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        otp: joi.string().min(6).max(6).required(),
        password: joi.string().min(6).required(),
    })

module.exports = {
    validateRegister,
    validateVerify,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
}
