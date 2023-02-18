import React from "react";
import ReactDOM from "react-dom";
import {SignUp} from "./SignUp";

//<a href="pricing.html" class="button w-button">Start Your 7 Days PRO Trial Now</a>
//<a href="contact.html" class="button secondary w-button">Start Your 7 day Free Trial Now</a>

ReactDOM.render(
    <SignUp className="button w-button"/>,
    document.getElementById("start-trial-header")
);

ReactDOM.render(
    <SignUp className="button secondary w-button"/>,
    document.getElementById("start-trial-footer")
);