import {Body, Delete, Get, Post, Put, Query, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {User, UserModel, UserWithId} from "../persistence/user-model";
import {Item} from "dynamoose/dist/Item";


@Route("/api")
export class UserController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Persistence")
    @Get("user/{id}")
    public async findById(id: string,
                          @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        try {
            const result = await UserModel.query("id").eq(id).exec();
            let message: any = {response: result.map((r: Item) => r.toJSON())};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Get("user/email")
    public async findByEmail(@Query() q: string,
                             @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        try {
            const result = await UserModel.query("email").eq(q).exec();
            let message: any = {response: result.map((r: Item) => r.toJSON())};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Post("user")
    public async create(@Body() body: UserWithId,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        try {
            const saved = await UserModel.create(body);
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
    @Put("user/{id}")
    public async update(id: string,
                        @Body() body: User,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        try {
            const saved = await UserModel.update(body);
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
    @Delete("user/{id}")
    public async delete(id: string,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        try {
            await UserModel.delete(id);
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