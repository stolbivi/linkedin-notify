import {BaseAPI} from "./BaseAPI";

export class BackendAPI extends BaseAPI {

    // private static readonly BASE = 'https://api.lnmanager.com/api/';
    // private static readonly BASE = 'https://linkedin-manager-api.herokuapp.com/api/';
    private static readonly BASE = 'http://localhost:8080/api/';

    public getCompletion(prompt: string): Promise<any> {
        return this.fetchRequest(
            `${BackendAPI.BASE}completion?prompt=${encodeURIComponent(prompt)}`,
            this.getRequest("GET")
        );
    }

    public getSalary(request: any): Promise<any> {
        return this.fetchRequest(
            `${BackendAPI.BASE}salary`,
            this.getRequest("POST", request)
        );
    }

    public getTz(lat: number, lng: number): Promise<any> {
        return this.fetchRequest(
            `${BackendAPI.BASE}find?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
            this.getRequest("GET")
        );
    }

}