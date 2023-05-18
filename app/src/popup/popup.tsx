import React from "react";
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./popup.scss";
import {Main} from "../components/Main";
import * as Sentry from "@sentry/react";

export const SENTRY_DISABLED = `${process.env.SIGN_UP_URL}`;

if (SENTRY_DISABLED === "false") {
    console.log("Enabling Sentry reporting");
    Sentry.init({
        dsn: `${process.env.SENTRY_URL}`,
    });
}

ReactDOM.render(
    <Main/>,
    document.getElementById("root")
);