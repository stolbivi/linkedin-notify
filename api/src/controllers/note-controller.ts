import {Body, Delete, Get, Post, Query, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {Note, NoteModel} from "../persistence/note-model";
import {v4 as uuid} from 'uuid';
import {ParentStageEnum, StageModel} from "../persistence/stage-model";
import {StageController} from "./stage-controller";


@Route("/api")
export class NoteController extends BaseController {

    constructor() {
        super();
    }

    @Tags("Persistence")
    @Get("note/{id}")
    public async findById(id: string,
                          @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            const result = await NoteModel.query("id").eq(id).exec();
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
    @Get("notes")
    public async findAll(@Query() as?: string,
                         @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let query = as
                ? NoteModel.query("author").eq(as)
                : NoteModel.scan();
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
    @Get("notes/profile")
    public async findByProfile(@Query() q: string,
                               @Query() as?: string,
                               @Request() request?: express.Request): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            let query = as
                ? NoteModel.query("profile").eq(q).where("author").eq(as)
                : NoteModel.query("profile").eq(q);
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
    @Post("note")
    public async create(@Body() body: Note,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            if(ParentStageEnum.GEOGRAPHY !== body.parentStage && ParentStageEnum.GROUPS !== body.parentStage) {
                await StageModel.scan("author").eq(body.author)
                    .where("profileId").eq(body.profile)
                    .where("parentStage").eq(body.parentStage)
                    .exec()
                    .then((items: any[]) => {
                        items.forEach((item) => {
                            item.delete();
                        });
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
                await NoteModel.scan("author").eq(body.author)
                    .where("profile").eq(body.profile)
                    .where("parentStage").eq(body.parentStage)
                    .exec()
                    .then((items: any[]) => {
                        items.forEach((item) => {
                            item.delete();
                        });
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
            }
            const stageController = new StageController();
            await stageController.findLatestStage(body.profile,body.author).then(resp => {
                body.stageFrom = resp?.stage >= 0 ? resp?.stage : -1
            })
            const toCreate = {...body, id: uuid()};
            const saved = await NoteModel.create(toCreate);
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
    @Delete("note/{id}")
    public async delete(id: string,
                        @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }

        try {
            await NoteModel.delete(id);
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