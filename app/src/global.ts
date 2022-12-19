import {TMessage} from "@stolbivi/pirojok/lib/chrome/Messages";

export const DOMAIN = 'linkedin.com';
export const MESSAGE_ID = 'linkedin-manager';
export const VERBOSE = false;
export const POST_ID = "7010255690174726144";

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