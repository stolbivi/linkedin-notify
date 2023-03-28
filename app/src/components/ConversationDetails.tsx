import React, {useEffect, useRef, useState} from "react";
import {ConversationMessageCard} from "./ConversationMessageCard";
import "./ConversationDetails.scss";

type Props = {
    details: Array<any>
    setShowDetails: (show: boolean) => void
    onReply: any,
    selectedRcpnt: any
};

export const ConversationDetails: React.FC<Props> = ({details, setShowDetails, onReply, selectedRcpnt}) => {

    const [conversationMessages, setConversationMessages] = useState([]);
    const replyText = useRef();
    const [selfMsg, setSelfMsg] = useState({});

    useEffect(() => {
        console.log(selectedRcpnt)
        setSelfMsg(details.filter(conversation => conversation?.sender?.distance === "SELF")[0]);
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
                    <svg width="700pt" height="700pt" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.5" d="M16 6H1M1 6L6 1M1 6L6 11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div className="reply-text-name">
                        {selectedRcpnt.firstName}  {selectedRcpnt.lastName}
                    </div>
                </div>
            </div>
            {conversationMessages}
            <div>
                <div className="reply-container">
                  <textarea
                      ref={replyText}
                      className="reply-textarea"
                      placeholder="Write a message..."
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              onReply(details[0], replyText, selfMsg);
                          } else if (e.key === 'Enter' && e.shiftKey) {
                              const target = e.target as HTMLTextAreaElement;
                              target.value += "\n";
                          }
                      }}
                  />
                  <button className="btn btn-sm btn-primary reply-button" onClick={() => onReply(details[0], replyText, selfMsg)}>
                     <i className="fas fa-arrow-up"></i>
                  </button>
                </div>
            </div>
        </div>
    );
};


