export enum AppMessageType {
    isLogged,
    signIn,
    test
}

export interface IAppRequest {
    type: AppMessageType
}

export interface IsLoggedResponse {
    isLogged: boolean
}

export interface Badges {
    NOTIFICATIONS: number
    MESSAGING: number
    MY_NETWORK: number
}

export const MESSAGE_ID = 'linkedin-notify-app';