const joi = require("joi");

const validateRegister = (body) => {
    return joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        password: joi.string().min(6).required(),
        fullName: joi.string().min(3).max(30).required(),
    }).validate(body)
}
const validateRegisterCensor = (body) => {
    return joi.object({
        name: joi.string().min(5).max(100).required(),
        phoneNumber: joi.string().min(10).max(20),
        companyTaxCode: joi.string().min(8).max(30),
        position: joi.string().min(1).max(50),
        taxCodeIssuanceDate: joi.date(),
        founding: joi.date(),
        address: joi.string().min(10).max(200),
        placeTaxCode: joi.string().min(10).max(200)
    }).validate(body);
};

const validateVerify = (body) => {
    return joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        otp: joi.string().min(6).max(6).required(),
    }).validate(body)
}

const validateLogin = (body) => {
    return joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
        password: joi.string().min(6).required(),
    }).validate(body)
}

const validateForgotPassword = (body) => {
    return joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
    }).validate(body)
}

const validateResetPassword = (body) => {
    return joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
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

module.exports = {
    validateRegister,
    validateVerify,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateAuctionProduct,
    validateRegisterCensor
}
