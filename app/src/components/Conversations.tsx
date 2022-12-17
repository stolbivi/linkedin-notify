import React, {useEffect, useState} from "react";
import {AppMessageType, ConversationsResponse, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {ConversationCard} from "./ConversationCard";
import {Loader} from "./Loader";

type Props = {};

export const Conversations: React.FC<Props> = ({}) => {

    const [conversations, setConversations] = useState([]);
    const [completed, setCompleted] = useState(false);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        messages.request<IAppRequest, ConversationsResponse>({type: AppMessageType.Conversations},
            (r) => {
                setConversations(r.conversations.map((c: any, i: number) =>
                    (<ConversationCard conversation={c} key={i}></ConversationCard>)
                ));
                setCompleted(true);
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed}/>
            {completed && conversations.length == 0 && <div className="no-data">No data</div>}
            {conversations}
        </div>
    );
};