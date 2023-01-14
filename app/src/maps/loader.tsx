import React from "react";
import ReactDOM from "react-dom";
import "./loader.scss";
import {MapsLoader} from "./MapsLoader";

ReactDOM.render(
    <React.StrictMode>
        <MapsLoader/>
    </React.StrictMode>,
    document.getElementById("root")
);