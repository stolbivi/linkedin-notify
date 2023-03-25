import React, {useEffect, useRef, useState} from "react";
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
    const [originalConversations, setOriginalConversations] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [details, setDetails] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [searchText, setSearchText] = useState("");
    const messages = new MessagesV2(VERBOSE);
    const convMsgs = useRef([]);

    const getDetails = (conversation: any) => {
        setCompleted(false);
        return messages.request(getConversationDetails(conversation.entityUrn))
            .then((r) => {
                const resp = r.map((res) => {
                    return {
                        ...res,
                        syncToken: conversation.syncToken,
                        convEntityUrn: conversation.entityUrn,
                        participants: conversation.participants
                    };
                });
                setDetails(resp);
                setShowDetails(true);
                setCompleted(true);
            })
    }

    useEffect(() => {
        setTimeout(() => {
            const convRegex = /(?<=,2-)[^)]+/;
            conversations.map(conv => {
                const msgs = convMsgs.current.filter(msgObj => msgObj.urn.split(':').pop().replace(/^2-/, '') === conv.entityUrn.match(convRegex)[0]);
                conv.messages = msgs;
            })
        },1000);
    },[conversations])

    useEffect(() => {
        let filteredData = [];
        if(searchText && searchText !== '') {
         filteredData = conversations.filter(conversation => {
             return conversation.conversationParticipants.some((participant: { distance: string; firstName: string; }) => participant?.distance !== "SELF"
                 && participant?.firstName?.toLowerCase()?.includes(searchText?.toLowerCase()));
         });
        }
        if(filteredData && filteredData.length > 0) {
            setConversations(filteredData);
        } else {
            setConversations(originalConversations);
        }
    },[searchText]);

    const onReply = (conversation: any, replyText: any) => {
        const regex = /urn:li:msg_message:\(urn:li:fsd_profile:([^,]+)/;
        const matches = conversation.entityUrn.match(regex);
        if (matches && matches[1]) {
            const senderId = matches[1];
            const recipientObj = conversation.participants.filter((participant: { urn: any; }) => participant.urn !== senderId)[0];
            messages.request(postReply({recipientId: recipientObj.urn, messageBody: replyText?.current?.value}))
                .then((_) => {
                    replyText.current.value = '';
                    getDetails({entityUrn: conversation.convEntityUrn, syncToken: conversation.syncToken})
                });
        }
    }

    useEffect(() => {
        messages.request(getIsUnlocked())
            .then((payload) => {
                console.log('Unlocked', payload);
                setUnlocked(payload.isUnlocked);
                return messages.request(getConversations())
                    .then((conversations) => {
                        console.log(conversations)
                        setConversations(conversations);
                        setOriginalConversations(conversations);
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
                    <div className="card-holder">
                        <input type="text" className="search-input" placeholder="Search messages or dialogs"
                               onChange={(event) => setSearchText(event.target.value)} />
                    </div>
                    {
                        conversations.map((c: any, i: number) =>
                            (<ConversationCard conversation={c} key={i}
                                               getDetails={getDetails}
                                               setBadges={setBadges}
                                               convMsgs={convMsgs}/>)
                        )
                    }
                </div>
                <div className="w-100" hidden={!showDetails}>
                    <ConversationDetails details={details} setShowDetails={setShowDetails} onReply={onReply}/>
                </div>
            </div>
        </div>
    );
};