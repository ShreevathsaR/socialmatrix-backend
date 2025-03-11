const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const prisma = require('./prisma-client');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

module.exports = function (){
  passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return done(null, false, { message: 'User not found' });

      if(!user.password) return done(null, false, { message: 'Sign in with Google' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
)};

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
