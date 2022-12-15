import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, IsLoggedResponse, MESSAGE_ID} from "../global";
import {Notifications} from "./Notifications";
import {Tabs, TabTypes} from "./Tabs";
import {Conversations} from "./Conversations";
import {Invitations} from "./Invitations";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const [isLogged, setIsLogged] = useState(false);
    const [tab, setTab] = useState(0);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, IsLoggedResponse>(MESSAGE_ID, {type: AppMessageType.IsLogged},
            (r) => setIsLogged(r.isLogged))
            .then(/* nada */)
    }, []);

    const signIn = () => {
        return messages.runtimeMessage<IAppRequest, IsLoggedResponse>(MESSAGE_ID, {type: AppMessageType.SignIn});
    }

    return (
        <div className="container">
            {isLogged === false
                ? <div onClick={signIn} className="w-100">Sign in</div>
                :
                <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                    <Tabs onTab={setTab}/>
                    <div className="scroll">
                        {
                            tab === TabTypes.MyNetwork && <Invitations/>
                        }
                        {
                            tab === TabTypes.Messages && <Conversations/>
                        }
                        {
                            tab === TabTypes.Notifications && <Notifications/>
                        }
                    </div>
                </div>
            }
        </div>
    );
};