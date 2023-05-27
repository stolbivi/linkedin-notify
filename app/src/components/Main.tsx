import React, {useEffect, useRef, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {Badges, VERBOSE} from "../global";
import {Notifications} from "./Notifications";
import {Tabs, TabTypes} from "./Tabs";
import {Conversations} from "./Conversations";
import {Invitations} from "./Invitations";
import {SignIn} from "./SignIn";
import "./Main.scss";
import {Logo} from "../icons/Logo";
import {getBadges, getIsLogged, getSubscription} from "../actions";
import {ThemeSwitch} from "./ThemeSwitch";
import {theme as LightTheme} from "../themes/light";
import {theme as DarkTheme} from "../themes/dark";
import {applyThemeProperties, getThemeCookie, listenToThemeCookie} from "../themes/ThemeUtils";
import {Settings} from "./settings/Settings";
import {SettingTabs, SettingTabTypes} from "./settings/SettingTabs";
import ProFeaturesList from "./settings/ProFeatures/ProFeaturesList";
import AutoFeaturesList from "./settings/AutoFeature/AutoFeaturesList";
import {AccessState} from "../injectables/AccessGuard";
import {AccessService} from "../services/AccessService";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const messages = new MessagesV2(VERBOSE);
    const accessService = new AccessService();

    const [light, setLight] = useState<boolean>(true);
    const [badges, setBadges] = useState({} as Badges);
    const [isLogged, setIsLogged] = useState(false);
    const [tab, setTab] = useState(0);
    const [settingTabs, setSettingTabs] = useState(0);
    const [accessState, setAccessState] = useState(AccessState.Unknown);
    const rootElement = useRef<HTMLDivElement>();

    useEffect(() => {
        getThemeCookie().then(cookie => {
            setLight(cookie.value === "light")
        }).catch();
        listenToThemeCookie((cookie) => {
            setLight(cookie.value === "light")
        });
        messages.request(getIsLogged())
            .then((payload) => setIsLogged(payload.isLogged));
        messages.request(getBadges())
            .then((badges) => setBadges(badges));
        messages.request(getSubscription())
            .then((r) => {
                return accessService.handleSubscription(r,
                    () => setAccessState(AccessState.Valid),
                    () => setAccessState(AccessState.Invalid),
                    () => setAccessState(AccessState.SignInRequired),
                    () => setAccessState(AccessState.SignInRequired));
            }).finally(/*nada*/);
    }, []);

    useEffect(() => {
        chrome.alarms.create("check-badges", {periodInMinutes: 0, delayInMinutes: 0});
    }, [badges]);

    useEffect(() => {
        applyThemeProperties(light ? LightTheme : DarkTheme, rootElement);
    }, [light]);

    return (
        <React.Fragment>
            <div className="container" ref={rootElement}>
                {isLogged === false
                    ? <SignIn/>
                    : <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                        <div className="header">
                            <div className="title-row">
                                <div className="title">
                                    <div className="logo"><Logo/></div>
                                    <span>LinkedIn Manager</span>
                                    <Settings setSettingTabs={setSettingTabs} setTab={setTab}
                                              setAccessState={setAccessState}/>
                                    <div className="switch"><ThemeSwitch light={light} setLight={setLight}/></div>
                                </div>
                            </div>
                            {
                                settingTabs ? (
                                    <SettingTabs onTab={setTab}/>
                                ) : (
                                    <Tabs onTab={setTab} badges={badges}/>
                                )
                            }
                        </div>
                        <div className="scroll">
                            {settingTabs ? (
                                <>
                                    {tab === SettingTabTypes.ProFeatures && <ProFeaturesList/>}
                                    {tab === SettingTabTypes.AutoFeatures &&
                                        <AutoFeaturesList accessState={accessState}/>}
                                </>
                            ) : (
                                <>
                                    {tab === TabTypes.MyNetwork && <Invitations/>}
                                    {tab === TabTypes.Messages && <Conversations setBadges={setBadges}/>}
                                    {tab === TabTypes.Notifications && <Notifications setBadges={setBadges}/>}
                                </>
                            )}
                        </div>
                    </div>
                }
            </div>
        </React.Fragment>
    );
};