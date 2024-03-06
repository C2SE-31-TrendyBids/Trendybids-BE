const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user')

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            if (profile?.id) {
                const [user, created] = await User.findOrCreate({
                    where: { email: profile.emails[0]?.value },
                    defaults: {
                        email: profile.emails[0]?.value,
                        fullName: profile?.displayName,
                        avatarUrl: profile?.photos[0]?.value,
                        googleId: profile.id,
                        status: 'Active'
                    }
                })
                if (!created) {
                    user.googleId = profile.id
                    await user.save()
                }
            }
        } catch (error) {
            console.log(error)
        }
        return done(null, profile);
    })
);