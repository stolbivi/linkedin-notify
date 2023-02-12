import {Get, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {
    createBillingSession,
    createCheckoutSession,
    getAccount,
    getProduct,
    getSubscriptions
} from "../services/stripe-service";

require("dotenv").config();

@Route("/api")
export class BillingController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Billing")
    @Get("subscription")
    public async subscription(@Request() request?: express.Request): Promise<any> {
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
                status: r.subscription.status,
                currentPeriodStart: r.subscription.current_period_start,
                currentPeriodEnd: r.subscription.current_period_end,
                trialStart: r.subscription.trial_start,
                trialEnd: r.subscription.trial_end,
                daysUntilDue: r.subscription.days_until_due,
                productId: r.product.id,
                name: r.product.name,
                serverTimeZone: process.env.STRIPE_ACCOUNT_TIMEZONE
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
            const session = await createCheckoutSession(billingId, process.env.PRICE_PRO);
            let message: any = {session};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
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
            const session = await createBillingSession(billingId);
            let message: any = {session};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Billing")
    @Get("account/{id}")
    public async account(id: string,
                         @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const account = await getAccount(id);
            let message: any = {account};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}