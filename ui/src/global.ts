export const API_BASE = `${process.env.API_BASE}/api/`;

export interface Billing {
    plan: string
    expiration: Date
    user?: any
}