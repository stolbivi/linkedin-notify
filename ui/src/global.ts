export const API_BASE = `${process.env.BACKEND_BASE}/api/`;
export const LOGIN_URL = `${process.env.BACKEND_BASE}/auth/linkedin`;

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