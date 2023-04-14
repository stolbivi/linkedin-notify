import {Body, Delete, Get, Post, Put, Query, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {User} from "../persistence/user-model";
import {Job, JobModel} from "../persistence/job-model";
import {v4 as uuid} from "uuid";


@Route("/api")
export class JobController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Persistence")
    @Get("job")
    public async getJobs(@Request() request: express.Request) {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            const user =  request.user as User;
            const userJobs = await JobModel.scan({ userId: user.id }).exec();
            const resolvedJobs = userJobs.map(job => ({
                id: job.id,
                title: job.title,
                salary: job.salary,
                company: job.company,
                hiringContact: job.hiringContact,
                type: job.type,
                geography: job.geography,
                status: job.status,
                assigned: job.assigned,
                description: job.description
            }))
            return Promise.resolve({ response: resolvedJobs, user: request.user });
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Get("job/{id}")
    public async findById(id: string,
                          @Query() as?: string,
                          @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let query = as
                ? JobModel.query("id").eq(id).where("author").eq(as)
                : JobModel.query("id").eq(id);
            const result = await query.exec();
            let message: any = {response: this.getFirst(result)};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Post("job")
    public async create(@Body() body: Job,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const user =  request.user as User;
            const toCreate = {...body, id: uuid(), userId: user.id};
            const saved = await JobModel.create(toCreate);
            let message: any = {response: saved.toJSON()};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Put("job/{id}")
    public async update(id: string,
                        @Body() body: Job,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const toSave = {...body};
            delete toSave.id;
            const saved = await JobModel.update(id, toSave);
            let message: any = {response: saved.toJSON()};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Delete("job/{id}")
    public async delete(id: string,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            await JobModel.delete(id);
            let message: any = {response: id, status: "Deleted"};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}