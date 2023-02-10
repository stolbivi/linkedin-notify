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

require("dotenv").config();

(async () => {
    try {
        console.log("Starting the http server");

        Dictionary.loadDictionary();

        const app = express();

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

        RegisterRoutes(app);

        app.use("/", express.static("public"));
        app.use("/static", express.static("static"));

        app.get("/auth/linkedin", passport.authenticate("linkedin"));
        app.get("/auth/linkedin/callback", passport.authenticate("linkedin", {
            successRedirect: process.env.SUCCESS_URL,
            failureRedirect: process.env.FAILURE_URL
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
