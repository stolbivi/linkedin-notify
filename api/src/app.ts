import express, {NextFunction, Request as ExRequest, Response as ExResponse} from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import passport from "./services/passport-service";
import dSession from "./services/session-service";
import swaggerUi from "swagger-ui-express";
import Swagger from "./autogen/swagger.json";
import {RegisterRoutes} from "./autogen/routes";
import {Dictionary} from "./data/dictionary";
import cors from "cors";
import {getSubscriptions} from "./services/stripe-service";
import * as Sentry from "@sentry/node";
import * as process from "process";

require("dotenv").config();

(async () => {
    try {
        console.log("Starting the http server");

        Dictionary.loadDictionary();

        const app = express();

        Sentry.init({
            dsn: process.env.SENTRY_URL,
            integrations: [
                new Sentry.Integrations.Http({tracing: true}),
                new Sentry.Integrations.Express({app}),
                ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
            ],
            tracesSampleRate: 1.0,
        });

        app.use(cors({
            credentials: true,
            origin: process.env.ORIGIN,
            methods: ["GET", "POST", "PUT", "HEAD", "OPTIONS"],
            allowedHeaders: ["X-Requested-With", "Content-Type", "Authorization"]
        }));

        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        app.use(cookieParser());
        app.use(dSession);

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(Sentry.Handlers.requestHandler());
        app.use(Sentry.Handlers.tracingHandler());

        app.use("/", express.static("public"));
        app.use("/static", express.static("static"));
        app.use(["/swagger"], swaggerUi.serve, swaggerUi.setup(Swagger));

        // controllers below
        RegisterRoutes(app);

        app.get("/auth/linkedin", passport.authenticate("linkedin"));

        const options = {session: true};
        app.get('/auth/linkedin/callback', (req, res, next) => {
            passport.authenticate("linkedin", options, (err, user, info) => {
                req.logIn(user, options, (err) => {
                    if (err || !user) {
                        console.error(err);
                        return res.redirect(process.env.LOGIN_FAILURE_URL);
                    }
                    // @ts-ignore
                    const billingId = req.user.billingId;
                    if (billingId) {
                        getSubscriptions(billingId).then((response: any) => {
                            if (response?.data?.length > 0) {
                                return res.redirect(process.env.LOGIN_DASHBOARD_URL);
                            } else {
                                return res.redirect(`${process.env.LOGIN_PRICING_URL}?checkout=1`);
                            }
                            next();
                        });
                    }
                });
            })(req, res, next);
        });

        // end of controllers, Sentry error handler comes as first error handler
        app.use(Sentry.Handlers.errorHandler());

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
