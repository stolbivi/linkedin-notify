import React, {useEffect, useState} from "react";

type Props = {
    conversation: any
};


export const ConversationCard: React.FC<Props> = ({conversation}) => {

    const [participant, setParticipant] = useState({} as any);
    const [message, setMessage] = useState({} as any);
    const [picture, setPicture] = useState("");
    const [deliveredAt, setDeliveredAt] = useState("");

    const isToday = (someDate: Date) => {
        const today = new Date()
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()
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
        const timestamp = new Date(m?.deliveredAt);
        setDeliveredAt(isToday(timestamp) ? timestamp.toLocaleTimeString() : timestamp.toLocaleDateString());
    }, []);

    return (
        <div className={"conversation-card" + (conversation.unreadCount > 0 ? " has-unread" : "")}>
            <div className="card-image">
                <img src={picture}/>
            </div>
            <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                <div className="w-100 d-flex flex-row">
                    <div className="card-title">{participant?.firstName} {participant.lastName}</div>
                    <div className="card-timestamp">{deliveredAt}</div>
                </div>
                <div className="w-100 d-flex flex-row align-items-end">
                    <div className="card-message">{message?.body}</div>
                    {conversation.unreadCount > 0 &&
                    <div className="card-badge">{conversation.unreadCount}</div>
                    }
                </div>
            </div>
        </div>
    );
};