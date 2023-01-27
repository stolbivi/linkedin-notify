import ReactDOM from "react-dom";
import root from "react-shadow";
import React from "react";

export const inject = (target: any, tag: string, action: "before" | "after",
                       injectable: JSX.Element | (() => Promise<JSX.Element>)) => {
    if (document.getElementsByTagName(tag).length === 0) {
        let container = document.createElement(tag);
        target[action](container);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container)
    }
};