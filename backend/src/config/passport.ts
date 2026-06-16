import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import * as userModel from "../model/userModel.ts";
import { comparePassword } from "../utils/password.ts";
import { formatUser } from "../views/userView.ts";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password", session: false },
        async (email, password, done) => {
            try {
                const user = await userModel.findByEmail(email);
                if (!user) {
                    return done(null, false, { message: "USER_NOT_FOUND" });
                }
                if (!user.passwordHash) {
                    return done(null, false, { message: "INVALID_PASSWORD" });
                }
                const valid = await comparePassword(password, user.passwordHash);
                if (!valid) {
                    return done(null, false, { message: "INVALID_PASSWORD" });
                }
                return done(null, formatUser(user));
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
        },
        async (payload: { sub: number; email: string }, done) => {
            try {
                const user = await userModel.findById(payload.sub);
                if (!user) {
                    return done(null, false);
                }
                return done(null, formatUser(user));
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;
