import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, MESSAGE_ID, NotificationsResponse} from "../global";
import {Messages} from "@stolbivi/pirojok";

type Props = {};

export const Notifications: React.FC<Props> = ({}) => {

    const [conversations, setConversations] = useState([]);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, NotificationsResponse>(MESSAGE_ID, {type: AppMessageType.Notifications},
            (r) => {
                setConversations(r.notifications);
            }).then(/* nada */)
    }, []);

    return (
        <div className="p-5 d-flex flex-column justify-content-center align-items-center">
            {JSON.stringify(conversations)}
        </div>
    );
};