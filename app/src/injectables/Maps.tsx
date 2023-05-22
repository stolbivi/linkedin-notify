import React, {useEffect, useState} from "react";
import {extractIdFromUrl, VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {inject} from "../utils/InjectHelper";
import {getSubscription} from "../actions";
import {useUrlChangeSupport} from "../utils/URLChangeSupport";
// @ts-ignore
import stylesheet from "./Maps.scss";
import {AccessService} from "../services/AccessService";

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
                <Maps host={receiver}/>, "Maps"
            );
        }
    }
}

export const Maps: React.FC<Props> = ({host}) => {

    const messages = new MessagesV2(VERBOSE);
    const accessService = new AccessService();

    const [disabled, setDisabled] = useState(true);
    const [src, setSrc] = useState<string>();
    const [urlInternal] = useUrlChangeSupport(window.location.href);

    const iframeContainer = React.createRef<HTMLIFrameElement>();

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
        if (src && iframeContainer.current?.contentWindow) {
            iframeContainer.current?.contentWindow?.location.replace(src);
        }
    }, [src])

    useEffect(() => {
        messages.request(getSubscription())
            .then((r) => {
                return accessService.handleSubscription(r,
                    () => setDisabled(false),
                    () => setDisabled(true),
                    () => setDisabled(true));
            }).then(/* nada */);
    }, []);

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="iframe-container">
                <iframe scrolling="no" height="200" ref={iframeContainer} src={src}></iframe>
            </div>
        </React.Fragment>
    );
};