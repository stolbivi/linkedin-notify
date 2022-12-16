export const DOMAIN = 'linkedin.com';

export enum AppMessageType {
    IsLogged,
    OpenURL,
    Conversations,
    Notifications,
    Invitations,
    Badges
}

export interface IAppRequest {
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

export interface Badges {
    NOTIFICATIONS: number
    MESSAGING: number
    MY_NETWORK: number
}

export const MESSAGE_ID = 'linkedin-notify-app';