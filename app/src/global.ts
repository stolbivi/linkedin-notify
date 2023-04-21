import {TMessage} from "@stolbivi/pirojok/lib/chrome/Messages";

export const LINKEDIN_DOMAIN = 'linkedin.com';
export const VERBOSE = false;
export const SHARE_URN = "urn:li:share:7010927250069934081";
export const MAPS_KEY = "AIzaSyDewx7AbMwkRxcyYA9zQ1RTIAsDyWR4svo";
export const LOGIN_URL = `${process.env.BACKEND_BASE}/auth/linkedin`;

// env variables are interpolated
export const BACKEND_API = `${process.env.BACKEND_BASE}/api/`;
export const BACKEND_STATIC = `${process.env.BACKEND_BASE}/static/`;

export enum AppMessageType {
    LastViewedSet
}

export interface IAppRequest extends TMessage {
    type: AppMessageType
    payload?: any
}

export interface Conversation {
    entityUrn: string
}

export interface Invitation {
    id: string
    action: string
    sharedSecret: string
}

export interface Badges {
    NOTIFICATIONS: number
    MESSAGING: number
    MY_NETWORK: number
}

export interface Feature {
    type: string
    authors?: string[]
    theme?: string
}

export interface Features {
    features: Feature[]
    updatedAt: string
}

export interface UserStage {
    text: string;
    userId: string;
    id?: string;
    stageId: number;
    author?: string;
}

export interface Note {
    id?: string
    profile: string
    author: string
    text?: string
    stageFrom?: number
    stageTo?: number
    createdAt?: string
    updatedAt?: string
    stageText?: string
    parentStage?: number
}

export interface NoteExtended extends Note {
    authorName: string
    authorPicture: string
    profileName: string
    profilePicture: string
    profileLink: string
    timestamp: Date
}

export const extractIdFromUrl = (url: string) => {
    const path = url.split("?")[0];
    const parts = path.split("/");
    return parts.filter(e => e !== "").pop();
}

export interface Subscriptions {
    subscriptions: Subscription[],
    user?: any
}

export interface Subscription {
    id: string,
    productId: string,
    name: string
    status: string,
    currentPeriodStart: number,
    currentPeriodEnd: number,
    trialStart: number,
    trialEnd: number,
    daysUntilDue: number,
    serverTimeZone: string
}

export interface Shared {
    profile?: string
    urn: string
    createdAt?: string
    updatedAt?: string
}

export interface Theme {
    [key: string]: string
}

export interface Message {
    messageBody?: string,
    conversationId?: string,
    recipientId?: string
}

export interface Message {
    messageBody?: string,
    conversationId?: string,
    recipientId?: string
}

export interface Job {
    id?: string
    title?: string
    salary?: string
    company?: string
    hiringContact?: string
    type?: string
    geography?: string
    status?: string
    assigned?: string
    description?: string
}