import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, IsLoggedResponse, MESSAGE_ID} from "../global";
// import {Conversations} from "./Conversations";
import {Notifications} from "./Notifications";
import {Conversations} from "./Conversations";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const [isLogged, setIsLogged] = useState(false);

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
        <div className="p-5 d-flex flex-column justify-content-center align-items-center">
            {isLogged === false
                ? <div onClick={signIn} style={{cursor: "pointer"}}>Sign in</div>
                :
                <div>
                    <Conversations/>
                    <Notifications/>
                </div>
            }
        </div>
    );
};