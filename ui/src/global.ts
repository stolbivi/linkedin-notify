export const API_BASE = `${process.env.BACKEND_BASE}/api/`;
export const LOGIN_URL = `${process.env.BACKEND_BASE}/auth/linkedin`;

export interface Billing {
    plan: string
    expiration: Date
    user?: any
}