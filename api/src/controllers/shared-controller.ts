import {Body, Delete, Get, Post, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {Shared, SharedModel} from "../persistence/shared-model";
import {v4 as uuid} from 'uuid';


@Route("/api")
export class SharedController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Persistence")
    @Get("shared/{id}")
    public async findById(id: string,
                          @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const result = await SharedModel.query("id").eq(id).exec();
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
    @Get("shared/urn/{urn}")
    public async findByUrn(urn: string,
                           @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            // @ts-ignore
            let query = SharedModel.query("profile").eq(request.user?.id).where("urn").eq(urn);
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
    @Post("shared")
    public async create(@Body() body: Shared,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            // @ts-ignore
            const toCreate = {...body, profile: request.user?.id, id: uuid()};
            const saved = await SharedModel.create(toCreate);
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
    @Delete("shared/{id}")
    public async delete(id: string,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            await SharedModel.delete(id);
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