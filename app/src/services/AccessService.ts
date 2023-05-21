export class AccessService {

    private readonly BYPASS_AUTH = `${process.env.BYPASS_AUTH}`;

    public handleSubscription(response: any, onValid: () => void, onInvalid: () => void, onForbidden: () => void) {
        if (response.status === 403) {
            if (this.BYPASS_AUTH === "true") {
                onValid();
            } else {
                onForbidden();
            }
        } else if (response.subscriptions?.length > 0) {
            const subscription = response.subscriptions[0];
            if (subscription.status === "trialing" || subscription.status === "active") {
                onValid();
                return;
            }
        }
        if (this.BYPASS_AUTH === "true") {
            onValid();
        } else {
            onInvalid();
        }
    }

}