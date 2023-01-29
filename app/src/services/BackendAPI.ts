import {BaseAPI} from "./BaseAPI";
import {BACKEND_API, Features} from "../global";
import {StageEnum} from "../injectables/notes/Stage";

export interface Response<T> {
    response: T
}

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
            `${BACKEND_API}tz?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
            this.getRequest("GET")
        );
    }

    public getFeatures(): Promise<Response<Features>> {
        return this.fetchRequest(
            `${BACKEND_API}features`,
            this.getRequest("GET")
        );
    }

    public setFeatures(features: any): Promise<Response<Features>> {
        return this.fetchRequest(
            `${BACKEND_API}features`,
            this.getRequest("POST", features)
        );
    }

    public getStage(id: string): Promise<Response<Features>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${id}`,
            this.getRequest("GET")
        );
    }

    public setStage(id: string, stage: StageEnum): Promise<Response<Features>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${id}`,
            this.getRequest("PUT", {stage})
        );
    }

}