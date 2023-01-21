import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, LINKEDIN_DOMAIN, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
import {formatDate} from "../services/UIHelpers";

type Props = {
    invitation: any
};


export const InvitationCard: React.FC<Props> = ({invitation}) => {

    const [picture, setPicture] = useState("");
    const [sentTime, setSentTime] = useState("");
    const [id, setId] = useState("");
    const [hideActions, setHideActions] = useState(false);

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    useEffect(() => {
        if (invitation?.fromMember?.picture?.rootUrl) {
            setPicture(invitation?.fromMember?.picture?.rootUrl + invitation?.fromMember?.picture?.artifacts?.pop()?.path);
        } else {
            setPicture("https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q");
        }
        setSentTime(formatDate(new Date(invitation.sentTime)));
        setId(invitation.urn.split(":").pop());
    }, [invitation]);

    const onIgnore = () => {
        return messages.request<IAppRequest, any>({
            type: AppMessageType.HandleInvitation,
            payload: {id: id, sharedSecret: invitation.sharedSecret, action: "ignore"}
        }).then(_ => setHideActions(true));
    }

    const onAccept = () => {
        return messages.request<IAppRequest, any>({
            type: AppMessageType.HandleInvitation,
            payload: {id: id, sharedSecret: invitation.sharedSecret, action: "accept"}
        }).then(_ => setHideActions(true));
    }

    const onOpenProfile = () => {
        return messages.request<IAppRequest, any>({
            type: AppMessageType.OpenURL,
            payload: {url: `https://${LINKEDIN_DOMAIN}/in/` + invitation.fromMember.publicIdentifier}
        });
    }

    return (
        <div className={"invitation-card bordered-card" + (invitation.unseen === true ? " has-unread" : "")}>
            <div className="card-image">
                <img src={picture}/>
            </div>
            <div className="w-100 d-flex flex-column justify-content-center align-items-start">
                <div className="w-100 d-flex flex-row">
                    <div
                        className="card-title"
                        onClick={onOpenProfile}>{invitation.fromMember?.firstName} {invitation.fromMember?.lastName}</div>
                    <div className="card-timestamp">{sentTime}</div>
                </div>
                <div className="w-100 d-flex flex-row align-items-center">
                    <div className="card-subtitle" onClick={onOpenProfile}>{invitation.fromMember?.occupation}</div>
                    <div className="action-ignore" onClick={onIgnore} hidden={hideActions}>Ignore</div>
                    <div className="action-accept" onClick={onAccept} hidden={hideActions}>Accept</div>
                </div>
                {invitation.customMessage &&
                <div className="custom-message">
                    <div>{invitation.message}</div>
                    {/*<div className="action-reply" onClick={onReply}>Reply to {invitation.fromMember?.firstName}</div>*/}
                </div>}
            </div>
        </div>
    );
};