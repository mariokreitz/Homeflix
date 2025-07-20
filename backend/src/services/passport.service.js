import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { prisma } from './prisma.service.js';

// LocalStrategy for login (email & password)
passport.use('local', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        session: true,
    },
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return done(null, false, { message: 'Incorrect email.' });
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return done(null, false, { message: 'Incorrect password.' });
            if (!user.isActive) return done(null, false, { message: 'User is inactive.' });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    },
));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return done(null, false);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

export default passport;
