import {Body, Delete, Get, Post, Put, Query, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {ParentStageEnum, StageEnum, StageModel, StageWithId} from "../persistence/stage-model";
import { UserStages } from "../persistence/user-stages";
import {User} from "../persistence/user-model";
import {NoteModel} from "../persistence/note-model";


@Route("/api")
export class StageController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Persistence")
    @Get("stage/userStages")
    public async getUserStages(@Request() request: express.Request) {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const user =  request.user as User;
            const userStages = await UserStages.scan({ userId: user.id }).exec()
            return Promise.resolve({ response: userStages, user: request.user });
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Get("stage/{id}")
    public async findById(id: string,
                          @Query() as?: string,
                          @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let query = as
                ? StageModel.query("id").eq(id).where("author").eq(as)
                : StageModel.query("id").eq(id);
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
    @Get("stage/latest/author/{id}")
    public async findLatestStage(id: string,
                                 @Query() as?: string,
                                 @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            let query = StageModel.query("author").eq(as).where("profileId").eq(id);
            const result = await query.exec();
            let message: any = {response: result.map((i: any) => i.toJSON())};
            // @ts-ignore
            const latestObj = message.response.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
            message = {...latestObj};
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Get("stage/author/{id}")
    public async findStagesByAuthor(id: string, @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            let query = StageModel.query("author").eq(id);
            const result = await query.exec();
            let message: any = {response: result.map((i: any) => i.toJSON())};
            const data = {};
            message.response.forEach((item: { parentStage: string | number; stage: string | number; name: any; designation: any;
                                      id: any; profileImg: any; stageText: string; profileId: string; companyName: string; conversationUrn: string; userId: string;}) => {
                // @ts-ignore
                let parentStage = ParentStageEnum[item.parentStage];
                if(!parentStage) {
                    parentStage = "OTHER";
                }
                // @ts-ignore
                const stage = StageEnum[item.stage] ? StageEnum[item.stage] : item.stageText || "OTHER";

                // @ts-ignore
                if (!data[parentStage]) {
                    // @ts-ignore
                    data[parentStage] = {};
                }

                // @ts-ignore
                if (!data[parentStage][stage]) {
                    // @ts-ignore
                    data[parentStage][stage] = [];
                }
                // @ts-ignore
                data[parentStage][stage].push({
                    name: item.name,
                    designation: item.designation,
                    id: item.id,
                    profileId: item.profileId,
                    profileImg: item.profileImg,
                    status: parentStage,
                    category: stage?.replace(/_/g,' '),
                    companyName: item.companyName,
                    conversationUrn: item.conversationUrn,
                    userId: item.userId
                });
            });
            if (request?.user) {
                message = {data, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Post("stage")
    public async create(@Body() body: StageWithId,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            const saved = await StageModel.create(body);
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
    @Put("stage/{id}")
    public async update(id: string,
                        @Query() as?: string,
                        @Query() stageText?: string,
                        @Query() stage?: number,
                        @Body() body?: StageWithId,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            if(Object.keys(body).length === 0) {
                let query = StageModel.query("id").eq(id).where("author").eq(as);
                const result = await query.exec();
                body = this.getFirst(result);
                body.stage = stage;
                body.stageText = stageText;
                delete body.id;
            }
            const toSave = {...body};
            delete toSave.createdAt;
            delete toSave.updatedAt;
            const saved = await StageModel.update(id, toSave);
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
    @Delete("stage/{id}")
    public async delete(id: string,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            await StageModel.delete(id);
            let message: any = {response: id, status: "Deleted"};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Post("stage/userStage")
    public async addUserStage(@Request() request: express.Request) {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const { text, author } = request.body;
            const user =  request.user as User;
            const userStage = await UserStages.create({ userId: user.id, text, stageId: new Date().getTime(), id: (new Date().getTime()+1).toString(), author: author })
            await userStage.save()
            return Promise.resolve({ response: userStage , user: request.user})
        } catch (error) {
            return this.handleError(error, request);
        }
    }
}