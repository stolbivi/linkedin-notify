import {Get, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";


@Route("/api")
export class BillingController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Billing")
    @Get("billing")
    public async billing(@Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            // TODO call Stripe
            let message: any = {plan: "TEST", expiration: new Date()};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}