import React, {useEffect, useState} from "react";
import {AppMessageType, BACKEND_SIGN_IN, extractIdFromUrl, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";

// @ts-ignore
import stylesheet from "./Maps.scss";
import {Messages} from "@stolbivi/pirojok";

type Props = {
    url: string
    disabled?: boolean
};

export const Maps: React.FC<Props> = ({url, disabled}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const [src, setSrc] = useState<string>();

    const iframeContainer = React.createRef<HTMLIFrameElement>();

    useEffect(() => {
        const id = extractIdFromUrl(url);
        let origin = 'chrome-extension://' + chrome.runtime.id;
        if (!location.ancestorOrigins.contains(origin)) {
            setSrc(chrome.runtime.getURL(`maps/loader.html?id=${id}`));
        }
    }, []);

    const onClick = () => {
        return messages.request<IAppRequest, any>({type: AppMessageType.OpenURL, payload: {url: BACKEND_SIGN_IN}});
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="iframe-container">
                {disabled
                    ? <div className="sign-in" onClick={onClick}>Please, sign in to use premium features</div>
                    : <iframe scrolling="no" height="200" ref={iframeContainer} src={src}></iframe>
                }
            </div>
        </React.Fragment>
    );
};