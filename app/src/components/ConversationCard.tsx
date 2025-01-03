import React, {useEffect, useState} from "react";
import {Badges} from "../global";
import {MessagesV2} from "@stolbivi/pirojok";
import "./ConversationCard.scss";
import {conversationAck, getBadges, openUrl} from "../actions";
import {formatDate} from "../services/UIHelpers";

type Props = {
    conversation: any
    getDetails: (conversation: any) => void
    setBadges: (badges: Badges) => void
    convMsgs: any
};

export const ConversationCard: React.FC<Props> = ({conversation, getDetails, setBadges, convMsgs}) => {

    const [participant, setParticipant] = useState({} as any);
    const [message,setMessage] = useState({} as any);
    const [picture, setPicture] = useState("");
    const [deliveredAt,setDeliveredAt] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const messages = new MessagesV2(true);

    const onOpenProfile = () => {
        return messages.request(openUrl(participant.profileUrl));
    }

    const onOpenMessage = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (unreadCount > 0) {
            messages.request(conversationAck(conversation.entityUrn))
                .then(_ => {
                    setUnreadCount(0);
                    messages.request(getBadges())
                        .then((badges) => setBadges(badges));
                });
        }
        getDetails({entityUrn: conversation.entityUrn, syncToken: conversation.syncToken, participants: conversation.conversationParticipants});
    }

    useEffect(() => {
        const p = conversation.conversationParticipants.find((p: any) => p.distance !== "SELF");
        setParticipant(p);
        if (p.profilePicture.rootUrl) {
            setPicture(p.profilePicture?.rootUrl + p.profilePicture?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
        const m = conversation.messages.pop();
        setMessage(m);
        setDeliveredAt(formatDate(new Date(m?.deliveredAt)));
        setUnreadCount(conversation.unreadCount);
    }, [conversation]);

    useEffect(() => {
        if(message && Object.keys(message).length > 0) {
            convMsgs?.current?.push(message);
        }
    },[message]);

    return (
        <div className="card-holder">
            <div className={"conversation-card " + (unreadCount > 0 ? " has-unread" : "")}
                 onClick={(e) => onOpenMessage(e)} style={{overflowWrap:"anywhere"}}>
                <div className="card-pre-section">
                    <div className="card-image" onClick={onOpenProfile}>
                        {unreadCount > 0 &&
                            <div className="card-badge"/>
                        }
                        <img src={picture}/>
                    </div>
                </div>
                <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                    <div className="w-100 d-flex flex-row">
                        <div className="card-title" onClick={onOpenProfile}>{participant?.firstName} {participant.lastName}</div>
                        <div className="card-timestamp message-time-stamp">{deliveredAt}</div>
                    </div>
                    <div className="w-100 d-flex flex-row align-items-end">
                        <div className="card-message card-message-overview">{message?.body}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};