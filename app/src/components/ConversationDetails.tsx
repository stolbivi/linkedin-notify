import React, {useEffect, useState} from "react";
import {AppMessageType, DOMAIN, IAppRequest, MESSAGE_ID} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {ConversationMessage} from "./ConversationMessage";

type Props = {
    details: Array<any>
    setShowDetails: (show: boolean) => void
};

export const ConversationDetails: React.FC<Props> = ({details, setShowDetails}) => {

    const [conversationMessages, setConversationMessages] = useState([]);

    const messages = new Messages(MESSAGE_ID, true);

    useEffect(() => {
        setConversationMessages(details.map((m: any, i: number) =>
            (<ConversationMessage message={m} key={i} onReply={onReply}/>)
        ));
    }, [details]);

    const onBack = () => {
        setShowDetails(false);
    }

    const onReply = () => {
        const url = details.pop().backendConversationUrn.split(":").pop();
        return messages.request<IAppRequest, any>({
            type: AppMessageType.OpenURL,
            payload: {url: `https://${DOMAIN}/messaging/thread/` + url}
        });
    }

    return (
        <div className="details">
            <div className="detail-header">
                <div className="details-back" onClick={onBack}>
                    <svg width="700pt" height="700pt" version="1.1" viewBox="200 125 300 300" fill="currentColor">
                        <g>
                            <path
                                d="m419.44 358.4c1.6797 8.9609-3.3594 12.879-11.199 7.8398l-128.24-77.277c-7.8398-5.0391-7.8398-12.879 0-17.359l128.24-77.84c7.8398-5.0391 12.879-1.1211 11.199 7.8398v1.6797c-7.2812 42.559-7.2812 112 0 154.56z"/>
                        </g>
                    </svg>
                </div>
                <div className="details-reply" onClick={onReply}>Reply</div>
            </div>
            {conversationMessages}
        </div>
    );
};