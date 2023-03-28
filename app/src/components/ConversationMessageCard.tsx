import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {formatDate} from "../services/UIHelpers";
import "./ConversationMessageCard.scss";
import {openUrl} from "../actions";

type Props = {
    message: any,
    onReply: () => void,
    currentCount: number,
    totalCount: number,
    lastElemRef: any
};

export const ConversationMessageCard: React.FC<Props> = ({message, onReply, currentCount ,totalCount,lastElemRef}) => {

    const [picture, setPicture] = useState("");
    const [deliveredAt, setDeliveredAt] = useState("");

    const messages = new MessagesV2(true);

    useEffect(() => {
        if (message.sender?.profilePicture?.rootUrl) {
            setPicture(message.sender?.profilePicture?.rootUrl + message.sender?.profilePicture?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
        setDeliveredAt(formatDate(new Date(message?.deliveredAt)));
    }, [message]);

    const onOpenProfile = () => {
        return messages.request(openUrl(message?.sender?.profileUrl));
    }

    return (
        <div className="card-holder">
            <div className="message-card" style={{overflowWrap:"anywhere", ...(currentCount === totalCount-1 && { paddingBottom: "90px" })}} >
                <div className="card-pre-section">
                    <div className="card-image" onClick={onOpenProfile} ref={currentCount === totalCount - 1 ? lastElemRef : null}>
                        <img src={picture}/>
                    </div>
                </div>
                <div className="w-100 d-flex flex-column align-items-start">
                    <div className="w-100 d-flex flex-row align-items-center">
                        <div className="card-title"
                             onClick={onOpenProfile}>{message.sender?.firstName} {message.sender?.lastName}</div>
                        <div className="card-timestamp message-time-stamp">{deliveredAt}</div>
                    </div>
                    <div className={"card-message" + (message.openOriginal ? " message-no-media" : "")}
                         onClick={message.openOriginal ? onReply : () => {
                         }}>
                        {message.text}
                    </div>
                </div>
            </div>
        </div>
    );
};