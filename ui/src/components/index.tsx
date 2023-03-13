import React from "react";
import ReactDOM from "react-dom";
import {SignUp} from "./SignUp";
import {ProductPrice} from "./ProductPrice";
import "./index.scss"

ReactDOM.render(
    <SignUp className="button w-button"/>,
    document.getElementById("start-trial-header")
);

ReactDOM.render(
    <ProductPrice/>,
    document.getElementById("product-price-free")
);

ReactDOM.render(
    <ProductPrice checkout/>,
    document.getElementById("product-price-premium")
);

ReactDOM.render(
    <SignUp className="button secondary w-button"/>,
    document.getElementById("start-trial-footer")
);