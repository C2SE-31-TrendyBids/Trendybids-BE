class UserServices {
    getCurrentUser(user, res) {
        return res.status(200).json({
            ...user
        })
    }
}

module.exports = new UserServices