const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const MemberOrganization = require("../models/memberOrganization");

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token)
        return res.status(401).json({
            err: 1,
            message: "Require authorization",
        });
    const accessToken = token.split(" ")[1];

    jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET,
        async (error, decode) => {
            if (error) {
                const isChecked = error instanceof jwt.TokenExpiredError;
                if (!isChecked) {
                    return res.status(401).json({
                        err: 1,
                        message: "Access Token invalid",
                    });
                }
                // Check the expiration date of the access token
                if (isChecked) {
                    return res.status(401).json({
                        err: 2,
                        message: "Access Token has expired",
                    });
                }
            }
            req.user = await User.findOne({
                where: { id: decode.id },
                attributes: {
                    exclude: ["password", "refreshToken", "roleId"],
                },
                include: [
                    { model: Role, attributes: ["id", "name"], as: "role" },
                ],
            });
            req.memberOrganization = await MemberOrganization.findOne({
                where: { userId: decode.id },
            });

            next();
        }
    );
};

const isCensor = (req, res, next) => {
    const role = req.user?.role;
    if (role.id !== "R02") {
        return res.status(401).json({
            err: 1,
            message: "Require role censor",
        });
    }
    next();
};

const isAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role.id !== "R03") {
        return res.status(401).json({
            err: 1,
            message: "Require role admin",
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isCensor,
    isAdmin,
};
