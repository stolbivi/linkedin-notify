import React, {useEffect, useState} from "react";
import {Badges, VERBOSE} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import {ConversationCard} from "./ConversationCard";
import {Loader} from "./Loader";
import {ConversationDetails} from "./ConversationDetails";
import {Premium} from "./Premium";
import "./Conversations.scss";
import "./NoData.scss";
import {getConversationDetails, getConversations, getIsUnlocked, postReply} from "../actions";

type Props = {
    setBadges: (badges: Badges) => void
};

export const Conversations: React.FC<Props> = ({setBadges}) => {

    const [conversations, setConversations] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [details, setDetails] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [unlocked, setUnlocked] = useState(true);
    const [searchText, setSearchText] = useState("");
    const messages = new MessagesV2(VERBOSE);

    const getDetails = (conversation: any) => {
        setCompleted(false);
        return messages.request(getConversationDetails(conversation.entityUrn))
            .then((r) => {
                const resp = r.map((res) => {
                    return {
                        ...res,
                        syncToken: conversation.syncToken,
                        convEntityUrn: conversation.entityUrn
                    };
                });
                setDetails(resp);
                setShowDetails(true);
                setCompleted(true);
            })
    }

    const onReply = (conversation: any, replyText: any) => {
        //const recipientProfileId = conversation?.sender?.profileUrl?.split("/")[4];
        messages.request(postReply({recipientId: "ACoAACpxmjEBaxXoPxBqoKsBWzwHGbRVGlrFrpo", messageBody: replyText.current.value}))
            .then((_) => {
                getDetails({entityUrn: conversation.convEntityUrn, syncToken: conversation.syncToken})
            });
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    }

    useEffect(() => {
        messages.request(getIsUnlocked())
            .then((payload) => {
                console.log('Unlocked', payload);
                setUnlocked(true);
                return messages.request(getConversations())
                    .then((conversations) => {
                        console.log('Conversations', conversations);
                        setConversations(conversations.map((c: any, i: number) =>
                            (<ConversationCard conversation={c} key={i}
                                               getDetails={getDetails}
                                               setBadges={setBadges}/>)
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
                <div className="w-100" hidden={showDetails}>
                    <div className="search-input-wrapper">
                        <input type="text" className="search-input" placeholder="Search messages or dialogs" value={searchText} onChange={handleSearch} />
                    </div>
                    {conversations}
                </div>
                <div className="w-100" hidden={!showDetails}>
                    <ConversationDetails details={details} setShowDetails={setShowDetails} onReply={onReply}/>
                </div>
            </div>
        </div>
    );
};