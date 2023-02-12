import {BaseAPI, Response} from "./BaseAPI";
import {API_BASE, Subscriptions} from "../global";

export class BackendAPI extends BaseAPI {

    // Subscription statuses described here:
    // https://stripe.com/docs/api/subscriptions/object#subscription_object-status
    // https://stripe.com/docs/api/subscriptions/list#list_subscriptions-status
    // incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid
    public getSubscription(): Promise<Response<Subscriptions>> {
        return this.fetchRequest<Subscriptions>(
            `${API_BASE}subscription`,
            this.getRequest("GET")
        );
    }

    public checkout(): Promise<Response<any>> {
        return this.fetchRequest<any>(
            `${API_BASE}checkout`,
            this.getRequest("GET")
        );
    }

    public getBilling(): Promise<Response<any>> {
        return this.fetchRequest<any>(
            `${API_BASE}billing`,
            this.getRequest("GET")
        );
    }

}