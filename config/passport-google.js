const {Strategy} = require('passport-google-oauth20');
const prisma = require('./prisma-client');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

module.exports = function () {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {

            let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          console.log({profile, user, done});

          if (!user && profile.emails && profile.emails.length) {
            user = await prisma.user.findUnique({
              where: { email: profile.emails[0].value },
            });
          }

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
              },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );


  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  });
};
