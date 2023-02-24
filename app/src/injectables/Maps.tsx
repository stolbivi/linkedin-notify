import React, {useEffect, useState} from "react";
import {AppMessageType, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {inject} from "../utils/InjectHelper";

// @ts-ignore
import stylesheet from "./Maps.scss";

type Props = {
    host: HTMLElement
};

const TAG = `lnm-maps`;

export const MapsFactory = () => {
    if (window.location.href.indexOf("/in/") > 0) {
        const profileBackground = document.getElementsByClassName('live-video-hero-image');
        if (profileBackground && profileBackground.length > 0) {
            const receiver = profileBackground[0] as HTMLElement;
            const lastChild = receiver.lastChild;
            inject(lastChild, TAG, "after",
                <Maps host={receiver}/>,
            );
        }
    }
}

export const Maps: React.FC<Props> = ({host}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [disabled, setDisabled] = useState(true);
    const [src, setSrc] = useState<string>();
    const [urlInternal, setUrlInternal] = useState(window.location.href);

    useEffect(() => {
        for (let i = 0; i < host.children.length; i++) {
            const child = host.children[i] as HTMLElement;
            if (child.tagName !== TAG.toUpperCase()) {
                child.style["display"] = disabled ? "block" : "none";
            }
        }
        if (!disabled) {
            host.style.height = "200px";
            host.style.maxHeight = "200px";
        }
    }, [disabled]);

    useEffect(() => {
        let origin = 'chrome-extension://' + chrome.runtime.id;
        if (!location.ancestorOrigins.contains(origin)) {
            setSrc(chrome.runtime.getURL(`maps/loader.html?id=${extractIdFromUrl(urlInternal)}`));
        }
    }, [urlInternal]);

    useEffect(() => {
        window.addEventListener('popstate', () => {
            setUrlInternal(window.location.href);
        });
        messages.request<IAppRequest, any>({
            type: AppMessageType.Subscription,
        }, (r) => {
            // TODO FIXME
            // setDisabled(false);
            // return Promise.resolve();
            if (r.status === 403) {
                setDisabled(true);
            } else if (r.subscriptions?.length > 0) {
                const subscription = r.subscriptions[0];
                if (subscription.status === "trialing" || subscription.status === "active") {
                    setDisabled(false);
                    return Promise.resolve();
                }
            }
            setDisabled(true);
            return Promise.resolve();
        }).then(/* nada */);
    }, []);

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="iframe-container">
                <iframe scrolling="no" height="200" src={src}></iframe>
            </div>
        </React.Fragment>
    );
};