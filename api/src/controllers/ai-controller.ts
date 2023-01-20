import {Get, Query, Request, Route, Tags} from "tsoa";
import {Configuration, OpenAIApi} from "openai";
import express from "express";
import {BaseController} from "./base-controller";


@Route("/api")
export class AIController extends BaseController {

    private openai;
    private model = process.env.AI_MODEL;
    private temperature = process.env.AI_TEMPERATURE;
    private maxTokens = process.env.AI_MAX_TOKENS;

    constructor() {
        super();
        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.AI_KEY,
        }))
    }

    @Tags("AI")
    @Get("completion")
    public async completion(@Query() prompt: string,
                            @Query() temperature?: number,
                            @Query() maxTokens?: number,
                            @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        console.log(`${new Date().toLocaleTimeString()} Running completion query for:`, prompt, temperature, maxTokens);
        try {
            const completion = await this.openai.createCompletion({
                model: this.model,
                prompt,
                temperature: Number(temperature ? temperature : this.temperature),
                max_tokens: Number(maxTokens ? maxTokens : this.maxTokens),
            });
            let message: any = {response: completion.data.choices};
            if (request?.user) {
                message = {...message, user: request.user};
            }
            return Promise.resolve(message);
        } catch (error) {
            return this.handleError(error, request);
        }
    }

}