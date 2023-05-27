/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, {useEffect, useState} from "react";
import {Loader} from "../../Loader";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../../../themes/ThemeUtils";
import {theme as LightTheme} from "../../../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {getTheme,  SwitchThemePayload} from "../../../actions";
import {theme as DarkTheme} from "../../../themes/dark";
import "./ProFeatures.scss";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../../global";

const ProFeaturesList = () => {
    const [features, setFeatures] = useState({});
    const [completed, setCompleted] = useState(false);
    const messages = new MessagesV2(VERBOSE);
    const [theme, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    let proFeatures = {
        "Salary": { text: "Salary Estimator", isActive: true, id: "Salary" , isChanged: false},
        "chatGpt": { text: "Integration with ChatGPT Pro", isActive: true, id: "chatGpt", isChanged: false },
        "NotesManager": { text: "Unlimited Notes on Linkedin Profile", isActive: true, id: "NotesManager", isChanged: false},
        "Maps": { text: "Integrated Google Maps", isActive: true, id: "Maps", isChanged: false },
        "StagePill": { text: "Add Status", isActive: true, id: "StagePill" , isChanged: false},
        "LastViewed": { text: "Last Viewed", isActive: true, id: "LastViewed" , isChanged: false},
        "AutoFeature": { text: "Auto Like/Repost", isActive: true, id: "AutoFeature", isChanged: false },
    };
    useEffect(() => {
        setTimeout(() => {
            setCompleted(true);
        },500);
        chrome.storage.local.get('proFeatures', (data) => {
            if (data.proFeatures) {
                setFeatures(JSON.parse(data.proFeatures));
            } else {
                setFeatures({...proFeatures});
            }
        });
    },[]);
    const saveHandler = () => {
        const updatedFeatures = {...features};
        chrome.storage.local.set({proFeatures: JSON.stringify(updatedFeatures)}).then(_r => {});
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: function (updatedFeatures) {
                    sessionStorage.setItem('proFeatures', JSON.stringify(updatedFeatures));
                    window.postMessage({ type: "modifyElements", initialLoad: false }, "*");
                },
                args: [updatedFeatures],
            }).catch((error) => {
                console.error('Error:', error);
            });
        });
        window.close();
    }

    useEffect(() => {
        const updatedFeatures = {...features};
        chrome.storage.local.set({proFeatures: JSON.stringify(updatedFeatures)}).then(_r => {});
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: function (updatedFeatures) {
                    sessionStorage.setItem('proFeatures', JSON.stringify(updatedFeatures));
                    window.postMessage({ type: "modifyElements", initialLoad: false }, "*");
                },
                args: [updatedFeatures],
            }).catch((error) => {
                console.error('Error:', error);
            });
        });
    },[features]);

    const resetHandler = () => {
        setFeatures(prevFeatures => {
            const newFeatures = {...prevFeatures};
            Object.values(newFeatures).forEach(feature => {
                feature.isActive = true;
                feature.isChanged = false;
            });
            return newFeatures;
        });
    }
    const toggleCheck = (featureId) => {
        setFeatures(prevFeatures => {
            const newFeatures = {...prevFeatures};
            newFeatures[featureId].isActive = ! newFeatures[featureId].isActive;
            newFeatures[featureId].isChanged = true;
            return newFeatures;
        });
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
    return (
        <div className="w-100" style={{ height: "600px" }} ref={rootElement}>
                <>
                    <Loader show={!completed} className="p-5" heightValue="600px"/>
                    <div style={{padding:"20px", display: "grid", gridTemplateColumns: "3fr 1fr", marginTop:"7px"}}>
                        <span className="pro-feature-text">Features</span>
                        <span className="pro-feature-toggle">On/Off</span>
                    </div>
                    {
                        Object.values(features).map(feature => (
                            <div className="card-holder row" key={feature.id}>
                                <div className={"notification-card"} style={{display: "grid", gridTemplateColumns: "3fr 1fr"}}>
                                    <div className="pro-feature-options" style={{paddingLeft: "4%", fontSize:"12px"}}>{feature.text}</div>
                                    <div className="form-check form-switch" style={{textAlign: "center", paddingLeft:"6.5rem"}}>
                                        <input className="form-check-input switch-color" type="checkbox" checked={feature.isActive}
                                               onChange={() => toggleCheck(feature.id)} />
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    <div className="row">
                        <button className="reset-btn" onClick={resetHandler}>Reset</button>
                        <button className="save-btn" onClick={saveHandler}>Save</button>
                    </div>
                </>
        </div>
    )
}
export default ProFeaturesList;