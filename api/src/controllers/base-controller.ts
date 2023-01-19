import {Controller} from "tsoa";
import express from "express";

export class BaseController extends Controller {

    constructor() {
        super();
    }

    protected abruptOnNoSession(request?: express.Request): boolean {
        if (process.env.DISABLE_API_AUTH !== "true") {
            if (request) {
                return !request.user;
            } else {
                return true;
            }
        }
        return false;
    }

    protected handleError(error: any, request?: express.Request) {
        let message: any = error.response
            ? {data: error.response.data, status: error.response.status}
            : {message: error.message};
        this.setStatus(500);
        if (request?.user) {
            message = {...message, user: request.user};
        }
        return Promise.resolve(message);
    }

}