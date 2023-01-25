import {TMessage} from "@stolbivi/pirojok/lib/chrome/Messages";

export const LINKEDIN_DOMAIN = 'linkedin.com';
export const MESSAGE_ID = 'linkedin-manager';
export const VERBOSE = false;
export const SHARE_URN = "urn:li:share:7010927250069934081";
export const MAPS_KEY = "AIzaSyDewx7AbMwkRxcyYA9zQ1RTIAsDyWR4svo";

// env variables are interpolated
export const BACKEND_SIGN_IN = `${process.env.BACKEND_BASE}/auth/linkedin`;
export const BACKEND_API = `${process.env.BACKEND_BASE}/api/`;
export const BACKEND_STATIC = `${process.env.BACKEND_BASE}/static/`;

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
    Tz,
    Features,
    SetFeatures
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

export interface Feature {
    type: string
    authors?: string[]
}

export interface Features {
    features: Feature[]
}

export const extractIdFromUrl = (url: string) => {
    const path = url.split("?")[0];
    const parts = path.split("/");
    return parts.filter(e => e !== "").pop();
}