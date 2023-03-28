import React, {useEffect, useRef, useState} from "react";
import {ConversationMessageCard} from "./ConversationMessageCard";
import "./ConversationDetails.scss";

type Props = {
    details: Array<any>
    setShowDetails: (show: boolean) => void
    onReply: any,
    selectedRcpnt: any,
    firstElemRef:any,
    lastElemRef: any
};

export const ConversationDetails: React.FC<Props> = ({details, setShowDetails, onReply, selectedRcpnt, firstElemRef, lastElemRef}) => {

    const [conversationMessages, setConversationMessages] = useState([]);
    const replyText = useRef();
    const cardHolderRef = useRef();
    const [selfMsg, setSelfMsg] = useState({});

    useEffect(() => {
        setSelfMsg(details.filter(conversation => conversation?.sender?.distance === "SELF")[0]);
        setConversationMessages(details.map((m: any, i: number) =>
            (<ConversationMessageCard message={m} key={i} onReply={onReply} currentCount={i} totalCount={details.length} firstElemRef={firstElemRef} lastElemRef={lastElemRef}/>)
        ));
    }, [details]);

    const onBack = () => {
        setShowDetails(false);
    }

    return (
        <div className="details" ref={cardHolderRef}>
            <div className="detail-header">
                <div className="details-back" onClick={onBack}>
                    <svg width="700pt" height="700pt" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg"  style={{padding: "7px"}}>
                        <path opacity="1" d="M16 6H1M1 6L6 1M1 6L6 11" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                        <svg className="svg-style" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


