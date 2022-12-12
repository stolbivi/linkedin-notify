import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, IsLoggedResponse, MESSAGE_ID} from "../global";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const [isLogged, setIsLogged] = useState(false);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, IsLoggedResponse>(MESSAGE_ID, {type: AppMessageType.isLogged},
            (r) => {
                console.debug('Response', r);
                setIsLogged(r.isLogged);
            }).then(/* nada */)
    }, []);

    const signIn = () => {
        return messages.runtimeMessage<IAppRequest, IsLoggedResponse>(MESSAGE_ID, {type: AppMessageType.signIn});
    }

    return (
        <div className="p-5 d-flex flex-column justify-content-center align-items-center">
            {isLogged === true
                ? <div>You are logged in!</div>
                : <div onClick={signIn} style={{cursor: "pointer"}}>Sign in</div>
            }
        </div>
    );
};