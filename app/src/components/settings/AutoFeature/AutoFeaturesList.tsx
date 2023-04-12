/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, {useEffect, useState, useRef} from "react";
import {Loader} from "../../Loader";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../../global";
import {getCompanyByUrn, getFeatures, getProfileByUrn, setFeatures as setFeaturesAction} from "../../../actions";
import "./AutoFeaturesList.scss";
import {AutoFeatureCard} from "./AutoFeatureCard";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../../themes/ThemeUtils";
import {theme as LightTheme} from "../../../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {getTheme,  SwitchThemePayload} from "../../../actions";
import {theme as DarkTheme} from "../../../themes/dark";
import {AccessState} from "../../../injectables/AccessGuard";

const AutoFeaturesList = (props) => {
    const [completed, setCompleted] = useState(false);
    const [autoFeatures, setAutoFeatures] = useState({});
    const [prevFeatures,setPrevFeatures] = useState({});
    const updatedFeatures = useRef([]);
    const messages = new MessagesV2(VERBOSE);
    const [theme, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    const getIdFromUrn = (urn: string) => {
        const regex = /(?<=:)[^:]*$/;
        return urn.match(regex)[0];
    };
    const getTypeFromUrn = (urn: string) => {
        const regex = /(?<=:)(fs_miniCompany|fs_miniProfile)/;
        return urn.match(regex)[0];
    };

    async function getFeatureProfiles(features) {
        const featureProfiles = {};
        for (let feature of features) {
            for (let author of feature.authors) {
                const id = getIdFromUrn(author);
                const type = feature.type;
                const profileType = getTypeFromUrn(author);
                if (!featureProfiles[id]) {
                    let resp;
                    if ("fs_miniProfile" === profileType) {
                        resp = await messages.request(getProfileByUrn(id));
                    } else {
                        resp = await messages.request(getCompanyByUrn(id));
                    }
                    featureProfiles[id] = {...resp, author};
                    featureProfiles[id].types = [type];
                } else {
                    featureProfiles[id].types.push(type);
                }
            }
        }
        return featureProfiles;
    }

    const resetHandler = () => {
        setAutoFeatures(JSON.parse(JSON.stringify(prevFeatures)));
    }

    const callFeaturesAction = (author,type,value) => {
        return messages.request(setFeaturesAction({author, type, action: value}))
                .then((r) => {
                    if (r.error) {
                        console.error(r.error);
                    }
                });
    }

    const saveHandler = () => {
        setCompleted(false);
        const featurePromises = [];
        updatedFeatures.current.forEach(feature => {
            const isLiked = feature.types.includes("like") ? "set" : "unset";
            const isReposted = feature.types.includes("repost") ? "set" : "unset";
            featurePromises.push(callFeaturesAction(feature.author,"like", isLiked));
            featurePromises.push(callFeaturesAction(feature.author,"repost", isReposted));
        });
        Promise.all([...featurePromises])
            .then(() => {
                setCompleted(true);
            })
            .catch((error) => {
                console.error("Error saving features:", error);
                setCompleted(true);
            });
    }

    useEffect(() => {
        if(props.accessState === AccessState.Valid) {
            messages.request(getFeatures())
                .then(async (resp) => {
                    if (resp && resp?.response?.features?.length > 0) {
                        const features = resp?.response?.features;
                        setAutoFeatures(await getFeatureProfiles(features));
                    }
                    setCompleted(true);
                }).catch(_err => setCompleted(true));
        } else {
            setCompleted(true);
        }
    }, []);

    useEffect(() => {
        setPrevFeatures(autoFeatures)
    },[autoFeatures]);

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

    return (
        <div className="w-100" style={{ height: "600px", display:"flex", flexDirection:"column"}} ref={rootElement}>
            <Loader show={!completed} className="p-5" heightValue="600px"/>
            {completed && Object.keys(autoFeatures).length == 0 && <div className="no-data">No Auto Features found</div>}
            {completed && autoFeatures && Object.keys(autoFeatures).length > 0 && (
                <>
                    <div style={{padding:"20px", display: "grid", gridTemplateColumns: "3fr 1fr 1fr", marginTop:"7px"}} >
                        <span style={{marginLeft: "4%"}} className="pro-feature-text">User</span>
                        <span className="auto-feature-text">Auto Like</span>
                        <span className="auto-feature-text">Auto Repost</span>
                    </div>
                    {Object.entries(autoFeatures).map(([id, feature]) => (
                        <AutoFeatureCard autoFeature={feature} id={id} key={id} updatedFeatures={updatedFeatures}/>
                    ))}
                    <div className="auto-buttons">
                        <button className="reset-btn" style={{marginLeft: "26%"}} onClick={resetHandler}>Reset</button>
                        <button className="save-btn" style={{marginLeft: "26%"}} onClick={saveHandler}>Save</button>
                    </div>
                </>
            )}
        </div>
    )
}
export default AutoFeaturesList;