import {TMessage} from "@stolbivi/pirojok/lib/chrome/Messages";

export const DOMAIN = 'linkedin.com';
export const MESSAGE_ID = 'linkedin-manager';
export const VERBOSE = false;
export const POST_ID = "7010927250069934081";

export enum AppMessageType {
    OpenURL,
    IsLogged,
    Badges,
    Conversations,
    ConversationDetails,
    ConversationAck,
    Notifications,
    MarkNotificationsSeen,
    MarkNotificationRead,
    Invitations,
    HandleInvitation,
    CheckUnlocked,
    Unlock,
    Completion,
    SalaryPill,
}

export interface IAppRequest extends TMessage {
    type: AppMessageType
    payload?: any
}

export interface IsLoggedResponse {
    isLogged: boolean
}

export interface ConversationsResponse {
    conversations: any
}

export interface NotificationsResponse {
    notifications: any
}

export interface InvitationsResponse {
    invitations: any
}

export interface BadgesResponse {
    badges: Badges
}

export interface UnlockedResponse {
    unlocked: boolean
}

export interface Badges {
    NOTIFICATIONS: number
    MESSAGING: number
    MY_NETWORK: number
}

export interface Location {
    city: string
    state: string
    country: string
}

export const extractIdFromUrl = (url: string) => {
    const path = url.split("?")[0];
    const parts = path.split("/");
    return parts.filter(e => e !== "").pop();
}