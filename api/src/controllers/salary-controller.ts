import {Body, Get, Post, Query, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";
import {Salary, SalaryModel} from "../persistence/salary-model";

@Route("/api")
export class SalaryController extends BaseController {
    constructor() {
        super();
    }
    @Tags("Persistence")
    @Get("custom-salary/{id}")
    public async findSalaryById(id: string,
                                @Query() as?: string,
                                @Request() request?: express.Request) {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            const salary = await SalaryModel.query("id").eq(id).where("author").eq(as).exec();
            return Promise.resolve({ response: salary.toJSON() });
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    @Tags("Persistence")
    @Post("custom-salary")
    public async setCustomSalary(@Body() body: Salary,
                           @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Please, sign in to use premium features");
        }
        try {
            let saved;
            const toCreate = {...body};
            const existingRecord = await SalaryModel.query("id").eq(body.id).where("author").eq(body.author).exec();
            if (existingRecord.length > 0) {
                delete toCreate.id;
                saved = await SalaryModel.update(existingRecord[0].id, toCreate);
            } else {
                saved = await SalaryModel.create(body);
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
}