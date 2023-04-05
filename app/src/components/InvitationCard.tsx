import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {LINKEDIN_DOMAIN, VERBOSE} from "../global";
import {formatDate} from "../services/UIHelpers";
import "./InvitationCard.scss";
import {handleInvitation, handleNewsLetterInvitation, openUrl} from "../actions";

type Props = {
    invitation: any
};

function isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export const InvitationCard: React.FC<Props> = ({invitation}) => {

    const [picture, setPicture] = useState("");
    const [sentTime, setSentTime] = useState("");
    const [id, setId] = useState("");
    const [hideActions, setHideActions] = useState(false);

    const messages = new MessagesV2(VERBOSE);

    useEffect(() => {
        if (invitation?.fromMember?.picture?.rootUrl) {
            setPicture(invitation?.fromMember?.picture?.rootUrl + invitation?.fromMember?.picture?.artifacts?.pop()?.path);
        } else if (invitation?.genericInvitationView?.logo?.rootUrl) {
            setPicture(invitation?.genericInvitationView?.logo?.rootUrl + invitation?.genericInvitationView?.logo?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
        const sentTimeValue = invitation.sentTime ? invitation.sentTime : invitation.genericInvitationView.sentTime;
        setSentTime(isNumeric(sentTimeValue) ? formatDate(new Date(sentTimeValue)) : sentTimeValue);
        setId(invitation.urn.split(":").pop());
    }, [invitation]);

    const onIgnore = () => {
        if(id.indexOf('_') !== -1) {
            const filteredInvitationId = id.slice(0, id.indexOf('_') );
            return messages.request(handleNewsLetterInvitation({id: filteredInvitationId, sharedSecret: invitation.sharedSecret, action: "ignore"}))
                .then(_ => setHideActions(true));
        }
        return messages.request(handleInvitation({id: id, sharedSecret: invitation.sharedSecret, action: "ignore"}))
            .then(_ => setHideActions(true));
    }

    const onAccept = () => {
        if(id.indexOf('_') !== -1) {
            const filteredInvitationId = id.slice(0, id.indexOf('_') );
            return messages.request(handleNewsLetterInvitation({id: filteredInvitationId, sharedSecret: invitation.sharedSecret, action: "accept"}))
                .then(_ => setHideActions(true));
        }
        return messages.request(handleInvitation({id: id, sharedSecret: invitation.sharedSecret, action: "accept"}))
            .then(_ => setHideActions(true));
    }

    const onOpenProfile = () => {
        return messages.request(openUrl(`https://${LINKEDIN_DOMAIN}/in/` + invitation.fromMember.publicIdentifier));
    }

    const getTitle = () => {
        if (invitation.fromMember) {
            return `${invitation.fromMember.firstName} ${invitation.fromMember.lastName}`;
        } else if (invitation.genericInvitationView) {
            return invitation.genericInvitationView.name;
        }
    }

    const getText = () => {
        if (invitation.fromMember) {
            return invitation.fromMember.occupation;
        } else if (invitation.genericInvitationView) {
            return invitation.genericInvitationView.text;
        }
    }

    return (
        <div className="card-holder">
            <div className={"invitation-card " + (invitation.unseen === true ? " has-unread" : "")}>
                <div className="card-pre-section">
                    <div className="card-timestamp">{sentTime}</div>
                    <div className="card-image">
                        <img src={picture} onClick={onOpenProfile}/>
                    </div>
                </div>
                <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                    <div className="w-100 d-flex flex-row">
                        <div
                            className="card-title"
                            onClick={onOpenProfile}>{getTitle()}</div>
                    </div>
                    <div className="w-100 d-flex flex-row align-items-center">
                        <div className="card-subtitle" onClick={onOpenProfile}>{getText()}</div>
                        <div className="action-ignore" onClick={onIgnore} hidden={hideActions}>Ignore</div>
                        <div className="action-accept" onClick={onAccept} hidden={hideActions}>Accept</div>
                    </div>
                    {invitation.customMessage &&
                        <div className="card-message card-message-overview">
                            <div>{invitation.message}</div>
                        </div>}
                </div>
            </div>
        </div>
    );
};