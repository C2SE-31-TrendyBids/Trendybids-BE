const jwt = require("jsonwebtoken");
const User = require("../models/user")

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token)
        return res.status(401).json({
            err: 1,
            message: "Require authorization",
        });
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_AT_SECRET, async (error, decode) => {
        if (error) {
            const isChecked = error instanceof jwt.TokenExpiredError
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

        const user = await User.findOne({
            where: { email: decode.email },
            attributes: {
                exclude: ["password", "refreshToken", "createdAt", "updatedAt"],
            },
        });
        req.user = user;

        next();
    });
};

module.exports = verifyToken;