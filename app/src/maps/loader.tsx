import React from "react";
import ReactDOM from "react-dom";
import {MapsLoader} from "./MapsLoader";
import {Provider} from "react-redux";
import {localStore} from "../store/LocalStore";
import "./loader.scss";

ReactDOM.render(
    <Provider store={localStore}>
        <MapsLoader/>
    </Provider>,
    document.getElementById("root")
);