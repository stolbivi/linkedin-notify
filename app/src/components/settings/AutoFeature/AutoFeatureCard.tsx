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
                <div className="notification-card" style={{display: "grid", gridTemplateColumns: "3fr 1fr 1fr"}}>
                    <div className="auto-feature-user">
                        {picture.length > 0 && <div className="card-image" style={{paddingLeft: "4%"}}>
                            <img src={picture} alt="img"/>
                        </div>}
                        <div style={{paddingLeft: "1%"}} className="auto-feature-text">{autoFeature.name[0]}</div>
                    </div>
                    <div className="form-check form-switch" style={{textAlign: "center"}}>
                        <input className="form-check-input switch-color" type="checkbox" id="autoLike" defaultChecked={autoFeature.types.includes("like")}
                               onChange={() => setFeature(autoFeature, "like")} />
                    </div>
                    <div className="form-check form-switch" style={{textAlign: "center"}}>
                        <input className="form-check-input switch-color" type="checkbox" id="autoRepost" defaultChecked={autoFeature.types.includes("repost")}
                               onChange={() => setFeature(autoFeature, "repost")} />
                    </div>
                </div>
            </div>
        </>
    );
};