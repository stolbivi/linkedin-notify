import React, {useEffect, useRef, useState} from "react";
import {ConversationMessageCard} from "./ConversationMessageCard";
import "./ConversationDetails.scss";

type Props = {
    details: Array<any>
    setShowDetails: (show: boolean) => void
    onReply: any
};

export const ConversationDetails: React.FC<Props> = ({details, setShowDetails, onReply}) => {

    const [conversationMessages, setConversationMessages] = useState([]);
    const replyText = useRef();

    useEffect(() => {
        setConversationMessages(details.map((m: any, i: number) =>
            (<ConversationMessageCard message={m} key={i} onReply={onReply}/>)
        ));
    }, [details]);

    useEffect(() => {
        setTimeout(() => {
            // @ts-ignore
            replyText?.current?.scrollIntoView({ behavior: 'smooth' });
            // @ts-ignore
            replyText?.current?.focus();
        }, 100);
    },[conversationMessages]);

    const onBack = () => {
        setShowDetails(false);
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
            </div>
            {conversationMessages}
            <div>
                <input type="text" className="w-75 m-4" ref={replyText}/>
                <button className="btn btn-primary" onClick={()=>onReply(details[0], replyText)}>Reply</button>
            </div>
        </div>
    );
};