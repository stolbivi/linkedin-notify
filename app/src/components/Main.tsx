import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, IsLoggedResponse, MESSAGE_ID} from "../global";
import {Notifications} from "./Notifications";

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
        <div className="conversations-tab">
            {isLogged === false
                ? <div onClick={signIn} className="w-100">Sign in</div>
                :
                <div className="w-100">
                    {/*<Conversations/>*/}
                    <Notifications/>
                </div>
            }
        </div>
    );
};