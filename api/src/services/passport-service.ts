import passport, {Profile} from "passport";
import {Strategy} from "passport-linkedin-oauth2";
import {UserService} from "../persistence/user-model";

require("dotenv").config();

const userService = new UserService();

passport.use(new Strategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['r_emailaddress', 'r_liteprofile'],
}, (accessToken, refreshToken, profile, done) => {
    try {
        userService.findOrCreate(profile)
            .then(user => process.nextTick(() => done(null, user)))
            .catch(error => {
                console.error(error);
                process.nextTick(() => done(error, null));
            })
    } catch (error) {
        console.error(error);
        process.nextTick(() => done(error, null));
    }
}));
passport.serializeUser((user: Profile, done: any) => {
    done(null, user.id); // second argument is passed as req.session.passport.user, also used in session store as key
});
passport.deserializeUser(async (id: string, done: any) => {
    const user = await userService.findById(id);
    done(null, user); // second argument is passed as req.user
});

export default passport;