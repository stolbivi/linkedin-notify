import React, {useEffect, useState} from "react";
// @ts-ignore
import stylesheet from "./Maps.scss";
import {extractIdFromUrl} from "../global";

type Props = {
    url: string
};

export const Maps: React.FC<Props> = ({url}) => {

    const [src, setSrc] = useState<string>();

    const iframeContainer = React.createRef<HTMLIFrameElement>();

    useEffect(() => {
        const id = extractIdFromUrl(url);
        let origin = 'chrome-extension://' + chrome.runtime.id;
        if (!location.ancestorOrigins.contains(origin)) {
            setSrc(chrome.runtime.getURL(`maps/loader.html?id=${id}`));
        }
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