import {Get, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {createCheckoutSession, getProduct, getSubscriptions} from "../services/stripe-service";

require("dotenv").config();

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
            // @ts-ignore
            const billingId = request.user.billingId;
            const response = await getSubscriptions(billingId);
            const toResolve = response.data.map(
                (s: any) => getProduct(s.plan.product)
                    .then((p: any) => ({
                        product: p,
                        subscription: s
                    })));
            const resolved = await Promise.all(toResolve);
            const subscriptions = resolved.map((r: any) => ({
                id: r.subscription.id,
                trialStart: r.subscription.trial_start,
                trialEnd: r.subscription.trial_end,
                productId: r.product.id,
                name: r.product.name,

            }));
            let message: any = {subscriptions};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Billing")
    @Get("checkout")
    public async checkout(@Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            // @ts-ignore
            const billingId = request.user.billingId;
            const session = await createCheckoutSession(billingId, process.env.PRICE_PRO)
            let message: any = {session};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}