import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {Badges, Feature, VERBOSE} from "../global";
import {Notifications} from "./Notifications";
import {Tabs, TabTypes} from "./Tabs";
import {Conversations} from "./Conversations";
import {Invitations} from "./Invitations";
import {SignIn} from "./SignIn";
import "./Main.scss";
import {Logo} from "../icons/Logo";
import {getBadges, getFeatures, getIsLogged} from "../actions";
import {ThemeSwitch} from "./ThemeSwitch";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const messages = new MessagesV2(VERBOSE);

    const [completed, setCompleted] = useState<boolean>(false);
    const [light, setLight] = useState<boolean>(true);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [badges, setBadges] = useState({} as Badges);
    const [isLogged, setIsLogged] = useState(false);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        messages.request(getFeatures())
            .then((r) => setFeatures(r.response?.features ?? []));
        messages.request(getIsLogged())
            .then((logged) => setIsLogged(logged));
        messages.request(getBadges())
            .then((badges) => setBadges(badges));
    }, []);

    useEffect(() => {
        if (features?.length > 0) {
            const themeFeature = features.find(f => f.type === 'theme');
            if (themeFeature) {
                setLight(themeFeature.theme === 'light');
            } else {
                setLight(true);
            }
            setCompleted(true);
        }
    }, [features]);

    return (
        <React.Fragment>
            {completed &&
                <div className="container">
                    {isLogged === false
                        ? <SignIn/>
                        : <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                            <div className="header">
                                <div className="title-row">
                                    <div className="title">
                                        <div className="logo"><Logo/></div>
                                        <span>LinkedIn Manager</span>
                                        <div className="switch"><ThemeSwitch light={light} setLight={setLight}/></div>
                                    </div>
                                </div>
                                <Tabs onTab={setTab} badges={badges}/>
                            </div>
                            <div className="scroll">
                                {
                                    tab === TabTypes.MyNetwork && <Invitations/>
                                }
                                {
                                    tab === TabTypes.Messages && <Conversations setBadges={setBadges}/>
                                }
                                {
                                    tab === TabTypes.Notifications && <Notifications setBadges={setBadges}/>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
        </React.Fragment>
    );
};