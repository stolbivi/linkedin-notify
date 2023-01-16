import {BaseAPI} from "./BaseAPI";
import {BACKEND_API} from "../global";

export class BackendAPI extends BaseAPI {

    public getCompletion(prompt: string): Promise<any> {
        return this.fetchRequest(
            `${BACKEND_API}completion?prompt=${encodeURIComponent(prompt)}`,
            this.getRequest("GET")
        );
    }

    public getSalary(request: any): Promise<any> {
        return this.fetchRequest(
            `${BACKEND_API}salary`,
            this.getRequest("POST", request)
        );
    }

    public getTz(lat: number, lng: number): Promise<any> {
        return this.fetchRequest(
            `${BACKEND_API}find?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
            this.getRequest("GET")
        );
    }

}