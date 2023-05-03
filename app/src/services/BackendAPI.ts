import {BaseAPI, Response} from "./BaseAPI";
import {AssignedJob, BACKEND_API, CustomSalary, Features, Job, Note, Shared, Subscriptions, UserStage} from "../global";
import {StageEnum} from "../injectables/notes/StageSwitch";
import {SetFeaturePayload} from "../actions";
import {LastViewed} from "../store/LastViewedReducer";

export class BackendAPI extends BaseAPI {

    public getCustomStages(): Promise<Response<UserStage[]>> {
        console.log('in backend api get custom stages')
        return this.fetchRequest(
            `${BACKEND_API}stage/userStages`,
            this.getRequest("GET")
        )
    }

    public postCustomStage(payload: { text: string, author: string }): Promise<Response<UserStage>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/userStage`,
            this.getRequest("POST", payload)
        )
    }

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

    public setFeatures(features: SetFeaturePayload): Promise<Response<Features>> {
        return this.fetchRequest(
            `${BACKEND_API}features`,
            this.getRequest("POST", features)
        );
    }

    public getStage(id: string, as?: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${id}` + (as ? `?as=${as}` : ""),
            this.getRequest("GET")
        );
    }

    public getLatestStage(id: string, as?: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/latest/author/${id}` + (as ? `?as=${as}` : ""),
            this.getRequest("GET")
        );
    }

    public setStage(id: string, stage: StageEnum, author: string, parentStage: number, name: string, designation: string,
                    profileImg: string, stageText?: string, profileId?: string, companyName?: string, conversationUrn?: string, userId?: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage`,
            this.getRequest("POST", {id, stage, author, parentStage, name,
                            designation, profileImg, stageText: stageText || undefined, profileId, companyName, conversationUrn, userId})
        );
    }

    public setStageFromKanban(id: string, stage?: StageEnum, stageText?: string, as?: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${id}`+ (as ? `?as=${as}` : "") + (stage ? `&stage=${stage}` : "") + (stageText ? `&stageText=${stageText}` : ""),
            this.getRequest("PUT", {})
        );
    }

    public getAuthorStages(id: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/author/${id}`,
            this.getRequest("GET")
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

    public deleteNote(noteId: string): Promise<Response<Note>> {
        return this.fetchRequest(
            `${BACKEND_API}note/${noteId}`,
            this.getRequest("DELETE")
        );
    }

    // incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid
    public getSubscription(): Promise<Response<Subscriptions>> {
        return this.fetchRequest<Subscriptions>(
            `${BACKEND_API}subscription`,
            this.getRequest("GET")
        );
    }

    public getLastViewed(profile: string, as: string): Promise<Response<LastViewed[]>> {
        return this.fetchRequest(
            `${BACKEND_API}last-viewed-items/profile/?q=${profile}&as=${as}`,
            this.getRequest("GET")
        );
    }

    public postLastViewed(lastViewed: LastViewed): Promise<Response<LastViewed>> {
        return this.fetchRequest(
            `${BACKEND_API}last-viewed`,
            this.getRequest("POST", lastViewed)
        );
    }

    public getShared(urn: string): Promise<Response<Shared[]>> {
        return this.fetchRequest(
            `${BACKEND_API}shared/urn/${urn}`,
            this.getRequest("GET")
        );
    }

    public postShared(shared: Shared): Promise<Response<Shared>> {
        return this.fetchRequest(
            `${BACKEND_API}shared`,
            this.getRequest("POST", shared)
        );
    }

    public getJobs(): Promise<Response<Job>> {
        return this.fetchRequest(
            `${BACKEND_API}job`,
            this.getRequest("GET")
        );
    }

    public postJob(job: Job): Promise<Response<Job>> {
        return this.fetchRequest(
            `${BACKEND_API}job`,
            this.getRequest("POST", job)
        );
    }

    public updateJob(job: Job): Promise<Response<Job>> {
        return this.fetchRequest(
            `${BACKEND_API}job/${job.id}`,
            this.getRequest("PUT", job)
        );
    }

    public deleteJob(jobId: string): Promise<Response<Job>> {
        return this.fetchRequest(
            `${BACKEND_API}job/${jobId}`,
            this.getRequest("DELETE")
        );
    }

    public deleteStage(stageId: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}stage/${stageId}`,
            this.getRequest("DELETE")
        );
    }

    public assignJob(job: AssignedJob): Promise<Response<AssignedJob>> {
        return this.fetchRequest(
            `${BACKEND_API}job/assign`,
            this.getRequest("POST", job)
        );
    }

    public getAssignedJob(rcpntUserId: string, author: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}job/assigned/${rcpntUserId}` + (author ? `?author=${author}` : ""),
            this.getRequest("GET")
        );
    }

    public getAssignedJobsById(jobId: string, as: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}jobs/assigned/${jobId}` + (as ? `?as=${as}` : ""),
            this.getRequest("GET")
        );
    }

    public setCustomSalary(salary: CustomSalary): Promise<Response<CustomSalary>> {
        return this.fetchRequest(
            `${BACKEND_API}custom-salary`,
            this.getRequest("POST", salary)
        );
    }
    public getCustomSalary(id: string, as: string): Promise<Response<any>> {
        return this.fetchRequest(
            `${BACKEND_API}custom-salary/${id}` + (as ? `?as=${as}` : ""),
            this.getRequest("GET")
        );
    }

}