export enum AppMessageType {
    IsLogged,
    SignIn,
    Conversations,
    Notifications,
    Invitations,
    Test
}

export interface IAppRequest {
    type: AppMessageType
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

export interface Badges {
    NOTIFICATIONS: number
    MESSAGING: number
    MY_NETWORK: number
}

export const MESSAGE_ID = 'linkedin-notify-app';