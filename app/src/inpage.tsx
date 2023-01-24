import React from "react";
import ReactDOM from "react-dom";
import {DynamicUI, Messages} from "@stolbivi/pirojok";
import {Completion} from "./injectables/Completion";
import root from 'react-shadow';
import {SalaryPill} from "./injectables/SalaryPill";
import {AppMessageType, extractIdFromUrl, Feature, IAppRequest, MESSAGE_ID, VERBOSE} from "./global";
import {Maps} from "./injectables/Maps";
import {AutoFeature} from "./injectables/AutoFeature";

console.debug('LinkedIn Manager extension engaged');

const dynamicUI = new DynamicUI();
const messages = new Messages(MESSAGE_ID, VERBOSE);

messages.request<IAppRequest, any>({
    type: AppMessageType.Features
}, (r) => {
    injectUI(r);
}).then(/* nada */);

const inject = (target: any, tagName: string, action: "before" | "after",
                injectable: JSX.Element | (() => Promise<JSX.Element>), onBefore?: () => void) => {
    if (document.getElementsByTagName(tagName).length === 0) {
        if (onBefore) {
            onBefore();
        }
        let container = document.createElement(tagName);
        container.id = tagName;
        target[action](container);
        if (typeof injectable === "function") {
            injectable().then(toInject => ReactDOM.render(<root.div mode={'open'}>{toInject}</root.div>, container));
        } else {
            ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container)
        }
    }
};

const isDisabled = (response: any) => !!response.error;
const getFeatures = (response: any): Feature[] => response.response?.features ?? [];

const injectUI = (response: any) => {
    dynamicUI.watch(document, {
        subtree: true,
        childList: true,
        onAdd: (_: Node) => {
            // injecting Completion into post message element
            const modalElement = document.getElementById('artdeco-modal-outlet');
            if (modalElement) {
                const actions = modalElement.getElementsByClassName("share-box_actions");
                if (actions && actions.length > 0) {
                    inject(actions[0], "lnmanager-completion", "before",
                        <Completion disabled={isDisabled(response)}/>);
                }
            }
            // injecting Salary pill into profile
            const profileActions = document.getElementsByClassName('pv-top-card-v2-ctas');
            if (profileActions && profileActions.length > 0) {
                const actions = profileActions[0].getElementsByClassName("pvs-profile-actions");
                if (actions && actions.length > 0) {
                    inject(actions[0], "lnmanager-salary", "after",
                        <SalaryPill url={window.location.href} disabled={isDisabled(response)}/>);
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
                                    <SalaryPill url={link} disabled={isDisabled(response)}/>);
                            }
                        }
                    })
                }
            }
            //injecting map
            if (!isDisabled(response)) {
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
            }

            // inject auto features
            if (window.location.href.indexOf("/feed/") > 0) {
                const updateDivs = document.querySelectorAll('div[data-id*="urn:li:activity:"]');
                updateDivs.forEach(updateDiv => {
                    const titles = updateDiv.getElementsByClassName("update-components-actor");
                    if (titles && titles.length > 0) {
                        const aElements = titles[0].getElementsByTagName("a");
                        if (aElements && aElements.length > 0) {
                            const dataId = updateDiv.getAttribute("data-id");
                            const activityId = dataId.split(":").pop().trim();
                            const url = aElements[0].getAttribute("href");

                            async function getAutoFeatures() {
                                return new Promise<JSX.Element>((res) => {
                                    messages.request<IAppRequest, any>({
                                        type: AppMessageType.Features
                                    }, (r) => {
                                        const features = getFeatures(r);
                                        const disabled = isDisabled(r);
                                        res(
                                            <div className="d-flex" style={{paddingRight: "1em"}}>
                                                <AutoFeature disabled={disabled}
                                                             activityId={activityId}
                                                             url={url}
                                                             features={features}
                                                             feature={"like"}/>
                                                <AutoFeature disabled={disabled}
                                                             activityId={activityId}
                                                             url={url}
                                                             features={features}
                                                             feature={"repost"}/>
                                            </div>
                                        );
                                    }).then(/* nada */);
                                })
                            }

                            inject(titles[0].lastChild, `lnmanager-auto-${activityId}`, "after",
                                () => getAutoFeatures());
                        }
                    }
                })
            }
        },
    });
}