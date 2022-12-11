export enum AppMessageType {
    isLogged,
    signIn
}

export interface IAppRequest {
    type: AppMessageType
}

export interface IsLoggedResponse {
    isLogged: boolean
}

export const MESSAGE_ID = 'linkedin-notify-app';