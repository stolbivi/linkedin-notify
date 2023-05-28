import React, {useEffect, useState} from "react";
import {extractIdFromUrl, Feature, VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {Loader} from "../components/Loader";
import {inject} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";

// @ts-ignore
import stylesheet from "./AutoFeature.scss";
import {getCompanyByUrn, getFeatures, getMe, getUserIdByUrn, setFeatures as setFeaturesAction} from "../actions";
import {Tooltip} from "react-bootstrap";
import {useUrlChangeSupport} from "../../src/utils/URLChangeSupport";
import {localStore} from "../store/LocalStore";
import {Provider} from "react-redux";

const LikeSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" focusable="false">
    <path
        d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.85L8.89 9H4.12A2.12 2.12 0 002 11.12a2.16 2.16 0 00.92 1.76A2.11 2.11 0 002 14.62a2.14 2.14 0 001.28 2 2 2 0 00-.28 1 2.12 2.12 0 002 2.12v.14A2.12 2.12 0 007.12 22h7.49a8.08 8.08 0 003.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 01-2.69.63H7.72a1 1 0 01-1-.72l-.25-.87-.85-.41A1 1 0 015 17l.17-1-.76-.74A1 1 0 014.27 14l.66-1.09-.73-1.1a.49.49 0 01.08-.7.48.48 0 01.34-.11h7.05l-1.31-3.92A7 7 0 0110 4.86V3.75a.77.77 0 01.75-.75.75.75 0 01.71.51L12 5a9 9 0 002.13 3.5l4.5 4.5H19z"/>
</svg>
const RepostSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path
        d="M13.96 5H6c-.55 0-1 .45-1 1v10H3V6c0-1.66 1.34-3 3-3h7.96L12 0h2.37L17 4l-2.63 4H12l1.96-3zm5.54 3H19v10c0 .55-.45 1-1 1h-7.96L12 16H9.63L7 20l2.63 4H12l-1.96-3H18c1.66 0 3-1.34 3-3V8h-1.5z"/>
</svg>

const Icons = {
    like: LikeSVG,
    repost: RepostSVG
}

export const AutoFeatureFactory = () => {
    setTimeout(() => {
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
                        const target = titles[0].querySelectorAll("a > div > span");
                        if (target && target.length > 0) {
                            const lastItem = target[target.length - 1];
                            // @ts-ignore
                            lastItem.style.display = "flex";
                            inject(lastItem.lastChild, `lnm-auto-${activityId}`, "after",
                                <div style={{paddingLeft: "0.25em", display: "flex"}}>
                                    <Provider store={localStore}>
                                        <AutoFeature fromProfile={false} url={url} type={"like"}/>
                                        <AutoFeature fromProfile={false} url={url} type={"repost"}/>
                                    </Provider>
                                </div>, "AutoFeature"
                            );
                        }
                    }
                }
            })
        }
        else if(window.location.href.indexOf("/in/") > 0){
            const aside = document.getElementsByClassName("pv-top-card--photo text-align-left pv-top-card--photo-resize");
            if (aside && aside.length > 0) {
                inject(aside[0], `auto-features-profile`, "before",
                    <div style={{paddingLeft: "0.25em", marginLeft: "-11rem", marginTop: "-20.5rem"}}>
                        <Provider store={localStore}>
                            <AutoFeature fromProfile={true} type={"like"} url={window.location.href}/>
                            <AutoFeature fromProfile={true} type={"repost"} url={window.location.href}/>
                        </Provider>
                    </div>, "AutoFeature"
                );
            }
        }
        else if(window.location.href.indexOf("/company/") > 0){
            const aside = document.getElementsByClassName("live-video-hero-image");
            if (aside && aside.length > 0) {
                inject(aside[0], `auto-features-profile`, "before",
                    <div style={{marginLeft: "-8rem", marginTop: "-0.5rem", position: "absolute"}}>
                        <Provider store={localStore}>
                            <AutoFeature fromCompany={true} type={"like"} url={window.location.href}/>
                            <AutoFeature fromCompany={true} type={"repost"} url={window.location.href}/>
                        </Provider>
                    </div>, "AutoFeature"
                );
            }
        }
    },1000);
}

