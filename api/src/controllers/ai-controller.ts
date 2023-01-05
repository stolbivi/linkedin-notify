import {Controller, Get, Query, Route} from "tsoa";
import {Configuration, OpenAIApi} from "openai";


@Route("/api")
export class AIController extends Controller {

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

    @Get("completion")
    public async completion(@Query() prompt: string,
                            @Query() temperature?: number,
                            @Query() maxTokens?: number
    ): Promise<any> {
        console.log(`${new Date().toLocaleTimeString()} Running completion query for:`, prompt, temperature, maxTokens);
        try {
            const completion = await this.openai.createCompletion({
                model: this.model,
                prompt,
                temperature: Number(temperature ? temperature : this.temperature),
                max_tokens: Number(maxTokens ? maxTokens : this.maxTokens),
            });
            return Promise.resolve({response: completion.data.choices});
        } catch (error) {
            const message = error.response
                ? {data: error.response.data, status: error.response.status}
                : {message: error.message};
            this.setStatus(422);
            return Promise.resolve(message);
        }
    }

}