import React, {useEffect, useState} from "react";
import "./AutoFeatureCard.scss";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../../global";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../../themes/ThemeUtils";
import {theme as LightTheme} from "../../../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {getTheme,  SwitchThemePayload} from "../../../actions";
import {theme as DarkTheme} from "../../../themes/dark";

type Props = {
    autoFeature: any,
    id: any,
    updatedFeatures: any
};

export const AutoFeatureCard: React.FC<Props> = ({autoFeature, updatedFeatures}) => {

    const [picture, setPicture] = useState("");
    const messages = new MessagesV2(VERBOSE);
    const [_theme, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    useEffect(() => {
        if (autoFeature?.profilePicture?.rootUrl) {
            setPicture(autoFeature?.profilePicture?.rootUrl + autoFeature?.profilePicture?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
    }, [autoFeature]);

    const setFeature = (feature: any, type: string) => {
        if (feature.types.includes(type)) {
            const typesSet = Array.isArray(feature.types) ? new Set(feature.types) : feature.types;
            typesSet.delete(type);
            feature.types = Array.from(typesSet);
        } else {
            const typesSet = Array.isArray(feature.types) ? new Set(feature.types) : feature.types;
            typesSet.add(type);
            feature.types = Array.from(typesSet);
        }
        updatedFeatures.current = [...updatedFeatures.current, feature];
    }

    useEffect(() => {
        messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                updateTheme(payload.theme);
                return Promise.resolve();
            }));
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                let theme = payload.theme === "light" ? LightTheme : DarkTheme;
                setThemeUtil(theme, rootElement);
                return Promise.resolve();
            }));
    }, []);

    // @ts-ignore
    return (
        <>
            <div className="card-holder row" ref={rootElement}>
                <div className="notification-card" style={{display: "grid", gridTemplateColumns: "5fr 1fr 1fr 1fr"}}>
                    <div className="auto-feature-user">
                        {picture.length > 0 && <div className="card-image" style={{paddingLeft: "4%"}}>
                            <img src={picture} alt="img"/>
                        </div>}
                        <div style={{paddingLeft: "1%"}} className="auto-feature-text">{autoFeature?.name && autoFeature.name[0]}</div>
                    </div>
                    <div className="form-check form-switch" style={{textAlign: "center"}}>
                        <input className="form-check-input switch-color" type="checkbox" id="autoLike" defaultChecked={autoFeature?.types?.includes("like")}
                               onChange={() => setFeature(autoFeature, "like")} />
                    </div>
                    <div className="form-check form-switch" style={{textAlign: "center"}}>
                        <input style={{marginLeft: "20px"}} className="form-check-input switch-color" type="checkbox" id="autoRepost" defaultChecked={autoFeature?.types?.includes("repost")}
                               onChange={() => setFeature(autoFeature, "repost")} />
                    </div>
                    <div style={{textAlign: "center"}}>
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.2727 4.35829C16.9311 4.22496 15.5894 4.12496 14.2394 4.04996V4.04163L14.0561 2.95829C13.9311 2.19163 13.7477 1.04163 11.7977 1.04163H9.61441C7.67274 1.04163 7.48941 2.14163 7.35607 2.94996L7.18107 4.01663C6.40607 4.06663 5.63107 4.11663 4.85607 4.19163L3.15607 4.35829C2.80607 4.39163 2.55607 4.69996 2.58941 5.04163C2.62274 5.38329 2.92274 5.63329 3.27274 5.59996L4.97274 5.43329C9.33941 4.99996 13.7394 5.16663 18.1561 5.60829C18.1811 5.60829 18.1977 5.60829 18.2227 5.60829C18.5394 5.60829 18.8144 5.36663 18.8477 5.04163C18.8727 4.69996 18.6227 4.39163 18.2727 4.35829Z" fill="#909090"/>
                            <path d="M16.7393 6.78337C16.5393 6.57504 16.2643 6.45837 15.981 6.45837H5.44764C5.16431 6.45837 4.88098 6.57504 4.68931 6.78337C4.49764 6.99171 4.38931 7.27504 4.40598 7.56671L4.92264 16.1167C5.01431 17.3834 5.13098 18.9667 8.03931 18.9667H13.3893C16.2976 18.9667 16.4143 17.3917 16.506 16.1167L17.0226 7.57504C17.0393 7.27504 16.931 6.99171 16.7393 6.78337ZM12.0976 14.7917H9.32264C8.98098 14.7917 8.69764 14.5084 8.69764 14.1667C8.69764 13.825 8.98098 13.5417 9.32264 13.5417H12.0976C12.4393 13.5417 12.7226 13.825 12.7226 14.1667C12.7226 14.5084 12.4393 14.7917 12.0976 14.7917ZM12.7976 11.4584H8.63098C8.28931 11.4584 8.00598 11.175 8.00598 10.8334C8.00598 10.4917 8.28931 10.2084 8.63098 10.2084H12.7976C13.1393 10.2084 13.4226 10.4917 13.4226 10.8334C13.4226 11.175 13.1393 11.4584 12.7976 11.4584Z" fill="#909090"/>
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );
};