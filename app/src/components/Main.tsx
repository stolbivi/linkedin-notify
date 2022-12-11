import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, IsLoggedResponse, MESSAGE_ID} from "../global";

type Props = {};

export const Main: React.FC<Props> = ({}) => {

    const [isLogged, setIsLogged] = useState(false);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, IsLoggedResponse>(MESSAGE_ID, {type: AppMessageType.isLogged}, (response) => {
            console.debug('Response', response);
            setIsLogged(response.isLogged);
        }).then(/* nada */)
    }, []);

    const signIn = () => {
        return messages.runtimeMessage<IAppRequest, IsLoggedResponse>(MESSAGE_ID, {type: AppMessageType.signIn});
    }

    return (
        <div className="p-5 d-flex flex-column justify-content-center align-items-center">
            {isLogged
                ? <div>You are logged in!</div>
                : <div onClick={signIn} style={{cursor: "pointer"}}>Sign in</div>
            }
        </div>
    );
};