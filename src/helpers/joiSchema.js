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
        status: joi.string(),
    }).validate(body)
}

const validateUpdateProduct = (body) => {
    return joi.object({
        productName: joi.string(),
        description: joi.string(),
        startingPrice: joi.number(),
        categoryId: joi.string(),
        censorId: joi.string(),
        status: joi.string(),
    }).validate(body)
}

const validateAuctionSession = (body, type = "post") => {
    if (type === 'post') {
        return joi.object({
            title: joi.string().required(),
            description: joi.string().required(),
            startTime: joi.string().required(),
            endTime: joi.string().required(),
            productId: joi.string().required(),
            // censorId: joi.string().required(),
        }).validate(body)
    } else {
        return joi.object({
            title: joi.string(),
            description: joi.string(),
            startTime: joi.string(),
            endTime: joi.string(),
            status: joi.string(),
        }).validate(body)
    }
}

const validateBidPrice = (body) => {
    return joi.object({
        bidPrice: joi.number().required(),
    }).validate(body)
}

const validateEditUser = (body) => {
    return joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com"] } }),
        fullName: joi.string().min(3).max(30),
        phoneNumber: joi.string().min(10).max(11),
        address: joi.string().min(5),
        status: joi.string().valid('Pre-Active', 'Active', 'Suspended'),
        roleId: joi.string().valid('R01', 'R02', 'R03')
    }).validate(body)
}

const validateCreateConversation = (body) => {
    return joi.object({
        recipientId: joi.string().required(),
        content: joi.string().required(),
    }).validate(body)
}
const validatePayment = (index, amount) => {
    const data = { index, amount };
    return joi.object({
        index: joi.alternatives().try(
            joi.number().integer().min(1).max(6),
            joi.string().regex(/^\d+$/).min(1).max(6)
        ).required(),
        amount: joi.alternatives().try(
            joi.number().precision(2).required(),
            joi.string().regex(/^\d+(\.\d{1,2})?$/).required()
        ).required()
    }).validate(data)

};

const validateDate = (data) => {
    const currentYear = new Date().getFullYear(); // Get the current year
    const schema = joi.object({
        year: joi.number().max(currentYear).required(), // Year must be less than the current year
        period: joi.string().valid('week', 'month', 'year').insensitive().required(),
        month: joi.number().min(1).max(12).when('period', {
            is: 'month',
            then: joi.required()
        }),
        week: joi.number().min(1).max(4).when('period', {
            is: 'week',
            then: joi.required()
        })
    });

    return schema.validate(data);
};


const validateRule = (data) => {
    const schema = joi.object({
        description: joi.string().custom((value, helpers) => {
            if (/<\/?[a-z][\s\S]*>/i.test(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required(),
        ruleNumber: joi.number().required(),
    });

    return schema.validate(data);
};

module.exports = {
    validateRegister,
    validateVerify,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateAuctionProduct,
    validateUpdateProduct,
    validateRegisterCensor,
    validateAuctionSession,
    validateBidPrice,
    validateEditUser,
    validateCreateConversation,
    validateDate,
    validatePayment,
    validateRule
}
