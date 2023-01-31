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

export const injectFirstChild = (target: any, tag: string, injectable: JSX.Element | (() => Promise<JSX.Element>)) => {
    if (document.getElementsByTagName(tag).length === 0) {
        let container = document.createElement(tag);
        target.insertBefore(container, target.firstChild);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container)
    }
};

export const injectLastChild = (target: any, tag: string, injectable: JSX.Element | (() => Promise<JSX.Element>)) => {
    if (document.getElementsByTagName(tag).length === 0) {
        let container = document.createElement(tag);
        target.insertAfter(container, target.lastChild);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container)
    }
};