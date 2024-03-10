const joi = require("joi");

const validateRegister = (body) => {
    return joi.object({
        email: joi.string().email({minDomainSegments: 2, tlds: {allow: ["com"]}}).required(),
        password: joi.string().min(6).required(),
        fullName: joi.string().min(3).max(30).required(),
    }).validate(body)
}

const validateVerify = (body) => {
    return joi.object({
        email: joi.string().email({minDomainSegments: 2, tlds: {allow: ["com"]}}).required(),
        otp: joi.string().min(6).max(6).required(),
    }).validate(body)
}

const validateLogin = (body) => {
    return joi.object({
        email: joi.string().email({minDomainSegments: 2, tlds: {allow: ["com"]}}).required(),
        password: joi.string().min(6).required(),
    }).validate(body)
}

const validateForgotPassword = (body) => {
    return joi.object({
        email: joi.string().email({minDomainSegments: 2, tlds: {allow: ["com"]}}).required(),
    }).validate(body)
}

const validateResetPassword = (body) => {
    return joi.object({
        email: joi.string().email({minDomainSegments: 2, tlds: {allow: ["com"]}}).required(),
        otp: joi.string().min(6).max(6).required(),
        password: joi.string().min(6).required(),
    }).validate(body)
}

const validateAuctionProduct = (body) => {
    return joi.object({
        productName: joi.string().required(),
        description: joi.string().required(),
        startingPrice: joi.number().required(),
        categoryId: joi.string().required(),
        censorId: joi.string(),
    }).validate(body)
}

const validateUpdateProduct = (body) => {
    return joi.object({
        productName: joi.string(),
        description: joi.string(),
        startingPrice: joi.number(),
        categoryId: joi.string(),
        censorId: joi.string(),
    }).validate(body)
}

module.exports = {
    validateRegister,
    validateVerify,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateAuctionProduct,
    validateUpdateProduct
}
