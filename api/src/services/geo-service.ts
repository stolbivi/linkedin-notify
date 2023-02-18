import express from "express";

export interface Geo {
    country: string
    region: string
    city: string
    timezone: string
    eu: string
}

const geoip = require('geoip-lite');


export const getGeo = (request: express.Request): Geo => {
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    return geoip.lookup(ip);
}