import session from "express-session";

require("dotenv").config();

const options = {
    table: process.env.TABLE_SESSIONS
};

const DynamoDBStore = require('connect-dynamodb')({session: session});

const dSession = session({
    saveUninitialized: false,
    cookie: {maxAge: 86400000 * 90}, // 90 days
    store: new DynamoDBStore(options),
    resave: false,
    secret: process.env.SESSION_STORE_SECRET
})

export default dSession;