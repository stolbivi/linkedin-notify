import {Body, Delete, Get, Post, Put, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {Feature, FeatureRequest, User, UserModel, UserService, UserWithId} from "../persistence/user-model";

const userService = new UserService();

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
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const result = await UserModel.query("id").eq(id).exec();
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
    @Post("user")
    public async create(@Body() body: UserWithId,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let saved = await UserModel.create(body);
            const customer = await userService.createCustomer(saved);
            saved = await UserModel.save(customer);
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
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const toSave = {...body};
            delete toSave.createdAt;
            delete toSave.updatedAt;
            const saved = await UserModel.update(id, toSave);
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
            return Promise.resolve("Please, sign in to use premium features");
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

    @Tags("Features")
    @Get("features")
    public async getFeatures(@Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            if (request?.user) {
                // @ts-ignore
                const result = await UserModel.query("id").eq(request.user?.id).exec();
                if (result && result.length) {
                    const user = result.shift() as User;
                    const features = user.features ?? [];
                    const message = {response: {features, updatedAt: user.updatedAt}, user: request.user};
                    return Promise.resolve(message);
                }
            }
            // @ts-ignore
            throw new Error("User not found:", request.user?.id);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Features")
    @Post("features")
    public async setFeatures(@Body() body: FeatureRequest,
                             @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        function updateAuthor(typedFeature: Feature) {
            const authors = typedFeature.authors ?? [];
            const index = authors ? authors.findIndex((f: string) => f === body.author) : -1;
            if (body.action === "set") {
                if (index < 0) {
                    authors.push(body.author);
                }
            }
            if (body.action === "unset") {
                if (index >= 0) {
                    authors.splice(index, 1);
                }
            }
            typedFeature.authors = authors;
        }

        try {
            if (request?.user) {
                // @ts-ignore
                const id = request.user?.id;
                const result = await UserModel.query("id").eq(id).exec();
                if (result && result.length) {
                    const user = result.shift() as UserWithId;
                    if (!user.features) {
                        user.features = [];
                    }
                    const typedFeatures = user.features.filter(f => f.type === body.type);
                    if (body.author) {
                        if (typedFeatures?.length > 0) {
                            updateAuthor(typedFeatures[0]);
                        } else {
                            const newFeature = {type: body.type} as Feature;
                            updateAuthor(newFeature);
                            user.features.push(newFeature);
                        }
                    }
                    if (body.theme) {
                        if (typedFeatures?.length > 0) {
                            typedFeatures[0].theme = body.theme;
                        } else {
                            const newFeature = {type: body.type, theme: body.theme} as Feature;
                            user.features.push(newFeature);
                        }
                    }
                    const toSave = {...user};
                    delete toSave.id;
                    delete toSave.createdAt;
                    delete toSave.updatedAt;
                    const saved = await UserModel.update(id, toSave);
                    const message = {response: {features: user.features}, user: saved};
                    return Promise.resolve(message);
                }
            }
            // @ts-ignore
            throw new Error("User not found:", request.user?.id);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}