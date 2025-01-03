import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {LINKEDIN_DOMAIN, VERBOSE} from "../global";
import {formatDate} from "../services/UIHelpers";
import "./NotificationCard.scss";
import {markNotificationRead, openUrl} from "../actions";

type Props = {
    notification: any
};

export const NotificationCard: React.FC<Props> = ({notification}) => {

    const [picture, setPicture] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [cardAction, setCardAction] = useState("");
    const [actions, setActions] = useState([]);

    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        if (notification.headerImage?.rootUrl) {
            setPicture(notification.headerImage?.rootUrl + notification.headerImage?.artifacts?.pop()?.path);
        }
        if (notification.headerImage?.url) {
            setPicture(notification.headerImage?.url);
        }
        setPublishedAt(notification.publishedAt);
        setPublishedAt(formatDate(new Date(notification.publishedAt)));
        setCardAction(notification.cardAction);
        setActions(notification.actions.map((a: any, i: number) =>
            (<div className="notification-action"
                  onClick={(e) => onAction(a.actionTarget, e)}
                  key={i}>{a.displayText}</div>)
        ));
    }, [notification]);

    const markRead = () => messages.request(markNotificationRead(notification.entityUrn));

    const onAction = (actionTarget: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (actionTarget && actionTarget.length > 0) {
            e.stopPropagation();
            markRead().then(/* nada */);
            return messages.request(openUrl(`https://${LINKEDIN_DOMAIN}/` + actionTarget));
        }
    }

    const onCardAction = () => {
        markRead().then(/* nada */);
        return messages.request(openUrl(`https://${LINKEDIN_DOMAIN}/` + cardAction));
    }

    return (
        <div className="card-holder">
            <div className={"notification-card " + (notification.read === false ? " has-unread" : "")}
                 onClick={onCardAction}>
                <div className="card-pre-section">
                    <div className="card-timestamp">{publishedAt}</div>
                    {picture.length > 0 && <div className="card-image">
                        <img src={picture}/>
                    </div>}
                </div>
                <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                    <div className="w-100 d-flex flex-row">
                        <div className="card-message">{notification.headline}</div>
                    </div>
                    <div className="w-100 d-flex flex-row justify-content-between align-items-center pt-1">
                        {actions}
                    </div>
                </div>
            </div>
        </div>
    );
};