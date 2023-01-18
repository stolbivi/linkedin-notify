import React from "react";
import ReactDOM from "react-dom";
import {DynamicUI} from "@stolbivi/pirojok";
import {Completion} from "./injectables/Completion";
import root from 'react-shadow';
import {SalaryPill} from "./injectables/SalaryPill";
import {extractIdFromUrl} from "./global";
import {Maps} from "./injectables/Maps";

console.debug('LinkedIn Manager extension engaged');

const dynamicUI = new DynamicUI();

const inject = (target: any, tagName: string, action: "before" | "after", injectable: JSX.Element, onBefore?: () => void) => {
    if (document.getElementsByTagName(tagName).length === 0) {
        if (onBefore) {
            onBefore();
        }
        let container = document.createElement(tagName);
        container.id = tagName;
        target[action](container);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container);
    }
};

dynamicUI.watch(document, {
    subtree: true,
    childList: true,
    onAdd: (_: Node) => {
        // injecting Completion into post message element
        const modalElement = document.getElementById('artdeco-modal-outlet');
        if (modalElement) {
            const actions = modalElement.getElementsByClassName("share-box_actions");
            if (actions && actions.length > 0) {
                inject(actions[0], "lnmanager-completion", "before", <Completion/>);
            }
        }
        // injecting Salary pill into profile
        const profileActions = document.getElementsByClassName('pv-top-card-v2-ctas');
        if (profileActions && profileActions.length > 0) {
            const actions = profileActions[0].getElementsByClassName("pvs-profile-actions");
            if (actions && actions.length > 0) {
                inject(actions[0], "lnmanager-salary", "after",
                    <SalaryPill url={window.location.href}/>);
            }
        }
        // injecting Salary pill into people search
        if (window.location.href.indexOf("search/results/people/") > 0) {
            const profileCards = document.querySelectorAll('[data-chameleon-result-urn*="urn:li:member:"]');
            if (profileCards.length > 0) {
                profileCards.forEach(card => {
                    const profileLink = card.querySelectorAll('a[href*="/in/"]');
                    if (profileLink.length > 0) {
                        const link = profileLink[0].getAttribute("href");
                        const profileActions = card.getElementsByClassName('entity-result__actions');
                        if (profileActions.length > 0) {
                            const lastChild = profileActions[0].childNodes[profileActions[0].childNodes.length - 1];
                            const id = extractIdFromUrl(link);
                            inject(lastChild, `lnmanager-salary-${id}`, "before",
                                <SalaryPill url={link}/>);
                        }
                    }
                })
            }
        }
        //injecting map
        if (window.location.href.indexOf("/in/") > 0) {
            const profileBackground = document.getElementsByClassName('live-video-hero-image');
            if (profileBackground && profileBackground.length > 0) {
                const receiver = profileBackground[0];
                // @ts-ignore
                receiver.style.height = "200px";
                const lastChild = receiver.lastChild;
                inject(lastChild, `lnmanager-maps`, "after",
                    <Maps url={window.location.href}/>,
                    () => {
                        for (let i = 0; i < receiver.children.length; i++) {
                            const child = receiver.children[i] as HTMLElement;
                            child.style["display"] = "none";
                        }
                    });
            }
        }
    },
});