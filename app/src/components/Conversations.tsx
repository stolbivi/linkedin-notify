import React, {useEffect, useState} from "react";
import {AppMessageType, ConversationsResponse, IAppRequest, MESSAGE_ID} from "../global";
import {Messages} from "@stolbivi/pirojok";

type Props = {};

export const Conversations: React.FC<Props> = ({}) => {

    const [conversations, setConversations] = useState([]);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, ConversationsResponse>(MESSAGE_ID, {type: AppMessageType.Conversations},
            (r) => {
                setConversations(r.conversations);
            }).then(/* nada */)
    }, []);

    return (
        <div className="p-5 d-flex flex-column justify-content-center align-items-center">
            {JSON.stringify(conversations)}
        </div>
    );
};