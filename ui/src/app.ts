import express from "express";

require("dotenv").config();

(async () => {
    try {
        console.log("Starting the http server");

        const app = express();

        app.use('/', express.static('public'));

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}!`);
        });
    } catch (error) {
        console.error(error);
    }
})();
