import React, {useEffect, useState} from "react";
import {AppMessageType, IAppRequest, InvitationsResponse, MESSAGE_ID} from "../global";
import {Messages} from "@stolbivi/pirojok";
import {InvitationCard} from "./InvitationCard";
import {Loader} from "./Loader";

type Props = {};

export const Invitations: React.FC<Props> = ({}) => {

    const [invitations, setInvitations] = useState([]);

    const messages = new Messages();

    useEffect(() => {
        messages.runtimeMessage<IAppRequest, InvitationsResponse>(MESSAGE_ID, {type: AppMessageType.Invitations},
            (r) => {
                setInvitations(r.invitations.map((i: any) =>
                    (<InvitationCard invitation={i}></InvitationCard>)
                ));
            }).then(/* nada */)
    }, []);

    return (
        <div className="w-100">
            <Loader show={!(invitations?.length > 0)}/>
            {invitations}
        </div>
    );
};