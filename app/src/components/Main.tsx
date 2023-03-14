import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, Badges, BadgesResponse, IAppRequest, IsLoggedResponse, MESSAGE_ID, VERBOSE} from "../global";
import {Notifications} from "./Notifications";
import {Tabs, TabTypes} from "./Tabs";
import {Conversations} from "./Conversations";
import {Invitations} from "./Invitations";
import {SignIn} from "./SignIn";
import "./Main.scss";
import {Logo} from "../icons/Logo";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const [badges, setBadges] = useState({} as Badges);
    const [isLogged, setIsLogged] = useState(false);
    const [tab, setTab] = useState(0);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        messages.request<IAppRequest, IsLoggedResponse>({type: AppMessageType.IsLogged},
            (r) => setIsLogged(r.isLogged))
            .then(/* nada */);
        messages.request<IAppRequest, BadgesResponse>({type: AppMessageType.Badges},
            (r) => setBadges(r.badges))
            .then(/* nada */)
    }, []);

    return (
        <div className="container">
            {isLogged === false
                ? <SignIn/>
                : <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                    <div className="header">
                        <div className="title-row">
                            <div className="title">
                                <Logo/>
                                <span>LinkedIn Manager</span>
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
    );
};