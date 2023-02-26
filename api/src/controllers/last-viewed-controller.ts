import {Body, Delete, Get, Post, Query, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {v4 as uuid} from 'uuid';
import {LastViewed, LastViewedModel} from "../persistence/last-viewed-model";


@Route("/api")
export class LastViewedController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Persistence")
    @Get("last-viewed/{id}")
    public async findById(id: string,
                          @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const result = await LastViewedModel.query("id").eq(id).exec();
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
    @Get("last-viewed-items/profile")
    public async findByProfile(@Query() q: string,
                               @Query() as: string,
                               @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let query = LastViewedModel.query("profile").eq(q);
            query = query.where("author", as);
            const result = await query.exec();
            let message: any = {response: result.map((i: any) => i.toJSON())};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Post("last-viewed")
    public async create(@Body() body: LastViewed,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let query = LastViewedModel.query("profile").eq(body.profile);
            query = query.where("author", body.author);
            const result = await query.exec();
            let ids = result.map((i: any) => i.id);
            let saved;
            if (ids.length > 0) {
                saved = await LastViewedModel.update(ids[0],
                    {profile: body.profile, author: body.author});
            } else {
                const toCreate = {...body, id: uuid()};
                saved = await LastViewedModel.create(toCreate);
            }
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
    @Delete("last-viewed/{id}")
    public async delete(id: string,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            await LastViewedModel.delete(id);
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