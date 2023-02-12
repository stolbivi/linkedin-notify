import {BaseAPI, Response} from "./BaseAPI";
import {BACKEND_API, Features, Note, Subscriptions} from "../global";
import {StageEnum} from "../injectables/notes/StageSwitch";

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

    public getStage(id: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${id}`,
            this.getRequest("GET")
        );
    }

    public setStage(id: string, stage: StageEnum): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${id}`,
            this.getRequest("PUT", {stage})
        );
    }

    public getNotes(as?: string): Promise<Response<Note[]>> {
        return this.fetchRequest(
            `${BACKEND_API}notes` + (as ? `?as=${as}` : ""),
            this.getRequest("GET")
        );
    }

    public getNotesByProfile(profile: string, as?: string): Promise<Response<Note[]>> {
        return this.fetchRequest(
            `${BACKEND_API}notes/profile/?q=${profile}` + (as ? `&as=${as}` : ""),
            this.getRequest("GET")
        );
    }

    public postNote(note: Note): Promise<Response<Note>> {
        return this.fetchRequest(
            `${BACKEND_API}note`,
            this.getRequest("POST", note)
        );
    }

    // incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid
    public getSubscription(): Promise<Response<Subscriptions>> {
        return this.fetchRequest<Subscriptions>(
            `${BACKEND_API}subscription`,
            this.getRequest("GET")
        );
    }

}