import React, {useEffect, useState} from "react";
import {AppMessageType, Badges, ConversationsResponse, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {ConversationCard} from "./ConversationCard";
import {Loader} from "./Loader";
import {ConversationDetails} from "./ConversationDetails";

type Props = {
    setBadges: (badges: Badges) => void
};

export const Conversations: React.FC<Props> = ({setBadges}) => {

    const [conversations, setConversations] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [details, setDetails] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    const getDetails = (conversation: any) => {
        setCompleted(false);
        return messages.request<IAppRequest, any>({
            type: AppMessageType.ConversationDetails,
            payload: conversation
        }, (r) => {
            setDetails(r.details);
            setShowDetails(true);
            setCompleted(true);
        });
    }

    useEffect(() => {
        messages.request<IAppRequest, ConversationsResponse>({type: AppMessageType.Conversations},
            (r) => {
                setConversations(r.conversations.map((c: any, i: number) =>
                    (<ConversationCard conversation={c} key={i} getDetails={getDetails}
                                       setBadges={setBadges}></ConversationCard>)
                ));
                setCompleted(true);
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!completed}/>
            {completed && conversations.length == 0 && <div className="no-data">No data</div>}
            {completed && !showDetails && conversations}
            {completed && showDetails && <ConversationDetails details={details} setShowDetails={setShowDetails}/>}
        </div>
    );
};