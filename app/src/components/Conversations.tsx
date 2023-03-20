import React, {useEffect, useState} from "react";
import {Badges, Conversation, VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {ConversationCard} from "./ConversationCard";
import {Loader} from "./Loader";
import {ConversationDetails} from "./ConversationDetails";
import {Premium} from "./Premium";
import "./Conversations.scss";
import "./NoData.scss";
import {getConversationDetails, getConversations, getIsUnlocked} from "../actions";

type Props = {
    setBadges: (badges: Badges) => void
};

export const Conversations: React.FC<Props> = ({setBadges}) => {

    const [conversations, setConversations] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [details, setDetails] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [unlocked, setUnlocked] = useState(false);

    const messages = new MessagesV2(VERBOSE);

    const getDetails = (conversation: Conversation) => {
        setCompleted(false);
        return messages.request(getConversationDetails(conversation.entityUrn))
            .then((r) => {
                setDetails(r);
                setShowDetails(true);
                setCompleted(true);
            })
    }

    useEffect(() => {
        console.log('Checking');
        messages.request(getIsUnlocked())
            .then((payload) => {
                console.log('Unlocked', payload);
                setUnlocked(payload.isUnlocked);
                return messages.request(getConversations())
                    .then((conversations) => {
                        console.log('Conversations', conversations);
                        setConversations(conversations.map((c: any, i: number) =>
                            (<ConversationCard conversation={c} key={i}
                                               getDetails={getDetails}
                                               setBadges={setBadges}></ConversationCard>)
                        ));
                        setCompleted(true);
                    });
            })
    }, []);

    return (
        <div className="w-100 position-relative">
            <Loader show={!completed} className="p-5"/>
            <div hidden={!completed || unlocked}>
                <Premium setUnlocked={setUnlocked}/>
            </div>
            <div className={"w-100" + (!unlocked ? " premium-blur" : "")} hidden={!completed}>
                {conversations.length == 0 && <div className="no-data">No conversations</div>}
                <div className="w-100" hidden={showDetails}>{conversations}</div>
                <div className="w-100" hidden={!showDetails}>
                    <ConversationDetails details={details} setShowDetails={setShowDetails}/>
                </div>
            </div>
        </div>
    );
};