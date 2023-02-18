import {Get, Query, Request, Route, Tags} from "tsoa";
import {find, setCache} from "geo-tz";
import moment from "moment-timezone";
import express from "express";
import {BaseController} from "./base-controller";
import {getGeo} from "../services/geo-service";

@Route("/api")
export class GeoController extends BaseController {

    private store = new Map();
    private readonly FORMAT_TZ = "ZZ";

    constructor() {
        super();
        setCache({store: this.store, preload: false});
    }

    @Tags("Geo")
    @Get("tz")
    public async tz(@Query() lat: number,
                    @Query() lng: number,
                    @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        console.log(`${new Date().toLocaleTimeString()} Finding timezone:`, lat, lng);
        try {
            const timezones = find(lat, lng);
            const timeZoned = moment.tz(timezones[0]);
            const utcOffset = timeZoned.utcOffset();
            const timeZoneFormatted = timeZoned.format(this.FORMAT_TZ);
            let message: any = {
                timezones,
                timeZoneFormatted,
                utcOffset
            }
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Geo")
    @Get("cacheSize")
    public async cacheSize(@Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let message: any = {response: this.store.size};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Geo")
    @Get("lookup")
    public async lookup(
        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const geo = getGeo(request);
            let message: any = {geo};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}