import React, {useEffect, useState} from "react";
// @ts-ignore
import stylesheet from "./AutoFeature.scss";
import {AppMessageType, BACKEND_SIGN_IN, Feature, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";


const LikeSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" focusable="false">
    <path
        d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.85L8.89 9H4.12A2.12 2.12 0 002 11.12a2.16 2.16 0 00.92 1.76A2.11 2.11 0 002 14.62a2.14 2.14 0 001.28 2 2 2 0 00-.28 1 2.12 2.12 0 002 2.12v.14A2.12 2.12 0 007.12 22h7.49a8.08 8.08 0 003.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 01-2.69.63H7.72a1 1 0 01-1-.72l-.25-.87-.85-.41A1 1 0 015 17l.17-1-.76-.74A1 1 0 014.27 14l.66-1.09-.73-1.1a.49.49 0 01.08-.7.48.48 0 01.34-.11h7.05l-1.31-3.92A7 7 0 0110 4.86V3.75a.77.77 0 01.75-.75.75.75 0 01.71.51L12 5a9 9 0 002.13 3.5l4.5 4.5H19z"></path>
</svg>
const RepostSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path
        d="M13.96 5H6c-.55 0-1 .45-1 1v10H3V6c0-1.66 1.34-3 3-3h7.96L12 0h2.37L17 4l-2.63 4H12l1.96-3zm5.54 3H19v10c0 .55-.45 1-1 1h-7.96L12 16H9.63L7 20l2.63 4H12l-1.96-3H18c1.66 0 3-1.34 3-3V8h-1.5z"></path>
</svg>

const Icons = {
    like: LikeSVG,
    repost: RepostSVG
}

type Props = {
    feature: string
    activityId: string
    url: string
    features: Feature[]
    disabled?: boolean
};
// @ts-ignore
export const AutoFeature: React.FC<Props> = ({feature, activityId, url, features, disabled}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    // @ts-ignore
    const [disabledInternal, setDisabledInternal] = useState(disabled);
    const [title, setTitle] = useState<string>();
    const [active, setActive] = useState<boolean>();
    const [author, setAuthor] = useState<string>();

    const extractAuthor = (query: URLSearchParams, name: string) => {
        if (query.has(name)) {
            setAuthor(query.get(name));
        }
    }

    useEffect(() => {
        if (disabledInternal) {
            setTitle("Please, sign in to use premium features");
            return;
        }
        const query = new URL(url);
        extractAuthor(query.searchParams, "miniProfileUrn");
        extractAuthor(query.searchParams, "miniCompanyUrn");
    }, []);

    useEffect(() => {
        const typedFeature = features.find(f => f.type === feature);
        const index = typedFeature?.authors?.findIndex((f: string) => f === author);
        setActive(index >= 0);
    }, [author]);

    const onClick = () => {
        if (disabledInternal) {
            return messages.request<IAppRequest, any>({type: AppMessageType.OpenURL, payload: {url: BACKEND_SIGN_IN}});
        }
        messages.request<IAppRequest, any>({
            type: AppMessageType.SetFeatures,
            payload: {author, type: feature, action: active ? "unset" : "set"}
        }, (r) => {
            if (r.error) {
                console.error(r.error);
                setDisabledInternal(r.status == 403)
            } else {
                setActive(!active);
            }
        }).then(/* nada */);
    }

    // @ts-ignore
    const getIcon = (feature: string): JSX.Element => Icons[feature];

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className={`auto-pill-${active ? "on" : "off"}` + (disabledInternal ? " disabled" : "")}
                 onClick={onClick} title={title}>
                {active ? "On" : "Off"} {getIcon(feature)}
            </div>
        </React.Fragment>
    );

}