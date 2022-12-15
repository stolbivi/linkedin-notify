import React, {useEffect, useState} from "react";
import {AppMessageType, ConversationsResponse, IAppRequest, MESSAGE_ID} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {ConversationCard} from "./ConversationCard";
import {Loader} from "./Loader";

type Props = {};

export const Conversations: React.FC<Props> = ({}) => {

    const [conversations, setConversations] = useState([]);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, ConversationsResponse>(MESSAGE_ID, {type: AppMessageType.Conversations},
            (r) => {
                setConversations(r.conversations.map((c: any) =>
                    (<ConversationCard conversation={c}></ConversationCard>)
                ));
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!(conversations?.length > 0)}/>
            {conversations}
        </div>
    );
};