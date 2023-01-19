import express, {NextFunction, Request as ExRequest, Response as ExResponse} from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session, {MemoryStore} from "express-session";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import Swagger from "./autogen/swagger.json";
import {RegisterRoutes} from "./autogen/routes";
import {Dictionary} from "./data/dictionary";
import {Strategy} from "passport-linkedin-oauth2";

require("dotenv").config();

interface Profile {
    id: string
    name: {
        givenName: string
        familyName: string
    }
    displayName: string
    emails: [{ value: string }]
}

(async () => {
    try {
        console.log("Starting the http server");

        Dictionary.loadDictionary();

        // initial passport setup
        passport.use(new Strategy({
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: process.env.LINKEDIN_CALLBACK_URL,
            scope: ['r_emailaddress', 'r_liteprofile'],
        }, (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile)); // can add DB lookup here if requires additional data ro pass to serialization
        }));
        passport.serializeUser((user: Profile, done: any) => {
            console.log('Serializing', user.id);
            done(null, user.id); // second argument is passed as req.session.passport.user, also used in session store as key
        });
        passport.deserializeUser((id: string, done: any) => {
            console.log('Deserializing', id);
            done(null, {id, test: "YO"}); // second argument is passed as req.user
        });

        const app = express();

        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        app.use(cookieParser());
        app.use(session({
            saveUninitialized: false,
            cookie: {maxAge: 86400000},
            store: new MemoryStore(),
            resave: false,
            secret: process.env.SESSION_STORE_SECRET
        }))

        app.use(passport.initialize());
        app.use(passport.session());

        RegisterRoutes(app);

        app.use('/', express.static('public'));
        app.use('/static', express.static('static'));

        app.get('/auth/linkedin', passport.authenticate('linkedin'));
        app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

        // swagger
        app.use(["/swagger"], swaggerUi.serve, swaggerUi.setup(Swagger));

        app.use((err: unknown, _: ExRequest, res: ExResponse, next: NextFunction): ExResponse | void => {
            console.error("ERROR:", JSON.stringify(err));
            if (err instanceof Error) {
                return res.status(500).json({message: "Internal Server Error"});
            }
            next();
        });

        app.use((_req, res: ExResponse) => {
            res.status(404).send({message: "Not Found"});
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}!`);
        });
    } catch (error) {
        console.error(error);
    }
})();
