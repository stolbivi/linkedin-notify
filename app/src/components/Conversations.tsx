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
    const [selectedRcpnt, setSelectedRcpnt] = useState({});
    const searchInput = useRef();
    const firstElemRef = useRef();
    const lastElemRef = useRef();

    const getDetails = (conversation: any) => {
        setSelectedRcpnt(conversation.participants.find((p: any) => p.distance !== "SELF"));
        setCompleted(false);
        return messages.request(getConversationDetails(conversation.entityUrn))
            .then((r) => {
                const resp = r.map(res => {
                    const resCopy = JSON.parse(JSON.stringify(res));
                    const conversationCopy = JSON.parse(JSON.stringify(conversation));
                    return {
                        ...resCopy,
                        syncToken: conversationCopy.syncToken,
                        convEntityUrn: conversationCopy.entityUrn,
                        participants: conversationCopy.participants
                    };
                });
                setDetails(JSON.parse(JSON.stringify(resp)));
                setShowDetails(true);
                setCompleted(true);
            })
    }

    useEffect(() => {
        messages.request(getIsUnlocked())
            .then((payload) => {
                console.log('Unlocked', payload);
                setUnlocked(true);
                // @ts-ignore
                searchInput?.current?.scrollIntoView({ behavior: 'smooth' });
                // @ts-ignore
                searchInput?.current?.focus();
                return messages.request(getConversations())
                    .then((conversations) => {
                        setConversations(JSON.parse(JSON.stringify(conversations)));
                        setCompleted(true);
                    });
            })

    }, [showDetails]);

    useEffect(() => {
        if(originalConversations.length === 0) {
            setTimeout(() => {
                const convRegex = /(?<=,2-)[^)]+/;
                conversations.map(conv => {
                    const msgs = convMsgs.current.filter(msgObj => msgObj.urn.split(':').pop().replace(/^2-/, '') === conv.entityUrn.match(convRegex)[0]);
                    conv.messages = JSON.parse(JSON.stringify(msgs));
                });
                setOriginalConversations(JSON.parse(JSON.stringify(conversations)));
            },1000);
        }
    },[conversations]);

    useEffect(() => {
        if(searchText && searchText !== '') {
            const filteredData = originalConversations?.filter(conversation => {
                const participants = conversation.conversationParticipants || [];
                return participants.some((participant: { firstName: string; lastName: string; distance: string; }) => {
                    const firstName = participant.firstName || '';
                    const lastName = participant.lastName || '';
                    const fullName = `${firstName} ${lastName}`.toLowerCase();
                    const search = searchText?.toLowerCase();
                    const isMatch = fullName.includes(search);
                    const isSelf = participant.distance === 'SELF';
                    return !isSelf && isMatch;
                });
            });
            setConversations(JSON.parse(JSON.stringify(filteredData)));
        } else {
            setConversations(JSON.parse(JSON.stringify(originalConversations)));
        }
    },[searchText]);

    const onReply = (conversation: any, replyText: any, selfMsg: any) => {
        selfMsg.text = replyText?.current?.value;
        selfMsg.deliveredAt = new Date().getTime();
        const regex = /urn:li:msg_message:\(urn:li:fsd_profile:([^,]+)/;
        const matches = conversation.entityUrn.match(regex);
        if (matches && matches[1]) {
            const senderId = matches[1];
            const recipientObj = conversation.participants.filter((participant: { urn: any; }) => participant.urn !== senderId)[0];
            messages.request(postReply({recipientId: recipientObj.urn, messageBody: replyText?.current?.value}))
                .then((_) => {
                    replyText.current.value = '';
                    setDetails([...details,JSON.parse(JSON.stringify(selfMsg))]);
                    setTimeout(() => {
                        // @ts-ignore
                        lastElemRef?.current?.scrollIntoView({ behavior: 'smooth' });
                        // @ts-ignore
                        lastElemRef?.current?.focus();

                    }, 200);
                });
        }
    }

    return (
        <div className="w-100 position-relative">
            <Loader show={!completed} className="p-5" heightValue="600px"/>
            <div hidden={!completed || unlocked}>
                <Premium setUnlocked={setUnlocked}/>
            </div>
            <div className={"w-100" + (!unlocked ? " premium-blur" : "")} hidden={!completed}>
                <div className="w-100" hidden={showDetails}>
                    <div className="card-holder" style={{marginBottom: "3.0rem"}}>
                        <input type="text" className="search-input" placeholder="Search messages" ref={searchInput}
                               onChange={(event) => setSearchText(event.target.value)} />
                    </div>
                    {conversations.length == 0 && <div className="no-data">No conversations</div>}
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
                    <ConversationDetails details={details} setShowDetails={setShowDetails} onReply={onReply} selectedRcpnt={selectedRcpnt} firstElemRef={firstElemRef} lastElemRef={lastElemRef}/>
                </div>
            </div>
        </div>
    );
};