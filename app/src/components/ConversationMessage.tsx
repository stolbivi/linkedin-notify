import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, MESSAGE_ID} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {formatDate} from "../services/UIHelpers";

type Props = {
    message: any,
    onReply: () => void
};

export const ConversationMessage: React.FC<Props> = ({message, onReply}) => {

    const [picture, setPicture] = useState("");
    const [deliveredAt, setDeliveredAt] = useState("");

    const messages = new Messages(MESSAGE_ID, true);

    useEffect(() => {
        if (message.sender?.profilePicture?.rootUrl) {
            setPicture(message.sender?.profilePicture?.rootUrl + message.sender?.profilePicture?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
        setDeliveredAt(formatDate(new Date(message?.deliveredAt)));
    }, [message]);

    const onOpenProfile = () => {
        return messages.request<IAppRequest, any>({
            type: AppMessageType.OpenURL,
            payload: {url: message?.sender?.profileUrl}
        });
    }

    return (
        <div className="message-card">
            <div className="message-image" onClick={onOpenProfile}>
                {message.showPicture && <img src={picture}/>}
                {!message.showPicture && <div className="image-space"></div>}
            </div>
            <div className="w-100 d-flex flex-column align-items-start">
                <div className="w-100 d-flex flex-row align-items-center">
                    <div className="card-title"
                         onClick={onOpenProfile}>{message.sender?.firstName} {message.sender?.lastName}</div>
                    <div className="message-timestamp"> • {deliveredAt}</div>
                </div>
                <div className={"message-detail" + (message.openOriginal ? " message-no-media" : "")}
                     onClick={message.openOriginal ? onReply : () => {
                     }}>
                    {message.text}
                </div>
            </div>
        </div>
    );
};