type Props = {
    fromProfile?: boolean
    fromCompany?: boolean
    type: string
    url?: string
};

// @ts-ignore
export const AutoFeature: React.FC<Props> = ({fromProfile,fromCompany, type, url}) => {

    const messages = new MessagesV2(VERBOSE);
    const [urlInternal] = useUrlChangeSupport(url);
// @ts-ignore
    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [completed, setCompleted] = useState(false);
    const [active, setActive] = useState<boolean>();
    const [author, setAuthor] = useState<string>();
    const [features, setFeatures] = useState<Feature[]>([]);
    const [customUrl, setCustomUrl] = useState(url);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const userId = extractIdFromUrl(urlInternal);
        messages.request(getMe()).then(resp => {
            if(userId === resp.miniProfile.publicIdentifier) {
                setShow(false);
            } else {
                setShow(true);
            }
        });
       if(fromProfile) {
           setCompleted(false);
           const orgUrl = `${urlInternal}?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3A`;
           messages.request(getUserIdByUrn(userId)).then((profileId) => {
               setCustomUrl(orgUrl + profileId);
               setCompleted(true);
           });
       }
       if(fromCompany) {
           setCompleted(false);
           const orgUrl = `${urlInternal}?miniCompanyUrn=urn%3Ali%3Afs_miniCompany%3A`;
           messages.request(getCompanyByUrn(extractIdFromUrl(urlInternal))).then((resp) => {
                const parts = resp.entityUrn.split(":");
                const companyId = parts[parts.length - 1];
                setCustomUrl(orgUrl + companyId);
                setCompleted(true);
            });
       }
    },[urlInternal]);

    const extractAuthor = (query: URLSearchParams, name: string) => {
        if (query.has(name)) {
            setAuthor(query.get(name));
        }
    }

    const getData = () => {
        messages.request(getFeatures())
            .then((r) => setFeatures(r.response?.features ?? []));
    }

    useEffect(() => {
        if (accessState !== AccessState.Valid) {
            return;
        }
        if(customUrl) {
            setTimeout(() => {
                getData();
                const query = new URL(customUrl);
                extractAuthor(query.searchParams, "miniProfileUrn");
                extractAuthor(query.searchParams, "miniCompanyUrn");
            },500)
        }
    }, [accessState, customUrl]);

    useEffect(() => {
        if(features.length > 0) {
            const typedFeature = features.find(f => f.type === type);
            const index = typedFeature?.authors?.findIndex((f: string) => author.includes(f));
            setActive(index >= 0);
        } else {
            setActive(false);
        }
    }, [author, features, customUrl]);

    useEffect(() => {
        if (active !== undefined) {
            setCompleted(true);
        }
    }, [active]);

    const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setCompleted(false);
        messages.request(setFeaturesAction({author, type, action: active ? "unset" : "set"}))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                    setActive(false);
                } else {
                    setActive(!active);
                }
                setCompleted(true);
            });
    }

// @ts-ignore
    const getIcon = (feature: string): JSX.Element => Icons[feature];

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px10"}
                         loaderClassName={"loader-base loader-px10"} hideTitle/>
            {accessState === AccessState.Valid && show &&
                <Tooltip title={type === 'like' ? 'Allows you to automatically like future posts by this user' : 'Allows you to automatically share future posts by this user'}>
                    {
                        (fromProfile || fromCompany) ?(
                            <div className={`auto-pill-profile-${active ? "on" : "off"}`}
                                 onClick={(e) => onClick(e)}>
                                <Loader show={!completed}/>
                                {completed && <React.Fragment>Auto {getIcon(type)}</React.Fragment>}
                            </div>
                        ):(
                            <div className={`auto-pill-${active ? "on" : "off"}`}
                                 onClick={(e) => onClick(e)}>
                                <Loader show={!completed}/>
                                {completed && <React.Fragment>Auto {getIcon(type)}</React.Fragment>}
                            </div>
                        )
                    }
                </Tooltip>
            }
        </React.Fragment>
    );

}
