import React from "react";
import ReactDOM from "react-dom";
import {DynamicUI} from "@stolbivi/pirojok";
import {Completion} from "./injectables/Completion";
import "./injectables/Completion.scss";

console.debug('LinkedIn Manager extension engaged');

const dynamicUI = new DynamicUI();
const CONTAINER_TAG = "ln-manager-expand";

const processUI = (target: any, tagName: string, action: "before" | "after", injectable: JSX.Element) => {
    if (document.getElementsByTagName(tagName).length === 0) {
        let container = document.createElement(tagName);
        container.id = tagName;
        target[action](container);
        ReactDOM.render(<React.StrictMode>{injectable}</React.StrictMode>, container);
    }
};

dynamicUI.watch(document, {
    subtree: true,
    childList: true,
    onAdd: (_: Node) => {
        const modalElement = document.getElementById('artdeco-modal-outlet');
        if (modalElement) {
            const actions = modalElement.getElementsByClassName("share-box_actions");
            if (actions && actions.length > 0) {
                processUI(actions[0], CONTAINER_TAG, "before", <Completion/>);
            }
        }
    },
});