import React from "react";
import ReactDOM from "react-dom";
import {GetStarted} from "./GetStarted";

ReactDOM.render(
    <GetStarted/>,
    document.getElementById("get-started-free")
);

ReactDOM.render(
    <GetStarted checkout/>,
    document.getElementById("get-started-premium")
);