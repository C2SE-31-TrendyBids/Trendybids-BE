const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user')
const authServices = require("../services/authService");

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const [user, created] = await User.findOrCreate({
                where: {email: profile.emails[0]?.value},
                defaults: {
                    email: profile.emails[0]?.value,
                    fullName: profile?.displayName,
                    avatarUrl: profile?.photos[0]?.value,
                    status: 'Active'
                }
            })

            const {accessToken, refreshToken} = authServices.generateJwtToken(user?.id, user?.email)
            user.refreshToken = refreshToken;
            await user.save()

            return done(null, {...user, accessToken, refreshToken});
        } catch (error) {
            console.log(error)
        }
    })
);