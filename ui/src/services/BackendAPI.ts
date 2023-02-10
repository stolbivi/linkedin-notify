import {BaseAPI, Response} from "./BaseAPI";
import {API_BASE, Billing} from "../global";

export class BackendAPI extends BaseAPI {

    public getBilling(): Promise<Response<Billing>> {
        return this.fetchRequest<Billing>(
            `${API_BASE}billing`,
            this.getRequest("GET")
        );
    }

}